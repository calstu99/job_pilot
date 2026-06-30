import { cookies } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { createServerClient } from "@insforge/sdk/ssr";

export type InsforgeServerClient = ReturnType<typeof createServerClient>;
type CurrentUserResult = Awaited<
  ReturnType<InsforgeServerClient["auth"]["getCurrentUser"]>
>;
export type CurrentUser = NonNullable<CurrentUserResult["data"]["user"]>;

export async function createInsforgeServer(): Promise<InsforgeServerClient> {
  return createServerClient({
    cookies: await cookies(),
  });
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const insforge = await createInsforgeServer();
    const { data, error } = await insforge.auth.getCurrentUser();

    if (error) {
      console.error("[lib/insforge-server] getCurrentUser", error);
      return null;
    }

    return data.user;
  } catch (error) {
    unstable_rethrow(error);
    console.error("[lib/insforge-server] getCurrentUser", error);
    return null;
  }
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
