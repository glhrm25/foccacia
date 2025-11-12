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
          group => group.name == groupName && group.userId == userId
        );
        resolve(group);
      });
    }    
  
    function addGroup(userId, newGroup) {
      return new Promise((resolve, reject) => {
        const group = new Group(userId, newGroup.name, newGroup.description, newGroup.competition, newGroup.year);
        GROUPS.push(group)
        resolve(group);
      })
    }
  
    function updateGroup(userId, groupName, updatedData) {
      return new Promise((resolve, reject) => {
        const groupIndex = GROUPS.findIndex(
          group => (group.name == groupName && group.userId == userId)
        )
        GROUPS[groupIndex].name = updatedData.name
        GROUPS[groupIndex].description = updatedData.description
        resolve(GROUPS[groupIndex])
     });
    }
  
    function deleteGroup(userId, groupName) {
      return new Promise((resolve, reject) => {
        const idx = GROUPS.findIndex(
          g => g.userId == userId && g.name == groupName
        )
        const group = GROUPS[idx]
        GROUPS.splice(idx, 1)
        resolve(group)
      })
    }

    function addPlayerToGroup(userId, groupName, player) {
      return new Promise((resolve, reject) => {
        const idx = GROUPS.findIndex(
          g => g.userId == userId && g.name == groupName
        )
        GROUPS[idx].players.push(player)
        resolve(GROUPS[idx])
      })
    }
  
    function removePlayerFromGroup(userId, groupName, playerId){
      return new Promise((resolve, reject) => {
        const groupIdx = GROUPS.findIndex(
          g => g.userId == userId && g.name == groupName
        )
        const playerIdx = GROUPS[groupIdx].players.findIndex(
          p => p.playerId == playerId
        )
        GROUPS[groupIdx].players.splice(playerIdx, 1)
        resolve(GROUPS[groupIdx])
      })
    }  
} 