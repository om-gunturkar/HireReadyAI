import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 45,
    paddingHorizontal: 55,
    paddingBottom: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.6,
  },

  /* HEADER */
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  headerLeft: {
    flex: 1,
    paddingRight: 20,
  },

  name: {
    fontSize: 26,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 12,
  },

  contactPrimary: {
    fontSize: 9,
    marginBottom: 4,
  },

  contactSecondary: {
    fontSize: 9,
    color: "#555",
  },

  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 50,
  },

  /* SECTION */
  section: {
    marginTop: 18,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    letterSpacing: 1,
  },

  bodyText: {
    marginBottom: 6,
    textAlign: "justify",
  },

  bullet: {
    marginLeft: 12,
    marginBottom: 4,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default function ResumePDFCreative({ data = {} }) {
  const {
    name = "",
    email = "",
    phone = "",
    linkedin = "",
    github = "",
    portfolio = "",
    summary = "",
    education = [],
    skills = [],
    experience = [],
    projects = [],
    profileImage = null,
  } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <View style={styles.headerContainer}>

          <View style={styles.headerLeft}>
            <Text style={styles.name}>{name || "YOUR NAME"}</Text>

            <Text style={styles.contactPrimary}>
              {[email, phone].filter(Boolean).join("   |   ")}
            </Text>

            <Text style={styles.contactSecondary}>
              {[linkedin, github, portfolio].filter(Boolean).join("   |   ")}
            </Text>
          </View>

          {profileImage && (
            <Image src={profileImage} style={styles.profileImage} />
          )}

        </View>

        {/* ABOUT */}
        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ABOUT</Text>
            <Text style={styles.bodyText}>{summary}</Text>
          </View>
        )}

        {/* EDUCATION */}
        {education.filter(e => e.degree).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EDUCATION</Text>

            {education.map((edu, i) =>
              edu.degree ? (
                <View key={i} style={{ marginBottom: 8 }}>
                  <View style={styles.rowBetween}>
                    <Text style={{ fontWeight: "bold" }}>{edu.degree}</Text>
                    <Text>{edu.year}</Text>
                  </View>
                  <Text>{edu.institute}</Text>
                  <Text style={{ color: "#555" }}>{edu.score}</Text>
                </View>
              ) : null
            )}
          </View>
        )}

        {/* SKILLS */}
        {skills.filter(Boolean).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SKILLS</Text>
            {skills.map((skill, i) =>
              skill ? (
                <Text key={i} style={styles.bullet}>• {skill}</Text>
              ) : null
            )}
          </View>
        )}

        {/* EXPERIENCE */}
        {experience.filter(e => e.role).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXPERIENCE</Text>

            {experience.map((exp, i) =>
              exp.role ? (
                <View key={i} style={{ marginBottom: 8 }}>
                  <View style={styles.rowBetween}>
                    <Text style={{ fontWeight: "bold" }}>
                      {exp.role} | {exp.company}
                    </Text>
                    <Text>{exp.duration}</Text>
                  </View>

                  {exp.points &&
                    exp.points.split("\n").map((pt, idx) =>
                      pt ? (
                        <Text key={idx} style={styles.bullet}>
                          • {pt}
                        </Text>
                      ) : null
                    )}
                </View>
              ) : null
            )}
          </View>
        )}

        {/* PROJECTS */}
        {projects.filter(p => p.title).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROJECTS</Text>

            {projects.map((proj, i) =>
              proj.title ? (
                <View key={i} style={{ marginBottom: 8 }}>
                  <Text style={{ fontWeight: "bold" }}>
                    {proj.title} {proj.tech ? `| ${proj.tech}` : ""}
                  </Text>

                  {proj.points &&
                    proj.points.split("\n").map((pt, idx) =>
                      pt ? (
                        <Text key={idx} style={styles.bullet}>
                          • {pt}
                        </Text>
                      ) : null
                    )}
                </View>
              ) : null
            )}
          </View>
        )}

      </Page>
    </Document>
  );
}
