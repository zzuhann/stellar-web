# useQueryState 使用範例

## Tab 切換

URL：`/?tab=event`，重整或分享後保留在同一個 tab。

```typescript
'use client';

type Tab = 'artist' | 'event';

const [tab, setTab] = useQueryState<Tab>('tab', {
  defaultValue: 'artist',
  parse: (v) => (v === 'event' ? 'event' : 'artist'),
});

// 切換 tab
<TabButton active={tab === 'artist'} onClick={() => setTab('artist')}>藝人</TabButton>
<TabButton active={tab === 'event'} onClick={() => setTab('event')}>活動</TabButton>
```

---

## 搜尋關鍵字

URL：`/?search=aespa`

```typescript
const [search, setSearch] = useQueryState('search', { defaultValue: '' });

<input
  value={search}
  onChange={(e) => setSearch(e.target.value || null)}  // 空字串時清除參數
/>
```

---

## 搜尋 + 篩選組合

URL：`/?search=aespa&region=台北`

```typescript
const [search, setSearch] = useQueryState('search', { defaultValue: '' });
const [region, setRegion] = useQueryState('region', { defaultValue: '' });

// 清除全部篩選
const clearAll = () => {
  setSearch(null);
  setRegion(null);
};
```

---

## 分頁

URL：`/?page=2`，換頁時新增歷史（可按上一頁回到前一頁）。

```typescript
const [page, setPage] = useQueryState('page', {
  defaultValue: 1,
  parse: parseAsInt,
  defaultMethod: 'push',  // 分頁用 push
});

<button onClick={() => setPage(page + 1)}>下一頁</button>
```

---

## boolean 旗標

URL：`/?showMap=true`

```typescript
const [showMap, setShowMap] = useQueryState('showMap', {
  defaultValue: false,
  parse: parseAsBoolean,
});

<button onClick={() => setShowMap(!showMap)}>
  {showMap ? '隱藏地圖' : '顯示地圖'}
</button>
```
