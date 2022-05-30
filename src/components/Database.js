import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Container, Button, ButtonGroup, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { AiFillFolder, AiFillEdit, AiOutlineCheck, AiOutlineClose, AiOutlinePlus, AiOutlineClear } from 'react-icons/ai';
import { GiChessPawn, GiEmptyChessboard } from 'react-icons/gi';
import { ImCheckboxUnchecked, ImCheckboxChecked } from 'react-icons/im'
import { BsTrashFill } from 'react-icons/bs';
import { RiArrowGoBackLine } from 'react-icons/ri';
import { BiSelectMultiple, BiExport } from 'react-icons/bi';
import { CgArrowsExchangeAltV } from 'react-icons/cg';

import './Directory.css';
import PGN from '../chess/PGN';
import DataButtons from './DataButtons';
import FileDisplay from './FileDisplay';

import {
    loadFiles,
    postFolder,
    updateFolder,
    beginEdit,
    cancelEdit,
    editUpdate,
    beginMove,
    cancelMove,
    move,
    setError,
    clearError,
    uploadGames,
    selectEntry,
    unselectEntry
} from '../state/directorySlice';
import { startingPosition } from '../chess/chess';
import SelectionDisplay from './SelectionDisplay';
import { go, EDITOR, DATABASE } from '../state/navSlice'

function Database() {

    const dispatch = useDispatch()
    const id = useSelector(state => state.nav.params)     
    

    const [folderModal, setFolderModal] = useState(false)
    const [gameModal, setGameModal] = useState(false)
    const [folderName, setFolderName] = useState('')

    const state = useSelector(state => state.directory)
    const pl = state.path.length;
    let prev = pl < 1 ? -1 : state.path[pl - 1].parent_id;
    prev = prev == null ? -1 : prev;

    const parent = pl > 0 ? state.path[pl - 1].id : null;


    useEffect(() => {
        dispatch(loadFiles(id))
    }, [dispatch, id])

    const getAlert = () => {
        if (state.errMsg) {
            return (
                <Alert variant="danger" onClose={() => dispatch(clearError())} dismissible>
                    {state.errMsg}
                </Alert>
            );
        }
        return null;
    }


    const postDirectory = () => {        
        dispatch(postFolder({description: folderName, parent_id: parent}))
        setFolderModal(false)
    }

    const handleFileInput = ev => {
        for (let i = 0; i < ev.target.files.length; i++) {
            const fileReader = new FileReader();
            fileReader.onload = e => {
                if (!e.target.result) return;
                const pgn = new PGN(e.target.result);
                if (pgn.error) {
                    dispatch(setError(pgn.error))
                    return
                }
                else {
                    const games = [];
                    for (let i = 0; i < pgn.gameData.length; i++) {
                        const g = pgn.gameData[i];
                        if (!(g.White && g.Black && g.Event && g.Site && g.Round && g.Site && g.Date && g.Result)) {
                            dispatch(setError('Missing tag pair'))
                            return
                        }
                        let game = {
                            parent_id: parseInt(parent),
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
                                dispatch(setError('Missing FEN tag'))
                                return;
                            }
                            game.start_position = g.FEN;
                        }
                        game.movetext = pgn.games[i].writePGN();
                        games.push(game);
                    }
                    dispatch(uploadGames(games))
                }
            };
            fileReader.readAsText(ev.target.files[i]);
        }

    }



    return (
        <Container style={{ marginTop: '10px' }}>
            <input
                type="file"
                style={{ display: 'none' }}
                id="upload_input"
                multiple
                onChange={handleFileInput} />
            <SelectionDisplay />
            <Modal show={state.posting || folderModal} onHide={() => {setFolderModal(false); setFolderName('') }}>
                <Modal.Header >
                    Add Folder
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={folderName}
                            onChange={e => setFolderName(e.target.value)}
                        />
                    </Form.Group>
                    <div style={{ marginTop: '15px' }}>
                        <Button
                            variant="primary"
                            style={{ marginRight: '15px' }}
                            onClick={postDirectory}
                            disabled={state.posting}
                        >
                            {state.posting ? (<Spinner animation="border" />) : <>Add</>}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => {setFolderName(''); setFolderModal(false)}}
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
                    ({'/' + state.path.map(gd => gd.description).join('/')})
                </span>
                <DataButtons />
            </div>
            {getAlert()}
            <FileDisplay parent={parent} />
            <ButtonGroup style={{ marginTop: '15px' }}>
                <Button
                    variant="primary"
                    onClick={() => dispatch(go({ location: EDITOR, params: { id: null, parent } }))}
                >
                    <AiOutlinePlus /> <GiEmptyChessboard />
                </Button>
                <Button variant="primary" onClick={() => {setFolderModal(true); setFolderName('')}}>
                    <AiOutlinePlus /> <AiFillFolder />
                </Button>
                <Button
                    variant="primary"
                    style={{ color: state.moveSource ? 'lime' : 'white' }}
                    disabled={!parent}
                    onClick={() => {
                        const ms = state.moveSource;
                        if (state.moveSource) {
                            dispatch(move(ms.type, ms.id, prev))
                        }
                        else if (prev === -1) {
                            dispatch(go({ location: DATABASE }))
                        }
                        else {
                            dispatch(go({ location: DATABASE, params: prev }))
                        }
                    }}
                >
                    <RiArrowGoBackLine />
                </Button>
                <Button
                    variant="primary"
                    onClick={() => document.getElementById('upload_input').click()}
                    disabled={state.uploading}
                >
                    {state.uploading ? <Spinner animation="border" /> : <BiExport />}
                </Button>
                <Button variant="primary" onClick={() => state.files.filter(f => f.type !== 0).map(f => dispatch(selectEntry(f)))}>
                    <BiSelectMultiple />
                </Button>
                <Button variant="primary" onClick={() => state.files.filter(f => f.type !== 0).map(f => dispatch(unselectEntry(f)))}>
                    <AiOutlineClear />
                </Button>
            </ButtonGroup>
        </Container>
    );

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
        path: state.database.path,
        selection: state.database.selection,
        sortField: state.database.sortField
    };
};

export default Database;