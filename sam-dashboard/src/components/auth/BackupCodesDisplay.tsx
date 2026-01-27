import { Stack, Box, Card, CardBody, Grid } from '../../components/layout';
import { Text, Button } from '../../components/primitives';

interface BackupCodesDisplayProps {
  codes: string[];
  onDownload?: () => void;
  onCopy?: () => void;
}

/**
 * Component to display and allow saving of MFA backup codes
 */
export function BackupCodesDisplay({
  codes,
  onDownload,
  onCopy,
}: BackupCodesDisplayProps): React.ReactElement {
  const handleCopy = async () => {
    try {
      const codesText = codes.join('\n');
      await navigator.clipboard.writeText(codesText);
      if (onCopy !== undefined) {
        onCopy();
      }
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = codes.join('\n');
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      if (onCopy !== undefined) {
        onCopy();
      }
    }
  };

  const handleDownload = () => {
    const codesText = `SAM.gov Contract Intelligence - Backup Codes\n${'='.repeat(50)}\n\nStore these codes in a safe place. Each code can only be used once.\n\n${codes.map((code, i) => `${i + 1}. ${code}`).join('\n')}\n\nGenerated: ${new Date().toISOString()}`;
    
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'samgov-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (onDownload !== undefined) {
      onDownload();
    }
  };

  return (
    <Stack spacing="var(--spacing-4)">
      {/* Warning */}
      <Card variant="bordered" style={{ backgroundColor: 'var(--color-warning-50)' }}>
        <CardBody padding="md">
          <Stack spacing="var(--spacing-2)">
            <Text variant="body" style={{ fontWeight: 600, color: 'var(--color-warning-700)' }}>
              Important: Save these backup codes
            </Text>
            <Text variant="caption" color="muted">
              These codes can be used to access your account if you lose your authenticator device.
              Each code can only be used once. Store them in a secure location.
            </Text>
          </Stack>
        </CardBody>
      </Card>

      {/* Codes Grid */}
      <Card variant="bordered">
        <CardBody padding="md">
          <Grid columns={2} gap="sm">
            {codes.map((code, index) => (
              <Box
                key={code}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  padding: 'var(--spacing-2)',
                  backgroundColor: 'var(--color-gray-50)',
                  borderRadius: '4px',
                  textAlign: 'center',
                }}
              >
                <Text variant="caption" color="muted" className="mr-2">
                  {index + 1}.
                </Text>
                {code}
              </Box>
            ))}
          </Grid>
        </CardBody>
      </Card>

      {/* Actions */}
      <Grid columns={2} gap="sm">
        <Button variant="secondary" onClick={handleCopy} fullWidth>
          Copy All
        </Button>
        <Button variant="secondary" onClick={handleDownload} fullWidth>
          Download
        </Button>
      </Grid>

      <Text variant="caption" color="muted" style={{ textAlign: 'center' }}>
        You have {codes.length} backup codes. You&apos;ll be notified when running low.
      </Text>
    </Stack>
  );
}

export default BackupCodesDisplay;
