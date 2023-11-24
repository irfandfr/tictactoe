
// Game turn counter
let turn = "X";
let turnCount = 0;
let win;

// Game Constant Variables
const MIN_BOARD_SIZE = 3;
const MAX_BOARD_SIZE = 20;
const MIN_STEP = 1;
const MAX_STEP = 6;
const MIN_WIN_CON = 3;
const MAX_WIN_CON = 20;

// Game Properties Variable
let boardSize = MIN_BOARD_SIZE;
let maxStep = MIN_BOARD_SIZE * MIN_BOARD_SIZE;
let selectedStep = 1;
let selectedWinCon = 3;
let stepsRemaining = 1;
let selectedFirst;

// Game board state
let gameState;
let gameBoard;


/**
 * Function to initialize Gameboard based on selected configs
 */
function init() {
  gameState = Array(boardSize)
    .fill(1)
    .map((_) => Array(boardSize).fill(null)); // initialize board state
  gameBoard = drawBoard(); // initialize board ui
  const board = document.querySelector("#game-board"); //draw board to ui
  board.innerHTML = gameBoard.join("");
  const result = document.querySelector(`#result`);
  // reset or initialize game flags
  stepsRemaining = selectedStep;
  maxStep = boardSize * boardSize;
  turn = selectedFirst ? selectedFirst : 'X';
  win = null;
  document.querySelector("#turn-board").innerHTML = `Its ${turn}'s turn!`;
  document.querySelector(
    "#wincon-board"
  ).innerHTML = `Get ${selectedWinCon} in a row to win!`;
  if (selectedStep > 1)
    document.querySelector(
      "#move-board"
    ).innerHTML = `Remaining move: ${stepsRemaining}`;
  turnCount = 0;
  result.innerHTML = "";
}

/**
 * Function to draw the board reads the selected size and make
 * n x n tictactoe board
 */
function drawBoard() {
  return Array(boardSize)
    .fill(1)
    .map(
      (_, row) =>
        `<div class="board__row">
    ${Array(boardSize)
      .fill(1)
      .map(
        (_, col) =>
          `<button 
        class="tButton"
        id="r${row}c${col}"
        onClick="choosePlace(${row},${col})"
        >
       </button>`
      )
      .join("")}
   </div>
 `
    );
}

/**
 * Function to trigger whenever a player chooses a board
 */
function choosePlace(row, col) {
  const btn = document.querySelector(`#r${row}c${col}`);
  if (!gameState[row][col] && !win) {
    // additional check to see if space is available
    gameState[row][col] = turn;
    btn.innerHTML = turn; // mark test with curr player mark
    btn.setAttribute("disabled", true); //disables picked button
    btn.classList.add(turn.toLowerCase());
    stepsRemaining--;
    turnCount++;
    checkWinningMove(row, col); //check this is a winning move
    if (stepsRemaining <= 0) { 
      // switch player if player is out of move
      turn = turn === "X" ? "O" : "X";
      document.querySelector("#turn-board").innerHTML = `Its ${turn}'s turn!`;
      stepsRemaining = selectedStep;
    }
    if (turnCount === maxStep && !win) {
      //check for tie
      setWinner("Its a Tie");
    }
  }
  if (selectedStep > 1)
    //keep track of players remaining move
    document.querySelector(
      "#move-board"
    ).innerHTML = `Remaining move: ${stepsRemaining}`;
}

//open winner modal
function setWinner(res) {
  const result = document.querySelector(`#result`);
  result.innerHTML = res;
  show("#result-ui");
}

/**
 * check if the newly placed piece makes a winning move,
 *  this function only checks for either X or O depending on the turn,
 *  the program crawls the cardinal and intercardinal direction 
 * centered around the last piece
 * The crawl accessed at the very most N times, where N is the
 *  amount of piece in a row needed to win.
 * And the function to crawl is called 4 times based on intercardinal and
 *  cardinal space making the total complexity of o(4N) or O(n), 
 *  with a linear complexity.
 */
function checkWinningMove(row, col) {
  if (
    checkDirection(row, col, "x") ||
    checkDirection(row, col, "y") ||
    checkDirection(row, col, "yx") ||
    checkDirection(row, col, "yminx")
  ) {
    win = turn;
    setWinner(turn + " Wins!!");
  }
}

// return if index is a valid index
function validIndexes(val) {
  if (val >= 0 && val <= boardSize - 1) {
    return true;
  } else {
    return false;
  }
}

/**
 * this function crawls the space centered on the piece placement,
 * the function has 2 phase check ascending number and descending
 */
