import { BaseApiClient } from "./BaseApiClient.js";

export class CarsApiClient extends BaseApiClient {
  constructor(config = {}) {
    super(config);
    this.resourceName = "cars";
  }

  /**
   * Get car reference data (models, branches, types)
   * @param {object} options
   * @returns {Promise<object>}
   */
  async getReferenceData(options = {}) {
    const params = new URLSearchParams();

    if (options.include) {
      params.append(
        "include",
        Array.isArray(options.include)
          ? options.include.join(",")
          : options.include
      );
    }

    if (options.format) {
      params.append("format", options.format);
    }

    const endpoint = params.toString()
      ? `${this.resourceName}/reference?${params.toString()}`
      : `${this.resourceName}/reference`;

    try {
      const result = await this.get(endpoint);

      if (result.success) {
        return {
          ...result,
          carModels: result.data.carModels || [],
          branches: result.data.branches || [],
          carTypes: result.data.carTypes || [],
        };
      }

      return result;
    } catch (error) {
      console.error("[CarsApiClient] Error fetching reference data:", error);
      return {
        success: false,
        error: error.message,
        carModels: [],
        branches: [],
        carTypes: [],
      };
    }
  }

  /**
   * Search cars
   * @param {object} searchParams
   * @returns {Promise<object>}
   */
  async search(searchParams) {
    return this.post(`${this.resourceName}/search`, searchParams);
  }

  /**
   * Get car by ID
   * @param {string|number} carId
   * @returns {Promise<object>}
   */
  async getById(carId) {
    return this.get(`${this.resourceName}/${carId}`);
  }
}
