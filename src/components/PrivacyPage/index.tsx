import { css } from '@/styled-system/css';
import Link from 'next/link';

const pageContainer = css({
  minHeight: '100vh',
  background: 'color.background.primary',
});

const mainContainer = css({
  maxWidth: '800px',
  margin: '0 auto',
  paddingTop: '25',
  paddingX: '4',
  paddingBottom: '16',
  '@media (min-width: 768px)': {
    paddingX: '6',
  },
});

const pageHeader = css({
  marginBottom: '10',
  '& h1': {
    textStyle: 'h1',
    color: 'color.text.primary',
    margin: '0 0 12px 0',
  },
  '& p': {
    textStyle: 'body',
    color: 'color.text.secondary',
    lineHeight: '1.8',
    margin: '0 0 8px 0',
  },
});

const divider = css({
  border: 'none',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  margin: '8 0',
});

const section = css({
  marginBottom: '10',
});

const sectionTitle = css({
  textStyle: 'h2',
  color: 'color.text.primary',
  margin: '0 0 16px 0',
});

const paragraph = css({
  textStyle: 'body',
  color: 'color.text.secondary',
  lineHeight: '1.8',
  margin: '0 0 12px 0',
});

const orderedList = css({
  listStyleType: 'decimal',
  paddingLeft: '6',
  margin: '0 0 12px 0',
  '& li': {
    textStyle: 'body',
    color: 'color.text.secondary',
    lineHeight: '1.8',
    marginBottom: '8px',
    display: 'list-item',
  },
});

const link = css({
  color: 'color.text.primary',
  textDecoration: 'underline',
  '&:hover': {
    opacity: 0.7,
  },
});

const lastModified = css({
  textStyle: 'bodySmall',
  color: 'color.text.tertiary',
  marginTop: '10',
});

