import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { AccordPdfDocument, type AccordPdfProps } from "@/components/pdf/accord-document";

export async function generateAccordPdfBuffer(props: AccordPdfProps) {
  return renderToBuffer(<AccordPdfDocument {...props} />);
}
