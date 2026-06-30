import { ProtectedHeader } from "@/components/layout/ProtectedHeader";
import { ProfileForm } from "@/components/profile/ProfileForm";
import {
  createInsforgeServer,
  requireUser,
} from "@/lib/insforge-server";
import {
  createProfileViewModel,
  normalizeProfileRow,
} from "@/lib/profile";

export const dynamic = "force-dynamic";

const profileSelect = [
  "id",
  "full_name",
  "email",
  "phone",
  "location",
  "current_title",
  "experience_level",
  "years_experience",
  "skills",
  "industries",
  "work_experience",
  "education",
  "job_titles_seeking",
  "remote_preference",
  "preferred_locations",
  "salary_expectation",
  "cover_letter_tone",
  "linkedin_url",
  "portfolio_url",
  "work_authorization",
  "resume_pdf_url",
  "resume_pdf_key",
  "is_complete",
].join(",");

export default async function ProfilePage(): Promise<React.ReactNode> {
  const user = await requireUser();
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.database
    .from("profiles")
    .select(profileSelect)
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[app/profile] load profile", error);
  }

  const profile = createProfileViewModel(normalizeProfileRow(data), user);

  return (
    <main className="min-h-screen bg-background">
      <ProtectedHeader activePage="profile" />
      <div className="space-y-8 px-6 py-8 sm:px-10 lg:px-20">
        <ProfileForm profile={profile} />
      </div>
    </main>
  );
}
