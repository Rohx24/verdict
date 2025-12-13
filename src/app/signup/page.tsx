"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "../../../lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Verification link sent. Check your email.");
  };

  return (
    <main className="relative mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16 md:px-12">
      <div className="absolute inset-0 -z-10 opacity-60 blur-3xl">
        <div className="absolute left-10 top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(146,255,111,0.18),transparent_50%)]" />
        <div className="absolute right-0 bottom-10 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(75,225,255,0.16),transparent_50%)]" />
      </div>

      <div className="mb-8 text-left">
        <p className="text-xs uppercase tracking-[0.28em] text-[#92ff6f]">Create account</p>
        <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">
          Create account
        </h1>
        <p className="mt-3 max-w-2xl text-base text-white/70">
          One email. One magic link. Enter the studio.
        </p>
      </div>

      <Card className="border-white/10 bg-white/[0.04]">
        <CardHeader className="border-b border-white/10 pb-4">
          <CardTitle className="mt-1 text-2xl text-white">
            Send verification link
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <label className="space-y-2 block">
              <span className="text-xs uppercase tracking-[0.2em] text-white/60">
                Email
              </span>
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none ring-0 transition focus:border-[#92ff6f] focus:bg-white/[0.08]"
                placeholder="you@studio.com"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send verification link"}
              </Button>
              <Button variant="outline" size="lg" type="button" onClick={() => router.push("/login")}>
                Back to sign in
              </Button>
            </div>

            {message ? (
              <p className="text-sm font-semibold text-[#92ff6f]">{message}</p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
