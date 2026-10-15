import Link from "next/link";
import { cn } from "@/lib/utils";

function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={cn("size-8", className)}
    >
      <rect
        x="3"
        y="11"
        width="16"
        height="10"
        className="stroke-steel"
        fill="none"
        strokeWidth="1.4"
      />
      <rect x="8" y="13.5" width="5" height="5" className="fill-copper" />
      <path
        d="M13 16 H22 L26 20"
        className="stroke-copper"
        fill="none"
        strokeWidth="1.4"
      />
      <circle
        cx="26"
        cy="21"
        r="3.2"
        className="stroke-steel"
        fill="none"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function SiteHeader({ active }: { active?: "save" | "search" }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Mark />
          <span className="leading-tight">
            <span className="block text-[10px] tracking-[0.18em] text-muted-foreground">
              WALTON
            </span>
            <span className="block text-sm font-medium">Compressor Plant</span>
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm">
          <Link
            href="/save"
            className={cn(
              "rounded-md px-3 py-1.5",
              active === "save"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Save
          </Link>
          <Link
            href="/search"
            className={cn(
              "rounded-md px-3 py-1.5",
              active === "search"
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Search
          </Link>
        </nav>
      </div>
    </header>
  );
}
