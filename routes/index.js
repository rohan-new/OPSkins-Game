let routerConfig = require('../configuration/routes-config');

let routes = (packages) => {
  let userRouter = require('./users')(packages);
  packages.app.use(routerConfig.BASE_USER_URL, userRouter);

  let raffleRouter = require('./raffle')(packages);
  packages.app.use(routerConfig.BASE_RAFFLE_URL, raffleRouter);

  let adminRouter = require('./admin')(packages);
  packages.app.use(routerConfig.BASE_ADMIN_URL, adminRouter);

}

module.exports = routes; 