import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) {
    redirect("/");
  }
  return <div>{children}</div>;
}
