import Link from "next/link";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Shield, User } from "lucide-react";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export default function Page() {
  return (
    <>
      <main className="relative h-screen w-full flex items-center justify-center overflow-hidden">

        {/* Background Layer */}
        <div className="absolute inset-0 z-0 bg-zinc-950">
          <DottedGlowBackground
            className="opacity-40"
            colorDarkVar="--color-zinc-500"
            glowColorDarkVar="--color-zinc-400"
            speedMin={0.3}
            speedMax={1.0}
          />
        </div>

        {/* Central Shell */}
        <section className="relative z-10 w-full max-w-4xl px-gutter flex flex-col items-center">

          {/* Title */}
          <div className="text-center mb-xl">
            <h1 className="font-h1 text-[5rem] md:text-[7rem] text-primary tracking-tighter uppercase">
              DRISHTI
            </h1>
          </div>

          {/* Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

            {/* Parent */}
            <Card className="group bg-zinc-950/60 backdrop-blur-md hover:border-zinc-500 transition-all duration-300 flex flex-col justify-between shadow-none">
              <CardHeader>
                <div className="mb-6">
                  <Shield className="w-12 h-12 text-zinc-100" />
                </div>

                <CardTitle className="text-2xl text-zinc-100">
                  Parent
                </CardTitle>

                <CardDescription className="text-zinc-400 leading-relaxed">
                  Manage profiles, monitor activity, and approve access.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Button
                  asChild
                  variant="outline"
                  className="w-full text-zinc-100 uppercase tracking-widest h-14"
                >
                  <Link href="/register/parent">
                    Access Guardian Flow
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Child */}
            <Card className="group bg-zinc-950/60 backdrop-blur-md hover:border-zinc-500 transition-all duration-300 flex flex-col justify-between shadow-none">
              <CardHeader>
                <div className="mb-6">
                  <User className="w-12 h-12 text-zinc-100" />
                </div>

                <CardTitle className="text-2xl text-zinc-100">
                  Child
                </CardTitle>

                <CardDescription className="text-zinc-400 leading-relaxed">
                  Create a profile, track activity, and connect to a guardian.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Button
                  asChild
                  variant="default"
                  className="w-full text-zinc-950 uppercase tracking-widest h-14 font-bold hover:bg-zinc-200"
                >
                  <Link href="/register/child">
                    Start Individual Entry
                  </Link>
                </Button>
              </CardContent>
            </Card>

          </div>
        </section>
      </main>
    </>
  );
}