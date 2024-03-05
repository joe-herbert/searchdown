# searchdown

A lightweight JS library to provide a searchable dropdown input field.

[Here's a demo](https://joe-herbert.github.io/searchdown/example.html)

## Usage

Download `searchdown.js` and `searchdown.css`.  
Add the CSS in the page `head`.

    <link rel="stylesheet" href="<path-to>searchdown.css">

Add the JS to the bottom of the page `body`.

    <script src="<path-to>searchdown.js"></script>

Call `searchdown(id, options);` (must be done after including the js file), e.g.

    document.addEventListener("DOMContentLoaded", () => {
        searchdown("my-dropdown", {
            values: ["France", "England", "Spain", "Wales", "Ireland", "Germany", "Portugal", "Italy"],
            sort: "ASC",
            multiple: true,
            caseSensitive: true,
            placeholder: "Choose your item",
            inputName: "myDropdown",
        });
    });

You can access the element's value like you would with any input element, or use the function `sdGetValue(element, includeNotEntered)` to easily retrieve the value for both single and multiple inputs. `element` can be either the HTML element or the id of the element. Check the [demo](https://joe-herbert.github.io/searchdown/example.html) for an example of this being used.

## Options

The default options are:

    {
        values: [],
        sort: undefined, //undefined, "ASC", "DESC"
        limit: 0, //0 means no limit
        multiple: false,
        addValues: true,
        saveEntered: true,
        hideEntered: true,
        allowDuplicates: false,
        caseSensitive: false,
        placeholder: "Search",
        maxHeight: 600,
        inputName: "sd<incrementing-value>",
        initialValues: [],
        simpleInput: false,
        baseBackColor: "#b1d3f7",
        selectedBackColor: "#90a0c3",
        hoverBackColor: "#8ab7d9",
        baseTextColor: "#000",
        selectedTextColor: "#000",
        hoverTextColor: "#000",
    }

## Styling

The layout of a searchdown field is shown below. You can use the classes to style elements through your own custom CSS.

    div.searchdown
        div.sdInputWrapper
            div.sdEnteredWrapper
                span.sdEntered
            input.sdInput
        div.sdDropdownWrapper
            ul.sdDropdown
                li.sdOption
                li.sdAddOption //only if addValues is true
