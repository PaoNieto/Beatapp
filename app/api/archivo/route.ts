import { NextRequest, NextResponse } from "next/server";
import { getArchivoUrl } from "@/lib/archivos";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "missing path" }, { status: 400 });
  }
  const url = await getArchivoUrl(path);
  if (!url) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.redirect(url, 302);
}
