import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4f46e5",
  },
  contact: {
    fontSize: 9,
    marginBottom: 8,
  },
  section: { marginTop: 10 },
  title: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#111827",
  },
});

export default function ResumePDFModern({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{data.name}</Text>
        <Text style={styles.contact}>
          {data.email} | {data.phone} | {data.linkedin}
        </Text>

        <View style={styles.section}>
          <Text style={styles.title}>SUMMARY</Text>
          <Text>{data.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>SKILLS</Text>
          {data.skills.map((s, i) => <Text key={i}>• {s}</Text>)}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>PROJECTS</Text>
          {data.projects.map((p, i) => (
            <View key={i}>
              <Text>{p.title} — {p.tech}</Text>
              {p.points.split("\n").filter(Boolean).map((pt, idx) =>
                <Text key={idx}>• {pt}</Text>
              )}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
