import { BaseApiClient } from "./BaseApiClient.js";

export class UserApiClient extends BaseApiClient {
  constructor(config = {}) {
    super(config);
    this.resourceName = "users";
  }

  /**
   * Check if LINE user exists in system
   * @param {string} lineUserId
   * @returns {Promise<object>}
   */
  async checkLineExist(userId, platform) {
    if (!platform) {
      return {
        success: false,
        exists: false,
        error: "not define platform",
        code: "CHECK_USER_ERROR",
      };
    }

    try {
      console.log(`[UserApiClient] Checking LINE user: ${userId}`);

      let result;
      if (platform === "line") {
        result = await this.get(
          `${this.resourceName}/line-connect/by-line-id/${userId}`
        );
      } else {
        result = await this.get(`${this.resourceName}/exist/${userId}`);
      }

      if (result.success) {
        return {
          ...result,
          exists: true,
          user: result.data,
        };
      }

      return {
        ...result,
        exists: false,
      };
    } catch (error) {
      console.error("[UserApiClient] Error checking LINE user:", error);
      return {
        success: false,
        exists: false,
        error: error.message,
        code: "CHECK_LINE_USER_ERROR",
      };
    }
  }

  /**
   * Get user by ID
   * @param {string|number} userId
   * @returns {Promise<object>}
   */
  async getById(userId) {
    return this.get(`${this.resourceName}/${userId}`);
  }

  /**
   * Get user profile
   * @returns {Promise<object>}
   */
  async getProfile() {
    return this.get(`${this.resourceName}/profile`);
  }

  /**
   * Link LINE account to user
   * @param {string|number} userId
   * @param {string} lineUserId
   * @returns {Promise<object>}
   */
  async linkLineAccount(userId, lineUserId) {
    return this.post(`${this.resourceName}/line-connect/link`, {
      userId,
      lineUserId,
    });
  }

  /**
   * Unlink LINE account
   * @param {string} lineUserId
   * @returns {Promise<object>}
   */
  async unlinkLineAccount(lineUserId) {
    return this.delete(`${this.resourceName}/by-line-id/${lineUserId}/unlink`);
  }

  /**
   * Update user information
   * @param {string|number} userId
   * @param {object} userData
   * @returns {Promise<object>}
   */
  async update(userId, userData) {
    return this.put(`${this.resourceName}/${userId}`, userData);
  }

  /**
   * Search users
   * @param {object} criteria
   * @returns {Promise<object>}
   */
  async search(criteria = {}) {
    return this.get(`${this.resourceName}/search`, criteria);
  }
}
