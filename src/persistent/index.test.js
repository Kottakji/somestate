/**
 * @jest-environment jsdom
 */
import { describe, expect, test, it, jest, afterEach } from "@jest/globals";
import { persistent } from "./index.js";

jest.useFakeTimers();
jest.spyOn(global, "setInterval");

afterEach(() => {
  // Clear localstorage
  window.localStorage.clear();

  jest.clearAllMocks();
});

describe("Persistent", () => {
  test("We can create a persistent store", () => {
    const $persistent = persistent(`mykey`);

    expect($persistent.get()).toEqual(undefined);

    $persistent.set(2);

    expect($persistent.get()).toEqual(2);
    expect(JSON.parse(window.localStorage.getItem("mykey"))).toEqual(2);
  });

  test("We can create a persistent store, with a default value", () => {
    const $persistent = persistent(`mykey`, 1);

    expect($persistent.get()).toEqual(1);

    $persistent.set(2);

    expect($persistent.get()).toEqual(2);
    expect(JSON.parse(window.localStorage.getItem("mykey"))).toEqual(2);
  });

  test("We can create a persistent store, with a default value from the localstorage", () => {
    window.localStorage.setItem("mykey", 3);
    const $persistent = persistent(`mykey`);

    expect($persistent.get()).toEqual(3);
  });
});
