import {useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {Section, SectionHeader, Stack} from '../../components/catalyst/layout';
import {Button, Text} from '../../components/catalyst/primitives';
import {DocumentUploadForm} from '../../components/domain/documents';
import {useDocuments} from '../../hooks';
import type {CreateDocumentRequest} from '../../types/documents';

export function DocumentUploadPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get('folderId') ?? undefined;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { create } = useDocuments();

  const handleSubmit = async (request: CreateDocumentRequest, _file: File | null) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // In a real implementation, you would first upload the file to get the file path
      // For now, we'll just create the document with the provided data
      await create(request);
      navigate('/documents');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/documents');
  };

  const handleBack = () => {
    navigate('/documents');
  };

  return (
    <Section id="document-upload">
      <SectionHeader title="Upload Document">
        <Button variant="ghost" onClick={handleBack}>
          Back to Documents
        </Button>
      </SectionHeader>

      <Stack gap="lg">
        {error !== null && (
          <Text variant="body" color="danger">{error}</Text>
        )}

        <DocumentUploadForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
          folderId={folderId}
        />
      </Stack>
    </Section>
  );
}
