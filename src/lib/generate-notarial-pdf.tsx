import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  NotarialActPdfDocument,
  type NotarialPdfProps,
} from "@/components/pdf/notarial-act-document";

export async function generateNotarialPdfBuffer(props: NotarialPdfProps) {
  return renderToBuffer(<NotarialActPdfDocument {...props} />);
}
