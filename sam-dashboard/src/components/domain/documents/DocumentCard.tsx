import {Card, CardBody, CardHeader, HStack, Stack} from '../../catalyst/layout';
import {Badge, Button, DownloadIcon, FileIcon, Text} from '../../catalyst/primitives';
import type {DocumentCardProps} from './DocumentCard.types';
import {formatFileSize, getDocumentStatusVariant, getDocumentTypeLabel,} from '../../../services/documentService';

function formatDate(dateString: string | null): string {
  if (dateString === null) {
    return '';
  }
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function DocumentCard({
  document,
  onEdit,
  onDelete,
  onClick,
  onDownload,
  showActions = true,
}: DocumentCardProps) {
  const handleClick = () => {
    if (onClick !== undefined) {
      onClick(document);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit !== undefined) {
      onEdit(document);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete !== undefined) {
      onDelete(document);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload !== undefined) {
      onDownload(document);
    }
  };

  return (
    <Card onClick={onClick !== undefined ? handleClick : undefined}>
      <CardHeader>
        <HStack justify="between" align="center">
          <HStack gap="sm" align="center">
            <FileIcon size="md" />
            <Text variant="heading5">{document.name}</Text>
          </HStack>
          <HStack gap="sm">
            <Badge color={getDocumentStatusVariant(document.status)}>
              {document.status}
            </Badge>
            <Badge color="gray">
              {getDocumentTypeLabel(document.documentType)}
            </Badge>
          </HStack>
        </HStack>
      </CardHeader>
      <CardBody>
        <HStack justify="between" align="start">
          <Stack gap="xs">
            {document.description !== null && (
              <Text variant="bodySmall" color="secondary">
                {document.description}
              </Text>
            )}
            <HStack gap="md">
              <Text variant="caption" color="secondary">
                {document.fileName}
              </Text>
              <Text variant="caption" color="secondary">
                {formatFileSize(document.fileSize)}
              </Text>
              {document.versionNumber > 1 && (
                <Text variant="caption" color="secondary">
                  v{document.versionNumber}
                </Text>
              )}
            </HStack>
            <HStack gap="md">
              <Text variant="caption" color="secondary">
                Updated: {formatDate(document.updatedAt)}
              </Text>
              {document.updatedByName !== null && (
                <Text variant="caption" color="secondary">
                  by {document.updatedByName}
                </Text>
              )}
            </HStack>
            {document.isCheckedOut === true && document.checkedOutByName !== null && (
              <Badge color="yellow">
                Checked out by {document.checkedOutByName}
              </Badge>
            )}
          </Stack>
          {showActions === true && (
            <HStack gap="sm">
              {onDownload !== undefined && (
                <Button variant="ghost" size="sm" onClick={handleDownload}>
                  <DownloadIcon size="sm" />
                </Button>
              )}
              {onEdit !== undefined && (
                <Button variant="ghost" size="sm" onClick={handleEdit}>
                  Edit
                </Button>
              )}
              {onDelete !== undefined && (
                <Button variant="ghost" size="sm" onClick={handleDelete}>
                  Delete
                </Button>
              )}
            </HStack>
          )}
        </HStack>
      </CardBody>
    </Card>
  );
}
