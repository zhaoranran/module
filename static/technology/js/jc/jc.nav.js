/* !(function(){ */
if (!window.JC) {
    var JC = {};
}

JC.histObj = null; //初始化histtorys对象

JC.version = '3.0';

JC.$window = $(window); //缓存window对象

JC.newMailObject = null; //存储写邮件的menu对象
JC.saveMailObject = false; //保存写邮件的状态,跳出时是否需要弹出确认框

//获取某一个插件
JC.getPlugins = function(name) {

}

/**
 *  记录浏览页面历史记录
 * @example
 *     html  --> <nav class="nav-primary" id="GLeftMenu">
 *     var historys = newJC.Historys();
 * @methods
 *  historys.size();    获取当前存储多少个记录
 *  historys.setData({  添加记录
 *      url : 'aaa.action',
 *      name: '用户设置'
 *  });
 *  historys.getData()              获取记录 因为只能存储一个
 *  historys.empty()                清空记录
 */
JC.Historys = Clazz.extend({
    construct: function() {
        this.records = [];
        this.topFive = [];
    },
    //跳转页面时候 调用此方法,记录点击的历史记录
    setData: function(obj) {
        if (!obj.url) return false;
        this.records.push(obj);
    },
    setMenuData: function(data) {
        this.menuData = data;
    },
    getData: function() {
        return this.records;
    },
    size: function() {
        return this.records.length;
    },
    //刷新页面
    reload: function() {
        window.location.reload();
    },
    //设置top5数据
    setTopFive: function(data) {
        if (data) {
            this.topFive = JSON.parse(data);
        }
    },
    pageUp: function() {
        this.records.pop();
        JC.LoadPage(this.getLastData(), true);
    },
    //获取top5数据
    getTopFive: function() {
        return this.topFive;
    },
    //获取存储的最后一个url  用于goBack
    getLastData: function() {
        var res = this.records[this.size() - 1];
        return res;
    },
    //清空已存储点击的菜单
    empty: function() {
        this.records = [];
    }
});
/**
 * 搜索类
 */
