// https://www.w3.org/TR/2018/REC-ttml1-20181108/#timing-value-timeExpression

export function parseTtmlTimeToMs(
  value: string | number | undefined,
): number | undefined {
  if (value == null) return undefined;
  if (typeof value === "number") return value;
  let v = String(value).trim();
  if (!v) return undefined;
  v = v.replace(",", ".");

  if (/^-?\d+(?:\.\d+)?ms$/i.test(v)) return parseFloat(v);
  if (/^-?\d+(?:\.\d+)?s$/i.test(v)) return Math.round(parseFloat(v) * 1000);
  if (/^-?\d+(?:\.\d+)?m$/i.test(v)) return Math.round(parseFloat(v) * 60_000);
  if (/^-?\d+(?:\.\d+)?h$/i.test(v))
    return Math.round(parseFloat(v) * 3_600_000);

  if (/^\d{1,2}:(?:\d{2}):(?:\d{2}(?:\.\d{1,3})?)$/.test(v)) {
    const [hh, mm, ss] = v.split(":");
    const sec = parseFloat(ss);
    return Math.round((Number(hh) * 3600 + Number(mm) * 60 + sec) * 1000);
  }
  if (/^\d{1,2}:(?:\d{2}(?:\.\d{1,3})?)$/.test(v)) {
    const [mm, ss] = v.split(":");
    const sec = parseFloat(ss);
    return Math.round((Number(mm) * 60 + sec) * 1000);
  }
  if (/^\d+(?:\.\d{1,3})?$/.test(v)) {
    return Math.round(parseFloat(v) * 1000);
  }

  return undefined;
}
