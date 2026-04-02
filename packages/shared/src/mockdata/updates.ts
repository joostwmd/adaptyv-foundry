import { mockIds } from "./common.js";

const exp1 = mockIds.experiments.draftScreening;

export const updateMockData = {
  list: {
    query: { limit: 50, offset: 0 },
    response: {
      items: [
        {
          id: "019f0000-0000-0000-0000-000000000001",
          experiment_id: exp1,
          experiment_code: "EXP-2026-001",
          name: "Experiment created",
          timestamp: "2026-02-01T12:00:00Z",
        },
        {
          id: "019f0000-0000-0000-0000-000000000002",
          experiment_id: exp1,
          experiment_code: "EXP-2026-001",
          name: "Sequences registered",
          timestamp: "2026-02-02T10:12:00Z",
        },
        {
          id: "019f0000-0000-0000-0000-000000000003",
          experiment_id: exp1,
          experiment_code: "EXP-2026-001",
          name: "Cost estimate generated",
          timestamp: "2026-02-10T09:00:00Z",
        },
        {
          id: "019f0000-0000-0000-0000-000000000004",
          experiment_id: exp1,
          experiment_code: "EXP-2026-001",
          name: "Experiment submitted",
          timestamp: "2026-02-15T14:30:00Z",
        },
      ],
      total: 4,
      count: 4,
      offset: 0,
    },
  },
  listForExperiment: {
    input: {
      experiment_id: exp1,
      limit: 50,
      offset: 0,
    },
    response: {
      items: [
        {
          id: "019f0000-0000-0000-0000-000000000001",
          experiment_id: exp1,
          experiment_code: "EXP-2026-001",
          name: "Experiment created",
          timestamp: "2026-02-01T12:00:00Z",
        },
        {
          id: "019f0000-0000-0000-0000-000000000002",
          experiment_id: exp1,
          experiment_code: "EXP-2026-001",
          name: "Sequences registered",
          timestamp: "2026-02-02T10:12:00Z",
        },
        {
          id: "019f0000-0000-0000-0000-000000000003",
          experiment_id: exp1,
          experiment_code: "EXP-2026-001",
          name: "Quote sent",
          timestamp: "2026-02-14T16:00:00Z",
        },
        {
          id: "019f0000-0000-0000-0000-000000000004",
          experiment_id: exp1,
          experiment_code: "EXP-2026-001",
          name: "Experiment submitted",
          timestamp: "2026-02-15T14:30:00Z",
        },
      ],
      total: 4,
      count: 4,
      offset: 0,
    },
  },
} as const;
