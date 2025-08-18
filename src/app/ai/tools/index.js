// Import declarations (definitions only)
import { carDeclarations } from "./cars/carDeclarations.js";
import { appointmentDeclarations } from "./appointment/appointmentDeclarations.js";
import { queryAppointmentsDeclarations } from "./appointment/queryAppointmentsDeclarations.js";

// Import handlers (logic only)
import { carHandlers } from "./cars/carHandlers.js";
import { appointmentHandlers } from "./appointment/appointmentHandlers.js";
import { queryAppointmentsHandlers } from "./appointment/queryAppointmentsHandlers.js";

// Collect all tool declarations
export const allTools = [
  ...carDeclarations,
  ...appointmentDeclarations,
  ...queryAppointmentsDeclarations,
];

// Tool definitions for Gemini API
export const tools = [
  {
    functionDeclarations: allTools,
  },
];

// 🎯 CREATE HANDLER REGISTRY IN THIS FILE
class InlineHandlerRegistry {
  constructor() {
    this.handlers = new Map();
    this.setupHandlers();
  }

  setupHandlers() {
    // Register car handlers
    Object.keys(carHandlers).forEach((functionName) => {
      this.handlers.set(
        functionName,
        carHandlers[functionName].bind(carHandlers)
      );
      console.log(`[Tools Registry] Registered car handler: ${functionName}`);
    });

    // Register appointment handlers
    Object.keys(appointmentHandlers).forEach((functionName) => {
      this.handlers.set(
        functionName,
        appointmentHandlers[functionName].bind(appointmentHandlers)
      );
      console.log(
        `[Tools Registry] Registered appointment handler: ${functionName}`
      );
    });

    // Register query appointments handlers
    Object.keys(queryAppointmentsHandlers).forEach((functionName) => {
      this.handlers.set(
        functionName,
        queryAppointmentsHandlers[functionName].bind(queryAppointmentsHandlers)
      );
      console.log(`[Tools Registry] Registered query handler: ${functionName}`);
    });

    console.log(
      `[Tools Registry] Total registered handlers: ${this.handlers.size}`
    );
    console.log(
      `[Tools Registry] Available functions:`,
      Array.from(this.handlers.keys())
    );
  }

  async executeFunction(functionName, args, user = null) {
    try {
      console.log(`[Tools Registry] Executing function: ${functionName}`);
      console.log(`[Tools Registry] Arguments:`, JSON.stringify(args, null, 2));
      console.log(
        `[Tools Registry] User:`,
        user ? `${user.id} (${user.name || "No name"})` : "No user"
      );

      const handler = this.handlers.get(functionName);

      if (!handler) {
        console.error(`[Tools Registry] ❌ Unknown function: ${functionName}`);
        console.error(
          `[Tools Registry] Available functions:`,
          this.getAvailableFunctions()
        );
        return {
          success: false,
          summary: `ไม่รู้จักคำสั่ง ${functionName}`,
          error: "Unknown function",
          functionName,
          query: args, // ✅ Include original args as query
        };
      }

      console.log(`[Tools Registry] ✅ Handler found for: ${functionName}`);
      const result = await handler(args, user);

      console.log(`[Tools Registry] ✅ Function ${functionName} completed:`, {
        success: result.success,
        hasData: !!result.rawData,
        count: result.count || 0,
        hasQuery: !!result.query, // ✅ Check if query is present
        query: result.query, // ✅ Log the actual query
        summary: result.summary,
      });

      // ✅ Ensure query is always included in the response
      const finalResult = {
        ...result,
        functionName,
        executedAt: new Date().toISOString(),
        // ✅ If result doesn't have query, use original args
        query: result.query || args,
      };

      console.log(`[Tools Registry] Final result query:`, finalResult.query);

      return finalResult;
    } catch (error) {
      console.error(
        `[Tools Registry] ❌ Error executing ${functionName}:`,
        error
      );
      console.error(`[Tools Registry] Error stack:`, error.stack);
      return {
        success: false,
        summary: `เกิดข้อผิดพลาดในการประมวลผล: ${error.message}`,
        error: error.message,
        functionName,
        query: args, // ✅ Include args as query even on error
      };
    }
  }

  getAvailableFunctions() {
    return Array.from(this.handlers.keys());
  }

  hasFunction(functionName) {
    return this.handlers.has(functionName);
  }

  getStats() {
    return {
      totalHandlers: this.handlers.size,
      availableFunctions: this.getAvailableFunctions(),
      categories: {
        car: this.getAvailableFunctions().filter((f) =>
          Object.keys(carHandlers).includes(f)
        ).length,
        appointment: this.getAvailableFunctions().filter((f) =>
          Object.keys(appointmentHandlers).includes(f)
        ).length,
        queryAppointments: this.getAvailableFunctions().filter((f) =>
          Object.keys(queryAppointmentsHandlers).includes(f)
        ).length,
      },
    };
  }
}

// Create single instance
const handlerRegistry = new InlineHandlerRegistry();

// 🎯 MAIN EXPORTS
export async function handleFunctionCalls(functionName, args, user) {
  console.log(`[Tools Index] Function call request: ${functionName}`);
  return await handlerRegistry.executeFunction(functionName, args, user);
}

export function getToolsInfo() {
  return {
    totalTools: allTools.length,
    availableFunctions: handlerRegistry.getAvailableFunctions(),
    handlerStats: handlerRegistry.getStats(),
  };
}

export function hasFunction(functionName) {
  return handlerRegistry.hasFunction(functionName);
}

// 🎯 ENHANCED LOGGING & VERIFICATION
console.log(`[Tools Index] Loaded ${allTools.length} tool declarations`);
console.log(
  `[Tools Index] Declarations:`,
  allTools.map((t) => t.name)
);
console.log(
  `[Tools Index] ${
    handlerRegistry.getAvailableFunctions().length
  } handlers available`
);

// Verify mapping
console.log("\n[Tools Index] Declaration ↔ Handler Mapping:");
allTools.forEach((tool) => {
  const hasHandler = handlerRegistry.hasFunction(tool.name);
  console.log(`  ${tool.name}: ${hasHandler ? "✅" : "❌"}`);
  if (!hasHandler) {
    console.error(`  ⚠️  Missing handler for: ${tool.name}`);
  }
});

// Check for orphaned handlers
const allDeclaredNames = allTools.map((t) => t.name);
const orphanedHandlers = handlerRegistry
  .getAvailableFunctions()
  .filter((funcName) => !allDeclaredNames.includes(funcName));

if (orphanedHandlers.length > 0) {
  console.log("\n[Tools Index] ⚠️  Orphaned handlers (no declaration):");
  orphanedHandlers.forEach((funcName) => console.log(`  ${funcName}`));
}

// Export for debugging
export { handlerRegistry };

// Default export
const defaultExport = {
  tools,
  handleFunctionCalls,
  getToolsInfo,
  hasFunction,
  handlerRegistry,
};

export default defaultExport;
