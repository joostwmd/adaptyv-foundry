import { mockIds } from "./common.js";

export const targetMockData = {
  list: {
    query: {
      search: "EGFR",
      selfservice_only: true,
      limit: 10,
      offset: 0,
      filter: 'eq(name,"PD-L1")',
      sort: "desc(created_at)",
    },
    response: {
      items: [
        {
          id: mockIds.targets.egfr,
          name: "Human EGFR / ERBB1 Protein, His Tag",
          vendor_name: "ACRO Biosystems",
          catalog_number: "EGR-H5222",
          url: `https://targets.adaptyvbio.com/protein/${mockIds.targets.egfr}`,
          uniprot_id: "P00533",
        },
        {
          id: mockIds.targets.pdl1,
          name: "Human PD-L1 / B7-H1 Protein",
          vendor_name: "ACRO Biosystems",
          catalog_number: "PD1-H5221",
          url: `https://targets.adaptyvbio.com/protein/${mockIds.targets.pdl1}`,
          uniprot_id: "Q9NZQ7",
        },
        {
          id: mockIds.targets.her2,
          name: "Human HER2 / ERBB2 Protein, His-Avi Tag",
          vendor_name: "ACRO Biosystems",
          catalog_number: "HE2-H5223",
          url: `https://targets.adaptyvbio.com/protein/${mockIds.targets.her2}`,
          uniprot_id: "P04626",
        },
      ],
      total: 3,
      count: 3,
      offset: 0,
    },
  },
  get: {
    path: { target_id: mockIds.targets.pdl1 },
    response: {
      id: mockIds.targets.pdl1,
      name: "Human PD-L1 / B7-H1 Protein",
      vendor_name: "ACRO Biosystems",
      catalog_number: "PD1-H5221",
      url: `https://targets.adaptyvbio.com/protein/${mockIds.targets.pdl1}`,
      uniprot_id: "Q9NZQ7",
      details: {
        species: "Human",
        expression_system: "HEK293",
        purity: "≥95%",
      },
      pricing: {
        list_price_cents: 89900,
        currency: "usd",
      },
    },
  },
  listCustomRequests: {
    query: { limit: 20, offset: 0 },
    response: {
      items: [
        {
          id: "019a1111-1111-1111-1111-111111111111",
          name: "My Custom Antigen",
          product_id: "CUSTOM-001",
          status: "pending_review" as const,
          created_at: "2026-02-10T09:00:00Z",
        },
        {
          id: "019a2222-2222-2222-2222-222222222222",
          name: "Fc-fused cytokine tracer",
          product_id: "CUSTOM-002",
          status: "approved" as const,
          created_at: "2026-02-12T11:30:00Z",
        },
      ],
      total: 2,
      count: 2,
      offset: 0,
    },
  },
  getCustomRequest: {
    path: { request_id: "019a1111-1111-1111-1111-111111111111" },
    response: {
      id: "019a1111-1111-1111-1111-111111111111",
      name: "My Custom Antigen",
      product_id: "CUSTOM-001",
      status: "pending_review" as const,
      created_at: "2026-02-10T09:00:00Z",
      updated_at: "2026-02-10T09:00:00Z",
      sequence: "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSH",
      pdb_id: null,
      pdb_file: null,
      molecular_weight: 15.5,
      note: "Expressed in HEK293 cells",
      product_url: "https://www.acrobiosystems.com/product/PD1",
      vendor: "ACRO Biosystems",
      material_id: null,
    },
  },
  requestCustom: {
    requestBody: {
      name: "My Custom Antigen",
      product_id: "CUSTOM-001",
      sequence: "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSH",
      pdb_id: "1HHO",
      molecular_weight: 15.5,
      note: "Expressed in HEK293 cells",
      product_url: "https://www.acrobiosystems.com/product/PD1",
      vendor: "ACRO Biosystems",
    },
    response: {
      id: "019a1111-1111-1111-1111-111111111111",
      status: "pending_review" as const,
      created_at: "2026-02-10T09:00:00Z",
    },
  },
} as const;
