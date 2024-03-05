let sdGlobalCount = 0;

function searchdown(elementId, options) {
    //check element exists
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`No element found for searchdown with id ${elementId}`);
        return false;
    }
    //set default values
    if (!options) {
        options = {
            values: [],
            sort: undefined, //undefined, "ASC", "DESC"
            limit: 0, //0 means no limit and is default
            multiple: false,
            addValues: true,
            saveEntered: true,
            hideEntered: true,
            allowDuplicates: false,
            caseSensitive: false,
            placeholder: "Search",
            maxHeight: 600,
            inputName: "sd" + sdGlobalCount++,
            initialValues: [],
            simpleInput: false,
            textarea: false,
        };
    } else {
        if (options.values === undefined || !Array.isArray(options.values)) options.values = [];
        if (options.sort !== undefined && options.sort !== "ASC" && options.sort !== "DESC") options.sort = undefined;
        if (options.limit === undefined || isNaN(options.limit)) options.limit = 0;
        if (options.multiple === undefined || typeof options.multiple !== "boolean") options.multiple = false;
        if (options.addValues === undefined || typeof options.addValues !== "boolean") options.addValues = true;
        if (options.saveEntered === undefined || typeof options.saveEntered !== "boolean") options.saveEntered = true;
        if (options.hideEntered === undefined || typeof options.hideEntered !== "boolean") options.hideEntered = true;
        if (options.allowDuplicates === undefined || typeof options.allowDuplicates !== "boolean") options.allowDuplicates = false;
        if (options.caseSensitive === undefined || typeof options.caseSensitive !== "boolean") options.caseSensitive = false;
        if (options.placeholder === undefined) options.placeholder = "Search";
        if (options.maxHeight === undefined || isNaN(options.maxHeight)) options.maxHeight = 600;
        if (options.inputName === undefined || options.inputName === "") options.inputName = "sd" + sdGlobalCount++;
        if (options.initialValues === undefined || !Array.isArray(options.initialValues)) options.initialValues = [];
        if (options.simpleInput === undefined || typeof options.simpleInput !== "boolean") options.simpleInput = false;
        if (options.textarea === undefined || typeof options.textarea !== "boolean") options.textarea = false;
    }
    //set colours
    if (options.baseBackColor) {
        element.style.setProperty("--sdBackBase", options.baseBackColor);
    }
    if (options.selectedBackColor) {
        element.style.setProperty("--sdBackSelected", options.selectedBackColor);
    }
    if (options.hoverBackColor) {
        element.style.setProperty("--sdBackHover", options.hoverBackColor);
    }
    if (options.baseTextColor) {
        element.style.setProperty("--sdTextBase", options.baseTextColor);
    }
    if (options.selectedTextColor) {
        element.style.setProperty("--sdTextSelected", options.selectedTextColor);
    }
    if (options.hoverTextColor) {
        element.style.setProperty("--sdTextHover", options.hoverTextColor);
    }
    //searchdown class
    element.classList.add("searchdown");
    if (options.textarea) {
        element.classList.add("textarea");
    }
    //create searchdown html
    let inputWrapper = document.createElement("div");
    inputWrapper.classList.add("sdInputWrapper");
    let input = document.createElement(options.textarea ? "textarea" : "input");
    input.placeholder = options.placeholder;
    input.classList.add("sdInput");
    input.name = options.inputName + "LastInput";
    //create input or select
    let enteredInput;
    if (options.multiple) {
        enteredInput = document.createElement("select");
        enteredInput.multiple = true;
    } else {
        enteredInput = document.createElement("input");
        enteredInput.type = "text";
    }
    enteredInput.classList.add("sdHide");
    enteredInput.classList.add("sdEnteredInput");
    enteredInput.name = options.inputName;
    enteredInput.id = "sdInput-" + options.inputName;
    let dropdownWrapper = document.createElement("div");
    dropdownWrapper.classList.add("sdDropdownWrapper");
    dropdownWrapper.classList.add("sdHide");
    let dropdown = document.createElement("ul");
    dropdown.classList.add("sdDropdown");
    let enteredWrapper = document.createElement("div");
    enteredWrapper.classList.add("sdEnteredWrapper");
    if (options.addValues && !options.simpleInput) {
        let addOption = document.createElement("li");
        addOption.classList.add("sdAddOption");
        addOption.addEventListener("click", (event) => {
            let searchdown = event.target.closest(".searchdown");
            let value = searchdown.querySelector(".sdInput").value;
            if (value !== "") {
                sdAddEntered(options, searchdown, value, true);
                if (options.saveEntered) {
                    options.values.push(value);
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
                if (options.saveEntered && targetValue !== "") {
                    options.values.push(targetValue);
                }
                value = targetValue;
            }
            if (targetValue !== "" || !selected.classList.contains("sdAddOption")) {
                sdAddEntered(options, searchdown, value, true);
                sdSearchAndShowDropdown(options, target, "");
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
            if (options.multiple) {
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
        sdResizeInput(target, event.key, options.simpleInput, options.textarea);
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

    element.dataset.options = JSON.stringify(options);

    if (options.simpleInput) {
        if (options.textarea) {
            input.style.width = "280px";
        } else {
            input.style.width = "100%";
        }
    } else {
        var computedStyle = getComputedStyle(inputWrapper);
        input.style.width = inputWrapper.offsetWidth - (parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight)) + "px";
    }
    if (options.multiple) {
        for (let val of options.initialValues) {
            sdAddEntered(options, element, val, false);
        }
    } else {
        if (options.initialValues[0]) {
            sdAddEntered(options, element, options.initialValues[0], false);
        }
    }
}

document.addEventListener("click", (event) => {
    sdLoseFocus(event.target.closest(".searchdown"));
    event.stopPropagation();
});

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
        searchdown.querySelector(".sdInput").focus();
    } else {
        document.querySelectorAll(".searchdown .sdDropdownWrapper").forEach((sdDropdownWrapper) => {
            sdDropdownWrapper.classList.add("sdHide");
        });
    }
}

function sdAddEntered(options, searchdown, value, clearInput) {
    let enteredWrapper = searchdown.querySelector(".sdEnteredWrapper");
    let entered = enteredWrapper.querySelector(".sdEntered");
    let input = searchdown.querySelector(".sdInput");
    if (!options.multiple && entered) {
        entered.innerHTML = value;
    } else if (options.simpleInput) {
        input.value = value;
    } else {
        if (options.allowDuplicates || !sdEnteredContainsValue(enteredWrapper, value, options.caseSensitive)) {
            let entered = document.createElement("span");
            entered.classList.add("sdEntered");
            entered.innerHTML = value;
            entered.addEventListener("click", (event) => {
                const valToRemove = event.target.innerHTML;
                event.target.remove();
                //Remove value from enteredInput
                let enteredInput = searchdown.querySelector(".sdEnteredInput");
                if (options.multiple) {
                    enteredInput.querySelectorAll("option").forEach((opt) => {
                        if (opt.value === valToRemove) {
                            opt.remove();
                        }
                    });
                } else {
                    enteredInput.value = "";
                }
            });
            enteredWrapper.appendChild(entered);
        }
    }
    if (clearInput) {
        input.value = "";
    }
    sdResizeInput(input, input.value, options.simpleInput, options.textarea);
    //Add value to enteredInput
    let enteredInput = searchdown.querySelector(".sdEnteredInput");
    if (options.multiple) {
        let opt = document.createElement("option");
        opt.value = value;
        opt.selected = true;
        enteredInput.appendChild(opt);
    } else {
        enteredInput.value = value;
    }
}

function sdSearchAndShowDropdown(options, target, targetValue) {
    if (options.values.length !== 0 || options.addValues) {
        let searchdown = target.closest(".searchdown");
        let enteredWrapper = searchdown.querySelector(".sdEnteredWrapper");
        //filter values
        let filteredValues = options.values.filter((value) => {
            if (options.hideEntered && sdEnteredContainsValue(enteredWrapper, value, options.caseSensitive)) {
                return false;
            }
            //if caseSensitive
            if (options.caseSensitive) {
                return value.includes(targetValue);
            }
            return value.toLowerCase().includes(targetValue.toLowerCase());
        });
        //apply sort
        if (options.sort === "ASC") filteredValues.sort();
        else if (options.sort === "DESC") filteredValues.sort().reverse();
        //apply limit
        if (options.limit !== 0) filteredValues = filteredValues.slice(0, options.limit);
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
        if (options.values.includes(targetValue)) {
            if (sdAddOption) {
                sdAddOption.classList.add("sdHide");
            }
        } else {
            if (sdAddOption) {
                dropdown.appendChild(sdAddOption);
                sdAddOption.classList.remove("sdHide");
            }
            if (options.addValues && !options.simpleInput) {
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
            dropdownWrapper.style.maxHeight = Math.min(searchdown.getBoundingClientRect().top - document.querySelector("body").getBoundingClientRect().top, options.maxHeight) + "px";
        } else {
            dropdownWrapper.style.maxHeight = Math.min(document.querySelector("body").getBoundingClientRect().bottom - searchdown.getBoundingClientRect().bottom, options.maxHeight) + "px";
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
    let options = JSON.parse(element.closest(".searchdown").dataset.options);
    if (options.simpleInput) includeNotEntered = true;
    if (element.tagName === "SELECT") {
        let result = [];
        let options = element && element.options;
        let opt;

        for (let i = 0; i < options.length; i++) {
            opt = options[i];

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
            }
        }
    }
    return false;
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
        sdAddEntered(JSON.parse(searchdown.dataset.options), searchdown, value, false);
    });
    return false;
}
