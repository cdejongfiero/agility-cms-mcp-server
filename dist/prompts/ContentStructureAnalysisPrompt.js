import { z } from "zod";
import { MCPPrompt } from "mcp-framework";
class ContentStructureAnalysisPrompt extends MCPPrompt {
    name = "analyze_content_architecture";
    description = "Analyze and provide insights about your Agility CMS content structure, relationships, and architecture";
    schema = {
        focusArea: {
            type: z.enum(["models", "containers", "relationships", "overview"]).optional(),
            description: "Area to focus the analysis on - models (content schemas), containers (content instances), relationships (how content connects), or overview (general summary)",
            required: false,
        },
        depth: {
            type: z.enum(["summary", "detailed", "comprehensive"]).optional(),
            description: "Level of detail for the analysis - summary (key metrics), detailed (in-depth analysis), or comprehensive (full architectural review)",
            required: false,
        },
    };
    async generateMessages({ focusArea = "overview", depth = "detailed" }) {
        const focusInstructions = {
            models: "Focus on content model schemas, field types, validation rules, and model design patterns.",
            containers: "Focus on content distribution, container usage, content volumes, and publishing patterns.",
            relationships: "Focus on how content models relate to each other, reference fields, and content dependencies.",
            overview: "Provide a comprehensive overview covering models, containers, usage patterns, and architectural insights."
        };
        const depthInstructions = {
            summary: "Provide key metrics, top-level insights, and executive summary format.",
            detailed: "Include specific examples, detailed breakdowns, and actionable recommendations.",
            comprehensive: "Provide thorough analysis with technical details, patterns, potential issues, and strategic recommendations."
        };
        return [
            {
                role: "user",
                content: {
                    type: "text",
                    text: `Please analyze my Agility CMS content architecture with a focus on ${focusArea} and provide a ${depth} analysis.

Use these resources to gather data:
1. **agility://content-models/schema** - For content model definitions, field types, and schema structure
2. **agility://containers/overview** - For container usage, content counts, and distribution patterns

${focusInstructions[focusArea]}

${depthInstructions[depth]}

Your analysis should include:

**Content Architecture Overview:**
- Total content models and their purposes
- Field type distribution and usage patterns
- Content volume and distribution across containers
- Most active vs. unused content areas

**Development Insights:**
- Recommended component structure for Next.js
- Common field patterns to create reusable components for
- Content fetching strategies and optimization opportunities
- SEO and performance considerations

**Content Strategy Insights:**
- Content model effectiveness and potential improvements
- Container utilization and content gaps
- Publishing patterns and content lifecycle insights
- Scalability considerations

**Technical Recommendations:**
- Component architecture suggestions
- API optimization strategies  
- Caching and performance recommendations
- Content modeling best practices

Format the response as a well-structured report with clear sections, bullet points for key insights, and actionable recommendations for both content creators and developers.`,
                },
            },
            {
                role: "assistant",
                content: {
                    type: "text",
                    text: `I'll analyze your Agility CMS content architecture by examining your content models and container usage patterns. Let me gather the data from your resources and provide you with comprehensive insights and recommendations.`,
                },
            },
        ];
    }
}
export default ContentStructureAnalysisPrompt;
