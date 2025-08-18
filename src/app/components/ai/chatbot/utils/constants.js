export const CONSTANTS = {
  COLORS: {
    // ✅ Convert to Tailwind color classes
    PRIMARY: "success-500", // Green theme for cars
    PRIMARY_HOVER: "success-600",
    PRIMARY_LIGHT: "success-100",
    PRIMARY_DARK: "success-700",

    SECONDARY: "primary-500", // Blue theme
    SECONDARY_HOVER: "primary-600",

    SUCCESS: "success-500",
    SUCCESS_HOVER: "success-600",

    ERROR: "danger-500",
    ERROR_HOVER: "danger-600",
    ERROR_LIGHT: "danger-100",

    WARNING: "warning-500",
    WARNING_HOVER: "warning-600",
    WARNING_LIGHT: "warning-100",

    INFO: "info-500",
    INFO_HOVER: "info-600",
    INFO_LIGHT: "info-100",

    // Dark theme colors for chat interface
    BACKGROUND: "main-900",
    SURFACE: "main-800",
    SURFACE_LIGHT: "main-700",

    TEXT_PRIMARY: "main-100",
    TEXT_SECONDARY: "main-200",
    TEXT_MUTED: "main-400",

    BORDER: "main-700",
    BORDER_LIGHT: "main-600",
  },

  // ✅ Add CSS classes helper
  CSS_CLASSES: {
    // Background classes
    BG_PRIMARY: "bg-success-500",
    BG_PRIMARY_HOVER: "hover:bg-success-600",
    BG_SECONDARY: "bg-primary-500",
    BG_SECONDARY_HOVER: "hover:bg-primary-600",
    BG_ERROR: "bg-danger-500",
    BG_WARNING: "bg-warning-500",
    BG_SUCCESS: "bg-success-500",
    BG_INFO: "bg-info-500",

    // Text classes
    TEXT_PRIMARY: "text-main-200",
    TEXT_SECONDARY: "text-primary-500",
    TEXT_ERROR: "text-danger-500",
    TEXT_WARNING: "text-warning-500",
    TEXT_SUCCESS: "text-success-500",
    TEXT_INFO: "text-info-500",
    TEXT_WHITE: "text-white",
    TEXT_MUTED: "text-main-400",

    // Border classes
    BORDER_PRIMARY: "border-main-700",
    BORDER_SECONDARY: "border-primary-500",
    BORDER_ERROR: "border-danger-500",
    BORDER_WARNING: "border-warning-500",
    BORDER_SUCCESS: "border-main-800",
    BORDER_INFO: "border-info-500",

    // Chat specific classes
    CHAT_BACKGROUND: "bg-main-800",
    CHAT_SURFACE: "bg-main-800",
    CHAT_INPUT: "bg-main-700 border-main-600 text-main-100",
    CHAT_MESSAGE_USER: "bg-success-500 text-white",
    CHAT_MESSAGE_ASSISTANT: "bg-main-700  text-main-200",
    CHAT_MESSAGE_ERROR: "bg-danger-100 border-danger-200 text-danger-800",
    CHAT_MESSAGE_FUNCTION: "bg-main-700 border-main-700 text-main-200",
    CHAT_MESSAGE_QUERY: "bg-primary-50 border-primary-200 text-primary-800",
  },

  BREAKPOINTS: {
    MOBILE: 768,
  },

  DEFAULTS: {
    AI_CONFIG: {
      temperature: 0.7,
      maxTokens: 1000,
      enableHistory: true,
      smartCaching: true,
      platform: "web",
    },
    MESSAGE_LIMITS: {
      maxLength: 2000,
      maxLines: 10,
    },
  },

  URL_PATTERNS: {
    CAR_DETAIL: /\/car\/show-[a-zA-Z0-9\-]+-sku-(\d+)/g,
  },
};

// ✅ Helper function to get Tailwind classes
export const getTailwindClass = (colorKey, type = "bg") => {
  const colorMap = {
    bg: "bg-",
    text: "text-",
    border: "border-",
    ring: "ring-",
  };

  return `${colorMap[type]}${CONSTANTS.COLORS[colorKey]}`;
};

// ✅ Button variant helper
export const getButtonClasses = (variant = "primary", size = "sm") => {
  const baseClasses =
    "inline-flex items-center font-semibold rounded-full transition-all duration-200 shadow-sm hover:shadow-md";

  const variantClasses = {
    primary: `${CONSTANTS.CSS_CLASSES.BG_PRIMARY} ${CONSTANTS.CSS_CLASSES.BG_PRIMARY_HOVER} ${CONSTANTS.CSS_CLASSES.TEXT_WHITE}`,
    secondary: `${CONSTANTS.CSS_CLASSES.BG_SECONDARY} ${CONSTANTS.CSS_CLASSES.BG_SECONDARY_HOVER} ${CONSTANTS.CSS_CLASSES.TEXT_WHITE}`,
    outline: `bg-white ${CONSTANTS.CSS_CLASSES.TEXT_PRIMARY} border-2 ${CONSTANTS.CSS_CLASSES.BORDER_PRIMARY} hover:${CONSTANTS.CSS_CLASSES.BG_PRIMARY} hover:text-white`,
    error: `${CONSTANTS.CSS_CLASSES.BG_ERROR} hover:bg-danger-600 text-white`,
    warning: `${CONSTANTS.CSS_CLASSES.BG_WARNING} hover:bg-warning-600 text-white`,
    success: `${CONSTANTS.CSS_CLASSES.BG_SUCCESS} hover:bg-success-600 text-white`,
  };

  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
};
