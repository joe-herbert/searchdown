let sdGlobalCount = 0;
let sdMap = new Map();

class SdOption {
    #name;
    #defaultValue;
    #type;
    #valid;
    #invalidMessage;
    #value;

    constructor(name, defaultValue, type, valid, invalidMessage) {
        this.#name = name;
        this.#defaultValue = defaultValue;
        this.#type = type;
        this.#valid = valid;
        this.#invalidMessage = invalidMessage;
    }

    get(options) {
        if (typeof this.#value === "undefined" || this.#value === null) {
            return typeof this.#defaultValue === "function" ? this.#defaultValue(options) : this.#defaultValue;
        }
        return this.#value;
    }

    set(value, options) {
        let parsed = this.#parse(value);
        if (parsed === undefined) {
            this.#value = undefined;
            return true;
        } else if (parsed !== null) {
            if (typeof this.#valid === "undefined" || this.#valid(parsed, options)) {
                this.#value = parsed;
                return true;
            } else {
                console.error(`Searchdown: ${this.#invalidMessage || "Invalid value '" + value + "' for option '" + this.#name + "'"}`);
                return false;
            }
        } else {
            console.error(`Searchdown: Could not set value '${value}' for option '${this.#name}' because it was not of type '${this.#type}'`);
            return false;
        }
    }

    #parse(value) {
        if (value === undefined || typeof value === this.#type) return value;
        switch (this.#type) {
            case "string":
                return JSON.stringify(value);
            case "array":
                if (typeof value === "string") {
                    try {
                        let obj = JSON.parse(value);
                        if (Array.isArray(obj)) return obj;
                        return null;
                    } catch {
                        return null;
                    }
                } else if (typeof value === "object") {
                    if (Array.isArray(value)) return value;
                    return null;
                } else {
                    return null;
                }
            case "object":
                if (typeof value === "string") {
                    try {
                        let obj = JSON.parse(value);
                        return obj;
                    } catch {
                        return null;
                    }
                } else if (typeof value === "object") {
                    return value;
                } else {
                    return null;
                }
            case "number":
                let num = Number(value);
                if (Number.isNaN(num)) return null;
                return num;
            case "boolean":
                switch (value.toLowerCase()) {
                    case "true":
                    case "t":
                    case "yes":
                    case "y":
                        return true;
                    case "false":
                    case "f":
                    case "no":
                    case "n":
                        return false;
                    default:
                        return null;
                }
            default:
                return null;
        }
    }
}

class SdOptions {
    values = new SdOption("values", [], "object", (value) => {
        if (Array.isArray(value)) {
            return value.length > 0;
        } else if (typeof value === "object") {
            return Object.keys(value).length > 0;
        }
    });
    sort = new SdOption("sort", undefined, "string", (value) => {
        return value === undefined || value === "ASC" || value === "DESC";
    });
    limit = new SdOption("limit", 0, "number", (value) => {
        return value >= 0;
    });
    enteredLimit = new SdOption("enteredLimit", 0, "number", (value, options) => {
        return value === 0 || (value > 0 && options.multiple);
    });
    multiple = new SdOption(
        "multiple",
        false,
        "boolean",
        (value, options) => {
            return !value || !options.get("simpleInput");
        },
        "Invalid value: An element cannot have both 'simpleInput = true' and 'multiple = true'. Setting 'multiple = false'"
    );
    addValues = new SdOption("addValues", false, "boolean");
    saveEntered = new SdOption(
        "saveEntered",
        (options) => {
            return !options.get("addValues");
        },
        "boolean",
        (value, options) => {
            return options.get("addValues") || !value;
        },
        "Invalid value: An element cannot have 'saveEntered = true' without 'addValues = true'. Setting 'saveEntered = false'"
    );
    hideEntered = new SdOption("hideEntered", false, "boolean");
    allowDuplicates = new SdOption("allowDuplicates", false, "boolean");
    caseSensitive = new SdOption("caseSensitive", false, "boolean");
    placeholder = new SdOption("placeholder", "Search", "string");
    maxHeight = new SdOption("maxHeight", 600, "number", (value) => {
        return value >= 0;
    });
    inputName = new SdOption(
        "inputName",
        () => {
            return "sd" + sdGlobalCount;
        },
        "string"
    );
    initialValues = new SdOption("initialValues", [], "array");
    simpleInput = new SdOption(
        "simpleInput",
        false,
        "boolean",
        (value, options) => {
            return !value || !options.get("multiple");
        },
        "Invalid value: An element cannot have both 'simpleInput = true' and 'multiple = true'. Setting 'simpleInput = false'"
    );
    textarea = new SdOption("textarea", false, "boolean");
    baseBackColor = new SdOption("baseBackColor", undefined, "string");
    selectedBackColor = new SdOption("selectedBackColor", undefined, "string");
    hoverBackColor = new SdOption("hoverBackColor", undefined, "string");
    baseTextColor = new SdOption("baseTextColor", undefined, "string");
    selectedTextColor = new SdOption("selectedTextColor", undefined, "string");
    hoverTextColor = new SdOption("hoverTextColor", undefined, "string");

