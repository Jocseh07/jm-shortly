import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { BarChart3, Link2, ShieldCheck, TimerReset } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LandingCta } from "./_components/landing-cta";

const HERO_STATS = [
  {
    value: "2M+",
    label: "tracked clicks",
  },
  {
    value: "99.9%",
    label: "uptime",
  },
  {
    value: "5 mins",
    label: "to onboard",
  },
];

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const FEATURES: Feature[] = [
  {
    title: "Instant short links",
    description: "Generate branded links with custom aliases that stay memorable across every campaign.",
    icon: Link2,
  },
  {
    title: "Activation controls",
    description: "Schedule launch windows or set expiry guards without touching the original destination.",
    icon: TimerReset,
  },
  {
    title: "Actionable analytics",
    description: "Understand visitors with real-time click breakdowns by channel, device, and geography.",
    icon: BarChart3,
  },
  {
    title: "Enterprise-grade safety",
    description: "Pause compromised links, protect with passwords, and stay compliant out of the box.",
    icon: ShieldCheck,
  },
];

const STEPS = [
  {
    title: "Shorten",
    description: "Drop in any URL and craft a memorable short code in seconds.",
  },
  {
    title: "Share",
    description: "Publish the link everywhere your audience lives with total brand consistency.",
  },
  {
    title: "Track",
    description: "Watch performance roll in and optimize based on live engagement data.",
  },
];


export default function Home() {
  const year = new Date().getFullYear();
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-24 flex flex-col gap-12 text-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="mx-auto w-fit">
              Ship links with total control
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Shorten smarter. Track every click with confidence.
            </h1>
            <p className="text-lg text-muted-foreground sm:text-xl max-w-3xl mx-auto">
              Shortly gives modern teams the tools to create, monitor, and automate branded links from a single dashboard.
            </p>
            <LandingCta className="mt-2" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {HERO_STATS.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="py-6">
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-semibold">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="outline">Features</Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Manage links like the rest of your stack
          </h2>
          <p className="text-muted-foreground text-lg">
            Shortly keeps everything organized with enterprise-grade guardrails and delightful details.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="h-full">
              <CardHeader className="flex flex-row items-start gap-4">
                <feature.icon className="h-10 w-10 rounded-full bg-primary/10 p-2 text-primary" />
                <div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 border-y">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="text-center space-y-4">
            <Badge variant="secondary">Workflow</Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Launch links in three simple steps
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From brainstorm to viral campaign, Shortly slots neatly into your existing toolkit.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <Card key={step.title}>
                <CardHeader>
                  <Badge className="w-fit">{String(index + 1).padStart(2, "0")}</Badge>
                  <CardTitle className="text-2xl mt-4">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="space-y-6">
          <Badge variant="outline">Get started</Badge>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to launch your next campaign link?
          </h2>
          <p className="text-muted-foreground text-lg">
            Spin up your first short link in minutes, invite collaborators, and keep full ownership of every click.
          </p>
          <LandingCta align="center" className="mt-2" />
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-6 flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Shortly. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
