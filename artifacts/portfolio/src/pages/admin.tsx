import { useEffect, useState } from "react";
import { RootLayout } from "@/components/layout/RootLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useListUsers, useUpdateUserRole, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { RoleBadge } from "@/components/RoleBadge";
import { toast } from "sonner";

export default function Admin() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const isModerator = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";

  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const { data: users } = useListUsers({
    query: { queryKey: getListUsersQueryKey(), enabled: isModerator, refetchInterval: 5000 },
  });
  const roleMutation = useUpdateUserRole({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() }),
    },
  });

  const [targetEmail, setTargetEmail] = useState("");

  if (!user || !isModerator) return null;

  const promote = async (email: string, role: "user" | "admin") => {
    try {
      await roleMutation.mutateAsync({ email, data: { actorEmail: user.email, role } });
    } catch (err: any) {
      toast.error(err?.error ?? t("admin.notAllowed"));
    }
  };

  return (
    <RootLayout>
      <div className="container mx-auto px-6 py-24 max-w-3xl">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold tracking-tight mb-2">{t("admin.title")}</h1>
        </div>

        {isSuperAdmin && (
          <Card className="border-[#D4AF37]/25 bg-secondary/20 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle>{t("admin.manageTeam")}</CardTitle>
              <CardDescription>{t("admin.manageTeamDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder={t("admin.emailPlaceholder")}
                  dir="ltr"
                  className="text-left flex-1"
                />
                <Button onClick={() => targetEmail && promote(targetEmail, "admin")} disabled={!targetEmail}>
                  {t("admin.promote")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-border/50 bg-secondary/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>{t("admin.userList")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(users ?? []).map((u) => (
              <div key={u.email} className="flex items-center justify-between border-b border-border/30 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-sm font-medium">{u.name || u.email.split("@")[0]}</p>
                    <p className="text-xs text-muted-foreground" dir="ltr">{u.email}</p>
                  </div>
                  <RoleBadge role={u.role} />
                </div>
                {isSuperAdmin && u.role !== "super_admin" && (
                  <Button
                    size="sm"
                    variant={u.role === "admin" ? "outline" : "secondary"}
                    onClick={() => promote(u.email, u.role === "admin" ? "user" : "admin")}
                  >
                    {u.role === "admin" ? t("admin.demote") : t("admin.promote")}
                  </Button>
                )}
                {u.role === "super_admin" && (
                  <span className="text-xs text-muted-foreground">{t("admin.superAdminProtected")}</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </RootLayout>
  );
}
