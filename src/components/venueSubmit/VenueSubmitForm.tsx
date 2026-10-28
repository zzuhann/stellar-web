'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { css, cva } from '@/styled-system/css';
import type { CreateVenueSubmissionData } from '@/types';
import type { placesApi } from '@/lib/api';
import { dateToTaipeiDateString } from '@/utils';
import { useSiteChromeStore } from '@/store/useSiteChromeStore';
import StepPlace, { PLACE_INPUT_ID } from './components/StepPlace';
import StepConditions from './components/StepConditions';
import StepContact from './components/StepContact';
import LeaveDialog from './components/LeaveDialog';
import { usePhotoUploads, type UploadPhoto } from './hooks/usePhotoUploads';
import type { FormUpdater } from './formFields';
import {
  jumpBackToStep,
  pushStep,
  readStateDepth,
  replaceUrl,
  restoreDepth,
  returnToEntry,
  stepUrl,
} from './stepHistory';
import {
  DRAFT_VERSION,
  clearDraft,
  parseStepParam,
  readDraft,
  resolveInitialStep,
  writeDraft,
} from './venueSubmitDraft';
import {
  STEP_COUNT,
  STEP_META,
  buildSubmissionPayload,
  createEmptyForm,
  hasAnyInput,
  validateAllSteps,
  validateStep,
  type FormErrors,
  type SubmitStep,
  type VenueSubmitFormValues,
} from './venueSubmitModel';
import { srOnly, stepBody } from './styles';

// ─── CSS ──────────────────────────────────────────────────────────────────────

const page = css({
  minHeight: '100dvh',
  display: 'flex',
  flexDirection: 'column',
  background: 'color.background.primary',
});

const topBar = css({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  background: 'color.background.primary',
  paddingTop: 'env(safe-area-inset-top)',
});

const topBarInner = css({
  width: '100%',
  maxWidth: '560px',
  marginX: 'auto',
  minHeight: '56px',
  paddingX: '2',
  display: 'grid',
  gridTemplateColumns: '44px 1fr 44px',
  alignItems: 'center',
});

const topIconButton = css({
  width: '44px',
  height: '44px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  borderRadius: 'radius.md',
  background: 'transparent',
  color: 'color.text.primary',
  cursor: 'pointer',
  '&:hover:not(:disabled)': { background: 'color.background.secondary' },
  '&:active:not(:disabled)': { background: 'gray.100' },
  '&:focus-visible': { outline: '2px solid', outlineColor: 'color.primary' },
  '&:disabled': { opacity: 0.4, cursor: 'not-allowed' },
  '& svg': { width: '24px', height: '24px' },
});

const topTitle = css({
  margin: 0,
  textAlign: 'center',
  textStyle: 'bodySmall',
  fontWeight: 'semibold',
  color: 'color.text.primary',
});

const stepCount = css({
  textAlign: 'center',
  textStyle: 'caption',
  color: 'color.text.secondary',
  fontVariantNumeric: 'tabular-nums',
});

const progressTrack = css({ height: '4px', background: 'gray.100' });

const progressFill = cva({
  base: { height: '100%', background: 'color.primary', transition: 'width 0.2s ease' },
  variants: {
    step: { 1: { width: '33.333%' }, 2: { width: '66.667%' }, 3: { width: '100%' } },
  },
});

const content = css({
  flex: 1,
  width: '100%',
  maxWidth: '560px',
  marginX: 'auto',
  paddingX: '4',
  paddingTop: '6',
  paddingBottom: '8',
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
});

const eyebrow = css({ margin: 0, textStyle: 'caption', color: 'color.text.secondary' });

const title = css({
  margin: 0,
  textStyle: 'h2',
  color: 'color.text.primary',
  '&:focus': { outline: 'none' },
  '&:focus-visible': { outline: '2px solid', outlineColor: 'color.primary' },
});

const lead = css({ margin: 0, textStyle: 'bodySmall', color: 'color.text.secondary' });

const bodyWrap = css({ marginTop: '4' });

