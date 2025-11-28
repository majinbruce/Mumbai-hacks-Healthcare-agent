import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import { config } from "../config/env.js";
import { searchHealthcareContext } from "../utils/qdrantIndexer.js";

// ==================== ZOD SCHEMAS FOR STRUCTURED OUTPUT ====================

// Schema for supply item (can be string or detailed object)
const SupplyItemSchema = z.union([
  z.string(),
  z.object({
    item: z.string().describe("Name of the supply item"),
    currentQuantity: z.number().optional().describe("Current quantity available"),
    currentQty: z.number().optional().describe("Alternate field for current quantity"),
    recommendedAdditional: z.number().optional().describe("Additional quantity needed"),
    targetQty: z.number().optional().describe("Target quantity to achieve"),
    recommended: z.number().optional().describe("Recommended quantity"),
    recommendedQuantity: z.number().optional().describe("Alternate field for recommended quantity"),
    rationale: z.string().optional().describe("Reason for this recommendation"),
    note: z.string().optional().describe("Additional notes")
  })
]);

// Schema for staffing recommendations
const StaffingRecommendationsSchema = z.object({
  doctors: z.number().describe("Recommended number of doctors"),
  nurses: z.number().describe("Recommended number of nurses"),
  specialists: z.number().describe("Recommended number of specialists"),
  supportStaff: z.number().describe("Recommended number of support staff"),
  specialtyBreakdown: z.record(z.union([z.number(), z.record(z.number())])).optional().describe("Breakdown by specialty (can be nested)")
});

// Schema for supply recommendations
const SupplyRecommendationsSchema = z.object({
  critical: z.array(SupplyItemSchema).describe("Critical supplies needed immediately"),
  essential: z.array(SupplyItemSchema).describe("Essential supplies needed soon"),
  optional: z.array(SupplyItemSchema).describe("Optional supplies that would be helpful")
});

// Schema for patient advisory
const PatientAdvisorySchema = z.object({
  generalPublic: z.array(z.string()).describe("Advisories for the general public"),
  vulnerableGroups: z.array(z.string()).describe("Advisories for vulnerable groups (elderly, children, immunocompromised)"),
  preventiveMeasures: z.array(z.string()).describe("Preventive measures to recommend")
});

// Main output schema for healthcare recommendations
const HealthcareRecommendationSchema = z.object({
  staffingRecommendations: StaffingRecommendationsSchema,
  supplyRecommendations: SupplyRecommendationsSchema,
  patientAdvisory: PatientAdvisorySchema,
  reasoning: z.string().describe("Detailed explanation of the recommendations and the reasoning behind them")
});

// Export schemas for use in other modules (e.g., validation, testing)
export {
  HealthcareRecommendationSchema,
  StaffingRecommendationsSchema,
  SupplyRecommendationsSchema,
  PatientAdvisorySchema,
  SupplyItemSchema
};

// ==================== END OF ZOD SCHEMAS ====================

// Tool to search healthcare knowledge base (Qdrant)
const searchKnowledgeBaseTool = tool({
  name: "search_knowledge_base",
  description:
    "Search the healthcare knowledge base for relevant information about festivals, AQI levels, seasonal patterns, and health impacts. Use this to find historical data and patterns.",
  parameters: z.object({
    query: z
      .string()
      .describe(
        "Search query to find relevant healthcare knowledge (e.g., 'Diwali health impact', 'high AQI respiratory issues')"
      ),
    limit: z
      .number()
      .optional()
      .default(3)
      .describe("Number of results to return"),
  }),
  execute: async (input) => {
    try {
      const results = await searchHealthcareContext(input.query, input.limit);

      if (results.length === 0) {
        return "No relevant information found in the knowledge base.";
      }

      const formattedResults = results
        .map((result, index) => {
          const data = result.data;
          return `
Result ${index + 1} (Relevance: ${(result.score * 100).toFixed(1)}%):
Festival/Event: ${data.festival || "N/A"}
AQI Level: ${data.aqi || "N/A"}
Season: ${data.season || "N/A"}
Health Impact: ${data.healthImpact}
Recommended Staffing: ${data.recommendedStaffing}
Required Supplies: ${data.requiredSupplies}
Patient Advisory: ${data.patientAdvisory}
---`;
        })
        .join("\n");

      return formattedResults;
    } catch (error) {
      console.error("Error in search_knowledge_base tool:", error);
      return "Error searching knowledge base.";
    }
  },
});

