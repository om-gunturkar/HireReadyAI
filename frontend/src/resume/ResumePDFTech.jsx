import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
  },
  contact: {
    fontSize: 9,
    marginBottom: 10,
  },
  title: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 14,
    marginBottom: 4,
  },
});

export default function ResumePDFTech({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{data.name}</Text>
        <Text style={styles.contact}>{data.email} | {data.phone}</Text>

        <Text style={styles.title}>SUMMARY</Text>
        <Text>{data.summary}</Text>

        <Text style={styles.title}>SKILLS</Text>
        {data.skills.map((s, i) => <Text key={i}>• {s}</Text>)}

        <Text style={styles.title}>EXPERIENCE</Text>
        {data.experience.map((e, i) => (
          <View key={i}>
            <Text>{e.role} – {e.company}</Text>
            {e.points.split("\n").filter(Boolean).map((pt, idx) =>
              <Text key={idx}>• {pt}</Text>
            )}
          </View>
        ))}
      </Page>
    </Document>
  );
}
