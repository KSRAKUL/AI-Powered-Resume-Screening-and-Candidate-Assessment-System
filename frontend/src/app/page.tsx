import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <main className="flex-1 w-full bg-[#0B0F19] text-white flex flex-col relative overflow-hidden">
      {/* Decorative gradient overlay backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-violet-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[35%] h-[40%] rounded-full bg-emerald-500/3 blur-[120px] pointer-events-none" />
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-20" />
      
      <Dashboard />
    </main>
  );
}

