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
    }

    function searchGroups(groups, querySearch) {
        return new Promise((resolve, reject) => {
            if (!querySearch) resolve(groups)
            const searchedGroups = groups.filter(
                group => (group.name.includes(querySearch) || group.description.includes(querySearch))
            )
            resolve(searchedGroups);
        });
    }

    // Returns a Promise of a group
    function getGroup(userId, groupId) {
        return fetchElastic('GET', '/groups/_doc/' + groupId)
            .then(elasticGroup => {
                if (elasticGroup.found && elasticGroup._source.userId == userId) // If necessário ????
                    return aGroupFromElastic(elasticGroup)
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
                    //console.error("Elastic error:", body.error.reason);
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
                return (joinGroupId(group, body._id));
            });
    }

    function deleteGroup(userId, groupId) {
        return fetchElastic('DELETE', '/groups/_doc/' + groupId + '?refresh=wait_for')
            .then(body => {
                if (body.result != 'not_found')
                    return (joinGroupId({}, body._id));
            });
    }

    function updateGroup(userId, groupId, updatedData) {
        return getGroup(userId, groupId).then(group => {
            // Now need to complete the group data, because 
            // elastic-put replaces the resource (Completar o grupo com os dados)
            const newGroup = new Group(userId, updatedData.name, updatedData.description, group.competition, group.year)
            return fetchElastic('PUT', '/groups/_doc/' + groupId + '?refresh=wait_for', newGroup)
                .then(body => {
                    return joinGroupId(newGroup, body._id);
                });
        })
    }

    function addPlayerToGroup(userId, groupId, player) {
        const obj = { playerId: player.playerId, playerName: player.playerName, teamId: player.teamId, teamName: player.teamName }
        return getGroup(userId, groupId).then(group => {
            group.players.push(obj)
            return fetchElastic('PUT', '/groups/_doc/' + groupId + '?refresh=wait_for', group)
                .then(body => {
                    return (joinGroupId(group, body._id))
                }); // REPETIÇÃO DE CÓDIGO
        })
    }
    
    function removePlayerFromGroup(userId, groupId, playerId) {
        return getGroup(userId, groupId).then(group => {
            const playerIdx = group.players.findIndex(
                p => p.playerId == playerId
            )
            group.players.splice(playerIdx, 1)
            return fetchElastic('PUT', '/groups/_doc/' + groupId + '?refresh=wait_for', group)
                .then(body => {
                    return (joinGroupId(group, body._id));
                });
        })
    }
}