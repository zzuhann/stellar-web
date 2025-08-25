'use client';

import { useAuth } from '@/lib/auth-context';
import { UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styled from 'styled-components';
import AuthModal from '../auth/AuthModal';

// Styled Components
const HeaderContainer = styled.header`
  height: 70px;
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
  box-sizing: border-box;
`;

const BurgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  padding: 8px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-bg-secondary);
  }

  svg {
    width: 24px;
    height: 24px;
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const DesktopNav = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const UserSection = styled.div`
  position: relative;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
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
  font-size: 14px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
`;

const UserMenu = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 100px;
  z-index: 10;
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
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

// Mobile Menu
const MobileMenuOverlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  visibility: ${(props) => (props.$isOpen ? 'visible' : 'hidden')};
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 280px;
  background: white;
  box-shadow: var(--shadow-lg);
  transform: translateX(${(props) => (props.$isOpen ? '0' : '100%')});
  transition: transform 0.3s ease;
  z-index: 101;
  overflow-y: auto;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
`;

const MobileMenuHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MobileMenuTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-bg-secondary);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const MobileMenuContent = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MobileMenuButton = styled.button`
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 8px 0;
  font-size: 16px;
  color: var(--color-text-primary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Description = styled.div`
  font-size: 14px;
  color: var(--color-text-secondary);
  cursor: pointer;
`;

const Header = () => {
  const router = useRouter();
  const { user, userData, signOut, authModalOpen, toggleAuthModal } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <HeaderContainer>
        <Link href="/">
          <Image
            src="/icon-with-text.png"
            alt="STELLAR"
            width={120}
            height={120}
            style={{
              width: '120px',
              height: 'auto',
            }}
          />
        </Link>

        {/* Desktop Navigation */}
        <DesktopNav>
          {user ? (
            <RightSection>
              <Description onClick={() => router.push('/my-submissions')}>我的投稿</Description>
              <Description onClick={() => router.push('/admin')}>管理員審核</Description>
              <Description onClick={() => router.push('/submit-event')}>舉辦生咖應援</Description>
              <UserSection>
                <UserButton onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <UserIcon16 />
                  <Description>{userData?.displayName || 'member'}</Description>
                </UserButton>

                {userMenuOpen && (
                  <UserMenu>
                    <UserMenuItem
                      onClick={() => {
                        router.push('/settings');
                        setUserMenuOpen(false);
                      }}
                    >
                      設定
                    </UserMenuItem>
                    <UserMenuItem
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
            </RightSection>
          ) : (
            <MemberButton onClick={() => toggleAuthModal()}>登入 / 註冊</MemberButton>
          )}
        </DesktopNav>

        {/* Mobile Burger Menu Button */}
        <BurgerButton onClick={() => setMobileMenuOpen(true)}>
          <Bars3Icon />
        </BurgerButton>
      </HeaderContainer>

      {/* Mobile Menu Overlay */}
      <MobileMenuOverlay $isOpen={mobileMenuOpen} onClick={closeMobileMenu} />

      {/* Mobile Menu */}
      <MobileMenu $isOpen={mobileMenuOpen}>
        <MobileMenuHeader>
          <MobileMenuTitle>選單</MobileMenuTitle>
          <CloseButton onClick={closeMobileMenu}>
            <XMarkIcon />
          </CloseButton>
        </MobileMenuHeader>

        <MobileMenuContent>
          {user ? (
            <>
              <Description>{userData?.displayName || 'member'}</Description>

              <MobileMenuButton
                onClick={() => {
                  router.push('/my-submissions');
                  closeMobileMenu();
                }}
              >
                我的投稿
              </MobileMenuButton>
              {userData?.role === 'admin' && (
                <MobileMenuButton
                  onClick={() => {
                    router.push('/admin');
                    closeMobileMenu();
                  }}
                >
                  管理員審核
                </MobileMenuButton>
              )}
              <MobileMenuButton
                onClick={() => {
                  router.push('/submit-event');
                  closeMobileMenu();
                }}
              >
                舉辦生咖應援
              </MobileMenuButton>
              <MobileMenuButton
                onClick={() => {
                  router.push('/settings');
                  closeMobileMenu();
                }}
              >
                設定
              </MobileMenuButton>
              <MobileMenuButton
                onClick={() => {
                  signOut();
                  closeMobileMenu();
                }}
              >
                登出
              </MobileMenuButton>
            </>
          ) : (
            <>
              <MobileMenuButton
                onClick={() => {
                  toggleAuthModal();
                  closeMobileMenu();
                }}
              >
                登入 / 註冊
              </MobileMenuButton>

              <MobileMenuButton
                onClick={() => {
                  toggleAuthModal('/submit-event');
                  closeMobileMenu();
                }}
              >
                舉辦生咖應援
              </MobileMenuButton>
            </>
          )}
        </MobileMenuContent>
      </MobileMenu>
      {/* 認證模態視窗 */}
      <AuthModal isOpen={authModalOpen} onClose={toggleAuthModal} initialMode="signin" />
    </>
  );
};

export default Header;
