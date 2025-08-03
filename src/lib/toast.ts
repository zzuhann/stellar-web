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
        border: '1px solid #f59e0b',
        color: '#92400e',
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
