"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { createLinkSchema } from "@/lib/validations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CreateLinkResult =
  | { success: true; shortCode: string; shortUrl: string }
  | { success: false; error: string }
  | null;

export function LinkForm({
  createAction,
}: {
  createAction: (
    prevState: unknown,
    formData: FormData
  ) => Promise<CreateLinkResult>;
}) {
  const [result, setResult] = useState<CreateLinkResult>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.output<typeof createLinkSchema>>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      originalUrl: "",
      customAlias: "",
      expiryDuration: "never",
    },
  });

  async function onSubmit(data: z.output<typeof createLinkSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("originalUrl", data.originalUrl);
    formData.append("customAlias", data.customAlias || "");
    formData.append("expiryDuration", data.expiryDuration || "never");

    const response = await createAction(null, formData);
    setResult(response);
    setIsSubmitting(false);

    if (response?.success) {
      form.reset();
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleReset = () => {
    setResult(null);
    form.reset();
  };

  return (
    <div className="space-y-6">
      {result?.success ? (
        <div className="space-y-4">
          <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Your short link is ready!
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-2 items-center p-4 bg-muted rounded-lg">
            <code className="flex-1 text-lg font-mono truncate">
              {result.shortUrl}
            </code>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(result.shortUrl)}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a
                  href={result.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open
                </a>
              </Button>
            </div>
          </div>

          <Button variant="ghost" className="w-full" onClick={handleReset}>
            Create Another Link
          </Button>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="originalUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="link-form-url">Long URL</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="link-form-url"
                      type="url"
                      placeholder="https://example.com/very/long/url"
                      aria-invalid={fieldState.invalid}
                      autoComplete="url"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              name="customAlias"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="link-form-alias">
                    Custom Alias{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      id="link-form-alias"
                      type="text"
                      placeholder="my-custom-link"
                      aria-invalid={fieldState.invalid}
                      autoComplete="off"
                    />
                    <FieldDescription>
                      4-20 characters: letters, numbers, hyphens, and
                      underscores only
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />

            <Controller
              name="expiryDuration"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="link-form-expiry">
                    Link Expiration{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="link-form-expiry" className="w-full">
                        <SelectValue placeholder="Select expiration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="24h">24 hours</SelectItem>
                        <SelectItem value="7d">7 days</SelectItem>
                        <SelectItem value="30d">30 days</SelectItem>
                        <SelectItem value="never">Never expire</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      When should this link expire?
                    </FieldDescription>
                  </FieldContent>
                </Field>
              )}
            />

            {result?.success === false && (
              <Alert variant="destructive">
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating..." : "Shorten Link"}
            </Button>
          </FieldGroup>
        </form>
      )}
    </div>
  );
}
