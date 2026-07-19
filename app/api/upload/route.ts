import { NextResponse } from "next/server";
import { saveFile } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file was included in the request." },
        { status: 400 }
      );
    }

    const stored = await saveFile(file);
    return NextResponse.json(stored);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed. Try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}