import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Flex,
  Stack,
  Box,
  HStack,
} from '../components/catalyst/layout';
import {
  Text,
  Button,
  AuthLayout,
} from '../components/catalyst/primitives';
import { BuildingCheckIcon, CheckCircleIcon } from '../components/catalyst/primitives/Icon';
import { OtpInput } from '../components/auth/OtpInput';
import { QRCodeDisplay } from '../components/auth/QRCodeDisplay';
import { BackupCodesDisplay } from '../components/auth/BackupCodesDisplay';
import { startMfaSetup, verifyMfaSetup } from '../services/mfaService';
import { useAuth } from '../auth';

type SetupStep = 'intro' | 'scan' | 'verify' | 'backup' | 'complete';

/**
 * MFA Setup page - guides user through enabling 2FA
 */
export function MfaSetupPage(): React.ReactElement {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [step, setStep] = useState<SetupStep>('intro');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secretCopied, setSecretCopied] = useState(false);
  const [backupCodesSaved, setBackupCodesSaved] = useState(false);

  const handleStartSetup = async () => {
    if (token === null || token === undefined) {
      setError('Not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await startMfaSetup(token);
      setQrCodeUrl(response.qrCodeUrl);
      setSecret(response.secret);
      setStep('scan');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (token === null || token === undefined) {
      setError('Not authenticated');
      return;
    }

    if (verificationCode.length < 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await verifyMfaSetup(token, verificationCode);
      if (response.backupCodes !== null && response.backupCodes.length > 0) {
        setBackupCodes(response.backupCodes);
        setStep('backup');
      } else {
        setStep('complete');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
      setVerificationCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    navigate('/settings/security');
  };

  const renderStep = (): React.ReactElement => {
    switch (step) {
      case 'intro':
        return (
          <Stack spacing="md">
            <Text variant="heading4" className="text-center">
              Set Up Two-Factor Authentication
            </Text>
            <Text variant="body" color="muted" className="text-center">
              Add an extra layer of security to your account by requiring a code
              from your authenticator app in addition to your password.
            </Text>
            <Card variant="bordered">
              <CardBody padding="md">
                <Stack spacing="md">
                  <Text variant="body" weight="semibold">
                    What you&apos;ll need:
                  </Text>
                  <Stack spacing="sm">
                    <Text variant="body">- An authenticator app on your phone</Text>
                    <Text variant="body">- A few minutes to complete setup</Text>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
            <Button
              variant="primary"
              onClick={handleStartSetup}
              disabled={isLoading}
              fullWidth
            >
              {isLoading === true ? 'Starting...' : 'Begin Setup'}
            </Button>
          </Stack>
        );

      case 'scan':
        return (
          <Stack spacing="md">
            <Text variant="heading4" className="text-center">
              Scan QR Code
            </Text>
            <QRCodeDisplay
              qrCodeUrl={qrCodeUrl}
              secret={secret}
              onSecretCopied={() => setSecretCopied(true)}
            />
            {secretCopied === true && (
              <Text variant="caption" color="success" className="text-center">
                Secret copied to clipboard
              </Text>
            )}
            <Button
              variant="primary"
              onClick={() => setStep('verify')}
              fullWidth
            >
              Continue
            </Button>
          </Stack>
        );

      case 'verify':
        return (
          <Stack spacing="md">
            <Text variant="heading4" className="text-center">
              Verify Setup
            </Text>
            <Text variant="body" color="muted" className="text-center">
              Enter the 6-digit code from your authenticator app to verify setup.
            </Text>
            <OtpInput
              value={verificationCode}
              onChange={setVerificationCode}
              onComplete={handleVerify}
              autoFocus
              error={error !== null}
            />
            {error !== null && (
              <Text variant="caption" color="danger" className="text-center">
                {error}
              </Text>
            )}
            <HStack gap="sm">
              <Button
                variant="secondary"
                onClick={() => setStep('scan')}
                fullWidth
              >
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleVerify}
                disabled={isLoading === true || verificationCode.length < 6}
                fullWidth
              >
                {isLoading === true ? 'Verifying...' : 'Verify'}
              </Button>
            </HStack>
          </Stack>
        );

      case 'backup':
        return (
          <Stack spacing="md">
            <Text variant="heading4" className="text-center">
              Save Backup Codes
            </Text>
            <BackupCodesDisplay
              codes={backupCodes}
              onCopy={() => setBackupCodesSaved(true)}
              onDownload={() => setBackupCodesSaved(true)}
            />
            <Button
              variant="primary"
              onClick={() => setStep('complete')}
              disabled={backupCodesSaved === false}
              fullWidth
            >
              {backupCodesSaved === true ? 'Continue' : 'Save codes to continue'}
            </Button>
          </Stack>
        );

      case 'complete':
        return (
          <Stack spacing="md" align="center" className="text-center">
            <Box className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <CheckCircleIcon size="lg" className="text-green-600 dark:text-green-400" />
            </Box>
            <Text variant="heading4">
              Two-Factor Authentication Enabled
            </Text>
            <Text variant="body" color="muted">
              Your account is now protected with an additional layer of security.
              You&apos;ll need your authenticator app each time you sign in.
            </Text>
            <Button variant="primary" onClick={handleComplete} fullWidth>
              Done
            </Button>
          </Stack>
        );
    }
  };

  return (
    <AuthLayout>
      <Box className="w-full max-w-md">
        <Card variant="elevated">
          <CardBody padding="lg">
            <Flex justify="center" className="mb-4">
              <BuildingCheckIcon size="xl" className="text-blue-600 dark:text-blue-400" />
            </Flex>
            {renderStep()}
          </CardBody>
        </Card>
      </Box>
    </AuthLayout>
  );
}

export default MfaSetupPage;
