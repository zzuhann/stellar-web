import { css, cva } from '@/styled-system/css';
import Loading from '../Loading';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { signInAnonymously } from '@/lib/auth';
import showToast from '@/lib/toast';
import { UserIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { sendGAEvent } from '@next/third-parties/google';

const infoSection = css({
  marginBottom: '6',
});

const infoCard = css({
  backgroundColor: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  padding: '4',
  marginBottom: '3',
});

const infoTitle = css({
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  marginBottom: '2',
});

const infoText = css({
  textStyle: 'bodySmall',
  lineHeight: '1.6',
  color: 'color.text.secondary',
});

const collapsibleSection = css({
  marginBottom: '6',
});

const collapsibleTrigger = css({
  display: 'grid',
  gridTemplateColumns: '30px 1fr',
  alignItems: 'center',
  gap: '2',
  paddingY: '1',
  paddingX: '0',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  transition: 'color 0.2s ease',
  width: '100%',
  '&:hover': {
    color: 'color.text.primary',
  },
});

const collapsibleTriggerIcon = css({
  transition: 'transform 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '&[data-expanded="true"]': {
    transform: 'rotate(90deg) translateY(1px)',
  },
});

const collapsibleTriggerText = css({
  textAlign: 'left',
});

const collapsibleContent = css({
  display: 'grid',
  gridTemplateRows: '0fr',
  transition: 'grid-template-rows 0.3s ease',
  overflow: 'hidden',
  '&[data-expanded="true"]': {
    gridTemplateRows: '1fr',
  },
});

const collapsibleInner = css({
  minHeight: 0,
  paddingLeft: '5',
  paddingTop: '3',
});

const imageContainer = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
});

const styledImage = css({
  width: '100%',
  maxWidth: '280px',
  height: 'auto',
  borderRadius: 'radius.md',
});

const divider = css({
  display: 'flex',
  alignItems: 'center',
  textAlign: 'center',
  marginY: '6',
  marginX: '0',
  color: 'color.text.secondary',
  textStyle: 'caption',
  '&::before, &::after': {
    content: '""',
    flex: 1,
    borderBottom: '1px solid',
    borderColor: 'color.border.light',
  },
  '&::before': {
    marginRight: '3',
  },
  '&::after': {
    marginLeft: '3',
  },
});

const buttonGroup = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
});

const anonymousButton = cva({
  base: {
    width: '100%',
    paddingY: '3',
    paddingX: '6',
    borderRadius: 'radius.lg',
    border: '1px solid',
    borderColor: 'color.border.light',
    color: 'color.text.primary',
    textStyle: 'bodyStrong',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3',
    '&:hover:not(:disabled)': {
      background: 'color.background.tertiary',
      borderColor: 'color.border.medium',
      transform: 'translateY(-1px)',
      boxShadow: 'shadow.sm',
    },
    '&:disabled': {
      cursor: 'not-allowed',
    },
  },
  variants: {
    loading: {
      true: {
        cursor: 'not-allowed',
        opacity: '0.7',
      },
      false: {
        cursor: 'pointer',
        opacity: '1',
      },
    },
  },
});

const disclaimer = css({
  marginTop: '4',
  padding: '3',
  textStyle: 'caption',
  color: 'color.text.secondary',
  backgroundColor: 'color.background.secondary',
  borderRadius: 'radius.md',
});

type AnonymousLoginButtonProps = {
  onSuccess?: () => void;
};

const AnonymousLoginButton = ({ onSuccess }: AnonymousLoginButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { fetchUserDataByUid } = useAuth();

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);

    try {
      const { user, error } = await signInAnonymously();

      if (error) {
        showToast.error('訪客登入失敗');
      } else if (user) {
        await fetchUserDataByUid(user.uid);
        sendGAEvent('event', 'login', {
          event_page: '/',
          user_id: user.uid,
          content_id: 'anonymous',
        });
        showToast.success('以訪客模式登入');
        onSuccess?.();
      }
    } catch {
      showToast.error('訪客登入失敗');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={infoSection}>
        <div className={infoCard}>
          <div className={infoTitle}>建議透過外部瀏覽器開啟</div>
          <div className={infoText}>
            你目前在 app 內部瀏覽器中，為確保最佳體驗，建議使用一般瀏覽器開啟並登入。
          </div>
        </div>

        <div className={collapsibleSection}>
          <button
            className={collapsibleTrigger}
            onClick={() => setIsExpanded(!isExpanded)}
            type="button"
          >
            <div className={collapsibleTriggerIcon} data-expanded={isExpanded}>
              <ChevronRightIcon width={16} height={16} />
            </div>
            <span className={collapsibleTriggerText}>如何開啟外部瀏覽器？</span>
          </button>

          <div className={collapsibleContent} data-expanded={isExpanded}>
            <div className={collapsibleInner}>
              <div className={imageContainer}>
                <Image
                  src="/IAB_hint.png"
                  alt="如何開啟外部瀏覽器"
                  className={styledImage}
                  width={280}
                  height={280}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={divider}>快速繼續</div>

      <div className={buttonGroup}>
        <button
          type="button"
          onClick={handleAnonymousSignIn}
          className={anonymousButton({ loading: isLoading })}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loading
              description="登入中..."
              style={{ width: '100%', border: 'none', background: 'transparent' }}
            />
          ) : (
            <>
              <UserIcon width={20} height={20} />
              以訪客模式繼續
            </>
          )}
        </button>
      </div>

      <div className={disclaimer}>
        使用訪客模式時，投稿/收藏的資料只會儲存在此瀏覽器中。清除瀏覽器資料或更換裝置後，資料可能會遺失。
      </div>
    </>
  );
};

export default AnonymousLoginButton;
