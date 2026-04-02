import {
  confirmExperimentQuoteInputSchema,
  confirmQuoteResponseSchema,
  costEstimateResponseSchema,
  createExperimentInputSchema,
  createExperimentResponseSchema,
  errorResponseBodySchema,
  estimateCostInputSchema,
  expInfoSchema,
  experimentConfirmationResponseSchema,
  experimentInvoiceResponseSchema,
  experimentListResponseSchema,
  experimentQuoteResponseSchema,
  getExperimentInputSchema,
  listExperimentsInputSchema,
  submitExperimentInputSchema,
  updateExperimentInputSchema,
  updateExperimentResponseSchema,
} from "@adaptyv/foundry-shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FoundryApiError, FoundryClient } from "../src/client.js";
import { errorBody, experimentMockData } from "@adaptyv/foundry-shared/mockdata";
import {
  assertLastFetch,
  binaryResponse,
  BINARY_ACCEPT,
  installFetchMock,
  JSON_ACCEPT,
  jsonErrorResponse,
  jsonResponse,
  textPlainErrorResponse,
} from "./test-utils.js";

describe("ExperimentsResource", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = installFetchMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const client = () => new FoundryClient({ apiKey: "test-token" });

  it("list — success", async () => {
    const query = listExperimentsInputSchema.parse({
      ...experimentMockData.list.query,
    });
    fetchMock.mockResolvedValue(jsonResponse(experimentMockData.list.response));
    const out = await client().experiments.list(query);
    experimentListResponseSchema.parse(out);
    expect(out).toEqual(experimentMockData.list.response);
    assertLastFetch(fetchMock, {
      method: "GET",
      urlIncludes: "/experiments",
      accept: JSON_ACCEPT,
      noBody: true,
    });
  });

  it("list — FoundryApiError", async () => {
    errorResponseBodySchema.parse(errorBody);
    fetchMock.mockResolvedValue(jsonErrorResponse(500, errorBody));
    await expect(client().experiments.list({})).rejects.toMatchObject({
      name: "FoundryApiError",
      status: 500,
    } satisfies Partial<FoundryApiError>);
  });

  it("list — FoundryApiError with plain-text body", async () => {
    fetchMock.mockResolvedValue(textPlainErrorResponse(500, "boom"));
    await expect(client().experiments.list({})).rejects.toMatchObject({
      status: 500,
      body: "boom",
    });
    assertLastFetch(fetchMock, {
      method: "GET",
      urlIncludes: "/experiments",
      accept: JSON_ACCEPT,
      noBody: true,
    });
  });

  it("create — success (201)", async () => {
    const body = createExperimentInputSchema.parse({
      ...experimentMockData.create.requestBody,
    });
    fetchMock.mockResolvedValue(
      jsonResponse(experimentMockData.create.response, { status: 201 }),
    );
    const out = await client().experiments.create(body);
    createExperimentResponseSchema.parse(out);
    expect(out).toEqual(experimentMockData.create.response);
    assertLastFetch(fetchMock, {
      method: "POST",
      urlIncludes: "/experiments",
      accept: JSON_ACCEPT,
      body: experimentMockData.create.requestBody,
    });
  });

  it("create — FoundryApiError", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponse(422, errorBody));
    await expect(
      client().experiments.create({
        name: "x",
        experiment_spec: { experiment_type: "screening" },
      }),
    ).rejects.toMatchObject({ status: 422 });
  });

  it("get — success", async () => {
    const expPath = getExperimentInputSchema.parse({
      ...experimentMockData.get.path,
    });
    fetchMock.mockResolvedValue(jsonResponse(experimentMockData.get.response));
    const out = await client().experiments.get(expPath);
    expInfoSchema.parse(out);
    expect(out).toEqual(experimentMockData.get.response);
    assertLastFetch(fetchMock, {
      method: "GET",
      urlIncludes: `/experiments/${expPath.experiment_id}`,
      accept: JSON_ACCEPT,
      noBody: true,
    });
  });

  it("get — FoundryApiError", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponse(404, errorBody));
    await expect(
      client().experiments.get({ experiment_id: "missing" }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("update — success", async () => {
    const input = updateExperimentInputSchema.parse({
      ...experimentMockData.update.input,
    });
    const { experiment_id, ...body } = input;
    fetchMock.mockResolvedValue(jsonResponse(experimentMockData.update.response));
    const out = await client().experiments.update(input);
    updateExperimentResponseSchema.parse(out);
    expect(out).toEqual(experimentMockData.update.response);
    assertLastFetch(fetchMock, {
      method: "PATCH",
      urlIncludes: `/experiments/${experiment_id}`,
      accept: JSON_ACCEPT,
      body,
    });
  });

  it("update — FoundryApiError", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponse(409, errorBody));
    await expect(
      client().experiments.update({
        experiment_id: "019d4a2b-0000-0000-0000-000000000001",
        name: "nope",
      }),
    ).rejects.toMatchObject({ status: 409 });
  });

  it("submit — success", async () => {
    const subPath = submitExperimentInputSchema.parse({
      ...experimentMockData.submit.path,
    });
    fetchMock.mockResolvedValue(jsonResponse(experimentMockData.submit.response));
    const out = await client().experiments.submit(subPath);
    experimentConfirmationResponseSchema.parse(out);
    expect(out).toEqual(experimentMockData.submit.response);
    assertLastFetch(fetchMock, {
      method: "POST",
      urlIncludes: `/experiments/${subPath.experiment_id}/submit`,
      accept: JSON_ACCEPT,
      noBody: true,
    });
  });

  it("submit — FoundryApiError", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponse(400, errorBody));
    await expect(
      client().experiments.submit({ experiment_id: "x" }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("estimateCost — success", async () => {
    const body = estimateCostInputSchema.parse({
      ...experimentMockData.estimateCost.requestBody,
    });
    fetchMock.mockResolvedValue(
      jsonResponse(experimentMockData.estimateCost.response),
    );
    const out = await client().experiments.estimateCost(body);
    costEstimateResponseSchema.parse(out);
    expect(out).toEqual(experimentMockData.estimateCost.response);
    assertLastFetch(fetchMock, {
      method: "POST",
      urlIncludes: "/experiments/cost-estimate",
      accept: JSON_ACCEPT,
      body: experimentMockData.estimateCost.requestBody,
    });
  });

  it("estimateCost — FoundryApiError", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponse(400, errorBody));
    await expect(
      client().experiments.estimateCost({
        experiment_spec: { experiment_type: "screening" },
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("getInvoice — success", async () => {
    const p = getExperimentInputSchema.parse({
      ...experimentMockData.getInvoice.path,
    });
    fetchMock.mockResolvedValue(
      jsonResponse(experimentMockData.getInvoice.response),
    );
    const out = await client().experiments.getInvoice(p);
    experimentInvoiceResponseSchema.parse(out);
    expect(out).toEqual(experimentMockData.getInvoice.response);
    assertLastFetch(fetchMock, {
      method: "GET",
      urlIncludes: "/invoice",
      accept: JSON_ACCEPT,
      noBody: true,
    });
  });

  it("getInvoice — FoundryApiError", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponse(404, errorBody));
    await expect(
      client().experiments.getInvoice({ experiment_id: "x" }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("getQuote — success", async () => {
    const p = getExperimentInputSchema.parse({
      ...experimentMockData.getQuote.path,
    });
    fetchMock.mockResolvedValue(jsonResponse(experimentMockData.getQuote.response));
    const out = await client().experiments.getQuote(p);
    experimentQuoteResponseSchema.parse(out);
    expect(out).toEqual(experimentMockData.getQuote.response);
    assertLastFetch(fetchMock, {
      method: "GET",
      urlIncludes: "/quote",
      accept: JSON_ACCEPT,
      noBody: true,
    });
  });

  it("getQuote — FoundryApiError", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponse(404, errorBody));
    await expect(
      client().experiments.getQuote({ experiment_id: "x" }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("confirmQuote — success", async () => {
    const input = confirmExperimentQuoteInputSchema.parse({
      ...experimentMockData.confirmQuote.input,
    });
    const { experiment_id, ...body } = input;
    fetchMock.mockResolvedValue(
      jsonResponse(experimentMockData.confirmQuote.response),
    );
    const out = await client().experiments.confirmQuote(input);
    confirmQuoteResponseSchema.parse(out);
    expect(out).toEqual(experimentMockData.confirmQuote.response);
    assertLastFetch(fetchMock, {
      method: "POST",
      urlIncludes: `/experiments/${experiment_id}/quote/confirm`,
      accept: JSON_ACCEPT,
      body,
    });
  });

  it("confirmQuote — FoundryApiError", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponse(400, errorBody));
    await expect(
      client().experiments.confirmQuote({
        experiment_id: "019d4a2b-0000-0000-0000-000000000001",
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("getQuotePdf — success", async () => {
    const p = getExperimentInputSchema.parse({
      ...experimentMockData.getQuotePdf.path,
    });
    const bytes = new Uint8Array([...experimentMockData.getQuotePdf.bytes]).buffer;
    fetchMock.mockResolvedValue(binaryResponse(bytes));
    const out = await client().experiments.getQuotePdf(p);
    expect(out).toBeInstanceOf(ArrayBuffer);
    expect(new Uint8Array(out)).toEqual(new Uint8Array(bytes));
    assertLastFetch(fetchMock, {
      method: "GET",
      urlIncludes: "/quote/pdf",
      accept: BINARY_ACCEPT,
      noBody: true,
    });
  });

  it("getQuotePdf — FoundryApiError", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponse(404, errorBody));
    await expect(
      client().experiments.getQuotePdf({ experiment_id: "x" }),
    ).rejects.toMatchObject({ status: 404 });
  });
});
