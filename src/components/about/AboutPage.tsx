'use client';

import { css } from '@/styled-system/css';
import { usePageView } from '@/hooks/usePageView';
import StatCounter from './StatCounter';
import FadeIn from '@/components/ui/FadeIn';

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

export default function AboutPage() {
  usePageView({ eventPage: '/about' });

  return (
    <main id="main-content" className={pageContainer}>
      <div className={inner}>
        <section aria-label="關於 STELLAR">
          <FadeIn>
            <h1 className={heroTitle}>STELLAR 台灣生咖地圖平台</h1>
            <p className={heroDesc}>
              STELLAR
              是台灣生咖、生日應援地圖平台，透過社群的力量，由主辦、店家自主投稿，讓粉絲們可以透過地圖瀏覽的方式找到附近的生咖與生日應援、也讓主辦的心意能讓更多人看見。
            </p>
          </FadeIn>
        </section>

        <hr className={divider} style={{ marginTop: '40px' }} />

        <FadeIn delay={100}>
          <div className={statsRow} aria-label="平台統計">
            <StatCounter target={300} suffix="+" label="藝人・團體" />
            <StatCounter target={300} suffix="+" label="收錄活動" />
            <div className={staticStat}>
              <span className={staticStatNumber}>2025</span>
              <span className={staticStatLabel}>Est.</span>
            </div>
          </div>
        </FadeIn>

        <hr className={divider} />

        <FadeIn delay={100}>
          <div className={manifestoSection}>
            <h2 className={tagline}>生咖 × 地圖 × 應援</h2>
            <p className={taglineDesc}>
              從搜尋、地圖瀏覽到活動細節，STELLAR
              把散落各處的資訊整合成一個平台，讓每一場心意都能被更多人看見。
            </p>
          </div>
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
      </div>
    </main>
  );
}