// Tool to calculate staffing adjustments
const calculateStaffingTool = tool({
  name: "calculate_staffing",
  description:
    "Calculate recommended staffing adjustments based on current staffing and expected surge percentage.",
  parameters: z.object({
    currentStaffing: z.object({
      doctors: z.number(),
      nurses: z.number(),
      specialists: z.number(),
      supportStaff: z.number(),
    }),
    surgePercentage: z
      .number()
      .describe("Expected surge percentage (e.g., 30 for 30% increase)"),
    specialtyAdjustments: z
      .record(z.number())
      .optional()
      .describe(
        "Specific adjustments for specialties (e.g., {'pulmonology': 40, 'cardiology': 20})"
      ),
  }),
  execute: async (input) => {
    const { currentStaffing, surgePercentage, specialtyAdjustments } = input;

    const baseMultiplier = 1 + surgePercentage / 100;

    const recommendations = {
      doctors: Math.ceil(currentStaffing.doctors * baseMultiplier),
      nurses: Math.ceil(currentStaffing.nurses * baseMultiplier),
      specialists: Math.ceil(currentStaffing.specialists * baseMultiplier),
      supportStaff: Math.ceil(currentStaffing.supportStaff * baseMultiplier),
    };

    let specialtyRecommendations = "";
    if (specialtyAdjustments) {
      specialtyRecommendations = "\n\nSpecialty-specific adjustments:";
      for (const [specialty, percentage] of Object.entries(
        specialtyAdjustments
      )) {
        const multiplier = 1 + percentage / 100;
        specialtyRecommendations += `\n- ${specialty}: Increase by ${percentage}% (multiplier: ${multiplier.toFixed(2)})`;
      }
    }

    return `
Staffing Recommendations (${surgePercentage}% surge):
- Doctors: ${currentStaffing.doctors} → ${recommendations.doctors} (+${recommendations.doctors - currentStaffing.doctors})
- Nurses: ${currentStaffing.nurses} → ${recommendations.nurses} (+${recommendations.nurses - currentStaffing.nurses})
- Specialists: ${currentStaffing.specialists} → ${recommendations.specialists} (+${recommendations.specialists - currentStaffing.specialists})
- Support Staff: ${currentStaffing.supportStaff} → ${recommendations.supportStaff} (+${recommendations.supportStaff - currentStaffing.supportStaff})
${specialtyRecommendations}
`;
  },
});

// Create web search agent for epidemic information
export const createEpidemicSearchAgent = () => {
  return new Agent({
    name: "Epidemic Research Agent",
    model: "gpt-4o-mini",
    instructions: `You are a healthcare research agent specializing in epidemics and disease outbreaks.

When given an epidemic or disease name, you should:
1. Search for current information about the epidemic
2. Find health impacts, symptoms, and severity
3. Identify required medical supplies and treatments
4. Determine staffing needs and specialties required
5. Provide patient advisories and prevention measures

Provide concise, factual information focused on healthcare system preparedness.`,
    tools: [webSearchTool()],
  });
};

// Create main healthcare recommendation agent
export const createHealthcareAgent = () => {
  return new Agent({
    name: "Healthcare Resource Planning Agent",
    model: "gpt-5-mini",
    instructions: `You are a healthcare resource planning AI agent for hospitals.

Your role is to analyze various factors and provide recommendations for:
1. Staffing adjustments (doctors, nurses, specialists, support staff)
2. Medical supply requirements
3. Patient advisories

You have access to:
- A knowledge base of historical healthcare patterns for festivals, AQI levels, and seasonal impacts
- Tools to calculate staffing needs
- Your built-in medical knowledge for epidemics and diseases

When analyzing:
- Consider the festival/event and its typical health impacts
- Factor in AQI levels and respiratory health risks
- Account for seasonal patterns
- For epidemics, use your general medical knowledge of the disease
- Use current staffing and supply levels as baseline
- Provide specific, actionable recommendations

Your output will be automatically structured according to the schema. Focus on:
- Providing accurate staffing numbers based on the scenario
- Categorizing supplies into critical, essential, and optional
- Giving clear patient advisories for different groups
- Explaining your reasoning in detail
`,
    tools: [searchKnowledgeBaseTool, calculateStaffingTool],
    outputType: HealthcareRecommendationSchema, // Enable structured output with Zod schema
  });
};

// Run healthcare agent with inputs
export const runHealthcareAgent = async (inputs) => {
  const {
    festival,
    aqi,
    epidemic,
    currentStaffing,
    currentSupply,
  } = inputs;

  const agent = createHealthcareAgent();

  // Build the query for the agent
  const query = `
Analyze the following healthcare scenario and provide recommendations:

Festival/Event: ${festival || "None"}
AQI Level: ${aqi || "Normal"}
Epidemic/Disease Outbreak: ${epidemic || "None"}

Current Hospital Resources:
Staffing:
- Doctors: ${currentStaffing.doctors}
- Nurses: ${currentStaffing.nurses}
- Specialists: ${currentStaffing.specialists}
- Support Staff: ${currentStaffing.supportStaff}

Current Supplies:
${Object.entries(currentSupply)
  .map(([item, quantity]) => `- ${item}: ${quantity}`)
  .join("\n")}

Please provide:
1. Recommended staffing adjustments
2. Required medical supplies (prioritized)
3. Patient advisories

${epidemic ? `IMPORTANT: Consider the ${epidemic} epidemic/disease and provide appropriate recommendations based on typical healthcare requirements for this condition.` : ""}
`;

  try {
    const result = await run(agent, query);

    return {
      success: true,
      recommendations: result.finalOutput,
      messages: result.messages,
    };
  } catch (error) {
    console.error("Error running healthcare agent:", error);
    throw error;
  }
};
