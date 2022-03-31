import React from 'react';
import { Modal } from 'react-bootstrap';

import './Editor.css';
import { graphicFromPiece, promotionPieces } from '../../chess/chess';
import Square from './Square';

class ChessBoard extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            dragging: -1,
            startX: -1,
            startY: -1,
            currentX: -1,
            currentY: -1,
            targetX: -1,
            targetY: -1,
            promotionModal: -1,
            onPromote: null
        };
    }

    squareDown(e, i) {
        if (this.props.onSquareClick) {            
            this.props.onSquareClick(i);
        }
        else {                                    
            e.target.style.zIndex = 10;
            this.setState({
                dragging: i,
                startX: e.clientX,
                startY: e.clientY,
                currentX: e.clientX,
                currentY: e.clientY
            });
        }                
    }

    squareUp(e, i) {
        if (this.state.dragging === -1) return;        
        e.target.style.zIndex = 0;
        this.setState({ dragging: -1 });
        let x1 = this.props.position.squares[i].x;
        let y1 = this.props.position.squares[i].y;
        if (this.state.targetX > 7 || this.state.targetX < 0 || this.state.targetY > 7 || this.state.targetY < 0) {
            return;
        }
        const coords = !this.props.reversed ? [x1, y1, this.state.targetX, this.state.targetY] :
            [7 - x1, 7 - y1, 7 - this.state.targetX, 7 - this.state.targetY];
        if (!this.props.position.isValidMove(...coords)) return;   
        
        if (this.props.position.isMovePromotion(coords[0], coords[1], coords[2], coords[3])) {            
            this.setState({
                promotionModal: this.props.position.whiteToMove ? 0 : 1,
                onPromote: p => {
                    this.setState({ promotionModal: -1 });
                    this.props.onMove(coords[0], coords[1], coords[2], coords[3], p);
                }
            })
        }
        else {
            this.props.onMove(coords[0], coords[1], coords[2], coords[3]);
        }
    }

    mouseMove(e) {
        if (this.state.dragging !== -1) {
            let target = e.target;
            if (!target.parentNode) return;            
            while (target.parentNode.className != 'chess-board') {
                target = target.parentNode;
                if (!target.parentNode) return;
            }
            let squareWidth = target.clientWidth;
            const rect = target.parentNode.getBoundingClientRect();
            if (e.clientX < rect.x || e.clientX > (rect.x + rect.width) || e.clientY < rect.y || e.clientY > (rect.y + rect.height)) {
                this.setState({dragging: -1});                
            }
            let positionX = e.clientX - rect.x;
            let positionY = e.clientY - rect.y;
            let x = Math.trunc(positionX / squareWidth);
            let y = Math.trunc(positionY / squareWidth);
            this.setState({ currentX: e.clientX, currentY: e.clientY, targetX: x, targetY: y });
        }
    }

    mouseLeave(e) {
        console.log('mouse leave');
        this.setState({
            dragging: -1,
            startX: -1,
            startY: -1,
            currentX: -1,
            currentY: -1,
            targetX: -1,
            targetY: -1
        }); 
    }

    modalHidden = () => {
        this.setState({ promotionModal: -1 });
    }

    render() {
        this.props.onRender();
        const squares = this.props.reversed ? this.props.position.squares.slice().reverse() :
            this.props.position.squares;
        return (

            <div style={this.props.style} className="chess-board" onMouseMove={e => this.mouseMove(e)} onMouseLeave={e => this.mouseLeave(e)}>
                <Modal show={this.state.promotionModal !== -1} onHide={this.modalHidden}>
                    <Modal.Header closeButton>
                        <Modal.Title>Promotion</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{ textAlign: 'center' }}>
                            {promotionPieces(this.state.promotionModal === 0).map(p => {
                                const imageSrc = '/' + graphicFromPiece(p);
                                return <img
                                    className="promote-button"
                                    src={imageSrc} key={"promote" + p}
                                    onClick={() => this.state.onPromote(p)}
                                />;
                            })}
                        </div>
                    </Modal.Body>
                </Modal>
                {squares.map((square, idx) => {
                    const offsetX = this.state.dragging === idx ? this.state.currentX - this.state.startX : 0;
                    const offsetY = this.state.dragging === idx ? this.state.currentY - this.state.startY : 0;
                    return (
                        <Square
                            square={square}
                            key={idx + ':' + square.piece}
                            down={e => this.squareDown(e, idx)}
                            up={e => this.squareUp(e, idx)}
                            offsetX={offsetX}
                            offsetY={offsetY}
                        />
                    );
                }
                )}
            </div>
        );
    }

}


export default ChessBoard;