'use client';

import Link from 'next/link';
import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { css } from '@/styled-system/css';
import VenueForm from '@/components/admin-new/VenueForm';
import { useSubmitVenueMutation } from '@/components/admin-new/hooks/useSubmitVenueMutation';
import { venueSubmissionApi } from '@/lib/api';
import { uploadImageToAPI } from '@/lib/r2-upload';

const pageWrapper = css({
  minHeight: '100dvh',
  paddingTop: '20',
  paddingBottom: '10',
  paddingX: '4',
  background: 'color.background.primary',
  md: { paddingTop: '24', paddingX: '6' },
});

const container = css({ width: '100%', maxWidth: '640px', marginX: 'auto' });
const title = css({ textStyle: 'h3', color: 'color.text.primary', marginBottom: '2' });
const description = css({
  textStyle: 'bodySmall',
  color: 'color.text.secondary',
  marginBottom: '6',
});
const legalNotice = css({
  textStyle: 'caption',
  color: 'color.text.secondary',
  marginBottom: '6',
  lineHeight: '1.6',
  '& a': {
    color: 'color.primary',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
  },
});
const successCard = css({
  maxWidth: '560px',
  marginX: 'auto',
  padding: '6',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  background: 'white',
  textAlign: 'center',
});
const successTitle = css({ textStyle: 'h3', color: 'color.text.primary', marginBottom: '3' });
const successText = css({ textStyle: 'bodySmall', color: 'color.text.secondary' });

const publicPlaceApi = {
  autocomplete: venueSubmissionApi.autocomplete,
  getDetails: venueSubmissionApi.getPlaceDetails,
};

const SUBMISSION_NOTICE =
  '資料送出後會由 STELLAR 審核，審核通過後，平台上就可以看見你們的場地資訊囉～！ 投稿後如需修改，請聯絡 STELLAR 平台（IG 或是 Threads 皆可）。';

export default function SubmitVenueClient() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const mutation = useSubmitVenueMutation({
    onSuccess: () => setSubmitted(true),
    onError: setSubmitError,
  });

  if (submitted) {
    return (
      <main className={pageWrapper}>
        <section className={successCard} aria-labelledby="submission-success-title">
          <h1 id="submission-success-title" className={successTitle}>
            已收到場地投稿
          </h1>
          <p className={successText}>{SUBMISSION_NOTICE}</p>
        </section>
      </main>
    );
  }

  return (
    <main className={pageWrapper}>
      <div className={container}>
        <h1 className={title}>投稿場地</h1>
        <p className={description}>{SUBMISSION_NOTICE}</p>
        <p className={legalNotice}>
          送出即表示你確認有權提供上述資料與圖片，並同意我們依
          <Link href="/terms">服務條款</Link>及<Link href="/privacy">隱私權政策</Link>
          處理及公開顯示。
        </p>
        <VenueForm
          mode="create"
          onSubmit={(data) => {
            setSubmitError(null);
            mutation.mutate(data);
          }}
          isSubmitting={mutation.isPending}
          submitError={submitError}
          cancelHref="/"
          submitLabel="送出場地投稿"
          placeApi={publicPlaceApi}
          uploadImage={(file) => uploadImageToAPI(file, undefined, '/venue-submissions/images')}
          onImageUploadError={(error, file, category) => {
            Sentry.captureException(error, {
              tags: { context: 'venue_submission_image_upload' },
              extra: { category, contentType: file.type, size: file.size },
            });
          }}
        />
      </div>
    </main>
  );
}
