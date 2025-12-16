// searchdown.js - ES6 Module Version
import './searchdown.css';
let globalCount = 0;
const instanceMap = new Map();

// Global message handler - defaults to null (will use alert)
let messageHandler = null;

/**
 * Set a global message handler for all searchdown instances
 * @param {Function} handler - Function that receives (text, type) parameters
 *                            type is either "success" or "error"
 * Example usage:
 *   setMessageHandler((text, type) => {
 *     Toastify({ text, type, duration: 5000 }).showToast();
 *   });
 */
export function setMessageHandler(handler) {
    if (typeof handler === "function") {
        messageHandler = handler;
    } else if (handler === null || handler === undefined) {
        messageHandler = null; // Reset to default (alert)
    } else {
        console.error("Searchdown: setMessageHandler requires a function or null");
    }
}

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
        if (this.#value === undefined || this.#value === null) {
            return typeof this.#defaultValue === "function"
                ? this.#defaultValue(options)
                : this.#defaultValue;
        }
        return this.#value;
    }

    set(value, options) {
        const parsed = this.#parse(value);
        if (parsed === undefined) {
            this.#value = undefined;
            return true;
        }
        if (parsed !== null) {
            if (this.#valid === undefined || this.#valid(parsed, options)) {
                this.#value = parsed;
                return true;
            }
            console.error(`Searchdown: ${this.#invalidMessage || `Invalid value '${value}' for option '${this.#name}'`}`);
            return false;
        }
        console.error(`Searchdown: Could not set value '${value}' for option '${this.#name}' because it was not of type '${this.#type}'`);
        return false;
    }

    #parse(value) {
        if (value === undefined || typeof value === this.#type) return value;
        switch (this.#type) {
            case "string":
                return JSON.stringify(value);
            case "array":
                if (typeof value === "string") {
                    try {
                        const obj = JSON.parse(value);
                        return Array.isArray(obj) ? obj : null;
                    } catch { return null; }
                }
                return Array.isArray(value) ? value : null;
            case "object":
                if (typeof value === "string") {
                    try { return JSON.parse(value); }
                    catch { return null; }
                }
                return typeof value === "object" ? value : null;
            case "number": {
                const num = Number(value);
                return Number.isNaN(num) ? null : num;
            }
            case "boolean":
                if (typeof value === "boolean") return value;
                switch (String(value).toLowerCase()) {
                    case "true": case "t": case "yes": case "y": return true;
                    case "false": case "f": case "no": case "n": return false;
                    default: return null;
                }
            default:
                return null;
        }
    }
}

class SdOptions {
    constructor(opts = {}) {
        this.values = new SdOption("values", [], "object", (v) =>
            Array.isArray(v) ? v.length > 0 : Object.keys(v).length > 0
        );
        this.sort = new SdOption("sort", undefined, "string", (v) =>
            v === undefined || v === "ASC" || v === "DESC"
        );
        this.limit = new SdOption("limit", 0, "number", (v) => v >= 0);
        this.enteredLimit = new SdOption("enteredLimit", 0, "number", (v, o) =>
            v === 0 || (v > 0 && o.multiple)
        );
        this.multiple = new SdOption("multiple", false, "boolean", (v, o) =>
                !v || !o.get("simpleInput"),
            "Invalid value: An element cannot have both 'simpleInput = true' and 'multiple = true'. Setting 'multiple = false'"
        );
        this.addValues = new SdOption("addValues", false, "boolean");
        this.saveEntered = new SdOption("saveEntered", (o) => !o.get("addValues"), "boolean", (v, o) =>
                o.get("addValues") || !v,
            "Invalid value: An element cannot have 'saveEntered = true' without 'addValues = true'. Setting 'saveEntered = false'"
        );
        this.hideEntered = new SdOption("hideEntered", false, "boolean");
        this.allowDuplicates = new SdOption("allowDuplicates", false, "boolean");
        this.caseSensitive = new SdOption("caseSensitive", false, "boolean");
        this.placeholder = new SdOption("placeholder", "Search", "string");
        this.required = new SdOption("required", 0, "number", (v, o) =>
                typeof v === "boolean" || (v >= 0 && (!o.get("multiple") || v <= 1)),
            "Invalid value: 'required' must be greater than 0 and must be 0 or 1 if 'multiple = false'"
        );
        this.maxHeight = new SdOption("maxHeight", 600, "number", (v) => v >= 0);
        this.inputName = new SdOption("inputName", () => `sd${globalCount}`, "string");
        this.initialValues = new SdOption("initialValues", [], "array");
        this.simpleInput = new SdOption("simpleInput", false, "boolean", (v, o) =>
                !v || !o.get("multiple"),
            "Invalid value: An element cannot have both 'simpleInput = true' and 'multiple = true'. Setting 'simpleInput = false'"
        );
        this.textarea = new SdOption("textarea", false, "boolean");
        this.baseBackColor = new SdOption("baseBackColor", undefined, "string");
        this.selectedBackColor = new SdOption("selectedBackColor", undefined, "string");
        this.hoverBackColor = new SdOption("hoverBackColor", undefined, "string");
        this.baseTextColor = new SdOption("baseTextColor", undefined, "string");
        this.selectedTextColor = new SdOption("selectedTextColor", undefined, "string");
        this.hoverTextColor = new SdOption("hoverTextColor", undefined, "string");

        Object.keys(opts).forEach((option) => {
            let prop = this[option];
            if (!(prop instanceof SdOption)) {
                const findProp = Object.getOwnPropertyNames(this).find(
                    (x) => x.toLowerCase() === option.toLowerCase()
                );
                if (!findProp) return;
                prop = this[findProp];
                if (!(prop instanceof SdOption)) return;
            }
            if (!prop.set(opts[option], this)) {
                console.error(`Searchdown: value '${opts[option]}' is invalid for option '${option}'`);
            }
        });
    }

