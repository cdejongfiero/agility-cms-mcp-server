import { z } from "zod";
import { MCPPrompt } from "mcp-framework";

interface FieroModuleInput {
  modelReferenceName: string;
  moduleType?: "content" | "hero" | "listing" | "navigation" | "product" | "banner";
  includeErrorBoundary?: boolean;
  includeTypeform?: boolean;
  includeProductIntegration?: boolean;
}

class FieroModuleGeneratorPrompt extends MCPPrompt<FieroModuleInput> {
  name = "generate_fiero_agility_module";
  description = "Generate an Agility CMS module component specifically for the Fiero Forni Next.js project architecture";
  
  schema = {
    modelReferenceName: {
      type: z.string(),
      description: "Reference name of the Agility content model (e.g., 'ProductHero', 'ContentAndImage')",
      required: true,
    },
    moduleType: {
      type: z.enum(["content", "hero", "listing", "navigation", "product", "banner"]).optional(),
      description: "Type of module - helps determine component patterns to follow",
      required: false,
    },
    includeErrorBoundary: {
      type: z.boolean().optional(),
      description: "Whether to include error boundary implementation (default: true)",
      required: false,
    },
    includeTypeform: {
      type: z.boolean().optional(),
      description: "Whether this module should support Typeform integration",
      required: false,
    },
    includeProductIntegration: {
      type: z.boolean().optional(),
      description: "Whether this module needs product/e-commerce integration",
      required: false,
    },
  };

  async generateMessages({ 
    modelReferenceName, 
    moduleType = "content",
    includeErrorBoundary = true,
    includeTypeform = false,
    includeProductIntegration = false
  }: FieroModuleInput) {
    return [
      {
        role: "system",
        content: {
          type: "text",
          text: `You are an expert Next.js developer working on the Fiero Forni e-commerce project. You understand:

**Project Architecture:**
- Next.js 13.5 with pages router, Node 18, Tailwind CSS, React 18
- Agility CMS integration with modular component architecture
- Components organized in /components/agility-modules/
- TypeScript interfaces for all Agility field definitions
- Module registration pattern in index.ts files

**Fiero Project Patterns:**
- Modules extend \`Module<Fields>\` from '@agility/nextjs'
- Fields interface defines all Agility CMS field types
- Components use Tailwind CSS for styling
- Error boundaries wrap modules in ContentZone rendering
- LinkButton and TypeformModalButton components available
- Image optimization with getOptimizedImageUrl helper
- Responsive design patterns (mobile-first, md:, lg:, xl:, 2xl:)

**Current Dependencies:**
- @agility/nextjs for CMS integration
- Next.js Image component for optimized images
- Tailwind CSS with custom configuration
- TypeformModalButton for form integrations
- LinkButton for CTAs and navigation

**Code Quality Standards:**
- Production-ready TypeScript with proper interfaces
- Responsive design with mobile-first approach
- Accessibility considerations (semantic HTML, ARIA labels)
- Performance optimization (Image component, lazy loading)
- Error handling and graceful degradation
- SEO-friendly markup when applicable

Always generate code that fits the existing Fiero project patterns and avoids tech debt.`,
        },
      },
      {
        role: "user", 
        content: {
          type: "text",
          text: `I need to create a new Agility module for the "${modelReferenceName}" content model. This is a ${moduleType} type module for the Fiero Forni project.

Requirements:
- ${includeErrorBoundary ? "Include error boundary compatibility" : "Basic module without error boundary"}
- ${includeTypeform ? "Include Typeform integration capabilities" : "No Typeform integration needed"}
- ${includeProductIntegration ? "Include product/e-commerce integration" : "No product integration needed"}

Please:

1. **Fetch the content model schema** using get-content-model-by-reference-name for "${modelReferenceName}"

2. **Generate a complete Agility module** that includes:
   - TypeScript Fields interface matching the Agility content model exactly
   - Module component extending Module<Fields> from '@agility/nextjs'
   - Proper destructuring of fields from module.fields
   - Tailwind CSS styling following Fiero patterns
   - Responsive design (mobile-first with md:, lg:, xl: breakpoints)
   - Image optimization using getOptimizedImageUrl helper if images present
   - LinkButton usage for CTA fields
   ${includeTypeform ? "   - TypeformModalButton integration for form fields" : ""}
   ${includeProductIntegration ? "   - Product data handling and display" : ""}

3. **Provide module registration code** to add to /components/agility-modules/index.ts

4. **Include usage examples** showing how the module renders in ContentZone

5. **Follow Fiero best practices:**
   - Use existing UI components (LinkButton, TypeformModalButton)
   - Implement proper TypeScript typing
   - Include accessibility attributes
   - Handle missing/optional fields gracefully
   - Use semantic HTML structure
   - Optimize for performance

Make the module production-ready and consistent with the existing Fiero Forni codebase architecture.`,
        },
      },
    ];
  }
}

export default FieroModuleGeneratorPrompt;