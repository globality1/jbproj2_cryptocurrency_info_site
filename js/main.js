"use strict";
// call create catalog with coins information upon document ready
$().ready( () => {    
    setButtonsClick();
    fetchCoinsCatalog();
});

// get ajax data
function GetAjaxData(url, successCallBack, errorCallBack) {
    $.ajax({
        method: "GET",
        url: url,
        error: err => errorCallBack(err.message),
        success: response => successCallBack(response)
    });
};

// cleaning previous content in 
function implementNewContent(content, sectionId, name) {
    $(`#${sectionId}${name}`).empty();
    $(`#${sectionId}${name}`).append(content);
};

// adding loading bar to relevant section until data arrives and built in html
function loadingBarImplement(sectionId, name) {
    const loadingBar = `
    <div class="loader">
      <img class="loaderImg" src="img/35.gif">
    </div>
    `;
    $(`#${sectionId}${name}`).empty();
    $(`#${sectionId}${name}`).append(loadingBar);
};

// changes collapse status of information section of the coin.
function changeCollapseState(sectionId, name) {
    if($(`#${sectionId}${name}`).hasClass('show')) {
      $(`#${sectionId}${name}`).removeClass('show');
    } else {
      $(`#${sectionId}${name}`).addClass('show');  
    }
};

// creates session storage for coin information with time of API pull
function setCoinSessionStorage(coinName, content) {
    removeCoinSessionStorage(coinName);
    sessionStorage.setItem(coinName, content);
    let timeNow = new Date();
    sessionStorage.setItem(`${coinName}Time`, timeNow);
    setTimeout( () => removeCoinSessionStorage(coinName) ,120000); 
};

// removes coin session storage 
function removeCoinSessionStorage(coinName) {
    sessionStorage.removeItem(coinName);
    sessionStorage.removeItem(`${coinName}Time`);
};

// checks time difference in minutes between current date and given
function minutesDifference(dateToCheck) {
    let previousDate = new Date(dateToCheck);
    let dateNow = new Date();
    let minutesDifference = (dateNow.getTime() - previousDate.getTime()) / 1000;
    minutesDifference /= 60;
    return minutesDifference;
};

// changes display of the sectons on one paage site
function changeSectionToDisplay(coinsSection,liveGraphsSection,aboutSection) {
    $('#coinsCatalogMain')[0].style.display = coinsSection;
    $('#graphReportsMain')[0].style.display = liveGraphsSection;
    $('#aboutMain')[0].style.display = aboutSection;
};

// generates random rgb color
function generateRandomRGBColor() {
    let r = Math.floor(Math.random()*256);
    let g = Math.floor(Math.random()*256);
    let b = Math.floor(Math.random()*256); 
    let rgb = 'rgb(' + r + ',' + g + ',' + b + ')';
    return rgb;
};

// set buttons to be have function on clicking them
function setButtonsClick() {
    document.getElementById('coinList').onclick = () => fetchCoinsCatalog();
    document.getElementById('liveReports').onclick = () => liveResults();
    document.getElementById('about').onclick = () => aboutMe();
    document.getElementById('search').onkeyup= () => searchFunction();
};

// grabs coin catalog and add loading icon until it's ready
function fetchCoinsCatalog() {
    // window.clearInterval(dataCreationInterval);
    changeSectionToDisplay('',"None","None");
    if ( Number($('#coinsCatalog div').length) == 0 ) {
        loadingBarImplement("coins", "Catalog");
        if(sessionStorage.getItem("coinsCatalogFromAPI") != null) {
           setTimeout(() => restoreFromSessionStorage("coinsCatalogFromAPI", response => createCoinsCatalog(response)),20);
        } else {
           GetAjaxData("https://api.coingecko.com/api/v3/coins/list", response => createCoinsCatalog(response))
        }
    }
    
};

// restore info from sessionstorage from asynch function
function restoreFromSessionStorage(valueName,callbackFunction) {
    let restoreObj = $.parseJSON(sessionStorage.getItem(valueName));
    callbackFunction(restoreObj);
};

