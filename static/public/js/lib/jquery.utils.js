/**
 * jQuery Form Fill - http://makoto.blog.br/formFill
 * --------------------------------------------------------------------------
 *
 * Licensed under The MIT License
 * 
 * @version     0.1
 * @since       16.06.2010
 * @author      Makoto Hashimoto
 * @link        http://makoto.blog.br/formFill
 * @twitter     http://twitter.com/makoto_vix
 * @license     http://www.opensource.org/licenses/mit-license.php MIT 
 * @package     jQuery Plugins
 * 
 * Usage:
 * --------------------------------------------------------------------------
 * 
 *	$('form#formUser').fill({"name" : "Makoto Hashimoto", "email" : "makoto@makoto.blog.br"});
 *  
 *  <form id="formUser">
 *  	<label>Name:</label>
 *  	<input type="text" name="user.name"/>
 *  	<label>E-mail:</label>
 *  	<input type="text" name="user.email"/>
 *  </form>
 */
(function($) {

	function Fill() {
		this.defaults = {
			styleElementName: 'none', // object | none
			dateFormat: 'mm/dd/yy',
			debug: false,
			elementsExecuteEvents: ['checkbox', 'radio', 'select-one']
		};
	};

	$.extend(Fill.prototype, {
		setDefaults: function(settings) {
			this.defaults = $.extend({}, this.defaults, settings);
			return this;
		},

		fill: function(obj, _element, settings) {
			if (settings == null) {
				settings = {};
			}
			var options = $.extend({}, this.defaults, settings);
			_element.find("*").each(function(i, item) {
				if ($(item).is("input") || $(item).is("select") || $(item).is("textarea")) {
					try {
						var objName;
						var arrayAtribute;
						try {

							if (options.styleElementName == "object") {
								// Verificando se � um array
								if ($(item).attr("name").match(/\[[0-9]*\]/i)) {
									objName = $(item).attr("name").replace(/^[a-z]*[0-9]*[a-z]*\./i, 'obj.').replace(/\[[0-9]*\].*/i, "");

									arrayAtribute = $(item).attr("name").match(/\[[0-9]*\]\.[a-z0-9]*/i) + "";
									arrayAtribute = arrayAtribute.replace(/\[[0-9]*\]\./i, "");
								} else {
									objName = $(item).attr("name").replace(/^[a-z]*[0-9]*[a-z]*\./i, 'obj.');
								}
							} else if (options.styleElementName == "none") {
								objName = 'obj.' + $(item).attr("name");
							}

							var value = eval(objName);

						} catch (e) {
							if (options.debug) {
								debug(e.message);
							}
						}

						if (value != null) {
							switch (item.type) {
								case "hidden":
								case "password":
								case "textarea":
									$(item).val(value);
									break;

								case "text":
									if ($(item).hasClass("hasDatepicker")) {
										var re = /^[-+]*[0-9]*$/;
										var dateValue = null;
										if (re.test(value)) {
											dateValue = new Date(parseInt(value));
											var strDate = dateValue.getUTCFullYear() + '-' + (dateValue.getUTCMonth() + 1) + '-' + dateValue.getUTCDate();
											dateValue = $.datepicker.parseDate('yy-mm-dd', strDate);
										} else if (value) {
											dateValue = $.datepicker.parseDate(options.dateFormat, value);
										}
										$(item).datepicker('setDate', dateValue);
									} else if ($(item).attr("alt") == "double") {
										$(item).val(value.toFixed(2));
									} else {
										$(item).val(value);
									}
									break;

								case "select-one":
									if (value) {
										$(item).val(value);
									}
									break;
								case "radio":
									$(item).each(function(i, radio) {
										if ($(radio).val() == value) {
											$(radio).prop("checked", "checked");
										}
									});
									break;
								case "checkbox":
									if ($.isArray(value)) {
										$.each(value, function(i, arrayItem) {
											if (typeof(arrayItem) == 'object') {
												arrayItemValue = eval("arrayItem." + arrayAtribute);
											} else {
												arrayItemValue = arrayItem;
											}
											if ($(item).val() == arrayItemValue) {
												$(item).attr("checked", "checked");
											}
										});
									} else {
										var values = value.split(",");
										for (var i = 0; i < values.length; i++) {
											if (values[i] == $(item).val()) {
												$(item).attr("checked", "checked");
												break;
											}
										}
									}
									break;
							}
							executeEvents(item);
						}
					} catch (e) {
						if (options.debug) {
							debug(e.message);
						}
					}

				}

			});
		}
	});

	$.fn.fill = function(obj, settings) {
		$.fill.fill(obj, $(this), settings);
		return this;
	};

	$.fill = new Fill();

	function executeEvents(element) {
		if (jQuery.inArray($(element).attr('type'), $.fill.defaults.elementsExecuteEvents)) {
			if ($(element).attr('onchange')) {
				$(element).change();
			}

			if ($(element).attr('onclick')) {
				$(element).click();
			}
		}
	};

	function debug(message) { // Throws error messages in the browser console.
		if (window.console && window.console.log) {
			window.console.log(message);
		}
	};
})(jQuery);

