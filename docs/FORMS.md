# Forms Documentation - Shortly

This document describes the form handling approach used in Shortly, following shadcn/ui best practices with React Hook Form.

---

## 📋 Overview

Shortly uses **shadcn/ui Field components** with **React Hook Form** for all forms. This approach provides:

- ✅ Type-safe form handling with TypeScript
- ✅ Client-side validation with Zod
- ✅ Accessible forms with proper ARIA attributes
- ✅ Integration with Next.js Server Actions
- ✅ Excellent developer experience

---

## 🎯 Architecture

### Form Stack

1. **React Hook Form** - Form state management
2. **Zod** - Schema validation
3. **shadcn/ui Field** - UI components
4. **Server Actions** - Backend integration

### Why Field Component?

shadcn recommends using the **Field component** (not the deprecated Form component) because:

- More flexible markup control
- Better composition patterns
- Follows modern React patterns
- Actively maintained

---

## 🔨 Implementation Pattern

### 1. Define Validation Schema

Create reusable schemas in `src/lib/validations.ts`:

```typescript
import { z } from "zod";

export const createLinkSchema = z.object({
  originalUrl: z
    .string()
    .min(1, "URL is required")
    .url("Please enter a valid URL"),
  customAlias: z
    .string()
    .min(4, "Custom alias must be at least 4 characters")
    .max(20, "Custom alias must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, hyphens, and underscores")
    .optional()
    .or(z.literal("")),
});
```

### 2. Create Form Component

Use Controller pattern with Field components:

```typescript
'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createLinkSchema } from '@/lib/validations';
import { createLink } from '@/actions/links';

export function LinkForm() {
  const [result, setResult] = useState(null);
  
  const form = useForm<z.infer<typeof createLinkSchema>>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      originalUrl: '',
      customAlias: '',
    },
  });

  async function onSubmit(data: z.infer<typeof createLinkSchema>) {
    // Convert to FormData for server action
    const formData = new FormData();
    formData.append('originalUrl', data.originalUrl);
    formData.append('customAlias', data.customAlias || '');

    // Call server action
    const response = await createLink(null, formData);
    setResult(response);

    if (response?.success) {
      form.reset(); // Clear form on success
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        {/* URL Field */}
        <Controller
          name="originalUrl"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="url">Long URL</FieldLabel>
              <FieldContent>
                <Input
                  {...field}
                  id="url"
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

        {/* Custom Alias Field */}
        <Controller
          name="customAlias"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="alias">
                Custom Alias <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  {...field}
                  id="alias"
                  type="text"
                  placeholder="my-custom-link"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                />
                <FieldDescription>
                  4-20 characters: letters, numbers, hyphens, and underscores only
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
            </Field>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating...' : 'Shorten Link'}
        </Button>
      </FieldGroup>
    </form>
  );
}
```

### 3. Create Server Action

Define server actions in `src/actions/`:

```typescript
"use server";

import { db } from "@/db";
import { links } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { getThrowUser } from "./getThrowUser";
import { createLinkSchema } from "@/lib/validations";

export async function createLink(
  prevState: unknown,
  formData: FormData
): Promise<
  | { success: true; shortCode: string; shortUrl: string }
  | { success: false; error: string }
> {
  try {
    // Authenticate
    const userId = await getThrowUser();

    // Extract and validate data
    const originalUrl = formData.get("originalUrl") as string;
    const customAlias = formData.get("customAlias") as string;

    const validationResult = createLinkSchema.safeParse({
      originalUrl,
      customAlias: customAlias || undefined,
    });

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.errors[0].message,
      };
    }

    // Business logic
    const { originalUrl: validatedUrl, customAlias: validatedAlias } =
      validationResult.data;

    // Generate short code or use custom alias
    const shortCode = validatedAlias || generateShortCode();

    // Check uniqueness
    const existingLink = await db.query.links.findFirst({
      where: eq(links.shortCode, shortCode),
    });

    if (existingLink) {
      return {
        success: false,
        error: "This short code is already taken.",
      };
    }

    // Insert into database
    await db.insert(links).values({
      id: crypto.randomUUID(),
      shortCode,
      originalUrl: validatedUrl,
      userId,
      clicks: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Revalidate dashboard
    revalidatePath("/dashboard");

    // Get base URL dynamically from request headers
    const baseUrl = await getBaseUrl();
    const shortUrl = `${baseUrl}/${shortCode}`;

    return {
      success: true,
      shortCode,
      shortUrl,
    };
  } catch (error) {
    console.error("Error creating link:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return {
        success: false,
        error: "You must be signed in to create links",
      };
    }
    return {
      success: false,
      error: "Failed to create link. Please try again.",
    };
  }
}
```

