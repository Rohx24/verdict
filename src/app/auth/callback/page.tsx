"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "../../../../lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Checking your session...");

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!active) return;

      if (error) {
        setStatus("Could not verify session. Please open the link again.");
        return;
      }

      if (data.session) {
        router.replace("/studio");
      } else {
        setStatus("Waiting for session. If nothing happens, reopen the link.");
        // Poll once more after a short delay
        setTimeout(async () => {
          const second = await supabase.auth.getSession();
          if (!active) return;
          if (second.data.session) {
            router.replace("/studio");
          }
        }, 1200);
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-8 text-center shadow-[0_25px_80px_-60px_rgba(146,255,111,0.8)]">
        <p className="text-xs uppercase tracking-[0.24em] text-[#92ff6f]">
          Magic link
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">
          Signing you in…
        </h1>
        <p className="mt-2 text-sm text-white/70">{status}</p>
      </div>
    </main>
  );
}
