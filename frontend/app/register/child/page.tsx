"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from 'lucide-react';
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export default function Page() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
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
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('child_id', data.child_id);
          localStorage.setItem('child_code', data.child_code);
          if (data.name) localStorage.setItem('child_name', data.name);
          router.push('/auth/child');
        } else {
          setErrorMsg(data.message || 'Account not found. Please create an account.');
          setIsLoginMode(false);
        }
      } else {
        const res = await fetch('http://localhost:8000/family/child/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, age: 10 }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('child_id', data.child_id);
          localStorage.setItem('child_code', data.child_code);
          if (data.name) localStorage.setItem('child_name', data.name);
          router.push('/auth/child');
        } else {
          setErrorMsg(data.message || 'Failed to create account.');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Connection error. Is the backend running?');
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

      {/* Wordmark */}
      <div className="fixed top-6 left-6 z-20">
        <span className="text-sm font-black tracking-widest text-white uppercase">Drishti</span>
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="bg-zinc-950/60 backdrop-blur-md shadow-none border-zinc-800">
            <CardHeader className="text-center pt-8 pb-4">
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                {isLoginMode ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-zinc-400 text-sm">
                {isLoginMode ? 'Sign in to your child profile' : 'Set up your child profile'}
              </p>
            </CardHeader>

            <CardContent className="pb-8 px-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name – only on signup */}
                {!isLoginMode && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="name">Full Name</Label>
                    <Input
                      className="w-full h-12 bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-400 text-white"
                      id="name"
                      placeholder="Enter your name"
                      required={!isLoginMode}
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="email">Email Address</Label>
                  <Input
                    className="w-full h-12 bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-400 text-white"
                    id="email"
                    placeholder="Enter your email"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-400" htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      className="w-full h-12 bg-zinc-900/50 border-zinc-800 focus-visible:ring-zinc-400 text-white pr-12"
                      id="password"
                      placeholder="••••••••"
                      type={showPw ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-red-400 text-sm text-center bg-red-950/30 border border-red-900 rounded-lg px-3 py-2">{errorMsg}</p>
                )}

                <Button
                  disabled={loading}
                  className="w-full h-12 font-bold uppercase tracking-widest bg-white text-black hover:bg-zinc-200 mt-2"
                  type="submit"
                >
                  {loading ? 'Loading…' : (isLoginMode ? 'Log In' : 'Create Account')}
                </Button>

                <div className="flex items-center justify-between pt-4 mt-2 border-t border-zinc-800">
                  <p className="text-sm text-zinc-400">
                    {isLoginMode ? "Don't have an account?" : 'Already have an account?'}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setIsLoginMode(!isLoginMode); setErrorMsg(''); }}
                    className="text-sm text-white font-semibold hover:underline"
                  >
                    {isLoginMode ? 'Sign Up' : 'Sign In'}
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
