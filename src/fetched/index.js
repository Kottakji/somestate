import {Store, store} from "../store/index.js";

const defaultSettings = {
  fetcher: (url, options) => fetch(url, options).then(response => response.json()),
  refetchInterval: null,
}

export function fetched(url, options = {}, settings = defaultSettings) {
  const store = new Store(undefined);

  // Keep all default settings, but merge the new ones
  settings = {...defaultSettings, ...settings}

  // Fetch the data on init
  settings.fetcher(url, options).then(result => store.set(result));

  // Should we refetch at x interval?
  console.log(settings?.refetchInterval)
  if (settings?.refetchInterval) {
    setInterval(() => settings.fetcher(url, options).then(result => store.set(result)), settings.refetchInterval);
  }

  return store;
}