JC.SearchMenu = Clazz.extend({
    construct: function(datas) {
        this.$ele = $('#smartyInput');
        if (!this.$ele.length) {
            throw new Error("搜索功框id 不等于smartyInput, 初始化失败");
        }

        this.$widget = $('#searchSmarty');
        this.$menu = this.$widget.find('#menuContainer');
        this.$biss = this.$widget.find('#bissContainer');
        this.placeholder = this.$ele.attr('placeholder');
        this.source = [];
        this.status = false; //后台查询状态
        this.menuStatus = false; //前台查询状态

        this._addEvent();
        this._parseData(datas || []);
    },
    _addEvent: function() {
        var self = this;
        var valOld = '';
        //搜索面板显示
        self.$ele.focus(function() {
            self.$widget.show();
            self._title();
            self.$biss.html('');
        });
        //监听输入
        self.$ele.keyup(function() {
            var val = this.value;
            var searchstr = $.trim(val);

            if (searchstr.length > 1) {
                valOld = searchstr;
                self._draw(searchstr);
            } else {
                self._title();
            }
        });
        //点击插叙到的结果后面板隐藏
        self.$widget.on('click', ' a', function() {
            setTimeout(function() {
                self.hide();
            }, 0);
        });
        //点击面板和搜索框意外隐藏
        $(document).on('mousedown', function(e) {
            if ($(e.target).closest('#searchSmarty').length == 0 && e.target != self.$ele[0]) {
                self.hide();
            }
        });

        self._placeholder();
    },
    //解析全部菜单数据,便于检索
    _parseData: function(datas) {
        var self = this;
        for (var i = 0; i < datas.length; i++) {
            var obj = datas[i];
            if (obj.action) {
                self.source.push(obj);
            }
        }
    },
    //隐藏
    hide: function() {
        this.$widget.hide();
        this.$ele.val('');
        this.$ele.blur();
    },
    //搜索方法
    _search: function(value) {
        var self = this,
            len = self.source.length,
            result = [];

        for (var i = 0; i < len; i++) {
            var obj = self.source[i];
            if (obj.name.indexOf(value) >= 0) {
                result.push(obj);
            }
        }
        return result;
    },
    _isEmptyObject: function(obj) {
        for (var key in obj) {
            return false;
        }
        return true;
    },
    //向后台请求查询搜索字的全文内容
    _getData: function(key) {

        var self = this;

        if (self.status) {
            return false;
        }

        if (!self.menuStatus) {
            self._loading();
        }
        self.status = true;
        $.ajax({
            type: "GET",
            url: getRootPath() + '/oa/quickSearch/manage.action?content=' + encodeURI(key) + '&v=' + (+new Date()),
            dataType: "json",
            success: function(data) {
                self.status = false;
                if (self._isEmptyObject(data)) {
                    self._fail('biss');
                    if (!self.menuStatus) {
                        self._fail('menu');
                    }
                    return false;
                }
                if (!self.menuStatus) {
                    self._fail('empty');
                }
                var result = [];
                //收件箱信息
                if (data.reciveMailUrl) {
                    result.push(self._getBusinessTemplate(0, data.reciveMailUrl, data.reciveMailTitle));
                }
                //发件箱信息
                if (data.sendMailUrl) {
                    result.push(self._getBusinessTemplate(1, data.sendMailUrl, data.sendMailTitle));
                }
                //收文
                if (data.reciveDocUrl) {
                    result.push(self._getBusinessTemplate(2, data.reciveDocUrl, data.reciveDocTitle));
                    //reciveDocState：收文详细页状态（只有当仅查到一条收文数据时才会有reciveDocState）
                }
                //发文
                if (data.sendDocUrl) {
                    result.push(self._getBusinessTemplate(3, data.sendDocUrl, data.sendDocTitle));
                    //sendDocState：发文详细页状态（只有当仅查到一条发文数据时才会有sendDocState）
                }
                self.$biss.html(result.join(''));
            }
        });
    },

    _loading: function() {
        this.$menu.html('正在搜索...');
    },
    //查询失败
    _fail: function(type) {
        if (type == 'empty') {
            this.$menu.empty();
        }
        if (type == 'menu') {
            this.$menu.html('未查询到结果!');
        }
        if (type == 'biss') {
            this.$biss.empty();
        }
    },
    _title: function() {
        this.$biss.html('');
        this.$menu.html('请输入大于1个检索文字!');
    },
    _placeholder: function() {
        var self = this;
        //模拟水印
        if (JC.browser.ie && JC.browser.version < 10) {
            self.$ele.focus(function(e) {
                if (this.value == self.placeholder) {
                    this.value = '';
                    self.$ele.removeClass('placeholder');
                }
            });

            self.$ele.blur(function(e) {
                if (this.value == '') {
                    this.value = self.placeholder;
                    self.$ele.addClass('placeholder');
                }
            });
            self.$ele.val(self.placeholder);
        }
    },
    _draw: function(value) {
        var data = this._search(value);
        if (data.length) {
            this.menuStatus = true;
            this.$menu.html(this._getMenuTemplate(data)).off().on('click', ' a', function(e) {
                var $this = $(e.target);

                if (!$this.is('a')) {
                    $this = $this.parent();
                }

                JC.LoadPage({
                    id: $this.attr('ids'),
                    name: $this.attr('name'),
                    url: $this.attr('action') + '&menuId=' + $this.attr('ids').split('_')[1] ///搜索中添加menuid用来查询导航页的菜单
                });
            });
        } else {
            this.menuStatus = false;
            this._fail('menu');
        }
        this._getData(value);
    },
    //菜单模版
    _getMenuTemplate: function(datas) {
        var len = datas.length,
            template = [],
            i = 0;
        template.push('<h2>常用功能</h2><ul class="ul-icon clearfix">');

        for (; i < len; i++) {
            var obj = datas[i];
            template.push('<li class="icon' + ((i % 8) + 1) + '"> <a href="#" action="' + obj.action + '" ids="jcleftmenu_' + obj.id + '" name="' + obj.name + '" title="' + obj.name + '"> ' +
                '<i class="fa fa-personage"></i><span>' + (obj.name.length > 4 ? obj.name.substring(0, 4) : obj.name) + '</span> </a> </li>');
        }
        template.push('</ul>');

        return template.join('');
    },
    //全文模版
    _getBusinessTemplate: function(type, url, title) {
        var tempType = ['收件箱', '已发送', '收文', '发文'],
            template = [];
        template.push('<h2>' + tempType[type] + '</h2><ul class="relevant-mail">');
        template.push('<li><a href="javascript:;" onclick="JC.LoadPage({url : \'' + url + '\'});">' + title + '</a></li>');
        //template.push(' <li><a href="#"><span>办公</span>室通知，办公桌面要保持干净</a></li>');
        template.push('</ul>');
        return template.join('');
    }
});
/**
 * 个人信息
 */
