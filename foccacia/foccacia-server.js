import express from 'express';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
// Import all modules for Dependency Injection:
import groupsApiInit from './web/api/foccacia-web-api.js';
import usersApiInit from './web/api/users-web-api.js';

//import groupsServicesInit from './services/mock-foccacia-services.js';
import groupsServicesInit from './services/foccacia-services.js';
import usersServicesInit from './services/users-services.js';

//import groupsDataInit from './data/mock-foccacia-data-mem.js';
import usersDataInit from './data/mock-users-data-mem.js';
import groupsDataInit from './data/foccacia-data-mem.js';
//import usersDataInit from './data/users-data-mem.js';
import fapiTeamsData from './data/fapi-teams-data.js';

const PORT = 8000;  // Port number for the tests

let groupsAPI;
let usersAPI;

// Dependency Injection:
try {
  const groupsData = groupsDataInit();
  const usersData = usersDataInit();
  const fapiData = fapiTeamsData()

  const usersServices = usersServicesInit(usersData);
  const groupsServices = groupsServicesInit(groupsData, fapiData, usersServices);

  groupsAPI = groupsApiInit(groupsServices);
  usersAPI = usersApiInit(usersServices);
}
catch (err) {
  console.error(err);
}

const app = express(); // Express function returns an app

// Swagger UI for the yaml documentation (OpenAPI):
const swaggerDocument = yaml.load('./docs/foccacia-api.yaml');
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Parser the body to JSON
app.use(express.json());

// USERS
// add user
app.post("/users", usersAPI.addUser);

// COMPETITIONS
app.get("/competitions", groupsAPI.getCompetitions);

// TEAMS
app.get("/competitions/:competitionCode/season/:season/teams", groupsAPI.getTeams);

// GROUPS
// get group by id
app.get("/groups/:groupName", groupsAPI.getGroup);

// list groups
app.get("/groups", groupsAPI.getAllGroups);

// create group
app.post("/groups", groupsAPI.addGroup);

// delete group by id
app.delete("/groups/:groupName", groupsAPI.deleteGroup);

// update group by name
app.put("/groups/:groupName", groupsAPI.updateGroup);

// add players to group
app.post("/groups/:groupName/players/:playerId", groupsAPI.addPlayerToGroup)

// delete player from group
app.delete("/groups/:groupName/players/:playerId", groupsAPI.removePlayerFromGroup)

// App listening...
app.listen(PORT, () =>
  console.log(`App listening on port ${PORT}!`),
);