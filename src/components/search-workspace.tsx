"use client";

import { useEffect, useMemo, useState } from "react";
import { EyeIcon } from "lucide-react";
import { DateField } from "@/components/date-field";
import { Field } from "@/components/field";
import { FieldSelect } from "@/components/field-select";
import { FileViewer } from "@/components/file-viewer";
import { FolderBrowser } from "@/components/folder-browser";
import { ServerBar } from "@/components/server-bar";
import { useServers } from "@/components/use-servers";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categoryLabel } from "@/lib/record";
import {
  CUSTOM_TYPE_ID,
  DEPARTMENTS,
  DOCUMENT_TYPES,
  LINES,
  MODELS,
  SECTIONS,
  SUBSECTIONS,
} from "@/lib/sop";
import type { FileCategory, IndexedDocument, SearchQuery } from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORIES: { id: "all" | FileCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pdf", label: "PDF" },
  { id: "image", label: "Image" },
  { id: "word", label: "Word" },
  { id: "excel", label: "Excel" },
  { id: "other", label: "Other" },
];

const EMPTY: SearchQuery = {
  title: "",
  documentTypeId: "",
  customSymbol: "",
  customDocumentType: "",
  departmentId: "",
  sectionId: "",
  subsectionId: "",
  lineId: "",
  modelId: "",
  serial: "",
  version: "",
  concernName: "",
  employeeId: "",
  date: "",
};

