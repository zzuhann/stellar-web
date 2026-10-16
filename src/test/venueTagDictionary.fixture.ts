import type { VenueTagDictionary } from '@/types';

// Mirrors the backend dictionary (venue-tags design-backend §1.2)
export const venueTagDictionaryFixture: VenueTagDictionary = {
  groups: [
    { key: 'price', label: '價格', order: 1 },
    { key: 'service', label: '服務', order: 2 },
    { key: 'transport', label: '交通', order: 3 },
    { key: 'space', label: '空間類型', order: 4 },
    { key: 'equipment', label: '設備', order: 5 },
  ],
  tags: [
    { slug: 'free_venue', group: 'price', label: '免場地費', order: 1, cardRank: 2 },
    { slug: 'no_min_guarantee', group: 'price', label: '無杯數門檻', order: 2, cardRank: 5 },
    { slug: 'needs_guarantee', group: 'price', label: '需保底', order: 3 },
    { slug: 'venue_fee', group: 'price', label: '需場地費', order: 4 },
    { slug: 'deposit', group: 'price', label: '需押金', order: 5 },
    { slug: 'goods_distribution', group: 'service', label: '應援物代發', order: 1, cardRank: 1 },
    { slug: 'early_setup', group: 'service', label: '可提前佈展', order: 2, cardRank: 3 },
    { slug: 'beginner_friendly', group: 'service', label: '新手友善', order: 3, cardRank: 4 },
    { slug: 'parcel_receiving', group: 'service', label: '應援物代收', order: 4, cardRank: 6 },
    { slug: 'custom_menu', group: 'service', label: '客製餐點', order: 5, cardRank: 7 },
    { slug: 'private_booking', group: 'service', label: '可包場', order: 6, cardRank: 8 },
    { slug: 'can_decorate', group: 'service', label: '可佈置', order: 7 },
    { slug: 'near_mrt', group: 'transport', label: '近捷運', order: 1 },
    { slug: 'near_train', group: 'transport', label: '近火車站', order: 2 },
    { slug: 'cafe', group: 'space', label: '咖啡廳', order: 1 },
    { slug: 'exhibition_space', group: 'space', label: '展覽空間', order: 2, cardRank: 9 },
    { slug: 'bar', group: 'space', label: '酒吧/餐酒館', order: 3 },
    { slug: 'multi_space', group: 'space', label: '多功能空間', order: 4, cardRank: 10 },
    { slug: 'takeaway_shop', group: 'space', label: '外帶為主', order: 5 },
    { slug: 'projector', group: 'equipment', label: '投影/螢幕', order: 1 },
    { slug: 'sound_system', group: 'equipment', label: '可播放音樂', order: 2 },
    { slug: 'display_fixtures', group: 'equipment', label: '佈置設備', order: 3 },
  ],
};
