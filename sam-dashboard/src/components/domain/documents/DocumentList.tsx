import { Stack } from '../../catalyst/layout';
import { Text } from '../../catalyst/primitives';
import { DocumentCard } from './DocumentCard';
import type { Document } from '../../../types/documents';

export interface DocumentListProps {
  documents: Document[];
  isLoading: boolean;
  onDocumentClick?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  emptyMessage?: string;
}

export function DocumentList({
  documents,
  isLoading,
  onDocumentClick,
  onEdit,
  onDelete,
  onDownload,
  emptyMessage = 'No documents found',
}: DocumentListProps) {
  if (isLoading === true) {
    return (
      <Stack gap="md">
        <Text variant="body" color="secondary">Loading documents...</Text>
      </Stack>
    );
  }

  if (documents.length === 0) {
    return (
      <Stack gap="md">
        <Text variant="body" color="secondary">{emptyMessage}</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="md">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          onClick={onDocumentClick}
          onEdit={onEdit}
          onDelete={onDelete}
          onDownload={onDownload}
        />
      ))}
    </Stack>
  );
}
