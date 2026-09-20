import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SocialAccountRows from './SocialAccountRows';

afterEach(cleanup);

describe('SocialAccountRows', () => {
  it('初始值為空字串時，只渲染一列輸入框，且沒有移除按鈕', () => {
    render(
      <SocialAccountRows
        fieldId="instagram"
        fieldLabel="Instagram"
        placeholderExample="boynextdoor_official"
        initialValue=""
        onChange={vi.fn()}
      />
    );

    expect(screen.getAllByPlaceholderText('boynextdoor_official')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: /移除/ })).toBeNull();
  });

  it('初始值為逗號分隔字串時，split 成對應數量的多列並各自帶入正確的值', () => {
    render(
      <SocialAccountRows
        fieldId="instagram"
        fieldLabel="Instagram"
        placeholderExample="boynextdoor_official"
        initialValue="stellar_tw,stellar_jp"
        onChange={vi.fn()}
      />
    );

    const inputs = screen.getAllByPlaceholderText('boynextdoor_official') as HTMLInputElement[];
    expect(inputs.map((el) => el.value)).toEqual(['stellar_tw', 'stellar_jp']);
  });

  it('點擊「新增共同主辦」會新增一列空白輸入框，且此時每列都出現移除按鈕', () => {
    render(
      <SocialAccountRows
        fieldId="instagram"
        fieldLabel="Instagram"
        placeholderExample="boynextdoor_official"
        initialValue=""
        onChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '新增共同主辦' }));

    expect(screen.getAllByPlaceholderText('boynextdoor_official')).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /移除/ })).toHaveLength(2);
  });

  it('只剩一列時不顯示移除按鈕，避免使用者清空到完全沒有輸入框', () => {
    render(
      <SocialAccountRows
        fieldId="instagram"
        fieldLabel="Instagram"
        placeholderExample="boynextdoor_official"
        initialValue="stellar_tw,stellar_jp"
        onChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '移除 Instagram 帳號 2' }));

    expect(screen.getAllByPlaceholderText('boynextdoor_official')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: /移除/ })).toBeNull();
  });

  it('修改某一列的值時，onChange 收到的是目前所有列 join 回去的字串', () => {
    const onChange = vi.fn();
    render(
      <SocialAccountRows
        fieldId="instagram"
        fieldLabel="Instagram"
        placeholderExample="boynextdoor_official"
        initialValue="stellar_tw,stellar_jp"
        onChange={onChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Instagram 帳號 1'), {
      target: { value: 'stellar_official' },
    });

    expect(onChange).toHaveBeenCalledWith('stellar_official, stellar_jp');
  });

  it('新增列但未填寫時，onChange 收到的字串會過濾掉空白列，不產生夾空值', () => {
    const onChange = vi.fn();
    render(
      <SocialAccountRows
        fieldId="instagram"
        fieldLabel="Instagram"
        placeholderExample="boynextdoor_official"
        initialValue="stellar_tw"
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '新增共同主辦' }));

    expect(onChange).toHaveBeenLastCalledWith('stellar_tw');
  });

  it('disabled 時每一列輸入框都被停用', () => {
    render(
      <SocialAccountRows
        fieldId="instagram"
        fieldLabel="Instagram"
        placeholderExample="boynextdoor_official"
        initialValue="stellar_tw,stellar_jp"
        onChange={vi.fn()}
        disabled
      />
    );

    const inputs = screen.getAllByPlaceholderText('boynextdoor_official') as HTMLInputElement[];
    inputs.forEach((el) => expect(el.disabled).toBe(true));
  });
});
