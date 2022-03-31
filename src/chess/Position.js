import {
    BLACK_KING,
    BLACK_PAWN,
    EMPTY_SQUARE,
    isWhitePiece,
    letterToPiece,
    pieceToLetter,
    WHITE_KING,
    WHITE_PAWN
} from "./chess";

import { fenCharToPiece } from './fen'; 

export class Position {

    constructor(
        squares, whiteToMove, epTargetX, epTargetY, whiteCastleShort, whiteCastleLong,
        blackCastleShort, blackCastleLong, halfMoveClock, moveNumber
    ) {
        this.squares = squares;
        this.whiteToMove = whiteToMove;
        this.epTargetX = epTargetX;
        this.epTargetY = epTargetY;
        this.whiteCastleShort = whiteCastleShort;
        this.whiteCastleLong = whiteCastleLong;
        this.blackCastleShort = blackCastleShort;
        this.blackCastleLong = blackCastleLong;
        this.halfMoveClock = halfMoveClock;
        this.moveNumber = moveNumber;
    }

    copy({
        squares=this.squares, whiteToMove=this.whiteToMove, epTargetX=this.epTargetX,
        epTargetY=this.epTargetY, whiteCastleShort=this.whiteCastleShort,
        whiteCastleLong=this.whiteCastleLong, blackCastleShort=this.blackCastleShort,
        blackCastleLong=this.blackCastleLong, halfMoveClock=this.halfMoveClock,
        moveNumber=this.moveNumber    
    }) {
        return new Position(squares, whiteToMove, epTargetX, epTargetY, whiteCastleShort, 
            whiteCastleLong, blackCastleShort, blackCastleLong, halfMoveClock, moveNumber);
    }

    coordsToIndex(x, y) {
        return y * 8 + x;
    }

    getSquare(x, y) {
        return this.squares[this.coordsToIndex(x, y)];
    }

    isWhiteToMove() {
        return this.whiteToMove;
    }

    getMoveNumber() {
        return this.moveNumber;
    }

