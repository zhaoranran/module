if(!window.JC){
    window.JC = {};
}


/**
 *  左菜单展开收起插件
 * @example
 *     html  --> <nav class="nav-primary" id="GLeftMenu">
 *     var sidemenu = new JC.SideMenu('#JCLeftMenu');
 * @methods
 *   可以指定展开的列表, 传入应被点击的a标签 jQuery元素
 *   if($('#zhankai').length) sidemenu.goActivity($('#zhankai'));
 *
 *   关闭展开的类表
 *   sidemenu.hide();
 */
JC.SideMenu = Clazz.extend({
    construct: function(option, active) {
        this.active = option.active || 'active';
        this.$element = null;
        this.cacheData = null;
        this.level1 = null;

        this.level = [];
        this.dynmicId = null;
        this.headMenu = null;
        this.rootMenu = null;
        this.url = option.url || '/server/home/getMenus.action';
        this.$ele = option.ele instanceof jQuery ? option.ele : $(option.ele);
        this.option = option;
        this._getData();
        this._addEvent();
    },
    _addEvent: function() {
        var self = this,
            dropdown = $('#dropdownMenu');
        //点击菜单
        this.$ele.on('click', ' a', function(e) {
            var $e = $(e.target);
            if (!$e.is('a')) {
                $e = $e.closest('a');
            }
            self._activity($e);
            if (dropdown.hasClass('open')) dropdown.removeClass('open');
            e.preventDefault();
        });
        //点击连接,跳转页面
        $(document).on('click', ' [data-href="menu"]', function(e) {
            var $this = $(this);
            if (!$this.is('a')) {
                $this = $this.parent();
            }

            JC.LoadPage({
                id: $this.attr('id'),
                name: $this.attr('name'),
                url: $this.attr('action')
            }, true);
            e && e.preventDefault();
            return false;
        });
    },
    _getData: function(){
        var _this = this;
        $.ajax({
            type: 'GET',
            url: _this.url,
            dataType: 'json',
            success: function(data){
                _this.setData(data);
            }
        });
    },
    goActivity: function(menuId) {
        //this._getData();
        if (menuId) {
            this.level = [];
            var les = null;

            var rootMenu = this.getByRoot(menuId);
            this.headMenu = this.level.pop();
           // this.getTemplateLeft0(rootMenu, this.level);

            if (menuId instanceof jQuery) {
                les = menuId.parents('li');
            } else {
                this.setThisMeunId(menuId);
                les = $('#jcleftmenu_' + menuId).parents('li');
            }
            for (var i = les.length - 1; i >= 0; i--) {
                var $li = $(les[i])
                var $a = $li.find('> a');
                if (!$a.hasClass(this.active) || !$li.hasClass(this.active)) {
                    $a.removeClass(this.active), $li.removeClass(this.active);
                    this._activity($a);
                }
            }
            //this.setThisMeunId(menuId);
            
            JC.leftScroll();
            
        }
        
    },
    getCrumbs: function(id) {
        var arys = this.getMenuCrumbs(id);
        var crustr = ['<div class="crumbs"><a href="#" onclick="JC.loadHome();">首页</a><i></i>'],
            len = arys.length;
        for (var i = 0; i < len; i++) {
            crustr.push('<span>' + arys[i].name + '</span>');
            //crustr.push('<a href="#">'+ crumbs[i] +'</a>');
            if (i < len - 1) crustr.push('<i></i>');
        }
        crustr.push('</div>');
        return crustr.join('');
    },
    drawLeft: function(id) {
        var obj = null;
        for (var i = 0; i < this.cacheData.length; i++) {
            var menu = this.cacheData[i];
            if (menu.id == id) {
                obj = menu;
                break;
            }
        }
        if (obj) {
            this.getTemplateLeft1(obj);
            JC.leftScroll();
        }
    },
    hide: function() {
        if (this.$element.hasClass(this.active)) {
            this.goActivity(this.$element);
        }
    },
    getEventDom: function(menu) {
        return menu.children ? '' : 'data-href="menu"';
    },
    checked: function(les, id) {
        var rs = '';
        if (les) {
            for (var i = 0; i < les.length; i++) {
                var le = les[i];
                if (le.id == id) rs = 'class="active"';
            }
        }
        return rs;
    },
    getTemplateLeft0: function(menus, levels) {
        //if (this.headMenu) JC.navigation(this.headMenu.id);
            var result = [];
            for (var i = 0; i < menus.length; i++) {
                var menu = menus[i];
                var ac = this.checked(this.level, menu.id);
                result.push('<li ' + ac + '><a href="javascript:void(0)" ' + ac + ' name="' + menu.name + '" data-head="menu" id="jcleftmenu_' + menu.id + '" action="' + menu.action + '" ' + this.getEventDom(menu) + '>');
                result.push('<i class="' + menu.icon + '"><b class="b-bg-' + (i % 8) + '"></b></i>');
                if (menu.children) {
                    result.push('<span class="pull-right"><i class="fa fa-plus2 text"></i><i class="fa fa-minus text-active"></i></span>');
                    //result.push('<span class="pull-right"><i class="fa fa-minus " style="display: none"></i><i class="fa fa-plus2"></i></span>');
                }
                result.push('<span>' + menu.name + '</span>');
                result.push('</a>');
                if (menu.children) {
                    result.push('<ul class="nav">');
                    result.push(this.getTemplateLeft1(menu.children, levels));
                    result.push('</ul>');
                }
                result.push('</li>');
            }
            this.$ele.html(result.join(''));
    },
    getTemplateLeft1: function(menus, levels) {
        var ary = [];
        //菜单第二级
        for (var i = 0; i < menus.length; i++) {
            var obj = menus[i];
            var ay = this.checked(this.level, obj.id);
            ary.push('<li ' + ay + '><a href="javascript:void(0)" ' + ay + ' name="' + obj.name + '" id="jcleftmenu_' + obj.id + '" action="' + obj.action + '" ' + this.getEventDom(obj) + '>');
            ary.push('<span>' + obj.name + '</span>');
            if (obj.children) {
                ary.push('<span class="pull-right"><i class="fa fa-plus2 text"></i><i class="fa fa-minus text-active"></i></span>');
            } else {
                //ary.push('<i class="fa fa-angle-right"></i>');
            }

            ary.push('</a>');
            if (obj.children) {

                ary.push('<ul class="nav lt">');
                ary.push(this.getTemplateLeft2(obj.children, levels));
                ary.push('</ul>');
            }
            ary.push('</li>');
        }
        return ary.join('');
    },
    getTemplateLeft2: function(menus, levels) {
        var ary = [];
        //菜单第三级
        for (var i = 0; i < menus.length; i++) {
            var obj = menus[i];
            var ay = this.checked(this.level, obj.id);
            ary.push('<li ' + ay + '><a href="javascript:void(0)" ' + ay + ' name="' + obj.name + '" id="jcleftmenu_' + obj.id + '" action="' + obj.action + '" ' + this.getEventDom(obj) + '>');
            ary.push('<span>' + obj.name + '</span>');
            if (obj.children) {

                //ary.push('<i class="fa fa-minus" style="display: none"></i><i class="fa fa-plus2"></i>');
                ary.push('<span class="pull-right"><i class="fa fa-plus2 text"></i><i class="fa fa-minus text-active"></i></span>');
            } else {
                //ary.push('<i class="fa fa-angle-right"></i>');
            }

            ary.push('</a>');
            if (obj.children) {

                ary.push('<ul class="nav lt">');
                ary.push(this.getTemplateLeft3(obj.children, levels));
                ary.push('</ul>');
            }
            ary.push('</li>');
        }
        return ary.join('');
    },
    getTemplateLeft3: function(menus, levels) {
        var ary = [];
        //左菜单第四级
        for (var i = 0; i < menus.length; i++) {
            var obj = menus[i];
            var ax = this.checked(this.level, obj.id);
            ary.push('<li ' + ax + '><a href="javascript:void(0)" ' + ax + ' name="' + obj.name + '" id="jcleftmenu_' + obj.id + '" action="' + obj.action + '" ' + this.getEventDom(obj) + '>');
            //ary.push('<i class="fa fa-angle-right"></i>');
            ary.push('<span>' + obj.name + '</span></a>');
            ary.push('</li>');
        }
        return ary.join('');
    },
    setData: function(data, callback) {
        this.cacheData = this._parse($.parseJSON(data));
        this.level1 = $.parseJSON(data);
        this.getTemplateLeft0(this.level1,this.level);
        if (typeof callback === 'function') {
            callback.call(this, this.cacheData);
        }
        if(this.option && $.isFunction(this.option.ready)){
            this.option.ready.call(this);
        }
        

    },
    getPortalId: function(id) {
        var menuData = this.getMenuData();
        var pId = '',
            pmId = '';
        for (var i = 0, len = menuData.length; i < len; i++) {
            var menu = menuData[i];
            if (menu.id == id) {
                pId = menu.parentId;
            }
        }
        if (pId) {
            for (var i = 0, len = menuData.length; i < len; i++) {
                var menu = menuData[i];
                if (menu.id == pId) {
                    pmId = menu.id;
                }
            }
        }
        return pmId;
    },
    getRootMenu: function(menuId) {
        var self = this;
        for (var i = 0, len = self.cacheData.length; i < len; i++) {
            var menu = self.cacheData[i];
            if (menuId == menu.id) {
                self.level.push(menu);
                if (menu.parentId == '-1') {
                    self.rootMenu = menu;
                } else {
                    self.getRootMenu(menu.parentId);
                }
                break;
            }
        }
    },
    getMenuCrumbs: function(id) {
        var result = [],
            mData = this.getMenuData(),
            len = mData.length;

        function circulation(mid) {
            var pId = mid;
            for (var i = 0; i < len; i++) {
                var item = mData[i];
                if (item.id == pId) {
                    result.push(item);
                    if (item.parentId != '-1') {
                        circulation(item.parentId);
                    }
                    break;
                }
            }
        }
        circulation(id);
        return result.reverse()
    },
    getByRoot: function(menuId) {
        this.getRootMenu(menuId);
        return this.rootMenu;
    },
    _parse: function(datas) {
        var reslut = [];

        function recur(data) {
            for (var i = 0; i < data.length; i++) {
                var obj = data[i];
                reslut.push(obj);
                if (obj.action && obj.action.indexOf('ic/mail/manageSend.action') >= 0) {
                    JC.newMailObject = obj;
                }
                if (obj.children) {
                    recur(obj.children);
                }
            }
        }
        recur(datas);
        return reslut;
    },
    getMenuData: function() {
        return this.cacheData;
    },
    _activity: function($e, callback) {
        var self = this,
            $p = $e.parent(),
            $active = $p.siblings('.' + this.active),
            $href_id = window.location.href.split('=')[1];
            self.isOpen = $e.hasClass(this.active);
        //查看是否同级有展开的
        if ($active.length) {
            //获取已打开的同级列表,然后关闭
            var $li_active = $e.siblings('ul.nav').find('li.active');

            $active.find('a,l').removeClass(this.active);
            if($li_active.find('>a').length){
                var $a_active_id = $li_active.find('>a').attr('id').split('jcleftmenu_')[1];
                
                $a_active_id == $href_id?$li_active.find('>a').addClass(this.active):$li_active.find('>a').removeClass(this.active);
            }
            $active.removeClass(this.active).find('ul:visible').slideUp(200);
        }
        
        if (self.isOpen) {
            var opens = $e.next().find('.' + this.active);
            opens.each(function(index, item) {
                var $t = $(item);
                if(self.level[0].id != $href_id){
                    $t.removeClass(self.active);
                }else{
                    $t.addClass(self.active);
                }
               
                if ($t.next().is('ul')) {
                    $t.next().slideUp(200);
                }
            });
        }
        //将当前的列表展开或收起
        $e.next()[self.isOpen ? 'slideUp' : 'slideDown'](200, function() {
            JC.leftScroll();
            if (callback) callback();
        });
        //置换当前展开收起状态
        var handle = $e.hasClass(this.active) ? 'removeClass' : 'addClass';
        this.$element = $e[handle](this.active), $p[handle](this.active);
        //阻止默认事件
        return false;
    },
    /**
     *
     * @param id
     */
    setThisMeunId: function(id) {
        this.dynmicId = id;
    },
    /**
     *
     * @returns {null|*}
     */
    getThisMenuId: function() {
        return this.dynmicId;
    }
});



