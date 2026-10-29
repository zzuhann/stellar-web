import { useState, type Dispatch, type SetStateAction } from 'react';
import { MAX_PHOTOS, createPhotoSlot, type VenueSubmitFormValues } from '../venueSubmitModel';

// Photo uploads for step 3 (venue-tags §D 驗證, AC-19):
// - one list; every photo lands in its own slot as soon as it finishes, in pick order
// - results merge into the latest form state, so removals and reorders made meanwhile stick
// - the submit button stays locked until every in-flight upload has settled

export type UploadPhoto = (file: File) => Promise<string>;

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

const UPLOAD_FAILED = '上傳失敗，請重試';

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return '不支援的檔案格式，請選擇 JPG、PNG 或 WebP';
  if (file.size > MAX_SIZE_MB * 1024 * 1024) return `檔案大小不能超過 ${MAX_SIZE_MB}MB`;
  return null;
}

// jsdom and some in-app browsers lack object URLs; the preview is optional
function previewOf(file: File): string | null {
  try {
    return typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : null;
  } catch {
    return null;
  }
}

function revokePreview(url: string | null | undefined) {
  if (!url) return;
  try {
    URL.revokeObjectURL(url);
  } catch {
    // jsdom / in-app browsers without object URLs
  }
}

interface Options {
  uploadPhoto: UploadPhoto;
  setForm: Dispatch<SetStateAction<VenueSubmitFormValues>>;
  onUploaded: () => void;
  onUploadError?: (error: Error, file: File) => void;
}

export function usePhotoUploads({ uploadPhoto, setForm, onUploaded, onUploadError }: Options) {
  const [inFlight, setInFlight] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Files whose upload failed, kept so one button can retry them
  const [failed, setFailed] = useState<File[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const start = (id: string) => setInFlight((prev) => [...prev, id]);
  const finish = (id: string) => setInFlight((prev) => prev.filter((x) => x !== id));

  function addPhotos(files: File[], currentCount: number) {
    setError(null);
    setFailed([]);
    if (currentCount + files.length > MAX_PHOTOS) {
      setError(`最多只能上傳 ${MAX_PHOTOS} 張照片`);
      return;
    }
    const invalid = files.map(validateFile).find(Boolean);
    if (invalid) {
      setError(invalid);
      return;
    }
    const slots = files.map(() => createPhotoSlot());
    // Slots are appended in pick order up front, so finish order never reorders them
    setForm((prev) => ({ ...prev, photos: [...prev.photos, ...slots] }));
    files.forEach((file, i) => {
      const { id } = slots[i];
      const preview = previewOf(file);
      if (preview) setPreviews((prev) => ({ ...prev, [id]: preview }));
      start(id);
      uploadPhoto(file)
        .then((url) => {
          setForm((prev) => ({
            ...prev,
            photos: prev.photos.map((slot) => (slot.id === id ? { ...slot, url } : slot)),
          }));
          onUploaded();
        })
        .catch((err: unknown) => {
          onUploadError?.(err instanceof Error ? err : new Error(UPLOAD_FAILED), file);
          setForm((prev) => ({ ...prev, photos: prev.photos.filter((slot) => slot.id !== id) }));
          setFailed((prev) => [...prev, file]);
          setError(files.length > 1 ? '部分照片上傳失敗，請重試' : UPLOAD_FAILED);
        })
        .finally(() => {
          finish(id);
          setPreviews((prev) => {
            const nextPreviews = { ...prev };
            revokePreview(nextPreviews[id]);
            delete nextPreviews[id];
            return nextPreviews;
          });
        });
    });
  }

  return { isUploading: inFlight.length > 0, error, failed, previews, addPhotos };
}
