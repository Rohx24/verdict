"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <main className="relative mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16 md:px-12">
      <div className="absolute inset-0 -z-10 opacity-60 blur-3xl">
        <div className="absolute left-10 top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(146,255,111,0.18),transparent_50%)]" />
        <div className="absolute right-0 bottom-10 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(75,225,255,0.16),transparent_50%)]" />
      </div>

      <div className="mb-8 text-left">
        <p className="text-xs uppercase tracking-[0.28em] text-[#92ff6f]">
          Auth enabled
        </p>
        <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">
          Redirecting to sign in…
        </h1>
        <p className="mt-3 max-w-2xl text-base text-white/70">
          We use magic links. Enter your email on the next screen to get your
          verification link. No passwords.
        </p>
      </div>

      <Card className="border-white/10 bg-white/[0.04]">
        <CardHeader className="border-b border-white/10 pb-4">
          <CardTitle className="mt-1 text-2xl text-white">
            If redirect doesn&apos;t happen, pick one:
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button size="lg" href="/login">
              Go to sign in
            </Button>
            <Button variant="outline" size="lg" href="/signup">
              Create account
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