    get(prop) { return this[prop].get(this); }
    set(prop, value) { return this[prop].set(value, this); }
    pushValue(value) { return this.values.set(this.values.get(this).push(value), this); }
}

// Helper functions
function showMessage(text, type = "success") {
    if (typeof messageHandler === "function") {
        messageHandler(text, type);
    } else {
        alert(text);
    }
}

function resizeInput(input, key, simpleInput, textarea) {
    if (simpleInput) {
        input.style.width = textarea ? "280px" : "100%";
    } else {
        input.style.width = "0";
        if ((input.value === "" || (input.value.length === 1 && key === "Backspace")) && input.placeholder !== "") {
            const span = document.createElement("span");
            span.innerHTML = input.placeholder;
            document.body.appendChild(span);
            input.style.width = `${span.scrollWidth}px`;
            span.remove();
        } else {
            input.style.width = `${input.scrollWidth + 12}px`;
        }
    }
}

function loseFocus(searchdownEl) {
    if (searchdownEl) {
        document.querySelectorAll(".searchdown").forEach((sd) => {
            if (!sd.isSameNode(searchdownEl)) {
                sd.querySelector(".sdDropdownWrapper").classList.add("sdHide");
            }
        });
        if (instanceMap.get(Number(searchdownEl.dataset.sdcount))?.get("multiple")) {
            searchdownEl.querySelector(".sdInput").focus();
        }
    } else {
        document.querySelectorAll(".searchdown .sdDropdownWrapper").forEach((el) => el.classList.add("sdHide"));
    }
}

function getValueFromOptions(options, valueString) {
    if (!options) return valueString;
    const vals = options.get("values");
    if (Array.isArray(vals)) {
        return vals.includes(valueString) || options.get("addValues") ? valueString : null;
    }
    return vals[valueString] ?? valueString;
}

function getValueStringFromOptions(options, value) {
    const vals = options.get("values");
    if (Array.isArray(vals)) {
        return vals.includes(value) || options.get("addValues") ? value : null;
    }
    for (const key in vals) {
        if (vals[key] === value) return key;
    }
    return value;
}

function enteredContainsValue(enteredWrapper, value, caseSensitive) {
    const enteredEls = enteredWrapper.getElementsByClassName("sdEntered");
    for (const entered of enteredEls) {
        const match = caseSensitive
            ? entered.innerHTML === value
            : entered.innerHTML.toLowerCase() === value.toLowerCase();
        if (match) return true;
    }
    return false;
}

