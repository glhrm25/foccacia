export default function configurePassport(passport, usersData) {

    passport.serializeUser((userInfo, done) => {
        done(null, userInfo.id); 
    });
    
    passport.deserializeUser((userId, done) => {
        // Find the user in the database
        usersData.getUserById(userId)
            .then(user => {
                const userInfo = {
                    name: user.name,
                    token: user.token
                }
                done(null, userInfo); 
            })
    })
}
  