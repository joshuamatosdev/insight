import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { ScopeItemListProps, ScopeItemRowProps } from './Portal.types';
import type { ScopeItem } from '../../../types/portal';
import { Text, Badge, Button } from '../../primitives';
import { Flex, Stack, Box, HStack } from '../../layout';

/**
 * Individual scope item row component.
 */
function ScopeItemRow({
  item,
  level,
  isExpanded = false,
  hasChildren = false,
  onClick,
  onEdit,
  onDelete,
  onToggleExpand,
  className,
  style,
}: ScopeItemRowProps): React.ReactElement {
  const getStatusVariant = (
    status: string
  ): 'primary' | 'success' | 'warning' | 'secondary' => {
    switch (status) {
      case 'ACTIVE':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'ON_HOLD':
        return 'warning';
      case 'REMOVED':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleClick = () => {
    if (onClick !== undefined) {
      onClick(item);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit !== undefined) {
      onEdit(item);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete !== undefined) {
      onDelete(item);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleExpand !== undefined) {
      onToggleExpand();
    }
  };

  const rowStyles: CSSProperties = {
    padding: 'var(--spacing-3) var(--spacing-4)',
    paddingLeft: `calc(var(--spacing-4) + ${level * 24}px)`,
    borderBottom: '1px solid var(--color-gray-100)',
    cursor: onClick !== undefined ? 'pointer' : 'default',
    backgroundColor: level % 2 === 0 ? 'var(--color-white)' : 'var(--color-gray-50)',
    transition: 'background-color 0.2s ease',
    ...style,
  };

  return (
    <Box
      className={className}
      style={rowStyles}
      onClick={handleClick}
      role={onClick !== undefined ? 'button' : undefined}
      tabIndex={onClick !== undefined ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick !== undefined && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <Flex justify="space-between" align="center">
        <Flex align="center" gap="sm" style={{ flex: 1 }}>
          {/* Expand/Collapse button */}
          {hasChildren && (
            <Box
              as="button"
              onClick={handleToggle}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 'var(--spacing-1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <Text variant="body" style={{ transform: isExpanded ? 'rotate(90deg)' : 'none' }}>
                ▶
              </Text>
            </Box>
          )}
          {hasChildren === false && <Box style={{ width: '24px' }} />}

          {/* WBS Code */}
          <Box
            style={{
              padding: 'var(--spacing-1) var(--spacing-2)',
              backgroundColor: 'var(--color-gray-100)',
              borderRadius: 'var(--radius-sm)',
              minWidth: '80px',
            }}
          >
            <Text variant="caption" weight="medium">
              {item.wbsCode}
            </Text>
          </Box>

          {/* Title */}
          <Text variant="body" weight={level === 0 ? 'semibold' : 'normal'}>
            {item.title}
          </Text>

          {/* Status Badge */}
          <Badge variant={getStatusVariant(item.status)} size="sm">
            {item.status}
          </Badge>
        </Flex>

        {/* Progress & Hours */}
        <Flex align="center" gap="md">
          {/* Progress */}
          <Box style={{ width: '100px' }}>
            <Flex justify="space-between" style={{ marginBottom: '2px' }}>
              <Text variant="caption" color="muted">
                {item.percentComplete}%
              </Text>
            </Flex>
            <Box
              style={{
                height: '4px',
                backgroundColor: 'var(--color-gray-200)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}
            >
              <Box
                style={{
                  height: '100%',
                  width: `${item.percentComplete}%`,
                  backgroundColor:
                    item.percentComplete === 100
                      ? 'var(--color-success)'
                      : 'var(--color-primary)',
                }}
              />
            </Box>
          </Box>

          {/* Hours */}
          <Box style={{ minWidth: '80px', textAlign: 'right' }}>
            <Text variant="caption" color="muted">
              {item.actualHours ?? 0} / {item.estimatedHours ?? 0}h
            </Text>
          </Box>

          {/* Assignee */}
          {item.assigneeName !== null && (
            <Box
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={item.assigneeName}
            >
              <Text variant="caption" weight="semibold" style={{ color: 'var(--color-primary)' }}>
                {item.assigneeName.charAt(0).toUpperCase()}
              </Text>
            </Box>
          )}

          {/* Actions */}
          {(onEdit !== undefined || onDelete !== undefined) && (
            <HStack spacing="var(--spacing-1)">
              {onEdit !== undefined && (
                <Button size="sm" variant="ghost" onClick={handleEdit}>
                  Edit
                </Button>
              )}
              {onDelete !== undefined && (
                <Button size="sm" variant="ghost" onClick={handleDelete}>
                  Delete
                </Button>
              )}
            </HStack>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}

/**
 * Hierarchical list of scope items.
 */
export function ScopeItemList({
  scopeItems,
  onItemClick,
  onItemEdit,
  onItemDelete,
  showHierarchy = true,
  expandedIds = [],
  onToggleExpand,
  className,
  style,
}: ScopeItemListProps): React.ReactElement {
  const [localExpandedIds, setLocalExpandedIds] = useState<string[]>(expandedIds);

  const effectiveExpandedIds = onToggleExpand !== undefined ? expandedIds : localExpandedIds;

  const handleToggleExpand = (itemId: string) => {
    if (onToggleExpand !== undefined) {
      onToggleExpand(itemId);
    } else {
      setLocalExpandedIds((prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
    }
  };

  const buildTree = (items: ScopeItem[], parentId: string | null = null): ScopeItem[] => {
    return items.filter((item) => item.parentId === parentId);
  };

  const renderItems = (
    items: ScopeItem[],
    allItems: ScopeItem[],
    level: number = 0
  ): React.ReactNode => {
    return items.map((item) => {
      const children = buildTree(allItems, item.id);
      const hasChildren = children.length > 0;
      const isExpanded = effectiveExpandedIds.includes(item.id);

      return (
        <Box key={item.id}>
          <ScopeItemRow
            item={item}
            level={level}
            isExpanded={isExpanded}
            hasChildren={hasChildren}
            onClick={onItemClick}
            onEdit={onItemEdit}
            onDelete={onItemDelete}
            onToggleExpand={() => handleToggleExpand(item.id)}
          />
          {hasChildren && isExpanded && showHierarchy && (
            <Box>{renderItems(children, allItems, level + 1)}</Box>
          )}
        </Box>
      );
    });
  };

  const rootItems = showHierarchy
    ? buildTree(scopeItems, null)
    : scopeItems;

  const containerStyles: CSSProperties = {
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    ...style,
  };

  if (scopeItems.length === 0) {
    return (
      <Box className={className} style={containerStyles}>
        <Flex
          justify="center"
          align="center"
          style={{ padding: 'var(--spacing-8)' }}
        >
          <Text variant="body" color="muted">
            No scope items defined
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box className={className} style={containerStyles}>
      {/* Header */}
      <Box
        style={{
          padding: 'var(--spacing-3) var(--spacing-4)',
          backgroundColor: 'var(--color-gray-100)',
          borderBottom: '1px solid var(--color-gray-200)',
        }}
      >
        <Flex justify="space-between" align="center">
          <Text variant="bodySmall" weight="semibold">
            Work Breakdown Structure
          </Text>
          <HStack spacing="var(--spacing-4)">
            <Text variant="caption" color="muted">
              Progress
            </Text>
            <Text variant="caption" color="muted" style={{ minWidth: '80px', textAlign: 'right' }}>
              Hours
            </Text>
            <Text variant="caption" color="muted" style={{ minWidth: '28px' }}>
              Owner
            </Text>
          </HStack>
        </Flex>
      </Box>

      {/* Items */}
      {renderItems(rootItems, scopeItems)}
    </Box>
  );
}

export default ScopeItemList;