    constructor(opts) {
        Object.keys(opts).forEach((option) => {
            let prop = this[option];
            if (!(prop instanceof SdOption)) {
                let findProp = Object.getOwnPropertyNames(this).find((x) => x.toLowerCase() === option.toLowerCase());
                if (!findProp) return;
                prop = this[findProp];
                if (!(prop instanceof SdOption)) return;
            }
            if (!prop.set(opts[option], this)) {
                console.error(`Searchdown: value '${opts[option]}' is invalid for option '${option}'`);
            }
        });
    }

    get(prop) {
        return this[prop].get(this);
    }

    set(prop, value) {
        return this[prop].set(value, this);
    }

    pushValue(value) {
        return this.values.set(this.values.get(this).push(value), this);
    }
}

function searchdown(element, optionsArg) {
    //check element exists
    if (typeof element === "string") {
        element = document.getElementById(element);
        if (!element) {
            console.error(`No element found for searchdown with id ${element}`);
            return false;
        }
    }

    sdGlobalCount++;
    let options;
    if (optionsArg instanceof SdOptions) {
        options = optionsArg;
    } else {
        options = new SdOptions(optionsArg);
    }
    sdMap.set(sdGlobalCount, options);
    element.dataset.sdcount = sdGlobalCount;

    //set colours
    if (options.get("baseBackColor")) {
        element.style.setProperty("--sdBackBase", options.get("baseBackColor"));
    }
    if (options.get("selectedBackColor")) {
        element.style.setProperty("--sdBackSelected", options.get("selectedBackColor"));
    }
    if (options.get("hoverBackColor")) {
        element.style.setProperty("--sdBackHover", options.get("hoverBackColor"));
    }
    if (options.get("baseTextColor")) {
        element.style.setProperty("--sdTextBase", options.get("baseTextColor"));
    }
    if (options.get("selectedTextColor")) {
        element.style.setProperty("--sdTextSelected", options.get("selectedTextColor"));
    }
    if (options.get("hoverTextColor")) {
        element.style.setProperty("--sdTextHover", options.get("hoverTextColor"));
    }

    //searchdown class
    element.classList.add("searchdown");
    if (options.get("textarea")) {
        element.classList.add("textarea");
    }
    //create searchdown html
    let inputWrapper = document.createElement("div");
    inputWrapper.classList.add("sdInputWrapper");
    inputWrapper.addEventListener("click", () => {
        inputWrapper.querySelector(".sdInput").focus();
    });
    let input = document.createElement(options.get("textarea") ? "textarea" : "input");
    input.placeholder = options.get("placeholder");
    input.autocomplete = "off";
    input.classList.add("sdInput");
    input.name = options.get("inputName") + "LastInput";
    //create input or select
    let enteredInput;
    if (options.get("multiple")) {
        enteredInput = document.createElement("select");
        enteredInput.multiple = true;
    } else {
        enteredInput = document.createElement("input");
        enteredInput.type = "text";
    }
    enteredInput.classList.add("sdHide");
    enteredInput.classList.add("sdEnteredInput");
    enteredInput.name = options.get("inputName");
    enteredInput.id = "sdInput-" + options.get("inputName");
    let dropdownWrapper = document.createElement("div");
    dropdownWrapper.classList.add("sdDropdownWrapper");
    dropdownWrapper.classList.add("sdHide");
    let dropdown = document.createElement("ul");
    dropdown.classList.add("sdDropdown");
    let enteredWrapper = document.createElement("div");
    enteredWrapper.classList.add("sdEnteredWrapper");
    if (options.get("addValues")) {
        let addOption = document.createElement("li");
        addOption.classList.add("sdAddOption");
        addOption.addEventListener("click", (event) => {
            let searchdown = event.target.closest(".searchdown");
            let value = searchdown.querySelector(".sdInput").value;
            if (value !== "") {
                sdAddEntered(options, searchdown, value, !options.get("simpleInput"));
                if (options.get("saveEntered")) {
                    options.pushValue(value);
                }
            }
        });
        dropdown.appendChild(addOption);
    }

    input.addEventListener("keydown", (event) => {
        if (event.isComposing || event.keyCode === 229 || event.key === "Unidentified" || event.key === "Dead") {
            return;
        }
        let target = event.currentTarget;
        let alphanumeric = /^[a-zA-Z0-9-_ ]$/.test(event.key);
        let targetValue = target.value + (alphanumeric ? event.key : "");
        if (event.key === "Backspace" && targetValue !== "") {
            targetValue = targetValue.substring(0, targetValue.length - 1);
        }
        let searchdown = target.closest(".searchdown");
        if (event.key === "Enter") {
            let selected = searchdown.querySelector(".sdDropdown .sdSelected");
            let value = selected.innerHTML;
            if (selected.classList.contains("sdAddOption")) {
                if (options.get("saveEntered") && targetValue !== "") {
                    options.pushValue(targetValue);
                }
                value = targetValue;
            }
            if (targetValue !== "" || !selected.classList.contains("sdAddOption")) {
                sdAddEntered(options, searchdown, value, !options.get("simpleInput"));
                if (options.get("multiple")) {
                    sdSearchAndShowDropdown(options, target, options.get("simpleInput") ? value : "");
                }
            }
            event.preventDefault();
        } else if (event.key === "Down" || event.key === "ArrowDown") {
            let selected = searchdown.querySelector(".sdDropdown .sdSelected");
            let nextSibling = selected.nextElementSibling;
            if (nextSibling) {
                selected.classList.remove("sdSelected");
                nextSibling.classList.add("sdSelected");
                event.preventDefault();
            }
        } else if (event.key === "Up" || event.key === "ArrowUp") {
            let selected = searchdown.querySelector(".sdDropdown .sdSelected");
            let prevSibling = selected.previousElementSibling;
            if (prevSibling) {
                selected.classList.remove("sdSelected");
                prevSibling.classList.add("sdSelected");
                event.preventDefault();
            }
        } else if (event.key === "Backspace" && target.value === "") {
            let lastEntered = searchdown.querySelector(".sdEntered:last-of-type");
            if (lastEntered) {
                lastEntered.remove();
            }
            //Remove value from enteredInput
            let enteredInput = searchdown.querySelector(".sdEnteredInput");
            if (options.get("multiple")) {
                enteredInput.querySelectorAll("option").forEach((opt) => {
                    if (opt.value === lastEntered.innerHTML) {
                        opt.remove();
                    }
                });
            } else {
                enteredInput.value = "";
            }
            sdSearchAndShowDropdown(options, target, "");
        } else if (event.key === "Tab") {
            sdLoseFocus();
        } else if (event.key === "Escape") {
            sdLoseFocus();
            target.blur();
        } else if (alphanumeric || event.key === "Backspace") {
            sdSearchAndShowDropdown(options, target, targetValue);
        }
        sdResizeInput(target, event.key, options.get("simpleInput"), options.get("textarea"));
    });

    input.addEventListener("focus", (event) => {
        let target = event.currentTarget;
        let targetValue = target.value;
        sdSearchAndShowDropdown(options, target, targetValue);
    });

    inputWrapper.appendChild(enteredWrapper);
    inputWrapper.appendChild(input);
    element.appendChild(inputWrapper);
    dropdownWrapper.appendChild(dropdown);
    element.appendChild(dropdownWrapper);
    element.appendChild(enteredInput);

    if (options.get("simpleInput")) {
        if (options.get("textarea")) {
            input.style.width = "280px";
        } else {
            input.style.width = "100%";
        }
    } else {
        var computedStyle = getComputedStyle(inputWrapper);
        input.style.width = inputWrapper.offsetWidth - (parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight)) + "px";
    }
    if (options.get("multiple")) {
        for (let val of options.get("initialValues")) {
            sdAddEntered(options, element, val, false);
        }
    } else {
        if (options.get("initialValues")[0]) {
            sdAddEntered(options, element, options.get("initialValues")[0], false);
        }
    }
}

