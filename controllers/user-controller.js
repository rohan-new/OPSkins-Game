const request = require('request');
const { google } = require('googleapis');
// var TwitchApi = require('twitch-api');
const queryString = require('query-string');
var OAuth = require('oauth');
var Twitter = require('twitter');
const { state } = require('../configuration/config');
const { loginUrl } = require('../configuration/config');
const googleConfig = require('../configuration/google-config');
const twitchConfig = require('../configuration/twitch-config');
const twitterConfig = require('../configuration/twitter-config');
const { usernamePasswordToBase64 } = require('../utility/utils');

const User = require('../models/user');

const oauth2Client = new google.auth.OAuth2(
    googleConfig.client_id,
    googleConfig.secret,
    googleConfig.redirect_url
);

//twitter Oauth
var oauth = new OAuth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    twitterConfig.consumer_key,
    twitterConfig.consumer_secret,
    '1.0',
    'https://virlraffles.com/user/twitter/oauth/callback',
    'HMAC-SHA1'
);

// generate a url that asks permissions for Google+ and Google Calendar scopes

const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: googleConfig.scopes
});


//login Opskins
module.exports.login = (req, res) => {

    res.redirect(`${loginUrl}`
        + 'f10502430a7e' + `&state=${state}&duration=permanent&mobile=1&scope=identity+trades+identity_basic+items&response_type=code`);
}
//post login Opskins
module.exports.postLogin = (req, res) => {
    if (req.query.error) {
        return res.redirect('http://virlraffles.com');
    }
    request({
        headers: {
            'Authorization': 'Basic ' + usernamePasswordToBase64('f10502430a7e', 'ewlfDr8ajKvOS0!hlxg^w7n2UKaI2GWH'),
        },
        'url': 'https://oauth.opskins.com/v1/access_token',
        "formData": {
            "grant_type": "authorization_code",
            "code": req.query.code,
        },
        "method": "POST"
    }, function (err, resp, body) {
        if (err) {
            console.log('error')
            console.log(err);
        }
        console.log('rohan')
        // set the session so we are logged in
        req.session.authentication_data = body;
        console.log('Session Data', req.session.authentication_data);

        if( req.session.authentication_data == undefined){
                return res.redirect(`https://virlraffles.com/`);
        }

        let authentication_data = JSON.parse(req.session.authentication_data);
        // console.log('autg data', authentication_data);
        req.authentication_data = authentication_data;


        request({
            url: 'https://api.opskins.com/IUser/GetProfile/v1/',
            headers: {
                'Authorization': 'Bearer ' + authentication_data.access_token,
            },
            method: 'GET'
        }, function (err, resp, body) {
            if (err) {
                console.log('eroorr---------', err);
                return res.redirect(`https://virlraffles.com/`);
            }

            data = JSON.parse(body);
            // console.log('user data', data);
            console.log('rohan')
            req.session.userDetails = data.response;
            console.log('userdetials --------', req.session.userDetails);
            let name = data.response.username;
            let userId = data.response.id64;
            let email = data.response.email.contact_email;
            var options = { upsert: true, new: true, setDefaultsOnInsert: true };
            query = { opskinsId: userId, name: name, email: email };
            update = {};


            User.findOneAndUpdate(query, update, options, (err, result) => {
                if (err) {
                    console.log('error in saving logged in User info in the users collection');
                }
            });
            req.session.save();
            res.redirect(`https://virlraffles.com/create?name=${data.response.username}`);
        });
    })
}

module.exports.getUserDetails = (req, res) => {
    if (req.session.userDetails == undefined) {
        console.log('not loged in')
        return res.send({
            status: false,
            msg: "Logged Out"
        })

    }
    var data = {
        userId: req.session.userDetails.id,
        username: req.session.userDetails.username,
        imageUrl: req.session.userDetails.avatar
    }

    res.send({
        status: true,
        data: data
    })
}

module.exports.googleLogin = (req, res) => {
    res.redirect(url);
}

