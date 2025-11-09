import Link from "next/link";
import { Unlink2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Logo() {
  return (
    <Button variant="secondary" size="icon" asChild>
      <Link href="/" aria-label="Go to homepage">
        <Unlink2 className="h-4 w-4" />
      </Link>
    </Button>
  );
}
