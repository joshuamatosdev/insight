/**
 * Compliance Service - Type-safe using openapi-fetch
 */

import {apiClient} from './apiClient';
import type {
    Certification,
    CertificationStatus,
    CertificationType,
    ClearanceLevel,
    ClearanceStatus,
    CreateCertificationRequest,
    CreateClearanceRequest,
    CycloneDxBom,
    SbomInfo,
    SbomVulnerabilityInfo,
    SecurityClearance,
    UpdateCertificationRequest,
    UpdateClearanceRequest,
} from '../types/compliance.types';
import type {PaginatedResponse} from '../types/financial.types';

// ==================== Certification API ====================

export async function fetchCertifications(
    page: number = 0,
    size: number = 20,
    type?: CertificationType
): Promise<PaginatedResponse<Certification>> {
    const queryParams: Record<string, string | number> = {page, size};
    if (type !== undefined) {
        queryParams.type = type;
    }

    const {data, error} = await apiClient.GET('/certifications', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as PaginatedResponse<Certification>;
}

export async function fetchCertification(id: string): Promise<Certification> {
    const {data, error} = await apiClient.GET('/certifications/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Certification;
}

export async function fetchExpiringCertifications(
    daysAhead: number = 30
): Promise<Certification[]> {
    const {data, error} = await apiClient.GET('/certifications/expiring', {
        params: {query: {daysAhead}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Certification[];
}

export async function createCertification(
    request: CreateCertificationRequest
): Promise<Certification> {
    const {data, error} = await apiClient.POST('/certifications', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Certification;
}

export async function updateCertification(
    id: string,
    request: UpdateCertificationRequest
): Promise<Certification> {
    const {data, error} = await apiClient.PUT('/certifications/{id}', {
        params: {path: {id}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as Certification;
}

export async function updateCertificationStatus(
    id: string,
    status: CertificationStatus
): Promise<void> {
    const {error} = await apiClient.POST('/certifications/{id}/status', {
        params: {path: {id}, query: {status}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function deleteCertification(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/certifications/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function fetchCertificationTypes(): Promise<CertificationType[]> {
    const {data, error} = await apiClient.GET('/certifications/types');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as CertificationType[];
}

// ==================== Security Clearance API ====================

export async function fetchClearances(
    page: number = 0,
    size: number = 20,
    level?: ClearanceLevel
): Promise<PaginatedResponse<SecurityClearance>> {
    const queryParams: Record<string, string | number> = {page, size};
    if (level !== undefined) {
        queryParams.level = level;
    }

    const {data, error} = await apiClient.GET('/clearances', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as PaginatedResponse<SecurityClearance>;
}

export async function fetchClearanceByUser(userId: string): Promise<SecurityClearance> {
    const {data, error} = await apiClient.GET('/clearances/user/{userId}', {
        params: {path: {userId}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as SecurityClearance;
}

export async function fetchExpiringClearances(daysAhead: number = 90): Promise<SecurityClearance[]> {
    const {data, error} = await apiClient.GET('/clearances/expiring', {
        params: {query: {daysAhead}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as SecurityClearance[];
}

export async function fetchClearancesByMinLevel(
    minLevel: ClearanceLevel
): Promise<SecurityClearance[]> {
    const {data, error} = await apiClient.GET('/clearances/level/{minLevel}', {
        params: {path: {minLevel}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as SecurityClearance[];
}

export async function createClearance(request: CreateClearanceRequest): Promise<SecurityClearance> {
    const {data, error} = await apiClient.POST('/clearances', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as SecurityClearance;
}

export async function updateClearance(
    id: string,
    request: UpdateClearanceRequest
): Promise<SecurityClearance> {
    const {data, error} = await apiClient.PUT('/clearances/{id}', {
        params: {path: {id}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as SecurityClearance;
}

export async function updateClearanceStatus(id: string, status: ClearanceStatus): Promise<void> {
    const {error} = await apiClient.POST('/clearances/{id}/status', {
        params: {path: {id}, query: {status}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function deleteClearance(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/clearances/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function fetchClearanceLevels(): Promise<ClearanceLevel[]> {
    const {data, error} = await apiClient.GET('/clearances/levels');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as ClearanceLevel[];
}

// ==================== SBOM API ====================

export async function fetchSbomInfo(): Promise<SbomInfo> {
    const {data, error} = await apiClient.GET('/sbom');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as SbomInfo;
}

export async function fetchCycloneDxSbom(): Promise<CycloneDxBom> {
    const {data, error} = await apiClient.GET('/sbom/cyclonedx');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as CycloneDxBom;
}

export async function fetchSpdxSbom(): Promise<unknown> {
    const {data, error} = await apiClient.GET('/sbom/spdx');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data;
}

export async function fetchSbomVulnerabilities(): Promise<SbomVulnerabilityInfo> {
    const {data, error} = await apiClient.GET('/sbom/vulnerabilities');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data as SbomVulnerabilityInfo;
}

// ==================== Compliance Overview ====================

export async function fetchComplianceItems(): Promise<{
    certifications: Certification[];
    clearances: SecurityClearance[];
    expiringCertifications: Certification[];
    expiringClearances: SecurityClearance[];
}> {
    // Fetch all data in parallel
    const [certifications, clearances, expiringCertifications, expiringClearances] =
        await Promise.all([
            fetchCertifications(0, 100),
            fetchClearances(0, 100),
            fetchExpiringCertifications(90),
            fetchExpiringClearances(90),
        ]);

    return {
        certifications: certifications.content,
        clearances: clearances.content,
        expiringCertifications,
        expiringClearances,
    };
}

export async function fetchSbomData(): Promise<{
    info: SbomInfo;
    bom: CycloneDxBom | null;
    vulnerabilities: SbomVulnerabilityInfo | null;
}> {
    const info = await fetchSbomInfo();

    let bom: CycloneDxBom | null = null;
    let vulnerabilities: SbomVulnerabilityInfo | null = null;

    if (info.cyclonedxAvailable) {
        try {
            bom = await fetchCycloneDxSbom();
        } catch {
            // SBOM not available, continue
        }
    }

    try {
        vulnerabilities = await fetchSbomVulnerabilities();
    } catch {
        // Vulnerabilities not available, continue
    }

    return {
        info,
        bom,
        vulnerabilities,
    };
}
