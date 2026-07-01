import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import type { ProfileViewModel, WorkExperienceRole } from "@/lib/profile";
import type { GeneratedResumeContent } from "@/lib/resume-generation";

const styles = StyleSheet.create({
  bullet: {
    fontSize: 8.5,
    lineHeight: 1.35,
    marginBottom: 2,
  },
  contact: {
    color: "gray",
    fontSize: 8,
    lineHeight: 1.4,
    textAlign: "center",
  },
  educationDetail: {
    color: "gray",
    fontSize: 8,
  },
  educationTitle: {
    fontSize: 9,
    fontWeight: 700,
  },
  header: {
    alignItems: "center",
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 2,
  },
  page: {
    color: "black",
    fontFamily: "Helvetica",
    padding: 30,
  },
  role: {
    marginBottom: 7,
  },
  roleDates: {
    color: "gray",
    fontSize: 8,
  },
  roleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  roleMeta: {
    fontSize: 9,
    fontWeight: 700,
  },
  section: {
    marginBottom: 10,
  },
  sectionHeading: {
    borderBottom: "1 solid gray",
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 5,
    paddingBottom: 2,
  },
  skills: {
    fontSize: 8.5,
    lineHeight: 1.4,
  },
  summary: {
    fontSize: 8.5,
    lineHeight: 1.4,
  },
  title: {
    color: "gray",
    fontSize: 10,
    marginBottom: 3,
  },
});

function contactLine(profile: ProfileViewModel): string {
  return [profile.email, profile.phone, profile.location]
    .map((value) => value.trim())
    .filter(Boolean)
    .join("  |  ");
}

function roleDates(role: WorkExperienceRole): string {
  const endDate = role.isCurrent ? "Present" : role.endDate;
  return [role.startDate, endDate].filter(Boolean).join(" - ");
}

function ResumeDocument({
  content,
  profile,
}: {
  content: GeneratedResumeContent;
  profile: ProfileViewModel;
}): React.ReactNode {
  const generatedRoles = new Map(
    content.roles.map((role) => [role.roleIndex, role]),
  );
  const hasEducation = Object.values(profile.education).some((value) =>
    value.trim(),
  );

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.header}>
          <Text style={styles.name}>{profile.fullName}</Text>
          <Text style={styles.title}>{profile.currentTitle}</Text>
          <Text style={styles.contact}>{contactLine(profile)}</Text>
          {profile.linkedinUrl || profile.portfolioUrl ? (
            <Text style={styles.contact}>
              {profile.linkedinUrl ? (
                <Link src={profile.linkedinUrl}>{profile.linkedinUrl}</Link>
              ) : null}
              {profile.linkedinUrl && profile.portfolioUrl ? "  |  " : ""}
              {profile.portfolioUrl ? (
                <Link src={profile.portfolioUrl}>{profile.portfolioUrl}</Link>
              ) : null}
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>PROFESSIONAL SUMMARY</Text>
          <Text style={styles.summary}>{content.professionalSummary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>SKILLS</Text>
          <Text style={styles.skills}>
            {profile.skills.slice(0, 14).join("  •  ")}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>EXPERIENCE</Text>
          {profile.workExperience.map((role, roleIndex) => {
            const generatedRole = generatedRoles.get(roleIndex);

            return (
              <View key={`${role.companyName}-${roleIndex}`} style={styles.role}>
                <View style={styles.roleHeader}>
                  <Text style={styles.roleMeta}>
                    {role.jobTitle} — {role.companyName}
                  </Text>
                  <Text style={styles.roleDates}>{roleDates(role)}</Text>
                </View>
                {generatedRole?.bulletPoints.map((bulletPoint) => (
                  <Text key={bulletPoint} style={styles.bullet}>
                    • {bulletPoint}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>

        {hasEducation ? (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>EDUCATION</Text>
            <Text style={styles.educationTitle}>
              {[profile.education.highestDegree, profile.education.fieldOfStudy]
                .filter(Boolean)
                .join(" in ")}
            </Text>
            <Text style={styles.educationDetail}>
              {[
                profile.education.institutionName,
                profile.education.graduationYear,
              ]
                .filter(Boolean)
                .join("  |  ")}
            </Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}

export async function renderResumePdf(
  profile: ProfileViewModel,
  content: GeneratedResumeContent,
): Promise<Buffer> {
  return renderToBuffer(
    <ResumeDocument content={content} profile={profile} />,
  );
}
