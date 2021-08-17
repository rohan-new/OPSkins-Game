// this function converts our api key to base64
module.exports.apiKeyToBase64 =(apikey)=>{
    return Buffer.from(apikey + ":", "ascii").toString("base64");
}

//this function converts our 'username' and 'password' to an base64 hash
module.exports.usernamePasswordToBase64 = (username, password)=> {
    return Buffer.from(username + ":" + password, "ascii").toString("base64");
}


module.exports.removeObjArr = (arr, prop, cond)=> {
	for (let i = arr.length - 1; i >= 0; i--) {
		if (arr[i][prop] == cond) {
			arr.splice(i, 1);
		}
	}
	return arr;
}





// function Api(apikey){
//     return Buffer.from(apikey + ":", "ascii").toString("base64");
// }

// app.get('/createClient', (req, res,)=>{

//     request(
//         'https://api.opskins.com/IOAuth/CreateClient/v1/',{
//         'headers': {
//             'Authorization': 'Basic ' + Api('c207c7f8de1a267f4fbca99f6b85f1')
//         },
//         'form':{
//             'name': 'ZEUS_APP1',
//             'redirect_uri': 'http://localhost:5000/user/auth/opskins/return'
//         },
//         'method': 'POST'

//     }, (err,res,body)=>{
//         if(err){
//             console.log(err);
//             process.exit(1);
//         }

//         data = JSON.parse(body);
//         console.log(body)
        

//         if(data.message){
//             console.log(data.message);
//             process.exit(1);
//         }

//         config.client_id = data.response.client.client_id;
//         config.secret = data.response.secret;
//         console.log(config)
//     });
// });
