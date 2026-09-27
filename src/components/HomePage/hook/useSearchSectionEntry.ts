import { useRef } from 'react';
import { useSearchModalStore } from '@/store/useSearchModalStore';

// Isolated from HomePageContent so this wiring can be unit-tested without mounting the full page.
const useSearchSectionEntry = () => {
  const openSearchModal = useSearchModalStore((state) => state.open);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);

  const onSearchClick = () => openSearchModal('search_section', searchTriggerRef);

  return { searchTriggerRef, onSearchClick };
};

export default useSearchSectionEntry;
