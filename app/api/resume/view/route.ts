import {
  createInsforgeServer,
  getCurrentUser,
} from "@/lib/insforge-server";

export async function GET(): Promise<Response> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { error: "Please sign in to view your resume.", success: false },
        { status: 401 },
      );
    }

    const insforge = await createInsforgeServer();
    const { data: profileData, error: profileError } =
      await insforge.database
        .from("profiles")
        .select("resume_pdf_key")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError) {
      console.error("[api/resume/view] load profile", profileError);
      return Response.json(
        { error: "We could not load your resume.", success: false },
        { status: 500 },
      );
    }

    const resumeKey =
      profileData &&
      typeof profileData === "object" &&
      "resume_pdf_key" in profileData &&
      typeof profileData.resume_pdf_key === "string"
        ? profileData.resume_pdf_key
        : "";

    if (!resumeKey) {
      return Response.json(
        { error: "No resume is available to view.", success: false },
        { status: 404 },
      );
    }

    const { data: resume, error: downloadError } =
      await insforge.storage.from("resumes").download(resumeKey);

    if (downloadError || !resume) {
      console.error("[api/resume/view] download resume", downloadError);
      return Response.json(
        { error: "We could not open your resume.", success: false },
        { status: 500 },
      );
    }

    return new Response(resume, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": 'inline; filename="resume.pdf"',
        "Content-Type": "application/pdf",
      },
      status: 200,
    });
  } catch (error) {
    console.error("[api/resume/view]", error);
    return Response.json(
      { error: "We could not open your resume.", success: false },
      { status: 500 },
    );
  }
}
