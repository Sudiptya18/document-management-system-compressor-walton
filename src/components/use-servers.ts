"use client";

import { useCallback, useEffect, useState } from "react";
import type { ServerRecord } from "@/lib/types";

export function useServers() {
  const [servers, setServers] = useState<ServerRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/servers", { cache: "no-store" });
      const data = (await response.json()) as { servers?: ServerRecord[] };
      setServers(data.servers ?? []);
    } catch {
      setServers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/servers", { cache: "no-store", signal: controller.signal })
      .then((response) => response.json())
      .then((data: { servers?: ServerRecord[] }) => {
        setServers(data.servers ?? []);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setServers([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  function remember(server: ServerRecord) {
    setServers((current) =>
      current.some((item) => item.id === server.id) ? current : [...current, server],
    );
    setLoading(false);
  }

  async function remove(id: string) {
    setServers((current) => current.filter((item) => item.id !== id));
    await fetch(`/api/servers?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await refresh();
  }

  return { servers, loading, refresh, remember, remove };
}
