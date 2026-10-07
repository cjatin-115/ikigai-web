"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { sanitizeAuthError } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        const sanitized = sanitizeAuthError(error);
        setErrorMessage(sanitized.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Clear cached queries from previous sessions
        queryClient.clear();
        // Successful login -> Redirect to protected /dashboard
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      const sanitized = sanitizeAuthError(err);
      setErrorMessage(sanitized.message);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="p-3 rounded bg-red-950/40 border border-red-800/60 flex items-start gap-2.5 text-xs text-red-200"
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-xs font-mono uppercase tracking-wider text-zinc-400"
        >
          Transmitter Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Mail className="w-4 h-4" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isLoading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="operator@ikigai.internal"
            className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/70 focus:border-amber-500/70 disabled:opacity-50 font-sans"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-xs font-mono uppercase tracking-wider text-zinc-400"
        >
          Passphrase
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={isLoading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/70 focus:border-amber-500/70 disabled:opacity-50 font-sans"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs uppercase tracking-wider h-10 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying Credentials...</span>
          </>
        ) : (
          <span>Authenticate Session</span>
        )}
      </Button>
    </form>
  );
}
