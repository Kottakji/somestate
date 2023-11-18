import {store} from "../store/index.js";

export function computed(dependency, closure) {
  const result = store(closure(dependency.get()))

  dependency.listen((value) => result.set(value))

  return result;
}