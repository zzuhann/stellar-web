import { css } from '@/styled-system/css';
import StatCounter from './StatCounter';
import FadeIn from '@/components/ui/FadeIn';
import {
  STELLAR_INSTAGRAM_URL,
  STELLAR_SPONSOR_URL,
  STELLAR_THREADS_URL,
} from '@/constants/stellarSocial';

const features = [
  {
    title: '尋找壽星',
    description: '透過當週壽星名單或搜尋功能，快速找到你喜歡的藝人或團體的生咖、應援活動。',
  },
  {
    title: '壽星地圖頁',
    description: '在互動地圖上一眼掌握附近的生咖、生日應援位置，輕鬆規劃行程。',
  },
  {
    title: '活動細節頁',
    description: '瀏覽主辦方提供的圖片、文案與社群資訊，並收藏感興趣的活動。',
  },
  {
    title: '投稿生咖・生日應援',
    description: '主辦、店家可以直接投稿活動，讓更多人快速找到你的活動。',
  },
  {
    title: '投稿藝人、團體',
    description: '協助維護平台上的偶像與團體資訊，讓 STELLAR 更加完整豐富。',
  },
  {
    title: '生咖場地',
    description: '依地區與標籤找適合辦生咖的咖啡廳與空間，查看場地資訊並直接聯絡場地。',
  },
];

const roles = [
  {
    title: 'UI/UX 設計師',
    description:
      '和我們一起規劃新功能的使用流程與介面，從需求討論、使用者流程到設計稿都會參與，設計稿會由我們實作上線，再一起看使用數據調整。適合想累積真實上線作品、對粉絲文化有感覺的你。',
  },
  {
    title: '品牌／社群經營',
    description:
      '和我們一起經營 IG 與 Threads：除了每週生咖整理，也一起發想粉絲會想分享的內容、觀察數據調整方向，並思考 STELLAR 的品牌語氣與視覺，讓更多粉絲和主辦認識這個平台。適合本身有在追星、熟悉粉圈社群生態的你。',
  },
];

const pageContainer = css({
  minHeight: '100vh',
  background: 'color.background.primary',
});

const inner = css({
  maxWidth: '600px',
  margin: '0 auto',
  paddingTop: '25',
  paddingX: '8',
  paddingBottom: '16',
  '@media (min-width: 768px)': {
    paddingX: '6',
  },
});

const divider = css({
  border: 'none',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  margin: '0',
});

const heroTitle = css({
  textStyle: 'h2',
  color: 'color.text.primary',
  letterSpacing: '-0.01em',
  margin: '0 0 20px 0',
});

const heroDesc = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  margin: '0',
  lineHeight: '1.8',
});

const statsRow = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  paddingY: '10',
});

const staticStat = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifySelf: 'center',
  gap: '1',
  textAlign: 'center',
});

const staticStatNumber = css({
  textStyle: 'h1',
  color: 'color.text.primary',
  lineHeight: '1',
});

const staticStatLabel = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  letterSpacing: '0.05em',
});

const manifestoSection = css({
  paddingY: '10',
});

const tagline = css({
  textStyle: 'h2',
  color: 'color.text.primary',
  margin: '0 0 10px 0',
  letterSpacing: '-0.01em',
});

const taglineDesc = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  margin: '0',
  lineHeight: '1.8',
});

const featuresSection = css({
  paddingTop: '10',
  paddingBottom: '2',
});

const featuresSectionLabel = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  margin: '0 0 20px 0',
});

const featureItem = css({
  display: 'flex',
  gap: '5',
  paddingY: '6',
  alignItems: 'flex-start',
});

const featureNumber = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  letterSpacing: '0.05em',
  flexShrink: '0',
  paddingTop: '1',
  minWidth: '24px',
});

const featureTitle = css({
  textStyle: 'h3',
  color: 'color.text.primary',
  margin: '0 0 6px 0',
});

const featureDesc = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  margin: '0',
  lineHeight: '1.75',
});

const paragraphGap = css({
  '& > p + p': { marginTop: '4' },
});

const roleList = css({
  listStyle: 'none',
  padding: '0',
  marginY: '6',
  display: 'flex',
  flexDirection: 'column',
  gap: '5',
});

const inlineLink = css({
  color: 'color.link',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
  _hover: { color: 'color.linkHover' },
});

const sponsorButton = css({
  display: 'inline-block',
  marginTop: '6',
  paddingY: '3',
  paddingX: '8',
  borderRadius: 'radius.lg',
  textStyle: 'button',
  fontWeight: 'semibold',
  background: 'color.primary',
  color: 'white',
  textDecoration: 'none',
  transition: 'background 0.2s ease',
  _hover: { background: 'color.primaryHover' },
});

