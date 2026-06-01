import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 11 },
  title: { fontSize: 18, fontWeight: "bold", color: "#0F6E56", marginBottom: 8 },
  section: { marginBottom: 14 },
  label: { fontSize: 9, color: "#757570", marginBottom: 3 },
  value: { fontSize: 11, color: "#1A1A16" },
  legal: { fontSize: 8, color: "#9A9A94", marginTop: 24, lineHeight: 1.4 },
  hash: { fontSize: 7, marginTop: 6, color: "#757570" },
});

export interface FulfillmentPdfProps {
  reference: string;
  titre: string;
  contentHash: string;
  amountDeclared: string;
  paidAt: string;
  paymentMethod: string;
  referenceTx: string | null;
  declaredName: string;
  declaredEmail: string;
  declaredAt: string;
  confirmedAt: string;
  creditorName: string;
  creditorEmail: string;
  fulfillmentHash: string;
  hasProof: boolean;
}

export function FulfillmentAttestationPdf(props: FulfillmentPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Attestation d&apos;exécution</Text>
        <Text style={{ fontSize: 10, marginBottom: 16 }}>
          Annexe à l&apos;accord {props.reference} — {props.titre}
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Hash de l&apos;accord signé (référence)</Text>
          <Text style={styles.hash}>{props.contentHash}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Montant remboursé</Text>
          <Text style={styles.value}>{props.amountDeclared}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date de paiement déclarée</Text>
          <Text style={styles.value}>{props.paidAt}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Mode de paiement</Text>
          <Text style={styles.value}>{props.paymentMethod}</Text>
          {props.referenceTx ? (
            <Text style={styles.value}>Réf. {props.referenceTx}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Déclaré par (débiteur)</Text>
          <Text style={styles.value}>
            {props.declaredName} — {props.declaredEmail}
          </Text>
          <Text style={styles.value}>Le {props.declaredAt}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Confirmé par (créancier)</Text>
          <Text style={styles.value}>
            {props.creditorName} — {props.creditorEmail}
          </Text>
          <Text style={styles.value}>Le {props.confirmedAt}</Text>
        </View>

        {props.hasProof ? (
          <View style={styles.section}>
            <Text style={styles.label}>Justificatif</Text>
            <Text style={styles.value}>Photo / reçu fourni par le débiteur</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.label}>Hash d&apos;exécution</Text>
          <Text style={styles.hash}>{props.fulfillmentHash}</Text>
        </View>

        <Text style={styles.legal}>
          Ce document atteste d&apos;une confirmation mutuelle sur la plateforme Zéro-Palabre.
          Il ne constitue pas une preuve bancaire ni un jugement juridique. L&apos;empreinte
          SHA-256 permet de vérifier l&apos;intégrité de cette attestation.
        </Text>
      </Page>
    </Document>
  );
}
