import { z } from "zod";
import { MCPPrompt } from "mcp-framework";

interface ProjectHelperInput {
  taskType: "module-registration" | "template-creation" | "migration-help" | "debug-help" | "optimization";
  moduleName?: string;
  templateName?: string;
  issueDescription?: string;
  currentCode?: string;
}

class FieroProjectHelperPrompt extends MCPPrompt<ProjectHelperInput> {
  name = "fiero_project_helper";
  description = "Provides specific help with Fiero project tasks like module registration, template creation, and debugging";
  
  schema = {
    taskType: {
      type: z.enum(["module-registration", "template-creation", "migration-help", "debug-help", "optimization"]),
      description: "Type of project help needed",
      required: true,
    },
    moduleName: {
      type: z.string().optional(),
      description: "Name of the module (for registration or debugging)",
      required: false,
    },
    templateName: {
      type: z.string().optional(),
      description: "Name of the page template (for template creation)",
      required: false,
    },
    issueDescription: {
      type: z.string().optional(),
      description: "Description of the issue or challenge",
      required: false,
    },
    currentCode: {
      type: z.string().optional(),
      description: "Current code that needs help or optimization",
      required: false,
    },
  };

  async generateMessages({ 
    taskType,
    moduleName,
    templateName,
    issueDescription,
    currentCode
  }: ProjectHelperInput) {
    let userPrompt = "";

    switch (taskType) {
      case "module-registration":
        userPrompt = `I need help registering a new Agility module in the Fiero project.

Module name: ${moduleName || "Not specified"}
${issueDescription ? `Additional context: ${issueDescription}` : ""}

Please help me:

1. **Update the module registration** in /components/agility-modules/index.ts
   - Show the exact code to add to the allModules array
   - Follow the existing naming and import patterns
   - Ensure proper alphabetical ordering

2. **Verify the module structure** 
   - Check that the module follows Fiero patterns
   - Ensure proper TypeScript interfaces
   - Validate field destructuring and usage

3. **Provide usage examples**
   - Show how the module appears in ContentZone
   - Example of adding to a page template
   - Common field configurations in Agility CMS

4. **Troubleshooting checklist**
   - Common issues with module registration
   - How to verify the module is properly loaded
   - Debug steps if module doesn't appear

${currentCode ? `Current module code:\n\`\`\`typescript\n${currentCode}\n\`\`\`` : ""}

Make sure the registration follows the exact pattern used in the Fiero project.`;
        break;

      case "template-creation":
        userPrompt = `I need help creating a new page template for the Fiero project.

Template name: ${templateName || "Not specified"}
${issueDescription ? `Requirements: ${issueDescription}` : ""}

Please help me:

1. **Create the page template file**
   - Location: /components/agility-pageTemplates/${templateName}.tsx
   - Follow Fiero template patterns
   - Use proper TypeScript typing

2. **Define ContentZone structure**
   - Determine appropriate content zones
   - Use getModule prop correctly
   - Handle responsive layout considerations

3. **Register the template**
   - Update agility-pageTemplates/index.ts
   - Follow existing registration pattern
   - Ensure proper naming conventions

4. **Template configuration**
   - CSS classes and layout structure
   - Responsive design considerations
   - SEO and accessibility setup

5. **Usage instructions**
   - How to assign in Agility CMS
   - Testing the template
   - Common configuration patterns

${currentCode ? `Current template code:\n\`\`\`typescript\n${currentCode}\n\`\`\`` : ""}

Focus on creating a production-ready template that fits the Fiero architecture.`;
        break;

      case "migration-help":
        userPrompt = `I need help with a migration task in the Fiero project.

${issueDescription ? `Migration challenge: ${issueDescription}` : ""}
${moduleName ? `Affected module: ${moduleName}` : ""}

Please help me:

1. **Assess the migration impact**
   - What needs to change
   - Compatibility considerations
   - Risk assessment

2. **Provide step-by-step migration plan**
   - Order of operations
   - Testing checkpoints
   - Rollback procedures

3. **Code transformation examples**
   - Before and after code samples
   - Pattern changes required
   - Best practices to follow

4. **Validation steps**
   - How to verify migration success
   - Performance impact assessment
   - Functional testing approach

5. **Common issues and solutions**
   - Known migration problems
   - Troubleshooting steps
   - Prevention strategies

${currentCode ? `Current code that needs migration:\n\`\`\`typescript\n${currentCode}\n\`\`\`` : ""}

Focus on maintaining stability while achieving the migration goals.`;
        break;

      case "debug-help":
        userPrompt = `I need debugging help for an issue in the Fiero project.

${issueDescription ? `Issue description: ${issueDescription}` : ""}
${moduleName ? `Affected module: ${moduleName}` : ""}

Please help me:

1. **Analyze the problem**
   - Identify potential root causes
   - Common patterns that lead to this issue
   - Debugging approach

2. **Diagnostic steps**
   - What to check first
   - Console logs and error messages to look for
   - Network requests to verify

3. **Solution approaches**
   - Multiple potential fixes
   - Pros and cons of each approach
   - Recommended solution with reasoning

4. **Prevention strategies**
   - How to avoid this issue in the future
   - Code patterns to follow
   - Testing approaches

5. **Verification steps**
   - How to confirm the fix works
   - Edge cases to test
   - Performance impact check

${currentCode ? `Current problematic code:\n\`\`\`typescript\n${currentCode}\n\`\`\`` : ""}

Focus on finding the root cause and providing a robust solution.`;
        break;

      case "optimization":
        userPrompt = `I need help optimizing code in the Fiero project.

${issueDescription ? `Optimization goal: ${issueDescription}` : ""}
${moduleName ? `Target module: ${moduleName}` : ""}

Please help me:

1. **Performance analysis**
   - Current performance characteristics
   - Bottlenecks and improvement opportunities
   - Measurement strategies

2. **Optimization recommendations**
   - Code-level optimizations
   - Bundle size improvements
   - Runtime performance enhancements

3. **Implementation approach**
   - Step-by-step optimization plan
   - Testing and measurement approach
   - Risk mitigation strategies

4. **Best practices application**
   - Modern React patterns
   - Next.js optimization features
   - Agility CMS caching strategies

5. **Validation methods**
   - Performance measurement tools
   - Before/after comparisons
   - User experience impact

${currentCode ? `Current code to optimize:\n\`\`\`typescript\n${currentCode}\n\`\`\`` : ""}

Focus on measurable improvements that enhance user experience while maintaining code quality.`;
        break;
    }

    return [
      {
        role: "system",
        content: {
          type: "text",
          text: `You are an expert developer specializing in the Fiero Forni Next.js + Agility CMS project. You understand:

**Project Structure:**
- /components/agility-modules/ for modules with index.ts registration
- /components/agility-pageTemplates/ for templates
- /components/agility-global/ for global components
- /lib/ for data fetching and utilities

**Registration Patterns:**
- Modules: { name: "ModuleName", module: ModuleName } in allModules array
- Templates: Similar pattern in pageTemplates
- Alphabetical ordering in registration arrays

**Code Patterns:**
- TypeScript interfaces for all Agility fields
- Module<Fields> extension for modules
- ContentZone usage in templates
- Error boundary compatibility
- Responsive Tailwind design

**Performance Considerations:**
- Next.js Image optimization
- Bundle size management
- Agility CMS caching
- Runtime performance

Provide specific, actionable help that fits the existing Fiero project architecture and follows established patterns.`,
        },
      },
      {
        role: "user",
        content: { type: "text", text: userPrompt },
      },
    ];
  }
}

export default FieroProjectHelperPrompt;