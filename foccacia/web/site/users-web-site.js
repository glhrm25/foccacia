import { errorToHttp  } from "../errors-to-http-responses.js";
import { errors } from "../../commons/internal-errors.js";

// FUNCTIONS (WEB API):

export default function init(usersServices) {

    // Verify the dependencies:
    if(! usersServices){
        return Promise.reject(errors.INVALID_ARGUMENT('usersServices'));
    }

    return {
        renderLoginPage,
        renderRegisterPage,
        addUser
    };

    // Renders login page 
    function renderLoginPage(req, res){  
        // If user is already authenticated, go to home
        return new Promise((resolve, reject) => {
            if (req.isAuthenticated())
                res.redirect('/');        
            else res.render('login-form-view');
        })
    }

    // Renders register page 
    function renderRegisterPage(req, res){  
        // If user is already authenticated, go to home
        return new Promise((resolve, reject) => {
            res.render('register-form-view');
        })
    }

    function addUser(req, res){
    const username = req.body.username
    const password = req.body.password

    const userPromise = usersServices.addUser(username, password);
    return userPromise.then(user => {
        req.login(user, () => {res.redirect('/') })
    })
  }
}