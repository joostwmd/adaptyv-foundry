import {
  errorResponseBodySchema,
  submitFeedbackInputSchema,
  submitFeedbackResponseSchema,
} from "@adaptyv/foundry-shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { errorBody, feedbackMockData } from "@adaptyv/foundry-shared/mockdata";
import { FoundryClient } from "../src/client.js";
import {
  assertLastFetch,
  installFetchMock,
  JSON_ACCEPT,
  jsonErrorResponse,
  jsonResponse,
} from "./test-utils.js";

describe("FeedbackResource", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = installFetchMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const client = () => new FoundryClient({ apiKey: "test-token" });

  it("submit — success (201)", async () => {
    const body = submitFeedbackInputSchema.parse({
      ...feedbackMockData.submit.requestBody,
    });
    fetchMock.mockResolvedValue(
      jsonResponse(feedbackMockData.submit.response, { status: 201 }),
    );
    const out = await client().feedback.submit(body);
    submitFeedbackResponseSchema.parse(out);
    expect(out).toEqual(feedbackMockData.submit.response);
    assertLastFetch(fetchMock, {
      method: "POST",
      urlIncludes: "/feedback/submit",
      accept: JSON_ACCEPT,
      body: feedbackMockData.submit.requestBody,
    });
  });

  it("submit — FoundryApiError", async () => {
    errorResponseBodySchema.parse(errorBody);
    fetchMock.mockResolvedValue(jsonErrorResponse(400, errorBody));
    await expect(
      client().feedback.submit({
        request_uuid: "01900abc-1234-7890-1234-567890abcdef",
        feedback_type: "bug_report",
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
