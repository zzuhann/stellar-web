import { cva } from '@/styled-system/css';
import useMapLocation from '../hook/useMapLocation';
import Loading from '@/components/Loading';
import { MapPinIcon } from '@heroicons/react/24/outline';

const locationButton = cva({
  base: {
    position: 'absolute',
    bottom: '100px',
    right: '20px',
    zIndex: '10',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'color.background.primary',
    border: '1px solid',
    borderColor: 'color.border.light',
    boxShadow: 'shadow.md',
    color: 'color.text.primary',
    transition: 'all 0.2s ease',
    '&:hover:not(:disabled)': {
      background: 'color.background.secondary',
      borderColor: 'color.border.medium',
      boxShadow: 'shadow.lg',
      transform: 'scale(1.05)',
    },
    '&:active:not(:disabled)': {
      transform: 'scale(0.95)',
    },
    '&:disabled': {
      opacity: '0.6',
    },
  },
  variants: {
    loading: {
      true: {
        cursor: 'not-allowed',
      },
      false: {
        cursor: 'pointer',
      },
    },
    visible: {
      true: {
        opacity: '1',
        transform: 'scale(1)',
        pointerEvents: 'auto',
      },
      false: {
        opacity: '0',
        transform: 'scale(0.8)',
        pointerEvents: 'none',
      },
    },
  },
});

const LocationButton = () => {
  const { locationLoading, handleLocateMe, shouldShowLocationButton } = useMapLocation();

  return (
    <button
      className={locationButton({
        loading: locationLoading,
        visible: shouldShowLocationButton(),
      })}
      onClick={handleLocateMe}
      disabled={locationLoading}
      type="button"
      aria-label="定位到我的位置"
      aria-disabled={locationLoading}
    >
      {locationLoading ? <Loading /> : <MapPinIcon width={20} height={20} aria-hidden="true" />}
    </button>
  );
};

export default LocationButton;
