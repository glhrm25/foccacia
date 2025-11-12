import { errors } from '../commons/internal-errors.js';

export default function init(groupsData, footballData, usersServices) {

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
        const userId = usersServices.getUserId(userToken)
        return userId.then(
            id => {
                return id ? groupsData.getGroupsForUser(id) : Promise.reject(errors.USER_NOT_FOUND())  
            }
        )
        /*
        return tasksPromise.then(tasks => {
          const queryLen = Object.keys(query).length;
          if (queryLen == 0) { // There is no query string
            return tasks;
          }
          if (queryLen == 1 && "search" in query) {
            const querySearch = query["search"];
            const searchedTasks = tasksData.searchTasks(tasks, querySearch);
            return(searchedTasks);
          }
          else {
            return Promise.reject(errors.INVALID_QUERY());
          }
        });
        */
    }

    // Input: a new group object.
    // Output: a group or a internal error object.
    function addGroup(userToken, newGroup){
        if (!isValidGroup(newGroup)){
            return Promise.reject(errors.INVALID_GROUP())
        }
        const userId = usersServices.getUserId(userToken);
        return userId.then(id => {
            if(!id) {
                return Promise.reject(errors.USER_NOT_FOUND())
            }
            // CHECK IF GROUP ALREADY EXISTS
            const groupPromise = groupsData.getGroup(id, newGroup.name)
            return groupPromise.then(group => {
                if (group) {
                    return Promise.reject(errors.GROUP_ALREADY_EXISTS())
                }
                return groupsData.addGroup(id, newGroup)
            })
        })
    }

    // Input: a groupName (String) and a userToken (String).
    // Output: a group or a internal error object.
    function getGroup(userToken, groupName){
        if (typeof groupName !== "string" || groupName.trim() === "")
            return Promise.reject(errors.INVALID_PARAMETER(groupName))

        const userId = usersServices.getUserId(userToken)
        return userId.then(id => {
            if (!id) {
                return Promise.reject(errors.USER_NOT_FOUND())
            }
            const groupPromise = groupsData.getGroup(id, groupName)
            return groupPromise.then(group => {
                if (!group) {
                    return Promise.reject(errors.GROUP_NOT_FOUND())
                }
                return group
            })
        })
    }

    // Input: a groupName (String) and a userToken (String).
    // Output: a confirming message (object) or an internal error object.
    function deleteGroup(userToken, groupName){
        const userId = usersServices.getUserId(userToken)
        return userId.then(id => {
            if (!id) {
                return Promise.reject(errors.USER_NOT_FOUND())
            }
            const groupPromise = groupsData.getGroup(id, groupName)
            return groupPromise.then(group => {
                if (!group) {
                    return Promise.reject(errors.GROUP_NOT_FOUND())
                }
                return groupsData.deleteGroup(id, groupName)
            })
        })
    }

    // Input: a groupName (String), a userToken (String) and a new group object.
    // Output: the updated group or a internal error object.
    function updateGroup(userToken, groupName, updates) {
        if (!isValidUpdate(updates)) {
            return errors.INVALID_UPDATE()
        }
        
        const userId = usersServices.getUserId(userToken)
        return userId.then(id => {
            if (!id) {
                return Promise.reject(errors.USER_NOT_FOUND)
            }
            const groupPromise = groupsData.getGroup(id, groupName)
            return groupPromise.then(group => {
                if (!group) {
                    return Promise.reject(errors.GROUP_NOT_FOUND)
                }
                // TODO: CHECK IF THERE'S ALREADY A GROUP WITH THE NEW NAME
                return groupsData.updateGroup(id, groupName, updates)
            })
        })
    }  

    // Input: a groupName (String), a userToken (String) and a new player object.
    // Output: the updated group with the new player or a internal error object.
    function addPlayerToGroup(userToken, groupName, player){
        if(!isValidPlayer(player)){
            return Promise.reject(errors.INVALID_PLAYER())
        }
        const userId = usersServices.getUserId(userToken)
        return userId.then(id => {
            const groupPromise = groupsData.getGroup(id, groupName)
            return groupPromise.then(group => {
                if (!group) {
                    return Promise.reject(errors.GROUP_NOT_FOUND())
                }
                if (isPlayerInGroup(group, player.playerId)){
                    return Promise.reject(errors.PLAYER_ALREADY_EXISTS(player.playerName))
                }
                if(isSquadFull(group)){
                    return Promise.reject(errors.SQUAD_IS_FULL(groupName))
                }
                return groupsData.addPlayerToGroup(id, groupName, player)
            })
        })
    }

    // Input: a groupName (String), a userToken (String) and a player id (String).
    // Output: a confirming message (object) or an internal error object.
    function removePlayerFromGroup(userToken, groupName, playerId){
        const userId = usersServices.getUserId(userToken)
        return userId.then(id => {
            const groupPromise = groupsData.getGroup(id, groupName)
            return groupPromise.then(group => {
                if (!isPlayerInGroup(group, playerId)){
                    return Promise.reject(errors.PLAYER_NOT_FOUND(playerId))
                }
                return groupsData.removePlayerFromGroup(id, groupName, playerId)
            })
        })
    }

    // Output: All the available competitions.
    async function getCompetitions() {
        return await footballData.getCompetitions()
    }

    // Input: a competitionCode (String) and a season(string)
    // Output: All the teams that participated on the specified competition.
    async function getTeams(competitionCode, season) {
        return await footballData.getTeams(competitionCode, season)
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
  
function isPlayerInGroup(group, playerId){
    const idx = group.players.findIndex(
        p => p.playerId === playerId
    )
    return (idx != -1)
}
  
function isSquadFull(group){
    return (group.players.length >= 11)
}
