import { toast, type ExternalToast } from 'sonner';

export const showToast = {
  success: (message: string) => toast.success(message),

  error: (message: string) => toast.error(message),

  // Optional options param (e.g. { duration }) is additive — every existing call site
  // passes none and keeps sonner's default duration.
  warning: (message: string, options?: ExternalToast) => toast.warning(message, options),

  loading: (message: string) => toast.loading(message),

  dismiss: (toastId?: string | number) => toast.dismiss(toastId),
};

export default showToast;
