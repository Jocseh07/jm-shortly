import { db } from "@/db";
import { links } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { trackClick } from "@/actions/tracking";
import Link from "next/link";

export default async function RedirectPage({
  params,
}: {
  params: Promise<{ shortCode: string }>;
}) {
  const { shortCode } = await params;

  const link = await db.query.links.findFirst({
    where: eq(links.shortCode, shortCode),
  });

  if (!link) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-4">404 - Link Not Found</h1>
        <p className="text-muted-foreground mb-8">
          This link may have expired or been deleted.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go to Homepage
        </Link>
      </div>
    );
  }

  if (!link.isActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-4">Link Disabled</h1>
        <p className="text-muted-foreground mb-8">
          This link has been disabled by the owner.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go to Homepage
        </Link>
      </div>
    );
  }

  if (link.expiresAt && link.expiresAt < new Date()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mb-4">Link Expired</h1>
        <p className="text-muted-foreground mb-8">
          This link has expired and is no longer available.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Go to Homepage
        </Link>
      </div>
    );
  }

  trackClick(link.id, shortCode).catch((error) => {
    console.error("Failed to track click:", error);
  });

  redirect(link.originalUrl);
}
