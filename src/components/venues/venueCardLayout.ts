// 共用給 VenueCard.tsx 與 VenueCardSkeleton.tsx——真實卡片的 mrtRow/hostTagsRow/
// divider/bottomStats 依資料條件渲染，資料多寡不同的卡片彼此高度本來就不一樣。
// 若只讓 skeleton 猜一種「資料齊全」情境，資料較精簡的卡片載入後仍會比 skeleton
// 矮，觸發 CLS。做法是讓卡片本體（body）有一個共用的最小高度，資料精簡的卡片會
// 在底部留白，換取「skeleton → 真實卡片」这一步的高度穩定，不因單一卡片資料多寡
// 而變動。
//
// 數字依「兩行店名 + MRT 列 + 主辦標籤列 + 分隔線 + 底部統計列」這個最長情境估算：
// nameRow ~40px、mrtRow(margin 8+18) ~26px、hostTagsRow(margin 8+24) ~32px、
// divider(margin 8+8+1px border) ~17px、bottomStats ~20px、body 上下 padding ~24px。
export const VENUE_CARD_BODY_MIN_HEIGHT = '180px';
