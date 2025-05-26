import { z } from "zod";
import { MCPPrompt } from "mcp-framework";

interface ApiSetupInput {
  purpose: "fetch-content" | "setup-project" | "create-api-route" | "configure-static-generation";
  contentType?: string;
  renderingStrategy?: "ssg" | "ssr" | "isr" | "csr";
  features?: string[];
}

class ApiIntegrationPrompt extends MCPPrompt<ApiSetupInput> {
  name = "setup_agility_fetch";
  description = "Help set up Agility Fetch API integration in Next.js with proper caching, error handling, and performance optimization";
  
  schema = {
    purpose: {
      type: z.enum(["fetch-content", "setup-project", "create-api-route", "configure-static-generation"]),
      description: "What you want to accomplish - fetch specific content, set up the entire project, create API routes, or configure static generation",
      required: true,
    },
    contentType: {
      type: z.string().optional(),
      description: "Specific content type/model reference name if fetching content (e.g., 'BlogPost', 'HomePage')",
      required: false,
    },
    renderingStrategy: {
      type: z.enum(["ssg", "ssr", "isr", "csr"]).optional(),
      description: "Next.js rendering strategy - Static Site Generation (ssg), Server-Side Rendering (ssr), Incremental Static Regeneration (isr), or Client-Side Rendering (csr)",
      required: false,
    },
    features: {
      type: z.array(z.string()).optional(),
      description: "Additional features needed (e.g., ['preview-mode', 'sitemap', 'revalidation', 'error-handling'])",
      required: false,
    },
  };

  async generateMessages({ 
    purpose, 
    contentType, 
    renderingStrategy = "ssg",
    features = []
  }: ApiSetupInput) {
    
    const purposeInstructions = {
      "fetch-content": contentType 
        ? `Create code to fetch "${contentType}" content from Agility CMS with proper typing and error handling.`
        : "Create generic content fetching utilities for Agility CMS integration.",
      "setup-project": "Set up a complete Next.js project structure with Agility CMS integration, including configuration, utilities, and best practices.",
      "create-api-route": "Create Next.js API routes for Agility CMS content with proper caching and error handling.",
      "configure-static-generation": "Configure static generation strategies (getStaticProps, getStaticPaths) for optimal performance with Agility content."
    };

    const renderingInfo = {
      ssg: "Static Site Generation at build time for maximum performance",
      ssr: "Server-Side Rendering on each request for real-time data",
      isr: "Incremental Static Regeneration for balanced performance and freshness",
      csr: "Client-Side Rendering for dynamic interactions"
    };

    return [
      {
        role: "user",
        content: {
          type: "text",
          text: `I need help with Agility CMS API integration in Next.js. ${purposeInstructions[purpose]}

**Configuration Requirements:**
- Rendering Strategy: ${renderingStrategy} (${renderingInfo[renderingStrategy]})
${contentType ? `- Content Type: ${contentType}` : ''}
${features.length > 0 ? `- Additional Features: ${features.join(', ')}` : ''}

**Please provide:**

1. **Environment Setup**
   - Required environment variables
   - Agility Fetch SDK configuration
   - TypeScript setup for content types

2. **Content Fetching Code**
   - Utility functions for fetching content
   - Type-safe interfaces
   - Error handling and fallbacks
   - Caching strategies

3. **Next.js Integration**
   - getStaticProps/getServerSideProps implementation
   - Dynamic routing setup
   - API routes if needed
   - Revalidation configuration

4. **Performance Optimization**
   - Caching strategies
   - Image optimization
   - Bundle optimization
   - Error boundaries

5. **Development Best Practices**
   - Code organization
   - Testing strategies
   - Deployment considerations
   - Content preview setup

Before generating the code, please:
- Use the agility://content-models/schema resource to understand available content models
- Use the agility://containers/overview resource to understand content structure
${contentType ? `- Use get_content_model_by_reference_name tool to get schema for "${contentType}"` : ''}

Generate production-ready code with:
- Proper TypeScript interfaces
- Comprehensive error handling  
- Performance optimizations
- Clear documentation
- Example usage`,
        },
      },
      {
        role: "assistant",
        content: {
          type: "text",
          text: `I'll help you set up a robust Agility CMS integration in Next.js. Let me first analyze your content structure and then provide you with production-ready code for ${purpose} using ${renderingStrategy} rendering strategy.`,
        },
      },
    ];
  }
}

export default ApiIntegrationPrompt;