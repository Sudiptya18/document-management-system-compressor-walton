import { connection } from "next/server";
import { DocumentError } from "@/lib/record";
import { browse } from "@/lib/store";

export async function GET(request: Request) {
  await connection();
  const path = new URL(request.url).searchParams.get("path");
  try {
    const result = await browse(path);
    return Response.json(result);
  } catch (error) {
    if (error instanceof DocumentError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json(
      { error: "This folder cannot be opened." },
      { status: 500 },
    );
  }
}