// Sticky (not fixed) so it takes flow space and never covers the last field
const bottomBar = css({
  position: 'sticky',
  bottom: 0,
  zIndex: 10,
  background: 'color.background.primary',
  borderTop: '1px solid',
  borderTopColor: 'color.border.light',
  paddingTop: '3',
  paddingX: '4',
  paddingBottom: 'calc(token(spacing.3) + env(safe-area-inset-bottom))',
});

const bottomInner = css({ width: '100%', maxWidth: '560px', marginX: 'auto' });

const primaryButton = css({
  width: '100%',
  minHeight: '48px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  borderRadius: 'radius.md',
  background: 'color.primary',
  color: 'color.background.primary',
  textStyle: 'bodyStrong',
  cursor: 'pointer',
  '&:hover:not(:disabled)': { background: 'color.primaryHover' },
  '&:active:not(:disabled)': { background: 'color.primaryActive' },
  '&:focus-visible': { outline: '2px solid', outlineColor: 'color.primary', outlineOffset: '2px' },
  '&:disabled': { cursor: 'not-allowed', opacity: 0.7 },
});

const spinner = css({
  width: '20px',
  height: '20px',
  border: '2px solid',
  borderColor: 'alpha.white.30',
  borderTopColor: 'color.background.primary',
  borderRadius: 'radius.circle',
  animation: 'spin 1s linear infinite',
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getToday = () => dateToTaipeiDateString(new Date());

type FocusRequest = { kind: 'heading' | 'errors'; n: number };

// Read once on mount; the parent only renders this component on the client
function readInitialState() {
  const draft = readDraft();
  const urlStep = parseStepParam(window.location.search);
  const step = resolveInitialStep(urlStep, draft);
  const stateDepth = readStateDepth(window.history.state);
  // Only entries the form wrote carry ?step; a fresh push into the form starts at depth 0
  const draftDepth = new URLSearchParams(window.location.search).has('step')
    ? (draft?.depth ?? null)
    : null;
  // No usable draft but deep in the steps: we will retreat to the entry (depth 0)
  const returnToStart = !draft && urlStep > 1;
  return {
    draft,
    urlStep,
    step,
    returnToStart,
    draftDepth,
    depth: returnToStart ? 0 : (stateDepth ?? draftDepth ?? 0),
  };
}

function focusFirstInvalid(container: HTMLElement | null) {
  const el = container?.querySelector<HTMLElement>('[aria-invalid="true"]');
  if (!el) return;
  el.scrollIntoView?.({ block: 'center' });
  // Group questions land on their first option
  const target = el.matches('fieldset')
    ? el.querySelector<HTMLElement>('input, button, textarea')
    : el;
  target?.focus({ preventScroll: true });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface VenueSubmitFormProps {
  // Resolves on 2xx; rejects on failure (the parent turns the error into submitError)
  submit: (payload: CreateVenueSubmissionData) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmitted: () => void;
  placeApi: typeof placesApi;
  uploadPhoto: UploadPhoto;
  onUploadError?: (error: Error, file: File, kind: 'cover' | 'other') => void;
}

export default function VenueSubmitForm({
  submit,
  isSubmitting,
  submitError,
  onSubmitted,
  placeApi,
  uploadPhoto,
  onUploadError,
}: VenueSubmitFormProps) {
  const router = useRouter();
  const setChromeHidden = useSiteChromeStore((state) => state.setHidden);

  const [init] = useState(readInitialState);
  const [form, setForm] = useState<VenueSubmitFormValues>(
    () => init.draft?.form ?? createEmptyForm()
  );
  const [step, setStep] = useState<SubmitStep>(init.step);
  const [maxStep, setMaxStep] = useState<SubmitStep>(init.draft?.maxStep ?? 1);
  const [depth, setDepth] = useState(init.depth);
  // Restored drafts show no errors; validation runs again on the next button press
  const [errors, setErrors] = useState<FormErrors>({});
  const [phase, setPhase] = useState<'editing' | 'leaving' | 'done'>('editing');
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const [focusPlaceSearch, setFocusPlaceSearch] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pendingLandingRef = useRef<(() => void) | null>(null);
  const focusErrorsOnLandRef = useRef(false);
  const maxStepRef = useRef<SubmitStep>(init.draft?.maxStep ?? 1);
  const submittingRef = useRef(false);
  const historyInitRef = useRef(false);

  const photos = usePhotoUploads({
    uploadPhoto,
    setForm,
    onCoverUploaded: () => clearErrors(['coverPhoto']),
    onUploadError,
  });

  const dirty = phase === 'editing' && hasAnyInput(form);
  const busy = isSubmitting || (step === 3 && photos.isUploading);

  function clearErrors(keys: string[]) {
    if (keys.length === 0) return;
    setErrors((prev) => {
      if (!keys.some((key) => key in prev)) return prev;
      const next = { ...prev };
      for (const key of keys) delete next[key];
      return next;
    });
  }

  const update: FormUpdater = (updater, clear) => {
    setForm(updater);
    clearErrors(clear);
  };

  const requestFocus = (kind: FocusRequest['kind']) =>
    setFocusRequest((prev) => ({ kind, n: (prev?.n ?? 0) + 1 }));

  function raiseMaxStep(next: SubmitStep) {
    if (next <= maxStepRef.current) return;
    maxStepRef.current = next;
    setMaxStep(next);
  }

  function goNext() {
    const stepErrors = validateStep(step, form, getToday());
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) {
      requestFocus('errors');
      return;
    }
    const nextStep = (step + 1) as SubmitStep;
    setDepth(pushStep(window.history, stepUrl(window.location, nextStep)));
    raiseMaxStep(nextStep);
    setStep(nextStep);
    requestFocus('heading');
  }

  async function handleSubmit() {
    if (submittingRef.current || photos.isUploading) return;
    const { firstStep, errors: allErrors } = validateAllSteps(form, getToday());
    if (firstStep !== null) {
      setErrors(allErrors);
      if (firstStep === step) {
        requestFocus('errors');
        return;
      }
      const mode = jumpBackToStep(
        window.history,
        step,
        firstStep,
        stepUrl(window.location, firstStep)
      );
      if (mode === 'go') {
        focusErrorsOnLandRef.current = true;
      } else {
        setStep(firstStep);
        requestFocus('errors');
      }
      return;
    }

    setErrors({});
    submittingRef.current = true;
    try {
      await submit(buildSubmissionPayload(form));
    } catch {
      submittingRef.current = false;
      return;
    }
    setPhase('done');
    clearDraft();
    // Retreat to the entry so one back press leaves the page (venue-tags §D 處理上一頁紀錄)
    pendingLandingRef.current = returnToEntry(
      window.history,
      stepUrl(window.location, null),
      onSubmitted
    );
  }

  function leave() {
    setLeaveOpen(false);
    setPhase('leaving');
    clearDraft();
    pendingLandingRef.current = returnToEntry(window.history, stepUrl(window.location, 1), () =>
      router.replace('/')
    );
  }

  function resetPlace() {
    update((prev) => ({ ...prev, place: null }), ['place']);
    setFocusPlaceSearch((n) => n + 1);
  }

  // Draft: every change, including the history depth of the entry we are on
  useEffect(() => {
    if (phase !== 'editing') return;
    writeDraft({ version: DRAFT_VERSION, form, maxStep, depth });
  }, [form, maxStep, depth, phase]);

  // One-time history fix-up. The ref survives StrictMode's effect re-run, which would
  // otherwise fire history.go(-depth) twice and land two entries too far back.
  useEffect(() => {
    if (historyInitRef.current) return;
    historyInitRef.current = true;
    const { history, location } = window;
    if (init.returnToStart) {
      pendingLandingRef.current = returnToEntry(history, stepUrl(location, 1), () => {});
      return;
    }
    restoreDepth(history, init.draftDepth);
    if (init.step !== init.urlStep || !new URLSearchParams(location.search).has('step')) {
      replaceUrl(history, stepUrl(location, init.step));
    }
    // init is frozen at mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Back / forward
  useEffect(() => {
    const { history, location } = window;
    const onPopState = (event: PopStateEvent) => {
      const landing = pendingLandingRef.current;
      if (landing) {
        pendingLandingRef.current = null;
        landing();
        return;
      }
      const urlStep = parseStepParam(window.location.search);
      if (urlStep > maxStepRef.current) {
        // Forward into steps this draft never reached (e.g. after the draft was cleared)
        const target = maxStepRef.current;
        if (jumpBackToStep(history, urlStep, target, stepUrl(location, target)) === 'replace') {
          setStep(target);
          requestFocus('heading');
        }
        return;
      }
      const stateDepth = readStateDepth(event.state);
      if (stateDepth !== null) setDepth(stateDepth);
      setStep(urlStep);
      const focusErrors = focusErrorsOnLandRef.current;
      focusErrorsOnLandRef.current = false;
      requestFocus(focusErrors ? 'errors' : 'heading');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (!focusRequest) return;
    if (focusRequest.kind === 'heading') {
      window.scrollTo?.(0, 0);
      headingRef.current?.focus({ preventScroll: true });
    } else {
      focusFirstInvalid(containerRef.current);
    }
  }, [focusRequest]);

  useEffect(() => {
    if (focusPlaceSearch > 0) document.getElementById(PLACE_INPUT_ID)?.focus();
  }, [focusPlaceSearch]);

  useEffect(() => {
    if (!dirty) return;
    // Reload restores the draft, but the browser cannot tell reload from closing the tab
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    setChromeHidden(true);
    return () => setChromeHidden(false);
  }, [setChromeHidden]);

  const meta = STEP_META[step];
  const buttonLabel = step < STEP_COUNT ? '下一步' : '送出投稿';
  const busyLabel = isSubmitting ? '送出中' : '照片上傳中';

  return (
    <div className={page}>
      <header className={topBar}>
        <div className={topBarInner}>
          {step === 1 ? (
            <button
              type="button"
              className={topIconButton}
              aria-label="離開投稿"
              onClick={() => (dirty ? setLeaveOpen(true) : leave())}
            >
              <XMarkIcon aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              className={topIconButton}
              aria-label="上一步"
              disabled={isSubmitting}
              onClick={() => window.history.back()}
            >
              <ChevronLeftIcon aria-hidden="true" />
            </button>
          )}
          <p className={topTitle}>投稿場地</p>
          <span className={stepCount}>
            {step}／{STEP_COUNT}
          </span>
        </div>
        <div className={progressTrack} aria-hidden="true">
          <div className={progressFill({ step })} />
        </div>
      </header>

      <main className={content} ref={containerRef}>
        <p className={eyebrow}>
          第 {step} 步・{meta.name}
        </p>
        <h1 ref={headingRef} tabIndex={-1} className={title}>
          {meta.heading}
        </h1>
        {step === 1 && <p className={lead}>請搜尋店名，店名和地址會自動帶入。</p>}
        <div className={`${stepBody} ${bodyWrap}`}>
          {step === 1 && (
            <StepPlace
              form={form}
              errors={errors}
              update={update}
              placeApi={placeApi}
              onResetPlace={resetPlace}
            />
          )}
          {step === 2 && (
            <StepConditions form={form} errors={errors} today={getToday()} update={update} />
          )}
          {step === 3 && (
            <StepContact
              form={form}
              errors={errors}
              update={update}
              photos={photos}
              submitError={submitError}
            />
          )}
        </div>
      </main>

      <div className={bottomBar}>
        <div className={bottomInner}>
          <button
            type="button"
            className={primaryButton}
            disabled={busy}
            aria-busy={busy ? 'true' : undefined}
            onClick={step < STEP_COUNT ? goNext : handleSubmit}
          >
            {busy ? (
              <>
                <span className={spinner} aria-hidden="true" />
                <span className={srOnly}>{busyLabel}</span>
              </>
            ) : (
              buttonLabel
            )}
          </button>
        </div>
      </div>

      <LeaveDialog open={leaveOpen} onStay={() => setLeaveOpen(false)} onLeave={leave} />
    </div>
  );
}
