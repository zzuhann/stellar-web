import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, vi } from 'vitest';
import SubmitVenueClient from '@/app/submit-venue/SubmitVenueClient';
import { DEPTH_KEY } from '../stepHistory';
import { DRAFT_KEY, DRAFT_VERSION, serializeDraft } from '../venueSubmitDraft';
import {
  createEmptyForm,
  createPhotoSlot,
  type SubmitStep,
  type VenueSubmitFormValues,
} from '../venueSubmitModel';

// Shared helpers for the store form integration tests; each test file declares its own vi.mock

export const PLACE_A = {
  place_id: 'place-1',
  address: '台北市中山區 A 路 1 號',
  coordinates: { lat: 25.05, lng: 121.52 },
  name: 'A 咖啡',
  city: '台北市',
  types: ['cafe', 'establishment'],
};

export function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <SubmitVenueClient />
    </QueryClientProvider>
  );
}

// jsdom keeps one history per file; give every test real step entries like a browser would
export function seedHistory(step: SubmitStep) {
  window.history.replaceState({ [DEPTH_KEY]: 0 }, '', '/submit-venue?step=1');
  for (let s = 2; s <= step; s += 1) {
    window.history.pushState({ [DEPTH_KEY]: s - 1 }, '', `/submit-venue?step=${s}`);
  }
}

export function resetBrowserState() {
  window.sessionStorage.clear();
  window.history.replaceState(null, '', '/submit-venue');
}

export function filledForm(overrides: Partial<VenueSubmitFormValues> = {}): VenueSubmitFormValues {
  return {
    ...createEmptyForm(),
    place: {
      placeId: 'place-1',
      label: 'A 咖啡',
      address: '台北市中山區 A 路 1 號',
      lat: 25.05,
      lng: 121.52,
    },
    name: 'A 咖啡',
    region: '台北',
    capacityRange: '20-40',
    uses: { options: ['goods_distribution'], discussable: false },
    services: { options: ['custom_menu'], discussable: false },
    spaceTypes: ['cafe'],
    preferredContact: 'instagram',
    instagram: 'stellar_cafe',
    photos: [createPhotoSlot('https://cdn.test/cover.jpg')],
    ...overrides,
  };
}

export function storeDraft(
  form: VenueSubmitFormValues,
  { maxStep = 3, depth = 2 }: { maxStep?: SubmitStep; depth?: number } = {}
) {
  window.sessionStorage.setItem(
    DRAFT_KEY,
    serializeDraft({ version: DRAFT_VERSION, form, maxStep, depth })
  );
}

export const readStoredDraft = () => {
  const raw = window.sessionStorage.getItem(DRAFT_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const heading = () => screen.getByRole('heading', { level: 1 });

export async function waitForStep(step: SubmitStep) {
  await waitFor(() => expect(screen.getByText(new RegExp(`^第 ${step} 步・`))).toBeTruthy());
}

export function chooseDropdown(label: string, option: string) {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${label}：`) }));
  fireEvent.click(screen.getByRole('option', { name: option }));
}

export function next() {
  fireEvent.click(screen.getByRole('button', { name: '下一步' }));
}

export function submit() {
  fireEvent.click(screen.getByRole('button', { name: '送出投稿' }));
}

export async function fillStep1() {
  fireEvent.click(screen.getByRole('button', { name: '選 A 咖啡' }));
  chooseDropdown('地區', '台北');
  chooseDropdown('場地大約可以容納多少人？', '20-40人');
}

export function check(name: string | RegExp, container: HTMLElement = document.body) {
  fireEvent.click(within(container).getByRole('checkbox', { name }));
}

export function fillStep2() {
  check('發放應援物');
  check('客製餐點');
  check('咖啡廳');
}

export const fieldset = (legend: string | RegExp) => screen.getByRole('group', { name: legend });

export function fillStep3Contact() {
  fireEvent.click(screen.getByRole('radio', { name: 'Instagram 私訊' }));
  fireEvent.change(screen.getByLabelText('Instagram 帳號'), {
    target: { value: 'stellar_cafe' },
  });
}

export const photoInput = () => screen.getByTestId('photo-file-input') as HTMLInputElement;

export const imageFile = (name: string) => new File(['x'], name, { type: 'image/png' });

export function selectFiles(input: HTMLInputElement, files: File[]) {
  fireEvent.change(input, { target: { files } });
}

// Controllable uploads: each call waits until resolved/rejected by the test
export function controlledUploads(mock: ReturnType<typeof vi.fn>) {
  const calls: {
    name: string;
    resolve: (filename: string) => void;
    reject: () => void;
  }[] = [];
  mock.mockImplementation(
    (file: File) =>
      new Promise((resolve) => {
        calls.push({
          name: file.name,
          resolve: (filename) => resolve({ success: true, filename }),
          reject: () => resolve({ success: false, error: '上傳失敗' }),
        });
      })
  );
  return {
    calls,
    async settle(index: number, outcome: string | 'fail') {
      await act(async () => {
        if (outcome === 'fail') calls[index].reject();
        else calls[index].resolve(outcome);
      });
    },
  };
}

export async function goThroughToStep3() {
  await fillStep1();
  next();
  await waitForStep(2);
  fillStep2();
  next();
  await waitForStep(3);
}
