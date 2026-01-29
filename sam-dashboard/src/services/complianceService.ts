/**
 * Face Two (Portal) - Compliance Service
 * Handles certifications, clearances, and SBOM tracking for client contracts.
 *
 * REFACTORED: Uses openapi-fetch with proper type inference (no manual type assertions)
 * All types are automatically inferred from the OpenAPI spec.
 */

import {apiClient} from './apiClient';
import type {GetResponse, PostResponse, PutResponse, PostRequestBody, PutRequestBody} from '../types/openapi-helpers';

// ==================== Certification API ====================

export async function fetchCertifications(
    page: number = 0,
    size: number = 20,
    type?: string
): Promise<GetResponse<'/portal/certifications'>> {
    const queryParams: Record<string, string | number> = {page, size};
    if (type !== undefined) {
        queryParams.type = type;
    }

    const {data, error} = await apiClient.GET('/portal/certifications', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    // No type assertion needed - data is automatically typed from OpenAPI spec!
    return data;
}

export async function fetchCertification(id: string): Promise<GetResponse<'/portal/certifications/{id}'>> {
    const {data, error} = await apiClient.GET('/portal/certifications/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data;
}

export async function fetchExpiringCertifications(
    daysAhead: number = 30
): Promise<GetResponse<'/portal/certifications/expiring'>> {
    const {data, error} = await apiClient.GET('/portal/certifications/expiring', {
        params: {query: {daysAhead}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data;
}

export async function createCertification(
    request: PostRequestBody<'/portal/certifications'>
): Promise<PostResponse<'/portal/certifications'>> {
    const {data, error} = await apiClient.POST('/portal/certifications', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data;
}

export async function updateCertification(
    id: string,
    request: PutRequestBody<'/portal/certifications/{id}'>
): Promise<PutResponse<'/portal/certifications/{id}'>> {
    const {data, error} = await apiClient.PUT('/portal/certifications/{id}', {
        params: {path: {id}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data;
}

export async function updateCertificationStatus(
    id: string,
    status: string
): Promise<void> {
    const {error} = await apiClient.POST('/portal/certifications/{id}/status', {
        params: {path: {id}, query: {status}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function deleteCertification(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/portal/certifications/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function fetchCertificationTypes(): Promise<GetResponse<'/portal/certifications/types'>> {
    const {data, error} = await apiClient.GET('/portal/certifications/types');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data;
}

// ==================== Security Clearance API ====================

export async function fetchClearances(
    page: number = 0,
    size: number = 20,
    level?: string
): Promise<GetResponse<'/portal/clearances'>> {
    const queryParams: Record<string, string | number> = {page, size};
    if (level !== undefined) {
        queryParams.level = level;
    }

    const {data, error} = await apiClient.GET('/portal/clearances', {
        params: {query: queryParams},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data;
}

export async function fetchClearanceByUser(userId: string): Promise<GetResponse<'/portal/clearances/user/{userId}'>> {
    const {data, error} = await apiClient.GET('/portal/clearances/user/{userId}', {
        params: {path: {userId}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data;
}

export async function fetchExpiringClearances(
    daysAhead: number = 90
): Promise<GetResponse<'/portal/clearances/expiring'>> {
    const {data, error} = await apiClient.GET('/portal/clearances/expiring', {
        params: {query: {daysAhead}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data;
}

export async function fetchClearancesByMinLevel(
    minLevel: string
): Promise<GetResponse<'/portal/clearances/level/{minLevel}'>> {
    const {data, error} = await apiClient.GET('/portal/clearances/level/{minLevel}', {
        params: {path: {minLevel}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data;
}

export async function createClearance(
    request: PostRequestBody<'/portal/clearances'>
): Promise<PostResponse<'/portal/clearances'>> {
    const {data, error} = await apiClient.POST('/portal/clearances', {
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data;
}

export async function updateClearance(
    id: string,
    request: PutRequestBody<'/portal/clearances/{id}'>
): Promise<PutResponse<'/portal/clearances/{id}'>> {
    const {data, error} = await apiClient.PUT('/portal/clearances/{id}', {
        params: {path: {id}},
        body: request,
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data;
}

export async function updateClearanceStatus(id: string, status: string): Promise<void> {
    const {error} = await apiClient.POST('/portal/clearances/{id}/status', {
        params: {path: {id}, query: {status}},
        body: {},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function deleteClearance(id: string): Promise<void> {
    const {error} = await apiClient.DELETE('/portal/clearances/{id}', {
        params: {path: {id}},
    });

    if (error !== undefined) {
        throw new Error(String(error));
    }
}

export async function fetchClearanceLevels(): Promise<GetResponse<'/portal/clearances/levels'>> {
    const {data, error} = await apiClient.GET('/portal/clearances/levels');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data;
}

// ==================== SBOM API ====================

export async function fetchSbomInfo(): Promise<GetResponse<'/portal/sbom'>> {
    const {data, error} = await apiClient.GET('/portal/sbom');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data;
}

export async function fetchCycloneDxSbom(): Promise<GetResponse<'/portal/sbom/cyclonedx'>> {
    const {data, error} = await apiClient.GET('/portal/sbom/cyclonedx');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data;
}

export async function fetchSpdxSbom(): Promise<GetResponse<'/portal/sbom/spdx'>> {
    const {data, error} = await apiClient.GET('/portal/sbom/spdx');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data;
}

export async function fetchSbomVulnerabilities(): Promise<GetResponse<'/portal/sbom/vulnerabilities'>> {
    const {data, error} = await apiClient.GET('/portal/sbom/vulnerabilities');

    if (error !== undefined) {
        throw new Error(String(error));
    }

    return data;
}

// ==================== Compliance Overview ====================

export async function fetchComplianceItems() {
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

export async function fetchSbomData() {
    const info = await fetchSbomInfo();

    let bom: GetResponse<'/portal/sbom/cyclonedx'> | null = null;
    let vulnerabilities: GetResponse<'/portal/sbom/vulnerabilities'> | null = null;

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
