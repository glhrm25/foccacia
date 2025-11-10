import { errors } from '../commons/internal-errors.js';

export default function init(groupsData, usersServices) {

    // Verify the dependencies:
    if(! usersServices){
        throw errors.INVALID_ARGUMENT('usersServices');
    }
    if(! groupsData){
        throw errors.INVALID_ARGUMENT('tasksData');
    }

    // Interface
    return {
        getCompetitions,
        getTeams,
        getAllGroups,
        getGroup,
        addGroup,
        updateGroup,
        deleteGroup,
        addPlayerToGroup,
        removePlayerFromGroup
    };

    // Input: a query (object) (or an empty object {}) and a user token (String). -> ADICIONAR AS QUERYS ???
    // Output: an array of groups or an internal error object.
    function getAllGroups(userToken){
        const userId = usersServices.getUserId(userToken);
        const groups = groupsData.getGroupsForUser(userId);
    /*
        const queryLen = Object.keys(query).length;
        if (queryLen == 0){ // There is no query string
        return groups;
        }
        if (queryLen == 1 && "search" in query){
        const querySearch = query["search"];
        const searchedTasks = tasksData.searchTasks(groups, querySearch);
        return(searchedTasks);
        }
        else {
        return errors.INVALID_QUERY();
        }
        */
        return groups
    }

    // Input: a new group object.
    // Output: a group or a internal error object.
    function addGroup(userToken, newGroup){
        if (!isValidGroup(newGroup))
            return errors.INVALID_GROUP();

        const g = getIdAndGroup(userToken, newGroup.name)
        if (g.group)
            return errors.GROUP_ALREADY_EXISTS(newGroup.name);
        
        return groupsData.addGroup(g.userId, newGroup)
    }

    // Input: a groupName (String) and a userToken (String).
    // Output: a group or a internal error object.
    function getGroup(userToken, groupName){
        if (typeof groupName !== "string" || groupName.trim() === "")
            return errors.INVALID_PARAMETER(groupName);
        
        const g = checkGroup(userToken, groupName)
        if (g.internalError) return g
        return g.group
    }

    // Input: a groupName (String) and a userToken (String).
    // Output: a confirming message (object) or an internal error object.
    function deleteGroup(userToken, groupName){
        const g = checkGroup(userToken, groupName)
        if (g.internalError) return g
        return (groupsData.deleteGroup(g.id, g.group.name));
    }

    // Input: a groupName (String), a userToken (String) and a new group object.
    // Output: the updated group or a internal error object.
    function updateGroup(userToken, groupName, updates){
        if (!isValidUpdate(updates))
            return errors.INVALID_UPDATE();
        
        const g = checkGroup(userToken, groupName)
        if (g.internalError) return g
        return(groupsData.updateGroup(g.id, g.group.name, updates));
    }

    // Input: a groupName (String), a userToken (String) and a new player object.
    // Output: the updated group with the new player or a internal error object.
    function addPlayerToGroup(userToken, groupName, player){
        if(!isValidPlayer(player))
            return errors.INVALID_PLAYER()

        const g = checkGroup(userToken, groupName)
        if (g.internalError) return g
        
        if (isPlayerInGroup(g.group, player.playerId))
            return errors.PLAYER_ALREADY_EXISTS(player.playerName)

        if(isSquadFull(g.group))
            return errors.SQUAD_IS_FULL(groupName)

        return groupsData.addPlayerToGroup(g.id, g.group.name, player)
    }

    // Input: a groupName (String), a userToken (String) and a player id (String).
    // Output: a confirming message (object) or an internal error object.
    function removePlayerFromGroup(userToken, groupName, playerId){
        const g = checkGroup(userToken, groupName)
        if (g.internalError) return g

        if (!isPlayerInGroup(g.group, playerId))
            return errors.PLAYER_NOT_FOUND(playerId)
        
        return groupsData.removePlayerFromGroup(g.id, g.group.name, playerId)
    }

    // Output: All the available competitions.
    async function getCompetitions() {
        return await groupsData.getCompetitions()
    }

    // Input: a competitionCode (String) and a season(string)
    // Output: All the teams that participated on the specified competition.
    async function getTeams(competitionCode, season) {
        return await groupsData.getTeams(competitionCode, season);
    }

    // Auxiliary function: gets userId by it's token and returns a object with the id and the group with groupName (Or undefined if group does not exist).
    function getIdAndGroup(userToken, groupName){
        const userId = usersServices.getUserId(userToken)
        const group = groupsData.getGroup(userId, groupName.toUpperCase())
        return {id: userId, group: group}
    }

    // Auxiliary function: Check if user has already created a group with groupName
    // Returns group if it exists, else, throws Internal Server Error
    function checkGroup(userToken, groupName){
        const r = getIdAndGroup(userToken, groupName)
        if (!r.group)
            return errors.GROUP_NOT_FOUND(groupName);
        
        return r
    }
}

//  OTHER AUXILIAR FUNCTIONS:

function isValidGroup(group) {
    return (
        group && (typeof group === "object") && 
        (typeof group.name === "string") && (group.name.trim() !== "") &&
        (typeof group.description === "string") && (group.description.trim() !== "") &&
        group.competition && (typeof group.competition === "object") &&
        (typeof group.competition.code === "string") && (group.competition.code.trim() !== "") &&
        (typeof group.competition.name === "string") && (group.competition.name.trim() !== "") &&
        group.year && (typeof group.year === "number") && (!isNaN(Number(group.year)))
    )
}
  
function isValidUpdate(update){
    return (
        update && (typeof update === "object") && 
        (typeof update.name === "string") && (update.name.trim() !== "") &&
        (typeof update.description === "string") && (update.description.trim() !== "")
    )
}
  
function isValidPlayer(pl){
    return (
        pl && (typeof pl === "object") &&
        (typeof pl.playerId === "string") && (pl.playerId !== "") &&
        (typeof pl.playerName === "string") && (pl.playerId !== "") &&
        (typeof pl.teamCode === "string") && (pl.playerId !== "") &&
        (typeof pl.teamName === "string") && (pl.playerId !== "")
    )
}
  
function isPlayerInGroup(group, pl){
    const idx = group.players.findIndex(
        el => el.playerId === pl
    )
    
    return (idx != -1)
}
  
function isSquadFull(group){
    return (group.players.length >= 11)
}
