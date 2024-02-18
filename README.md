# searchdown
A lightweight JS library to provide a searchable dropdown input field.

## Usage
Download `searchdown.js` and `searchdown.css`.  
Add the CSS in the page `head`.

    <link rel="stylesheet" href="<path-to>searchdown.css">
Add the JS to the bottom of the page `body`.

    <script src="<path-to>searchdown.js"></script>
Call `searchdown(id, options);`, e.g.

    document.addEventListener("DOMContentLoaded", () => {
        searchdown("my-dropdown", {
            values: ["France", "England", "Spain", "Wales", "Ireland", "Germany", "Portugal", "Italy"],
            sort: undefined, //undefined, "ASC", "DESC"
            limit: 0, //0 means no limit and is default
            multiple: true,
            caseSensitive: true,
            placeholder: "Choose your item",
            inputName: "myDropdown",
        });
    });


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
        caseSensitive: false,
        placeholder: "Search",
        maxHeight: 600,
        inputName: "sd<incrementing-value>",
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
            div.sdDropdown