JC.UserInfo = Clazz.extend({
    construct: function(config) {
        this.$contariner = $('#user-avatar');
        this.$panel = $('#h-nav-list');
        this.$btn = this.$panel.find('ul a,ul button');
        this.status = false;
        this._default(config);
        this._addEvent();
    },
    _default: function(opt) {
        var self = this;
        for (var key in opt) {
            if (opt.hasOwnProperty(key)) {
                self.$btn.filter(function() {
                    var type = $(this).attr('types');
                    if (type == key && this.name == opt[key]) {
                        $(this).addClass('active');
                    }
                });
            }
        }
    },
    _addEvent: function() {
        var self = this;
        self.$contariner.hover(function() {
            self.panelShow();
        }, function() {
            self.panelHide();
        });
        self.$btn.on('click', function(e) {
            if (!self.status) {
                self.btnChange($(this).is('a') ? 'a' : 'button', this);
            }
            e.preventDefault();
        });
    },
    //用户头像个人设置显示
    panelShow: function() {
        var self = this;
        self.$panel.stop(true, true).show(1000 / 60, function() {
            self._mask(true);
        });
    },
    panelHide: function() {
        var self = this;
        self.$panel.stop(true, true).hide(1000 / 60, function() {
            self._mask(false);
        });
    },
    btnChange: function(selector, ele) {
        var $ele = $(ele),
            type = $ele.attr('types'),
            value = $ele.attr('name');
        $ele.closest('div').find(selector).removeClass('active');
        $ele.addClass('active');
        this._handle(type, value);
    },
    _handle: function(type, value) {
        if (type === 'voice') {
            this._setVoice(value == 'on');
            return false;
        }
        this._execute(type, value);
    },
    _setVoice: function(flag) {
        $.cookie('voiceSwitch', '' + flag);
    },
    _execute: function(type, value) {
        var self = this;
        if (self.status) {
            return false;
        }
        self.status = true;
        $.ajax({
            url: getRootPath() + '/oa/userExtend/updateSkin.action?' + type + '=' + value + '&time=' + (+new Date()),
            type: 'POST',
            success: function(data) {
                self.status = false;
                if (data == 'true') {
                    JC.histObj.reload();
                }
            }
        });
    },
    _mask: function(isShow) {
        if (JC.browser.ie) {
            if (this.$mask && !isShow) {
                this.$mask.remove();
                return false;
            }
            var mask = document.createElement("iframe");
            mask.id = 'avatarFrameMask';
            mask.style.backgroundColor = "transparent";
            mask.style.cssText = 'position: absolute; top: 60px; right: 0px; width: 226px; height: 349px;filter:alpha(opacity=0);z-index:0;';
            mask.setAttribute('frameborder', '0', 0);
            mask.src = "javascript:'';";
            document.body.appendChild(mask);
            this.$mask = $('#avatarFrameMask');
        }
    }
});
//左菜单模拟滚动条
JC.leftScroll = function(option){
   // $('#slim-scroll').slimScroll(option);
}
//跳转页面方法, 公共
JC.LoadPage = function(menu, isEmpty) {
    if (menu.url) {
        function gotoPage() {
            var lcoal = window.location;
            lcoal.href = 'http://' + lcoal.host + menu.url;

            /* return false; */
            JC.setMailStatus(false);

            if (isEmpty) JC.histObj.empty();
            JC.histObj.setData(menu);
            if (menu.id) {
                var menuId = (menu.id.indexOf('jcleftmenu') != -1) ? menu.id.split('jcleftmenu_')[1] : menuId;
                desktop.sidemenu.setThisMeunId(menuId);
            }
            if (window.mainFrame) {
                var thref = mainFrame.location;
                thref.href = getRootPath() + menu.url;
            }
        }
        if (JC.getMailStatus()) {
            msgBox.confirm({
                content: '您正在写邮件，是否离开此页面?',
                success: function() {
                    var iframe = JC.getFrame();
                    iframe && iframe.pageMethon();
                    gotoPage();
                },
                noback: function() {
                    gotoPage();
                },
                cancel: function() {
                    JC.histObj.sidemenu.goActivity(JC.histObj.sidemenu.getThisMenuId());
                },
                buttons: {
                    "离开并存草稿": "yes",
                    "取消": "no",
                    "离开": "cancel"
                }
            });
            return false;
        }
        gotoPage();
    }
}

