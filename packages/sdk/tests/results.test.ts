import {
  errorResponseBodySchema,
  getResultInputSchema,
  listResultsForExperimentInputSchema,
  listResultsInputSchema,
  resultInfoSchema,
  resultListResponseSchema,
} from "@adaptyv/foundry-shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FoundryClient } from "../src/client.js";
import { errorBody, resultMockData } from "@adaptyv/foundry-shared/mockdata";
import {
  assertLastFetch,
  installFetchMock,
  JSON_ACCEPT,
  jsonErrorResponse,
  jsonResponse,
} from "./test-utils.js";

describe("ResultsResource", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = installFetchMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const client = () => new FoundryClient({ apiKey: "test-token" });

  it("list — success", async () => {
    const query = listResultsInputSchema.parse({ ...resultMockData.list.query });
    fetchMock.mockResolvedValue(jsonResponse(resultMockData.list.response));
    const out = await client().results.list(query);
    resultListResponseSchema.parse(out);
    expect(out).toEqual(resultMockData.list.response);
    assertLastFetch(fetchMock, {
      method: "GET",
      urlIncludes: "/results",
      accept: JSON_ACCEPT,
      noBody: true,
    });
  });

  it("list — FoundryApiError", async () => {
    errorResponseBodySchema.parse(errorBody);
    fetchMock.mockResolvedValue(jsonErrorResponse(500, errorBody));
    await expect(client().results.list({})).rejects.toMatchObject({
      status: 500,
    });
  });

  it("get — success", async () => {
    const rPath = getResultInputSchema.parse({ ...resultMockData.get.path });
    fetchMock.mockResolvedValue(jsonResponse(resultMockData.get.response));
    const out = await client().results.get(rPath);
    resultInfoSchema.parse(out);
    expect(out).toEqual(resultMockData.get.response);
    assertLastFetch(fetchMock, {
      method: "GET",
      urlIncludes: `/results/${rPath.result_id}`,
      accept: JSON_ACCEPT,
      noBody: true,
    });
  });

  it("get — FoundryApiError", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponse(404, errorBody));
    await expect(
      client().results.get({ result_id: "missing" }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("listForExperiment — success", async () => {
    const input = listResultsForExperimentInputSchema.parse({
      ...resultMockData.listForExperiment.input,
    });
    const { experiment_id } = input;
    fetchMock.mockResolvedValue(
      jsonResponse(resultMockData.listForExperiment.response),
    );
    const out = await client().results.listForExperiment(input);
    resultListResponseSchema.parse(out);
    expect(out).toEqual(resultMockData.listForExperiment.response);
    assertLastFetch(fetchMock, {
      method: "GET",
      urlIncludes: `/experiments/${experiment_id}/results`,
      accept: JSON_ACCEPT,
      noBody: true,
    });
  });

  it("listForExperiment — FoundryApiError", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponse(404, errorBody));
    await expect(
      client().results.listForExperiment({ experiment_id: "x" }),
    ).rejects.toMatchObject({ status: 404 });
  });
});
