import { z } from "zod";
import { MCPPrompt } from "mcp-framework";

interface ArchitectureInput {
  analysisType: "migration" | "refactor" | "performance" | "tech-debt" | "modernization";
  component?: string;
  currentIssue?: string;
  migrationTarget?: "nextjs15" | "content-fetch-2" | "app-router" | "typescript5";
}

class FieroArchitectureAdvisorPrompt extends MCPPrompt<ArchitectureInput> {
  name = "fiero_architecture_advisor";
  description = "Provides architecture guidance, migration advice, and tech debt solutions for the Fiero Forni Next.js project";
  
  schema = {
    analysisType: {
      type: z.enum(["migration", "refactor", "performance", "tech-debt", "modernization"]),
      description: "Type of architectural analysis needed",
      required: true,
    },
    component: {
      type: z.string().optional(),
      description: "Specific component or module to analyze (optional)",
      required: false,
    },
    currentIssue: {
      type: z.string().optional(),
      description: "Description of current issue or challenge",
      required: false,
    },
    migrationTarget: {
      type: z.enum(["nextjs15", "content-fetch-2", "app-router", "typescript5"]).optional(),
      description: "Target for migration analysis",
      required: false,
    },
  };

  async generateMessages({ 
    analysisType,
    component,
    currentIssue,
    migrationTarget
  }: ArchitectureInput) {
    const systemPrompt = `You are a senior Next.js architect specializing in Agility CMS integrations and modern web development. You understand the Fiero Forni project architecture:

**Current Stack:**
- Next.js 13.5 with pages router
- Node 18, React 18, Tailwind CSS
- Agility CMS with Content Fetch 1.x
- TypeScript, modular component architecture
- /components/agility-modules/ structure
- Manual module registration in index.ts files

**Project Goals:**
- Avoid tech debt accumulation
- Modernize while maintaining stability
- Improve performance and security
- Follow Next.js and React best practices
- Migrate to Content Fetch 2.x eventually
- Consider Next.js 15 migration path

**Known Areas for Improvement:**
- Content Fetch 1.x → 2.x migration
- Pages router → App router consideration
- Dependency updates and security
- Component architecture optimization
- Data fetching patterns (lib folder as data layer)
- Performance optimization opportunities

Provide practical, actionable advice that considers:
- Risk vs. benefit of changes
- Migration complexity and timeline
- Backwards compatibility requirements
- Team velocity and maintenance burden
- Security and performance implications`;

    let userPrompt = "";

    switch (analysisType) {
      case "migration":
        userPrompt = `I need guidance on migrating the Fiero Forni project${migrationTarget ? ` to ${migrationTarget}` : ""}. 

Current situation:
${currentIssue ? `- Current issue: ${currentIssue}` : ""}
${component ? `- Focus component: ${component}` : ""}

Please provide:
1. **Migration assessment** - risks, benefits, complexity
2. **Step-by-step migration plan** with priorities
3. **Backwards compatibility strategy**
4. **Testing approach** for the migration
5. **Performance/security improvements** expected
6. **Timeline estimation** and resource requirements
7. **Rollback plan** if issues arise

${migrationTarget === "nextjs15" ? "Focus on Next.js 15 migration benefits, App Router considerations, and breaking changes." : ""}
${migrationTarget === "content-fetch-2" ? "Focus on Content Fetch 2.x benefits, API changes, and data fetching pattern improvements." : ""}
${migrationTarget === "app-router" ? "Focus on App Router benefits, file-based routing changes, and component architecture implications." : ""}`;
        break;

      case "refactor":
        userPrompt = `I need refactoring advice for the Fiero Forni project${component ? ` specifically for ${component}` : ""}.

${currentIssue ? `Current challenge: ${currentIssue}` : ""}

Please analyze and provide:
1. **Current architecture assessment** - what's working, what's not
2. **Refactoring priorities** - highest impact improvements
3. **Code organization recommendations** - better separation of concerns
4. **Data fetching improvements** - moving logic to lib folder
5. **Component optimization** - reducing complexity and improving reusability
6. **TypeScript improvements** - better typing and interfaces
7. **Performance optimizations** - bundle size, runtime performance
8. **Maintenance improvements** - easier updates and debugging

Focus on practical changes that improve code quality without breaking existing functionality.`;
        break;

      case "performance":
        userPrompt = `I need performance optimization guidance for the Fiero Forni project${component ? ` focusing on ${component}` : ""}.

${currentIssue ? `Performance issue: ${currentIssue}` : ""}

Please analyze and recommend:
1. **Performance audit** - current bottlenecks and opportunities
2. **Next.js optimizations** - Image, Script, dynamic imports
3. **Agility CMS optimizations** - data fetching, caching strategies
4. **Bundle optimization** - code splitting, tree shaking, dependencies
5. **Runtime optimizations** - component rendering, state management
6. **Loading strategies** - critical resources, lazy loading, prefetching
7. **Monitoring setup** - Core Web Vitals, performance tracking
8. **Implementation priorities** - quick wins vs. long-term improvements

Focus on measurable improvements that enhance user experience.`;
        break;

      case "tech-debt":
        userPrompt = `I need tech debt analysis and remediation strategy for the Fiero Forni project${component ? ` particularly ${component}` : ""}.

${currentIssue ? `Specific concern: ${currentIssue}` : ""}

Please provide:
1. **Tech debt assessment** - current debt areas and impact
2. **Dependency audit** - outdated packages, security vulnerabilities
3. **Code quality review** - patterns that need improvement
4. **Architecture debt** - structural issues that slow development
5. **Testing gaps** - missing tests and quality assurance
6. **Documentation needs** - knowledge transfer and maintenance
7. **Remediation roadmap** - prioritized plan for addressing debt
8. **Prevention strategies** - processes to avoid future debt

Focus on sustainable practices that improve long-term maintainability.`;
        break;

      case "modernization":
        userPrompt = `I need modernization strategy for the Fiero Forni project to align with current best practices${component ? ` starting with ${component}` : ""}.

${currentIssue ? `Current challenge: ${currentIssue}` : ""}

Please recommend:
1. **Modernization roadmap** - path to current best practices
2. **Framework updates** - Next.js 15, React patterns, TypeScript
3. **Agility CMS updates** - Content Fetch 2.x, new features
4. **Development workflow** - tooling, CI/CD, quality gates
5. **Component architecture** - modern patterns, composition
6. **State management** - context, hooks, data flow
7. **Testing strategy** - unit, integration, e2e testing
8. **Developer experience** - tooling, debugging, productivity

Balance innovation with stability, prioritizing changes that provide the most value.`;
        break;
    }

    return [
      {
        role: "system",
        content: { type: "text", text: systemPrompt },
      },
      {
        role: "user",
        content: { type: "text", text: userPrompt },
      },
    ];
  }
}

export default FieroArchitectureAdvisorPrompt;