import { NextResponse, type NextRequest } from "next/server";
import {
  updateSession,
  type CookieOptions,
  type CookieStore,
} from "@insforge/sdk/ssr/middleware";

const protectedRoutes = ["/dashboard", "/profile", "/find-jobs"];

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

type CookieSetInput = {
  name: string;
  value: string;
} & CookieOptions;

type CookieDeleteInput = {
  name: string;
} & CookieOptions;

function createRequestCookieStore(cookies: NextRequest["cookies"]): CookieStore {
  return {
    get(name: string) {
      return cookies.get(name);
    },
    set(nameOrOptions: string | CookieSetInput, value?: string): unknown {
      if (typeof nameOrOptions === "string") {
        return cookies.set(nameOrOptions, value ?? "");
      }

      return cookies.set({
        name: nameOrOptions.name,
        value: nameOrOptions.value,
      });
    },
    delete(nameOrOptions: string | CookieDeleteInput): unknown {
      if (typeof nameOrOptions === "string") {
        return cookies.delete(nameOrOptions);
      }

      return cookies.delete(nameOrOptions.name);
    },
  };
}

function createResponseCookieStore(
  cookies: NextResponse["cookies"],
): CookieStore {
  return {
    get(name: string) {
      return cookies.get(name);
    },
    set(
      nameOrOptions: string | CookieSetInput,
      value?: string,
      options?: CookieOptions,
    ): unknown {
      if (typeof nameOrOptions === "string") {
        return cookies.set(nameOrOptions, value ?? "", options);
      }

      return cookies.set(nameOrOptions);
    },
    delete(nameOrOptions: string | CookieDeleteInput): unknown {
      if (typeof nameOrOptions === "string") {
        return cookies.delete(nameOrOptions);
      }

      return cookies.delete(nameOrOptions);
    },
  };
}

function redirectWithCookies(
  url: URL,
  responseWithCookies: NextResponse,
): NextResponse {
  const redirectResponse = NextResponse.redirect(url);

  responseWithCookies.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next({ request });
  const session = await updateSession({
    requestCookies: createRequestCookieStore(request.cookies),
    responseCookies: createResponseCookieStore(response.cookies),
  });

  if (isProtectedRoute(request.nextUrl.pathname) && !session.accessToken) {
    return redirectWithCookies(new URL("/login", request.url), response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
