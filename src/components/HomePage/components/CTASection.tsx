import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { css } from '@/styled-system/css';

const ctaButton = css({
  padding: '12px 24px',
  borderRadius: 'radius.lg',
  fontSize: '14px',
  fontWeight: 600,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: '1px solid',
  background: 'color.primary',
  borderColor: 'color.primary',
  color: 'white',
  maxWidth: '60%',
  margin: '0 auto',
});

export default function CTASection() {
  const router = useRouter();
  const { user, toggleAuthModal } = useAuth();

  return (
    <button
      className={ctaButton}
      onClick={() => {
        if (!user) {
          toggleAuthModal('/submit-event');
        } else {
          router.push('/submit-event');
        }
      }}
    >
      生日應援主辦 ✨
      <br />
      前往投稿生日應援 ➡️
    </button>
  );
}
