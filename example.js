document.addEventListener("DOMContentLoaded", () => {
    const valueList = ["France", "England", "Spain", "Wales", "Ireland", "Germany", "Portugal", "Italy"];
    searchdown("basic", {
        values: valueList,
        sort: undefined, //undefined, "ASC", "DESC"
        limit: 0, //0 means no limit and is default
        multiple: false,
        addValues: false,
        caseSensitive: true,
        placeholder: "Search",
        inputName: "basic",
    });
    searchdown("multiple", {
        values: ["France", "England", "Spain", "Wales", "Ireland", "Germany", "Portugal", "Italy"],
        sort: "ASC", //undefined, "ASC", "DESC"
        limit: 0, //0 means no limit and is default
        multiple: true,
        addValues: false,
        caseSensitive: true,
        placeholder: "Enter a country", //default is "Search"
        inputName: "multiple",
    });
    searchdown("addValue", {
        values: ["France", "England", "Spain", "Wales", "Ireland", "Germany", "Portugal", "Italy"],
        sort: "DESC", //undefined, "ASC", "DESC"
        limit: 0, //0 means no limit and is default
        multiple: false,
        addValues: true,
        caseSensitive: false,
        placeholder: "Search",
        inputName: "addValue",
    });
    searchdown("multiple-addValue", {
        values: valueList,
        sort: undefined, //undefined, "ASC", "DESC"
        limit: 0, //0 means no limit and is default
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
        sdGetValue(form.basic, true) +
        "<br>Multiple: " +
        sdGetValue(form.multiple, true) +
        "<br>AddValue: " +
        sdGetValue(form.addValue, false) +
        "<br>MultipleAddValue: " +
        sdGetValue(form.multipleAddValue, false);
}
