export const EMPTY_SQUARE = -1;
export const WHITE_PAWN = 0;
export const BLACK_PAWN = 1;
export const WHITE_ROOK = 2;
export const BLACK_ROOK = 3;
export const WHITE_KNIGHT = 4;
export const BLACK_KNIGHT = 5;
export const WHITE_BISHOP = 6;
export const BLACK_BISHOP = 7;
export const WHITE_QUEEN = 8;
export const BLACK_QUEEN = 9;
export const WHITE_KING = 10;
export const BLACK_KING  = 11;

export const startingPosition = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
export const emptyBoard = '8/8/8/8/8/8/8/8 w - - 0 1';

export const squareToCoords = square => {
    if (square.length < 2) {
        return [-1,-1];
    }
    const x = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const y = 8 - (parseInt(square[1]));
    return [x, y];
}

export const coordsToSquare = (x, y) => {
    const file = String.fromCharCode(x + 'a'.charCodeAt(0));
    const rank = 8 - y;
    return file + rank;
};

export const isWhitePiece = piece => {
    return piece === WHITE_PAWN ||
        piece === WHITE_ROOK ||
        piece === WHITE_KNIGHT ||
        piece === WHITE_BISHOP ||
        piece === WHITE_QUEEN ||
        piece === WHITE_KING;
};

export const promotionPieces = white => {
    if (white) {
        return [WHITE_ROOK, WHITE_BISHOP, WHITE_KNIGHT, WHITE_QUEEN];
    }
    else {
        return [BLACK_ROOK, BLACK_BISHOP, BLACK_KNIGHT, BLACK_QUEEN];
    }
}

export const pieceToLetter = piece => {
    if (piece === WHITE_QUEEN || piece === BLACK_QUEEN) return 'Q';
    else if (piece === WHITE_KING || piece === BLACK_KING) return 'K';
    else if (piece === WHITE_ROOK || piece === BLACK_ROOK) return 'R';
    else if (piece === WHITE_BISHOP || piece === BLACK_BISHOP) return 'B';
    else if (piece === WHITE_KNIGHT || piece === BLACK_KNIGHT) return 'N';
    else return '';
}

export const letterToPiece = (letter, white) => {
    if (letter == 'R') return white ? WHITE_ROOK : BLACK_ROOK;
    else if (letter == 'N') return white ? WHITE_KNIGHT : BLACK_KNIGHT;
    else if (letter == 'B') return white ? WHITE_BISHOP : BLACK_BISHOP;
    else if (letter == 'Q') return white ? WHITE_QUEEN : BLACK_QUEEN;
    else if (letter == 'K') return white ? WHITE_KING : BLACK_KING;
    return null;
}

export const graphicFromPiece = piece => {
    switch (piece) {
        case WHITE_PAWN:
            return 'chess_graphics/white_pawn.png';
        case BLACK_PAWN:
            return 'chess_graphics/black_pawn.png';
        case WHITE_ROOK:
            return 'chess_graphics/white_rook.png';
        case BLACK_ROOK:
            return 'chess_graphics/black_rook.png';
        case WHITE_KNIGHT:
            return 'chess_graphics/white_knight.png';
        case BLACK_KNIGHT:
            return 'chess_graphics/black_knight.png';
        case WHITE_BISHOP:
            return 'chess_graphics/white_bishop.png';
        case BLACK_BISHOP:
            return 'chess_graphics/black_bishop.png';
        case WHITE_QUEEN:
            return 'chess_graphics/white_queen.png';
        case BLACK_QUEEN:
            return 'chess_graphics/black_queen.png';
        case WHITE_KING:
            return 'chess_graphics/white_king.png';
        case BLACK_KING:
            return 'chess_graphics/black_king.png';
        default:
            return null;
    }
}