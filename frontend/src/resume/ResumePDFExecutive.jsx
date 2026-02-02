import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Times-Roman" },
  name: { fontSize: 20, fontWeight: "bold" },
  title: { fontSize: 11, fontWeight: "bold", marginTop: 12 },
});

export default function ResumePDFExecutive({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{data.name}</Text>

        <Text style={styles.title}>PROFESSIONAL SUMMARY</Text>
        <Text>{data.summary}</Text>

        <Text style={styles.title}>WORK EXPERIENCE</Text>
        {data.experience.map((e, i) => (
          <View key={i}>
            <Text>{e.role} – {e.company}</Text>
            <Text>{e.duration}</Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}
