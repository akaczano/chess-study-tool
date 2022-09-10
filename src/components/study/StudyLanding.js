import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Row, ListGroup, Button, Container, Spinner, Modal, Form, ProgressBar, Col, Alert } from 'react-bootstrap'
import { BsTrashFill, BsFileBarGraph } from 'react-icons/bs'
import { AiFillEdit } from 'react-icons/ai'

import { listTemplates, deleteTemplate, clearError } from '../../state/templateSlice'
import { startCreate, setDescription, closeModal, createSession, listSessions, deleteSession, resume } from '../../state/sessionSlice'

function StudyLanding() {

    const dispatch = useDispatch()

    const [tabIndex, setTabIndex] = useState(0)
    const tabs = ['Active Sessions', 'Finished Sessions', 'Templates']

    const templatesLoading = useSelector(state => state.template.listLoading)
    const templates = useSelector(state => state.template.list)
    const { deleting, deleteError } = useSelector(state => state.template)
    const { creating, createModal, description, activeSessions, inactiveSessions, loading } = useSelector(state => state.session)
    const sessionsDeleting = useSelector(state => state.session.deleting)

    useEffect(() => {
        if (tabIndex == 2) {
            dispatch(listTemplates())
        }
        else {
            dispatch(listSessions())
        }
    }, [dispatch, tabIndex])

    const getContent = () => {
        if (tabIndex < 2) {
            if (loading) {
                return (
                    <div>
                        <p>Loading sessions...</p>
                        <Spinner animation="border" />

                    </div>
                )
            }
            const sessions = tabIndex < 1 ? activeSessions : inactiveSessions
            return (
                <ListGroup>
                    {sessions.map(s => {
                        const label = `${Math.floor(((s.position - 1) / s.total_variations) * 100)}% (${s.position - 1}/${s.total_variations})`
                        const now = s.position  - 1;
                                                
                        return (
                            <ListGroup.Item key={`session_${s.id}`}>
                                <strong>{s.description}</strong>
                                <p>Started {s.start_date}</p>
                                <Row style={{ width: '100%' }}>
                                    <Col md={5}>
                                        <ProgressBar style={{height: '100%'}} max={s.total_variations} now={now} label={label} variant="success" />
                                    </Col>
                                    <Col md={5}>
                                        <Button variant="info" onClick={() => dispatch(resume(s.id))}>
                                            Resume
                                        </Button>
                                    </Col>
                                    <Col md={2}>
                                        <Button variant="danger" style={{float: 'right'}} onClick={() => dispatch(deleteSession(s.id))}>
                                            {sessionsDeleting.includes(s.id) ? <Spinner animation="border" /> : 'Cancel'}
                                        </Button>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        )
                    })}
                </ListGroup>
            )
        }
        
        else if (tabIndex == 2) {
            return (
                <ListGroup>
                    {templates?.map(t => {
                        return (
                            <ListGroup.Item>
                                <div>
                                    <strong>{t.description}</strong>
                                    <div style={{ float: 'right' }}>
                                        <Button variant="secondary" style={{ marginRight: '12px' }}>
                                            <AiFillEdit />
                                        </Button>
                                        <Button variant="secondary" onClick={() => dispatch(deleteTemplate(t.id))}>
                                            {deleting.includes(t.id) ? <Spinner size="sm" animation="border" /> : <BsTrashFill />}
                                        </Button>
                                    </div>
                                </div>

                                {t.session_count} session{t.session_count > 1 ? 's' : ''}
                                <p>73% Accuracy</p>
                                <Button variant="info" style={{ marginRight: '12px' }} onClick={() => dispatch(startCreate(t))}>
                                    + Session
                                </Button>
                                <Button variant="info"><BsFileBarGraph /></Button>
                            </ListGroup.Item>
                        )
                    })}
                </ListGroup>
            )
        }
    }

    const errorBanner = () => {        
        if (tabIndex == 2 && deleteError) {
            const message = 'Failed to delete template. Make sure there are no existing sessions with this template';
            return <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>{message}</Alert>
        }        
    }

    return (
        <div>
            <Modal show={createModal != -1} onClose={() => dispatch(closeModal())}>
                <Modal.Header closeButton>
                    Create Session
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Description</Form.Label>
                            <Form.Control type="text" value={description} onChange={e => dispatch(setDescription(e.target.value))} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => dispatch(createSession())} disabled={creating}>
                        {creating ? <Spinner animation="border" /> : 'Create'}
                    </Button>
                    <Button variant="primary" onClick={() => dispatch(closeModal())}>Cancel</Button>
                </Modal.Footer>
            </Modal>            
            <Row style={{ backgroundImage: 'linear-gradient(to right, #162b29, #536664)', margin: '0px', height: '5vh', marginBottom: '5px', marginTop: '-2.3vh' }}>
                {tabs.map((t, i) => {
                    return (
                        <button key={`tab_${i}`} className={i == tabIndex ? 'study-tab active' : 'study-tab inactive'} onClick={
                            () => setTabIndex(i)
                        }>
                            {t}
                        </button>
                    )
                })}
            </Row>
            <Container>
            {errorBanner()}
                <Row>
                    {getContent()}
                </Row>
            </Container>

        </div>
    )
}

export default StudyLanding