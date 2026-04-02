import { targetMockData } from "@adaptyv/foundry-shared/mockdata";
import { listTargetsInputSchema, targetListResponseSchema } from "@adaptyv/foundry-shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FoundryClient } from "../src/client.js";
import {
  assertLastFetch,
  installFetchMock,
  JSON_ACCEPT,
  jsonResponse,
} from "./test-utils.js";

describe("FoundryClient options", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let prevToken: string | undefined;

  beforeEach(() => {
    fetchMock = installFetchMock();
    prevToken = process.env.FOUNDRY_API_TOKEN;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (prevToken === undefined) {
      delete process.env.FOUNDRY_API_TOKEN;
    } else {
      process.env.FOUNDRY_API_TOKEN = prevToken;
    }
  });

  it("throws when neither apiKey nor FOUNDRY_API_TOKEN is set", () => {
    delete process.env.FOUNDRY_API_TOKEN;
    expect(
      () =>
        new FoundryClient({
          /* empty on purpose */
        }),
    ).toThrow(/apiKey|FOUNDRY_API_TOKEN/);
  });

  it("uses FOUNDRY_API_TOKEN when apiKey is omitted", async () => {
    process.env.FOUNDRY_API_TOKEN = "from-env";
    fetchMock.mockResolvedValue(jsonResponse(targetMockData.list.response));

    const client = new FoundryClient({});
    const query = listTargetsInputSchema.parse({ limit: 1 });
    const out = await client.targets.list(query);
    targetListResponseSchema.parse(out);

    assertLastFetch(fetchMock, {
      method: "GET",
      urlIncludes: "/targets",
      bearerToken: "from-env",
      accept: JSON_ACCEPT,
      noBody: true,
    });
  });
});

describe("FoundryClient base URL resolution", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let prevBaseUrl: string | undefined;
  let prevToken: string | undefined;

  beforeEach(() => {
    fetchMock = installFetchMock();
    prevBaseUrl = process.env.FOUNDRY_API_BASE_URL;
    prevToken = process.env.FOUNDRY_API_TOKEN;
    process.env.FOUNDRY_API_TOKEN = "test-token";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (prevBaseUrl === undefined) {
      delete process.env.FOUNDRY_API_BASE_URL;
    } else {
      process.env.FOUNDRY_API_BASE_URL = prevBaseUrl;
    }
    if (prevToken === undefined) {
      delete process.env.FOUNDRY_API_TOKEN;
    } else {
      process.env.FOUNDRY_API_TOKEN = prevToken;
    }
  });

  it("uses FOUNDRY_API_BASE_URL when options.baseUrl is omitted", async () => {
    process.env.FOUNDRY_API_BASE_URL = "https://env-base.example.com/api/v1";
    fetchMock.mockResolvedValue(jsonResponse(targetMockData.list.response));
    const client = new FoundryClient({});
    await client.targets.list({});
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url.startsWith("https://env-base.example.com/api/v1/targets")).toBe(
      true,
    );
  });

  it("prefers options.baseUrl over FOUNDRY_API_BASE_URL", async () => {
    process.env.FOUNDRY_API_BASE_URL = "https://wrong.example.com/api/v1";
    fetchMock.mockResolvedValue(jsonResponse(targetMockData.list.response));
    const client = new FoundryClient({
      baseUrl: "https://right.example.com/api/v1",
    });
    await client.targets.list({});
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url.startsWith("https://right.example.com/api/v1/targets")).toBe(
      true,
    );
    expect(url).not.toContain("wrong.example.com");
  });

  it("strips a single trailing slash from baseUrl before joining paths", async () => {
    fetchMock.mockResolvedValue(jsonResponse(targetMockData.list.response));
    const client = new FoundryClient({
      apiKey: "test-token",
      baseUrl: "https://custom.example.com/api/v1/",
    });
    await client.targets.list({});
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://custom.example.com/api/v1/targets");
  });
});
