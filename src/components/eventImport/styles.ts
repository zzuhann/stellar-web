import { css, cva } from '@/styled-system/css';

// ─── 貼上貼文文案區塊 ───────────────────────────────────────────────────

export const assistBox = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
  padding: '5',
  background: 'gray.50',
  borderRadius: 'radius.lg',
});

export const assistBoxTitle = css({
  textStyle: 'h4',
  fontWeight: 'semibold',
  color: 'color.text.primary',
  margin: '0',
});

export const assistBoxDesc = css({
  textStyle: 'bodySmall',
  color: 'gray.600',
  margin: '0',
});

export const captionTextarea = css({
  width: '100%',
  minHeight: '110px',
  paddingY: '3',
  paddingX: '4',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.lg',
  background: 'color.background.primary',
  color: 'color.text.primary',
  textStyle: 'body',
  resize: 'vertical',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  '&::placeholder': { color: 'color.text.secondary' },
  '&:focus-visible': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 3px var(--colors-alpha-primary-10)',
  },
  '&:disabled': {
    background: 'gray.100',
    color: 'color.text.disabled',
    cursor: 'not-allowed',
  },
});

export const outlineButton = cva({
  base: {
    paddingY: '2',
    paddingX: '4',
    minHeight: '44px',
    border: '1px solid',
    borderColor: 'color.primary',
    borderRadius: 'radius.md',
    background: 'color.background.primary',
    color: 'color.primary',
    textStyle: 'bodySmall',
    fontWeight: 'medium',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2',
    alignSelf: 'flex-start',
    transition: 'background 0.15s ease',
    '&:hover:not(:disabled)': { background: 'alpha.primary.10' },
    '&:disabled': {
      cursor: 'not-allowed',
      borderColor: 'color.border.light',
      color: 'color.text.disabled',
    },
    '&:focus-visible': {
      outline: '2px solid',
      outlineColor: 'color.primary',
      outlineOffset: '2px',
    },
  },
});

export const spinnerIcon = css({
  width: '14px',
  height: '14px',
  border: '2px solid transparent',
  borderTop: '2px solid currentColor',
  borderRadius: 'radius.circle',
  animation: 'spin 1s linear infinite',
  flexShrink: 0,
});

export const artistReferenceText = css({
  textStyle: 'bodySmall',
  color: 'gray.600',
  margin: '0',
});

// ─── 圖片網址輸入（封面圖／詳細圖片共用） ───────────────────────────────

export const urlInputRow = css({
  display: 'flex',
  gap: '2',
  flexWrap: 'wrap',
  alignItems: 'center',
});

export const urlInput = css({
  flex: '1',
  minWidth: '220px',
  paddingY: '2.5',
  paddingX: '3',
  minHeight: '44px',
  border: '1px solid',
  borderColor: 'color.border.light',
  borderRadius: 'radius.md',
  background: 'color.background.primary',
  color: 'color.text.primary',
  textStyle: 'bodySmall',
  '&::placeholder': { color: 'color.text.secondary' },
  '&:focus-visible': {
    outline: 'none',
    borderColor: 'color.primary',
    boxShadow: '0 0 0 3px var(--colors-alpha-primary-10)',
  },
  '&:disabled': {
    background: 'gray.100',
    color: 'color.text.disabled',
    cursor: 'not-allowed',
  },
});

export const inlineHint = css({
  textStyle: 'caption',
  color: 'gray.600',
  margin: '0',
  marginTop: '1',
});

export const inlineError = css({
  textStyle: 'caption',
  color: 'red.600',
  margin: '0',
  marginTop: '1',
});

// ─── 詳細圖片網址 tile 佇列 ────────────────────────────────────────────

export const tileGrid = css({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
  gap: '3',
});

export const tile = css({
  position: 'relative',
  aspectRatio: '1/1',
  borderRadius: 'radius.lg',
  overflow: 'hidden',
  background: 'gray.100',
  border: '1px solid',
  borderColor: 'color.border.light',
});

export const tileImage = css({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

// 視覺上是小圖示，但可點擊範圍維持 44×44（design-frontend.md〈畫面規格〉第 5 點、
// 專案 mobile-first 規範：所有可點擊元素最小 44×44px）。
export const tileRemoveButton = css({
  position: 'absolute',
  top: '0',
  right: '0',
  width: '44px',
  height: '44px',
  minWidth: '44px',
  minHeight: '44px',
  border: 'none',
  background: 'transparent',
  color: 'white',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-end',
  padding: '1',
  cursor: 'pointer',
  '& svg': {
    width: '20px',
    height: '20px',
    padding: '2px',
    borderRadius: 'radius.circle',
    background: 'alpha.black.70',
  },
  '&:hover svg': { background: 'alpha.black.90' },
});

export const tileErrorOverlay = css({
  position: 'absolute',
  inset: '0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1',
  padding: '2',
  textAlign: 'center',
});

export const tileErrorActions = css({
  position: 'absolute',
  bottom: '0',
  left: '0',
  right: '0',
  display: 'flex',
  gap: '1',
  padding: '1',
  background: 'alpha.black.60',
});

export const tileSmallButton = cva({
  base: {
    flex: '1',
    minHeight: '44px',
    paddingY: '1',
    paddingX: '1',
    border: 'none',
    borderRadius: 'radius.sm',
    textStyle: 'caption',
    cursor: 'pointer',
    color: 'white',
  },
  variants: {
    variant: {
      retry: { background: 'alpha.white.30' },
      remove: { background: 'alpha.error.90' },
    },
  },
});

export const tileErrorText = css({
  textStyle: 'caption',
  color: 'white',
  margin: '0',
});
