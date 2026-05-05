"use client";
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, HelpCircle, Fingerprint, RefreshCcw } from 'lucide-react';
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export default function Page() {
  const [code, setCode] = useState('');
  const [parentName, setParentName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const c = localStorage.getItem('child_code');
    if (c) setCode(c);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkLinkStatus = async () => {
        const child_id = localStorage.getItem('child_id');
        if (!child_id) return;

        try {
            const res = await fetch(`http://localhost:8000/family/child/dashboard?child_id=${child_id}`);
            if (res.ok) {
                const data = await res.json();
                if (data.parent_name) {
                    setParentName(data.parent_name);
                    setTimeout(() => {
                        router.push('/child/dashboard');
                    }, 2000);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (!parentName) {
        intervalId = setInterval(checkLinkStatus, 2000);
    }

    return () => {
        if (intervalId) clearInterval(intervalId);
    };
  }, [parentName, router]);

  const displayCode = code.padEnd(6, '-');

  return (
    <>
{/*  Background Map Layer  */}
<div className="fixed inset-0 z-0 bg-zinc-950">
<DottedGlowBackground
  className="opacity-40"
  colorDarkVar="--color-zinc-500"
  glowColorDarkVar="--color-zinc-400"
  speedMin={0.3}
  speedMax={1.0}
/>
</div>
{/*  Top AppBar - Shared Component Execution  */}
<nav className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-4 max-w-full z-50 bg-transparent font-inter antialiased tracking-tight">
<div className="flex items-center gap-4">
<Button variant="ghost" size="icon" onClick={() => router.back()} className="text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors rounded-lg">
<ArrowLeft className="w-5 h-5" />
</Button>
<span className="text-sm font-bold tracking-widest text-white uppercase">DRISHTI</span>
</div>
<div className="flex items-center gap-4">
<Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors rounded-lg">
<HelpCircle className="w-5 h-5" />
</Button>
</div>
</nav>
{/*  Main Canvas  */}
<main className="relative z-10 min-h-screen flex items-center justify-center p-6">
<div className="w-full max-w-md">
<Card className="bg-zinc-950/60 backdrop-blur-md shadow-none border-zinc-800">
<CardHeader className="flex flex-col items-center text-center pt-8 pb-4">
{/*  Branding/Icon  */}
<div className={`w-16 h-16 rounded-full border flex items-center justify-center mb-4 transition-colors ${parentName ? 'bg-emerald-500/20 border-emerald-500' : 'border-zinc-800'}`}>
{parentName ? <Fingerprint className="w-8 h-8 text-emerald-400" /> : <Fingerprint className="w-8 h-8 text-white" />}
</div>
{/*  Content  */}
<CardTitle className="text-3xl font-bold text-white mb-2">{parentName ? "Success!" : "Hello, Child!"}</CardTitle>
<CardDescription className="text-sm text-zinc-400 max-w-[280px]">{parentName ? "Connection established securely." : "Share this code with your parent to continue"}</CardDescription>
</CardHeader>
<CardContent className="px-8 pb-8">
{/*  Auth Code Display  */}
<div className="flex flex-col gap-6 w-full">
  {parentName ? (
      <div className="flex flex-col items-center justify-center py-4">
          <h3 className="text-xl font-bold text-white text-center">Linked {parentName}</h3>
      </div>
  ) : (
    <>
    <div className="flex justify-center items-center gap-2">
      {displayCode.split('').slice(0, 6).map((char, idx) => (
          <div key={idx} className="w-12 h-16 flex items-center justify-center border border-zinc-800 rounded-lg bg-zinc-900/50">
            <span className="text-2xl font-bold text-white">{char}</span>
          </div>
      ))}
    </div>
    {/*  Auxiliary Action  */}
    <div className="pt-6 border-t border-zinc-800 w-full flex gap-4">
    <Button variant="outline" className="w-1/2 h-12 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
    <RefreshCcw className="w-4 h-4" />
    <span>Regenerate</span>
    </Button>
    <Button variant="default" onClick={() => router.push('/child/dashboard')} className="w-1/2 h-12 flex items-center justify-center gap-2 font-bold uppercase tracking-widest bg-white text-black hover:bg-zinc-200">
    <span className="text-xs">Dashboard</span>
    </Button>
    </div>
    </>
  )}
</div>
</CardContent>
</Card>
</div>
</main>


    </>
  );
}
