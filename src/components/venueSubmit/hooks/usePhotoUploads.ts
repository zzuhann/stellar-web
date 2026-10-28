import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { MAX_OTHER_PHOTOS, createPhotoSlot, type VenueSubmitFormValues } from '../venueSubmitModel';

// Photo uploads for step 3 (venue-tags §D 驗證, AC-19):
// - the cover follows the latest pick; an older pick finishing later is dropped silently
// - every other photo lands in its own slot as soon as it finishes, in pick order
// - results merge into the latest form state, so removals and reorders made meanwhile stick
// - the submit button stays locked until every in-flight upload has settled

export type UploadPhoto = (file: File, kind: 'cover' | 'other') => Promise<string>;

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

interface Options {
  uploadPhoto: UploadPhoto;
  setForm: Dispatch<SetStateAction<VenueSubmitFormValues>>;
  onCoverUploaded: () => void;
  onUploadError?: (error: Error, file: File, kind: 'cover' | 'other') => void;
}

export function usePhotoUploads({ uploadPhoto, setForm, onCoverUploaded, onUploadError }: Options) {
  const [inFlight, setInFlight] = useState<string[]>([]);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [failedCover, setFailedCover] = useState<File | null>(null);
  const [othersError, setOthersError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const coverSeq = useRef(0);

  const start = (id: string) => setInFlight((prev) => [...prev, id]);
  const finish = (id: string) => setInFlight((prev) => prev.filter((x) => x !== id));

  async function selectCover(file: File) {
    const invalid = validateFile(file);
    if (invalid) {
      setCoverError(invalid);
      return;
    }
    coverSeq.current += 1;
    const seq = coverSeq.current;
    const id = `cover-${seq}`;
    const isLatest = () => seq === coverSeq.current;
    setCoverError(null);
    setFailedCover(null);
    setCoverPreview(previewOf(file));
    start(id);
    try {
      const url = await uploadPhoto(file, 'cover');
      if (!isLatest()) return;
      setForm((prev) => ({ ...prev, coverPhoto: url }));
      setCoverPreview(null);
      onCoverUploaded();
    } catch (error) {
      onUploadError?.(error instanceof Error ? error : new Error(UPLOAD_FAILED), file, 'cover');
      if (!isLatest()) return;
      setCoverPreview(null);
      setCoverError(UPLOAD_FAILED);
      setFailedCover(file);
    } finally {
      finish(id);
    }
  }

  function removeCover() {
    // Invalidates any cover still uploading
    coverSeq.current += 1;
    setCoverPreview(null);
    setCoverError(null);
    setFailedCover(null);
    setForm((prev) => ({ ...prev, coverPhoto: '' }));
  }

  function addOthers(files: File[], currentCount: number) {
    setOthersError(null);
    if (currentCount + files.length > MAX_OTHER_PHOTOS) {
      setOthersError(`最多只能上傳 ${MAX_OTHER_PHOTOS} 張照片`);
      return;
    }
    const invalid = files.map(validateFile).find(Boolean);
    if (invalid) {
      setOthersError(invalid);
      return;
    }
    const slots = files.map(() => createPhotoSlot());
    // Slots are appended in pick order up front, so finish order never reorders them
    setForm((prev) => ({ ...prev, otherPhotos: [...prev.otherPhotos, ...slots] }));
    files.forEach((file, i) => {
      const { id } = slots[i];
      const preview = previewOf(file);
      if (preview) setPreviews((prev) => ({ ...prev, [id]: preview }));
      start(id);
      uploadPhoto(file, 'other')
        .then((url) => {
          setForm((prev) => ({
            ...prev,
            otherPhotos: prev.otherPhotos.map((slot) => (slot.id === id ? { ...slot, url } : slot)),
          }));
        })
        .catch((error: unknown) => {
          onUploadError?.(error instanceof Error ? error : new Error(UPLOAD_FAILED), file, 'other');
          setForm((prev) => ({
            ...prev,
            otherPhotos: prev.otherPhotos.filter((slot) => slot.id !== id),
          }));
          setOthersError('部分照片上傳失敗，請重試');
        })
        .finally(() => {
          finish(id);
          setPreviews((prev) => {
            const nextPreviews = { ...prev };
            delete nextPreviews[id];
            return nextPreviews;
          });
        });
    });
  }

  return {
    isUploading: inFlight.length > 0,
    coverUploading: inFlight.some((id) => id.startsWith('cover-')),
    coverPreview,
    coverError,
    failedCover,
    othersError,
    previews,
    selectCover,
    removeCover,
    addOthers,
  };
}