// creates coins catalog from the received coins data
function createCoinsCatalog(coinsCatalogData) {
    $("#coinsCatalog").empty();
    let htmlResult = '';
    for(let coin of coinsCatalogData) {
        const newDiv = `
            </br>
            <div id='coinDisplay' class="coin col-sm-3" name="coinDisplayDiv">
              <div class="custom-control custom-switch">
                 <input type="checkbox" class="custom-control-input" name="${coin.symbol}" id="customSwitches${coin.symbol}" onclick="clickToFollow('${coin.symbol}')">
                 <label class="custom-control-label" for="customSwitches${coin.symbol}">Watch</label>
              </div>
              <div>
                 <h3 class="coinName">${coin.symbol}</h3>
              </div>
              <div>
                 <p class="coinNameInfo">${coin.id}</p>
              </div>
              <button id="${coin.symbol}InfoButton" type="button" data-toggle="collapse" data-target="#${coin.symbol}MoreInfo" class="btn btn-primary btn-sm moreInfo" onclick="fetchCoinData('${coin.id}')">
                 More Info
              </button>
              </br>
              </br>
              <div id="${coin.id}MoreInfo" class="collapse card card-body">
              </div>
            </div>
            `;
        htmlResult += newDiv;
    }
    $('#coinsCatalog').append(htmlResult);
    sessionStorage.setItem("coinsCatalogFromAPI", JSON.stringify(coinsCatalogData));
};

// fetching individual coin information and calls displayCoinData to display coin information
function fetchCoinData(coinId) {
    const infoSectionName = "MoreInfo";
    if( sessionStorage.getItem(`${coinId}`) == null || minutesDifference(sessionStorage.getItem(`${coinId}Time`)) > 2  ) {
       changeCollapseState(coinId, infoSectionName);
       loadingBarImplement(coinId, infoSectionName);
       GetAjaxData(`https://api.coingecko.com/api/v3/coins/${coinId}`, response => displayCoinData(response), err => console.log(err));
    } else {
       implementNewContent(sessionStorage.getItem(`${coinId}`), coinId, infoSectionName)
       changeCollapseState(coinId, infoSectionName);
    }

};

// creating view for individual coin information
function displayCoinData(coin) {
    const infoSectionName = "MoreInfo";
    let coinDataDiv = `
      <div class="row">
        <div class="col-sm-4" id="coinImage">
          <img src="${coin.image.thumb}">
        </div>
        <div class="col-sm-8" id="coinPrices">
          <p> 
            USD: ${coin.market_data.current_price.usd}$</br>
            EUR: ${coin.market_data.current_price.usd}€</br>
            ILS: ${coin.market_data.current_price.ils}₪</br> 
          </p>
        </div>
      </div>
      `;
    implementNewContent(coinDataDiv, coin.id, infoSectionName);
    setCoinSessionStorage(coin.id, coinDataDiv);   
};

// function to filter displayed results on the coin screen
function searchFunction() {
    let input, filter, innerCoins, coinName, i, coinNameValue;
    input = document.getElementById("search");
    filter = input.value.toUpperCase();
    innerCoins = document.getElementsByName("coinDisplayDiv");
    for (let i = 0; i < innerCoins.length; i++) {
        coinName = innerCoins[i].getElementsByTagName("h3")[0];
        coinNameValue = coinName.textContent || coinName.innerText;
        if (coinNameValue.toUpperCase() == filter || filter === "") {
            innerCoins[i].style.position = "";
            innerCoins[i].style.left = "";
        } else {
            innerCoins[i].style.position = "absolute";
            innerCoins[i].style.left = "-999em";
        }
    }
};

