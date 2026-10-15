import Link from "next/link";
import { CompressorPlate } from "@/components/compressor-plate";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-8 sm:py-12">
      <p className="text-[11px] tracking-[0.22em] text-primary uppercase">
        Walton · Hi-Tech Compressor
      </p>
      <div className="mt-4 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h1 className="max-w-xl text-4xl font-medium tracking-tight text-balance sm:text-5xl">
            Document Management System
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
            Compressor plant records are filed under an SOP record number. Save a document onto a server folder, or search what is already there.
          </p>
          <div className="mt-8 grid gap-3">
            <Link href="/save" className="action-row rounded-xl">
              <span className="font-mono text-xs text-primary">01</span>
              <span>
                <span className="block text-lg font-medium">Save Document</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  Upload a file, set the SOP fields, and file it under its record number.
                </span>
              </span>
              <span aria-hidden className="text-primary">
                →
              </span>
            </Link>
            <Link href="/search" className="action-row rounded-xl">
              <span className="font-mono text-xs text-primary">02</span>
              <span>
                <span className="block text-lg font-medium">Search Document</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  Connect a server and find records by the same fields used to name them.
                </span>
              </span>
              <span aria-hidden className="text-primary">
                →
              </span>
            </Link>
          </div>
        </div>
        <CompressorPlate />
      </div>
    </main>
  );
}
