import { Position } from "./Position";
import { Square } from "./Square";
import {
    WHITE_PAWN,
    BLACK_PAWN,
    WHITE_ROOK,
    WHITE_KNIGHT,
    WHITE_BISHOP,
    WHITE_QUEEN,
    WHITE_KING,
    BLACK_ROOK,
    BLACK_KNIGHT,
    BLACK_BISHOP,
    BLACK_QUEEN,
    BLACK_KING,
    EMPTY_SQUARE,
    squareToCoords
} from "./chess";

const fenCharToPiece = c => {
    switch (c) {
        case 'p':
            return BLACK_PAWN;
        case 'P':
            return WHITE_PAWN;
        case 'r':
            return BLACK_ROOK;
        case 'n':
            return BLACK_KNIGHT
        case 'b':
            return BLACK_BISHOP;
        case 'q':
            return BLACK_QUEEN
        case 'k':
            return BLACK_KING;
        case 'R':
            return WHITE_ROOK;
        case 'N':
            return WHITE_KNIGHT;
        case 'B':
            return WHITE_BISHOP;
        case 'Q':
            return WHITE_QUEEN;
        case 'K':
            return WHITE_KING;
        default:
            return '';
    }
}


const fenPieceToChar = piece => {
    switch (piece) {
        case BLACK_PAWN:
            return 'p';
        case WHITE_PAWN:
            return 'P';
        case BLACK_ROOK:
            return 'r';
        case BLACK_KNIGHT:
            return 'n';
        case BLACK_BISHOP:
            return 'b';
        case BLACK_QUEEN:
            return 'q';
        case BLACK_KING:
            return 'k';
        case WHITE_ROOK:
            return 'R';
        case WHITE_KNIGHT:
            return 'N';
        case WHITE_BISHOP:
            return 'B';
        case WHITE_QUEEN:
            return 'Q';
        case WHITE_KING:
            return 'K';
        default:
            return '';
    }
};


export const parseFEN = fen => {
    let squares = [];
    let i = 0;
    let j = 0;
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const c = fen.charAt(i);
            if (isNaN(c)) {
                squares.push(new Square(x, y, fenCharToPiece(c)))

                i++;
            }
            else {
                squares.push(new Square(x, y, EMPTY_SQUARE));
                j++;
                if (j == parseInt(c)) {
                    j = 0;
                    i++;
                }
            }
        }
        i++;
    }
    let whiteToMove = fen.charAt(i) === 'w';
    let whiteCastleShort = false;
    let whiteCastleLong = false;
    let blackCastleShort = false;
    let blackCastleLong = false;
    let epTargetX = -1;
    let epTargetY = -1;
    let halfMoveClock = 0;
    let moveNumber = 1;
    i += 2;
    while (fen.charAt(i) != ' ') {
        let ch = fen.charAt(i++);
        if (ch === '-') break;
        else if (ch === 'K') {
            whiteCastleShort = true;
        }
        else if (ch === 'Q') {
            whiteCastleLong = true;
        }
        else if (ch === 'k') {
            blackCastleShort = true;
        }
        else if (ch === 'q') {
            blackCastleLong = true;
        }
    }
    i++;
    if (fen.charAt(i) !== '-') {
        let coords = squareToCoords(fen.charAt(i++) + fen.charAt(i++));
        epTargetX = coords[0];
        epTargetY = coords[1];
    }
    else {
        i++;
    }
    i++;
    let raw = '';
    while (fen.charAt(i) != ' ' && !isNaN(fen.charAt(i))) raw += fen.charAt(i++);
    halfMoveClock = parseInt(raw);
    i++;
    raw = '';
    while (fen.charAt(i) != ' ' && !isNaN(fen.charAt(i)) && i < fen.length) raw += fen.charAt(i++);
    moveNumber = parseInt(raw);

    return new Position(squares, whiteToMove, epTargetX, epTargetY, whiteCastleShort,
        whiteCastleLong, blackCastleShort, blackCastleLong, halfMoveClock, moveNumber);
};


export const writeFEN = pos => {
    let fen = '';
    let emptyCount = 0;
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const sq = pos.getSquare(x, y);
            if (sq.isEmpty()) {
                emptyCount++;
            }
            else {
                if (emptyCount > 0) {
                    fen += emptyCount;
                    emptyCount = 0;
                }
                fen += fenPieceToChar(sq.piece);
            }
        }
        if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
        }
        if (y + 1 < 8) fen += '/';
    }

    fen += (pos.whiteToMove ? ' w ' : ' b ');

    if (!(pos.whiteCastleShort || pos.whiteCastleLong || pos.blackCastleShort || pos.blackCastleLong)) {
        fen += '-';
    }
    else {
        if (pos.whiteCastleShort) fen += 'K';
        if (pos.whiteCastleLong) fen += 'Q';
        if (pos.blackCastleShort) fen += 'k';
        if (pos.blackCastleLong) fen += 'q';
    }

    if (pos.epTargetX !== -1) {
        fen += ' ';
        fen += String.fromCharCode('a'.charCodeAt(0) + pos.epTargetX);
        fen += (8 - pos.epTargetY);
    }
    else {
        fen += ' -';
    }

    fen += ' ' + pos.halfMoveClock;
    fen += ' ' + pos.moveNumber;

    return fen;
}