function searchdown(elementId, options) {
    //check element exists
    let element = document.getElementById(elementId);
    if (!element) {
        console.error(`No element found for searchdown with id ${elementId}`);
        return false;
    }
    element.classList.add("searchdown");
    //create searchdown html
    let input = document.createElement("input");
    input.classList.add("sdInput");
    let dropdownWrapper = document.createElement("div");
    dropdownWrapper.classList.add("sdDropdownWrapper");
    dropdownWrapper.classList.add("hide");
    let dropdown = document.createElement("ul");
    dropdown.classList.add("sdDropdown");

    input.addEventListener("focus", (event) => {
        let target = event.currentTarget;
        //remove all existing options
        let dropdown = target.parentNode.querySelector(".sdDropdown");
        dropdown.querySelectorAll("li.sdOption:not(.sdAddOption)").forEach((li) => {
            li.remove();
        });
        //create option for each value
        for (let value of options.values) {
            let opt = document.createElement("li");
            opt.classList.add("sdOption");
            opt.innerText = value;
            dropdown.appendChild(opt);
        }
        target.parentNode.querySelector(".sdDropdownWrapper").classList.remove("hide");
    });

    element.appendChild(input);
    dropdownWrapper.appendChild(dropdown);
    element.appendChild(dropdownWrapper);
}

document.addEventListener("click", (event) => {
    let searchdown = event.target.closest(".searchdown");
    console.log(searchdown);
    if (searchdown) {
        searchdown.querySelector(".sdInput").focus();
    }
});
