import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { CTAButton } from './styles';

export default function CTASection() {
  const router = useRouter();
  const { user, toggleAuthModal } = useAuth();

  return (
    <CTAButton
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
    </CTAButton>
  );
}
