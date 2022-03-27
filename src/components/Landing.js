import React from 'react';
import { Row, Container, Col, Card, ListGroup } from 'react-bootstrap';


class Landing extends React.Component {

    tactics() {
        return (
            <Card>
                <Card.Body>
                    <Card.Title>
                        <a href="/tactics">Tactics</a>
                    </Card.Title>
                    <Card.Text>
                        <ListGroup horizontal>
                            <ListGroup.Item>
                                Total Puzzles <br />
                                <strong>345</strong>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                Average Accuracy <br />
                                <strong>85%</strong>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                Average Time <br />
                                <strong>23.4s</strong>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                Total Attempts <br />
                                <strong>2,451</strong>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card.Text>                    
                </Card.Body>
            </Card>
        );
    }

    openings() {
        return (
            <Card>
                <Card.Body>
                    <Card.Title>
                        <a href="/openings">Openings</a>
                    </Card.Title>
                    <Card.Text>
                        <ListGroup horizontal>
                            <ListGroup.Item>
                                Total Variations<br />
                                <strong>1174</strong>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                Average Accuracy <br />
                                <strong>94%</strong>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                Average Time <br />
                                <strong>13.4s</strong>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                Total Attempts <br />
                                <strong>3,255</strong>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card.Text>                    
                </Card.Body>
            </Card>
        );
    }

    database() {
        return (
            <Card>
                <Card.Body>
                    <Card.Title><a href="database">Database</a></Card.Title>
                    <Card.Text>
                        <ListGroup horizontal>
                            <ListGroup.Item>
                                Total Games <br />
                                <strong>204</strong>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card.Text>                    
                </Card.Body>
            </Card>
        );
    }

    render() {
        return (
            <Container style={{ marginTop: '20px' }}>
                <Row>
                    <Col md={8}>
                        <h3>Welcome back!</h3>
                        {this.tactics()}
                        {this.openings()}
                        {this.database()}
                    </Col>

                </Row>
            </Container>
        );
    }

}

export default Landing;