import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import EventInfoSection from './EventInfoSection';
import { eventSubmissionSchema, EventSubmissionFormData } from '@/lib/validations';

// EventInfoSection 掛載了 ImageUpload / MultiImageUpload / PlaceAutocomplete / DatePicker /
// TimePicker / FormProgressHeader 等重依賴（Firebase auth、Google Places API），
// 這些跟預約開關的行為無關，改用輕量替身；DatePicker/TimePicker 保留可操作的 input
// 好讓測試能模擬「已填寫預約日期/時間」再驗證關閉開關會清空。
vi.mock('../images/ImageUpload', () => ({ default: () => null }));
vi.mock('../images/MultiImageUpload', () => ({ default: () => null }));
vi.mock('../forms/PlaceAutocomplete', () => ({ default: () => null }));
vi.mock('./FormProgressHeader', () => ({ default: () => null }));
vi.mock('@/hooks/useAuthToken', () => ({ useAuthToken: () => ({ token: null }) }));
vi.mock('../DatePicker', () => ({
  default: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
  }) => <input aria-label={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />,
}));
vi.mock('../TimePicker', () => ({
  default: ({
    value,
    onChange,
    placeholder,
  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
  }) => <input aria-label={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />,
}));

afterEach(cleanup);

const defaultValues: EventSubmissionFormData = {
  title: '測試活動',
  artistIds: ['artist-1'],
  description: '',
  startDate: '2026-08-05',
  endDate: '2026-08-05',
  addressName: '台北市信義區',
  instagram: 'test_account',
  threads: '',
  mainImage: 'https://r2.example.com/image.jpg',
  detailImage: [],
  reservationUrl: '',
  reservationDate: '',
  reservationTime: '',
};

// 重現 EventSubmissionForm 裡「開關 + 清空預約欄位」的邏輯，讓測試能驅動真正的
// EventInfoSection 與真正的 zod schema，而不用掛載整個 EventSubmissionForm。
function Harness({
  initialEnabled,
  initialValues,
  onSubmit,
  isPending = false,
}: {
  initialEnabled: boolean;
  initialValues?: Partial<EventSubmissionFormData>;
  onSubmit: (data: EventSubmissionFormData) => void;
  isPending?: boolean;
}) {
  const [reservationEnabled, setReservationEnabled] = useState(initialEnabled);
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<EventSubmissionFormData>({
    resolver: zodResolver(eventSubmissionSchema),
    defaultValues: { ...defaultValues, ...initialValues },
  });

  const startDate = useWatch({ control, name: 'startDate' }) ?? '';
  const endDate = useWatch({ control, name: 'endDate' }) ?? '';
  const description = useWatch({ control, name: 'description' }) ?? '';
  const instagram = useWatch({ control, name: 'instagram' }) ?? '';
  const threads = useWatch({ control, name: 'threads' }) ?? '';
  const reservationDate = useWatch({ control, name: 'reservationDate' }) ?? '';
  const reservationTime = useWatch({ control, name: 'reservationTime' }) ?? '';

  const handleChangeInstagram = (value: string) =>
    setValue('instagram', value, { shouldValidate: true, shouldDirty: true });
  const handleChangeThreads = (value: string) =>
    setValue('threads', value, { shouldValidate: true, shouldDirty: true });
  const handleChangeReservationDate = (date: string) =>
    setValue('reservationDate', date, { shouldDirty: true });
  const handleChangeReservationTime = (time: string) =>
    setValue('reservationTime', time, { shouldDirty: true });

  const handleToggleReservation = () => {
    const next = !reservationEnabled;
    setReservationEnabled(next);
    if (!next) {
      setValue('reservationUrl', '', { shouldDirty: true });
      handleChangeReservationDate('');
      handleChangeReservationTime('');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <EventInfoSection
        register={register}
        errors={errors}
        mainImageUrl=""
        onUploadComplete={() => {}}
        isPending={isPending}
        handleChangeStartDate={() => {}}
        handleChangeEndDate={() => {}}
        handlePlaceSelect={() => {}}
        handleChangeImages={() => {}}
        detailImageUrls={[]}
        startDate={startDate}
        endDate={endDate}
        description={description}
        existingEventLocationName=""
        reservationDate={reservationDate}
        reservationTime={reservationTime}
        handleChangeReservationDate={handleChangeReservationDate}
        handleChangeReservationTime={handleChangeReservationTime}
        reservationEnabled={reservationEnabled}
        onToggleReservation={handleToggleReservation}
        instagram={instagram}
        threads={threads}
        handleChangeInstagram={handleChangeInstagram}
        handleChangeThreads={handleChangeThreads}
        setFieldRef={() => () => {}}
        progress={{ completed: 0, total: 5, segments: [false, false, false, false, false] }}
      />
      <button type="submit">送出</button>
    </form>
  );
}

describe('EventInfoSection 預約開關', () => {
  it('開關關閉時（create 模式預設），不渲染預約網址/日期/時間欄位', () => {
    render(<Harness initialEnabled={false} onSubmit={vi.fn()} />);

    expect(screen.queryByLabelText('預約網址')).toBeNull();
    expect(screen.queryByLabelText('選擇日期')).toBeNull();
    expect(screen.queryByLabelText('選擇時間')).toBeNull();
  });

  it('開關開啟時（edit 模式已有資料），渲染並顯示原本填寫的資料', () => {
    render(
      <Harness
        initialEnabled={true}
        initialValues={{
          reservationUrl: 'https://forms.gle/xxxx',
          reservationDate: '2026-08-20',
          reservationTime: '20:00',
        }}
        onSubmit={vi.fn()}
      />
    );

    expect((screen.getByLabelText('預約網址') as HTMLInputElement).value).toBe(
      'https://forms.gle/xxxx'
    );
    expect((screen.getByLabelText('選擇日期') as HTMLInputElement).value).toBe('2026-08-20');
    expect((screen.getByLabelText('選擇時間') as HTMLInputElement).value).toBe('20:00');
  });

  it('打開開關後可以填寫，關閉後欄位消失且資料被清空', () => {
    render(<Harness initialEnabled={false} onSubmit={vi.fn()} />);

    fireEvent.click(screen.getByRole('switch', { name: '需要事先預約或報名' }));

    fireEvent.change(screen.getByLabelText('預約網址'), {
      target: { value: 'https://forms.gle/xxxx' },
    });
    fireEvent.change(screen.getByLabelText('選擇日期'), { target: { value: '2026-08-20' } });
    fireEvent.change(screen.getByLabelText('選擇時間'), { target: { value: '20:00' } });

    expect((screen.getByLabelText('預約網址') as HTMLInputElement).value).toBe(
      'https://forms.gle/xxxx'
    );

    // 關閉開關：欄位應該整組消失
    fireEvent.click(screen.getByRole('switch', { name: '需要事先預約或報名' }));
    expect(screen.queryByLabelText('預約網址')).toBeNull();
    expect(screen.queryByLabelText('選擇日期')).toBeNull();
    expect(screen.queryByLabelText('選擇時間')).toBeNull();

    // 重新打開開關：資料應該已經被清空，不是只是隱藏
    fireEvent.click(screen.getByRole('switch', { name: '需要事先預約或報名' }));
    expect((screen.getByLabelText('預約網址') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('選擇日期') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('選擇時間') as HTMLInputElement).value).toBe('');
  });

  it('開關關閉狀態下送出，通過 zod 驗證（預約相關 refine 不會報錯）', async () => {
    const onSubmit = vi.fn();
    render(<Harness initialEnabled={false} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByText('送出'));

    // handleSubmit 內部驗證為非同步，等待 microtask 讓 resolver 跑完
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const submittedData = onSubmit.mock.calls[0][0] as EventSubmissionFormData;
    expect(submittedData.reservationUrl).toBe('');
    expect(submittedData.reservationDate).toBe('');
    expect(submittedData.reservationTime).toBe('');
  });

  it('填寫後關閉開關再送出，仍通過驗證（清空邏輯要清得夠乾淨）', async () => {
    const onSubmit = vi.fn();
    render(<Harness initialEnabled={true} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText('預約網址'), {
      target: { value: 'not-a-valid-url' },
    });
    fireEvent.change(screen.getByLabelText('選擇日期'), { target: { value: '2026-08-20' } });

    // 關閉開關：即使剛剛填了不合法的網址、只填日期沒填時間，關閉後都要清乾淨
    fireEvent.click(screen.getByRole('switch', { name: '需要事先預約或報名' }));
    fireEvent.click(screen.getByText('送出'));

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  });

  it('送出中（isPending）時開關被鎖定，點擊不會觸發切換', () => {
    render(<Harness initialEnabled={false} isPending={true} onSubmit={vi.fn()} />);

    const toggle = screen.getByRole('switch', { name: '需要事先預約或報名' });
    expect((toggle as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(toggle);

    // 開關仍是關閉狀態，且不應渲染出開啟後才有的欄位
    expect(screen.queryByLabelText('預約網址')).toBeNull();
  });
});

describe('EventInfoSection 主辦社群多列輸入', () => {
  it('編輯模式帶入逗號分隔字串時，正確 split 顯示成多列並各自帶入正確值', () => {
    render(
      <Harness
        initialEnabled={false}
        initialValues={{ instagram: 'stellar_tw,stellar_jp', threads: 'stellar_thread' }}
        onSubmit={vi.fn()}
      />
    );

    expect((screen.getByLabelText('Instagram 帳號 1') as HTMLInputElement).value).toBe(
      'stellar_tw'
    );
    expect((screen.getByLabelText('Instagram 帳號 2') as HTMLInputElement).value).toBe(
      'stellar_jp'
    );
    // Threads 只有一個帳號時不需要編號，直接用欄位本身的 label 關聯
    expect((screen.getByLabelText('Threads') as HTMLInputElement).value).toBe('stellar_thread');
  });

  it('新增一列並填寫後送出，instagram 欄位是 join 回去的逗號+空格字串', async () => {
    const onSubmit = vi.fn();
    render(
      <Harness
        initialEnabled={false}
        initialValues={{ instagram: 'stellar_tw', threads: '' }}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '新增共同主辦 - Instagram' }));
    fireEvent.change(screen.getByLabelText('Instagram 帳號 2'), {
      target: { value: 'stellar_jp' },
    });
    fireEvent.click(screen.getByText('送出'));

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const submittedData = onSubmit.mock.calls[0][0] as EventSubmissionFormData;
    expect(submittedData.instagram).toBe('stellar_tw, stellar_jp');
  });

  it('移除一列後送出，不會殘留逗號夾空值', async () => {
    const onSubmit = vi.fn();
    render(
      <Harness
        initialEnabled={false}
        initialValues={{ instagram: 'stellar_tw,stellar_jp', threads: '' }}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '移除 Instagram 帳號 2' }));
    fireEvent.click(screen.getByText('送出'));

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const submittedData = onSubmit.mock.calls[0][0] as EventSubmissionFormData;
    expect(submittedData.instagram).toBe('stellar_tw');
  });
});
