import {Store, store} from "../store/index.js";

export function fetched(url, options = {}, fetcher = (url, options) => fetch(url, options).then(response => response.json())) {
  const store = new Store(undefined);

  fetcher(url, options).then(result => store.set(result))

  return store;
}
