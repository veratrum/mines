$(document).ready(go);

var SMALL = 0;
var MEDIUM = 1;
var LARGE = 2;

var UP = 0;
var LEFT = 1;
var RIGHT = 2;

var GAMERUNNING = 0;
var GAMEOVER = 1;

var UNREVEALED = 0;
var REVEALEDSAFE = 1;
var FLAG = 2;
var ENDEXPLOSION = 3;
var ENDBOMB = 4;
var INCORRECTFLAG = 5;
var ENDSAFE = 6;

var SAFE = 0;
var BOMB = 1;

var TITLE = 0;
var NEWGAME = 1;
var INGAME = 2;

var canvas;
var context;

var gameState = -1;
var menuState;

var mouseState;
var mouseCurrent;
var mouseInitial;
var mouseFinal;

var boardRevealed;
var boardMines;
var boardNear;
var firstClick;
var clearedSquares;
var numberFlags;

var gameType;
var columns;
var rows;
var squareWidth;
var borderWidth;
var totalMines;
var fontSize;

function go() {
	canvas = document.getElementById("field");
	context = canvas.getContext("2d");

	mouseState = UP;
	menuState = TITLE;
	gameState = GAMEOVER;

	$("#new-game-button").on("click", function(event) {
		changeMenu(NEWGAME);
	});

	$("#continue-game-button").on("click", function(event) {
		changeMenu(INGAME);
	});

	$("#back-button").on("click", function(event) {
		changeMenu(TITLE);
	});

	$("#forfeit-button").on("click", function(event) {
		if (menuState === INGAME && gameState === GAMERUNNING) {
			gameOver(false);
		}
	});

	$("#start-small").on("click", function(event) {
		changeMenu(INGAME);

		newGame(SMALL);
	});

	$("#start-medium").on("click", function(event) {
		changeMenu(INGAME);

		newGame(MEDIUM);
	});

	$("#start-large").on("click", function(event) {
		changeMenu(INGAME);

		newGame(LARGE);
	});

	$("body").on("contextmenu", "#field", function(event) {
		return false;
	});

	$("#field").on("mousemove", function(event) {
		var mouseRaw = mousePosition(event);

		if (mouseRaw[0] % squareWidth >= borderWidth * 2 && mouseRaw[1] % squareWidth >= borderWidth * 2) {
			var column = Math.floor(mouseRaw[0] / squareWidth);
			var row = Math.floor(mouseRaw[1] / squareWidth);

			mouseCurrent = [column, row];

			$("#field").css("cursor", "pointer");
		} else {
			mouseCurrent = [-1, -1];

			$("#field").css("cursor", "auto");
		}

		updateCanvas();
	});

	$("#field").on("mousedown", function(event) {
		if (mouseState === UP) {
			switch (event.which) {
			case 1:
				mouseState = LEFT;
				break;
			case 3:
				mouseState = RIGHT;
				break;
			default:
				return;
			}
		}

		var mouseInitialRaw = mousePosition(event);

		if (mouseInitialRaw[0] % squareWidth >= borderWidth * 2 && mouseInitialRaw[1] % squareWidth >= borderWidth * 2) {
			var column = Math.floor(mouseInitialRaw[0] / squareWidth);
			var row = Math.floor(mouseInitialRaw[1] / squareWidth);
			mouseInitial = [column, row];
		} else {
			return;
		}
	});

	$("#field").on("mouseup", function(event) {
		if (mouseState === UP) {
			return;
		} else if (mouseState === LEFT && event.which != 1) {
			mouseState = UP;
			return;
		} else if (mouseState === RIGHT && event.which != 3) {
			mouseState = UP;
			return;
		}

		var mouseFinalRaw = mousePosition(event);

		if (mouseFinalRaw[0] % squareWidth >= borderWidth * 2 && mouseFinalRaw[1] % squareWidth >= borderWidth * 2) {
			var column = Math.floor(mouseFinalRaw[0] / squareWidth);
			var row = Math.floor(mouseFinalRaw[1] / squareWidth);
			mouseFinal = [column, row];
		} else {
			return;
		}

		if (mouseState === LEFT && !event.ctrlKey) {
			if (mouseInitial[0] === mouseFinal[0] && mouseInitial[1] === mouseFinal[1]) {
				clickSquare(mouseInitial[0], mouseInitial[1]);
			}
		} else if (mouseState === RIGHT || (mouseState === LEFT && event.ctrlKey)) {
			if (mouseInitial[0] === mouseFinal[0] && mouseInitial[1] === mouseFinal[1]) {
				clickFlag(mouseInitial[0], mouseInitial[1]);
			}
		}

		mouseState = UP;
	});

	$(document).on("keyup", function(event) {
		switch (event.keyCode) {
		case 66: // _B_ack
			if (menuState != TITLE) {
				changeMenu(TITLE);
			}
			break;
		case 68: // _D_o again
			if (menuState === INGAME && gameState === GAMEOVER) {
				$("#forfeit-button").show();
				newGame(gameType);
			}
			break;
		case 70: // _F_orfeit
			if (menuState === INGAME && gameState === GAMERUNNING) {
				gameOver(false);
			}
			break;
		case 71: // new _G_ame || continue _G_ame
			if (gameState === GAMEOVER) {
				changeMenu(NEWGAME);
			} else if (menuState != INGAME) {
				changeMenu(INGAME);

				updateCanvas();
			}
			break;
		case 83: // _S_mall
			if (menuState === NEWGAME) {
				changeMenu(INGAME);

				newGame(SMALL);
			}
			break;
		case 77: // _M_edium
			if (menuState === NEWGAME) {
				changeMenu(INGAME);

				newGame(MEDIUM);
			}
			break;
		case 76: // _L_arge
			if (menuState === NEWGAME) {
				changeMenu(INGAME);

				newGame(LARGE);
			}
			break;
		}
	});
}

