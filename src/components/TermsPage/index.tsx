import { css } from '@/styled-system/css';

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

const subSectionTitle = css({
  textStyle: 'h4',
  color: 'color.text.primary',
  margin: '20px 0 10px 0',
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

export default function TermsPage() {
  return (
    <div className={pageContainer}>
      <main id="main-content" className={mainContainer}>
        <div className={pageHeader}>
          <h1>用戶使用協議</h1>
          <p>
            本用戶使用協議（本「協議」）是 STELLAR 團隊據以營運 STELLAR
            網站及生日應援地圖服務的基本約款，規範 STELLAR 團隊與用戶的關係。
          </p>
          <p>
            於您註冊 STELLAR
            服務的帳號前，請您先完整閱讀並確認您同意本協議的全部內容，如有任何不同意之處，請您切勿使用
            STELLAR 服務；當您完成 STELLAR 會員註冊程序，作為 STELLAR
            服務的用戶時，代表您已瞭解且同意遵守本協議下示條款。
          </p>
        </div>

        <hr className={divider} />

        <div className={section}>
          <h2 className={sectionTitle}>1. 註冊和帳號使用</h2>
          <p className={paragraph}>就 STELLAR 會員帳戶之註冊及使用事宜，您聲明及保證以下事項：</p>
          <ol className={orderedList}>
            <li>
              如果您是未滿十八歲之未成年人或依中華民國法令須事先得第三人同意始得行使權利或負擔義務者，則您必須取得父母、監護人或該第三人同意後，才可以註冊為會員及使用
              STELLAR
              服務。當您完成註冊或開始使用服務時，即視為您的父母、監護人或該第三人已經充分審閱、了解及同意本協議條款，並同意您註冊成為會員及使用服務。
            </li>
            <li>
              您同意使用服務之所有內容包括意思表示等，皆以電子文件做為表示方式，且 STELLAR
              對您的所有通知皆以電子郵件或其他電子方式為之。
            </li>
            <li>您並非為其他人註冊帳號。</li>
            <li>您並未也不會註冊兩個以上的個人帳號。</li>
            <li>如果您的帳號遭停權，您不會註冊另一個帳號。</li>
            <li>
              您理解並同意，任何以您的帳號於 STELLAR
              服務中所為行為，均視為您本人或經您授權所為，您可能因此必須負擔相應的法律責任，因此您不會讓其他人透過您的帳號使用
              STELLAR 服務，亦不會將您的帳號密碼透露與他人知悉。
            </li>
            <li>
              您理解並同意，STELLAR 為一開放性社群平台，一般使用者均可自由閱覽 STELLAR
              的所有公開頁面，STELLAR
              無法防止第三人將用戶內容（定義請見下方）與您聯想在一起，因此您投稿應援活動或發佈資訊時，均應注意您所揭露的資訊可能導致陌生人或您的親友足以辨識您的真實身份，而可能對您的現實生活產生影響。
            </li>
          </ol>
        </div>

        <hr className={divider} />

        <div className={section}>
          <h2 className={sectionTitle}>2. 個人資料及隱私保護</h2>
          <p className={paragraph}>
            STELLAR 將依法保護您的個人資料及隱私。您瞭解並確認 STELLAR 已經依據個人資料保護法第 8
            條第 1 項明確告知與個人資料保護有關事項如下：
          </p>

          <h3 className={subSectionTitle}>2.1 蒐集目的</h3>
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
            <li>其他與 STELLAR 服務相關的利用</li>
          </ol>

          <h3 className={subSectionTitle}>2.2 蒐集類別</h3>
          <p className={paragraph}>
            因您使用 STELLAR 服務的程度不同，我們可能因主動（請注意，在您使用 STELLAR
            服務時，即便您未登入，我們仍然可能會辨識出您或您的裝置）或被動（如您自行投稿應援活動或發佈資訊時揭露），蒐集您的註冊資料、使用
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

          <h3 className={subSectionTitle}>2.3 利用期間及地區</h3>
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

          <h3 className={subSectionTitle}>2.4 利用對象及方式</h3>
          <ol className={orderedList}>
            <li>
              對象：STELLAR
              及其關係企業、其他業務相關之機構、依法有權機關、您所同意之對象（例如本協議第 11
              條之情形等）、STELLAR 所使用之社群媒體或軟體服務供應商。
            </li>
            <li>
              方式：以電子、書面、電話、電信、網際網路及其他方式，於蒐集之特定目的範圍內處理並利用或國際傳輸您的個人資料。
            </li>
          </ol>

          <h3 className={subSectionTitle}>2.5 其他提供或超出特定目的之使用</h3>
          <p className={paragraph}>
            此外，STELLAR
            於下列情形，亦可能將您的個人資料提供給第三人、或超出本政策之特定目的必要範圍使用：
          </p>
          <ol className={orderedList}>
            <li>受司法、警察或其他有權機關基於調查之要求時。</li>
            <li>於維護公益或保護本站或他人權益時。</li>
            <li>於您的行為違反法令或您與本站間的契約（不限於本協議）規定時。</li>
            <li>
              為維護您本人、其他會員或第三人之生命、身體、自由、財產、交易內容、個人資料之完整與安全時。
            </li>
            <li>其他合法情形。</li>
          </ol>

          <h3 className={subSectionTitle}>2.6 您對個人資料所享有之權利</h3>
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

          <h3 className={subSectionTitle}>2.7 不提供資料之影響</h3>
          <p className={paragraph}>
            如您拒絕提供部分個人資料，您可能無法完成註冊程序，或無法使用部分 STELLAR 服務。
          </p>
        </div>

        <hr className={divider} />

        <div className={section}>
          <h2 className={sectionTitle}>3. 用戶內容授權</h2>
          <p className={paragraph}>
            就您利用 STELLAR
            服務發佈之文章及其他表述內容（以下合稱為「用戶內容」），您得依法享有相關智慧財產權。惟就上述用戶內容及相關智慧財產權，您同意以下事項：
          </p>
          <ol className={orderedList}>
            <li>
              您給予 STELLAR
              永久、非專屬、可轉讓、可轉授權、免權利金的授權，授權地區為全世界，STELLAR
              依據上述授權，可以重製或其他方式利用用戶內容之全部或一部。您茲此聲明並保證您就用戶內容及其發佈擁有一切必要的權利或授權，足以有效賦予
              STELLAR 前述之授權。
            </li>
            <li>
              STELLAR 保留拒絕接受、張貼、顯示或傳輸用戶內容的權利，並有權依據站規或其他 STELLAR
              用以管理用戶行為及用戶內容之規定（以下合稱為「刪文規則」）逕行刪除您發佈的用戶內容。
            </li>
            <li>
              就上述經刪除之用戶內容，STELLAR 有權且可能已留存備份，但 STELLAR
              並無備份之義務。就您因用戶內容未儲存或刪除所生之一切風險或損失，您應自行採取防護措施，STELLAR
              概不負責，亦無義務將 STELLAR 內部留存之備份或檔案（縱有）提供給您。
            </li>
            <li>
              STELLAR
              團隊得基於推廣應援文化之目的，主動向活動主辦方或合作店家（以下合稱「內容來源方」）徵得授權後，代為將相關應援活動資訊投稿至平台。STELLAR
              團隊進行前項代理投稿前，應事先取得內容來源方之明示同意（包括但不限於透過社群媒體私訊、電子郵件或其他書面或電子方式為之）。代理投稿之內容以內容來源方所提供或公開揭露之資訊為準，如活動資訊有誤，內容來源方應自行承擔相應責任。
            </li>
          </ol>
        </div>

        <hr className={divider} />

        <div className={section}>
          <h2 className={sectionTitle}>4. 用戶內容限制</h2>
          <p className={paragraph}>用戶內容不得包含下述資訊：</p>
          <ol className={orderedList}>
            <li>刪文規則、各看板板規中禁止之內容。</li>
            <li>兒童或少年為性交、猥褻行為之圖畫、照片、影片或其他相類物品。</li>
            <li>足以引誘、媒介、暗示或其他促使人為性交易之訊息。</li>
            <li>
              足以引誘、媒介、暗示或其他使兒童或少年有遭受
              <a
                href="https://law.moj.gov.tw/LawClass/LawAll.aspx?PCode=D0050023"
                target="_blank"
                rel="noopener noreferrer"
                className={link}
              >
                兒童及少年性剝削防制條例
              </a>
              第 2 條第 1 項第 1 款至第 3 款之虞之訊息。
            </li>
            <li>
              發布之內容與兒童或青少年涉刑事案件相關，且記載相關當事人之姓名或其他足以識別其身份之資訊。
            </li>
            <li>侵害他人智慧財產權、肖像權、隱私權或其他權利之內容。</li>
            <li>違反本協議或鼓吹他人違反本協議之內容。</li>
            <li>違反法律強制或禁止規定之內容。</li>
            <li>違反公共秩序或社會善良風俗之內容。</li>
            <li>其他 STELLAR 認為應刪除，並已通知您刪除之內容。</li>
          </ol>
        </div>

        <hr className={divider} />

        <div className={section}>
          <h2 className={sectionTitle}>5. 用戶行為限制</h2>
          <p className={paragraph}>您同意不得為下列行為：</p>
          <ol className={orderedList}>
            <li>以自動化登入及操作方式蒐集 STELLAR 其他用戶的用戶內容。</li>
            <li>
              利用 STELLAR 服務，以違反個人資料保護法之方式蒐集、處理及利用 STELLAR
              其他用戶的個人資料。
            </li>
            <li>
              散播電腦病毒或惡意程式，藉由網路流量或傳輸量癱瘓 STELLAR
              網站或服務或造成系統過大負荷，或任何可能或足以干擾、中斷或影響 STELLAR
              服務正常提供之行為。
            </li>
            <li>蒐集 STELLAR 其他用戶之帳號、密碼或其他帳戶資訊，或使用其他用戶之帳號登入。</li>
            <li>
              非經 STELLAR 事前書面同意，擅自使用或複製 STELLAR
              的商標或其他智慧財產權，或移除、遮掩或變動 STELLAR 商標或智慧財產權之標示或其聲明。
            </li>
            <li>
              將您註冊之服務帳號、STELLAR
              服務或其使用權限之任何部分，出售、出借、贈與、轉讓或提供給他人使用或與他人共用。
            </li>
            <li>
              破解或以各種方式繞過任何 STELLAR
              用來防止或限制全部或部分使用服務的措施，或以解碼、破譯、反編譯、逆向工程或其他方式，試圖獲得任何
              STELLAR 服務、其網站或相關程式之原始碼或程式碼。
            </li>
            <li>發布違反前述第四條之用戶內容。</li>
            <li>
              任何涉及騷擾、猥褻、威脅、詐欺、霸凌、侵害 STELLAR 及他人權益或濫用 STELLAR
              服務之行為。
            </li>
            <li>
              任何違反法令、本協議、公共秩序或善良風俗之行為，或其他經 STELLAR 通知您停止之行為。
            </li>
          </ol>
        </div>

        <hr className={divider} />

        <div className={section}>
          <h2 className={sectionTitle}>6. 檢舉及申訴</h2>
          <p className={paragraph}>您同意 STELLAR 可以針對用戶違反本協議之行為，按下述機制處置：</p>
          <ol className={orderedList}>
            <li>
              如有任何人依據檢舉機制（包括但不限於私訊、寄信）向 STELLAR
              檢舉您的用戶內容違反本協議、STELLAR
              所發布之站規、各看板板規或符合刪文規則等規定，STELLAR 在收到前述檢舉後，得依據 STELLAR
              之裁量進行審查，並於確定違反規定後，依相關規則之規定直接刪除您的用戶內容，或依情節暫時停權或永久停權。
            </li>
            <li>
              如有任何人依據申訴機制向 STELLAR 申訴您的用戶內容侵害其個人權利，STELLAR
              不需經您的同意，即得先行將您的用戶內容取下，待您與權利人之間的紛爭解決，STELLAR
              始能回復您的用戶內容。
            </li>
            <li>
              若您有著作權相關問題，建議您可以透過以下信箱與我們聯繫：
              <a href="mailto:stellar.taiwan.2025@gmail.com" className={link}>
                stellar.taiwan.2025@gmail.com
              </a>
              。
            </li>
          </ol>
        </div>

        <hr className={divider} />

        <div className={section}>
          <h2 className={sectionTitle}>7. 行動裝置</h2>
          <ol className={orderedList}>
            <li>STELLAR 透過網頁提供 STELLAR 服務，本協議適用於所有用戶。</li>
            <li>
              您同意您的用戶內容、STELLAR 帳戶資料及所有您使用 STELLAR
              服務時建立、輸入、呈現、提交或以任何方式提供的資訊，在所有用戶使用的所有平台上同步；STELLAR
              為進行前述平台同步，得存取、重製（一部或全部）、公開傳輸、公開播送、公開口述、公開展示、改作、散布、處理及／或以其他方式利用前述內容、資料及資訊。
            </li>
          </ol>
        </div>

        <hr className={divider} />

        <div className={section}>
          <h2 className={sectionTitle}>8. 修訂</h2>
          <ol className={orderedList}>
            <li>
              STELLAR 保留未來隨時修訂本協議及相關 STELLAR 規則之權利，而無須另行通知您。STELLAR
              得以網頁公告或電子郵件或其他電子方式將前述修訂內容公開、公告或通知各會員。
            </li>
            <li>
              您有義務經常檢視本協議及相關 STELLAR
              規則之修（增）訂，如您在上述修訂生效以後，仍繼續使用 STELLAR
              服務，視為您接受上述（增）修訂。
            </li>
          </ol>
        </div>

        <hr className={divider} />

        <div className={section}>
          <h2 className={sectionTitle}>9. 聲明及免責及賠償</h2>
          <ol className={orderedList}>
            <li>
              如有任何第三人因您利用 STELLAR 服務之行為或因您發佈之用戶內容而向 STELLAR
              團隊求償，您必須負責賠償並保障 STELLAR
              團隊免受一切相關損害、損失和費用（包括法律服務費用和其他成本）。
            </li>
            <li>
              STELLAR 是一個網路平台，雖然 STELLAR
              會盡商業上合理努力，依據用戶使用協議、刪文規則及其他 STELLAR
              規則管理用戶行為及用戶內容，但您瞭解 STELLAR 無法完全免除您在 STELLAR
              上遇到其他用戶或任何第三人侵害您權利的情形，您知悉並同意在任何情況下，STELLAR
              均不為任何用戶公開或私下發佈、傳輸、寄送或進行之用戶內容、訊息或任何行為負責，亦不對前述用戶內容或訊息之正確性、完整性或內容品質為任何保證。所有因前述用戶內容或行為所生之損害，包含但不限於任何傳輸錯誤或遺漏，以及經由前述內容所衍生之任何損失等，均由您自行承擔，且
              STELLAR 團隊無須為上述情形負責。
            </li>
            <li>
              STELLAR 服務是以「現狀」以及「目前可得」狀態提供。除本協議明示規定者外，STELLAR
              均不對服務做出任何明示或默示的保證，亦不保證服務的安全性、不保證您隨時隨地均可獲得服務、不保證服務中任何缺陷或錯誤都將得到更正，也不保證您使用服務的結果將滿足您的需求。您因使用服務所生之一切利益或損失，均由您自行承擔。您瞭解
              STELLAR
              服務或有因系統故障而遲延、中斷情形，或可能造成您使用不便或資料喪失、錯誤、遭人篡改或其他損失等情形，STELLAR
              將盡商業上合理努力修復系統，但您於使用時應自行採取防護措施，STELLAR 對因使用或無法使用
              STELLAR 服務所生之一切損害不負賠償責任，您亦同意不就上述事件對 STELLAR 為任何請求。
            </li>
            <li>
              您應自行負責保管及維護 STELLAR
              服務帳戶及密碼的機密性，並為您服務帳戶下的所有活動及發表的用戶內容負責。當您密碼或帳戶有遭他人冒用、盜用或其他未經授權使用，或有任何安全性漏洞時，您同意立即通知
              STELLAR。若因您無法提供正確資訊、未能保守前述帳戶及密碼機密性或未能及時通知
              STELLAR，而遭受任何損害，您應自行承擔，STELLAR 概不負責。
            </li>
          </ol>
        </div>

        <hr className={divider} />

        <div className={section}>
          <h2 className={sectionTitle}>10. 終止</h2>
          <ol className={orderedList}>
            <li>
              STELLAR
              有權基於任何原因（例如您違反本協議、日後如有收取費用而您無法及時支付費用或帳戶有一段時間沒有任何活動等）隨時終止本協議，停止向您提供全部或部分
              STELLAR
              服務或終止您的帳戶。終止後，您的帳戶將會關閉，而且您不得再以該帳戶存取、使用或取回
              STELLAR 服務或該帳戶中的任何檔案或內容。
            </li>
            <li>
              您可以隨時申請刪除您的帳號；當您申請刪除您的帳號時，視為您已向 STELLAR
              團隊通知終止本協議。
            </li>
            <li>
              無論本協議因何原因終止，本協議下述條款於終止後仍有效力：第 2、3 條及第 9～11 條。
            </li>
          </ol>
        </div>

        <hr className={divider} />

        <div className={section}>
          <h2 className={sectionTitle}>11. 準據法及管轄法院</h2>
          <ol className={orderedList}>
            <li>本協議的準據法為中華民國法律。</li>
            <li>
              雙方就本協議之爭議或歧見，應儘先誠意協商解決，如無法於合理期間內達成協議，雙方同意專屬由臺灣台北地方法院為第一審管轄法院。
            </li>
          </ol>
        </div>

        <hr className={divider} />

        <div className={section}>
          <h2 className={sectionTitle}>12. 其他</h2>
          <ol className={orderedList}>
            <li>本協議各條文之標題僅係為閱讀方便而使用，並不影響本協議之內容及解釋。</li>
            <li>
              本協議為 STELLAR 與您之間就使用 STELLAR
              服務有關事項之完整協議，並取代先前一切書面或口頭合意。
            </li>
            <li>
              本協議中之任何規定於任何管轄地區被視為無效、違法、或無法強制執行時，僅該部分為無效、違法或無法強制執行，不影響其他條款之效力、合法性或強制性；且該規定於任何管轄地區之無效、違法或無法強制執行時，不影響其於其他管轄地區之效力、合法性或強制性或使之為無效。
            </li>
            <li>非經 STELLAR 事前書面同意，您不得轉讓本協議書之權利義務與任何第三人。</li>
            <li>本協議並非第三人利益契約，並未賦予任何第三人權利或利益。</li>
          </ol>
        </div>

        <p className={lastModified}>最後修改日期：2026 年 4 月 22 日</p>
      </main>
    </div>
  );
}
