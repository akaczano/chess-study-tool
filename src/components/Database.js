import React from 'react';
import { Container, ListGroup, Button, ButtonGroup, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { connect } from 'react-redux';
import { AiFillFolder, AiFillEdit, AiOutlineCheck, AiOutlineClose, AiOutlinePlus, AiOutlineClear } from 'react-icons/ai';
import { GiChessPawn, GiEmptyChessboard } from 'react-icons/gi';
import { ImCheckboxUnchecked, ImCheckboxChecked } from 'react-icons/im'
import { BsTrashFill } from 'react-icons/bs';
import { RiArrowGoBackLine } from 'react-icons/ri';
import { BiSelectMultiple, BiExport } from 'react-icons/bi';
import { CgArrowsExchangeAltV } from 'react-icons/cg';

import './Directory.css';
import PGN from '../chess/PGN';

import {
    loadFiles,
    postFolder,
    deleteFolder,
    updateFolder,
    beginEdit,
    cancelEdit,
    editUpdate,
    deleteGame,
    beginMove,
    cancelMove,
    move,
    clearError,
    uploadGames,
    reportUploadError,
    selectEntry,
    unselectEntry,
    showSelection
} from '../actions/databaseActions';
import { startingPosition } from '../chess/chess';
import SelectionDisplay from './SelectionDisplay';


class Database extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            folderModal: false,
            gameModal: false,
            folderName: ''
        };
    }

    componentDidMount() {
        this.props.loadFiles(this.props.match.params.id);
    }

    getAlert() {
        if (this.props.error) {
            return (
                <Alert variant="danger" onClose={this.props.clearError} dismissible>
                    {this.props.error}
                </Alert>
            );
        }
        return null;
    }

    getDeleteButton(id, directory) {
        const deleting = directory ? this.props.deletingFolders.includes(id) :
            this.props.deletingGames.includes(id);
        const onClick = directory ? () => this.props.deleteFolder(id) :
            () => this.props.deleteGame(id);
        return (
            <Button
                variant="secondary"
                style={{ float: 'right' }}
                onClick={onClick}
                disabled={deleting}
            >
                {deleting ? <Spinner animation="border" /> : <BsTrashFill />}
            </Button>
        );
    }

    getRenameControl(f) {
        const editorButtons = this.props.renaming.includes(f.data.id) ?
            <Spinner animation="border" /> :
            (<>
                <AiOutlineCheck
                    className="save-check"
                    onClick={() => this.props.updateFolder(f.data.id, this.props.parent, this.props.editingName)} />
                <AiOutlineClose
                    className="close-icon"
                    onClick={this.props.cancelEdit} />
            </>);

        if (this.props.editing == f.data.id) {
            return (
                <span style={{ fontSize: '20px', marginLeft: '15px' }}>
                    {editorButtons}
                </span>
            );
        }
        else {
            return (
                <Button
                    variant="secondary"
                    style={{ float: 'right', marginRight: '15px' }}
                    onClick={() => this.props.beginEdit(f.data.id, f.data.description)}
                >
                    <AiFillEdit />
                </Button>
            );
        }
    }

    renderItem = f => {        
        const key = f.directory ? 'dir' + f.data.id : 'game' + f.data.id;
        const icon = f.directory ? <AiFillFolder style={{ marginRight: '15px' }} /> :
            <GiChessPawn style={{ marginRight: '15px', fontSize: '25px' }} />;
        let labelText = f.directory ? f.data.description :
            (f.data.white_name + '-' + f.data.black_name);
        let itemPath = f.directory ? `/database/${f.data.id}` : `/game/edit/${f.data.id}`;
        const ms = this.props.moveSource;
        let label = null;
        if (f.directory && this.props.editing == f.data.id) {
            label = (
                <input
                    type="text"
                    value={this.props.editingName}
                    onChange={e => this.props.editUpdate(e.target.value)} />
            );
        }
        else {
            const validTarget = f.directory && ms && (ms.id !== f.data.id || ms.directory !== f.directory)
            const labelStyle = validTarget ? { color: 'green' } : { color: 'black' }
            const handler = validTarget ?
                () => this.props.move(ms.directory, ms.id, f.data.id) :
                () => this.props.history.push(itemPath)
                
            label = (
                <Button
                    style={labelStyle}
                    variant="link"
                    onClick={handler}
                >
                    {labelText}
                </Button>
            );
        }
        
        const selectionIcon = f.directory ? null :
            this.props.selection.filter(i => i.data.id == f.data.id).length > 0 ? 
            <ImCheckboxChecked onClick={() => this.props.unselectEntry(f)} /> : 
            <ImCheckboxUnchecked className="select-icon" onClick={() => this.props.selectEntry(f)}/>;

        const moveButton = (
            <Button
                variant="secondary"
                style={{ marginRight: '15px', float: 'right' }}
                disabled={ms && ms.id === f.data.id && ms.directory === f.directory && this.props.moving}
                onClick={ms && ms.id === f.data.id && ms.directory === f.directory ?
                    () => this.props.cancelMove() :
                    () => this.props.beginMove(f.directory, f.data.id)

                }
            >
                {ms && ms.id === f.data.id && ms.directory === f.directory ?
                    this.props.moving ? <Spinner animation="border" /> :
                        <AiOutlineClose /> : (
                        <><CgArrowsExchangeAltV />
                            <AiFillFolder /></>
                    )
                }

            </Button>
        );

        const extraInfo = f.directory ? null : (
            <div style={{ fontSize: '13px', display: 'inline', float: 'right', marginRight: '30%' }}>
                {f.data.event} ({f.data.date})
            </div>
        );

        return (
            <ListGroup.Item key={key}>
                {icon}
                {label}                
                {this.getDeleteButton(f.data.id, f.directory)}
                {f.directory ? this.getRenameControl(f) : null}
                {moveButton}
                <span style={{marginRight: '15px', float: 'right'}}>{selectionIcon}</span>
                {extraInfo}
            </ListGroup.Item>
        );
    }


    postFolder = () => {
        this.props.postFolder(this.state.folderName);
        this.setState({ folderModal: false });
    }

    compareItems = (a, b) => {        
        if (a.directory && !b.directory) return -1;
        if (b.directory && !a.directory) return 1;
        let str1 = a.directory ? a.data.description : a.data.white_name + '-' + a.data.black_name;
        let str2 = b.directory ? b.data.description : b.data.white_name + '-' + b.data.black_name;
        return str1.localeCompare(str2);
    }

    handleFileInput = ev => {
        for (let i = 0; i < ev.target.files.length; i++) {
            const fileReader = new FileReader();
            fileReader.onload = e => {
                if (!e.target.result) return;
                const pgn = new PGN(e.target.result);
                if (pgn.error) {
                    this.props.reportUploadError(pgn.error);
                    return;
                }
                else {
                    const games = [];
                    for (let i = 0; i < pgn.gameData.length; i++) {
                        const g = pgn.gameData[i];
                        if (!(g.White && g.Black && g.Event && g.Site && g.Round && g.Site && g.Date && g.Result)) {
                            this.props.reportUploadError('Missing tag pair');
                            return;
                        }
                        let game = {
                            parent_id: parseInt(this.props.parent),
                            white_name: g.White,
                            black_name: g.Black,
                            event: g.Event,
                            site: g.Site,
                            round: g.Round,
                            date: new Date(g.Date),
                            result: g.Result,
                            white_rating: g.WhiteElo ? parseInt(g.WhiteElo) : 0,
                            black_rating: g.BlackElo ? parseInt(g.BlackElo) : 0,
                            start_position: startingPosition
                        };
                        if (g.SetUp && g.SetUp == '1') {
                            if (!g.FEN) {
                                this.props.reportUploadError('Missing FEN tag');
                                return;
                            }
                            game.start_position = g.FEN;
                        }
                        game.movetext = pgn.games[i].writePGN();
                        games.push(game);
                    }
                    this.props.uploadGames(games);
                }
            };
            fileReader.readAsText(ev.target.files[i]);
        }

    }


    render() {        
        return (
            <Container style={{ marginTop: '10px' }}>
                <input
                    type="file"
                    style={{ display: 'none' }}
                    id="upload_input"
                    multiple
                    onChange={this.handleFileInput} />
                <SelectionDisplay />
                <Modal show={this.props.posting || this.state.folderModal} onHide={() => this.setState({ folderModal: false, folderName: '' })}>
                    <Modal.Header >
                        Add Folder
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={this.state.folderName}
                                onChange={e => this.setState({ folderName: e.target.value })}
                            />
                        </Form.Group>
                        <div style={{ marginTop: '15px' }}>
                            <Button
                                variant="primary"
                                style={{ marginRight: '15px' }}
                                onClick={this.postFolder}
                                disabled={this.props.posting}
                            >
                                {this.props.posting ? (<Spinner animation="border" />) : <>Add</>}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => this.setState({ folderModal: false, folderName: '' })}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Modal.Body>
                </Modal>
                <div style={{ marginBottom: '10px' }}>
                    <span style={{ fontSize: '18px' }}>
                        <strong>Database    </strong>
                    </span>
                    <span style={{ fontSize: '15px', color: '#0000FF' }}>
                        ({'/' + this.props.path.map(gd => gd.description).join('/')})
                    </span>
                    <span  style={{float: 'right', fontSize: '15px'}}>
                        <Button variant="link" style={{maxHeight: '15px', marginBottom: '8px'}} onClick={() => this.props.showSelection() }>
                            Selection ({this.props.selection.length} items)
                        </Button>
                    </span>                    
                </div>
                {this.getAlert()}
                <ListGroup style={{ maxHeight: "75vh", overflowY: 'auto' }}>
                    {this.props.list ? this.props.list.sort(this.compareItems).map(this.renderItem) : null}
                </ListGroup>
                <ButtonGroup style={{ marginTop: '15px' }}>
                    <Button
                        variant="primary"
                        onClick={() => this.props.history.push('/game/edit?parent=' + this.props.parent)}
                    >
                        <AiOutlinePlus /> <GiEmptyChessboard />
                    </Button>
                    <Button variant="primary" onClick={() => this.setState({ folderModal: true, folderName: '' })}>
                        <AiOutlinePlus /> <AiFillFolder />
                    </Button>
                    <Button
                        variant="primary"
                        style={{ color: this.props.moveSource ? 'lime' : 'white' }}
                        disabled={!this.props.parent}
                        onClick={() => {
                            const ms = this.props.moveSource;
                            if (this.props.moveSource) {
                                this.props.move(ms.directory, ms.id, this.props.prev);
                            }
                            else if (this.props.prev === -1) {                                
                                this.props.history.push('/database');
                            }
                            else {                                
                                this.props.history.push(`/database/${this.props.prev}`)
                            }
                        }}
                    >
                        <RiArrowGoBackLine />
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => document.getElementById('upload_input').click()}
                        disabled={this.props.uploading}
                    >
                        {this.props.uploading ? <Spinner animation="border" /> : <BiExport />}
                    </Button>
                    <Button variant="primary" onClick={() => this.props.list.filter(f => !f.directory).map(f => this.props.selectEntry(f))}>
                        <BiSelectMultiple />
                    </Button>
                    <Button variant="primary" onClick={() => this.props.list.filter(f => !f.directory).map(f => this.props.unselectEntry(f))}>
                        <AiOutlineClear />
                    </Button>
                </ButtonGroup>
            </Container>
        );
    }
}

const mapStateToProps = state => {    
    const pl = state.database.path.length;
    let prev = pl < 1 ? -1 : state.database.path[pl - 1].parent_id;
    prev = prev == null ? -1 : prev;
    
    const parent = pl > 0 ? state.database.path[pl - 1].id : null;

    return {
        list: state.database.files,
        parent: parent,
        posting: state.database.posting,
        deletingFolders: state.database.deletingFolders,
        deletingGames: state.database.deletingGames,
        renaming: state.database.renaming,
        editing: state.database.editing,
        editingName: state.database.editingName,
        prev: prev,
        moveSource: state.database.moveSource,
        moving: state.database.moving,
        error: state.database.errMsg,
        uploading: state.database.uploading,        
        selection: state.database.selection,
        path: state.database.path  
    };
};

export default connect(mapStateToProps, {
    loadFiles,
    postFolder,
    deleteFolder,
    updateFolder,
    beginEdit,
    cancelEdit,
    editUpdate,
    deleteGame,
    beginMove,
    cancelMove,
    move,
    clearError,
    uploadGames,
    reportUploadError,
    selectEntry,
    unselectEntry,
    showSelection
})(Database);