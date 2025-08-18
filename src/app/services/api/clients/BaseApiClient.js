export class BaseApiClient {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || process.env.NEXT_PUBLIC_BASE_URL;
    this.apiVersion =
      config.apiVersion || process.env.NEXT_PUBLIC_API_VERSION || "v1";
    this.timeout = config.timeout || 10000;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers,
    };
  }

  /**
   * Build full API URL
   * @param {string} endpoint
   * @returns {string}
   */
  buildUrl(endpoint) {
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.slice(1)
      : endpoint;
    return `${this.baseUrl}/api/${this.apiVersion}/${cleanEndpoint}`;
  }

  /**
   * Make HTTP request with error handling
   * @param {string} endpoint
   * @param {object} options
   * @returns {Promise<object>}
   */
  async request(endpoint, options = {}) {
    const url = this.buildUrl(endpoint);
    const config = {
      timeout: this.timeout,
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      console.log(
        `[${this.constructor.name}] ${config.method || "GET"} ${url}`
      );

      const response = await fetch(url, config);
      const result = await response.json();

      return this.handleResponse(response, result, endpoint);
    } catch (error) {
      console.error(`[${this.constructor.name}] Request failed:`, error);
      return this.handleError(error, endpoint);
    }
  }

  /**
   * Handle API response
   * @param {Response} response
   * @param {object} result
   * @param {string} endpoint
   * @returns {object}
   */
  handleResponse(response, result, endpoint) {
    const responseData = {
      success: response.ok && result.success,
      data: result.data || result.user || result,
      error: result.error,
      code: result.code,
      status: response.status,
      endpoint,
      timestamp: new Date().toISOString(),
    };

    if (!responseData.success) {
      console.warn(`[${this.constructor.name}] Request failed:`, responseData);
    }

    return responseData;
  }

  /**
   * Handle request errors
   * @param {Error} error
   * @param {string} endpoint
   * @returns {object}
   */
  handleError(error, endpoint) {
    return {
      success: false,
      error: error.message || "Network error",
      code: "NETWORK_ERROR",
      status: 0,
      endpoint,
      timestamp: new Date().toISOString(),
    };
  }

  // Convenience methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: "GET" });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}
