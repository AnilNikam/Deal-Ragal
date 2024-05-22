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

    let totalDepositData = await UserWalletTracks.aggregate([
      {
        $match: {
          "trnxTypeTxt": "Agent Addeed Chips"
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

    let totalWithdrawData = await UserWalletTracks.aggregate([
      {
        $match: {
          "trnxTypeTxt": "Agent duduct Chips"
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

    let todayDepositDataToday = await UserWalletTracks.aggregate([
      {
        $match: {
          "createdAt": { $gte: startOfDay, $lte: endOfDay },
          "trnxTypeTxt": "Agent Addeed Chips"
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


    let todayWithdrawDataToday = await UserWalletTracks.aggregate([
      {
        $match: {
          "createdAt": { $gte: startOfDay, $lte: endOfDay },
          "trnxTypeTxt": "Agent duduct Chips"
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


    let currentdata = gamePlayActionsRoulette.CreateDate(new Date())
    let AdminWinlossData = await adminwinloss.findOne({ date: currentdata })

    let totalWin = AdminWinlossData.win != undefined ? AdminWinlossData.win : 0
    let totalLoss = AdminWinlossData.loss != undefined ? AdminWinlossData.loss : 0

    const todayProfit = totalWin - totalLoss

    console.log("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")
    logger.info('admin/dahboard.js post dahboard  error => ', totalUser);

    res.json({ totalUser, totalAgent, totalDeposit, todayDeposit, todayWithdraw, totalWithdraw, totalGamePay, toDayGamePay, todayProfit });
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



module.exports = router;