"use client";

import {
  CUSTOM_TYPE_ID,
  DEPARTMENTS,
  DOCUMENT_TYPES,
  LINES,
  MODELS,
  PLANT_CODE,
  SECTIONS,
  SUBSECTIONS,
  findOption,
  type SopOption,
} from "@/lib/sop";
import { previewRecordNo } from "@/lib/record";
import { cn } from "@/lib/utils";

export type NameplateInput = {
  documentTypeId: string;
  customSymbol: string;
  departmentId: string;
  sectionId: string;
  subsectionId: string;
  lineId: string;
  modelId: string;
  serial: string;
  version: string;
  extension: string;
};

function padField(value: string, length: number): string {
  const digits = value.replace(/\D/g, "").slice(0, length);
  return digits ? digits.padStart(length, "0") : "";
}

function symbolFor(list: SopOption[], id: string): string {
  return findOption(list, id)?.symbol ?? "";
}

export function nameFromFields(input: NameplateInput) {
  const documentTypeSymbol =
    input.documentTypeId === CUSTOM_TYPE_ID
      ? input.customSymbol.trim()
      : symbolFor(DOCUMENT_TYPES, input.documentTypeId);
  return previewRecordNo({
    documentTypeSymbol,
    departmentSymbol: symbolFor(DEPARTMENTS, input.departmentId),
    sectionSymbol: symbolFor(SECTIONS, input.sectionId),
    subsectionSymbol: symbolFor(SUBSECTIONS, input.subsectionId),
    lineSymbol: symbolFor(LINES, input.lineId),
    modelSymbol: symbolFor(MODELS, input.modelId),
    serial: input.serial,
    version: input.version,
  });
}

export function Nameplate({
  fields,
  session,
}: {
  fields: NameplateInput;
  session: { fileName: string; serverName: string }[];
}) {
  const preview = nameFromFields(fields);
  const fileName =
    preview.complete && fields.extension
      ? `${preview.text}.${fields.extension}`
      : preview.text;

  const segments: { label: string; value: string; locked?: boolean }[] = [
    {
      label: "Type",
      value:
        fields.documentTypeId === CUSTOM_TYPE_ID
          ? fields.customSymbol.trim()
          : symbolFor(DOCUMENT_TYPES, fields.documentTypeId),
    },
    { label: "HQ", value: PLANT_CODE.headquarter.symbol, locked: true },
    { label: "Hi-Tech", value: PLANT_CODE.hiTech.symbol, locked: true },
    { label: "Plant", value: PLANT_CODE.compressor.symbol, locked: true },
    { label: "Dept", value: symbolFor(DEPARTMENTS, fields.departmentId) },
    { label: "Sec", value: symbolFor(SECTIONS, fields.sectionId) },
    { label: "Sub", value: symbolFor(SUBSECTIONS, fields.subsectionId) },
    { label: "Line", value: symbolFor(LINES, fields.lineId) },
    { label: "Model", value: symbolFor(MODELS, fields.modelId) },
    {
      label: "Serial",
      value: padField(fields.serial, 4),
    },
    {
      label: "Ver",
      value: padField(fields.version, 3),
    },
  ];

  return (
    <aside className="plate rounded-xl border border-border p-4 sm:p-5">
      <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
        Record number
      </p>
      <p
        className={cn(
          "mt-2 font-mono text-lg leading-snug break-all sm:text-xl",
          preview.complete ? "text-primary" : "text-foreground",
        )}
      >
        {fileName}
      </p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Built as each field is set. The title stays out of the file name.
      </p>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {segments.map((segment) => (
          <div key={segment.label} className="min-w-0 rounded-md bg-background/50 px-2 py-1.5">
            <div className="text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
              {segment.label}
            </div>
            <div
              className={cn(
                "truncate font-mono text-sm",
                segment.value ? "text-foreground" : "text-muted-foreground",
                segment.locked && "text-primary",
              )}
            >
              {segment.value || "—"}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 border-t border-border pt-4">
        <p className="text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          Filed this session
        </p>
        {session.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Files appear here as they are saved.
          </p>
        ) : (
          <ul className="mt-2 grid gap-2">
            {session.map((file) => (
              <li key={`${file.serverName}-${file.fileName}`} className="min-w-0">
                <p className="truncate font-mono text-xs text-foreground">{file.fileName}</p>
                <p className="truncate text-[11px] text-muted-foreground">{file.serverName}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
