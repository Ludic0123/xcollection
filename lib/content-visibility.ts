// Reserved prefix used by our production posting checks. Keep these records
// available for administration, but exclude them from normal feeds and counts.
export const TEST_CONTENT_PREFIX = '【動作確認テスト】'
export const TEST_CONTENT_PATTERN = TEST_CONTENT_PREFIX + '%'

export function isTestContent(title: string) {
  return title.startsWith(TEST_CONTENT_PREFIX)
}
