import { getSymbol } from '../../chess/nag';

const MOVE = 0;
const START_VARIATION = 1;
const END_VARIATION = 2;
const SIDELINE = 3;
const MAINLINE = 4;
const COMMENTARY = 5;
const NAG = 6;

function NotationDisplay(props) {    
    const { game, goToMove } = props 

    const addMove = (node, buffer, moveNumber, useMoveNumber) => {
        buffer.push({
            type: MOVE,
            text: node.move,
            key: node.key,
            moveNumber,
            useMoveNumber,
            nags: node.nags,
            goTo: () => goToMove(node)
        });

        if (node.annotation.length > 0) {
            buffer.push({
                type: COMMENTARY,
                text: node.annotation
            });
        }
    }

    const listMoves = pos => {
        const tokens = [];
        let mainlineBuffer = [];
        let mn = 0;

        while (pos.mainline) {
            let useMoveNumber = mn % 2 === 0;
            let moveNumber = Math.trunc(mn++ / 2) + 1;
            moveNumber += useMoveNumber ? '.' : '...';
            addMove(pos.mainline, mainlineBuffer, moveNumber,
                useMoveNumber || mainlineBuffer.length < 1);
            if (pos.alternatives.length > 0) {
                tokens.push({
                    type: MAINLINE,
                    tokens: mainlineBuffer
                });
                mainlineBuffer = [];
            }
            for (const alt of pos.alternatives) {
                let sideline = [];
                addMove(alt, sideline, moveNumber, true)
                flatten(sideline, alt, mn);
                tokens.push({
                    type: SIDELINE,
                    tokens: sideline
                });
            }
            pos = pos.mainline;
        }
        if (mainlineBuffer.length > 0) {
            tokens.push({
                type: MAINLINE,
                tokens: mainlineBuffer
            });
        }
        return tokens;
    }

    // [Bc4, Nf6, Ng5, d5, exd5, Na5, Bb5+, c6, dxc6, bxc6, Be2, (, Qf3]
    const flatten = (tokens, node, mn) => {
        if (!node.mainline) return;
        let moveNumber = Math.trunc(mn / 2) + 1;
        let useMoveNumber = mn % 2 === 0;
        moveNumber += useMoveNumber ? '.' : '...';
        addMove(node.mainline, tokens, moveNumber, useMoveNumber);

        for (const alt of node.alternatives) {
            tokens.push({ type: START_VARIATION });
            addMove(alt, tokens, moveNumber, true);

            flatten(tokens, alt, mn + 1);
            tokens.push({ type: END_VARIATION });
        }
        flatten(tokens, node.mainline, mn + 1);
    }

    let tokCount = 0

    const renderToken = tok => {
        if (tok.type === MOVE) {
            const className = game.current.key == tok.key ?
                'notation-current' : 'notation-move';
            const text = (tok.useMoveNumber ? tok.moveNumber + tok.text : tok.text);
            let style = {}
            if (text.includes('-')) style = { whiteSpace: 'nowrap' };
            const items = [text, ...tok.nags].filter(i => i !== undefined);
            return (
                <span
                    className={className}
                    key={'move' + tok.key}
                    id={'move' + tok.key}
                    onClick={tok.goTo}
                    style={style}
                >
                    {items.map((t, i) => i === 0 ? t : getSymbol(t))}<text>  </text>
                </span>
            );
        }
        else if (tok.type === START_VARIATION) {
            return <span key={'tok' + tokCount++} className="notation-delimiter">(</span>
        }
        else if (tok.type === END_VARIATION) {
            return <span key={'tok' + tokCount++} className="notation-delimiter">)</span>
        }
        else if (tok.type === SIDELINE) {
            return (
                <div key={'tok' + tokCount++} className="notation-sideline">
                    {tok.tokens.map(t => renderToken(t))}
                </div>
            );
        }
        else if (tok.type === MAINLINE) {
            return (
                <div key={'tok' + tokCount++} className="notation-mainline">
                    {tok.tokens.map(t => renderToken(t))}
                </div>
            );
        }
        else if (tok.type === COMMENTARY) {
            return <span className="commentary">{'  ' + tok.text + '  '}</span>;
        }
        else if (tok.type === NAG) {
            return <span className="nag">{getSymbol(tok.value)}</span>
        }
    }
    
    const tokens = listMoves(game.head);
    return (
        <div className="notation-body">
            {tokens.map(t => renderToken(t))}
        </div>
    );

}


export default NotationDisplay