function newGame(type) {
	var i, j;

	$("#new-game-button").hide();

	gameType = type;

	squareWidth = 64 / Math.pow(2, type);
	totalMines = Math.pow(4, type) * 10;

	firstClick = true;
	clearedSquares = 0;
	numberFlags = 0;

	gameState = GAMERUNNING;

	switch (gameType) {
	case SMALL:
		columns = rows = 8;
		totalMines = 10;
		squareWidth = 64;
		borderWidth = 4;
		fontSize = "40px";

		$("#field").attr("width", "520");
		$("#field").attr("height", "520");
		break;
	case MEDIUM:
		columns = rows = 16;
		totalMines = 50;
		squareWidth = 32;
		borderWidth = 2;
		fontSize = "24px";

		$("#field").attr("width", "516");
		$("#field").attr("height", "516");
		
		break;
	case LARGE:
		columns = 32;
		rows = 16;
		totalMines = 110;
		squareWidth = 32;
		borderWidth = 2;
		fontSize = "24px";

		$("#field").attr("width", "1028");
		$("#field").attr("height", "516");
		break;
	}

	boardRevealed = [];
	for (i = 0; i < columns; i++) {
		boardRevealed[i] = [];
		for (j = 0; j < rows; j++) {
			boardRevealed[i][j] = UNREVEALED;
		}
	}

	updateCanvas();
}

function clickSquare(x, y) {
	var i, j;

	if (gameState === GAMEOVER) {
		return;
	}

	if (firstClick) {
		firstClick = false;
		initializeMines(x, y);
	}

	if (boardRevealed[x][y] === REVEALEDSAFE) {
		var adjacentFlags = 0;

		for (i = x - 1; i <= x + 1; i++) {
			if (i < 0 || i >= columns) {
				continue;
			}

			for (j = y - 1; j <= y + 1; j++) {
				if (j < 0 || j >= rows) {
					continue;
				}

				if (i === x && j === y) {
					continue;
				}

				if (boardRevealed[i][j] === FLAG) {
					adjacentFlags++;
				}
			}
		}

		if (adjacentFlags === boardNear[x][y]) {
			for (i = x - 1; i <= x + 1; i++) {
				if (i < 0 || i >= columns) {
					continue;
				}

				for (j = y - 1; j <= y + 1; j++) {
					if (j < 0 || j >= rows) {
						continue;
					}

					if (i === x && j === y) {
						continue;
					}

					if (boardRevealed[i][j] === UNREVEALED) {
						clickSquare(i, j);
					}
				}
			}
		}
	}

	if (boardRevealed[x][y] != UNREVEALED) {
		return;
	}

	if (boardMines[x][y] === BOMB) {
		gameOver(false, x, y);
		return;
	}

	boardRevealed[x][y] = REVEALEDSAFE;
	clearedSquares++;

	if (boardNear[x][y] === 0) {
		for (i = x - 1; i <= x + 1; i++) {
			if (i < 0 || i >= columns) {
				continue;
			}

			for (j = y - 1; j <= y + 1; j++) {
				if (j < 0 || j >= rows) {
					continue;
				}

				if (i === x && j === y) {
					continue;
				}

				if (boardRevealed[i][j] === REVEALEDSAFE) {
					continue;
				}

				clickSquare(i, j);
			}
		}
	}

	if (clearedSquares == columns * rows - totalMines) {
		gameOver(true);
		return;
	}

	updateCanvas();
}

