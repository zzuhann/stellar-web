import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message);
  },

  error: (message: string) => {
    toast.error(message);
  },

  warning: (message: string) => {
    toast(message, {
      icon: '⚠️',
      style: {
        border: '1px solid var(--colors-amber-500)',
        color: 'var(--colors-amber-800)',
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },
};

export default showToast;
