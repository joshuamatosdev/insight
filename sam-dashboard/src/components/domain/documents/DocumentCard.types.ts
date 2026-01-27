import type { Document } from '../../../types/documents';

export interface DocumentCardProps {
  document: Document;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onClick?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  showActions?: boolean;
}
