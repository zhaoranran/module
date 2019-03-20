/* ========================================================================
 * Bootstrap: transition.js v3.3.2
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+ function($) {
    'use strict';

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap')

        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        }

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return { end: transEndEventNames[name] }
            }
        }

        return false // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false
        var $el = this
        $(this).one('bsTransitionEnd', function() { called = true })
        var callback = function() { if (!called) $($el).trigger($.support.transition.end) }
        setTimeout(callback, duration)
        return this
    }

    $(function() {
        $.support.transition = transitionEnd()

        if (!$.support.transition) return

        $.event.special.bsTransitionEnd = {
            bindType: $.support.transition.end,
            delegateType: $.support.transition.end,
            handle: function(e) {
                if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
            }
        }
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.3.2
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */
+
function($) {
    'use strict';

    // MODAL CLASS DEFINITION
    // ======================

    var Modal = function(element, options) {
        this.options = options
        this.$body = $(document.body)
        this.$element = $(element)
        this.$backdrop = null
        this.isShown = null
        this.scrollbarWidth = 0

        if (this.options.remote) {
            this.$element
                .find('.modal-content')
                .load(this.options.remote, $.proxy(function() {
                    this.$element.trigger('loaded.bs.modal')
                }, this))
        }
    }

    Modal.VERSION = '3.3.2'

    Modal.TRANSITION_DURATION = 300
    Modal.BACKDROP_TRANSITION_DURATION = 150

    Modal.BACKDROPCOUNT = 0
    Modal.DOALOGBASEZINDEX = 1050
    Modal.BACKDROPBASEZINDEX = 1040

    Modal.DEFAULTS = {
        backdrop:'static',
        keyboard: true,
        show: true
    }

    Modal.prototype.toggle = function(_relatedTarget) {
        return this.isShown ? this.hide() : this.show(_relatedTarget)
    }

    Modal.prototype.show = function(_relatedTarget) {
        var that = this
        var e = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

        this.$element.trigger(e)

        if (this.isShown || e.isDefaultPrevented()) return

        this.isShown = true

        this.checkScrollbar()
        this.setScrollbar()
        this.$body.addClass('modal-open')

        //this.escape()
        this.resize()

        this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

        this.backdrop(function() {
            var transition = $.support.transition && that.$element.hasClass('fade')

            if (!that.$element.parent().length) {
                that.$element.appendTo(that.$body) // don't move modals dom position
            }

            that.$element
                .show()
                .scrollTop(0)

            that.$backdrop.css({ 'z-index': Modal.BACKDROPBASEZINDEX + Modal.BACKDROPCOUNT * 20 });

            that.$element.css({ 'z-index': Modal.DOALOGBASEZINDEX + Modal.BACKDROPCOUNT * 20 });

            Modal.BACKDROPCOUNT++;

            if (that.options.backdrop) that.adjustBackdrop()
            that.adjustDialog()

            if (transition) {
                that.$element[0].offsetWidth // force reflow
            }

            that.$element
                .addClass('in')
                .attr('aria-hidden', false)

            that.enforceFocus()

            var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

            transition ?
                that.$element.find('.modal-dialog') // wait for modal to slide in
                .one('bsTransitionEnd', function() {
                    that.$element.trigger('focus').trigger(e)
                })
                .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
                that.$element.trigger('focus').trigger(e)
        })
    }

    Modal.prototype.hide = function(e) {
        if (e) e.preventDefault()

        e = $.Event('hide.bs.modal')

        this.$element.trigger(e)

        if (!this.isShown || e.isDefaultPrevented()) return

        this.isShown = false

        //this.escape()
        this.resize()

        $(document).off('focusin.bs.modal')

        this.$element
            .removeClass('in')
            .attr('aria-hidden', true)
            .off('click.dismiss.bs.modal')

        $.support.transition && this.$element.hasClass('fade') ?
            this.$element
            .one('bsTransitionEnd', $.proxy(this.hideModal, this))
            .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
            this.hideModal()
    }

    Modal.prototype.enforceFocus = function() {
        $(document)
            .off('focusin.bs.modal') // guard against infinite focus loop
            .on('focusin.bs.modal', $.proxy(function(e) {
                if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
                    this.$element.trigger('focus')
                }
            }, this))
    }

    Modal.prototype.escape = function() {
        if (this.isShown && this.options.keyboard) {
            this.$element.on('keydown.dismiss.bs.modal', $.proxy(function(e) {
                e.which == 27 && this.hide()
            }, this))
        } else if (!this.isShown) {
            this.$element.off('keydown.dismiss.bs.modal')
        }
    }

    Modal.prototype.resize = function() {
        if (this.isShown) {
            $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
        } else {
            $(window).off('resize.bs.modal')
        }
    }

    Modal.prototype.hideModal = function() {
        var that = this
        this.$element.hide()
        this.backdrop(function() {
            that.$body.removeClass('modal-open')
            that.resetAdjustments()
            that.resetScrollbar()
            that.$element.trigger('hidden.bs.modal')
            Modal.BACKDROPCOUNT--
        })
    }

    Modal.prototype.removeBackdrop = function() {
        this.$backdrop && this.$backdrop.remove()
        this.$backdrop = null
    }

    Modal.prototype.backdrop = function(callback) {
        var that = this
        var animate = this.$element.hasClass('fade') ? 'fade' : '';
        
        if (this.isShown && this.options.backdrop) {
            var doAnimate = $.support.transition && animate

            this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
                .prependTo(that.$body)
                .on('click.dismiss.bs.modal', $.proxy(function(e) {
                    if (e.target !== e.currentTarget) return
                    this.options.backdrop == 'static' ?
                        this.$element[0].focus.call(this.$element[0]) :
                        this.hide.call(this)
                }, this))

            if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

            this.$backdrop.addClass('in')

            if (!callback) return

            doAnimate ?
                this.$backdrop
                .one('bsTransitionEnd', callback)
                .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
                callback()

        } else if (!this.isShown && this.$backdrop) {
            this.$backdrop.removeClass('in')

            var callbackRemove = function() {
                that.removeBackdrop()
                callback && callback()
            }
            $.support.transition && this.$element.hasClass('fade') ?
                this.$backdrop
                .one('bsTransitionEnd', callbackRemove)
                .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
                callbackRemove()

        } else if (callback) {
            callback()
        }
    }
    // these following methods are used to handle overflowing modals
    Modal.prototype.handleUpdate = function() {
        if (this.options.backdrop) this.adjustBackdrop()
        this.adjustDialog()
    }

    Modal.prototype.adjustBackdrop = function() {
        this.$backdrop
            .css('height', 0)
            .css('height', this.$element[0].scrollHeight)
    }

    Modal.prototype.adjustDialog = function() {
        var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

        this.$element.css({
            paddingLeft: !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
            paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
        })
    }

    Modal.prototype.resetAdjustments = function() {
        this.$element.css({
            paddingLeft: '',
            paddingRight: ''
        })
    }

    Modal.prototype.checkScrollbar = function() {
        this.bodyIsOverflowing = document.body.scrollHeight > document.documentElement.clientHeight
        this.scrollbarWidth = this.measureScrollbar()
    }

    Modal.prototype.setScrollbar = function() {
        var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
        if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
    }

    Modal.prototype.resetScrollbar = function() {
        this.$body.css('padding-right', '')
    }

    Modal.prototype.measureScrollbar = function() { // thx walsh
        var scrollDiv = document.createElement('div')
        scrollDiv.className = 'modal-scrollbar-measure'
        this.$body.append(scrollDiv)
        var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
        this.$body[0].removeChild(scrollDiv)
        return scrollbarWidth
    }
    // MODAL PLUGIN DEFINITION
    function Plugin(option, _relatedTarget) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.modal')
            var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)
            if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
            if (typeof option == 'string') data[option](_relatedTarget)
            else if (options.show) data.show(_relatedTarget)
        })
    }
    var old = $.fn.modal
    $.fn.modal = Plugin
    $.fn.modal.Constructor = Modal
    // MODAL NO CONFLICT
    $.fn.modal.noConflict = function() {
        $.fn.modal = old
        return this
    }
    // MODAL DATA-API
    $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function(e) {
        var $this = $(this)
        var href = $this.attr('href')
        var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
        var option = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

        if ($this.is('a')) e.preventDefault()

        $target.one('show.bs.modal', function(showEvent) {
            if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
            $target.one('hidden.bs.modal', function() {
                $this.is(':visible') && $this.trigger('focus')
            })
        })
        Plugin.call($target, option, this)
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.0.3
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */
+function ($) { "use strict";
    var Tooltip = function (element, options) {
        this.type       =
            this.options    =
                this.enabled    =
                    this.timeout    =
                        this.hoverState =
                            this.$element   = null

        this.init('tooltip', element, options)
    }

    Tooltip.DEFAULTS = {
        animation: true
        , placement: 'top'
        , selector: false
        , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
        , trigger: 'hover focus'
        , title: ''
        , delay: 0
        , html: false
        , container: false
    }

    Tooltip.prototype.init = function (type, element, options) {
        this.enabled  = true
        this.type     = type
        this.$element = $(element)
        this.options  = this.getOptions(options)

        var triggers = this.options.trigger.split(' ')

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i]

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
            } else if (trigger != 'manual') {
                var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focus'
                var eventOut = trigger == 'hover' ? 'mouseleave' : 'blur'

                this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
                this.$element.on('click' + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
            }
        }

        this.options.selector ?
            (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
            this.fixTitle()
    }

    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS
    }

    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options)

        if (options.delay && typeof options.delay == 'number') {
            options.delay = {
                show: options.delay
                , hide: options.delay
            }
        }

        return options
    }

    Tooltip.prototype.getDelegateOptions = function () {
        var options  = {}
        var defaults = this.getDefaults()

        this._options && $.each(this._options, function (key, value) {
            if (defaults[key] != value) options[key] = value
        })

        return options
    }

    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)
        clearTimeout(self.timeout)

        self.hoverState = 'in'

        if (!self.options.delay || !self.options.delay.show) return self.show()

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') self.show()
        }, self.options.delay.show)
    }

    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)
        clearTimeout(self.timeout)
        self.hoverState = 'out'

        if (!self.options.delay || !self.options.delay.hide) return self.hide()

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') self.hide()
        }, self.options.delay.hide)
    }

    Tooltip.prototype.show = function () {
        var e = $.Event('show.bs.'+ this.type)

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e)

            if (e.isDefaultPrevented()) return

            var $tip = this.tip()

            this.setContent()

            if (this.options.animation) $tip.addClass('fade')

            var placement = typeof this.options.placement == 'function' ?
                this.options.placement.call(this, $tip[0], this.$element[0]) :
                this.options.placement

            var autoToken = /\s?auto?\s?/i
            var autoPlace = autoToken.test(placement)
            if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

            $tip
                .detach()
                .css({ top: 0, left: 0, display: 'block' })
                .addClass(placement)

            this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

            var pos          = this.getPosition()
            var actualWidth  = $tip[0].offsetWidth
            var actualHeight = $tip[0].offsetHeight

            if (autoPlace) {
                var $parent = this.$element.parent()

                var orgPlacement = placement
                var docScroll    = document.documentElement.scrollTop || document.body.scrollTop
                var parentWidth  = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth()
                var parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight()
                var parentLeft   = this.options.container == 'body' ? 0 : $parent.offset().left

                placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                    placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                        placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                            placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                                placement

                $tip
                    .removeClass(orgPlacement)
                    .addClass(placement)
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

            this.applyPlacement(calculatedOffset, placement)
            this.$element.trigger('shown.bs.' + this.type)
        }
    }

    Tooltip.prototype.applyPlacement = function(offset, placement) {
        var replace
        var $tip   = this.tip()
        var width  = $tip[0].offsetWidth
        var height = $tip[0].offsetHeight

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10)
        var marginLeft = parseInt($tip.css('margin-left'), 10)
        var winW = $("#scrollable").width();
        // we must check for NaN for ie 8/9
        if (isNaN(marginTop))  marginTop  = 0
        if (isNaN(marginLeft)) marginLeft = 0

        offset.top  = offset.top  + marginTop
        offset.left = offset.left + marginLeft

        if(this.$element.closest('.input-textarea').length != 0){
            if(winW < offset.left+this.$element.offset().left){
                offset.left = offset.left - width + this.$element.width()+15;
                $tip.addClass('pop-right')
            }
        }

        $tip
            .offset(offset)
            .addClass('in')

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth  = $tip[0].offsetWidth
        var actualHeight = $tip[0].offsetHeight

        if (placement == 'top' && actualHeight != height) {
            replace = true
            offset.top = offset.top + height - actualHeight
        }

        if (/bottom|top/.test(placement)) {
            var delta = 0
            if (offset.left < 0) {
                delta       = offset.left * -2
                offset.left = 0

                $tip.offset(offset)

                actualWidth  = $tip[0].offsetWidth
                actualHeight = $tip[0].offsetHeight
            }

            this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
        } else {
            this.replaceArrow(actualHeight - height, actualHeight, 'top')
        }

        if (replace) $tip.offset(offset)
    }

    Tooltip.prototype.replaceArrow = function(delta, dimension, position) {
        this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + "%") : '')
    }

    Tooltip.prototype.setContent = function () {
        var $tip  = this.tip()
        var title = this.getTitle()

        $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
        $tip.removeClass('fade in top bottom left right')
    }

    Tooltip.prototype.hide = function () {
        var that = this
        var $tip = this.tip()
        var e    = $.Event('hide.bs.' + this.type)

        function complete() {
            if (that.hoverState != 'in') $tip.detach()
        }

        this.$element.trigger(e)

        if (e.isDefaultPrevented()) return

        $tip.removeClass('in')

        $.support.transition && this.$tip.hasClass('fade') ?
            $tip
                .one($.support.transition.end, complete)
                .emulateTransitionEnd(150) :
            complete()

        this.$element.trigger('hidden.bs.' + this.type)
        return this
    }

    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element
        if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
        }
    }

    Tooltip.prototype.hasContent = function () {
        return this.getTitle()
    }

    Tooltip.prototype.getPosition = function () {
        var el = this.$element[0]
        return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
            width: el.offsetWidth
            , height: el.offsetHeight
        }, this.$element.offset())
    }

    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
            placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
                placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
                    /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }

    }

    Tooltip.prototype.getTitle = function () {
        var title
        var $e = this.$element
        var o  = this.options

        title = $e.attr('data-original-title')
            || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

        return title
    }

    Tooltip.prototype.tip = function () {
        return this.$tip = this.$tip || $(this.options.template)
    }

    Tooltip.prototype.arrow = function () {
        return this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow')
    }

    Tooltip.prototype.validate = function () {
        if (!this.$element[0].parentNode) {
            this.hide()
            this.$element = null
            this.options  = null
        }
    }

    Tooltip.prototype.enable = function () {
        this.enabled = true
    }

    Tooltip.prototype.disable = function () {
        this.enabled = false
    }

    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled
    }

    Tooltip.prototype.toggle = function (e) {
        var self = e ? $(e.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type) : this
        self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
    }

    Tooltip.prototype.destroy = function () {
        this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
    }
    // TOOLTIP PLUGIN DEFINITION
    // =========================
    var old = $.fn.tooltip

    $.fn.tooltip = function (option) {
        return this.each(function () {
            var $this   = $(this)
            var data    = $this.data('bs.tooltip')
            var options = typeof option == 'object' && option

            if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    $.fn.tooltip.Constructor = Tooltip
    // TOOLTIP NO CONFLIC
    // ==================
    $.fn.tooltip.noConflict = function () {
        $.fn.tooltip = old
        return this
    }
}(jQuery);
    //大弹框
+function ($) { "use strict";
    var downarea = function (element, options) {
        this.init('downarea', element, options)
    }
    downarea.DEFAULTS = $.extend({} , $.fn.tooltip.Constructor.DEFAULTS, {
        placement: 'bottom'
        , trigger: 'focus '
        , content: '<textarea rows="10" style="width:700px"></textarea>'
        , html:true
        , container:'#scrollable'
        , template: '<div class="popover downarea"><div class="arrow"></div><div class="popover-content"></div></div>'
    })
    downarea.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)
    downarea.prototype.constructor = downarea
    downarea.prototype.init = function (type, element, options) {
        this.enabled  = true
        this.type     = type
        this.$element = $(element)
        //this.values   = this.$element.val()
        this.options  = this.getOptions(options)

        var triggers = this.options.trigger.split(' ')

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i]
            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
            } else if (trigger != 'manual') {
                var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focus'
                this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
            }
        }
        this.options.selector ?
            (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
            this.fixTitle()
    }
    downarea.prototype.getDefaults = function () {
        return downarea.DEFAULTS
    }
    downarea.prototype.setContent = function () {
        var $tip    = this.tip()
        var textareaValue = $tip.find('textarea').val();
        var title   = this.getTitle()
        var content = this.getContent()
        $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
        $tip.find('.popover-content')[this.options.html ? 'html' : 'text'](content)
        //console.log(this.values)

        var descrip_1 = this.$element.html();
        $tip.find('textarea').val(this.br2Enter(descrip_1));
        //$tip.find('textarea').val(this.$element.html())
        $tip.removeClass('fade top bottom left right in')
        if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
    }
    downarea.prototype.enter2Br = function (str){
        return str.replace(/\n/g,'<br/>').replace(/\s/g,"&nbsp;");
    }
    downarea.prototype.br2Enter = function (str){
        return str.replace(/<br>/ig,"\r\n").replace(/(&nbsp;)/g," ").replace(/(&amp;)/g,"&").replace(/(&lt;)/g,"<").replace(/(&gt;)/g,">");
    }
    downarea.prototype.hasContent = function () {
        return this.getTitle() || this.getContent()
    }
    downarea.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return { top: pos.top + pos.height,   left: pos.left}
    }
    downarea.prototype.getContent = function () {
        var $e = this.$element
        var o  = this.options
        return $e.attr('data-content')
            || (typeof o.content == 'function' ?
                o.content.call($e[0]) :
                o.content)
    }
    downarea.prototype.arrow = function () {
        return this.$arrow = this.$arrow || this.tip().find('.arrow')
    }
    downarea.prototype.tip = function () {
        if (!this.$tip) this.$tip = $(this.options.template)
        return this.$tip
    }
    downarea.prototype.out = function () {
        this.hoverState = 'out'
        this.hide()
    }
    downarea.prototype.focus = function () {
        var $tip = this.tip()
        var $e   = this.$element;
        var $this = this;
        $tip.find("textarea").unbind("blur");
        $tip.find("textarea").focus().on("blur",function(a){
            var descrip = $(a.target).val();
            $(a.target).val($this.enter2Br(descrip));
            if($(a.target).val()== ""){ $e.html("")};
            !!$(a.target).val()&&$e.html($(a.target).val());
            $e.downarea("out")
        });
        $(function(){
            var t=$tip.find('textarea').val();
            $tip.find('textarea').val('').select().val(t);
        })
    }

    var old = $.fn.downarea
    $.fn.downarea = function (option) {
        return this.each(function (e) {
            var $this   = $(this)
            var data    = $this.data('bs.downarea')
            var options = typeof option == 'object' && option
            if (!data) $this.data('bs.downarea', (data = new downarea(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }
    $.fn.downarea.Constructor = downarea
    $.fn.downarea.noConflict = function () {
        $.fn.downarea = old
        return this
    }
}(jQuery);
/* ========================================================================
* Bootstrap: dropdown.js v3.0.3
* http://getbootstrap.com/javascript/#dropdowns
* ========================================================================
* Copyright 2013 Twitter, Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* ======================================================================== */
+function ($) { "use strict";
    var backdrop = '.dropdown-backdrop'
    var toggle   = '[data-toggle=dropdown]'
    var Dropdown = function (element) {
        $(element).on('click.bs.dropdown', this.toggle)
    }
    Dropdown.prototype.toggle = function (e) {
        var $this = $(this)

        if ($this.is('.disabled, :disabled')) return

        var $parent  = getParent($this)
        var isActive = $parent.hasClass('open')

        clearMenus()

        if (!isActive) {
            if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
                // if mobile we use a backdrop because click events don't delegate
                $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
            }

            $parent.trigger(e = $.Event('show.bs.dropdown'))

            if (e.isDefaultPrevented()) return

            $parent
                .toggleClass('open')
                .trigger('shown.bs.dropdown')

            var otop = $this.offset().top
            var ttop = $parent.find('.dropdown-menu').height()
            var wtop = window.screen.availHeight
            if(otop+ttop+135 > wtop){$parent.addClass('dropup')}else{$parent.removeClass('dropup')}
            $this.focus()
        }
        return false;
    }

    Dropdown.prototype.keydown = function (e) {
        if (!/(38|40|27)/.test(e.keyCode)) return
        var $this = $(this)
        e.preventDefault()
        e.stopPropagation()

        if ($this.is('.disabled, :disabled')) return

        var $parent  = getParent($this)
        var isActive = $parent.hasClass('open')

        if (!isActive || (isActive && e.keyCode == 27)) {
            if (e.which == 27) $parent.find(toggle).focus()
            return $this.click()
        }

        var $items = $('[role=menu] li:not(.divider):visible a', $parent)

        if (!$items.length) return

        var index = $items.index($items.filter(':focus'))

        if (e.keyCode == 38 && index > 0)                 index--                        // up
        if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
        if (!~index)                                      index=0

        $items.eq(index).focus()
    }

    function clearMenus() {
        $(backdrop).remove()
        $(toggle).each(function (e) {
            var $parent = getParent($(this))
            if (!$parent.hasClass('open')) return
            $parent.trigger(e = $.Event('hide.bs.dropdown'))
            if (e.isDefaultPrevented()) return
            $parent.removeClass('open').trigger('hidden.bs.dropdown')
        })
    }

    function getParent($this) {
        var selector = $this.attr('data-target')

        if (!selector) {
            selector = $this.attr('href')
            selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
        }

        var $parent = selector && $(selector)

        return $parent && $parent.length ? $parent : $this.parent()
    }
    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    var old = $.fn.dropdown

    $.fn.dropdown = function (option) {
        return this.each(function () {
            var $this = $(this)
            var data  = $this.data('bs.dropdown')

            if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
            if (typeof option == 'string') data[option].call($this)
        })
    }

    $.fn.dropdown.Constructor = Dropdown
    // DROPDOWN NO CONFLICT
    // ====================

    $.fn.dropdown.noConflict = function () {
        $.fn.dropdown = old
        return this
    }
    $(document)
        .on('click.bs.dropdown.data-api', clearMenus)
        .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
        .on('click.bs.dropdown.data-api'  , toggle, Dropdown.prototype.toggle)
        .on('keydown.bs.dropdown.data-api', toggle + ', [role=menu]' , Dropdown.prototype.keydown)
}(jQuery);
/* ========================================================================
* Bootstrap: tooltip.js v3.0.3
* http://getbootstrap.com/javascript/#tooltip
* Inspired by the original jQuery.tipsy by Jason Frame
* ========================================================================
* Copyright 2013 Twitter, Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* ======================================================================== */
+function ($) { "use strict";
    var Tooltip = function (element, options) {
        this.type       =
            this.options    =
                this.enabled    =
                    this.timeout    =
                        this.hoverState =
                            this.$element   = null

        this.init('tooltip', element, options)
    }

    Tooltip.DEFAULTS = {
        animation: true
        , placement: 'top'
        , selector: false
        , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
        , trigger: 'hover focus'
        , title: ''
        , delay: 0
        , html: false
        , container: false
    }

    Tooltip.prototype.init = function (type, element, options) {
        this.enabled  = true
        this.type     = type
        this.$element = $(element)
        this.options  = this.getOptions(options)

        var triggers = this.options.trigger.split(' ')

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i]

            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
            } else if (trigger != 'manual') {
                var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focus'
                var eventOut = trigger == 'hover' ? 'mouseleave' : 'blur'

                this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
                this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
                this.$element.on('click' + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
            }
        }

        this.options.selector ?
            (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
            this.fixTitle()
    }

    Tooltip.prototype.getDefaults = function () {
        return Tooltip.DEFAULTS
    }

    Tooltip.prototype.getOptions = function (options) {
        options = $.extend({}, this.getDefaults(), this.$element.data(), options)

        if (options.delay && typeof options.delay == 'number') {
            options.delay = {
                show: options.delay
                , hide: options.delay
            }
        }

        return options
    }

    Tooltip.prototype.getDelegateOptions = function () {
        var options  = {}
        var defaults = this.getDefaults()

        this._options && $.each(this._options, function (key, value) {
            if (defaults[key] != value) options[key] = value
        })

        return options
    }

    Tooltip.prototype.enter = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)
        clearTimeout(self.timeout)

        self.hoverState = 'in'

        if (!self.options.delay || !self.options.delay.show) return self.show()

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'in') self.show()
        }, self.options.delay.show)
    }

    Tooltip.prototype.leave = function (obj) {
        var self = obj instanceof this.constructor ?
            obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)
        clearTimeout(self.timeout)
        self.hoverState = 'out'

        if (!self.options.delay || !self.options.delay.hide) return self.hide()

        self.timeout = setTimeout(function () {
            if (self.hoverState == 'out') self.hide()
        }, self.options.delay.hide)
    }

    Tooltip.prototype.show = function () {
        var e = $.Event('show.bs.'+ this.type)

        if (this.hasContent() && this.enabled) {
            this.$element.trigger(e)

            if (e.isDefaultPrevented()) return

            var $tip = this.tip()

            this.setContent()

            if (this.options.animation) $tip.addClass('fade')

            var placement = typeof this.options.placement == 'function' ?
                this.options.placement.call(this, $tip[0], this.$element[0]) :
                this.options.placement

            var autoToken = /\s?auto?\s?/i
            var autoPlace = autoToken.test(placement)
            if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

            $tip
                .detach()
                .css({ top: 0, left: 0, display: 'block' })
                .addClass(placement)

            this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

            var pos          = this.getPosition()
            var actualWidth  = $tip[0].offsetWidth
            var actualHeight = $tip[0].offsetHeight

            if (autoPlace) {
                var $parent = this.$element.parent()

                var orgPlacement = placement
                var docScroll    = document.documentElement.scrollTop || document.body.scrollTop
                var parentWidth  = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth()
                var parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight()
                var parentLeft   = this.options.container == 'body' ? 0 : $parent.offset().left

                placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                    placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                        placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                            placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                                placement

                $tip
                    .removeClass(orgPlacement)
                    .addClass(placement)
            }

            var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

            this.applyPlacement(calculatedOffset, placement)
            this.$element.trigger('shown.bs.' + this.type)
        }
    }

    Tooltip.prototype.applyPlacement = function(offset, placement) {
        var replace
        var $tip   = this.tip()
        var width  = $tip[0].offsetWidth
        var height = $tip[0].offsetHeight

        // manually read margins because getBoundingClientRect includes difference
        var marginTop = parseInt($tip.css('margin-top'), 10)
        var marginLeft = parseInt($tip.css('margin-left'), 10)
        var winW = $("#scrollable").width();
        // we must check for NaN for ie 8/9
        if (isNaN(marginTop))  marginTop  = 0
        if (isNaN(marginLeft)) marginLeft = 0

        offset.top  = offset.top  + marginTop
        offset.left = offset.left + marginLeft

        if(this.$element.closest('.input-textarea').length != 0){
            if(winW < offset.left+this.$element.offset().left){
                offset.left = offset.left - width + this.$element.width()+15;
                $tip.addClass('pop-right')
            }
        }

        $tip
            .offset(offset)
            .addClass('in')

        // check to see if placing tip in new offset caused the tip to resize itself
        var actualWidth  = $tip[0].offsetWidth
        var actualHeight = $tip[0].offsetHeight

        if (placement == 'top' && actualHeight != height) {
            replace = true
            offset.top = offset.top + height - actualHeight
        }

        if (/bottom|top/.test(placement)) {
            var delta = 0
            if (offset.left < 0) {
                delta       = offset.left * -2
                offset.left = 0

                $tip.offset(offset)

                actualWidth  = $tip[0].offsetWidth
                actualHeight = $tip[0].offsetHeight
            }

            this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
        } else {
            this.replaceArrow(actualHeight - height, actualHeight, 'top')
        }

        if (replace) $tip.offset(offset)
    }

    Tooltip.prototype.replaceArrow = function(delta, dimension, position) {
        this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + "%") : '')
    }

    Tooltip.prototype.setContent = function () {
        var $tip  = this.tip()
        var title = this.getTitle()

        $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
        $tip.removeClass('fade in top bottom left right')
    }

    Tooltip.prototype.hide = function () {
        var that = this
        var $tip = this.tip()
        var e    = $.Event('hide.bs.' + this.type)

        function complete() {
            if (that.hoverState != 'in') $tip.detach()
        }

        this.$element.trigger(e)

        if (e.isDefaultPrevented()) return

        $tip.removeClass('in')

        $.support.transition && this.$tip.hasClass('fade') ?
            $tip
                .one($.support.transition.end, complete)
                .emulateTransitionEnd(150) :
            complete()

        this.$element.trigger('hidden.bs.' + this.type)
        return this
    }

    Tooltip.prototype.fixTitle = function () {
        var $e = this.$element
        if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
            $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
        }
    }

    Tooltip.prototype.hasContent = function () {
        return this.getTitle()
    }

    Tooltip.prototype.getPosition = function () {
        var el = this.$element[0]
        return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
            width: el.offsetWidth
            , height: el.offsetHeight
        }, this.$element.offset())
    }

    Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
            placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
                placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
                    /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }

    }

    Tooltip.prototype.getTitle = function () {
        var title
        var $e = this.$element
        var o  = this.options

        title = $e.attr('data-original-title')
            || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

        return title
    }

    Tooltip.prototype.tip = function () {
        return this.$tip = this.$tip || $(this.options.template)
    }

    Tooltip.prototype.arrow = function () {
        return this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow')
    }

    Tooltip.prototype.validate = function () {
        if (!this.$element[0].parentNode) {
            this.hide()
            this.$element = null
            this.options  = null
        }
    }

    Tooltip.prototype.enable = function () {
        this.enabled = true
    }

    Tooltip.prototype.disable = function () {
        this.enabled = false
    }

    Tooltip.prototype.toggleEnabled = function () {
        this.enabled = !this.enabled
    }

    Tooltip.prototype.toggle = function (e) {
        var self = e ? $(e.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type) : this
        self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
    }

    Tooltip.prototype.destroy = function () {
        this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
    }
    // TOOLTIP PLUGIN DEFINITION
    // =========================
    var old = $.fn.tooltip

    $.fn.tooltip = function (option) {
        return this.each(function () {
            var $this   = $(this)
            var data    = $this.data('bs.tooltip')
            var options = typeof option == 'object' && option

            if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    $.fn.tooltip.Constructor = Tooltip
    // TOOLTIP NO CONFLIC
    // ==================
    $.fn.tooltip.noConflict = function () {
        $.fn.tooltip = old
        return this
    }
}(jQuery);
/* ========================================================================
* Bootstrap: popover.js v3.0.3
* http://getbootstrap.com/javascript/#popovers
* ========================================================================
* Copyright 2013 Twitter, Inc.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* ======================================================================== */
+function ($) { "use strict";
    var Popover = function (element, options) {
        this.init('popover', element, options)
    }
    if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

    Popover.DEFAULTS = $.extend({} , $.fn.tooltip.Constructor.DEFAULTS, {
        placement: 'right'
        , trigger: 'click'
        , content: ''
        , template: '<div class="popover downarea fade in bottom" style="display:block;"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
    })
    // NOTE: POPOVER EXTENDS tooltip.js
    // ================================
    Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

    Popover.prototype.constructor = Popover

    Popover.prototype.getDefaults = function () {
        return Popover.DEFAULTS
    }

    Popover.prototype.setContent = function () {
        var $tip    = this.tip()
        var title   = this.getTitle()
        var content = this.getContent()

        $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
        $tip.find('.popover-content')[this.options.html ? 'html' : 'text'](content)

        $tip.removeClass('fade top bottom left right in')

        // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
        // this manually by checking the contents.
        if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
    }

    Popover.prototype.hasContent = function () {
        return this.getTitle() || this.getContent()
    }

    Popover.prototype.getContent = function () {
        var $e = this.$element
        var o  = this.options

        return $e.attr('data-content')
            || (typeof o.content == 'function' ?
                o.content.call($e[0]) :
                o.content)
    }

    Popover.prototype.arrow = function () {
        return this.$arrow = this.$arrow || this.tip().find('.arrow')
    }

    Popover.prototype.tip = function () {
        if (!this.$tip) this.$tip = $(this.options.template)
        return this.$tip
    }
    // POPOVER PLUGIN DEFINITION
    // =========================
    var old = $.fn.popover

    $.fn.popover = function (option) {
        return this.each(function () {
            var $this   = $(this)
            var data    = $this.data('bs.popover')
            var options = typeof option == 'object' && option

            if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    $.fn.popover.Constructor = Popover
    // POPOVER NO CONFLICT
    // ===================
    $.fn.popover.noConflict = function () {
        $.fn.popover = old
        return this
    }

}(jQuery);

+function ($) { "use strict";
    var downarea = function (element, options) {
        this.init('downarea', element, options)
    }
    downarea.DEFAULTS = $.extend({} , $.fn.tooltip.Constructor.DEFAULTS, {
        placement: 'bottom'
        , trigger: 'focus '
        , content: '<textarea rows="10" style="width:700px"></textarea>'
        , html:true
        , container:'#scrollable'
        , template: '<div class="popover downarea"><div class="arrow"></div><div class="popover-content"></div></div>'
    })
    downarea.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)
    downarea.prototype.constructor = downarea
    downarea.prototype.init = function (type, element, options) {
        this.enabled  = true
        this.type     = type
        this.$element = $(element)
        //this.values   = this.$element.val()
        this.options  = this.getOptions(options)

        var triggers = this.options.trigger.split(' ')

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i]
            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
            } else if (trigger != 'manual') {
                var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focus'
                this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
            }
        }
        this.options.selector ?
            (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
            this.fixTitle()
    }
    downarea.prototype.getDefaults = function () {
        return downarea.DEFAULTS
    }
    downarea.prototype.setContent = function () {
        var $tip    = this.tip()
        var textareaValue = $tip.find('textarea').val();
        var title   = this.getTitle()
        var content = this.getContent()
        $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
        $tip.find('.popover-content')[this.options.html ? 'html' : 'text'](content)
        //console.log(this.values)

        var descrip_1 = this.$element.html();
        $tip.find('textarea').val(this.br2Enter(descrip_1));
        //$tip.find('textarea').val(this.$element.html())
        $tip.removeClass('fade top bottom left right in')
        if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
    }
    downarea.prototype.enter2Br = function (str){
        return str.replace(/\n/g,'<br/>').replace(/\s/g,"&nbsp;");
    }
    downarea.prototype.br2Enter = function (str){
        return str.replace(/<br>/ig,"\r\n").replace(/(&nbsp;)/g," ").replace(/(&amp;)/g,"&").replace(/(&lt;)/g,"<").replace(/(&gt;)/g,">");
    }
    downarea.prototype.hasContent = function () {
        return this.getTitle() || this.getContent()
    }
    downarea.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
        return { top: pos.top + pos.height,   left: pos.left}
    }
    downarea.prototype.getContent = function () {
        var $e = this.$element
        var o  = this.options
        return $e.attr('data-content')
            || (typeof o.content == 'function' ?
                o.content.call($e[0]) :
                o.content)
    }
    downarea.prototype.arrow = function () {
        return this.$arrow = this.$arrow || this.tip().find('.arrow')
    }
    downarea.prototype.tip = function () {
        if (!this.$tip) this.$tip = $(this.options.template)
        return this.$tip
    }
    downarea.prototype.out = function () {
        this.hoverState = 'out'
        this.hide()
    }
    downarea.prototype.focus = function () {
        var $tip = this.tip()
        var $e   = this.$element;
        var $this = this;
        $tip.find("textarea").unbind("blur");
        $tip.find("textarea").focus().on("blur",function(a){
            var descrip = $(a.target).val();
            $(a.target).val($this.enter2Br(descrip));
            if($(a.target).val()== ""){ $e.html("")};
            !!$(a.target).val()&&$e.html($(a.target).val());
            $e.downarea("out")
        });
        $(function(){
            var t=$tip.find('textarea').val();
            $tip.find('textarea').val('').select().val(t);
        })
    }

    var old = $.fn.downarea
    $.fn.downarea = function (option) {
        return this.each(function (e) {
            var $this   = $(this)
            var data    = $this.data('bs.downarea')
            var options = typeof option == 'object' && option
            if (!data) $this.data('bs.downarea', (data = new downarea(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }
    $.fn.downarea.Constructor = downarea
    $.fn.downarea.noConflict = function () {
        $.fn.downarea = old
        return this
    }
}(jQuery);
/*个人计划中大弹框插件（基于Tooltip）*/
+ function($) {
    "use strict";
    var downarea = function(element, options) {
        this.init('downarea', element, options)
    }
    downarea.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
        placement: 'bottom',
        trigger: 'focus ',
        content: '<textarea rows="10" style="width:700px"></textarea>',
        html: true,
        container: '#scrollable',
        template: '<div class="popover downarea"><div class="arrow"></div><div class="popover-content"></div></div>'
    })
    downarea.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)
    downarea.prototype.constructor = downarea
    downarea.prototype.init = function(type, element, options) {
        this.enabled = true
        this.type = type
        this.$element = $(element)
        //this.values   = this.$element.val()
        this.options = this.getOptions(options)

        var triggers = this.options.trigger.split(' ')

        for (var i = triggers.length; i--;) {
            var trigger = triggers[i]
            if (trigger == 'click') {
                this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
            } else if (trigger != 'manual') {
                var eventIn = trigger == 'hover' ? 'mouseenter' : 'focus'
                this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
            }
        }
        this.options.selector ?
            (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
            this.fixTitle()
    }
    downarea.prototype.getDefaults = function() {
        return downarea.DEFAULTS
    }
    downarea.prototype.setContent = function() {
        var $tip = this.tip()
        var textareaValue = $tip.find('textarea').val();
        var title = this.getTitle()
        var content = this.getContent()
        $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
        $tip.find('.popover-content')[this.options.html ? 'html' : 'text'](content)
        //console.log(this.values)

        var descrip_1 = this.$element.html();
        $tip.find('textarea').val(this.br2Enter(descrip_1));
        //$tip.find('textarea').val(this.$element.html())
        $tip.removeClass('fade top bottom left right in')
        if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
    }
    downarea.prototype.enter2Br = function(str) {
        return str.replace(/\n/g, '<br/>').replace(/\s/g, "&nbsp;");
    }
    downarea.prototype.br2Enter = function(str) {
        return str.replace(/<br>/ig, "\r\n").replace(/(&nbsp;)/g, " ").replace(/(&amp;)/g, "&").replace(/(&lt;)/g, "<").replace(/(&gt;)/g, ">");
    }
    downarea.prototype.hasContent = function() {
        return this.getTitle() || this.getContent()
    }
    downarea.prototype.getCalculatedOffset = function(placement, pos, actualWidth, actualHeight) {
        return { top: pos.top + pos.height, left: pos.left }
    }
    downarea.prototype.getContent = function() {
        var $e = this.$element
        var o = this.options
        return $e.attr('data-content') ||
            (typeof o.content == 'function' ?
                o.content.call($e[0]) :
                o.content)
    }
    downarea.prototype.arrow = function() {
        return this.$arrow = this.$arrow || this.tip().find('.arrow')
    }
    downarea.prototype.tip = function() {
        if (!this.$tip) this.$tip = $(this.options.template)
        return this.$tip
    }
    downarea.prototype.out = function() {
        this.hoverState = 'out'
        this.hide()
    }
    downarea.prototype.focus = function() {
        var $tip = this.tip()
        var $e = this.$element;
        var $this = this;
        $tip.find("textarea").unbind("blur");
        $tip.find("textarea").focus().on("blur", function(a) {
            var descrip = $(a.target).val();
            $(a.target).val($this.enter2Br(descrip));
            if ($(a.target).val() == "") { $e.html("") };
            !!$(a.target).val() && $e.html($(a.target).val());
            $e.downarea("out")
        });
        $(function() {
            var t = $tip.find('textarea').val();
            $tip.find('textarea').val('').select().val(t);
        })
    }

    var old = $.fn.downarea
    $.fn.downarea = function(option) {
        return this.each(function(e) {
            var $this = $(this)
            var data = $this.data('bs.downarea')
            var options = typeof option == 'object' && option
            if (!data) $this.data('bs.downarea', (data = new downarea(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }
    $.fn.downarea.Constructor = downarea
    $.fn.downarea.noConflict = function() {
        $.fn.downarea = old
        return this
    }
}(jQuery);

$(document).on('focus', '.input-textarea tbody td input[type="text"]', function(e) {
    //console.log(e);

    $(e.target).hasClass("fzrOnfocus") && $('#myModal').modal('show');

    $(e.target).hasClass("down-area") && $(e.target).downarea("show");

    $(e.target).on('shown.bs.downarea', function(e) { $(e.target).downarea("focus") })
}); /* 计划编制input获取焦点弹出人员选择树或文本域 */
$(document).on('focus', '.input-textarea tbody td div', function(e) {
    //console.log(e);

    $(e.target).hasClass("fzrOnfocus") && $('#myModal').modal('show');

    $(e.target).hasClass("down-area") && $(e.target).downarea("show");
    $(e.target).on('shown.bs.downarea', function(e) {

        $(e.target).downarea("focus")
    })
});
/* ========================================================================
 * Bootstrap: tab.js v3.0.3
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */

+function ($) { "use strict";
    // TAB CLASS DEFINITION
    // ====================
    var Tab = function (element) {
        this.element = $(element)
    }

    Tab.prototype.show = function () {
        var $this    = this.element
        var $ul      = $this.closest('ul:not(.dropdown-menu)')
        var selector = $this.data('target')

        if (!selector) {
            selector = $this.attr('href')
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
        }

        if ($this.parent('li').hasClass('active')) return

        var previous = $ul.find('.active:last a')[0]
        var e        = $.Event('show.bs.tab', {
            relatedTarget: previous
        })

        $this.trigger(e)

        if (e.isDefaultPrevented()) return

        var $target = $(selector)

        this.activate($this.parent('li'), $ul)
        this.activate($target, $target.parent(), function () {
            $this.trigger({
                type: 'shown.bs.tab'
                , relatedTarget: previous
            })
        })
    }

    Tab.prototype.activate = function (element, container, callback) {
        var $active    = container.find('> .active')
        var transition = callback
            && $.support.transition
            && $active.hasClass('fade')

        function next() {
            $active
                .removeClass('active')
                .find('> .dropdown-menu > .active')
                .removeClass('active')

            element.addClass('active')

            if (transition) {
                element[0].offsetWidth // reflow for transition
                element.addClass('in')
            } else {
                element.removeClass('fade')
            }

            if (element.parent('.dropdown-menu')) {
                element.closest('li.dropdown').addClass('active')
            }

            callback && callback()
        }

        transition ?
            $active
                .one($.support.transition.end, next)
                .emulateTransitionEnd(150) :
            next()

        $active.removeClass('in')
    }
    // TAB PLUGIN DEFINITION
    // =====================
    var old = $.fn.tab

    $.fn.tab = function ( option ) {
        return this.each(function () {
            var $this = $(this)
            var data  = $this.data('bs.tab')

            if (!data) $this.data('bs.tab', (data = new Tab(this)))
            if (typeof option == 'string') data[option]()
        })
    }

    $.fn.tab.Constructor = Tab
    // TAB NO CONFLICT
    // ===============
    $.fn.tab.noConflict = function () {
        $.fn.tab = old
        return this
    }
    // TAB DATA-API
    // ============
    $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
        $(this).tab('show');
        e.preventDefault();
        e.stopPropagation();
    })
}(jQuery);
/*
 鼠标经过切换事件
 */
+function ($) { "use strict";
    // TAB CLASS DEFINITION
    // ====================
    var TabHover = function (element) {
        this.element = $(element)
    }

    TabHover.prototype.show = function () {
        var $this    = this.element
        var $ul      = $this.closest('ul:not(.dropdown-menu)')
        var selector = $this.data('target')

        if (!selector) {
            selector = $this.attr('href')
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
        }

        if ($this.parent('li').hasClass('active')) return

        var previous = $ul.find('.active:last a')[0]
        var e        = $.Event('show.bs.tab', {
            relatedTarget: previous
        })

        $this.trigger(e)

        if (e.isDefaultPrevented()) return

        var $target = $(selector)
        $target.css("display","")
        this.activate($this.parent('li'), $ul)
        this.activate($target, $target.parent(), function () {
            $this.trigger({
                type: 'shown.bs.tab'
                , relatedTarget: previous
            })
        })
    }

    TabHover.prototype.activate = function (element, container, callback) {
        var $active    = container.find('> .active')
        var transition = callback
            && $.support.transition
            && $active.hasClass('fade')

        $active
            .removeClass('active')
            .find('> .dropdown-menu > .active')
            .removeClass('active')

        element.addClass('active')

        if (transition) {
            element[0].offsetWidth // reflow for transition
            element.addClass('in')
        } else {
            element.removeClass('fade')
        }

        if (element.parent('.dropdown-menu')) {
            element.closest('li.dropdown').addClass('active')
        }

        callback && callback()
        $active.removeClass('in')
    }
    // TAB PLUGIN DEFINITION
    // =====================
    var old = $.fn.tabhover

    $.fn.tabhover = function ( option ) {
        return this.each(function () {
            var $this = $(this)
            var data  = $this.data('bs.tab')

            if (!data) $this.data('bs.tab', (data = new TabHover(this)))
            if (typeof option == 'string') data[option]()
        })
    }

    $.fn.tabhover.Constructor = TabHover
    // TAB NO CONFLICT
    // ===============
    $.fn.tabhover.noConflict = function () {
        $.fn.tabhover = old
        return this
    }
    // TAB DATA-API
    // ============
    $(document).on('mouseover.bs.tab.data-api', '[data-toggle="hover"]', function (e) {
        e.preventDefault()
        $(this).tabhover('show')
    })
}(jQuery);


/**
 * @license
 * =========================================================
 * bootstrap-datetimepicker.js
 * http://www.eyecon.ro/bootstrap-datepicker
 * =========================================================
 * Copyright 2012 Stefan Petre
 *
 * Contributions:
 *  - Andrew Rowls
 *  - Thiago de Arruda
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =========================================================
 * 时间插件
 */

(function($) {

    // Picker object
    var smartPhone = (window.orientation != undefined);
    var DateTimePicker = function(element, options) {
        this.id = dpgId++;
        this.init(element, options);
    };

    var dateToDate = function(dt) {
        if (typeof dt === 'string') {
            return new Date(dt);
        }
        return dt;
    };

    DateTimePicker.prototype = {
        constructor: DateTimePicker,

        init: function(element, options) {
            var icon;
            if (!(options.pickTime || options.pickDate))
                throw new Error('Must choose at least one picker');
            this.options = options;
            this.$element = $(element);
            this.$element.attr("readonly", false);
            this.language = 'zh-CN';

            this.loadShow = options.loadShow;
            this.pickDate = options.pickDate;
            this.pickTime = options.pickTime;
            this.pickSeconds = options.pickSeconds;
            this._isClickInput = false;
            var isPickDate = this.$element.data('pick-date');
            if (isPickDate != undefined) {
                isPickDate ? this.pickDate = true : this.pickDate = false;
            }
            var isPickTime = this.$element.data('pick-time');


            if (isPickTime != undefined) {
                isPickTime ? this.pickTime = true : this.pickTime = false;
            }

            var isPickSecond = this.$element.data('pick-second');
            if (isPickSecond != undefined) {
                isPickSecond ? this.pickSeconds = true : this.pickSeconds = false;
            }


            //      alert(this.pickDate +" "+this.pickTime);
            /*      this.pickDate =  this.$element.data('date') || options.pickDate;
             alert(this.pickDate);
             this.pickTime =  this.$element.data('time') || options.pickTime;*/

            this.isInput = this.$element.is('input');
            this.component = false;
            /*
             if (this.$element.find('.input-append') || this.$element.find('.input-prepend'))
             this.component = this.$element.find('.add-on');
             if (this.component) {
             icon = this.component.find('i');
             }
             */
            if (this.pickTime) {
                //if (icon && icon.length) this.timeIcon = icon.data('time-icon');
                if (!this.timeIcon) this.timeIcon = 'fa fa-clock';
                //icon.addClass(this.timeIcon);
            }
            if (this.pickDate) {
                //if (icon && icon.length) this.dateIcon = icon.data('date-icon');
                if (!this.dateIcon) this.dateIcon = 'fa fa-calendar2';
                //icon.removeClass(this.timeIcon);
                //icon.addClass(this.dateIcon);
            }
            this.format = options.dateFormat;
            if (!this.format) {
                if (this.isInput) this.format = this.$element.data('date-format');
                else this.format = this.$element.find('input').data('date-format');
                if (!this.format) this.format = 'yyyy-MM-dd';
            }
            var isLoadShow = this.$element.hasClass("load-show") ? this.loadShow = 1 : this.loadShow = 0;
            //切记：不能与下面判断合并，此处在显示前禁用时间
            if (isLoadShow) {
                this.pickTime = false;
            }

            this._compileFormat();

            this.widget = $(getTemplate(this.timeIcon, this.pickDate, this.pickTime, options.pick12HourFormat, this.pickSeconds, options.collapse, isLoadShow)).appendTo(isLoadShow ? this.$element : $("body"));

            this.inputStor = {
                hours: this.widget.find("#dpTime input.tb"),
                minutes: this.widget.find("#dpTime input.te"),
                seconds: this.widget.find("#dpTime input.tl")
            };

            if (isLoadShow) {

            }

            this.minViewMode = options.minViewMode || this.$element.data('date-minviewmode') || 0;
            if (typeof this.minViewMode === 'string') {
                switch (this.minViewMode) {
                    case 'months':
                        this.minViewMode = 1;
                        break;
                    case 'years':
                        this.minViewMode = 2;
                        break;
                    default:
                        this.minViewMode = 0;
                        break;
                }
            }
            this.viewMode = options.viewMode || this.$element.data('date-viewmode') || 0;
            if (typeof this.viewMode === 'string') {
                switch (this.viewMode) {
                    case 'months':
                        this.viewMode = 1;
                        break;
                    case 'years':
                        this.viewMode = 2;
                        break;
                    default:
                        this.viewMode = 0;
                        break;
                }
            }
            this.startViewMode = this.viewMode;
            this.weekStart = options.weekStart || this.$element.data('date-weekstart') || 0;
            this.weekEnd = this.weekStart === 0 ? 6 : this.weekStart - 1;
            //      alert(this.$element.data('start-date')||options.startDate );

            this.setStartDate(this.$element.data('start-date') || options.startDate);
            this.setEndDate(this.$element.data('end-date') || options.endDate);

            //      alert(this.startDate);
            //      alert(this.endDate);
            this.fillDow();
            this.fillMonths();
            //this.fillHours();
            //this.fillMinutes();
            //this.fillSeconds();
            this.update();
            this.showMode();
            this._attachDatePickerEvents();
            //this.set();
        },

        show: function(e) {
            var refObjAndOperate = this.$element.data('ref-obj');
            if (refObjAndOperate) {
                tempString = refObjAndOperate.split(" ");
                if (tempString.length == 2) {
                    refObjId = tempString[0];
                    operate = tempString[1];
                    refObj = $(refObjId);
                    if (refObj) {
                        var refObjValue = refObj.val();
                        if (refObjValue) {
                            refObjDate = Date.parse(refObjValue.replace(/-/g, "/"));
                            if (operate == "lt") {
                                this.setEndDate(new Date(refObjDate + 3600 * 24 * 1000));
                            }
                            if (operate == "gt") {
                                this.setStartDate(new Date(refObjDate + 3600 * 8 * 1000));
                            }
                        } else {
                            if (operate == "lt" && typeof this.endDate === 'object') {
                                this.setEndDate(Infinity);
                            }
                            if (operate == "gt" && typeof this.startDate === 'object') {
                                this.setStartDate(-Infinity);
                            }
                        }
                    }
                }
            }

            if (!this.$element.val()) {
                var tempCurrent = new Date();
                this._date = UTCDate(
                    tempCurrent.getFullYear(),
                    tempCurrent.getMonth(),
                    tempCurrent.getDate(),
                    tempCurrent.getHours(),
                    tempCurrent.getMinutes(),
                    tempCurrent.getSeconds(),
                    tempCurrent.getMilliseconds()
                );
                this.viewDate = this._date;
                this.fillDate();
                //return;
            }
            //为弹出框的input注入初始值
            if (this.pickDate && this.pickTime) {
                this.downMenuTime();
                this.setTime(this._date.getUTCHours(), this._date.getUTCMinutes(), this._date.getUTCSeconds());
            }

            if (!this.pickDate && this.pickTime && this.pickSeconds) {
                this.fillTime();
            }
            this.widget.show();

            this.height = this.component ? this.component.outerHeight() : this.$element.outerHeight();
            if (!this.loadShow) {
                this.place();
            }
            this._isClickInput = false;
            this.$element.trigger({
                type: 'show',
                date: this._date
            });
            this._attachDatePickerGlobalEvents(e);
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }
        },

        disable: function() {
            this.$element.find('input').prop('disabled', true);
            this._detachDatePickerEvents();
        },
        enable: function() {
            this.$element.find('input').prop('disabled', false);
            this._attachDatePickerEvents();
        },

        hide: function(e) {
            // Ignore event if in the middle of a picker transition
            if (!this.widget.is(":visible")) {
                return;
            }
            if (this.loadShow) {
                return;
            }

            if (e && (e.target.name == this.$element[0].name)) {
                return;
            }
            var collapse = this.widget.find('.collapse')
            for (var i = 0; i < collapse.length; i++) {
                var collapseData = collapse.eq(i).data('collapse');
                if (collapseData && collapseData.transitioning)
                    return;
            }
            var str = this.$element.val();
            if (str != "" && str != null) {
                var edate = this.parseDate(str);
                if (!edate) {
                    if (confirm("不合法的日期格式或日期超出限定范围,需要撤销吗?")) {
                        this.$element.val("");
                    } else {
                        this.$element.val("");
                    }
                }
            }
            this.widget.hide();
            this.viewMode = this.startViewMode;
            this.showMode();
            //this.set();
            this.$element.trigger({
                type: 'hide',
                date: this._date
            });
            //此处调用关联input失去焦点,方便input再次获取焦点时弹出选择框，
            //由于input注册了onblur事件，调用该隐藏方法，形成嵌套，所以方法开始判断控件是否在显示状态
            //if(this.$element.focus){
            this.$element.blur();
            //}

            this._detachDatePickerGlobalEvents();
        },

        set: function() {
            var formatted = '';
            if (!this._unset) formatted = this.formatDate(this._date);
            var refObjAndOperate = this.$element.data('ref-obj');
            if (refObjAndOperate) {
                tempString = refObjAndOperate.split(" ");
                if (tempString.length == 2) {
                    refObjId = tempString[0];
                    operate = tempString[1];
                    refObj = $(refObjId);
                    if (refObj) {
                        var refObjValue = refObj.val();
                        if (refObjValue) {
                            //refObjDate = Date.parse(refObjValue.replace(/-/g,   "/"));
                            if (operate == "lt") {
                                if (formatted > refObjValue) {
                                    return;
                                }
                            }
                            if (operate == "gt") {
                                if (formatted < refObjValue) {
                                    return;
                                }
                            }
                        }
                    }
                }
            }

            var ted = new Date(Date.parse(formatted.replace(/-/g, "/")) + 3600 * 24 * 1000);
            if (ted.valueOf() > this.endDate.valueOf() || ted.valueOf() < this.startDate.valueOf()) {
                return;
            }
            if (!this.isInput) {
                if (this.component) {
                    var input = this.$element.find('input');
                    input.val(formatted);
                    this._resetMaskPos(input);
                }
                this.$element.data('date', formatted);
            } else {

                this.$element.val(formatted);
                this._resetMaskPos(this.$element);
            }
        },
        //1002
        setValue: function(newDate) {
            if (!newDate) {
                this._unset = true;
            } else {
                this._unset = false;
            }
            if (typeof newDate === 'string') {
                this._date = this.parseDate(newDate);
            } else if (newDate) {
                this._date = new Date(newDate);
            }

            this.set();
            this.viewDate = UTCDate(this._date.getUTCFullYear(), this._date.getUTCMonth(), 1, 0, 0, 0, 0);
            this.fillDate();
            this.fillTime();
        },
        //设置时间 --> 时 分 秒
        setTime: function(hh, mm, ss) {
            var inp = this.widget.find("input");
            var i = 0;
            while (i < inp.length) {
                switch (inp[i].className) {
                    case "tb":
                        this.inputStor.hours.val(padLeft(hh.toString(), 2, "0"));
                        break;
                    case "te":
                        this.inputStor.minutes.val(padLeft(mm.toString(), 2, "0"));
                        break;
                    case "tl":
                        this.inputStor.seconds.val(padLeft(ss.toString(), 2, "0"));
                        break;
                }
                i++;
            }
        },
        //关闭自动提示的时间信息
        downMenuTime: function() {
            $("#dpTime .menuSel").hide();
        },

        getDate: function() {
            if (this._unset) return null;
            return new Date(this._date.valueOf());
        },

        setDate: function(date) {
            if (!date) this.setValue(null);
            else this.setValue(date.valueOf());
        },

        setStartDate: function(date) {
            if (date instanceof Date) {
                this.startDate = date;
            } else if (typeof date === 'string') {
                if (date) {
                    this.startDate = new Date(Date.parse(date.replace(/-/g, "/")) + 3600 * 24 * 1000);
                    //alert( this.startDate);
                    if (!this.startDate.getUTCFullYear()) {
                        this.startDate = -Infinity;
                    }
                }
            } else {
                this.startDate = -Infinity;
            }
            if (this.viewDate) {
                this.update();
            }
        },

        setEndDate: function(date) {
            if (date instanceof Date) {
                this.endDate = date;
            } else if (typeof date === 'string') {
                if (date) {
                    this.endDate = new Date(Date.parse(date.replace(/-/g, "/")));
                    if (!this.endDate.getUTCFullYear()) {
                        this.endDate = Infinity;
                    }
                }
            } else {
                this.endDate = Infinity;
            }
            if (this.viewDate) {
                this.update();
            }
        },

        getLocalDate: function() {
            if (this._unset) return null;
            var d = this._date;
            return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
                d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
        },

        setLocalDate: function(localDate) {
            if (!localDate) this.setValue(null);
            else
                this.setValue(Date.UTC(
                    localDate.getFullYear(),
                    localDate.getMonth(),
                    localDate.getDate(),
                    localDate.getHours(),
                    localDate.getMinutes(),
                    localDate.getSeconds(),
                    localDate.getMilliseconds()));
        },

        place: function() {
            var position = 'absolute';
            var offset = this.component ? this.component.offset() : this.$element.offset();
            this.width = this.component ? this.component.outerWidth() : this.$element.outerWidth(true);
            var dateHeight = this.widget.outerHeight(true), //当前date的高度
                $window = $("body"),
                inputHeight = this.component ? this.component.offset() : this.$element.offset();

            offset.top = offset.top + this.height;

            if (this.options.width != undefined) {
                this.widget.width(this.options.width);
            }

            if (this.options.orientation == 'left') {
                this.widget.addClass('left-oriented');
                offset.left = offset.left - this.width + 20;
            }
            //判断弹出层
            if (this._isInFixed()) {
                position = 'fixed';
                offset.top = inputHeight.top + this.height;
                offset.left = offset.left;
            }
            //判断右边距
            if ($window.width() < inputHeight.left + this.width) {
                offset.right = $window.width() - offset.left - this.width + ((position == 'fixed') ? 155 : 18);
                offset.left = 'auto';
                (position == 'fixed') ? offset.left = offset.left - ((this.width > 120) ? this.height : 105): '';
            } else {
                offset.right = 'auto';
            }
            //判断下边据
            if ($window.height() < (inputHeight.top + dateHeight + 34)) {
                offset.top = offset.top - this.height - dateHeight;
            }

            this.widget.css({
                position: position,
                top: offset.top,
                left: offset.left,
                right: offset.right
            });
            this._modalPlace(this, offset)
        },

        notifyChange: function() {
            this.$element.trigger({
                type: 'changeDate',
                date: this.getDate(),
                localDate: this.getLocalDate()
            });
        },

        update: function(newDate) {
            var dateStr = newDate;
            if (!dateStr) {
                if (this.isInput) {
                    dateStr = this.$element.val();
                } else {
                    dateStr = this.$element.find('input').val();
                }
                if (dateStr) {
                    this._date = this.parseDate(dateStr);
                }
                if (!this._date) {
                    var tmp = new Date()
                    this._date = UTCDate(tmp.getFullYear(),
                        tmp.getMonth(),
                        tmp.getDate(),
                        tmp.getHours(),
                        tmp.getMinutes(),
                        tmp.getSeconds(),
                        tmp.getMilliseconds())
                }
            }
            this.viewDate = UTCDate(this._date.getUTCFullYear(), this._date.getUTCMonth(), 1, 0, 0, 0, 0);
            this.fillDate();
            this.fillTime();
        },

        fillDow: function() {
            var dowCnt = this.weekStart;
            var html = $('<tr>');
            while (dowCnt < this.weekStart + 7) {
                html.append('<th class="dow">' + dates[this.language].daysMin[(dowCnt++) % 7] + '</th>');
            }
            this.widget.find('.datepicker-days thead').append(html);
        },

        fillMonths: function() {
            var html = '';
            var i = 0
            while (i < 12) {
                html += '<span class="month">' + dates[this.language].monthsShort[i++] + '</span>';
            }
            this.widget.find('.datepicker-months td').append(html);
        },

        fillDate: function() {
            var year = this.viewDate.getUTCFullYear();
            var month = this.viewDate.getUTCMonth();
            var currentDate = UTCDate(
                this._date.getUTCFullYear(),
                this._date.getUTCMonth(),
                this._date.getUTCDate(),
                0, 0, 0, 0
            );
            var startYear = typeof this.startDate === 'object' ? this.startDate.getUTCFullYear() : -Infinity;
            var startMonth = typeof this.startDate === 'object' ? this.startDate.getUTCMonth() : -1;
            var endYear = typeof this.endDate === 'object' ? this.endDate.getUTCFullYear() : Infinity;
            var endMonth = typeof this.endDate === 'object' ? this.endDate.getUTCMonth() : 12;

            this.widget.find('.datepicker-days').find('.disabled').removeClass('disabled');
            this.widget.find('.datepicker-months').find('.disabled').removeClass('disabled');
            this.widget.find('.datepicker-years').find('.disabled').removeClass('disabled');

            this.widget.find('.datepicker-days th:eq(1)').text(year + '年 ' + dates[this.language].months[month]);

            var prevMonth = UTCDate(year, month - 1, 28, 0, 0, 0, 0);
            var day = DPGlobal.getDaysInMonth(
                prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
            prevMonth.setUTCDate(day);
            prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.weekStart + 7) % 7);
            if ((year == startYear && month <= startMonth) || year < startYear) {
                this.widget.find('.datepicker-days th:eq(0)').addClass('disabled');
            }
            if ((year == endYear && month >= endMonth) || year > endYear) {
                this.widget.find('.datepicker-days th:eq(2)').addClass('disabled');
            }

            var nextMonth = new Date(prevMonth.valueOf());
            nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
            nextMonth = nextMonth.valueOf();
            var html = [];
            var row;
            var clsName;
            while (prevMonth.valueOf() < nextMonth) {
                if (prevMonth.getUTCDay() === this.weekStart) {
                    row = $('<tr>');
                    html.push(row);
                }
                clsName = '';
                if (prevMonth.getUTCFullYear() < year ||
                    (prevMonth.getUTCFullYear() == year &&
                        prevMonth.getUTCMonth() < month)) {
                    clsName += ' old';
                } else if (prevMonth.getUTCFullYear() > year ||
                    (prevMonth.getUTCFullYear() == year &&
                        prevMonth.getUTCMonth() > month)) {
                    clsName += ' new';
                }
                if (prevMonth.valueOf() === currentDate.valueOf()) {
                    clsName += ' active';
                }
                if ((prevMonth.valueOf() + 86400000) <= this.startDate) {
                    clsName += ' disabled';
                }
                if (prevMonth.valueOf() > this.endDate) {
                    clsName += ' disabled';
                }
                row.append('<td class="day' + clsName + '">' + prevMonth.getUTCDate() + '</td>');
                prevMonth.setUTCDate(prevMonth.getUTCDate() + 1);
            }
            this.widget.find('.datepicker-days tbody').empty().append(html);
            var currentYear = this._date.getUTCFullYear();

            var months = this.widget.find('.datepicker-months').find(
                'th:eq(1)').text(year + '年').end().find('span').removeClass('active');
            if (currentYear === year) {
                months.eq(this._date.getUTCMonth()).addClass('active');
            }
            if (currentYear - 1 < startYear) {
                this.widget.find('.datepicker-months th:eq(0)').addClass('disabled');
            }
            if (currentYear + 1 > endYear) {
                this.widget.find('.datepicker-months th:eq(2)').addClass('disabled');
            }
            for (var i = 0; i < 12; i++) {
                if ((year == startYear && startMonth > i) || (year < startYear)) {
                    $(months[i]).addClass('disabled');
                } else if ((year == endYear && endMonth < i) || (year > endYear)) {
                    $(months[i]).addClass('disabled');
                }
            }

            html = '';
            year = parseInt(year / 10, 10) * 10;
            var yearCont = this.widget.find('.datepicker-years').find(
                'th:eq(1)').text(year + '年 - ' + (year + 9) + '年').end().find('td');
            this.widget.find('.datepicker-years').find('th').removeClass('disabled');
            if (startYear > year) {
                this.widget.find('.datepicker-years').find('th:eq(0)').addClass('disabled');
            }
            if (endYear < year + 9) {
                this.widget.find('.datepicker-years').find('th:eq(2)').addClass('disabled');
            }
            year -= 1;
            for (var i = -1; i < 11; i++) {
                html += '<span class="year' + (i === -1 || i === 10 ? ' old' : '') + (currentYear === year ? ' active' : '') + ((year < startYear || year > endYear) ? ' disabled' : '') + '">' + year + '</span>';
                year += 1;
            }
            yearCont.html(html);
        },

        fillHours: function() {
            var table = this.widget.find(
                '.timepicker .timepicker-hours table');
            table.parent().hide();
            var html = '';
            if (this.options.pick12HourFormat) {
                var current = 1;
                for (var i = 0; i < 3; i += 1) {
                    html += '<tr>';
                    for (var j = 0; j < 4; j += 1) {
                        var c = current.toString();
                        html += '<td class="hour">' + padLeft(c, 2, '0') + '</td>';
                        current++;
                    }
                    html += '</tr>'
                }
            } else {
                var current = 0;
                for (var i = 0; i < 6; i += 1) {
                    html += '<tr>';
                    for (var j = 0; j < 4; j += 1) {
                        var c = current.toString();
                        html += '<td class="hour">' + padLeft(c, 2, '0') + '</td>';
                        current++;
                    }
                    html += '</tr>'
                }
            }
            table.html(html);
        },

        fillMinutes: function() {
            var table = this.widget.find(
                '.timepicker .timepicker-minutes table');
            table.parent().hide();
            var html = '';
            var current = 0;
            for (var i = 0; i < 5; i++) {
                html += '<tr>';
                for (var j = 0; j < 4; j += 1) {
                    var c = current.toString();
                    html += '<td class="minute">' + padLeft(c, 2, '0') + '</td>';
                    current += 3;
                }
                html += '</tr>';
            }
            table.html(html);
        },

        fillSeconds: function() {
            var table = this.widget.find(
                '.timepicker .timepicker-seconds table');
            table.parent().hide();
            var html = '';
            var current = 0;
            for (var i = 0; i < 5; i++) {
                html += '<tr>';
                for (var j = 0; j < 4; j += 1) {
                    var c = current.toString();
                    html += '<td class="second">' + padLeft(c, 2, '0') + '</td>';
                    current += 3;
                }
                html += '</tr>';
            }
            table.html(html);
        },
        //1003
        fillTime: function() {
            if (!this._date)
                return;
            var timeComponents = this.widget.find('.timepicker span[data-time-component]');
            var table = timeComponents.closest('table');
            var is12HourFormat = this.options.pick12HourFormat;
            var hour = this._date.getUTCHours();
            var minute = 0,
                second = 0;
            var period = 'AM';
            if (is12HourFormat) {
                if (hour >= 12) period = 'PM';
                if (hour === 0) hour = 12;
                else if (hour != 12) hour = hour % 12;
                this.widget.find(
                    '.timepicker [data-action=togglePeriod]').text(period);
            }

            hour = hour.toString();
            minute = this._date.getUTCMinutes().toString();
            second = this._date.getUTCSeconds().toString();
            timeComponents.find("input").each(function() {
                switch ($(this).data('action')) {
                    case "selectHour":
                        $(this).val(padLeft(hour, 2, "0"));
                        break;
                    case "selectMinute":
                        $(this).val(padLeft(minute, 2, "0"));
                        break;
                    case "selectSecond":
                        $(this).val(padLeft(second, 2, "0"));
                        break;
                }
            });
            // timeComponents.filter('[data-time-component=hours]').val(hour);
            // timeComponents.filter('[data-time-component=minutes] input').val(minute);
            // timeComponents.filter('[data-time-component=seconds] input').val(second);
        },

        click: function(e) {
            e.stopPropagation();
            e.preventDefault();
            this._unset = false;
            this._isClickInput = false;
            var target = $(e.target).closest('span, td, th, button, i, input');
            if (target.length === 1) {
                if (!target.is('.disabled')) {
                    this.downMenuTime();
                    switch (target[0].nodeName.toLowerCase()) {
                        case 'th':
                            switch (target[0].className) {
                                case 'switch':
                                    this.showMode(1);
                                    break;
                                case 'prev':
                                case 'next':
                                    var vd = this.viewDate;
                                    var navFnc = DPGlobal.modes[this.viewMode].navFnc;
                                    var step = DPGlobal.modes[this.viewMode].navStep;
                                    if (target[0].className === 'prev') step = step * -1;
                                    vd['set' + navFnc](vd['get' + navFnc]() + step);
                                    this.fillDate();
                                    this.set();
                                    break;
                            }
                            break;
                        case 'span':
                            var falg = false;
                            if (target.is('.menuSapn')) {
                                var tae = parseInt(target.text(), 10) || 0;
                                if (target.parent().is(".hhMenu")) {
                                    this.inputStor.hours.val(padLeft(tae.toString(), 2, "0"));
                                }
                                if (target.parent().is(".mmMenu")) {
                                    this.inputStor.minutes.val(padLeft(tae.toString(), 2, "0"));
                                }
                                if (target.parent().is(".ssMenu")) {
                                    this.inputStor.seconds.val(padLeft(tae.toString(), 2, "0"));
                                }
                                this.downMenuTime();
                                return;
                            }
                            if (target.is('.month')) {
                                falg = true;
                                var month = target.parent().find('span').index(target);
                                this.viewDate.setUTCMonth(month);
                            } else {
                                var year = parseInt(target.text(), 10) || 0;
                                this.viewDate.setUTCFullYear(year);
                            }
                            if (this.viewMode !== 0) {
                                this._date = UTCDate(
                                    this.viewDate.getUTCFullYear(),
                                    this.viewDate.getUTCMonth(),
                                    this.viewDate.getUTCDate(),
                                    this._date.getUTCHours(),
                                    this._date.getUTCMinutes(),
                                    this._date.getUTCSeconds(),
                                    this._date.getUTCMilliseconds()
                                );
                                this.notifyChange();
                            }
                            this.showMode(-1);
                            this.fillDate();
                            this.set();
                            if (this.viewMode == 2 && this.minViewMode == 2) {
                                this.hide();
                            }
                            if (falg && this.minViewMode == 1) {
                                this.hide();
                            }
                            break;
                        case 'td':
                            if (target.is('.day')) {
                                var day = parseInt(target.text(), 10) || 1;
                                var month = this.viewDate.getUTCMonth();
                                var year = this.viewDate.getUTCFullYear();
                                if (target.is('.old')) {
                                    if (month === 0) {
                                        month = 11;
                                        year -= 1;
                                    } else {
                                        month -= 1;
                                    }
                                } else if (target.is('.new')) {
                                    if (month == 11) {
                                        month = 0;
                                        year += 1;
                                    } else {
                                        month += 1;
                                    }
                                }
                                this._date = UTCDate(
                                    year, month, day,
                                    this._date.getUTCHours(),
                                    this._date.getUTCMinutes(),
                                    this._date.getUTCSeconds(),
                                    this._date.getUTCMilliseconds()
                                );

                                this.viewDate = UTCDate(
                                    year, month, Math.min(28, day), 0, 0, 0, 0);

                                this.onCallback(e);
                                this.fillDate();
                                this.set();
                                this.notifyChange();
                                if (this.pickTime && this.pickDate) {
                                    if (target.is('.active')) {
                                        this.hide();
                                    }
                                } else {
                                    this.hide();
                                }
                            }
                            break;
                        case 'button':
                            switch (target[0].className) {
                                case 'clear':
                                    this.$element.val("").removeClass("ferror");
                                    this.hide();
                                    break;
                                case 'today':
                                    var tmp = new Date();
                                    if (this.pickDate && this.pickTime) {
                                        this._date = UTCDate(
                                            tmp.getFullYear(),
                                            tmp.getMonth(),
                                            tmp.getDate(),
                                            this.compareTime(this.inputStor.hours.val(), "hour"),
                                            this.compareTime(this.inputStor.minutes.val(), "minutes"),
                                            this.compareTime(this.inputStor.seconds.val(), "seconds"),
                                            this._date.getUTCMilliseconds()
                                        );
                                    } else {
                                        this._date = UTCDate(
                                            tmp.getFullYear(),
                                            tmp.getMonth(),
                                            tmp.getDate(),
                                            tmp.getUTCHours(),
                                            tmp.getUTCMinutes(),
                                            tmp.getUTCSeconds(),
                                            tmp.getUTCMilliseconds()
                                        );
                                    }
                                    this.fillDate();
                                    this.set();
                                    this.notifyChange();
                                    this.hide();
                                    this.onCallback(e);
                                    break;
                                case 'confirm':
                                    if (this.pickDate && this.pickTime) {
                                        this._date = UTCDate(
                                            this._date.getUTCFullYear(),
                                            this._date.getUTCMonth(),
                                            this._date.getUTCDate(),
                                            this.compareTime(this.inputStor.hours.val(), "hour"),
                                            this.compareTime(this.inputStor.minutes.val(), "minutes"),
                                            this.compareTime(this.inputStor.seconds.val(), "seconds"),
                                            this._date.getUTCMilliseconds()
                                        );

                                    }
                                    this.set();
                                    this.notifyChange();
                                    this.hide();
                                    this.onCallback(e);
                                    break;
                            }
                            break;
                        case 'i':
                            //alert("click for clock");
                            break;
                        case 'input':
                            this._isClickInput = true;
                            switch (target[0].className) {
                                case 'tb':
                                    $(target[0]).focus();
                                    $(target[0]).blur(function() {
                                        var s = parseInt($(this).val(), 10) || 0;
                                        if (s > 23) s = 23;
                                        $(target[0]).val(padLeft(s.toString(), 2, "0"));
                                    });
                                    $("#dpTime .hhMenu").show().siblings(".menuSel").hide();
                                    break;
                                case 'te':
                                    $(target[0]).focus();
                                    $(target[0]).blur(function() {
                                        var s = parseInt($(this).val(), 10) || 0;
                                        if (s > 59) s = 59;
                                        $(target[0]).val(padLeft(s.toString(), 2, "0"));
                                    });
                                    $("#dpTime .mmMenu").show().siblings(".menuSel").hide();
                                    break;
                                case 'tl':
                                    $(target[0]).focus();
                                    $(target[0]).blur(function() {
                                        var s = parseInt($(this).val(), 10) || 0;
                                        if (s > 59) s = 59;
                                        $(target[0]).val(padLeft(s.toString(), 2, "0"));
                                    });
                                    $("#dpTime .ssMenu").show().siblings(".menuSel").hide();
                                    break;
                            }
                            break;
                    }
                }
            }
        },
        onCallback: function(e) {
            var functionName = this.$element.data('callback') || 0;
            if (functionName) {
                var functionObj = eval(functionName);
                if (typeof(functionObj) == "function") {
                    e.pickerObject = this;
                    functionObj.apply(this.$element, arguments);
                }
            }
        },
        actions: {
            incrementHours: function(e) {
                this.actions.blurTime.call(this);
                this._date.setUTCHours(this._date.getUTCHours() + 1);
            },

            incrementMinutes: function(e) {
                this.actions.blurTime.call(this);
                this._date.setUTCMinutes(this._date.getUTCMinutes() + 1);
            },

            incrementSeconds: function(e) {
                this.actions.blurTime.call(this);
                this._date.setUTCSeconds(this._date.getUTCSeconds() + 1);
            },

            decrementHours: function(e) {
                this.actions.blurTime.call(this);
                this._date.setUTCHours(this._date.getUTCHours() - 1);
            },

            decrementMinutes: function(e) {
                this.actions.blurTime.call(this);
                this._date.setUTCMinutes(this._date.getUTCMinutes() - 1);
            },

            decrementSeconds: function(e) {
                this.actions.blurTime.call(this);
                this._date.setUTCSeconds(this._date.getUTCSeconds() - 1);
            },

            togglePeriod: function(e) {
                var hour = this._date.getUTCHours();
                if (hour >= 12) hour -= 12;
                else hour += 12;
                this._date.setUTCHours(hour);
            },

            showPicker: function() {
                this.widget.find('.timepicker > div:not(.timepicker-picker)').hide();
                this.widget.find('.timepicker .timepicker-picker').show();
            },

            showHours: function() {
                // this.widget.find('.timepicker .timepicker-picker').hide();
                // this.widget.find('.timepicker .timepicker-hours').show();
            },

            sureTime: function(e) {

                var timeComponents = this.widget.find('.timepicker span[data-time-component]'),
                    that = this;
                timeComponents.find("input").each(function() {
                    var date = $(this).val();
                    switch ($(this).data('action')) {
                        case "selectHour":
                            that._date.setUTCHours(that.compareTime(date, "hour"));
                            break;
                        case "selectMinute":
                            that._date.setUTCMinutes(that.compareTime(date, "minutes"));
                            break;
                        case "selectSecond":
                            that._date.setUTCSeconds(that.compareTime(date, "seconds"));
                            break;
                    }
                });
                that.hide();
                this.onCallback(e);
            },

            clearTime: function() {
                this.$element.val("");
                this.hide();
            },

            showMinutes: function() {
                // this.widget.find('.timepicker .timepicker-picker').hide();
                // this.widget.find('.timepicker .timepicker-minutes').show();
            },

            showSeconds: function() {
                // this.widget.find('.timepicker .timepicker-picker').hide();
                // this.widget.find('.timepicker .timepicker-seconds').show();
            },

            blurTime: function() {
                var timeComponents = this.widget.find('.timepicker span[data-time-component]'),
                    that = this;
                timeComponents.find("input").each(function() {
                    var date = $(this).val();
                    switch ($(this).data('action')) {
                        case "selectHour":
                            that._date.setUTCHours(that.compareTime(date, "hour"));
                            break;
                        case "selectMinute":
                            that._date.setUTCMinutes(that.compareTime(date, "minutes"));
                            break;
                        case "selectSecond":
                            that._date.setUTCSeconds(that.compareTime(date, "seconds"));
                            break;
                    }
                });
            },

            selectHour: function(e) {
                var self = this;
                self._isClickInput = true;
                $(e.target).focus().on('blur', function(){
                    self._isClickInput = false;
                });
            },

            selectMinute: function(e) {
                var self = this;
                self._isClickInput = true;
                $(e.target).focus().on('blur', function(){
                    self._isClickInput = false;
                });
            },

            selectSecond: function(e) {
                var self = this;
                self._isClickInput = true;
                $(e.target).focus().on('blur', function(){
                    self._isClickInput = false;
                });
            }
        },
        //1001
        doAction: function(e) {
            e.stopPropagation();
            e.preventDefault();
            if (!this._date) this._date = UTCDate(1970, 0, 0, 0, 0, 0, 0);
            var action = $(e.currentTarget).data('action');
            var rv = this.actions[action].apply(this, arguments);
            if (action == "clearTime" || action == "selectHour" || action == "selectMinute" || action == "selectSecond") return rv;
            this.set();
            this.fillTime();
            this.notifyChange();
            return rv;
        },
        setFillTime: function(date, type) {
            if (date !== "") {
                if (type == "hour") {
                    this._date.setUTCHours(this.compareTime(date, type));
                } else if (type == "minute") {
                    this._date.setUTCMinutes(this.compareTime(date, type));
                } else if (type == "second") {
                    this._date.setUTCSeconds(this.compareTime(date, type));
                }
                this.set();
                this.fillTime();
                this.notifyChange();
            }
        },
        stopEvent: function(e) {
            e.stopPropagation();
            e.preventDefault();
        },
        compareTime: function(date, type) {
            var td = parseInt(date, 10) || 0;
            if (type == "hour") {
                if (td > 23) td = 23;
            } else {
                if (td > 59) td = 59;
            }
            return td;
        },
        // part of the following code was taken from
        // http://cloud.github.com/downloads/digitalBush/jquery.maskedinput/jquery.maskedinput-1.3.js
        keydown: function(e) {
            // when hiting TAB, for accessibility
            var key = e.keyCode || e.which;
            if (key == 9) this.hide();
        },

        keypress: function(e) {
            var key = String.fromCharCode(e.keyCode).toLowerCase();
            if (e.ctrlKey && key == "v") {
                return;
            }
            var k = e.which;
            if (k == 8 || k == 46) {
                // For those browsers which will trigger
                // keypress on backspace/delete
                return;
            }
            var input = $(e.target);
            var c = String.fromCharCode(k);
            var val = input.val() || '';
            val += c;
            var mask = this._mask[this._maskPos];
            if (!mask) {
                return false;
            }
            if (mask.end != val.length) {
                return;
            }
            if (!mask.pattern.test(val.slice(mask.start))) {
                val = val.slice(0, val.length - 1);
                while ((mask = this._mask[this._maskPos]) && mask.character) {
                    val += mask.character;
                    // advance mask position past static
                    // part
                    this._maskPos++;
                }
                val += c;
                if (mask.end != val.length) {
                    input.val(val);
                    return false;
                } else {
                    if (!mask.pattern.test(val.slice(mask.start))) {
                        input.val(val.slice(0, mask.start));
                        return false;
                    } else {
                        input.val(val);
                        this._maskPos++;
                        return false;
                    }
                }
            } else {
                this._maskPos++;
            }
        },

        change: function(e) {
            var input = $(e.target);
            this._resetMaskPos(input);
        },

        showMode: function(dir) {
            if (dir) {
                this.viewMode = Math.max(this.minViewMode, Math.min(
                    2, this.viewMode + dir));
            }
            this.widget.find('.datepicker > div').hide().filter(
                '.datepicker-' + DPGlobal.modes[this.viewMode].clsName).show();
        },

        destroy: function() {
            this._detachDatePickerEvents();
            this._detachDatePickerGlobalEvents();
            this.widget.remove();
            this.$element.removeData('datetimepicker');

            this.component.removeData('datetimepicker');
        },

        formatDate: function(d) {
            return this.format.replace(formatReplacer, function(match) {
                var methodName, property, rv, len = match.length;
                if (match === 'ms')
                    len = 1;
                property = dateFormatComponents[match].property
                if (property === 'Hours12') {
                    rv = d.getUTCHours();
                    if (rv === 0) rv = 12;
                    else if (rv !== 12) rv = rv % 12;
                } else if (property === 'Period12') {
                    if (d.getUTCHours() >= 12) return 'PM';
                    else return 'AM';
                } else if (property === 'UTCYear') {
                    rv = d.getUTCFullYear();
                    rv = rv.toString().substr(2);
                } else {
                    methodName = 'get' + property;
                    rv = d[methodName]();
                }
                if (methodName === 'getUTCMonth') rv = rv + 1;
                return padLeft(rv.toString(), len, '0');
            });
        },

        parseDate: function(str) {
            var match, i, property, methodName, value, parsed = {};
            if (!(match = this._formatPattern.exec(str)))
                return null;
            for (i = 1; i < match.length; i++) {
                property = this._propertiesByIndex[i];
                if (!property)
                    continue;
                value = match[i];
                if (/^\d+$/.test(value))
                    value = parseInt(value, 10);
                parsed[property] = value;
            }
            return this._finishParsingDate(parsed);
        },

        _resetMaskPos: function(input) {
            var val = input.val();
            for (var i = 0; i < this._mask.length; i++) {
                if (this._mask[i].end > val.length) {
                    // If the mask has ended then jump to
                    // the next
                    this._maskPos = i;
                    break;
                } else if (this._mask[i].end === val.length) {
                    this._maskPos = i + 1;
                    break;
                }
            }
        },

        _finishParsingDate: function(parsed) {
            var year, month, date, hours, minutes, seconds, milliseconds;
            year = parsed.UTCFullYear;
            if (parsed.UTCYear) year = 2000 + parsed.UTCYear;
            if (!year) year = 1970;
            if (parsed.UTCMonth) month = parsed.UTCMonth - 1;
            else month = 0;
            date = parsed.UTCDate || 1;
            hours = parsed.UTCHours || 0;
            minutes = parsed.UTCMinutes || 0;
            seconds = parsed.UTCSeconds || 0;
            milliseconds = parsed.UTCMilliseconds || 0;
            if (parsed.Hours12) {
                hours = parsed.Hours12;
            }
            if (parsed.Period12) {
                if (/pm/i.test(parsed.Period12)) {
                    if (hours != 12) hours = (hours + 12) % 24;
                } else {
                    hours = hours % 12;
                }
            }
            return UTCDate(year, month, date, hours, minutes, seconds, milliseconds);
        },

        _compileFormat: function() {
            var match, component, components = [],
                mask = [],
                str = this.format,
                propertiesByIndex = {},
                i = 0,
                pos = 0;
            while (match = formatComponent.exec(str)) {
                component = match[0];
                if (component in dateFormatComponents) {
                    i++;
                    propertiesByIndex[i] = dateFormatComponents[component].property;
                    components.push('\\s*' + dateFormatComponents[component].getPattern(
                        this) + '\\s*');
                    mask.push({
                        pattern: new RegExp(dateFormatComponents[component].getPattern(
                            this)),
                        property: dateFormatComponents[component].property,
                        start: pos,
                        end: pos += component.length
                    });
                } else {
                    components.push(escapeRegExp(component));
                    mask.push({
                        pattern: new RegExp(escapeRegExp(component)),
                        character: component,
                        start: pos,
                        end: ++pos
                    });
                }
                str = str.slice(component.length);
            }
            this._mask = mask;
            this._maskPos = 0;
            this._formatPattern = new RegExp('^\\s*' + components.join('') + '\\s*$');
            this._propertiesByIndex = propertiesByIndex;
        },
        inputBlur: function(e) {
            if (!this.widget.is(":visible")) {
                return;
            }
            // if(this.pickTime && this._isClickInput){
            //    //带有时间的处理位置
            // }else{
            //     this.hide();
            // }
        },
        _attachDatePickerEvents: function() {
            var self = this;
            // this handles date picker clicks
            this.widget.on('click', '.datepicker *', $.proxy(this.click, this));
            //this.widget.on('dblclick', '.datepicker *', $.proxy(this.test, this));
            // this handles time picker clicks
            this.widget.on('click', '[data-action]', $.proxy(this.doAction, this));
            if (this.isInput) {
                this.$element.on('blur', $.proxy(this.inputBlur, this));
            }

            this.widget.on('mousedown', $.proxy(this.stopEvent, this));
            if (this.pickDate && this.pickTime) {
                //日历折叠匿名函数
                this.widget.on('click.togglePicker', '.accordion-toggle', function(e) {
                    e.stopPropagation();
                    var $this = $(this);
                    var $parent = $this.closest('ul');
                    var expanded = $parent.find('.collapse.in');
                    var closed = $parent.find('.collapse:not(.in)');

                    if (expanded && expanded.length) {
                        var collapseData = expanded.data('collapse');
                        if (collapseData && collapseData.transitioning) return;
                        expanded.collapse('hide');
                        closed.collapse('show')
                        $this.find('i').toggleClass(self.timeIcon + ' ' + self.dateIcon);
                        self.$element.find('.add-on i').toggleClass(self.timeIcon + ' ' + self.dateIcon);
                    }
                });
            }
            if (this.loadShow) {
                this.widget.show()
            }
            if (this.isInput) {
                this.$element.on({
                    'click': $.proxy(this.show, this),
                    'keyup': $.proxy(this.change, this)
                });
                if (this.options.maskInput) {
                    this.$element.on({
                        'keydown': $.proxy(this.keydown, this),
                        'keypress': $.proxy(this.keypress, this)
                    });
                }
            } else {
                this.$element.on({
                    'change': $.proxy(this.change, this)
                }, 'input');
                if (this.options.maskInput) {
                    this.$element.on({
                        'keydown': $.proxy(this.keydown, this),
                        'keypress': $.proxy(this.keypress, this)
                    }, 'input');
                }
                if (this.component) {
                    this.component.on('click', $.proxy(this.show, this));
                } else {
                    this.$element.on('click', $.proxy(this.show, this));
                }
            }
        },

        _attachDatePickerGlobalEvents: function(e) {
            //$(window).on('resize.datetimepicker' + this.id, $.proxy(this.place, this));
            //if (!this.isInput) {
            //console.log(this.id);
            var self = this;
            $(document).on('mousedown.datetimepicker' + this.id, function(){
                self.hide.call(self);
                //$.proxy(self.hide, self)
            });
            //}
        },

        _detachDatePickerEvents: function() {
            this.widget.off('click', '.datepicker *', this.click);
            this.widget.off('click', '[data-action]');
            this.widget.off('mousedown', this.stopEvent);
            if (this.pickDate && this.pickTime) {
                this.widget.off('click.togglePicker');
            }
            if (this.isInput) {
                this.$element.off("blur", this.inputBlur);
                this.$element.off({
                    'click': this.show,
                    'change': this.change
                });
                if (this.options.maskInput) {
                    this.$element.off({
                        'keydown': this.keydown,
                        'keypress': this.keypress
                    });
                }
            } else {
                this.$element.off({
                    'change': this.change
                }, 'input');
                if (this.options.maskInput) {
                    this.$element.off({
                        'keydown': this.keydown,
                        'keypress': this.keypress
                    }, 'input');
                }
                if (this.component) {
                    this.component.off('click', this.show);
                } else {
                    this.$element.off('click', this.show);
                }
            }
        },

        _detachDatePickerGlobalEvents: function() {
            $(window).off('resize.datetimepicker' + this.id);
            //if (!this.isInput) {
            $(document).off('mousedown.datetimepicker' + this.id);
            //}
        },

        _isInFixed: function() {
            if (this.$element) {
                var parents = this.$element.parents();
                var inFixed = false;
                for (var i = 0; i < parents.length; i++) {
                    if ($(parents[i]).css('position') == 'fixed') {
                        inFixed = true;
                        break;
                    }
                };
                return inFixed;
            } else {
                return false;
            }
        },
        _modalPlace: function(obj, off) {
            // var tempthis = obj.widget
            var mBody = obj.$element.closest('.modal-body')
            mBody.scroll(function() {
                obj.hide()
                    //   tempthis.css({
                    //   position: 'fixed',
                    //   top: off.top - mBody.scrollTop(),
                    //   left: off.left,
                    //   right: off.right
                    // });
            })
        }
    };

    $.fn.datepicker = function(option, val) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('datetimepicker'),
                options = typeof option === 'object' && option;
            if (!data) {
                $this.data('datetimepicker', (data = new DateTimePicker(
                    this, $.extend({}, $.fn.datepicker.defaults, options))));
            }
            if (typeof option === 'string') data[option](val);
        });
    };

    $.fn.datepicker.defaults = {
        maskInput: true,
        pickDate: true,
        pickTime: false,
        pick12HourFormat: false,
        pickSeconds: true,
        startDate: -Infinity,
        endDate: Infinity,
        collapse: true,
        loadShow: false
    };
    $.fn.datepicker.Constructor = DateTimePicker;
    var dpgId = 0;
    var dates = $.fn.datepicker.dates = {
        "zh-CN": {
            days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
            daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
            daysMin: ["日", "一", "二", "三", "四", "五", "六", "日"],
            months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
            monthsShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
            today: "今日"
        }
    };

    var dateFormatComponents = {
        dd: {
            property: 'UTCDate',
            getPattern: function() {
                return '(0?[1-9]|[1-2][0-9]|3[0-1])\\b';
            }
        },
        MM: {
            property: 'UTCMonth',
            getPattern: function() {
                return '(0?[1-9]|1[0-2])\\b';
            }
        },
        yy: {
            property: 'UTCYear',
            getPattern: function() {
                return '(\\d{2})\\b'
            }
        },
        yyyy: {
            property: 'UTCFullYear',
            getPattern: function() {
                return '(\\d{4})\\b';
            }
        },
        hh: {
            property: 'Hours12',
            getPattern: function() {
                return '(0?[1-9]|1[0-2])\\b';
            }
        },
        mm: {
            property: 'UTCMinutes',
            getPattern: function() {
                return '(0?[0-9]|[1-5][0-9])\\b';
            }
        },
        ss: {
            property: 'UTCSeconds',
            getPattern: function() {
                return '(0?[0-9]|[1-5][0-9])\\b';
            }
        },
        ms: {
            property: 'UTCMilliseconds',
            getPattern: function() {
                return '([0-9]{1,3})\\b';
            }
        },
        HH: {
            property: 'UTCHours',
            getPattern: function() {
                return '(0?[0-9]|1[0-9]|2[0-3])\\b';
            }
        },
        PP: {
            property: 'Period12',
            getPattern: function() {
                return '(AM|PM|am|pm|Am|aM|Pm|pM)\\b';
            }
        }
    };

    var keys = [];
    for (var k in dateFormatComponents) keys.push(k);
    keys[keys.length - 1] += '\\b';
    keys.push('.');

    var formatComponent = new RegExp(keys.join('\\b|'));
    keys.pop();
    var formatReplacer = new RegExp(keys.join('\\b|'), 'g');

    function escapeRegExp(str) {
        // http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    function padLeft(s, l, c) {
        if (l < s.length) return s;
        else return Array(l - s.length + 1).join(c || ' ') + s;
    }

    function getTemplate(timeIcon, pickDate, pickTime, is12Hours, showSeconds, collapse, isShow) {
        if (pickDate && pickTime) {
            return (
                '<div class="bootstrap-datetimepicker-widget dropdown-menu 3" style="max-height:235px;">' +
                //'<ul>' +
                //'<li' + (collapse ? ' class="collapse in"' : '') + '>' +
                '<div class="datepicker">' +
                DPGlobal.tempButton(timeIcon, isShow) +
                '</div>' +
                //'</li>' +
                //'<li class="picker-switch accordion-toggle"><a><i class="' + timeIcon + '"></i></a></li>' +
                //'<li' + (collapse ? ' class="collapse"' : '') + '>' +
                //'<div class="timepicker">' +
                //TPGlobal.getTemplate(is12Hours, showSeconds) +
                //'</div>' +
                // '</li>' +
                // '</ul>' +
                '</div>'
            );
        } else if (pickTime) {
            return (
                '<div class="bootstrap-datetimepicker-widget dropdown-menu 2">' +
                '<div class="timepicker">' +
                TPGlobal.getTemplate(is12Hours, showSeconds) +
                '</div>' +
                '</div>'
            );
        } else {
            return (
                '<div class="bootstrap-datetimepicker-widget dropdown-menu 1" style="max-height:215px;">' +
                '<div class="datepicker">' +
                DPGlobal.tempButton(null, isShow) +
                '</div>' +
                '</div>'
            );
        }
    }

    function UTCDate() {

        return new Date(Date.UTC.apply(Date, arguments));
    }

    var DPGlobal = {
        modes: [{
            clsName: 'days',
            navFnc: 'UTCMonth',
            navStep: 1
        }, {
            clsName: 'months',
            navFnc: 'UTCFullYear',
            navStep: 1
        }, {
            clsName: 'years',
            navFnc: 'UTCFullYear',
            navStep: 10
        }],
        isLeapYear: function(year) {
            return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
        },
        getDaysInMonth: function(year, month) {
            return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
        },
        headTemplate: '<thead>' +
            '<tr>' +
            '<th class="prev">&lsaquo;</th>' +
            '<th colspan="5" class="switch" ></th>' +
            '<th class="next">&rsaquo;</th>' +
            '</tr>' +
            '</thead>',
        contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>'
    };
    //正常日历模版
    DPGlobal.template =
        '<div class="datepicker-days">' +
        '<table class="table-condensed">' +
        DPGlobal.headTemplate +
        '<tbody></tbody>' +
        '</table>' +
        '</div>' +
        '<div class="datepicker-months">' +
        '<table class="table-condensed">' +
        DPGlobal.headTemplate +
        DPGlobal.contTemplate +
        '</table>' +
        '</div>' +
        '<div class="datepicker-years">' +
        '<table class="table-condensed">' +
        DPGlobal.headTemplate +
        DPGlobal.contTemplate +
        '</table>' +
        '</div>';
    DPGlobal.timeModelate =
        '<div class="menuSel hhMenu" >' +
        '<span class="menuSapn">0</span><span class="menuSapn">1</span><span class="menuSapn">2</span><span class="menuSapn">3</span>' +
        '<span class="menuSapn">4</span><span class="menuSapn">5</span><span class="menuSapn">6</span>' +
        '<span class="menuSapn">7</span><span class="menuSapn">8</span><span class="menuSapn">9</span>' +
        '<span class="menuSapn">10</span><span class="menuSapn">11</span><span class="menuSapn">12</span>' +
        '<span class="menuSapn">13</span><span class="menuSapn">14</span><span class="menuSapn">15</span>' +
        '<span class="menuSapn">16</span><span class="menuSapn">17</span><span class="menuSapn">18</span>' +
        '<span class="menuSapn">19</span><span class="menuSapn">20</span><span class="menuSapn">21</span>' +
        '<span class="menuSapn">22</span><span class="menuSapn">23</span>' +
        '</div>' +
        '<div class="menuSel mmMenu" >' +
        '<span class="menuSapn">0</span><span class="menuSapn">5</span><span class="menuSapn">10</span>' +
        '<span class="menuSapn">15</span><span class="menuSapn">20</span><span class="menuSapn">25</span>' +
        '<span class="menuSapn">30</span><span class="menuSapn">35</span><span class="menuSapn">40</span>' +
        '<span class="menuSapn">45</span><span class="menuSapn">50</span><span class="menuSapn">55</span>' +
        '</div>' +
        '<div class="menuSel ssMenu" >' +
        '<span class="menuSapn">0</span><span class="menuSapn">10</span><span class="menuSapn">20</span>' +
        '<span class="menuSapn">30</span><span class="menuSapn">40</span><span class="menuSapn">50</span>' +
        '</div>';
    DPGlobal.timeiInputMode =
        '<div class="dpconter">' +
        '<font class="bold m-r-sm">时间</font>' +
        '</div>' +
        '<div class="dpconter b">' +
        '<input class="tb" maxlength="2"/>' +
        '<b class="tm">:</b>' +
        '<input class="te" maxlength="2"/>' +
        '<b class="tm">:</b>' +
        '<input class="tl" maxlength="2"/>' +
        '</div>';
    //预留添加小时钟
    // '<div class="dpconter">'+
    // '<a class="accordion-toggle" >' +
    // '<i class="' + icon + '"></i>' +
    // '</a>' +
    // '</div>'+
    //日历模版
    DPGlobal.tempButton = function(icon, isShow) {
        if (icon == null) {
            return ('<div class="datepicker-days">' +
                '<table class="table-condensed">' +
                DPGlobal.headTemplate +
                '<tbody></tbody>' +
                '</table>' +
                (!isShow ?
                    '<div class="fr">' +
                    '<button class="clear">清空</button>' +
                    '<button class="today" style="margin-left: 5px;">今天</button>' +
                    '<button class="confirm" style="margin-left: 5px;">确定</button></div>' : '') +

                '</div>' +
                '<div class="datepicker-months">' +
                '<table class="table-condensed">' +
                DPGlobal.headTemplate +
                DPGlobal.contTemplate +
                '</table>' +
                '</div>' +
                '<div class="datepicker-years">' +
                '<table class="table-condensed">' +
                DPGlobal.headTemplate +
                DPGlobal.contTemplate +
                '</table>' +
                '</div>');
        }
        return ('<div class="datepicker-days">' +
            '<table class="table-condensed">' +
            DPGlobal.headTemplate +
            '<tbody></tbody>' +
            '</table>' +
            '<div class="divconter" id="dpTime">' +
            DPGlobal.timeModelate +
            DPGlobal.timeiInputMode +
            '</div>' +
            (!isShow ?
                '<div class="fr">' +
                '<button class="clear">清空</button>' +
                '<button class="today" style="margin-left: 5px;">今天</button>' +
                '<button class="confirm" style="margin-left: 5px;">确定</button></div>' : '') +
            '</div>' +
            '<div class="datepicker-months">' +
            '<table class="table-condensed">' +
            DPGlobal.headTemplate +
            DPGlobal.contTemplate +
            '</table>' +
            '</div>' +
            '<div class="datepicker-years">' +
            '<table class="table-condensed">' +
            DPGlobal.headTemplate +
            DPGlobal.contTemplate +
            '</table>' +
            '</div>');

    }

    var TPGlobal = {
        hourTemplate: '<span data-action="showHours" data-time-component="hours" class="timepicker-hour"><input type="text" maxlength="2" data-action="selectHour" style="text-align:center; vertical-align:middle"/></span>',
        minuteTemplate: '<span data-action="showMinutes" data-time-component="minutes" class="timepicker-minute"><input type="text" maxlength="2" data-action="selectMinute" style="text-align:center; vertical-align:middle"/></span>',
        secondTemplate: '<span data-action="showSeconds" data-time-component="seconds" class="timepicker-second"><input type="text" maxlength="2" data-action="selectSecond" style="text-align:center; vertical-align:middle"/></span>'
    };
    //时间模版
    TPGlobal.getTemplate = function(is12Hours, showSeconds) {
        return (
            '<div class="timepicker-picker">' +
            '<table class="table-condensed"' +
            (is12Hours ? ' data-hour-format="12"' : '') +
            '>' +
            '<tr>' +
            '<td><a href="#" class="btn" data-action="incrementHours"><i class="fa fa-chevron-up"></i></a></td>' +
            '<td class="separator"></td>' +
            '<td><a href="#" class="btn" data-action="incrementMinutes"><i class="fa fa-chevron-up"></i></a></td>' +
            (showSeconds ?
                '<td class="separator"></td>' +
                '<td><a href="#" class="btn" data-action="incrementSeconds"><i class="fa fa-chevron-up"></i></a></td>' : '') +
            (is12Hours ? '<td class="separator"></td>' : '') +
            '</tr>' +
            '<tr>' +
            '<td>' + TPGlobal.hourTemplate + '</td> ' +
            '<td class="separator">:</td>' +
            '<td>' + TPGlobal.minuteTemplate + '</td> ' +
            (showSeconds ?
                '<td class="separator">:</td>' +
                '<td>' + TPGlobal.secondTemplate + '</td>' : '') +
            (is12Hours ?
                '<td class="separator"></td>' +
                '<td>' +
                '<button type="button" class="btn btn-primary" data-action="togglePeriod"></button>' +
                '</td>' : '') +
            '</tr>' +
            '<tr>' +
            '<td><a href="#" class="btn" data-action="decrementHours"><i class="fa fa-chevron-down"></i></a></td>' +
            '<td class="separator"></td>' +
            '<td><a href="#" class="btn" data-action="decrementMinutes"><i class="fa fa-chevron-down"></i></a></td>' +
            (showSeconds ?
                '<td class="separator"></td>' +
                '<td><a href="#" class="btn" data-action="decrementSeconds"><i class="fa fa-chevron-down"></i></a></td>' : '') +
            (is12Hours ? '<td class="separator"></td>' : '') +
            '</tr>' +
            '</table>' +
            '<div class="fr m-t-xs">' +
            '<button data-action="clearTime">清空</button>' +
            '<button data-action="sureTime" style="margin-left:10px;">确定</button>' +
            '</div>' +
            '</div>' //+
            // '<div class="timepicker-hours" >' +
            // '<table class="table-condensed">' +
            // '</table>' +
            // '</div>' +
            // '<div class="timepicker-minutes" >' +
            // '<table class="table-condensed">' +
            // '</table>' +
            // '</div>' +
            // (showSeconds ?
            //   '<div class="timepicker-seconds" >' +
            //   '<table class="table-condensed">' +
            //   '</table>' +
            //   '</div>' : '')
        );
    }
})(window.jQuery);

