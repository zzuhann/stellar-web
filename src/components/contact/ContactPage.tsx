'use client';

import { css } from '@/styled-system/css';
import { useState } from 'react';
import Link from 'next/link';
import { usePageView } from '@/hooks/usePageView';
import { useContactMutation } from '@/hooks/useContact';

type FormData = {
  name: string;
  email: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = '請輸入暱稱';
  if (!data.email.trim()) {
    errors.email = '請輸入 email';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = '請輸入正確的 email 格式';
  }
  if (!data.message.trim()) errors.message = '請輸入內容';
  return errors;
}

const pageContainer = css({
  minHeight: '100vh',
  background: 'color.background.primary',
});

const inner = css({
  maxWidth: '600px',
  margin: '0 auto',
  paddingTop: '25',
  paddingX: '8',
  paddingBottom: '16',
  '@media (min-width: 768px)': {
    paddingX: '6',
  },
});

const divider = css({
  border: 'none',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  margin: '0',
});

const pageTitle = css({
  textStyle: 'h2',
  color: 'color.text.primary',
  letterSpacing: '-0.01em',
  margin: '0 0 16px 0',
});

const bodyText = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  margin: '0',
  lineHeight: '1.8',
});

const emailLink = css({
  color: 'color.link',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
  _hover: { color: 'color.linkHover' },
});

const formStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '6',
});

const formGroup = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
});

const fieldLabel = css({
  textStyle: 'bodySmall',
  fontWeight: 'medium',
  color: 'color.text.primary',
  display: 'flex',
  alignItems: 'center',
  gap: '2',
});

const requiredMark = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
});

const inputStyle = css({
  width: '100%',
  paddingY: '3',
  paddingX: '4',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  background: 'color.background.primary',
  color: 'color.text.primary',
  textStyle: 'body',
  transition: 'all 0.2s ease',
  '&::placeholder': { color: 'color.text.disabled' },
  '&:focus': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 3px var(--colors-alpha-primary-10)',
  },
  '&[aria-invalid="true"]': {
    borderColor: 'color.status.error',
  },
});

const textareaStyle = css({
  width: '100%',
  paddingY: '3',
  paddingX: '4',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  background: 'color.background.primary',
  color: 'color.text.primary',
  textStyle: 'body',
  transition: 'all 0.2s ease',
  resize: 'vertical',
  minHeight: '140px',
  '&::placeholder': { color: 'color.text.disabled' },
  '&:focus': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 3px var(--colors-alpha-primary-10)',
  },
  '&[aria-invalid="true"]': {
    borderColor: 'color.status.error',
  },
});

const fieldError = css({
  textStyle: 'caption',
  color: 'color.status.error',
  margin: '0',
});

const buttonsRow = css({
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  flexWrap: 'wrap',
});

const submitButton = css({
  paddingY: '3',
  paddingX: '8',
  borderRadius: 'radius.lg',
  textStyle: 'button',
  fontWeight: 'semibold',
  background: 'color.primary',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  _hover: { background: 'color.primaryHover' },
  '&:disabled': { background: 'color.text.disabled', cursor: 'not-allowed' },
});

const submitError = css({
  textStyle: 'caption',
  color: 'color.status.error',
  margin: '0',
});

const successSection = css({
  paddingTop: '10',
  display: 'flex',
  flexDirection: 'column',
  gap: '4',
});

export default function ContactPage() {
  usePageView({ eventPage: '/contact' });

  const [formData, setFormData] = useState<FormData>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const mutation = useContactMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    mutation.mutate(formData);
  };

  if (mutation.isSuccess) {
    return (
      <main id="main-content" className={pageContainer}>
        <div className={inner}>
          <div className={successSection}>
            <h1 className={pageTitle}>感謝你的訊息</h1>
            <p className={bodyText}>我們已收到你的訊息，會盡快與你聯繫。</p>
            <Link
              href="/"
              className={submitButton}
              style={{ display: 'inline-block', width: 'fit-content' }}
            >
              回首頁
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className={pageContainer}>
      <div className={inner}>
        <section aria-label="聯絡我們">
          <h1 className={pageTitle}>聯絡我們</h1>
          <p className={bodyText}>
            若有任何問題或建議，請填寫下方表單，我們將盡快回覆。下列提供的聯絡資訊僅用於必要聯繫，不做其他用途。
          </p>
          <p className={bodyText} style={{ marginTop: '12px' }}>
            也可以直接透過 email 聯絡{' '}
            <a href="mailto:stellar.taiwan.2025@gmail.com" className={emailLink}>
              stellar.taiwan.2025@gmail.com
            </a>
            ，或是私訊 Threads{' '}
            <a
              href="https://www.threads.net/@_stellar.tw"
              target="_blank"
              rel="noopener noreferrer"
              className={emailLink}
            >
              @_stellar.tw
            </a>
            。
          </p>
        </section>

        <hr className={divider} style={{ marginTop: '32px', marginBottom: '32px' }} />

        <section aria-label="聯絡表單">
          <form onSubmit={handleSubmit} noValidate className={formStyles}>
            <div className={formGroup}>
              <label htmlFor="contact-name" className={fieldLabel}>
                暱稱 <span className={requiredMark}>*</span>
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                className={inputStyle}
                placeholder="請輸入暱稱…"
                value={formData.name}
                onChange={handleChange}
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'contact-name-error' : undefined}
              />
              {errors.name && (
                <p id="contact-name-error" className={fieldError} role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            <div className={formGroup}>
              <label htmlFor="contact-email" className={fieldLabel}>
                電子郵件 <span className={requiredMark}>*</span>
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                className={inputStyle}
                placeholder="請輸入電子郵件…"
                value={formData.email}
                onChange={handleChange}
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'contact-email-error' : undefined}
              />
              {errors.email && (
                <p id="contact-email-error" className={fieldError} role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            <div className={formGroup}>
              <label htmlFor="contact-message" className={fieldLabel}>
                內容 <span className={requiredMark}>*</span>
              </label>
              <textarea
                id="contact-message"
                name="message"
                className={textareaStyle}
                placeholder="請輸入內容…"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                aria-required="true"
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? 'contact-message-error' : undefined}
              />
              {errors.message && (
                <p id="contact-message-error" className={fieldError} role="alert">
                  {errors.message}
                </p>
              )}
            </div>

            {mutation.isError && (
              <p className={submitError} role="alert">
                送出失敗，請稍後再試，或直接透過 email 聯絡我們。
              </p>
            )}

            <div className={buttonsRow}>
              <button
                type="submit"
                className={submitButton}
                disabled={mutation.isPending}
                aria-label="送出聯絡表單"
              >
                {mutation.isPending ? '送出中…' : '送出'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