export function SearchWorkspace() {
  const { servers, loading: serversLoading, remember, remove } = useServers();
  const [filters, setFilters] = useState<SearchQuery>(EMPTY);
  const [documents, setDocuments] = useState<IndexedDocument[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("all");
  const [browserOpen, setBrowserOpen] = useState(false);
  const [viewing, setViewing] = useState<IndexedDocument | null>(null);

  function patch(partial: Partial<SearchQuery>) {
    setFilters((current) => ({ ...current, ...partial }));
  }

  async function runSearch(query: SearchQuery) {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value) params.set(key, value);
    }
    try {
      const response = await fetch(`/api/documents?${params.toString()}`, {
        cache: "no-store",
      });
      const data = (await response.json()) as {
        documents?: IndexedDocument[];
        warnings?: string[];
        error?: string;
      };
      if (!response.ok) {
        setError(data.error || "The archive could not be read.");
        setDocuments([]);
        return;
      }
      setDocuments(data.documents ?? []);
      setWarnings(data.warnings ?? []);
    } catch {
      setError("The archive could not be read.");
    } finally {
      setLoading(false);
      setReady(true);
    }
  }

  useEffect(() => {
    if (serversLoading) return;
    const controller = new AbortController();
    fetch("/api/documents", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const data = (await response.json()) as {
          documents?: IndexedDocument[];
          warnings?: string[];
          error?: string;
        };
        if (!response.ok) {
          setError(data.error || "The archive could not be read.");
          setDocuments([]);
          return;
        }
        setDocuments(data.documents ?? []);
        setWarnings(data.warnings ?? []);
        setError(null);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setError("The archive could not be read.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setReady(true);
        }
      });
    return () => controller.abort();
  }, [serversLoading]);

  const counts = useMemo(() => {
    const tally: Record<string, number> = { all: documents.length };
    for (const item of CATEGORIES) {
      if (item.id !== "all") {
        tally[item.id] = documents.filter((doc) => doc.category === item.id).length;
      }
    }
    return tally;
  }, [documents]);

  const visible =
    category === "all"
      ? documents
      : documents.filter((doc) => doc.category === category);

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:py-8">
      <form
        className="grid content-start gap-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1"
        onSubmit={(event) => {
          event.preventDefault();
          void runSearch(filters);
        }}
      >
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Search Document</h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Match any of the eleven fields. Leave a field blank to ignore it.
          </p>
        </div>
        <ServerBar
          servers={servers}
          loading={serversLoading}
          onConnect={() => setBrowserOpen(true)}
          onRemove={async (id) => {
            await remove(id);
            void runSearch(filters);
          }}
        />
        <Field label="Title">
          <Input
            value={filters.title}
            onChange={(event) => patch({ title: event.target.value })}
            className="h-10"
          />
        </Field>
        <Field label="Document Type">
          <FieldSelect
            allowEmpty
            value={filters.documentTypeId ?? ""}
            onChange={(documentTypeId) => patch({ documentTypeId })}
            options={[
              ...DOCUMENT_TYPES,
              { id: CUSTOM_TYPE_ID, symbol: "…", label: "Others" },
            ]}
            placeholder="Any"
          />
        </Field>
        {filters.documentTypeId === CUSTOM_TYPE_ID ? (
          <>
            <Field label="Document Type">
              <Input
                value={filters.customDocumentType}
                onChange={(event) => patch({ customDocumentType: event.target.value })}
                placeholder="Name contains"
                className="h-10"
              />
            </Field>
            <Field label="Symbol">
              <Input
                value={filters.customSymbol}
                onChange={(event) => patch({ customSymbol: event.target.value })}
                placeholder="Exact symbol"
                className="h-10 font-mono"
              />
            </Field>
          </>
        ) : null}
        <Field label="Department">
          <FieldSelect
            allowEmpty
            value={filters.departmentId ?? ""}
            onChange={(departmentId) => patch({ departmentId })}
            options={DEPARTMENTS}
            placeholder="Any"
          />
        </Field>
        <Field label="Section">
          <FieldSelect
            allowEmpty
            value={filters.sectionId ?? ""}
            onChange={(sectionId) => patch({ sectionId })}
            options={SECTIONS}
            placeholder="Any"
          />
        </Field>
        <Field label="Subsection">
          <FieldSelect
            allowEmpty
            value={filters.subsectionId ?? ""}
            onChange={(subsectionId) => patch({ subsectionId })}
            options={SUBSECTIONS}
            placeholder="Any"
          />
        </Field>
        <Field label="Line">
          <FieldSelect
            allowEmpty
            value={filters.lineId ?? ""}
            onChange={(lineId) => patch({ lineId })}
            options={LINES}
            placeholder="Any"
          />
        </Field>
        <Field label="Model">
          <FieldSelect
            allowEmpty
            value={filters.modelId ?? ""}
            onChange={(modelId) => patch({ modelId })}
            options={MODELS}
            placeholder="Any"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Serial Number">
            <Input
              inputMode="numeric"
              value={filters.serial}
              onChange={(event) =>
                patch({ serial: event.target.value.replace(/\D/g, "").slice(0, 4) })
              }
              className="h-10 font-mono"
            />
          </Field>
          <Field label="Version">
            <Input
              inputMode="numeric"
              value={filters.version}
              onChange={(event) =>
                patch({ version: event.target.value.replace(/\D/g, "").slice(0, 3) })
              }
              className="h-10 font-mono"
            />
          </Field>
        </div>
        <Field label="Concern Name">
          <Input
            value={filters.concernName}
            onChange={(event) => patch({ concernName: event.target.value })}
            className="h-10"
          />
        </Field>
        <Field label="Employee ID">
          <Input
            value={filters.employeeId}
            onChange={(event) => patch({ employeeId: event.target.value })}
            className="h-10"
          />
        </Field>
        <Field label="Date">
          <DateField
            value={filters.date ?? ""}
            onChange={(date) => patch({ date })}
            placeholder="Any date"
          />
          {filters.date ? (
            <button
              type="button"
              className="w-fit text-xs text-muted-foreground underline-offset-2 hover:underline"
              onClick={() => patch({ date: "" })}
            >
              Clear date
            </button>
          ) : null}
        </Field>
        <div className="flex gap-2 pt-1">
          <Button type="submit" disabled={loading} className="h-10 px-4">
            {loading ? "Searching…" : "Search"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setFilters(EMPTY);
              setCategory("all");
              void runSearch(EMPTY);
            }}
          >
            Clear
          </Button>
        </div>
      </form>

      <section className="min-w-0">
        <div className="flex gap-1 overflow-x-auto pb-3">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-2 rounded-md border px-3 text-sm",
                category === item.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
              <span className="font-mono text-xs">{counts[item.id] ?? 0}</span>
            </button>
          ))}
        </div>
        {warnings.map((warning) => (
          <p key={warning} className="mb-3 text-sm text-destructive">
            {warning}
          </p>
        ))}
        {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
        {!ready || (loading && documents.length === 0) ? (
          <p className="py-16 text-sm text-muted-foreground">Reading the servers…</p>
        ) : servers.length === 0 ? (
          <div className="plate rounded-xl border border-border px-5 py-10">
            <h2 className="text-lg font-medium">No server is connected</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Browse to the folder on this machine that holds the plant records. Add a second server with the plus button when you need one.
            </p>
            <Button type="button" className="mt-5" onClick={() => setBrowserOpen(true)}>
              Connect to Server
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <div className="plate rounded-xl border border-border px-5 py-10">
            <h2 className="text-lg font-medium">No documents match these fields</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Clear a field, or connect the server where the file was filed.
            </p>
          </div>
        ) : (
          <ul className="grid gap-2">
            {visible.map((doc) => (
              <li
                key={`${doc.serverId}-${doc.recordNo}`}
                className="rounded-xl border border-border bg-card/70 px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-sm break-all text-primary">{doc.fileName}</p>
                    <p className="mt-1 text-sm">{doc.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {doc.documentType.label} · {doc.department.label} · {doc.line.label} ·{" "}
                      {doc.model.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {doc.concernName} · {doc.employeeId} · {doc.date} · {doc.serverName} ·{" "}
                      {categoryLabel(doc.category)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => setViewing(doc)}>
                      <EyeIcon />
                      View
                    </Button>
                    <a
                      className={buttonVariants({ size: "sm" })}
                      href={`/api/documents/file?serverId=${encodeURIComponent(doc.serverId)}&recordNo=${encodeURIComponent(doc.recordNo)}&download=1`}
                    >
                      Save
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <FolderBrowser
        open={browserOpen}
        onOpenChange={setBrowserOpen}
        onConnected={(server) => {
          remember(server);
          void runSearch(filters);
        }}
      />
      <FileViewer document={viewing} onClose={() => setViewing(null)} />
    </div>
  );
}
