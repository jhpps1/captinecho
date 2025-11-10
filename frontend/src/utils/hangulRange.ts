// U+AC00(가) ~ U+D7A3(힣)까지 생성 유틸
export const HANGUL_START = 0xac00;
export const HANGUL_END = 0xd7a3;
export const HANGUL_TOTAL = HANGUL_END - HANGUL_START + 1; // 11172

export function getHangulSyllable(index: number): string {
  const code = HANGUL_START + index;
  if (code < HANGUL_START || code > HANGUL_END) throw new Error('out of range');
  return String.fromCharCode(code);
}

export function getHangulPage(page: number, pageSize: number): string[] {
  const startIndex = page * pageSize;
  const endIndex = Math.min(startIndex + pageSize, HANGUL_TOTAL);
  const arr: string[] = [];
  for (let i = startIndex; i < endIndex; i++) {
    arr.push(String.fromCharCode(HANGUL_START + i));
  }
  return arr;
}
