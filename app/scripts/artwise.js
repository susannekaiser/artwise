function Mondrian(P) {
  console.log('drawing Mondrian')

  var OperaVersion = 19; // global, used to avoid a bug in older versions of
            // Opera that let you into fullscreen, but won't let you out
var el = document.getElementById("canvas1");
var inst = document.getElementById('instructions');
var footer = document.getElementById('footer');

var mousePos = [];
var absoluteWidth = 0;
var absoluteHeight = 0;

for (i=0;i<9;i++) {
  mousePos.push([]);
  for (j=0;j<8;j++) {
    mousePos[i].push(0);
  }
}

var random = [];
for (i=0;i<6;i++) {
  random.push(Math.random());
  
}

var randomIndexes = [];
for (i=0;i<30;i++) {
  randomIndexes.push(randomIndex());
  
}


P.setup = function() {
  // anchor for tooltips
  $("body").append("<div id = 'tooltip_anchor'></div>");
  $("#tooltip_anchor").css({"position": "absolute","left":"0px","top":"0px"});
  // Let Opera 19 go fullscreen, earlier versions go full window
  var browser = navigator.userAgent.toLowerCase();
  if (browser.indexOf("opera") > -1) {
    var position = navigator.userAgent.search("Version") + 8;
    var version = navigator.userAgent.substring(position);
    OperaVersion = parseInt(version);
  }
  if ((document.fullscreenEnabled ||  
       document.webkitFullscreenEnabled || 
       document.msFullscreenEnabled ||
       document.mozFullScreenEnabled) && (OperaVersion > 18)) {
    setPreFullscreen();
  } else {
    setFullWindow();
  }
  P.background(255);
  P.smooth(8);
} 

  P.draw = function() {
     
    //dont do anything until we have data

    if (!artwise.data.length) return;
    P.frameRate(30);
    var speed = 120;
    var count = P.frameCount%speed;
    var count1 = (P.frameCount-1)%speed;
    var breath = 1 - (.015 * Math.sin(count/speed * 2 * Math.PI));
    var antibreath = 1 - (-1*.015 * Math.sin(count/speed * 2 * Math.PI));
    var breath1 = 1 - (.015 * Math.sin((count1)/speed * 2 * Math.PI));
    var antibreath1 = 1 - (-1*.015 * Math.sin((count1)/speed * 2 * Math.PI));

    P.background(255);
    absoluteWidth = P.width;
    absoluteHeight = P.height;
    var xUnit = 1/30 * absoluteWidth;
    var yUnit = 1/30 * absoluteHeight;

    // background black rectangles
    P.strokeWeight(5);

    for(j=0;j<30;j++) {
        var x = randomRange(randomIndexes[j+0 % 30], 0,29);
        var y = randomRange(randomIndexes[j+1 % 30], 0,29);
        var width = randomRange(randomIndexes[j+2 % 30], 1,29-x);
        var height = randomRange(randomIndexes[j+3 % 30], 1,29-y);
        P.rect(x*xUnit, y*yUnit, width*xUnit, height*yUnit);
        
    }
  
   for (i=0;i<artwise.data.length;i++) {
     var column = artwise.data[i];
     var set = {};
     switch (column.size) {
       case  'large':
         set.height = randomRange(0 % (i+1), 6,9); 
         set.width = randomRange(1 % (i+1), 6,9);
         break;
       case 'medium':

         set.height = randomRange(2 % (i+1), 3,6);
         set.width = randomRange(3 % (i+1), 3,6); 
         break;
       case 'small':
         set.height = randomRange(4 % (i+1), 1,3);  
         set.width = randomRange(5 % (i+1), 1,3);    
         break;
    }
     var min = column.column*10;
     var max = column.column*10 + (10-set.width);

     set.x = randomRange(5 % (i+1), min,max); 
     if ((column.color == 'red' && column.column == 0) || (column.color == 'blue' && column.column  == 1) || (column.color == 'yellow' && column.column == 2)) {
       var min = 0;
       var max = 10 - set.height;
       set.y = randomRange(5 % (i+1), min,max); 
     }
     else if ((column.color == 'red' && column.column == 1) || (column.color == 'blue' && column.column  == 2) || (column.color == 'yellow' && column.column == 0)) {
       var min = 10;
       var max = 20 - set.height;
       set.y = randomRange(5 % (i+1), min,max); 
     }
     else {
       var min = 20;
       var max = 30 - set.height;
       set.y = randomRange(5 % (i+1), min,max); 
     }

     if (column.color == 'red') {
        P.fill(255,0,0);
    }
    else if (column.color == 'yellow') {
        P.fill(255,212,71);
    } else {
        P.fill(9,34,117);
    }

    P.strokeWeight(7);
    P.stroke(0,125);

    P.rect(set.x*xUnit*antibreath1,set.y*yUnit *antibreath1,set.width*xUnit*breath1,set.height*yUnit*breath1);
    P.strokeWeight(5);
    P.stroke(0);
    P.rect(set.x*xUnit*antibreath,set.y*yUnit *antibreath,set.width*xUnit*breath,set.height*yUnit*breath);
    mousePos[i] = [
     set.x*xUnit*antibreath,
     set.y*yUnit *antibreath,
     set.x*xUnit*antibreath+set.width*xUnit*breath,
     set.y*yUnit *antibreath,
     set.x*xUnit*antibreath+set.width*xUnit*breath,
     set.y*yUnit *antibreath+set.height*yUnit*breath,
     set.x*xUnit*antibreath,
     set.y*yUnit *antibreath+set.height*yUnit*breath
  ];

// outside borderb
    P.stroke(0,0,0);
    P.strokeWeight(6);
    P.noFill();
    P.rect(3,3,absoluteWidth-6, absoluteHeight-6);
  }
}

  P.mouseMoved = function() {
  var offset = $("#canvas1").offset();
  var x = P.mouseX - offset.left;
  var y = P.mouseY - offset.top;
  var isActive = false;
  for (i = 0; i<9; i++) {
    if (x > mousePos[i][0] && x < mousePos[i][2] && y > mousePos[i][1] && y < mousePos[i][5]) {
    isActive = true; 
    $('#tooltip_anchor').tooltip("destroy");
     var centerX = (mousePos[i][0]+offset.left) + (((mousePos[i][2] + offset.left) -(mousePos[i][0]+offset.left))/2);
     var centerY = (mousePos[i][1] + offset.top) + (((mousePos[i][5] + offset.top) -(mousePos[i][1]+offset.top))/2) ;
     var tipText = artwise.data[i].info;
     var position = "top";
     console.log(centerY);
     console.log(centerX);
     if (centerY < (200)) {
       position = "bottom";
      }
     else if (centerX < (200 + offset.left)) {
       position = "right";
      }
     else if (centerX > (absoluteWidth - 200)) {
       position = "left";
      } 
     $('#tooltip_anchor').css({"position": "absolute","left":centerX +"px","top":centerY+"px"}).tooltip({"title":tipText,"placement":position}).tooltip("show");
    } 
  }
  if (isActive == false) {
      $('#tooltip_anchor').tooltip("destroy");
    }
  }  
    

  function randomRange(index, min,max) {
    return (parseInt(random[index]*  (max - min) + min));    
  }

  function randomIndex() {
    return parseInt(Math.random() * 5);
  }

  window.onresize = function() {
  if ((document.fullscreenEnabled || 
       document.webkitFullscreenEnabled || 
       document.msFullscreenEnabled ||
       document.mozFullScreenEnabled) && (inst.style.display == 'block')) {
    setPreFullscreen();
  } else {
    setFullWindow();
  }
  P.stroke(255); waitress=P.millis();
}
 
function setPreFullscreen() {
  el.style.position = "fixed";
  var divHeight = inst.offsetHeight;
  inst.style.display = 'block';
  var footerHeight = footer.offsetHeight;
  footer.style.display = 'block';
  var viewportWidth = window.innerWidth;
  var viewportHeight = window.innerHeight;
  var canvasWidth = viewportWidth*0.97;
  var canvasHeight = (viewportHeight-divHeight-footerHeight)*0.9;
  el.style.top = ((viewportHeight - divHeight - canvasHeight) / 2) + divHeight +"px";
  el.style.left = (viewportWidth - canvasWidth) / 2 +"px";
  el.setAttribute("width", canvasWidth);
  el.setAttribute("height", canvasHeight);
  P.size(canvasWidth, canvasHeight); // Processing
}
 
function setFullWindow() {
  el.style.position = "fixed";
  inst.style.display = 'none';
  footer.style.display = 'none';
  var canvasWidth = document.documentElement.clientWidth;
  var canvasHeight = document.documentElement.clientHeight;
  el.style.top = 0 +"px";
  el.style.left = 0 +"px";
  el.setAttribute("width", canvasWidth);
  el.setAttribute("height", canvasHeight);
  P.size(canvasWidth, canvasHeight); // Processing
}
 
// When user exits fullscreen via the 'Esc' key rather than by clicking
// on the sketch, this lets the canvas return to its initial size rather
// than filling the whole browser window... 
var changeHandler = function(){
  if (!(document.fullscreenElement||
        document.webkitFullscreenElement||
        document.mozFullScreenElement||
        document.msFullscreenElement)){
    inst.style.display = 'block';
    setPreFullscreen();
  }
}
document.addEventListener("fullscreenchange", changeHandler, false);
document.addEventListener("webkitfullscreenchange", changeHandler, false);
document.addEventListener("mozfullscreenchange", changeHandler, false);
document.addEventListener("MSFullscreenChange", changeHandler, false);
 
// must be part of sketch so it has access to global var OperaVersion
el.onclick=function(){toggleFullScreen()};
function toggleFullScreen() {
  if ((document.fullscreenEnabled || 
       document.webkitFullscreenEnabled || 
       document.msFullscreenEnabled ||
       document.mozFullScreenEnabled) && (OperaVersion > 18)) {  
    if (!document.fullscreenElement && 
        !document.mozFullScreenElement && 
        !document.webkitFullscreenElement && 
        !document.msFullscreenElement) { 
      inst.style.display = 'none';
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
    } else {
      inst.style.display = 'block';
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  }
}
}

function sketchProc(P) {
  Mondrian(P);
}
