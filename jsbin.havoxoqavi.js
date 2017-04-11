var ws = new WebSocket("ws://107.173.43.102:8001");
var c=document.getElementById("canvas");
var ctx=c.getContext("2d");

var loaded = false;
var mouse = {"x":0, "y":0};
var lastOutline = {"x":0, "y":0};

var currentColor = 3;
var time = 1;
var shouldTimerShow = false;


ws.onmessage = function(data) {
  data = JSON.parse(data.data);
  
  if (data.type == "serverpixellist") {
    data.list.forEach(function(pxl) {
      drawPixel(pxl.color, pxl.x, pxl.y);
    });
    loaded = true;
  }
  
  if (loaded) {
      if (data.type == "serverpixel") {
        drawPixel(data.color, data.x, data.y);
      }
    
      if (data.type == "time") {
        time = data.time;
        setTime(m2s(time - Date.now()));
        console.log("Time recieved: " + data.time);
        if ((time - Date.now()) > 0) {
          setTime(m2s(time - Date.now()));
          showTime();
          shouldTimerShow = true;
        }
      }
    
  }
}

ws.onerror= function() {
  console.log("oh shit problem PROBLEM");
}

function setTime(timeset) {
  document.getElementById("time").innerHTML = timeset;
}

function hideTime() {
  document.getElementById("time").style.display = "none";
}

function showTime() {
  document.getElementById("time").style.display = "inline";
}

function requestTime() {
  ws.send(JSON.stringify({
    "type":"clienttimerequest"
  }));
}

function cc(color) {
  currentColor = color;
}

function sendPixel(color, x, y) {
  ws.send(JSON.stringify({
    "type":"clientpixel",
    "color":color,
    "x":x,
    "y":y
  }));
}

function drawPixel(color, x, y) {
  x = Math.floor(x/10);
  y = Math.floor(y/10);
  ctx.fillStyle="#" + colorToHex(color);
  ctx.fillRect(x*10, y*10, 10, 10);
}

function drawOutline(x, y) {
  var lastx = Math.floor(lastOutline.x/10)*10;
  var lasty = Math.floor(lastOutline.y/10)*10;
  ctx.clearRect(lastx-1, lasty-1, 12, 12);
  x = Math.floor(x/10)*10;
  y = Math.floor(y/10)*10;
  ctx.beginPath();
  ctx.lineWidth="2";
  ctx.strokeStyle="black";
  ctx.rect(x, y, 10, 10);
  ctx.stroke();
  lastOutline.x = x;
  lastOutline.y = y;
}

function clearRequest(password) {
  ws.send(JSON.stringify({
    "type":"clearrequest",
    "pass":password
  }));
}

function bypass(password) {
  ws.send(JSON.stringify({
    "type":"clientbypassrequest",
    "pass":password
  }));
}

function colorToHex(color) {
  var hex;
  if (color === 0) hex = 'FFFFFF';
  if (color === 1) hex = 'E4E4E4';
  if (color === 2) hex = '888888';
  if (color === 3) hex = '222222';
  if (color === 4) hex = 'FFA7D1';
  if (color === 5) hex = 'E50100';
  if (color === 6) hex = 'E59500';
  if (color === 7) hex = '9F6A42';
  if (color === 8) hex = 'E6D900';
  if (color === 9) hex = '94E145';
  if (color === 10) hex = '01BE00';
  if (color === 11) hex = '00D3DE';
  if (color === 12) hex = '0082C6';
  if (color === 13) hex = '0000EA';
  if (color === 14) hex = 'CF6DE4';
  if (color === 15) hex = '820180';
  return hex;
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.round((evt.clientX-rect.left)/(rect.right-rect.left)*canvas.width),
    y: Math.round((evt.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height)
  };
}

function m2s(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}


c.addEventListener('mousemove', function(event) {
  mouse = getMousePos(c, event);
  //drawOutline(mouse.x, mouse.y);
});

c.addEventListener('mousedown', function(event) {
  //console.log(getMousePos(c, event));
  mouse = getMousePos(c, event);
  console.log("click! Pixel placed at " + mouse.x + ", " + mouse.y);
  sendPixel(currentColor, mouse.x, mouse.y);
  //requestTime();
  setTime(m2s(time - Date.now()));
  if ((time - Date.now()) > 0) {
    setTime(m2s(time - Date.now()));
    showTime();
    shouldTimerShow = true;
  }
});

var waitForLoad = setInterval(function() {
  if (loaded) {
    console.log("Loading complete!");
    whenLoaded();
    clearInterval(waitForLoad);
  }
}, 100);

function whenLoaded() {
  
  requestTime();
  
    setInterval(function() {
      if ((time - Date.now()) > 0) {
         setTime(m2s(time - Date.now()));
      } else {
        hideTime();
      }
    }, 1000);
  
}