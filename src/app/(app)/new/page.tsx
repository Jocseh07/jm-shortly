import { createLink } from "@/actions/links";
import { LinkForm } from "@/app/_components/link-form";

export default function NewLinkPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Shorten Your Links,
            <br />
            Track Every Click
          </h1>
          <p className="text-lg text-muted-foreground">
            Create short URLs and monitor their performance with detailed
            analytics
          </p>
        </div>

        <LinkForm createAction={createLink} />
      </div>
    </main>
  );
}
