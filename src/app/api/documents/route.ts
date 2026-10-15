import { connection } from "next/server";
import { buildDocument, DocumentError } from "@/lib/record";
import { saveDocument, searchDocuments } from "@/lib/store";
import { MAX_UPLOAD_BYTES, type SaveInput, type SearchQuery } from "@/lib/types";

function queryFrom(url: URL): SearchQuery {
  const get = (key: string) => url.searchParams.get(key)?.trim() || undefined;
  return {
    title: get("title"),
    documentTypeId: get("documentTypeId"),
    customSymbol: get("customSymbol"),
    customDocumentType: get("customDocumentType"),
    departmentId: get("departmentId"),
    sectionId: get("sectionId"),
    subsectionId: get("subsectionId"),
    lineId: get("lineId"),
    modelId: get("modelId"),
    serial: get("serial"),
    version: get("version"),
    concernName: get("concernName"),
    employeeId: get("employeeId"),
    date: get("date"),
  };
}

export async function GET(request: Request) {
  await connection();
  try {
    const result = await searchDocuments(queryFrom(new URL(request.url)));
    return Response.json(result);
  } catch (error) {
    if (error instanceof DocumentError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json({ error: "The archive could not be read." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const serverId = String(form.get("serverId") ?? "");
    const file = form.get("file");
    const raw = String(form.get("payload") ?? "");
    if (!(file instanceof File)) {
      return Response.json({ error: "Choose a file to upload." }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return Response.json(
        { error: "This file is larger than 80 MB." },
        { status: 400 },
      );
    }
    let payload: SaveInput;
    try {
      payload = JSON.parse(raw) as SaveInput;
    } catch {
      return Response.json({ error: "The record details are incomplete." }, { status: 400 });
    }
    const meta = buildDocument(
      {
        ...payload,
        originalFileName: file.name,
        size: file.size,
      },
      new Date().toISOString(),
    );
    const bytes = Buffer.from(await file.arrayBuffer());
    const document = await saveDocument(serverId, meta, bytes);
    return Response.json({ document }, { status: 201 });
  } catch (error) {
    if (error instanceof DocumentError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json({ error: "The file could not be filed." }, { status: 500 });
  }
}
