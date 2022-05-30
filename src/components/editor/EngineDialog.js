import { useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import {
    closeModal,
    loadList,
    loadEngine,
    setSelection,
    setOption,
    closeEngine
} from '../../state/engineSlice';

function EngineDialog() {
    const dispatch = useDispatch()

    const {
        optionValues,
        loaded,
        loading,
        engineNames,
        showModal,
        selection,
        options
    } = useSelector(state => state.engine)
    
    useEffect(() => {
        dispatch(loadList())
    }, [dispatch])
    

    const renderOption = opt => {        
        const val = optionValues.filter(v => v.name === opt.name)[0].value;
        const handler = e => { dispatch(setOption({name: opt.name, value: e.target.value})) }        
        if (opt.type === "string") {
            return (
                <Form.Group key={opt.name}>
                    <Form.Label>{opt.name}</Form.Label>
                    <Form.Control type="text" value={val} onChange={handler} />
                </Form.Group>
            );
        }
        else if (opt.type === "check") {
            return (
                <Form.Group key={opt.name}>
                    <Form.Check type="checkbox" label={opt.name} checked={val} onChange={handler} />
                </Form.Group>
            )
        }
        else if (opt.type === "spin") {
            return (
                <Form.Group key={opt.name}>
                    <Form.Label>{opt.name}</Form.Label>
                    <Form.Control type="number" min={opt.min} max={opt.max} value={val} onChange={handler} />
                </Form.Group>
            )
        }
    }


    const loadHandler = loaded ?
        () => dispatch(closeEngine()) :
        () => dispatch(loadEngine(engineNames[selection]))
    
    return (
        <Modal show={showModal} onHide={() => dispatch(closeModal())}>
            <Modal.Header closeButton>
                Start analysis
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Engine</Form.Label>
                        <Row>
                            <Col md={9}>
                                <select
                                    className="form-control"
                                    value={selection}
                                    onChange={e => dispatch(setSelection(e.target.value))}
                                    disabled={loaded}
                                >
                                    {engineNames.map((n, i) => {
                                        return (
                                            <option key={n} value={i}>{n}</option>
                                        )
                                    })}
                                </select>
                            </Col>
                            <Col md={3}>
                                <Button
                                    variant="primary"
                                    onClick={loadHandler}
                                    style={{ float: 'bottom' }}
                                >
                                    {loading ? <Spinner animation="border" /> : (loaded ? 'Unload' : 'Load')}
                                </Button>
                            </Col>
                        </Row>
                    </Form.Group>
                    <hr />
                    <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                        {options?.map(renderOption)}
                    </div>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={() => dispatch(closeModal())}>Done</Button>
            </Modal.Footer>
        </Modal>
    );

}

export default EngineDialog