function addEntered(options, searchdownEl, value, clearInput) {
    const valueString = getValueStringFromOptions(options, value);
    const enteredWrapper = searchdownEl.querySelector(".sdEnteredWrapper");
    const entered = enteredWrapper.querySelectorAll(".sdEntered");
    const input = searchdownEl.querySelector(".sdInput");
    let changeMade = true;

    if (!options.get("multiple") && entered.length > 0) {
        entered[0].innerHTML = valueString;
    } else if (options.get("simpleInput")) {
        input.value = value;
    } else {
        const limit = options.get("enteredLimit");
        if (entered.length >= limit && limit > 0) {
            showMessage(`You cannot enter more than ${limit} option${limit === 1 ? "" : "s"}.`, "error");
            changeMade = false;
        } else if (options.get("allowDuplicates") || !enteredContainsValue(enteredWrapper, value, options.get("caseSensitive"))) {
            const enteredSpan = document.createElement("span");
            enteredSpan.classList.add("sdEntered");
            enteredSpan.innerHTML = valueString;
            enteredSpan.addEventListener("click", (e) => {
                const valStr = e.target.innerHTML;
                const valToRemove = getValueFromOptions(options, valStr);
                e.target.remove();
                const enteredInput = searchdownEl.querySelector(".sdEnteredInput");
                if (options.get("multiple")) {
                    enteredInput.querySelectorAll("option").forEach((opt) => {
                        if (opt.value === valToRemove) opt.remove();
                    });
                } else {
                    enteredInput.value = "";
                }
                e.stopPropagation();
            });
            enteredWrapper.appendChild(enteredSpan);
        }
    }

    if (changeMade) {
        if (clearInput) input.value = "";
        resizeInput(input, input.value, options.get("simpleInput"), options.get("textarea"));
        const enteredInput = searchdownEl.querySelector(".sdEnteredInput");
        if (options.get("multiple")) {
            const opt = document.createElement("option");
            opt.innerText = valueString;
            opt.value = value;
            opt.selected = true;
            enteredInput.appendChild(opt);
        } else {
            enteredInput.value = value;
            loseFocus();
        }
    }

    if (options.get("required")) validate(searchdownEl);
}

function searchAndShowDropdown(options, target, targetValue) {
    if (options.get("values").length === 0 && !options.get("addValues")) return;

    const searchdownEl = target.closest(".searchdown");
    const enteredWrapper = searchdownEl.querySelector(".sdEnteredWrapper");
    let values = Array.isArray(options.get("values")) ? options.get("values") : Object.keys(options.get("values"));

    let filteredValues = values.filter((value) => {
        if (options.get("hideEntered") && enteredContainsValue(enteredWrapper, value, options.get("caseSensitive"))) return false;
        const cs = options.get("caseSensitive");
        if (typeof value === "object") {
            const val = Object.values(value)[0];
            const key = Object.keys(value)[0];
            return cs ? val.includes(targetValue) || key.includes(targetValue)
                : val.toLowerCase().includes(targetValue.toLowerCase()) || key.toLowerCase().includes(targetValue.toLowerCase());
        }
        return cs ? value.includes(targetValue) : value.toLowerCase().includes(targetValue.toLowerCase());
    });

    if (options.get("sort") === "ASC") filteredValues.sort();
    else if (options.get("sort") === "DESC") filteredValues.sort().reverse();
    if (options.get("limit") !== 0) filteredValues = filteredValues.slice(0, options.get("limit"));

    const dropdown = searchdownEl.querySelector(".sdDropdown");
    dropdown.querySelectorAll("li.sdOption:not(.sdAddOption)").forEach((li) => li.remove());

    let first = true;
    for (const value of filteredValues) {
        const opt = document.createElement("li");
        opt.classList.add("sdOption");
        if (first) { opt.classList.add("sdSelected"); first = false; }
        opt.innerHTML = value;
        opt.addEventListener("click", (e) => {
            if (value !== "") {
                addEntered(options, e.target.closest(".searchdown"), getValueFromOptions(instanceMap.get(Number(searchdownEl.dataset.sdcount)), e.target.innerHTML), false);
            }
        });
        dropdown.appendChild(opt);
    }

    const sdAddOption = dropdown.querySelector("li.sdAddOption");
    if (sdAddOption) {
        sdAddOption.classList.toggle("sdSelected", filteredValues.length === 0);
        if (values.includes(targetValue)) {
            sdAddOption.classList.add("sdHide");
        } else {
            dropdown.appendChild(sdAddOption);
            sdAddOption.classList.remove("sdHide");
            if (options.get("addValues")) {
                sdAddOption.innerHTML = targetValue === "" ? "Type to enter a new value" : `Press Enter to add <b>"${targetValue}"</b>`;
            }
        }
    }

    const dropdownWrapper = searchdownEl.querySelector(".sdDropdownWrapper");
    const bodyRect = document.body.getBoundingClientRect();
    const elRect = searchdownEl.getBoundingClientRect();
    let maxHeight = bodyRect.bottom - elRect.bottom;

    if (maxHeight < 80) {
        dropdownWrapper.classList.add("sdTop");
        dropdownWrapper.style.maxHeight = `${Math.min(elRect.top - bodyRect.top, options.get("maxHeight"))}px`;
    } else {
        dropdownWrapper.style.maxHeight = `${Math.min(maxHeight, options.get("maxHeight"))}px`;
    }
    dropdownWrapper.style.width = `${elRect.width}px`;
    dropdownWrapper.classList.remove("sdHide");
}

