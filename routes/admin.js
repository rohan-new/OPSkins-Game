
let router = (packages) => {
  let apiRoutes = packages.express.Router();
  let { registerAdmin, getTopWinnersList, getTopRafflesCreatorList, getUsersList, topRafflesWins, totalRafflesCreated, totalRafflesWins, getActiveRafflesList, RafflesInADay, activeRafflesInADay, loginAdmin } = require('../controllers/admin-controller');
  // let { authentication } = require('../middleware/authentication');

  // apiRoutes.use(authentication);
  // apiRoutes.use(checkAccessLevel);

  apiRoutes.route('/register')
    .post(registerAdmin);

  apiRoutes.route('/login')
    .post(loginAdmin);

  apiRoutes.route('/active/raffles')
    .get(getActiveRafflesList);

  apiRoutes.route('/top/winners')
    .get(getTopWinnersList);

  apiRoutes.route('/top/raffle/creators')
    .get(getTopRafflesCreatorList);

  apiRoutes.route('/users/list')
    .get(getUsersList);

  apiRoutes.route('/top/wins/raffles')
    .get(topRafflesWins);

  apiRoutes.route('/raffles/today')
    .get(RafflesInADay);

  apiRoutes.route('/total/raffles/created')
    .get(totalRafflesCreated);

  apiRoutes.route('/total/raffles/wins')
    .get(totalRafflesWins);

  
    apiRoutes.route('/active/raffles/today')
    .get(activeRafflesInADay);


  return apiRoutes;
}

module.exports = router;