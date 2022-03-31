import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import { 
    closeModal,
    loadList,
    loadEngine,
    setSelection,
    setOption,
    closeEngine  
} from '../../actions/engineActions';

class EngineDialog extends React.Component {

    componentDidMount() {
        this.props.loadList();
    }

    renderOption = opt => {
        const val = this.props.values.filter(v => v.name === opt.name)[0].value;
        const handler = e => { this.props.setOption(opt.name, e.target.value)}
        if (opt.type === "STRING") {
            return (
                <Form.Group key={opt.name}>
                    <Form.Label>{opt.name}</Form.Label>
                    <Form.Control type="text" value={val} onChange={handler} />
                </Form.Group>
            );
        }
        else if (opt.type === "CHECK") {
            return (
                <Form.Group key={opt.name}>
                    <Form.Check type="checkbox" label={opt.name} checked={val} onChange={handler} />
                </Form.Group>
            )
        }
        else if (opt.type === "SPIN") {
            return (
                <Form.Group key={opt.name}>
                    <Form.Label>{opt.name}</Form.Label>
                    <Form.Control type="number" min={opt.min} max={opt.max} value={val} onChange={handler} />
                </Form.Group>
            )
        }
    }

    render() {     
        const loadHandler = this.props.engineKey ? 
            () => this.props.closeEngine() :
            () => this.props.loadEngine(this.props.names[this.props.selection]);
        return (
            <Modal show={this.props.show} onHide={() => this.props.closeModal()}>
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
                                    value={this.props.selection}
                                    onChange={e => this.props.setSelection(e.target.value)}
                                    disabled={this.props.engineKey}
                                >                                    
                                    {this.props.names.map((n, i) => {
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
                                    style={{float: 'bottom'}}                                    
                                >
                                    {this.props.engineKey ? 'Unload' : 'Load'}
                                </Button>                                                                
                            </Col>
                        </Row>
                        </Form.Group>
                        <hr />
                        <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
                            {this.props.options?.map(this.renderOption)}
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer>                                        
                    <Button variant="primary" onClick={() => this.props.closeModal()}>Done</Button>                    
                </Modal.Footer>
            </Modal>
        );
    }
}

const mapStateToProps = state => {    
    return {
        show: state.engine.showModal,
        names: state.engine.engineNames,
        options: state.engine.options,
        selection: state.engine.selection,
        values: state.engine.optionValues,
        engineKey: state.engine.key
    };
};

export default connect(mapStateToProps, {
    closeModal, loadList, loadEngine, setSelection, setOption, closeEngine
})(EngineDialog);