document.addEventListener("click", (event) => {
    sdLoseFocus(event.target.closest(".searchdown"));
    event.stopPropagation();
});

function sdMessage(text, className = "success") {
    if (typeof Toastify === "undefined") {
        alert(text);
    } else {
        Toastify({
            duration: 5000,
            gravity: "top",
            position: "center",
            offset: {
                y: 80,
            },
            text: text,
            className: className,
        }).showToast();
    }
}

function sdResizeInput(input, key, simpleInput, textarea) {
    if (simpleInput) {
        if (textarea) {
            input.style.width = "280px";
        } else {
            input.style.width = "100%";
        }
    } else {
        input.style.width = 0;
        if ((input.value === "" || (input.value.length === 1 && key === "Backspace")) && input.placeholder !== "") {
            let span = document.createElement("span");
            span.innerHTML = input.placeholder;
            document.querySelector("body").appendChild(span);
            input.style.width = span.scrollWidth + "px";
            span.remove();
        } else {
            input.style.width = input.scrollWidth + 12 + "px";
        }
    }
}

function sdLoseFocus(searchdown) {
    if (searchdown) {
        document.querySelectorAll(".searchdown").forEach((sd) => {
            if (!sd.isSameNode(searchdown)) {
                sd.querySelector(".sdDropdownWrapper").classList.add("sdHide");
            }
        });
        if (sdMap.get(Number(searchdown.dataset.sdcount)).get("multiple")) {
            searchdown.querySelector(".sdInput").focus();
        }
    } else {
        document.querySelectorAll(".searchdown .sdDropdownWrapper").forEach((sdDropdownWrapper) => {
            sdDropdownWrapper.classList.add("sdHide");
        });
    }
}

