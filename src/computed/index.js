import {Store, store} from "../store/index.js";

export function computed(dependencies, closure) {
  // Do we have a single dependency?
  const single = !(typeof dependencies.every === "function" && dependencies.every(dependency => dependency instanceof Store))

  // Initialize the store with the default value
  const result = store(closure(single ?  dependencies.get() : dependencies.map(dependency => dependency.get())))

  // Listen to the dependencies
  single ? dependencies.listen(value => result.set(value)) : dependencies.map(dependency => dependency.listen((value) => result.set(value)))

  return result;
}