JC.setMailStatus = function(status) {
    JC.saveMailObject = status;
}

JC.getMailStatus = function() {
    return JC.saveMailObject;
}

/* 跳转页面方法, 公共 */
function goDefaultMenu() {
    //跳转指定页面
    if ('') {
        JC.LoadPage({
            url: ''
        });
    } else if ('') {
        //跳转默认门户
        JC.LoadPage({
            url: ''
        });
    }
}

//退出登录
function exit() {
    JC.layer.confirm({
        content: "是否退出吗？",
        yes:function(){
           // promptOnUnLoad();
            location.href = "/login";
        }
    });
}

$(document).on('click', '[data-id^="class"]', function(e) {
    e && e.preventDefault();
    var $this = $(e.target),
        $class, $target, $tmp, $classes, $targets;
    !$this.data('tip') && ($this = $this.closest('[data-id^="class"]'));
    $class = $this.data()['id'];
    $target = $this.data('target') || $this.attr('href');
    $class && ($tmp = $class.split(':')[1]) && ($classes = $tmp.split(','));
    $target && ($targets = $target.split(','));
    $targets && $targets.length && $.each($targets, function(index, value) {
        (

            $targets[index] != '#') && $($targets[index]).toggleClass($classes[index]);


    });
    if($("#nav").hasClass('nav-xs')){
        $("#JCLeftMenu>li").each(function(value,index){
            var title = $(index).attr('li-title');
            $(index).attr('data-original-title',title);
        });
    }else{
        $("#JCLeftMenu>li").attr('data-original-title','');
    }
    $this.hasClass('active') ? ($this.attr("data-original-title", "隐藏菜单")) : ($this.attr("data-original-title", "显示菜单"));
    $this.hasClass('active') ? ($this.find('i').attr("class", "fa fa-caret-left")) : ($this.find('i').attr("class", "fa fa-caret-right"));
    $this.toggleClass('active');
    $('#nav').hide().show();
});
function setWindowWidth(){
    var $document = window.screen.availWidth;
    var $header = $("#desktop_header");
    if($document > 1440){
        $header.addClass("header-1920");
    } 
    if($document < 1440){
        $header.addClass("header-1366");
    }
}
$(document).ready(function() {
    $(window).resize(function(){
        JC.leftScroll({
            height : 'auto'
        });
    });
    $("#user-avatar").hover(function() {
        $("#h-nav-list").show();
    }, function() {
        $("#h-nav-list").hide();
    })
    $("#more").hover(function() {
        $(".more-con").show();
    }, function() {
        $(".more-con").hide();
    })
    $("#scrollable").click(function(){
        $("#JCLeftMenu ul").hide();
    });
    setWindowWidth();
    $(window).resize(function(){
        setWindowWidth();
    });
	
})