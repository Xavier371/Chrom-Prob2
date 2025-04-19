function aiMove() {
    // First priority: Capture any white piece if possible
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === 'black') {
                const directions = [
                    { r: 1, c: 0 },  // Down
                    { r: 0, c: -1 }, // Left
                    { r: 0, c: 1 }   // Right
                ];
                
                // Look for capturing moves
                for (const { r, c } of directions) {
                    const newRow = row + r;
                    const newCol = col + c;
                    
                    if (newRow >= 0 && newRow < boardSize && 
                        newCol >= 0 && newCol < boardSize && 
                        board[newRow][newCol] === 'white') {
                        
                        // Make the capture move
                        board[newRow][newCol] = 'black';
                        board[row][col] = null;
                        
                        // Check win condition
                        if (newRow === boardSize - 1) {
                            renderBoard();
                            setTimeout(() => {
                                alert('Black wins!');
                                initializeBoard();
                            }, 100);
                            return;
                        }
                        
                        currentPlayer = 'white';
                        renderBoard();
                        return;
                    }
                }
            }
        }
    }
    
    // Second priority: Move towards goal while avoiding moves that put piece in capture range
    let bestMove = null;
    let bestScore = -Infinity;
    
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === 'black') {
                const directions = [
                    { r: 1, c: 0 },  // Down
                    { r: 0, c: -1 }, // Left
                    { r: 0, c: 1 }   // Right
                ];
                
                for (const { r, c } of directions) {
                    const newRow = row + r;
                    const newCol = col + c;
                    
                    if (newRow >= 0 && newRow < boardSize && 
                        newCol >= 0 && newCol < boardSize && 
                        board[newRow][newCol] === null) {
                        
                        // Calculate score - prefer moving down
                        let score = newRow * 10; // Higher score for moves closer to bottom
                        
                        // Check if move would place piece in capture range of white
                        if (!wouldBeInCaptureRange(newRow, newCol)) {
                            score += 50; // Strongly prefer safe moves
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
    
    // Make the best move if found
    if (bestMove) {
        board[bestMove.toRow][bestMove.toCol] = 'black';
        board[bestMove.fromRow][bestMove.fromCol] = null;
        
        // Check win condition
        if (bestMove.toRow === boardSize - 1) {
            renderBoard();
            setTimeout(() => {
                alert('Black wins!');
                initializeBoard();
            }, 100);
            return;
        }
        
        currentPlayer = 'white';
        renderBoard();
        return;
    }
    
    // Last resort: Make any valid move
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === 'black') {
                const directions = [
                    { r: 1, c: 0 },  // Down
                    { r: 0, c: -1 }, // Left
                    { r: 0, c: 1 }   // Right
                ];
                
                for (const { r, c } of directions) {
                    const newRow = row + r;
                    const newCol = col + c;
                    
                    if (newRow >= 0 && newRow < boardSize && 
                        newCol >= 0 && newCol < boardSize && 
                        board[newRow][newCol] === null) {
                        
                        board[newRow][newCol] = 'black';
                        board[row][col] = null;
                        
                        // Check win condition
                        if (newRow === boardSize - 1) {
                            renderBoard();
                            setTimeout(() => {
                                alert('Black wins!');
                                initializeBoard();
                            }, 100);
                            return;
                        }
                        
                        currentPlayer = 'white';
                        renderBoard();
                        return;
                    }
                }
            }
        }
    }
}

// Check if a position would be in capture range of any white piece
function wouldBeInCaptureRange(row, col) {
    const directions = [
        { r: -1, c: 0 }, // Up
        { r: 1, c: 0 },  // Down
        { r: 0, c: -1 }, // Left
        { r: 0, c: 1 }   // Right
    ];
    
    for (const { r, c } of directions) {
        const adjacentRow = row + r;
        const adjacentCol = col + c;
        
        if (adjacentRow >= 0 && adjacentRow < boardSize && 
            adjacentCol >= 0 && adjacentCol < boardSize && 
            board[adjacentRow][adjacentCol] === 'white') {
            return true;
        }
    }
    
    return false;
}
