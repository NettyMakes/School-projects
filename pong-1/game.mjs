// HTML interaksjon -----------------------------------------------------------
const canvas = document.getElementById("canvas"); // GI meg et ark
const brush = canvas.getContext("2d"); // Gi meg en malekost.

// GAME VARIABLES -------------------------------------------------------------
const MIN_SPEED = 2;
const MAX_SPEED = 4;

const PADDLE_PADDING = 10;
const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 75;

const NPC_SPEED = 3;

const CENTER = canvas.width / 2;
const RIGHT_BORDER = canvas.width;
const LEFT_BORDER = 0;







let secondsLeftOfGame = 90;
let gameOver = false;
let NPCPaddleLock = false;

const countdownTimer = {
  x: CENTER + 5,
  y: 30,

  color: "white",
  font: "20px Comic Sans MS",
  countdownText: "Time until doom: ",
}

const scoreboard = {
  x: CENTER-180,
  y: 90,

  color: "white",
  score: [0,0],
  font: "50px Comic Sans MS", //This is the only accepted font style
  scoreSpacing: CENTER,
}

const gameOverScreen = {
  x: 0,
  y: 0,

  color: "black",
  font: "50px Comic Sans MS",
  gameOverText: "WON!",
}







const ball = {
  x: 310,
  y: 230,
  radius: 10,
  color: "#FFFFFF",
  speedX: 0,
  speedY: 0,
};

const paddle = {
  x: PADDLE_PADDING,
  y: 0,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  color: "#daff33",
};

const npcPaddle = {
  x: canvas.width - PADDLE_PADDING - PADDLE_WIDTH,
  y: 0,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  color: "#ff33e4ff",
};

const pitch = {
  x: 0,
  y: 0,
  width: canvas.width,
  height: canvas.height,
  color: "#000",
};

// GAME ENGINE ----------------------------------------------------------------
function update() {
  moveBall(ball);
  movePaddle(npcPaddle);
  keepBallOnPitch(ball);
  dealWithColision(paddle, ball);
  dealWithColision(npcPaddle, ball);

  draw();

  if(gameOver){
    drawGameOver(gameOverScreen);
  }else{
    requestAnimationFrame(update);
  }
}

function draw() {
  clearCanvas();
  drawPitch(pitch);
  drawScoreboard(scoreboard);
  drawCountdownTimer(countdownTimer);
  drawBall(ball);
  drawPaddle(paddle);
  drawPaddle(npcPaddle);
}

function init() {
  centerVericalyItemIn(paddle, canvas);
  centerVericalyItemIn(npcPaddle, canvas);
  giveBallRandomSpeed(ball);
  timeManager();
  update();
}

init();

// GAME FUNCTIONS -------------------------------------------------------------

function movePaddle(paddle) {
  //paddle.y = ball.y - paddle.height * 0.5;

  if(NPCPaddleLock){
    return false;
  }


  let delta = ball.y - (paddle.y + paddle.height * 0.5);
  if (delta < 0) {
    paddle.y -= NPC_SPEED;
  } else {
    paddle.y += NPC_SPEED;
  }
}

function keepBallOnPitch(ball) {
  const leftBorder = ball.radius;
  const rightBorder = canvas.width - ball.radius;
  const topBorder = 0 + ball.radius;
  const bottomBorder = canvas.height - ball.radius;

  if (ball.x < leftBorder) {
    // Mål for NPC
    putBallInCenterOfPitch(ball);
    giveBallRandomSpeed(ball);
    scoreboard.score[1] += 1;

  }else if (ball.x > rightBorder){
    // Mål for Player
    putBallInCenterOfPitch(ball);
    giveBallRandomSpeed(ball);
    scoreboard.score[0] += 1;
    

  }

  if (ball.y <= topBorder || ball.y >= bottomBorder) {
    ball.speedY = ball.speedY * -1;
  }
}

function putBallInCenterOfPitch(ball) {
  ball.x = (canvas.width - ball.radius * 2) * 0.5;
  ball.y = (canvas.height - ball.radius * 2) / 2;
}

function giveBallRandomSpeed(ball) {
  ball.speedX = randomNumberBetween(MAX_SPEED, MIN_SPEED);
  ball.speedY = randomNumberBetween(MAX_SPEED, MIN_SPEED);

  if (Math.random() > 0.5) {
    ball.speedX = ball.speedX * -1;
  }
  if (Math.random() > 0.5) {
    ball.speedY = ball.speedY * -1;
  }
}

