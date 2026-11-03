// Desktop photo grid on the venue detail page (venue-tags design-frontend §B desktop, TC-145)

export interface PhotoCellPlacement {
  column: string; // grid-column
  row: string; // grid-row
}

export interface DesktopPhotoLayout {
  height: number; // px
  columns: string; // grid-template-columns
  rows: string; // grid-template-rows
  cells: PhotoCellPlacement[]; // one per visible photo; the cover is always cells[0], the largest
  showAllCount: number | null; // "查看全部 N 張照片" only from 6 photos up
}

export interface Size {
  width: number;
  height: number;
}

const COVER_SPANNING: PhotoCellPlacement = { column: '1', row: '1 / span 2' };

export function getDesktopPhotoLayout(count: number): DesktopPhotoLayout | null {
  if (count <= 0) return null;
  const showAllCount = count >= 6 ? count : null;

  if (count === 1) {
    return {
      height: 360,
      columns: '1fr',
      rows: '1fr',
      cells: [{ column: '1', row: '1' }],
      showAllCount,
    };
  }
  if (count === 2) {
    return {
      height: 400,
      columns: '1fr 1fr',
      rows: '1fr',
      cells: [
        { column: '1', row: '1' },
        { column: '2', row: '1' },
      ],
      showAllCount,
    };
  }
  if (count === 3) {
    return {
      height: 400,
      columns: '3fr 2fr',
      rows: '1fr 1fr',
      cells: [COVER_SPANNING, { column: '2', row: '1' }, { column: '2', row: '2' }],
      showAllCount,
    };
  }
  if (count === 4) {
    return {
      height: 400,
      columns: '3fr 1fr 1fr',
      rows: '1fr 1fr',
      cells: [
        COVER_SPANNING,
        { column: '2 / span 2', row: '1' },
        { column: '2', row: '2' },
        { column: '3', row: '2' },
      ],
      showAllCount,
    };
  }
  return {
    height: 400,
    columns: '3fr 2fr 2fr',
    rows: '1fr 1fr',
    cells: [
      COVER_SPANNING,
      { column: '2', row: '1' },
      { column: '3', row: '1' },
      { column: '2', row: '2' },
      { column: '3', row: '2' },
    ],
    showAllCount,
  };
}

type Orientation = 'landscape' | 'portrait' | 'square';

const orientationOf = ({ width, height }: Size): Orientation =>
  width === height ? 'square' : width > height ? 'landscape' : 'portrait';

// Same orientation → crop to fill; crossed → show whole photo over its own blurred copy.
// Unknown sizes (not loaded / not laid out yet) fill first, so nothing flashes letterboxed.
export function getPhotoFit(photo: Size | null, cell: Size | null): 'cover' | 'contain' {
  if (!photo || !cell || !photo.width || !photo.height || !cell.width || !cell.height) {
    return 'cover';
  }
  const p = orientationOf(photo);
  const c = orientationOf(cell);
  if (p === 'square' || c === 'square') return 'cover';
  return p === c ? 'cover' : 'contain';
}
