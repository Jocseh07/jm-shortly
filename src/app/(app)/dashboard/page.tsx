import { getUserLinks } from "@/actions/links";
import { getDashboardStats } from "@/actions/analytics";
import { LinkTable } from "./_components/link-table";
import { StatsCards } from "./_components/stats-cards";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams: Promise<{ search?: string; page?: string; pageSize?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const searchQuery = params.search;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const pageSize = params.pageSize ? parseInt(params.pageSize, 10) : 50;

  const [linksResult, stats] = await Promise.all([
    getUserLinks({ page, pageSize, searchQuery }),
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
          <Link href="/new">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Create Link</span>
          </Link>
        </Button>
      </div>

      <StatsCards stats={stats} />

      <LinkTable 
        links={linksResult.data} 
        pagination={linksResult.pagination}
        searchQuery={searchQuery} 
      />
    </div>
  );
}
