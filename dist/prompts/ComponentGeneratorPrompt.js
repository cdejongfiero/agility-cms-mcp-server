import { z } from "zod";
import { MCPPrompt } from "mcp-framework";
class ComponentGeneratorPrompt extends MCPPrompt {
    name = "generate_nextjs_component";
    description = "Generate a React/Next.js component based on an Agility CMS content model";
    schema = {
        modelReferenceName: {
            type: z.string(),
            description: "Reference name of the Agility content model (e.g., 'BlogPost', 'HeroSection')",
            required: true,
        },
        componentType: {
            type: z.enum(["page", "module", "list", "detail"]).optional(),
            description: "Type of component to generate - page (full page), module (reusable section), list (content listing), or detail (single item view)",
            required: false,
        },
        framework: {
            type: z.enum(["nextjs", "react"]).optional(),
            description: "Target framework (defaults to nextjs)",
            required: false,
        },
        styling: {
            type: z.enum(["tailwind", "css", "styled-components"]).optional(),
            description: "Styling approach (defaults to tailwind)",
            required: false,
        },
    };
    async generateMessages({ modelReferenceName, componentType = "module", framework = "nextjs", styling = "tailwind" }) {
        return [
            {
                role: "user",
                content: {
                    type: "text",
                    text: `I need to create a ${framework} component for the Agility CMS content model "${modelReferenceName}". Please help me generate a production-ready ${componentType} component with ${styling} styling.

First, use the get_content_model_by_reference_name tool to fetch the schema for "${modelReferenceName}". Then use the agility://content-models/schema resource to understand the field types and relationships.

After analyzing the schema, create a complete component that includes:

1. **TypeScript interface** defining the content model properties
2. **Component props interface** with proper typing
3. **Functional React component** with proper JSX structure
4. **Responsive design** using ${styling} 
5. **Field mapping** that handles all field types appropriately (text, rich text, images, links, etc.)
6. **Error handling** for missing or invalid content
7. **SEO considerations** if it's a page component
8. **Sample usage** showing how to use the component

For field type mapping:
- Text fields → proper text rendering with escaping
- Rich text → dangerouslySetInnerHTML or rich text renderer
- Images → Next.js Image component with proper sizing
- Links → Next.js Link component
- Date fields → formatted date display
- Boolean fields → conditional rendering
- Number fields → proper number formatting

Make the component production-ready with proper error boundaries, accessibility, and performance considerations.`,
                },
            },
            {
                role: "assistant",
                content: {
                    type: "text",
                    text: `I'll help you create a production-ready ${framework} component for the "${modelReferenceName}" content model. Let me start by fetching the content model schema to understand its structure and field types, then generate a complete component implementation.`,
                },
            },
        ];
    }
}
export default ComponentGeneratorPrompt;
