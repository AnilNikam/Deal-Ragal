const mongoose = require('mongoose');
const MongoID = mongoose.Types.ObjectId;


const Users = mongoose.model('users');
const Shop = mongoose.model('shop');
const Agent = mongoose.model('agent');

const express = require('express');
const router = express.Router();
const config = require('../../../config');
const commonHelper = require('../../helper/commonHelper');
const mainCtrl = require('../../controller/adminController');
const logger = require('../../../logger');
const UserWalletTracks = mongoose.model("userWalletTracks");
const ShopWalletTracks = mongoose.model("shopWalletTracks");
const AgentWalletTracks = mongoose.model("agentWalletTracks");
const AdminWalletTracks = mongoose.model("adminWalletTracks");
const gamePlayActionsRoulette = require('../../roulette/gamePlay');
const adminwinloss = mongoose.model('adminwinloss');
const RouletteUserHistory = mongoose.model('RouletteUserHistory');
const moment = require('moment');
/**
 * @api {post} /admin/lobbies
 * @apiName  add-bet-list
 * @apiGroup  Admin
 * @apiHeader {String}  x-access-token Admin's unique access-key
 * @apiSuccess (Success 200) {Array} badges Array of badges document
 * @apiError (Error 4xx) {String} message Validation or error message.
 */
router.get('/', async (req, res) => {
  try {
    console.log('requet => ', req.query);
    let totalUser = 0;

    let lastdate = AddTime(-86000)

    const startOfDay = moment().startOf('day').toDate();
    const endOfDay = moment().endOf('day').toDate();

    if (req.query.Id == undefined || req.query.Id == "undefined" || req.query.Id == "Admin") {
      totalUser = await Users.find().count()
    } else {
      totalUser = await Users.find({ agentId: MongoID(req.query.Id) }).count()

    }

    totalAgent = await Agent.find().count()

    let totalDepositData = await AgentWalletTracks.aggregate([
      {
        $match: {
          "trnxTypeTxt": "Admin Addeed Chips"
        }
      },
      {
        $group: {
          _id: 'null',
          total: {
            $sum: '$trnxAmount'
          }
        }
      }
    ]);
    console.log("totalDepositData ", totalDepositData)

    const totalDeposit = totalDepositData.length > 0 ? totalDepositData[0].total.toFixed(2) : 0;

    let totalWithdrawData = await AgentWalletTracks.aggregate([
      {
        $match: {
          "trnxTypeTxt": "Admin duduct Chips"
        }
      },
      {
        $group: {
          _id: 'null',
          total: {
            $sum: '$trnxAmount'
          }
        }
      }
    ]);

    logger.info("totalWithdrawData ", totalWithdrawData)


    const totalWithdraw = totalWithdrawData.length > 0 ? totalWithdrawData[0].total.toFixed(2) : 0

    let todayDepositDataToday = await AgentWalletTracks.aggregate([
      {
        $match: {
          "createdAt": { $gte: startOfDay, $lte: endOfDay },
          "trnxTypeTxt": "Admin Addeed Chips"
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: '$trnxAmount'
          }
        }
      }
    ]);
    logger.info("todayDepositDataToday ", todayDepositDataToday)

    const todayDeposit = todayDepositDataToday.length > 0 ? todayDepositDataToday[0].total.toFixed(2) : 0;


    let todayWithdrawDataToday = await AgentWalletTracks.aggregate([
      {
        $match: {
          "createdAt": { $gte: startOfDay, $lte: endOfDay },
          "trnxTypeTxt": "Admin duduct Chips"
        }
      },
      {
        $group: {
          _id: 'null',
          total: {
            $sum: '$trnxAmount'
          }
        }
      }
    ]);
    logger.info("todayWithdrawDataToday ==>", todayWithdrawDataToday)

    const todayWithdraw = todayWithdrawDataToday.length > 0 ? todayWithdrawDataToday[0].total.toFixed(2) : 0

    const toDayGamePay = await RouletteUserHistory.find({ "createdAt": { $gte: new Date(lastdate), $lte: new Date() } }).count();

    const totalGamePay = await RouletteUserHistory.find().count();

    const todayProfit = Math.abs(todayDeposit) - Math.abs(todayWithdraw)

    const totalProfit = Math.abs(totalDeposit) - Math.abs(totalWithdraw)

    let currentdata = gamePlayActionsRoulette.CreateDate(new Date())
    let AdminWinlossData = await adminwinloss.findOne({ date: currentdata, win: { $exists: true }, loss: { $exists: true } })

    console.log("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", AdminWinlossData)

    let totalWin = (AdminWinlossData != undefined && AdminWinlossData.win != undefined) ? AdminWinlossData.win : 0
    let totalLoss = (AdminWinlossData != undefined && AdminWinlossData.loss != undefined) ? AdminWinlossData.loss : 0

    let ConfigdaywiseWinloss = -1
    if (GAMELOGICCONFIG.DAY != undefined && GAMELOGICCONFIG.DAY != -1) {
      let datebeforecount = this.AddTimeLAST(-((GAMELOGICCONFIG.DAY - 1) * 86400));

      logger.info("datebeforecount ", datebeforecount)

      AdminWinlossData = await adminwinloss.find({ createdAt: { $gte: new Date(datebeforecount) }, win: { $exists: true }, loss: { $exists: true } })

      
      let DaytotalWin = (AdminWinlossData.length > 0) ? AdminWinlossData.reduce((total, num) => { return total + Math.round(num.win != undefined ? num.win : 0); }, 0) : 0
      let DaytotalLoss = (AdminWinlossData.length > 0) ? AdminWinlossData.reduce((total, num) => { return total + Math.round(num.loss != undefined ? num.loss : 0); }, 0) : 0
      ConfigdaywiseWinloss = (100 - ((DaytotalLoss * 100) / DaytotalWin)).toFixed(2)

    }


   

    const totalPercentage = (100 - ((totalLoss * 100) / totalWin)).toFixed(2)

    logger.info('admin/dahboard.js post dahboard  error => ', totalUser);

    res.json({ totalUser, totalAgent, totalDeposit, todayDeposit, todayWithdraw, totalWithdraw, totalGamePay, toDayGamePay, todayProfit, totalProfit, totalPercentage,ConfigdaywiseWinloss });
  } catch (error) {
    logger.error('admin/dahboard.js post bet-list error => ', error);
    res.status(config.INTERNAL_SERVER_ERROR).json(error);
  }
});