//左菜单模拟滚动条
JC.leftScroll = function(option){
    $('#slim-scroll').slimScroll(option);
}


$(document).ready(function(){
    
//判断是否为IE,隐藏全屏按钮
    if($("html").hasClass('ie11')||$("html").hasClass('ie')){
        $('.full-f11').hide();
    }
    if (!!window.ActiveXObject || "ActiveXObject" in window){
        $('.full-f11').hide();
    }
    //全屏函数
    function launchFullscreen(element) {
        if(element.requestFullscreen) {
            element.requestFullscreen();
        } else if(element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if(element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if(element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    //退出全屏函数
    function exitFullscreen() {
        if(document.exitFullscreen) {
            document.exitFullscreen();
        } else if(document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if(document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }

    //点击展开全屏事件
    $(document).on('click','.full-f11', function () {
        launchFullscreen(document.documentElement);
        $(this).addClass('active');
        $(this).removeClass('full-f11');
    });
    //点击退出全屏事件
    $(document).on('click', '.navbar-fixed-top>.active', function () {
        debugger
        exitFullscreen(document.documentElement);
        $(this).removeClass('active');
        $(this).addClass('full-f11')
    });

    //$(document).on('keyup',function(e){
    //    if(e.which==27) {
    //        $('.navbar-fixed-top>.active').addClass('full-f11').removeClass('active');
    //    }
    //});
});

/**
 * 搜索类
 */
JC.SearchMenu = Clazz.extend({
    construct : function(datas){

        this.$ele = $('#smartyInput');
        if(!this.$ele.length){
            throw new Error("搜索功框id 不等于smartyInput, 初始化失败");
        }

        this.$widget = $('#searchSmarty');
        this.$menu   = this.$widget.find('#menuContainer');
        this.$biss   = this.$widget.find('#bissContainer');
        this.placeholder = this.$ele.attr('placeholder');
        this.source  = [];
        this.status = false;                            //后台查询状态
        this.menuStatus = false;                        //前台查询状态

        this._addEvent();
        this._parseData(datas || []);
       /* console.log(thie.$ele);*/
    },
    _addEvent : function(){
        var self = this;
        var valOld = '';
        //搜索面板显示
        self.$ele.focus(function(){
            self.$widget.show();
            self._title();
            self.$biss.html('');
        });
        //监听输入
        self.$ele.keyup(function(){
            var val = this.value;
            var searchstr = $.trim(val);

            if(searchstr.length > 1){
                valOld = searchstr;
                self._draw(searchstr);
            }else{
                self._title();
            }
        });
        //点击插叙到的结果后面板隐藏
        self.$widget.on('click' , ' a' , function(){
            setTimeout(function(){
                self.hide();
            } , 0);
        });
        //点击面板和搜索框意外隐藏
        $(document).on('mousedown', function(e){
            if ($(e.target).closest('#searchSmarty').length == 0 && e.target != self.$ele[0]) {
                self.hide();
            }
        });

        self._placeholder();
    },
    //解析全部菜单数据,便于检索
    _parseData : function(datas){
        var self = this;
        for (var i = 0; i < datas.length; i++) {
            var obj = datas[i];
            if(obj.action){
                self.source.push(obj);
            }
        }
    },
    //隐藏
    hide : function(){
        this.$widget.hide();
        this.$ele.val('');
        this.$ele.blur();
    },
    //搜索方法
    _search : function(value){
        var self = this,
            len = self.source.length,
            result = [];

        for(var i = 0;i < len;i++){
            var obj = self.source[i];
            if(obj.name.indexOf(value) >= 0){
                result.push(obj);
            }
        }
        return result;
    },
    _isEmptyObject : function(obj) {
        for (var key in obj) {
            return false;
        }
        return true;
    },
    //向后台请求查询搜索字的全文内容
    _getData : function(key){

        var self = this;

        if(self.status) {
            return false;
        }

        if(!self.menuStatus){
            self._loading();
        }
        self.status = true;
        $.ajax({
            type : "GET",
            url : getRootPath()+'/oa/quickSearch/manage.action?content='+encodeURI(key) + '&v='+(+new Date()),
            dataType : "json",
            success : function(data) {
                self.status = false;
                if(self._isEmptyObject(data)){
                    self._fail('biss');
                    if(!self.menuStatus){
                        self._fail('menu');
                    }
                    return false;
                }
                if(!self.menuStatus){
                    self._fail('empty');
                }
                var result = [];
                //收件箱信息
                if(data.reciveMailUrl){
                    result.push(self._getBusinessTemplate(0 ,data.reciveMailUrl, data.reciveMailTitle));
                }
                //发件箱信息
                if(data.sendMailUrl){
                    result.push(self._getBusinessTemplate(1 ,data.sendMailUrl, data.sendMailTitle));
                }
                //收文
                if(data.reciveDocUrl){
                    result.push(self._getBusinessTemplate(2 ,data.reciveDocUrl, data.reciveDocTitle));
                    //reciveDocState：收文详细页状态（只有当仅查到一条收文数据时才会有reciveDocState）
                }
                //发文
                if(data.sendDocUrl){
                    result.push(self._getBusinessTemplate(3 ,data.sendDocUrl, data.sendDocTitle));
                    //sendDocState：发文详细页状态（只有当仅查到一条发文数据时才会有sendDocState）
                }
                self.$biss.html(result.join(''));
            }
        });
    },

    _loading : function(){
        this.$menu.html('正在搜索...');
    },
    //查询失败
    _fail : function(type){
        if(type == 'empty'){
            this.$menu.empty();
        }
        if(type == 'menu'){
            this.$menu.html('未查询到结果!');
        }
        if(type == 'biss'){
            this.$biss.empty();
        }
    },
    _title : function(){
        this.$biss.html('');
        this.$menu.html('请输入大于1个检索文字!');
    },
    _placeholder : function(){
        var self = this;
        //模拟水印
        if(JC.browser.ie && JC.browser.version < 10){
            self.$ele.focus(function(e){
                if(this.value == self.placeholder){
                    this.value = '';
                    self.$ele.removeClass('placeholder');
                }
            });

            self.$ele.blur(function(e){
                if(this.value == ''){
                    this.value = self.placeholder;
                    self.$ele.addClass('placeholder');
                }
            });
            self.$ele.val(self.placeholder);
        }
    },
    _draw : function(value){
        var data = this._search(value);
        if(data.length){
            this.menuStatus = true;
            this.$menu.html(this._getMenuTemplate(data)).off().on('click' , ' a' ,function(e){
                var $this = $(e.target);

                if(!$this.is('a')){
                    $this = $this.parent();
                }
                JC.LoadPage({
                    id : $this.attr('ids'),
                    name : $this.attr('name'),
                    url  : $this.attr('action')+'&menuId='+$this.attr('ids').split('_')[1] ///搜索中添加menuid用来查询导航页的菜单
                });
            });
        }else{
            this.menuStatus = false;
            this._fail('menu');
        }
        this._getData(value);
    },
    //菜单模版
    _getMenuTemplate : function(datas){
        var len = datas.length,
            template = [],
            i = 0;
        template.push('<h2>常用功能</h2><ul class="ul-icon clearfix">');

        for(;i<len;i++){
            var obj = datas[i];
            template.push('<li class="icon'+((i%8)+1)+'"> <a href="#" action="'+obj.action+'" ids="jcleftmenu_'+obj.id+'" name="'+obj.name+'" title="'+obj.name+'"> ' +
                '<i class="fa fa-personage"></i><span>'+(obj.name.length > 4 ? obj.name.substring(0,4):obj.name )+'</span> </a> </li>');
        }
        template.push('</ul>');

        return template.join('');
    },
    //全文模版
    _getBusinessTemplate : function(type ,url , title){
        var tempType = ['收件箱','已发送','收文','发文'],template = [];
        template.push('<h2>'+tempType[type]+'</h2><ul class="relevant-mail">');
        template.push('<li><a href="javascript:;" onclick="JC.LoadPage({url : \''+url+'\'});">'+title+'</a></li>');
        //template.push(' <li><a href="#"><span>办公</span>室通知，办公桌面要保持干净</a></li>');
        template.push('</ul>');
        return template.join('');
    }
});
this.search = new JC.SearchMenu(this.cacheData);



