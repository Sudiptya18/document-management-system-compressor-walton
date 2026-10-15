import { connection } from "next/server";
import { DocumentError } from "@/lib/record";
import { connectServer, disconnectServer, readConnections } from "@/lib/store";

export async function GET() {
  await connection();
  const servers = await readConnections();
  return Response.json({ servers });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { path?: string };
    if (!body.path) {
      return Response.json({ error: "Choose a folder." }, { status: 400 });
    }
    const server = await connectServer(body.path);
    return Response.json({ server }, { status: 201 });
  } catch (error) {
    if (error instanceof DocumentError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json({ error: "The server could not be connected." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  await connection();
  const id = new URL(request.url).searchParams.get("id") ?? "";
  try {
    await disconnectServer(id);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof DocumentError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json({ error: "The server could not be removed." }, { status: 500 });
  }
}
