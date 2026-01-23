import { css } from '@/styled-system/css';

const formHeader = css({
  textAlign: 'center',
  marginBottom: '16px',
});

const title = css({
  fontSize: '24px',
  fontWeight: '700',
  color: 'color.text.primary',
  margin: '0 0 8px 0',
});

const LoginHint = () => {
  return (
    <div className={formHeader}>
      <h2 className={title}>登入帳號</h2>
    </div>
  );
};

export default LoginHint;
