/**
 * Table identifiers are short text labels (e.g. "M1", "MVIP1", "OD3"),
 * printed on the table's QR code and carried in the URL as ?table=<label>.
 * Labels are stored uppercase; anything read from a URL or form is
 * normalized the same way so "mvip1" and "MVIP1" are the same table.
 */
const TABLE_LABEL_PATTERN = /^[A-Z0-9-]{1,16}$/;

export function normalizeTableLabel(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string') return null;
  const label = raw.trim().toUpperCase();
  return TABLE_LABEL_PATTERN.test(label) ? label : null;
}
