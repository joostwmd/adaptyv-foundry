import {
  addSequencesInputSchema,
  errorResponseBodySchema,
  getSequenceInputSchema,
  listSequencesForExperimentInputSchema,
  listSequencesInputSchema,
  sequenceAddResponseSchema,
  sequenceInfoSchema,
  sequenceListResponseSchema,
} from "@adaptyv/foundry-shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FoundryClient } from "../src/client.js";
import { errorBody, sequenceMockData } from "@adaptyv/foundry-shared/mockdata";
import {
  assertLastFetch,
  installFetchMock,
  JSON_ACCEPT,
  jsonErrorResponse,
  jsonResponse,
} from "./test-utils.js";

describe("SequencesResource", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = installFetchMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const client = () => new FoundryClient({ apiKey: "test-token" });

  it("list — success", async () => {
    const query = listSequencesInputSchema.parse({ ...sequenceMockData.list.query });
    fetchMock.mockResolvedValue(jsonResponse(sequenceMockData.list.response));
    const out = await client().sequences.list(query);
    sequenceListResponseSchema.parse(out);
    expect(out).toEqual(sequenceMockData.list.response);
    assertLastFetch(fetchMock, {
      method: "GET",
      urlIncludes: "/sequences",
      accept: JSON_ACCEPT,
      noBody: true,
    });
  });

  it("list — FoundryApiError", async () => {
    errorResponseBodySchema.parse(errorBody);
    fetchMock.mockResolvedValue(jsonErrorResponse(500, errorBody));
    await expect(client().sequences.list({})).rejects.toMatchObject({
      status: 500,
    });
  });

  it("get — success", async () => {
    const sPath = getSequenceInputSchema.parse({ ...sequenceMockData.get.path });
    fetchMock.mockResolvedValue(jsonResponse(sequenceMockData.get.response));
    const out = await client().sequences.get(sPath);
    sequenceInfoSchema.parse(out);
    expect(out).toEqual(sequenceMockData.get.response);
    assertLastFetch(fetchMock, {
      method: "GET",
      urlIncludes: `/sequences/${sPath.sequence_id}`,
      accept: JSON_ACCEPT,
      noBody: true,
    });
  });

  it("get — FoundryApiError", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponse(404, errorBody));
    await expect(
      client().sequences.get({ sequence_id: "missing" }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("add — success (201)", async () => {
    const body = addSequencesInputSchema.parse({
      ...sequenceMockData.add.requestBody,
    });
    fetchMock.mockResolvedValue(
      jsonResponse(sequenceMockData.add.response, { status: 201 }),
    );
    const out = await client().sequences.add(body);
    sequenceAddResponseSchema.parse(out);
    expect(out).toEqual(sequenceMockData.add.response);
    assertLastFetch(fetchMock, {
      method: "POST",
      urlIncludes: "/sequences",
      accept: JSON_ACCEPT,
      body: sequenceMockData.add.requestBody,
    });
  });

  it("add — FoundryApiError", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponse(409, errorBody));
    await expect(
      client().sequences.add({
        experiment_code: "X",
        sequences: [{ aa_string: "A" }],
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it("listForExperiment — success", async () => {
    const input = listSequencesForExperimentInputSchema.parse({
      ...sequenceMockData.listForExperiment.input,
    });
    const { experiment_id } = input;
    fetchMock.mockResolvedValue(
      jsonResponse(sequenceMockData.listForExperiment.response),
    );
    const out = await client().sequences.listForExperiment(input);
    sequenceListResponseSchema.parse(out);
    expect(out).toEqual(sequenceMockData.listForExperiment.response);
    assertLastFetch(fetchMock, {
      method: "GET",
      urlIncludes: `/experiments/${experiment_id}/sequences`,
      accept: JSON_ACCEPT,
      noBody: true,
    });
  });

  it("listForExperiment — FoundryApiError", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponse(404, errorBody));
    await expect(
      client().sequences.listForExperiment({ experiment_id: "x" }),
    ).rejects.toMatchObject({ status: 404 });
  });
});
