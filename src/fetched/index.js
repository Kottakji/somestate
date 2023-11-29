import {Store} from "../store/index.js";

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
  const response = await fetch(url, {...getOptions(method, body), ...options})
  const data = await response.json()

  if (!response.ok) {
    return new Error(response.status, data)
  }

  return data;
}

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
    headers: {'Content-type': 'application/json'},
  }, ...(body ? {body: JSON.stringify(body)} : null)
})

/**
 * Callback for adding two numbers.
 *
 * @callback Catcher
 * @param {Error} error
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
 * @property {number|null} [refetchInterval] - Time interval for automatic data refetching.
 * @property {Array<Store, *>} [dependencies=[]] dependencies - Truthy values.
 *
 * @type {Settings}
 */
const defaultSettings = {
  fetcher: (url, options) => getFetcher(url, 'GET', null, options),
  patcher: (url, body, options) => getFetcher(url, 'PATCH', body, options),
  putter: (url, body, options) => getFetcher(url, 'PUT', body, options),
  poster: (url, body, options) => getFetcher(url, 'POST', body, options),
  deleter: (url, body, options) => getFetcher(url, 'DELETE', null, options),
  catcher: (error) => () => void ({error}),
  refetchInterval: null,
  dependencies: [],
};

/**
 * Creates a Store class and fetches data from the specified URL.
 *
 * @param {string} url - The URL to fetch data from.
 * @param {object} [options={}] - The fetch options to be passed to the fetcher function.
 * @param {Settings} [settings={}] - The settings object containing the fetcher and other helper methods.
 * @returns {Fetcher} - A Store instance containing the fetched data.
 */
export function fetched(url, options = {}, settings = {}) {
  return new Fetcher(url, options, settings);
}

class Fetcher extends Store {
  /**
   * @param {string} url - The URL to fetch data from.
   * @param {object} options - Optional fetch options.
   * @param {Settings} settings - Optional settings for the constructor.
   */
  constructor(url, options = {}, settings = {}) {
    super(undefined)
    this.url = url;
    this.options = options;
    this.catchers = []

    // Keep all default settings, but merge the new ones
    /**
     * @type {Settings}
     */
    this.settings = {...defaultSettings, ...settings};

    // Instantly call fetcher to set data
    this.fetch(options)

    // Should we refetch at x interval?
    if (settings?.refetchInterval) {
      setInterval(
        () => this.fetch(options),
        settings.refetchInterval,
      );
    }
  }

  /**
   * @param {object} options
   */
  fetch(options) {
    this.hasTruthyDependencies() && this.settings.fetcher(this.url, options).then(result => result instanceof Error ? this.catchers.map(catcher => catcher(result)) : this.set(result))
  }

  /**
   * @param {object} body
   * @param {object} [options={}]
   */
  post(body, options = {}) {
    this.settings.poster(this.url, body, options).then(result => this.set(result));
  }

  /**
   * @param {object} body
   * @param {object} [options={}]
   */
  patch(body, options = {}) {
    this.settings.patcher(this.url, body, options).then(result => this.set(result));
  }

  /**
   * @param {object} body
   * @param {object} [options={}]
   */
  put(body, options = {}) {
    this.settings.putter(this.url, body, options).then(result => this.set(result));
  }

  /**
   * @param {object} [options={}]
   */
  delete(options = {}) {
    this.settings.deleter(this.url, options).then(result => this.set(result));
  }

  /**
   * @param {Catcher} closure
   */
  catch(closure) {
    this.catchers.push(closure)
  }

  /**
   * Are all dependencies truthy values?
   *
   * @returns {boolean}
   */
  hasTruthyDependencies() {
    return this.settings.dependencies.every(dependency => !!(dependency instanceof Store ? dependency.get() : dependency));
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


