# Somestate

Intuitive and simple platform agnostic state management. Designed to separate logic from the UI.

## Install

```bash
npm install somestate
```

## Packages

React -  https://github.com/Kottakji/somestate-react

## Guide

### store

Store any variable in the store, so you can listen to changes.

`Note: Listeners will never be triggered when the old value and new value are equal`

```js
import { store } from 'somestate'

export const $items = store([])

export function addItem(item) {
    $items.set([...$items.get(), item])
}
```

### computed

Create a store based on another store.

```js
import { store, computed } from 'somestate'

export const $items = store([1,2,3])

export const $even = computed($items, items => items.filter(item => item % 2 === 0))

// Or multiple dependencies
export const $other = computed([$items, $even], [items, even] => {
    // Do something
})
```

### fetched

Initiate the store from a fetch request.

Notes:
- The default value will be `{}`. This allows for destructuring within the closure.
- A computed value based on a fetched store will only be called when the fetched store has a value.

```js
import { computed, fetched } from 'somestate'

export const $todos = fetched(`https://jsonplaceholder.typicode.com/todos`)

// Handle any errors
$todos.catch(error => console.log(error.status, error.body))

// The default value will be `{}`. This allows for destructuring
export const $completed = computed($todos, ({completed}) => !!completed)

```

### persistent

Same as the store, but gets the value from localstorage.

```js
import { persistent } from 'somestate'

// Without a default value (will be undefined by default)
export const $store = persistent('mylocalstoragekey')

// With a default value, if there is something in localstorage, it will use that value
export const $withDefaultValue = persistent('mylocalstoragekey', 1)
```

### listen

Listen to changes on any type of store.

```js
import { computed, fetched } from 'somestate'

export const $todos = fetched(`https://jsonplaceholder.typicode.com/todos`)

$todos.listen((todos) => {
    console.log(todos)
})
```

### Key changes

Only listen to key changes on a store.

```js
import { computed, fetched } from 'somestate'

export const $todo = fetched(`https://jsonplaceholder.typicode.com/todos/1`)

// Only update when $item.completed has changed
export const $isCompleted = computed($todo, todo => !!todo?.completed, ['completed'])

// Only listen when $item.completed has changed
$item.listen((item) => {
    console.log(item)
}, ['completed'])
```

## Methods

### State methods

```js
import { store } from 'somestate'

export const $id = store();

// Get the latest data
$id.get()

// Set new data, triggering the listeners
$id.set()
```


### Fetched methods

```js
import { fetched } from 'somestate'

export const $todos = fetched(`https://jsonplaceholder.typicode.com/todos`)

// Corresponding to the HTTP request methods
// Will update the data and trigger the listeners
$todos.fetch()
$todos.patch(todos)
$todos.put(todos)
$todos.post(todos)
$todos.delete()

// Handle API request errors (on !response.ok)
$todos.catch(error => console.log(error.status, error.body))
```

## Options

### Fetched options

```js
import { computed, fetched } from 'somestate'

export const $todos = fetched(`https://jsonplaceholder.typicode.com/todos`,
    // Fetched options
    {
        headers: {},
    },
    // Additional settings
    {
        // Custom api methods (can be used to set a custom url)
        fetcher: (url, options) => getFetcher(url, 'GET', null, options),
        patcher: (url, body, options) => getFetcher(url, 'PATCH', body, options),
        putter: (url, body, options) => getFetcher(url, 'PUT', body, options),
        poster: (url, body, options) => getFetcher(url, 'POST', body, options),
        deleter: (url, options) => getFetcher(url, 'DELETE', null, options),

        // Custom fetcher methods can also use a single url to only change the url, but keep the fetcher the same
        // patcher: `https://example.com/items`
        // putter: `https://example.com/items`
        // poster: `https://example.com/items`
        // deleter: `https://example.com/items`

        // Catch any api request errors
        catcher: (error) => {},

        // Refetch interval
        refetchInterval: 0,

        // Dependencies - only fetch when the dependencies are not null/undefined/false
        dependencies: [someVariable, $someStore]
    }
)

export const $completed = computed($todos, todos => todos.filter(todo => todo?.completed))
```

## Best practices

### Webpack

You can auto load any or all of the store files, so that the stores will be initiated by default.
This allows you to separate logic and UI, by not having to import certain code within your UI files.

https://webpack.js.org/concepts/entry-points/

webpack.config.js
```js
const glob = require('glob');

module.exports = {
    //...
    entry: {
        index: [...glob.sync('./src/stores/*.js'), ...['./src/index.js']]
    },
}
```

### Dependency chains

You can then create dependency chains using computed, which will automatically be triggered when a depend store changes.

```js
import { computed } from 'somestate'
import {$flag} from "./flagStore.js"

computed($flag, flag => {
    if (flag) {
        // Do some logic
        // Note that listeners will never be triggered when the old value and new value are equal`
    }
})

```