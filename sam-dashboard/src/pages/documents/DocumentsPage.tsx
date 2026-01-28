import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Section, SectionHeader, Stack, HStack, Grid } from '../../components/catalyst/layout';
import { Input, Select, Button, Text } from '../../components/catalyst/primitives';
import { DocumentList, FolderTree } from '../../components/domain/documents';
import { useDocuments, useFolders } from '../../hooks';
import type { Document, DocumentType, DocumentFolder } from '../../types/documents';

const DOCUMENT_TYPE_OPTIONS: { value: DocumentType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'RFP', label: 'RFP' },
  { value: 'RFQ', label: 'RFQ' },
  { value: 'PROPOSAL_TECHNICAL', label: 'Technical Proposal' },
  { value: 'PROPOSAL_COST', label: 'Cost Proposal' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'STATEMENT_OF_WORK', label: 'Statement of Work' },
  { value: 'NDA', label: 'NDA' },
  { value: 'RESUME', label: 'Resume' },
  { value: 'DELIVERABLE', label: 'Deliverable' },
  { value: 'REPORT', label: 'Report' },
  { value: 'OTHER', label: 'Other' },
];

export function DocumentsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const {
    documents,
    isLoading: documentsLoading,
    error: documentsError,
    page,
    totalPages,
    totalElements,
    filters,
    setFilters,
    setPage,
    remove,
  } = useDocuments({ folderId: selectedFolderId ?? undefined });

  const {
    folders,
    isLoading: foldersLoading,
  } = useFolders();

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setFilters({ ...filters, search: value });
  };

  const handleTypeFilterChange = (value: string) => {
    if (value === '') {
      const { documentType: _unused, ...rest } = filters;
      void _unused;
      setFilters(rest);
    } else {
      setFilters({ ...filters, documentType: value as DocumentType });
    }
  };

  const handleFolderSelect = (folder: DocumentFolder | null) => {
    if (folder === null) {
      setSelectedFolderId(null);
      setFilters({ ...filters, folderId: undefined });
    } else {
      setSelectedFolderId(folder.id);
      setFilters({ ...filters, folderId: folder.id });
    }
  };

  const handleDocumentClick = (document: Document) => {
    navigate(`/documents/${document.id}`);
  };

  const handleEdit = (document: Document) => {
    navigate(`/documents/${document.id}/edit`);
  };

  const handleDelete = async (document: Document) => {
    if (window.confirm(`Are you sure you want to delete "${document.name}"?`) === true) {
      try {
        await remove(document.id);
      } catch (err) {
        console.error('Failed to delete document:', err);
      }
    }
  };

  const handleDownload = (document: Document) => {
    // In a real implementation, this would trigger a file download
    console.log('Download document:', document.filePath);
  };

  const handleUploadClick = () => {
    const uploadPath = selectedFolderId !== null
      ? `/documents/upload?folderId=${selectedFolderId}`
      : '/documents/upload';
    navigate(uploadPath);
  };

  return (
    <Section id="documents">
      <SectionHeader title="Documents">
        <Button onClick={handleUploadClick}>Upload Document</Button>
      </SectionHeader>

      <Grid columns="250px 1fr" gap="lg">
        <Stack gap="md">
          <Text variant="heading5">Folders</Text>
          <FolderTree
            folders={folders}
            selectedFolderId={selectedFolderId}
            onFolderSelect={handleFolderSelect}
            isLoading={foldersLoading}
          />
        </Stack>

        <Stack gap="lg">
          <HStack gap="md">
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <Select
              value={filters.documentType ?? ''}
              onChange={(e) => handleTypeFilterChange(e.target.value)}
              options={DOCUMENT_TYPE_OPTIONS}
            />
          </HStack>

          {documentsError !== null && (
            <Text variant="body" color="danger">
              {documentsError.message}
            </Text>
          )}

          <DocumentList
            documents={documents}
            isLoading={documentsLoading}
            onDocumentClick={handleDocumentClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDownload={handleDownload}
          />

          {totalPages > 1 && (
            <HStack justify="between" align="center">
              <Text variant="bodySmall" color="secondary">
                Showing {documents.length} of {totalElements} documents
              </Text>
              <HStack gap="sm">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Text variant="bodySmall">
                  Page {page + 1} of {totalPages}
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </HStack>
            </HStack>
          )}
        </Stack>
      </Grid>
    </Section>
  );
}
