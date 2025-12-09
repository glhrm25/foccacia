import express from 'express'
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'
import cors from 'cors'
import hbs from 'hbs';
import path from 'path';
import url from 'url';

// Import all modules for Dependency Injection:
import groupsSiteInit from './web/site/foccacia-web-site.js';
import groupsApiInit from './web/api/foccacia-web-api.js';
import usersApiInit from './web/api/users-web-api.js';

import groupsServicesInit from './services/foccacia-services.js';
import usersServicesInit from './services/users-services.js';

import groupsDataInit from './data/elastic/foccacia-data-elastic.js'
//import groupsDataInit from './data/mem/foccacia-data-mem.js';
//import groupsDataInit from './data/mock/mock-foccacia-data-mem.js';
//import usersDataInit from './data/elastic/users-data-elastic.js';
import usersDataInit from './data/mock/mock-users-data-mem.js';
//import usersDataInit from './data/mem/users-data-mem.js';
import fapiTeamsData from './data/elastic/fapi-teams-elastic.js'
//import fapiTeamsData from './data/mem/fapi-teams-data.js';

const PORT = 8000;  // Port number for the tests

const CURRENT_DIR = url.fileURLToPath(new URL('.', import.meta.url));
const PATH_PUBLIC = path.join(CURRENT_DIR, 'web', 'site', 'public');
const PATH_VIEWS = path.join(CURRENT_DIR, 'web', 'site', 'views');
const PATH_PARTIALS = path.join(PATH_VIEWS, 'partials');

let groupsAPI;
let usersAPI;
let groupsSite;

// Dependency Injection:
try {
  const groupsData = groupsDataInit()
  const usersData = usersDataInit()
  const fapiData = fapiTeamsData()

  const usersServices = usersServicesInit(usersData)
  const groupsServices = groupsServicesInit(groupsData, fapiData, usersServices)


  groupsAPI = groupsApiInit(groupsServices)
  usersAPI = usersApiInit(usersServices)
  groupsSite = groupsSiteInit(groupsServices)
}
catch (err) {
  console.error(err);
}

if(groupsAPI && usersAPI && groupsSite) {
  const app = express(); // Express function returns an app

  // Swagger UI for the yaml documentation (OpenAPI):
  const swaggerDocument = yaml.load('./docs/foccacia-api.yaml');
  app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Serves static files (local images, CSS, JS, ...)
  app.use(express.static(PATH_PUBLIC)); // (Serve ficheiros estáticos (CSS, imagens, JS, etc) -> Se tiver public/style.css, posso aceder via: http://localhost:8000/style.css)

  // View path
  app.set('views', PATH_VIEWS);

  // View engine
  app.set('view engine', 'hbs');

  // Handlebars partials
  hbs.registerPartials(PATH_PARTIALS);

  // Bootstrap
  // Needs to install bootstrap: npm install bootstrap
  app.use('/', express.static(CURRENT_DIR + '/node_modules/bootstrap/dist/'));

  // Enable all CORS requests
  app.use(cors());

  // Parser the body to URL-encoded (forms in HTML)
  // 'extended: true' means that the value can be of any type.
  app.use(express.urlencoded({ extended: true })); // (Lê dados enviados por formulários HTML (formulários tradicionais))

  // Parser the body to JSON
  app.use(express.json()); // (Lê o corpo dos pedidos JSON e coloca-o em req.body)

  // USERS
  // add user
  app.post("/users", usersAPI.addUser);
  // TODO: implement web site to register an user (with passport module).
  // app.post("/site/users", usersSite.addUser); ??

  app.get("/", groupsSite.renderHomePage);

  // COMPETITIONS
  app.get("/competitions", groupsAPI.getCompetitions);
  app.get("/site/competitions", groupsSite.getCompetitions);

  // TEAMS
  app.get("/competitions/:competitionCode/season/:season/teams", groupsAPI.getTeams);
  app.get("/site/competitions/:competitionCode/season/:season/teams", groupsSite.getTeams);

  // GROUPS
  // get group by id
  app.get("/groups/:groupId", groupsAPI.getGroup);
  app.get("/site/groups/:groupId", groupsSite.getGroup);

  // list groups
  app.get("/groups", groupsAPI.getAllGroups);
  app.get("/site/groups", groupsSite.getAllGroups);

  // create group
  app.post("/groups", groupsAPI.addGroup);
  app.post("/site/groups", groupsSite.addGroup);
  app.get("/site/groupForm", groupsSite.renderGroupFormPage)

  // delete group by id
  app.delete("/groups/:groupId", groupsAPI.deleteGroup); // ? À FRENTE DO GROUPID ?????
  app.post("/site/groups/:groupId/delete", groupsSite.deleteGroup);

  // update group by name
  app.put("/groups/:groupId", groupsAPI.updateGroup);
  app.post("/site/groups/:groupId/update", groupsSite.updateGroup);
  app.get("/site/groups/:groupId/updateForm", groupsSite.renderUpdatePage)

  // add players to group
  app.post("/groups/:groupId/players", groupsAPI.addPlayerToGroup)
  app.post("/site/groups/:groupId/players", groupsSite.addPlayerToGroup)

  // delete player from group
  app.delete("/groups/:groupId/players/:playerId", groupsAPI.removePlayerFromGroup)
  app.post("/site/groups/:groupId/players/:playerId/delete", groupsSite.removePlayerFromGroup);

  // Handling all errors
  app.use("/site", groupsSite.errorHandler);
  app.use("/groups", groupsAPI.errorHandler);

  // App listening...
  app.listen(PORT, () =>
    console.log(`App listening on port ${PORT}!`),
  )
}