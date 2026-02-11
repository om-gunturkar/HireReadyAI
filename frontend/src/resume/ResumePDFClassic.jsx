import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 25,
    paddingBottom: 25,
    paddingHorizontal: 35,
    fontFamily: "Times-Roman",
    fontSize: 12, // increased from 10 → 12
    lineHeight: 1.5,
  },

  name: {
    fontSize: 20, // increased
    fontWeight: "bold",
    textAlign: "center",
  },

  contact: {
    marginTop: 6,
    fontSize: 11, // increased
    textAlign: "center",
    color: "#333",
  },

  divider: {
    height: 1,
    backgroundColor: "#000",
    marginVertical: 8,
  },

  section: {
    marginTop: 12,
  },

  sectionTitle: {
    fontSize: 13, // increased
    fontWeight: "bold",
    marginBottom: 6,
    textTransform: "uppercase",
  },

  bold: { fontWeight: "bold" },

  muted: {
    color: "#444",
    fontSize: 11, // increased
  },

  italic: { fontStyle: "italic" },

  bulletRow: {
    flexDirection: "row",
    marginLeft: 12,
    marginBottom: 4,
  },

  bullet: {
    width: 10,
  },

  bulletText: {
    flex: 1,
  },
});

export default function ResumePDFClassic({ data = {} }) {
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
  } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <Text style={styles.name}>{name}</Text>

        <Text style={styles.contact}>
          {[email, phone, linkedin, github, portfolio]
            .filter(Boolean)
            .join(" | ")}
        </Text>

        <View style={styles.divider} />

        {/* SUMMARY */}
        {summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text>{summary}</Text>
          </View>
        )}

        {/* EDUCATION */}
        {education.filter(e => e.degree).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>

            {education.map((e, i) =>
              e.degree ? (
                <View key={i} style={{ marginBottom: 6 }}>
                  <Text style={styles.bold}>
                    {e.degree} – {e.institute}
                  </Text>
                  <Text style={styles.muted}>
                    {e.score} {e.year ? `| ${e.year}` : ""}
                  </Text>
                </View>
              ) : null
            )}
          </View>
        )}

        {/* SKILLS - SINGLE COLUMN */}
        {skills.filter(Boolean).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>

            {skills.map((s, i) =>
              s ? (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{s}</Text>
                </View>
              ) : null
            )}
          </View>
        )}

        {/* EXPERIENCE */}
        {experience.filter(e => e.role).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>

            {experience.map((e, i) =>
              e.role ? (
                <View key={i} style={{ marginBottom: 8 }}>
                  <Text style={styles.bold}>
                    {e.role} – {e.company}
                  </Text>
                  <Text style={styles.muted}>{e.duration}</Text>

                  {e.points &&
                    e.points
                      .split("\n")
                      .filter(Boolean)
                      .map((pt, idx) => (
                        <View key={idx} style={styles.bulletRow}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.bulletText}>{pt}</Text>
                        </View>
                      ))}
                </View>
              ) : null
            )}
          </View>
        )}

        {/* PROJECTS */}
        {projects.filter(p => p.title).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>

            {projects.map((p, i) =>
              p.title ? (
                <View key={i} style={{ marginBottom: 8 }}>
                  <Text>
                    <Text style={styles.bold}>{p.title}</Text>
                    {p.tech ? ` | ${p.tech}` : ""}
                  </Text>

                  {p.points &&
                    p.points
                      .split("\n")
                      .filter(Boolean)
                      .map((pt, idx) => (
                        <View key={idx} style={styles.bulletRow}>
                          <Text style={styles.bullet}>•</Text>
                          <Text style={styles.bulletText}>{pt}</Text>
                        </View>
                      ))}
                </View>
              ) : null
            )}
          </View>
        )}

      </Page>
    </Document>
  );
}
