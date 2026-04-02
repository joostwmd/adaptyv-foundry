import type { FoundryClient } from "@adaptyv/foundry-sdk";
import {
  confirmExperimentQuoteInputSchema,
  createExperimentInputSchema,
  estimateCostInputSchema,
  getExperimentInputSchema,
  getExperimentQuotePdfInputSchema,
  listExperimentsInputSchema,
  submitExperimentInputSchema,
  updateExperimentInputSchema,
} from "@adaptyv/foundry-shared";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleToolCall } from "../server/handle-tool-call.js";

const readOnly = { readOnlyHint: true, openWorldHint: true } as const;
const openWorld = { openWorldHint: true } as const;

export function registerExperimentTools(
  server: McpServer,
  client: FoundryClient,
): void {
  server.registerTool(
    "list_experiments",
    {
      description:
        "List experiments with optional search, filter, sort, and pagination. Use to find `experiment_id` and current `status` before calling `get_experiment` or `submit_experiment`.",
      inputSchema: listExperimentsInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, "list_experiments", () => client.experiments.list(args), {
        hint: "Broaden search/filter or use pagination (limit/offset).",
      }),
  );

  server.registerTool(
    "create_experiment",
    {
      description:
        "Create a new experiment (draft) with `experiment_spec` (type, method, target_id, sequences, replicates, etc.). Optionally set webhook and quote behavior.",
      inputSchema: createExperimentInputSchema.shape,
      annotations: openWorld,
    },
    async (args) =>
      handleToolCall(server, "create_experiment", () => client.experiments.create(args), {
        hint: "Validate `experiment_spec` against experiment type; resolve `target_id` via `list_targets` if needed.",
      }),
  );

  server.registerTool(
    "get_experiment",
    {
      description:
        "Get full experiment detail including `experiment_spec`, costs, Stripe links, and results status.",
      inputSchema: getExperimentInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, "get_experiment", () => client.experiments.get(args), {
        hint: "Obtain `experiment_id` from `list_experiments`.",
      }),
  );

  server.registerTool(
    "update_experiment",
    {
      description:
        "Patch an experiment (name, description, sequences, target, webhook, replicates, etc.). Must include `experiment_id`.",
      inputSchema: updateExperimentInputSchema.shape,
      annotations: openWorld,
    },
    async (args) =>
      handleToolCall(server, "update_experiment", () => client.experiments.update(args), {
        hint: "Draft experiments can usually be edited; check status if update is rejected.",
      }),
  );

  server.registerTool(
    "submit_experiment",
    {
      description:
        "Submit a draft experiment for confirmation / quoting (moves status toward `waiting_for_confirmation`).",
      inputSchema: submitExperimentInputSchema.shape,
      annotations: openWorld,
    },
    async (args) =>
      handleToolCall(server, "submit_experiment", () => client.experiments.submit(args), {
        hint: "Ensure experiment is in `draft` and required fields are complete.",
      }),
  );

  server.registerTool(
    "estimate_cost",
    {
      description:
        "Estimate Foundry cost for an `experiment_spec` without creating an experiment. Read-only pricing preview.",
      inputSchema: estimateCostInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, "estimate_cost", () => client.experiments.estimateCost(args), {
        hint: "Align `experiment_spec` with supported experiment types and methods (e.g. BLI/SPR).",
      }),
  );

  server.registerTool(
    "get_experiment_invoice",
    {
      description:
        "Get Stripe invoice summary for an experiment (URL and invoice status) when billing applies.",
      inputSchema: getExperimentInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, "get_experiment_invoice", () => client.experiments.getInvoice(args), {
        hint: "Invoice may not exist until after quote confirmation — check experiment status.",
      }),
  );

  server.registerTool(
    "get_experiment_quote",
    {
      description:
        "Get the active quote for an experiment (amounts, currency, Stripe quote URL, expiry).",
      inputSchema: getExperimentInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(server, "get_experiment_quote", () => client.experiments.getQuote(args), {
        hint: "Quote appears after workflow steps that generate pricing — list experiments for `stripe_quote_url` hints.",
      }),
  );

  server.registerTool(
    "confirm_experiment_quote",
    {
      description:
        "Accept the experiment quote (optional PO number and notes). Returns invoice / hosted invoice URLs when applicable.",
      inputSchema: confirmExperimentQuoteInputSchema.shape,
      annotations: openWorld,
    },
    async (args) =>
      handleToolCall(server, "confirm_experiment_quote", () => client.experiments.confirmQuote(args), {
        hint: "Confirm quote is still `open` and experiment is in the right status.",
      }),
  );

  server.registerTool(
    "get_experiment_quote_pdf",
    {
      description:
        "Download the experiment quote as PDF. Response is base64-encoded in the tool result text (large). Prefer when the user needs an attachment.",
      inputSchema: getExperimentQuotePdfInputSchema.shape,
      annotations: readOnly,
    },
    async (args) =>
      handleToolCall(
        server,
        "get_experiment_quote_pdf",
        () => client.experiments.getQuotePdf(args),
        {
          binary: true,
          hint: "PDF is only available when a quote exists for this experiment.",
        },
      ),
  );
}
