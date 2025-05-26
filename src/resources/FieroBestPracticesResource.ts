import { MCPResource, ResourceContent } from "mcp-framework";

class FieroBestPracticesResource extends MCPResource {
  uri = "fiero://best-practices";
  name = "Fiero Development Best Practices";
  description = "Best practices, migration guidance, and modern patterns for the Fiero Forni Next.js + Agility CMS project";
  mimeType = "application/json";

  async read(): Promise<ResourceContent[]> {
    const bestPractices = {
      "next_js_best_practices": {
        "performance": {
          "image_optimization": {
            "pattern": "Always use Next.js Image component with proper sizing",
            "example": `import Image from 'next/image';

const OptimizedImage = ({ image, alt }) => (
  <Image
    src={getOptimizedImageUrl(image.url, 1920, 1080)}
    alt={alt || image.description}
    width={1920}
    height={1080}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,..."
    className="w-full h-auto"
    priority={false} // Set true for above-fold images
  />
);`,
            "mobile_optimization": "Provide different sizes for mobile/desktop",
            "lazy_loading": "Use priority={true} only for above-fold images"
          },
          "code_splitting": {
            "dynamic_imports": "Use dynamic imports for large modules",
            "example": `const HeavyModule = dynamic(() => import('./HeavyModule'), {
  loading: () => <div>Loading...</div>,
  ssr: false // if client-side only
});`
          },
          "bundle_optimization": {
            "tree_shaking": "Import only what you need from libraries",
            "example": "import { specific } from 'library' // Not import * as lib",
            "analysis": "Use @next/bundle-analyzer to identify large dependencies"
          }
        },
        "migration_to_15": {
          "benefits": [
            "Improved performance with React 19",
            "Better developer experience",
            "Enhanced security",
            "Modern runtime features",
            "Better caching strategies"
          ],
          "breaking_changes": [
            "Node.js version requirements",
            "Some API changes",
            "TypeScript version compatibility",
            "Dependency updates needed"
          ],
          "migration_steps": [
            "Update Node.js to 18.18+",
            "Update Next.js: npm install next@15",
            "Update React: npm install react@19 react-dom@19", 
            "Update TypeScript if needed",
            "Test all pages and components",
            "Update deployment configuration",
            "Monitor performance changes"
          ],
          "compatibility": {
            "agility_cms": "Verify Agility packages work with Next.js 15",
            "tailwind": "Update Tailwind if needed",
            "other_deps": "Check all dependencies for Next.js 15 support"
          }
        },
        "app_router_consideration": {
          "benefits": [
            "Better performance with React Server Components",
            "Improved data fetching patterns", 
            "Nested layouts and loading states",
            "Built-in error boundaries",
            "Streaming and Suspense support"
          ],
          "challenges": [
            "Significant migration effort",
            "Learning curve for team",
            "Agility CMS integration changes needed",
            "Different data fetching patterns"
          ],
          "recommendation": "Consider App Router for new projects, but Pages Router is stable for existing projects",
          "migration_effort": "High - requires substantial refactoring"
        }
      },
      "agility_cms_best_practices": {
        "content_fetch_2_migration": {
          "benefits": [
            "Better TypeScript support",
            "Improved performance",
            "Modern fetch patterns",
            "Better error handling",
            "Enhanced caching"
          ],
          "migration_steps": [
            "Install @agility/content-fetch@2.x",
            "Update import statements",
            "Refactor data fetching functions",
            "Update getStaticProps/getServerSideProps",
            "Test all content fetching",
            "Update error handling patterns"
          ],
          "pattern_changes": {
            "old_pattern": "getContentItem(contentID, lang)",
            "new_pattern": "getContentItem({ contentID, languageCode: lang })",
            "config": "New configuration object structure",
            "caching": "Built-in caching improvements"
          }
        },
        "data_fetching_patterns": {
          "recommended_approach": "Move data fetching to lib/ folder",
          "separation_of_concerns": "Components for UI, lib/ for data",
          "example": `// lib/cms/getPageContent.ts
export async function getPageContent(slug: string, locale: string) {
  const pageData = await getPage({
    contentID: slug,
    languageCode: locale,
    expandAllContentLinks: true
  });
  
  return pageData;
}

// In component or page:
import { getPageContent } from '@lib/cms/getPageContent';`,
          "benefits": [
            "Easier testing",
            "Better code organization", 
            "Reusable data fetching logic",
            "Cleaner components"
          ]
        },
        "content_modeling": {
          "field_naming": "Use camelCase for field names",
          "required_fields": "Mark essential fields as required",
          "field_validation": "Use field validation rules",
          "content_relationships": "Use content links for relationships",
          "media_optimization": "Configure image optimization settings"
        }
      },
      "component_best_practices": {
        "module_development": {
          "typescript_interfaces": {
            "pattern": "Always define Fields interface for Agility modules",
            "example": `interface Fields {
  heading: string;
  subHeading?: string; // Optional fields marked with ?
  image: ImageField;
  cTA: URLField;
  showOnMobile: boolean;
}

const ModuleName: Module<Fields> = ({ module: { fields } }) => {
  const { heading, subHeading, image, cTA, showOnMobile } = fields;
  
  // Handle optional fields
  if (!heading) return null;
  
  return (
    <section className={cn('module-wrapper', { hidden: !showOnMobile })}>
      {/* Module content */}
    </section>
  );
};`
          },
          "error_handling": {
            "required_fields": "Return null or fallback for missing required fields",
            "optional_fields": "Use conditional rendering for optional fields",
            "image_fallbacks": "Provide fallback for missing images",
            "link_validation": "Validate URLs before rendering links"
          },
          "accessibility": {
            "semantic_html": "Use proper HTML5 semantic elements",
            "aria_labels": "Add ARIA labels for interactive elements",
            "keyboard_navigation": "Ensure keyboard accessibility",
            "color_contrast": "Maintain proper color contrast ratios",
            "alt_text": "Always provide meaningful alt text for images"
          }
        },
        "responsive_design": {
          "mobile_first": "Design for mobile first, enhance for desktop",
          "breakpoint_strategy": {
            "sm": "640px - Small tablets",
            "md": "768px - Tablets", 
            "lg": "1024px - Small desktops",
            "xl": "1280px - Large desktops",
            "2xl": "1536px - Extra large screens"
          },
          "common_patterns": {
            "typography": "text-sm md:text-base lg:text-lg",
            "spacing": "p-4 md:p-6 lg:p-8",
            "grid": "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            "flexbox": "flex-col md:flex-row"
          }
        },
        "performance_optimization": {
          "image_handling": "Use getOptimizedImageUrl for all images",
          "lazy_loading": "Implement lazy loading for below-fold content",
          "code_splitting": "Split large modules using dynamic imports",
          "bundle_size": "Monitor and optimize bundle size",
          "caching": "Leverage Next.js ISR and Agility CMS caching"
        }
      },
      "styling_best_practices": {
        "tailwind_patterns": {
          "utility_first": "Use Tailwind utilities, avoid custom CSS when possible",
          "component_classes": "Create component classes for repeated patterns",
          "responsive_utilities": "Use responsive prefixes consistently",
          "color_system": "Stick to defined color palette",
          "spacing_scale": "Use consistent spacing scale"
        },
        "css_organization": {
          "utility_classes": "Primary styling method",
          "component_css": "Use CSS modules for complex components",
          "global_styles": "Minimal global styles, mostly for base elements",
          "css_variables": "Use CSS custom properties for dynamic values"
        }
      },
      "testing_recommendations": {
        "component_testing": {
          "unit_tests": "Test component logic and rendering",
          "integration_tests": "Test component integration with Agility data",
          "accessibility_tests": "Test accessibility with automated tools",
          "visual_tests": "Consider visual regression testing"
        },
        "e2e_testing": {
          "critical_paths": "Test critical user journeys",
          "content_rendering": "Test Agility content rendering",
          "responsive_behavior": "Test across different screen sizes",
          "performance": "Test Core Web Vitals"
        }
      },
      "deployment_best_practices": {
        "build_optimization": {
          "static_generation": "Use ISR for content that changes occasionally",
          "image_optimization": "Configure Next.js image optimization",
          "bundle_analysis": "Regular bundle size analysis",
          "performance_monitoring": "Monitor Core Web Vitals"
        },
        "caching_strategy": {
          "static_assets": "Long-term caching for static assets",
          "api_responses": "Appropriate caching for API responses",
          "page_cache": "ISR for content pages",
          "cdn_integration": "Leverage CDN for global performance"
        }
      },
      "migration_roadmap": {
        "immediate_priorities": [
          "Security updates for all dependencies",
          "Content Fetch 2.x migration planning",
          "Performance audit and optimization",
          "TypeScript strict mode enablement",
          "Component error handling improvements"
        ],
        "short_term_goals": [
          "Content Fetch 2.x migration execution",
          "Component architecture review and cleanup",
          "Performance monitoring implementation",
          "Accessibility audit and improvements",
          "Testing strategy implementation"
        ],
        "medium_term_goals": [
          "Next.js 15 migration evaluation",
          "App Router feasibility assessment", 
          "Advanced performance optimizations",
          "Modern React patterns adoption",
          "Developer experience improvements"
        ],
        "long_term_vision": [
          "Full Next.js 15 adoption",
          "Potential App Router migration",
          "Advanced caching strategies",
          "Micro-frontend considerations",
          "Platform modernization"
        ]
      },
      "common_patterns": {
        "error_boundaries": "Wrap modules in error boundaries",
        "loading_states": "Provide loading states for async content",
        "fallback_content": "Graceful degradation for missing content",
        "responsive_images": "Always provide responsive image solutions",
        "seo_optimization": "Proper meta tags and structured data"
      }
    };

    return [
      {
        uri: this.uri,
        mimeType: this.mimeType,
        text: JSON.stringify(bestPractices, null, 2),
      },
    ];
  }
}

export default FieroBestPracticesResource;