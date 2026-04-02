import { mockIds } from "./common.js";

const exp1 = mockIds.experiments.draftScreening;
const exp2 = mockIds.experiments.waitingQuote;
const exp3 = mockIds.experiments.inProductionAffinity;
const exp4 = mockIds.experiments.doneThermostability;

export const experimentMockData = {
  list: {
    query: {
      limit: 50,
      offset: 0,
      search: "PD-L1",
      filter: "eq(status,draft)",
      sort: "desc(created_at)",
    },
    response: {
      items: [
        {
          id: exp1,
          code: "EXP-2026-001",
          status: "draft" as const,
          experiment_type: "screening" as const,
          created_at: "2026-02-01T12:00:00Z",
          results_status: "none" as const,
          experiment_url: `https://foundry.adaptyvbio.com/experiments/${exp1}`,
          name: "PD-L1 BLI screening panel",
          stripe_invoice_url: null,
          stripe_quote_url: null,
        },
        {
          id: exp2,
          code: "EXP-2026-002",
          status: "waiting_for_confirmation" as const,
          experiment_type: "screening" as const,
          created_at: "2026-02-03T09:15:00Z",
          results_status: "none" as const,
          experiment_url: `https://foundry.adaptyvbio.com/experiments/${exp2}`,
          name: "EGFR epitope binning (SPR)",
          stripe_invoice_url: null,
          stripe_quote_url:
            "https://billing.example.com/quotes/qt_exp2026002",
        },
        {
          id: exp3,
          code: "EXP-2026-003",
          status: "in_production" as const,
          experiment_type: "affinity" as const,
          created_at: "2026-01-18T14:00:00Z",
          results_status: "partial" as const,
          experiment_url: `https://foundry.adaptyvbio.com/experiments/${exp3}`,
          name: "HER2 Fab panel — BLI KD",
          stripe_invoice_url: "https://invoice.stripe.com/i/acct_her2_001",
          stripe_quote_url: null,
        },
        {
          id: exp4,
          code: "EXP-2026-004",
          status: "done" as const,
          experiment_type: "thermostability" as const,
          created_at: "2026-01-05T08:30:00Z",
          results_status: "all" as const,
          experiment_url: `https://foundry.adaptyvbio.com/experiments/${exp4}`,
          name: "PD-L1 nanobody Tm screen",
          stripe_invoice_url: "https://invoice.stripe.com/i/acct_tm_004",
          stripe_quote_url: null,
        },
      ],
      total: 4,
      count: 4,
      offset: 0,
    },
  },
  create: {
    requestBody: {
      name: "PD-L1 affinity panel",
      experiment_spec: {
        experiment_type: "screening" as const,
        method: "bli" as const,
        target_id: mockIds.targets.her2,
        sequences: {
          mAb1:
            "EVQLVESGGGLVQPGGSLRLSCAASGFTFSSYAMSWVRQAPGKGLEWVSAISGSGGSTYYADSVKGRFTISRDNSKNTLYLQMNSLRAEDTAVYYCARRDYFDYWGQGTLVTVSS",
          mAb2:
            "QVQLVQSGAEVKKPGASVKVSCKASGYTFTGYYMHWVRQAPGQGLEWMGWINPNSGGTNYAQKFQGRVTMTRDTSISTAYMELSRLRSDDTAVYYCARGGYWGQGTLVTVSS",
        },
        n_replicates: 3,
      },
      webhook_url: "https://example.com/webhook",
      skip_draft: false,
      auto_accept_quote: false,
    },
    response: {
      experiment_id: exp1,
      error: null,
      stripe_hosted_invoice_url: null,
      stripe_invoice_id: null,
    },
  },
  get: {
    path: { experiment_id: exp1 },
    response: {
      id: exp1,
      code: "EXP-2026-001",
      status: "draft" as const,
      experiment_spec: {
        experiment_type: "screening" as const,
        method: "bli" as const,
        target_id: mockIds.targets.her2,
        sequences: {
          mAb1:
            "EVQLVESGGGLVQPGGSLRLSCAASGFTFSSYAMSWVRQAPGKGLEWVSAISGSGGSTYYADSVKGRFTISRDNSKNTLYLQMNSLRAEDTAVYYCARRDYFDYWGQGTLVTVSS",
          mAb2:
            "QVQLVQSGAEVKKPGASVKVSCKASGYTFTGYYMHWVRQAPGQGLEWMGWINPNSGGTNYAQKFQGRVTMTRDTSISTAYMELSRLRSDDTAVYYCARGGYWGQGTLVTVSS",
          mAb3:
            "DIQMTQSPSSLSASVGDRVTITCRASQDVSTAVAWYQQKPGKAPKLLIYSASFLYSGVPSRFSGSGSGTDFTLTISSLQPEDFATYYCQQHYTTPPTFGQGTKVEIK",
        },
        n_replicates: 3,
      },
      created_at: "2026-02-01T12:00:00Z",
      results_status: "none" as const,
      experiment_url: `https://foundry.adaptyvbio.com/experiments/${exp1}`,
      name: "PD-L1 BLI screening panel",
      costs: {
        estimated_total_cents: 485000,
        currency: "usd",
        line_items: [
          { description: "BLI characterization (per variant)", quantity: 3 },
        ],
      },
      stripe_invoice_url: null,
      stripe_quote_url: null,
    },
  },
  update: {
    input: {
      experiment_id: exp1,
      name: "PD-L1 panel (rev 2)",
      webhook_url: "https://example.com/hooks/v2",
    },
    response: {
      id: exp1,
      updated: true,
      message: null,
    },
  },
  submit: {
    path: { experiment_id: exp1 },
    response: {
      experiment_id: exp1,
      previous_status: "draft" as const,
      status: "waiting_for_confirmation" as const,
      confirmed_at: "2026-02-15T14:30:00Z",
      stripe_invoice_url: null,
    },
  },
  estimateCost: {
    requestBody: {
      experiment_spec: {
        experiment_type: "screening" as const,
        method: "bli" as const,
        target_id: mockIds.targets.her2,
        sequences: {
          seq1:
            "EVQLVESGGGLVQPGGSLRLSCAASGFTFSSYAMSWVRQAPGKGLEWVSAISGSGGSTYYADSVKGRFTISRDNSKNTLYLQMNSLRAEDTAVYYCARRDYFDYWGQGTLVTVSS",
          seq2:
            "QVQLVQSGAEVKKPGASVKVSCKASGYTFTGYYMHWVRQAPGQGLEWMGWINPNSGGTNYAQKFQGRVTMTRDTSISTAYMELSRLRSDDTAVYYCARGGYWGQGTLVTVSS",
        },
        n_replicates: 3,
      },
    },
    response: {
      breakdown: {
        currency: "usd",
        total_cents: 500000,
      },
      incomplete: null,
      warnings: ["Pricing assumes standard BLI sensor regeneration."],
    },
  },
  getInvoice: {
    path: { experiment_id: exp1 },
    response: {
      experiment_id: exp1,
      status: "open" as const,
      stripe_invoice_url: "https://invoice.stripe.com/i/acct_1234/test_5678",
    },
  },
  getQuote: {
    path: { experiment_id: exp1 },
    response: {
      experiment_id: exp1,
      stripe_quote_url: "https://billing.example.com/quotes/qt_1234567890",
      amount_total: 500000,
      amount_subtotal: 500000,
      currency: "usd",
      status: "open" as const,
      expires_at: "2026-03-15T23:59:59Z",
      updated_at: "2026-02-15T14:30:00Z",
    },
  },
  confirmQuote: {
    input: {
      experiment_id: exp1,
      purchase_order_number: "PO-2026-00142",
      notes: "Please expedite processing",
    },
    response: {
      id: "qt_01abcdef",
      status: "accepted" as const,
      hosted_invoice_url: "https://invoice.stripe.com/i/acct_1234/test_5678",
      invoice_id: "in_01abcdef",
    },
  },
  getQuotePdf: {
    path: { experiment_id: exp1 },
    bytes: [37, 80, 68, 70, 45, 49, 46, 52] as const,
  },
} as const;
