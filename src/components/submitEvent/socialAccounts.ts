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
 * 每一列自己也可能殘留舊式逗號字串（例如使用者貼上 "a,, b,"），先攤平拆解、trim、
 * 濾空，確保不管使用者是分開打多列還是貼在單一列用逗號分隔，結果都一致。
 */
export function joinSocialAccounts(accounts: string[]): string {
  return accounts
    .flatMap((account) => account.split(','))
    .map((account) => account.trim())
    .filter((account) => account !== '')
    .join(SOCIAL_ACCOUNT_SEPARATOR);
}
