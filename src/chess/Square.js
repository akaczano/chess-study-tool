import { 
    BLACK_PAWN,
    WHITE_PAWN,
    BLACK_ROOK,
    BLACK_KNIGHT,    
    BLACK_BISHOP,
    BLACK_QUEEN,    
    BLACK_KING, 
    WHITE_ROOK, 
    WHITE_KNIGHT,      
    WHITE_BISHOP,
    WHITE_QUEEN,
    WHITE_KING,
    EMPTY_SQUARE,
    isWhitePiece,
    graphicFromPiece
} from "./chess";

export class Square {
    constructor(x, y, piece) {
        this.x = x;
        this.y = y;
        this.piece = piece;
    }

    isWhite() {
        return isWhitePiece(this.piece);
    }

    isEmpty() {
        return this.piece === EMPTY_SQUARE;
    }

    isPawn() {
        return this.piece === WHITE_PAWN || this.piece === BLACK_PAWN;
    }

    isRook() {
        return this.piece === WHITE_ROOK || this.piece === BLACK_ROOK;
    }

    isKnight() {
        return this.piece === WHITE_KNIGHT || this.piece === BLACK_KNIGHT;
    }

    isBishop() {
        return this.piece === WHITE_BISHOP || this.piece === BLACK_BISHOP; 
    }

    isQueen() {
        return this.piece === WHITE_QUEEN || this.piece === BLACK_QUEEN;
    }

    isKing() {
        return this.piece === WHITE_KING || this.piece === BLACK_KING;
    }
    getGraphic() {
        return graphicFromPiece(this.piece);
    }

    copy() {
        return new Square(this.x, this.y, this.piece);
    }

    toString() {
        return this.x + "," + this.y + "," + this.piece;
    }
}