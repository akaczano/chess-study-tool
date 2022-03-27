import React from 'react';
import { Container, Row, Col, Modal, Spinner, Button, Alert } from 'react-bootstrap';
import { connect } from 'react-redux';


import NavButtons from './NavButtons';
import ChessBoard from './ChessBoard';
import PGN from '../../chess/PGN';
import PGNDisplay from './PGNDisplay';
import DataModal from './DataModal';
import PositionModal from './PositionModal';
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
} from '../../actions/editorActions';

class PGNEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = { reversed: false };
    }

    componentDidMount() {
        /*document.addEventListener("keydown", e => {
            if (e.key == 'ArrowLeft') {
                this.props.goBackward();
            }
            else if (e.key == 'ArrowRight') {
                this.props.goForward();
            }
        });*/
        this.props.loadGame(this.props.match.params.id);        
    }

    getParent() {
        if (this.props.data.parent_id) return this.props.data.parent_id;
        const search = this.props.location.search;
        const parent = new URLSearchParams(search).get('parent');        
        return parent == 'null' ? null : parseInt(parent);
    }

    getAlert() {
        if (this.props.error) {
            return (
                <Alert variant="danger" onClose={this.props.clearError} dismissible>
                    {this.props.error}
                </Alert>
            );
        }
        return null;
    }

    flipBoard() {
        this.setState({ reversed: !this.state.reversed });
        console.log('test: ' + this.state.reversed);
    }

    goToStart = () => {
        this.props.goToStart();
        document.getElementById('move' + this.props.game.head.mainline?.key)?.scrollIntoViewIfNeeded();
    }

    goToEnd = () => {
        this.props.goToEnd();
        document.getElementById('move' + this.props.game.getTail().key)?.scrollIntoViewIfNeeded();
    }

    goForward = () => {
        this.props.goForward();
        document.getElementById('move' + this.props.game.current.mainline?.key)?.scrollIntoViewIfNeeded();
    }

    goBackward = () => {
        this.props.goBackward();
        document.getElementById('move' + this.props.game.current.prev?.key)?.scrollIntoViewIfNeeded();
    }

    render() {
        if (!this.props.loaded) {
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
        
        return (
            <Container style={{ margin: 0 }}>

                <DataModal />
                <PositionModal />
                
                <Row style={{ height: '100%', width: '100%', margin: 0 }}>

                    <Col md={8}>
                        <div style={{ width: '100%', textAlign: 'center' }}>
                            <strong style={{fontSize: '19px'}}>
                                {this.props.white_name + ' '}
                                ({this.props.white_rating})
                                {this.props.result == '*' ? ' - ' : ` ${this.props.result} `}
                                {this.props.black_name + ' '}
                                ({this.props.black_rating})
                            </strong><br />
                            <span style={{ color: '#828281', fontSize: '14px' }}>
                                {this.props.event}, {this.props.site} ({this.props.date?.toLocaleDateString()})
                            </span>
                        </div>
                        <ChessBoard
                            position={this.props.game.getCurrentPosition()}
                            onMove={this.props.doMove}
                            style={{ width: '73vh', height: '73vh', margin: 'auto' }}
                            reversed={this.state.reversed}
                        />
                        <div style={{ width: '73vh', margin: 'auto' }}>
                            <NavButtons
                                onFlip={() => this.flipBoard()}
                                onGoForward={this.goForward}
                                onGoBack={this.goBackward}
                                onGoToStart={this.goToStart}
                                onGoToEnd={this.goToEnd}
                                backwardEnabled={this.props.game.canGoBackward()}
                                forwardEnabled={this.props.game.canGoForward()}
                            />
                        </div>

                    </Col>
                    <Col md={4} style={{ paddingTop: '2%' }}>
                        {this.getAlert()}
                        <PGNDisplay game={this.props.game} onUpdate={() => this.setState({ game: this.props.game })} />
                        <div style={{ padding: '10px' }}>
                            <div style={{ margin: 'auto', width: 'fit-content' }}>
                                <Button
                                    variant="primary"
                                    style={{ marginRight: '5px' }}
                                    onClick={ () => this.props.saveGame(this.getParent()) }
                                    disabled={!this.props.dirty}
                                >
                                    {this.props.saving ? <Spinner animation="border" /> : "Save"}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        let p = this.getParent();
                                        this.props.history.push('/database/' + (p ? p : ''));
                                    }}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        );
    }
}

const mapStateToProps = state => {
    return {
        loaded: state.editor.loaded,
        game: state.editor.game,
        white_name: state.editor.gameData.white_name,
        black_name: state.editor.gameData.black_name,
        white_rating: state.editor.gameData.white_rating,
        black_rating: state.editor.gameData.black_rating,
        event: state.editor.gameData.event,
        site: state.editor.gameData.site,
        date: state.editor.gameData.date,
        result: state.editor.gameData.result,
        data: state.editor.gameData,
        round: state.editor.gameData.round,
        dirty: state.editor.dirty,
        saving: state.editor.saving,
        error: state.editor.error
    };
}

export default connect(mapStateToProps, {
    loadGame,
    goForward,
    goBackward,
    goToStart,
    goToEnd,
    doMove,
    setModal,
    saveGame,
    clearError
})(PGNEditor);