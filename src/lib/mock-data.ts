// 模擬測試資料

import { CoffeeEvent, Artist } from '@/types';

export const mockArtists: Artist[] = [
  {
    id: '1',
    stageName: 'IU',
    realName: '李知恩',
    birthday: '1993-05-16',
    profileImage: '',
    status: 'approved',
    createdBy: 'user1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    stageName: 'BTS',
    realName: '방탄소년단',
    birthday: '2013-06-13',
    profileImage: '',
    status: 'approved',
    createdBy: 'user1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    stageName: 'BLACKPINK',
    realName: '블랙핑크',
    birthday: '2016-08-08',
    profileImage: '',
    status: 'approved',
    createdBy: 'user1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export const mockEvents: CoffeeEvent[] = [
  {
    id: '1',
    title: 'IU 生日應援咖啡',
    artistId: '1',
    artistName: 'IU',
    description: '為慶祝 IU 生日而舉辦的特別應援咖啡活動，提供限定飲品和周邊商品。現場還有 IU 的經典歌曲播放，讓粉絲們一起慶祝偶像的生日！',
    startDate: '2025-01-15T00:00:00Z',
    endDate: '2025-08-15T23:59:59Z',
    location: {
      address: '台北市信義區松仁路28號',
      coordinates: {
        lat: 25.0330,
        lng: 121.5654,
      },
    },
    contactInfo: {
      phone: '02-1234-5678',
      instagram: '@iu_coffee_taipei',
      facebook: 'https://facebook.com/iu.coffee.taipei',
    },
    images: [],
    status: 'approved',
    createdBy: 'user1',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'BTS 應援咖啡廳',
    artistId: '2',
    artistName: 'BTS',
    description: 'BTS 主題咖啡廳，提供成員主題飲品和甜點。牆面裝飾著 BTS 的照片和應援標語，是 ARMY 們聚會的好地方！',
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-08-31T23:59:59Z',
    location: {
      address: '新北市板橋區文化路一段188號',
      coordinates: {
        lat: 25.0176,
        lng: 121.4635,
      },
    },
    contactInfo: {
      instagram: '@bts_coffee_banqiao',
    },
    images: [],
    status: 'approved',
    createdBy: 'user2',
    createdAt: '2024-12-15T00:00:00Z',
    updatedAt: '2024-12-15T00:00:00Z',
  },
  {
    id: '3',
    title: 'BLACKPINK 限定咖啡店',
    artistId: '3',
    artistName: 'BLACKPINK',
    description: 'BLACKPINK 粉色主題咖啡店，提供粉紅色系的特調飲品。店內播放 BLACKPINK 的熱門歌曲，還有限量周邊商品販售！',
    startDate: '2025-01-20T00:00:00Z',
    endDate: '2025-08-28T23:59:59Z',
    location: {
      address: '台中市西屯區台灣大道三段99號',
      coordinates: {
        lat: 24.1735,
        lng: 120.6377,
      },
    },
    contactInfo: {
      phone: '04-2345-6789',
      instagram: '@blackpink_coffee_taichung',
    },
    images: [],
    status: 'approved',
    createdBy: 'user3',
    createdAt: '2024-12-20T00:00:00Z',
    updatedAt: '2024-12-20T00:00:00Z',
  },
  {
    id: '4',
    title: 'IU 高雄應援咖啡',
    artistId: '1',
    artistName: 'IU',
    description: '南部 IU 粉絲的聚會地點！提供溫暖的咖啡和 IU 主題甜點，還有簽名牆讓粉絲們留下對 IU 的祝福。',
    startDate: '2025-01-10T00:00:00Z',
    endDate: '2025-08-10T23:59:59Z',
    location: {
      address: '高雄市前金區中正四路211號',
      coordinates: {
        lat: 22.6273,
        lng: 120.3014,
      },
    },
    contactInfo: {
      phone: '07-3456-7890',
      instagram: '@iu_coffee_kaohsiung',
    },
    images: [],
    status: 'approved',
    createdBy: 'user4',
    createdAt: '2024-12-05T00:00:00Z',
    updatedAt: '2024-12-05T00:00:00Z',
  },
  {
    id: '5',
    title: 'BTS Jin 生日快閃店',
    artistId: '2',
    artistName: 'BTS',
    description: 'Jin 生日特別企劃！提供 Jin 最愛的料理主題咖啡和甜點，現場還有 Jin 的個人照片展示。',
    startDate: '2024-12-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z', // 已結束的活動
    location: {
      address: '台南市中西區中正路123號',
      coordinates: {
        lat: 22.9908,
        lng: 120.2133,
      },
    },
    contactInfo: {
      instagram: '@jin_coffee_tainan',
    },
    images: [],
    status: 'approved',
    createdBy: 'user5',
    createdAt: '2024-11-15T00:00:00Z',
    updatedAt: '2024-11-15T00:00:00Z',
  },
];