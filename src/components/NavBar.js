import { useHistory } from 'react-router-dom';

function Navbar(props) {
    const history = useHistory();
    return (
        <div style={{ backgroundColor: '#4a4a4a', width: '100%', height: '5vh', position: 'sticky', top: 0 }}>
            <div style={{ height: '100%', width: 'fit-content', marginLeft: '10px', cursor: 'pointer', display: 'inline' }}>
                <span style={{ height: '100%', color: '#e3e5e6', fontSize: '18px' }}
                    onClick={() => history.push('/')}
                >
                    ChessApp
                </span>
            </div>
            <div style={{ height: '100%', width: 'fit-content', marginLeft: '30px', cursor: 'pointer', display: 'inline' }}>
                <span style={{ height: '100%', fontSize: '14px' }}>
                    <a href="/database" style={{color: '#5fbeed'}}>Database</a>
                </span>
            </div>
            <div style={{ height: '100%', width: 'fit-content', marginLeft: '15px', cursor: 'pointer', display: 'inline' }}>
                <span style={{ height: '100%', fontSize: '14px' }}>
                    <a href="/openings" style={{color: '#5fbeed'}}>Openings</a>
                </span>
            </div>
            <div style={{ height: '100%', width: 'fit-content', marginLeft: '15px', cursor: 'pointer', display: 'inline' }}>
                <span style={{ height: '100%', fontSize: '14px' }}>
                    <a href="/tactics" style={{color: '#5fbeed'}}>Tactics</a>
                </span>
            </div>
        </div>
    );
}

export default Navbar;