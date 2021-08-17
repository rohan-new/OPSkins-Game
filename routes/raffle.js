
let router = (packages) => {
    let apiRoutes = packages.express.Router();
    let {  getRafflesList, getCompletedRafflesCountInADay, sortByExpensiveRaffles, updateRequiredMembers , getRafflesDetails, joinRaffle, topRafflesWins, getCompletedRafflesList, mostRecentRaffles, mostRecentCompletedRaffles, sortByExpensiveCompletedRaffles} = require('../controllers/raffle-controller');
    // let { authentication } = require('../middleware/authentication');
  
    // apiRoutes.use(authentication);
    // apiRoutes.use(checkAccessLevel);
  
    apiRoutes.route('/list')
      .get(getRafflesList);

    apiRoutes.route('/list/recent')
      .get(mostRecentRaffles);


    apiRoutes.route('/list/expensive')
    .get(sortByExpensiveRaffles);


    apiRoutes.route('/list/recent/completed')
      .get(mostRecentCompletedRaffles);

    apiRoutes.route('/list/expensive/completed')
    .get(sortByExpensiveCompletedRaffles);

     //getCompletedRafflesCountInADay
    apiRoutes.route('/completed/list')
      .get(getCompletedRafflesList);

    apiRoutes.route('/completed/list/today')
      .get(getCompletedRafflesCountInADay);

    apiRoutes.route('/top/wins')
      .get(topRafflesWins);

    apiRoutes.route('/update/required/members')
      .post(updateRequiredMembers);
    
    apiRoutes.route('/details')
      .get(getRafflesDetails);

      apiRoutes.route('/join')
      .post(joinRaffle);

    return apiRoutes;
  }
  
  module.exports = router;