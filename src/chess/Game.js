class PositionNode {
    constructor(pos, move) {
        this.prev = null;
        this.position = pos;
        this.move = move;
        this.mainline = null;
        this.alternatives = [];
        this.annotation = '';
        this.nags = [];
    }
}

class Game {
    constructor(pos) {
        if (pos) {
            this.head = new PositionNode(pos, null);
            this.head.key = '0';
            this.current = this.head;
        }
    }

    setNAGs(nags) {
        this.current.nags = nags;
        return this.getCopy(this.current);
    }

    getNAGs() {
        return this.current.nags;
    }

    setAnnotation(text) {
        this.current.annotation = text;
        return this.getCopy(this.current);
    }
    getAnnotation() {
        return this.current.annotation;
    }

    getTail() {
        let ptr = this.current;
        while (ptr.mainline) ptr = ptr.mainline;
        return ptr;
    }

    getLastMove() {
        return this.current.move;
    }

    getNextMove() {
        if (this.current.mainline) return this.current.mainline.move
        return null
    }

    getCurrentPosition() {
        return this.current.position;
    }

    getCopy(curr) {
        let newGame = new Game();
        newGame.head = this.head;
        newGame.current = curr;
        return newGame;
    }

    doMoveNotation(notation) {
        const params = this.current.position.getMove(notation);
        if (params && params[0] >= 0 && params[1] >= 0 && params[2] >= 0 && params[3] >= 0) {
            return this.doMove(params[0], params[1], params[2], params[3], params[4]);
        }
        return this;
    }

    doMove(x1, y1, x2, y2, pp) {
        if (x1 < 0 || y1 < 0 || x2 < 0 || y2 < 0 || x1 > 7 || x2 > 7 || y1 > 7 || y2 > 7) {
            return this;
        }
        const notation = this.current.position.getNotation(x1, y1, x2, y2, pp);
        if (this.current.mainline && notation == this.current.mainline.move) {
            return this.goForward();
        }
        for (let i = 0; i < this.current.alternatives.length; i++) {
            if (this.current.alternatives[i].move == notation) {
                return this.goForward(i);
            }
        }
        const newPos = this.current.position.executeMove(x1, y1, x2, y2, pp);
        if (newPos) {
            const node = new PositionNode(newPos, notation);
            node.prev = this.current;
            if (!this.current.mainline) {
                let newKey = '';
                let pieces = this.current.key.split(':');
                for (let i = 0; i < pieces.length - 1; i++) {
                    newKey += pieces[i] + ':';
                }
                newKey += (parseInt(pieces[pieces.length - 1]) + 1);

                node.key = newKey;
                this.current.mainline = node;
                return this.goForward();
            }
            else {
                node.key = this.current.key + ':' + this.current.alternatives.length + ':' + 0;
                this.current.alternatives.push(node);
                return this.goForward(this.current.alternatives.length - 1);
            }
        }
        return this;
    }

    goForward(index = -1) {
        if (!this.current.mainline) return this;        
        if (index === -1) {
            return this.getCopy(this.current.mainline);
        }
        else {
            if (index < this.current.alternatives.length) {
                return this.getCopy(this.current.alternatives[index]);                
            }            
            return this;            
        }        
    }

    goBack() {
        if (!this.current.prev) return this;
        return this.getCopy(this.current.prev);
    }

    goToBeginning() {
        return this.getCopy(this.head);
    }

    goToEnd() {
        let ptr = this.current;
        while (ptr.mainline) ptr = ptr.mainline;
        return this.getCopy(ptr);
    }

    canGoForward() {
        return this.current.mainline !== null;
    }

    canGoBackward() {
        return this.current.prev !== null;
    }

    goToMove(key) {
        let current = this.head;
        let index = 0;
        let pieces = key.split(':');
        while (index < pieces.length) {
            const target = parseInt(pieces[index++]);
            for (let i = 0; i < target; i++) current = current.mainline;
            if (index < pieces.length) {
                current = current.alternatives[parseInt(pieces[index++])];
            }
        }
        let ng = new Game();
        ng.head = this.head;
        ng.current = current;
        return ng
    }
    deleteCurrent() {
        if (this.current.prev.mainline === this.current) {
            this.current.prev.mainline = null;            
        }        
        else {
            const alts = this.current.prev.alternatives;

            this.current.prev.alternatives = alts.filter(a => a !== this.current);
        }
        return this.getCopy(this.current.prev);
    }
    promoteCurrent() {
        if (!this.current.prev) return this;
        const parent = this.current.prev;
        const mainline = parent.mainline;
        if (mainline === this.current) return this;
        parent.alternatives = [...parent.alternatives.filter(a => a !== this.current), mainline];
        parent.mainline = this.current;
        return this.getCopy(this.current);
    }

    canDelete() {
        return this.current.move !== null;
    }

    canPromote() {
        if (!this.current.prev) return false;
        return this.current.prev.mainline !== this.current;
    }

    canChangePosition() {
        return this.head.mainline === null
    }

    writePGN(pos = this.head, ply = 0) {
        let text = '';
        let curr = pos;

        const writeMoveNumber = (ply, force = false) => {
            if (!force && ply % 2 !== 0) return;
            text += (Math.trunc(ply / 2) + 1);
            if (ply % 2 === 0) text += '.';
            else text += '...';
        };

        const writeNode = (node, ply, force) => {
            writeMoveNumber(ply, force);
            text += node.move;
            text += ' ';
            if (node.nags.length  > 0) {
                for (const nag of node.nags) {
                    if (nag) text += `$${nag} `;
                }                
            }
            if (node.annotation.length > 0) {
                text += '{';
                text += node.annotation;
                text += '} '
            }
        };

        let force = false;
        while (curr.mainline) {
            writeNode(curr.mainline, ply, force);
            force = false;
            for (const alt of curr.alternatives) {
                text += '(';
                writeNode(alt, ply, true);
                text += this.writePGN(alt, ply + 1);
                text = text.substring(0, text.length - 1);
                text += ') ';
            }
            ply++;
            curr = curr.mainline;
        }
        return text;
    }

    flatten() {
        let strings = []
        let queue = [[this.head.mainline, '', 0]]        
        while (queue.length > 0) {
            let [curr, movetext, ply] = queue.pop()                        
            while (curr) {                


                if (ply % 2 == 0) {
                    movetext += ((ply / 2) + 1)
                    movetext += '. '
                }
                ply++                
                movetext += curr.move
                movetext += ' '
                if (curr.nags.length  > 0) {
                    for (const nag of curr.nags) {
                        if (nag) movetext += `$${nag} `;
                    }                
                }
                          
                for (const alt of curr.alternatives) {
                    queue.push([alt, movetext, ply])
                }

                curr = curr.mainline
            }
            strings.push(movetext)
        }
        return strings
    }    
}


export default Game;