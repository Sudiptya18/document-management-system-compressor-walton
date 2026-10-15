"use client";

import { PlusIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ServerRecord } from "@/lib/types";

export function ServerBar({
  servers,
  loading,
  onConnect,
  onRemove,
}: {
  servers: ServerRecord[];
  loading: boolean;
  onConnect: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
        Servers
      </span>
      {loading ? <span className="text-sm text-muted-foreground">Checking…</span> : null}
      {loading
        ? null
        : servers.map((server) => (
            <span
              key={server.id}
              className="inline-flex max-w-full items-center gap-1 rounded-md border border-border bg-card py-1 pr-1 pl-2.5"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm">{server.name}</span>
                <span className="block max-w-56 truncate font-mono text-[10px] text-muted-foreground">
                  {server.path}
                </span>
              </span>
              <button
                type="button"
                aria-label={`Disconnect ${server.name}`}
                onClick={() => onRemove(server.id)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <XIcon className="size-3.5" />
              </button>
            </span>
          ))}
      {loading ? null : servers.length === 0 ? (
        <Button type="button" onClick={onConnect}>
          Connect to Server
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Add a server"
          onClick={onConnect}
        >
          <PlusIcon />
        </Button>
      )}
    </div>
  );
}
