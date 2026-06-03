import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { NotarialFilledFields } from "@/lib/notarial/build-fields";

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", fontSize: 10, lineHeight: 1.45 },
  header: { marginBottom: 20, borderBottomWidth: 2, borderBottomColor: "#0F6E56", paddingBottom: 12 },
  title: { fontSize: 16, fontWeight: "bold", color: "#0F6E56" },
  ref: { fontSize: 9, color: "#5A5A52", marginTop: 4 },
  section: { marginTop: 14 },
  sectionTitle: { fontSize: 9, fontWeight: "bold", color: "#0F6E56", marginBottom: 6, textTransform: "uppercase" },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: "38%", fontSize: 9, color: "#757570" },
  value: { width: "62%", fontSize: 10, color: "#1A1A16" },
  body: { fontSize: 10, color: "#1A1A16", marginTop: 4 },
  stampRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 32, alignItems: "flex-end" },
  stamp: { width: 88, height: 88, opacity: 0.9 },
  stampCaption: { fontSize: 7, color: "#757570", marginTop: 4, textAlign: "right" },
  footer: { position: "absolute", bottom: 36, left: 48, right: 48, fontSize: 7, color: "#9A9A94" },
  hash: { fontSize: 6, marginTop: 6, color: "#757570" },
});

export type NotarialPdfProps = {
  fields: NotarialFilledFields;
  stampSrc: string;
  notaryCaption: string;
};

function PartyBlock({ title, party }: { title: string; party: NotarialFilledFields["initiateur"] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {[
        ["Nom", party.nom],
        ["Nom de famille", party.familyName],
        ["Identifiant", party.username],
        ["Téléphone", party.phone],
        ["Date de naissance", party.dateNaissance],
        ["Adresse", party.adresse],
        ["Signature", party.signature],
        ["Date de signature", party.signedAt],
      ].map(([label, value]) => (
        <View key={label} style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

export function NotarialActPdfDocument({ fields, stampSrc, notaryCaption }: NotarialPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Acte notarial — {fields.typeLabel}</Text>
          <Text style={styles.ref}>Réf. {fields.reference} · {fields.templateVersion}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objet</Text>
          <Text style={styles.body}>{fields.titre}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.body}>{fields.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Montant</Text>
          <View style={styles.row}>
            <Text style={styles.label}>En chiffres</Text>
            <Text style={styles.value}>{fields.montantChiffres}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>En lettres</Text>
            <Text style={styles.value}>{fields.montantLettres}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Échéance</Text>
            <Text style={styles.value}>{fields.dateEcheance}</Text>
          </View>
        </View>

        <PartyBlock title="Partie initiatrice" party={fields.initiateur} />
        <PartyBlock title="Contrepartie" party={fields.contrepartie} />

        <View style={styles.stampRow}>
          <View>
            <Image src={stampSrc} style={styles.stamp} />
            <Text style={styles.stampCaption}>{notaryCaption}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            Document généré sur template validé par le notaire partenaire. Zéro-Palabre — plateforme de
            formalisation d&apos;accords.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
