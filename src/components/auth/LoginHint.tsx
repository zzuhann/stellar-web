import { css } from '@/styled-system/css';

const formHeader = css({
  textAlign: 'center',
  marginBottom: '32px',
});

const title = css({
  fontSize: '24px',
  fontWeight: '700',
  color: 'color.text.primary',
  margin: '0 0 8px 0',
});

const subtitle = css({
  fontSize: '14px',
  color: 'color.text.secondary',
  margin: '0',
});

const LoginHint = () => {
  return (
    <div className={formHeader}>
      <h2 className={title}>登入帳號</h2>
      <p className={subtitle}>
        若是從 IG / Threads / FB 開啟
        <br />
        建議先點擊右上角三個點點
        <br />
        再點擊<span style={{ color: '#8f2d28', fontWeight: 'bold' }}>「用外部瀏覽器開啟」</span>
        <br />
        登入會更容易哦！
      </p>
    </div>
  );
};

export default LoginHint;
