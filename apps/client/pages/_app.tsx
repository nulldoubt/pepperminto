//@ts-nocheck
import "@radix-ui/themes/styles.css";
import "../styles/globals.css";


import {
  DocumentCheckIcon,
  FolderIcon,
  HomeIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";

import { MantineProvider } from "@mantine/core";
import { Theme } from "@radix-ui/themes";
import Head from "next/head";
import { useRouter } from "next/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { SessionProvider, useUser } from "../store/session";

import React from "react";

import AdminLayout from "../layouts/adminLayout";
import NewLayout from "../layouts/newLayout";
import NoteBookLayout from "../layouts/notebook";
import PortalLayout from "../layouts/portalLayout";
import Settings from "../layouts/settings";
import ShadLayout from "../layouts/shad";
import GlobalShortcut from "@/shadcn/block/GlobalShortcut";
import { Toaster } from "@/shadcn/ui/toaster";

import { SidebarProvider } from "@/shadcn/ui/sidebar";

const queryClient = new QueryClient();

function AppHead() {
  return (
    <Head>
      <title>Peppermint</title>
      <meta
        name="viewport"
        content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
      />
    </Head>
  );
}

function Auth({ children }: any) {
  const { loading, user } = useUser();

  React.useEffect(() => {
    if (loading) return; 
  }, [user, loading]);

  if (user) {
    return children;
  }

  return (
    <div className="flex h-screen justify-center items-center text-green-600"></div>
  );
}

function MyApp({ Component, pageProps: { session, ...pageProps } }: any) {
  const router = useRouter();

  if (router.asPath.slice(0, 5) === "/auth") {
    return (
      <>
        <AppHead />
        <Component {...pageProps} />
        <Toaster />
      </>
    );
  }

  if (router.pathname.includes("/admin")) {
    return (
      <SessionProvider>
        <Theme>
          <QueryClientProvider client={queryClient}>
            <Auth>
              <AdminLayout>
                <AppHead />
                <Component {...pageProps} />
                <Toaster />
              </AdminLayout>
            </Auth>
          </QueryClientProvider>
        </Theme>
      </SessionProvider>
    );
  }

  if (router.pathname.includes("/settings")) {
    return (
      <SessionProvider>
        <Theme>
          <QueryClientProvider client={queryClient}>
            <Auth>
              <ShadLayout>
                <Settings>
                  <AppHead />
                  <Component {...pageProps} />
                  <Toaster />
                </Settings>
              </ShadLayout>
            </Auth>
          </QueryClientProvider>
        </Theme>
      </SessionProvider>
    );
  }

  if (router.pathname.startsWith("/portal")) {
    return (
      <SessionProvider>
        <Theme>
          <QueryClientProvider client={queryClient}>
            <Auth>
              <PortalLayout>
                <AppHead />
                <Component {...pageProps} />
                <Toaster />
              </PortalLayout>
            </Auth>
          </QueryClientProvider>
        </Theme>
      </SessionProvider>
    );
  }

  if (router.pathname === "/onboarding") {
    return (
      <SessionProvider>
        <AppHead />
        <Component {...pageProps} />
        <Toaster />
      </SessionProvider>
    );
  }

  if (router.pathname === "/submit") {
    return (
      <>
        <AppHead />
        <Component {...pageProps} />
        <Toaster />
      </>
    );
  }

  return (
    <SessionProvider>
      <Theme>
        <QueryClientProvider client={queryClient}>
          <Auth>
            <ShadLayout>
              <AppHead />
              <Component {...pageProps} />
              <Toaster />
            </ShadLayout>
          </Auth>
        </QueryClientProvider>
      </Theme>
    </SessionProvider>
  );
}

export default MyApp;
