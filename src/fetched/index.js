import {Store, store} from "../store/index.js";

/**
 * Performs a fetch request using the provided parameters.
 *
 * @param {string} url - The URL to send the request to.
 * @param {string} method - The HTTP method for the request (e.g., 'GET', 'POST').
 * @param {Object} body - The request body, if any.
 * @param {Object} options - Additional options for the fetch request.
 * @returns {Promise} - A Promise that resolves to the parsed JSON response.
 */
export const getFetcher = (url, method, body, options) => fetch(url, {...getOptions(method, body), ...options}).then((response) => response.json());

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
 * Default settings
 * @typedef {Object} Settings
 * @property {Function} fetcher - The function used for making GET requests.
 * @property {Function} patcher - The function used for making PATCH requests.
 * @property {Function} putter - The function used for making PUT requests.
 * @property {Function} poster - The function used for making POST requests.
 * @property {Function} deleter - The function used for making DELETE requests.
 * @property {number|null} refetchInterval - Time interval for automatic data refetching.
 *
 * @type {Settings}
 */
const defaultSettings = {
  fetcher: (url, options) => getFetcher(url, 'GET', null, options),
  patcher: (url, body, options) => getFetcher(url, 'PATCH', body, options),
  putter: (url, body, options) => getFetcher(url, 'PUT', body, options),
  poster: (url, body, options) => getFetcher(url, 'POST', body, options),
  deleter: (url, body, options) => getFetcher(url, 'DELETE', null, options),
  refetchInterval: null,
};

/**
 * Creates a Store class and fetches data from the specified URL

 * @typedef {Store} Fetcher
 * @method fetch - Fetch API request
 * @method post - Post API request
 * @method patch - Patch API request
 * @method put - Put API request
 * @method delete - Delete API request
 *
 * @param {string} url - The URL to fetch data from.
 * @param {object} [options={}] - The fetch options to be passed to the fetcher function.
 * @param {Settings} [settings=defaultSettings] - The settings object containing the fetcher and other helper methods.
 * @returns {Fetcher} - A Store instance containing the fetched data.
 */
export function fetched(url, options = {}, settings = defaultSettings) {
  const store = new Store(undefined);

  // Keep all default settings, but merge the new ones
  settings = {...defaultSettings, ...settings};

  // Fetch the data on init
  settings.fetcher(url, options).then((result) => store.set(result));

  // Should we refetch at x interval?
  if (settings?.refetchInterval) {
    setInterval(
      () => settings.fetcher(url, options).then((result) => store.set(result)),
      settings.refetchInterval,
    );
  }

  // Add the fetcher helper methods
  store.fetch = (options = {}) => settings.fetcher(url, options).then(result => store.set(result));
  store.post = (body, options = {}) => settings.poster(url, body, options).then(result => store.set(result));
  store.patch = (body, options = {}) => settings.patcher(url, body, options).then(result => store.set(result));
  store.put = (body, options = {}) => settings.putter(url, body, options).then(result => store.set(result));
  store.delete = (options = {}) => settings.deleter(url, options).then(result => store.set(result));

  return store;
}
