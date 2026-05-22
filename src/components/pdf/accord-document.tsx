import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 11 },
  header: { marginBottom: 24 },
  title: { fontSize: 18, fontWeight: "bold", color: "#0F6E56", marginBottom: 8 },
  ref: { fontSize: 10, color: "#5A5A52" },
  section: { marginBottom: 16 },
  label: { fontSize: 9, color: "#757570", marginBottom: 4 },
  value: { fontSize: 11, color: "#1A1A16" },
  badge: {
    backgroundColor: "#EDF9F4",
    color: "#0F6E56",
    padding: 8,
    marginTop: 16,
    fontSize: 12,
    fontWeight: "bold",
  },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#9A9A94" },
  hash: { fontSize: 7, marginTop: 8, color: "#757570" },
  qrRow: { flexDirection: "row", marginTop: 16, alignItems: "flex-start", gap: 12 },
  qrImage: { width: 72, height: 72 },
  qrText: { fontSize: 7, color: "#757570", flex: 1 },
  qrLabel: { fontSize: 8, fontWeight: "bold", color: "#0F6E56", marginBottom: 4 },
});

export interface AccordPdfProps {
  reference: string;
  titre: string;
  type: string;
  description: string;
  initiateurName: string;
  initiateurEmail: string;
  destinataireNom: string;
  destinataireEmail: string;
  montant?: string;
  devise: string;
  dateEcheance?: string;
  validatedAt: string;
  contentHash: string;
  verifyUrl: string;
  qrCodeDataUrl: string;
}

export function AccordPdfDocument(props: AccordPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Zéro-Palabre — Preuve d&apos;accord</Text>
          <Text style={styles.ref}>{props.reference}</Text>
        </View>

        <View style={styles.badge}>
          <Text>STATUT : VALIDÉ — {props.validatedAt}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Titre</Text>
          <Text style={styles.value}>{props.titre}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Type</Text>
          <Text style={styles.value}>{props.type}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Initiateur</Text>
          <Text style={styles.value}>
            {props.initiateurName} — {props.initiateurEmail}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Destinataire</Text>
          <Text style={styles.value}>
            {props.destinataireNom} — {props.destinataireEmail}
          </Text>
        </View>

        {props.montant && (
          <View style={styles.section}>
            <Text style={styles.label}>Montant</Text>
            <Text style={styles.value}>
              {props.montant} {props.devise}
            </Text>
          </View>
        )}

        {props.dateEcheance && (
          <View style={styles.section}>
            <Text style={styles.label}>Échéance</Text>
            <Text style={styles.value}>{props.dateEcheance}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{props.description}</Text>
        </View>

        <Text style={styles.hash}>SHA-256 : {props.contentHash}</Text>

        {/* QR Code + lien de vérification */}
        <View style={styles.qrRow}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={props.qrCodeDataUrl} style={styles.qrImage} />
          <View style={{ flex: 1 }}>
            <Text style={styles.qrLabel}>Vérification publique</Text>
            <Text style={styles.qrText}>
              Scannez ce code QR ou visitez l&apos;URL ci-dessous pour accéder au registre public de cet accord et vérifier son authenticité à tout moment.
            </Text>
            <Text style={{ ...styles.qrText, marginTop: 4, color: "#0F6E56" }}>{props.verifyUrl}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Document généré par Zéro-Palabre. Ce document constitue une preuve de bonne foi,
          non un acte notarié. zeropalabre.com
        </Text>
      </Page>
    </Document>
  );
}

