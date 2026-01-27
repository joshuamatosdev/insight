// DocumentFolder types aligned with Java backend

export type FolderType =
  | 'ROOT'
  | 'OPPORTUNITY'
  | 'CONTRACT'
  | 'PROPOSAL'
  | 'COMPLIANCE'
  | 'FINANCIAL'
  | 'PERSONNEL'
  | 'TEMPLATE'
  | 'ARCHIVE'
  | 'CUSTOM';

export interface DocumentFolder {
  id: string;
  name: string;
  description: string | null;
  folderType: FolderType;
  path: string;
  depth: number;
  sortOrder: number;
  isPublic: boolean;
  isSystemFolder: boolean;
  tags: string | null;
  icon: string | null;
  color: string | null;
  retentionDays: number | null;
  parentFolderId: string | null;
  opportunityId: string | null;
  contractId: string | null;
  createdById: string | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  documentCount?: number;
  subFolderCount?: number;
}

export interface CreateFolderRequest {
  name: string;
  description?: string;
  folderType?: FolderType;
  parentFolderId?: string;
  opportunityId?: string;
  contractId?: string;
  tags?: string;
  icon?: string;
  color?: string;
  retentionDays?: number;
}

export interface UpdateFolderRequest {
  name?: string;
  description?: string;
  folderType?: FolderType;
  tags?: string;
  icon?: string;
  color?: string;
  retentionDays?: number;
  sortOrder?: number;
}
