'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useArtistSearch } from '@/hooks/useArtistSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import ArtistCardLink from '../ArtistCard/ArtistCardLink';
import { useAuth } from '@/lib/auth-context';
import EmptyState from '../EmptyState';
import CTAButton from '../CTAButton';
import Loading from '../Loading';
import { css, cva } from '@/styled-system/css';
import { sendGAEvent } from '@next/third-parties/google';
import { SearchModalEntryPoint } from '@/store/useSearchModalStore';

const modalOverlay = cva({
  base: {
    position: 'fixed',
    inset: 0,
    background: 'alpha.black.50',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    transition: 'opacity 0.3s ease-out, visibility 0.3s ease-out',
    '@media (min-width: 768px)': {
      alignItems: 'center',
    },
  },
  variants: {
    isOpen: {
      true: {
        opacity: 1,
        visibility: 'visible',
      },
      false: {
        opacity: 0,
        visibility: 'hidden',
      },
    },
  },
});

const modalContent = cva({
  base: {
    background: 'color.background.primary',
    width: '100%',
    maxWidth: '600px',
    height: '80vh',
    borderRadius: '16px 16px 0 0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
    '@media (min-width: 768px)': {
      borderRadius: '16px',
      margin: '0 16px',
      minHeight: '60vh',
      maxHeight: '80vh',
      transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
    },
  },
  variants: {
    isOpen: {
      true: {
        transform: 'translateY(0)',
        '@media (min-width: 768px)': {
          transform: 'scale(1) translateY(0)',
        },
      },
      false: {
        transform: 'translateY(100%)',
        '@media (min-width: 768px)': {
          transform: 'scale(0.95) translateY(20px)',
        },
      },
    },
  },
});

const modalHeader = css({
  padding: '5',
  borderBottom: '1px solid',
  borderBottomColor: 'color.border.light',
  display: 'flex',
  alignItems: 'center',
  gap: '4',
  minWidth: 0,
  '@media (max-width: 480px)': {
    padding: '4',
    gap: '3',
  },
});

const closeButton = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  minWidth: '32px',
  borderRadius: 'radius.md',
  color: 'color.text.secondary',
  cursor: 'pointer',
  transition: 'background 0.2s ease, color 0.2s ease',
  flexShrink: 0,
  '&:hover': {
    background: 'color.background.secondary',
    color: 'color.text.primary',
  },
});

const searchInputContainer = css({
  flex: 1,
  minWidth: 0,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: '3',
  background: 'color.background.secondary',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  paddingY: '3',
  paddingX: '4',
  '& svg': {
    width: '20px',
    height: '20px',
    color: 'color.text.secondary',
    flexShrink: 0,
  },
  '@media (max-width: 480px)': {
    gap: '2',
  },
});

const searchInput = css({
  flex: 1,
  minWidth: 0,
  background: 'transparent',
  border: 'none',
  color: 'color.text.primary',
  textStyle: 'body',
  outline: 'none',
  '&::placeholder': {
    color: 'color.text.secondary',
  },
});

const resultsContainer = css({
  flex: 1,
  overflowY: 'auto',
  paddingX: '5',
  paddingBottom: '5',
  paddingTop: '0',
  minHeight: 0,
  position: 'relative',
});

const artistList = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '2',
  marginTop: '4',
  marginBottom: '4',
});

// Must match modalOverlay/modalContent's 0.3s transition above so AuthModal opens after this modal has fully faded out.
const SEARCH_MODAL_EXIT_TRANSITION_MS = 300;

interface ArtistSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
  // Null before the first open in this session, since GlobalSearchModal now mounts this eagerly to preload its chunk.
  entryPoint: SearchModalEntryPoint | null;
}

