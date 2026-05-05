"use client";
import Link from 'next/link';
import { Lock, Plus, Minus, Navigation, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export default function Page() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, val: string) => {
    val = val.toUpperCase();
    if (val.length > 1) {
      // Handle paste
      const pasted = val.slice(0, 6).split('');
      const newCode = [...code];
      for (let i = 0; i < pasted.length; i++) {
        if (idx + i < 6) newCode[idx + i] = pasted[i];
      }
      setCode(newCode);
      const nextIdx = Math.min(idx + pasted.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }
    const newCode = [...code];
    newCode[idx] = val;
    setCode(newCode);
    if (val && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const parent_id = localStorage.getItem('parent_id');
    const child_code = code.join('');
    if (!parent_id) {
      setError('Parent ID not found. Please register again.');
      return;
    }
    if (child_code.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:8000/family/parent/link-child?parent_id=${parent_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_code }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/parent/dashboard');
      } else {
        setError(data.detail || 'Invalid code');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

{/*  Map Background Area  */}
<div className="fixed inset-0 z-0 bg-zinc-950">
<DottedGlowBackground
  className="opacity-40"
  colorDarkVar="--color-zinc-500"
  glowColorDarkVar="--color-zinc-400"
  speedMin={0.3}
  speedMax={1.0}
/>
</div>
{/*  Minimal Back Navigation (Shared Logic for Focused Views)  */}
<div className="fixed top-6 left-6 z-20">
<Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-white">
<ArrowLeft className="w-4 h-4" />
<span className="text-sm">Back</span>
</Button>
</div>
{/*  Main Linking Card  */}
<main className="relative z-10 flex min-h-screen items-center justify-center p-6">
<div className="w-full max-w-md">
<Card className="w-full bg-zinc-950/60 backdrop-blur-md shadow-none border-zinc-800">
{/*  Header Section  */}
<CardHeader className="text-center pt-8 pb-6">
<CardTitle className="text-3xl font-bold text-white mb-2">Hello, Parent!</CardTitle>
<CardDescription className="text-sm text-zinc-400">Enter the code provided by your child</CardDescription>
</CardHeader>
<CardContent className="px-8">
{/*  6-Digit OTP Component  */}
<div className="mb-8">
<div className="flex justify-center gap-2">
  {code.map((digit, idx) => (
    <Input 
      key={idx} 
      ref={(el) => { inputRefs.current[idx] = el; }}
      value={digit}
      onChange={(e) => handleChange(idx, e.target.value)}
      onKeyDown={(e) => handleKeyDown(idx, e)}
      className="w-12 h-14 bg-zinc-900/50 border-zinc-800 rounded-lg text-center text-2xl text-white focus-visible:ring-zinc-400 transition-colors" 
      maxLength={1} 
      type="text"
    />
  ))}
</div>
{error && <p className="text-red-500 text-center mt-4 text-sm">{error}</p>}
</div>
{/*  Action Section  */}
<div className="flex flex-col gap-4">
<Button disabled={loading} onClick={handleSubmit} className="w-full h-12 font-bold uppercase tracking-widest bg-white text-black hover:bg-zinc-200">
<span>{loading ? "Linking..." : "Link Child"}</span>
</Button>
<Button variant="ghost" className="w-full text-zinc-400 text-sm hover:text-white transition-colors">
                    Didn't get a code? Contact Support
                </Button>
</div>
</CardContent>
{/*  Footer Meta Info  */}
<CardFooter className="pt-6 pb-6 border-t border-zinc-800 flex items-center justify-center gap-2 text-zinc-500">
<Lock className="w-4 h-4" />
<span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Secure AES-256 Connection</span>
</CardFooter>
</Card>
</div>
{/*  Shared Map Controls (Repurposed for this screen)  */}
<div className="fixed bottom-6 right-6 flex flex-col gap-2">
<Button variant="outline" size="icon" className="w-10 h-10 bg-zinc-950 border-zinc-800 text-white hover:bg-zinc-900 transition-colors">
<Plus className="w-4 h-4" />
</Button>
<Button variant="outline" size="icon" className="w-10 h-10 bg-zinc-950 border-zinc-800 text-white hover:bg-zinc-900 transition-colors">
<Minus className="w-4 h-4" />
</Button>
<Button variant="outline" size="icon" className="w-10 h-10 bg-zinc-950 border-zinc-800 text-white hover:bg-zinc-900 transition-colors mt-4">
<Navigation className="w-4 h-4" />
</Button>
</div>
</main>

    </>
  );
}