/**
* @api {post} /admin/lobbies
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/latatestUser', async (req, res) => {
  try {
    console.log('requet => latatestUser ', req.query);
    let t = new Date().setSeconds(new Date().getSeconds() - 604800);

    logger.info('admin/dahboard.js post dahboard  error => ', t);
    let RecentUser = []


    if (req.query.Id == undefined || req.query.Id == "Admin") {

      RecentUser = await Users.find({ createdAt: { $gte: new Date(t) } }, { username: 1, id: 1, createdAt: 1 })

    } else {
      RecentUser = await Users.find({ agentId: MongoID(req.query.Id), createdAt: { $gte: new Date(t) } }, { username: 1, id: 1, createdAt: 1 })
    }

    logger.info('admin/dahboard.js post dahboard  error => ', RecentUser);

    res.json({ RecentUser });
  } catch (error) {
    logger.error('admin/dahboard.js post bet-list error => ', error);
    res.status(config.INTERNAL_SERVER_ERROR).json(error);
  }
});


/**
* @api {post} /admin/lobbies
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/latatestShop', async (req, res) => {
  try {
    console.log('requet => latatestShop ', req.query);
    let t = new Date().setSeconds(new Date().getSeconds() - 604800);

    logger.info('admin/dahboard.js post dahboard  error => ', t);
    let RecentUser = []


    if (req.query.Id == undefined || req.query.Id == "Admin") {

      RecentUser = await Shop.find({ createdAt: { $gte: new Date(t) } }, { name: 1, id: 1, createdAt: 1 })

    } else {
      RecentUser = await Shop.find({ agentId: MongoID(req.query.Id), createdAt: { $gte: new Date(t) } }, { name: 1, id: 1, createdAt: 1 })
    }

    logger.info('admin/dahboard.js post dahboard  error => ', RecentUser);

    res.json({ RecentUser });
  } catch (error) {
    logger.error('admin/dahboard.js post bet-list error => ', error);
    res.status(config.INTERNAL_SERVER_ERROR).json(error);
  }
});


/**
* @api {post} /admin/lobbies
* @apiName  add-bet-list
* @apiGroup  Admin
* @apiHeader {String}  x-access-token Admin's unique access-key
* @apiSuccess (Success 200) {Array} badges Array of badges document
* @apiError (Error 4xx) {String} message Validation or error message.
*/
router.get('/latatestAgent', async (req, res) => {
  try {
    console.log('requet => latatestShop ', req.query);
    let t = new Date().setSeconds(new Date().getSeconds() - 604800);

    logger.info('admin/dahboard.js post dahboard  error => ', t);
    let RecentUser = []

    RecentUser = await Agent.find({ createdAt: { $gte: new Date(t) } }, { name: 1, id: 1, createdAt: 1 })

    logger.info('admin/dahboard.js post dahboard  error => ', RecentUser);

    res.json({ RecentUser });
  } catch (error) {
    logger.error('admin/dahboard.js post bet-list error => ', error);
    res.status(config.INTERNAL_SERVER_ERROR).json(error);
  }
});


function AddTime(sec) {
  let t = new Date();
  return t.setSeconds(t.getSeconds() + sec);
}


module.exports.AddTimeLAST = (t) => {
  try {
      const ut = new Date();
      ut.setUTCHours(23);
      ut.setUTCMinutes(59);
      ut.setUTCSeconds(0);
      ut.setSeconds(ut.getSeconds() + Number(t));

      ut.setUTCHours(0);
      ut.setUTCMinutes(0);
      ut.setUTCSeconds(0);
      ut.setUTCMilliseconds(0);



      return ut;
  } catch (error) {
      logger.error('socketFunction.js AddTime error :--> ' + error);
  }
};


module.exports = router;