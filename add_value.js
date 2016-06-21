var getValues = function() {

    p = /\/ajax\/bbv\/vid\/([0-9]+)/gi;
    var matches = document.body.innerHTML.match(p);
    var url = matches[0];
    url = 'http://www.canadianblackbook.com' + url;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onreadystatechange = function () {
        var DONE = 4; // readyState 4 means the request is done.
        var OK = 200; // status 200 is a successful return.
        if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
                var data = JSON.parse(xhr.responseText);
                var i;
                var ys = [];
                var xs = [];
                for (i = 0; i < data.items.length; i++) {
                    ys.push(data.items[i].price);
                    xs.push(data.items[i].kilometers);
                }
                calculateSlope(xs, ys);

                console.log(xhr.responseText); // 'This is the returned text.'
            } else {
                console.log('Error: ' + xhr.status); // An error occurred during the request.
            }
        }
    };xhr.send(null);

};

var calculateSlope = function(values_x, values_y) {
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var count = 0;

    /*
     * We'll use those variables for faster read/write access.
     */
    var x = 0;
    var y = 0;
    var values_length = values_x.length;

    if (values_length != values_y.length) {
        throw new Error('The parameters values_x and values_y need to have same size!');
    }

    /*
     * Nothing to do.
     */
    if (values_length === 0) {
        return;
    }

    /*
     * Calculate the sum for each of the parts necessary.
     */
    for (var v = 0; v < values_length; v++) {
        x = values_x[v];
        y = values_y[v];
        sum_x += parseInt(x, 10);
        sum_y += parseInt(y, 10);
        sum_xx += x*x;
        sum_xy += x*y;
        count++;
    }

    /*
     * Calculate m and b for the formular:
     * y = x * m + b
     */
    window.betterment.m = (count*sum_xy - sum_x*sum_y) / (count*sum_xx - sum_x*sum_x);
    window.betterment.b = (sum_y/count) - (window.betterment.m*sum_x)/count;

};

window.betterment = {};
getValues();

Number.prototype.formatMoney = function(places, symbol, thousand, decimal) {
    places = !isNaN(places = Math.abs(places)) ? places : 2;
    symbol = symbol !== undefined ? symbol : "$";
    thousand = thousand || ",";
    decimal = decimal || ".";
    var number = this,
        negative = number < 0 ? "-" : "",
        i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
};

var estimator = document.createElement("form");
var input = document.createElement("input");
input.setAttribute("id", "betterment-in");
input.setAttribute("placeholder", "Enter odometer kms");
var button = document.createElement("button");
button.setAttribute("type", "button");
button.setAttribute("class", "estimatebutton");
button.innerHTML = "Estimate";

var doCalculation = function() {
    var price = (window.betterment.m * input.value) + window.betterment.b;
    var display = document.getElementById("estimate-display");
    display.getElementsByTagName("h2")[1].innerHTML = Math.floor(price).formatMoney(0, '$');
    display.setAttribute("style", display.getAttribute("style") + " display: block;")
};

button.onclick = doCalculation;

input.addEventListener('keypress', function(e){
    var key = e.which || e.keyCode;
    if (key === 13) {
        doCalculation();
        e.preventDefault();
    }
});

estimator.appendChild(input);
estimator.appendChild(button);

document.getElementById("odometer").appendChild(estimator);

var estimateDisplay = document.createElement("div");
estimateDisplay.setAttribute("style", "display: none; background-image: url(/static/img/backgrounds/bg_average_price.gif);  margin:20px 0px 0px 0px; height: 75px;");
estimateDisplay.id = "estimate-display";
var h21 = document.createElement("h2");
h21.setAttribute("style", "position:relative; color:#FFF; font-size:13px; top:29px; left:30px;");
h21.innerHTML = "ESTIMATED VALUE BY KM";

var h22 = document.createElement("h2");
h22.setAttribute("style", "position:relative; top:-1px; right:-280px;");

estimateDisplay.appendChild(h21);
estimateDisplay.appendChild(h22);


document.getElementsByClassName("top_car_big_left")[0].appendChild(estimateDisplay);
