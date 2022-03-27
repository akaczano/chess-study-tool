import { BsSkipForwardFill, BsSkipBackwardFill } from 'react-icons/bs';
import { AiFillStepBackward, AiFillStepForward } from 'react-icons/ai';
import { ButtonGroup, Button } from 'react-bootstrap';
export default function NavButtons(props) {    

    return (
        <div style={{ marginTop: '15px' }}>
            <div style={{ margin: 'auto', width: 'fit-content' }}>
                <ButtonGroup>
                    <Button variant="secondary" onClick={props.onGoToStart}
                            disabled={!props.backwardEnabled}>
                        <BsSkipBackwardFill />
                    </Button>
                    <Button variant="secondary" onClick={props.onGoBack}
                            disabled={!props.backwardEnabled}>
                        <AiFillStepBackward />
                    </Button>
                    <Button variant="secondary" onClick={props.onFlip}>
                        Flip Board
                    </Button>
                    <Button variant="secondary" onClick={props.onGoForward} 
                            disabled={!props.forwardEnabled}>
                        <AiFillStepForward />
                    </Button>
                    <Button variant="secondary" onClick={props.onGoToEnd} 
                            disabled={!props.forwardEnabled}>
                        <BsSkipForwardFill />
                    </Button>
                </ButtonGroup>
            </div>

        </div>
    );
};