function clickFlag(x, y) {
	if (gameState === GAMEOVER) {
		return;
	}

	if (boardRevealed[x][y] === UNREVEALED) {
		boardRevealed[x][y] = FLAG;
		numberFlags++;
	} else if (boardRevealed[x][y] === FLAG) {
		numberFlags--;
		boardRevealed[x][y] = UNREVEALED;
	}

	updateCanvas();
}

function initializeMines(firstX, firstY) {
	var i, j, k, l;

	boardMines = [];
	boardNear = [];
	for (i = 0; i < columns; i++) {
		boardMines[i] = [];
		boardNear[i] = [];
		for (j = 0; j < rows; j++) {
			boardMines[i][j] = SAFE;
			boardNear[i][j] = 0;
		}
	}

	for (i = 0; i < totalMines; i++) {
		var randomX = Math.floor(Math.random() * columns);
		var randomY = Math.floor(Math.random() * rows);

		while (!isValid(randomX, randomY, firstX, firstY)) {
			randomX = Math.floor(Math.random() * columns);
			randomY = Math.floor(Math.random() * rows);
		}

		boardMines[randomX][randomY] = BOMB;
	}

	for (i = 0; i < columns; i++) {
		for (j = 0; j < rows; j++) {
			if (boardMines[i][j] === BOMB) {
				for (k = i - 1; k <= i + 1; k++) {
					if (k < 0 || k >= columns) {
						continue;
					}

					for (l = j - 1; l <= j + 1; l++) {
						if (l < 0 || l >= rows) {
							continue;
						}

						boardNear[k][l]++;
					}
				}
			}
		}
	}
}

function isValid(randomX, randomY, firstX, firstY) {
	if (boardMines[randomX][randomY] === BOMB) {
		return false;
	}

	if (firstX === randomX - 1 && firstY === randomY - 1) {
		return false;
	}

	if (firstX === randomX && firstY === randomY - 1) {
		return false;
	}

	if (firstX === randomX + 1 && firstY === randomY - 1) {
		return false;
	}

	if (firstX === randomX - 1 && firstY === randomY) {
		return false;
	}

	if (firstX === randomX && firstY === randomY) {
		return false;
	}

	if (firstX === randomX + 1 && firstY === randomY) {
		return false;
	}

	if (firstX === randomX - 1 && firstY === randomY + 1) {
		return false;
	}

	if (firstX === randomX && firstY === randomY + 1) {
		return false;
	}

	if (firstX === randomX + 1 && firstY === randomY + 1) {
		return false;
	}

	return true;
}

function updateCanvas() {
	context.beginPath();
	context.rect(0, 0, columns * squareWidth + borderWidth * 2, rows * squareWidth + borderWidth * 2);
	context.fillStyle = "#444444";
	context.fill();

	context.font = fontSize + " DejaVu Sans Mono";

	for (i = 0; i < columns; i++) {
		for (j = 0; j < rows; j++) {
			if (mouseCurrent && i === mouseCurrent[0] && j == mouseCurrent[1]) { // hovering on tile
				if (boardRevealed[i][j] === UNREVEALED) {
					context.fillStyle = "#999999";
				} else if (boardRevealed[i][j] === REVEALEDSAFE) {
					context.fillStyle = "#bbbbbb";
				} else if (boardRevealed[i][j] === FLAG) {
					context.fillStyle = "#999999";
				} else if (boardRevealed[i][j] === ENDEXPLOSION) {
					context.fillStyle = "#bbbbbb";
				} else if (boardRevealed[i][j] === ENDBOMB) {
					context.fillStyle = "#666666";
				} else if (boardRevealed[i][j] === INCORRECTFLAG) {
					context.fillStyle = "#666666";
				} else if (boardRevealed[i][j] === ENDSAFE) {
					context.fillStyle = "#666666";
				}
			} else { // not hovering on tile
				if (boardRevealed[i][j] === UNREVEALED) {
					context.fillStyle = "#888888";
				} else if (boardRevealed[i][j] === REVEALEDSAFE) {
					context.fillStyle = "#aaaaaa";
				} else if (boardRevealed[i][j] === FLAG) {
					context.fillStyle = "#888888";
				} else if (boardRevealed[i][j] === ENDEXPLOSION) {
					context.fillStyle = "#aaaaaa";
				} else if (boardRevealed[i][j] === ENDBOMB) {
					context.fillStyle = "#555555";
				} else if (boardRevealed[i][j] === INCORRECTFLAG) {
					context.fillStyle = "#555555";
				} else if (boardRevealed[i][j] === ENDSAFE) {
					context.fillStyle = "#555555";
				}
			}
			context.fillRect(i * squareWidth + borderWidth * 2, j * squareWidth + borderWidth * 2, squareWidth - borderWidth * 2, squareWidth - borderWidth * 2);

			drawPosition = gdc(i, j);
			dX = drawPosition[0];
			dY = drawPosition[1];
			o = gogogo();

			if (boardRevealed[i][j] === UNREVEALED) {
				
			} else if (boardRevealed[i][j] === REVEALEDSAFE) {
				if (boardNear[i][j] > 0) {
					context.fillStyle = numberColor(boardNear[i][j]);
					context.fillText(boardNear[i][j], dX, dY);
				}
			} else if (boardRevealed[i][j] === FLAG) {
				context.fillStyle = "#222222";
				context.fillText(String.fromCharCode(9873), dX, dY + o);
			} else if (boardRevealed[i][j] === ENDEXPLOSION) {
				context.fillStyle = "#ff2222";
				context.fillText(String.fromCharCode(10040), dX, dY + o);
			} else if (boardRevealed[i][j] === ENDBOMB) {
				context.fillStyle = "#222222";
				context.fillText(String.fromCharCode(10040), dX, dY + o);
			} else if (boardRevealed[i][j] === INCORRECTFLAG) {
				context.fillStyle = "#ff2222";
				context.fillText(String.fromCharCode(9873), dX, dY + o);
			} else if (boardRevealed[i][j] === ENDSAFE) {
				
			}
		}
	}

	if (gameState === GAMERUNNING) {
		$("#banner").html((totalMines - numberFlags) + " mines unflagged.");
	}
}