// checks if array is above 5 (this is what decides how many coins to allow to follow on graphs),if aobve, sends to pop up window, otherwise adds/removes as usual
function clickToFollow(coinId) {
    let arrayOfSelectedCoins = new Array(getCurrentSelectedCoin());
    if(Number(arrayOfSelectedCoins[0].length) < 5 ) {
        if($(`#customSwitches${coinId}`).is(':checked') == true ) {
            $(`#customSwitches${coinId}`).addClass("activeSelection");
        } else {
            removeFromCoinsArray(coinId);
        }
    }
    if(Number(arrayOfSelectedCoins[0].length) >= 5) {
        if($(`#customSwitches${coinId}`).is(':checked') == true ) {
            $(`#customSwitches${coinId}`).prop("checked", false);
            createSelectionPopUp(arrayOfSelectedCoins[0],coinId);
        } else {
            removeFromCoinsArray(coinId);
        }
    }
};

// removes coin from array and also unchecks the checkbox of it.
function removeFromCoinsArray(coinId) {
    $(`#customSwitches${coinId}`).prop("checked", false);
    $(`#customSwitches${coinId}`).removeClass("activeSelection");
         
};

// adds coin to array and checks the checkbox of it
function addToCoinsArray(coinId) {
    $(`#customSwitches${coinId}`).addClass("activeSelection");
    $(`#customSwitches${coinId}`).prop("checked", true);
};

// returns array of the selected coins
function getCurrentSelectedCoin() {
    let arrayOfSelectedCoins =[];
    const elements = document.querySelectorAll('.custom-control-input.activeSelection');
    for (const elem of elements) {
           arrayOfSelectedCoins.push((elem.name));
          };
    return arrayOfSelectedCoins;
};

// creates selectionPopUp to remove coins or just do nothing.
function createSelectionPopUp(arrayOfSelectedCoins,coinIdToAddBack) {
    let myWindow = window.open("", "limit_exceed_select_pop_up", "width=300,height=350");
    let coinsMenu = createCoinsMenu(arrayOfSelectedCoins);
    // creates new window with coin unselection
    myWindow.document.write(`
    <html>
    <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" async>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" async></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.bundle.min.js" async></script>
        <script>
            let myWindow = window;
            function closeWindow() {
               myWindow.close();
            }
            function returnCoin(coinId) {
               setTimeout(() => myWindow.close(),10);
               myWindow.opener.removeFromCoinsArray(coinId);
               myWindow.opener.addToCoinsArray('${coinIdToAddBack}');
            }
        </script>
        <title>Ooops! Limit Reached!</title>
    </head>
    <body>  
    <p> 
        You are Trying to Add: <b>${coinIdToAddBack}</b>.
        <br>
        You have reached the selection <b>Limit (5)</b>! 
        <br>
        Please <b>un-select previous</b> coin from menu or <b>close the pop-up</b>.
    </p>
    </br>
    ${coinsMenu}
    </br>
    <button class="btn btn-danger btn-rounded" onclick="closeWindow(myWindow)"> 
        Close
    </button>
    </body>
    </html>
    `
    );

    // creates selection menu of coins that exists in array
    function createCoinsMenu(arrayToCreateFrom) {
        let coinsToUncheck = '';
        for (let i=0; i <= Number(arrayToCreateFrom.length); i++) {
            if( arrayToCreateFrom[i] != undefined) {
                coinsToUncheck += `
               <div class="custom-control custom-switch">
                  <input type="checkbox" checked class="custom-control-input" id="customSwitchTwo${arrayToCreateFrom[i]}" onclick="returnCoin('${arrayToCreateFrom[i]}')">
                  <label class="custom-control-label" for="customSwitchTwo${arrayToCreateFrom[i]}"> Remove ${arrayToCreateFrom[i]}</label>
                </div>
            `}
        }
        return coinsToUncheck;
    }
};

// displays about me section
function aboutMe() {
    changeSectionToDisplay("None","None","");
};

// call live reports function to display live reports
function liveResults() {
    let arrayOfSelectedCoins = new Array(getCurrentSelectedCoin());
    if(Number(arrayOfSelectedCoins[0].length) > 0) {
      changeSectionToDisplay("None","","None");
      generateTable();
    } else {
        alert("Please select at least 1 coin to watch on the graphs")
    }   
};

