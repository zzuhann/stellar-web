import { css } from '@/styled-system/css';

const errorAlert = css({
  position: 'absolute',
  top: '16px',
  right: '16px',
  zIndex: '10',
  padding: '12px',
  maxWidth: '336px',
  borderRadius: 'radius.lg',
  background: 'rgba(254, 242, 242, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(252, 165, 165, 0.4)',
});

const errorContent = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
});

const errorIcon = css({
  color: 'color.status.error',
  fontSize: '14px',
});

const errorTitle = css({
  fontSize: '14px',
  color: 'color.status.error',
  fontWeight: '500',
});

const errorMessage = css({
  fontSize: '12px',
  color: 'color.status.error',
  marginTop: '4px',
});

type LocationErrorProps = {
  locationError: string;
};

const LocationError = ({ locationError }: LocationErrorProps) => {
  return (
    <div className={errorAlert} role="alert">
      <div className={errorContent}>
        <div className={errorIcon} aria-hidden="true">
          ⚠️
        </div>
        <div>
          <div className={errorTitle}>無法取得位置</div>
          <div className={errorMessage}>{locationError}</div>
        </div>
      </div>
    </div>
  );
};

export default LocationError;
