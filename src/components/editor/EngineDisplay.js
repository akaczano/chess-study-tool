import React from 'react';
import { connect } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import { BsFillPlayFill, BsFillStopFill } from 'react-icons/bs';
import { AiOutlineClose } from 'react-icons/ai';
import { FaPlus, FaMinus } from 'react-icons/fa';

import { startEngine, stopEngine, closeEngine, setOption } from '../../actions/engineActions';

import './Engine.css';

class EngineDisplay extends React.Component {    

    getButtons() {        
        const startClass = this.props.updating ? 'start-engine-disabled' :
            (this.props.state?.running ? 'start-engine-disabled' : 'start-engine-enabled');
        const stopClass = this.props.updating ? 'stop-engine-disabled' :
            (this.props.state?.running ? 'stop-engine-enabled' : 'stop-engine-disabled');

        const opt = this.props.options.filter(o => o.name.toUpperCase() == "MULTIPV");

        const override = opt.length < 1 || this.props.updating || !this.props.pvs;

        const incClass = (override || this.props.pvs.length >= 3) ? 'pv pv-disabled' :
        (this.props.state?.running ? 'pv pv-enabled' : 'pv pv-disabled');

        const decClass = (override || this.props.pvs.length < 2) ? 'pv pv-disabled' :
        (this.props.state?.running ? 'pv pv-enabled' : 'pv pv-disabled'); 

        const startHandler = this.props.updating ? null :
            (this.props.state?.running ? null : () => this.props.startEngine());
        const stopHandler = this.props.updating ? null :
            (this.props.state?.running ? () => this.props.stopEngine() : null);

        const optName = opt[0].name;
        const incHandler = incClass.includes('enabled') ?
            () => {                                
                this.props.stopEngine();
                this.props.setOption(optName, this.props.pvs.length + 1);
                this.props.startEngine();
            } : null;
        const decHandler = decClass.includes('enabled') ?
            () => {
                this.props.stopEngine();
                this.props.setOption(optName, this.props.pvs.length - 1);
                this.props.startEngine();
            } : null;

        return (
            <span style={{fontSize: '18px', marginRight: '5px'}}>
                <BsFillPlayFill className={startClass} onClick={startHandler} />
                <BsFillStopFill className={stopClass} onClick={stopHandler} />
                <FaPlus className={incClass} onClick={incHandler}/>  
                <FaMinus className={decClass} onClick={decHandler}/>
                <AiOutlineClose className="close-engine" onClick={() => this.props.closeEngine() }/>
            </span>    
        );
    }

    getMetrics() {
        if (!this.props.state) return null;
        return (
            <span>depth {this.props.state.depth},  {this.props.state.nps} nps</span>
        )
    }

    getLines() {
        if (this.props.updating) return <Spinner animation="border" />;        
        else if (!this.props.pvs) return <span>Engine not started.</span>;        
        return this.props.pvs.map((pv, i) => {            
            let score = pv.score;
            if (!this.props.whiteToMove) score = score * -1;
            if (pv.scoreType === "CENTIPAWN") {
                score = score / 100;
            }
            else {
                score = '#' + score;
            }                          
            return (<div style={{height: '15px', fontSize: '10px', overflowY: 'hidden'}}>
                {i + 1}. ({score}): {pv.principleVariation.join(' ')}
            </div>)
        });
    }

    render() {               
        return (
            <div style={{width: '100%', backgroundColor: 'white', padding: '3px', border: '2px solid gray', borderRadius: '3px', marginTop: '10px'}}>
                <div style={{fontSize: '11px', borderBottom: '1px solid black', paddingBottom: '2px'}}>
                    {this.props.name}                    
                    {this.getButtons()}
                    {this.getMetrics()}
                </div>
                <div>                                        
                    {this.getLines()}
                </div>
                
            </div>
        );
    }

}

const mapStateToProps = state => {
    return {
        state: state.engine.engineState ? state.engine.engineState[0] : null,
        pvs: state.engine.engineState,
        name: state.engine.engineNames[state.engine.selection],
        started: state.engine.started,
        updating: state.engine.updating,
        whiteToMove: state.editor.game.getCurrentPosition().isWhiteToMove(),
        options: state.engine.options
    };
};

export default connect(mapStateToProps, { startEngine, stopEngine, closeEngine, setOption })(EngineDisplay);