////////////////////////////////////////////////////////////////////原jquery.formhtml.js内容
//获得dom元素和js修改的值
(function($) {
	var oldHTML = $.fn.html;
	$.fn.formhtml = function() {
		if (arguments.length) return oldHTML.apply(this, arguments);
		$("input,textarea,button", this).each(function() {
			this.setAttribute('value', this.value);
		});
		$(":radio,:checkbox", this).each(function() {
			if (this.checked) this.setAttribute('checked', 'checked');
			else this.removeAttribute('checked');
		});
		$("option", this).each(function() {
			if (this.selected) this.setAttribute('selected', 'selected');
			else this.removeAttribute('selected');
		});
		return oldHTML.apply(this);
	};

	$.type = function(o) {
		var _toS = Object.prototype.toString;
		var _types = {
			'undefined': 'undefined',
			'number': 'number',
			'boolean': 'boolean',
			'string': 'string',
			'[object Function]': 'function',
			'[object RegExp]': 'regexp',
			'[object Array]': 'array',
			'[object Date]': 'date',
			'[object Error]': 'error'
		};
		return _types[typeof o] || _types[_toS.call(o)] || (o ? 'object' : 'null');
	};
	var $specialChars = {
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'\r': '\\r',
		'"': '\\"',
		'\\': '\\\\'
	};
	var $replaceChars = function(chr) {
		return $specialChars[chr] || '\\u00' + Math.floor(chr.charCodeAt() / 16).toString(16) + (chr.charCodeAt() % 16).toString(16);
	};

	$.toJSON = function(o) {
		var s = [];
		switch ($.type(o)) {
			case 'undefined':
				return 'undefined';
				break;
			case 'null':
				return 'null';
				break;
			case 'number':
			case 'boolean':
			case 'date':
			case 'function':
				return o.toString();
				break;
			case 'string':
				return '"' + o.replace(/[\x00-\x1f\\"]/g, $replaceChars) + '"';
				break;
			case 'array':
				for (var i = 0, l = o.length; i < l; i++) {
					s.push($.toJSON(o[i]));
				}
				return '[' + s.join(',') + ']';
				break;
			case 'error':
			case 'object':
				for (var p in o) {
					s.push(p + ':' + $.toJSON(o[p]));
				}
				return '{' + s.join(',') + '}';
				break;
			default:
				return '';
				break;
		}
	};

	$.evalJSON = function(s) {
		if ($.type(s) != 'string' || !s.length) return null;
		return eval('(' + s + ')');
	};
})(jQuery);

/**
 * ie6-8在数组上增加indexOf方法
 */
if (!$.support.leadingWhitespace) {
	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function(elt /*, from*/ ) {
			var len = this.length >>> 0;

			var from = Number(arguments[1]) || 0;
			from = (from < 0) ? Math.ceil(from) : Math.floor(from);
			if (from < 0)
				from += len;

			for (; from < len; from++) {
				if (from in this &&
					this[from] === elt)
					return from;
			}
			return -1;
		};
	}
}

//根据name获取json数组对应的value
Array.prototype.getValue = function(name) {
	for (var i = 0; i < this.length; i++) {
		if (this[i].name == name) {
			return this[i].value;
		}
	}
};

function isIE() {
	return navigator.appName.indexOf("Microsoft Internet Explorer") != -1 && document.all;
}

function isIE6() {
	return navigator.userAgent.toLowerCase().indexOf("msie 6.0") == "-1" ? false : true;
}

function isIE7() {
	return navigator.userAgent.toLowerCase().indexOf("msie 7.0") == "-1" ? false : true;
}

function isIE8() {
	return navigator.userAgent.toLowerCase().indexOf("msie 8.0") == "-1" ? false : true;
}

function isIE11() {
	return navigator.appName.indexOf("Netscape") != -1
}

function isNN() {
	return navigator.userAgent.indexOf("Netscape") != -1;
}

function isOpera() {
	return navigator.appName.indexOf("Opera") != -1;
}

function isFF() {
	return navigator.userAgent.indexOf("Firefox") != -1;
}

function isChrome() {
	return navigator.userAgent.indexOf("Chrome") > -1;
}

/**
 * 比较两个id（逗号分隔）字串差异，返回新增部分
 * @param a
 * @param b
 */
function betw(a, b) {
	var as = a.split(",");
	var bs = b.split(",");

	var r = new Array();
	var rc = 0;
	for (var i = 0; i < bs.length; i++) {
		var c = 0;
		for (var j = 0; j < as.length; j++) {
			if (bs[i] == as[j]) {
				c++;
			}
		}
		if (c == 0) {
			r[rc++] = bs[i];
		}
	}
	return r;
}

/**
 * 格式化人员字符串，返回人员格式数组
 */
function formatUser(userStr) {
	var result = new Array();
	var users = userStr.split(",");
	for (var i = 0; i < users.length; i++) {
		var userItem = {};
		userItem.id = users[i].split(":")[0];
		userItem.name = users[i].split(":")[1];
		result.push(userItem);
	}
	return result;
}

/**
 * IE8下菜单提供跳转不起作用,可以暂时调用这个方法替代
 * @param url 跳转的URL
 */
function jump(url) {
	$.ajax({
		url: url,
		type: "post",
		success: function(data) {
			$("#scrollable").html(data);
		}
	});
}

/**
 * 将textarea里的内容转换为hmtl
 */
function formatToHtml(str) {
	var string = str.replace(/\r\n/g, "<br>")
	string = string.replace(/\n/g, "<br>");
	return string;
}

/**
 * 将html里的内容转换为textarea的内容
 */
function formatToValue(str) {
	var string = str.replace(/<br>/g, "\r\n");
	string = string.replace(/<BR>/g, "\r\n")
	return string;
}

/**
 * 转义字符串的html标签
 */
$.extend({
	escapeHtml: function(text) {
		return text ? $('<p/>').text(text).html() : text;
	}
});

$.extend({
	isAlpha: function(s) {
		return /[a-z|A-Z]/.test(s);
	}
});

$.extend({
	hasSpecialChar: function(s, charset) {
		//var charset = "@#$%&*~";
		var specialCharsetRegExp = new RegExp(/[\@\#\$\%\&\*\~]+/);
		if (typeof charset === "string") {
			var str = "";
			for (i = 0; i < charset.length; i++) {
				if (!$.isAlpha(charset.charAt(i))) {
					str += "\\" + charset.charAt(i);
				}
			}
			specialCharsetRegExp = new RegExp("[" + str + "]+");
		}
		if (!s) {
			return false;
		} else {
			return specialCharsetRegExp.test(s);
		}
	}

});

$.extend({
	null2Blank: function(s) {
		//var charset = "@#$%&*~";
		if (s == null || typeof(s) === "undefined") {
			return "";
		} else {
			return s;
		}
	}

});
$.extend({
	blank2HtmlBlank: function(s) {
		//var charset = "@#$%&*~";
		if (s == null || typeof(s) === "undefined") {
			return "";
		} else {
			return s.replace(/\s/g, "&nbsp;");
		}
	}
});

//将表单序列化数组转成json格式
function serializeJson(array) {
	var serializeObj = {};
	$(array).each(function() {

		if (serializeObj[this.name]) {
			if ($.isArray(serializeObj[this.name])) {
				serializeObj[this.name].push(this.value);
			} else {
				serializeObj[this.name] = [serializeObj[this.name], this.value];
			}
		} else {
			serializeObj[this.name] = this.value;
		}
	});
	return serializeObj;
};

//获取token
function getToken(formId) {
	$.ajax({
		type: "GET",
		url: getRootPath() + "/system/token.action",
		data: null,
		cache: false,
		dataType: "json",
		success: function(data) {
			if (data) {
				if (formId) {
					$("#" + formId + " #token").val(data.token);
				} else {
					$("#token").val(data.token);
				}
			}
		}
	});
};

//显示表单错误信息
function showErrors(formId, errorMessage) {
	$.each(errorMessage, function(i, o) {
		var parent_ = $("#" + formId + " [id='" + o.code + "']").parent();
		var label_ = parent_.children("label");
		if (label_.length == 0) {
			$("<label>")
					.attr("for", o.code)
					.addClass("error")
					.html(o.message || "")
					.insertAfter($("#" + formId + " [id='" + o.code + "']"));
		} else {
			label_.html(o.message);
			label_.css('display', 'block');
		}
	});
}

//清除验证信息
function hideErrorMessage() {
	$('label.help-block').hide();
	$("label.error").remove();
	$(".error").removeClass("error");
}

//确认对话框
function confirmx(mess, fnCall) {
	var opt = {
		content: mess,
		success: function() {
			fnCall();
		}
	}
	msgBox.confirm(opt);
	return false;
}