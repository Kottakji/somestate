import { Store } from "../store/index.js";

/**
 * Performs a fetch request using the provided parameters.
 *
 * @param {string} url - The URL to send the request to.
 * @param {string} method - The HTTP method for the request (e.g., 'GET', 'POST').
 * @param {Object} body - The request body, if any.
 * @param {Object} options - Additional options for the fetch request.
 * @returns {Promise} - A Promise that resolves to the parsed JSON response.
 */
export const getFetcher = async (url, method, body, options) => {
  const response = await fetch(url, {
    ...getOptions(method, body),
    ...options,
  });
  const data = await response.json();

  if (!response.ok) {
    return new Error(response.status, data);
  }

  return data;
};

/**
 * Generates options object for HTTP request.
 *
 * @param {string} method - The HTTP method.
 * @param {Object} body - The request body.
 * @returns {Object} - The options object for HTTP request.
 */
export const getOptions = (method, body) => ({
  ...{
    method: method,
    headers: { "Content-type": "application/json" },
  },
  ...(body ? { body: JSON.stringify(body) } : null),
});

/**
 * @callback Catcher
 * @param {Error} error
 */

/**
 * @callback Loader
 * @param {boolean} loading
 */

/**
 * Default settings
 *
 * @typedef {Object} Settings
 * @property {Function} [fetcher] - The function used for making GET requests.
 * @property {Function} [patcher] - The function used for making PATCH requests.
 * @property {Function} [putter] - The function used for making PUT requests.
 * @property {Function} [poster] - The function used for making POST requests.
 * @property {Function} [deleter] - The function used for making DELETE requests.
 * @property {Function} [catcher] - The function invoked on an API request error.
 * @property {number|null} [refetchInterval] - Interval in ms for automatic data refetching.
 * @property {Array<Store>|Array<*>} [dependencies=[]] dependencies - Truthy values.
 *
 * @type {Settings}
 */
const defaultSettings = {
  fetcher: (url, options) => getFetcher(url, "GET", null, options),
  patcher: (url, body, options) => getFetcher(url, "PATCH", body, options),
  putter: (url, body, options) => getFetcher(url, "PUT", body, options),
  poster: (url, body, options) => getFetcher(url, "POST", body, options),
  deleter: (url, body, options) => getFetcher(url, "DELETE", null, options),
  catcher: (error) => () => void { error },
  refetchInterval: null,
  dependencies: [],
};

/**
 * Creates a Store class and fetches data from the specified URL.
 *
 * @param {string} url - The URL to fetch data from.
 * @param {object|closure} [options={}] - The fetch options to be passed to the fetcher function, or a closure returning the options.
 * @param {Settings} [settings={}] - The settings object containing the fetcher and other helper methods.
 * @returns {Fetched} - A Store instance containing the fetched data.
 */
export function fetched(url, options = {}, settings = {}) {
  return new Fetched(url, options, settings);
}

export class Fetched extends Store {
  /**
   * @param {string} url - The URL to fetch data from.
   * @param {object} options - Optional fetch options.
   * @param {Settings} settings - Optional settings for the constructor.
   */
  constructor(url, options = {}, settings = {}) {
    // Use {} as default value so we can destructure (ex: const {a} = fetched(...))
    super({});

    this.url = url;
    this.options = options;
    this.catchers = [];
    this.loaders = [];
    this.loading = true;
    this.error = null;

    /**
     * @type {Listener[]}
     */
    this.dependencyListeners = [];

    // Keep all default settings, but merge the new ones
    /**
     * @type {Settings}
     */
    this.settings = { ...defaultSettings, ...settings };

    // Instantly call fetcher to set data
    this.fetch(this.getOptions());

    // Should we refetch at x interval?
    if (settings?.refetchInterval) {
      setInterval(() => this.fetch(options), settings.refetchInterval);
    }

    // Listen to each dependency change (if it's a store)
    this.settings.dependencies.map((dependency) => {
      if (dependency instanceof Store) {
        const listener = dependency.listen(() => this.fetch(options));
        this.dependencyListeners.push(listener);
      }
    });
  }

