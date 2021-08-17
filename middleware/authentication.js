
module.exports.authentication = (req, res, next)=>{

    if(req.path == '/login' || req.path =='/user/auth/opskins/return'){
        console.log('yes');
        next();
    }else{
     console.log('no');
     // check if we are authenticated
    //  if(!req.session.authentication_data){

    //     // if not, redirect us back
    //     return res.redirect('/user/login');
    // }
     // else, request the data via our auth token
    // let authentication_data = JSON.parse(req.session.authentication_data);
    // req.authentication_data = authentication_data;

    next();
}
}

