import Link from 'next/link';
import { css } from '@/styled-system/css';

export type FAQItem = {
  question: string;
  answer: React.ReactNode;
  answerText: string;
};

export type FAQSection = {
  label: string;
  items: FAQItem[];
};

const inlineLink = css({
  color: 'color.link',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
  _hover: { color: 'color.linkHover' },
});

const ThreadsLink = () => (
  <a
    href="https://www.threads.net/@_stellar.tw"
    target="_blank"
    rel="noopener noreferrer"
    className={inlineLink}
  >
    @_stellar.tw
  </a>
);

const ContactLink = ({ children }: { children: React.ReactNode }) => (
  <Link href="/contact" className={inlineLink}>
    {children}
  </Link>
);

export const faqs: FAQSection[] = [
  {
    label: '生咖、生日應援',
    items: [
      {
        question: '什麼是生咖？',
        answer:
          '生咖源自「生日咖啡廳」，泛指粉絲自發為喜歡的藝人、團體或角色舉辦的應援活動。形式不限於咖啡廳，也包含應援物發放、出道週年慶等活動——只要有明確日期與地點、在台灣舉辦，都可以在 STELLAR 上找到。',
        answerText:
          '生咖源自「生日咖啡廳」，泛指粉絲自發為喜歡的藝人、團體或角色舉辦的應援活動。形式不限於咖啡廳，也包含應援物發放、出道週年慶等活動——只要有明確日期與地點、在台灣舉辦，都可以在 STELLAR 上找到。',
      },
      {
        question: '如何找到特定藝人的活動？',
        answer: '可以在首頁使用當週壽星功能切換尋找，或使用搜尋功能輸入藝人名稱搜尋。',
        answerText: '可以在首頁使用當週壽星功能切換尋找，或使用搜尋功能輸入藝人名稱搜尋。',
      },
      {
        question: '找不到我想找的藝人怎麼辦？',
        answer:
          '可以透過「投稿藝人」功能協助新增，填寫藝人基本資訊送出後，審核通過即會出現在平台上。',
        answerText:
          '可以透過「投稿藝人」功能協助新增，填寫藝人基本資訊送出後，審核通過即會出現在平台上。',
      },
      {
        question: '活動資訊有誤怎麼辦？',
        answer: (
          <>
            可直接透過<ContactLink>聯絡頁面</ContactLink>告知，或私訊 Threads <ThreadsLink />
            ，我們會盡快更新或下架。
          </>
        ),
        answerText:
          '可直接透過聯絡頁面（https://www.stellar-zone.com/contact）告知，或私訊 Threads @_stellar.tw，我們會盡快更新或下架。',
      },
      {
        question: '如何收藏・追蹤活動？',
        answer:
          '可以收藏該活動，收藏後可以在「我的收藏」頁面中查看。或是進入活動頁面，點擊「加入行事曆」按鈕，將活動加入 Google 行事曆。',
        answerText:
          '可以收藏該活動，收藏後可以在「我的收藏」頁面中查看。或是進入活動頁面，點擊「加入行事曆」按鈕，將活動加入 Google 行事曆。',
      },
    ],
  },
  {
    label: '投稿與審核',
    items: [
      {
        question: '只有生咖可以投稿嗎？',
        answer:
          '不限生咖！單純發放應援物的生日應援、出道週年應援等都歡迎投稿。只要與藝人相關、有明確日期與地點，且活動在台灣，都可以投稿。',
        answerText:
          '不限生咖！單純發放應援物的生日應援、出道週年應援等都歡迎投稿。只要與藝人相關、有明確日期與地點，且活動在台灣，都可以投稿。',
      },
      {
        question: '如何投稿活動？',
        answer: (
          <>
            進入首頁後點擊「新增生咖」按鈕，或是直接進入{' '}
            <Link href="/submit-event" className={inlineLink}>
              投稿活動頁面
            </Link>
            ，填寫活動資訊後送出，通過審核後即會顯示在平台上。
          </>
        ),
        answerText:
          '進入首頁後點擊「新增生咖」按鈕，或是直接進入投稿活動頁面（https://www.stellar-zone.com/submit-event），填寫活動資訊後送出，通過審核後即會顯示在平台上。',
      },
      {
        question: '審核需要多久？',
        answer: (
          <>
            通常在 1–3 個工作天內完成審核。若超過此時間還在審核中，歡迎透過
            <ContactLink>聯絡頁面</ContactLink>或私訊 Threads <ThreadsLink /> 詢問進度。
          </>
        ),
        answerText:
          '通常在 1–3 個工作天內完成審核。若超過此時間還在審核中，歡迎透過聯絡頁面（https://www.stellar-zone.com/contact）或私訊 Threads @_stellar.tw 詢問進度。',
      },
      {
        question: '審核未通過的話怎麼辦？',
        answer: (
          <>
            審核未通過會收到通知並說明原因，修改後可重新送出審核。如果有任何問題也可以透過
            <ContactLink>聯絡頁面</ContactLink>或私訊 Threads <ThreadsLink /> 詢問。
          </>
        ),
        answerText:
          '審核未通過會收到通知並說明原因，修改後可重新送出審核。如果有任何問題也可以透過聯絡頁面（https://www.stellar-zone.com/contact）或私訊 Threads @_stellar.tw 詢問。',
      },
      {
        question: '投稿後可以修改活動資訊嗎？',
        answer: '可以。登入後前往「我的投稿」，找到該活動進行編輯。',
        answerText: '可以。登入後前往「我的投稿」，找到該活動進行編輯。',
      },
      {
        question: '如何下架或刪除活動？',
        answer: (
          <>
            如果是自己投稿的活動，可以進入{' '}
            <Link href="/my-submissions" className={inlineLink}>
              我的投稿頁面
            </Link>
            ，找到該活動進行刪除。如果活動資訊有誤，可以透過
            <ContactLink>聯絡頁面</ContactLink>或私訊 Threads <ThreadsLink />{' '}
            告知，我們會盡快更新或下架。
          </>
        ),
        answerText:
          '如果是自己投稿的活動，可以進入我的投稿頁面（https://www.stellar-zone.com/my-submissions），找到該活動進行刪除。如果活動資訊有誤，可以透過聯絡頁面（https://www.stellar-zone.com/contact）或私訊 Threads @_stellar.tw 告知，我們會盡快更新或下架。',
      },
    ],
  },
  {
    label: '帳號・平台',
    items: [
      {
        question: 'STELLAR 是免費使用的嗎？',
        answer: '目前 STELLAR 對粉絲與主辦方均免費使用。',
        answerText: '目前 STELLAR 對粉絲與主辦方均免費使用。',
      },
      {
        question: '註冊的使用者資料會如何使用？',
        answer: (
          <>
            目前主要使用您在註冊時提供的帳號
            ID、名稱及電子信箱，用於寄送審核結果通知以及記錄您的投稿活動。詳情請參閱{' '}
            <Link href="/privacy" className={inlineLink}>
              隱私權政策
            </Link>
            。
          </>
        ),
        answerText:
          '目前主要使用您在註冊時提供的帳號 ID、名稱及電子信箱，用於寄送審核結果通知以及記錄您的投稿活動。詳情請參閱隱私權政策（https://www.stellar-zone.com/privacy）。',
      },
      {
        question: '如何聯絡 STELLAR？',
        answer: (
          <>
            可透過<ContactLink>聯絡頁面</ContactLink>填寫表單，或直接寄信至{' '}
            <a href="mailto:stellar.taiwan.2025@gmail.com" className={inlineLink}>
              stellar.taiwan.2025@gmail.com
            </a>
            ，也可私訊 Threads <ThreadsLink />。
          </>
        ),
        answerText:
          '可透過聯絡頁面（https://www.stellar-zone.com/contact）填寫表單，或直接寄信至 stellar.taiwan.2025@gmail.com，也可私訊 Threads @_stellar.tw。',
      },
      {
        question: '平台目前支援哪些地區？',
        answer: '目前以台灣地區的活動為主。',
        answerText: '目前以台灣地區的活動為主。',
      },
    ],
  },
];
