import * as client from "openid-client";

let oidcConfig: client.Configuration | null = null;

export async function getOidcClient(config: any) {
  if (!oidcConfig) {
    oidcConfig = await client.discovery(new URL(config.issuer), config.clientId, {
      redirect_uris: [config.redirectUri],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    });
  }
  return oidcConfig;
}