function gameOver(victory, explosionX = -1, explosionY = -1) {
	var i, j;

	gameState = GAMEOVER;

	if (victory) {
		updateCanvas();
	} else {
		if (firstClick) {
			initializeMines(-2, -2);
		}

		for (i = 0; i < columns; i++) {
			for (j = 0; j < rows; j++) {
				if (i === explosionX && j === explosionY) {
					boardRevealed[i][j] = ENDEXPLOSION;
					continue;
				} else if (boardRevealed[i][j] === UNREVEALED) {
					if (boardMines[i][j] === BOMB) {
						boardRevealed[i][j] = ENDBOMB;
					} else {
						boardRevealed[i][j] = ENDSAFE;
					}
				} else if (boardRevealed[i][j] === FLAG) {
					if (boardMines[i][j] === SAFE) {
						boardRevealed[i][j] = INCORRECTFLAG;
					}
				}
			}
		}

		updateCanvas();
	}

	$("#forfeit-button").hide();
	$("#new-game-button").show();

	if (victory) {
		$("#banner").html("Game over! You won.");
	} else {
		$("#banner").html("Game over! You lost.");
	}
}

function changeMenu(newMenuState) {
	$("#title").hide();
	$("#new-game").hide();
	$("#field-container").hide();
	$("#back-button").hide();
	$("#forfeit-button").hide();
	$("#new-game-button").hide();
	$("#continue-game-button").hide();
	
	menuState = newMenuState;
	
	switch (menuState) {
	case TITLE:
		$("#title").show();
		
		if (gameState === GAMERUNNING) {
			$("#new-game-button").hide();
			$("#continue-game-button").show();
		} else {
			$("#new-game-button").show();
			$("#continue-game-button").hide();
		}
		
		$("#banner").html("Minesweeper.");
		break;
	case NEWGAME:
		$("#new-game").show();
		$("#back-button").show();
		
		$("#banner").html("Start a new game.");
		break;
	case INGAME:
		$("#field-container").show();
		$("#back-button").show();
		$("#forfeit-button").show();
		break;
	}
}

function mousePosition(event) {
	var rectangle = canvas.getBoundingClientRect();

	return [event.clientX - rectangle.left, event.clientY - rectangle.top];
}

function gdc(x, y) {
	var position = [];

	switch (gameType) {
	case SMALL:
		position[0] = x * squareWidth + borderWidth + 20;
		position[1] = y * squareWidth + borderWidth + 47;
		break;
	case MEDIUM:
		position[0] = x * squareWidth + borderWidth + 9;
		position[1] = y * squareWidth + borderWidth + 25;
		break;
	case LARGE:
		position[0] = x * squareWidth + borderWidth + 9;
		position[1] = y * squareWidth + borderWidth + 25;
		break;
	}

	return position;
}

function numberColor(number) {
	var colors = [];
	colors[0] = "#000000";
	colors[1] = "#5E00FF";
	colors[2] = "#008C11";
	colors[3] = "#FF0000";
	colors[4] = "#2F0080";
	colors[5] = "#870000";
	colors[6] = "#008481";
	colors[7] = "#000000";
	colors[8] = "#7F7F7F";

	return colors[number];
}

function gogogo() {
	switch (gameType) {
	case SMALL:
		return -4;
	case MEDIUM:
		return -2;
	case LARGE:
		return -2;
	}
}
