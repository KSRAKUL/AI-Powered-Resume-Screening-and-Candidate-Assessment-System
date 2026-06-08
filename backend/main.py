from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import requests
import uvicorn
import re

# Import local utilities
from utils.extract_text import extract_text
from utils.preprocess import preprocess
from utils.skill_extractor import load_skills, extract_skills
from utils.resume_summary import generate_summary

app = FastAPI(
    title="AI Resume Screener API",
    description="FastAPI backend for Next.js interface",
    version="1.0.0"
)

# Enable CORS for local Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to ["http://localhost:3000"] in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    # Check if Ollama is running
    ollama_online = False
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=2)
        if response.status_code == 200:
            ollama_online = True
    except Exception:
        pass
    return {"status": "ok", "ollama_online": ollama_online}

@app.post("/api/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...)
):
    if not resume.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    # Save the file temporarily
    temp_dir = "uploads"
    os.makedirs(temp_dir, exist_ok=True)
    file_path = os.path.join(temp_dir, resume.filename)
    
    try:
        # Save uploaded PDF to temp folder
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)
            
        # 1. Extract Text
        resume_text = extract_text(file_path)
        if not resume_text.strip():
            raise HTTPException(
                status_code=400, 
                detail="Could not extract text from the uploaded PDF. Ensure it is not scanned or empty."
            )
            
        # 2. Preprocess Text
        resume_clean = preprocess(resume_text)
        jd_clean = preprocess(job_description)
        
        # 3. Extract Skills
        skills_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "skills.txt")
        skills = load_skills(skills_path)
        resume_skills = extract_skills(resume_clean, skills)
        jd_skills = extract_skills(jd_clean, skills)
        
        missing_skills = sorted(list(set(jd_skills) - set(resume_skills)))
        
        # 4. Generate AI Summary (with safety fallback for offline Ollama)
        score = 5.0
        category = "Core Skills Match (Trainable)"
        try:
            ai_analysis = generate_summary(
                resume_text=resume_text,
                job_description=job_description,
                resume_skills=resume_skills,
                missing_skills=missing_skills
            )
            
            # Extract candidate score from AI analysis output (e.g. "8.5/10")
            match = re.search(r'## Candidate Score\s*[\r\n]*\s*(\d+(?:\.\d+)?)/10', ai_analysis)
            if not match:
                match = re.search(r'(\d+(?:\.\d+)?)/10', ai_analysis)
            if match:
                try:
                    score = float(match.group(1))
                except Exception:
                    pass
                    
            # Extract fit classification category from AI analysis output
            cat_match = re.search(r'## Fit Classification\s*[\r\n]*\s*(.*?)(?=\n\n|\n##|$)', ai_analysis, re.DOTALL)
            if cat_match:
                raw_cat = cat_match.group(1).strip().replace("*", "").replace("-", "").strip()
                found = False
                for std_cat in [
                    "Not Aligned", 
                    "Needs Heavy Training", 
                    "Core Skills Match (Trainable)", 
                    "Strong Fit (Plug-and-Play)", 
                    "Outstanding Expert"
                ]:
                    if std_cat.lower() in raw_cat.lower():
                        category = std_cat
                        found = True
                        break
                if not found and raw_cat:
                    category = raw_cat[:50]
        except Exception as e:
            # Fallback category based on matching skills
            if not resume_skills:
                category = "Not Aligned"
            elif not missing_skills:
                category = "Strong Fit (Plug-and-Play)"
            else:
                category = "Core Skills Match (Trainable)"
                
            ai_analysis = (
                "## AI Candidate Assessment\n\n"
                "> ⚠️ **Ollama Server Offline**: Could not generate professional AI assessment. "
                "Please make sure your Ollama application is running locally at `http://localhost:11434` "
                "with the model `qwen2.5:3b` loaded.\n\n"
                f"### Fallback Assessment Summary\n"
                f"- **Identified Resume Skills**: {', '.join(resume_skills) if resume_skills else 'None found'}\n"
                f"- **Missing Core Skills**: {', '.join(missing_skills) if missing_skills else 'None missing'}\n\n"
                "**Hiring Note**: Please verify missing skills during the initial phone screening."
            )
        
        return {
            "success": True,
            "filename": resume.filename,
            "score": score,
            "category": category,
            "resume_skills": resume_skills,
            "missing_skills": missing_skills,
            "ai_analysis": ai_analysis,
            "resume_text": resume_text
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
