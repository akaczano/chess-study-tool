import { useState } from 'react';
import { Button, ButtonGroup, Form, Row, Col } from 'react-bootstrap';
import { GiEmptyChessboard } from 'react-icons/gi';
import { FaChessBishop, FaWpforms } from 'react-icons/fa';
import { AiOutlineArrowUp, AiFillDelete, AiFillEdit, AiFillSave } from 'react-icons/ai';
import { RiArrowGoBackLine } from 'react-icons/ri';
import { BsFillCpuFill } from 'react-icons/bs'
import { useSelector, useDispatch } from 'react-redux';

import {
    setModal,
    deleteMove,
    promoteMove,
    setAnnotation,
    setPositionModal,
    setNAGs
} from '../../state/editorSlice';
import { openModal } from '../../state/engineSlice';

import { nags } from '../../chess/nag';

import NotationDisplay from './NotationDisplay';

function NagSelector(props) {
    const [selectedTab, setSelectedTab] = useState(0)

    const getTabClass = tab => {
        if (tab == selectedTab) return 'tab-button active';
        else return 'tab-button'
    }

    const getNAGs = () => {
        return Object.entries(nags).filter(item =>
            (item[1].moveAnnotation && selectedTab === 0) ||
            (!item[1].moveAnnotation && selectedTab === 1))
    }

    const handleClick = nag => {
        if (selectedTab == 0) {
            props.handler([nag, props.nags[1]]);
        }
        else {
            props.handler([props.nags[0], nag]);
        }
    }

    return (
        <div style={{ width: '100%', backgroundColor: '#f0f0f1', height: '75%' }}>
            <Row style={{ backgroundColor: '#f1f1f1', margin: '0px', height: '7%' }}>
                <button style={{ maxHeight: '100%', fontSize: '14px' }}
                    className={getTabClass(0)}
                    onClick={() => setSelectedTab(0)}>Move</button>
                <button style={{ maxHeight: '100$', fontSize: '14px' }}
                    className={getTabClass(1)}
                    onClick={() => setSelectedTab(1)}>Position</button>
            </Row>
            <div style={{ height: '93%', overFlowY: 'auto', overflowX: 'hidden', marginLeft: '2px' }}>

                {getNAGs().map(item => {
                    const disabled = props.nags[0] == item[0] || props.nags[1] == item[0]
                    return (
                        <p style={{ marginTop: '5px' }}>
                            <Button
                                variant="info"
                                style={{ marginRight: '5px' }}
                                disabled={disabled}
                                onClick={() => handleClick(item[0])}
                            >
                                {item[1].symbol}
                            </Button>
                            {item[1].description}
                        </p>
                    );
                })}
            </div>
        </div>
    );
}

function PGNDisplay(props) {
    const [nagDisplay, setNagDisplay] = useState(false)
    const dispatch = useDispatch()
    const { game, dirty } = useSelector(state => state.editor)
    const { loaded } = useSelector(state => state.engine)

    const getContent = () => {
        if (nagDisplay) {
            return <NagSelector nags={game.getNAGs()} handler={ns => dispatch(setNAGs(ns))} />
        }
        else {
            return (
                <div style={{ width: '100%', backgroundColor: '#f0f0f1', padding: '3px', height: '75%', overflowY: 'auto', overflowX: 'hidden' }}>
                    <NotationDisplay />
                </div>
            )
        }
    }
    const height = loaded ? '70vh' : '78.5vh'
    return (
        <div style={{ marginTop: '3vh', height: height, border: '3px solid #535657', borderRadius: '6px', width: '100%' }}>
            {getContent()}
            <Row style={{ width: '100%', margin: '0', marginTop: '1px' }}>
                <Col md={11} style={{ padding: '0' }}>
                    <Form.Control
                        type="text"
                        value={game.getAnnotation()}
                        onChange={e => dispatch(setAnnotation(e.target.value))}
                    />
                </Col>
                <Col md={1} style={{ padding: '0' }}>
                    <Button
                        variant="secondary"
                        onClick={() => setNagDisplay(!nagDisplay)}
                    >
                        {nagDisplay ? 'x' : '?!'}
                    </Button>
                </Col>
            </Row>
            <div style={{ width: '100%', padding: '5px' }}>
                <div style={{ width: 'fit-content', margin: 'auto' }}>
                    <ButtonGroup >
                        <Button
                            variant="secondary"
                            disabled={!game.canPromote()}
                            onClick={() => dispatch(promoteMove)}
                        >
                            <FaChessBishop /><AiOutlineArrowUp />
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => dispatch(deleteMove())}
                            disabled={!game.canDelete()}
                        >
                            <FaChessBishop /><AiFillDelete />
                        </Button>
                        <Button
                            variant="secondary"
                            disabled={!game.canChangePosition()}
                            onClick={() => dispatch(setPositionModal(true))}
                        >
                            <GiEmptyChessboard />
                            <AiFillEdit />
                        </Button>
                        <Button variant="secondary" onClick={() => dispatch(openModal())}><BsFillCpuFill /></Button>
                        <Button variant="secondary" onClick={() => dispatch(setModal(true))}> <FaWpforms /> </Button>
                        <Button variant="primary" onClick={() => props.onSave()} disabled={!dirty}>
                            <AiFillSave />
                        </Button>
                        <Button variant="primary" onClick={() => props.onClose()}>
                            <RiArrowGoBackLine />
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
        </div>
    );
}

export default PGNDisplay