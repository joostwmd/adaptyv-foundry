import {
  experimentMockData,
  feedbackMockData,
  mockIds,
  quoteMockData,
  resultMockData,
  sequenceMockData,
  targetMockData,
  tokenMockData,
  updateMockData,
} from "@adaptyv/foundry-shared/mockdata";
import { FoundryApiError, type FoundryClient } from "./client.js";
import type {
  ListQueryOptions,
  ListTargetsOptions,
  PaginationOptions,
  SequenceListItem,
} from "./types.js";

function notFound(message = "not found"): never {
  throw new FoundryApiError(404, { error: message });
}

function paginate<T>(
  items: T[],
  limit?: number,
  offset?: number,
): { items: T[]; total: number; count: number; offset: number } {
  const lim = limit ?? 50;
  const off = offset ?? 0;
  const slice = items.slice(off, off + lim);
  return { items: slice, total: items.length, count: slice.length, offset: off };
}

function quotePdfBuffer(): ArrayBuffer {
  const bytes = experimentMockData.getQuotePdf.bytes;
  const u8 = new Uint8Array(bytes);
  return u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
}

const experimentIds = new Set<string>(
  experimentMockData.list.response.items.map((r) => r.id),
);

/** In-memory Foundry API: uses shared mockdata, honors IDs / list filters / pagination. */
export function createMockFoundryClient(): FoundryClient {
  const targetSummaries = [...targetMockData.list.response.items];
  const templateTargetDetail = targetMockData.get.response;

  const sequenceById = new Map<string, SequenceListItem>();
  for (const it of sequenceMockData.list.response.items) {
    sequenceById.set(it.id, it as SequenceListItem);
  }
  for (const it of sequenceMockData.listForExperiment.response.items) {
    if (!sequenceById.has(it.id)) sequenceById.set(it.id, it as SequenceListItem);
  }

  const client = {
    targets: {
      list: async (options: ListTargetsOptions = {}) => {
        let items = [...targetSummaries];
        const q = options.search?.trim().toLowerCase();
        if (q) {
          items = items.filter((t) => t.name.toLowerCase().includes(q));
        }
        return paginate(items, options.limit, options.offset);
      },
      get: async (input: { target_id: string }) => {
        const row = targetSummaries.find((t) => t.id === input.target_id);
        if (!row) notFound();
        if (input.target_id === mockIds.targets.pdl1) {
          return { ...templateTargetDetail };
        }
        return {
          ...row,
          details: { ...templateTargetDetail.details },
          pricing: { ...templateTargetDetail.pricing },
        };
      },
      listCustomRequests: async (options: PaginationOptions = {}) => {
        const items = [...targetMockData.listCustomRequests.response.items];
        return paginate(items, options.limit, options.offset);
      },
      getCustomRequest: async (input: { request_id: string }) => {
        const row = targetMockData.listCustomRequests.response.items.find(
          (r) => r.id === input.request_id,
        );
        if (!row) notFound();
        if (row.id === targetMockData.getCustomRequest.path.request_id) {
          return { ...targetMockData.getCustomRequest.response };
        }
        return {
          ...targetMockData.getCustomRequest.response,
          id: row.id,
          name: row.name,
          product_id: row.product_id,
          status: row.status,
          created_at: row.created_at,
        };
      },
      requestCustom: async () => ({ ...targetMockData.requestCustom.response }),
    },

    experiments: {
      list: async (options: ListQueryOptions = {}) => {
        let items = [...experimentMockData.list.response.items];
        const q = options.search?.trim().toLowerCase();
        if (q) {
          items = items.filter((e) => e.name.toLowerCase().includes(q));
        }
        return paginate(items, options.limit, options.offset);
      },
      create: async () => ({ ...experimentMockData.create.response }),
      get: async (input: { experiment_id: string }) => {
        if (!experimentIds.has(input.experiment_id)) notFound();
        if (input.experiment_id === mockIds.experiments.draftScreening) {
          return { ...experimentMockData.get.response };
        }
        const row = experimentMockData.list.response.items.find(
          (e) => e.id === input.experiment_id,
        )!;
        const base = { ...experimentMockData.get.response };
        return {
          ...base,
          id: row.id,
          code: row.code,
          status: row.status,
          experiment_type: row.experiment_type,
          created_at: row.created_at,
          results_status: row.results_status,
          experiment_url: row.experiment_url,
          name: row.name,
          stripe_invoice_url: row.stripe_invoice_url,
          stripe_quote_url: row.stripe_quote_url,
        };
      },
      update: async (input: { experiment_id: string; name?: string; webhook_url?: string | null }) => {
        if (!experimentIds.has(input.experiment_id)) notFound();
        return {
          ...experimentMockData.update.response,
          id: input.experiment_id,
        };
      },
      submit: async (input: { experiment_id: string }) => {
        if (!experimentIds.has(input.experiment_id)) notFound();
        return {
          ...experimentMockData.submit.response,
          experiment_id: input.experiment_id,
        };
      },
      estimateCost: async () => ({ ...experimentMockData.estimateCost.response }),
      getInvoice: async (input: { experiment_id: string }) => {
        if (!experimentIds.has(input.experiment_id)) notFound();
        return {
          ...experimentMockData.getInvoice.response,
          experiment_id: input.experiment_id,
        };
      },
      getQuote: async (input: { experiment_id: string }) => {
        if (!experimentIds.has(input.experiment_id)) notFound();
        return {
          ...experimentMockData.getQuote.response,
          experiment_id: input.experiment_id,
        };
      },
      confirmQuote: async (input: {
        experiment_id: string;
        purchase_order_number?: string;
        notes?: string | null;
      }) => {
        if (!experimentIds.has(input.experiment_id)) notFound();
        return { ...experimentMockData.confirmQuote.response };
      },
      getQuotePdf: async (input: { experiment_id: string }) => {
        if (!experimentIds.has(input.experiment_id)) notFound();
        return quotePdfBuffer();
      },
    },

    sequences: {
      list: async (options: PaginationOptions = {}) => {
        const items = [...sequenceMockData.list.response.items];
        return paginate(items, options.limit, options.offset);
      },
      get: async (input: { sequence_id: string }) => {
        if (input.sequence_id === sequenceMockData.get.path.sequence_id) {
          return { ...sequenceMockData.get.response };
        }
        const row = sequenceById.get(input.sequence_id);
        if (!row) notFound();
        return {
          id: row.id,
          length: row.length,
          is_control: row.is_control,
          created_at: row.created_at,
          aa_string: row.aa_preview,
          metadata: {},
          experiment: {
            experiment_id: row.experiment_id,
            experiment_code: row.experiment_code,
            experiment_status: "draft" as const,
          },
        };
      },
      add: async () => ({ ...sequenceMockData.add.response }),
      listForExperiment: async (input: {
        experiment_id: string;
        limit?: number;
        offset?: number;
      }) => {
        if (!experimentIds.has(input.experiment_id)) notFound();
        const items = sequenceMockData.listForExperiment.response.items.filter(
          (s) => s.experiment_id === input.experiment_id,
        );
        return paginate(items, input.limit, input.offset);
      },
    },

    results: {
      list: async (options: PaginationOptions = {}) => {
        const items = [...resultMockData.list.response.items];
        return paginate(items, options.limit, options.offset);
      },
      get: async (input: { result_id: string }) => {
        const all = resultMockData.list.response.items;
        const row = all.find((r) => r.id === input.result_id);
        if (!row) notFound();
        return { ...row };
      },
      listForExperiment: async (input: {
        experiment_id: string;
        limit?: number;
        offset?: number;
      }) => {
        if (!experimentIds.has(input.experiment_id)) notFound();
        const items = resultMockData.list.response.items.filter(
          (r) => r.experiment_id === input.experiment_id,
        );
        return paginate(items, input.limit, input.offset);
      },
    },

    quotes: {
      list: async (options: PaginationOptions = {}) => {
        const items = [...quoteMockData.list.response.items];
        return paginate(items, options.limit, options.offset);
      },
      get: async (input: { quote_id: string }) => {
        const row = quoteMockData.list.response.items.find(
          (q) => q.id === input.quote_id,
        );
        if (!row) notFound();
        if (input.quote_id === quoteMockData.get.path.quote_id) {
          return { ...quoteMockData.get.response };
        }
        return {
          ...quoteMockData.get.response,
          id: row.id,
          quote_number: row.quote_number,
          amount_cents: row.amount_cents,
          status: row.status,
          valid_until: row.valid_until,
          created_at: row.created_at,
          stripe_quote_url: row.stripe_quote_url,
          line_items: [...quoteMockData.get.response.line_items],
          subtotal_cents: row.amount_cents,
          total_cents: row.amount_cents,
        };
      },
      confirm: async () => ({ ...quoteMockData.confirm.response }),
      reject: async () => ({ ...quoteMockData.reject.response }),
    },

    updates: {
      list: async (options: PaginationOptions = {}) => {
        const items = [...updateMockData.list.response.items];
        return paginate(items, options.limit, options.offset);
      },
      listForExperiment: async (input: {
        experiment_id: string;
        limit?: number;
        offset?: number;
      }) => {
        if (!experimentIds.has(input.experiment_id)) notFound();
        const items = updateMockData.list.response.items.filter(
          (u) => u.experiment_id === input.experiment_id,
        );
        return paginate(items, input.limit, input.offset);
      },
    },

    tokens: {
      list: async (options: PaginationOptions = {}) => {
        const items = [...tokenMockData.list.response.items];
        return paginate(items, options.limit, options.offset);
      },
      attenuate: async () => ({ ...tokenMockData.attenuate.response }),
      revoke: async () => ({ ...tokenMockData.revoke.response }),
    },

    feedback: {
      submit: async () => ({ ...feedbackMockData.submit.response }),
    },
  };

  return client as unknown as FoundryClient;
}
