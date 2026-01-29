/**
 * Type helpers for extracting types from OpenAPI-generated spec.
 *
 * These utilities provide a clean way to reference OpenAPI types without manual assertions.
 */

import type {paths} from './api.generated';

/**
 * Extract the response type from a GET endpoint.
 *
 * @example
 * type Certification = GetResponse<'/portal/certifications/{id}'>;
 */
export type GetResponse<T extends keyof paths> =
    paths[T] extends {get: {responses: {200: {content: {'application/json': infer R}}}}}
        ? R
        : never;

/**
 * Extract the response type from a POST endpoint.
 *
 * @example
 * type CreatedCertification = PostResponse<'/portal/certifications'>;
 */
export type PostResponse<T extends keyof paths> =
    paths[T] extends {post: {responses: {200: {content: {'application/json': infer R}}}}}
        ? R
        : never;

/**
 * Extract the response type from a PUT endpoint.
 *
 * @example
 * type UpdatedCertification = PutResponse<'/portal/certifications/{id}'>;
 */
export type PutResponse<T extends keyof paths> =
    paths[T] extends {put: {responses: {200: {content: {'application/json': infer R}}}}}
        ? R
        : never;

/**
 * Extract the response type from a PATCH endpoint.
 *
 * @example
 * type PatchedCertification = PatchResponse<'/portal/certifications/{id}'>;
 */
export type PatchResponse<T extends keyof paths> =
    paths[T] extends {patch: {responses: {200: {content: {'application/json': infer R}}}}}
        ? R
        : never;

/**
 * Extract the response type from a DELETE endpoint.
 *
 * @example
 * type DeleteResult = DeleteResponse<'/portal/certifications/{id}'>;
 */
export type DeleteResponse<T extends keyof paths> =
    paths[T] extends {delete: {responses: {200: {content: {'application/json': infer R}}}}}
        ? R
        : void;

/**
 * Extract the request body type from a POST endpoint.
 *
 * @example
 * type CreateCertificationRequest = PostRequestBody<'/portal/certifications'>;
 */
export type PostRequestBody<T extends keyof paths> =
    paths[T] extends {post: {requestBody: {content: {'application/json': infer R}}}}
        ? R
        : never;

/**
 * Extract the request body type from a PUT endpoint.
 *
 * @example
 * type UpdateCertificationRequest = PutRequestBody<'/portal/certifications/{id}'>;
 */
export type PutRequestBody<T extends keyof paths> =
    paths[T] extends {put: {requestBody: {content: {'application/json': infer R}}}}
        ? R
        : never;

/**
 * Extract the request body type from a PATCH endpoint.
 *
 * @example
 * type PatchCertificationRequest = PatchRequestBody<'/portal/certifications/{id}'>;
 */
export type PatchRequestBody<T extends keyof paths> =
    paths[T] extends {patch: {requestBody: {content: {'application/json': infer R}}}}
        ? R
        : never;

/**
 * Extract path parameters type from an endpoint.
 *
 * @example
 * type CertificationPathParams = PathParams<'/portal/certifications/{id}'>;
 */
export type PathParams<T extends keyof paths> =
    paths[T] extends {parameters: {path: infer P}}
        ? P
        : never;

/**
 * Extract query parameters type from an endpoint.
 *
 * @example
 * type CertificationQueryParams = QueryParams<'/portal/certifications'>;
 */
export type QueryParams<T extends keyof paths> =
    paths[T] extends {get: {parameters: {query: infer Q}}}
        ? Q
        : paths[T] extends {post: {parameters: {query: infer Q}}}
        ? Q
        : never;
