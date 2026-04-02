import {
  errorResponseBodySchema,
  listUpdatesForExperimentInputSchema,
  listUpdatesInputSchema,
  updateListResponseSchema,
} from "@adaptyv/foundry-shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FoundryClient } from "../src/client.js";
import { errorBody, updateMockData } from "@adaptyv/foundry-shared/mockdata";
import {
  assertLastFetch,
  installFetchMock,
  JSON_ACCEPT,
  jsonErrorResponse,
  jsonResponse,
} from "./test-utils.js";

describe("UpdatesResource", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = installFetchMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const client = () => new FoundryClient({ apiKey: "test-token" });

  it("list — success", async () => {
    const query = listUpdatesInputSchema.parse({ ...updateMockData.list.query });
    fetchMock.mockResolvedValue(jsonResponse(updateMockData.list.response));
    const out = await client().updates.list(query);
    updateListResponseSchema.parse(out);
    expect(out).toEqual(updateMockData.list.response);
    assertLastFetch(fetchMock, {
      method: "GET",
      urlIncludes: "/updates",
      accept: JSON_ACCEPT,
      noBody: true,
    });
  });

  it("list — FoundryApiError", async () => {
    errorResponseBodySchema.parse(errorBody);
    fetchMock.mockResolvedValue(jsonErrorResponse(500, errorBody));
    await expect(client().updates.list({})).rejects.toMatchObject({
      status: 500,
    });
  });

  it("listForExperiment — success", async () => {
    const input = listUpdatesForExperimentInputSchema.parse({
      ...updateMockData.listForExperiment.input,
    });
    const { experiment_id } = input;
    fetchMock.mockResolvedValue(
      jsonResponse(updateMockData.listForExperiment.response),
    );
    const out = await client().updates.listForExperiment(input);
    updateListResponseSchema.parse(out);
    expect(out).toEqual(updateMockData.listForExperiment.response);
    assertLastFetch(fetchMock, {
      method: "GET",
      urlIncludes: `/experiments/${experiment_id}/updates`,
      accept: JSON_ACCEPT,
      noBody: true,
    });
  });

  it("listForExperiment — FoundryApiError", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponse(404, errorBody));
    await expect(
      client().updates.listForExperiment({ experiment_id: "x" }),
    ).rejects.toMatchObject({ status: 404 });
  });
});
