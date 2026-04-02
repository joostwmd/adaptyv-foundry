import { experimentListResponseSchema } from "@adaptyv/foundry-shared";
import {
  errorBody,
  experimentMockData,
} from "@adaptyv/foundry-shared/mockdata";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FoundryApiError, FoundryClient } from "../src/client.js";
import {
  assertLastFetch,
  expectRejectsFoundryApiJsonError,
  installFetchMock,
  JSON_ACCEPT,
  jsonErrorResponse,
  jsonErrorResponseWithJsonCharset,
  jsonResponse,
  jsonResponseWithJsonCharset,
} from "./test-utils.js";

describe("FoundryClient.request (mutation-hardening)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = installFetchMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const client = () => new FoundryClient({ apiKey: "test-token" });

  it("FoundryApiError uses default message and parsed JSON body", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponse(500, errorBody));
    await expectRejectsFoundryApiJsonError(client().experiments.list({}), {
      status: 500,
      body: errorBody,
    });
  });

  it("parses JSON error bodies when content-type includes charset", async () => {
    fetchMock.mockResolvedValue(jsonErrorResponseWithJsonCharset(422, errorBody));
    await expectRejectsFoundryApiJsonError(
      client().experiments.list({}),
      { status: 422, body: errorBody },
    );
  });

  it("parses JSON success when content-type includes charset", async () => {
    fetchMock.mockResolvedValue(
      jsonResponseWithJsonCharset(experimentMockData.list.response),
    );
    const out = await client().experiments.list({});
    experimentListResponseSchema.parse(out);
    expect(out).toEqual(experimentMockData.list.response);
  });

  it("prefixes path when it does not start with /", async () => {
    fetchMock.mockResolvedValue(jsonResponse(experimentMockData.list.response));
    await client().request({
      method: "GET",
      path: "experiments",
      query: {},
    });
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/experiments");
    expect(url).not.toContain("//experiments");
    const u = new URL(url);
    expect(u.pathname.endsWith("/experiments")).toBe(true);
  });

  it("omits null and undefined query values but serializes other keys", async () => {
    fetchMock.mockResolvedValue(jsonResponse(experimentMockData.list.response));
    await client().request({
      method: "GET",
      path: "/experiments",
      query: {
        z: 1,
        a: null,
        b: undefined,
      } as Record<string, string | number | boolean | undefined | null>,
    });
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    const u = new URL(url);
    expect(u.searchParams.get("z")).toBe("1");
    expect(u.searchParams.has("a")).toBe(false);
    expect(u.searchParams.has("b")).toBe(false);
  });

  it("throws when global fetch is unavailable and none was injected", async () => {
    const prev = globalThis.fetch;
    vi.stubGlobal("fetch", undefined);
    try {
      const c = new FoundryClient({ apiKey: "test-token" });
      await expect(c.experiments.list({})).rejects.toThrow(
        /fetch is not available/,
      );
    } finally {
      vi.stubGlobal("fetch", prev);
    }
  });

  it("error responses without content-type use text() so body is a string", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 502,
      headers: new Headers(),
      json: () => Promise.resolve(errorBody),
      text: () => Promise.resolve(JSON.stringify(errorBody)),
    } as Response);
    let err: unknown;
    try {
      await client().experiments.list({});
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(FoundryApiError);
    const fe = err as FoundryApiError;
    expect(fe.status).toBe(502);
    expect(fe.body).toBe(JSON.stringify(errorBody));
  });

  it("success with no content-type uses text() (string body); json() must not run", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: () => Promise.reject(new Error("json should not run")),
      text: () => Promise.resolve(JSON.stringify(experimentMockData.list.response)),
    } as Response);
    const out = await client().experiments.list({});
    expect(typeof out).toBe("string");
    experimentListResponseSchema.parse(JSON.parse(out as string));
    expect(JSON.parse(out as string)).toEqual(experimentMockData.list.response);
  });

  it("PATCH with JSON body requires POST-or-PATCH branch for Content-Type", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(experimentMockData.update.response),
    );
    await client().request({
      method: "PATCH",
      path: "/experiments/019d4a2b-0000-0000-0000-000000000001",
      body: { name: "patched" },
    });
    assertLastFetch(fetchMock, {
      method: "PATCH",
      urlIncludes: "/experiments/019d4a2b-0000-0000-0000-000000000001",
      accept: JSON_ACCEPT,
      body: { name: "patched" },
    });
  });
});
