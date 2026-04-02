export const feedbackMockData = {
  submit: {
    requestBody: {
      request_uuid: "01900abc-1234-7890-1234-567890abcdef",
      feedback_type: "bug_report" as const,
      title: "Timeout when creating experiment",
      human_note: "Got 500 error when creating experiment",
      json_body: { endpoint: "POST /experiments", status: 500 },
    },
    response: {
      reference:
        "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      message: "Feedback recorded",
    },
  },
} as const;
