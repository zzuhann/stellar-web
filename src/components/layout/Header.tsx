'use client';

import { useAuth } from '@/lib/auth-context';
import { UserIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styled from 'styled-components';

// Styled Components
const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border-medium);
  box-shadow: var(--shadow-md);
  background-color: #fff;
`;

const Logo = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: 1px;
`;

const UserSection = styled.div`
  position: relative;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-bg-secondary);
  }
`;

const UserIcon16 = styled(UserIcon)`
  width: 16px;
  height: 16px;
`;

const MemberButton = styled.button`
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  background: var(--color-accent);
  border: 1px solid var(--color-accent);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    background: #e5c378;
    border-color: #e5c378;
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
`;

const UserMenu = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 192px;
  z-index: 10;
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
`;

const UserMenuHeader = styled.div`
  padding: 8px 16px;
  font-size: 12px;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-bg-secondary);
`;

const UserMenuItem = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 16px;
  font-size: 14px;
  color: var(--color-text-primary);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-bg-secondary);
  }

  &.admin {
    color: var(--color-primary);
    font-weight: 500;
  }

  &.danger {
    color: var(--color-error);
  }
`;

const MenuSeparator = styled.hr`
  margin: 4px 0;
  border: none;
  height: 1px;
  background: var(--color-border-light);
`;

const Header = () => {
  const router = useRouter();
  const { user, userData, signOut, toggleAuthModal } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <HeaderContainer>
      <Logo>STELLAR</Logo>

      {user ? (
        <UserSection>
          <UserButton onClick={() => setUserMenuOpen(!userMenuOpen)}>
            <UserIcon16 />
            {userData?.displayName || 'member'}
          </UserButton>

          {userMenuOpen && (
            <UserMenu>
              <UserMenuHeader>{user.email}</UserMenuHeader>
              <UserMenuItem
                onClick={() => {
                  router.push('/my-submissions');
                  setUserMenuOpen(false);
                }}
              >
                我的投稿
              </UserMenuItem>
              {userData?.role === 'admin' && (
                <UserMenuItem
                  className="admin"
                  onClick={() => {
                    window.open('/admin', '_blank');
                    setUserMenuOpen(false);
                  }}
                >
                  ⚖️ 管理員審核
                </UserMenuItem>
              )}
              <MenuSeparator />
              <UserMenuItem
                className="danger"
                onClick={() => {
                  signOut();
                  setUserMenuOpen(false);
                }}
              >
                登出
              </UserMenuItem>
            </UserMenu>
          )}
        </UserSection>
      ) : (
        <MemberButton onClick={toggleAuthModal}>member</MemberButton>
      )}
    </HeaderContainer>
  );
};

export default Header;
