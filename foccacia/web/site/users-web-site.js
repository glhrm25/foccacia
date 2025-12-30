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
        addUser,
        login,
        authenticate
    };

    // Renders login page 
    function renderLoginPage(req, res){  
        return new Promise((resolve, reject) => {
            if (req.isAuthenticated())
                res.redirect('/');      // If user is already authenticated, go to home
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

    function login(req, res, next){
        const username = req.body.username; 
        const password = req.body.password;

        const userPromise = usersServices.getUser(username, password)
        return userPromise.then(user => {
            req.login(user, loginAction)
        })	

        function loginAction(err){
            if (err) return next(err);
            return res.redirect('/');
        }
    }

    function authenticate(req, res, next){
        return new Promise((resolve, reject) => {
            if (req.isAuthenticated()){
                next();
                return
            }
                
            else return reject(errors.NOT_AUTHORIZED())
        })
    }
}