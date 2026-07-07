import { NextRequest, NextResponse } from "next/server";

const IDENTIFY_BASE =
  process.env.SERVICE_IDENTIFICATION_URL ?? "http://localhost:28083";

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("host") ?? "";
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function clearAuthCookies(res: NextResponse): void {
  const expired = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/", maxAge: 0 };
  res.cookies.set("finlumia_access",  "", expired);
  res.cookies.set("finlumia_refresh", "", expired);
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const refreshToken = req.cookies.get("finlumia_refresh")?.value;

  // Best-effort: revoga no backend, mas prossegue mesmo se falhar
  if (refreshToken) {
    try {
      await fetch(`${IDENTIFY_BASE}/api/identify/token/revoke`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ refreshToken }),
      });
    } catch {
      // prossegue com logout local
    }
  }

  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);
  return response;
}
