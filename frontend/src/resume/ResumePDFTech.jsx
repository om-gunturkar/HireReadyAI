import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.6,
  },

  /* HEADER */
  header: {
    textAlign: "center",
    marginBottom: 16,
  },

  name: {
    fontSize: 22,
    fontWeight: "bold",
  },

  contact: {
    fontSize: 9,
    marginTop: 4,
    color: "#555",
  },

  section: {
    marginTop: 14,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  bullet: {
    marginLeft: 12,
    marginBottom: 3,
  },

  smallText: {
    fontSize: 9,
    color: "#444",
  }
});

export default function ResumePDFTech({ data = {} }) {

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
    internships = [],
    certifications = [],
    achievements = []
  } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.contact}>
            {[email, phone, linkedin, github, portfolio]
              .filter(Boolean)
              .join(" | ")}
          </Text>
        </View>

        {/* SUMMARY */}
        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TECHNICAL SUMMARY</Text>
            <Text>{summary}</Text>
          </View>
        )}

        {/* EDUCATION */}
        {education.filter(e => e.degree).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EDUCATION</Text>
            {education.map((e, i) =>
              e.degree ? (
                <View key={i} style={{ marginBottom: 6 }}>
                  <View style={styles.rowBetween}>
                    <Text style={{ fontWeight: "bold" }}>{e.degree}</Text>
                    <Text>{e.year}</Text>
                  </View>
                  <Text style={styles.smallText}>
                    {e.institute} {e.score ? `| ${e.score}` : ""}
                  </Text>
                </View>
              ) : null
            )}
          </View>
        )}

        {/* SKILLS */}
        {skills.filter(Boolean).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TECHNICAL SKILLS</Text>
            {skills.map((s, i) =>
              s ? <Text key={i} style={styles.bullet}>• {s}</Text> : null
            )}
          </View>
        )}

        {/* EXPERIENCE */}
        {experience.filter(e => e.role).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXPERIENCE</Text>
            {experience.map((e, i) =>
              e.role ? (
                <View key={i} style={{ marginBottom: 6 }}>
                  <View style={styles.rowBetween}>
                    <Text style={{ fontWeight: "bold" }}>
                      {e.role} {e.company ? `| ${e.company}` : ""}
                    </Text>
                    <Text>{e.duration}</Text>
                  </View>
                  {e.points &&
                    e.points.split("\n").filter(Boolean).map((pt, idx) => (
                      <Text key={idx} style={styles.bullet}>• {pt}</Text>
                    ))}
                </View>
              ) : null
            )}
          </View>
        )}

        {/* INTERNSHIPS */}
        {internships.filter(i => i.role).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INTERNSHIPS</Text>
            {internships.map((i, index) =>
              i.role ? (
                <View key={index} style={{ marginBottom: 6 }}>
                  <View style={styles.rowBetween}>
                    <Text style={{ fontWeight: "bold" }}>
                      {i.role} {i.company ? `| ${i.company}` : ""}
                    </Text>
                    <Text>{i.duration}</Text>
                  </View>
                  {i.points &&
                    i.points.split("\n").filter(Boolean).map((pt, idx) => (
                      <Text key={idx} style={styles.bullet}>• {pt}</Text>
                    ))}
                </View>
              ) : null
            )}
          </View>
        )}

        {/* PROJECTS */}
        {projects.filter(p => p.title).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROJECTS</Text>
            {projects.map((p, i) =>
              p.title ? (
                <View key={i} style={{ marginBottom: 6 }}>
                  <Text style={{ fontWeight: "bold" }}>
                    {p.title} {p.tech ? `| ${p.tech}` : ""}
                  </Text>
                  {p.points &&
                    p.points.split("\n").filter(Boolean).map((pt, idx) => (
                      <Text key={idx} style={styles.bullet}>• {pt}</Text>
                    ))}
                </View>
              ) : null
            )}
          </View>
        )}

        {/* CERTIFICATIONS */}
        {certifications.filter(Boolean).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CERTIFICATIONS</Text>
            {certifications.map((c, i) =>
              c ? <Text key={i} style={styles.bullet}>• {c}</Text> : null
            )}
          </View>
        )}

        {/* ACHIEVEMENTS */}
        {achievements.filter(Boolean).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
            {achievements.map((a, i) =>
              a ? <Text key={i} style={styles.bullet}>• {a}</Text> : null
            )}
          </View>
        )}

      </Page>
    </Document>
  );
}
