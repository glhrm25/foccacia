export default function init() {
    // Groups stored by: userId -> { groupName -> groupObject }
    const GROUPS = [];
  
    function Group(userId, title, description, competition, year){
      Group.counter = Group.counter === undefined ? 
                     GROUPS.length + 1 : Group.counter + 1;
      this.id = Group.counter;
      this.title = title;
      this.description = description;
      this.competition = competition
      this.year = year
      this.players = []
      this.userId = userId
    }

    return {
      getGroupsForUser,
      getGroup,
      addGroup,
      updateGroup,
      deleteGroup,
      addPlayerToGroup,
      removePlayerFromGroup
    };
    
    function getGroupsForUser(userId) {
      return new Promise((resolve, reject) => {
        const userGroups = GROUPS.filter(group => group.userId == userId)
        resolve(userGroups)
      })
    }
  
    function getGroup(userId, groupName) {
      return new Promise((resolve, reject) => {
        const group = GROUPS.find(
          group => group.name == groupName && group.userId == userId
        );
        resolve(group);
      });
    }    
  
    function addGroup(userId, newGroup) {
      console.log("DATA")
      return new Promise((resolve, reject) => {
        const group = new Group(userId, newGroup.title, newGroup.description, newGroup.competition, newGroup.year);
        GROUPS.push(group);
        console.log(group)
        resolve(group);
      })
    }
  
    function updateGroup(userId, groupName, updatedData) {
      const group = GROUPS[userId][groupName];
      delete GROUPS[userId][groupName] // Delete old group

      group.description = updatedData.description
      const newName = updatedData.name.toUpperCase()
      group.name = newName
      GROUPS[userId][newName] = group // Adds new group with the updates

      return group;
    }
  
    function deleteGroup(userId, groupName) {
      delete GROUPS[userId][groupName];
      return {message: "Group successfully deleted"};
    }

    function addPlayerToGroup(userId, groupName, player) {
      const group = GROUPS[userId][groupName]
  
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
      const g = GROUPS[userId][groupName].players
      const idx = g.findIndex(
        p => p.playerId === playerId
      )
      GROUPS[userId][groupName].players.splice(idx, 1)
      return {message: "Player successfully removed"};
    }  
}

function processError(error){
  console.error(error.message)
  process.exit(1)
}
  