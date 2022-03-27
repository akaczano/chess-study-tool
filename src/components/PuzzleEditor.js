import React from 'react';
import { connect } from 'react-redux';

import GameEditor from './chessboard/GameEditor';

class PuzzleEditor extends React.Component {

    render() {
        return <GameEditor />
    }
};

const mapStateToProps = state => {
    return {};
};

export default connect(mapStateToProps, {})(PuzzleEditor);