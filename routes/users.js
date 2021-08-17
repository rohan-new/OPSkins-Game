
let router = (packages) => {
    let apiRoutes = packages.express.Router();
    let { login, postLogin, getUserDetails, googleLogin, twitchLogin, postTwitchLogin, main, twitterLogin, postTwitterLogin, followTwitterUser, checkUserFollowedOnTwitter, followTwitchUser, checkUserFollowedOnTwitch  } = require('../controllers/user-controller');
    let { authentication, passport } = require('../middleware/authentication');
  
    // apiRoutes.use(authentication);
    // apiRoutes.use(checkAccessLevel);
    
  
    apiRoutes.route('/login')
      .get(login);

    apiRoutes.route('/auth/opskins/return')
      .get(postLogin);
      
    apiRoutes.route('/info')
      .get(getUserDetails);
  
    apiRoutes.route('/google/login')
      .get(googleLogin);

    apiRoutes.route('/twitch/login')
      .get(twitchLogin);

    apiRoutes.route('/twitch/main')
      .get(postTwitchLogin);

    apiRoutes.route('/main')
      .get(main);

    apiRoutes.route('/twitter/login')
       .get(twitterLogin);

    apiRoutes.route('/twitter/oauth/callback')
       .get(postTwitterLogin);

    apiRoutes.route('/follow/twitter')
       .get(followTwitterUser);

    apiRoutes.route('/check/twitter/following')
       .get(checkUserFollowedOnTwitter);

    apiRoutes.route('/follow/twitch')
      .get(followTwitchUser);

    apiRoutes.route('/check/twitch/following')
       .get(checkUserFollowedOnTwitch);

    return apiRoutes;
  }
  
  module.exports = router;