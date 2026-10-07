"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { ACTIVE_WORKSPACE_STORAGE_KEY } from "@/components/workspace/WorkspaceContext";

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Gracefully continue clearing local state and navigating
    } finally {
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY);
        }
      } catch {
        // Handle storage access errors
      }
      queryClient.clear();
      setIsLoggingOut(false);
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
    >
      {isLoggingOut ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <LogOut className="w-3.5 h-3.5 text-zinc-400" />
      )}
      <span>{isLoggingOut ? "Terminating..." : "Terminate Session"}</span>
    </Button>
  );
}
