import { useState, useRef } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '../../layout/Card';
import { Stack, HStack } from '../../layout/Stack';
import { Text } from '../../primitives/Text';
import { Input, Select } from '../../primitives/Input';
import { Button } from '../../primitives/Button';
import type {
  CreateDocumentRequest,
  DocumentType,
  DocumentStatus,
  AccessLevel,
} from '../../../types/documents';

export interface DocumentUploadFormProps {
  onSubmit: (request: CreateDocumentRequest, file: File | null) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  folderId?: string;
}

const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: 'RFP', label: 'RFP' },
  { value: 'RFQ', label: 'RFQ' },
  { value: 'RFI', label: 'RFI' },
  { value: 'SOURCES_SOUGHT', label: 'Sources Sought' },
  { value: 'AMENDMENT', label: 'Amendment' },
  { value: 'PROPOSAL_TECHNICAL', label: 'Technical Proposal' },
  { value: 'PROPOSAL_MANAGEMENT', label: 'Management Proposal' },
  { value: 'PROPOSAL_COST', label: 'Cost Proposal' },
  { value: 'COVER_LETTER', label: 'Cover Letter' },
  { value: 'EXECUTIVE_SUMMARY', label: 'Executive Summary' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'TASK_ORDER', label: 'Task Order' },
  { value: 'STATEMENT_OF_WORK', label: 'Statement of Work' },
  { value: 'NDA', label: 'NDA' },
  { value: 'TEAMING_AGREEMENT', label: 'Teaming Agreement' },
  { value: 'RESUME', label: 'Resume' },
  { value: 'DELIVERABLE', label: 'Deliverable' },
  { value: 'REPORT', label: 'Report' },
  { value: 'PRESENTATION', label: 'Presentation' },
  { value: 'OTHER', label: 'Other' },
];

const STATUS_OPTIONS: { value: DocumentStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'APPROVED', label: 'Approved' },
];

const ACCESS_LEVEL_OPTIONS: { value: AccessLevel; label: string }[] = [
  { value: 'PUBLIC', label: 'Public' },
  { value: 'INTERNAL', label: 'Internal' },
  { value: 'RESTRICTED', label: 'Restricted' },
  { value: 'CONFIDENTIAL', label: 'Confidential' },
];

export function DocumentUploadForm({
  onSubmit,
  onCancel,
  isLoading = false,
  folderId,
}: DocumentUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    documentType: DocumentType;
    status: DocumentStatus;
    accessLevel: AccessLevel;
    tags: string;
    keywords: string;
    author: string;
  }>({
    name: '',
    description: '',
    documentType: 'OTHER',
    status: 'DRAFT',
    accessLevel: 'INTERNAL',
    tags: '',
    keywords: '',
    author: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.item(0) ?? null;
    if (selectedFile !== null) {
      setFile(selectedFile);
      if (formData.name === '') {
        setFormData((prev) => ({ ...prev, name: selectedFile.name }));
      }
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSelectChange = (field: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.name === '' || file === null) {
      return;
    }

    const request: CreateDocumentRequest = {
      name: formData.name,
      description: formData.description !== '' ? formData.description : undefined,
      documentType: formData.documentType,
      status: formData.status,
      accessLevel: formData.accessLevel,
      fileName: file.name,
      filePath: `/uploads/${file.name}`, // This would be the actual upload path from the server
      fileSize: file.size,
      contentType: file.type,
      tags: formData.tags !== '' ? formData.tags : undefined,
      keywords: formData.keywords !== '' ? formData.keywords : undefined,
      author: formData.author !== '' ? formData.author : undefined,
      folderId: folderId,
    };

    await onSubmit(request, file);
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current !== null) {
      fileInputRef.current.click();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <Text variant="heading4">Upload Document</Text>
        </CardHeader>
        <CardBody>
          <Stack gap="lg">
            <Stack gap="sm">
              <Text variant="label">File</Text>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <HStack gap="md" align="center">
                <Button type="button" variant="secondary" onClick={handleBrowseClick}>
                  Browse...
                </Button>
                {file !== null && (
                  <Text variant="bodySmall" color="secondary">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </Text>
                )}
              </HStack>
            </Stack>

            <Stack gap="sm">
              <Text variant="label">Document Name</Text>
              <Input
                placeholder="Enter document name"
                value={formData.name}
                onChange={handleInputChange('name')}
                required
              />
            </Stack>

            <Stack gap="sm">
              <Text variant="label">Description</Text>
              <Input
                placeholder="Enter description (optional)"
                value={formData.description}
                onChange={handleInputChange('description')}
              />
            </Stack>

            <HStack gap="md">
              <Stack gap="sm" style={{ flex: 1 }}>
                <Text variant="label">Document Type</Text>
                <Select
                  value={formData.documentType}
                  onChange={handleSelectChange('documentType')}
                  options={DOCUMENT_TYPE_OPTIONS}
                />
              </Stack>

              <Stack gap="sm" style={{ flex: 1 }}>
                <Text variant="label">Status</Text>
                <Select
                  value={formData.status}
                  onChange={handleSelectChange('status')}
                  options={STATUS_OPTIONS}
                />
              </Stack>

              <Stack gap="sm" style={{ flex: 1 }}>
                <Text variant="label">Access Level</Text>
                <Select
                  value={formData.accessLevel}
                  onChange={handleSelectChange('accessLevel')}
                  options={ACCESS_LEVEL_OPTIONS}
                />
              </Stack>
            </HStack>

            <HStack gap="md">
              <Stack gap="sm" style={{ flex: 1 }}>
                <Text variant="label">Author</Text>
                <Input
                  placeholder="Document author"
                  value={formData.author}
                  onChange={handleInputChange('author')}
                />
              </Stack>

              <Stack gap="sm" style={{ flex: 1 }}>
                <Text variant="label">Tags</Text>
                <Input
                  placeholder="Comma-separated tags"
                  value={formData.tags}
                  onChange={handleInputChange('tags')}
                />
              </Stack>
            </HStack>

            <Stack gap="sm">
              <Text variant="label">Keywords</Text>
              <Input
                placeholder="Comma-separated keywords for search"
                value={formData.keywords}
                onChange={handleInputChange('keywords')}
              />
            </Stack>
          </Stack>
        </CardBody>
        <CardFooter>
          <HStack justify="end" gap="md">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading === true || file === null || formData.name === ''}
            >
              {isLoading === true ? 'Uploading...' : 'Upload Document'}
            </Button>
          </HStack>
        </CardFooter>
      </Card>
    </form>
  );
}
