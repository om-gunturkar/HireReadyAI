import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 30,
    fontFamily: "Times-Roman",
    fontSize: 11,
    lineHeight: 1.4,
  },


  /* HEADER */
  header: {
    marginBottom: 8,
  },

  name: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },

  contact: {
    marginTop: 4,
    fontSize: 10,
    textAlign: "center",
    color: "#333",
  },

  divider: {
    height: 1,
    backgroundColor: "#000",
    marginVertical: 5,
  },

  /* SECTION */
  section: {
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },

  /* ROWS */
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  row: {
    flexDirection: "row",
  },

  bold: {
    fontWeight: "bold",
  },

  muted: {
    color: "#444",
  },

  block: {
    marginBottom: 3,
  },

  /* BULLETS */
  bulletRow: {
    flexDirection: "row",
    marginLeft: 10,
    marginBottom: 1,
  },

  bullet: {
    width: 10,
  },

  bulletText: {
    flex: 1,
  },

  /* SKILLS */
  skillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  skillItem: {
    width: "50%",
    marginBottom: 2,
  },
});

export default function ResumePDF({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.contact}>
            {data.email} | {data.phone} | {data.linkedin} | {data.github} | {data.portfolio}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* SUMMARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text>{data.summary}</Text>
        </View>

        {/* EDUCATION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.map((e, i) => (
            <View key={i} style={styles.block}>
              <View style={styles.rowBetween}>
                <Text style={styles.bold}>{e.degree} – {e.institute}</Text>
                <Text style={styles.muted}>{e.year}</Text>
              </View>
              <Text style={styles.muted}>{e.score}</Text>
            </View>
          ))}
        </View>

        {/* SKILLS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsWrap}>
            {data.skills.map((s, i) => (
              <Text key={i} style={styles.skillItem}>• {s}</Text>
            ))}
          </View>
        </View>

        {/* EXPERIENCE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {data.experience.map((e, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <View style={styles.rowBetween}>
                <Text style={styles.bold}>{e.role} – {e.company}</Text>
                <Text style={styles.muted}>{e.duration}</Text>
              </View>

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
        </View>

        {/* PROJECTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          {data.projects.map((p, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <Text style={styles.bold}>{p.title} | {p.tech}</Text>

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
        </View>

      </Page>
    </Document>
  );
}
