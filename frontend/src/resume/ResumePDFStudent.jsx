import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica" },
  name: { fontSize: 18, fontWeight: "bold" },
  title: { fontSize: 11, fontWeight: "bold", marginTop: 10 },
});

export default function ResumePDFStudent({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{data.name}</Text>

        <Text style={styles.title}>PROJECTS</Text>
        {data.projects.map((p, i) => (
          <View key={i}>
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
