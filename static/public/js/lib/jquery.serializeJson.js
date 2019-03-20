/** 
 *	序列化表单数据到JSON对象
 */
(function($) {
	$.fn.serializeJson = function() {
		var serializeJson = {};
		var serializeArray = this.serializeArray();
		//没选中的复选框
		var not_checked_object = $('input[type=checkbox]:not(:checked)', this);
		$.each(not_checked_object, function() {
			if (!serializeArray.hasOwnProperty(this.name)) {
				serializeArray.push({
					name : this.name,
					value : ""
				});
			}
		});
		$(serializeArray).each(
			function() {
				if (serializeJson[this.name]) {
					if ($.isArray(serializeJson[this.name])) {
						serializeJson[this.name].push(this.value);
					} else {
						if (this.value != "") {
							//转换数组为字符串
							serializeJson[this.name] = [serializeJson[this.name], this.value].join(",");
						}
					}
				} else {
					serializeJson[this.name] = this.value;
				}
		});
		return serializeJson;
	};
})(jQuery);