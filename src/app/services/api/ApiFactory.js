import { CarsApiClient } from "./clients/CarApiClient.js";
import { UserApiClient } from "./clients/UserApiClient.js";
import { AppointmentApiClient } from "./clients/AppointmentApiClient.js"; // ✅ Add import

export class ApiFactory {
  constructor(config = {}) {
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      apiVersion: process.env.NEXT_PUBLIC_API_VERSION || "v1",
      timeout: 10000,
      ...config,
    };

    // Initialize clients
    this._userClient = null;
    this._carsClient = null;
    this._appointmentClient = null; // ✅ Add appointment client
  }

  /**
   * Get User API client (singleton)
   * @returns {UserApiClient}
   */
  get users() {
    if (!this._userClient) {
      this._userClient = new UserApiClient(this.config);
    }
    return this._userClient;
  }

  /**
   * Get Cars API client (singleton)
   * @returns {CarsApiClient}
   */
  get cars() {
    if (!this._carsClient) {
      this._carsClient = new CarsApiClient(this.config);
    }
    return this._carsClient;
  }

  /**
   * Get Appointment API client (singleton)
   * @returns {AppointmentApiClient}
   */
  get appointments() {
    if (!this._appointmentClient) {
      this._appointmentClient = new AppointmentApiClient(this.config);
    }
    return this._appointmentClient;
  }

  /**
   * Create custom client
   * @param {string} resourceName
   * @param {object} customConfig
   * @returns {BaseApiClient}
   */
  createCustomClient(resourceName, customConfig = {}) {
    const { BaseApiClient } = require("./clients/BaseApiClient.js");

    class CustomClient extends BaseApiClient {
      constructor(config) {
        super(config);
        this.resourceName = resourceName;
      }
    }

    return new CustomClient({ ...this.config, ...customConfig });
  }

  /**
   * Update global configuration
   * @param {object} newConfig
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };

    // Reset clients to pick up new config
    this._userClient = null;
    this._carsClient = null;
    this._appointmentClient = null; // ✅ Reset appointment client
  }
}

// Add to your existing cars service
const carsService = {
  // ... existing methods ...

  // ✅ New method for getting all cars
  async getAll(params = {}) {
    try {
      const {
        page = 1,
        limit = 12,
        sort = "created_at",
        order = "desc",
        ...filters
      } = params;

      // Build query string
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
        order,
        ...filters,
      });

      console.log(`[CarsService] Fetching all cars with params:`, params);

      const response = await ckc2carClient.get(`/cars?${queryParams}`);

      if (!response.data) {
        throw new Error("No data received from cars API");
      }

      return {
        success: true,
        data: response.data.data || [],
        pagination: response.data.pagination || {
          page,
          limit,
          totalCount: 0,
          totalPages: 0,
        },
      };
    } catch (error) {
      console.error("[CarsService] Error fetching all cars:", error);

      return {
        success: false,
        error: error.message || "Failed to fetch cars",
        data: [],
        pagination: {
          page: 1,
          limit: 12,
          totalCount: 0,
          totalPages: 0,
        },
      };
    }
  },

  // ... rest of your existing methods
};

// Export singleton instance
export const apiFactory = new ApiFactory();
