/**
 * 查询条件显示隐藏功能代码
 */
+ function($) {
    "use strict";
    $.fn.searchControl = function(b) {
        return $.fn.searchControl.defaults = {
            btnShow: "显示查询条件",
            btnHide: "收起查询条件",
            btnClik: ".search-btn-one",
            iconUp: "fa-caret-up",
            iconDown: "fa-caret-down",
            container: ".search-line",
            defaultShow: b
        }, this.each(function(b) {
            console.log(this);
            var option = $.extend({}, $.fn.searchControl.defaults, b),
                reThis = $(this).find("div.active").length ? null : reThis,
                $this = reThis || $(this);

            var b = function() {
                var child = $(this).children();
                console.log(option.iconUp);
                if ($(child[0]).hasClass(option.iconDown)) {
                    $(child[0]).removeClass(option.iconDown).addClass(option.iconUp);
                    $(child[1]).text(option.btnHide)
                } else {
                    $(child[0]).removeClass(option.iconUp).addClass(option.iconDown);
                    $(child[1]).text(option.btnShow)
                }
                $this.find(option.container).slideToggle(300);
            }

            if (option.defaultShow) {
                var child = $(option.btnClik).children();
                $(child[0]).removeClass(option.iconDown).addClass(option.iconUp);
                $(child[1]).text(option.btnHide);
                $this.find(option.container).show();
            }

            $this.off().on("click", option.btnClik, b);
        });
    }
}(jQuery);