export default function AboutPage() {
  return (
    <main id="main-content" className={pageContainer}>
      <div className={inner}>
        <section aria-label="關於 STELLAR">
          <FadeIn>
            <h1 className={heroTitle}>STELLAR 台灣生咖地圖平台</h1>
            <p className={heroDesc}>
              STELLAR
              是台灣生咖、生日應援地圖平台，透過社群的力量，由主辦、店家自主投稿，讓粉絲們可以透過地圖瀏覽的方式找到附近的生咖與生日應援、也讓主辦的心意能讓更多人看見。主辦也能在這裡找到適合辦生咖的場地。
            </p>
          </FadeIn>
        </section>

        <hr className={divider} style={{ marginTop: '40px' }} />

        <FadeIn delay={100}>
          <div className={statsRow} aria-label="平台統計">
            <StatCounter target={300} suffix="+" label="藝人・團體" />
            <StatCounter target={600} suffix="+" label="收錄活動" />
            <div className={staticStat}>
              <span className={staticStatNumber}>2025</span>
              <span className={staticStatLabel}>Est.</span>
            </div>
          </div>
        </FadeIn>

        <hr className={divider} />

        <FadeIn delay={100}>
          <section className={manifestoSection} aria-labelledby="about-origin">
            <h2 id="about-origin" className={tagline}>
              為什麼會有 STELLAR
            </h2>
            <div className={paragraphGap}>
              <p className={taglineDesc}>
                開始追星之後，每到喜歡的成員生日，就會想去他的生咖。感受他被愛著的氛圍，也認識同樣喜歡他的人。
              </p>
              <p className={taglineDesc}>
                但生咖資訊總是散落在 Threads 各處，常常翻了半天還在想：「台北真的沒有 XXX
                的生咖嗎？」，或只能等熱心的人跳出來整理。
              </p>
              <p className={taglineDesc}>
                後來看到其他國家有由粉絲共同維護的生咖
                app，覺得台灣如果也有自己的生咖地圖，就更好了！2025 年 8 月，STELLAR
                上線了。我們希望，讓想去生咖的人不再錯過，也能讓主辦用心準備的每一份心意都能被看見。
              </p>
            </div>
          </section>
        </FadeIn>

        <hr className={divider} />

        <section className={featuresSection} aria-label="主要功能">
          <h2 className={featuresSectionLabel}>Features</h2>
          {features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 60}>
              <div className={featureItem}>
                <span className={featureNumber} aria-hidden="true">
                  0{i + 1}
                </span>
                <div>
                  <h3 className={featureTitle}>{feature.title}</h3>
                  <p className={featureDesc}>{feature.description}</p>
                </div>
              </div>
              {i < features.length - 1 && <hr className={divider} />}
            </FadeIn>
          ))}
        </section>

        <hr className={divider} />

        <FadeIn delay={100}>
          <section className={manifestoSection} aria-labelledby="about-join">
            <h2 id="about-join" className={tagline}>
              一起讓 STELLAR 變成更好的平台！
            </h2>
            <p className={taglineDesc}>
              STELLAR 目前是一個我們下班後共同經營的 side
              project，沒有營收、目前沒有商業模式，正在找想讓 STELLAR 變得更好的夥伴！
            </p>
            <ul className={roleList}>
              {roles.map((role) => (
                <li key={role.title}>
                  <h3 className={featureTitle}>{role.title}</h3>
                  <p className={featureDesc}>{role.description}</p>
                </li>
              ))}
            </ul>
            <p className={taglineDesc}>
              有興趣歡迎寄信到{' '}
              <a href="mailto:stellar.taiwan.2025@gmail.com" className={inlineLink}>
                stellar.taiwan.2025@gmail.com
              </a>
              ，或私訊{' '}
              <a
                href={STELLAR_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={inlineLink}
              >
                IG
              </a>
              ／
              <a
                href={STELLAR_THREADS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={inlineLink}
              >
                Threads
              </a>{' '}
              @_stellar.tw 聊聊～
            </p>
          </section>
        </FadeIn>

        {STELLAR_SPONSOR_URL && (
          <>
            <hr className={divider} />
            <FadeIn delay={100}>
              <section className={manifestoSection} aria-labelledby="about-sponsor">
                <h2 id="about-sponsor" className={tagline}>
                  贊助 STELLAR
                </h2>
                <p className={taglineDesc}>
                  如果 STELLAR 曾經幫你找到生咖，也可以請我們喝杯咖啡，支持網站的營運費用。
                </p>
                <a
                  href={STELLAR_SPONSOR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={sponsorButton}
                >
                  請我們喝杯咖啡 ☕
                </a>
              </section>
            </FadeIn>
          </>
        )}
      </div>
    </main>
  );
}
