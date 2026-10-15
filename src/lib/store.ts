import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { DocumentError } from "@/lib/record";
import { matchesDocument } from "@/lib/search";
import {
  DUPLICATE_MESSAGE,
  type DocumentMeta,
  type IndexedDocument,
  type SearchQuery,
  type ServerRecord,
} from "@/lib/types";

const BLOCKED = new Set([
  "/",
  "/bin",
  "/boot",
  "/dev",
  "/etc",
  "/lib",
  "/lib64",
  "/proc",
  "/root",
  "/run",
  "/sbin",
  "/sys",
  "/usr",
  "/var",
  "/home",
  "/opt",
  "/workspace",
]);

const HIDDEN = new Set(["node_modules", ".next", ".git"]);

const RECORD_RE = /^[A-Za-z0-9_-]{4,80}$/;

export type BrowseEntry = { name: string; path: string };

export type BrowseResult = {
  path: string;
  parent: string | null;
  canSelect: boolean;
  entries: BrowseEntry[];
};

function dataFile(): string {
  return path.join(process.cwd(), "data", "connections.json");
}

function isBlocked(dir: string): boolean {
  if (BLOCKED.has(dir)) return true;
  return /^[A-Za-z]:\\?$/.test(dir);
}

function inside(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  );
}

async function resolveDir(input: string): Promise<string> {
  if (!input || input.includes("\0")) {
    throw new DocumentError("Choose a folder.");
  }
  let resolved: string;
  try {
    resolved = await fs.realpath(path.resolve(input));
  } catch {
    throw new DocumentError("That folder cannot be opened.");
  }
  const stat = await fs.stat(resolved);
  if (!stat.isDirectory()) throw new DocumentError("That path is not a folder.");
  return resolved;
}

async function defaultStart(): Promise<string> {
  const preferred =
    process.env.DMS_BROWSE_START || path.join(process.cwd(), "plant-servers");
  try {
    const stat = await fs.stat(preferred);
    if (stat.isDirectory()) return preferred;
  } catch {
    /* use the application directory */
  }
  return process.cwd();
}

export async function readConnections(): Promise<ServerRecord[]> {
  try {
    const raw = await fs.readFile(dataFile(), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ServerRecord => {
      if (!item || typeof item !== "object") return false;
      const row = item as Partial<ServerRecord>;
      return (
        typeof row.id === "string" &&
        typeof row.name === "string" &&
        typeof row.path === "string"
      );
    });
  } catch {
    return [];
  }
}

