import { connection } from "next/server";
import { DocumentError } from "@/lib/record";
import { contentTypeFor, readStoredFile } from "@/lib/store";

export async function GET(request: Request) {
  await connection();
  const url = new URL(request.url);
  const serverId = url.searchParams.get("serverId") ?? "";
  const recordNo = url.searchParams.get("recordNo") ?? "";
  const download = url.searchParams.get("download") === "1";
  try {
    const { document, bytes } = await readStoredFile(serverId, recordNo);
    const type = contentTypeFor(document.extension);
    const disposition = download ? "attachment" : "inline";
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": type,
        "Content-Length": String(bytes.length),
        "Content-Disposition": `${disposition}; filename="${document.fileName}"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof DocumentError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json({ error: "The file could not be opened." }, { status: 500 });
  }
}
