'use client';

import { useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import styled from 'styled-components';
import { Artist } from '@/types';

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: var(--color-bg-primary);
  border-radius: var(--radius-lg);
  padding: 24px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
`;

const ModalHeader = styled.div`
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
`;

const ModalDescription = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
`;

const ArtistSection = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
`;

const ArtistName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 12px 0;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 14px;
  transition: all 0.2s ease;

  &::placeholder {
    color: var(--color-text-secondary);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(90, 125, 154, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border-light);
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: var(--radius-lg);
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid;

  ${(props) =>
    props.$variant === 'primary'
      ? `
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
    
    &:hover:not(:disabled) {
      background: #3a5d7a;
      border-color: #3a5d7a;
    }
    
    &:disabled {
      background: var(--color-text-disabled);
      border-color: var(--color-text-disabled);
      cursor: not-allowed;
    }
  `
      : `
    background: var(--color-bg-primary);
    border-color: var(--color-border-light);
    color: var(--color-text-primary);
    
    &:hover {
      background: var(--color-bg-secondary);
      border-color: var(--color-border-medium);
    }
  `}
`;

const GroupItemContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  color: #dc2626;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #dc2626;
  background: transparent;

  &:hover {
    background: #dc2626;
    color: white;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: 1px solid var(--color-border-light);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  margin-top: 8px;

  &:hover {
    background: var(--color-border-light);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

interface ArtistGroupNames {
  [artistId: string]: string[];
}

interface BatchGroupNameModalProps {
  isOpen: boolean;
  artists: Artist[];
  onConfirm: (artistGroupNames: ArtistGroupNames) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function BatchGroupNameModal({
  isOpen,
  artists,
  onConfirm,
  onCancel,
  isLoading = false,
}: BatchGroupNameModalProps) {
  // 初始化每個藝人的團名設定
  const [artistGroupNames, setArtistGroupNames] = useState<ArtistGroupNames>(() => {
    const initial: ArtistGroupNames = {};
    artists.forEach((artist) => {
      initial[artist.id] = artist.groupNames || [];
    });
    return initial;
  });

  const addGroupName = (artistId: string) => {
    setArtistGroupNames((prev) => ({
      ...prev,
      [artistId]: [...(prev[artistId] || []), ''],
    }));
  };

  const removeGroupName = (artistId: string, index: number) => {
    setArtistGroupNames((prev) => ({
      ...prev,
      [artistId]: (prev[artistId] || []).filter((_, i) => i !== index),
    }));
  };

  const updateGroupName = (artistId: string, index: number, value: string) => {
    setArtistGroupNames((prev) => {
      const currentNames = [...(prev[artistId] || [])];
      currentNames[index] = value;
      return {
        ...prev,
        [artistId]: currentNames,
      };
    });
  };

  const handleSubmit = () => {
    // 過濾掉空字串
    const filteredGroupNames: ArtistGroupNames = {};
    Object.entries(artistGroupNames).forEach(([artistId, groupNames]) => {
      filteredGroupNames[artistId] = groupNames.filter((name) => name.trim() !== '');
    });
    onConfirm(filteredGroupNames);
  };

  const handleCancel = () => {
    // 重置狀態
    const initial: ArtistGroupNames = {};
    artists.forEach((artist) => {
      initial[artist.id] = artist.groupNames || [];
    });
    setArtistGroupNames(initial);
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>批次設定團名</ModalTitle>
          <ModalDescription>
            為 {artists.length} 位選中的藝人設定團名，可以為每位藝人設定不同的團名。
          </ModalDescription>
        </ModalHeader>

        {artists.map((artist) => {
          const groupNames = artistGroupNames[artist.id] || [];
          return (
            <ArtistSection key={artist.id}>
              <ArtistName>{artist.stageNameZh || artist.stageName}</ArtistName>
              <FormGroup>
                <Label>團名</Label>
                {groupNames.length === 0 && (
                  <AddButton
                    type="button"
                    onClick={() => addGroupName(artist.id)}
                    disabled={isLoading}
                  >
                    <PlusIcon />
                    新增團名
                  </AddButton>
                )}
                {groupNames.map((groupName, index) => (
                  <GroupItemContainer key={index}>
                    <Input
                      type="text"
                      placeholder="例：BOYNEXTDOOR、SEVENTEEN、&TEAM"
                      value={groupName}
                      onChange={(e) => updateGroupName(artist.id, index, e.target.value)}
                      disabled={isLoading}
                    />
                    <RemoveButton
                      type="button"
                      onClick={() => removeGroupName(artist.id, index)}
                      disabled={isLoading}
                    >
                      <XMarkIcon />
                    </RemoveButton>
                  </GroupItemContainer>
                ))}
                {groupNames.length > 0 && (
                  <AddButton
                    type="button"
                    onClick={() => addGroupName(artist.id)}
                    disabled={isLoading}
                  >
                    <PlusIcon />
                    新增更多團名
                  </AddButton>
                )}
              </FormGroup>
            </ArtistSection>
          );
        })}

        <ButtonGroup>
          <Button type="button" $variant="secondary" onClick={handleCancel} disabled={isLoading}>
            取消
          </Button>
          <Button type="button" $variant="primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? '設定中...' : '確認批次通過'}
          </Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
}
