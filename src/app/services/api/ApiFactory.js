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

// Export singleton instance
export const apiFactory = new ApiFactory();
