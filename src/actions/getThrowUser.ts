import { auth } from "@clerk/nextjs/server";

export async function getThrowUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId as string;
}
