/**
 * 表单相关， 提交表单 列表等等
 */
if(!window.JC){
    window.JC= JC;
}
/**
 * 表单操作类
 * @param  通过data-field获取整个表单可操作的元素
 * @param  通过当前元素的name值决定取值和赋值的对象
 */
JC.JCFrom = Clazz.extend({
	construct: function(options){
		var _this = this;
        _this.uuid = _this._guid();
        /**
         * 当前类型，是表单还是列表页
         * @type form     表单
         * @type list     列表
         * @type workflow 工作流表单
         * @type custom   自定义表单
         */
        _this.type = 'form';
        _this.allElement = null;
        /**
         * 全局配置参数
         */
		_this.option = _this._getOption(options || {});
		/**
		 * 全局容器对象
		 * 可以在提交和回显操作时固顶取值范围
		 */
		_this.$form =  $("#form_" + _this.option.formId);
		_this.setData();
	},
	_getOption: function(option){
		return $.extend({
			
		},(option || {}));
	},
	actions:{
		text: function(){
			return 'text'
		},
		jctree: function(){
			return 'jctree'
		},
		radio: function(){
			return 'radio'
		},
		checkbox: function(){
			return 'checkbox'
		},
		textarea: function(){
			return 'textarea'
		}
	},
	dataView:{
		'text': function(input,value){
			var spanId = input.attr('id') + '_span';
			input.hide();
			$('#' + spanId).remove();
			input.after('<span id="'+spanId+'">'+value+'</span>');
		},
		'jctree': function(input,value){
			return 'jctree';
		},
		'select-one': function(input,value){
			var spanId = input.attr('id') + '_span';
			var option = input.find('option');
			input.hide();
			$('#' + spanId).remove();
			for(var i=0;i<option.length;i++){
				var optEle = $(option[i]);
				if(optEle.val() && optEle.val() === value){
					value = optEle.attr('title');
					$('#' + spanId).remove();
					input.after('<span id="'+spanId+'">'+value+'</span>');
					return;
				}
			}
		},
		'radio': function(input,value){
			if(input.val() == value){
				input.parent().show();
			}else{
				input.parent().hide();
			}
			input.hide();
		},
		'checkbox': function(input,value){
			if(value.indexOf(input.val()) != -1){
				input.parent().show();
			}else{
				input.parent().hide();
			}
			input.hide();
		},
		'textarea': function(input,value){
			var spanId = input.attr('id') + '_span';
			input.hide();
			$('#' + spanId).remove();
			input.after('<span id="'+spanId+'">'+value+'</span>');
		},
		'password': function(input,value){
			
		}
		
	},
	dataEdit:{
		'text': function(input,value){
			var spanId = input.attr('id') + '_span';
			if(!input.hasClass('datepicker-input')){
				if(value){
					input.removeClass('placeholder');
				}else{
					input.addClass('placeholder');
				}
			}
			input.val(value);
			input.show();
			$("#"+ spanId).remove();
		},
		'jctree': function(input,value){
			return 'jctree';
		},
		'select-one': function(input,value){
			var spanId = input.attr('id') + '_span';
			input.show();
			input.val(value);
			$("#"+ spanId).remove();
		},
		'radio': function(input,value){
			if(input.val() == value){
				input.attr('checked',true);
			}else{
				input.attr('checked',false);
			}
			input.show();
			input.parent().show();
		},
		'checkbox': function(input,value){
			if(value.indexOf(input.val())!=-1){
				input.attr('checked',true);
			}else{
				input.attr('checked',false);
			}
			input.show()
			input.parent().show();
		},
		'textarea': function(input,value){
			var spanId = input.attr('id') + '_span';
			if(value){
				input.removeClass('placeholder');
			}else{
				input.addClass('placeholder');
			}
			input.show();
			input.html(value);
			$("#"+ spanId).remove();
		},
		'password': function(input,value){
			
		}
	},
	fills: {

	},
	/**
	 * 字段回显时的处理
	 * @return {[type]} [description]
	 */
	echo: function(operatetype,input){
		var _this = this;
		_this.actions[input[0].type].call(_this,operatetype,input);
		
	},
	/**
	 * 获取当前表单内所有可提交字段的对象
	 * @return {[type]} [description]
	 */
	getData: function(){
		var _this = this,
			els = _this.elements(),
			results = [];
		els.each(function(index ,el){
			if(_this.actions[el.field]){
				results.push(_this.actions[el.field](el.element));
			}
		});
		return results;
	},
	setData:function(){
		var _this = this,
			els = _this.elements(),
			results = [];
		els.each(function(index ,el){
			if(_this.fills[el.field]){
				_this.actions[el.field](el.element);
			}
		});
	},
	/**
	 * 获取当前表单全部和数据库相关元素
	 */
	elements: function(){
		//获取所有
		return this.$form.find('[data-field]').map(function(){
			var $this = $(this);
			return {
				field: $this.data('field'),
				element: $this,
				parent: $this.parent('td')
			}
		});
	},
	getElements: function(){
		var _this = this;
		_this.allElement = _this.elements();
	},
	/**
	 * 获取动态id
	 * @return {[type]} [description]
	 */
	_guid: function(){
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
			v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		}).toUpperCase();
	},
	/**
	 * 判断提交表单中是否含有checkbox
	 * @return {[type]} [checkbox]
	 */
	hasCheckbox: function(formData){
		var _this = this, 
			opt = _this.option,
			checkbox = $("#form_" + opt.formId + ' input[type=checkbox]:checked'),
			checkboxVal = '';
		if(checkbox.length){
			for(var i=0;i<checkbox.length;i++){
				checkboxVal += $(checkbox[i]).attr('name') +":"+ $(checkbox[i]).val() + ",";
			}
			checkboxVal = checkboxVal.split(',');
			for(var j=0;j<formData.length;j++){
				for(var k=0;k<checkboxVal.length;k++){
					var checkName = checkboxVal[k].split(':');
					if(formData[j].name == checkName[0]){
						formData[j].value += ',' + checkName[1];
					}
				}
			}
		}
	},
	/**
	 * 保存继续，保存退出
	 * @return {[type]} [description]
	 */
	save: function(that, listAuto){
		var _this = this, opt = _this.option,
		formId = $("#form_" + opt.formId),
		btnType = $(that).attr('btntype');
		if (formId.valid()) {
			var formData = formId.serializeJson();
			//_this.hasCheckbox(formData);
			$.ajax({
		        type : "POST",
		        url :  getRootPath() + "/data/saveData.action",
		        dataType : "json",
		        headers: {
					datamodel : listAuto.datamodel
				},
		        data : formData,
		        success : function(data) {
		            if (data.success) {
		            	JC.layer.msg({content:data.successMessage,icon: 1});
		            	if(btnType == 'modalSaveAndExit'){//保存退出
		            		$("#file-edit").modal('hide');
		            	}
		            	currentTankageObject[listAuto.tableId].getList();
		            	formId[0].reset();
		            	clearForm();
		            }else{
		            	JC.layer.msg({content:'保存失败',icon: 2});
		            }
		            
		        }
		    });
		}
	},
	/**
	 * 保存
	 * @return {[type]} [description]
	 */
	onlySave: function(formId, datamodel){
		var formData = $("#" + formId).serializeJson();
		if($("#" + formId).valid()) {
			//_this.hasCheckbox(formData);
			$.ajax({
		        type : "POST",
		        url :  getRootPath() + "/data/saveData.action",
		        dataType : "json",
		        headers: {
					datamodel : datamodel
				},
		        data : formData,
		        success : function(data) {
		        	if(data.success){
		        		JC.layer.msg({content:data.successMessage,icon: 1});
		        		$("#" + formId)[0].reset();
		        		window.history.back(-1); 
		        	}else{
		            	JC.layer.msg({content:'保存失败',icon: 2});
		            }
		        }
		    });
		}
	},
	/**
	 * 查看,编辑
	 * @return {[type]} [description]
	 */
	view: function(that, listAuto){
		var _this = this,
		formId = $("#form_" + _this.option.formId),
		operatetype = $(that).attr('operatetype');
		$.ajax({
	        type : "GET",
	        url :  getRootPath() + "/data/getData.action",
	        async: false,
	        headers: {
				datamodel : listAuto.datamodel
			},
	        data : {
	            "id" : that.attr("id")
	        },
	        dataType : "json",
	        success : function(data) {
	            if (data) {
	                _this.getData();
	                var footer = $('#file-edit .modal-footer');
	                var dddList = data.dddList;
	                var dyElement = [];
	                if(operatetype == 'view'){//查看隐藏多余按钮
	                	var valueData = _this.elements();
	                	$('#file-edit .modal-title').html('查看');
	                	$('#file-edit .modal-footer button[btntype=modalSaveAndCarry]').hide();
	                	$('#file-edit .modal-footer button[btntype=modalSaveAndExit]').hide();
	                	$('#file-edit .modal-footer button[btntype=editSave]').hide();
	                	for(var i = 0;i<valueData.length;i++){
		                	var input = $(valueData[i].element);
		                	if(input[0].type){
		                		
		                		if(valueData[i].field.indexOf('.') != -1){
		                			if(dddList && dddList.length){
		                				var dyField = valueData[i].field.split('.')[1];
				                		for(var j=0;j<dddList.length;j++){
				                			console.log(input);
				                			_this.dataView[input[0].type](input,dddList[j][dyField]);
				                		}
		                			}
			                		
			                	}else{
			                		_this.dataView[input[0].type](input,data[valueData[i].field]);
			                	}
		                	}
		                }
	                	
	                	
	                }else{
	                	/*if(!$.isEmptyObject(data)){
	                		formId.fill(data);
	            		}*/
	                	var valueData = _this.elements();
	                	for(var i = 0;i<valueData.length;i++){
		                	var input = $(valueData[i].element);
		                	if(input[0].type){
		                		_this.dataEdit[input[0].type](input,data[valueData[i].field]);
		                	}
		                }
	                	$('#file-edit .modal-title').html('编辑');
	                	$('button[btntype=editSave]').remove();
	                	$('#file-edit .modal-footer button[btntype=modalSaveAndCarry]').hide();
	                	$('#file-edit .modal-footer button[btntype=modalSaveAndExit]').hide();
	                	$("#id").remove();
	                	$("#modifyDate").remove();
	                	formId.prepend('<input type="hidden" id="id" name="id" value="'+data.id+'"/>');
		                formId.prepend('<input type="hidden" id="modifyDate" name="modifyDate" value="'+data.modifyDate+'"/>');
	                	footer.prepend('<button class="btn dark" type="editSave" btntype="editSave" id="editSave">保存</button>');
	                	$('.datepicker-input').datepicker();
	                }
	            }
	        }
	    });
	},
	/**
	 * 链接模式的查看,编辑
	 * @return {[type]} [description]
	 */
	linkView: function(id, operatetype, datamodel){
		var _this = this, formId = $("#form_" + _this.option.formId);
		$.ajax({
	        type : "GET",
	        url :  getRootPath() + "/data/getData.action",
	        headers: {
				datamodel : datamodel
			},
	        data : {
	            "id" : id
	        },
	        dataType : "json",
	        success : function(data) {
	            if (data) {
	                _this.getData();
	                var footer = $('.form-btn');
	                if(operatetype == 'view'){//查看隐藏多余按钮
	                	var valueData = _this.elements();	                	
	                	for(var i = 0;i<valueData.length;i++){
		                	var input = $(valueData[i].element);
		                	if(input[0].type){
		                		_this.dataView[input[0].type](input,data[valueData[i].field]);
		                	}
		                }
	                	footer.html('');
	                	footer.prepend('<button class="btn dark" type="goBack" btntype="goBack" id="goBack">返回</button>');
	                }else{
	                	var valueData = _this.elements();
	                	for(var i = 0;i<valueData.length;i++){
		                	var input = $(valueData[i].element);
		                	if(input[0].type){
		                		_this.dataEdit[input[0].type](input,data[valueData[i].field]);
		                	}
		                }
	                	$('#file-edit .modal-title').html('编辑');
	                	$('button[btntype=editSave]').remove();
	                	$("#id").remove();
	                	$("#modifyDate").remove();
	                	formId.prepend('<input type="hidden" id="id" name="id" value="'+data.id+'"/>');
		                formId.prepend('<input type="hidden" id="modifyDate" name="modifyDate" value="'+data.modifyDate+'"/>');
	                	footer.prepend('<button class="btn dark" type="editSave" btntype="editSave" id="linkEditSave">保存</button>');
	                	$('.form-btn button[type=submit]').hide();
	                	$('.datepicker-input').datepicker();
	                }
	            }
	        }
	    });
	},
	/**
	 * 编辑中的保存
	 * @return {[type]} [description]
	 */
	editSave: function(that, listAuto){
		var _this = this, opt = _this.option,
			formId = $("#form_" + opt.formId),
			formData = formId.serializeJson();
		//_this.hasCheckbox(formData);
		if(formId.valid()) {
			$.ajax({
		        type : "PUT",
		        url :  getRootPath() + "/data/upData.action",
		        headers: {
					datamodel : listAuto.datamodel
				},
				data : formData,
		        dataType : "json",
		        success : function(data) {
		        	if (data.success) {
		            	JC.layer.msg({content:data.successMessage,icon: 1});
		            	$("#id").remove();
		            	$("#modifyDate").remove();
		            	if(listAuto.tableId){//弹出层形式的编辑保存
		            		currentTankageObject[listAuto.tableId].getList();		            	
			            	$("#file-edit").modal('hide');	
		            	}else{//链接形式的编辑保存
		            		window.history.back(-1); 
		            	}
		            		            	
		            }else{
		            	JC.layer.msg({content:'保存失败',icon: 2});
		            }
		        }
		    });
		}
	},
	/**
	 * 批量删除
	 * @return {[type]} [description]
	 */
	deleteList: function(that,listAuto){
		var _this = this,
			id = $(that).attr('id'),
			ids = String(id);
		if ($(that).attr('btntype') == 'multiDelete') {
			var idsArr = [];
			$("[name='ids']:checked").each(function() {
				idsArr.push($(this).val());
			});
			ids = idsArr.join(",");
		}
		if (ids.length == 0) {
			JC.layer.alert('请选择要删除的数据');
			return;
		}
		JC.layer.confirm({
	        content: '确定删除吗？',
	        yes: function(index, layro) {
	        	
	        	_this.deleteData(ids,listAuto);
				JC.layer.close(index);
	        }
	   });
	},
	/**
	 * 删除
	 * @return {[type]} [description]
	 */
	deleteData: function(ids,listAuto){
		$.ajax({
			type : "DELETE",
			url :  getRootPath() + "/data/delData.action?ids=" + ids,
			traditional : true,
			headers: {
				datamodel : listAuto.datamodel
			},
			dataType : "json",
			success : function(data) {
				if (data.success) {
					JC.layer.msg({content:'删除成功',icon: 1});
				} else {
					JC.layer.msg({content:'删除失败',icon: 2});
				}
				currentTankageObject[listAuto.tableId].getList();
			}
		});
	},
	//清除验证信息
	hideErrorMessage: function(){
		$("label.error").remove();
		$(".error").removeClass("error");
		$(".help-block").css('display','none');
	}
	
});
//表单新增