function sdGetValueFromOptions(options, value) {
    if (Array.isArray(options.get("values"))) {
        if (options.get("values").includes(value) || options.get("addValues")) {
            return value;
        } else {
            return null;
        }
    } else {
        if (options.get("values")[value]) {
            return options.get("values")[value];
        } else {
            return value;
        }
    }
}

function sdAddEntered(options, searchdown, value, clearInput) {
    let optionsValue = sdGetValueFromOptions(options, value);
    let enteredWrapper = searchdown.querySelector(".sdEnteredWrapper");
    let entered = enteredWrapper.querySelectorAll(".sdEntered");
    let input = searchdown.querySelector(".sdInput");
    let changeMade = true;
    if (!options.get("multiple") && entered.length > 0) {
        entered[0].innerHTML = optionsValue;
    } else if (options.get("simpleInput")) {
        input.value = optionsValue;
    } else {
        if (entered.length >= options.get("enteredLimit") && options.get("enteredLimit") > 0) {
            sdMessage(`You cannot enter more than ${options.get("enteredLimit")} option${options.get("enteredLimit") === 1 ? "" : "s"}.`, "error");
            changeMade = false;
        } else {
            if (options.get("allowDuplicates") || !sdEnteredContainsValue(enteredWrapper, optionsValue, options.get("caseSensitive"))) {
                let entered = document.createElement("span");
                entered.classList.add("sdEntered");
                entered.innerHTML = value;
                entered.addEventListener("click", (event) => {
                    const valToRemove = event.target.innerHTML;
                    event.target.remove();
                    //Remove value from enteredInput
                    let enteredInput = searchdown.querySelector(".sdEnteredInput");
                    if (options.get("multiple")) {
                        enteredInput.querySelectorAll("option").forEach((opt) => {
                            if (opt.value === sdGetValueFromOptions(options, valToRemove)) {
                                opt.remove();
                            }
                        });
                    } else {
                        enteredInput.value = "";
                    }
                    event.stopPropagation();
                });
                enteredWrapper.appendChild(entered);
            }
        }
    }
    if (changeMade) {
        if (clearInput) {
            input.value = "";
        }
        sdResizeInput(input, input.value, options.get("simpleInput"), options.get("textarea"));
        //Add value to enteredInput
        let enteredInput = searchdown.querySelector(".sdEnteredInput");
        if (options.get("multiple")) {
            let opt = document.createElement("option");
            opt.innerText = value;
            opt.value = optionsValue;
            opt.selected = true;
            enteredInput.appendChild(opt);
        } else {
            enteredInput.value = optionsValue;
            sdLoseFocus();
        }
    }
}