// generates the graph table and doing all sort of twitches inside
function generateTable() {
	let graphObj = new CanvasJS.Chart("chartContainer", {
			title : {
				text : "Price comparisson of:  " + getCurrentSelectedCoin()
            },
            axisX:{
                valueFormatString: "HH:MM:ss"
            },
            axisY: {
                title: "Price",
                suffix: "$",
                minimum: 0
            },
            toolTip:{
                shared:true
            },  
            legend:{
                cursor:"pointer",
                verticalAlign: "bottom",
                horizontalAlign: "left",
                dockInsidePlotArea: true,
            },
			data: [
			]
    });

    // creates all selected coins graph properties
    function createAllCoinsObjForGraph(graphObj) {
        let arrayOfSelectedCoins = new Array(getCurrentSelectedCoin());
        for( let i=0; i < Number(arrayOfSelectedCoins[0].length); i++) {
            graphObj.options.data.push(createCoinGraphObject(arrayOfSelectedCoins[0][i]));
        }
        getCoinDataPoint(arrayOfSelectedCoins);
    };
    
    // updates chart with datapoints
    let updateChart = function () {
        let arrayOfSelectedCoins = new Array(getCurrentSelectedCoin());
		getCoinDataPoint(arrayOfSelectedCoins);
        graphObj.options.title.text = "Last Updated at " + createBeautifullDate();  	
    };
    
    // creates organized date to display
    function createBeautifullDate() {
        let timeToDisplay = new Date()
        return timeToDisplay.getFullYear() + "-" + (timeToDisplay.getMonth() + 1) + "-" + timeToDisplay.getDate() + "  " + timeToDisplay.getHours() + ":" + timeToDisplay.getMinutes() + ":" + timeToDisplay.getSeconds()
    }

    
    // creates the coin graph property
    function createCoinGraphObject(coinId) {
        let coinGraphObj = {
            type: "line",
            showInLegend: true,
            name: coinId,
            markerType: "circle",
            xValueFormatString: "YYYY-MM-DD HH:MM:ss",
            color: generateRandomRGBColor(),
            yValueFormatString: "#,###.######$",
            dataPoints:[]
        };

        // getCoinDataPoint(coinId);
        return coinGraphObj    
    }

    // pushesh new cordinates for specific coin inside of th graphObj object
    function addNewDataPoint(coinId, dataPoint) {
        for( let i=0; i < graphObj.options["data"].length; i++ ) {
            let name = coinId.toString().toUpperCase();
            let checkname = graphObj.options.data[i].name;
            checkname = checkname.toString().toUpperCase();
            if(checkname == name) {
                graphObj.options.data[i].dataPoints.push(dataPoint);
            }
        }
    }

    // creates new data point for specific given data
    function createDataPoint(coinsDataReceived) {
        let coinsData = new Object(coinsDataReceived);
        for( let coin in coinsData) {
            let priceObj = new Object(); 
            priceObj.x = new Date();
            priceObj.y = coinsData[coin.toString().toUpperCase()].USD;
            let coinId = coin.toString().toLowerCase();
            addNewDataPoint(coinId, priceObj);
        } 
    }

    // pulls coins prices from the api pull
    function getCoinDataPoint(coinsArray) {
        let coinName = coinsArray.toString().toUpperCase();
        GetAjaxData(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinName}&tsyms=USD`, response => createDataPoint(response) , err => console.log(err));
    }
    
    // resets buttons functions to remove graph update interval
    function setButtonsClicNew(intervalToStop) {
        document.getElementById('coinList').onclick = () => {fetchCoinsCatalog(); clearInterval(intervalToStop)};
        document.getElementById('about').onclick = () => {aboutMe(); clearInterval(intervalToStop)};
    };

    // update chart every second
    createAllCoinsObjForGraph(graphObj);
    let intervalOfDataUpdate = setInterval(function(){updateChart(); graphObj.render();}, 2000);
    setButtonsClicNew(intervalOfDataUpdate);

};