function validate(element) {
    if (typeof element === "string") {
        element = document.getElementById(element);
        if (!element) return true;
    }
    const searchdownEl = element.classList.contains("searchdown") ? element : element.closest(".searchdown");
    if (!searchdownEl) return true;

    const options = instanceMap.get(Number(searchdownEl.dataset.sdcount));
    const required = options.get("required");
    if (!required || required === 0) return true;

    const enteredInput = searchdownEl.querySelector(".sdEnteredInput");
    const input = searchdownEl.querySelector(".sdInput");
    let count = 0;

    if (options.get("simpleInput")) {
        count = input.value.trim() !== "" ? 1 : 0;
    } else if (options.get("multiple")) {
        count = enteredInput.querySelectorAll("option").length;
    } else {
        count = enteredInput.value.trim() !== "" ? 1 : 0;
    }

    const minRequired = required === true ? 1 : required;
    const isValid = count >= minRequired;

    enteredInput.setCustomValidity(isValid ? "" : minRequired === 1 ? "Please select an option" : `Please select at least ${minRequired} options`);
    searchdownEl.classList.toggle("sdInvalid", !isValid);
    return isValid;
}

function reportValidity(element) {
    if (typeof element === "string") {
        element = document.getElementById(element);
        if (!element) return true;
    }
    const searchdownEl = element.classList.contains("searchdown") ? element : element.closest(".searchdown");
    if (!searchdownEl) return true;

    validate(searchdownEl);
    const enteredInput = searchdownEl.querySelector(".sdEnteredInput");
    const wasHidden = enteredInput.classList.contains("sdHide");

    Object.assign(enteredInput.style, { position: "absolute", opacity: "0", pointerEvents: "none" });
    enteredInput.classList.remove("sdHide");
    const isValid = enteredInput.reportValidity();
    if (wasHidden) enteredInput.classList.add("sdHide");
    Object.assign(enteredInput.style, { position: "", opacity: "", pointerEvents: "" });

    return isValid;
}

