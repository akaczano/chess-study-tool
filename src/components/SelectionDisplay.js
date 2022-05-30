import { Modal, Table, ButtonGroup, Button, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { hideSelection, clearSelection, downloadGames } from '../state/directorySlice';


function SelectionDisplay() {
    const dispatch = useDispatch()
    const {
        selection,
        showSelection,
        downloading
    } = useSelector(state => state.directory)

    const getContent = () => {
        if (selection.length < 1) {
            return <p>No games selected.</p>
        }
        else {
            return (
                <Table striped bordered hover size="sm" style={{ fontSize: '14px', height: '10vh' }}>
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
                        {selection.map((f, i) => {
                            return (
                                <tr key={f.id}>
                                    <td>{i + 1}</td>
                                    <td>{f.white_name}</td>
                                    <td>{f.black_name}</td>
                                    <td>{f.event}</td>
                                    <td>{f.date}</td>
                                    <td>{f.round}</td>
                                    <td>{f.result}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            );
        }
    }

    return (
        <Modal size="lg" show={showSelection} onHide={() => dispatch(hideSelection())}>
            <Modal.Header closeButton>
                <h4>Selected games</h4>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '60vh', overflowY: 'scroll' }}>
                {getContent()}
            </Modal.Body>
            <Modal.Footer>
                <ButtonGroup>
                    <Button variant="primary">Study</Button>
                    <Button
                        variant="primary"
                        onClick={() => dispatch(downloadGames(selection.map(f => f.id)))}
                        disabled={downloading}
                    >
                        {downloading ? <Spinner animation="border" /> : 'Download'}
                    </Button>
                    <Button variant="primary" onClick={() => dispatch(clearSelection())}>
                        Clear
                    </Button>
                    <Button variant="primary" onClick={() => dispatch(hideSelection())}>
                        Close
                    </Button>
                </ButtonGroup>
            </Modal.Footer>
        </Modal>
    );

}


export default SelectionDisplay