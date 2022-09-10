import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Modal, Form, Row, Col, Button } from 'react-bootstrap'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

import { setModal, updateData } from '../../state/editorSlice'

function DataModal() {
    const dispatch = useDispatch()
    const gd = useSelector(state => state.editor.gameData)
    const showModal = useSelector(state => state.editor.dataModal)

    const getGameDisplay = type => {
        if (type == 2) {
            return (
                <>
                    <Row>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control type="text" value={gd.description} onChange={e => dispatch(updateData({
                                ...gd, description: e.target.value
                            }))} />
                        </Form.Group>
                    </Row>
                    <Row>
                        <Form.Group>
                            <Form.Label>Side</Form.Label>
                            <select value={gd.side}className="form-control" onChange={e => {
                                dispatch(updateData({ ...gd, side: e.target.value }))
                            }}>
                                <option value={false}>White</option>
                                <option value={true}>Black</option>
                            </select>
                        </Form.Group>
                    </Row>
                </>
            )
        }
        else if (type == 3) {
            return (
                <Row>
                    <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control value={gd.description} type="text" onChange={e => {
                            dispatch(updateData({ ...gd, description: e.target.value }))
                        }}/>
                    </Form.Group>
                </Row>
            )
        }
        return (
            <>
                <Row>
                    <Col md={9}>
                        <Form.Group>
                            <Form.Label>White Player</Form.Label>
                            <Form.Control type="text" value={gd.white_name}
                                onChange={e => {
                                    dispatch(updateData({
                                        ...gd,
                                        white_name: e.target.value
                                    }))
                                }}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>White Rating</Form.Label>
                            <Form.Control type="number" value={gd.white_rating}
                                onChange={e => {
                                    dispatch(updateData({
                                        ...gd,
                                        white_rating: e.target.value
                                    }))
                                }}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md={9}>
                        <Form.Group>
                            <Form.Label>Black Player</Form.Label>
                            <Form.Control type="text" value={gd.black_name}
                                onChange={e => {
                                    dispatch(updateData({
                                        ...gd,
                                        black_name: e.target.value
                                    }))
                                }}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>
                                Black Rating
                            </Form.Label>
                            <Form.Control type="number" value={gd.black_rating}
                                onChange={e => dispatch(updateData({
                                    ...gd,
                                    black_rating: e.target.value
                                }))}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md={7}>
                        <Form.Group>
                            <Form.Label>
                                Event
                            </Form.Label>
                            <Form.Control type="text" value={gd.event}
                                onChange={e => dispatch(updateData({
                                    ...gd,
                                    event: e.target.value
                                }))}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={5}>
                        <Form.Group>
                            <Form.Label>
                                Site
                            </Form.Label>
                            <Form.Control type="text" value={gd.site}
                                onChange={e => dispatch(updateData({
                                    ...gd,
                                    site: e.target.value
                                }))}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Form.Group>
                    <Form.Label>
                        Date
                    </Form.Label>
                    <DatePicker selected={gd.date}
                        onChange={d => dispatch(updateData({
                            ...gd,
                            date: d
                        }))}
                    />

                </Form.Group>
                <Row>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Round</Form.Label>
                            <Form.Control type="text" value={gd.round}
                                onChange={e => dispatch(updateData({
                                    ...gd,
                                    round: e.target.value
                                }))}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Result</Form.Label>
                            <select className="form-control" value={gd.result}
                                onChange={e => dispatch(updateData({
                                    ...gd,
                                    result: e.target.value
                                }))}
                            >
                                <option>*</option>
                                <option value="1-0">1-0</option>
                                <option value="0-1">0-1</option>
                                <option value="1/2-1/2">1/2-1/2</option>
                            </select>
                        </Form.Group>
                    </Col>
                </Row>
            </>
        );
    }
    return (
        <Modal show={showModal} >
            <Modal.Header>
                <h5>Edit Game Data</h5>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Row>
                        <Form.Group as={Row} style={{ marginBottom: '15px' }}>
                            <Form.Label column sm={4}>File Type</Form.Label>
                            <Col sm={8}>
                                <select className="form-control" value={gd.type} onChange={e => dispatch(updateData({
                                    ...gd, type: parseInt(e.target.value)
                                }))}>
                                    <option value={1}>Game</option>
                                    <option value={2}>Opening</option>
                                    <option value={3}>Puzzle</option>
                                </select>
                            </Col>
                        </Form.Group>
                        <hr />
                    </Row>
                    {getGameDisplay(gd.type)}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={() => dispatch(setModal(false))}>
                    Done
                </Button>
            </Modal.Footer>
        </Modal>
    );


}


export default DataModal