function sdSearchAndShowDropdown(options, target, targetValue) {
    if (options.get("values").length !== 0 || options.get("addValues")) {
        let searchdown = target.closest(".searchdown");
        let enteredWrapper = searchdown.querySelector(".sdEnteredWrapper");
        //filter values
        let values = Array.isArray(options.get("values")) ? options.get("values") : Object.keys(options.get("values"));
        let filteredValues = values.filter((value) => {
            if (options.get("hideEntered") && sdEnteredContainsValue(enteredWrapper, value, options.get("caseSensitive"))) {
                return false;
            }
            if (typeof value === "object") {
                const val = Object.values(value)[0];
                const key = Object.keys(value)[0];
                //if caseSensitive
                if (options.get("caseSensitive")) {
                    return val.includes(targetValue) || key.includes(targetValue);
                }
                return val.toLowerCase().includes(targetValue.toLowerCase()) || key.toLowerCase().includes(targetValue.toLowerCase());
            } else {
                //if caseSensitive
                if (options.get("caseSensitive")) {
                    return value.includes(targetValue);
                }
                return value.toLowerCase().includes(targetValue.toLowerCase());
            }
        });
        //apply sort
        if (options.get("sort") === "ASC") filteredValues.sort();
        else if (options.get("sort") === "DESC") filteredValues.sort().reverse();
        //apply limit
        if (options.get("limit") !== 0) filteredValues = filteredValues.slice(0, options.get("limit"));
        //remove all existing options
        let dropdown = searchdown.querySelector(".sdDropdown");
        dropdown.querySelectorAll("li.sdOption:not(.sdAddOption)").forEach((li) => {
            li.remove();
        });
        //create option for each value
        let first = true;
        for (let value of filteredValues) {
            let opt = document.createElement("li");
            opt.classList.add("sdOption");
            if (first) {
                opt.classList.add("sdSelected");
                first = false;
            }
            opt.innerHTML = value;
            opt.addEventListener("click", (event) => {
                if (value !== "") {
                    sdAddEntered(options, event.target.closest(".searchdown"), event.target.innerHTML, false);
                }
            });
            dropdown.appendChild(opt);
        }
        let sdAddOption = dropdown.querySelector("li.sdAddOption");
        if (sdAddOption) {
            if (filteredValues.length === 0) {
                sdAddOption.classList.add("sdSelected");
            } else {
                sdAddOption.classList.remove("sdSelected");
            }
        }
        if (values.includes(targetValue)) {
            if (sdAddOption) {
                sdAddOption.classList.add("sdHide");
            }
        } else {
            if (sdAddOption) {
                dropdown.appendChild(sdAddOption);
                sdAddOption.classList.remove("sdHide");
            }
            if (options.get("addValues")) {
                let message = `Press Enter to add <b>"${targetValue}"</b>`;
                if (targetValue === "") {
                    message = "Type to enter a new value";
                }
                dropdown.querySelector("li.sdAddOption").classList.remove("sdHide");
                dropdown.querySelector("li.sdAddOption").innerHTML = message;
            }
        }
        //show dropdown
        let dropdownWrapper = searchdown.querySelector(".sdDropdownWrapper");
        let maxHeight = document.querySelector("body").getBoundingClientRect().bottom - searchdown.getBoundingClientRect().bottom;
        if (maxHeight < 80) {
            dropdownWrapper.classList.add("sdTop");
            dropdownWrapper.style.maxHeight = Math.min(searchdown.getBoundingClientRect().top - document.querySelector("body").getBoundingClientRect().top, options.get("maxHeight")) + "px";
        } else {
            dropdownWrapper.style.maxHeight = Math.min(document.querySelector("body").getBoundingClientRect().bottom - searchdown.getBoundingClientRect().bottom, options.get("maxHeight")) + "px";
        }
        dropdownWrapper.style.width = searchdown.getBoundingClientRect().width + "px";
        dropdownWrapper.classList.remove("sdHide");
    }
}

