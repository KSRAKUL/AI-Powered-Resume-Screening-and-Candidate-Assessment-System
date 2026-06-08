def load_skills(skill_file):

    with open(
        skill_file,
        "r",
        encoding="utf-8"
    ) as f:

        skills = [
            line.strip()
            for line in f.readlines()
        ]

    return skills


def extract_skills(text, skill_list):

    found_skills = []

    text = text.lower()

    for skill in skill_list:

        if skill.lower() in text:

            found_skills.append(skill)

    return sorted(list(set(found_skills)))