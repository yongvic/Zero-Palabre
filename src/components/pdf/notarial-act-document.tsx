import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { NotarialFilledFields } from "@/lib/notarial/build-fields";
import { buildPretActParagraphs } from "@/lib/notarial/templates/pret-act-prose";

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", fontSize: 9.5, lineHeight: 1.5 },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F6E56",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 1,
  },
  ref: { fontSize: 8, color: "#757570", textAlign: "center", marginBottom: 16 },
  heading: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0F6E56",
    marginTop: 12,
    marginBottom: 4,
    letterSpacing: 0.8,
  },
  declaration: { fontSize: 9.5, textAlign: "justify", marginVertical: 6 },
  body: { fontSize: 9.5, textAlign: "justify", marginVertical: 3 },
  party: { fontSize: 9.5, marginVertical: 2, paddingLeft: 8 },
  signature: { fontSize: 9.5, fontWeight: "bold", marginVertical: 2 },
  closing: { fontSize: 8.5, color: "#5A5A52", textAlign: "center", marginTop: 16 },
  stampRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 24, alignItems: "flex-end" },
  stamp: { width: 80, height: 80, opacity: 0.9 },
  stampCaption: { fontSize: 6.5, color: "#757570", marginTop: 4, textAlign: "right" },
  footer: { position: "absolute", bottom: 32, left: 48, right: 48, fontSize: 6.5, color: "#9A9A94" },
});

export type NotarialPdfProps = {
  fields: NotarialFilledFields;
  stampSrc: string;
  notaryCaption: string;
};

function paragraphStyle(text: string) {
  if (text.startsWith("ACTE DE")) return styles.title;
  if (text.startsWith("Référence")) return styles.ref;
  if (
    text === "COMPARUTION" ||
    text.startsWith("ARTICLE") ||
    text === "EXPOSÉ"
  )
    return styles.heading;
  if (/^\d+°\)/.test(text)) return styles.party;
  if (text.startsWith("Je soussigné")) return styles.declaration;
  if (text.startsWith("Le PRÊTEUR") || text.startsWith("L'EMPRUNTEUR"))
    return styles.signature;
  if (text.startsWith("Fait sur")) return styles.closing;
  return styles.body;
}

export function NotarialActPdfDocument({ fields, stampSrc, notaryCaption }: NotarialPdfProps) {
  const paragraphs = buildPretActParagraphs(fields);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {paragraphs.map((p, i) =>
          p === "" ? null : (
            <Text key={i} style={paragraphStyle(p)}>
              {p}
            </Text>
          )
        )}

        <View style={styles.stampRow}>
          <View>
            <Image src={stampSrc} style={styles.stamp} />
            <Text style={styles.stampCaption}>{notaryCaption}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Acte généré sur template validé par le notaire partenaire · Zéro-Palabre · République
            Togolaise
          </Text>
        </View>
      </Page>
    </Document>
  );
}
