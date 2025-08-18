// Export all AI modules for easy imports

// Core
export * from "./core";

// Adapters
export { processWebRequest } from "./adapters/web";
export { processReactNativeRequest } from "./adapters/react-native";
export { processLineRequest } from "./adapters/line";

// Helper function to get appropriate processor by platform
export function getProcessorForPlatform(platform = "web") {
  switch (platform) {
    case "react-native":
      return require("./adapters/react-native").processReactNativeRequest;
    case "line":
      return require("./adapters/line").processLineRequest;
    case "web":
    default:
      return require("./adapters/web").processWebRequest;
  }
}
