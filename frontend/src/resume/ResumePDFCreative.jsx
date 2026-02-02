import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
    backgroundColor: "#faf7f5",
  },
  section: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#7c2d12",
  },
});

export default function ResumePDFCreative({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>{data.name}</Text>
          <Text>{data.email} | {data.phone}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>ABOUT</Text>
          <Text>{data.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>PROJECTS</Text>
          {data.projects.map((p, i) => (
            <Text key={i}>• {p.title}</Text>
          ))}
        </View>
      </Page>
    </Document>
  );
}
