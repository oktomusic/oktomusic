import z from "zod";

/**
 * CSP Violation report body
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CSPViolationReportBody
 */
const CspViolationReportBodySchema = z.object({
  blockedURL: z.string().meta({
    description: "The URL of the resource blocked by the CSP",
    example: "inline",
  }),
  columnNumber: z.number().int().nullable().optional().meta({
    description:
      "The column number in the source file where the violation occurred",
    example: 39,
  }),
  disposition: z.enum(["enforce", "report"]).meta({
    description: "Whether the policy was enforced or only reported",
    example: "enforce",
  }),
  documentURL: z.string().meta({
    description: "The URL of the document where the violation occurred",
    example: "https://example.com/page",
  }),
  effectiveDirective: z.string().meta({
    description: "The CSP directive that was violated",
    example: "script-src-elem",
  }),
  lineNumber: z.number().int().nullable().optional().meta({
    description:
      "The line number in the source file where the violation occurred",
    example: 121,
  }),
  originalPolicy: z.string().meta({
    description: "The full Content Security Policy that was violated",
    example: "default-src 'self'; report-to csp-endpoint",
  }),
  referrer: z.string().optional().meta({
    description: "The referrer of the document",
    example: "https://www.google.com/",
  }),
  sample: z.string().optional().meta({
    description:
      "A sample of the violating resource (first 40 characters for inline scripts/styles)",
    example: 'console.log("lo")',
  }),
  sourceFile: z.string().nullable().optional().meta({
    description: "The source file where the violation occurred",
    example: "https://example.com/script.js",
  }),
  statusCode: z.number().int().optional().meta({
    description:
      "The HTTP status code of the resource that caused the violation",
    example: 200,
  }),
});

/**
 * Deprecation report body
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/DeprecationReportBody
 */
const DeprecationReportBodySchema = z.object({
  id: z.string().meta({
    description: "Identifier for the deprecated feature",
    example: "FeatureX",
  }),
  message: z.string().meta({
    description: "Human-readable deprecation description",
    example: "FeatureX is deprecated and will be removed in future versions.",
  }),
  sourceFile: z.string().nullable().optional().meta({
    description: "The source file where the deprecated feature was used",
    example: "https://example.com/script.js",
  }),
  lineNumber: z.number().int().nullable().optional().meta({
    description: "The line number where the deprecated feature was used",
    example: 20,
  }),
  columnNumber: z.number().int().nullable().optional().meta({
    description: "The column number where the deprecated feature was used",
    example: 15,
  }),
  anticipatedRemoval: z.string().nullable().optional().meta({
    description: "The anticipated date of feature removal (ISO 8601)",
    example: "2025-01-01T00:00:00.000Z",
  }),
});

/**
 * Intervention report body
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/InterventionReportBody
 */
const InterventionReportBodySchema = z.object({
  id: z.string().meta({
    description: "Identifier for the intervention type",
    example: "unsync-script",
  }),
  message: z.string().meta({
    description: "Human-readable intervention description",
    example: "Synchronous script blocked the main thread",
  }),
  sourceFile: z.string().nullable().optional().meta({
    description: "The source file where the intervention occurred",
    example: "https://example.com/script.js",
  }),
  lineNumber: z.number().int().nullable().optional().meta({
    description: "The line number where the intervention occurred",
    example: 42,
  }),
  columnNumber: z.number().int().nullable().optional().meta({
    description: "The column number where the intervention occurred",
    example: 15,
  }),
});

/**
 * COEP (Cross-Origin-Embedder-Policy) report body
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Embedder-Policy
 */
const CoepReportBodySchema = z.object({
  blockedURL: z.string().meta({
    description: "The URL of the resource blocked by COEP",
    example: "https://cdn.example.com/image.png",
  }),
  disposition: z.enum(["enforce", "reporting"]).meta({
    description: "Whether the policy was enforced or only reported",
    example: "enforce",
  }),
  destination: z.string().optional().meta({
    description: "The destination type of the blocked resource",
    example: "image",
  }),
  type: z.string().optional().meta({
    description: "The type of the blocked embedding",
    example: "corp",
  }),
});

/**
 * COOP (Cross-Origin-Opener-Policy) report body
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cross-Origin-Opener-Policy
 */
const CoopReportBodySchema = z.object({
  disposition: z.enum(["enforce", "reporting"]).meta({
    description: "Whether the policy was enforced or only reported",
    example: "enforce",
  }),
  effectivePolicy: z.string().meta({
    description: "The effective COOP policy",
    example: "same-origin",
  }),
  nextResponseURL: z.string().optional().meta({
    description: "The URL of the navigation that triggered the report",
    example: "https://example.com/page",
  }),
  type: z.string().meta({
    description:
      "The type of COOP violation (navigation-to-response, navigation-from-response)",
    example: "navigation-to-response",
  }),
});

/**
 * A single report from the Reporting API, discriminated by type
 *
 * @see https://www.w3.org/TR/reporting-1
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Reporting_API
 */
const ReportBaseSchema = z.object({
  age: z.number().int().meta({
    description: "The age of the report in milliseconds since generation",
    example: 0,
  }),
  url: z.string().meta({
    description: "The origin URL where the report was generated",
    example: "https://example.com/page",
  }),
  user_agent: z.string().optional().meta({
    description: "The user agent string of the reporting browser",
    example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  }),
});

const CspViolationReportSchema = ReportBaseSchema.extend({
  type: z.literal("csp-violation"),
  body: CspViolationReportBodySchema,
});

const DeprecationReportSchema = ReportBaseSchema.extend({
  type: z.literal("deprecation"),
  body: DeprecationReportBodySchema,
});

const InterventionReportSchema = ReportBaseSchema.extend({
  type: z.literal("intervention"),
  body: InterventionReportBodySchema,
});

const CoepReportSchema = ReportBaseSchema.extend({
  type: z.literal("coep"),
  body: CoepReportBodySchema,
});

const CoopReportSchema = ReportBaseSchema.extend({
  type: z.literal("coop"),
  body: CoopReportBodySchema,
});

const ReportSchema = z.discriminatedUnion("type", [
  CspViolationReportSchema,
  DeprecationReportSchema,
  InterventionReportSchema,
  CoepReportSchema,
  CoopReportSchema,
]);

export const ReportingBodySchema = z.array(ReportSchema);

export const ReportingBodyJSONSchema = z.toJSONSchema(ReportingBodySchema, {
  unrepresentable: "throw",
});

export type ReportingBodyInput = z.input<typeof ReportingBodySchema>;
export type ReportingBody = z.output<typeof ReportingBodySchema>;