function dealWithColision(paddle, ball) {
  const paddleTop = paddle.y;
  const paddleBottom = paddle.y + paddle.height;
  let paddleBorder = paddle.x + paddle.width + ball.radius;
  let isRightSide = false;
  let isLeftSide = false;

  if (ball.x > CENTER && paddle.x > CENTER) {
    isRightSide = true;
    paddleBorder = paddle.x - ball.radius;
  } else if (ball.x < CENTER && paddle.x < CENTER) {
    isLeftSide = true;
  }

  let changeVector = false;
  if (inBounds(ball.y, paddleTop, paddleBottom)) {
    changeVector =
      (isRightSide && ball.x >= paddleBorder) ||
      (isLeftSide && ball.x <= paddleBorder);
  }

  if (changeVector) {

    //Angle Handling - Yes i know its scuffed, its 11pm and im needing sleep

    let ballToPaddleCenterDist = (paddleTop + paddle.height/2) - ball.y;
    console.log("Distance: " + ballToPaddleCenterDist);

    if(ballToPaddleCenterDist <= 0){
      if(ballToPaddleCenterDist < -15){
          ball.speedY = Math.abs(ball.speedY * 1.05 + 10);
          ball.speedX = ball.speedX * -1.20;
      }else{
          ball.speedY = Math.abs(ball.speedY * 1.05);
          ball.speedX = ball.speedX * -1.05;
      }
    }else{
      if(ballToPaddleCenterDist > 15){
          ball.speedY = -Math.abs(ball.speedY * 1.05 + 10);
          ball.speedX = ball.speedX * -1.20;

      }else{
          ball.speedY = -Math.abs(ball.speedY * 1.05);
          ball.speedX = ball.speedX * -1.05;
      }
    }

    //ball.speedX = ball.speedX * -1.05;
  }
}

function moveBall(ball) {
  ball.x = ball.x + ball.speedX;
  ball.y = ball.y + ball.speedY;
}

function drawBall(ball) {
  brush.beginPath();
  brush.fillStyle = ball.color;
  brush.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
  brush.fill();
}

function drawPaddle(paddle) {
  brush.fillStyle = paddle.color;
  brush.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawPitch(pitch) {
  brush.fillStyle = pitch.color;
  brush.fillRect(pitch.x, pitch.y, pitch.width, pitch.height);

  brush.fillStyle = "white";
  brush.fillRect(pitch.width * 0.5, 0, 4, pitch.height);
}

// ---------------

function drawScoreboard(scoreboard){

  brush.font = scoreboard.font;
  brush.fillStyle = scoreboard.color;
  brush.fillText(scoreboard.score[0], scoreboard.x, scoreboard.y);

  brush.fillText(scoreboard.score[1], scoreboard.x+scoreboard.scoreSpacing, scoreboard.y);
}

function drawCountdownTimer(countdownTimer){
  //Using same font
  brush.font = countdownTimer.font;

  brush.fillStyle = countdownTimer.color;
  brush.fillText(countdownTimer.countdownText + secondsLeftOfGame, countdownTimer.x, countdownTimer.y)

}

function drawGameOver(gameOverScreen){
  brush.fillStyle = "white";
  brush.fillRect(100,100, canvas.width-150, canvas.height-150);
  brush.fillStyle = gameOverScreen.color;

  if(scoreboard.score[0] == scoreboard.score[1]){
    //Draw
    brush.fillText("DRAW", CENTER, canvas.height/2);
  }else if (scoreboard.score[0] > scoreboard.score[1]){
    //Player won
    brush.fillText("You Win!", CENTER, canvas.height/2);
  } else {
    //NPC won (must be AI)
    brush.fillText("You Lose!", CENTER, canvas.height/2);

  }
}

// UTILITY FUNCTIONS ----------------------------------------------------------


function timeCounter(){

    secondsLeftOfGame --;
    if (secondsLeftOfGame <= 0){
      //GAME OVER
      gameOver = true;
    }

  }


function timeManager(){
  setInterval(timeCounter, 1000);
}



function randomNumberBetween(max, min) {
  return Math.round(Math.random() * (max - min)) + min;
}

function centerVericalyItemIn(item, target) {
  item.y = target.height * 0.5 - item.height * 0.5;
}

function clearCanvas() {
  brush.clearRect(0, 0, canvas.width, canvas.height);
}

function inBounds(value, min, max) {
  return value >= min && value <= max;
}

// BUTTON PRESS EVENTS ----------------------------------------------------------

canvas.addEventListener("mousemove", onMouseMove);

//This is cooler
document.addEventListener("keydown", (pressedKey) => {
  console.log(pressedKey.key);
  if(pressedKey.key == "l"){
    //Pause NPC for 2 seconds
    NPCPaddleLock = true;
    setTimeout( () => {NPCPaddleLock = false;} , 2000);
  } else if (pressedKey.key == "c"){
    //Paddle perfect block
    paddle.y = ball.y - paddle.height/2;
  } else if (pressedKey.key == "+"){
    //Ball go big
    ball.radius += 2.5;
  } else if (pressedKey.key == "-"){
    //Ball go small
    if (ball.radius >= 3){
      ball.radius -= 2.5;
    }
  }


});


function onMouseMove(event) {
  paddle.y = event.offsetY;
}



