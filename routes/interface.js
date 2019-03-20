var express = require('express');
var Mock = require('mockjs');
var fs = require('fs');
var path = require('path');

var router = express.Router();

function readFileJSON(__path, res) {
    var reslut = {};
    fs.readFile(path.join(__dirname ,__path) , function(err, data) {
        if (err) {
            data = '查询失败';
        }
        res.json(data.toString());
    });
}

function readFileText(__path, res) {
fs.readFile(__dirname + __path, function(err, data) {
if (err) {
data = null;
}
res.send(data.toString());
});
}


/**
 * 首页获取当前登录人全部菜单
 */
router.get('/home/getMenus.action', function(req, res, next) {
    readFileJSON('data/menu.json', res);
});

//人员选择树获取所有人员数据接口
router.get('/api/department/getAllDeptAndUser.action', function(req, res, next) {
    readFileJSON('/data/users.json', res);
});
router.get('/api/department/getDeptAndUserByOnLine.action', function(req, res, next) {
    readFileJSON('/data/lines.json', res);
});
router.get('/api/department/getPostAndUser.action', function(req, res, next) {
    readFileJSON('/data/posts.json', res);
});
router.get('/api/department/getPersonGroupAndUser.action', function(req, res, next) {
    readFileJSON('/data/personGroups.json', res);
});
router.get('/api/department/getPublicGroupAndUser.action', function(req, res, next) {
    readFileJSON('/data/personGroups.json', res);
});
router.get('/api/system/getUserById.action', function(req, res, next) {
    readFileJSON('/data/userInfo.json', res);
});
//机构
router.get('/api/department/getOrgTree.action', function(req, res, next) {
    readFileJSON('/data/org.json', res);
});
//机构部门
router.get('/api/department/getOrgAndPersonTree.action', function(req, res, next) {
    readFileJSON('/data/orgdept.json', res);
});
//左右选择树形数据
router.get('/api/system/getRolesForUser.action', function(req, res, next) {
    readFileJSON('/data/mutual.json', res);
});
//权限树
router.get('/api/system/managerDeptTree.action', function(req, res, next) {
    readFileJSON('/data/ztree.json', res);
});

//动态加载树
router.get('/api/system/managerDeptTree.action', function(req, res, next) {
    readFileJSON('/data/deptTree.json', res);
});

router.get('/api/pinDepartment/getAllDeptAndUser.action', function(req, res, next) {
    readFileJSON('/data/deptAndUser.json', res);
});

//验证插件国际化文件
router.get('/system/i18n/commonMessage.properties', function(req, res, next) {
readFileText('/data/commonMessage.properties', res);
});

//提示信息
router.get('/api/reminders/getRemindCount.action', function(req, res, next) {
    readFileJSON('/data/getRemindCount.json', res);
});

//提示信息中的加载数据
router.get('/api/noticeMsg/queryMsgTip.action', function(req, res, next) {
    readFileJSON('/data/queryMsgTip.json', res);
});

router.get('/system/i18n/sysMessage.properties', function(req, res, next) {
readFileText('/data/sysMessage.properties', res);
});

//门户列表
router.post('/api/send/getSendPortalData.action', function(req, res, next) {
    readFileText('/data/getSendPortalData.json', res);
});
router.post('/api/send/getInfoPortalData.action', function(req, res, next) {
    readFileText('/data/getInfoPortalData.json', res);
});

/* router.post('/api/send/getSendPortalData.action', function(req, res, next) {
    var funViewType = req.query.funViewType;
    var dataRows = req.query.dataRows;
    fs.readFile(path.join(__dirname ,'/data/getSendPortalData.json'),function(err, data) {
        if (err) {
            data = '查询失败';
        }
        let result = JSON.parse(data.toString());
        if(funViewType){//按ID获取用户
        	let filterData = result.data.filter(function(user){
        		return user.id == (userid);
        	});
        	result.data = filterData;
        }
        res.json({data: result.data});
    });
}); */

//用户管理 查询用户列表
router.get('/api/getUserList', function(req, res, next) {
	var start = parseInt(req.query.iDisplayStart || req.query.start || 0);
	var length = parseInt(req.query.iDisplayLength ||  req.query.length || 10);
	var username = req.query.username;
	var name = req.query.name;
    fs.readFile(path.join(__dirname ,'data/userList.json'),function(err, data) {
        if (err) {
            data = '查询失败';
        }
        let result = JSON.parse(data.toString());
        if(username){//按帐号过滤用户
        	let filterData = result.data.filter(function(user){
        		return user.username.includes(username);
        	});
        	result.data = filterData;
        }
        if(name){//按姓名过滤用户
        	let filterData = result.data.filter(function(user){
        		return user.name.includes(name);
        	});
        	result.data = filterData;
        }
        let pageData = result.data.slice(start, start+length);//分页数据
        res.json({data: pageData,"iTotalRecords":result.data.length,"iTotalDisplayRecords":result.data.length});
    });
});

//用户管理 根据用户id查询用户
router.get('/api/getUser', function(req, res, next) {
	var userid = req.query.id;
    fs.readFile(path.join(__dirname ,'data/userList.json'),function(err, data) {
        if (err) {
            data = '查询失败';
        }
        let result = JSON.parse(data.toString());
        if(userid){//按ID获取用户
        	let filterData = result.data.filter(function(user){
        		return user.id == (userid);
        	});
        	result.data = filterData;
        }
        res.json({data: result.data});
    });
});

module.exports = router;

