import { MCPResource, ResourceContent } from "mcp-framework";

class FieroProjectStructureResource extends MCPResource {
  uri = "fiero://project-structure";
  name = "Fiero Forni Project Structure";
  description = "Complete project structure, patterns, and architectural guidelines for the Fiero Forni Next.js + Agility CMS project";
  mimeType = "application/json";

  async read(): Promise<ResourceContent[]> {
    const projectStructure = {
      "project": {
        "name": "Fiero Forni E-commerce",
        "description": "Next.js e-commerce site with Agility CMS integration",
        "stack": {
          "framework": "Next.js 13.5",
          "router": "pages",
          "node": "18.x",
          "react": "18.x",
          "typescript": true,
          "styling": "Tailwind CSS",
          "cms": "Agility CMS",
          "contentFetch": "1.x (migrating to 2.x)",
          "deployment": "Production ready"
        }
      },
      "directory_structure": {
        "/pages": {
          "description": "Next.js pages directory",
          "files": {
            "_app.tsx": "Main application wrapper",
            "_document.tsx": "Custom document component", 
            "index.tsx": "Homepage",
            "[...slug].tsx": "Dynamic route handler for all content pages"
          },
          "subdirectories": {
            "/api": "API routes for navigation, sitemap, etc.",
            "/fields": "Custom Agility CMS field implementations"
          }
        },
        "/components": {
          "description": "React components organized by purpose",
          "subdirectories": {
            "/agility-common": "Common components for Agility integration",
            "/agility-custom-fields": "Custom field components for Agility CMS",
            "/agility-global": "Global components (AgilityPage, ContentZone, PageNotFound)",
            "/agility-modules": "Modular components managed through Agility - THIS IS WHERE NEW MODULES GO",
            "/agility-pageTemplates": "Page template components",
            "/common": "Shared UI components (Layout, Navigation, Footer)",
            "/icons": "SVG icon components",
            "/ui": "Core UI elements (LinkButton, TypeformModalButton, Modal, etc.)"
          }
        },
        "/lib": {
          "description": "Utility functions and services - SHOULD BE DATA FETCHING LAYER",
          "subdirectories": {
            "/cms": "CMS integration helpers",
            "/contexts": "React contexts (NavigationContext, BreadcrumbContext)",
            "/hooks": "Custom React hooks",
            "/navigation": "Navigation system functions",
            "/global-data": "Global data fetching utilities"
          }
        }
      },
      "agility_patterns": {
        "module_structure": {
          "description": "Standard pattern for Agility modules",
          "example": `interface Fields {
  heading: string;
  subHeading: string;
  cTA: URLField;
  image: ImageField;
}

const ModuleName: Module<Fields> = ({ module: { fields } }) => {
  const { heading, subHeading, cTA, image } = fields;
  
  return (
    <section className="relative">
      {/* Module content */}
    </section>
  );
};

export default ModuleName;`,
          "registration": "Must be added to /components/agility-modules/index.ts",
          "registration_example": `import ModuleName from "./ModuleName"

const allModules = [
  { name: "ModuleName", module: ModuleName },
  // ... other modules
];`
        },
        "field_types": {
          "URLField": "{ href: string; target: string; text: string }",
          "ImageField": "{ url: string; description: string; width: number; height: number }",
          "RichTextArea": "HTML string content",
          "Text": "Plain string",
          "Boolean": "true/false",
          "Number": "Numeric value",
          "Date": "Date string"
        },
        "page_templates": {
          "description": "Page templates define layout structure",
          "pattern": `const TemplateName = (props: any) => {
  return (
    <div className="template-wrapper">
      <ContentZone name='MainContentZone' {...props} getModule={getModule} />
    </div>
  );
};`
        }
      },
      "component_patterns": {
        "ui_components": {
          "LinkButton": {
            "props": "href, target, variant ('primary' | 'outlines'), children",
            "usage": "<LinkButton href={url} target={target} variant='primary'>{text}</LinkButton>"
          },
          "TypeformModalButton": {
            "props": "form (typeform ID), buttonText, color",
            "usage": "<TypeformModalButton form={typeformId} buttonText={ctaText} color='white' />"
          }
        },
        "image_optimization": {
          "helper": "getOptimizedImageUrl(imageUrl, width, height)",
          "usage": "const optimizedUrl = getOptimizedImageUrl(image.url, 1920, 1080)",
          "next_image": "Use Next.js Image component with optimized URLs"
        },
        "responsive_design": {
          "approach": "Mobile-first with Tailwind breakpoints",
          "breakpoints": "sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px",
          "pattern": "className='text-sm md:text-lg lg:text-xl'"
        }
      },
      "error_handling": {
        "module_errors": "ContentZone wraps modules with ErrorBoundary",
        "missing_modules": "Shows 'Module Not Found' message",
        "runtime_errors": "Shows error details in development",
        "graceful_degradation": "Handle missing fields gracefully"
      },
      "performance_patterns": {
        "images": "Always use Next.js Image with getOptimizedImageUrl",
        "lazy_loading": "Use dynamic imports for large modules",
        "caching": "Leverage Next.js ISR with revalidate",
        "bundle_optimization": "Tree shake unused code, optimize imports"
      },
      "migration_priorities": {
        "immediate": [
          "Keep dependencies updated for security",
          "Migrate Content Fetch 1.x to 2.x",
          "Optimize component performance"
        ],
        "medium_term": [
          "Consider Next.js 15 migration",
          "Evaluate App Router benefits",
          "Improve TypeScript typing"
        ],
        "long_term": [
          "Full App Router migration if beneficial",
          "Advanced performance optimizations",
          "Modern React patterns adoption"
        ]
      },
      "best_practices": {
        "code_organization": "Separate data fetching (lib/) from UI (components/)",
        "component_design": "Small, focused, reusable components",
        "typescript": "Strict typing for all Agility field interfaces",
        "styling": "Tailwind utilities, consistent spacing/colors",
        "accessibility": "Semantic HTML, ARIA labels, keyboard navigation",
        "seo": "Meta tags, structured data, performance optimization",
        "testing": "Consider adding tests for critical components",
        "documentation": "Document complex components and patterns"
      },
      "common_file_locations": {
        "new_module": "/components/agility-modules/[ModuleName].tsx",
        "module_registration": "/components/agility-modules/index.ts", 
        "page_template": "/components/agility-pageTemplates/[TemplateName].tsx",
        "global_component": "/components/agility-global/[ComponentName].tsx",
        "ui_component": "/components/ui/[ComponentName].tsx",
        "hook": "/lib/hooks/[hookName].ts",
        "context": "/lib/contexts/[ContextName].tsx",
        "utility": "/lib/[category]/[utilityName].ts"
      }
    };

    return [
      {
        uri: this.uri,
        mimeType: this.mimeType,
        text: JSON.stringify(projectStructure, null, 2),
      },
    ];
  }
}

export default FieroProjectStructureResource;