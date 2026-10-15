export type FileCategory = "pdf" | "image" | "word" | "excel" | "other";

export type CatalogRef = {
  id: string;
  symbol: string;
  label: string;
};

export type DocumentMeta = {
  title: string;
  documentType: CatalogRef;
  department: CatalogRef;
  section: CatalogRef;
  subsection: CatalogRef;
  line: CatalogRef;
  model: CatalogRef;
  serialNumber: string;
  version: string;
  concernName: string;
  employeeId: string;
  date: string;
  recordNo: string;
  fileName: string;
  jsonName: string;
  originalFileName: string;
  extension: string;
  category: FileCategory;
  size: number;
  savedAt: string;
};

export type IndexedDocument = DocumentMeta & {
  serverId: string;
  serverName: string;
};

export type ServerRecord = {
  id: string;
  name: string;
  path: string;
};

export type SaveInput = {
  title: string;
  documentTypeId: string;
  customDocumentType?: string;
  customSymbol?: string;
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
  originalFileName: string;
  size: number;
};

export type SearchQuery = {
  title?: string;
  documentTypeId?: string;
  customSymbol?: string;
  customDocumentType?: string;
  departmentId?: string;
  sectionId?: string;
  subsectionId?: string;
  lineId?: string;
  modelId?: string;
  serial?: string;
  version?: string;
  concernName?: string;
  employeeId?: string;
  date?: string;
};

export const DUPLICATE_MESSAGE =
  "This file is already saved in your designated location";

export const MAX_UPLOAD_BYTES = 80 * 1024 * 1024;