export default function ArtistSearchModal({
  isOpen,
  onClose,
  triggerRef,
  entryPoint,
}: ArtistSearchModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, toggleAuthModal } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const debouncedSearchQuery = useDebounce(inputValue, 800);

  const { data: searchResults = [], isLoading: searchLoading } =
    useArtistSearch(debouncedSearchQuery);

  const showResults = debouncedSearchQuery.trim().length > 0;
  const hasResults = searchResults.length > 0;

  useScrollLock(isOpen);

  // Focus trap with custom return focus element
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen, {
    returnFocusTo: triggerRef,
    disableAutoFocus: true, // We'll manually focus the search input
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const authHandoffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear input on any isOpen true->false flip (incl. external route-change closes) via useState, not a ref, per React's "adjusting state when a prop changes" pattern (refs can't be touched during render).
  const [previousIsOpen, setPreviousIsOpen] = useState(isOpen);
  if (previousIsOpen !== isOpen) {
    setPreviousIsOpen(isOpen);
    if (!isOpen && inputValue !== '') {
      setInputValue('');
    }
  }

  // Focus search input when modal opens & track search event
  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
      sendGAEvent('event', 'search_artist', {
        event_page: pathname,
        user_id: user?.uid ?? '',
        content_id: '',
        entry_point: entryPoint,
      });
    }
    // entryPoint/pathname only need to be read at the moment the modal opens, not on every change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user?.uid]);

  // Listener lives at document level so Escape closes the modal from any focused child (input, result card, or the CTA).
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Cleanup runs both on unmount and before every pathname change, cancelling a pending handoff so AuthModal doesn't pop up after the user has already navigated away.
  useEffect(() => {
    return () => {
      if (authHandoffTimerRef.current) {
        clearTimeout(authHandoffTimerRef.current);
        authHandoffTimerRef.current = null;
      }
    };
  }, [pathname]);

  const handleAddArtistClick = () => {
    // A handoff is already scheduled (e.g. a double-click); toggleAuthModal flips a boolean, so a second call would close AuthModal and drop its redirect.
    if (authHandoffTimerRef.current) return;
    onClose();
    if (!user) {
      // Delay past this modal's own exit transition, else its fading overlay covers AuthModal and useFocusTrap's rAF return-focus can steal back the focus AuthModal's autofocus just grabbed.
      authHandoffTimerRef.current = setTimeout(() => {
        authHandoffTimerRef.current = null;
        toggleAuthModal('/submit-artist');
      }, SEARCH_MODAL_EXIT_TRANSITION_MS);
    } else {
      router.push('/submit-artist');
    }
  };

  return (
    <div
      className={modalOverlay({ isOpen })}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="搜尋藝人"
      aria-hidden={!isOpen}
    >
      <div
        ref={focusTrapRef}
        className={modalContent({ isOpen })}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={modalHeader}>
          <div className={searchInputContainer}>
            <MagnifyingGlassIcon aria-hidden="true" />
            <input
              ref={searchInputRef}
              className={searchInput}
              type="text"
              placeholder="藝名(英文)/本名(中文)/團名"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
              aria-label="搜尋藝人"
            />
          </div>
          <button className={closeButton} onClick={onClose} aria-label="關閉搜尋">
            <XMarkIcon aria-hidden="true" width={20} height={20} />
          </button>
        </div>

        <div className={resultsContainer}>
          {!showResults ? (
            <EmptyState icon="🔍" title="搜尋藝人" description="輸入藝人名稱來尋找生日應援" />
          ) : searchLoading ? (
            <Loading
              description="搜尋中..."
              style={{ background: 'transparent', border: 'none' }}
            />
          ) : hasResults ? (
            <>
              <div className={artistList}>
                {searchResults.map((artist) => {
                  return (
                    <ArtistCardLink
                      key={artist.id}
                      artist={artist}
                      onBeforeNavigate={() => {
                        sendGAEvent('event', 'click_artist', {
                          event_page: pathname,
                          user_id: user?.uid ?? '',
                          content_id: artist.id,
                          entry_point: entryPoint,
                        });
                        onClose();
                      }}
                    />
                  );
                })}
              </div>
              <CTAButton onClick={handleAddArtistClick}>
                找不到藝人?
                <br />
                點擊前往新增藝人 ✨
              </CTAButton>
            </>
          ) : (
            <>
              <EmptyState
                icon="😔"
                title="找不到該藝人"
                description="試試其他關鍵字、檢查拼寫是否正確"
              />
              <CTAButton onClick={handleAddArtistClick}>
                找不到藝人?
                <br />
                點擊前往新增藝人 ✨
              </CTAButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
