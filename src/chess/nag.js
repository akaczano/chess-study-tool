export const nags = {
    1: {
        description: 'Good move',
        symbol: <text>!</text>,
        moveAnnotation: true
    },
    2: {
        description: 'Poor move',
        symbol: <text>?</text>,
        moveAnnotation: true
    },
    3: {
        description: 'Very good move',
        symbol: <text>!!</text>,
        moveAnnotation: true
    },
    4: {
        description: 'Very poor move',
        symbol: <text>??</text>,
        moveAnnotation: true
    },
    5: {
        description: 'Speculative move',
        symbol: <text>!?</text>,
        moveAnnotation: true
    },
    6: {
        description: 'Questionable move',
        symbol: <text>?!</text>,
        moveAnnotation: true
    },
    7: {
        description: 'Forced move',
        symbol: <text>&#9633;</text>,
        moveAnnotation: true
    },
    10: {
        description: 'Drawish position',
        symbol: <text>=</text>,
        moveAnnotation: false
    },
    13: {
        description: 'Unclear position',
        symbol: <text>&infin;</text>,
        moveAnnotation: false
    },
    14: {
        description: 'Slight advantage for White',
        symbol: <text>+/=</text>,
        moveAnnotation: false
    },
    15: {
        description: 'Slight advantage for Black',
        symbol: <text>=/+</text>,
        moveAnnotation: false
    },
    16: {
        description: 'Moderate advantage for White',
        symbol: <text>&plusmn;</text>,
        moveAnnotation: false
    },
    17: {
        description: 'Moderate advantage for Black',
        symbol: <text>&#8723;</text>,
        moveAnnotation: false
    },
    18: {
        description: 'Decisive advantage for White',
        symbol: <text>+-</text>,
        moveAnnotation: false
    },
    19: {
        description: 'Decisive advantage for Black',
        symbol: <text>-+</text>,
        moveAnnotation: false
    },
    22: {
        description: 'Zugzwang',
        symbol: <text>&xodot;</text>,
        moveAnnotation: false
    },
    36: {
        description: 'With initiative',
        symbol: <text>&uarr;</text>,
        moveAnnotation: false
    },
    40: {
        description: 'With attack',
        symbol: <text>&rarr;</text>,
        moveAnnotation: false
    },
    44: {
        description: 'With compensation',
        symbol: <text>=/&infin;</text>,
        moveAnnotation: false
    },
    132: {
        description: 'With conterplay',
        symbol: <text>&lrarr;</text>,
        moveAnnotation: false
    },
    138: {
        description: 'Time pressure',
        symbol: <text>&xoplus;</text>,
        moveAnnotation: false
    }
};

const FORCED_MOVE = 7;
const SINGULAR_MOVE = 8;

const DRAWISH_POSITION = 10;
const EQUAL_POSITION1 = 11;
const EQUAL_POSITION2 = 12;

const WHITE_ZUGZWANG = 22;
const BLACK_ZUGZWANG = 23;
const WHITE_INITIATIVE = 36;
const BLACK_INITIATIVE = 37;
const WHITE_ATTACK = 40;
const BLACK_ATTACK = 41;
const WHITE_COMPENSATION = 44;
const BLACK_COMPENSATION = 45;
const WHITE_COUNTERPLAY = 132;
const BLACK_COUNTERPLAY = 133;
const WHITE_TIME_PRESSURE = 138;
const BLACK_TIME_PRESSURE = 139;


export const isValidNag = nag => {    
    return Object.entries(nags).filter(item => item[0] == parseNag(nag)).length > 0;
}

export const getSymbol = nag => {    
    return nags[parseNag(nag)].symbol
}

export const isMoveAnnotation = nag => {
    return nags[parseNag(nag)].moveAnnotation;
}

export const parseNag = nag => {    
    if (nag === SINGULAR_MOVE) {
        return FORCED_MOVE;
    }
    else if (nag === EQUAL_POSITION1 || nag === EQUAL_POSITION2) {
        return DRAWISH_POSITION;
    }    
    else if (nag === BLACK_ZUGZWANG) {
        return WHITE_ZUGZWANG;
    }
    else if (nag === BLACK_INITIATIVE) {
        return WHITE_INITIATIVE;
    }
    else if (nag === BLACK_ATTACK) {
        return WHITE_ATTACK;
    }
    else if (nag === BLACK_COMPENSATION) {
        return WHITE_COMPENSATION;
    }
    else if (nag === BLACK_COUNTERPLAY) {
        return WHITE_COUNTERPLAY;
    }
    else if (nag == BLACK_TIME_PRESSURE) {
        return WHITE_TIME_PRESSURE;
    }
    else {
        return nag;
    }
}