async function writeConnections(servers: ServerRecord[]): Promise<void> {
  const file = dataFile();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp`;
  await fs.writeFile(temp, JSON.stringify(servers, null, 2));
  await fs.rename(temp, file);
}

export async function browse(inputPath?: string | null): Promise<BrowseResult> {
  const start =
    inputPath && inputPath.trim().length > 0 ? inputPath : await defaultStart();
  const resolved = await resolveDir(start);
  const parent = path.dirname(resolved);
  let dirents;
  try {
    dirents = await fs.readdir(resolved, { withFileTypes: true });
  } catch {
    throw new DocumentError("This folder cannot be opened.");
  }
  const entries = dirents
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        !HIDDEN.has(entry.name),
    )
    .map((entry) => ({
      name: entry.name,
      path: path.join(resolved, entry.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return {
    path: resolved,
    parent: parent === resolved ? null : parent,
    canSelect: !isBlocked(resolved),
    entries,
  };
}

export async function connectServer(inputPath: string): Promise<ServerRecord> {
  const resolved = await resolveDir(inputPath);
  if (isBlocked(resolved)) {
    throw new DocumentError(
      "Choose a folder inside this location, not the drive itself.",
    );
  }
  const servers = await readConnections();
  if (servers.some((server) => server.path === resolved)) {
    throw new DocumentError("This server is already connected.");
  }
  const server: ServerRecord = {
    id: randomBytes(8).toString("hex"),
    name: path.basename(resolved) || resolved,
    path: resolved,
  };
  servers.push(server);
  await writeConnections(servers);
  return server;
}

export async function disconnectServer(id: string): Promise<void> {
  const servers = await readConnections();
  const next = servers.filter((server) => server.id !== id);
  if (next.length === servers.length) {
    throw new DocumentError("That server is not connected.", 404);
  }
  await writeConnections(next);
}

export async function requireServer(id: string): Promise<ServerRecord> {
  const servers = await readConnections();
  const server = servers.find((item) => item.id === id);
  if (!server) throw new DocumentError("Connect a server before filing.", 404);
  try {
    const resolved = await fs.realpath(server.path);
    const stat = await fs.stat(resolved);
    if (!stat.isDirectory()) throw new Error("missing");
    return { ...server, path: resolved };
  } catch {
    throw new DocumentError(
      `${server.name} is not available. Connect it again.`,
      404,
    );
  }
}

function asMeta(value: unknown): DocumentMeta | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<DocumentMeta>;
  if (typeof row.recordNo !== "string" || typeof row.fileName !== "string") {
    return null;
  }
  if (!RECORD_RE.test(row.recordNo)) return null;
  if (
    row.fileName.includes("/") ||
    row.fileName.includes("\\") ||
    row.fileName.includes("..")
  ) {
    return null;
  }
  return row as DocumentMeta;
}

async function readMetaFile(root: string, jsonName: string): Promise<DocumentMeta | null> {
  try {
    const stat = await fs.stat(path.join(root, jsonName));
    if (!stat.isFile() || stat.size > 1024 * 1024) return null;
    const raw = await fs.readFile(path.join(root, jsonName), "utf8");
    return asMeta(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function listServerDocuments(
  server: ServerRecord,
): Promise<IndexedDocument[]> {
  let names: string[];
  try {
    names = await fs.readdir(server.path);
  } catch {
    throw new DocumentError(`${server.name} cannot be read.`, 404);
  }
  const documents: IndexedDocument[] = [];
  for (const name of names) {
    if (!name.endsWith(".json")) continue;
    const meta = await readMetaFile(server.path, name);
    if (!meta) continue;
    documents.push({
      ...meta,
      serverId: server.id,
      serverName: server.name,
    });
  }
  documents.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  return documents;
}

export async function searchDocuments(
  query: SearchQuery,
): Promise<{ documents: IndexedDocument[]; warnings: string[] }> {
  const servers = await readConnections();
  const documents: IndexedDocument[] = [];
  const warnings: string[] = [];
  for (const server of servers) {
    try {
      const live = await requireServer(server.id);
      const rows = await listServerDocuments(live);
      for (const row of rows) {
        if (matchesDocument(row, query)) documents.push(row);
      }
    } catch {
      warnings.push(`${server.name} cannot be read.`);
    }
  }
  documents.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  return { documents, warnings };
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function writeNew(filePath: string, data: Buffer | string): Promise<void> {
  const handle = await fs.open(filePath, "wx");
  try {
    await handle.writeFile(data);
  } finally {
    await handle.close();
  }
}

export async function saveDocument(
  serverId: string,
  meta: DocumentMeta,
  bytes: Buffer,
): Promise<IndexedDocument> {
  const server = await requireServer(serverId);
  const root = server.path;
  const filePath = path.resolve(root, meta.fileName);
  const jsonPath = path.resolve(root, meta.jsonName);
  if (!inside(root, filePath) || !inside(root, jsonPath)) {
    throw new DocumentError("The record name is not valid.");
  }

  const names = await fs.readdir(root);
  const taken = names.some(
    (name) =>
      name === meta.fileName ||
      name === meta.jsonName ||
      name === meta.recordNo ||
      name.startsWith(`${meta.recordNo}.`),
  );
  if (taken || (await exists(filePath)) || (await exists(jsonPath))) {
    throw new DocumentError(DUPLICATE_MESSAGE, 409);
  }

  const stored: IndexedDocument = {
    ...meta,
    serverId: server.id,
    serverName: server.name,
  };

  try {
    await writeNew(filePath, bytes);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new DocumentError(DUPLICATE_MESSAGE, 409);
    }
    throw error;
  }

  try {
    await writeNew(jsonPath, JSON.stringify(stored, null, 2));
  } catch (error) {
    await fs.rm(filePath, { force: true });
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new DocumentError(DUPLICATE_MESSAGE, 409);
    }
    throw error;
  }

  return stored;
}

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  svg: "image/svg+xml",
  tif: "image/tiff",
  tiff: "image/tiff",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  rtf: "application/rtf",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xlsm: "application/vnd.ms-excel.sheet.macroEnabled.12",
  csv: "text/csv",
  txt: "text/plain",
  json: "application/json",
  md: "text/markdown",
};

export function contentTypeFor(extension: string): string {
  return MIME[extension] ?? "application/octet-stream";
}

export async function readStoredFile(
  serverId: string,
  recordNo: string,
): Promise<{ document: IndexedDocument; bytes: Buffer }> {
  if (!RECORD_RE.test(recordNo)) {
    throw new DocumentError("That record was not found.", 404);
  }
  const server = await requireServer(serverId);
  const meta = await readMetaFile(server.path, `${recordNo}.json`);
  if (!meta) throw new DocumentError("That record was not found.", 404);
  const filePath = path.resolve(server.path, meta.fileName);
  if (!inside(server.path, filePath)) {
    throw new DocumentError("That record was not found.", 404);
  }
  try {
    const bytes = await fs.readFile(filePath);
    return {
      bytes,
      document: { ...meta, serverId: server.id, serverName: server.name },
    };
  } catch {
    throw new DocumentError("The file is missing from the server.", 404);
  }
}
