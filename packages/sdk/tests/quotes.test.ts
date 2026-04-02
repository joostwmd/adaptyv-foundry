import {
  confirmQuoteResponseSchema,
  confirmStandaloneQuoteInputSchema,
  errorResponseBodySchema,
  getQuoteInputSchema,
  listQuotesInputSchema,
  quoteInfoSchema,
  quoteListResponseSchema,
  rejectQuoteInputSchema,
  rejectQuoteResponseSchema,
} from "@adaptyv/foundry-shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FoundryClient } from "../src/client.js";
import { errorBody, quoteMockData } from "@adaptyv/foundry-shared/mockdata";
import {
  assertLastFetch,
  installFetchMock,
  JSON_ACCEPT,
  jsonErrorResponse,
  jsonResponse,
} from "./test-utils.js";

describe("QuotesResource", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = installFetchMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const client = () => new FoundryClient({ apiKey: "test-token" });

  it("list — success", async () => {
    const query = listQuotesInputSchema.parse({ ...quoteMockData.list.query });
    fetchMock.mockResolvedValue(jsonResponse(quoteMockData.list.response));
    const out = await client().quotes.list(query);
    quoteListResponseSchema.parse(out);
    expect(out).toEqual(quoteMockData.list.response);
    assertLastFetch(fetchMock, {
      method: "GET",
      urlIncludes: "/quotes",
      accept: JSON_ACCEPT,
      noBody: true,
    });
  });

  it("list — FoundryApiError", async () => {
    errorResponseBodySchema.parse(errorBody);
    fetchMock.mockResolvedValue(jsonErrorResponse(500, errorBody));
    await expect(client().quotes.list({})).rejects.toMatchObject({
      status: 500,
    });
  });

  it("get — success", async () => {
    const qPath = getQuoteInputSchema.parse({ ...quoteMockData.get.path });
    fetchMock.mockResolvedValue(jsonResponse(quoteMockData.get.response));
    const out = await client().quotes.get(qPath);
    quoteInfoSchema.parse(out);
    expect(out).toEqual(quoteMockData.get.response);
    assertLastFetch(fetchMock, {
      method: "GET",
      urlIncludes: `/quotes/${qPath.quote_id}`,
      accept: JSON_ACCEPT,
      noBody: true,
    });
  });

  it("get — FoundryApiError", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponse(404, errorBody));
    await expect(
      client().quotes.get({ quote_id: "missing" }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("confirm — success", async () => {
    const input = confirmStandaloneQuoteInputSchema.parse({
      ...quoteMockData.confirm.input,
    });
    const { quote_id, ...body } = input;
    fetchMock.mockResolvedValue(jsonResponse(quoteMockData.confirm.response));
    const out = await client().quotes.confirm(input);
    confirmQuoteResponseSchema.parse(out);
    expect(out).toEqual(quoteMockData.confirm.response);
    assertLastFetch(fetchMock, {
      method: "POST",
      urlIncludes: `/quotes/${quote_id}/confirm`,
      accept: JSON_ACCEPT,
      body,
    });
  });

  it("confirm — FoundryApiError", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponse(400, errorBody));
    await expect(
      client().quotes.confirm({ quote_id: "qt_x" }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("reject — success", async () => {
    const input = rejectQuoteInputSchema.parse({ ...quoteMockData.reject.input });
    const { quote_id, ...body } = input;
    fetchMock.mockResolvedValue(jsonResponse(quoteMockData.reject.response));
    const out = await client().quotes.reject(input);
    rejectQuoteResponseSchema.parse(out);
    expect(out).toEqual(quoteMockData.reject.response);
    assertLastFetch(fetchMock, {
      method: "POST",
      urlIncludes: `/quotes/${quote_id}/reject`,
      accept: JSON_ACCEPT,
      body,
    });
  });

  it("reject — FoundryApiError", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponse(400, errorBody));
    await expect(
      client().quotes.reject({
        quote_id: "qt_x",
        reason: "other",
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
