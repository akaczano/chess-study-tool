import React from 'react';
import { connect } from 'react-redux';
import { Button, Modal, Row, Col, Form, ButtonGroup } from 'react-bootstrap';

import ChessBoard from './ChessBoard';
import { setStartPosition, setPositionModal } from '../../actions/editorActions';
import { startingPosition, emptyBoard } from '../../chess/chess';

import {
    WHITE_PAWN,
    WHITE_ROOK,
    WHITE_KNIGHT,
    WHITE_BISHOP,
    WHITE_QUEEN,
    WHITE_KING,
    BLACK_PAWN,
    BLACK_ROOK,
    BLACK_KNIGHT,
    BLACK_BISHOP,
    BLACK_QUEEN,
    BLACK_KING,
    graphicFromPiece,
    EMPTY_SQUARE
} from '../../chess/chess';
import { parseFEN } from '../../chess/fen';


class PositionModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = { selectedPiece: EMPTY_SQUARE };
        this.startPos = parseFEN(startingPosition);
        this.empty = parseFEN(emptyBoard);
    }

    setSquare(i) {
        const squares = this.props.pos.squares.slice();
        squares[i].piece = this.state.selectedPiece;
        this.props.setStartPosition(this.props.pos.copy({ squares }));
    }

    renderPiece = p => {
        const graphic = `/${graphicFromPiece(p)}`;
        let className = 'setup-image';
        let onClick = null;
        if (p === this.state.selectedPiece) {
            className += ' selected';
            onClick = () => this.setState({ selectedPiece: EMPTY_SQUARE });
        }
        else {
            className += ' unselected';
            onClick = () => this.setState({ selectedPiece: p });
        }
        return (
            <img
                src={graphic}
                key={'setup' + graphic}
                className={className}
                onClick={onClick} />
        );
    }

    render() {
        const whitePieces = [WHITE_PAWN, WHITE_ROOK, WHITE_KNIGHT, WHITE_BISHOP, WHITE_QUEEN, WHITE_KING];
        const blackPieces = [BLACK_PAWN, BLACK_ROOK, BLACK_KNIGHT, BLACK_BISHOP, BLACK_QUEEN, BLACK_KING];
        return (
            <Modal show={this.props.show} onHide={() => { }}>
                <Modal.Header>
                    <h5>Edit starting position</h5>
                    <ButtonGroup>
                        <Button
                            variant="primary"
                            onClick={() => this.props.setStartPosition(this.startPos)}
                        >
                            Reset
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => this.props.setStartPosition(this.empty)}
                        >
                            Clear
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => this.props.setPositionModal(false)}
                            disabled={!this.props.pos.isLegal()}
                        >
                            Done
                        </Button>
                    </ButtonGroup>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md={8}>
                            <ChessBoard
                                position={this.props.pos}
                                style={{ width: '300px', height: '300px' }}
                                onSquareClick={i => this.setSquare(i)}
                            />
                        </Col>
                        <Col md={2}>
                            {whitePieces.map(this.renderPiece)}
                        </Col>
                        <Col md={2}>
                            {blackPieces.map(this.renderPiece)}
                        </Col>
                    </Row>
                    <hr />
                    <Form>
                        <Row>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Side to move</Form.Label>
                                    <select
                                        className="form-control"
                                        value={this.props.pos.whiteToMove}
                                        onChange={e => this.props.setStartPosition(this.props.pos.copy({
                                            whiteToMove: e.target.value == 'true' ? true : false
                                        }))}
                                    >
                                        <option value={true}>White</option>
                                        <option value={false}>Black</option>
                                    </select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>EP Target</Form.Label>
                                    <select
                                        className="form-control"
                                        value={this.props.pos.epTargetX + ',' + this.props.pos.epTargetY}
                                        onChange={e => {
                                            const coords = e.target.value.split(',');
                                            const x = parseInt(coords[0]);
                                            const y = parseInt(coords[1]);
                                            this.props.setStartPosition(this.props.pos.copy({
                                                epTargetX: x,
                                                epTargetY: y
                                            }));
                                        }}
                                    >
                                        <option value="-1,-1">NA</option>
                                        {this.props.pos.getEPTargets().map(t => {
                                            const square = String.fromCharCode(t[0] + 'a'.charCodeAt(0)) + (8 - t[1]);
                                            return <option key={'EP' + square} value={t[0] + ',' + t[1]}>{square}</option>
                                        })}
                                    </select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Move Number</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={this.props.pos.moveNumber}
                                        onChange={e => this.props.setStartPosition(this.props.pos.copy({
                                            moveNumber: e.target.value
                                        }))}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row style={{ marginTop: '12px' }}>
                            <Col md={3}>
                                <Form.Check
                                    label="W O-O"
                                    checked={this.props.pos.whiteCastleShort}
                                    onChange={e => this.props.setStartPosition(this.props.pos.copy({
                                        whiteCastleShort: e.target.checked
                                    }))}
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Check
                                    label="W O-O-O"
                                    checked={this.props.pos.whiteCastleLong}
                                    onChange={e => this.props.setStartPosition(this.props.pos.copy({
                                        whiteCastleLong: e.target.checked
                                    }))}
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Check
                                    label="B O-O"
                                    checked={this.props.pos.blackCastleShort}
                                    onChange={e => this.props.setStartPosition(this.props.pos.copy({
                                        blackCastleShort: e.target.checked
                                    }))}
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Check
                                    label="B O-O-O"
                                    checked={this.props.pos.blackCastleLong}
                                    onChange={e => this.props.setStartPosition(this.props.pos.copy({
                                        blackCastleLong: e.target.checked
                                    }))}
                                />
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>

            </Modal>
        );
    }
}

const mapStateToProps = state => {
    return {
        show: state.editor.positionModal,
        pos: state.editor.game.head.position
    };
};

export default connect(mapStateToProps, { setStartPosition, setPositionModal })(PositionModal);

