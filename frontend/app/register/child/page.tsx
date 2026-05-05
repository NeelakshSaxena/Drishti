"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export default function Page() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (isLoginMode) {
        const res = await fetch('http://localhost:8000/family/child/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('child_id', data.child_id);
          localStorage.setItem('child_code', data.child_code);
          router.push('/auth/child');
        } else {
          setErrorMsg(data.message || 'Account not found. Please create an account.');
          setIsLoginMode(false);
        }
      } else {
        const res = await fetch('http://localhost:8000/family/child/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, age: 10 }), // Dummy age for MVP
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('child_id', data.child_id);
          localStorage.setItem('child_code', data.child_code);
          router.push('/auth/child');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
<div className="fixed inset-0 z-0 bg-zinc-950">
<DottedGlowBackground
  className="opacity-40"
  colorDarkVar="--color-zinc-500"
  glowColorDarkVar="--color-zinc-400"
  speedMin={0.3}
  speedMax={1.0}
/>
</div>
<main className="relative z-10 flex min-h-screen items-center justify-center p-6">
<div className="w-full max-w-md">
<Card className="bg-zinc-950/60 backdrop-blur-md shadow-none border-zinc-800">
<CardHeader className="text-center pt-8 pb-4">
<h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                    Hello, Child!
                </h1>
<p className="text-zinc-400 font-medium text-sm">
  {isLoginMode ? "Log in to your profile" : "Setup your new profile"}
</p>
</CardHeader>
<CardContent className="pb-8 px-8">
<form onSubmit={handleSubmit} className="space-y-6">
<div className="space-y-3">
<Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="name">Full Name</Label>
<Input className="w-full h-12 bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-400 text-white" id="name" name="name" placeholder="Enter your name" required type="text" value={name} onChange={(e) => setName(e.target.value)}/>
</div>
<Button disabled={loading} className="w-full h-12 font-bold uppercase tracking-widest bg-white text-black hover:bg-zinc-200 mt-2" type="submit">
  {loading ? "Loading..." : (isLoginMode ? "Log In" : "Create Account")}
</Button>
{errorMsg && <p className="text-red-500 text-sm mt-4 text-center">{errorMsg}</p>}
<div className="flex items-center justify-between pt-6 mt-6 border-t border-zinc-800">
<p className="text-sm text-zinc-400">{isLoginMode ? "Don't have an account?" : "Already have an account?"}</p>
<button type="button" onClick={() => {setIsLoginMode(!isLoginMode); setErrorMsg('');}} className="text-sm text-white font-semibold hover:underline">
  {isLoginMode ? "Sign Up" : "Sign In"}
</button>
</div>
</form>
</CardContent>
</Card>
</div>
</main>




    </>
  );
}
