import Link from "next/link";
import { useRouter } from "next/router";

import { AccountDropdown } from "../components/AccountDropdown";

import { AppSidebar } from "@/shadcn/components/app-sidebar";
import { CommandMenu } from "@/shadcn/components/command-menu";
import { ThemeToggle } from "@/shadcn/components/theme-toggle";
import { Button } from "@/shadcn/ui/button";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/shadcn/ui/sidebar";
import { Bell } from "lucide-react";
import { useUser } from "../store/session";

export default function ShadLayout({ children }: any) {
  const location = useRouter();

  const { loading, user, fetchUserProfile } = useUser();


  if (!user) {
    location.push("/auth/login");
  }

  if (location.pathname.includes("/admin") && user.isAdmin === false) {
    location.push("/");
    alert("You do not have the correct perms for that action.");
  }

  if (user && user.external_user) {
    location.push("/portal");
  }

  return (
    !loading &&
    user && (
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-35" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_top,_hsl(var(--primary)/0.12),_transparent_60%)]" />
        <SidebarProvider>
          <div className="relative z-10 flex min-h-screen w-full">
            <AppSidebar variant="floating" />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-x-4 border-b border-border/60 bg-background/70 px-4 backdrop-blur sm:gap-x-6">
                <div className="flex flex-1 items-center gap-x-4 self-stretch lg:gap-x-6">
                  <SidebarTrigger title="[" className="text-muted-foreground" />
                  <div className="hidden w-full items-center justify-start space-x-6 sm:flex">
                    {user.isAdmin && (
                      <Link href="https://github.com/nulldoubt/Pepperminto/releases">
                        <span className="inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          Version 0.1.3
                        </span>
                      </Link>
                    )}

                    <CommandMenu />
                  </div>

                  <div className="flex w-full items-center justify-end gap-x-2 lg:gap-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-9 w-9 rounded-md border border-border/60 bg-background/70 text-muted-foreground shadow-sm backdrop-blur transition hover:bg-accent/50 hover:text-foreground"
                      asChild
                    >
                      <Link href="/notifications">
                        <span className="relative flex items-center justify-center">
                          <Bell className="h-4 w-4" />
                          {user.notifcations.filter(
                            (notification) => !notification.read
                          ).length > 0 && (
                            <svg
                              className="absolute bottom-6 left-6 h-2.5 w-2.5 animate-pulse fill-primary"
                              viewBox="0 0 6 6"
                              aria-hidden="true"
                            >
                              <circle cx={3} cy={3} r={3} />
                            </svg>
                          )}
                        </span>
                      </Link>
                    </Button>

                    <ThemeToggle />

                    {user.isAdmin && (
                      <Link
                        href="https://github.com/nulldoubt/Pepperminto/discussions"
                        target="_blank"
                        className="hover:cursor-pointer"
                      >
                        <Button
                          variant="outline"
                          className="h-9 border-border/60 bg-background/70 text-foreground shadow-sm backdrop-blur hover:bg-accent hover:text-accent-foreground"
                        >
                          Send Feedback
                        </Button>
                      </Link>
                    )}

                    <AccountDropdown />
                  </div>
                </div>
              </div>
              {!loading && !user.external_user && (
                <main className="min-h-screen">{children}</main>
              )}
            </div>
          </div>
        </SidebarProvider>
      </div>
    )
  );
}
