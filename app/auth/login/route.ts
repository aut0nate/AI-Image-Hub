import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { buildAuthentikLoginResponse, getLoginErrorUrl } from "@/lib/authentik-oidc";

export async function GET(request: NextRequest) {
  try {
    return await buildAuthentikLoginResponse(request);
  } catch {
    return NextResponse.redirect(getLoginErrorUrl(request, "authentik_config"));
  }
}
