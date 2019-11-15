const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken")
const user = require('../models/user').user;
const secret = require('./secret')
const client = require('../redis/index')

const setToken = (reqParams, expTime) => {
    // 返回token
    let created = Math.floor(Date.now() / 1000);
    let _payload = { // 要加密的数据
        userName: reqParams.userName,
        exp: expTime, // 过期时间
        iat: created, // 创建时间
    }
    return jwt.sign(_payload, secret)
}

router.get('/login', async function (req, res, next) {
    const reqParams = req.query
    let resData = {} // 返回结果
    let result
    try {
        result = await user.find({ userName: reqParams.userName })
    } catch (e) {
        console.log(e)
    }
    if(!(result.length > 0)) {
        resData.code = 403
        resData.message = "该账号不存在，请输入正确的信息~"
        resData.timestamp = Math.round(new Date().getTime() / 1000)
        res.send(resData)
        return
    }
    if (result[0].password !== reqParams.password) {
        resData.code = 403
        resData.message = "请输入正确密码~"
        resData.timestamp = Math.round(new Date().getTime() / 1000)
        res.send(resData)
        return
    }
    let created = Math.floor(Date.now() / 1000)
    const _token = setToken(reqParams, created + 60 * 60 * 168)
    // 在浏览器设置cookie  token
    res.cookie('_usertoken', _token, {domain: ".yqjiajiao.com"})//发送cookie
    // redis设置token
    client.hset('user', reqParams.userName, _token)
    resData.data = { userName: reqParams.userName }
    resData.code = 200
    resData.message = "登录成功"
    resData.timestamp = Math.round(new Date().getTime() / 1000)
    res.send(resData)

})

router.post('/register', async function (req, res, next) {
    const reqParams = req.body
    let resData = {} // 返回结果
    const uPattern = /^[a-zA-Z0-9_-]{4,16}$/
    // 账号验证
    if (!uPattern.test(reqParams.userName)) {
        resData.code = 403
        resData.message = "账号请输入字母数字或下划线，长度4~16位~"
        resData.timestamp = Math.round(new Date().getTime() / 1000)
        res.send(resData)
        return
    }

    const pPattern = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/
    // 密码验证
    if (!pPattern.test(reqParams.password)) {
        resData.code = 403
        resData.message = "密码请输入字母数字组合，长度6~16位~"
        resData.timestamp = Math.round(new Date().getTime() / 1000)
        res.send(resData)
        return
    }
    let result
    try {
        result = await user.find({ userName: reqParams.userName })
    } catch (e) {
        console.log(e)
    }
    if (result.length > 0) {
        resData.code = 403
        resData.message = "该账号已存在~"
        resData.timestamp = Math.round(new Date().getTime() / 1000)
        res.send(resData)
    } else {
        let registerSuccess
        try {
            registerSuccess = await user.create(reqParams)
        } catch (e) {
            console.log(e)
        }
        if (registerSuccess) {
            resData.code = 200
            resData.message = "注册成功"
            resData.timestamp = Math.round(new Date().getTime() / 1000)
            res.send(resData)
        }
    }
})

router.post('/logout', async function (req, res, next) {
    const reqParams = req.body
    let resData = {} // 返回结果
    if (!reqParams.token) {
        resData.code = 403
        resData.message = "未登录，请登录后重试"
        resData.timestamp = Math.round(new Date().getTime() / 1000)
        res.send(resData)
        return
    }
    rInfo = jwt.verify(reqParams.token, secret)
    const _token = setToken(rInfo, 0)
    client.hset('user', rInfo.userName, _token)
    res.cookie('_usertoken', "", { domain: ".yqjiajiao.com", Expires: 10 })
    // res.clearCookie('_usertoken') // 设置domain的不能直接清除
    resData.code = 200
    resData.message = "退出成功"
    resData.timestamp = Math.round(new Date().getTime() / 1000)
    res.send(resData)
})

router.get('/get-user-info', async function (req, res, next) {
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
        let rInfo
        client.hget('user', reqParamsData.userName, function(err, rToken) {
            if(err) throw err
            // redis中的token 解析
            try {
                rInfo = jwt.verify(rToken, secret)
            } catch (e) {
                resData.data = {}
                resData.code = 11021
                resData.message = "未登录"
                resData.timestamp = Math.round(new Date().getTime() / 1000)
                res.send(resData)
            }
        })
            try {
                result = await user.find({ userName: reqParamsData.userName })
            } catch (e) {
                resData.data = {}
                resData.code = 404
                resData.message = "该用户不存在~"
                resData.timestamp = Math.round(new Date().getTime() / 1000)
                res.send(resData)
                return
            }
            if (result.length > 0) {
                let resultData = {
                    userName: result[0].userName,
                    password: result[0].password
                }
                resData.data = resultData
                resData.code = 200
                resData.message = "ok"
                resData.timestamp = Math.round(new Date().getTime() / 1000)
                res.send(resData)
            } else {
                resData.code = 404
                resData.message = "该用户不存在~"
                resData.timestamp = Math.round(new Date().getTime() / 1000)
                res.send(resData)
            }
    } else {
        resData.data = {}
        resData.code = 11021
        resData.message = "未登录"
        resData.timestamp = Math.round(new Date().getTime() / 1000)
        res.send(resData)
    }
})

router.get('/get-one-user-info', async function (req, res, next) {
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
            result = await user.find({ userName: reqParams.userName })
        } catch (e) {
            resData.data = {}
            resData.code = 404
            resData.message = "该用户不存在~"
            resData.timestamp = Math.round(new Date().getTime() / 1000)
            res.send(resData)
            return
        }
        if (result.length > 0) {
            let resultData = {
                userName: result[0].userName,
                password: result[0].password
            }
            resData.data = resultData
            resData.code = 200
            resData.message = "ok"
            resData.timestamp = Math.round(new Date().getTime() / 1000)
            res.send(resData)
        } else {
            resData.code = 404
            resData.message = "该用户不存在~"
            resData.timestamp = Math.round(new Date().getTime() / 1000)
            res.send(resData)
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

