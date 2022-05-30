import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Spinner, Badge } from 'react-bootstrap'
import { BsFillPlayFill, BsFillStopFill } from 'react-icons/bs'
import { AiOutlineClose } from 'react-icons/ai'
import { FaPlus, FaMinus } from 'react-icons/fa'

import { startEngine, stopEngine, closeEngine, setOption , engineInit} from '../../state/engineSlice'

import './Engine.css';

function EngineDisplay() {
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(engineInit())
    }, dispatch)

    const {
        engineState,
        updating,
        options
    } = useSelector(state => state.engine)
    const name = useSelector(state => state.engine.engineNames[state.engine.selection])

    const state = engineState ? engineState[0] : null
    const pvs = engineState
    const whiteToMove = useSelector(state => state.editor.game.getCurrentPosition().isWhiteToMove())

    const getButtons = () => {
        const startClass = updating ? 'start-engine-disabled' :
            (state?.running ? 'start-engine-disabled' : 'start-engine-enabled');
        const stopClass = updating ? 'stop-engine-disabled' :
            (state?.running ? 'stop-engine-enabled' : 'stop-engine-disabled');

        const opt = options.filter(o => o.name.toUpperCase() == "MULTIPV");

        const override = opt.length < 1 || updating || !pvs;

        const incClass = (override || pvs.length >= 3) ? 'pv pv-disabled' :
            (state?.running ? 'pv pv-enabled' : 'pv pv-disabled');

        const decClass = (override || pvs.length < 2) ? 'pv pv-disabled' :
            (state?.running ? 'pv pv-enabled' : 'pv pv-disabled');

        const startHandler = updating ? null :
            (state?.running ? null : () => dispatch(startEngine()));
        const stopHandler = updating ? null :
            (state?.running ? () => dispatch(stopEngine()) : null);

        const optName = opt[0].name;
        const incHandler = incClass.includes('enabled') ?
            () => {
                dispatch(stopEngine())
                dispatch(setOption({name: optName, value: pvs.length + 1}))
                dispatch(startEngine())
            } : null;
        const decHandler = decClass.includes('enabled') ?
            () => {                
                dispatch(stopEngine())
                console.log('stopped')
                dispatch(setOption({name: optName, value: pvs.length - 1}))
                console.log('starting')
                dispatch(startEngine())
            } : null;

        return (
            <span style={{ fontSize: '18px', marginRight: '5px' }}>
                <BsFillPlayFill className={startClass} onClick={startHandler} />
                <BsFillStopFill className={stopClass} onClick={stopHandler} />
                <FaPlus className={incClass} onClick={incHandler} />
                <FaMinus className={decClass} onClick={decHandler} />
                <AiOutlineClose className="close-engine" onClick={() => dispatch(closeEngine())} />
            </span>
        );
    }

    const getMetrics = () => {
        if (!state) return null;
        return (
            <span>depth {state.depth},  {state.nps} nps, {state.nodes} nodes, {state.tbhits} tbhits</span>
        )
    }

    const getLines = () => {
        if (updating) return <Spinner animation="border" size="sm" />;
        else if (!pvs) return <span style={{ fontSize: '12px' }}>Engine not started.</span>;
        return pvs.map((pv, i) => {
            let score = pv.score;
            if (!whiteToMove) score = score * -1;
            if (pv.scoreType === "cp") {
                score = score / 100;
            }
            else {
                score = '#' + score;
            }
            return (<div style={{ height: '15px', fontSize: '10px', overflowY: 'hidden' }}>
                {i + 1}. ({score}): {pv.principleVariation?.join(' ')}
            </div>)
        });
    }

    return (
        <div style={{ width: '100%', backgroundColor: '#f0f4f4', padding: '3px', border: '2px solid #535657', borderRadius: '6px', marginTop: '10px' }}>
            <div style={{ fontSize: '11px', borderBottom: '1px solid black', paddingBottom: '2px' }}>
                <Badge bg="secondary" style={{ fontSize: '12px' }}>{name}</Badge>
                {getButtons()}
                {getMetrics()}
            </div>
            <div>
                {getLines()}
            </div>

        </div>
    );
}

export default EngineDisplay