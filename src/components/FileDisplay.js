import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Row, ListGroup, Spinner, Button, Form } from 'react-bootstrap';
import { AiFillFolder, AiOutlineCheck, AiOutlineClose, AiFillEdit } from 'react-icons/ai';
import { BsTrashFill, BsSortDownAlt, BsSortUpAlt } from 'react-icons/bs';
import { ImCheckboxUnchecked, ImCheckboxChecked } from 'react-icons/im'
import { CgArrowsExchangeAltV } from 'react-icons/cg';

import {
    move,
    deleteItem,
    beginEdit,
    cancelEdit,
    editUpdate,
    updateFolder,
    selectEntry,
    unselectEntry,
    beginMove,
    cancelMove
} from '../state/directorySlice';
import { EDITOR, DATABASE, go } from '../state/navSlice'
import IconButton from './IconButton';

function FileDisplay() {
    const dispatch = useDispatch()            

    const {
        files,
        renaming,
        editing,
        editingName,
        deleting,
        moveSource,
        moving,
        selection,
        filter
    } = useSelector(state => state.directory)

        
    const [selectedTab, setSelectedTab] = useState(0)    
    const [sortField, setSortField] = useState([4, 0])
    if (!files) return null
    const enabled = [0, 1, 2, 3].map(t => files.filter(f => f.type == t).length > 0);        
    const tabs = [0, 1, 2, 3].filter(t => enabled[t])        
    if (tabs.length > 0 && !enabled[selectedTab]) setSelectedTab(tabs[0])
    
    const getTabs = () => {
        const tabNames = ['Folders', 'Games', 'Openings', 'Puzzles'];                
        if (tabs.length < 2) return null
        return (
            <Row style={{ backgroundColor: '#f1f1f1', margin: '0px', height: '7%', marginBottom: '5px' }}>
                {tabs.map(t => {                    
                    return (
                        <button key={t} style={{ maxHeight: '100%', fontSize: '14px' }}
                            className={selectedTab === t ? "dir-tab active" : "dir-tab"}
                            onClick={() =>  setSelectedTab(t)}
                        >
                            {tabNames[t]}
                        </button>
                    )
                })}
            </Row>
        );
    }


    const getRenameControl = item => {
        const editorButtons = renaming.includes(item.key) ?
            <Spinner animation="border" /> :
            (<>
                <AiOutlineCheck
                    className="save-check"
                    onClick={() => dispatch(updateFolder({ item, description: editingName }))} />
                <AiOutlineClose
                    className="close-icon"
                    onClick={() => dispatch(cancelEdit())} />
            </>);

        if (editing == item.key) {
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
                    onClick={() => dispatch(beginEdit(item))}
                >
                    <AiFillEdit />
                </Button>
            );
        }
    }

    const getDeleteButton = item => {
        const isDeleting = deleting.includes(item.key);
        const handler = () => dispatch(deleteItem(item.key));

        if (item.type === 0) {
            return (
                <Button variant="secondary" style={{ float: 'right' }} onClick={handler} disabled={isDeleting}>
                    {isDeleting ? <Spinner animation="border" /> : <BsTrashFill />}
                </Button>
            );
        }
        else {
            return (
                <IconButton
                    disabled={isDeleting}
                    onClick={handler}
                    disabledColor="gray"
                    color="#547b91"
                    hoverColor="red"
                    style={{ marginRight: '10px' }}
                >
                    {isDeleting ? <Spinner animation="border" /> : <BsTrashFill />}
                </IconButton>
            )
        }
    }

    const getMoveButton = item => {
        const disabled = moveSource && moveSource?.key !== item.key;
        const onClick = moveSource?.key === item.key ?
            () => dispatch(cancelMove()) :
            () => dispatch(beginMove(item))

        const content = (
            moveSource?.key === item.key ?
                moving ? <Spinner animation="border" /> :
                    <AiOutlineClose /> : (
                    <><CgArrowsExchangeAltV />
                        <AiFillFolder /></>
                )
        )

        if (item.type === 0) {
            return (
                <Button
                    variant="secondary"
                    style={{ marginRight: '15px', float: 'right' }}
                    disabled={disabled}
                    onClick={onClick}
                >
                    {content}
                </Button>
            )
        }
        else {
            return (
                <IconButton color="#547b91" disabledColor="gray" disabled={disabled} onClick={onClick} hoverColor="blue">
                    {content}
                </IconButton>
            )
        }
    }

    const getDirectories = () => {
        const enabled = selectedTab === 0
        if (!enabled) return null;
        const dirs = files
            .filter(f => f.type === 0)
            .sort((a, b) => a.description.localeCompare(b.description))
        const ms = moveSource;
        return (
            <ListGroup>
                {dirs.map(d => {
                    let label = null;
                    if (editing == d.key) {
                        label = (
                            <input
                                type="text"
                                value={editingName}
                                onChange={e => dispatch(editUpdate(e.target.value))} />
                        );
                    }
                    else {
                        const validTarget = ms && (ms.key !== d.key || ms.type !== 0)
                        const labelStyle = validTarget ? { color: 'green' } : { color: 'black' }
                        const handler = validTarget ?
                            () => dispatch(move({ type: ms.type, id: ms.id, parent_id: d.id })) :
                            () => dispatch(go({ location: DATABASE, params: d.id }))

                        label = (
                            <Button
                                style={labelStyle}
                                variant="link"
                                onClick={handler}
                            >
                                {d.description}
                            </Button>
                        );
                    }
                    return (
                        <ListGroup.Item key={d.key}>
                            <AiFillFolder style={{ marginRight: '15px' }} />
                            {label}
                            {getDeleteButton(d)}
                            {getRenameControl(d)}
                            {getMoveButton(d)}
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>
        );
    }

    const getSortButtons = i => {
        const [field, dir] = sortField;
        return (
            <span style={{ float: 'right', marginLeft: '5px' }}>
                {[0, 1].map(d => {
                    const handler = () => setSortField([i, d])
                    return (
                        <IconButton
                            key={"sortbutton" + d}
                            color="#53cfb8"
                            disabledColor="#228f7b"
                            hoverColor="#72edd7"
                            disabled={i === field && d === dir}
                            onClick={handler}
                            style={{ marginRight: '5px' }}
                        >
                            {d === 0 ? <BsSortUpAlt /> : <BsSortDownAlt />}
                        </IconButton>
                    )
                })}
            </span>
        )
    }

    const compareGames = (a, b) => {
        const [field, dir] = sortField;
        const getField = (g, i) => {
            switch (i) {
                case 0: return g.white_name;
                case 1: return g.white_rating;
                case 2: return g.black_name;
                case 3: return g.black_rating;
                case 4: return g.date;
                case 5: return g.event;
                case 6: return g.round;
                case 7: return g.result;
            }
        }

        const first = getField(a, field);
        const second = getField(b, field);
        if (!second) return -1;
        if (!first) return 1;

        if (dir === 0) {
            if (typeof (first) === "number") {
                return first - second
            }
            return first.localeCompare(second)
        }
        else {
            if (typeof (first) === "number") {
                return second - first
            }
            return second.localeCompare(first)
        }
    }

    const filterGames = g => {
        if (filter.name.text.length > 0) {
            const compareText = (a, b) => {
                const filterWords = a.toUpperCase().split(' ')
                const gameWords = b.replace(',', '').toUpperCase().split(' ')
                for (const w of filterWords) {
                    if (!gameWords.includes(w)) return false
                }
                return true
            }

            if (filter.name.match === 0) {
                if (!compareText(filter.name.text, g.white_name) && !compareText(filter.name.text, g.black_name)) {
                    return false
                }
            }
            else if (filter.name.match === 1) {
                if (!compareText(filter.name.text, g.white_name)) return false
            }
            else if (filter.name.match === 2) {
                if (!compareText(filter.name.text, g.black_name)) return false
            }
        }

        if (filter.startDate && filter.startDate > new Date(g.date)) return false
        if (filter.endDate && filter.endDate < new Date(g.date)) return false

        if (filter.event !== 'Any' && filter.event !== g.event) return false
        if (filter.result.length > 0 && filter.result !== g.result) return false

        return true
    }

    const getHeaders = type => {
        if (type === 1) {
            return (
                <>
                    <th>White Name {getSortButtons(0)}</th>
                    <th>ELO {getSortButtons(1)}</th>
                    <th>Black Name {getSortButtons(2)}</th>
                    <th>ELO {getSortButtons(3)}</th>
                    <th>Date {getSortButtons(4)}</th>
                    <th style={{ maxWidth: '10%' }}>Event {getSortButtons(5)}</th>
                    <th>Round {getSortButtons(6)}</th>
                    <th>Result {getSortButtons(7)}</th>
                </>
            );
        }
        else if (type === 2) {
            return (
                <>
                    <th>Description</th>
                    <th>Side</th>
                </>
            )
        }
        else if (type === 3) {
            return <th>Description</th>
        }
    }

    const getValues = (type, g, goTo) => {
        if (type === 1) {
            return (
                <>
                    <td onClick={goTo}>{g.white_name}</td>
                    <td onClick={goTo}>{g.white_rating}</td>
                    <td onClick={goTo}>{g.black_name}</td>
                    <td onClick={goTo}>{g.black_rating}</td>
                    <td onClick={goTo}>{g.date}</td>
                    <td onClick={goTo}>{g.event}</td>
                    <td onClick={goTo}>{g.round}</td>
                    <td onClick={goTo}>{g.result}</td>
                </>
            )
        }
        else if (type === 2) {
            return (
                <>
                    <td onClick={goTo}>{g.description}</td>
                    <td onClick={goTo}>{g.side ? 'Black' : 'White'}</td>
                </>
            )
        
        }
        else if (type === 3) {
            return (
                <td onClick={goTo}>{g.description}</td>
            )
        }
    }

    const getGames = () => {
        const type = selectedTab;           
        const games = files
            .filter(f => f.type != 0)
            .filter(f => f.type == type)
            .filter(filterGames)
            .sort(compareGames)


        if (games.length < 1) return null;
        return (
            <Table bordered hover size="sm" style={{ fontSize: '14px' }}>
                <thead>
                    <tr>
                        <th>#</th>
                        {getHeaders(type)}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {games.map((g, i) => {
                        const goTo = () => { console.log(g.id); dispatch(go({ location: EDITOR, params: { id: g.id } })) }
                        const selected = selection.filter(i => i.key == g.key).length > 0;
                        const selectHandler = selected ?
                            () => dispatch(unselectEntry(g)) :
                            () => dispatch(selectEntry(g));
                        return (
                            <tr key={g.key}>
                                <td>{i + 1}</td>
                                {getValues(type, g, goTo)}
                                <td style={{ textAlign: 'center' }}>
                                    <IconButton onClick={selectHandler} color="#547b91" hoverColor="blue" disabled={false} style={{ marginRight: '10px' }}>
                                        {selected ? <ImCheckboxChecked /> : <ImCheckboxUnchecked />}
                                    </IconButton>
                                    {getDeleteButton(g)}
                                    {getMoveButton(g)}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>
        );
    }

    if (!files || files.length < 1) {
        return <h4>This directory is empty</h4>
    }

    return (
        <>
            {getTabs()}
            <div style={{ maxHeight: '74vh', overflowY: 'auto', backgroundColor: 'white', margin: '0' }}>
                {getDirectories()}
                {getGames()}
            </div>
        </>
    );

}

export default FileDisplay;