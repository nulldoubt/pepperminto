import { Footer, Layout, Navbar, Sidebar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import type { Metadata } from 'next'
import 'nextra-theme-docs/style.css'
 
export const metadata: Metadata = {
  metadataBase: new URL("https://peppermint.sh"),
  title: {
    template: "Peppermint",
    default: "Peppermint - Revolutionizing Customer Support for Rapid Resolutions. Your Premier Zendesk Alternative.",
  },
  description: "Experience Peppermint's revolutionary approach to customer support, ensuring swift resolutions. Discover your ultimate alternative to Zendesk.",
  openGraph: {
    images: "/og-image.png",
    url: "https://peppermint.sh",
  },
  manifest: "/site.webmanifest",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
    { rel: "mask-icon", url: "/favicon.ico" },
    { rel: "image/x-icon", url: "/favicon.ico" },
  ],
  twitter: {
    site: "@potts_dev",
    creator: "@potts_dev",
  },
};

const banner = (<Banner storageKey="some-key">
    <a
      href="https://github.com/Peppermint-Lab/peppermint/releases"
      target="_blank"
      rel="noreferrer"
    >
      🎉 Peppermint 0.4.5 is here! Check it out now! 🚀
    </a>
</Banner>)

const navbar = (
  <Navbar
    logo={<b>Peppermint</b>}
  />
)

const sidebar = {
    defaultMenuCollapseLevel: 2,
    toggleButton: false,
}

export default async function RootLayout({ children }) {
  const title = metadata.title.template;
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
    >
      <Head>
        {metadata.icons.map((icon, index) => (
          <link key={index} rel={icon.rel} href={icon.url} />
        ))}
        <meta httpEquiv="Content-Language" content="en" />
        <meta name="description" content={metadata.description} />
        <meta
          name="og:title"
          content={title ? `${title} - Panda` : metadata.title.default}
        />
        <meta name="og:description" content={metadata.description} />
        <meta name="og:image" content={metadata.openGraph.images} />
        <meta name="og:url" content={metadata.openGraph.url} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={metadata.twitter.site} />
        <meta name="twitter:creator" content={metadata.twitter.creator} />
        <meta name="apple-mobile-web-app-title" content="Panda" />
      </Head>
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/Peppermint-Lab/docs"
          sidebar={sidebar}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}