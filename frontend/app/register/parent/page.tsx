"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export default function Page() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (isLoginMode) {
        const res = await fetch('http://localhost:8000/family/parent/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('parent_id', data.parent_id);
          router.push('/parent/link-child');
        } else {
          setErrorMsg(data.message || 'Account not found. Please create an account.');
          setIsLoginMode(false);
        }
      } else {
        const res = await fetch('http://localhost:8000/family/parent/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('parent_id', data.parent_id);
          router.push('/parent/link-child');
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

{/*  Map Background Graphic  */}
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
<CardTitle className="text-3xl font-bold tracking-tight text-white mb-2">Hello, Parent!</CardTitle>
<CardDescription className="text-zinc-400 font-medium text-sm">
  {isLoginMode ? "Log in to your profile" : "Setup your new profile"}
</CardDescription>
</CardHeader>
<CardContent className="pb-8 px-8">
<form className="space-y-6" onSubmit={handleSubmit}>
<div className="space-y-3">
<Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">Full Name</Label>
<Input className="w-full h-12 bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-400 text-white" placeholder="Jane Doe" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
</div>
<div className="space-y-3">
<Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">Email Address</Label>
<Input className="w-full h-12 bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-400 text-white" placeholder="jane@example.com" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
</div>
<div className="pt-2">
{errorMsg && <p className="text-red-500 text-sm mb-4 text-center">{errorMsg}</p>}
<Button disabled={loading} type="submit" variant="default" className="w-full h-12 font-bold uppercase tracking-widest bg-white text-black hover:bg-zinc-200">
                            {loading ? "Loading..." : (isLoginMode ? "Log In" : "Create Account")}
                        </Button>
</div>
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
{/*  Side Navigation Placeholder (Hidden for this Transactional Screen per Rules)  */}
{/*  The TopNavBar and SideNav are suppressed as per "Shell Visibility & Relevance" rule for Transactional pages.  */}

    </>
  );
}
