import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, Row, Col, Form, ButtonGroup } from 'react-bootstrap';

import ChessBoard from './ChessBoard';
import { setStartPosition, setPositionModal } from '../../state/editorSlice';
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


function PositionModal(props) {

    const [selectedPiece, setSelectedPiece] = useState(EMPTY_SQUARE)
    const startPos = parseFEN(startingPosition);
    const empty = parseFEN(emptyBoard);

    const dispatch = useDispatch()
    const pos = useSelector(state => state.editor.game.head.position)
    const show = useSelector(state => state.editor.positionModal)

    const setSquare = i => {
        const squares = pos.squares.slice();
        squares[i].piece = selectedPiece;
        dispatch(setStartPosition(pos.copy({ squares })))
    }

    const renderPiece = p => {
        const graphic = `/${graphicFromPiece(p)}`
        let className = 'setup-image'
        let onClick = null
        if (p === selectedPiece) {
            className += ' selected'
            onClick = () => setSelectedPiece(EMPTY_SQUARE)
        }
        else {
            className += ' unselected'
            onClick = () => setSelectedPiece(p)
        }
        return (
            <img
                src={graphic}
                key={'setup' + graphic}
                className={className}
                onClick={onClick} />
        );
    }

    const whitePieces = [WHITE_PAWN, WHITE_ROOK, WHITE_KNIGHT, WHITE_BISHOP, WHITE_QUEEN, WHITE_KING];
    const blackPieces = [BLACK_PAWN, BLACK_ROOK, BLACK_KNIGHT, BLACK_BISHOP, BLACK_QUEEN, BLACK_KING];
    return (
        <Modal show={show} onHide={() => { }}>
            <Modal.Header>
                <h5>Edit starting position</h5>
                <ButtonGroup>
                    <Button
                        variant="primary"
                        onClick={() => dispatch(setStartPosition(startPos))}
                    >
                        Reset
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => dispatch(setStartPosition(empty))}
                    >
                        Clear
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => dispatch(setPositionModal(false))}
                        disabled={!pos.isLegal()}
                    >
                        Done
                    </Button>
                </ButtonGroup>
            </Modal.Header>
            <Modal.Body>
                <Row>
                    <Col md={8}>
                        <ChessBoard
                            position={pos}
                            onRender={() => { }}
                            style={{ width: '300px', height: '300px' }}
                            onSquareClick={i => setSquare(i)}
                        />
                    </Col>
                    <Col md={2}>
                        {whitePieces.map(renderPiece)}
                    </Col>
                    <Col md={2}>
                        {blackPieces.map(renderPiece)}
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
                                    value={pos.whiteToMove}
                                    onChange={e => dispatch(setStartPosition(pos.copy({
                                        whiteToMove: e.target.value == 'true' ? true : false
                                    })))}
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
                                    value={pos.epTargetX + ',' + pos.epTargetY}
                                    onChange={e => {
                                        const coords = e.target.value.split(',');
                                        const x = parseInt(coords[0]);
                                        const y = parseInt(coords[1]);
                                        dispatch(setStartPosition(pos.copy({
                                            epTargetX: x,
                                            epTargetY: y
                                        })))
                                    }}
                                >
                                    <option value="-1,-1">NA</option>
                                    {pos.getEPTargets().map(t => {
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
                                    value={pos.moveNumber}
                                    onChange={e => dispatch(setStartPosition(pos.copy({
                                        moveNumber: e.target.value
                                    })))}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '12px' }}>
                        <Col md={3}>
                            <Form.Check
                                label="W O-O"
                                checked={pos.whiteCastleShort}
                                onChange={e => dispatch(setStartPosition(pos.copy({
                                    whiteCastleShort: e.target.checked
                                })))}
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Check
                                label="W O-O-O"
                                checked={pos.whiteCastleLong}
                                onChange={e => dispatch(setStartPosition(pos.copy({
                                    whiteCastleLong: e.target.checked
                                })))}
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Check
                                label="B O-O"
                                checked={pos.blackCastleShort}
                                onChange={e => dispatch(setStartPosition(pos.copy({
                                    blackCastleShort: e.target.checked
                                })))}
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Check
                                label="B O-O-O"
                                checked={pos.blackCastleLong}
                                onChange={e => dispatch(setStartPosition(pos.copy({
                                    blackCastleLong: e.target.checked
                                })))}
                            />
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>

        </Modal>
    );

}


export default PositionModal

