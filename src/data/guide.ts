export type GuideStep = {
  title: string;
  description: string | IntroSegment[];
  imageSrc?: string;
  imageAlt?: string;
};

type IntroText = { type: 'text'; content: string };
type IntroLink = { type: 'link'; content: string; href: string };
export type IntroSegment = IntroText | IntroLink;

export type GuideSection = {
  id: string;
  label: string;
  intro?: IntroSegment[];
  steps: GuideStep[];
};

export const guideSections: GuideSection[] = [
  {
    id: 'submit-event',
    label: '投稿生日應援活動',
    steps: [
      {
        title: '前往投稿頁面',
        description: [
          { type: 'text', content: '進入' },
          { type: 'link', content: '首頁', href: '/' },
          { type: 'text', content: '點擊「新增生咖」按鈕，或是' },
          { type: 'link', content: '點擊這裡', href: '/submit-event' },
          { type: 'text', content: '直接前往投稿頁面。' },
        ],
        imageSrc: '/guide/submit-event/2.png',
        imageAlt: '前往投稿頁面：首頁新增生咖按鈕位置截圖',
      },
      {
        title: '選擇藝人、團體',
        description:
          '這是為誰辦的應援活動呢？選擇那位藝人、團體後，就可以進到下一步了。（如果是聯合應援，也可以選擇多位藝人、多個團體哦！）',
        imageSrc: '/guide/submit-event/3.png',
        imageAlt: '選擇應援對象：藝人、團體選擇畫面截圖',
      },
      {
        title: '放上所有活動的資訊',
        description:
          '包括主視覺圖片、活動名稱、日期、時間、地點、詳細資訊等，一個不漏的填寫上去吧！',
        imageSrc: '/guide/submit-event/4.png',
        imageAlt: '填寫活動資訊：主視覺、名稱、日期、地點等欄位截圖',
      },
      {
        title: '送出後，等待審核',
        description: '我們會盡快審核，通過後會寄信通知給你。',
        imageSrc: '/guide/submit-event/5.png',
        imageAlt: '送出活動投稿、等待審核畫面截圖',
      },
      {
        title: '活動正式上線！',
        description: '審核通過後，所有使用者都可以在 STELLAR 平台上看到這個應援活動囉！',
        imageSrc: '/guide/submit-event/6.png',
        imageAlt: '活動審核通過、正式上線於 STELLAR 截圖',
      },
    ],
  },
  {
    id: 'submit-artist',
    label: '投稿藝人、團體',
    steps: [
      {
        title: '在首頁搜尋藝人或團體',
        description:
          '在首頁搜尋藝人或團體，如果都搜尋不到的話，可以點擊畫面下方「前往新增藝人✨」按鈕前往頁面。',
        imageSrc: '/guide/submit-artist/2-new.png',
        imageAlt: '在首頁搜尋藝人或團體：搜尋框、搜尋結果、找不到藝人按鈕位置截圖',
      },
      {
        title: '進入新增藝人頁面',
        description:
          '進入投稿頁面後，輸入藝人或團體的名稱、生日，並選擇一張照片作為他在平台上的大頭貼，最後按下送出。',
        imageSrc: '/guide/submit-artist/3.png',
        imageAlt: '進入新增藝人頁面：藝人或團體名稱、生日、大頭貼選擇畫面截圖',
      },
      {
        title: '送出後，等待審核',
        description: '我們會盡快審核，通過後會寄信通知給你。',
        imageSrc: '/guide/submit-artist/4.png',
        imageAlt: '送出藝人投稿、等待審核畫面截圖',
      },
      {
        title: '藝人、團體正式上線！',
        description:
          '審核通過後，所有使用者都可以在 STELLAR 平台上看到這個藝人、團體，並且為他們舉辦應援活動囉～！',
        imageSrc: '/guide/submit-artist/5.png',
        imageAlt: '藝人、團體審核通過、正式上線於 STELLAR 截圖',
      },
    ],
  },
];
