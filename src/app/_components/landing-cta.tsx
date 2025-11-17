"use client";

import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LandingCtaProps = {
  align?: "center" | "start";
  className?: string;
};

export function LandingCta({ align = "center", className }: LandingCtaProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3",
        align === "center" ? "justify-center" : "justify-start",
        className
      )}
    >
      <SignedIn>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/new">Create new link</Link>
          </Button>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" asChild>
            <SignInButton mode="modal">Sign in</SignInButton>
          </Button>
          <Button asChild>
            <SignUpButton>Get started for free</SignUpButton>
          </Button>
        </div>
      </SignedOut>
    </div>
  );
}