---

## 📦 Component Structure

### Field Components Hierarchy

```
<form onSubmit={form.handleSubmit(onSubmit)}>
  <FieldGroup>                    {/* Container with spacing */}
    <Controller                   {/* React Hook Form controller */}
      name="fieldName"
      control={form.control}
      render={({ field, fieldState }) => (
        <Field                    {/* Field wrapper */}
          data-invalid={fieldState.invalid}
        >
          <FieldLabel htmlFor="id"> {/* Label */}
            Field Name
          </FieldLabel>
          
          <FieldContent>          {/* Content wrapper */}
            <Input {...field} />  {/* Input component */}
            
            <FieldDescription>    {/* Help text */}
              Additional information
            </FieldDescription>
            
            {fieldState.invalid && (
              <FieldError           {/* Error display */}
                errors={[fieldState.error]}
              />
            )}
          </FieldContent>
        </Field>
      )}
    />
    
    <Button type="submit">Submit</Button>
  </FieldGroup>
</form>
```

---

## 🎯 Best Practices

### 1. Validation

**✅ DO: Validate on both client and server**
```typescript
// Client-side validation
const form = useForm({
  resolver: zodResolver(createLinkSchema),
});

// Server-side validation
const validationResult = createLinkSchema.safeParse(data);
if (!validationResult.success) {
  return { success: false, error: validationResult.error.errors[0].message };
}
```

**❌ DON'T: Trust client-side validation alone**

### 2. Error Handling

**✅ DO: Show specific error messages**
```typescript
{fieldState.invalid && (
  <FieldError errors={[fieldState.error]} />
)}
```

**✅ DO: Handle server errors gracefully**
```typescript
if (!response?.success) {
  // Show error to user
  toast.error(response.error);
}
```

### 3. User Experience

**✅ DO: Show loading states**
```typescript
<Button type="submit" disabled={form.formState.isSubmitting}>
  {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
</Button>
```

**✅ DO: Reset form after successful submission**
```typescript
if (response?.success) {
  form.reset();
}
```

### 4. Accessibility

**✅ DO: Use proper labels and ARIA attributes**
```typescript
<FieldLabel htmlFor="email">Email</FieldLabel>
<Input
  {...field}
  id="email"
  aria-invalid={fieldState.invalid}
  autoComplete="email"
/>
```

### 5. Validation Modes

Choose the right validation mode for your use case:

```typescript
const form = useForm({
  resolver: zodResolver(schema),
  mode: 'onBlur', // Options: onChange, onBlur, onSubmit, onTouched, all
});
```

| Mode | When to Use |
|------|-------------|
| `onBlur` | **Default** - Validates when user leaves field (best UX) |
| `onChange` | Real-time validation (can be annoying for users) |
| `onSubmit` | Only validate on submit (minimal feedback) |
| `onTouched` | First blur, then onChange (balanced approach) |

---

## 🔍 Common Patterns

### Optional Fields

```typescript
const schema = z.object({
  required: z.string().min(1, "Required field"),
  optional: z.string().optional().or(z.literal("")),
});
```

### Conditional Validation

```typescript
const schema = z.object({
  type: z.enum(["personal", "business"]),
  companyName: z.string().optional(),
}).refine(
  (data) => data.type !== "business" || data.companyName,
  {
    message: "Company name is required for business accounts",
    path: ["companyName"],
  }
);
```

### Array Fields

```typescript
<Controller
  name={`emails.${index}.address`}
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <Input {...field} />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

---

## 📚 References

- [shadcn/ui Forms](https://ui.shadcn.com/docs/forms/react-hook-form)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

## 🚀 Quick Start Checklist

When creating a new form:

- [ ] Define Zod schema in `src/lib/validations.ts`
- [ ] Create server action in `src/actions/`
- [ ] Set up react-hook-form with zodResolver
- [ ] Use Controller with Field components
- [ ] Add proper labels, descriptions, and error messages
- [ ] Handle loading and success states
- [ ] Call `revalidatePath()` in server action
- [ ] Test validation (client and server)
- [ ] Test accessibility (keyboard navigation, screen readers)
- [ ] Add proper TypeScript types

---

**Forms optimized for: User Experience, Accessibility, Type Safety**
