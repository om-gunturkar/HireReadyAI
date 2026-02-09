import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    fontFamily: "Helvetica",
    fontSize: 9,
  },
  left: {
    width: "30%",
    padding: 20,
    backgroundColor: "#f3f4f6",
  },
  right: {
    width: "70%",
    padding: 20,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  title: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 8,
  },
});

export default function ResumePDFTech({ data }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.left}>
          <Text style={styles.name}>{data.name}</Text>
          <Text>{data.email}</Text>
          <Text>{data.phone}</Text>

          <Text style={styles.title}>SKILLS</Text>
          {data.skills.map((s, i) => <Text key={i}>• {s}</Text>)}
        </View>

        <View style={styles.right}>
          <Text style={styles.title}>SUMMARY</Text>
          <Text>{data.summary}</Text>

          <Text style={styles.title}>EXPERIENCE</Text>
          {data.experience.map((e, i) => (
            <View key={i}>
              <Text>{e.role} – {e.company}</Text>
              {e.points.split("\n").filter(Boolean).map((pt, idx) =>
                <Text key={idx}>• {pt}</Text>
              )}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
