export const INTERNAL_ERROR_CODES = {
    INVALID_USER: 1,
    INVALID_GROUP: 2,
    INVALID_QUERY: 3,
    INVALID_PARAMETER: 4,
    GROUP_NOT_FOUND: 5,
    USER_NOT_FOUND: 6,
    USER_ALREADY_EXISTS: 7,
    MISSING_PARAMETER: 8,
    MISSING_TOKEN: 9,
    NOT_AUTHORIZED: 10,
    GROUP_ALREADY_EXISTS: 11,
    INVALID_UPDATE: 12,
    INVALID_PLAYER: 13,
    PLAYER_ALREADY_EXISTS: 14,
    PLAYER_NOT_FOUND: 15,
    SQUAD_IS_FULL: 16
};

// Constructor function for an Error
function Error(code, description) {
    this.internalError = code;
    this.description = description;
}

export const errors = {
    INVALID_USER: (who) => {
        return new Error(INTERNAL_ERROR_CODES.INVALID_USER, `Invalid username '${who}'.`);
    },
    INVALID_PLAYER: (who) => {
        return new Error(INTERNAL_ERROR_CODES.INVALID_USER, `Invalid player with player id ${who}.`);
    },
    INVALID_GROUP: () => {
        return new Error(INTERNAL_ERROR_CODES.INVALID_GROUP, `Invalid Group. A group needs a valid name, description, competition and year.`);
    },
    INVALID_UPDATE: () => {
        return new Error(INTERNAL_ERROR_CODES.INVALID_UPDATE, `Invalid Group update. It is only allowed to update a group's name and description. Please provide a valid name and description to update.`);
    },
    INVALID_QUERY: () => {
        return new Error(INTERNAL_ERROR_CODES.INVALID_QUERY, `Invalid query.`);
    },
    INVALID_PARAMETER: (what) => {
        return new Error(INTERNAL_ERROR_CODES.INVALID_PARAMETER, `Invalid parameter ${what}`);
    },
    GROUP_NOT_FOUND: (what) => { 
        return new Error(INTERNAL_ERROR_CODES.GROUP_NOT_FOUND,`Group ${what} not found`);
    },
    GROUP_ALREADY_EXISTS: (who) => {
        return new Error(INTERNAL_ERROR_CODES.GROUP_ALREADY_EXISTS, `Group ${who} already exists. Try another group name.`);
    },
    PLAYER_ALREADY_EXISTS: (who) => {
        return new Error(INTERNAL_ERROR_CODES.GROUP_ALREADY_EXISTS, `Player ${who} is already in the group.`);
    },
    PLAYER_NOT_FOUND: (who) => { 
        return new Error(INTERNAL_ERROR_CODES.GROUP_NOT_FOUND,`Player with id ${who} not found`);
    },
    USER_NOT_FOUND: (who) => { 
        return new Error(INTERNAL_ERROR_CODES.USER_NOT_FOUND,`User ${who} not found`);
    },
    USER_ALREADY_EXISTS: (who) => {
        return new Error(INTERNAL_ERROR_CODES.USER_ALREADY_EXISTS, `User ${who} already exists. Try another username.`);
    },
    MISSING_PARAMETER: (what) => {
        return new Error(INTERNAL_ERROR_CODES.MISSING_PARAMETER, `Missing parameter ${what}`);
    },
    MISSING_TOKEN: () => { 
        return new Error(INTERNAL_ERROR_CODES.MISSING_TOKEN,`Missing token`);
    },
    NOT_AUTHORIZED: (who, what) => { 
        return new Error(INTERNAL_ERROR_CODES.NOT_AUTHORIZED,`${who} has no access to ${what}`);
    },
    SQUAD_IS_FULL: (what) => { 
        return new Error(INTERNAL_ERROR_CODES.SQUAD_IS_FULL,`Squad of group ${what} is full.`);
    },
}