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
        //鼠标滑过菜单

        this.$ele.hover(function(){
           $(this).find('ul.nav').show();
        },function(){
            $(this).find('ul.nav').hide();
        })
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
        if (menuId) {
            this.level = [];
            this.setThisMeunId(menuId);
            var rootMenu = this.getByRoot(menuId);
            this.headMenu = this.level.pop();
            this.getTemplateLeft1(rootMenu, this.level);
            JC.leftScroll();
        }
    },
    getCrumbs: function(id) {
        var arys = this.getMenuCrumbs(id);
        var crustr = ['<div class="crumbs"><a href="/">首页</a><i></i>'],
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
        /*  console.log(this.option.first);*/
        /* console.log(menu);*/
        //if (this.headMenu) JC.navigation(this.headMenu.id);
        var result = [];
        for (var i = 0; i < menus.length; i++) {
            var menu = menus[i];
            var ac = this.checked(this.level, menu.id);
            result.push()
            result.push('<li id="header_'+menu.id+'" ' + ac + '><a href="javascript:void(0)" ' + ac + ' name="' + menu.name + '" potal data-head="menu" id="jcleftmenu_' + menu.id + '" action="' + menu.action + '" ' + this.getEventDom(menu) + '>');
           /* result.push('<i class="' + menu.icon + '"><b class="b-bg-' + (i % 8) + '"></b></i>');*/
            if (menu.children) {
                result.push('');
                //result.push('<span class="pull-right"><i class="fa fa-minus " style="display: none"></i><i class="fa fa-plus2"></i></span>');
            }
            result.push('<span>' + menu.name +'</span>');
            result.push('</a>');
            if (menu.children) {
                this.getTemplateLeft1(menu, levels)
                /*result.push('<ul class="nav">');
                result.push(this.getTemplateLeft1(menu, levels));
                result.push('</ul>');*/
            }
            result.push('</li>');
        }
        result.push('<li id="topnav-other_modules" style="display: block;"><a href="#">更多<i class="topnav-other_modules fa-sort-down"></i></a></li>');
        this.option.first.html(result.join(''));
    },
    getTemplateLeft1: function(menus, levels) {
        if (this.headMenu) JC.navigation(this.headMenu.id);
        if (menus.children) {
            var result = [];
            for (var i = 0; i < menus.children.length; i++) {
                var menu = menus.children[i];
                var ac = this.checked(this.level, menu.id);
                result.push('<li ' + ac + '><a href="javascript:void(0)" ' + ac + ' name="' + menu.name + '" id="jcleftmenu_' + menu.id + '" action="' + menu.action + '" ' + this.getEventDom(menu) + '>');
               /* result.push('<i class="' + menu.icon + '"><b class="b-bg-' + (i % 8) + '"></b></i>');*/
                if (menu.children) {

                    result.push('<span class="pull-right"></span><i class="fa fa-angle-right text" style="display: inline-block;float: right"></i>');
                }
                result.push('<span>' + menu.name + '</span>');
                result.push('</a>');
                if (menu.children) {
                    result.push('<ul class="animated nav lt">');
                    result.push(this.getTemplateLeft2(menu.children, levels));
                    result.push('</ul>');
                }
                result.push('</li>');
            }
            this.$ele.html(result.join(''));
            /* console.log(this.$ele);*/
        }
    },
    getTemplateLeft2: function(menus, levels) {
        var ary = [];
        //菜单第二级
        for (var i = 0; i < menus.length; i++) {
            var obj = menus[i];
            var ay = this.checked(this.level, obj.id);
            ary.push('<li ' + ay + '><a href="javascript:void(0)" ' + ay + ' name="' + obj.name + '" id="jcleftmenu_' + obj.id + '" action="' + obj.action + '" ' + this.getEventDom(obj) + '>');
          /*  if (obj.children) {

                ary.push('<i class="fa fa-chevron-down text"></i><i class="fa fa-chevron-up text-active"></i>');
            } else {
               /!* ary.push('<i class="fa fa-angle-right"></i>');*!/
            }*/
            ary.push('<span>' + obj.name + '</span>');
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
        //左菜单第三级
        for (var i = 0; i < menus.length; i++) {
            var obj = menus[i];
            var ax = this.checked(this.level, obj.id);
            ary.push('<li ' + ax + '><a href="javascript:void(0)" ' + ax + ' name="' + obj.name + '" id="jcleftmenu_' + obj.id + '" action="' + obj.action + '" ' + this.getEventDom(obj) + '>');
            ary.push('<i class="fa fa-angle-right"></i>');
            ary.push('<span>' + obj.name + '</span></a>');
            ary.push('</li>');
        }
        return ary.join('');
    },
    setData: function(data, callback) {
        this.cacheData = this._parse($.parseJSON(data));
        this.level1 = $.parseJSON(data);
        /* console.log(this.level1);*/
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
  /*  _activity: function($e) {
        var $p = $e.parent();
        var $active = $p.siblings('.' + this.active);
        var chevrondown = $('.fa-chevron-down');
        if(chevrondown.length && chevrondown[0].style.display == ''){
            chevrondown[0].style.display = 'none';
        }
        //查看是否同级有展开的
        if ($active.length) {
            //获取已打开的同级列表,然后关闭
            var $li_active = $e.siblings('ul.nav').find('li.active');
            $active.find('> a').removeClass(this.active);

            if($li_active.find('>a').length){
                var $a_active_id = $li_active.find('>a').attr('id').split('jcleftmenu_')[1];
                var $href_id = window.location.href.split('=')[1];
                $a_active_id == $href_id?$li_active.find('>a').addClass(this.active):$li_active.find('>a').removeClass(this.active);
            }

            $active.removeClass(this.active).find('> ul:visible').slideUp(200);
        }
        //将当前的列表展开或收起
        $e.next()[$e.hasClass(this.active) ? 'slideUp' : 'slideDown'](200, function() {

            JC.leftScroll();
        });
        //置换当前展开收起状态
        this.$element =$e.toggleClass(this.active); $p.toggleClass(this.active);
        //阻止默认事件
        return false;
    },*/
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
/**
 * 一级导航添加背景色
 * @param id  导航id
 * 2018-6-12陈梦佳修改
 */
JC.navigation = function(id){
    var $nav = $('#navigation-header');
    var $childs = $nav.find('li');

    $childs.removeClass('active');

    var $this = $('#header_'+id);
    $this.addClass('active');
    var other = $this.closest('#topnav-other_modules');
    if(other.length) other.addClass('active');
}

//左菜单模拟滚动条
JC.leftScroll = function(option){
        //$('#slim-scroll').slimScroll(option);



    }


    /**
     * @introduce   其他模块
     * @author      gezhigang1005@163.com
     * @date        2014-10-09 14:33:20
     */
    +function($) {
        "use strict";
        var OtherModule = function(element) {
            this.$element = $(element);
            this.headerN = this.$element.closest(".header-nav");
            this.initNav();
        }

        OtherModule.prototype.initNav = function() {
            var uWidths = this.headerN.next().outerWidth(true),
                headliW = this.headerN.find("ul li:first-child").next().outerWidth(),
                dcWidth = $(window.parent.document).width(),
                $header = this.headerN,
                modules = this.$element,
                liNum = 1,
                ohterWidth = 380;

            this.headerN.find("ul li").hide();
            if (dcWidth < 1300) {
                this.headerN.find("li h1").css("font-size", "20px");
                $("#nav").removeClass("aside-md").addClass("aside-smd");
            } else {
                this.headerN.find("li h1").css("font-size", "24px");
                $("#nav").removeClass("aside-smd").addClass("aside-md");
            }

            this.headerN.find("ul li").each(function(e) {
                if ($header.width() + headliW * 4 + uWidths + 5 > dcWidth) {
                    !modules.find("ul")[0] && modules.append("<ul></ul>").show();
                    $(this).next()[0] && modules.find("ul").width(liNum > 4 ? ohterWidth : headliW * liNum);
                    $(this).next()[0] && modules.find("ul").append($(this)) && liNum++;
                }
                $(this).show();
            });
            if (modules.find("ul li").length == 1) {
                this.headerN.find("#topnav-other_modules").before(this.headerN.find("li li"));
            }
            if (!modules.find("ul li")[0]) {
                modules.hide().find("ul").remove();
            }
        }

        var orthershow = function(obj) {
            var nx = $(obj);
            if (!nx.is(":visible")) {
                $(obj).parent().addClass("other");
                nx.show();
                if (JC.browser.ie) initIframe(nx.offset().top, nx.offset().left, nx.width(), nx.height());
            }
        }

        var ortherhide = function(obj) {
            $(obj).parent().removeClass("other");
            if (JC.browser.ie) $("#iframeHeadCovere_e").remove();
            $(obj).hide();
        }

        var initIframe = function(x, y, w, h) {
            var ifr = document.createElement("iframe");
            ifr.id = "iframeHeadCovere_e";
            ifr.style.backgroundColor = "transparent";
            ifr.style.cssText = "position:absolute;top:" + x + "px;left:" + y + "px;width:" + w + "px;height:" + h + "px;filter:alpha(opacity=0);";
            ifr.setAttribute('frameborder', '0', 0);
            ifr.src = "javascript:'';";
            document.body.appendChild(ifr);
            $("#iframeHeadCovere_e").show();
        }
        var old = $.fn.other;

        $.fn.other = function(option) {
            return this.each(function() {
                var $this = $(this)
                var data = $this.data('bs.other')
                $this.data('bs.other', (data = new OtherModule(this)))
                if (typeof option == 'string') data[option]()
            })
        }
        $.fn.other.Constructor = OtherModule;

        $.fn.other.noConflict = function() {
            $.fn.other = old;
            return this;
        }

        $(window).resize(function(e) {
            var headN = $(".header-nav");
            headN.find("#topnav-other_modules").before(headN.find("li li"));
            var $m = $("#topnav-other_modules");
            $m.other("initNav");
            $m.removeClass("other11");
            $m.find("ul").hide();
            if (JC.browser.ie) {
                if ($("#iframeHeadCovere_e").length) $("#iframeHeadCovere_e").remove();
            }
        });

        $(document).on("mouseenter.bs.other", "#topnav-other_modules", function(e) {
            orthershow($(this).children().eq(1));
            e && e.preventDefault();
        });

      $(document).on("mouseleave.bs.other", "#topnav-other_modules", function(e) {
            ortherhide($(this).children().eq(1));
            e && e.preventDefault();
        }).ready(function(){
            $("#topnav-other_modules").other();
        });
    }(jQuery);