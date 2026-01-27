import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Section, SectionHeader } from '../../components/catalyst/layout/Section';
import { Stack, HStack } from '../../components/catalyst/layout/Stack';
import { Button } from '../../components/catalyst/primitives/Button';
import { Text } from '../../components/catalyst/primitives/Text';
import { DocumentViewer } from '../../components/domain/documents';
import { useDocument } from '../../hooks';
import { fetchDocumentVersions } from '../../services/documentService';
import type { Document } from '../../types/documents';

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [versions, setVersions] = useState<Document[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [versionsLoading, setVersionsLoading] = useState(false);

  const { document, isLoading, error, refresh } = useDocument(id ?? '');

  const handleBack = () => {
    navigate('/documents');
  };

  const handleEdit = () => {
    if (document !== null) {
      navigate(`/documents/${document.id}/edit`);
    }
  };

  const handleDownload = () => {
    if (document !== null) {
      // In a real implementation, this would trigger a file download
      console.log('Download document:', document.filePath);
    }
  };

  const handleCheckout = async () => {
    // In a real implementation, this would call the checkout API
    console.log('Checkout document');
    await refresh();
  };

  const handleCheckin = async () => {
    // In a real implementation, this would open a file picker and upload
    console.log('Checkin document');
    await refresh();
  };

  const handleViewVersions = async () => {
    if (document === null) return;

    if (showVersions === false) {
      setVersionsLoading(true);
      try {
        const documentVersions = await fetchDocumentVersions(document.id);
        setVersions(documentVersions);
      } catch (err) {
        console.error('Failed to load versions:', err);
      } finally {
        setVersionsLoading(false);
      }
    }
    setShowVersions(!showVersions);
  };

  if (isLoading === true) {
    return (
      <Section id="document-detail">
        <SectionHeader title="Document" />
        <Text variant="body" color="secondary">Loading document...</Text>
      </Section>
    );
  }

  if (error !== null) {
    return (
      <Section id="document-detail">
        <SectionHeader title="Document" />
        <Stack gap="md">
          <Text variant="body" color="danger">{error.message}</Text>
          <Button onClick={handleBack}>Back to Documents</Button>
        </Stack>
      </Section>
    );
  }

  if (document === null) {
    return (
      <Section id="document-detail">
        <SectionHeader title="Document" />
        <Stack gap="md">
          <Text variant="body" color="secondary">Document not found</Text>
          <Button onClick={handleBack}>Back to Documents</Button>
        </Stack>
      </Section>
    );
  }

  return (
    <Section id="document-detail">
      <SectionHeader title={document.name}>
        <Button variant="ghost" onClick={handleBack}>
          Back to Documents
        </Button>
      </SectionHeader>

      <Stack gap="lg">
        <DocumentViewer
          document={document}
          onDownload={handleDownload}
          onCheckout={handleCheckout}
          onCheckin={handleCheckin}
          onEdit={handleEdit}
          onViewVersions={handleViewVersions}
        />

        {showVersions === true && (
          <Stack gap="md">
            <Text variant="heading5">Version History</Text>
            {versionsLoading === true ? (
              <Text variant="body" color="secondary">Loading versions...</Text>
            ) : (
              <Stack gap="sm">
                {versions.map((version) => (
                  <HStack
                    key={version.id}
                    justify="between"
                    align="center"
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#fafafa',
                      borderRadius: '0.375rem',
                    }}
                  >
                    <Stack gap="xs">
                      <Text variant="bodySmall" weight="semibold">
                        Version {version.versionNumber}
                      </Text>
                      <Text variant="caption" color="secondary">
                        {new Date(version.createdAt).toLocaleDateString()} by {version.createdByName ?? 'Unknown'}
                      </Text>
                    </Stack>
                    {version.isLatestVersion === true && (
                      <Text variant="caption" color="success">Current</Text>
                    )}
                  </HStack>
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    </Section>
  );
}