export default function PrivacyPage() {
  return (
    <div className={pageContainer}>
      <main id="main-content" className={mainContainer}>
        <div className={pageHeader}>
          <h1>隱私權政策</h1>
          <p>
            STELLAR
            團隊重視您的隱私，本政策說明我們如何蒐集、處理及利用您的個人資料，依個人資料保護法第 8
            條第 1 項明確告知相關事項。
          </p>
          <p>
            使用 STELLAR 服務即代表您同意本政策內容，以及我們的{' '}
            <Link href="/terms" className={link}>
              服務條款
            </Link>
            。
          </p>
        </div>

        <hr className={divider} />

        <div className={section}>
          <h2 className={sectionTitle}>1. 蒐集目的</h2>
          <p className={paragraph}>
            STELLAR 蒐集您的個人資料，以提供您 STELLAR 服務，特定目的包括：
          </p>
          <ol className={orderedList}>
            <li>行銷（特定目的項目 040）</li>
            <li>會員或其他成員名冊之內部管理（特定目的項目 052）</li>
            <li>非公務機關依法定義務所進行個人資料之蒐集處理及利用（特定目的項目 063）</li>
            <li>契約、類契約或其他法律關係事務（特定目的項目 069）</li>
            <li>消費者、客戶管理與服務（特定目的項目 090）</li>
            <li>調查、統計與研究分析（特定目的項目 157）</li>
            <li>平台內容投稿、審核、公開展示、聯絡與爭議處理</li>
            <li>其他與 STELLAR 服務相關的利用</li>
          </ol>
        </div>

        <hr className={divider} />

        <div className={section}>
          <h2 className={sectionTitle}>2. 蒐集類別</h2>
          <p className={paragraph}>
            因您使用 STELLAR 服務的程度不同，我們可能因主動（請注意，在您使用 STELLAR
            服務時，即便您未登入，我們仍然可能會辨識出您或您的裝置）或被動（如您自行投稿應援活動、場地或發佈資訊時揭露），蒐集您的註冊資料、使用
            STELLAR
            服務的活動紀錄，包括但不限於您的所在位置、瀏覽應援活動的喜好、投稿紀錄、收藏紀錄、上網的
            IP 位址、裝置資訊、使用時間、瀏覽及點選紀錄及其他 STELLAR
            因您使用服務所取得之一切資訊等，實際的資料端視您的使用情形，惟可能包括下列類型：
          </p>
          <ol className={orderedList}>
            <li>
              辨識個人者：如消費者之姓名、職稱、住址、工作地址、以前地址、住家電話號碼、行動電話、即時通帳號、網路平臺申請之帳號、通訊及戶籍地址、相片、電子郵遞地址、電子簽章、憑證卡序號、憑證序號、提供網路身分認證或申辦查詢服務之紀錄及其他任何可辨識資料本人者等。（類別代號
              C001）
            </li>
            <li>個人描述：如年齡、性別、出生年月日、出生地、國籍等。（類別代號 C011）</li>
            <li>休閒活動及興趣：如嗜好、運動及其他興趣等。（類別代號 C035）</li>
            <li>
              生活格調：如使用消費品之種類及服務之細節、個人或家庭之消費模式等。（類別代號 C036）
            </li>
            <li>著作：如書籍、文章、報告、視聽出版品及其他著作等。（類別代號 C056）</li>
          </ol>
          <p className={paragraph}>
            當您投稿場地時，我們可能蒐集場地名稱、地址、地區、鄰近捷運、容納人數、場地說明、社群帳號、聯絡連結、圖片、投稿時間，以及為維護服務安全所需的
            IP
            位址、裝置與錯誤紀錄。場地名稱、地址、交通資訊、容納人數、場地說明、社群帳號、聯絡連結及圖片，經審核通過後可能公開顯示於
            STELLAR。
          </p>
        </div>

        <hr className={divider} />

        <div className={section}>
          <h2 className={sectionTitle}>3. 利用期間及地區</h2>
          <ol className={orderedList}>
            <li>
              STELLAR 將於營運期間持續保存您的個人資料，STELLAR
              將所蒐集之個人資料，儲存於我們購買或租用的儲存空間，實際儲存地點可能因伺服器位置不同而改變（可能包括臺灣、日本），您同意我們無須為了單純的伺服器儲存位置改變而對您為通知。
            </li>
            <li>
              STELLAR 的使用者可能於全球任何地點登入並使用 STELLAR
              服務，因此您理解並同意，於此範圍內我們得於全球地區利用您的個人資料，以完善提供 STELLAR
              服務。
            </li>
          </ol>
        </div>

        <hr className={divider} />

        <div className={section}>
          <h2 className={sectionTitle}>4. 利用對象及方式</h2>
          <ol className={orderedList}>
            <li>
              對象：STELLAR 及其關係企業、其他業務相關之機構、依法有權機關、您所同意之對象、STELLAR
              所使用之雲端儲存、地圖、分析、錯誤監控、電子郵件、社群媒體或其他軟體服務供應商，以及瀏覽公開場地頁面的使用者。
            </li>
            <li>
              方式：以電子、書面、電話、電信、網際網路及其他方式，於蒐集之特定目的範圍內處理並利用或國際傳輸您的個人資料。
            </li>
            <li>
              場地投稿資料將用於投稿審核、場地頁面建立與公開展示、提供使用者聯繫場地、處理更正或下架請求、防止濫用，以及維護與改善
              STELLAR 服務。
            </li>
          </ol>
        </div>

        <hr className={divider} />

        <div className={section}>
          <h2 className={sectionTitle}>5. 其他提供或超出特定目的之使用</h2>
          <p className={paragraph}>
            此外，STELLAR
            於下列情形，亦可能將您的個人資料提供給第三人、或超出本政策之特定目的必要範圍使用：
          </p>
          <ol className={orderedList}>
            <li>受司法、警察或其他有權機關基於調查之要求時。</li>
            <li>於維護公益或保護本站或他人權益時。</li>
            <li>於您的行為違反法令或您與本站間的契約規定時。</li>
            <li>
              為維護您本人、其他會員或第三人之生命、身體、自由、財產、交易內容、個人資料之完整與安全時。
            </li>
            <li>其他合法情形。</li>
          </ol>
        </div>

        <hr className={divider} />

        <div className={section}>
          <h2 className={sectionTitle}>6. 您對個人資料所享有之權利</h2>
          <p className={paragraph}>
            就您的個人資料，您有更改用戶名稱的權利；其餘請求請以電子郵件寄至：
            <a href="mailto:stellar.taiwan.2025@gmail.com" className={link}>
              stellar.taiwan.2025@gmail.com
            </a>
            ，本站將於收悉後與您聯繫及處理。您理解並同意，為了保護您的隱私，我們可能於您行使本項權利時，以查驗身份證明文件，或其他我們認為適合的方式，驗證請求人的身份，且依個人資料保護法規定，於您查詢或請求閱覽個人資料或製給複製本時，我們得向您酌收必要成本費用：
          </p>
          <ol className={orderedList}>
            <li>查詢或請求閱覽。</li>
            <li>請求製給複製本。</li>
            <li>請求補充或更正。</li>
            <li>請求停止蒐集、處理或利用。</li>
            <li>
              請求刪除。惟 STELLAR 仍會以無法直接識別您個人的方式，保留您的
              Email、用戶名稱等不重複資料。
            </li>
          </ol>
        </div>

        <hr className={divider} />

        <div className={section}>
          <h2 className={sectionTitle}>7. 不提供資料之影響</h2>
          <p className={paragraph}>
            如您拒絕提供部分個人資料，您可能無法完成註冊、活動或場地投稿程序，或無法使用部分 STELLAR
            服務。
          </p>
        </div>

        <p className={lastModified}>
          最後修改日期：2026 年 7 月 21 日
          <br />
          修訂摘要：新增場地投稿資料的蒐集、審核、公開展示及外部服務處理說明。
        </p>
      </main>
    </div>
  );
}
