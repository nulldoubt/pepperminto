const removeImports = require("next-remove-imports")();
const nextTranslate = require("next-translate-plugin");

module.exports = nextTranslate(
  removeImports({
    reactStrictMode: false,
    output: "standalone",
    typescript: {
      ignoreBuildErrors: process.env.SKIP_TYPECHECK === "1",
    },
    env: {
      API_URL: process.env.API_URL,
      BASE_URL: process.env.BASE_URL,
      DASHBOARD_URL: process.env.DASHBOARD_URL,
      DOCS_URL: process.env.DOCS_URL,
      KNOWLEDGE_BASE_URL: process.env.KNOWLEDGE_BASE_URL,
    },
    async rewrites() {
      const apiUrl = process.env.API_URL || "http://localhost:3001";
      return [
        {
          source: "/api/v1/:path*",
          destination: `${apiUrl}/api/v1/:path*`,
        },
      ];
    },
  })
);
