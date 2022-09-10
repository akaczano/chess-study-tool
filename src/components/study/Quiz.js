import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Container, Row, Col, Spinner, Button, ButtonGroup, Badge } from 'react-bootstrap'
import { BsPauseFill } from 'react-icons/bs'
import { FaBook } from 'react-icons/fa'
import { RiArrowGoBackLine } from 'react-icons/ri'

import NavButtons from '../editor/NavButtons'
import NotationDisplay from '../editor/NotationDisplay'
import ChessBoard from '../editor/ChessBoard'
import {
    loadVariation,
    goToStart,
    goToEnd,
    goForward,
    goBack,
    setReversed,
    goToMove,
    tryMove,
    updateVariation,
    updateTime
} from '../../state/quizSlice'



function Quiz() {
    const dispatch = useDispatch()

    const params = useSelector(state => state.nav.params)
    const { game, reversed, loading, variation, saving, dirty } = useSelector(state => state.quiz)

    useEffect(() => {
        dispatch(loadVariation(params.id))
        return () => dispatch(updateVariation())
    }, [dispatch, params.id])


    useEffect(() => {
        if (!variation.completed_date) {
            let timer = setTimeout(() => {
                dispatch(updateTime(variation.total_time + 1))
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [dispatch, variation.total_time, variation.completed_date])



    useEffect(() => {
        if (dirty && !saving) {
            dispatch(updateVariation())
        }
    }, [dispatch, saving, dirty])


    const start = () => {
        dispatch(goToStart())
        document.getElementById('move' + game.head.mainline?.key)?.scrollIntoViewIfNeeded();
    }

    const end = () => {
        dispatch(goToEnd())
        document.getElementById('move' + game.getTail().key)?.scrollIntoViewIfNeeded();
    }

    const forward = () => {
        dispatch(goForward())
        document.getElementById('move' + game.current.mainline?.key)?.scrollIntoViewIfNeeded();
    }

    const backward = () => {
        dispatch(goBack())
        document.getElementById('move' + game.current.prev?.key)?.scrollIntoViewIfNeeded();
    }

    const getTitle = () => {
        return variation.game_description
    }

    const getSubTitle = () => {
        return variation.session_description + '\t-\t' + variation.sequence_number
    }

    if (loading) {
        return (
            <Container>
                <p>Loading...</p>
                <Spinner animation="border" />
            </Container>
        )
    }
    else if (!game) {
        return <div></div>
    }

    return (
        <Container style={{ margin: 0 }}>

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
                        position={game.getCurrentPosition()}
                        onMove={(a, b, c, d, e) => { dispatch(tryMove([a, b, c, d, e])) }}
                        style={{ width: '73vh', height: '73vh', margin: 'auto' }}
                        reversed={reversed}
                        onRender={() => { }}
                    />
                    <div style={{ width: '73vh', margin: 'auto' }}>
                        <NavButtons
                            onFlip={() => dispatch(setReversed(!reversed))}
                            onGoForward={forward}
                            onGoBack={backward}
                            onGoToStart={start}
                            onGoToEnd={end}
                            backwardEnabled={game.canGoBackward()}
                            forwardEnabled={game.canGoForward()}
                        />
                    </div>

                </Col>
                <Col md={5} >
                    <div style={{ marginTop: '3vh', height: '78.5vh', border: '3px solid #535657', borderRadius: '6px', width: '100%' }}>
                        <Row style={{ margin: 0, width: '100%', backgroundColor: '#f0f0f1', padding: '3px', height: '75%', overflowY: 'auto', overflowX: 'hidden' }}>
                            <NotationDisplay game={game} goToMove={k => dispatch(goToMove(k))} />
                        </Row>
                        <Row style={{ width: '100%', height: '12.5%', padding: '5px', margin: 0 }}>
                            <Col md={6} style={{ textAlign: 'center' }}>
                                <span style={{ fontSize: '25px' }}>{variation.total_time}</span>
                            </Col>
                            <Col md={6}>
                                <ButtonGroup>
                                    <Button variant="secondary"><BsPauseFill /></Button>
                                    <Button variant="secondary">?</Button>
                                    <Button variant="secondary"><FaBook /></Button>
                                    <Button variant="secondary"><RiArrowGoBackLine /></Button>
                                </ButtonGroup>
                            </Col>
                        </Row>
                        <Row style={{ margin: 0 }}>
                            {variation.completed_date ? <Badge bg="success">Complete!</Badge> : "Your move"}
                        </Row>
                        <Row style={{margin: 0}}>
                            {variation.completed_date ? <Button variant="success">Next variation</Button> : null}
                        </Row>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default Quiz;