     const boardSize = 8;
     let board = [];
     let currentPlayer = 'white';

     function initializeBoard() {
         board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
         for (let i = 0; i < boardSize; i++) {
             board[1][i] = 'white';
             board[boardSize - 2][i] = 'black';
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
                     const pawn = document.createElement('div');
                     pawn.className = 'pawn ' + board[row][col];
                     cell.appendChild(pawn);
                 }
                 gameBoard.appendChild(cell);
             }
         }
     }

     function movePawn(row, col, direction) {
         if (board[row][col] === currentPlayer) {
             let newRow = row + (currentPlayer === 'white' ? 1 : -1);
             let newCol = col;
             if (direction === 'left') newCol--;
             if (direction === 'right') newCol++;
             if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize && !board[newRow][newCol]) {
                 board[newRow][newCol] = currentPlayer;
                 board[row][col] = null;
                 if (newRow === 0 || newRow === boardSize - 1) {
                     alert(currentPlayer + ' wins!');
                     initializeBoard();
                 } else {
                     currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
                 }
                 renderBoard();
             }
         }
     }

     function handleKeyPress(event) {
         const key = event.key.toLowerCase();
         if (currentPlayer === 'black') {
             if (key === 'w') movePawn(6, 0, 'up');
             if (key === 'a') movePawn(6, 0, 'left');
             if (key === 's') movePawn(6, 0, 'down');
             if (key === 'd') movePawn(6, 0, 'right');
         }
     }

     window.addEventListener('keydown', handleKeyPress);
     window.onload = initializeBoard;
