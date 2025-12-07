import { errors } from '../commons/internal-errors.js';

export default function init(groupsData, footballData, usersServices) {

    // Verify the dependencies:
    if(! usersServices){
        throw errors.INVALID_PARAMETER('usersServices');
    }
    if(! groupsData){
        throw errors.INVALID_PARAMETER('groupsData');
    }
    if(! footballData){
        throw errors.INVALID_PARAMETER('footballData');
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

    // BUG SHOWING PLAYERS ON THE GROUPS (PLAYERS ADDED AFTER A GET GROUP REQUEST DONT HAVE ALL INFORMATION)
    function getAllGroups(userToken, query){
        const userIdPromise = usersServices.getUserId(userToken)
        const groupsPromise = userIdPromise.then(
            id => { return id ? groupsData.getGroupsForUser(id) : Promise.reject(errors.USER_NOT_FOUND()) }
        )
        
        return groupsPromise.then(groups => {
          const queryLen = Object.keys(query).length;
          if (queryLen == 0) { // There is no query string
            return groups;
          }
          if (queryLen == 1 && "search" in query) {
            const querySearch = query["search"];
            const searchedTasks = groupsData.searchGroups(groups, querySearch)
            return(searchedTasks);
          }
          else {
            return Promise.reject(errors.INVALID_QUERY());
          }
        })
    }

    // Input: a new group object.
    // Output: a group or a internal error object.
    function addGroup(userToken, newGroup){
        if (!isValidGroup(newGroup)) return Promise.reject(errors.INVALID_GROUP())
        
        const userId = usersServices.getUserId(userToken);
        return userId.then(id => {
            if(!id) return Promise.reject(errors.USER_NOT_FOUND())
            
            // CHECK IF GROUP ALREADY EXISTS
            const groupPromise = groupsData.getGroup(id, newGroup.name)
            return groupPromise.then(group => {
                if (group)  return Promise.reject(errors.GROUP_ALREADY_EXISTS(newGroup.name))
                
                return groupsData.addGroup(id, newGroup)
            })
        })
    }

    // Input: a groupName (String) and a userToken (String).
    // Output: a group or a internal error object.
    function getGroup(userToken, groupId){
        if (!Number.isInteger(Number(groupId)))
            return Promise.reject(errors.INVALID_PARAMETER(groupId))

        const userId = usersServices.getUserId(userToken)
        return userId.then(id => {
            if (!id) return Promise.reject(errors.USER_NOT_FOUND())
            
            const groupPromise = groupsData.getGroup(id, groupId)
            return groupPromise.then(group => {
                if (!group) return Promise.reject(errors.GROUP_NOT_FOUND(groupId))
                return Promise.all(group.players.map(pl => footballData.getPlayer(pl.playerId, group.year)))
                    .then(players => {
                        const g = { ...group }
                        g.players = players
                        return g
                })
            })
        })
    }

    // Input: a groupName (String) and a userToken (String).
    // Output: the removed group or an internal error object.
    function deleteGroup(userToken, groupId){
        const userId = usersServices.getUserId(userToken)
        return userId.then(id => {
            if (!id) {
                return Promise.reject(errors.USER_NOT_FOUND())
            }
            const groupPromise = groupsData.getGroup(id, groupId)
            return groupPromise.then(group => {
                if (!group) {
                    return Promise.reject(errors.GROUP_NOT_FOUND(groupId))
                }
                return groupsData.deleteGroup(id, groupId)
            })
        })
    }

    // Input: a groupName (String), a userToken (String) and a new group object.
    // Output: the updated group or a internal error object.
    function updateGroup(userToken, groupId, updates) {
        if (!isValidUpdate(updates)) return errors.INVALID_UPDATE()
        
        const userId = usersServices.getUserId(userToken)
        return userId.then(id => {
            if (!id) return Promise.reject(errors.USER_NOT_FOUND)

            const groupPromise = groupsData.getGroup(id, groupId)
            return groupPromise.then(group => {
                if (!group) return Promise.reject(errors.GROUP_NOT_FOUND(groupId))

                // TODO: CHECK IF THERE'S ALREADY A GROUP WITH THE NEW NAME
                return groupsData.updateGroup(id, groupId, updates)
            })
        })
    }  

    // Input: a groupName (String), a userToken (String) and the new player id (string).
    // Output: the added player or an internal error object.
    function addPlayerToGroup(userToken, groupId, playerId){
        const userId = usersServices.getUserId(userToken)
        return userId.then(id => {
            const groupPromise = groupsData.getGroup(id, groupId)
            return groupPromise.then(group => {
                if (!group) return Promise.reject(errors.GROUP_NOT_FOUND(groupId))
            
                if (isPlayerInGroup(group, playerId)) return Promise.reject(errors.PLAYER_ALREADY_EXISTS(playerId))
                
                if(isSquadFull(group)) return Promise.reject(errors.SQUAD_IS_FULL(groupId))
                
                return footballData.getPlayer(playerId, group.year).then(pl => {
                    return groupsData.addPlayerToGroup(id, groupId, pl)
                })
            })
        })
    }

    // Input: a groupName (String), a userToken (String) and a player id (String).
    // Output: the updated group without the corresponding player or an internal error object.
    function removePlayerFromGroup(userToken, groupId, playerId){
        const userId = usersServices.getUserId(userToken)
        return userId.then(id => {
            const groupPromise = groupsData.getGroup(id, groupId)
            return groupPromise.then(group => {
                if (!group) return Promise.reject(errors.GROUP_NOT_FOUND(groupId))
                
                if (!isPlayerInGroup(group, playerId)) return Promise.reject(errors.PLAYER_NOT_FOUND(playerId))
    
                return groupsData.removePlayerFromGroup(id, groupId, playerId)
            })
        })
    }

    // Output: All the available competitions.
    function getCompetitions(query) {
        return footballData.getCompetitions().then(output => {
            const comps = output.competitions.map(comp => ({ name: comp.name, code: comp.code }))
            const queryLen = Object.keys(query).length;
            if (queryLen == 0) { // There is no query string
                return comps;
            }
            if (queryLen == 1 && "competition" in query) {
                const querySearch = query["competition"];
                const searchedGroups = footballData.searchCompetitionByCode(comps, querySearch)
                return(searchedGroups);
            }
            else {
                return Promise.reject(errors.INVALID_QUERY());
            }
        })
    }

    // Input: a competitionCode (String) and a season (String)
    // Output: All teams that participated on the specified competition.
    function getTeams(competitionCode, season) {
        return footballData.getTeams(competitionCode, season).then(output => {
            console.log(output)
            return output.teams.map(t => (
                {
                    name: t.name, 
                    country: t.area.name, 
                    squad: t.squad.map(p => ({name: p.name, position: p.position}))
                })
            )
        })
    }
}

//  OTHER AUXILIAR FUNCTIONS:

function isValidGroup(group) {
    return (
        group && 
        (typeof group.name === "string") && (group.name.trim() !== "") &&
        (typeof group.description === "string") && (group.description.trim() !== "") &&
        group.competition && (typeof group.competition === "object") &&
        (group.competition.code.trim() !== "") &&
        (group.competition.name.trim() !== "") &&
        group.year && (!isNaN(Number(group.year)))
    )
}
  
function isValidUpdate(update){
    return (
        update && (typeof update === "object") && 
        (typeof update.name === "string") && (update.name.trim() !== "") &&
        (typeof update.description === "string") && (update.description.trim() !== "")
    )
}
  
function isPlayerInGroup(group, playerId){
    const idx = group.players.findIndex(
        p => p.playerId == playerId
    )
    return (idx != -1)
}
  
function isSquadFull(group){
    return (group.players.length >= 11)
}