    getPossibleMoves(startSquare) {        
        const x = startSquare.x;
        const y = startSquare.y;
        
        let moves = [];
        let potentialMoves = [];
        if (startSquare.isPawn()) {            
            const direction = startSquare.isWhite() ? -1 : 1;
            if (y + direction >= 0 && y + direction < 8 && this.getSquare(x, y + direction).isEmpty()) {                
                potentialMoves.push([x, y + direction]);
                if ((startSquare.isWhite() && y === 6) || (!startSquare.isWhite() && y === 1)) {
                    if (this.getSquare(x, y + 2 * direction).isEmpty()) {
                        potentialMoves.push([x, y + direction * 2]);
                    }
                }
            }
            let captures = [[x + 1, y + direction], [x - 1, y + direction]];
            for (const pot of captures) {
                if (pot[0] < 0 || pot[0] > 7 || pot[1] < 0 || pot[1] > 7) continue;
                const sq = this.getSquare(pot[0], pot[1]);
                if ((this.epTargetX === pot[0] && this.epTargetY === pot[1]) ||
                    (!sq.isEmpty() && sq.isWhite() !== startSquare.isWhite())) {
                    potentialMoves.push([pot[0], pot[1]]);
                }

            }
        }
        else if (startSquare.isRook() || startSquare.isBishop() || startSquare.isQueen()) {
            let directions = [];
            if (startSquare.isRook() || startSquare.isQueen()) {
                directions = [...directions, [-1, 0], [1, 0], [0, -1], [0, 1]];
            }
            if (startSquare.isBishop() || startSquare.isQueen()) {
                directions = [...directions, [-1, -1], [-1, 1], [1, 1], [1, -1]];
            }
            for (const dir of directions) {
                let currX = x;
                let currY = y;
                while (true) {
                    currX += dir[0];
                    currY += dir[1];
                    if (currX < 0 || currX > 7 || currY < 0 || currY > 7) break;
                    const targetSquare = this.getSquare(currX, currY);
                    if (!targetSquare.isEmpty()) {
                        if (targetSquare.isWhite() !== startSquare.isWhite()) {
                            potentialMoves.push([currX, currY]);
                        }
                        break;
                    }
                    potentialMoves.push([currX, currY]);
                }
            }
        }
        else {
            let offsets = [];
            if (startSquare.isKnight()) {
                offsets = [[-1, 2], [-2, 1], [-1, -2], [-2, -1], [1, -2], [1, 2],
                [2, 1], [2, -1]];
            }
            else if (startSquare.isKing()) {
                offsets = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];

                if ((startSquare.isWhite() && this.whiteCastleShort) || (!startSquare.isWhite() && this.blackCastleShort)) {
                    const s1 = this.getSquare(x + 1, y);
                    const s2 = this.getSquare(x + 2, y);
                    if (s1.isEmpty() && s2.isEmpty()) {
                        potentialMoves.push([x + 2, y]);
                    }
                }
                if ((startSquare.isWhite() && this.whiteCastleLong) || (!startSquare.isWhite() && this.blackCastleLong)) {
                    const s1 = this.getSquare(x - 1, y);
                    const s2 = this.getSquare(x - 2, y);
                    if (s1.isEmpty() && s2.isEmpty()) {
                        potentialMoves.push([x - 2, y]);
                    }
                }
            }
            for (const offset of offsets) {
                const currX = x + offset[0];
                const currY = y + offset[1];
                if (currX < 0 || currX > 7 || currY < 0 || currY > 7) continue;
                const targetSquare = this.getSquare(currX, currY);
                if (targetSquare.isEmpty() || targetSquare.isWhite() !== startSquare.isWhite()) {
                    potentialMoves.push([currX, currY]);
                }
            }
        }
        for (const move of potentialMoves) {
            if (move[0] >= 0 && move[0] < 8 && move[1] >= 0 && move[1] < 8) {
                moves.push(move);
            }
        }
        return moves;
    }

    isKingInCheck(white) {
        let king = this.squares.filter(s => s.piece === (white ? WHITE_KING : BLACK_KING))[0];
        if (!king) return false;
        for (const piece of this.squares.filter(s => !s.isEmpty() && s.isWhite() !== white)) {
            for (const move of this.getPossibleMoves(piece)) {
                if (king.x === move[0] && king.y === move[1]) return true;
            }
        }
    }

    getEPTargets(white=this.whiteToMove) {
        const targets = [];
        for (const pawn of this.squares.filter(s => s.isPawn() && s.isWhite() === white)) {
            const x = pawn.x;
            const y = pawn.y;
            if (white && y !== 3) continue;
            if (!white && y !== 4) continue;
            const offset = white ? -1 : 1;            
            const xOffsets = [1, -1]
            for (const xDiff of xOffsets) {
                if (x + xDiff < 0 || x + xDiff > 7) continue;
                const targetPawn = this.getSquare(x + xDiff, y);
                const targetSquare = this.getSquare(x + xDiff, y + offset);
                if (targetPawn.isPawn() && targetPawn.isWhite() !== white && targetSquare.isEmpty()) {
                    targets.push([targetSquare.x, targetSquare.y]);                    
                }        
            }            
        }                
        return targets;
    }

    isLegal() {
        if (this.squares.filter(s => s.piece === WHITE_KING).length !== 1) return false;
        if (this.squares.filter(s => s.piece === BLACK_KING).length !== 1) return false;
        for (const p of this.squares.filter(s => s.isPawn())) {
            if (p.y > 6 | p.y < 1) return false;                        
        }
        if (this.isKingInCheck(!this.whiteToMove)) return false;
        return true;
    }

    isCheckMate() {
        for (const piece of this.squares.filter(s => !s.isEmpty() && s.isWhite() === this.whiteToMove)) {
            const moves = this.getValidMoves(piece);
            if (moves.length > 0) return false;
        }
        return this.isKingInCheck(this.whiteToMove);
    }

    getValidMoves(startSquare) {
        let possibleMoves = this.getPossibleMoves(startSquare);                
        let validMoves = [];
        for (const move of possibleMoves) {                        
            const possiblePos = this.makeMoveOnBoard(startSquare.x, startSquare.y, move[0], move[1]);
            if (possiblePos.isKingInCheck(true) && !possiblePos.whiteToMove) continue;
            if (possiblePos.isKingInCheck(false) && possiblePos.whiteToMove) continue;
            if (startSquare.isKing()) {
                const xDiff = Math.abs(move[0] - startSquare.x);
                if (xDiff === 2) {
                    if (this.isKingInCheck(this.whiteToMove)) continue;
                    const interPos = this.makeMoveOnBoard(startSquare.x, startSquare.y,
                        (startSquare.x + move[0]) / 2, move[1]);
                    if (interPos.isKingInCheck(this.whiteToMove)) continue;
                }
            }
            validMoves.push(move);
        }

        return validMoves;
    }

    isValidMove(x1, y1, x2, y2) {

        const startSquare = this.getSquare(x1, y1);
        const endSquare = this.getSquare(x2, y2);
        
        // Check that the right player moved
        if (startSquare.isWhite() !== this.whiteToMove) {
            return false;
        }        
        // Make sure players don't capture their own pieces
        if (!endSquare.isEmpty() && endSquare.isWhite() === this.whiteToMove) {
            return false;
        }
        
        for (const move of this.getValidMoves(startSquare)) {
            if (move[0] === x2 && move[1] === y2) return true;
        }

        return false;
    }

    makeMoveOnBoard(x1, y1, x2, y2, pp = -1) {
        const sq = [];
        for (const s of this.squares) {
            sq.push(s.copy());
        }
        const ss = this.getSquare(x1, y1);
        const piece = ss.piece;


        sq[this.coordsToIndex(x2, y2)].piece = piece;
        sq[this.coordsToIndex(x1, y1)].piece = EMPTY_SQUARE;

        // Check en passant
        if (ss.isPawn() && x2 === this.epTargetX && y2 === this.epTargetY) {
            sq[this.coordsToIndex(x2, y1)].piece = EMPTY_SQUARE;
        }

        // Check castles
        if (ss.isKing() && Math.abs(x2 - x1) > 1) {
            const dir = x2 - x1 < 0 ? -1 : 1;
            const rookX = dir === -1 ? 0 : 7;
            sq[this.coordsToIndex(x2 - dir, y2)].piece = this.getSquare(rookX, y2).piece;
            sq[this.coordsToIndex(rookX, y2)].piece = EMPTY_SQUARE;
        }

        // Check promotion
        if (ss.isPawn() && (y2 === 0 || y2 === 7)) {
            if (pp !== EMPTY_SQUARE) {
                sq[this.coordsToIndex(x2, y2)].piece = pp;
            }
        }

        let wcs = ((ss.isKing() && ss.isWhite()) || (x1 === 7 && y1 === 7)) ?
            false : this.whiteCastleShort;
        let wcl = ((ss.isKing() && ss.isWhite()) || (x1 === 0 && y1 === 7)) ?
            false : this.whiteCastleLong;
        let bcs = ((ss.isKing() && !ss.isWhite()) || (x1 === 7 && y1 === 0)) ?
            false : this.blackCastleShort;
        let bcl = ((ss.isKing() && !ss.isWhite()) || (x1 === 0 && y1 === 0)) ?
            false : this.blackCastleLong;

        let hmc = (ss.isPawn() || !this.getSquare(x2, y2).isEmpty()) ? 0 : this.halfMoveClock + 1;
        let epX = -1;
        let epY = -1;
        let mn = this.moveNumber + (this.whiteToMove ? 0 : 1);
        if (ss.isPawn() && Math.abs(y2 - y1) === 2) {
            epX = x1;
            epY = (y1 + y2) / 2;
        }

        return new Position(sq, !this.whiteToMove, epX, epY, wcs, wcl, bcs, bcl, hmc, mn);
    }

    isMovePromotion(x1, y1, x2, y2) {        
        if (!this.isValidMove(x1, y1, x2, y2)) return false;        
        return this.getSquare(x1, y1).isPawn() && (y2 === 0 || y2 === 7);
    }

    executeMove(x1, y1, x2, y2, pp = -1) {
        if (!this.isValidMove(x1, y1, x2, y2)) return null;        
        if (this.isMovePromotion(x1, y1, x2, y2) &&
            (pp == EMPTY_SQUARE || isWhitePiece(pp) !== this.whiteToMove || pp == WHITE_PAWN || pp == BLACK_PAWN)) {
            return null;
        }
        return this.makeMoveOnBoard(x1, y1, x2, y2, pp);
    }

    getMove(notation) {        
        if (notation.length < 2) return null;
        
        if (notation == 'O-O') {
            return this.whiteToMove ? [4, 7, 6, 7] : [4, 0, 6, 0];
        }
        else if (notation == 'O-O-O') {
            return this.whiteToMove ? [4, 7, 2, 7] : [4, 0, 2, 0];
        }

        // Chop off unnecessary characters
        while ('#+!?'.includes(notation[notation.length - 1]))
            notation = notation.substring(0, notation.length - 1);

        let x1 = -1;
        let y1 = -1;
        let pp = -1;

        if (notation.includes('=')) {
            // Extract promotion piece
            pp = letterToPiece(notation[notation.length - 1], this.whiteToMove);
            notation = notation.substring(0, notation.length - 2);
        }

        const y2 = 8 - parseInt(notation[notation.length - 1]);
        const x2 = notation.charCodeAt(notation.length - 2) - 'a'.charCodeAt(0);

        if (x2 < 0 || x2 > 7 || y2 < 0 || y2 > 7) return [-1,-1,-1,-1,-1];

        notation = notation.substring(0, notation.length - 2);
        let piece = notation.length < 1 ? null : letterToPiece(notation[0], this.whiteToMove);
        if (piece === null) {
            // Pawn move
            const offset = this.whiteToMove ? 1 : -1;
            if (y2 + offset > 7 || y2 + offset < 0) return [-1,-1,-1,-1,-1];
            if (notation.length >= 2 && notation[1] == 'x') {
                x1 = notation.charCodeAt(0) - 'a'.charCodeAt(0);
                y1 = y2 + offset;
            }
            else {
                x1 = x2;
                if (this.getSquare(x1, y2 + offset).isEmpty()) {
                    y1 = y2 + 2 * offset;
                }
                else {
                    y1 = y2 + offset;
                }
            }
        }
        else {
            notation = notation.replace('x', '');
            if (notation.length > 1) {
                // Disambiguation                
                if (isNaN(notation[1])) {
                    x1 = notation.charCodeAt(1) - 'a'.charCodeAt(0);                        
                }
                else {
                    y1 = 8 - parseInt(notation[1]);                    
                }
            }
            for (const sq of this.squares.filter(s => s.piece == piece)) {
                if ((x1 !== -1 && x1 != sq.x) || (y1 !== -1 && y1 != sq.y)) {
                    continue;
                }
                for (const move of this.getValidMoves(sq)) {
                    if (move[0] == x2 && move[1] == y2) {
                        x1 = sq.x;
                        y1 = sq.y;
                    }
                }
            }

        }
        return [x1, y1, x2, y2, pp];
    }

    parseEngineNotation(move) {
        const x1 = move.charCodeAt(0) - 'a'.charCodeAt(0);
        const x2 = move.charCodeAt(2) - 'a'.charCodeAt(0);
        const y1 = 8 - parseInt(move[1]);
        const y2 = 8 - parseInt(move[3]);
        if (move.length > 4) {
            if (this.whiteToMove) {
                return [x1, y1, x2, y2, fenCharToPiece(move[4].toUpperCase())];
            }
            else {
                return [x1, y1, x2, y2, fenCharToPiece(move[4].toLowerCase())];
            }
        }
        else {
            return [x1, y1, x2, y2, -1];
        }
    }

    getNotation(x1, y1, x2, y2, pp = -1) {        
        const ss = this.getSquare(x1, y1);
        const es = this.getSquare(x2, y2);

        if (ss.isKing() && Math.abs(x2 - x1) == 2) {
            // Castles
            if (x2 > x1) return 'O-O';
            else return 'O-O-O';
        }

        let move = ''

        move = (8 - y2) + move;
        move = String.fromCharCode('a'.charCodeAt(0) + x2) + move;

        if (!es.isEmpty() || (ss.isPawn() && x1 != x2)) {
            move = 'x' + move;
            if (ss.isPawn()) {
                move = String.fromCharCode('a'.charCodeAt(0) + x1) + move;
            }
        }

        for (const square of this.squares.filter(s => s.piece === ss.piece
            && s.isWhite() === ss.isWhite() && !s.isPawn())) {
            if (square.x === x1 && square.y === y1) continue;
            for (const m of this.getValidMoves(square)) {
                if (m[0] === x2 && m[1] === y2) {
                    if (square.x !== x1) {
                        move = String.fromCharCode('a'.charCodeAt(0) + x1) + move;
                    }
                    else {
                        move = (8 - y1) + move;
                    }
                }
            }
        }

        move = pieceToLetter(ss.piece) + move;

        if (this.isMovePromotion(x1, y1, x2, y2)) {
            if (pp !== -1) {
                move += '=' + pieceToLetter(pp);
            }
        }

        const newPos = this.makeMoveOnBoard(x1, y1, x2, y2);
        if (newPos.isCheckMate()) move += '#';
        else if (newPos.isKingInCheck(!this.whiteToMove)) move += '+';

        return move;
    }
}
