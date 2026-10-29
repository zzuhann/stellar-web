import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { MAX_PHOTOS, createPhotoSlot, type VenueSubmitFormValues } from '../venueSubmitModel';

// Photo uploads for step 3 (venue-tags §D 驗證, AC-19):
// - one list; every photo lands in its own slot as soon as it finishes, in pick order
// - results merge into the latest form state, so removals and reorders made meanwhile stick
// - a failed upload keeps its slot (and position, so the cover never shifts) until retried or removed
// - a removed slot ignores whatever its upload does later
// - the submit button stays locked until every in-flight upload has settled

export type UploadPhoto = (file: File) => Promise<string>;

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;

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

function without<T>(record: Record<string, T>, id: string): Record<string, T> {
  const next = { ...record };
  delete next[id];
  return next;
}

interface Options {
  uploadPhoto: UploadPhoto;
  setForm: Dispatch<SetStateAction<VenueSubmitFormValues>>;
  onUploaded: () => void;
  onUploadError?: (error: Error, file: File) => void;
}

export function usePhotoUploads({ uploadPhoto, setForm, onUploaded, onUploadError }: Options) {
  const [inFlight, setInFlight] = useState<string[]>([]);
  // Pick-time problems (too many, wrong type); upload failures live on their slots
  const [error, setError] = useState<string | null>(null);
  const [failed, setFailed] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const removedRef = useRef(new Set<string>());

  function uploadInto(id: string, file: File) {
    setInFlight((prev) => [...prev, id]);
    setFailed((prev) => without(prev, id));
    uploadPhoto(file)
      .then((url) => {
        if (removedRef.current.has(id)) return;
        setForm((prev) => ({
          ...prev,
          photos: prev.photos.map((slot) => (slot.id === id ? { ...slot, url } : slot)),
        }));
        setPreviews((prev) => {
          revokePreview(prev[id]);
          return without(prev, id);
        });
        onUploaded();
      })
      .catch((err: unknown) => {
        if (removedRef.current.has(id)) return;
        onUploadError?.(err instanceof Error ? err : new Error('上傳失敗'), file);
        setFailed((prev) => ({ ...prev, [id]: file }));
      })
      .finally(() => setInFlight((prev) => prev.filter((x) => x !== id)));
  }

  function addPhotos(files: File[], currentCount: number) {
    setError(null);
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
      const preview = previewOf(file);
      if (preview) setPreviews((prev) => ({ ...prev, [slots[i].id]: preview }));
      uploadInto(slots[i].id, file);
    });
  }

  function retry(id: string) {
    if (failed[id]) uploadInto(id, failed[id]);
  }

  // Call when the user removes a slot
  function forget(id: string) {
    removedRef.current.add(id);
    setFailed((prev) => without(prev, id));
    setPreviews((prev) => {
      revokePreview(prev[id]);
      return without(prev, id);
    });
  }

  const failedIds = Object.keys(failed);
  return {
    isUploading: inFlight.length > 0,
    error,
    failedIds,
    previews,
    addPhotos,
    retry,
    retryAll: () => failedIds.forEach(retry),
    forget,
  };
}
