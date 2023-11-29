import {Store, store} from "../store/index.js";

const getFetcher = (url, method, body, options) => fetch(url, {...getOptions(method, body), ...options}).then((response) => response.json());

const getOptions = (method, body) => ({
  ...{
    method: method,
    headers: {'Content-type': 'application/json'},
  }, ...(body ? {body: JSON.stringify(body)} : null)
})

const defaultSettings = {
  fetcher: (url, options) => getFetcher(url, 'GET', null, options),
  patcher: (url, body, options) => getFetcher(url, 'PATCH', body, options),
  putter: (url, body, options) => getFetcher(url, 'PUT', body, options),
  poster: (url, body, options) => getFetcher(url, 'POST', body, options),
  deleter: (url, body, options) => getFetcher(url, 'DELETE', null, options),
  refetchInterval: null,
};

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