function sdEnteredContainsValue(enteredWrapper, value, caseSensitive) {
    let enteredEls = enteredWrapper.getElementsByClassName("sdEntered");
    for (let entered of enteredEls) {
        if (caseSensitive) {
            if (entered.innerHTML === value) return true;
        } else {
            if (entered.innerHTML.toLowerCase() === value.toLowerCase()) return true;
        }
    }
    return false;
}

function sdGetValue(element, includeNotEntered) {
    if (typeof element === "string") {
        element = document.getElementById(element);
        if (!element) {
            return false;
        }
    }
    if (element.classList.toString().includes("sd")) {
        let options = sdMap.get(Number(element.closest(".searchdown").dataset.sdcount));
        if (options.get("simpleInput")) includeNotEntered = true;
        if (element.tagName === "SELECT") {
            let result = [];
            let opts = element && element.options;
            let opt;

            for (let i = 0; i < opts.length; i++) {
                opt = opts[i];

                if (opt.selected) {
                    result.push(opt.value || opt.text);
                }
            }
            if (includeNotEntered) {
                let last = document.getElementsByName(element.name + "LastInput")[0];
                if (last && last.value) {
                    result.push(last.value);
                }
            }
            return result;
        } else if (element.tagName) {
            if (element.value) {
                return element.value;
            } else if (includeNotEntered) {
                let last = document.getElementsByName(element.name + "LastInput")[0];
                if (last && last.value) {
                    return last.value;
                } else {
                    return "";
                }
            } else {
                return "";
            }
        }
        return false;
    } else {
        return element.value || false;
    }
}

function sdSetValue(element, values) {
    if (typeof element === "string") {
        element = document.getElementById(element);
        if (!element) {
            return false;
        }
    }
    if (typeof values === "string") {
        values = [values];
    }
    if (element.classList.toString().includes("sd")) {
        let searchdown = element.closest(".searchdown");
        //remove current values
        searchdown.querySelector(".sdEnteredWrapper").innerHTML = "";
        if (element.tagName === "SELECT") {
            let opts = element.options;
            for (let i = 0; i < opts.length; i++) {
                opts[i].remove();
            }
        } else if (element.tagName) {
            element.value = "";
        }
        //add new values
        values.forEach((value) => {
            sdAddEntered(sdMap(Number(searchdown.dataset.sdcount)), searchdown, value, false);
        });
        return false;
    } else {
        if (element.tagName === "SELECT" && element.multiple) {
            for (let i = 0; i < element.options.length; i++) {
                if (values.includes(element.options[i].value)) {
                    element.options[i].selected = true;
                }
            }
        } else {
            element.value = values[0];
        }
    }
}

// add searchdowns
document.addEventListener("DOMContentLoaded", () => {
    if (typeof SEARCHDOWN_AUTO_CREATE === "undefined" || SEARCHDOWN_AUTO_CREATE !== false) {
        sdAutoCreate();
    }
});

function sdAutoCreate() {
    let sds = document.querySelectorAll(".searchdown");
    sds.forEach((sd) => {
        let opts = Object.keys(sd.dataset)
            .filter((option) => option.substring(0, 3) === "sd_")
            .reduce((obj, option) => {
                obj[option.substring(3)] = sd.dataset[option];
                return obj;
            }, {});
        if (!opts.hasOwnProperty("values")) {
            console.warn("Searchdown: element must have attribute 'data-sd_values' to be automatically created", sd);
            return;
        }
        searchdown(sd, opts);
    });
}
