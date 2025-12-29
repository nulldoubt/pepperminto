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
import { ThemeProvider } from "next-themes";

import { SessionProvider, useUser } from "../store/session";

import React from "react";

import AdminLayout from "../layouts/adminLayout";
import NewLayout from "../layouts/newLayout";
import NoteBookLayout from "../layouts/notebook";
import PortalLayout from "../layouts/portalLayout";
import Settings from "../layouts/settings";
import ShadLayout from "../layouts/shad";
import { Toaster } from "@/shadcn/ui/toaster";

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
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <>
          <AppHead />
          <Component {...pageProps} />
          <Toaster />
        </>
      </ThemeProvider>
    );
  }

  if (router.pathname.includes("/settings")) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <SessionProvider>
          <Theme appearance="inherit">
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
      </ThemeProvider>
    );
  }

  if (router.pathname.startsWith("/portal")) {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <SessionProvider>
          <Theme appearance="inherit">
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
      </ThemeProvider>
    );
  }

  if (router.pathname === "/onboarding") {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <SessionProvider>
          <AppHead />
          <Component {...pageProps} />
          <Toaster />
        </SessionProvider>
      </ThemeProvider>
    );
  }

  if (router.pathname === "/submit") {
    return (
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <>
          <AppHead />
          <Component {...pageProps} />
          <Toaster />
        </>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SessionProvider>
        <Theme appearance="inherit">
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
    </ThemeProvider>
  );
}

export default MyApp;
