'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import * as Sentry from '@sentry/nextjs';
import { css } from '@/styled-system/css';
import VenueSubmitForm from '@/components/venueSubmit/VenueSubmitForm';
import type { UploadPhoto } from '@/components/venueSubmit/hooks/usePhotoUploads';
import { useSubmitVenueMutation } from '@/components/admin-new/hooks/useSubmitVenueMutation';
import { venueSubmissionApi } from '@/lib/api';
import { uploadImageToAPI } from '@/lib/r2-upload';
import { CDN_DOMAIN } from '@/constants';

const pageWrapper = css({
  minHeight: '100dvh',
  paddingTop: '20',
  paddingBottom: '10',
  paddingX: '4',
  background: 'color.background.primary',
  md: { paddingTop: '24', paddingX: '6' },
});

const placeholder = css({ minHeight: '100dvh', background: 'color.background.primary' });

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
  '資料送出後會由 STELLAR 審核，通常會在 1–3 個工作天內完成。審核通過後，平台上就可以看見你們的場地資訊囉～！ 投稿後如需修改，請聯絡 STELLAR 平台（IG 或是 Threads 皆可）。';

// uploadImageToAPI compresses (800px, q0.8); compressing here too would be a second lossy pass
const uploadPhoto: UploadPhoto = async (file) => {
  const result = await uploadImageToAPI(file, undefined, '/venue-submissions/images');
  if (!result.success || !result.filename) throw new Error(result.error || '上傳失敗');
  return CDN_DOMAIN + result.filename;
};

const subscribeNoop = () => () => {};

export default function SubmitVenueClient() {
  // sessionStorage and history only exist in the browser; render the form after hydration
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const mutation = useSubmitVenueMutation({ onError: setSubmitError });

  // Forward from the success card into an old step URL starts a fresh form
  useEffect(() => {
    if (!submitted) return;
    const onPopState = () => {
      if (new URLSearchParams(window.location.search).has('step')) setSubmitted(false);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [submitted]);

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

  if (!isClient) return <main className={placeholder} />;

  return (
    <VenueSubmitForm
      submit={async (payload) => {
        setSubmitError(null);
        await mutation.mutateAsync(payload);
      }}
      isSubmitting={mutation.isPending}
      submitError={submitError}
      onSubmitted={() => {
        setSubmitError(null);
        setSubmitted(true);
      }}
      placeApi={publicPlaceApi}
      uploadPhoto={uploadPhoto}
      onUploadError={(error, file, kind) => {
        Sentry.captureException(error, {
          tags: { context: 'venue_submission_image_upload' },
          extra: { category: kind, contentType: file.type, size: file.size },
        });
      }}
    />
  );
}
