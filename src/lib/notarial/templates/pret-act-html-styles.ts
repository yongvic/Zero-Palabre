/** Styles embarqués pour l'aperçu HTML et l'impression navigateur. */
export const NOTARIAL_ACT_HTML_STYLES = `
.notarial-act-wrap {
  font-family: "Plus Jakarta Sans", Georgia, "Times New Roman", serif;
  color: var(--color-neutral-900, #1a1a16);
  background: var(--color-paper, #faf9f5);
  border: 1px solid var(--color-neutral-200, #e5e5df);
  border-radius: 1rem;
  padding: 2rem 2.25rem;
  line-height: 1.65;
  font-size: 0.9375rem;
  max-height: 28rem;
  overflow-y: auto;
  box-shadow: 0 1px 3px rgba(26, 26, 22, 0.06);
}
.notarial-act .act-title {
  font-size: 1.125rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-align: center;
  color: var(--color-primary-800, #0f6e56);
  margin: 0 0 0.5rem;
}
.notarial-act .act-ref {
  text-align: center;
  font-size: 0.6875rem;
  font-family: ui-monospace, monospace;
  color: var(--color-neutral-500, #757570);
  margin: 0 0 1.25rem;
}
.notarial-act .act-heading {
  font-size: 0.6875rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-primary-800, #0f6e56);
  margin: 1.25rem 0 0.5rem;
}
.notarial-act .act-party {
  margin: 0.35rem 0;
  padding-left: 0.75rem;
  border-left: 2px solid var(--color-primary-200, #b8ddd0);
}
.notarial-act .act-declaration {
  margin: 0.75rem 0;
  text-align: justify;
  font-style: normal;
}
.notarial-act .act-body {
  margin: 0.5rem 0;
  text-align: justify;
}
.notarial-act .act-signature {
  margin: 0.35rem 0;
  font-weight: 600;
}
.notarial-act .act-closing {
  margin-top: 1.5rem;
  font-size: 0.8125rem;
  color: var(--color-neutral-600, #5a5a52);
  text-align: center;
}
.notarial-act .act-spacer {
  margin: 0;
  height: 0.5rem;
}
@media print {
  .notarial-act-wrap {
    max-height: none;
    border: none;
    box-shadow: none;
  }
}
`;
