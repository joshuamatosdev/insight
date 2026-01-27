import { useState } from 'react';
import { Stack, HStack } from '../../catalyst/layout/Stack';
import { Text } from '../../catalyst/primitives/Text';
import { Button } from '../../catalyst/primitives/Button';
import { ChevronRightIcon, ChevronDownIcon } from '../../catalyst/primitives/Icon';
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
          paddingTop: '0.25rem',
          paddingBottom: '0.25rem',
          paddingRight: '0.5rem',
          backgroundColor: isSelected ? '#dbeafe' : 'transparent',
          borderRadius: '0.25rem',
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
          paddingTop: '0.25rem',
          paddingBottom: '0.25rem',
          paddingLeft: '0.5rem',
          paddingRight: '0.5rem',
          backgroundColor: selectedFolderId === null || selectedFolderId === undefined
            ? '#dbeafe'
            : 'transparent',
          borderRadius: '0.25rem',
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
