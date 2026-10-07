import React from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { WorkspaceProvider } from "@/components/workspace/WorkspaceContext";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Dashboard // IKIGAI Control Plane",
  description: "Protected operator telemetry and control center.",
};

// Ensure dashboard is never statically cached
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userEmail = user.email || user.id;

  return (
    <WorkspaceProvider userId={user.id}>
      <DashboardShell userEmail={userEmail}>
        {children}
      </DashboardShell>
    </WorkspaceProvider>
  );
}
