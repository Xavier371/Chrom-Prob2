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
                if (board[row][col] === 'white') {
                    triangle.draggable = true;
                    triangle.ondragstart = (e) => dragStart(e, row, col);
                }
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
        board[newRow][newCol] = board[row][col]; // Keep the piece color
        board[row][col] = null;
        renderBoard();
        if ((currentPlayer === 'white' && newRow === 0) || (currentPlayer === 'black' && newRow === boardSize - 1)) {
            alert(currentPlayer + ' wins!');
            initializeBoard();
        } else {
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            if (currentPlayer === 'black') {
                setTimeout(aiMove, 100); // Much faster transition
            }
        }
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
    // First priority: Capture any white piece if possible
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === 'black') {
                const directions = [
                    { r: 1, c: 0 },
                    { r: 0, c: -1 },
                    { r: 0, c: 1 }
                ];
                
                // Check for capture opportunities
                for (const { r, c } of directions) {
                    const newRow = row + r;
                    const newCol = col + c;
                    
                    if (newRow >= 0 && newRow < boardSize && 
                        newCol >= 0 && newCol < boardSize && 
                        board[newRow][newCol] === 'white') {
                        
                        board[newRow][newCol] = 'black';
                        board[row][col] = null;
                        renderBoard();
                        
                        if (newRow === boardSize - 1) {
                            alert('black wins!');
                            initializeBoard();
                        }
                        
                        currentPlayer = 'white';
                        return;
                    }
                }
            }
        }
    }
    
    // Second priority: Move towards the goal without being adjacent to white
    let bestMove = null;
    let bestScore = -Infinity;
    
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
                        // Score this move: higher score for moves closer to bottom
                        let score = newRow; // Prioritize moving down
                        
                        // Check if this move would place the piece adjacent to a white piece
                        const adjacentToWhite = hasAdjacentWhite(newRow, newCol);
                        
                        if (!adjacentToWhite) {
                            score += 10; // Strongly prefer moves that aren't adjacent to white
                        }
                        
                        if (score > bestScore) {
                            bestScore = score;
                            bestMove = { fromRow: row, fromCol: col, toRow: newRow, toCol: newCol };
                        }
                    }
                }
            }
        }
    }
    
    // Make the best move if one was found
    if (bestMove) {
        board[bestMove.toRow][bestMove.toCol] = 'black';
        board[bestMove.fromRow][bestMove.fromCol] = null;
        renderBoard();
        
        if (bestMove.toRow === boardSize - 1) {
            alert('black wins!');
            initializeBoard();
        }
        
        currentPlayer = 'white';
        return;
    }
    
    // Fallback: Make any valid move if no good move was found
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
                        renderBoard();
                        
                        if (newRow === boardSize - 1) {
                            alert('black wins!');
                            initializeBoard();
                        }
                        
                        currentPlayer = 'white';
                        return;
                    }
                }
            }
        }
    }
}

function hasAdjacentWhite(row, col) {
    const directions = [
        { r: -1, c: 0 },
        { r: 1, c: 0 },
        { r: 0, c: -1 },
        { r: 0, c: 1 }
    ];
    
    for (const { r, c } of directions) {
        const newRow = row + r;
        const newCol = col + c;
        
        if (newRow >= 0 && newRow < boardSize && 
            newCol >= 0 && newCol < boardSize && 
            board[newRow][newCol] === 'white') {
            return true;
        }
    }
    
    return false;
}

window.onload = initializeBoard;
