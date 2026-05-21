import { redirect } from "next/navigation";
import { Sidebar, type SidebarUser } from "@/components/layout/Sidebar";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

const ROLE_LABELS: Record<UserRole, string> = {
  private_provider: "Private Provider",
  architect: "Architect",
  mep_engineer: "MEP Engineer",
  expeditor: "Permit Expeditor",
  developer: "Developer",
  admin: "Admin",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const sidebarUser: SidebarUser = {
    name: profile?.full_name || profile?.email || "User",
    role: profile ? ROLE_LABELS[profile.role] : "",
    initials: profile?.avatar_initials || "?",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-3">
      <Sidebar user={sidebarUser} />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
