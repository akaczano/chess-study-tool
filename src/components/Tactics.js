import React from 'react';
import { Container, Row, Col, ListGroup, Card, Button, Modal, Form, ButtonToolbar } from 'react-bootstrap';
import { connect } from 'react-redux';

import {
    loadGroups,
    loadSessions,
    showGroupModal,
    addGroup,
    closeGroupModal,
    setGroupData,
    selectGroup
}
    from '../actions/tacticsActions';

import { STATUS_IN_PROGRESS, STATUS_NOT_STARTED } from '../util/appUtil';


const displaySession = session => {
    let buttonText = null;
    if (session.status === STATUS_NOT_STARTED) {
        buttonText = 'Start';
    }
    else if (session.status === STATUS_IN_PROGRESS) {
        buttonText = 'Resume';
    }
    return (
        <ListGroup.Item key={session.id}>
            {session.description} ({session.completed}/{session.positions})
            <Button variant="secondary" style={{ float: 'right' }}>{buttonText}</Button>
        </ListGroup.Item>
    );
}

class Tactics extends React.Component {
    componentDidMount() {
        //this.props.loadGroups();
        //this.props.loadSessions();
    }


    displayGroups() {
        if (!this.props.groups || (this.props.selectedGroup && !this.props.puzzles)) {
            return <div>Loading...</div>
        }

        const titleText = this.props.selectedGroup ? this.props.selectedGroup.description : 'Puzzle Groups';

        const spinner = <div>Loading...</div>;

        let content = null;

        if (this.props.selectedGroup) {
            content = this.props.puzzles ? this.props.puzzles.map(puzzle => (
                <ListGroup.Item key={puzzle.id}>
                    {puzzle.description}
                </ListGroup.Item>
            )) : spinner;
        }
        else {
            content = this.props.groups ? this.props.groups.map(group => (
                <ListGroup.Item key={group.id}>
                    <Button variant="link" onClick={() => this.props.selectGroup(group.id)}>
                        {group.description}
                    </Button>
                </ListGroup.Item>
            )) : spinner;
        }

        let backButton = null;

        if (this.props.selectedGroup) {
            backButton = (<Button variant="primary" style={{marginLeft: '10px'}}
                onClick={() => this.props.selectGroup(-1)}>Back</Button>);
        }

        let newButton = null;

        if (!this.props.selectedGroup) {
            newButton = (<Button
                variant="primary"
                
                onClick={this.props.showGroupModal}
            >
                + New group
            </Button>);
        }
        else {            
            newButton = (<Button variant="primary"
                onClick={() => this.props.history.push("/tactics/puzzle/new")}>+ New Puzzle</Button>)
        }

        return (
            <div>
                <h4 style={{ marginBottom: '20px' }}>{titleText}</h4>
                <ListGroup>
                    {content}
                </ListGroup>
                <ButtonToolbar style={{ marginTop: '20px' }}>
                    {newButton}
                    {backButton}
                </ButtonToolbar>

            </div>
        );

    }

    displaySessions() {
        if (this.props.sessions) {
            return (
                <Card.Body>
                    <ListGroup>
                        {this.props.sessions.map(displaySession)}
                    </ListGroup>
                    <Button variant="primary" style={{ marginTop: '10px' }}>
                        + New Session
                    </Button>
                </Card.Body>
            );
        }
        else {
            return (
                <Card.Body>Loading...</Card.Body>
            );
        }
    }

    groupModal() {
        return (
            <Modal
                show={this.props.groupModal != null}
                onHide={() => this.props.closeGroupModal}
            >
                <Modal.Header>
                    <Modal.Title>New Puzzle Group</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                type="text"
                                value={this.props.groupModal?.description}
                                onChange={e => this.props.setGroupData(e.target.value)}
                                isInvalid={this.props.groupModal?.error}
                            />
                            <Form.Control.Feedback type="invalid">
                                Description is required
                            </Form.Control.Feedback>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={this.props.closeGroupModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={this.props.addGroup}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    render() {
        let id = this.props.match.params.id;

        return (
            <Container>
                {this.groupModal()}
                <Row style={{ marginTop: '35px' }}>
                    <Col md={8}>
                        {this.displayGroups()}
                    </Col>
                    <Col md={4}>
                        <Card>
                            <Card.Header>Statistics</Card.Header>
                            <Card.Body>
                                Groups: 3 <br />
                                Total Puzzles 204 <br />
                                <br />
                                Completed Sessions: 35 <br />
                                Total Study Time: 12 hours <br />
                                Total Puzzles Attempted: 4321 <br />
                                Accuracy: 84%
                            </Card.Body>
                        </Card>
                        <Card>
                            <Card.Header>Sessions</Card.Header>
                            {this.displaySessions()}
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    };
};

const mapStateToProps = state => {
    return {
        groups: state.tactics.groups,
        sessions: state.tactics.sessions,
        selectedGroup: state.tactics.selectedGroup,
        puzzles: state.tactics.puzzles,
        groupModal: state.tactics.groupModal
    };
}

export default connect(mapStateToProps,
    { loadGroups, loadSessions, showGroupModal, addGroup, closeGroupModal, setGroupData, selectGroup })(Tactics);