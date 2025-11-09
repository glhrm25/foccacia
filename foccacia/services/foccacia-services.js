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
        if (!groupsData.isValidGroup(newGroup)){
            return errors.INVALID_GROUP();
        }
        /*
        const userId = usersServices.getUserId(userToken);
        const group = groupsData.getGroup(userId, newGroup.name.toUpperCase());
        if (group) {
            return errors.GROUP_ALREADY_EXISTS(group.name);
        }
        */
        const g = getIdAndGroup(userToken, newGroup)
        if (g.group)
            return errors.GROUP_ALREADY_EXISTS(group.name);
        
        
        return groupsData.addGroup(g.userId, newGroup)
    }

    // Input: a groupName (String) and a userToken (String).
    // Output: a group or a internal error object.
    function getGroup(userToken, groupName){
        if (typeof groupName !== "string" || groupName.trim() === "") {
            return errors.INVALID_PARAMETER(groupName);
        }
        /*
        const userId = usersServices.getUserId(userToken);
        const group = groupsData.getGroup(userId, groupName);
        if (!group) {
            return errors.GROUP_NOT_FOUND(groupName);
        }*/
        const g = checkGroup(userToken, groupName)
        if (g.internalError) return g
        return g.group
    }

    // Input: a groupName (String) and a userToken (String).
    // Output: a confirming message (object) or an internal error object.
    function deleteGroup(userToken, groupName){
        /*
        const userId = usersServices.getUserId(userToken);
        const group = groupsData.getGroup(userId, groupName);
        if (!group) {
            return errors.GROUP_NOT_FOUND(groupName);
        }*/
        const g = checkGroup(userToken, groupName)
        if (g.internalError) return g
        return (groupsData.deleteGroup(g.id, groupName));
    }

    // Input: a groupName (String), a userToken (String) and a new group object.
    // Output: the updated group or a internal error object.
    function updateGroup(userToken, groupName, updates){
        
        if (! groupsData.isValidUpdate(updates))
            return errors.INVALID_UPDATE();
        /*
        const userId = usersServices.getUserId(userToken);
        const group = groupsData.getGroup(userId, groupName);
        if (!group) 
            return errors.GROUP_NOT_FOUND(groupName);
        */
        const g = checkGroup(userToken, groupName)
        if (g.internalError) return g
        return(groupsData.updateGroup(g.id, groupName, updates));
    }

    // Input: a groupName (String), a userToken (String) and a new player object.
    // Output: the updated group with the new player or a internal error object.
    function addPlayerToGroup(userToken, groupName, player){
        if(! groupsData.isValidPlayer(player)){
            return errors.INVALID_PLAYER()
        }

        /*
        const group = getGroup(userToken, groupName)
        if (group.internalError) return group

        const userId = usersServices.getUserId(userToken)
        */
        const g = checkGroup(userToken, groupName)
        if (g.internalError) return g
        
        if (groupsData.isPlayerInGroup(g.id, groupName, player.playerId)){
            return errors.PLAYER_ALREADY_EXISTS(player.playerName)
        }

        if(groupsData.isSquadFull(g.id, groupName)){
            return errors.SQUAD_IS_FULL(groupName)
        }
        return groupsData.addPlayerToGroup(g.id, groupName, player)
    }

    // Input: a groupName (String), a userToken (String) and a player id (String).
    // Output: a confirming message (object) or an internal error object.
    function removePlayerFromGroup(userToken, groupName, playerId){
        const group = getGroup(userToken, groupName)
        if (group.internalError) return group

        const userId = usersServices.getUserId(userToken)
        if (!groupsData.isPlayerInGroup(userId, groupName, playerId)){
            return errors.PLAYER_NOT_FOUND(playerId)
        }
        return groupsData.removePlayerFromGroup(userId, groupName, playerId)
    }

    // Output: All the available competitions.
    async function getCompetitions() {
        const output = await groupsData.getCompetitions() 
        //return groupsData.getCompetitions();
        console.log(output)
        return output
    }

    // Input: a competitionCode (String) and a season(string)
    // Output: All the teams that participated on the specified competition.
    function getTeams(competitionCode, season) {
        return groupsData.getTeams(competitionCode, season);
    }
    
    // Auxiliary functions: Check if user has already created a group with groupName
    // Returns group if it exists, else, throws Internal Server Error
    function checkGroup(userToken, groupName){
        const r = getIdAndGroup(userToken, groupName)
        if (!r.group) {
            return errors.GROUP_NOT_FOUND(groupName);
        }
        return r
    }

    // Auxiliary functions: gets userId by it's token and returns a object with the id and the group with groupName (Or undefined if group does not exist).
    function getIdAndGroup(userToken, groupName){
        const userId = usersServices.getUserId(userToken)
        const group = groupsData.getGroup(userId, groupName)
        return {id: userId, group: group}
    }
}