const MAX_IDENTIFIER_LENGTH = 40;
export const TEAM_IDENTIFIER_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type CollisionStrategyOptions = {
  /** 0-based衝突回数。0の場合はサフィックスなしで返却 */
  attempt?: number;
};

/**
 * チーム名からURL-safeなスラッグを生成する。
 * - 小文字化
 * - 記号・スペースをハイフンに置換
 * - 連続ハイフン・前後のハイフンを除去
 * - アクセント・全角英数は可能な範囲でASCIIに正規化
 */
export const generateTeamIdentifier = (teamname: string): string => {
  if (!teamname) return "";

  const ascii = teamname
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => {
      const code = char.charCodeAt(0) - 0xff00;
      return code >= 0x21 && code <= 0x7e ? String.fromCharCode(code) : "";
    });

  const slug = ascii
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, MAX_IDENTIFIER_LENGTH);

  return slug;
};

export const validateTeamIdentifier = (identifier: string): string | null => {
  if (!identifier) {
    return "チーム名から有効な識別子を生成できませんでした。別のチーム名を試してください。";
  }
  if (!TEAM_IDENTIFIER_PATTERN.test(identifier)) {
    return "チーム識別子には英数字とハイフンのみが使用できます。";
  }
  return null;
};

/**
 * 既存の識別子と衝突した場合にハイフン付きのサフィックスを付与する。
 * 例: base=realraid, attempt=1 -> realraid-2
 */
export const withCollisionSuffix = (
  baseIdentifier: string,
  { attempt = 0 }: CollisionStrategyOptions = {}
): string => {
  if (attempt <= 0) return baseIdentifier;

  const suffix = `-${attempt + 1}`;
  return `${baseIdentifier}${suffix}`.slice(0, MAX_IDENTIFIER_LENGTH);
};
