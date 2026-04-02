export const quoteMockData = {
  list: {
    query: { limit: 50, offset: 0 },
    response: {
      items: [
        {
          id: "qt_01abcdef",
          quote_number: "Q-2026-0001",
          organization_id: "56a01500-1f17-4908-a6a8-472e349e5733",
          amount_cents: 500000,
          currency: "usd",
          status: "open" as const,
          valid_until: "2026-12-31T23:59:59Z",
          created_at: "2026-02-01T12:00:00Z",
          stripe_quote_url: "https://billing.example.com/quotes/qt_123",
        },
        {
          id: "qt_02fedcba",
          quote_number: "Q-2026-0002",
          organization_id: "56a01500-1f17-4908-a6a8-472e349e5733",
          amount_cents: 320000,
          currency: "usd",
          status: "accepted" as const,
          valid_until: "2026-11-30T23:59:59Z",
          created_at: "2026-01-22T10:00:00Z",
          stripe_quote_url: "https://billing.example.com/quotes/qt_456",
        },
      ],
      total: 2,
      count: 2,
      offset: 0,
    },
  },
  get: {
    path: { quote_id: "qt_01abcdef" },
    response: {
      id: "qt_01abcdef",
      quote_number: "Q-2026-0001",
      organization_id: "56a01500-1f17-4908-a6a8-472e349e5733",
      organization_name: "Example Labs",
      line_items: [
        {
          description: "BLI screening (3 variants, triplicate)",
          quantity: 1,
          unit_price_cents: 420000,
          total_cents: 420000,
        },
        {
          description: "Rush processing fee",
          quantity: 1,
          unit_price_cents: 80000,
          total_cents: 80000,
        },
      ],
      subtotal_cents: 500000,
      tax_cents: 0,
      total_cents: 500000,
      currency: "usd",
      status: "open" as const,
      valid_until: "2026-12-31T23:59:59Z",
      created_at: "2026-02-01T12:00:00Z",
      notes: "Valid for standard reagent availability.",
      terms_and_conditions: "Net 30.",
      stripe_quote_url: "https://billing.example.com/quotes/qt_123",
    },
  },
  confirm: {
    input: {
      quote_id: "qt_01abcdef",
      purchase_order_number: "PO-2026-00142",
    },
    response: {
      id: "qt_01abcdef",
      status: "accepted" as const,
      hosted_invoice_url: "https://invoice.stripe.com/i/acct_1234/test_5678",
      invoice_id: "in_01abcdef",
    },
  },
  reject: {
    input: {
      quote_id: "qt_01abcdef",
      reason: "price" as const,
      feedback: "Budget constraints require a 15% reduction",
    },
    response: {
      id: "qt_01abcdef",
      status: "canceled" as const,
    },
  },
} as const;
