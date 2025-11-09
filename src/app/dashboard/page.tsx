import { getUserLinks } from "@/actions/links";
import { getDashboardStats } from "@/actions/analytics";
import { LinkTable } from "./_components/link-table";
import { StatsCards } from "./_components/stats-cards";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [links, stats] = await Promise.all([
    getUserLinks(),
    getDashboardStats(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and track your shortened links
          </p>
        </div>
        <Button asChild>
          <Link href="/">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Create Link</span>
          </Link>
        </Button>
      </div>

      <StatsCards stats={stats} />

      <LinkTable links={links} />
    </div>
  );
}
