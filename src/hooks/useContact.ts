import { useMutation } from '@tanstack/react-query';
import { contactApi, ContactRequest } from '@/lib/api';

export const useContactMutation = () => {
  return useMutation({
    mutationFn: (data: ContactRequest) => contactApi.submit(data),
  });
};
