var express = require('express'),
    rootPath = require('../config').rootPath,
    styles = require('../config').styles,
    router = express.Router(),
    loginMessage = '';

function getConfig(req ,params){
    var config = {
        menuId: req.query.m,
        rootPath: rootPath,
        styles: styles
    }

    return Object.assign({} , config ,params || {});
}

//首页
router.get('/', function(req, res, next) {
    res.render('index', getConfig(req));
    //判断当前是否是登录状态
    /* if (req.cookies.loginStatus == 1) {
        res.render('index', getConfig(req));
    } else {
        res.redirect('/login'); //重定向到登录页
    }  */
});

//登录页面
router.get('/login', function(req, res, next) {
	var params = { rootPath: rootPath };
    res.render('login', { rootPath: rootPath ,message: loginMessage});
});
//登录请求
router.post('/loginCheck', function(req, res, next) {
    if (req.body.username == 'admin' && req.body.password == 'admin') {
        loginMessage = '';
        res.render('index', getConfig(req));
    } else {
    	loginMessage = '登录失败,用户名和密码是admin';
        res.redirect('/login');
    }
});

//退出登录
router.get('/loginOut', function(req, res, next) {
    res.clearCookie('loginStatus', { maxAge: 0 });
    res.redirect('/login'); //重定向到登录页
});

//用户页面
router.get('/user', function(req, res, next) {
    res.render('pages/com/user/index', getConfig(req));
});
//用户页面
router.get('/role', function(req, res, next) {
    res.render('pages/com/role/index', getConfig(req));
});
//人员选择树页面
//人员树
router.get('/jctree', function(req, res, next) {
    res.render('pages/com/jctree/index', getConfig(req ,{selectedStatus: "jctree"}));
});
//echart
router.get('/echarts', function(req, res, next) {
    res.render('pages/com/echarts/index', getConfig(req));
});

//下拉菜单
router.get('/dropdown', function(req, res, next) {
    res.render('pages/com/dropdown/index', getConfig(req));
});
//提示信息
router.get('/tooltip', function(req, res, next) {
    res.render('pages/com/tooltip/index', getConfig(req));
});
//弹框扩展（基于Tooltip）
router.get('/popover', function(req, res, next) {
    res.render('pages/com/popover/index', getConfig(req));
});
//个人计划中大弹框插件（基于Tooltip）
router.get('/downarea', function(req, res, next) {
    res.render('pages/com/downarea/index', getConfig(req));
});
//tabs
router.get('/tabs', function(req, res, next) {
    res.render('pages/com/tabs/index', getConfig(req));
});
//其他模块
router.get('/OtherModule', function(req, res, next) {
    res.render('pages/com/OtherModule/index', getConfig(req));
});
//查询条件显示隐藏功能
router.get('/searchControl', function(req, res, next) {
    res.render('pages/com/searchControl/index', getConfig(req));
});
//水印模块
router.get('/placeholder', function(req, res, next) {
    res.render('pages/com/placeholder/index', getConfig(req));
});

//日历插件
router.get('/calendar', function(req, res, next) {
res.render('pages/com/calendar/index', getConfig(req));
});

//时间插件
router.get('/datepicker', function(req, res, next) {
res.render('pages/com/datepicker/index', getConfig(req));
});

//验证插件
router.get('/validate', function(req, res, next) {
res.render('pages/com/validate/index',getConfig(req));
});

//上传插件页面
router.get('/uploader', function(req, res, next) {
    res.render('pages/com/webuploader/index', getConfig(req));
});

//动态添加行插件页面
router.get('/dynrow', function(req, res, next) {
    res.render('pages/com/dynrow/index', getConfig(req));
});


//工作流
router.get('/workflow', function(req, res, next) {
res.render('pages/com/workflow/index', getConfig(req));
});
//模拟滚动条插件
router.get('/scroll', function(req, res, next) {
    res.render('pages/com/scroll/index',getConfig(req));
});

//模拟滚动条插件
router.get('/form1', function(req, res, next) {
    res.render('pages/com/form/form1',getConfig(req));
});

//IDE
router.get('/ide-1', function(req, res, next) {
    res.render('pages/IDE/classice/index',getConfig(req));
});

//门户列表
router.get('/mhlist', function(req, res, next) {
    res.render('pages/com/mhlist/index',getConfig(req));
});



//IDE
router.get('/ide-2', function(req, res, next) {
    res.render('pages/IDE/classice/index-date',getConfig(req));
});

router.get('/ide-3', function(req, res, next) {
    res.render('pages/IDE/classice/index-dome',getConfig(req));
});

/* //富文本编辑器
router.get('/ueditor',function(req, res, next) {
    res.render('pages/com/ueditor/index', getConfig(req));
}) */
module.exports = router;