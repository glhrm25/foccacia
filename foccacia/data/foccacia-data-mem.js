var requestOptions = {
    method: `GET`,
    headers: {'X-Auth-Token': process.env.key}
}

export default function init() {
    // Groups stored by: userId -> { groupName -> groupObject }
    const groups = {};
  
    return {
      //getCompetitions,
      //getTeams,
      getGroupsForUser,
      getGroup,
      addGroup,
      updateGroup,
      deleteGroup,
      addPlayerToGroup,
      removePlayerFromGroup
    };
    /*
    // TO-DO:
    // MOVE THIS FUNCTIONS TO FAPI-TEAMS-DATA.JS
    async function getObjApi(options){
        try {
            // Returns the api's response if possible
            return (await fetch(`https://api.football-data.org/v4/${options}`, requestOptions)).json()
        }
        catch(error) {
            // Else, shows error
            processError(error)
        }
    }
    
    async function getCompetitions(){
        return await getObjApi("competitions/")
    }
  
    async function getTeams(competitionCode, season){
        return await getObjApi(`competitions/${competitionCode}/teams?season=${season}`)
    }
  */
    function getGroupsForUser(userId) {
      const g = groups[userId]
      return g ? Object.values(g) : {}
    }
  
    function getGroup(userId, groupName) {
      return groups[userId]?.[groupName]
    }    
  
    function addGroup(userId, groupData) {
      groups[userId] = groups[userId] || {}; // Initializes the group as an empty object if it's the user's first time creating a group

      const newGroup = {
        name: groupData.name.toUpperCase(),
        description: groupData.description,
        competition: groupData.competition,
        year: groupData.year,
        players: []
      };
  
      groups[userId][newGroup.name] = newGroup; // Adds the new group
      return newGroup;
    }
  
    function updateGroup(userId, groupName, updatedData) {
      const group = groups[userId][groupName];
      delete groups[userId][groupName] // Delete old group

      group.description = updatedData.description
      const newName = updatedData.name.toUpperCase()
      group.name = newName
      groups[userId][newName] = group // Adds new group with the updates

      return group;
    }
  
    function deleteGroup(userId, groupName) {
      delete groups[userId][groupName];
      return {message: "Group successfully deleted"};
    }

    function addPlayerToGroup(userId, groupName, player) {
      const group = groups[userId][groupName]
  
      group.players.push({
        playerId: player.playerId,
        playerName: player.playerName,
        teamCode: player.teamCode,
        teamName: player.teamName,
        position: player.position,
        nationality: player.nationality,
        age: player.age
      });
  
      return group;
    }
  
    function removePlayerFromGroup(userId, groupName, playerId){
      const g = groups[userId][groupName].players
      const idx = g.findIndex(
        p => p.playerId === playerId
      )
      groups[userId][groupName].players.splice(idx, 1)
      return {message: "Player successfully removed"};
    }  
}

function processError(error){
  console.error(error.message)
  process.exit(1)
}
  