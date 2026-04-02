/** Shared error body for mocked API failures (OpenAPI `ErrorResponse`). */
export const errorBody = {
  error: "experiment not found",
  request_id: "req_019462a4-b1c2-7def-8901-23456789abcd",
} as const;

/** Additional canned API error bodies for demos and MCP mock scenarios. */
export const mockErrors = {
  notFound: {
    error: "resource not found",
    request_id: "req_019462a4-b1c2-7def-8901-23456789aaaa",
  },
  validationError: {
    error: "validation failed: check experiment_spec.sequences",
    request_id: "req_019462a4-b1c2-7def-8901-23456789bbbb",
  },
  unauthorized: {
    error: "invalid or expired bearer token",
    request_id: "req_019462a4-b1c2-7def-8901-23456789cccc",
  },
} as const;

export const mockMeta = {
  description:
    "Example request/response bodies aligned with Adaptyv Foundry OpenAPI (see packages/sdk/tests/openapi.json).",
  openapiUrl: "https://foundry-api-public.adaptyvbio.com/api/v1/openapi.json",
} as const;

/** Stable IDs for cross-referencing across mockdata modules (demo dataset). */
export const mockIds = {
  targets: {
    her2: "c383cc1d-fe22-5dbf-953c-378bc073019d",
    pdl1: "f3b2afd0-f70b-5191-a90a-ae1e0545c744",
    egfr: "e7f8a9b0-c1d2-5345-e6f7-a890b1c2d3e4",
  },
  experiments: {
    draftScreening: "019d4a2b-0000-0000-0000-000000000001",
    waitingQuote: "019d4a2b-0000-0000-0000-000000000002",
    inProductionAffinity: "019d4a2b-0000-0000-0000-000000000003",
    doneThermostability: "019d4a2b-0000-0000-0000-000000000004",
  },
} as const;
