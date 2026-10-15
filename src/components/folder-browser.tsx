"use client";

import { useEffect, useState } from "react";
import { FolderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ServerRecord } from "@/lib/types";

type BrowseResult = {
  path: string;
  parent: string | null;
  canSelect: boolean;
  entries: { name: string; path: string }[];
};

export function FolderBrowser({
  open,
  onOpenChange,
  onConnected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: (server: ServerRecord) => void;
}) {
  const [browse, setBrowse] = useState<BrowseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setLoading(true);
      setError(null);
      setBrowse(null);
    }
  }

  async function load(path: string) {
    setLoading(true);
    setError(null);
    try {
      const query = path ? `?path=${encodeURIComponent(path)}` : "";
      const response = await fetch(`/api/browse${query}`, { cache: "no-store" });
      const data = (await response.json()) as BrowseResult & { error?: string };
      if (!response.ok) {
        setError(data.error || "This folder cannot be opened.");
        return;
      }
      setBrowse(data);
    } catch {
      setError("This folder cannot be opened.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetch("/api/browse", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json()) as BrowseResult & { error?: string };
        if (!response.ok) {
          setError(data.error || "This folder cannot be opened.");
          return;
        }
        setBrowse(data);
        setError(null);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setError("This folder cannot be opened.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [open]);

  async function selectFolder() {
    if (!browse) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: browse.path }),
      });
      const data = (await response.json()) as {
        server?: ServerRecord;
        error?: string;
      };
      if (!response.ok || !data.server) {
        setError(data.error || "The server could not be connected.");
        return;
      }
      onConnected(data.server);
      onOpenChange(false);
    } catch {
      setError("The server could not be connected.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Connect to Server</DialogTitle>
          <DialogDescription>
            Browse to the plant folder that should hold these records. The choice is remembered on this machine.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 font-mono text-xs leading-5 break-all text-muted-foreground">
              {browse?.path ?? "Opening folders…"}
            </p>
            {browse?.parent ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void load(browse.parent!)}
              >
                Up
              </Button>
            ) : null}
          </div>
          <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
            {loading && !browse ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                Reading folders…
              </p>
            ) : browse && browse.entries.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                No subfolders. You can use this folder as the server.
              </p>
            ) : (
              browse?.entries.map((entry) => (
                <button
                  key={entry.path}
                  type="button"
                  onClick={() => void load(entry.path)}
                  className="flex w-full items-center gap-2 border-b border-border px-3 py-2.5 text-left text-sm last:border-b-0 hover:bg-muted"
                >
                  <FolderIcon className="size-4 text-primary" />
                  <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                  <span className="text-xs text-muted-foreground">Open</span>
                </button>
              ))
            )}
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {browse && !browse.canSelect ? (
            <p className="text-sm text-muted-foreground">
              Open a folder inside this location, then use that folder.
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button
            type="button"
            onClick={() => void selectFolder()}
            disabled={!browse?.canSelect || saving || loading}
          >
            {saving ? "Connecting…" : "Use this folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
