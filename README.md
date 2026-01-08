<img src="logo.png" width="300px" alt="Logo"/>

# Searchdown

A searchable dropdown/select component with tagging and multi-select support.

## Demo

[Here's a demo](https://molly-ollys.github.io/searchdown/example/example.html)

## Installation

```bash
npm install searchdown
```

## Usage

### ES6 Modules (Recommended)

```javascript
import searchdown, {getValue, setValue, validate} from 'dist/searchdown';
import 'searchdown/styles'; // Import CSS

// Initialize on an element
searchdown('#my-dropdown', {
    values: ['Apple', 'Banana', 'Cherry', 'Date'],
    placeholder: 'Select a fruit...',
    multiple: true
});

// Get selected values
const selected = getValue('#my-dropdown');

// Set values programmatically
setValue('#my-dropdown', ['Apple', 'Cherry']);
```

### CommonJS

```javascript
const {searchdown, getValue, setValue} = require('dist/searchdown');
```

### Browser (UMD)

```html
<script src="https://unpkg.com/searchdown/dist/searchdown.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/searchdown/dist/searchdown.css">

<script>
    Searchdown.searchdown('#my-dropdown', { values: ['A', 'B', 'C'] });
</script>
```

## Options

| Option            | Type                   | Default     | Description                                                                                                                    |
|-------------------|------------------------|-------------|--------------------------------------------------------------------------------------------------------------------------------|
| `values`          | `string[]` or `object` | `[]`        | Available options to select from                                                                                               |
| `sort`            | `'ASC'` \| `'DESC'`    | `undefined` | Sort order for dropdown options                                                                                                |
| `limit`           | `number`               | `0`         | Max options to show (0 = unlimited)                                                                                            |
| `enteredLimit`    | `number`               | `0`         | Max selections allowed (0 = unlimited)                                                                                         |
| `multiple`        | `boolean`              | `false`     | Allow multiple selections                                                                                                      |
| `addValues`       | `boolean`              | `false`     | Allow adding custom values                                                                                                     |
| `saveEntered`     | `boolean`              | `false`     | Save custom values to options list                                                                                             |
| `hideEntered`     | `boolean`              | `false`     | Hide already-selected options                                                                                                  |
| `allowDuplicates` | `boolean`              | `false`     | Allow duplicate selections                                                                                                     |
| `caseSensitive`   | `boolean`              | `false`     | Case-sensitive search                                                                                                          |
| `placeholder`     | `string`               | `'Search'`  | Input placeholder text                                                                                                         |
| `required`        | `number` \| `boolean`  | `0`         | Minimum required selections                                                                                                    |
| `maxHeight`       | `number`               | `600`       | Max dropdown height in pixels                                                                                                  |
| `inputName`       | `string`               | auto        | Form input name attribute                                                                                                      |
| `initialValues`   | `string[]`             | `[]`        | Pre-selected values                                                                                                            |
| `simpleInput`     | `boolean`              | `false`     | Single input mode (no tags)                                                                                                    |
| `textarea`        | `boolean`              | `false`     | Use textarea instead of input                                                                                                  |
| `onChange`        | `function`             | `null`      | Provide a function which is called whenever the selected options are changed. Takes two arguments: (element, value) => { ... } |

### Color Options

| Option              | Description              |
|---------------------|--------------------------|
| `baseBackColor`     | Background color         |
| `selectedBackColor` | Selected item background |
| `hoverBackColor`    | Hover background         |
| `baseTextColor`     | Text color               |
| `selectedTextColor` | Selected item text color |
| `hoverTextColor`    | Hover text color         |

## API

### `searchdown(element, options)`

Initialize a searchdown instance.

### `getValue(element, includeNotEntered?)`

Get the selected value(s). Returns a string for single-select or array for multi-select.

### `setValue(element, values)`

Set the selected value(s) programmatically.

### `validate(element)`

Validate the element and return validity status.

### `reportValidity(element)`

Validate and show browser validation UI.

### `autoCreate()`

Auto-initialize all elements with `class="searchdown"` and `data-sd_*` attributes.

### `enableAutoCreate()`

Enable automatic initialization on DOMContentLoaded.

### `setMessageHandler(handler)`

Set a custom message handler for all searchdown instances. By default, messages are shown using `alert()`.

```javascript
import { setMessageHandler } from 'dist/searchdown';

// Use with Toastify
setMessageHandler((text, type) => {
  Toastify({ 
    text, 
    type,  // "success" or "error"
    duration: 5000,
    gravity: "top",
    position: "center"
  }).showToast();
});

// Use with a custom notification system
setMessageHandler((text, type) => {
  myNotificationSystem.show(text, { type: type });
});

// Reset to default (alert)
setMessageHandler(null);
```

**Parameters:**
- `handler` - A function that receives `(text, type)` where `type` is either `"success"` or `"error"`. Pass `null` to reset to the default `alert()` behavior.

## Auto-Creation via Data Attributes

```html

<div class="searchdown"
     data-sd_values='["Option 1", "Option 2", "Option 3"]'
     data-sd_multiple="true"
     data-sd_placeholder="Choose options...">
</div>

<script type="module">
    import {enableAutoCreate} from 'dist/searchdown';

    enableAutoCreate();
</script>
```

## License

MIT

## Development

1. Clone the repo
2. `npm install`
3. `npm run dev`
4. Open `test/test.html` in your browser
