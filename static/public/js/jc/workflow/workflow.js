if(!window.JC){
	var JC = {};
}

JC.workflow = {};


JC.workflow.init = function(opt){
	$("#workflowModel").find("#saveBtn").click(function(){
		workflow.doSubmit(opt);
	});
	jQuery.ajax({
		url : getRootPath()+"/workFlow/processTemplate/getTemplateByUserId.action",
		data:'',
		type : 'POST',
		async:false,
		success : function(data) {
			var processTypeList = [];
			processTypeIdList = new Array();
			processTypeNameList = new Array();
			
			for(var i = 0 ; i < data.length ; i++){
				workflow.readyProcessType(data[i].typeId,data[i].typeName);
			}
			
			for(var i = 0 ; i < processTypeIdList.length ; i++){
				processTypeList[i] = {
						typeId:processTypeIdList[i],
						typeName:processTypeNameList[i]
				}
			}
			
			var	setting = {
					check : {
						enable : true,
						nocheckInherit : true,
						chkStyle: "checkbox"
					},
					view : {
						selectedMulti : false
					},
					data : {
						simpleData : {
							enable : true
						}
					},
					callback : {
					}
				};
			
			var zNodes = [];
			for(var i = 0 ; i < processTypeList.length; i++){
				zNodes[i] = {
						id : processTypeList[i].typeId,
						name : processTypeList[i].typeName,
						pId : -1
				}
			}
			for(var i = processTypeList.length; i < (processTypeList.length + data.length) ; i++){
				zNodes[i] = {
						id : data[(i-processTypeList.length)].flowName+"&"+data[(i-processTypeList.length)].flowId,
						name: data[(i-processTypeList.length)].flowName,
						pId : data[(i-processTypeList.length)].typeId
				}
			}
			setting.check.chkboxType = { "Y" : "ps", "N" : "ps" };
			$.fn.zTree.init($("#workflowModel #processTemplateTree"), setting, zNodes);
		},
		error:function(){
				
		}
	});
	
		
	

}


JC.workflow.readyProcessType = function(typeId,typeName){
	var flag = true;
	for(var i = 0 ; i < processTypeIdList.length ; i++){
		if( processTypeIdList[i] == typeId ){
			flag = false;
		}
	}
	if(flag){
		processTypeIdList.push(typeId);
		processTypeNameList.push(typeName);
	}
	
}

JC.workflow.chooseSelect = function(obj,value){
	this.workflowModel.find("input[type='checkbox'][id^='"+value+"']").each(function() {
		$(this).prop("checked",obj.checked);
	});
}
JC.workflow.open = function(){
	$("#workflowModel").modal("show");
	var treeObj = $.fn.zTree.getZTreeObj("processTemplateTree");
	treeObj.checkAllNodes(false);
	treeObj.expandAll(false);
}

JC.workflow.close = function(){
	$("#workflowModel").modal("hide");
}

JC.workflow.doSubmit = function(opt){
	var treeObj = $.fn.zTree.getZTreeObj("processTemplateTree");
	var nodes = treeObj.getCheckedNodes(true);
	var x = 0;
	var processDefinitions = new Array();
	for(var i = 0 ; i < nodes.length; i ++){
		var id = nodes[i].id;
		if((id+"").indexOf("&") != -1){
			var processType = {id:"id",name:"name",flowId:"flowId"};
			processType.name = id.split("&")[0];
			processType.flowId = id.split("&")[1];
			processDefinitions[x] = processType;
			x++;
		}
	}
	if(opt.callback!=null){
		opt.callback(processDefinitions);
	}
	workflow.close();
}

/**
 * 根据类型名车查询流程列表
 */
JC.workflow.getFlowsByType = function(typeName,divId){
	$("#"+divId).html("");
	if(typeName==null||typeName.length==0){
		msgBox.tip({
			type:"fail",
			content:"类型名为空"
		});
		return;
	}
	
	var ajaxData = {
			typeName:typeName,
			time:new Date()
	}
	
	$.ajax({
		url:getRootPath()+"/workFlow/processTemplate/queryAll.action",
		type:"post",
		async:false,
		data:ajaxData,
		success:function(data){
			var selectStr = "<select id='workflows' name='workflows'></select>";
			$("#"+divId).append(selectStr);
			$("select#workflows").append("<option value=''>-请选择-</option>")
			for(var i=0;i<data.length;i++){
				var optionStr = "<option value='"+data[i].flowId+"'>"+data[i].flowName+"</option>";
				$("select#workflows").append(optionStr);
			}
		}
	});
}


/**
 * 根据类型标识查询流程列表
 */
JC.workflow.getFlowsByIden = function(typeIden,divId){
	$("#"+divId).html("");
	if(typeIden==null||typeIden.length==0){
		msgBox.tip({
			type:"fail",
			content:"标识名为空"
		});
		return;
	}
	
	var ajaxData = {
			typeIden:typeIden,
			time:new Date()
	}
	
	$.ajax({
		url:getRootPath()+"/workFlow/processTemplate/getTemplateByUserIdForInfo.action",
		type:"post",
		async:false,
		data:ajaxData,
		success:function(data){
			var selectStr = "<select id='workflows' name='workflows'></select>";
			$("#"+divId).append(selectStr);
			$("select#workflows").append("<option value=''>-请选择-</option>")
			for(var i=0;i<data.length;i++){
				var optionStr = "<option value='"+data[i].flowId+"'>"+data[i].flowName+"</option>";
				$("select#workflows").append(optionStr);
			}
		}
	});
}

/**
 * 根据类型标识查询流程列表(是否)
 */
JC.workflow.isHasFlowsByIden = function(typeIden,divId){
	$("#"+divId).html("");
	if(typeIden==null||typeIden.length==0){
		msgBox.tip({
			type:"fail",
			content:"标识名为空"
		});
		return false;
	}
	
	var ajaxData = {
			typeIden:typeIden,
			time:new Date()
	}
	
	$.ajax({
		url:getRootPath()+"/workFlow/processTemplate/getTemplateByUserId.action",
		type:"post",
		async:false,
		data:ajaxData,
		success:function(data){
			if(data.length > 0){
				return true;
			}else{
				return false;
			}
		}
	});
}