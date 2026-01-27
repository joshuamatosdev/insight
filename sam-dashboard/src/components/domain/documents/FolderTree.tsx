import { useState } from 'react';
import { Stack, HStack } from '../../layout/Stack';
import { Text } from '../../primitives/Text';
import { Button } from '../../primitives/Button';
import { ChevronRightIcon, ChevronDownIcon } from '../../primitives/Icon';
import type { DocumentFolder } from '../../../types/documents';

export interface FolderTreeProps {
  folders: DocumentFolder[];
  selectedFolderId?: string | null;
  onFolderSelect: (folder: DocumentFolder | null) => void;
  isLoading?: boolean;
}

interface FolderNodeProps {
  folder: DocumentFolder;
  isSelected: boolean;
  onSelect: (folder: DocumentFolder) => void;
  depth: number;
}

function FolderNode({ folder, isSelected, onSelect, depth }: FolderNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    onSelect(folder);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const hasChildren = folder.subFolderCount !== undefined && folder.subFolderCount > 0;

  return (
    <Stack gap="none">
      <HStack
        gap="xs"
        align="center"
        style={{
          paddingLeft: `${depth * 16}px`,
          paddingTop: 'var(--spacing-1)',
          paddingBottom: 'var(--spacing-1)',
          paddingRight: 'var(--spacing-2)',
          backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
        }}
        onClick={handleClick}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            style={{ padding: 0, minWidth: 'auto' }}
          >
            {isExpanded ? (
              <ChevronDownIcon size="sm" />
            ) : (
              <ChevronRightIcon size="sm" />
            )}
          </Button>
        )}
        {hasChildren === false && (
          <span style={{ width: '16px', display: 'inline-block' }} />
        )}
        <Text
          variant="bodySmall"
          weight={isSelected ? 'semibold' : 'normal'}
          color={isSelected ? 'primary' : 'default'}
        >
          {folder.name}
        </Text>
        {folder.documentCount !== undefined && folder.documentCount > 0 && (
          <Text variant="caption" color="secondary">
            ({folder.documentCount})
          </Text>
        )}
      </HStack>
    </Stack>
  );
}

export function FolderTree({
  folders,
  selectedFolderId,
  onFolderSelect,
  isLoading = false,
}: FolderTreeProps) {
  if (isLoading === true) {
    return (
      <Stack gap="sm">
        <Text variant="bodySmall" color="secondary">Loading folders...</Text>
      </Stack>
    );
  }

  if (folders.length === 0) {
    return (
      <Stack gap="sm">
        <Text variant="bodySmall" color="secondary">No folders</Text>
      </Stack>
    );
  }

  const handleRootClick = () => {
    onFolderSelect(null);
  };

  return (
    <Stack gap="none">
      <HStack
        gap="xs"
        align="center"
        style={{
          paddingTop: 'var(--spacing-1)',
          paddingBottom: 'var(--spacing-1)',
          paddingLeft: 'var(--spacing-2)',
          paddingRight: 'var(--spacing-2)',
          backgroundColor: selectedFolderId === null || selectedFolderId === undefined
            ? 'var(--color-primary-light)'
            : 'transparent',
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
        }}
        onClick={handleRootClick}
      >
        <Text
          variant="bodySmall"
          weight={selectedFolderId === null || selectedFolderId === undefined ? 'semibold' : 'normal'}
          color={selectedFolderId === null || selectedFolderId === undefined ? 'primary' : 'default'}
        >
          All Documents
        </Text>
      </HStack>
      {folders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          isSelected={selectedFolderId === folder.id}
          onSelect={onFolderSelect}
          depth={1}
        />
      ))}
    </Stack>
  );
}
