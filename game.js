const boardSize = 8;
let board = [];
let currentPlayer = 'white';

function initializeBoard() {
    board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
    for (let i = 0; i < boardSize; i++) {
        board[1][i] = 'black';
        board[boardSize - 2][i] = 'white';
    }
    renderBoard();
}

function renderBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            if (board[row][col]) {
                const triangle = document.createElement('div');
                triangle.className = 'triangle ' + board[row][col];
                triangle.draggable = true;
                triangle.ondragstart = (e) => dragStart(e, row, col);
                cell.appendChild(triangle);
            }
            cell.ondragover = (e) => e.preventDefault();
            cell.ondrop = (e) => drop(e, row, col);
            gameBoard.appendChild(cell);
        }
    }
}

function dragStart(event, row, col) {
    event.dataTransfer.setData('text/plain', JSON.stringify({ row, col }));
}

function drop(event, newRow, newCol) {
    const { row, col } = JSON.parse(event.dataTransfer.getData('text/plain'));
    if (isValidMove(row, col, newRow, newCol)) {
        board[newRow][newCol] = currentPlayer;
        board[row][col] = null;
        if ((currentPlayer === 'white' && newRow === 0) || (currentPlayer === 'black' && newRow === boardSize - 1)) {
            alert(currentPlayer + ' wins!');
            initializeBoard();
        } else {
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            if (currentPlayer === 'black') {
                aiMove();
            }
        }
        renderBoard();
    }
}

function isValidMove(row, col, newRow, newCol) {
    const targetPiece = board[newRow][newCol];
    
    // Prevent moving to a square occupied by the same player's piece
    if (targetPiece === currentPlayer) {
        return false;
    }
    
    // Capture opponent's piece
    if (targetPiece !== null && targetPiece !== currentPlayer) {
        board[newRow][newCol] = null; // Capture the piece
    }
    
    const rowDiff = Math.abs(newRow - row);
    const colDiff = Math.abs(newCol - col);
    
    // Allow one square vertical or horizontal movement
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

function aiMove() {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === 'black') {
                const directions = [
                    { r: 1, c: 0 },
                    { r: 0, c: -1 },
                    { r: 0, c: 1 }
                ];
                for (const { r, c } of directions) {
                    const newRow = row + r;
                    const newCol = col + c;
                    if (isValidMove(row, col, newRow, newCol)) {
                        board[newRow][newCol] = 'black';
                        board[row][col] = null;
                        if (newRow === boardSize - 1) {
                            alert('black wins!');
                            initializeBoard();
                        }
                        return;
                    }
                }
            }
        }
    }
}

window.onload = initializeBoard;