module.exports.twitchLogin = (req, res, next) => {
    const url = `https://id.twitch.tv/oauth2/authorize?client_id=${twitchConfig.client_id}&redirect_uri=${twitchConfig.redirectUri}&response_type=code&scope=user:edit+user:read:email+user_read+channel_check_subscription+user_follows_edit+channel_subscriptions+user_subscriptions`;
    res.redirect(url);
}


module.exports.postTwitchLogin = (req, res) => {
    let code = queryString.parseUrl(req.url).query.code;
    console.log('user twotch', code)
    request({
        url: `https://id.twitch.tv/oauth2/token?client_id=${twitchConfig.client_id}&client_secret=${twitchConfig.secret}&code=${code}&grant_type=authorization_code&redirect_uri=${twitchConfig.redirectUri}`,
        method: 'POST'
    }, function (err, resp, body) {
        if (err) console.log(err)
        data = JSON.parse(body);
        console.log('data access', data);
        req.session.twitchSession = data;

        request({
            url: `https://api.twitch.tv/kraken/user`,
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.twitchtv.v5+json',
                'Client-ID': twitchConfig.client_id,
                'Authorization': `OAuth ${req.session.twitchSession.access_token}`
            }
        }, function (err, resp, body) {
            if (err) console.log(err)
            user = JSON.parse(body);
            console.log('data access', user);
            req.session.twitchSession.userId = user._id;
            req.session.twitchSession.username = user.display_name;
            let username =  req.session.userDetails.username;
            res.redirect(`https://virlraffles.com/create?name=${username}`);
        });

    });

}


module.exports.followTwitchUser = (req, res) => {

    let userToFollow = req.query.userToFollow; 
    let access_token = req.query.access_token;
    let userId = req.query.userId;
    let channeIdToFollow ;


    request({
        url: `https://api.twitch.tv/kraken/users?login=${userToFollow}`,
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.twitchtv.v5+json',
            'Client-ID': twitchConfig.client_id,
            // 'Authorization': `OAuth ${access_token}`
        }
    }, function (error, resp, body) {
            if (error){
                console.log('twitch error to fetch username -------------xxxxxxxxxxx', error)
                return res.send({
                    status: false,
                    error: error
                })
            }else{
                data = JSON.parse(body);
                console.log('data after fetching channel info  twitch ------------xxxxxx', data);  // Tweet body.
                console.log('user name twitche= entered ----------------xxxxxx', userToFollow, data.users[0]._id)
                
                // data.users.map((user)=>{
                    // if(user.name == userToFollow){
                        channeIdToFollow = data.users[0]._id;
                        channeIdToFollow = channeIdToFollow.replace(/\'/g, "");
                        console.log('channel ID------------', channeIdToFollow);
                        console.log('data after fetching channel info  twitch ------------xxxxxx', data);  // Tweet body.
                        request({
                            url: `https://api.twitch.tv/kraken/users/${userId}/follows/channels/${channeIdToFollow}`,
                            method: 'PUT',
                            headers: {
                                'Accept': 'application/vnd.twitchtv.v5+json',
                                'Client-ID': twitchConfig.client_id,
                                'Authorization': `OAuth ${access_token}`
                            }
                        }, function (error, resp, body) {
                                if (error){
                                    console.log('twitch error to follow -------------xxxxxxxxxxx', error)
                                    return res.send({
                                        status: false,
                                        error: error
                                    })
                                };
                                data = JSON.parse(body);
                                console.log('data after following twitch user', data);  // Tweet body.
                                return res.send({
                                    status: true,
                                    data: data
                                })
                        });
                    // }
                // })
              

            //end

            }
            
    });
}

module.exports.checkUserFollowedOnTwitch = (req, res) => {
    let userToFollow = req.query.userToFollow;     

    request({
        url: `https://api.twitch.tv/kraken/users/${req.session.twitchSession.userId}/follows/channels/${userToFollow}`,
        method: 'PUT',
        headers: {
            'Accept': 'application/vnd.twitchtv.v5+json',
            'Client-ID': twitchConfig.client_id,
            'Authorization': `OAuth ${req.session.twitchSession.access_token}`
        }
    }, function (err, resp, body) {
        if (err) console.log(err)
        response = JSON.parse(body);
        if(response.error == "Not Found" || response.status == 404){
            return res.send({
                status: false,
                message: "User not following the raffle owner"
            })
        }
        else if(response.channel.partner ){
            return res.send({
                status: true,
                message: "User following the raffle owner"
            })
        } else{
            return res.send({
                status: false,
                message: "Unable to follow the user"
            }) 
        }
    });
}


