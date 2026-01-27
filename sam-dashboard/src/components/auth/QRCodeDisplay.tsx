import { Stack, Box, Card, CardBody } from '../../components/layout';
import { Text, Button } from '../../components/primitives';

interface QRCodeDisplayProps {
  qrCodeUrl: string;
  secret: string;
  onSecretCopied?: () => void;
}

/**
 * Component to display QR code and manual entry secret for MFA setup
 */
export function QRCodeDisplay({
  qrCodeUrl,
  secret,
  onSecretCopied,
}: QRCodeDisplayProps): React.ReactElement {
  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      if (onSecretCopied !== undefined) {
        onSecretCopied();
      }
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = secret;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      if (onSecretCopied !== undefined) {
        onSecretCopied();
      }
    }
  };

  // Format secret in groups of 4 for readability
  const formattedSecret = secret.match(/.{1,4}/g)?.join(' ') ?? secret;

  return (
    <Stack spacing="md">
      {/* QR Code */}
      <Card variant="bordered">
        <CardBody padding="md">
          <Stack spacing="md" style={{ alignItems: 'center' }}>
            <Text variant="body" color="muted" style={{ textAlign: 'center' }}>
              Scan this QR code with your authenticator app
            </Text>
            <Box
              style={{
                padding: '0.75rem',
                backgroundColor: 'white',
                borderRadius: '8px',
              }}
            >
              <img
                src={qrCodeUrl}
                alt="MFA QR Code"
                style={{
                  width: '200px',
                  height: '200px',
                  imageRendering: 'pixelated',
                }}
              />
            </Box>
          </Stack>
        </CardBody>
      </Card>

      {/* Manual Entry */}
      <Card variant="bordered">
        <CardBody padding="md">
          <Stack spacing="sm">
            <Text variant="caption" color="muted">
              Or enter this code manually:
            </Text>
            <Box
              style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                padding: '0.75rem',
                backgroundColor: '#f4f4f5',
                borderRadius: '4px',
                wordBreak: 'break-all',
                textAlign: 'center',
                letterSpacing: '0.1em',
              }}
            >
              {formattedSecret}
            </Box>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopySecret}
              fullWidth
            >
              Copy Secret Key
            </Button>
          </Stack>
        </CardBody>
      </Card>

      {/* Instructions */}
      <Text variant="caption" color="muted" style={{ textAlign: 'center' }}>
        Recommended apps: Google Authenticator, Authy, 1Password
      </Text>
    </Stack>
  );
}

export default QRCodeDisplay;
