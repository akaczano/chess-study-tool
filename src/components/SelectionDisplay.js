import { Modal, Table, ButtonGroup, Button, Spinner } from 'react-bootstrap';
import React from 'react';
import { connect } from 'react-redux'; 

import { hideSelection, clearSelection, doDownload } from '../actions/databaseActions';


class SelectionDisplay extends React.Component {

    getContent() {
        if (this.props.selection.length < 1) {
            return <p>No games selected.</p>
        }
        else {
            return (
                <Table striped bordered hover size="sm" style={{fontSize: '14px', height: '10vh'}}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>White</th>
                            <th>Black</th>
                            <th>Event</th>
                            <th>Date</th>
                            <th>Round</th>
                            <th>Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.props.selection.map((f, i) => {
                            return (
                                <tr key={f.data.id}>
                                    <td>{i + 1}</td>
                                    <td>{f.data.white_name}</td>
                                    <td>{f.data.black_name}</td>
                                    <td>{f.data.event}</td>
                                    <td>{f.data.date}</td>
                                    <td>{f.data.round}</td>
                                    <td>{f.data.result}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            );
        }
    }

    render () {
        return (
            <Modal size="lg" show={this.props.display} onHide={() => this.props.hideSelection() }>
                <Modal.Header closeButton>
                    <h4>Selected games</h4>
                </Modal.Header>
                <Modal.Body style={{maxHeight: '60vh', overflowY: 'scroll'}}>
                    {this.getContent()}                    
                </Modal.Body>
                <Modal.Footer>                                        
                    <ButtonGroup>
                        <Button variant="primary">Study</Button>
                        <Button
                            variant="primary"
                            onClick={() => this.props.doDownload(this.props.selection.map(f => f.data.id))}
                            disabled={this.props.downloading}
                        >
                            { this.props.downloading ? <Spinner animation="border" /> :'Download'}
                            </Button>
                        <Button variant="primary" onClick={() => this.props.clearSelection() }>
                            Clear
                        </Button>                        
                        <Button variant="primary" onClick={() => this.props.hideSelection() }>
                            Close
                        </Button>
                    </ButtonGroup>
                </Modal.Footer>
            </Modal>
        );
    }

}

const mapStateToProps = state => {
    return {
        selection: state.database.selection,
        display: state.database.showSelection,
        downloading: state.database.downloading
    }    
};

export default connect(mapStateToProps, { hideSelection, clearSelection, doDownload })(SelectionDisplay);