module.exports.main = async (req, res) => {
    let code = queryString.parseUrl(req.url).query.code;
    var { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens);
    var access_token = tokens.access_token;
    request({
        url: `https://www.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&mine=true&access_token=${access_token}`,
        method: 'GET'
    }, function (err, resp, body) {
        if (err) console.log(err)
        data = JSON.parse(body);
        req.session.youtube_authentication_data = body;
        console.log('id', data.items[0].id);
        console.log('Youtube Auth Data', req.session.youtube_authentication_data);

        let username =  req.session.userDetails.username;
        return res.redirect(`https://virlraffles.com/create?name=${username}`);
    });
}



module.exports.twitterLogin = (req, res) => {
    oauth.getOAuthRequestToken(function (error, oauth_token, oauth_token_secret, results) {
        if (error) {
            console.log(error);
            res.send("Authentication Failed!");
        }
        else {
            req.session.twitterOauth = {
                token: oauth_token,
                token_secret: oauth_token_secret
            };
            console.log(req.session.twiterOauth);
            res.redirect('https://twitter.com/oauth/authenticate?oauth_token=' + oauth_token)
        }
    });
}

module.exports.postTwitterLogin = (req, res) => {

    if (req.session.twitterOauth) {
        req.session.twitterOauth.verifier = req.query.oauth_verifier;
        var oauth_data = req.session.twitterOauth;

        oauth.getOAuthAccessToken(
            oauth_data.token,
            oauth_data.token_secret,
            oauth_data.verifier,
            function (error, oauth_access_token, oauth_access_token_secret, results) {
                if (error) {
                    console.log(error);
                  return  res.send("Authentication Failure!");
                }
                else {
                    req.session.twitterOauth.access_token = oauth_access_token;
                    req.session.twitterOauth.access_token_secret = oauth_access_token_secret;
                    console.log(results, req.session.twitterOauth);
                    let username =  req.session.userDetails.username;
                   return res.redirect(`https://virlraffles.com/create?name=${username}`);
                }
            }
        );
    }
    else {
        request({
            url: `https://virlraffles.com/user/twitter/login`,
            method: 'GET'
        }, function (err, resp, body) {
            if (err) console.log(err)
            
        });

    }
}


module.exports.followTwitterUser = (req, res) => {
    let userToFollow = req.query.userToFollow; 
    let access_token = req.query.access_token;
    let access_token_secret = req.query.access_token_secret;

    var client = new Twitter({
        consumer_key: twitterConfig.consumer_key,
        consumer_secret: twitterConfig.consumer_secret,
        access_token_key: access_token,
        access_token_secret: access_token_secret
    });

    client.post('friendships/create', { screen_name: userToFollow }, function (error, data, response) {
        if (error){
            console.log('twiter error to follow -------------xxxxxxxxxxx', error)
            return res.send({
                status: false,
                error: error
            })
        };
        console.log('data after following twitter user', data);  // Tweet body.
        return res.send({
            status: true,
            data: data
        })
    });
}

module.exports.checkUserFollowedOnTwitter = (req, res) => {
    var client = new Twitter({
        consumer_key: twitterConfig.consumer_key,
        consumer_secret: twitterConfig.consumer_secret,
        access_token_key: req.session.twitterOauth.access_token,
        access_token_secret: req.session.twitterOauth.access_token_secret
    });

    client.get('friendships/lookup', { screen_name: 'DeBruyneKev' }, function (error, data, response) {
        if (error) throw error;
        console.log('data after check twitter user following', data);  // Tweet body.

        if (data[0].connections[0] == "following") {
            console.log('following the user');
            return res.send(data)
        }
        // console.log(response);  // Raw response object.
    });
}
