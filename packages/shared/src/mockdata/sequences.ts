import { mockIds } from "./common.js";

const exp1 = mockIds.experiments.draftScreening;

export const sequenceMockData = {
  list: {
    query: { limit: 25, offset: 0 },
    response: {
      items: [
        {
          id: "019e1111-0000-0000-0000-000000000002",
          length: 248,
          experiment_id: exp1,
          experiment_code: "EXP-2026-001",
          is_control: false,
          created_at: "2026-02-02T10:00:00Z",
          aa_preview:
            "EVQLVESGGGLVQPGGSLRLSCAASGFTFSSYAMSWVRQAPGKGLEWVSAISGSGGSTYYADSVKGRFTISRDNSKNTLYLQMNSLRAEDTAVYYCARRDYFDYWGQGTLVTVSS",
          name: "mAb1",
        },
        {
          id: "019e1111-0000-0000-0000-000000000003",
          length: 245,
          experiment_id: exp1,
          experiment_code: "EXP-2026-001",
          is_control: false,
          created_at: "2026-02-02T10:05:00Z",
          aa_preview:
            "QVQLVQSGAEVKKPGASVKVSCKASGYTFTGYYMHWVRQAPGQGLEWMGWINPNSGGTNYAQKFQGRVTMTRDTSISTAYMELSRLRSDDTAVYYCARGGYWGQGTLVTVSS",
          name: "mAb2",
        },
        {
          id: "019e1111-0000-0000-0000-000000000004",
          length: 112,
          experiment_id: exp1,
          experiment_code: "EXP-2026-001",
          is_control: true,
          created_at: "2026-02-02T10:10:00Z",
          aa_preview:
            "DIQMTQSPSSLSASVGDRVTITCRASQDVSTAVAWYQQKPGKAPKLLIYSASFLYSGVPSRFSGSGSGTDFTLTISSLQPEDFATYYCQQHYTTPPTFGQGTKVEIK",
          name: "Nb_ctrl",
        },
      ],
      total: 3,
      count: 3,
      offset: 0,
    },
  },
  get: {
    path: { sequence_id: "019e1111-0000-0000-0000-000000000002" },
    response: {
      id: "019e1111-0000-0000-0000-000000000002",
      length: 248,
      is_control: false,
      created_at: "2026-02-02T10:00:00Z",
      aa_string:
        "EVQLVESGGGLVQPGGSLRLSCAASGFTFSSYAMSWVRQAPGKGLEWVSAISGSGGSTYYADSVKGRFTISRDNSKNTLYLQMNSLRAEDTAVYYCARRDYFDYWGQGTLVTVSS",
      metadata: { chain_type: "heavy", format: "scFv-Fc" },
      experiment: {
        experiment_id: exp1,
        experiment_code: "EXP-2026-001",
        experiment_status: "draft",
      },
    },
  },
  add: {
    requestBody: {
      experiment_code: "EXP-2026-001",
      sequences: [
        {
          name: "mAb1",
          aa_string:
            "EVQLVESGGGLVQPGGSLRLSCAASGFTFSSYAMSWVRQAPGKGLEWVSAISGSGGSTYYADSVKGRFTISRDNSKNTLYLQMNSLRAEDTAVYYCARRDYFDYWGQGTLVTVSS",
          control: false,
        },
      ],
    },
    response: {
      added_count: 1,
      experiment_id: exp1,
      experiment_code: "EXP-2026-001",
      sequence_ids: ["019e1111-0000-0000-0000-000000000002"],
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
          id: "019e1111-0000-0000-0000-000000000002",
          length: 248,
          experiment_id: exp1,
          experiment_code: "EXP-2026-001",
          is_control: false,
          created_at: "2026-02-02T10:00:00Z",
          aa_preview:
            "EVQLVESGGGLVQPGGSLRLSCAASGFTFSSYAMSWVRQAPGKGLEWVSAISGSGGSTYYADSVKGRFTISRDNSKNTLYLQMNSLRAEDTAVYYCARRDYFDYWGQGTLVTVSS",
          name: "mAb1",
        },
        {
          id: "019e1111-0000-0000-0000-000000000003",
          length: 245,
          experiment_id: exp1,
          experiment_code: "EXP-2026-001",
          is_control: false,
          created_at: "2026-02-02T10:05:00Z",
          aa_preview:
            "QVQLVQSGAEVKKPGASVKVSCKASGYTFTGYYMHWVRQAPGQGLEWMGWINPNSGGTNYAQKFQGRVTMTRDTSISTAYMELSRLRSDDTAVYYCARGGYWGQGTLVTVSS",
          name: "mAb2",
        },
        {
          id: "019e1111-0000-0000-0000-000000000004",
          length: 112,
          experiment_id: exp1,
          experiment_code: "EXP-2026-001",
          is_control: true,
          created_at: "2026-02-02T10:10:00Z",
          aa_preview:
            "DIQMTQSPSSLSASVGDRVTITCRASQDVSTAVAWYQQKPGKAPKLLIYSASFLYSGVPSRFSGSGSGTDFTLTISSLQPEDFATYYCQQHYTTPPTFGQGTKVEIK",
          name: "Nb_ctrl",
        },
        {
          id: "019e1111-0000-0000-0000-000000000005",
          length: 118,
          experiment_id: exp1,
          experiment_code: "EXP-2026-001",
          is_control: false,
          created_at: "2026-02-02T10:12:00Z",
          aa_preview:
            "QVQLQESGPGLVKPSQTLSLTCTVSGGSISSGDYYWSWIRQPPGKGLEWIGYIYYSGSTNYNPSLKSRVTISVDTSKNQFSLKLSSVTAADTAVYYCAR",
          name: "mAb4",
        },
      ],
      total: 4,
      count: 4,
      offset: 0,
    },
  },
} as const;