function checkDirection(row, col, direction) {
  // crawl values based on direction
  const DIRECTION_VALUES = { 
    x: { y: 1, x: 0 },
    y: { y: 0, x: 1 },
    yx: { y: 1, x: 1 },
    yminx: { y: -1, x: 1 }
  };
  const val = DIRECTION_VALUES[direction];
  let count = 1;
  let continueAsc = true;
  let continueDesc = true;
  //+ values
  if ( 
    validIndexes(row + val.y) &&
    validIndexes(col + val.x) &&
    gameState[row + val.y]?.[col + val.x] === turn
  ) {
    count++;
    let idx = 2;
    //check if index is still within board
    while (validIndexes(row + idx * val.y) && validIndexes(col + idx * val.x) && continueAsc) {
      if (gameState[row + idx * val.y][col + idx * val.x] === turn) {
        count++;
      }else{
        //if next crawl is not the same piece change direction
        continueAsc = false
      }
      idx++;
    }
  }
  if (//descending logic
    validIndexes(row - val.y) &&
    validIndexes(col - val.x) &&
    gameState[row - val.y]?.[col - val.x] === turn
  ) {
    count++;
    let idx = -2;
    while (validIndexes(row + idx * val.y) && validIndexes(col + idx * val.x) && continueDesc) {
      if (gameState[row + idx * val.y][col + idx * val.x] === turn) {
        count++;
      }else{
        continueDesc = false
      }
      idx--;
    }
  }
  if (count >= selectedWinCon) {
    return true;
  } else {
    return false;
  }
}

/**
 * function to update board size 
 */
function updateBoardSize(type) {
  if (type === "increment" && boardSize < MAX_BOARD_SIZE) {
    boardSize++;
  } else if (type === "decrement" && boardSize > MIN_BOARD_SIZE) {
    boardSize--;
  }
  if (boardSize > 3) { // add option to modify winning condition
    document.querySelector("#win-count-container").classList.remove("hide");
  } else {
    document.querySelector("#win-count-container").classList.add("hide");
  }
  if (boardSize >= 5) { // add option ro modify move count
    document.querySelector("#move-count-container").classList.remove("hide");
  } else {
    document.querySelector("#move-count-container").classList.add("hide");
  }
  document.querySelector("#board-size-val").innerHTML = boardSize;
}

/**
 * Function to update how many in a rows needed to win
 */
function updateWinCondition(type) {
  // can choose between 3 to current board size
  if (type === "increment" && selectedWinCon < boardSize) {
    selectedWinCon++;
  } else if (type === "decrement" && selectedWinCon > 3) {
    selectedWinCon--;
    //reset move count if difference between move count and win con less than 2
    if (selectedWinCon - selectedStep <= 2) {
      selectedStep = 1;
      document.querySelector("#move-count-val").innerHTML = selectedStep;
    }
  }
  document.querySelector("#win-count-val").innerHTML = selectedWinCon;
}


/**
 * Function to update how many move a player get in a turn
 */
function updateMoveCount(type) {
  //can only choose between 1 and (board size / 5) + 1
  if (
    type === "increment" &&
    selectedStep < Math.floor(boardSize / 5) + 1 &&
    selectedWinCon - selectedStep > 2
  ) {
    selectedStep++;
  } else if (type === "decrement" && selectedStep > 1) {
    selectedStep--;
  }
  document.querySelector("#move-count-val").innerHTML = selectedStep;
}

/**
 * change orderof player
 */
function updateFirstPlayer(val) {
  selectedFirst = val;
}

//Add transition before hiding UI
function hide(id) {
  const doc = document.querySelector(id);
  doc.classList.add("fade-animation");
  doc.classList.add("fade-out");
  setTimeout(() => {
    doc.classList.add("hide");
    doc.classList.remove("fade-out");
    doc.classList.remove("fade-animation");
  }, 600);
}

//Add transition before rendering UI
function show(id) {
  const doc = document.querySelector(id);
  doc.classList.add("fade-in-animation");
  setTimeout(() => {
    doc.classList.remove("hide");
    setTimeout(() => {
      doc.classList.add("fade-in");
      setTimeout(() => {
        doc.classList.remove("fade-in-animation");
        doc.classList.remove("fade-in");
      }, 550);
    }, 50);
  }, 650);
}

//function tochange progress ui
function nextStep() {
  hide("#starting-ui");
  show("#config-step");
}

function back() {
  hide("#config-step");
  show("#starting-ui");
}

function playGame() {
  hide("#config-step");
  init();
  show("#game-ui");
}
function reset() {
  hide("#result-ui");
  hide("#game-ui");
  show("#starting-ui");
}
function rematch() {
  hide("#result-ui");
  init();
}

// init
document.querySelector("#board-size-val").innerHTML = MIN_BOARD_SIZE;
