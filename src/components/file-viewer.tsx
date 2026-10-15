"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { DownloadIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBytes } from "@/lib/record";
import type { IndexedDocument } from "@/lib/types";
import { cn } from "@/lib/utils";

const TEXT = new Set(["txt", "md", "log", "json"]);

export function FileViewer({
  document,
  onClose,
}: {
  document: IndexedDocument | null;
  onClose: () => void;
}) {
  const open = document !== null;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="flex max-h-[88vh] flex-col gap-3 overflow-hidden sm:max-w-5xl">
        {document ? <ViewerBody document={document} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function ViewerBody({ document }: { document: IndexedDocument }) {
  const fileUrl = `/api/documents/file?serverId=${encodeURIComponent(document.serverId)}&recordNo=${encodeURIComponent(document.recordNo)}`;
  const downloadUrl = `${fileUrl}&download=1`;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="pr-8 font-mono text-sm leading-6 break-all sm:text-base">
          {document.fileName}
        </DialogTitle>
        <DialogDescription className="text-foreground">
          {document.title}
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>{document.serverName}</span>
        <span>{document.date}</span>
        <span>
          {document.concernName} · {document.employeeId}
        </span>
        <span>{formatBytes(document.size)}</span>
        <a
          href={downloadUrl}
          className={cn(buttonVariants({ size: "sm" }), "ml-auto")}
        >
          <DownloadIcon />
          Save
        </a>
      </div>
      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-border bg-background">
        <Preview document={document} fileUrl={fileUrl} />
      </div>
    </>
  );
}

function Preview({
  document,
  fileUrl,
}: {
  document: IndexedDocument;
  fileUrl: string;
}) {
  if (document.category === "pdf") {
    return <iframe title={document.fileName} src={fileUrl} className="h-[65vh] w-full bg-white" />;
  }
  if (document.category === "image") {
    return (
      <div className="flex min-h-64 items-center justify-center p-4">
        {/* User files are served from the connected plant folder. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fileUrl} alt={document.title} className="max-h-[65vh] max-w-full object-contain" />
      </div>
    );
  }
  return <RichPreview document={document} fileUrl={fileUrl} />;
}

function RichPreview({
  document,
  fileUrl,
}: {
  document: IndexedDocument;
  fileUrl: string;
}) {
  const [state, setState] = useState<
    | { kind: "loading" }
    | { kind: "html"; html: string }
    | { kind: "table"; sheets: { name: string; rows: string[][] }[]; active: number }
    | { kind: "text"; text: string }
    | { kind: "message"; text: string }
  >({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setState({ kind: "loading" });
      try {
        if (document.category === "word" && document.extension !== "docx") {
          setState({
            kind: "message",
            text: "Preview is available for DOCX. Save the file to open this Word document.",
          });
          return;
        }
        const response = await fetch(fileUrl, { cache: "no-store" });
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error || "The file could not be opened.");
        }
        if (document.category === "word") {
          const mammoth = await import("mammoth");
          const result = await mammoth.convertToHtml({
            arrayBuffer: await response.arrayBuffer(),
          });
          if (!cancelled) {
            setState({
              kind: "html",
              html: DOMPurify.sanitize(result.value),
            });
          }
          return;
        }
        if (document.category === "excel") {
          const XLSX = await import("xlsx");
          const workbook = XLSX.read(await response.arrayBuffer(), { type: "array" });
          const sheets = workbook.SheetNames.map((name) => {
            const grid = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
              workbook.Sheets[name],
              { header: 1, raw: false, blankrows: false },
            );
            const rows = grid.slice(0, 200).map((row) =>
              (row ?? []).slice(0, 16).map((cell) =>
                cell === null || cell === undefined ? "" : String(cell).slice(0, 200),
              ),
            );
            return { name, rows };
          });
          if (!cancelled) setState({ kind: "table", sheets, active: 0 });
          return;
        }
        if (TEXT.has(document.extension) && document.size < 1_000_000) {
          const text = await response.text();
          if (!cancelled) setState({ kind: "text", text: text.slice(0, 200_000) });
          return;
        }
        if (!cancelled) {
          setState({
            kind: "message",
            text: "Preview is not available for this file type. Save it to open the original.",
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            kind: "message",
            text: error instanceof Error ? error.message : "The file could not be opened.",
          });
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [document, fileUrl]);

  if (state.kind === "loading") {
    return <p className="p-6 text-sm text-muted-foreground">Opening the file…</p>;
  }
  if (state.kind === "message") {
    return <p className="p-6 text-sm text-muted-foreground">{state.text}</p>;
  }
  if (state.kind === "text") {
    return (
      <pre className="p-4 font-mono text-xs leading-5 whitespace-pre-wrap">{state.text}</pre>
    );
  }
  if (state.kind === "html") {
    return (
      <div
        className="prose-preview p-5 text-sm leading-6"
        dangerouslySetInnerHTML={{ __html: state.html }}
      />
    );
  }
  const sheet = state.sheets[state.active];
  return (
    <div>
      {state.sheets.length > 1 ? (
        <div className="flex gap-1 overflow-x-auto border-b border-border p-2">
          {state.sheets.map((item, index) => (
            <Button
              key={item.name}
              type="button"
              size="sm"
              variant={index === state.active ? "default" : "ghost"}
              onClick={() => setState({ ...state, active: index })}
            >
              {item.name}
            </Button>
          ))}
        </div>
      ) : null}
      {sheet && sheet.rows.length > 0 ? (
        <div className="overflow-auto">
          <table className="w-full border-collapse text-left text-xs">
            <tbody>
              {sheet.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-2 py-1.5 align-top whitespace-nowrap">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="p-6 text-sm text-muted-foreground">This sheet is empty.</p>
      )}
    </div>
  );
}
