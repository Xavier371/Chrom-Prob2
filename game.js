const boardSize = 8;
let board = [];
let currentPlayer = 'white';
let selectedCell = null;

function initializeBoard() {
    board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
    
    // Place black pieces in row 1
    for (let i = 0; i < boardSize; i++) {
        board[1][i] = 'black';
    }
    
    // Place white pieces in second-to-last row
    for (let i = 0; i < boardSize; i++) {
        board[boardSize - 2][i] = 'white';
    }
    
    currentPlayer = 'white';
    renderBoard();
}

function renderBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            if (board[row][col]) {
                const triangle = document.createElement('div');
                triangle.className = 'triangle ' + board[row][col];
                
                // Only white pieces can be moved by the player
                if (board[row][col] === 'white') {
                    // For both desktop and mobile
                    cell.addEventListener('click', () => cellClick(row, col));
                }
                
                cell.appendChild(triangle);
            } else {
                // Empty cells also need click handlers for move destination
                cell.addEventListener('click', () => cellClick(row, col));
            }
            
            gameBoard.appendChild(cell);
        }
    }
}

function cellClick(row, col) {
    // If it's not white's turn, do nothing
    if (currentPlayer !== 'white') return;
    
    // If a cell with a white piece is clicked, select it
    if (board[row][col] === 'white' && !selectedCell) {
        selectedCell = { row, col };
        highlightCell(row, col, true);
        return;
    }
    
    // If a cell is already selected, try to move to the clicked cell
    if (selectedCell) {
        // Unhighlight the previously selected cell
        highlightCell(selectedCell.row, selectedCell.col, false);
        
        // If this is a valid move, make it
        if (isValidMove(selectedCell.row, selectedCell.col, row, col)) {
            // Move the piece
            board[row][col] = 'white';
            board[selectedCell.row][selectedCell.col] = null;
            
            // Check win condition
            if (row === 0) {
                renderBoard();
                setTimeout(() => {
                    alert('White wins!');
                    initializeBoard();
                }, 100);
                return;
            }
            
            // Switch to black's turn and render
            currentPlayer = 'black';
            selectedCell = null;
            renderBoard();
            
            // AI moves after a short delay
            setTimeout(makeBlackMove, 100);
        } else if (board[row][col] === 'white') {
            // If another white piece is clicked, select it instead
            selectedCell = { row, col };
            highlightCell(row, col, true);
        } else {
            // If an invalid move is attempted, clear selection
            selectedCell = null;
        }
    }
}

function highlightCell(row, col, highlight) {
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
        if (highlight) {
            cell.style.backgroundColor = '#ffeb3b';
        } else {
            cell.style.backgroundColor = '';
        }
    }
}

function isValidMove(row, col, newRow, newCol) {
    // Check if destination has a piece of the same color
    if (board[newRow][newCol] === board[row][col]) {
        return false;
    }
    
    // Check if move is one square horizontally or vertically
    const rowDiff = Math.abs(newRow - row);
    const colDiff = Math.abs(newCol - col);
    
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

function makeBlackMove() {
    // 1. Try to capture any adjacent white piece
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === 'black') {
                // Check the four adjacent squares for white pieces
                const directions = [
                    { r: 1, c: 0 },  // Down
                    { r: 0, c: -1 }, // Left
                    { r: 0, c: 1 },  // Right
                    { r: -1, c: 0 }  // Up
                ];
                
                for (const dir of directions) {
                    const newRow = row + dir.r;
                    const newCol = col + dir.c;
                    
                    // Check if square is valid and has a white piece
                    if (newRow >= 0 && newRow < boardSize && 
                        newCol >= 0 && newCol < boardSize && 
                        board[newRow][newCol] === 'white') {
                        
                        // Capture the white piece
                        board[newRow][newCol] = 'black';
                        board[row][col] = null;
                        
                        // Check if black won
                        if (newRow === boardSize - 1) {
                            renderBoard();
                            setTimeout(() => {
                                alert('Black wins!');
                                initializeBoard();
                            }, 100);
                            return;
                        }
                        
                        // End black's turn
                        currentPlayer = 'white';
                        renderBoard();
                        return;
                    }
                }
            }
        }
    }
    
    // 2. Try to move towards the goal while avoiding putting pieces in capture range
    let bestMove = null;
    let bestScore = -Infinity;
    
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === 'black') {
                // Check possible moves: down, left, right (not up)
                const directions = [
                    { r: 1, c: 0 },  // Down
                    { r: 0, c: -1 }, // Left
                    { r: 0, c: 1 }   // Right
                ];
                
                for (const dir of directions) {
                    const newRow = row + dir.r;
                    const newCol = col + dir.c;
                    
                    // Check if move is valid
                    if (newRow >= 0 && newRow < boardSize && 
                        newCol >= 0 && newCol < boardSize && 
                        board[newRow][newCol] === null) {
                        
                        // Calculate score for this move
                        let score = 0;
                        
                        // Prefer moving toward the goal
                        score += newRow * 10;
                        
                        // Avoid putting piece in capture range
                        if (!isInCaptureRange(newRow, newCol)) {
                            score += 50;
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
        
        // Check if black won
        if (bestMove.toRow === boardSize - 1) {
            renderBoard();
            setTimeout(() => {
                alert('Black wins!');
                initializeBoard();
            }, 100);
            return;
        }
        
        // End black's turn
        currentPlayer = 'white';
        renderBoard();
        return;
    }
    
    // 3. If no good move was found, make any valid move
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === 'black') {
                const directions = [
                    { r: 1, c: 0 },  // Down
                    { r: 0, c: -1 }, // Left
                    { r: 0, c: 1 }   // Right
                ];
                
                for (const dir of directions) {
                    const newRow = row + dir.r;
                    const newCol = col + dir.c;
                    
                    if (newRow >= 0 && newRow < boardSize && 
                        newCol >= 0 && newCol < boardSize && 
                        board[newRow][newCol] === null) {
                        
                        board[newRow][newCol] = 'black';
                        board[row][col] = null;
                        
                        // Check if black won
                        if (newRow === boardSize - 1) {
                            renderBoard();
                            setTimeout(() => {
                                alert('Black wins!');
                                initializeBoard();
                            }, 100);
                            return;
                        }
                        
                        // End black's turn
                        currentPlayer = 'white';
                        renderBoard();
                        return;
                    }
                }
            }
        }
    }
}

function isInCaptureRange(row, col) {
    // Check if any white piece could capture a piece at this position
    const directions = [
        { r: 1, c: 0 },  // Down
        { r: 0, c: -1 }, // Left
        { r: 0, c: 1 },  // Right
        { r: -1, c: 0 }  // Up
    ];
    
    for (const dir of directions) {
        const adjRow = row + dir.r;
        const adjCol = col + dir.c;
        
        if (adjRow >= 0 && adjRow < boardSize && 
            adjCol >= 0 && adjCol < boardSize && 
            board[adjRow][adjCol] === 'white') {
            return true;
        }
    }
    
    return false;
}

// Add instructions toggle functionality
document.getElementById('instructions-btn').addEventListener('click', function() {
    const instructions = document.getElementById('instructions');
    if (instructions.classList.contains('hidden')) {
        instructions.classList.remove('hidden');
        this.textContent = 'Hide Instructions';
    } else {
        instructions.classList.add('hidden');
        this.textContent = 'Show Instructions';
    }
});

// Initialize the game when the page loads
window.onload = initializeBoard;
