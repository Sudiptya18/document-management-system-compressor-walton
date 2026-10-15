"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-1 flex-col justify-center px-4 py-16">
      <p className="text-[11px] tracking-[0.18em] text-primary uppercase">Compressor plant</p>
      <h1 className="mt-3 text-2xl font-medium">This page could not be shown</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        The document system hit an unexpected error. Try the page again.
      </p>
      <Button type="button" className="mt-6 w-fit" onClick={() => reset()}>
        Try again
      </Button>
    </main>
  );
}
