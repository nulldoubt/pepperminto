import type { NextApiRequest, NextApiResponse } from "next";
import { request as httpRequest } from "http";
import { request as httpsRequest } from "https";

export const config = {
  api: {
    bodyParser: false,
  },
};

function getPathParam(path: string | string[] | undefined) {
  if (!path) return "";
  return Array.isArray(path) ? path.join("/") : path;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiUrl = process.env.API_URL || "http://localhost:3001";
  const pathParam = getPathParam(req.query.path);
  const baseUrl = new URL(`/api/v1/${pathParam}`, apiUrl);
  const originalUrl = new URL(req.url || "", "http://localhost");
  baseUrl.search = originalUrl.search;

  const requestFn = baseUrl.protocol === "https:" ? httpsRequest : httpRequest;
  const proxyReq = requestFn(
    {
      protocol: baseUrl.protocol,
      hostname: baseUrl.hostname,
      port: baseUrl.port,
      method: req.method,
      path: `${baseUrl.pathname}${baseUrl.search}`,
      headers: {
        ...req.headers,
        host: baseUrl.host,
      },
    },
    (proxyRes) => {
      res.statusCode = proxyRes.statusCode || 500;
      Object.entries(proxyRes.headers).forEach(([key, value]) => {
        if (typeof value !== "undefined") {
          res.setHeader(key, value as string);
        }
      });
      proxyRes.pipe(res);
    }
  );

  proxyReq.on("error", (error) => {
    res.status(502).json({ error: "Bad Gateway", detail: error.message });
  });

  req.pipe(proxyReq);
}
