/**
 * Auth Components Barrel Export
 *
 * Components related to authentication, authorization, and permission-based rendering.
 */

// Permission-based rendering
export {
    Can,
    useCanI,
    useCan,
} from './Can';
export type {
    CanProps,
    PermissionAction,
    PermissionResource,
} from './Can';

// MFA components
export {BackupCodesDisplay} from './BackupCodesDisplay';
export {OtpInput} from './OtpInput';
export {QRCodeDisplay} from './QRCodeDisplay';

// Social login
export {SocialLoginButtons} from './SocialLoginButtons';
