import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Form, Button, Dropdown, Row, Col } from 'react-bootstrap';
import DatePicker from 'react-datepicker';

import { showSelection, setFilter, clearFilter } from '../state/directorySlice';

function DataButtons() {
    const [showFilter, setShowFilter] = useState(false)

    const dispatch = useDispatch()
    const { selection, filter, files } = useSelector(state => state.directory)

    const getModal = () => {

        return (
            <Modal style={{ width: '80vw' }} show={showFilter} onHide={() => setShowFilter(false)}>
                <Modal.Header closeButton>
                    Filter games
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col md={8}>
                                <Form.Group>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={filter.name.text}
                                        onChange={e => dispatch(setFilter({...filter, name: {...filter.name, text: e.target.value}}))}/>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label>Match</Form.Label>
                                    <select
                                        className="form-control" 
                                        value={filter.name.match}
                                        onChange={e => dispatch(setFilter({...filter, name: {...filter.name, match: parseInt(e.target.value)}}))}
                                    >
                                        <option value={0}>Either</option>
                                        <option value={1}>White</option>
                                        <option value={2}>Black</option>
                                    </select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Group>
                                    <Form.Label>Start Date</Form.Label>
                                    <DatePicker
                                        style={{ maxWidth: '50%' }}
                                        selected={filter.startDate}
                                        onChange={d => dispatch(setFilter({...filter, startDate: d}))} />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group>
                                    <Form.Label>End Date</Form.Label>
                                    <DatePicker
                                        selected={filter.endDate}
                                        onChange={d => dispatch(setFilter({...filter, endDate: d}))} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={9}>
                                <Form.Group>
                                    <Form.Label>Event</Form.Label>
                                    <select
                                        className="form-control"
                                        onChange={e => dispatch(setFilter({...filter, event: e.target.value}))}
                                        value={filter.event}
                                    >
                                        {files ? (['Any', ...(files
                                            ?.filter(e => e.type === 1)
                                            .map(e => e.event)
                                            .reduce((s, n) => s.includes(n) ? s : [...s, n], []))]
                                            .map(e => {                                                
                                                return (
                                                <option key={e} value={e}>{e}</option>
                                                )                                            
                                            })) : null
                                        }
                                    </select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Result</Form.Label>
                                    <select
                                        className="form-control"
                                        value={filter.result}
                                        onChange={e => dispatch(setFilter({...filter, result: e.target.value}))}
                                    >
                                        <option value={''}>Any</option>
                                        <option value={'1-0'}>1-0</option>
                                        <option value={'0-1'}>0-1</option>
                                        <option value={'1/2-1/2'}>1/2-1/2</option>
                                        <option value={'*'}>*</option>
                                    </select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => dispatch(clearFilter())}>Clear</Button>
                    <Button variant="primary" onClick={() => setShowFilter(false)}>Done</Button>
                </Modal.Footer>
            </Modal>
        );
    }


    return (
        <>
            {getModal()}
            <span style={{ float: 'right', fontSize: '15px' }}>
                <Button variant="link" style={{ maxHeight: '15px', marginBottom: '8px' }} onClick={() => dispatch(showSelection())}>
                    Selection ({selection.length} items)
                </Button>

            </span>
            <Button
                variant="link"
                style={{ maxHeight: '15px', float: 'right' }}
                onClick={() => setShowFilter(true)}
            >
                Filter
            </Button>
        </>
    )

}


export default DataButtons
