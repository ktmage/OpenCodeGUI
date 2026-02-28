export type DiffLine = { type: "context" | "add" | "remove"; text: string };

export function computeLineDiff(oldStr: string, newStr: string): DiffLine[] {
  const oldLines = oldStr.split("\n");
  const newLines = newStr.split("\n");
  const result: DiffLine[] = [];

  const n = oldLines.length;
  const m = newLines.length;
  if (n > 500 || m > 500) {
    for (const line of oldLines) result.push({ type: "remove", text: line });
    for (const line of newLines) result.push({ type: "add", text: line });
    return result;
  }

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const raw: DiffLine[] = [];
  let i = n,
    j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      raw.push({ type: "context", text: oldLines[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      raw.push({ type: "add", text: newLines[j - 1] });
      j--;
    } else {
      raw.push({ type: "remove", text: oldLines[i - 1] });
      i--;
    }
  }
  raw.reverse();

  const hasChange = (idx: number) => raw[idx]?.type !== "context";
  for (let k = 0; k < raw.length; k++) {
    if (raw[k].type !== "context") {
      result.push(raw[k]);
    } else {
      let nearChange = false;
      for (let d = -2; d <= 2; d++) {
        if (hasChange(k + d)) {
          nearChange = true;
          break;
        }
      }
      if (nearChange) result.push(raw[k]);
    }
  }

  return result;
}
