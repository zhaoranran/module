 //----------------------------------------formPrivilege.js------------------------------------------------//
 /**
  *  @description 初始化表单权限(只读，可写，隐藏)
  */
 JC = function(e){
	 var formPriv = {}
	 JC.prototype.formPriv = formPriv;
 /**
  *  @description 判断并执行的主函数
  *  opt: editField:编辑的组件id数组
  *  	 hideField:隐藏的组件id数组
  *  	 readField：只读的组件id数组
  *  	 view:true/false 	浏览模式
  */
 formPriv.doForm = function(opt){
 	formPriv.opt = opt;
 	var jqueryForm = "form";
 	var formObj = $(jqueryForm);
 	if(formObj.length==0){
 		alertx("没有找到对应的表单");
 		return;
 	}
 	formObj = $(formObj[0]);
 	formObj.find("[workFlowForm]").each(function(){
 		var item = $(this);
 		var itemId = $(this).attr("itemName");
 		var itemType = $(this).attr("workFlowForm");
 		if(formPriv.opt.view==true||formPriv.opt.view=="true"){
 			//对于浏览模式,viewShow=true属性的控件不做判断
 			if($(this).attr("viewShow")!="true"){
 				formPriv.type[itemType].read(item);
 			}
 		}else{
 			if(formPriv.opt.hideField.indexOf(itemId)!=-1){
 				formPriv.type[itemType].hide(item);
 			}else if(formPriv.opt.editField.indexOf(itemId)!=-1){
 				//可读不做操作
 			}else{
 				formPriv.type[itemType].read(item);
 			}
 		}
 	});
 }

 //各个组件的状态判断
 formPriv.type={};
 formPriv.type["hidden"]={
		 hide:function(obj){
	 	 },
	 	 read:function(obj){
	 	 }
 }
 formPriv.type["textinput"]={
 		hide:function(obj){
 			obj.remove();
 		},
 		read:function(obj){
 			if(obj.is('input')||obj.is('textarea')){
 				var label = obj.val();
 				label=label.replace(/\r\n/g,"<BR>");  
 		        label=label.replace(/\n/g,"<BR>");
 				obj.parent().html(label);
 			}else{
 				var label = obj.find('input').val();
 				obj.html(label);
 			}
 			
 		}
 }

 formPriv.type["radio"]={
 		hide:function(obj){
 			obj.remove();
 		},
 		read:function(obj){
 			var checkedLabel = "";
 			var checkEle = obj.find("input:radio:checked");
 			if(checkEle.length==1){
 				checkedLabel = 	checkEle.attr("label");
 			}
 			obj.html(checkedLabel);
 		}
 }

 formPriv.type["checkbox"]={
 		hide:function(obj){
 			obj.remove();
 		},
 		read:function(obj){
 			var checkedLabel = "";
 			obj.find("input:checkbox:checked").each(function(index,item){
 				checkedLabel+=$(item).attr("label")+",";
 			});
 			if(checkedLabel.length>0){
 				checkedLabel = checkedLabel.substring(0,checkedLabel.length-1);
 			}
 			obj.html(checkedLabel);
 		}
 }

 formPriv.type["select"]={
 		hide:function(obj){
 			obj.remove();
 		},
 		read:function(obj){
 			var selectLabel = "";
 			obj.find("select:not(.noneWorkflow) option:checked").each(function(index,item){
 				if($(item).val()==null||$(item).val().length==0){
 					selectLabel="";
 				}else{
 					selectLabel=$(item).html();
 				}
 			});
 			obj.html(selectLabel);
 		}
 }

 formPriv.type["button"]={
 		hide:function(obj){
 			obj.remove();
 		},
 		read:function(obj){
 			//暂时没有添加只读操作
 			obj.hide();
 		}
 }

 //人员选择框
 formPriv.type["userSelect"]={
 		hide:function(obj){
 			obj.remove();
 		},
 		read:function(obj){
 			var itemId = obj.attr("itemName");
 			var divId = itemId.split("!")[0];
 			var controlId = itemId.split("!")[1];
 			var results = returnValue(controlId);
 			var resultStr = "";
 			if(results!=null){
 				var users = results.split(",");
 				for(var i=0;i<users.length;i++){
 					resultStr += users[i].split(":")[1]+",";
 				}
 			}
 			if(resultStr.length>0){
 				resultStr = resultStr.substring(0,resultStr.length-1);
 			}
 			$("#"+divId).html(resultStr);
 		}
 }

 //动态添加行
 formPriv.type["autoRow"]={
 		hide:function(obj){
 			obj.remove();
 		},
 		read:function(obj){
 			obj.find("[autoFlowForm]").each(function(){
 				var autoItem = $(this);
 				var autoItemType = $(this).attr("autoFlowForm");
 				formPriv.type["autoRow"].type[autoItemType].read(autoItem);
 			});
 			//去操作列
 			obj.find("[operate]").each(function(index,item){
 				$(item).remove();
 			})
 			if($("#flowStatus").val() == 1 || ($("#flowStatus").val() == 3 && $("#scanType").val() == "view")){//去掉待办计划时的计划列表操作列
 	 			obj.find("[opc]").each(function(index,item){
 	 				$(item).remove();
 	 			})
 			}
 		}
 }

 //动态添加行
 formPriv.type["editor"]={
 		hide:function(obj){
 			obj.hide();
 		},
 		read:function(obj){
 			var itemId = obj.attr("itemName");
 			var editor = UE.getEditor(itemId);
 			editor.ready( function( editor ) {
 				UE.getEditor(itemId).setDisabled();
 			 });
 		}
 }

 //容器
 formPriv.type["container"]={
 		hide:function(obj){
 			obj.hide();
 		},
 		read:function(obj){
 		}
 }

 //动态添加行具体类型
 formPriv.type["autoRow"].type = {};

 //动态添加行-文本输入框
 formPriv.type["autoRow"].type["textinput"]={
 	read:function(obj){
 		var textObj = obj.find("input");
 		obj.parent().html(textObj.val());
 	}
 }

 //动态添加行-文本输入域
 formPriv.type["autoRow"].type["textarea"]={
 	read:function(obj){
 		var textObj = obj.find("textarea");
 		obj.parent().html(textObj.val());
 	}
 }

 //动态添加行-checkbox
 formPriv.type["autoRow"].type["checkbox"]={
 	read:function(obj){
 		var autoCheckedLabel = "";
 		obj.find("input:checkbox:checked").each(function(index,item){
 			autoCheckedLabel+=$(item).attr("label")+",";
 		});
 		if(autoCheckedLabel.length>0){
 			autoCheckedLabel = autoCheckedLabel.substring(0,autoCheckedLabel.length-1);
 		}
 		obj.parent().html(autoCheckedLabel);
 	}
 }
 
 //动态添加行-select
 formPriv.type["autoRow"].type["select"]={
 	read:function(obj){
 		var selectHtml = "";
 		obj.find("select option:checked").each(function(index,item){
 			if($(item).val()==null||$(item).val().length==0){
 				selectHtml="";
			}else{
				selectHtml=$(item).html();
			}
 		});
 		obj.parent().html(selectHtml);
 	}
 }

 //动态添加行-文本输入框
 formPriv.type["autoRow"].type["button"]={
 	read:function(obj){
 		obj.remove();
 	}
 }

 //动态添加行-人员选择
 formPriv.type["autoRow"].type["userSelect"]={
 	read:function(obj){
 		var itemId = obj.attr("itemId");
 		var results = returnValue(itemId);
 		var resultStr = "";
 		if(results!=null){
 			var users = results.split(",");
 			for(var i=0;i<users.length;i++){
 				resultStr += users[i].split(":")[1]+",";
 			}
 		}
 		if(resultStr.length>0){
 			resultStr = resultStr.substring(0,resultStr.length-1);
 		}
 		obj.html(resultStr);
 	}
 }

 //动态添加行-div
 formPriv.type["autoRow"].type["content"]={
 	read:function(obj){
 		var text = obj.html();
 		text=text.replace(/\r\n/g,"<BR>");  
 		text=text.replace(/\n/g,"<BR>");
 		obj.parent().html(text);
 	}
 }

//----------------------------------------formDetail.js------------------------------------------------//
var formDetail = {};
formDetail.routeData = {};			//读取的路径数据
formDetail.tableNum = 1;			//formDetail
formDetail.submitType = "";
if(parent.menuswrite!=null){
	parent.menuswrite.statue = true;
}
formDetail.state = true;
 
 /**
  * @description 加载意见域相关数据
  * @para	workId:流程实例id
  * 		opt:隐藏，编辑，只读权限
  */
 formDetail.initSuggest = function(){
	 var suggestToHeight = [];
	 $("[workflowSuggest='true']").each(function(){
		 var suggestDiv = $(this);
		if($(this).find("textarea").length>0){
			//初始化常用词
			var textareaId = $(this).find("textarea").attr("id");
			var containerId = $(this).find("[id^=phrase]").attr("id");
			 phraseComponent.init({
				containerId:containerId,
				fillEleId:textareaId
			});
		}
		$(this).find(">div").each(function(index,item){
			suggestToHeight[suggestToHeight.length]={
					divId:$(item).attr("id"),
					signId:$(item).attr("signId")
			}
		});
	 });
	 var signInfo = $("#signInfoOld").val();
	 if(signInfo.length>0){
		 if(!isChrome()&&!isFF()&&document.all.DWebSignSeal!=null){
				document.all.DWebSignSeal.SetStoreData(signInfo);
				document.all.DWebSignSeal.ShowWebSeals();
			 	$("#signInfo").val(signInfo);
				formDetail.caseHeight(suggestToHeight);
				document.all.DWebSignSeal.ShowWebSeals();
				 $("[workflowSuggest=true]>div").each(function(index,item){
					var objItem = $(this);
					objItem.find(">div").css("z-index",100);
					var signId = objItem.attr("signId");
					var px = document.all.DWebSignSeal.GetSealPosX (signId);
					var py = document.all.DWebSignSeal.GetSealPosY (signId)
					var swidth = document.all.DWebSignSeal.GetSealWidth (signId);
					var divWidth = objItem.actual("width");
					 var p = objItem.find('p').eq(0);
					 var i = objItem[0];
					 p.css('height',(i.clientHeight-50));
					if(px+swidth>divWidth){
						document.all.DWebSignSeal.MoveSealPosition(signId,divWidth-swidth,py,objItem.attr("id"));
					}
				 });
		}
	 }
 }
 formDetail.getSignType = function() {
	 return document.getElementById('signType').value;
 }
 /**
  * 意见域匹配高度
  */
 formDetail.caseHeight = function(suggestToHeight){
	 for(var i = 0 ; i < suggestToHeight.length; i++){
		 var height = document.DWebSignSeal.GetSealHeight(suggestToHeight[i].signId);
		 if(height>0){
			 $("#"+suggestToHeight[i].divId).css("min-height",height+80);
		 }
	 }
 }
 
 /**
  * @description 返回意见域内容
  */
 formDetail.fillSuggestContent = function(suggest){
	 var signId = suggest.signId;
	 var itemId = suggest.signContainerId.split("_")[0];
	 var flag = suggest.signContainerId.split("_")[1];
	 var divId = itemId+"_"+flag;
	 if(suggest.showFlag == true){
		 var htmlStr = '<div style="position: relative;padding-bottom:50px;z-index:1;" class="signature-box m-b-sm" id="'+divId+'" >'+
			"<p>"+formDetail.formatSuggest(suggest.message)+"</p>"+
			"<P style='position: absolute;bottom:14px'>"+suggest.createDate+"<strong style='padding-left:30px'>"+suggest.userName+"</strong></p>"+
		'</div>';
	 }else{
		 var htmlStr = '<div style="display:none" id="'+divId+'" >'+
		'</div>';
	 }
	
	 $("#"+suggest.suggestId).append(htmlStr);
 }
 
 /**
  * @description 格式化意见域内容到页面显示
  */
 formDetail.formatSuggest = function(str){
	 var result =str.replace(/\r\n/g,"<BR>")  
     result=result.replace(/\n/g,"<BR>"); 
	 return result;
 }
 
 /**
  * @description 返回意见域填写模板
  */
 formDetail.fillSuggestInsert = function(container){
	 var itemId = container.attr("id");
	 var flag = new Date().getTime();		//唯一标志
	 var divId = itemId+"_"+flag;
	 var textareaId = itemId+"Textarea"+flag;
	 var htmlStr = '<div style="z-index:1">'+
						'<div class="m-b-sm">'+
							'<span id="phrase'+flag+'"></span>'+
							'<a href="javascript:void(0);" onclick="formDetail.showWritePannel(\''+divId+'\')" class="a-icon i-new m-r-xs">签批</a>'+
						'</div>'+
						'<div signContainer="true" id="'+divId+'">'+
							'<textarea id="'+textareaId+'" class="comments" rows=4 cols=27   ></textarea>'+ 
						'</div>'+
     				'</div>';
	 container.append(htmlStr);
	 phraseComponent.init({
		containerId:'phrase'+flag,
		fillEleId:textareaId
	});
 }
 
 /**
  * @description 弹出手写框 
  */
 formDetail.showWritePannel = function(divId){
	// alert(divId+"\n"+$("#signType").val()+"\n"+$("#suggestType").val());
	 if("0" == $("#signType").val()) {
		 var signId = handWritten.showWritePannel(divId);
	      $("#signId").val(signId);
		 
	 } else if("1" == $("#signType").val()){
		 handWritten.showWritePannel_JG(divId);
	 }
 }
 
 /**
  * @description 按钮事件
  */
 formDetail.showRoute = function(type){
	 var workId = $("#workId").val();
	 //将意见赋值到隐藏域
	 if(!isChrome()&&!isFF()&&document.all.DWebSignSeal!=null){
		 if("0" == $("#signType").val()){
			 var v = document.all.DWebSignSeal.GetStoreData();
			 var signInfoFlag = $("#signInfoFlag").val();
			 if(signInfoFlag=="true"){
				 $("#signInfo").val(v);
			 }
		 }
	 }
	 var suggestEle = $("[workflowSuggest]").find("textarea");
	 if(suggestEle.length>0){
		 suggestEle = $(suggestEle.get(0));
		 $("#message").val(suggestEle.val());
		 $("#suggestId").val(suggestEle.parents("[workflowSuggest]").attr("id"));
		 $("#signContainerId").val(suggestEle.parents("[workflowSuggest]").find("[signContainer]").attr("id"));
	 }
	 if("1" == $("#signType").val()) {
		 //金格
		 /*var ihtmlSign = document.getElementsByName("iHtmlSignature");
		 var mLength = ihtmlSign.length;
		 var ids = [];
		 for(var i = 0; i < mLength; i++) {
			 var item = ihtmlSign[i];
			 var sId = item.SIGNATUREID;
			 ids[ids.length] = sId;
		 }
		 $('#signIds').val(ids.join(','));*/
	 }
	 
	 //将督办赋值到隐藏域
	 $("#supervisionUser").val("");
	 $("#supervisionContent").val("");
	 if($("#supervisionDiv").find("div[isNew='true']").length>0){
		 var userIds = $("#supervisionDiv").find("#userTd").attr("userId");
		 var supervisionContent = $("#supervisionDiv").find("#contentTd").html();
		 $("#supervisionUser").val(userIds);
		 $("#supervisionContent").val(supervisionContent);
	 }
	 formDetail.type[type].show(workId);
 }
 
 //流程提交所有类型
 formDetail.type={}
 
//提交相应方法
 formDetail.type["Submit"]={
	show:function(workId){
		//表单验证
		if(!handWritten.checkSignData()) {
			validateFormFail("请填写或签批意见");
			return false;
		}
		if(typeof validateForm=='function'){
			var validResult = validateForm("Submit");
			if(!validResult||validResult==null){
				if(typeof validateFormFail=='function'){
					validateFormFail();
				}
				return false;
			}else{
				if(typeof(validResult) == "string") {
					validateFormFail(validResult);
					return false;
				}
			}
		}
		
		var formData = new Array();
		formData.push({"name": "flowVariables", "value": formDetail.getFlowVariable()});
		formData.push({"name" : "workId","value" : workId});
		formData.push({"name" : "curNodeId","value":document.getElementById("curNodeId").value});
		formData.push({"name" : "curTrackId","value":document.getElementById("curTrackId").value});
		jQuery.ajax({
			url : getRootPath()+"/workFlow/task/getNextNode.action",
			type : 'POST',
			data : JSON.stringify(serializeJson(formData)),
			contentType: "application/json;charset=UTF-8",
			success : function(data) {
				formDetail.routeData = data.routeLinkList;
				//会签的情况路径为空
				if(formDetail.routeData == null){
					alertx("数据已更新，请刷新页面");
					return;
				}
				if(formDetail.routeData.length==0){
					formDetail.doSubmit("Submit");
				}else if(formDetail.routeData.length==1){
					var htmlStr = $("#selectUserModalDiv").html();
					if(htmlStr.length==0){
						$("#selectUserModalDiv").load(getRootPath()+"/workFlow/form/getSelectUserModal.action",function(){
							
							 $("#selectUserModal").modal({
								 backdrop:true,
								 keyboard:true,
								 show:false
							 });
							 $("#selectUserModal #saveBtn").click(function(){
								 formDetail.doSubmit("Submit");
							 });
							
							$("#selectUserModal #selectUserList").html("");
							formDetail.insertUserToDiv(formDetail.routeData[0]);
							ie8StylePatch();
							//当最后节点为结束时，直接提交通过
							if(formDetail.routeData[0].nextNodeId.indexOf("End")!=-1){
								formDetail.doSubmit("Submit");
							}else{
								$("#selectUserModal").modal("show");
							}
						});
					}else{
						$("#selectUserModal #selectUserList").html("");
						formDetail.insertUserToDiv(formDetail.routeData[0]);
						ie8StylePatch();
						//当最后节点为结束时，直接提交通过
						if(formDetail.routeData[0].nextNodeId.indexOf("End")!=-1){
							formDetail.doSubmit("Submit");
						}else{
							$("#selectUserModal").modal("show");
						}
					}
					
				}else{
					formDetail.showRouteModal(data)
				}
			}
		});
	}
 }
 
//退回相应方法
 formDetail.type["Reject"]={
			show:function(workId){
				//表单验证
				if(typeof validateForm=='function'){
					if(!validateForm("Reject")){
						if(typeof validateFormFail=='function'){
							validateFormFail();
						}
						return false;
					}
				}
				var ajaxData = {
						workId : workId,
						time:new Date()
				}
				$.get(getRootPath()+"/workFlow/task/getAllowRejectNode.action",ajaxData,function(data){
					var rejectNodes = data["result"].split("|");
					formDetail.showRejectNodeModal(rejectNodes);
				});
			},
			submit:function(workId,nodeId){
				$("#confirmType").val("Reject");
				$("#confirmRoute").val(nodeId);
				if(nodeId.length==0){
					msgBox.info({
						type:"fail",
						content:$.i18n.prop("JC_WORKFLOW_016")
					});
					return;
				}
				//将流程相关值重新复制的业务表单当中
				$("form").find("[workFlowType='true']").remove();
				  $("input[workFlowType='true']").each(function(index,item){
					  item = $(item);
					  var eleHtml = "<input type='hidden' id='"+item.attr("id")+"' workFlowType='true' name='"+item.attr("name")+"' value='"+item.val()+"'>"
					  $("form").append(eleHtml);
				  });
				 update("Reject",formDetail.afterSubmit);
				 $(".modal").modal("hide");
			}
 }
 
//结束流程相应方法
 formDetail.type["StopFlow"]={
	workId:"",
	show:function(workId){
		//表单验证
		if(typeof validateForm=='function'){
			if(!validateForm("StopFlow")){
				if(typeof validateFormFail=='function'){
					validateFormFail();
				}
				return false;
			}
		}
		formDetail.type["StopFlow"].workId = workId;
		msgBox.confirm({
			content:$.i18n.prop("JC_WORKFLOW_017"),
			success:this.submit
		});
		
	 },
	 submit:function(){
		 var workId = formDetail.type["StopFlow"].workId;
		 $("#confirmType").val("StopFlow");
		//将流程相关值重新复制的业务表单当中
		 $("form").find("[workFlowType='true']").remove();
		  $("input[workFlowType='true']").each(function(index,item){
			  item = $(item);
			  var eleHtml = "<input type='hidden' id='"+item.attr("id")+"' workFlowType='true' name='"+item.attr("name")+"' value='"+item.val()+"'>"
			  $("form").append(eleHtml);
		  });
		update("StopFlow",formDetail.afterSubmit);
	 }
 }
 
//催办流程相应方法
 formDetail.type["ReMsg"]={
	workId:"",
	show:function(workId){
		var ajaxData = {
				workId : workId,
				time:new Date()
		}
		$.get(getRootPath()+"/workFlow/processInstance/getCurUser.action",ajaxData,function(data){
			formDetail.type["ReMsg"].workId = workId;
			formDetail.type["ReMsg"].refresh();
			
			var htmlStr = $("#ReMsgModalDiv").html();
			if(htmlStr.length==0){
				$("#ReMsgModalDiv").load(getRootPath()+"/workFlow/form/getReMsgModal.action",function(){
					
					$("#ReMsgModal").modal({
						 backdrop:true,
						 keyboard:true,
						 show:false
					 });
					$("#ReMsgModal #saveBtn").click(function(){
						 formDetail.type["ReMsg"].validateSms()
					});
					
					//初始化催办标题
					 var title = $("#ReMsgModal #remsgTitle").attr("placeholder");
					 $("#ReMsgModal #remsgTitle").val(title);
					 $("#ReMsgModal #remsgTitle").blur(function(){
						 if($.trim($(this).val())==""){
							 $(this).val($(this).attr("placeholder"));
						 }
					 });
					 
					//初始化催办校验方法
					$("#ReMsgForm").validate({
				        rules: {
				           remsgTitle: {
				        		specialChar:true
						   },
						   remsgContent:{
							   specialChar:true
						   }
					    }
					});
					ie8StylePatch();
					$("#ReMsgModal #userDiv").append(data.name);
					$("#ReMsgModal #userDiv").attr("userId",data.id);
					$("#ReMsgModal").modal("show");
				});
			}else{
				$("#ReMsgModal #userDiv").append(data.name);
				$("#ReMsgModal #userDiv").attr("userId",data.id);
				$("#ReMsgModal").modal("show");
			}
		});
	 },
	 submit:function(remsgType){
		 var workId = formDetail.type["ReMsg"].workId;
		 var userId = $("#ReMsgModal #userDiv").attr("userId");
		 var remsgContent = $("#ReMsgModal #remsgContent").val();
		 var remsgTitle = $("#ReMsgModal #remsgTitle").val();
		 var ajaxData = {
				 remsgType:remsgType,
				 remsgTitle:remsgTitle,
				 workId:workId,
				 userId:userId,
				 remsgContent:remsgContent,
				 time:new Date()
		 };
		$.post(getRootPath()+"/workFlow/processInstance/reMsg.action",ajaxData,function(){
			$("#ReMsgModal").modal("hide");
			msgBox.tip({
				type:"success",
				content:$.i18n.prop("JC_WORKFLOW_018")
			})
		});
	 },
	 validateSms:function(){
		 var remsgType = "";
		 var userId = $("#ReMsgModal #userDiv").attr("userId");
		 $("#ReMsgModal").find("[name='remsgType']").each(function(){
			 if($(this).prop("checked")){
				 remsgType += $(this).val()+","; 
			 }
		 });
		 if(!$("#ReMsgForm").valid()){
			 return;
		 }
		 if(remsgType.length==0){
			 msgBox.info({
				type:"fail",
				content:$.i18n.prop("JC_WORKFLOW_019")
			 });
			 return;
		 }
		 remsgType = remsgType.substring(0,remsgType.length-1);
		 if(remsgType.indexOf("2")!=-1){
			 jQuery.ajax({
					url : getRootPath()+"/workFlow/processInstance/validRemind.action?time=" + new Date(),
					type : 'get',
					async: false,
					dataType : "json",
					data : {'userId':userId},
					success : function(data) {
						if(data.success=="success"){
							formDetail.type["ReMsg"].submit(remsgType);
						}else{
							if(data.success){
								msgBox.confirm({
									content: data.successMessage,
									success: function(){
										formDetail.type["ReMsg"].submit(remsgType);
									},
									cancel:function(){
									}
								});
								
							}else{
								msgBox.info({
									content: data.errorMessage,
									type:"fail"
								});
							} 
						}
					},
					error : function() {
						msgBox.tip({
							type:"fail",
							content:$.i18n.prop("JC_OA_PO_015"),
							callback:function(){
							}
						});
					}
				});
			}else{//是邮件
				formDetail.type["ReMsg"].submit(remsgType);
			}
	 },
	 refresh:function(){
		 var flowName = $("#flowName").val();
		 $("#ReMsgModal #userDiv").html("");
		 $("#ReMsgModal #userDiv").removeAttr("userId");
		 $("#ReMsgModal").find("input[type=checkbox]").prop("checked",false);
		 $("#ReMsgModal #remsgTitle").val($("#ReMsgModal #remsgTitle").attr("placeholder"));
		 $("#ReMsgModal #remsgContent").val("");
	 }
 }
 
//跳转流程相应方法
 formDetail.type["Goto"]={
	workId:"",
	nodeId:"",
	show:function(workId){
		formDetail.type["Goto"].workId = workId;
		//表单验证
		if(typeof validateForm=='function'){
			if(!validateForm("Goto")){
				if(typeof validateFormFail=='function'){
					validateFormFail();
				}
				return false;
			}
		}
		var ajaxData = {
				workId : workId,
				time:new Date()
		}
		$.get(getRootPath()+"/workFlow/task/getGotoNodes.action",ajaxData,function(data){
			var rejectNodes = data["result"].split("|");
			formDetail.showJumpNodeModal(rejectNodes);
		});
	 },
	 submit:function(userIds){
		 $("#confirmType").val("Goto");
		 $("#confirmRoute").val(formDetail.type["Goto"].nodeId);
		 var users = userIds.split(",");
		 var userResult = "";
		 for(var i=0;i<users.length;i++){
			 userResult += "U_"+users[i]+"|";
		 }
		 userResult = userResult.substring(0,userResult.length-1);
		 $("#confirmUser").val(userResult);
		//将流程相关值重新复制的业务表单当中
		 $("form").find("[workFlowType='true']").remove();
		  $("input[workFlowType='true']").each(function(index,item){
			  item = $(item);
			  var eleHtml = "<input type='hidden' id='"+item.attr("id")+"' workFlowType='true' name='"+item.attr("name")+"' value='"+item.val()+"'>"
			  $("form").append(eleHtml);
		  });
		update("Goto",formDetail.afterSubmit);
		$(".modal").modal("hide");
	 },
	 showJumpUserModal:function(workId,nodeId,label){
		
		 var htmlStr = $("#jumpSelectUserModalDiv").html();
		 if(htmlStr.length==0){
			 $("#jumpSelectUserModalDiv").load(getRootPath()+"/workFlow/form/getJumpSelectUserModal.action",function(){
				  $("#jumpSelectUserModal").modal({
						 backdrop:true,
						 keyboard:true,
						 show:false
				  });
				  
				  //selectControl.init("jumpSelectUserModal #jumpUserDiv","jumpUser-jumpUser", true, true);
				 JCTree.init({
					 container: "jumpSelectUserModal #jumpUserDiv",
					 controlId: "jumpUser-jumpUser",
					 isCheckOrRadio: true,
					 isPersonOrOrg: true,
					 title: "用户"
				 });

				  $("#jumpSelectUserModal #saveBtn").click(function(){
						//取出选中值
						var userStr = returnValue("jumpUser-jumpUser");
						if(userStr==null||userStr.length==0){
							msgBox.tip({
								content:$.i18n.prop("JC_WORKFLOW_023"),
								type:"fail"
							});
							return;
						}
						var userIds = "";
						var users = userStr.split(",");
						for(var i=0;i<users.length;i++){
							userIds += users[i].split(":")[0]+",";
						}
						userIds = userIds.substring(0,userIds.length-1);
						formDetail.type["Goto"].submit(userIds);
				});
				  ie8StylePatch();
				 formDetail.fillAndShowJumpSelectUserModal(workId,nodeId,label);
			 });
		 }else{
			 formDetail.fillAndShowJumpSelectUserModal(workId,nodeId,label);
		 }
	 }
 }
 
 /**
  * @description 填入跳转选择人员弹出框内容并显示
  */
formDetail.fillAndShowJumpSelectUserModal = function(workId,nodeId,label){
	 $("#jumpNodeModal").modal("hide");
	 formDetail.type["Goto"].nodeId = nodeId;
	 $("#jumpNodeDiv").html(label);
	 $("#jumpSelectUserModal").modal("show");
}
 
//跳转流程相应方法
 formDetail.type["Move"]={
	workId:"",
	show:function(workId){
		formDetail.type["Move"].workId = workId;
		//表单验证
		if(typeof validateForm=='function'){
			if(!validateForm("Move")){
				if(typeof validateFormFail=='function'){
					validateFormFail();
				}
				return false;
			}
		}
		
		var htmlStr = $("#moveSelectUserModalDiv").html();
		 if(htmlStr.length==0){
			 $("#moveSelectUserModalDiv").load(getRootPath()+"/workFlow/form/getMoveSelectUserModal.action",function(){
				//选择转办人对话框
				 $("#moveSelectUserModal").modal({
					 backdrop:true,
					 keyboard:true,
					 show:false
				 })
				 //selectControl.init("moveSelectUserModal #moveUserDiv","moveUser-moveUser", true, true);
				 JCTree.init({
					 container: "moveSelectUserModal #moveUserDiv",
					 controlId: "moveUser-moveUser",
					 isCheckOrRadio: true,
					 isPersonOrOrg: true,
					 title: "用户"
				 });

				 $("#moveSelectUserModal #saveBtn").click(function(){
						//取出选中值
						var userStr = returnValue("moveUser-moveUser");
						if(userStr==null||userStr.length==0){
							msgBox.tip({
								content:$.i18n.prop("JC_WORKFLOW_024"),
								type:"fail"
							});
							return;
						}
						var userIds = "";
						var users = userStr.split(",");
						for(var i=0;i<users.length;i++){
							userIds += users[i].split(":")[0]+",";
						}
						userIds = userIds.substring(0,userIds.length-1);
						formDetail.type["Move"].submit(userIds);
				});
				 ie8StylePatch();
				 $("#moveSelectUserModal").modal("show");
			 });
		 }else{
			 $("#moveSelectUserModal").modal("show");
		 }
		
		
	 },
	 submit:function(userIds){
		 $("#confirmType").val("Move");
		 var users = userIds.split(",");
		 var userResult = "";
		 for(var i=0;i<users.length;i++){
			 userResult += "U_"+users[i]+"|";
		 }
		 userResult = userResult.substring(0,userResult.length-1);
		 $("#confirmUser").val(userResult);
		//将流程相关值重新复制的业务表单当中
		 $("form").find("[workFlowType='true']").remove();
		  $("input[workFlowType='true']").each(function(index,item){
			  item = $(item);
			  var eleHtml = "<input type='hidden' id='"+item.attr("id")+"' workFlowType='true' name='"+item.attr("name")+"' value='"+item.val()+"'>"
			  $("form").append(eleHtml);
		  });
		update("Move",formDetail.afterSubmit);
		$(".modal").modal("hide");
	 }
 }
 
 //会签相应方法
 formDetail.type["HuiQian"]={
			show:function(workId){
				//selectControl.singlePerson("",true,'formDetail.type[\'HuiQian\'].submit',null,true);
				var selectPerson = JCTree.init({
					controlId: "HuiQianTreeId-HuiQianTreeName",
					isBackgrounder : true,
					isCheckOrRadio: true,
					callback: function(persons){
						formDetail.type['HuiQian'].submit(persons);
					}
				});
				selectPerson.show();
			 },
			 submit:function(users){
				 var workId = $("#workId").val();
				 var huiqianUser = "";
				 for(var i=0;i<users.length;i++){
					 huiqianUser += "U_"+users[i].id+"|";
				 }
				 if(huiqianUser.length==0){
					 alertx($.i18n.prop("JC_SYS_029","会签人员"));
					 return;
				 }
				 huiqianUser = huiqianUser.substring(0,huiqianUser.length-1);
				 $("#confirmUser").val(huiqianUser);
				 $("#confirmType").val("HuiQian");
					//将流程相关值重新复制的业务表单当中
				 $("form").find("[workFlowType='true']").remove();
					  $("input[workFlowType='true']").each(function(index,item){
						  item = $(item);
						  var eleHtml = "<input type='hidden' id='"+item.attr("id")+"' workFlowType='true' name='"+item.attr("name")+"' value='"+item.val()+"'>"
						  $("form").append(eleHtml);
					  });
					update("HuiQian",formDetail.afterSubmit);
			 }
		 }
 
//加签相应方法(新方法为动态增加节点)
formDetail.type["JiaQian"]={
		 	workId:"",
			show:function(workId){
				formDetail.type["JiaQian"].workId = workId;
				msgBox.confirm({
					content:$.i18n.prop("JC_WORKFLOW_020"),
					success:this.submit
				});
			 },
			 submit:function(){
				 var workId = formDetail.type["JiaQian"].workId;
				 jQuery.ajax({
						url : getRootPath()+"/workFlow/processInstance/closeProcessInstance.action",
						type : 'POST',
						data : {workId : workId},
						success : function(data) {
							window.open(getRootPath()+"/horizon/workflow/webworkflow/HorizonInstance.jsp?workid="+workId+"");
							JCFF.loadPage({url : "/workFlow/processInstance/getTodoList.action"});
							formDetail.afterSubmit();
						},
						error : function() {
							
						}
					});
				 	
			 }
		 }
 
//暂存流程相应方法
 formDetail.type["Save"]={
		 	workId:"",
			show:function(workId){
				//表单验证
				if(typeof validateForm=='function'){
					if(!validateForm("Save")){
						if(typeof validateFormFail=='function'){
							validateFormFail();
						}
						return false;
					}
				}
				formDetail.type["Save"].workId = workId;
				msgBox.confirm({
					content:$.i18n.prop("JC_WORKFLOW_015"),
					success:this.submit
				});
			 },
			 submit:function(){
				 var workID = formDetail.type["Save"].workId;
				 formDetail.submitType = "Save";
				 $("#confirmType").val("Save");
					//将流程相关值重新复制的业务表单当中
				 $("form").find("[workFlowType='true']").remove();
					  $("input[workFlowType='true']").each(function(index,item){
						  item = $(item);
						  var eleHtml = "<input type='hidden' id='"+item.attr("id")+"' workFlowType='true' name='"+item.attr("name")+"' value='"+item.val()+"'>"
						  $("form").append(eleHtml);
					  });
					 var workFlowType = $("#workFlowType").val();
					 if(workFlowType == "1"){
						 if(insert("Save",formDetail.afterSubmit)){
							 $(".modal").modal("hide");
						 }
					 }else if(workFlowType == "2"){
						 if(update("Save",formDetail.afterSubmit)){
							 $(".modal").modal("hide");
						 }
					 }
			 }
		 }
 
//暂停流程相应方法
 formDetail.type["Pause"]={
		 	workId:"",
			show:function(workId){
				formDetail.type["Pause"].workId = workId;
				msgBox.confirm({
					content:$.i18n.prop("JC_WORKFLOW_021"),
					success:this.submit
				});
			 },
			 submit:function(){
				 var workId = formDetail.type["Pause"].workId;
				 $("#confirmType").val("Parse");
					//将流程相关值重新复制的业务表单当中
				 $("form").find("[workFlowType='true']").remove();
					  $("input[workFlowType='true']").each(function(index,item){
						  item = $(item);
						  var eleHtml = "<input type='hidden' id='"+item.attr("id")+"' workFlowType='true' name='"+item.attr("name")+"' value='"+item.val()+"'>"
						  $("form").append(eleHtml);
					  });
					update("Parse",formDetail.afterSubmit);
			 }
		 }
 
//暂停流程相应方法
 formDetail.type["GetBack"]={
		 	workId:"",
			show:function(workId){
				formDetail.type["GetBack"].workId = workId;
				msgBox.confirm({
					content:$.i18n.prop("JC_WORKFLOW_022"),
					success:this.submit
				});
			 },
			 submit:function(){
				 var workId = formDetail.type["GetBack"].workId;
				 $("#confirmType").val("GetBack");
					//将流程相关值重新复制的业务表单当中
				 $("form").find("[workFlowType='true']").remove();
				 $("input[workFlowType='true']").each(function(index,item){
					 item = $(item);
					 var eleHtml = "<input type='hidden' id='"+item.attr("id")+"' workFlowType='true' name='"+item.attr("name")+"' value='"+item.val()+"'>"
					 $("form").append(eleHtml);
				 });
				 update("GetBack",formDetail.afterSubmit);
			 }
		 }
 formDetail.jctreeuser = null;
//暂停流程相应方法
 formDetail.type["DuBan"]={
		 	 refresh:function(){
		 		$("#supervisionModal #supervisionContent").val("");
		 		//selectControl.clearValue("supervisionUser-supervisionUser");
		 		if(!formDetail.jctreeuser && formDetail.jctreeuser!=null){
				formDetail.jctreeuser.clearValue();
		 		}
		 		hideErrorMessage();
		 		if($("#supervisionDiv").find("table").length>0){
		 			var content = $("#supervisionDiv #contentTd").html();
					var userIdStrs =  $("#supervisionDiv #userTd").attr("userId").split(",");
					var userNameStrs =  $("#supervisionDiv #userTd").html().split(",");
					if(content!=null&&content.length>0){
						$("#supervisionModal #supervisionContent").val(formatToValue(content));
					}
					var userData = new Array();
					for(var i=0;i<userIdStrs.length;i++){
						var userItem = {
								id:userIdStrs[i],
								text:userNameStrs[i],
						}
						userData.push(userItem);
					}
					$("#supervisionUser-supervisionUser").select2("data", userData);
		 		}
			 },
			 show:function(workId){
				 var htmlStr = $("#supervisionModalDiv").html();
				 if(htmlStr.length==0){
					 $("#supervisionModalDiv").load(getRootPath()+"/workFlow/form/getSupervisionModal.action",null,function(responseTxt,statusTxt,xhr){
						 if(statusTxt=="success"){
						 //督办对话框
						 $("#supervisionModal").modal({
							 backdrop:true,
							 keyboard:true,
							 show:false
						 });
						 //selectControl.init("supervisionModal #supervisionUserDiv","supervisionUser-supervisionUser", true, true);
					     if(!formDetail.jctreeuser){
							 formDetail.jctreeuser = JCTree.init({
								 container: "supervisionModal #supervisionUserDiv",
								 controlId: "supervisionUser-supervisionUser",
								 isCheckOrRadio: true,
								 isPersonOrOrg: true,
								 title: "用户"
							 });
						 }
						 
						 $("#supervisionModal #saveBtn").click(function(){
							 formDetail.type["DuBan"].submit();
						 });
						 
						//初始化督办校验方法
						$("#supervisionForm").validate({
							ignore: ".ignore",
					        rules: {
					        	supervisionUser:{
					        		required:true
					        	},
					        	supervisionContent: {
					        		specialChar:true,
					        		required:true
							   }
						    }
						});
						ie8StylePatch();
						$("#supervisionModal").modal("show");
						formDetail.type["DuBan"].refresh();
						}
					 });
				 }else{
					 $("#supervisionModal").modal("show");
				 }
				 formDetail.type["DuBan"].refresh();
			 },
			 submit:function(){
				var userStr = returnValue("supervisionUser-supervisionUser");
				if(!$("#supervisionForm").valid()){
					return;
				}
				var users = formatUser(userStr);
				var content = formatToHtml($("#supervisionModal #supervisionContent").val());
				var htmlStr = formDetail.type["DuBan"].getTemplate(users,content);
				$("#supervisionDiv").html(htmlStr);
				$("#supervisionDiv").slideDown(200);
				//注册事件
				$(document).on('click','[data-dismiss="supervision"]',function(){
					$("#supervisionDiv").slideUp(200,function(){
						$("#supervisionDiv").html("");
					});
				})
				
				$("#supervisionModal").modal("hide");
			 },
			 //获得无修改权限的显示html代码
			 getShowTemplate:function(userIds,userNames,content){
				 var resultHtml = '<div class="panel">'+
					 				'<div class="table-wrap form-table">'+
										 '<table class="table table-td-striped oversee">'+
											'<tr>'+
												'<td class="w90">督办</td>'+
												'<td>'+
													'<div class="context">'+
														'<div class="m-sm">'+
															'<i class="fa fa-user"></i>'+
															'<span class="l-h">'+
																'<span id="userTd" userId="'+userIds+'">'+userNames+'</span>'+
																'<div id="contentTd">'+content+'</div>'+
															'</span>'+
														'</div>'+
													'</div>'+	
												'</td>'+
											'</tr>'+
										'</table>'+
									'</div>'+
		  						  '</div>';
				 return resultHtml;
			 },
			 getTemplate:function(users,content){
				 var userNames = "";
				 var userIds = "";
				 for(var i=0;i<users.length;i++){
					 userNames+=users[i].name+",";
					 userIds+=users[i].id+",";
				 }
				 userNames = userNames.substring(0,userNames.length-1);
				 userIds = userIds.substring(0,userIds.length-1);
				 var resultHtml = '<div class="panel" isNew="true">'+
					 				'<div class="table-wrap form-table">'+
										 '<table class="table table-td-striped oversee">'+
											'<tr>'+
												'<td class="w90">督办</td>'+
												'<td>'+
													'<div class="context">'+
														'<button type="button" class="close" data-dismiss="supervision">×</button>'+
														'<div class="m-sm">'+
															'<i class="fa fa-user"></i>'+
															'<span class="l-h">'+
																'<span id="userTd" userId="'+userIds+'">'+userNames+'</span>'+
																'<div id="contentTd">'+content+'</div>'+
															'</span>'+
														'</div>'+
													'</div>'+	
												'</td>'+
											'</tr>'+
										'</table>'+
									'</div>'+
		  						  '</div>';
				 return resultHtml;
			 }
		 }
 
 
//返回犯法
 formDetail.type["goBack"]={
 			show:function(workId){
 				this.submit();
 			 },
 			 submit:function(){
 				 goBack();
 			 }
 		 }
 /**
  * @description 显示路由列表
  */
 formDetail.showRouteModal = function(node){
	 var htmlStr = $("#selectRouteModalDiv").html();
	 if(htmlStr.length==0){
		 $("#selectRouteModalDiv").load(getRootPath()+"/workFlow/form/getSelectRouteModal.action",function(){
			 $("#selectRouteModal").modal({
				 backdrop:true,
				 keyboard:true,
				 show:false
			 });
			 
			 $("#selectRouteModal #saveBtn").click(function(){
				 var flag = false;
				 $("#routeList input[name='choseRoute']").each(function(){ 
			        if($(this).prop("checked")){
			        	flag = true;
			        }
			    })
			    if(!flag){
			    	msgBox.info({
			    		content:$.i18n.prop("JC_WORKFLOW_014"),
			    		type:"fail"
			    	});
			    }else{
			    	formDetail.showUserModal();
			    }
				 
			 });
			 ie8StylePatch();
			 formDetail.fillSelectRouteModa(node);
		 });
	 }else{
		 formDetail.fillSelectRouteModa(node);
	 }
 }
 
 /**
  * @description 填入路由列表
  */
 formDetail.fillSelectRouteModa = function(node){
	 datas = node.routeLinkList;
	 var checkFlag = null;	//单选路径/多选路径标志位
	 if(node.selectFlag == 0){
		 checkFlag="checkbox";
	 }else{
		 checkFlag="radio";
	 }
	 $("#selectRouteModal #routeList>div").html("");
	 for(var i=0;i<datas.length;i++){
		 var item = datas[i];
		 var routeHtml = '<label class="checkbox"><input type="'+checkFlag+'" id="'+item.routeLinkId+'" name="choseRoute" value="'+item.nextNodeId+'"/>'+item.routeLinkName+"->"+item.nextNodeName+'</label>';
		 $("#selectRouteModal #routeList>div").append(routeHtml);
	 }
	 $("#selectRouteModal").modal("show");
 }
 
 
 /**
  * @description 显示退回节点列表
  */
 formDetail.showRejectNodeModal = function(node){
	 var htmlStr = $("#rejectNodeModalDiv").html();
	 if(htmlStr.length==0){
		 $("#rejectNodeModalDiv").load(getRootPath()+"/workFlow/form/getRejectNodeModal.action",function(){
			  $("#rejectNodeModal").modal({
					 backdrop:true,
					 keyboard:true,
					 show:false
			  });
			  
			  //增加保存按钮事件
			 $("#rejectNodeModal #saveBtn").click(function(){
				//取出选中值
				 var str = "";
				 $("#rejectNodeModal input[name='choseNode']:radio").each(function(){ 
			        if($(this).prop("checked")){
			        	str = $(this).val();
			        }
			    })
				 formDetail.type["Reject"].submit(workId,str)
			 });
			 ie8StylePatch();
			 formDetail.fillAndShowRejectNodeModal(node);
		 });
	 }else{
		 formDetail.fillAndShowRejectNodeModal(node);
	 }
 }
 
 /**
  * @description 填入退回选择节点弹出框内容并显示
  */
 formDetail.fillAndShowRejectNodeModal = function(node){
	 $("#rejectNodeModal #routeList>div").html("");
	 for(var i=0;i<node.length;i++){
		 var items = node[i].split("~");
		 var routeHtml = '<label class="radio"><input type="radio" id="'+items[1]+'" name="choseNode" label="'+items[0]+'" value="'+items[1]+'"/>'+items[0]+'</label>';
		 $("#rejectNodeModal #routeList>div").append(routeHtml);
	 }
	 $("#rejectNodeModal").modal("show");
 }
 
 /**
  * @description 显示跳转节点列表
  */
formDetail.showJumpNodeModal = function(node){
	var htmlStr = $("#jumpNodeModalDiv").html();
	 if(htmlStr.length==0){
		 $("#jumpNodeModalDiv").load(getRootPath()+"/workFlow/form/getJumpNodeModal.action",function(){
			 $("#jumpNodeModal").modal({
				 backdrop:true,
				 keyboard:true,
				 show:false
			 });
			 
			 $("#jumpNodeModal #saveBtn").click(function(){
					//取出选中值
					 var str = "";
					 var labelStr = "";
					 $("#jumpNodeModal input[name='choseNode']:radio").each(function(){ 
				        if($(this).prop("checked")){
				        	str = $(this).val();
				        	labelStr = $(this).attr("label");
				        }
				    });
					 if(str.length==0){
						 msgBox.tip({
								content:$.i18n.prop("JC_WORKFLOW_025"),
								type:"fail"
							});
						 return;
					 }
					 formDetail.type["Goto"].showJumpUserModal(workId,str,labelStr)
				 });
			 ie8StylePatch();
			 formDetail.fillAndShowJumpNodeModal(node);
		 });
		
	 }else{
		 formDetail.fillAndShowJumpNodeModal(node);
	 }
 }
 
 /**
  * @description 填入跳转选择节点弹出框内容并显示
  */
 formDetail.fillAndShowJumpNodeModal = function(node){
	 $("#jumpNodeModal #routeList>div").html("");
	 for(var i=0;i<node.length;i++){
		 var items = node[i].split("~");
		 var routeHtml = '<label class="radio"><input type="radio" id="'+items[1]+'" name="choseNode" label="'+items[0]+'" value="'+items[1]+'"/>'+items[0]+'</label>';
		 $("#jumpNodeModal #routeList>div").append(routeHtml);
	 }
	 $("#jumpNodeModal").modal("show");
 }
 
 /**
  * @description 显示人员选择框
  */
 formDetail.showUserModal = function(){
	 var htmlStr = $("#selectUserModalDiv").html();
	 
	 if(htmlStr.length==0){
		 $("#selectUserModalDiv").load(getRootPath()+"/workFlow/form/getSelectUserModal.action",function(){
			 
			 $("#selectUserModal").modal({
				 backdrop:true,
				 keyboard:true,
				 show:false
			 });
			 $("#selectUserModal #saveBtn").click(function(){
				 formDetail.doSubmit("Submit");
			 });
			 ie8StylePatch();
			 formDetail.fillAndShowUserModal();
		 });
		
	 }else{
		 formDetail.fillAndShowUserModal();
	 }
 }
 
 /**
  * @description 填入人员选择框内容并显示
  */
 formDetail.fillAndShowUserModal = function(){
	//清空值
	 $("#selectUserModal #selectUserList").html("");
	 //取出选中值
	 var str = "";
	 var flag = false;
	 $("#routeList input[name='choseRoute']").each(function(){ 
        if($(this).prop("checked")){
        	for(var i=0;i<formDetail.routeData.length;i++){
        		if(formDetail.routeData[i].routeLinkId == $(this).attr("id")){
        			formDetail.insertUserToDiv(formDetail.routeData[i]);
        			if($(this).prop("value").indexOf("End")!=-1){
						formDetail.doSubmit("Submit");
						flag = true;
						$("#selectRouteModal").modal("hide");
						return;
					}
        		}
        	}
        	
        }
    })
    if(flag){
    	return;
    }
     	ie8StylePatch();
	 	$("#selectRouteModal").modal("hide");
	 	$("#selectUserModal").modal("show");
 }
 
 
 formDetail.insertUserToDiv = function(data){
	 
	 var personStr = data.nextAuthorId;
	 var personName = data.nextAuthorName;
	 var tableId = "userTable"+formDetail.tableNum;
	 formDetail.tableNum++;
	 var personHtml = '<span id="userDiv" name="userDiv"></span>';
	 //确定人的情况
	 var isFreeUser = false;
	 var freeData = new Array();
	 if(personStr!=null&&$.trim(personStr).length>0){
		 //暂时把候选人功能屏蔽
		 //data.nextNode.isFreeSelect = false;
		 //如果为候选人的话
		 if(data.nextNode.isFreeSelect==true){
			 isFreeUser = true;
			 var personStrTemp = personStr.replace(/\|/g,",");
			 var personNameStrTemp = personName.replace(/\|/g,",");
			 var persons = personStrTemp.split(",");
			 var personNames = personNameStrTemp.split(",");
			 for(var i=0;i<persons.length;i++){
				 freeData.push({code:persons[i],text:personNames[i]});
			 }
			 if(persons.length <= 1){
				 isFreeUser = false;
				 personHtml = '<span id="userDiv" name="userDiv" user="'+personStr.replace(/\|/g,",")+'">'+personName+'</span>'
			 }
		 }else{
			 personHtml = '<span id="userDiv" name="userDiv" user="'+personStr.replace(/\|/g,",")+'">'+personName+'</span>'
		 }
	 }
	 
	 //下一节点为结束节点时
	 if(data.nextNodeId.indexOf("End")!=-1){
		 personHtml = ""; 
	 }
	 
	 var selectUserHtml = '<table id="'+tableId+'" name="userTable" class="table table-td-striped table-h45 table-bordered b-light table-icon">'+
	 					    	'<tbody><tr>'+
	 					    		'<td style="width:30%;" class=" b-green-dark b-tc">提交至</td>'+
	 					    		'<td><span name="nodeDiv" routeId="'+data.routeLinkId+'" nodeId="'+data.nextNodeId+'">'+data.nextNodeName+'</span></td>'+
	 					    	'</tr><tr>'+
	 					    		'<td class=" b-green-dark b-tc">选择办理人</td>'+
	 					    		'<td><section style=display:inline>'+personHtml+'</section></td>'+
					            '</tr>'+
					         '</tbody>'+
					     '</table>';
	 $("#selectUserModal #selectUserList").append(selectUserHtml);
	 
	 var usersFlag = true;		//多人选择白哦之
	 if(data.nextNode.doType==1){
		 usersFlag = false;
	 }
	 if(isFreeUser == true){
		 /*leftRightSelect.init({
				containerId:tableId+" #userDiv",
				data:freeData,
				moduleId:tableId+"userSelect-userSelect",
				isCheck:usersFlag,
				title:"候选人"
			});*/
		 JCTree.mutual({
			 container:tableId+" #userDiv",
			 data: freeData,
			 controlId:tableId+"userSelect-userSelect",
			 single: !usersFlag,
			 title:"候选人"
		 });
	 }else if(personStr==null||$.trim(personStr).length==0){
		 //selectControl.init(tableId+" #userDiv",tableId+"userSelect-userSelect", usersFlag, true);
		 JCTree.init({
			 container: tableId+" #userDiv",
			 controlId: tableId+"userSelect-userSelect",
			 isCheckOrRadio: usersFlag,
			 isPersonOrOrg: true,
			 title: "用户"
		 });
	 }
 }
 
 /**
  * @description 提交事件
  */
 formDetail.doSubmit=function(type){
	 var nodeResult = '';
	 var userResult = '';
	 try{
			 $("table[name='userTable']").each(function(){
			 var id = $(this).attr("id");
			 if($(this).find("[name=userDiv]").length>0){
				 var userChoseStr = returnValue(id+"userSelect-userSelect");
				 if((userChoseStr==null &&　$(this).find("[name=userDiv]").attr("user")==null) || (userChoseStr==null &&　$(this).find("[name=userDiv]").attr("user").length == 0) ){
					 throw $.i18n.prop("JC_SYS_029","人员");
				 }
				 if(userChoseStr == null){
					 userChoseStr = "";
				 }
				 if(userChoseStr.length > 0){
					 var choseResult = formDetail.convertToUser(userChoseStr);
					 $(this).find("[name=userDiv]").attr("user",choseResult);
				 }
			 }
			 var userResultStr = "";
			 try{
				 var userStr = $(this).find("[name=userDiv]").attr("user").split(",");
				 for(var i=0;i<userStr.length;i++){
					 if(userStr!=null&&userStr.length>0){
						 userResultStr+="U_"+userStr[i]+"|";
					 }
				 }
			 }catch(e){
				 var userStr ="";
			 }
			 userResultStr = userResultStr.substring(0,userResultStr.length-1);
			 nodeResult+=$(this).find("[name=nodeDiv]").attr("routeId")+"~"+$(this).find("[name=nodeDiv]").attr("nodeId")+"&";
			 userResult+=$(this).find("[name=nodeDiv]").attr("routeId")+"="+userResultStr+"&";
			 
		 });
	 }catch(e){
		 msgBox.info({
			 content:e,
			 type:'fail'
		 });
		 return;
	 }
	 if(nodeResult.length>0){
		 nodeResult = nodeResult.substring(0,nodeResult.length-1);
		 userResult = userResult.substring(0,userResult.length-1);
	 }
	 $("#confirmType").val(type);
	 $("#confirmRoute").val(nodeResult);
	 $("#confirmUser").val(userResult);
	 var routeUsers = userResult.split("&");
	 var selectUses = new Array();
	 for(var i = 0 ; i < routeUsers.length ; i ++){
		 if(routeUsers[i].split("=")[1]==null)continue;
		 var users = routeUsers[i].split("=")[1].split("|");
		 for(var x = 0 ; x < users.length ; x++){
			 if(selectUses.indexOf(users[x]) == -1){
				 selectUses.push(users[x]);
			 }else{
				 msgBox.info({
					 content:$.i18n.prop("JC_WORKFLOW_033"),
					type:"fail"
					});
				 return;
			 }
		 }
	 }
	 //将流程相关值重新复制的业务表单当中
	 $("form").find("[workFlowType='true']").remove();
	  $("[workFlowType='true']").each(function(index,item){
		  item = $(item);
		  var eleHtml = "<input type='hidden' workFlowType='true' id='"+item.attr("id")+"' name='"+item.attr("name")+"' value='"+item.val()+"'>"
		  $("form").append(eleHtml);
	  });
	 var workFlowType = $("#workFlowType").val();
	 formDetail.submitType = "Submit";
	 if(workFlowType == "1"){
		 if(insert(type,formDetail.afterSubmit)){
			 $(".modal").modal("hide");
		 }
		 handWritten.saveWebRevision();
	 }else if(workFlowType == "2"){
		 if(update(type,formDetail.afterSubmit)){
			 $(".modal").modal("hide");
		 }
		 handWritten.saveWebRevision();
	 }
 }
 
 //提交成功之后关闭函数
 formDetail.afterSubmit = function(){
	 //menuswrite.statue = false;
	 formDetail.state = false;
	 var entrance = $("#entrance").val();
	 var scanType = $("#scanType").val();
	 //console.log("提交成功之后关闭函数"+entrance+"-----"+scanType);
	 //parent.msgTip.reminders();
	 //从流程中心发起流程实例的情况
	 if(entrance == "workflow"){
		 if(scanType=="create"){
			 JCFF.loadPage({url:'/workFlow/processDefinition/startProcessInsView.action'})
		 }else if(scanType=="todo"){
			 formDetail.gotoListPage("workflow","todo");
		 }else if(scanType=="done"){
			 formDetail.gotoListPage("workflow","done");
		 }
	 }else if(entrance == "business"){
		 if(scanType=="create"){
			 formDetail.gotoMyBusinessPage();
		 }else if(scanType=="todo"){
			 formDetail.gotoListPage("business","todo");
		 }else if(scanType=="done"){
			 formDetail.gotoListPage("business","done");
		 }else if(scanType=="qicao"){
			 if(formDetail.submitType == "Save" || formDetail.submitType == "Submit"){
				 formDetail.gotoDraftPage();
			 }else{
				 formDetail.gotoMyBusinessPage();
			 }
		 }
	 }
 }
 formDetail.gotoDraftPage = function(){
	 var url = $("#myDraftUrl").val() == null ?  $("#myBusinessUrl").val() : $("#myDraftUrl").val();
	 var urlmenu = $("#myDraftUrlMenu").val() == null ? $("#myBusinessUrlMenu").val() : $("#myDraftUrlMenu").val();
	 if(url && url.length > 0){
		 JCFF.loadPage({url :url});
	 }
 }
 
 //跳转到我的业务的页面方法
 formDetail.gotoMyBusinessPage = function(){
	 var url = $("#myBusinessUrl").val();
	 var urlmenu = $("#myBusinessUrlMenu").val();
	 if(url && url.length > 0){
		 JCFF.loadPage({url :url});
	 }
 } 
 
//跳转到我的待办的页面方法
 formDetail.gotoListPage = function(entrance,scanType){
	 var flowId = $("#flowId").val();
	 var url = null;
	 url = $("#todoPage").val();
	 if(scanType == 'done'){
		 url =  $("#donePage").val();
	 }
	 if(url!=null&&url.length>0){
		 url= "/workFlow/form/jumpToList.action?url="+url+"&type="+scanType+"&entrance="+entrance+"&flowId="+flowId;
		 JCFF.loadPage({url : url});
	 }
 } 
 
 $(document).ready(function(){
	 //formDetail.init();
 });
 
 
 //页面离开时调用清空流程缓存方法
 //menuswrite.statue = true;
 window.onunload  = function(){
	 $("#WebOffice").remove();
	 var scanType = $("#scanType").val();
	 if(scanType == "view"){
		 return;
	 }
	 
	 if(formDetail.state){
		 var ajaxData = {
				 time:new Date(),
				 workId:$("#workId").val()
		 }
		 $.ajax({
			 url:getRootPath()+"/workFlow/processInstance/closeProcessInstance.action",
			 data:ajaxData,
			 type:"get",
			 async:false,
			 success:function(){
			 }
		 });
	 }
 }
 
 function pageRedirecting(){
	 if(formDetail.state){
		 var ajaxData = {
				 time:new Date(),
				 workId:$("#workId").val()
		 }
		 $.ajax({
			 url:getRootPath()+"/workFlow/processInstance/closeProcessInstance.action",
			 data:ajaxData,
			 type:"get",
			 async:false,
			 success:function(){
			 }
		 });
	 }
 }
 
 
 /**
  * @descrpition 把人员选择树返回的字符串转换为id的字符串
  */
 formDetail.convertToUser = function(str){
	 var convertResult = "";
	 var userStrs = str.split(",");
	 for(var i=0;i<userStrs.length;i++){
		 var userId = userStrs[i].split(":")[0];
		 convertResult +=userId+",";
	 }
	 if(convertResult.length>0){
		 convertResult = convertResult.substring(0,convertResult.length-1);
	 }
	 return convertResult;
 }
 formDetail.initSuggestJG = function() {

	 var signatureControl = document.getElementById('SignatureControl');
	 signatureControl.ServiceUrl = $('#mServerUrl').val()+getRootPath()+"/workflow/suggestjg/ExecuteRun.action";
	 signatureControl.ShowSignature($('#workId').val());
	 var suggestToHeight = [];
	 $("[workflowSuggest='true']").each(function(){
		 var suggestDiv = $(this);
		 if($(this).find("textarea").length>0){
			 //初始化常用词
			 var textareaId = $(this).find("textarea").attr("id");
			 var containerId = $(this).find("[id^=phrase]").attr("id");
			 phraseComponent.init({
				 containerId:containerId,
				 fillEleId:textareaId
			 });
		 }
		 $(this).find(">div").each(function(index,item){
			 suggestToHeight[suggestToHeight.length]={
				 divId:$(item).attr("id"),
				 signId:$(item).attr("signId")
			 }
		 });
	 });

	 //var signs = document.getElementsByName("iHtmlSignature");
	 var signs = $('Object');
	 for(var i = 0; i < signs.length; i++) {
		 if(signs[i].id != 'iHtmlSignature') {
			 continue;
		 }
		 var vItem = signs[i];
		 var name = vItem.RelativeTagId;
		 ///alert(document.getElementById(name));
		 if(!document.getElementById(name)) {
			 vItem.Visiabled	= "0";
			 continue;
		 }
		 //alert(document.getElementById(name).style.height);
		 vItem.style.position = 'absolute';
		 $(vItem).css('z-index',1000);
		 //$(vItem).css('margin-top','-110px');
		 /*vItem.style.position = 'absolute';*/
		 //setPosition($("#"+vItem.RelativeTagId),vItem);
		 //var node = signs[i].cloneNode(true);
		 //$(signs[i]).remove();
		 //$(signs[i]).css('z-index',0);
		 //$(signs[i]).appendTo("#scrollable")

		 if(document.getElementById("suggestType").value == 1){
			 //手写  手动缩放
			 /* var vItem = signs[i];
			  var difPosition = vItem.ScalingSign("","","0.7");
			  var difWidth = difPosition.substring(0,difPosition.indexOf(";"));
			  var difHeight = difPosition.substring(difPosition.indexOf(";") + 1,difPosition.length);
			  vItem.MovePositionByNoSave(difWidth/2,difHeight/2);
			  var name = vItem.RelativeTagId;
			  var defaultHeight = document.getElementById(name).style.height;
			  if(difHeight < 40) {
			  difHeight = 40;
			  }
			  if(defaultHeight) {
			  defaultHeight = +defaultHeight;
			  if(defaultHeight > difHeight) {
			  difHeight = defaultHeight/2.5;
			  }
			  }
			  document.getElementById(name).style.height = difHeight*2.5;
			  $("#"+name).find("textarea").css("height",difHeight*2.5);*/
			 // var node = signs[i].cloneNode(true);
			 // $(signs[i]).appendTo("#scrollable");
			 /*var signs = document.getElementsByName("iHtmlSignature");
			  for(var i = 0; i < signs.length; i++) {
			  }*/
		 }

		 //signs[i].remove();
		 //bodyPage.appendChild(node);
	 }



	 /*var mLength=document.getElementsByName("iHtmlSignature").length;

	  var vItem;
	  for (var i=mLength-1;i>=0;i--){
	  vItem=document.getElementsByName("iHtmlSignature")[i];
	  var difPosition = vItem.ScalingSign("","","0.5");
	  //  alert(difPosition);
	  var difWidth = difPosition.substring(0,difPosition.indexOf(";"));
	  var difHeight = difPosition.substring(difPosition.indexOf(";") + 1,difPosition.length);
	  vItem.MovePositionByNoSave(difWidth/2,difHeight/2);
	  alert(vItem.SignatureID+"\n"+DocForm.SignatureControl.DocumentID+"\n"+vItem.SignatureName);
	  // vItem.LockDocument(true);
	  }*/

 }
 /**
  *  @description 初始化表单
  *  
  */
 formDetail.initForm = function(){
	 /*var revenue = 12345678;
	 var a = revenue.formatMoney();
	 alert(a);*/
	 var scanType = $("#scanType").val();
	  var opt = {
				editField:$("#editField").val().split(","),
				readField:$("#readField").val().split(","),
				hideField:$("#hideField").val().split(",")
			  };
	  
	  if(scanType!="todo"&&scanType!="create"&&scanType!="qicao"){
		  opt.view="true";
	  }
	  //加载意见域相关出数据
	 /* if("0" == $("#signType").val()) {
			 //点聚
		  formDetail.initSuggest();
	 } else if("1" == $("#signType").val()){
		 //金格
		 formDetail.initSuggestJG();
	 }*/
	 handWritten.initWebRevision();
	  
	  //表单那权限做操作
	  formPriv.doForm(opt);
	  //历史信息
	  formHistory.init();
	  
	  //更新右下角信息
	  if(scanType == "todo"){
		  var workId = $("#workId").val();
		  var noticeType = "协同";
		  parent.msgTip.readByBusiness(workId,noticeType);
	  }
 }
 

 
 //获得流程表单变量
 formDetail.getFlowVariable = function(){
	 var returnValue = new Array();
	 var jqueryForm = "form";
	 	var formObj = $(jqueryForm);
	 	if(formObj.length==0){
	 		alertx("没有找到对应的表单");
	 		return;
	 	}
	 formObj = $(formObj[0]);
	 formObj.find("[flowVariable]").each(function(){
		 var item = $(this);
		 var itemType = item.attr("workFlowForm");
		 var key = item.attr("flowVariable");
		 returnValue.push({ "key": key, "value": flowVariable.type[itemType].get(item)});
	 })
	 return returnValue;
 }

 
 var flowVariable = {};
 flowVariable.type = {};
 flowVariable.type["textinput"] = {
		 get : function(obj){
			 return obj.val();
		 }
 }
 
 flowVariable.type["select"] = {
		 get : function(obj){
			 return obj.find("select option:checked").val();
		 }
 }
 
 flowVariable.type["radio"] = {
		 get : function(obj){
			 return obj.find("radio option:checked").val();
		 }
 }
 
 flowVariable.type["hidden"] = {
		 get : function(obj){
			 return obj.val();
		 }
 }
 
 
 var formHistory = {};
 formHistory.init = function(){
	 formHistory.show();
	 $("#formSheet1").click(function(){
		 postscript.show();
	 });
	 $("#formSheet2").click(function(){
		 postscript.hide();
	 });
	 $("#formSheet3").click(function(){
		 postscript.hide();
	 });
	 $("#formSheet3").click(function(){
		 postscript.show();
	 });
 }
 formHistory.show = function(){
	 if($.trim($("#historyDetail").html())==""){
		 var appendHtml = "";
		 jQuery.ajax({
				url : getRootPath()+"/workFlow/processHistory/getHistoryDetailForAjax.action?time=" + new Date(),
				type : 'POST',
				async:false,
				data :{ "workId":$("#workId").val()},
				success : function(data) {
					$.each(data, function(i, val){
						appendHtml += "<tr class='odd'>";
						appendHtml += "<td nowrap='nowrap'>"+val.nodeName+"</td>";
						appendHtml += "<td nowrap='nowrap'>"+val.userName+"</td>";
						appendHtml += "<td nowrap='nowrap'>"+val.actionTime+"</td>";
						appendHtml += "<td nowrap='nowrap'>"+val.actionName+"</td>";
						appendHtml += "<td><p class='dialog-text input-group'>"+val.actionContent+"</p></td>";
						appendHtml += "<td><p class='dialog-text input-group'>"+val.suggest+"</p></td>";
						appendHtml += "</tr>";
					});
				},
				error : function() {
				}
			});
		 $("#historyDetail").append(appendHtml);
	 }
 }
 
 /**
  * 判断流程附件是否是可编辑，用于控制附件删除按钮
  * 可编辑返回true，不可编辑返回false
  */
 formDetail.initAttachList = function(attachItemName){
	return $("#editField").val().split(",").indexOf(attachItemName)!=-1  && $('#scanType').val()!='view';
 };


 Number.prototype.formatMoney = function (places, symbol, thousand, decimal) {
	 places = !isNaN(places = Math.abs(places)) ? places : 2;
	 symbol = symbol !== undefined ? symbol : "$";
	 thousand = thousand || ",";
	 decimal = decimal || ".";
	 var number = this,
	 negative = number < 0 ? "-" : "",
	 i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
	 j = (j = i.length) > 3 ? j % 3 : 0;
	 return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
 };
 }
 JC = new JC();

 
 /*
 * var revenue = 12345678;
  alert(revenue.formatMoney()); // $12,345,678.00
  alert(revenue.formatMoney(0, "HK$ ")); // HK$ 12,345,678

  // European formatting:
  var price = 4999.99;
  alert(price.formatMoney(2, "€", ".", ",")); // €4.999,99

  // It works for negative values, too:
  alert((-500000).formatMoney(0, "£ ")); // £ -500,000
 * */