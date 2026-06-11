import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { setAdminSessionCookie } from "@/lib/auth";
import { clearOAuthStateCookie, completeAuthentikLogin, getAdminUrl, getLoginErrorUrl } from "@/lib/authentik-oidc";

export async function GET(request: NextRequest) {
  const providerError = request.nextUrl.searchParams.get("error");
  if (providerError) {
    return NextResponse.redirect(getLoginErrorUrl(request, providerError));
  }

  try {
    const session = await completeAuthentikLogin(request);
    const response = NextResponse.redirect(getAdminUrl(request));
    setAdminSessionCookie(response, session);
    clearOAuthStateCookie(response);
    return response;
  } catch {
    const response = NextResponse.redirect(getLoginErrorUrl(request, "authentik_callback"));
    clearOAuthStateCookie(response);
    return response;
  }
}
