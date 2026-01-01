import express from 'express'
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'
import cors from 'cors'
import hbs from 'hbs';
import path from 'path';
import url from 'url';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import configurePassport from './commons/passport-config.js';

// Import all modules for Dependency Injection:
import groupsSiteInit from './web/site/foccacia-web-site.js';
import usersSiteInit from './web/site/users-web-site.js'
import groupsApiInit from './web/api/foccacia-web-api.js';
import usersApiInit from './web/api/users-web-api.js';

import groupsServicesInit from './services/foccacia-services.js';
import usersServicesInit from './services/users-services.js';

import groupsDataInit from './data/elastic/foccacia-data-elastic.js'
//import groupsDataInit from './data/mem/foccacia-data-mem.js';
//import groupsDataInit from './data/mock/mock-foccacia-data-mem.js';
import usersDataInit from './data/elastic/users-data-elastic.js';
//import usersDataInit from './data/mock/mock-users-data-mem.js';
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
let usersSite

// Dependency Injection:
//try {
  const groupsData = groupsDataInit()
  const usersData = usersDataInit()
  const fapiData = fapiTeamsData()

  const usersServices = usersServicesInit(usersData)
  const groupsServices = groupsServicesInit(groupsData, fapiData, usersServices)


  groupsAPI = groupsApiInit(groupsServices)
  usersAPI = usersApiInit(usersServices)
  groupsSite = groupsSiteInit(groupsServices)
  usersSite = usersSiteInit(usersServices)
  /*
}
catch (err) {
  console.error(err);
}*/

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

  configurePassport(passport, usersData)

  const sessionHandler = session({
    secret: 'isel-ipw-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 *1000 }
  })

  app.use(sessionHandler)
  app.use(passport.session());    // Support login sessions in passport
  app.use(cookieParser());

  app.use((req, res, next) => { // Todas as respostas têm informação sobre o nome do utilizar, caso este tenha feito login
    res.locals.userLoggedIn = !!req.user
    res.locals.username = req.user ? req.user.name : null
    next()
  })

  // Parser the body to URL-encoded (forms in HTML)
  // 'extended: true' means that the value can be of any type.
  app.use(express.urlencoded({ extended: true })); // (Lê dados enviados por formulários HTML (formulários tradicionais))

  // Parser the body to JSON
  app.use(express.json()); // (Lê o corpo dos pedidos JSON e coloca-o em req.body)

  // USERS
  // add user
  app.post("/users", usersAPI.addUser);
  // User registration
  app.get("/site/register", usersSite.renderRegisterPage)
  app.post("/site/register", usersSite.addUser)
  // User login
  app.get("/site/login", usersSite.renderLoginPage)
  app.post("/site/login", usersSite.login)
  // User logout
  app.post('/site/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/') // Redirects to home page
    })
  })
  
  // Home Page
  app.get("/", (req, res) => {res.render("home-view")} );

  // COMPETITIONS
  app.get("/competitions", usersSite.authenticate, groupsAPI.getCompetitions);
  app.get("/site/competitions", usersSite.authenticate, groupsSite.getCompetitions);

  // TEAMS
  app.get("/competitions/:competitionCode/season/:season/teams", groupsAPI.getTeams);
  app.get("/site/competitions/:competitionCode/season/:season/teams", groupsSite.getTeams);

  // GROUPS
  // get group by id
  app.get("/groups/:groupId", usersSite.authenticate, groupsAPI.getGroup);
  app.get("/site/groups/:groupId", usersSite.authenticate, groupsSite.getGroup);

  // list groups
  app.get("/groups", usersSite.authenticate, groupsAPI.getAllGroups);
  app.get("/site/groups", usersSite.authenticate, groupsSite.getAllGroups);

  // create group
  app.post("/groups", usersSite.authenticate, groupsAPI.addGroup)
  app.get("/site/groupForm", usersSite.authenticate, groupsSite.renderGroupFormPage)
  app.post("/site/groups", usersSite.authenticate, groupsSite.addGroup)

  // delete group by id
  app.delete("/groups/:groupId", usersSite.authenticate, groupsAPI.deleteGroup);
  app.delete("/site/groups/:groupId", usersSite.authenticate, groupsSite.deleteGroup)

  // update group by name
  app.put("/groups/:groupId", usersSite.authenticate, groupsAPI.updateGroup);
  app.get("/site/groups/:groupId/updateForm", usersSite.authenticate, groupsSite.renderUpdatePage)
  /* -> THE ROUTE BELOW IS NOT ALLOWED IN THE MOST RECENT VERSION OF EXPRESS
  * -> TO FIX THIS, WE CREATE TWO SEPARATE ROUTES, ONE WITH THE GROUPID AND ONE WITHOUT THE GROUPID
  */
  //app.put("/site/groups/:groupId?", usersSite.authenticate, groupsSite.updateGroup); // ? is not allowed
  app.put("/site/groups/:groupId", usersSite.authenticate, groupsSite.updateGroup); // Two separate routes
  app.put("/site/groups", usersSite.authenticate, groupsSite.updateGroup);

  // add players to group
  app.post("/groups/:groupId/players", usersSite.authenticate, groupsAPI.addPlayerToGroup)
  app.post("/site/groups/:groupId/players", usersSite.authenticate, groupsSite.addPlayerToGroup)

  // delete player from group
  app.delete("/groups/:groupId/players/:playerId", usersSite.authenticate, groupsAPI.removePlayerFromGroup)
  //app.post("/site/groups/:groupId/players/:playerId/delete", usersSite.authenticate, groupsSite.removePlayerFromGroup); // non-Rest
  app.delete("/site/groups/:groupId/players/:playerId", usersSite.authenticate, groupsSite.removePlayerFromGroup)

  // Handling all errors
  app.use("/site", groupsSite.errorHandler);
  app.use("/groups", groupsAPI.errorHandler);

  // App listening...
  app.listen(PORT, () =>
    console.log(`App listening on port ${PORT}!`),
  )
}