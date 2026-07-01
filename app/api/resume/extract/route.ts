import { PDFParse } from "pdf-parse";
import { extractProfileFromResumeText } from "@/agent/profile-extractor";
import { getCurrentUser } from "@/lib/insforge-server";
import type { ProfileExtractionResponse } from "@/lib/profile-extraction";

const maximumResumeBytes = 5 * 1024 * 1024;
const minimumResumeTextLength = 80;
const maximumResumeTextLength = 50_000;

function jsonResponse(
  body: ProfileExtractionResponse,
  status: number,
): Response {
  return Response.json(body, { status });
}

function isPdf(file: File, bytes: Uint8Array): boolean {
  const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");
  const hasPdfMimeType = file.type === "application/pdf";
  const hasPdfSignature =
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d;

  return (hasPdfExtension || hasPdfMimeType) && hasPdfSignature;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return jsonResponse(
        { error: "Please sign in to extract a resume.", success: false },
        401,
      );
    }

    const formData = await request.formData();
    const resume = formData.get("resume");

    if (!(resume instanceof File)) {
      return jsonResponse(
        { error: "Select a PDF resume to extract.", success: false },
        400,
      );
    }

    if (resume.size === 0 || resume.size > maximumResumeBytes) {
      return jsonResponse(
        {
          error: "Choose a PDF resume smaller than 5MB.",
          success: false,
        },
        400,
      );
    }

    const bytes = new Uint8Array(await resume.arrayBuffer());

    if (!isPdf(resume, bytes)) {
      return jsonResponse(
        { error: "Choose a valid PDF resume.", success: false },
        400,
      );
    }

    const parser = new PDFParse({ data: bytes });
    let resumeText = "";

    try {
      const result = await parser.getText();
      resumeText = result.text.trim();
    } finally {
      await parser.destroy();
    }

    if (resumeText.length < minimumResumeTextLength) {
      return jsonResponse(
        {
          error:
            "Could not extract text from this PDF. Please try a different file.",
          success: false,
        },
        422,
      );
    }

    const extraction = await extractProfileFromResumeText(
      resumeText.slice(0, maximumResumeTextLength),
    );

    if (!extraction.success) {
      return jsonResponse(
        { error: extraction.error, success: false },
        502,
      );
    }

    return jsonResponse(
      { data: extraction.data, success: true },
      200,
    );
  } catch (error) {
    console.error("[api/resume/extract]", error);
    return jsonResponse(
      {
        error: "We could not process this resume. Please try again.",
        success: false,
      },
      500,
    );
  }
}
