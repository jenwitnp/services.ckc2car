/**
 * Role-Based Access Control (RBAC) configuration.
 * This object defines the permissions for different user positions.
 * 'canViewAll': Can see all records without any employee filter.
 * 'canViewOwn': Can only see their own records.
 */
export const ROLES = {
  CEO: {
    canViewAll: true,
    canViewOwn: true,
  },
  Sales: {
    canViewAll: false,
    canViewOwn: true,
  },
  // --- Example for the future ---
  Manager: {
    canViewAll: false, // They can't see the whole company
    canViewOwn: true,
    // canViewTeam: true, // You could add logic for this later
  },
  // Default role for safety
  default: {
    canViewAll: false,
    canViewOwn: true,
  },
};

/**
 * Gets the permissions for a given user object.
 * @param {object} user - The user object from the session.
 * @returns {object} The permission set for the user's role.
 */
export function getUserPermissions(user) {
  if (!user || !user.position) {
    return ROLES.default;
  }
  return ROLES[user.position] || ROLES.default;
}
