const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken")
const test = require('../models/test').test;
const user = require('../models/user').user;
const secret = require('./secret')
const client = require('../redis/index')
const filter = require('../util/common').filter

router.get('/get-test', async function (req, res, next) {
    const reqParams = req.query
    let resData = {} // 返回结果

    if (reqParams.token) {
        let reqParamsData
        try {
            // 请求携带的token解析
            reqParamsData = jwt.verify(reqParams.token, secret)
        } catch (e) {
            resData.data = {}
            resData.code = 11021
            resData.message = "未登录"
            resData.timestamp = Math.round(new Date().getTime() / 1000)
            res.send(resData)
            return
        }
        try {
            const getResult = await test.find({
                userId: reqParams.userId
            }, {
                _id: 0, __v: 0
            }).populate({
                path: 'userId',
                select: 'userId userName password'
            }).lean({ virtuals: true })
            resData.data = {
                userName: getResult[0].userName,
                password: getResult[0].password,
                userInfo: filter(getResult[0].userId)
            }
            resData.code = 200
            resData.message = "ok"
            resData.timestamp = Math.round(new Date().getTime() / 1000)
            res.send(resData)
        } catch (e) {
            console.log(e)
        }

    } else {
        resData.data = {}
        resData.code = 11021
        resData.message = "未登录"
        resData.timestamp = Math.round(new Date().getTime() / 1000)
        res.send(resData)
    }
})

router.post('/set-like', async function (req, res, next) {
    const reqParams = req.body
    let resData = {} // 返回结果

    if (reqParams.token) {
        let reqParamsData
        try {
            // 请求携带的token解析
            reqParamsData = jwt.verify(reqParams.token, secret)
        } catch (e) {
            resData.data = {}
            resData.code = 11021
            resData.message = "未登录"
            resData.timestamp = Math.round(new Date().getTime() / 1000)
            res.send(resData)
            return
        }
        try {
            test.update({ userId: reqParams.userId }, { $set: { likeStatus: reqParams.status === 1 }}, (r) => console.log(r, "r"))
            resData.data = {likeStatus: reqParams.status === 1}
            resData.code = 200
            resData.message = "ok"
            resData.timestamp = Math.round(new Date().getTime() / 1000)
            res.send(resData)
        } catch (e) {
            console.log(e)
        }

    } else {
        resData.data = {}
        resData.code = 11021
        resData.message = "未登录"
        resData.timestamp = Math.round(new Date().getTime() / 1000)
        res.send(resData)
    }
})





module.exports = router;

