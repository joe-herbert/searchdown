let count = 0;
document.addEventListener("DOMContentLoaded", () => {
    const valueList = ["France", "England", "Spain", "Wales", "Ireland", "Germany", "Portugal", "Italy"];
    Searchdown.searchdown("basic", {
        values: valueList,
        sort: undefined, //undefined, "ASC", "DESC"
        limit: 0, //0 means no limit and is default
        multiple: false,
        required: 1,
        addValues: false,
        caseSensitive: true,
        placeholder: "Search",
        inputName: "basic",
        onChange: (element, value) => {
            console.log(count++, " onChange ", element.id, value)
        }
    });
    Searchdown.searchdown("multiple", {
        values: ["France", "England", "Spain", "Wales", "Ireland", "Germany", "Portugal", "Italy"],
        sort: "ASC", //undefined, "ASC", "DESC"
        limit: 0, //0 means no limit and is default
        multiple: true,
        addValues: false,
        caseSensitive: true,
        placeholder: "Enter a country", //default is "Search"
        inputName: "multiple",
    });
    Searchdown.searchdown("addValue", {
        values: ["France", "England", "Spain", "Wales", "Ireland", "Germany", "Portugal", "Italy"],
        sort: "DESC", //undefined, "ASC", "DESC"
        limit: 0, //0 means no limit and is default
        multiple: false,
        addValues: true,
        caseSensitive: false,
        placeholder: "Search",
        inputName: "addValue",
    });
    Searchdown.searchdown("multiple-addValue", {
        values: valueList,
        sort: undefined, //undefined, "ASC", "DESC"
        limit: 0, //0 means no limit and is default
        enteredLimit: 4,
        multiple: true,
        addValues: true,
        caseSensitive: true,
        placeholder: "Search",
        saveEntered: false,
        inputName: "multipleAddValue",
    });
});

function formSubmit(form) {
    document.getElementById("formResult").innerHTML =
        "Basic: " +
        Searchdown.getValue(form.basic) +
        "<br>Multiple: " +
        Searchdown.getValue(form.multiple) +
        "<br>Add Value: " +
        Searchdown.getValue(form.addValue, false) +
        "<br>Multiple Add Value: " +
        Searchdown.getValue(form.multipleAddValue, false);
}
