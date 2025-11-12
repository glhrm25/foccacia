export default function init() {
    const GROUPS = [];
  
    function Group(userId, name, description, competition, year){
      Group.counter = Group.counter === undefined ? 
                     GROUPS.length + 1 : Group.counter + 1;
      this.id = Group.counter;
      this.name = name;
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
          group => group.name == groupName.toUpperCase() && group.userId == userId
        );
        resolve(group);
      });
    }    
  
    function addGroup(userId, newGroup) {
      return new Promise((resolve, reject) => {
        const group = new Group(userId, newGroup.name.toUpperCase(), newGroup.description, newGroup.competition, newGroup.year);
        GROUPS.push(group)
        resolve(group);
      })
    }
  
    function updateGroup(userId, groupName, updatedData) {
      return new Promise((resolve, reject) => {
        const groupIndex = GROUPS.findIndex(
          group => (group.name == groupName.toUpperCase() && group.userId == userId)
        )
        GROUPS[groupIndex].name = updatedData.name.toUpperCase()
        GROUPS[groupIndex].description = updatedData.description
        resolve(GROUPS[groupIndex])
     });
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