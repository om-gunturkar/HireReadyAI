import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  title: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 14,
    marginBottom: 4,
  },
  block: {
    marginBottom: 6,
  },
});

export default function ResumePDFStudent({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{data.name}</Text>

        <Text style={styles.title}>PROJECTS</Text>
        {data.projects.map((p, i) => (
          <View key={i} style={styles.block}>
            <Text>{p.title} ({p.tech})</Text>
            {p.points.split("\n").filter(Boolean).map((pt, idx) =>
              <Text key={idx}>• {pt}</Text>
            )}
          </View>
        ))}

        <Text style={styles.title}>EDUCATION</Text>
        {data.education.map((e, i) => (
          <Text key={i}>{e.degree} – {e.institute}</Text>
        ))}

        <Text style={styles.title}>SKILLS</Text>
        {data.skills.map((s, i) => <Text key={i}>• {s}</Text>)}
      </Page>
    </Document>
  );
}
