import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, User, Info } from "lucide-react";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export default function Page() {
  return (
    <>

{/*  TopAppBar  */}
<main className="relative h-screen w-full flex items-center justify-center overflow-hidden">
{/*  Background Layer  */}
<div className="absolute inset-0 z-0 bg-zinc-950">
<DottedGlowBackground
  className="opacity-40"
  colorDarkVar="--color-zinc-500"
  glowColorDarkVar="--color-zinc-400"
  speedMin={0.3}
  speedMax={1.0}
/>
</div>
{/*  Central Registration Shell  */}
<section className="relative z-10 w-full max-w-4xl px-gutter flex flex-col items-center">
<div className="text-center mb-xl">
<h1 className="font-h1 text-h1 text-primary mb-xs tracking-tighter uppercase">DRISHTI</h1>
<p className="font-body-lg text-body-lg text-outline-variant">Select your registration path to begin coordinate assignment.</p>
</div>
{/*  Bento Path Selection  */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
{/*  Parent Path  */}
<Card className="group bg-zinc-950/60 backdrop-blur-md hover:border-zinc-500 transition-all duration-300 flex flex-col justify-between shadow-none">
<CardHeader>
<div className="mb-6">
<Shield className="w-12 h-12 text-zinc-100" />
</div>
<CardTitle className="text-2xl text-zinc-100">Parent</CardTitle>
<CardDescription className="text-zinc-400 leading-relaxed">
                            Register as a guardian to manage sub-entities, monitor geographical logs, and authorize registry requests within the secure network.
                        </CardDescription>
</CardHeader>
<CardContent>
<Button asChild variant="outline" className="w-full text-zinc-100 uppercase tracking-widest h-14">
<Link href="/register/parent">
                                Access Guardian Flow
                            </Link>
</Button>
</CardContent>
</Card>
{/*  Child Path  */}
<Card className="group bg-zinc-950/60 backdrop-blur-md hover:border-zinc-500 transition-all duration-300 flex flex-col justify-between shadow-none">
<CardHeader>
<div className="mb-6">
<User className="w-12 h-12 text-zinc-100" />
</div>
<CardTitle className="text-2xl text-zinc-100">Child</CardTitle>
<CardDescription className="text-zinc-400 leading-relaxed">
                            Register an individual profile for registry inclusion. Access personal coordinate logs and connect with verified guardian nodes.
                        </CardDescription>
</CardHeader>
<CardContent>
<Button asChild variant="default" className="w-full text-zinc-950 uppercase tracking-widest h-14 font-bold hover:bg-zinc-200">
<Link href="/register/child">
                                Start Individual Entry
                            </Link>
</Button>
</CardContent>
</Card>
</div>

</section>
</main>
{/*  Side Decoration (Minimalist Coordinates)  */}
<aside className="fixed left-6 bottom-24 hidden lg:block vertical-text rotate-180 z-20">
<span className="font-label-caps text-[10px] text-outline-variant tracking-widest opacity-40">LAT: 40.7128° N | LONG: 74.0060° W</span>
</aside>
<aside className="fixed right-6 bottom-24 hidden lg:block vertical-text z-20">
<span className="font-label-caps text-[10px] text-outline-variant tracking-widest opacity-40">ESTABLISHING SECURE PROTOCOL // 2024</span>
</aside>

<style>{`
        .vertical-text {
            writing-mode: vertical-rl;
        }
    `}</style>

    </>
  );
}
