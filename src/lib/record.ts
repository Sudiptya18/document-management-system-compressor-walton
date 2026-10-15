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
} from "@/lib/sop";
import type { CatalogRef, DocumentMeta, FileCategory, SaveInput } from "@/lib/types";

export class DocumentError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "DocumentError";
    this.status = status;
  }
}

const SYMBOL_RE = /^[A-Za-z0-9_-]{1,12}$/;

const IMAGE = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "bmp",
  "svg",
  "tif",
  "tiff",
  "heic",
  "heif",
]);
const WORD = new Set(["doc", "docx", "rtf"]);
const EXCEL = new Set(["xls", "xlsx", "xlsm", "csv"]);

export function fileExtension(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? name;
  const dot = base.lastIndexOf(".");
  if (dot <= 0) return "";
  const ext = base.slice(dot + 1).toLowerCase();
  return /^[a-z0-9]{1,8}$/.test(ext) ? ext : "";
}

export function categoryFor(extension: string): FileCategory {
  if (extension === "pdf") return "pdf";
  if (IMAGE.has(extension)) return "image";
  if (WORD.has(extension)) return "word";
  if (EXCEL.has(extension)) return "excel";
  return "other";
}

export function categoryLabel(category: FileCategory): string {
  switch (category) {
    case "pdf":
      return "PDF";
    case "image":
      return "Image";
    case "word":
      return "Word";
    case "excel":
      return "Excel";
    default:
      return "Other";
  }
}

export function buildRecordNo(parts: {
  documentTypeSymbol: string;
  departmentSymbol: string;
  sectionSymbol: string;
  subsectionSymbol: string;
  lineSymbol: string;
  modelSymbol: string;
  serialNumber: string;
  version: string;
}): string {
  return (
    parts.documentTypeSymbol +
    PLANT_CODE.headquarter.symbol +
    PLANT_CODE.hiTech.symbol +
    PLANT_CODE.compressor.symbol +
    parts.departmentSymbol +
    parts.sectionSymbol +
    parts.subsectionSymbol +
    parts.lineSymbol +
    parts.modelSymbol +
    parts.serialNumber +
    "_" +
    parts.version
  );
}

export function previewRecordNo(parts: {
  documentTypeSymbol?: string;
  departmentSymbol?: string;
  sectionSymbol?: string;
  subsectionSymbol?: string;
  lineSymbol?: string;
  modelSymbol?: string;
  serial?: string;
  version?: string;
}): { text: string; complete: boolean } {
  const serialDigits = (parts.serial ?? "").replace(/\D/g, "").slice(0, 4);
  const versionDigits = (parts.version ?? "").replace(/\D/g, "").slice(0, 3);
  const serial = serialDigits ? serialDigits.padStart(4, "0") : "";
  const version = versionDigits ? versionDigits.padStart(3, "0") : "";
  const symbols = [
    parts.documentTypeSymbol ?? "",
    PLANT_CODE.headquarter.symbol,
    PLANT_CODE.hiTech.symbol,
    PLANT_CODE.compressor.symbol,
    parts.departmentSymbol ?? "",
    parts.sectionSymbol ?? "",
    parts.subsectionSymbol ?? "",
    parts.lineSymbol ?? "",
    parts.modelSymbol ?? "",
  ];
  const complete =
    symbols.every((symbol) => symbol.length > 0) &&
    serial.length === 4 &&
    version.length === 3;
  const head = symbols.map((symbol) => symbol || "·").join("");
  return {
    complete,
    text: `${head}${serial || "····"}_${version || "···"}`,
  };
}

function requireCatalog(
  list: { id: string; symbol: string; label: string }[],
  id: string,
  message: string,
): CatalogRef {
  const found = findOption(list, id);
  if (!found) throw new DocumentError(message);
  return { id: found.id, symbol: found.symbol, label: found.label };
}

function requirePadded(value: string, length: number, message: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits || digits.length > length) throw new DocumentError(message);
  return digits.padStart(length, "0");
}

function cleanText(value: string, max: number, emptyMessage: string): string {
  const text = value.trim().replace(/\s+/g, " ");
  if (!text) throw new DocumentError(emptyMessage);
  if (text.length > max) {
    throw new DocumentError(`Use ${max} characters or fewer.`);
  }
  return text;
}

export function buildDocument(input: SaveInput, savedAt: string): DocumentMeta {
  const title = cleanText(input.title, 200, "Enter a title.");
  let documentType: CatalogRef;
  if (input.documentTypeId === CUSTOM_TYPE_ID) {
    const label = cleanText(
      input.customDocumentType ?? "",
      120,
      "Enter the document type.",
    );
    const symbol = (input.customSymbol ?? "").trim();
    if (!SYMBOL_RE.test(symbol)) {
      throw new DocumentError(
        "Enter a symbol using letters, numbers, underscore, or hyphen.",
      );
    }
    documentType = { id: CUSTOM_TYPE_ID, symbol, label };
  } else {
    documentType = requireCatalog(
      DOCUMENT_TYPES,
      input.documentTypeId,
      "Choose a document type.",
    );
  }

  const department = requireCatalog(
    DEPARTMENTS,
    input.departmentId,
    "Choose a department.",
  );
  const section = requireCatalog(SECTIONS, input.sectionId, "Choose a section.");
  const subsection = requireCatalog(
    SUBSECTIONS,
    input.subsectionId,
    "Choose a subsection.",
  );
  const line = requireCatalog(LINES, input.lineId, "Choose a line.");
  const model = requireCatalog(MODELS, input.modelId, "Choose a model.");
  const serialNumber = requirePadded(
    input.serial,
    4,
    "Enter a 4-digit serial number.",
  );
  const version = requirePadded(input.version, 3, "Enter a 3-digit version.");
  const concernName = cleanText(
    input.concernName,
    120,
    "Enter the concern name.",
  );
  const employeeId = cleanText(input.employeeId, 40, "Enter the employee ID.");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new DocumentError("Choose a date.");
  }
  const [year, month, day] = input.date.split("-").map(Number);
  if (year < 1980 || year > 2100) throw new DocumentError("Choose a valid date.");
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    throw new DocumentError("Choose a valid date.");
  }

  if (!Number.isFinite(input.size) || input.size <= 0) {
    throw new DocumentError("Choose a file to upload.");
  }

  const extension = fileExtension(input.originalFileName);
  const recordNo = buildRecordNo({
    documentTypeSymbol: documentType.symbol,
    departmentSymbol: department.symbol,
    sectionSymbol: section.symbol,
    subsectionSymbol: subsection.symbol,
    lineSymbol: line.symbol,
    modelSymbol: model.symbol,
    serialNumber,
    version,
  });
  const fileName = extension ? `${recordNo}.${extension}` : recordNo;

  return {
    title,
    documentType,
    department,
    section,
    subsection,
    line,
    model,
    serialNumber,
    version,
    concernName,
    employeeId,
    date: input.date,
    recordNo,
    fileName,
    jsonName: `${recordNo}.json`,
    originalFileName: input.originalFileName.split(/[/\\]/).pop() || fileName,
    extension,
    category: categoryFor(extension),
    size: input.size,
    savedAt,
  };
}

export function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
