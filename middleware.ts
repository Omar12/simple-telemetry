import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getBasicAuthHeaderValue, isAdminConfigured } from "@/lib/admin";

function unauthorizedResponse() {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Analytics"'
    }
  });
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (!isAdminConfigured()) {
    return new NextResponse("Admin analytics is not configured.", { status: 503 });
  }

  const authHeader = request.headers.get("authorization");
  const expected = getBasicAuthHeaderValue(
    process.env.ADMIN_USERNAME as string,
    process.env.ADMIN_PASSWORD as string
  );

  if (authHeader !== expected) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
