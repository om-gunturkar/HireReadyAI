import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 30,
    fontFamily: "Times-Roman",
    fontSize: 10,
    lineHeight: 1.35,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },

  contact: {
    marginTop: 4,
    fontSize: 9,
    textAlign: "center",
    color: "#333",
  },

  divider: {
    height: 1,
    backgroundColor: "#000",
    marginVertical: 5,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },

  bold: { fontWeight: "bold" },
  muted: { color: "#444", fontSize: 9 },
  italic: { fontStyle: "italic" },

  bulletRow: {
    flexDirection: "row",
    marginLeft: 10,
  },

  bullet: {
    width: 8,
  },

  bulletText: {
    flex: 1,
  },

  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  skillItem: {
    width: "50%",
    fontSize: 9,
  },
});

export default function ResumePDFClassic({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <Text style={styles.name}>{data.name}</Text>
        <Text style={styles.contact}>
          {data.email} | {data.phone} | {data.linkedin} | {data.github} | {data.portfolio}
        </Text>

        <View style={styles.divider} />

        {/* SUMMARY */}
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text>{data.summary}</Text>

        {/* EDUCATION */}
        <Text style={styles.sectionTitle}>Education</Text>
        {data.education.map((e, i) => (
          <View key={i}>
            <Text style={styles.bold}>
              {e.degree} – {e.institute}
            </Text>
            <Text style={styles.muted}>
              {e.score} | {e.year}
            </Text>
          </View>
        ))}

        {/* SKILLS */}
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsWrap}>
          {data.skills.map((s, i) => (
            <Text key={i} style={styles.skillItem}>
              • {s}
            </Text>
          ))}
        </View>

        {/* EXPERIENCE */}
        <Text style={styles.sectionTitle}>Experience</Text>
        {data.experience.map((e, i) => (
          <View key={i}>
            <Text style={styles.bold}>
              {e.role} – {e.company}
            </Text>
            <Text style={styles.muted}>{e.duration}</Text>

            {e.points
              .split("\n")
              .filter(Boolean)
              .map((pt, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{pt}</Text>
                </View>
              ))}
          </View>
        ))}

        {/* PROJECTS */}
        <Text style={styles.sectionTitle}>Projects</Text>
        {data.projects.map((p, i) => (
          <View key={i}>
            <Text>
              <Text style={styles.bold}>{p.title}</Text>
              {" | "}
              <Text style={[styles.muted, styles.italic]}>
                {p.tech}
              </Text>
            </Text>

            {p.points
              .split("\n")
              .filter(Boolean)
              .map((pt, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{pt}</Text>
                </View>
              ))}
          </View>
        ))}

      </Page>
    </Document>
  );
}
