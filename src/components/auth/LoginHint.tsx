import { css } from '@/styled-system/css';

const formHeader = css({
  textAlign: 'center',
  marginBottom: '4',
});

const title = css({
  textStyle: 'h2',
  color: 'color.text.primary',
  marginTop: '0',
  marginX: '0',
  marginBottom: '2',
});

const LoginHint = () => {
  return (
    <div className={formHeader}>
      <h2 className={title}>登入帳號</h2>
    </div>
  );
};

export default LoginHint;
