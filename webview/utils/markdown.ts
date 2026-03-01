/**
 * マークダウンのネストされたコードブロックを前処理するユーティリティ。
 *
 * エージェントがマークダウンファイルの内容を出力する際、コードブロック内に
 * コードフェンス（```）が含まれると、marked パーサーが外側のフェンスの
 * 終端と誤認し表示が崩れる。
 *
 * この前処理では、外側のフェンスをより長いバッククォート列に自動置換する
 * ことでパーサーの誤認を防ぐ。
 */

/**
 * コードブロック内にコードフェンスが含まれる場合、外側のフェンスを
 * より長いバッククォート列に置換して正しくパースできるようにする。
 *
 * 例:
 *   ````markdown          →  `````markdown
 *   Here is some code:       Here is some code:
 *   ```ts                    ```ts
 *   const x = 1;             const x = 1;
 *   ```                      ```
 *   ````                  →  `````
 */
export function preprocessNestedCodeBlocks(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const openMatch = lines[i].match(/^(\s*)((`{3,})|(~{3,}))(.*)$/);

    if (!openMatch) {
      result.push(lines[i]);
      i++;
      continue;
    }

    const indent = openMatch[1];
    const fenceStr = openMatch[3] || openMatch[4];
    const fenceChar = openMatch[3] ? "`" : "~";
    const openFenceLen = fenceStr.length;
    const info = openMatch[5]; // 言語情報等（空文字の場合もある）

    // 閉じフェンスのパターン: 同じ文字で同じ長さ以上、かつ空白のみ（情報文字列なし）
    const closeFenceRe = new RegExp(`^${indent}(${fenceChar === "`" ? "`" : "~"}{${openFenceLen},})\\s*$`);

    // 内部フェンスの開始パターン: 同じ文字で3文字以上 + 情報文字列あり
    const innerOpenRe = new RegExp(`^\\s*(${fenceChar === "`" ? "`" : "~"}{3,})\\S`);

    // ネストを追跡しながら閉じフェンスを探す
    let closingLineIndex = -1;
    let depth = 0;
    for (let j = i + 1; j < lines.length; j++) {
      if (closeFenceRe.test(lines[j])) {
        if (depth === 0) {
          closingLineIndex = j;
          break;
        }
        depth--;
      } else if (innerOpenRe.test(lines[j])) {
        depth++;
      }
    }

    if (closingLineIndex === -1) {
      // 閉じフェンスが見つからない場合はそのまま出力
      result.push(lines[i]);
      i++;
      continue;
    }

    // 内部コンテンツを収集
    const contentLines: string[] = [];
    for (let j = i + 1; j < closingLineIndex; j++) {
      contentLines.push(lines[j]);
    }

    // 内部コンテンツに含まれるフェンスの最大長を調べる
    let maxInnerFence = 0;
    for (const line of contentLines) {
      const innerMatch = line.match(fenceChar === "`" ? /`{3,}/g : /~{3,}/g);
      if (innerMatch) {
        for (const m of innerMatch) {
          maxInnerFence = Math.max(maxInnerFence, m.length);
        }
      }
    }

    if (maxInnerFence >= openFenceLen) {
      // 外側のフェンスを内部の最大フェンス長 + 1 に拡張
      const newFenceLen = maxInnerFence + 1;
      const newFence = fenceChar.repeat(newFenceLen);
      result.push(`${indent}${newFence}${info}`);
      for (const line of contentLines) {
        result.push(line);
      }
      result.push(`${indent}${newFence}`);
    } else {
      // 変更不要の場合はそのまま出力
      result.push(lines[i]);
      for (const line of contentLines) {
        result.push(line);
      }
      result.push(lines[closingLineIndex]);
    }

    i = closingLineIndex + 1;
  }

  return result.join("\n");
}
