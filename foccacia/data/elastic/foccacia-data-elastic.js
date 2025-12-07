import { errors } from "../../commons/internal-errors.js";
import { fetchElastic } from './fetch-elastic.js';

// FUNCTIONS (FOCCACIA API with Elasticsearch Database):

class Group {
    constructor(userId, name, description, competition, year) {
        this.name = name;
        this.description = description;
        this.competition = competition;
        this.year = year;
        this.players = [];
        this.userId = userId;
    }
}

function aGroupFromElastic(elasticGroup) {
    //console.log("Elastic:", elasticGroup);
    return joinGroupId(elasticGroup._source, elasticGroup._id);
}

function joinGroupId(group, groupId) {
    return Object.assign({ id: groupId }, group);
}

export default function init() {

    return {
        getGroupsForUser,
        getGroup,
        searchGroups,
        addGroup,
        updateGroup,
        deleteGroup,
        addPlayerToGroup,
        removePlayerFromGroup
    };

    function isValidGroup(group) {
        if (("name" in group) && ("description" in group) && ("competition" in group) && ("year" in group)) {
            const name = group.name.trim() // remove whitespaces
            const description = group.description.trim()
            const competition = group.competition
            const year = group.year
            if (name.length > 0 && description.length > 0 && 
                ("code" in competition) && competition.code.trim().length > 0 &&
                ("name" in competition) && competition.name.trim().length > 0 &&
                !isNaN(Number(year))
            ) return true
        }
        return false
    }
    
    function searchGroups(groups, querySearch) {
        return new Promise((resolve, reject) => { 
            if (! querySearch) resolve(groups)
            const searchedGroups = groups.filter(
                group => ( group.name.includes(querySearch) || group.description.includes(querySearch) )
            )
            resolve(searchedGroups);
        });
    }

    // Returns a Promise of a group
    function getGroup(userId, groupId) {
        return fetchElastic('GET', '/groups/_doc/' + groupId)
            .then(elasticGroup => {
                //console.log(elasticGroup);
                if (elasticGroup.found && elasticGroup._source.userId == userId)
                    return aGroupFromElastic(elasticGroup)
                else
                    return Promise.reject(errors.GROUP_NOT_FOUND(groupId))
            })
    }

    function getGroupsForUser(userId) {
        const filter = {
            query: {
                match: {
                    userId: userId
                }
            }
        }
        return fetchElastic('POST', '/groups/_search', filter)
            .then(resp => {
                if (resp.error) {
                    console.error("Elastic error:", body.error.reason);
                    return []; // There is no index groups: returns an empty list.
                }
                return resp.hits.hits
            })
            .then(groups => groups.map(aGroupFromElastic))
    }

    function addGroup(userId, newGroup) {
        const group = new Group(userId, newGroup.name, newGroup.description, newGroup.competition, newGroup.year)
        return fetchElastic('POST', '/groups/_doc' + '?refresh=wait_for', group)
            .then(body => {
                //console.log(body);
                return (joinGroupId(group, body._id));
            });
    }

    // DELETE GROUP ?????
    function deleteGroup(userId, groupId) {
        return fetchElastic('DELETE', '/groups/_doc/' + groupId + '?refresh=wait_for')
            .then(body => {
                //console.log(body);
                if (body.result != 'not_found')
                    return (joinGroupId({}, body._id));
                else
                    return Promise.reject(errors.GROUP_NOT_FOUND(groupId));
            });
    }

    function updateGroup(userId, groupId, updatedData) {
        return getGroup(userId, groupId).then(group => {
            // Need now to complete the group data, because 
            // elastic-put replaces the resource (Completar o grupo com os dados)
            const newGroup = new Group(userId, updatedData.name, updatedData.description, group.competition, group.year)
            return fetchElastic('PUT', '/groups/_doc/' + groupId + '?refresh=wait_for', newGroup)
                .then(body => {
                    return joinGroupId(newGroup, body._id);
                });
        })
    }

    // TO-DO:
    function addPlayerToGroup(userId, groupId, player) {
        return new Promise((resolve, reject) => {
          const idx = GROUPS.findIndex(
            g => g.userId == userId && g.id == groupId
          )
          const obj = {playerId: player.playerId, playerName: player.playerName, teamId: player.teamId, teamName: player.teamName}
          GROUPS[idx].players.push(obj)
          resolve(obj)
        })
      }
        // TO-DO:
      function removePlayerFromGroup(userId, groupId, playerId){
        return new Promise((resolve, reject) => {
          const groupIdx = GROUPS.findIndex(
            g => g.userId == userId && g.id == groupId
          )
          const playerIdx = GROUPS[groupIdx].players.findIndex(
            p => p.playerId == playerId
          )
          GROUPS[groupIdx].players.splice(playerIdx, 1)
          resolve(GROUPS[groupIdx])
        })
      } 
}