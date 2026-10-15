import { CUSTOM_TYPE_ID } from "@/lib/sop";
import type { DocumentMeta, SearchQuery } from "@/lib/types";

function includes(value: string, query?: string): boolean {
  const needle = query?.trim().toLowerCase();
  if (!needle) return true;
  return value.toLowerCase().includes(needle);
}

function padded(value: string | undefined, length: number): string | null {
  if (!value?.trim()) return null;
  const digits = value.replace(/\D/g, "");
  if (!digits || digits.length > length) return "";
  return digits.padStart(length, "0");
}

export function matchesDocument(doc: DocumentMeta, query: SearchQuery): boolean {
  if (!includes(doc.title, query.title)) return false;
  if (!includes(doc.concernName, query.concernName)) return false;
  if (!includes(doc.employeeId, query.employeeId)) return false;
  if (query.date && doc.date !== query.date) return false;

  if (query.documentTypeId === CUSTOM_TYPE_ID) {
    if (doc.documentType.id !== CUSTOM_TYPE_ID) return false;
    const symbol = query.customSymbol?.trim();
    if (symbol && doc.documentType.symbol !== symbol) return false;
    if (!includes(doc.documentType.label, query.customDocumentType)) return false;
  } else if (query.documentTypeId && doc.documentType.id !== query.documentTypeId) {
    return false;
  }

  if (query.departmentId && doc.department.id !== query.departmentId) return false;
  if (query.sectionId && doc.section.id !== query.sectionId) return false;
  if (query.subsectionId && doc.subsection.id !== query.subsectionId) return false;
  if (query.lineId && doc.line.id !== query.lineId) return false;
  if (query.modelId && doc.model.id !== query.modelId) return false;

  const serial = padded(query.serial, 4);
  if (serial === "") return false;
  if (serial && doc.serialNumber !== serial) return false;

  const version = padded(query.version, 3);
  if (version === "") return false;
  if (version && doc.version !== version) return false;

  return true;
}
