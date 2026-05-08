import { css } from '@/styled-system/css';
import Link from 'next/link';
import { guideSections, IntroSegment } from '@/data/guide';
import StepItem from './StepItem';
import GuideTabNav from './GuideTabNav';

const pageContainer = css({
  minHeight: '100vh',
  background: 'color.background.primary',
});

const inner = css({
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
  marginBottom: '8',
});

const pageTitle = css({
  textStyle: 'h1',
  color: 'color.text.primary',
  margin: '0 0 8px 0',
});

const pageSubtitle = css({
  textStyle: 'body',
  color: 'color.text.secondary',
  margin: '0',
});

const stepList = css({
  listStyle: 'none',
  padding: '0',
  margin: '0',
  display: 'flex',
  flexDirection: 'column',
  gap: '12',
});

const sectionIntro = css({
  textStyle: 'body',
  color: 'color.text.secondary',
  marginBottom: '8',
  lineHeight: '1.8',
});

const introLink = css({
  color: 'color.primary',
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
});

const renderIntro = (segments: IntroSegment[]) =>
  segments.map((seg, i) =>
    seg.type === 'link' ? (
      <Link key={i} href={seg.href} className={introLink}>
        {seg.content}
      </Link>
    ) : (
      <span key={i}>{seg.content}</span>
    )
  );

type GuidePageProps = {
  activeId: string;
};

const GuidePage = ({ activeId }: GuidePageProps) => {
  const activeSection = guideSections.find((s) => s.id === activeId) ?? guideSections[0];
  const navSections = guideSections.map(({ id, label }) => ({ id, label }));

  return (
    <main id="main-content" className={pageContainer}>
      <div className={inner}>
        <header className={pageHeader}>
          <h1 className={pageTitle}>投稿方式</h1>
          <p className={pageSubtitle}>
            了解如何在 STELLAR 投稿生咖、生日應援與藝人、團體，只需要幾個步驟就可以完成投稿囉！
          </p>
        </header>

        <GuideTabNav sections={navSections} activeId={activeId} />

        <div
          role="tabpanel"
          id={`panel-${activeSection.id}`}
          aria-labelledby={`tab-${activeSection.id}`}
        >
          {activeSection.intro && (
            <p className={sectionIntro}>{renderIntro(activeSection.intro)}</p>
          )}
          <ol className={stepList} aria-label={activeSection.label}>
            {activeSection.steps.map((step, index) => (
              <StepItem key={index} step={step} index={index} />
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
};

export default GuidePage;