// Main initialization function
export function searchdown(element, optionsArg = {}) {
    if (typeof element === "string") {
        element = document.getElementById(element);
        if (!element) {
            console.error(`No element found for searchdown with id ${element}`);
            return false;
        }
    }

    globalCount++;
    const options = optionsArg instanceof SdOptions ? optionsArg : new SdOptions(optionsArg);
    instanceMap.set(globalCount, options);
    element.dataset.sdcount = globalCount;

    // Set CSS custom properties for colors
    const colorProps = [
        ["baseBackColor", "--sdBackBase"], ["selectedBackColor", "--sdBackSelected"],
        ["hoverBackColor", "--sdBackHover"], ["baseTextColor", "--sdTextBase"],
        ["selectedTextColor", "--sdTextSelected"], ["hoverTextColor", "--sdTextHover"]
    ];
    colorProps.forEach(([opt, prop]) => {
        if (options.get(opt)) element.style.setProperty(prop, options.get(opt));
    });

    element.classList.add("searchdown");
    if (options.get("textarea")) element.classList.add("textarea");

    // Create DOM structure
    const inputWrapper = document.createElement("div");
    inputWrapper.classList.add("sdInputWrapper");
    inputWrapper.addEventListener("click", () => inputWrapper.querySelector(".sdInput").focus());

    const input = document.createElement(options.get("textarea") ? "textarea" : "input");
    input.placeholder = options.get("placeholder");
    input.autocomplete = "off";
    input.classList.add("sdInput");
    input.name = `${options.get("inputName")}LastInput`;

    const enteredInput = options.get("multiple")
        ? Object.assign(document.createElement("select"), { multiple: true })
        : Object.assign(document.createElement("input"), { type: "text" });
    enteredInput.classList.add("sdHide", "sdEnteredInput");
    enteredInput.name = options.get("inputName");
    enteredInput.id = `sdInput-${options.get("inputName")}`;

    const dropdownWrapper = document.createElement("div");
    dropdownWrapper.classList.add("sdDropdownWrapper", "sdHide");

    const dropdown = document.createElement("ul");
    dropdown.classList.add("sdDropdown");

    const enteredWrapper = document.createElement("div");
    enteredWrapper.classList.add("sdEnteredWrapper");

    if (options.get("addValues")) {
        const addOption = document.createElement("li");
        addOption.classList.add("sdAddOption");
        addOption.addEventListener("click", (e) => {
            const sd = e.target.closest(".searchdown");
            const value = sd.querySelector(".sdInput").value;
            if (value !== "") {
                addEntered(options, sd, value, !options.get("simpleInput"));
                if (options.get("saveEntered")) options.pushValue(value);
            }
        });
        dropdown.appendChild(addOption);
    }

    // Input event handlers
    input.addEventListener("keydown", (e) => {
        if (e.isComposing || e.keyCode === 229 || e.key === "Unidentified" || e.key === "Dead") return;

        const alphanumeric = /^[a-zA-Z0-9-_ ]$/.test(e.key);
        let targetValue = input.value + (alphanumeric ? e.key : "");
        if (e.key === "Backspace" && targetValue !== "") targetValue = targetValue.slice(0, -1);

        const sd = input.closest(".searchdown");

        if (e.key === "Enter") {
            const selected = sd.querySelector(".sdDropdown .sdSelected");
            let value = getValueFromOptions(instanceMap.get(Number(sd.dataset.sdcount)), selected.innerHTML);
            if (selected.classList.contains("sdAddOption")) {
                if (options.get("saveEntered") && targetValue !== "") options.pushValue(targetValue);
                value = targetValue;
            }
            if (targetValue !== "" || !selected.classList.contains("sdAddOption")) {
                addEntered(options, sd, value, !options.get("simpleInput"));
                if (options.get("multiple")) searchAndShowDropdown(options, input, options.get("simpleInput") ? value : "");
            }
            e.preventDefault();
        } else if (e.key === "ArrowDown" || e.key === "Down") {
            const selected = sd.querySelector(".sdDropdown .sdSelected");
            if (selected?.nextElementSibling) {
                selected.classList.remove("sdSelected");
                selected.nextElementSibling.classList.add("sdSelected");
                e.preventDefault();
            }
        } else if (e.key === "ArrowUp" || e.key === "Up") {
            const selected = sd.querySelector(".sdDropdown .sdSelected");
            if (selected?.previousElementSibling) {
                selected.classList.remove("sdSelected");
                selected.previousElementSibling.classList.add("sdSelected");
                e.preventDefault();
            }
        } else if (e.key === "Backspace" && input.value === "") {
            const lastEntered = sd.querySelector(".sdEntered:last-of-type");
            if (lastEntered) {
                lastEntered.remove();
                const ei = sd.querySelector(".sdEnteredInput");
                if (options.get("multiple")) {
                    ei.querySelectorAll("option").forEach((opt) => { if (opt.value === lastEntered.innerHTML) opt.remove(); });
                } else {
                    ei.value = "";
                }
                if (options.get("required")) validate(sd);
                searchAndShowDropdown(options, input, "");
            }
        } else if (e.key === "Tab") {
            loseFocus();
        } else if (e.key === "Escape") {
            loseFocus();
            input.blur();
        } else if (alphanumeric || e.key === "Backspace") {
            searchAndShowDropdown(options, input, targetValue);
        }
        resizeInput(input, e.key, options.get("simpleInput"), options.get("textarea"));
    });

    input.addEventListener("focus", () => searchAndShowDropdown(options, input, input.value));

    // Assemble DOM
    inputWrapper.append(enteredWrapper, input);
    dropdownWrapper.appendChild(dropdown);
    element.append(inputWrapper, dropdownWrapper, enteredInput);

    // Set initial width
    if (options.get("simpleInput")) {
        input.style.width = options.get("textarea") ? "280px" : "100%";
    } else {
        const cs = getComputedStyle(inputWrapper);
        input.style.width = `${inputWrapper.offsetWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)}px`;
    }

    // Set initial values
    const initVals = options.get("initialValues");
    if (options.get("multiple")) {
        initVals.forEach((val) => addEntered(options, element, getValueFromOptions(instanceMap.get(Number(element.dataset.sdcount)), val), false));
    } else if (initVals[0]) {
        addEntered(options, element, getValueFromOptions(instanceMap.get(Number(element.dataset.sdcount)), initVals[0]), false);
    }

    // Handle required validation
    if (options.get("required")) {
        enteredInput.required = true;
        const minRequired = options.get("required") === true ? 1 : options.get("required");
        enteredInput.setCustomValidity(minRequired === 1 ? "Please select an option" : `Please select at least ${minRequired} options`);
        enteredInput.addEventListener("invalid", (e) => {
            e.preventDefault();
            element.classList.add("sdInvalid");
            input.focus();
            showMessage(enteredInput.validationMessage, "error");
        });
    }

    return { element, options };
}

