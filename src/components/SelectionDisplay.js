import { useState } from 'react'
import { Modal, Table, ButtonGroup, Button, Spinner, Form, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { hideSelection, clearSelection, downloadGames } from '../state/directorySlice';
import { setCreateStatus, createTemplate, setDescriptionModal } from '../state/templateSlice'
import { go, STUDY } from '../state/navSlice'

const defaultDepth = -1
const defaultStopAfterEval = true

function SelectionDisplay() {
    const dispatch = useDispatch()
    const {
        selection,
        showSelection,
        downloading
    } = useSelector(state => state.directory)

    const {
        createStatus, descriptionModal
    } = useSelector(state => state.template)

    const [settings, setSettings] = useState({})    
    const [desc, setDesc] = useState('')

    const getHeaders = type => {
        if (type == 1) {
            return (
                <tr>
                    <th>#</th>
                    <th>White</th>
                    <th>Black</th>
                    <th>Event</th>
                    <th>Date</th>
                    <th>Round</th>
                    <th>Result</th>
                </tr>
            )
        }
        else {
            return (
                <tr>
                    <th>#</th>
                    <th>Description</th>
                    {type == 2 ? <th>Side</th> : null}
                    <th>Max depth</th>
                    <th>Stop after eval</th>
                </tr>
            )
        }
    }

    const getRow = (f, i) => {
        if (f.type == 1) {
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
            )
        }
        else {
            const md = settings[f.id] ? settings[f.id][0] : defaultDepth
            const sae = settings[f.id] ? settings[f.id][1] : defaultStopAfterEval
            return (
                <tr key={f.id}>
                    <td>{i + 1}</td>
                    <td>{f.description}</td>
                    {f.type == 2 ? <td>{f.side ? 'Black' : 'White'}</td> : null}
                    <td>
                        <Form.Control size="sm" type="number" value={md} style={{ maxWidth: '80px' }} onChange={e =>
                            setSettings({ ...settings, [f.id]: [parseInt(e.target.value), sae] })
                        } />
                    </td>
                    <td>
                        <Form.Check checked={sae} onChange={e => setSettings({ ...settings, [f.id]: [md, e.target.checked] })} />
                    </td>
                </tr>
            )
        }
    }


    const getContent = () => {
        if (selection.length < 1) {
            return <p>No games selected.</p>
        }
        else {
            const titles = ['Games', 'Openings', 'Puzzles']
            return [1, 2, 3].map(type => {
                const list = selection.filter(f => f.type == type)
                if (list.length < 1) return null
                return (
                    <div>
                        <p>{titles[type - 1]}</p>
                        <Table striped bordered hover size="sm" style={{ fontSize: '14px', height: '10vh' }}>
                            <thead>
                                {getHeaders(type)}
                            </thead>
                            <tbody>
                                {list.map(getRow)}
                            </tbody>
                        </Table>
                    </div>
                )
            })

        }
    }

    const getAlert = () => {
        if (createStatus == 2) {
            return (
                <Alert variant="success" onClose={() => dispatch(setCreateStatus(0))} dismissible>
                    Template created successfully. <Alert.Link onClick={() => dispatch(go({ location: STUDY }))}>Go to sessions</Alert.Link>
                </Alert>
            )
        }
        else if (createStatus == 3) {
            return (
                <Alert variant="danger" onClose={() => dispatch(setCreateStatus(9))} dismissible>
                    There was a problem creating the template
                </Alert>
            )
        }
        return null
    }

    const makeTemplate = () => {
        const files = selection
            .filter(f => f.type > 1)
            .map(f => {
                return {
                    id: f.id,
                    depth: settings[f.id] ? settings[f.id][0] : defaultDepth,
                    stopOnEval: settings[f.id] ? settings[f.id][1] : defaultStopAfterEval
                }
            })
        dispatch(createTemplate({description: desc, files}))
    }

    const getModal = () => {
        return (
            <Modal size="sm" show={descriptionModal} onHide={() => dispatch(setDescriptionModal(false))}>
                <Modal.Header closeButton>
                    Create Template
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control type="text" value={desc} onChange={({ target }) => setDesc(target.value)} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={makeTemplate} disabled={desc.length < 1 || createStatus == 1}>
                        {createStatus == 1 ? <Spinner animation="border" size="sm" /> : 'Create'}
                    </Button>
                    <Button variant="primary" onClick={() => dispatch(setDescriptionModal(false))}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        )
    }

    return (
        <Modal size="lg" show={showSelection} onHide={() => dispatch(hideSelection())}>
            <Modal.Header closeButton>
                <h4>Selected games</h4>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '60vh', overflowY: 'scroll' }}>
                {getModal()}
                {getAlert()}
                {getContent()}
            </Modal.Body>
            <Modal.Footer>
                <ButtonGroup>
                    <Button variant="primary" onClick={() => {
                        dispatch(setCreateStatus(0));
                        dispatch(setDescriptionModal(true))
                        setDesc('')
                    }} disabled={selection?.filter(f => f.type > 1).length < 1}>
                        Create Template
                    </Button>
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