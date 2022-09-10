import { useState, useEffect } from 'react'
import { Container, Row, Col, Modal, Spinner, Button, Alert } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'

import NavButtons from './NavButtons'
import ChessBoard from './ChessBoard'
import PGNDisplay from './PGNDisplay'
import DataModal from './DataModal'
import PositionModal from './PositionModal'
import EngineDialog from './EngineDialog'
import EngineDisplay from './EngineDisplay'
import {
    loadGame,
    goForward,
    goBackward,
    goToStart,
    goToEnd,
    doMove,
    setModal,
    saveGame,
    clearError
} from '../../state/editorSlice';
import { closeEngine, restartIfNeeded, stopEngine } from '../../state/engineSlice';
import { DATABASE, go } from '../../state/navSlice'

function PGNEditor() {
    const [reversed, setReversed] = useState(false)

    const dispatch = useDispatch()
    const state = useSelector(state => state.editor)
    const { loaded } = useSelector(state => state.engine)

    const id = useSelector(state => state.nav.params.id)
    const parentParam = useSelector(state => state.nav.params.parent)

    useEffect(() => {
        const fun = e => {
            if (e.key == 'ArrowLeft') {
                backward()
                document.getElementById('move' + state.game.current.prev?.key)?.scrollIntoViewIfNeeded();
            }
            else if (e.key == 'ArrowRight') {
                forward()
            }
        }
        document.addEventListener("keydown", fun)
        return () => document.removeEventListener("keydown", fun)
    })

    useEffect(() => {
        dispatch(loadGame(id))        
        return () => {            
            dispatch(stopEngine())
            dispatch(closeEngine())
        }
    }, [dispatch, id])

    const getParent = () => {
        if (state.gameData.parent_id) return state.gameData.parent_id;
        return parentParam
    }

    const getAlert = () => {
        if (state.error) {
            return (
                <Alert variant="danger" onClose={() => dispatch(clearError())} dismissible>
                    {state.error}
                </Alert>
            );
        }
        return null;
    }

    const flipBoard = () => {
        setReversed(!reversed)
    }

    const start = () => {
        dispatch(goToStart())
        document.getElementById('move' + state.game.head.mainline?.key)?.scrollIntoViewIfNeeded();
    }

    const end = () => {
        dispatch(goToEnd())
        document.getElementById('move' + state.game.getTail().key)?.scrollIntoViewIfNeeded();
    }

    const forward = () => {
        dispatch(goForward())
        document.getElementById('move' + state.game.current.mainline?.key)?.scrollIntoViewIfNeeded();
    }

    const backward = () => {
        dispatch(goBackward())
        document.getElementById('move' + state.game.current.prev?.key)?.scrollIntoViewIfNeeded();
    }

    const onSave = () => {
        console.log(getParent())
        dispatch(saveGame(getParent()))
    }

    const onClose = () => {
        let p = getParent();
        dispatch(go({ location: DATABASE, params: p ? p : '' }))
    }

    const onMove = (a, b, c, d, e) => {
        dispatch(doMove([a, b, c, d, e]))
        document.getElementById('move' + state.game.current.prev?.key)?.scrollIntoViewIfNeeded();
    }


    if (!state.loaded) {
        return (
            <Modal show={true}>
                <Modal.Header>
                    <h4>Please wait</h4>
                </Modal.Header>
                <Modal.Body>
                    <span style={{ fontSize: '18px' }}>
                        Loading game...
                    </span>
                    <Spinner animation="border" variant="primary" style={{ float: 'right' }} />
                </Modal.Body>
            </Modal>
        );
    }

    const {
        white_name,
        black_name,
        white_rating,
        black_rating,
        result,
        event,
        site,
        date,
        type,
        side,
        description
    } = state.gameData

    const getTitle = () => {
        if (type == 1) {
            return `${white_name} (${white_rating}) ${result == '*' ? ' - ' : result} ${black_name} (${black_rating})`            
        }
        else {
            return description
        }
    }

    const getSubTitle = () => {
        if (type == 1) {
            return `${event}, ${site} (${date?.toLocaleDateString()})`
        }
        else if (type === 2) {
            return side ? 'For Black' : 'For White'
        }
        else {
            return null
        }
    }

    return (
        <Container style={{ margin: 0 }}>

            <DataModal />
            <PositionModal />
            <EngineDialog />

            <Row style={{ height: '100%', width: '100%', margin: 0 }}>

                <Col md={7}>
                    <div style={{ width: '100%', textAlign: 'center' }}>
                        <strong style={{ fontSize: '19px' }}>
                            {getTitle()}
                        </strong><br />
                        <span style={{ color: '#828281', fontSize: '14px' }}>
                            {getSubTitle()}
                        </span>
                    </div>
                    <ChessBoard
                        position={state.game.getCurrentPosition()}
                        onMove={onMove}
                        style={{ width: '73vh', height: '73vh', margin: 'auto' }}
                        reversed={reversed}
                        onRender={() => dispatch(restartIfNeeded())}
                    />
                    <div style={{ width: '73vh', margin: 'auto' }}>
                        <NavButtons
                            onFlip={() => flipBoard()}
                            onGoForward={forward}
                            onGoBack={backward}
                            onGoToStart={start}
                            onGoToEnd={end}
                            backwardEnabled={state.game.canGoBackward()}
                            forwardEnabled={state.game.canGoForward()}
                        />
                    </div>

                </Col>
                <Col md={5} >
                    {getAlert()}
                    <PGNDisplay
                        game={state.game}
                        /*onUpdate={() => this.setState({ game: this.props.game })}*/
                        onSave={onSave}
                        onClose={onClose}
                    />
                    {loaded ? <EngineDisplay /> : null}
                </Col>
            </Row>
        </Container>
    );

}

export default PGNEditor