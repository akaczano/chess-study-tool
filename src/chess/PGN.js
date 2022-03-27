import { startingPosition } from "./chess";
import { parseFEN } from "./fen";
import Game from "./Game";
import { isMoveAnnotation, isValidNag, parseNag } from "./nag";

// Tokens
const TOK_PERIOD = '.';
const TOK_ASTERISK = '*'
const TOK_OPEN_BRACKET = '[';
const TOK_CLOSE_BRACKET = ']';
const TOK_OPEN_PAREN = '(';
const TOK_CLOSE_PAREN = ')';
const TOK_START_NAG = '$';
const TOK_OPEN_BRACE = '{';
const TOK_CLOSE_BRACE = '}';
const TOK_SEMICOLON = ';';

// Token types
const TOK_TYP_PERIOD = 0;
const TOK_TYP_ASTERISK = 1;
const TOK_TYP_OPEN_BRACKET = 2;
const TOK_TYP_CLOSE_BRACKET = 3;
const TOK_TYP_OPEN_PAREN = 4;
const TOK_TYP_CLOSE_PAREN = 5;
const TOK_TYP_NAG = 6;
const TOK_TYP_SYMBOL = 7;
const TOK_TYP_INTEGER = 8;
const TOK_TYP_STRING = 9;
const TOK_TYPE_COMMENT = 10;

class PGN {
    constructor(text=null, pos = startingPosition) {        
        if (text !== null) {             
            const tokens = this.lexan(text);
            if (tokens) {
                this.error = null;
                this.games = [new Game(parseFEN(pos))];                
                this.gameData = [{}];                                        
                this.parse(tokens);
            }
            else {
                this.error = 'Unexpected token';
            }
        }
    }    

    firstGame() {
        return this.games[0];
    }

    isValidForSymbol(c) {
        
        const code = c.charCodeAt(0);
        const codeA = 'A'.charCodeAt(0);
        const codez = 'z'.charCodeAt(0);
        const code0 = '0'.charCodeAt(0);
        const code9 = '9'.charCodeAt(0);
        const others = '_+=#:-/*';
        if (code >= codeA && code <= codez) return true;
        if (code >= code0 && code <= code9) return true;
        return others.includes(c);
    }
    
    parse(tokens) {        
        const stack = [];          

        let ptr = 0;
        
        for (let i = 0; i < tokens.length; i++) {            
            if (tokens[i].type !== TOK_TYP_OPEN_BRACKET && ptr >= this.games.length) {
                // Not part of the tag pair section
                let startPos = startingPosition;                                
                if (this.gameData[ptr].SetUp == '1' && this.gameData[ptr].FEN) {                    
                    startPos = this.gameData[ptr].FEN;
                }
                this.games.push(new Game(parseFEN(startPos)));
            }
            if (tokens[i].type === TOK_TYP_OPEN_BRACKET) {                                
                if (ptr >= this.gameData.length) {                    
                    this.gameData.push({});
                }
                if (i + 3 >= tokens.length || tokens[i + 3].type !== TOK_TYP_CLOSE_BRACKET) {                    
                    this.error = 'Invalid tag pair';
                    return;
                }                
                this.gameData[ptr][tokens[i + 1].value] = tokens[i + 2].value;
                i += 3;
            }
            else if (tokens[i].type === TOK_TYP_SYMBOL) {                                   
                if (['1-0', '1/2-1/2', '0-1', '*'].includes(tokens[i].value)) {
                    if (tokens[i].value != this.gameData[ptr]["Result"]) {
                        this.error = 'Game termination marker must match result';
                    }
                    ptr++;                    
                }       
                else {                                        
                    this.games[ptr] = this.games[ptr].doMoveNotation(tokens[i].value);
                }                  
            }
            else if (tokens[i].type === TOK_TYPE_COMMENT) {
                this.games[ptr].setAnnotation(tokens[i].value);
            }
            else if (tokens[i].type === TOK_TYP_OPEN_PAREN) {
                stack.push(this.games[ptr].current);
                this.games[ptr] = this.games[ptr].goBack();
            }
            else if (tokens[i].type === TOK_TYP_CLOSE_PAREN) {
                this.games[ptr].current = stack.pop();
            }      
            else if (tokens[i].type === TOK_TYP_NAG) {                   
                if (isValidNag(tokens[i].value)) {       
                    const nag = parseNag(tokens[i].value);             
                    const nags = this.games[ptr].getNAGs();                                        
                    if (isMoveAnnotation(tokens[i].value)) {
                        this.games[ptr].setNAGs([nag, nags[1]]);                
                    }
                    else {
                        this.games[ptr].setNAGs([nags[0], nag]);                
                    }
                }                                
            }      
        }        
    }

    lexan(text) {
        const tokens = [];        
        for (let i = 0; i < text.length; i++) {
            const c = text.charAt(i);

            if (c == '"') {
                let escape = false;
                let buffer = '';
                i++
                for (; i < text.length; i++) {
                    if (!escape && text.charAt(i) == '"') break;
                    if (text.charAt(i) == '\\') {
                        if (escape) {
                            buffer += '\\';
                            escape = false;
                        }
                        else {
                            escape = true;
                        }
                    }
                    else {
                        escape = false;
                        buffer += text.charAt(i);
                    }
                }
                tokens.push({type: TOK_TYP_STRING, value: buffer});
            }             
            else if (c == TOK_PERIOD) {
                tokens.push({type: TOK_TYP_PERIOD});
            }            
            else if (c == TOK_OPEN_BRACKET) {
                tokens.push({type: TOK_TYP_OPEN_BRACKET});                
            }
            else if (c == TOK_CLOSE_BRACKET) {
                tokens.push({type: TOK_TYP_CLOSE_BRACKET});
            }
            else if (c == TOK_OPEN_PAREN) {
                tokens.push({type: TOK_TYP_OPEN_PAREN});
            }
            else if (c == TOK_CLOSE_PAREN) {
                tokens.push({type: TOK_TYP_CLOSE_PAREN});
            }            
            else if (c == TOK_OPEN_BRACE) {
                i++;
                let buffer = '';
                for (; i < text.length; i++) {
                    if (text[i] == TOK_CLOSE_BRACE) break;
                    buffer += (text[i] == '\n' ? ' ' : text[i]);
                }
                tokens.push({type: TOK_TYPE_COMMENT, value: buffer});
            }
            else if (c == TOK_SEMICOLON) {
                i++;
                let buffer = '';
                for (; i < text.length; i++) {
                    if (text[i] == '\n') break;
                    buffer += (text[i] == '\n' ? ' ' : text[i]);
                }
                tokens.push({type: TOK_TYPE_COMMENT, value: buffer});
            }
            else if (c == TOK_START_NAG) {
                let buffer = '';                
                for (;i < text.length - 1; i++) {
                    if (isNaN(text.charAt(i+1)) || text.charAt(i+1).trim().length < 1) break;                
                    buffer += text.charAt(i+1);
                }
                tokens.push({type: TOK_TYP_NAG, value: parseInt(buffer)});
            }
            else if (c.trim().length < 1) continue;
            else {
                let buffer = '';
                let integer = true;
                for (; i < text.length; i++) {                
                    buffer += text.charAt(i);
                    if (isNaN(text.charAt(i))) integer = false;
                    if (i + 1 < text.length && !this.isValidForSymbol(text.charAt(i+1))) {                        
                        break;
                    }
                }
                if (integer) tokens.push({type: TOK_TYP_INTEGER, value: parseInt(buffer)});
                else tokens.push({type: TOK_TYP_SYMBOL, value: buffer});                
            }            
        }        

        return tokens;
    }

}


export default PGN;