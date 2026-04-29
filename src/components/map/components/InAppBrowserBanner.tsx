import { css } from '@/styled-system/css';
import { useIsInAppBrowser } from '@/hooks/useIsInAppBrowser';

const banner = css({
  position: 'fixed',
  top: '70px',
  left: '0',
  right: '0',
  zIndex: '50',
  padding: '10px 16px',
  background: 'var(--colors-amber-50)',
  borderBottom: '1px solid',
  borderBottomColor: 'var(--colors-amber-500)',
  color: 'var(--colors-amber-800)',
  textStyle: 'bodySmall',
  textAlign: 'center',
});

const InAppBrowserBanner = () => {
  const { isInAppBrowser, loading } = useIsInAppBrowser();

  if (loading || !isInAppBrowser) return null;

  return (
    <div className={banner} role="alert">
      你目前在 app 內部瀏覽器中，建議外開瀏覽器才能順利定位喔！
    </div>
  );
};

export default InAppBrowserBanner;
