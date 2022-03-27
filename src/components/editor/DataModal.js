import React from 'react';
import { connect } from 'react-redux';
import { Modal, Form, Row, Col, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

import { setModal, updateData } from '../../actions/editorActions';

class DataModal extends React.Component {

    render() {
        const gd = this.props.data;
        return (
            <Modal show={this.props.showModal} >
                <Modal.Header>
                    <h5>Edit Game Data</h5>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Col md={9}>
                                <Form.Group>
                                    <Form.Label>White Player</Form.Label>
                                    <Form.Control type="text" value={gd.white_name}
                                        onChange={e => {
                                            this.props.updateData({
                                                ...this.props.data,
                                                white_name: e.target.value
                                            })
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>White Rating</Form.Label>
                                    <Form.Control type="number" value={gd.white_rating}
                                        onChange={e => {
                                            this.props.updateData({
                                                ...this.props.data,
                                                white_rating: e.target.value
                                            })
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
                                            this.props.updateData({
                                                ...this.props.data,
                                                black_name: e.target.value
                                            })
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
                                        onChange={e => this.props.updateData({
                                            ...this.props.data,
                                            black_rating: e.target.value
                                        })}
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
                                        onChange={e => this.props.updateData({
                                            ...this.props.data,
                                            event: e.target.value
                                        })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={5}>
                                <Form.Group>
                                    <Form.Label>
                                        Site
                                    </Form.Label>
                                    <Form.Control type="text" value={gd.site}
                                        onChange={e => this.props.updateData({
                                            ...this.props.data,
                                            site: e.target.value
                                        })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group>
                            <Form.Label>
                                Date
                            </Form.Label>
                            <DatePicker selected={gd.date}
                                onChange={d => this.props.updateData({
                                    ...this.props.data,
                                    date: d
                                })}
                            />

                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Round</Form.Label>
                                    <Form.Control type="text" value={gd.round}
                                        onChange={e => this.props.updateData({
                                            ...this.props.data,
                                            round: e.target.value
                                        })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Result</Form.Label>
                                    <select className="form-control" value={gd.result}
                                        onChange={e => this.props.updateData({
                                            ...this.props.data,
                                            result: e.target.value
                                        })}
                                    >
                                        <option>*</option>
                                        <option value="1-0">1-0</option>
                                        <option value="0-1">0-1</option>
                                        <option value="1/2-1/2">1/2-1/2</option>
                                    </select>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => this.props.setModal(false)}>
                        Done
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

}

const mapStateToProps = state => {
    return {
        data: state.editor.gameData,
        showModal: state.editor.dataModal
    };
};

export default connect(mapStateToProps, { setModal, updateData })(DataModal);