import { css } from '@/styled-system/css';
import AdminSidebar from '@/components/admin-new/AdminSidebar';
import EventImportForm from '@/components/eventImport/EventImportForm';

const pageWrapper = css({
  display: 'flex',
  minHeight: '100dvh',
  paddingTop: '70px',
  background: 'color.background.primary',
});

const mainContent = css({
  flex: 1,
  minWidth: 0,
  paddingX: '4',
  paddingY: '6',
  md: { paddingX: '6' },
});

// 權限守衛由 `admin-new/layout.tsx` 統一處理（非 admin 會被導回首頁），
// 這個頁面不需要再另外檢查身份。
export default function EventImportPage() {
  return (
    <div className={pageWrapper}>
      <AdminSidebar />
      <main className={mainContent}>
        <EventImportForm />
      </main>
    </div>
  );
}
