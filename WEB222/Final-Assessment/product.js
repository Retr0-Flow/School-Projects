window.onload = function() {

    // Set activePage class on nav bar button that is active page
    var nbList = document.querySelector("#navbar-list").children;
    var url = window.location.href.replace(/\#/gi, "/")
    var urlArr = url.split('/');
    var curPage = urlArr.pop(); // should resolve to honestly.html, etc. if not, it'll loop through the array until it does
    while (!(curPage).match(/html$/gi)) {
        curPage = urlArr.pop();
    }
    var cmpVal = "./" + curPage;
    for (var i = 0; i < nbList.length; i++) {
        if (nbList[i].attributes[0].value === cmpVal) {
            nbList[i].classList.add("activePage");
        }
    }
}

// focuses user on invalid input, I know, it's jank as hell but it works for now
window.onclick = (event) => {
    if (event.target.parentElement != null) {
        if (event.target.parentElement.parentElement != null) {
            if (event.target.parentElement.className == "error-item") {
                document.querySelector(event.target.parentElement.attributes["focusLink"].value).focus();
            }
            else if (event.target.parentElement.className == "errors") {
                document.querySelector(event.target.parentElement.parentElement.attributes["focusLink"].value).focus();
            }
        }
    }

    return event;
}

// validates text based on regex check and len requirements
function validText(str, regex, len) {
    var descStr = String(str).trim();
    var lenCheck = false;
    var contentCheck = false;
    
    if (descStr.length >= len) {
        lenCheck = true;    
    }
    
    if (regex.test(descStr)) {
        contentCheck = true;
    }
    
    if (lenCheck && contentCheck) {
        return 1;
    }
    else {
        if (!lenCheck && !contentCheck) {
            return -3;
        }
        else if (!lenCheck) {
            return -2;
        }
        else if (!contentCheck) {
            return -1;
        }
    }
}

// deletes all child nodes of the error box
function clearErrs() {
    var errBox = document.querySelector("#errorBox");
    errBox.setAttribute("hidden", "");
    while(errBox.hasChildNodes()) {
        errBox.removeChild(errBox.children[0]);
    }
}

// Error types and their values
var errTypes = {
    lenErr: "The input doesn\'t meet length requirements!",
    styleErr: "The input doesn\'t match the input style requirements!",
    selecErr: "You must select at least one checkbox!"
};

// creates, populates, appends a link to a described error
function createErrBoxElem(errObj, errLoc, errName){
    var errBox = document.querySelector("#errorBox");
    var errCount = errBox.childElementCount;
    var linkToErr = document.createElement("div");
    linkToErr.setAttribute("focusLink", errLoc);
    linkToErr.setAttribute("class", "error-item")
    linkToErr.setAttribute("title", "Click to jump to the invalid input!");

    if (errCount >= 3) {
        linkToErr.setAttribute("hidden", "");
    }
    
    var eName = document.createElement("label");
    var strErrName = String(errName).replace(/\-/gi, " ");
    eName.setAttribute("class", "errored-input-name")
    eName.appendChild(document.createTextNode(strErrName + ":"));

    var errMsgs = document.createElement("ul");
    errMsgs.setAttribute("class", "errors")
    for (var err of errObj) {
        var listItem = document.createElement("li");
        listItem.appendChild(document.createTextNode(err));
        errMsgs.appendChild(listItem);
    }
    
    linkToErr.appendChild(eName);
    linkToErr.appendChild(errMsgs);
    errBox.appendChild(linkToErr);
}

/* 
    function for adding errors to the error box, uses createErrBoxElem() to do the creation while this func. handles the 
    data input, can be considered abstraction (maybe? still not sure if this one was necessary)
*/
function addErr(errCode, errLoc, errName) {
    switch (errCode) {
        case -4:
            createErrBoxElem([errTypes["selecErr"]], errLoc, errName);
            break;
        case -3:
            createErrBoxElem([errTypes["lenErr"], errTypes["styleErr"]], errLoc, errName);
            break;
        case -2:
            createErrBoxElem([errTypes["lenErr"]], errLoc, errName);
            break;
        case -1:
            createErrBoxElem([errTypes["styleErr"]], errLoc, errName);
            break;
    }
}

// checks for valid product id
function validProdID() {
    var id = document.querySelector("#productID").value;

    if (id >= 10000000 && id <= 99999999) {
        return true;
    }
    else
    {
        addErr(-2, "#productID", "Product-ID-Error");
        return false;
    }
}

// checks for valid product description
function validDesc(desc) {
    var regex = new RegExp("^[A-Z][a-zA-Z]{19,}", "g");
    var res = validText(desc, regex, 20);
    
    if (res === 1) {
        return true;
    }
    else {
        addErr(res, "#productDesc", "Product-Description-Error");
        return false;
    }
}

// checks for valid product price
function validProdPrice(price) {
    if (price % 1 === 0) {
        return true;
    }
    else {
        addErr(-1, "#productPrice", "Product-Price-Error");
        return false;
    }
}

// checks for valid supplier username
function validUsrName(usrName) {
    var regex = new RegExp("^[a-zA-Z].{5,}", "g");
    var res = validText(usrName, regex, 6);

    if (res === 1) {
        return true;
    }
    else {
        addErr(res, "#suppUsrName", "Supplier-Username-Error");
        return false;
    }
}

// checks for valid number of supplier statuses selected
function validCheckboxes() {
    var objs = Array.from(document.querySelectorAll(".suppStatus"));
    var count = 0;

    for (var i of objs) {
        if (i.checked) {
            count++;
        }
    }

    if (count === 0) {
        addErr(-4, "#newSupp", "Supplier-Status-Error");
        return false;
    }
    else
    {
        return true;
    }
}

// checks for valid supplier email
function validEmail(email) {
    // fun fact, I went online and looked up naming requirements for emails and made this regex to match the requirements
    var regex = /[a-zA-Z\d\#\!\%\$\'\&\+\*\-\/\=\?\^\_\`\.\{\|\}\~]{3,64}@[a-zA-Z\d\-]{2,63}\.[a-zA-Z\.]{1,62}[a-zA-Z]$/g;
    var res = validText(email, regex, 8);
    
    if (res === 1) {
        return true;
    }
    else {
        addErr(res, "#suppEmail", "Supplier-Email-Error");
        return false;
    }
}

// onsubmit function called to ensure data is valid before being POST'd
function formValidation() {
    clearErrs();
    var form = document.querySelector("#product-form");
    var prodIDcheck = validProdID();
    var prodDescCheck = validDesc(form.productDesc.value);
    var prodPriceCheck = validProdPrice(form.productPrice.value);
    var suppUnameCheck = validUsrName(form.suppUsrName.value);
    var suppStatusCheck = validCheckboxes();
    var suppEmailChcek = validEmail(form.suppEmail.value);
    
    if (prodIDcheck && prodDescCheck &&
        prodPriceCheck && suppUnameCheck && 
        suppStatusCheck && suppEmailChcek) {
            alert("Success! Form successfully submitted!");
        return true;
    }
    else {
        var errBox = document.querySelector("#errorBox");
        errBox.removeAttribute("hidden");
        return false;
    }
}

/* 
    resets form -- I noticed reset could do this by default with no function supplied but I wasn't sure if
    we're allowed to do it that way so I made this function instead just to be sage :D
*/
function clrForm() {
    clearErrs();
    var form = document.querySelector("#product-form");
    form.productID.value = "";
    form.productDesc.value = "";
    form.productPrice.value = "";
    form.suppUsrName.value = "";
    
    for (var checkbox of document.querySelectorAll(".suppStatus")) {
        checkbox.checked = false;
    }

    form.suppEmail.value = "";
}