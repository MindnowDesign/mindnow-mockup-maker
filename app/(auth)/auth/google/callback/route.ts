import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createGoogleCallbackBridgeHtml } from "@/lib/firebase/google-callback-bridge-html";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const loginUrl = new URL("/login", origin);

  try {
    const formData = await request.formData();
    const credential = formData.get("credential");
    const cookieStore = await cookies();
    const csrfCookie = cookieStore.get("g_csrf_token")?.value;
    const csrfBody = formData.get("g_csrf_token");

    if (
      !csrfCookie ||
      !csrfBody ||
      typeof csrfBody !== "string" ||
      csrfCookie !== csrfBody
    ) {
      loginUrl.searchParams.set(
        "googleError",
        "Google sign-in could not be verified. Please try again."
      );
      return NextResponse.redirect(loginUrl);
    }

    if (!credential || typeof credential !== "string") {
      loginUrl.searchParams.set(
        "googleError",
        "Google Sign-In did not return a valid credential."
      );
      return NextResponse.redirect(loginUrl);
    }

    const html = createGoogleCallbackBridgeHtml(credential);

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    loginUrl.searchParams.set(
      "googleError",
      "Google sign-in failed. Please try again."
    );
    return NextResponse.redirect(loginUrl);
  }
}

export async function GET(request: Request) {
  return NextResponse.redirect(new URL("/login", request.url));
}