  /**
   * @param {object} [options={}]
   */
  fetch(options = {}) {
    if (this.hasTruthyDependencies()) {
      this.setLoading(true);
      this.error = null;
      this.settings
        .fetcher(this.url, { ...this.getOptions(), ...options })
        .then((result) => {
          if (result instanceof Error) {
            this.error = result;
            this.catchers.map((catcher) => catcher(result));
            return;
          }
          this.set(result);
        })
        .finally(() => this.setLoading(false));
    }
  }

  /**
   * @param {object} body
   * @param {object} [options={}]
   */
  post(body, options = {}) {
    this.setLoading(true);
    this.error = null;
    this.settings
      .poster(this.url, body, { ...this.getOptions(), ...options })
      .then((result) => {
        if (result instanceof Error) {
          this.error = result;
          this.catchers.map((catcher) => catcher(result));
          return;
        }
        this.set(result);
      })
      .finally(() => this.setLoading(false));
  }

  /**
   * @param {object} body
   * @param {object} [options={}]
   */
  patch(body, options = {}) {
    this.setLoading(true);
    this.error = null;
    this.settings
      .patcher(this.url, body, { ...this.getOptions(), ...options })
      .then((result) => {
        if (result instanceof Error) {
          this.error = result;
          this.catchers.map((catcher) => catcher(result));
          return;
        }
        this.set(result);
      })
      .finally(() => this.setLoading(false));
  }

  /**
   * @param {object} body
   * @param {object} [options={}]
   */
  put(body, options = {}) {
    this.setLoading(true);
    this.error = null;
    this.settings
      .putter(this.url, body, { ...this.getOptions(), ...options })
      .then((result) => {
        if (result instanceof Error) {
          this.error = result;
          this.catchers.map((catcher) => catcher(result));
          return;
        }
        this.set(result);
      })
      .finally(() => this.setLoading(false));
  }

  /**
   * @param {object} [options={}]
   */
  delete(options = {}) {
    this.setLoading(true);
    this.error = null;
    this.settings
      .deleter(this.url, { ...this.getOptions(), ...options })
      .then((result) => {
        if (result instanceof Error) {
          this.error = result;
          this.catchers.map((catcher) => catcher(result));
          return;
        }
        this.set(result);
      })
      .finally(() => this.setLoading(false));
  }

  /**
   * @param {Catcher} closure
   */
  catch(closure) {
    this.catchers.push(closure);
  }

  /**
   * @param {Loader} closure
   */
  load(closure) {
    this.loaders.push(closure);
  }

  /**
   * @param {boolean} value
   */
  setLoading(value) {
    this.loading = value;
    this.loaders.map((closure) => closure(value));
  }

  /**
   * Are all dependencies truthy values?
   *
   * @returns {boolean}
   */
  hasTruthyDependencies() {
    return this.settings.dependencies.every((dependency) => {
      const value = dependency instanceof Store ? dependency.get() : dependency;
      if (Array.isArray(value)) {
        return value.length > 0;
      }

      if (typeof value === "object" && value !== null) {
        return Object.keys(value).length > 0;
      }

      return !!value;
    });
  }

  /**
   * @return {object}
   */
  getOptions() {
    if (typeof this.options === "function") {
      return this.options();
    }

    return this.options;
  }

  /**
   * Clears the dependency listeners.
   *
   * @return {void}
   */
  clear() {
    // Clear dependency listeners
    this.dependencyListeners.map((listener) => listener.unsubscribe());

    // Clear catchers
    this.catchers = [];

    // Clear loaders
    this.loaders = [];
  }
}

class Error {
  /**
   * @param {number} status - The status code.
   * @param {string} body - The response body.
   * @return {void}
   */
  constructor(status, body) {
    this.status = status;
    this.body = body;
  }
}
