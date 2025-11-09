import { headers } from "next/headers";

/**
 * Get the base URL from the current request headers
 * This works in both development and production environments
 */
export async function getBaseUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  
  return `${protocol}://${host}`;
}
