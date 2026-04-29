import { toast } from 'sonner';

export const showToast = {
  success: (message: string) => toast.success(message),

  error: (message: string) => toast.error(message),

  warning: (message: string) => toast.warning(message),

  loading: (message: string) => toast.loading(message),

  dismiss: (toastId?: string | number) => toast.dismiss(toastId),
};

export default showToast;
