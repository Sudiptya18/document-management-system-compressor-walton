"use client";

import { useState } from "react";
import { FileUpIcon } from "lucide-react";
import { DateField } from "@/components/date-field";
import { Field } from "@/components/field";
import { FieldSelect } from "@/components/field-select";
import { FolderBrowser } from "@/components/folder-browser";
import { Nameplate, type NameplateInput } from "@/components/nameplate";
import { ServerBar } from "@/components/server-bar";
import { useServers } from "@/components/use-servers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { buildDocument, DocumentError, fileExtension, formatBytes } from "@/lib/record";
import {
  CUSTOM_TYPE_ID,
  DEPARTMENTS,
  DOCUMENT_TYPES,
  LINES,
  MODELS,
  SECTIONS,
  SUBSECTIONS,
} from "@/lib/sop";
import { DUPLICATE_MESSAGE, MAX_UPLOAD_BYTES, type ServerRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

type Draft = {
  title: string;
  documentTypeId: string;
  customDocumentType: string;
  customSymbol: string;
  departmentId: string;
  sectionId: string;
  subsectionId: string;
  lineId: string;
  modelId: string;
  serial: string;
  version: string;
  concernName: string;
  employeeId: string;
  date: string;
};

const EMPTY: Draft = {
  title: "",
  documentTypeId: "",
  customDocumentType: "",
  customSymbol: "",
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

export function SaveWorkspace() {
  const { servers, loading, remember, remove } = useServers();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"error" | "ok">("error");
  const [saving, setSaving] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(false);
  const [chooseOpen, setChooseOpen] = useState(false);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [session, setSession] = useState<{ fileName: string; serverName: string }[]>([]);

  function patch(partial: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...partial }));
    setMessage(null);
  }

  const plate: NameplateInput = {
    documentTypeId: draft.documentTypeId,
    customSymbol: draft.customSymbol,
    departmentId: draft.departmentId,
    sectionId: draft.sectionId,
    subsectionId: draft.subsectionId,
    lineId: draft.lineId,
    modelId: draft.modelId,
    serial: draft.serial,
    version: draft.version,
    extension: file ? fileExtension(file.name) : "",
  };

  function takeFile(next: File | null) {
    if (!next) return;
    if (next.size > MAX_UPLOAD_BYTES) {
      setTone("error");
      setMessage("This file is larger than 80 MB.");
      return;
    }
    if (next.size === 0) {
      setTone("error");
      setMessage("Choose a file to upload.");
      return;
    }
    setFile(next);
    setMessage(null);
  }

  async function fileTo(server: ServerRecord) {
    if (!file) return;
    setSaving(true);
    setChooseOpen(false);
    setTone("error");
    try {
      buildDocument(
        {
          ...draft,
          originalFileName: file.name,
          size: file.size,
        },
        new Date().toISOString(),
      );
      const body = new FormData();
      body.set("serverId", server.id);
      body.set("file", file);
      body.set(
        "payload",
        JSON.stringify({
          ...draft,
          originalFileName: file.name,
          size: file.size,
        }),
      );
      const response = await fetch("/api/documents", { method: "POST", body });
      const data = (await response.json()) as {
        error?: string;
        document?: { fileName: string; serverName: string; serialNumber: string };
      };
      if (response.status === 409) {
        setDuplicateOpen(true);
        return;
      }
      if (!response.ok || !data.document) {
        setMessage(data.error || "The file could not be filed.");
        return;
      }
      setSession((current) => [
        { fileName: data.document!.fileName, serverName: data.document!.serverName },
        ...current,
      ]);
      setFile(null);
      setFileKey((key) => key + 1);
      setDraft((current) => ({
        ...current,
        serial: bump(current.serial),
      }));
      setTone("ok");
      setMessage(`Filed ${data.document.fileName} on ${data.document.serverName}.`);
    } catch (error) {
      setMessage(
        error instanceof DocumentError ? error.message : "The file could not be filed.",
      );
    } finally {
      setSaving(false);
    }
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) {
      setTone("error");
      setMessage("Choose a file to upload.");
      return;
    }
    try {
      buildDocument(
        { ...draft, originalFileName: file.name, size: file.size },
        new Date().toISOString(),
      );
    } catch (error) {
      setTone("error");
      setMessage(error instanceof DocumentError ? error.message : "Check the fields.");
      return;
    }
    if (servers.length === 0) {
      setBrowserOpen(true);
      return;
    }
    if (servers.length > 1) {
      setChooseOpen(true);
      return;
    }
    void fileTo(servers[0]);
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:py-8">
      <form onSubmit={onSubmit} className="order-2 grid gap-4 lg:order-1">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">Save Document</h1>
          <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
            The file is stored under its SOP record number. Headquarter, Hi-Tech, and Compressor stay fixed as HHcP.
          </p>
        </div>
        <ServerBar
          servers={servers}
          loading={loading}
          onConnect={() => setBrowserOpen(true)}
          onRemove={(id) => void remove(id)}
        />
        <Field label="File">
          <label
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              takeFile(event.dataTransfer.files?.[0] ?? null);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-start gap-1 rounded-lg border border-dashed px-4 py-4",
              dragging ? "border-primary bg-accent/40" : "border-border bg-card/40",
            )}
          >
            <span className="flex items-center gap-2 text-sm">
              <FileUpIcon className="size-4 text-primary" />
              {file ? file.name : "Drop a file, or browse"}
            </span>
            <span className="text-xs text-muted-foreground">
              {file
                ? `${formatBytes(file.size)} · PDF, image, Word, Excel, or any other plant file`
                : "PDF, image, Word, Excel, or any other plant file"}
            </span>
            <input
              key={fileKey}
              type="file"
              className="sr-only"
              onChange={(event) => takeFile(event.target.files?.[0] ?? null)}
            />
          </label>
        </Field>
        <Field label="Title">
          <Input
            value={draft.title}
            onChange={(event) => patch({ title: event.target.value })}
            placeholder="Name the document in your own words"
            className="h-10"
            maxLength={200}
          />
        </Field>
        <Field
          label="Document Type"
          hint={
            draft.documentTypeId === CUSTOM_TYPE_ID
              ? "Outside the SOP list. The symbol is what enters the record number."
              : undefined
          }
        >
          <FieldSelect
            value={draft.documentTypeId}
            onChange={(documentTypeId) => patch({ documentTypeId })}
            options={[
              ...DOCUMENT_TYPES,
              { id: CUSTOM_TYPE_ID, symbol: "…", label: "Others" },
            ]}
            placeholder="Select a document type"
          />
        </Field>
        {draft.documentTypeId === CUSTOM_TYPE_ID ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Document Type">
              <Input
                value={draft.customDocumentType}
                onChange={(event) => patch({ customDocumentType: event.target.value })}
                placeholder="Type name"
                className="h-10"
                maxLength={120}
              />
            </Field>
            <Field label="Symbol">
              <Input
                value={draft.customSymbol}
                onChange={(event) => patch({ customSymbol: event.target.value })}
                placeholder="Symbol"
                className="h-10 font-mono"
                maxLength={12}
              />
            </Field>
          </div>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Department">
            <FieldSelect
              value={draft.departmentId}
              onChange={(departmentId) => patch({ departmentId })}
              options={DEPARTMENTS}
              placeholder="Select a department"
            />
          </Field>
          <Field label="Section">
            <FieldSelect
              value={draft.sectionId}
              onChange={(sectionId) => patch({ sectionId })}
              options={SECTIONS}
              placeholder="Select a section"
            />
          </Field>
          <Field label="Subsection">
            <FieldSelect
              value={draft.subsectionId}
              onChange={(subsectionId) => patch({ subsectionId })}
              options={SUBSECTIONS}
              placeholder="Select a subsection"
            />
          </Field>
          <Field label="Line">
            <FieldSelect
              value={draft.lineId}
              onChange={(lineId) => patch({ lineId })}
              options={LINES}
              placeholder="Select a line"
            />
          </Field>
          <Field label="Model">
            <FieldSelect
              value={draft.modelId}
              onChange={(modelId) => patch({ modelId })}
              options={MODELS}
              placeholder="Select a model"
            />
          </Field>
          <Field label="Serial Number (4 digits)">
            <Input
              inputMode="numeric"
              value={draft.serial}
              onChange={(event) =>
                patch({ serial: event.target.value.replace(/\D/g, "").slice(0, 4) })
              }
              onBlur={(event) => {
                const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
                patch({ serial: digits ? digits.padStart(4, "0") : "" });
              }}
              placeholder="0001"
              className="h-10 font-mono"
            />
          </Field>
          <Field label="Version (3 digits)">
            <Input
              inputMode="numeric"
              value={draft.version}
              onChange={(event) =>
                patch({ version: event.target.value.replace(/\D/g, "").slice(0, 3) })
              }
              onBlur={(event) => {
                const digits = event.target.value.replace(/\D/g, "").slice(0, 3);
                patch({ version: digits ? digits.padStart(3, "0") : "" });
              }}
              placeholder="000"
              className="h-10 font-mono"
            />
          </Field>
          <Field label="Date">
            <DateField value={draft.date} onChange={(date) => patch({ date })} />
          </Field>
          <Field label="Concern Name">
            <Input
              value={draft.concernName}
              onChange={(event) => patch({ concernName: event.target.value })}
              placeholder="Name"
              className="h-10"
              maxLength={120}
            />
          </Field>
          <Field label="Employee ID">
            <Input
              value={draft.employeeId}
              onChange={(event) => patch({ employeeId: event.target.value })}
              placeholder="ID"
              className="h-10"
              maxLength={40}
            />
          </Field>
        </div>
        {message ? (
          <p
            role="status"
            className={cn(
              "text-sm",
              tone === "ok" ? "text-primary" : "text-destructive",
            )}
          >
            {message}
          </p>
        ) : null}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving} className="h-10 px-4">
            {saving ? "Filing…" : "Save Document"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setDraft(EMPTY);
              setFile(null);
              setFileKey((key) => key + 1);
              setMessage(null);
            }}
          >
            Clear
          </Button>
        </div>
      </form>
      <div className="order-1 lg:sticky lg:top-20 lg:order-2 lg:self-start">
        <Nameplate fields={plate} session={session} />
      </div>
      <FolderBrowser
        open={browserOpen}
        onOpenChange={setBrowserOpen}
        onConnected={remember}
      />
      <Dialog open={chooseOpen} onOpenChange={setChooseOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose a server</DialogTitle>
            <DialogDescription>
              This file can be saved to more than one server. Choose where it should go.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {servers.map((server) => (
              <Button
                key={server.id}
                type="button"
                variant="outline"
                className="h-auto justify-start px-3 py-2 text-left"
                onClick={() => void fileTo(server)}
              >
                <span className="grid">
                  <span>{server.name}</span>
                  <span className="font-mono text-[11px] font-normal text-muted-foreground">
                    {server.path}
                  </span>
                </span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Already filed</DialogTitle>
            <DialogDescription className="text-base text-foreground">
              {DUPLICATE_MESSAGE}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setDuplicateOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function bump(serial: string): string {
  const digits = serial.replace(/\D/g, "");
  if (!digits) return serial;
  const next = Number(digits) + 1;
  if (next > 9999) return serial;
  return String(next).padStart(4, "0");
}