// Public API
export function getValue(element, includeNotEntered = false) {
    if (typeof element === "string") {
        element = document.getElementById(element);
        if (!element) return false;
    }
    if (element.classList.contains("searchdown")) {
        element = element.querySelector(".sdEnteredInput");
    }
    if (!element.classList.toString().includes("sd")) return element.value || false;

    const options = instanceMap.get(Number(element.closest(".searchdown").dataset.sdcount));
    if (options.get("simpleInput")) includeNotEntered = true;

    if (element.tagName === "SELECT") {
        const result = [...element.options].filter((o) => o.selected).map((o) => o.value || o.text);
        if (includeNotEntered) {
            const last = document.getElementsByName(`${element.name}LastInput`)[0];
            if (last?.value) result.push(last.value);
        }
        return result;
    }
    if (element.tagName) {
        if (element.value) return element.value;
        if (includeNotEntered) {
            const last = document.getElementsByName(`${element.name}LastInput`)[0];
            return last?.value || "";
        }
        return "";
    }
    return false;
}

export function setValue(element, values) {
    if (typeof element === "string") {
        element = document.getElementById(element);
        if (!element) return false;
    }
    if (typeof values === "string") values = [values];

    if (element.classList.toString().includes("sd")) {
        const sd = element.closest(".searchdown");
        sd.querySelector(".sdEnteredWrapper").innerHTML = "";
        if (element.tagName === "SELECT") {
            [...element.options].forEach((o) => o.remove());
        } else if (element.tagName) {
            element.value = "";
        }
        values.forEach((v) => addEntered(instanceMap.get(Number(sd.dataset.sdcount)), sd, getValueFromOptions(instanceMap.get(Number(element.dataset.sdcount)), v), false));
    } else if (element.tagName === "SELECT" && element.multiple) {
        [...element.options].forEach((o) => { if (values.includes(o.value)) o.selected = true; });
    } else {
        element.value = values[0];
    }
}

export function autoCreate() {
    document.querySelectorAll(".searchdown").forEach((sd) => {
        const opts = Object.keys(sd.dataset)
            .filter((k) => k.startsWith("sd_"))
            .reduce((obj, k) => ({ ...obj, [k.slice(3)]: sd.dataset[k] }), {});
        if (!opts.values) {
            console.warn("Searchdown: element must have attribute 'data-sd_values' to be automatically created", sd);
            return;
        }
        searchdown(sd, opts);
    });
}

export { validate, reportValidity, SdOptions };

// Setup global click handler for closing dropdowns
if (typeof document !== "undefined") {
    document.addEventListener("click", (e) => {
        loseFocus(e.target.closest(".searchdown"));
        e.stopPropagation();
    });
}

// Auto-initialize on DOMContentLoaded (can be disabled)
export function enableAutoCreate() {
    if (typeof document !== "undefined") {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", autoCreate);
        } else {
            autoCreate();
        }
    }
}

export default searchdown;