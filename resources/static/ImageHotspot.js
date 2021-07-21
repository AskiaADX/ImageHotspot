(function () {
    var hoverCol = '';
    var likeColor = '';
    var neutralColor = '';
    var dislikeColor = '';
    var numResponses = 3;
    var likeOpt = 1;
    var currentQuestion = '';
    var showAreas = '';
    var areasColor = '';
    var opacity = 0;
    /**
     * it colors the area in yellow when mouse hover
     */
    function hoverIn() {
        areas = document.querySelectorAll("path");
        for(i=0; i<areas.length; ++i) {
        	if (areas[i].getAttribute("fill") == areasColor) areas[i].setAttribute("class", "unselected");
        }
        //if(this.node.getAttribute("fill") == areasColor) this.node.removeAttribute("class");
        //this.node.setAttribute("fill-opacity", "1");
        if (this.data("color") == "none") {
            this.node.removeAttribute("class");
            this.attr({
                cursor: 'pointer',
                fill: hoverCol,
                stroke: areasColor,
                'stroke-width': '0',
                opacity: 0.5
            });
        } else {
            this.attr({
                cursor: 'pointer'
            });
        }
    }

    /**
     * it removes the yellow color when mouse go out of the area
     */
    function hoverOut() {
     	//this.node.setAttribute("visibility", "collapse");
        areas = document.querySelectorAll("path");
        for(i=0; i<areas.length; ++i) {
        	if(areas[i].getAttribute("class") == "unselected") areas[i].setAttribute("class", "neutralArea");
        }
        if (this.data("color") == "none") {
            this.node.setAttribute("class", "neutralArea");
            this.attr({
                opacity: opacity,
                fill: areasColor,
                'stroke-width': '0'
            });
        }
    }

    /**
     * it changes the color of th area and updates the value of the inputs according to the clicked button
     * @param {HTMLElement} myDiv  div wich contains the ADC
     * @param {HTMLElement}   btn clicked button
     * @param {RaphaelPaper} area   selected area
     * @param {Array} values array of values for the inputs
     */
    function changeColor(myDiv, btn, area, values) {
        var index = area.data("name").substr(1);
        var response = myDiv.getElementsByTagName("input")[index];
        
        switch (btn.className) {
            case ("like"):
				area.node.setAttribute("class", "colored");
                response.value = values[0];
                area.attr({
                    fill: likeColor,
                    opacity: 0.5
                });
                area.data("color", "green");
                if (window.askia && 
                    window.arrLiveRoutingShortcut && 
                    window.arrLiveRoutingShortcut.length > 0 &&
                    window.arrLiveRoutingShortcut.indexOf(currentQuestion) >= 0) {
                    askia.triggerAnswer();
                }
                break;
            case ("neutral"):
                area.node.setAttribute("class", "colored");
                response.value = values[1];
                area.attr({
                    fill: neutralColor,
                    opacity: 0.5
                });
                area.data("color", "blue");
                if (window.askia && 
                    window.arrLiveRoutingShortcut && 
                    window.arrLiveRoutingShortcut.length > 0 &&
                    window.arrLiveRoutingShortcut.indexOf(currentQuestion) >= 0) {
                    askia.triggerAnswer();
                }
                break;
            case ("dislike"):
                area.node.setAttribute("class", "colored");
                response.value = (values[values.length - 1]);
                area.attr({
                    fill: dislikeColor,
                    opacity: 0.5
                });
                area.data("color", "red");
                if (window.askia && 
                    window.arrLiveRoutingShortcut && 
                    window.arrLiveRoutingShortcut.length > 0 &&
                    window.arrLiveRoutingShortcut.indexOf(currentQuestion) >= 0) {
                    askia.triggerAnswer();
                }
                break;
            case ("remove"):
                area.node.setAttribute("class", "neutralArea");
                response.value = "";
                area.attr({
                    fill: areasColor,
                    opacity: opacity
                });
                area.data("color", "none");
                if (window.askia && 
                    window.arrLiveRoutingShortcut && 
                    window.arrLiveRoutingShortcut.length > 0 &&
                    window.arrLiveRoutingShortcut.indexOf(currentQuestion) >= 0) {
                    askia.triggerAnswer();
                }
                break;
        }
    }

    /**
     * Add event to each buttons in the popup
     * @param {Array} buttons Array of buttons inside the popup
     * @param {RaphaelPaper} area    selected area
     * @param {HTMLElement} myDiv   div which contains the ADC
     * @param {Array} values  array of values for the inputs
     */
    function addButtonEvents(buttons, area, myDiv, values) {
        for (var j = 0; j < buttons.length; j++) {
            (function (j) {
                if (buttons[j].addEventListener) {
                    buttons[j].addEventListener("click", function (e) {
                        e.preventDefault();
                        changeColor(myDiv, this, area, values);
                        this.parentNode.className = this.parentNode.className.replace("show", "");
                    });
                } else {
                    buttons[j].attachEvent("onclick", function (e) {
                        e.preventDefault();
                        changeColor(myDiv, buttons[j], area, values);
                        buttons[j].parentNode.className = buttons[j].parentNode.className.replace("show", "");
                    });
                }
            }(j));
        }
    }

    /**
     * Displays the popup when an area is selected
     * @param {number} option Option which defines the number of buttons
     * @param {HTMLElement}   myDiv  div which contains the ADC
     * @param {RaphaelPaper} area   selected area
     */
    function displayPopup(event, option, myDiv, area) {
        var index = area.data("name").substr(1);
        var popup = myDiv.querySelectorAll(".popuptext")[index];
        popup.style.position = "fixed";
        var posleft = (event.clientX - (popup.clientWidth / 2) - 5);
        var postop = (event.clientY - popup.clientHeight - 10);
        
        if (posleft < 0) {
            posleft = 0;
        }
        
        if (postop < 0) {
            postop = 0;
        }
        
        popup.style.left = posleft + "px";
        popup.style.top = postop + "px";

        if (document.querySelectorAll(".show").length == 0) {
            var areas = document.querySelectorAll("path");
            for(i=0; i<areas.length; ++i) {
                if (areas[i].getAttribute("class") != "colored") areas[i].setAttribute("class", "neutralArea");
            }
            popup.className += " show";
        } else {
            document.querySelector(".show").className = document.querySelector(".show").className.replace("show", "");
			if(area.node.getAttribute("class") != "colored") this.node.removeAttribute("class");
            var areas = document.querySelectorAll("path");
            for(i=0; i<areas.length; ++i) {
                if (areas[i].getAttribute("class") == "unselected") areas[i].setAttribute("class", "neutralArea");
            }
        }
    }

    /**
    * Adds hidden span in button for web accessibility
    * @param
    */
    function addSpan(button) {
        var span = document.createElement("span");
        span.hidden = true;
        span.innerHTML = button.className.split(" ")[0];
        button.appendChild(span);
    }
    
    /**
     * Adds buttons in the popup
     * @param {HTMLElement} popup  Container of the popup
     * @param {number} option Option which defines the number of buttons
     */
    function addButtons(popup, option) {
        var buttonL = document.createElement("button"),
            buttonD = document.createElement("button"),
            buttonN = document.createElement("button"),
            buttonR = document.createElement("button");

        buttonD.className = "dislike";
        addSpan(buttonD);
        buttonL.className = "like";
        addSpan(buttonL);
        buttonN.className = "neutral";
        addSpan(buttonN);
        buttonR.className = "remove";
        addSpan(buttonR);

        if (option == 3) {
            popup.appendChild(buttonL);
            popup.appendChild(buttonN);
            popup.appendChild(buttonD);
            popup.appendChild(buttonR);
        } else {
            popup.appendChild(buttonL);
            popup.appendChild(buttonD);
            popup.appendChild(buttonR);
        }
    }

    /**
     * Creation of the popup
     * @param {HTMLElement} myDiv  dic which contains the ADC
     * @param {number} option Option which defines the number of buttons
     * @param {RaphaelPaper} area   Selected area
     * @param {Array} values Array of the values for the inputs
     */
    function createPopup(myDiv, option, area, values) {
        var popup = document.createElement("div");
        popup.className = "popuptext";
        myDiv.appendChild(popup);

        addButtons(popup, option);
        addButtonEvents(popup.children, area, myDiv, values);
    }

    /**
     * Changes the color of the selected area and the value of the corresponding input when option=1
     * @param {HTMLElement} myDiv  dic which contains the ADC
     * @param {RaphaelPaper} area   Selected area
     * @param {Array} values Array of the values for the inputs
     */
    function like(event, area, values, myDiv) {
        var index = area.data("name").substr(1);
        if (document.querySelectorAll(".show").length==0){
            if (area.data("color") == "none") {
                area.node.setAttribute("class", "colored");
                area.attr({
                    fill: likeColor,
					opacity: 0.5
                });
                area.data("color", "green");
                myDiv.getElementsByTagName("input")[index].value = (values[0]);
            } else {
                area.node.setAttribute("class", "neutralArea");
                area.attr({
                    fill: areasColor,
                    opacity: opacity
                });
                area.data("color", "none");
                myDiv.getElementsByTagName("input")[index].value = "";
            }
            if (window.askia && 
                window.arrLiveRoutingShortcut && 
                window.arrLiveRoutingShortcut.length > 0 &&
                window.arrLiveRoutingShortcut.indexOf(currentQuestion) >= 0) {
                askia.triggerAnswer();
            }
        }
    }

     /**
     * Changes the color of the selected area and the value of the corresponding input when option=-1
     * @param {HTMLElement} myDiv  div which contains the ADC
     * @param {RaphaelPaper} area   Selected area
     * @param {Array} values Array of the values for the inputs
     */
    function dislike(event, area, values, myDiv) {
        var index = area.data("name").substr(1);
        if (document.querySelectorAll(".show").length==0){
            if (area.data("color") == "none") {
				area.node.setAttribute("class", "colored");
                area.attr({
					fill: dislikeColor,
                    opacity: 0.5
                });
                area.data("color", "red");
                myDiv.getElementsByTagName("input")[index].value = (values[0]);
            } else {
				area.node.setAttribute("class", "neutralArea");
                area.attr({
                    fill: areasColor,
                    opacity: opacity
                });
                area.data("color", "none");
                myDiv.getElementsByTagName("input")[index].value = "";
            }
            if (window.askia && 
                window.arrLiveRoutingShortcut && 
                window.arrLiveRoutingShortcut.length > 0 &&
                window.arrLiveRoutingShortcut.indexOf(currentQuestion) >= 0) {
                askia.triggerAnswer();
            }
        }
        
    }

    /**
     * Initializes the color of areas according to the values of inputs
     * @param {RaphaelPaper} areas  Selected area
     * @param {Array} inputs Array of the inputs in the ADC
     * @param {Array} values Array of the values for the inputs
     * @param {Set}    set    Set which contains all the areas
     */
    function init(areas, inputs, values, set) {
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].value == values[0] && ((numResponses > 1) || ((numResponses == 1) && likeOpt == 1))) {
                areas[i].attr({
                    fill: likeColor,
                    opacity: 0.5
                });
                areas[i].data("color", "green");
            } else if (inputs[i].value == values[1] && numResponses == 3) {
                areas[i].attr({
                    fill: neutralColor,
                    opacity: 0.5
                });
                areas[i].data("color", "blue");
            } else if (inputs[i].value != "") {
                areas[i].attr({
                    fill: dislikeColor,
                    opacity: 0.5
                });
                areas[i].data("color", "red");
            }
            set.push(areas[i]);
        }
    }
    
    /**
     * Creates a new instance of ImageHotspot
     * @param {object} parameters Parameters of the ADC
     */
    function ImageHotspot(parameters) {
        //alert("ver 0.1")
        this.adcContainer = parameters.adcContainer;
        this.adcID = parameters.adcID;
        this.areas = parameters.areas;
        this.option = parameters.option;
        this.values = parameters.values;
        this.imageWidth = parseFloat(parameters.imageWidth);
        this.imageHeight = parseFloat(parameters.imageHeight);
        
        hoverCol = parameters.hoverColor;
        likeColor = parameters.likeColor;
        neutralColor = parameters.neutralColor;
        dislikeColor = parameters.dislikeColor;
        numResponses = parameters.numResponses;
        likeOpt = parameters.likeOpt;
        currentQuestion = parameters.currentQuestion;
        showAreas = parameters.showAreas;
        areasColor = parameters.areasColor;
        opacity = (showAreas === '1') ? 0.1 : 0;

        var myDiv = document.getElementById(this.adcID);
        myDiv.style.maxWidth = this.imageWidth + "px";
        myDiv.querySelector("img").style.maxWidth = this.imageWidth + "px";
        var imgWidth = myDiv.querySelector("img").clientWidth;
        var imgHeight = myDiv.querySelector("img").clientHeight;

        var paper = new Raphael(this.adcContainer, imgWidth, imgHeight);
        myDiv.querySelector("svg").style = "height:"+imgHeight+";width:"+imgWidth;
        myDiv.querySelector("svg").setAttribute("width", imgWidth);
       	myDiv.querySelector("svg").setAttribute("height", imgHeight);
       	myDiv.querySelector("svg").style.height = imgHeight;
        myDiv.querySelector("svg").style.width = imgWidth;
        var set = paper.set();
        var areas = [];
        
        for (var i = 0; i < this.areas.length; i++) {
            areas.push(paper.path(this.areas[i].paath).attr({
                'stroke-width': '0',
                opacity: opacity,
                fill: areasColor,
            }).data("color", "none").data("name", this.areas[i].name));
			areas[i].node.setAttribute("class", "neutralArea");
            createPopup(myDiv, this.option, areas[i], this.values);
        }
        
        init(areas, myDiv.getElementsByTagName("input"), this.values, set);
        
        var isTouch =  !!("ontouchstart" in window) || window.navigator.msMaxTouchPoints > 0;

        if( !isTouch ){
            // add class which defines hover behavior
            set.hover(hoverIn, hoverOut);
        }

        if (this.option >= 2) {
            set.click(function (event) {
                displayPopup(event, parameters.option, myDiv, this);
            });
        } else if (this.option == 1) {
            set.click(function (event) {
                like(event, this, parameters.values, myDiv);
            });
        } else if (this.option == -1) {
            set.click(function (event) {
                dislike(event, this, parameters.values, myDiv);
            });
        }
        
        var ratio = imgWidth / imgHeight;
        
        paper.setViewBox(0, 0, this.imageWidth, this.imageHeight);
        
        if (window.addEventListener) {
            window.addEventListener('mousedown', function(event){
                event.preventDefault();
                if ((event.target.tagName != "BUTTON") && document.querySelectorAll(".show").length>0){
                    document.querySelector(".show").className = document.querySelector(".show").className.replace("show", "");
                }
            });
        } else  {
            document.querySelector("body").attachEvent("onmouseup", function(event) {
                event.preventDefault();
                if ((window.event.srcElement.tagName == "BUTTON") && document.querySelectorAll(".show").length>0){
                    document.querySelector(".show").className = document.querySelector(".show").className.replace("show", "");
                }
            });
        }
        
        window.addEventListener("resize", function(e) {
            e.preventDefault;
            var width = myDiv.querySelector("img").clientWidth;
        	var height = myDiv.querySelector("img").clientHeight;        
            myDiv.querySelector("svg").setAttribute("width", '' + width + 'px');
            myDiv.querySelector("svg").setAttribute("height", '' + height + 'px');
            myDiv.querySelector("svg").style.height = '' + height + 'px';
            myDiv.querySelector("svg").style.width = '' + width + 'px';
		});
        
        
        myDiv.querySelector("img").addEventListener('load', function(e) {
            e.preventDefault;
            var width = myDiv.querySelector("img").clientWidth;
        	var height = myDiv.querySelector("img").clientHeight;
            myDiv.querySelector("svg").setAttribute("width", '' + width + 'px');
            myDiv.querySelector("svg").setAttribute("height", '' + height + 'px');
            myDiv.querySelector("svg").style.height = '' + height + 'px';
            myDiv.querySelector("svg").style.width = '' + width + 'px';
		});
		
    }
    

    window.ImageHotspot = ImageHotspot;

}());
