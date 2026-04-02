import { mockIds } from "./common.js";

const exp1 = mockIds.experiments.draftScreening;

const resultItem = {
  id: "019e1111-0000-0000-0000-000000000003",
  title: "BLI affinity — mAb1 vs PD-L1",
  experiment_id: exp1,
  result_type: "affinity",
  created_at: "2026-02-20T16:00:00Z",
  summary: [
    { metric: "KD", value: 2.4e-9, unit: "M", display: "2.4 nM" },
    { metric: "kon (1/Ms)", value: 1.2e5, unit: "1/Ms" },
    { metric: "koff (1/s)", value: 2.9e-4, unit: "1/s" },
  ],
  metadata: { instrument: "Octet RED384", assay_version: "2026.01" },
  data_package_url: "https://data.adaptyvbio.com/pkg/019e1111",
} as const;

const thermoResult = {
  id: "019e2222-0000-0000-0000-000000000010",
  title: "DSF Tm summary — nanobody panel",
  experiment_id: mockIds.experiments.doneThermostability,
  result_type: "thermostability",
  created_at: "2026-02-28T11:00:00Z",
  summary: [
    { variant: "Nb-12", tm_celsius: 71.2 },
    { variant: "Nb-07", tm_celsius: 68.4 },
    { variant: "Nb_ctrl", tm_celsius: 64.1 },
  ],
  metadata: { buffer: "PBS pH 7.4", ramp: "1C/min" },
  data_package_url: "https://data.adaptyvbio.com/pkg/019e2222",
} as const;

export const resultMockData = {
  list: {
    query: { limit: 10, offset: 0 },
    response: {
      items: [resultItem, thermoResult],
      total: 2,
      count: 2,
      offset: 0,
    },
  },
  get: {
    path: { result_id: "019e1111-0000-0000-0000-000000000003" },
    response: resultItem,
  },
  listForExperiment: {
    input: {
      experiment_id: exp1,
      limit: 20,
      offset: 0,
    },
    response: {
      items: [resultItem],
      total: 1,
      count: 1,
      offset: 0,
    },
  },
} as const;
