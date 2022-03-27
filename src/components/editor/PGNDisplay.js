import React from 'react';
import { Button, ButtonGroup, Form, Row } from 'react-bootstrap';
import { GiEmptyChessboard } from 'react-icons/gi';
import { FaChessBishop } from 'react-icons/fa';
import { AiOutlineArrowUp, AiFillDelete, AiFillEdit } from 'react-icons/ai';
import { connect } from 'react-redux';

import {
    setModal,
    deleteMove,
    promoteMove,
    setAnnotation,
    setPositionModal,
    setNAGs
} from '../../actions/editorActions';

import { nags, getSymbol } from '../../chess/nag';

import NotationDisplay from './NotationDisplay';

class NagSelector extends React.Component {
    state = {selectedTab: 0}

    getTabClass(tab) {
        if (tab == this.state.selectedTab) return 'tab-button active';
        else return 'tab-button'
    }

    getNAGs() {
        return Object.entries(nags).filter(item => 
            (item[1].moveAnnotation && this.state.selectedTab === 0) || 
            (!item[1].moveAnnotation && this.state.selectedTab === 1))
    }

    handleClick = nag => {
        if (this.state.selectedTab == 0) {
            this.props.handler([nag, this.props.nags[1]]);
        }
        else {
            this.props.handler([this.props.nags[1], nag]); 
        }
    }

    render() {        
        return (
            <div style={{ width: '100%', backgroundColor: '#d7eff7', height: '75%', }}>
                <Row style={{ backgroundColor: '#f1f1f1', margin: '0px', height: '7%'}}>
                    <button
                        className={this.getTabClass(0)}
                        onClick={() => this.setState({selectedTab: 0})}>Move</button>
                    <button
                        className={this.getTabClass(1)}
                        onClick={() => this.setState({selectedTab: 1})}>Position</button>
                </Row>
                <div style={{ padding: '3px', height: '93%', overFlowY: 'auto', overflowX: 'hidden' }}>

                    {this.getNAGs().map(item => {
                        const disabled = this.props.nags[0] == item[0] || this.props.nags[1] == item[0]
                        return (
                            <p>
                                <Button
                                    variant="light"
                                    style={{ marginRight: '5px' }}
                                    disabled={disabled}
                                    onClick={() => this.handleClick(item[0])}
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
}

class PGNDisplay extends React.Component {
    state = { nagDisplay: false }

    getContent() {
        if (this.state.nagDisplay) {
            return <NagSelector nags={this.props.game.getNAGs()} handler={ns => this.props.setNAGs(ns)}/>
        }
        else {
            return (
                <div style={{ width: '100%', backgroundColor: '#d7eff7', padding: '3px', height: '75%', overflowY: 'auto', overflowX: 'hidden' }}>
                    <NotationDisplay />
                </div>
            )
        }
    }

    render() {
        return (
            <div style={{ height: '73vh', border: '3px solid #535657', borderRadius: '6px' }}>

                {this.getContent()}

                <ButtonGroup style={{ width: '100%', padding: '5px' }}>
                    <Form.Control
                        type="text"
                        style={{ maxWidth: '80%' }}
                        value={this.props.game.getAnnotation()}
                        onChange={e => this.props.setAnnotation(e.target.value)}
                    />
                    <Button
                        variant="secondary"
                        onClick={() => this.setState({ nagDisplay: !this.state.nagDisplay })}
                    >
                        {this.state.nagDisplay ? 'x' : '?!'}
                    </Button>
                </ButtonGroup>
                <div style={{ width: '100%', padding: '5px' }}>
                    <div style={{ width: 'fit-content', margin: 'auto' }}>
                        <ButtonGroup >
                            <Button
                                variant="secondary"
                                disabled={!this.props.game.canPromote()}
                                onClick={this.props.promoteMove}
                            >
                                <FaChessBishop /><AiOutlineArrowUp />
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={this.props.deleteMove}
                                disabled={!this.props.game.canDelete()}
                            >
                                <FaChessBishop /><AiFillDelete />
                            </Button>
                            <Button
                                variant="secondary"
                                disabled={!this.props.game.canChangePosition()}
                                onClick={() => this.props.setPositionModal(true)}
                            >
                                <GiEmptyChessboard />
                                <AiFillEdit />
                            </Button>
                            <Button variant="secondary" onClick={() => this.props.setModal(true)}>Edit game data</Button>
                        </ButtonGroup>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        game: state.editor.game
    };
};

export default connect(mapStateToProps, {
    setModal, deleteMove, promoteMove, setAnnotation, setPositionModal, setNAGs
})(PGNDisplay);