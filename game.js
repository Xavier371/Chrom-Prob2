const boardSize = 8;
let board = [];
let currentPlayer = 'white';
let selectedPiece = null;

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
    selectedPiece = null;
    renderBoard();
    updateGameStatus();
}

function renderBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // Highlight selected piece
            if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
                cell.classList.add('selected');
            }
            
            if (board[row][col]) {
                const triangle = document.createElement('div');
                triangle.className = 'triangle ' + board[row][col];
                triangle.textContent = '▲';  // Unicode triangle character
                
                // For desktop and mobile: drag and drop
                triangle.draggable = true;
                triangle.ondragstart = (e) => dragStart(e, row, col);
                
                cell.appendChild(triangle);
            }
            
            // Add click handler for mobile and desktop
            cell.addEventListener('click', () => cellClick(row, col));
            
            // Add drop handler for desktop
            cell.ondragover = (e) => e.preventDefault();
            cell.ondrop = (e) => drop(e, row, col);
            
            gameBoard.appendChild(cell);
        }
    }
}

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (window.matchMedia && window.matchMedia('(max-width: 768px)').matches);
}

function cellClick(row, col) {
    // Only process if it's white's turn
    if (currentPlayer !== 'white') return;
    
    // If clicking on a white piece, select it
    if (board[row][col] === 'white') {
        // If already selected, deselect it
        if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
            selectedPiece = null;
            renderBoard();
            return;
        }
        
        // Select the piece
        selectedPiece = { row, col };
        renderBoard();
        return;
    }
    
    // If a piece is selected and we click on a valid destination, move it
    if (selectedPiece) {
        if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
            moveWhitePiece(selectedPiece.row, selectedPiece.col, row, col);
        }
    }
}

function dragStart(event, row, col) {
    if (currentPlayer === 'white' && board[row][col] === 'white') {
        event.dataTransfer.setData('text/plain', JSON.stringify({ row, col }));
        // Visually indicate the dragged piece
        selectedPiece = { row, col };
        setTimeout(() => renderBoard(), 0); // Needed for Firefox
    }
}

function drop(event, newRow, newCol) {
    // Only process if it's white's turn
    if (currentPlayer !== 'white') return;
    
    try {
        const { row, col } = JSON.parse(event.dataTransfer.getData('text/plain'));
        
        if (isValidMove(row, col, newRow, newCol)) {
            moveWhitePiece(row, col, newRow, newCol);
        }
    } catch (error) {
        console.error("Error in drop handler:", error);
    }
    
    // Clear selection
    selectedPiece = null;
    renderBoard();
}

// Mobile touch handling
let touchStartX = 0;
let touchStartY = 0;
let touchStartRow = null;
let touchStartCol = null;
let touchMovedElement = null;

function initTouchEvents() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.addEventListener('touchstart', handleTouchStart, { passive: false });
    gameBoard.addEventListener('touchmove', handleTouchMove, { passive: false });
    gameBoard.addEventListener('touchend', handleTouchEnd, { passive: false });
}

function handleTouchStart(event) {
    if (currentPlayer !== 'white') return;
    
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    
    let target = touch.target;
    // Find if we're touching a triangle
    while (target && !target.classList.contains('triangle')) {
        if (target === document.body) return;
        target = target.parentElement;
    }
    
    // Only proceed if we touched a white triangle
    if (target && target.classList.contains('triangle') && target.classList.contains('white')) {
        // Get cell coordinates
        const cell = target.parentElement;
        touchStartRow = parseInt(cell.dataset.row);
        touchStartCol = parseInt(cell.dataset.col);
        
        // Create a clone for dragging
        touchMovedElement = target.cloneNode(true);
        touchMovedElement.style.position = 'fixed';
        touchMovedElement.style.left = (touchStartX - 20) + 'px';
        touchMovedElement.style.top = (touchStartY - 20) + 'px';
        touchMovedElement.style.zIndex = '1000';
        touchMovedElement.style.opacity = '0.7';
        document.body.appendChild(touchMovedElement);
        
        // Select the piece
        selectedPiece = { row: touchStartRow, col: touchStartCol };
        renderBoard();
        
        event.preventDefault();
    }
}

function handleTouchMove(event) {
    if (!touchMovedElement) return;
    
    const touch = event.touches[0];
    
    // Move the ghost element with touch
    touchMovedElement.style.left = (touch.clientX - 20) + 'px';
    touchMovedElement.style.top = (touch.clientY - 20) + 'px';
    
    event.preventDefault();
}

function handleTouchEnd(event) {
    if (!touchMovedElement || !selectedPiece) {
        if (touchMovedElement) {
            document.body.removeChild(touchMovedElement);
            touchMovedElement = null;
        }
        return;
    }
    
    // Find what's under the touch point
    const touch = event.changedTouches[0];
    const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
    
    // Find the cell that was touched
    let cell = elementAtPoint;
    while (cell && !cell.dataset.row) {
        if (cell === document.body) break;
        cell = cell.parentElement;
    }
    
    // If we found a cell, try to move there
    if (cell && cell.dataset.row) {
        const toRow = parseInt(cell.dataset.row);
        const toCol = parseInt(cell.dataset.col);
        
        if (isValidMove(selectedPiece.row, selectedPiece.col, toRow, toCol)) {
            // Remove the ghost element before the game board updates
            document.body.removeChild(touchMovedElement);
            touchMovedElement = null;
            
            moveWhitePiece(selectedPiece.row, selectedPiece.col, toRow, toCol);
        } else {
            // Clean up if move was invalid
            document.body.removeChild(touchMovedElement);
            touchMovedElement = null;
            selectedPiece = null;
            renderBoard();
        }
    } else {
        // Clean up if no cell was found
        document.body.removeChild(touchMovedElement);
        touchMovedElement = null;
        selectedPiece = null;
        renderBoard();
    }
    
    event.preventDefault();
}

function moveWhitePiece(fromRow, fromCol, toRow, toCol) {
    // Move the piece
    board[toRow][toCol] = 'white';
    board[fromRow][fromCol] = null;
    
    // Check win condition
    if (toRow === 0) {
        renderBoard();
        setTimeout(() => {
            alert('White wins!');
            initializeBoard();
        }, 100);
        return;
    }
    
    // Switch to black's turn and render
    currentPlayer = 'black';
    selectedPiece = null;
    renderBoard();
    updateGameStatus();
    
    // AI moves after a short delay
    setTimeout(makeBlackMove, 500);
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
                        updateGameStatus();
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
                        
                        // Add slight randomness to prevent predictable play
                        score += Math.random() * 5;
                        
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
        updateGameStatus();
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
                        updateGameStatus();
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

function updateGameStatus() {
    // If the status element exists, update it
    const status = document.getElementById('game-status');
    if (status) {
        status.textContent = `Current turn: ${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`;
    }
}

// Add restart button functionality
document.addEventListener('DOMContentLoaded', function() {
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', initializeBoard);
    }
    
    // Add instructions toggle functionality
    const instructionsBtn = document.getElementById('instructions-btn');
    if (instructionsBtn) {
        instructionsBtn.addEventListener('click', function() {
            const instructions = document.getElementById('instructions');
            if (instructions) {
                if (instructions.classList.contains('hidden')) {
                    instructions.classList.remove('hidden');
                    this.textContent = 'Hide Instructions';
                } else {
                    instructions.classList.add('hidden');
                    this.textContent = 'Show Instructions';
                }
            }
        });
    }
});

// Initialize the game when the page loads
window.onload = function() {
    initializeBoard();
    initTouchEvents();
};
