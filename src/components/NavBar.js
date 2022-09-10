import { useDispatch, useSelector } from 'react-redux'
import { Button } from 'react-bootstrap'

import { go, DATABASE, LANDING, STUDY } from '../state/navSlice'

function Navbar() {
    const dispatch = useDispatch()
    const { location } = useSelector(state => state.nav)

    return (
        <div style={{ backgroundColor: '#f0f0f0', width: '100%', height: '5vh', position: 'sticky', top: 0 }}>
            <div style={{ height: '100%', width: 'fit-content', marginLeft: '10px', cursor: 'pointer', display: 'inline' }}>
                <span style={{ height: '100%', color: '#4E65FF', fontSize: '18px' }}
                    onClick={() => dispatch(go({ location: LANDING }))}
                >
                    ChessApp
                </span>
            </div>
            <div style={{ height: '100%', width: 'fit-content', marginLeft: '30px', cursor: 'pointer', display: 'inline' }}>
                <span style={{ height: '100%', fontSize: '14px' }}>
                    <Button variant="link" onClick={() => dispatch(go({ location: DATABASE }))} style={{color: '#1d6ebf'}}>Database</Button>
                </span>
            </div>
            <div style={{ height: '100%', width: 'fit-content', marginLeft: '30px', cursor: 'pointer', display: 'inline' }}>
                <span style={{ height: '100%', fontSize: '14px' }}>
                    <Button variant="link" onClick={() => dispatch(go({ location: STUDY }))} style={{color: '#1d6ebf'}}>Study</Button>
                </span>
            </div>
        </div>
    );
}

export default Navbar;