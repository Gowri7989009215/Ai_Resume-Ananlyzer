import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "@/lib/parser";
import { scoreResume } from "@/lib/scorer";
import { MAX_FILE_SIZE_BYTES } from "@/lib/constants";
import { pdfParse } from "@/lib/pdf-helper";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("resume") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No resume file uploaded" },
                { status: 400 }
            );
        }

        if (file.type !== "application/pdf") {
            return NextResponse.json(
                { error: "Only PDF files are accepted" },
                { status: 400 }
            );
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json(
                { error: `File size must be under 5MB. Current size: ${(file.size / (1024 * 1024)).toFixed(1)}MB` },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse PDF text via the native-require helper
        const pdfData = await pdfParse(buffer);
        const rawText = pdfData.text;

        if (!rawText || rawText.trim().length < 50) {
            return NextResponse.json(
                { error: "Could not extract text from PDF. Please ensure it is a text-based (not scanned) PDF." },
                { status: 422 }
            );
        }

        // Parse and score
        const extractedData = parseResume(rawText);
        const analysisResult = scoreResume(extractedData);

        // Increment the global upload counter (fire-and-forget)
        fetch(`${req.nextUrl.origin}/api/counter`, { method: "POST" }).catch(() => {});

        return NextResponse.json(analysisResult, { status: 200 });
    } catch (error: unknown) {
        console.error("[/api/analyze] Error:", error);
        const message =
            error instanceof Error ? error.message : "An unexpected error occurred";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
