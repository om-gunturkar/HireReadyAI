import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  contact: {
    fontSize: 9,
    color: "#374151",
  },
  section: {
    marginTop: 14,
  },
  title: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
  },
  bullet: {
    marginBottom: 3,
  },
});

export default function ResumePDFCreative({ data = {} }) {
  const {
    name = "",
    email = "",
    phone = "",
    summary = "",
    projects = [],
  } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.name}>{name || "Your Name"}</Text>
          <Text style={styles.contact}>
            {[email, phone].filter(Boolean).join(" | ")}
          </Text>
        </View>

        {/* SUMMARY */}
        {summary ? (
          <View style={styles.section}>
            <Text style={styles.title}>ABOUT</Text>
            <Text>{summary}</Text>
          </View>
        ) : null}

        {/* PROJECTS */}
        {projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.title}>PROJECTS</Text>
            {projects.map((p, i) =>
              p?.title ? (
                <Text key={i} style={styles.bullet}>
                  • {p.title}
                </Text>
              ) : null
            )}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
