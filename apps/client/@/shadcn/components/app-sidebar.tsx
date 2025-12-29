import {
  Building,
  BookOpen,
  FileText,
  KeyRound,
  ListPlus,
  Mail,
  Mailbox,
  Settings,
  SquareKanban,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/shadcn/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/shadcn/ui/sidebar";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CreateTicketModal from "../../../components/CreateTicketModal";
import { useUser } from "../../../store/session";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useRouter();

  const { loading, user, fetchUserProfile } = useUser();
  const locale = user ? user.language : "en";

  const [keypressdown, setKeyPressDown] = useState(false);

  const { t, lang } = useTranslation("peppermint");
  const sidebar = useSidebar();

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

  const data = {
    teams: [
      {
        name: "Peppermint",
        plan: `version: ${process.env.NEXT_PUBLIC_CLIENT_VERSION}`,
      },
    ],
    navMain: location.pathname.startsWith("/admin")
      ? [
          {
            title: "Back",
            url: "/",
            icon: Building,
            initial: "h",
          },
          {
            title: "Users",
            url: "/admin/users/internal",
            icon: Settings,
            initial: "u",
          },
          {
            title: "Clients",
            url: "/admin/clients",
            icon: Building,
            initial: "c",
          },
          {
            title: "Email Queues",
            url: "/admin/email-queues",
            icon: Mail,
            initial: "e",
          },
          {
            title: "Webhooks",
            url: "/admin/webhooks",
            icon: Settings,
            initial: "w",
          },
          {
            title: "SMTP Email",
            url: "/admin/smtp",
            icon: Mailbox,
            initial: "s",
          },
          {
            title: "Authentication",
            url: "/admin/authentication",
            icon: KeyRound,
            initial: "a",
          },
          {
            title: "Roles",
            url: "/admin/roles",
            icon: Settings,
            initial: "r",
          },
          {
            title: "Knowledge Base",
            url: "/admin/knowledge-base",
            icon: BookOpen,
            initial: "k",
          },
          {
            title: "Logs",
            url: "/admin/logs",
            icon: FileText,
            initial: "l",
          },
        ]
      : [
          {
            title: "New Issue",
            url: ``,
            icon: ListPlus,
            isActive: location.pathname === "/" ? true : false,
            initial: "c",
          },
          {
            title: "Dashboard",
            url: `/${locale}/`,
            icon: Building,
            isActive: location.pathname === "/" ? true : false,
            initial: "h",
          },
          {
            title: "Documents",
            url: `/${locale}/documents`,
            icon: FileText,
            isActive: location.pathname === "/documents" ? true : false,
            initial: "d",
            internal: true,
          },
          {
            title: "Knowledge Base",
            url: `/${locale}/knowledge-base`,
            icon: BookOpen,
            isActive: location.pathname === "/knowledge-base" ? true : false,
            initial: "k",
            internal: true,
          },
          {
            title: "Issues",
            url: `/${locale}/issues`,
            icon: SquareKanban,
            isActive: location.pathname === "/issues" ? true : false,
            initial: "t",
            items: [
              {
                title: "Open",
                url: "/issues/open",
                initial: "o",
              },
              {
                title: "Closed",
                url: "/issues/closed",
                initial: "f",
              },
            ],
          },
          {
            title: "Admin",
            url: "/admin",
            icon: Settings,
            isActive: true,
            initial: "a",
          },
        ],
  };

  function handleKeyPress(event: any) {
    const pathname = location.pathname;

    // Check for Ctrl or Meta key to bypass the shortcut handler
    if (event.ctrlKey || event.metaKey) {
      return; // Don't override browser shortcuts
    }

    if (
      document.activeElement!.tagName !== "INPUT" &&
      document.activeElement!.tagName !== "TEXTAREA" &&
      !document.activeElement!.className.includes("ProseMirror") &&
      !pathname.includes("/new")
    ) {
      switch (event.key) {
        case "c":
          setKeyPressDown(true);
          break;
        case "h":
          location.push("/");
          break;
        case "d":
          location.push("/documents");
          break;
        case "k":
          location.push("/knowledge-base");
          break;
        case "t":
          location.push("/issues");
          break;
        case "a":
          location.push("/admin");
          break;
        case "o":
          location.push("/issues/open");
          break;
        case "f":
          location.push("/issues/closed");
          break;
        case "[":
          sidebar.toggleSidebar();
          break;

        default:
          break;
      }
    }
  }

  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress, location]);

  return (
    <Sidebar
      collapsible="icon"
      className="border border-sidebar-border/60 bg-sidebar/70 shadow-xl backdrop-blur"
      {...props}
    >
      <SidebarHeader className="rounded-lg border border-sidebar-border/60 bg-sidebar/80 p-3 shadow-sm">
        {/* <TeamSwitcher teams={data.teams} /> */}
        <div className="flex items-center gap-3">
          <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-primary/15 text-sidebar-primary-foreground">
            <img src="/favicon/favicon-32x32.png" className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight text-foreground">
            <span className="truncate text-lg font-semibold text-foreground">
              Peppermint
            </span>
            <span className="truncate text-xs text-muted-foreground">
              version: {process.env.NEXT_PUBLIC_CLIENT_VERSION}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <CreateTicketModal
          keypress={keypressdown}
          setKeyPressDown={setKeyPressDown}
        />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}
