import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login // IKIGAI Control Plane",
  description: "Private authentication gateway for Ikigai platform operators.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans select-none">
      <div className="w-full max-w-sm border border-zinc-800/80 bg-zinc-950/80 rounded-md p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Subtle top indicator line in orbital amber */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-500/80" />

        <div className="space-y-1.5 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase bg-zinc-900 border border-zinc-800 text-amber-400/90 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            CONTROL PLANE // GATEWAY
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-mono">
            IKIGAI
          </h1>
          <p className="text-xs text-zinc-400 font-mono tracking-tight">
            Private Operator Authentication
          </p>
        </div>

        <LoginForm />

        <div className="pt-2 border-t border-zinc-900 text-center">
          <span className="text-[10px] font-mono text-zinc-600 tracking-wider">
            SECURE LINK // HS256 JWT VERIFIED
          </span>
        </div>
      </div>
    </main>
  );
}
