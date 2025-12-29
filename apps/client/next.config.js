// next.config.js
const withPlugins = require('next-compose-plugins');
const removeImports = require('next-remove-imports')();
const nextTranslate = require('next-translate-plugin');

module.exports = withPlugins(
  [removeImports, nextTranslate],
  {
    reactStrictMode: false,
    output: 'standalone',

    async rewrites() {
      return [
        {
          source: '/api/v1/:path*',
          destination: 'http://localhost:5003/api/v1/:path*',
        },
      ];
    },
  }
);
