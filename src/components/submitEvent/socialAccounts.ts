// 主辦社群欄位在後端跟資料庫都是單一字串，多帳號靠逗號分隔（例如 "stellar_tw, stellar_jp"）。
// 前端改用多列輸入框呈現，但送出時仍 join 回同樣格式的字串，維持與既有格式完全相容。
const SOCIAL_ACCOUNT_SEPARATOR = ', ';

/**
 * 將逗號分隔字串拆成多列顯示用的陣列。
 * 為了讓畫面至少顯示一列輸入框，空字串或全部為空值時回傳 ['']。
 */
export function splitSocialAccounts(value: string): string[] {
  const accounts = value
    .split(',')
    .map((account) => account.trim())
    .filter((account) => account !== '');
  return accounts.length > 0 ? accounts : [''];
}

/**
 * 將多列輸入的值 join 回逗號分隔字串。
 * 過濾空白列，避免使用者新增列未填或刪除文字留空時產生 "a, , b" 這種夾空值的結果。
 */
export function joinSocialAccounts(accounts: string[]): string {
  return accounts
    .map((account) => account.trim())
    .filter((account) => account !== '')
    .join(SOCIAL_ACCOUNT_SEPARATOR);
}
