import type { TransitStop, TransitType } from '@/types';

// Transit stop rows shared by the store form, the admin form and the detail page
// (venue-tags design-frontend §D step 1, design-backend §10)

export interface TransitRowValue {
  id: string; // stable across removals so errors and focus stay on the right row
  type: TransitType | '';
  station: string;
  walkMinutes: string; // digits only, '' = not filled
}

export interface TransitRowErrors {
  type?: string;
  station?: string;
}

export const MAX_TRANSIT_ROWS = 5;

export const TRANSIT_TYPE_OPTIONS: { value: TransitType; label: string }[] = [
  { value: 'mrt', label: '捷運' },
  { value: 'light_rail', label: '輕軌' },
  { value: 'train', label: '火車站' },
  { value: 'hsr', label: '高鐵' },
  { value: 'bus', label: '公車站' },
];

export const TRANSIT_TYPE_ERROR = '請選交通類型';
export const TRANSIT_STATION_ERROR = '請填站名';

// Same priority the backend uses to write back nearestMrt (design-backend §10.3)
const TYPE_PRIORITY: TransitType[] = ['mrt', 'light_rail', 'train', 'hsr', 'bus'];

// Prefix words match the backend write-back so old and new pages read the same
const TYPE_WORD: Record<TransitType, string> = {
  mrt: '捷運',
  light_rail: '輕軌',
  train: '火車',
  hsr: '高鐵',
  bus: '公車',
};

let nextTransitRowId = 0;
export const createTransitRow = (
  values: Partial<Omit<TransitRowValue, 'id'>> = {}
): TransitRowValue => ({
  id: `transit-row-${nextTransitRowId++}`,
  type: '',
  station: '',
  walkMinutes: '',
  ...values,
});

// Full-width digits to half-width → drop non-digits → first 3 digits (design-frontend §D)
export const normalizeWalkMinutes = (input: string): string =>
  input
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/\D/g, '')
    .slice(0, 3);

export const isBlankTransitRow = (row: TransitRowValue): boolean =>
  !row.type && !row.station.trim() && !row.walkMinutes;

export function toTransitStops(rows: TransitRowValue[]): TransitStop[] {
  return rows
    .filter((row) => !isBlankTransitRow(row))
    .map((row) => ({
      type: row.type as TransitType,
      station: row.station.trim(),
      walkMinutes: row.walkMinutes === '' ? null : Number(row.walkMinutes),
    }));
}

export function getTransitRowErrors(rows: TransitRowValue[]): Record<string, TransitRowErrors> {
  const errors: Record<string, TransitRowErrors> = {};
  for (const row of rows) {
    if (isBlankTransitRow(row)) continue;
    const rowErrors: TransitRowErrors = {};
    if (!row.type) rowErrors.type = TRANSIT_TYPE_ERROR;
    if (!row.station.trim()) rowErrors.station = TRANSIT_STATION_ERROR;
    if (rowErrors.type || rowErrors.station) errors[row.id] = rowErrors;
  }
  return errors;
}

export const sameTransitStops = (a: TransitStop[], b: TransitStop[]): boolean =>
  a.length === b.length &&
  a.every(
    (stop, i) =>
      stop.type === b[i].type &&
      stop.station === b[i].station &&
      stop.walkMinutes === b[i].walkMinutes
  );

export const transitRowsFromStops = (stops: TransitStop[]): TransitRowValue[] =>
  stops.map((stop) =>
    createTransitRow({
      type: stop.type,
      station: stop.station,
      walkMinutes: stop.walkMinutes === null ? '' : String(stop.walkMinutes),
    })
  );

// Old venues (transitStops null) prefill the legacy MRT fields as one untyped row (§10.5)
export function transitRowsFromVenue(venue: {
  transitStops?: TransitStop[] | null;
  nearestMrt: string | null;
  mrtWalkMinutes: number | null;
}): TransitRowValue[] {
  if (venue.transitStops && venue.transitStops.length > 0) {
    return transitRowsFromStops(venue.transitStops);
  }
  if (venue.transitStops == null && venue.nearestMrt) {
    return [
      createTransitRow({
        station: venue.nearestMrt,
        walkMinutes: venue.mrtWalkMinutes == null ? '' : String(venue.mrtWalkMinutes),
      }),
    ];
  }
  return [createTransitRow()];
}

export function pickPrimaryTransit(stops: TransitStop[]): TransitStop | null {
  for (const type of TYPE_PRIORITY) {
    const match = stops.find((stop) => stop.type === type);
    if (match) return match;
  }
  return null;
}

export function formatTransitHeader(stop: TransitStop): string {
  if (stop.type === 'mrt') {
    const station = `${stop.station.replace(/站$/, '')}站`;
    return stop.walkMinutes ? `${station}步行 ${stop.walkMinutes} 分鐘` : station;
  }
  const word = TYPE_WORD[stop.type];
  const name = stop.station.includes(word) ? stop.station : `${word} ${stop.station}`;
  return stop.walkMinutes ? `${name}，步行 ${stop.walkMinutes} 分鐘` : name;
}
