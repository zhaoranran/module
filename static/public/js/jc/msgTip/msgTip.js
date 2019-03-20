 /**
 *	右下角弹出框相关js
 **/
 if(!window.JC){
	 var JC = {};
 }
 /**
  * 定义系统待办消息信息模版类
  */
 JC.MessageTooltip = Clazz.extend({
	 //构造器
	 construct: function(option){
		 this.opt = $.extend({} ,option);
		 this.$dom = $(this._getTemplate(this.opt));
		 this.resetHeight();
	 },
	 //重置高度, head+foot等于76  每条信息41
	 resetHeight: function(){
		 this.height = 76 + this.opt.messages.length * 41;
	 },
	 //重置内容
	 resetList: function(){
		 var $ul = this.$dom.find('ul.messageList');
		 $ul.empty();
		 $ul.append(this._getMessage(this.opt.messages));
	 },
	 //获取模版外层
	 _getTemplate: function(opt){
		 var temp = [];
		 temp.push('<div class="messageTip messageTip-1" style="z-index: 800;">');
		 temp.push('<div class="messageHeader clearfix">');
		 temp.push('<h4 class="fl"><i class="fa fa-chat m-r-xs"></i>消息提醒</h4>');
		 temp.push('<button type="button" class="close m-t-sm m-r-sm attence-close" id="'+opt.uuid+'">×</button>');
		 temp.push('</div>');
		 temp.push('<ul class="messageList">'+this._getMessage(this.opt.messages)+'</ul>');
		 temp.push(' <div class="message-btm"><a href="javascript:void(0)" onClick="JC.LoadPage({ url : \'/api/noticeMsg/manage.action\'})" class="fr m-r"><i class="fa fa-caret-right m-r-xs"></i>更多</a></div>');
		 temp.push('</div>');
		 return temp.join('');
	 },
	 //获取待办内容
	 _getMessage: function(messages){
		 var temp = [];
		 for(var i = 0;i < messages.length;i++){
			 var item = messages[i];
			 var titleStr = '['+item.noticeType+']' + item.title;
			 if(titleStr.length > 14){
				 titleStr = titleStr.substring(0,14)+"……";
			 }
			 var title = item.title.replace(/"/g, '&quot;');
			 temp.push('<li id="'+ (this.opt.uuid + item.id)+'">');
			 temp.push('<div class="fl listWrap">');
			 temp.push('<a href="javascript:void(0)" onclick="msgTip.clickFun(\''+item.id+'\',\''+item.url+'\')" title="'+title+'">'+titleStr+'</a>');
			 temp.push('</div>');
			 temp.push('<span>'+item.createDate+'<a class="accordion-toggle m-t-xs" onclick="msgTip.clickIgnore(\''+item.id+'\')">忽略</a></span>');
			 temp.push('<div class="clearfix"></div>');
			 temp.push('</li>');
		 }
		 return temp.join('');
	 }
 });

var msgTip = {};
/**
 * 初始化函数
 * 60000
 */
msgTip.init = function(){
	msgTip.refresh();
	//window.setInterval('msgTip.refresh()',60000);
}
/**
 * 刷新函数
 */
msgTip.refresh = function(){
	msgTip.loadData();
	//更新待办数量
	msgTip.reminders();
}
/**
 * 更新待办数量
 */
msgTip.reminders = function(){
	$.ajax({
		type : "POST",
		dataType:'json',
		url:getRootPath()+"/api/reminders/getRemindCount.action",
		success:function(data){
			$.each(data, function(i, element){
				var entitydata =data[i];
				if(entitydata.num!="0"){
					$('#'+entitydata.divid+'b').show();
				    $('#'+entitydata.divid).html(entitydata.num);
				}else{
					$('#'+entitydata.divid+'b').hide();
				}
			});		
		}
	});
}
/**
 * 加载数据
 */
msgTip.loadData = function(){
	$.ajax({
		url:getRootPath()+"/api/noticeMsg/queryMsgTip.action",
		method:"GET",
		async:false,
		data:{time:new Date()},
		success:function(data){
			if(data.length > 0){
				var instance = JC.publish.getMessageTooltipInstance();
				if(instance === void 0){
					JC.publish.show('MessageTooltip' ,{
						messages : data
					});
				}else{
					//把最新数据赋值给实例对象的参数
					instance.opt.messages = data;
					//重置高度
					instance.resetHeight();
					//重置列表内容
					instance.resetList();
					//重置所有已弹出信息的高度,包括考勤,待办,遮罩...
					JC.publish.refresh();
				}
			}
		}
	});
}
/**
 * 获得模板
 */
msgTip.clickFun = function(id ,url){
	var flag = true;
	$.ajax({
		url:getRootPath()+"/api/noticeMsg/valiReadById.action",
		data:{id:id},
		async:false,
		type:"post",
		success:function(data, textStatus){
			if(data == "false"){
				msgBox.tip({
					content:"该数据已处理",
					type:"fail"
				});
				msgTip.publish(id);
				flag = false;
			}
		},error:function(){
			msgBox.tip({
				content:"原始数据出错",
				type:"fail"
			});
		}
	});
	
	if(!flag){
		return;
	}
	
	$.ajax({
		url:getRootPath()+url+"&readOnly=true",
		data:{time:new Date()},
		type:"get",
		success:function(data, textStatus){
			if(textStatus!="success"){
				msgBox.tip({
					content:"原始数据出错",
					type:"fail"
				});
			}
			//设置返回流程返回页面为空
			//historyUrl.length=0;
			//加载页面
			JC.LoadPage({
				url : url
			});
			//loadrightmenu(,'',typeUrl);
			//设置已读
			var getData = {
					ids:id,
					time:new Date()
			}
			$.get(getRootPath()+"/api/noticeMsg/readNoticeByIds.action",getData,function(){
				msgTip.publish(id);
				msgTip.reminders();
			});
		},error:function(){
			msgBox.tip({
				content:"原始数据出错",
				type:"fail"
			});
		}
	});
}

msgTip.clickIgnore = function(id){
	//设置已读
	var getData = {
			ids:id,
			time:new Date()
	}
	$.get(getRootPath()+"/api/noticeMsg/readNoticeByIds.action",getData,function(){
		msgTip.publish(id);
	});
}
//从新发布弹出信息
msgTip.publish = function(id){
	var instance = JC.publish.getMessageTooltipInstance();
		if(!instance){
		//判断如果当前页面没有弹出消息提示则不去处理
		return false;
	}
	var datas = instance.opt.messages, falg = false;
	for(var i = 0;i < datas.length;i++){
		 var item = datas[i];
		 if(id == item.id){
			 falg = true;
			 instance.opt.messages.splice(i ,1);
			 if(instance.opt.messages.length){
				 instance.resetHeight();
				 $('#' + (instance.opt.uuid + id)).remove();
			 }else{
				 JC.publish.hide(instance.opt.uuid);
			 }
			 break;
		 }
	}
	if(falg){
		JC.publish.refresh();
    }
}

 //同步置已读状态 业务调用
msgTip.readByBusiness = function(businessId,noticeType){
	 var data = {
		 businessIds:businessId,
		 noticeType:noticeType
	 }
	 $.get(getRootPath()+"/api/noticeMsg/readNoticeByBusiness.action",data,function(data){
		 if(data.ids == null || data.ids.length == 0){
			 return;
		 }
		 var ids = data.ids.split(",");
		 for(var i =0;i<ids.length;i++){
			 if(ids[i]){
				 msgTip.publish(ids[i]);
			 }
		 }
	 });
}

JC.Distribute = Clazz.extend({
    construct: function(ele){
        this.queues = [];   //装载所有显示的队列
        this.num = 0;       //显示的数量
        this.maskId = 'mask' + this.guid();
        this.$container = $(ele || 'body');
        this.addEvent();
    },
    show: function(messageType ,option){
        var _this = this,uuid = _this.guid();
        var opt = $.extend({
            uuid: uuid,
            fnShow: null,
            fnHide: null
        } ,option);
        //实例化信息类型
        var instance = new JC[messageType](opt);

        //计算当前信息显示的高度
        _this.num = _this.num + instance.height;
        //获取信息的jQuery对象模版
        var $temp = instance.$dom;
        //将已发布的信息添加到队列中
        _this.queues[uuid] = instance;
        //把提示信息的模版填充到页面中
        _this.$container.append($temp);
        //播放提示音
        if(window.playVoice){
            playVoice('voiceDiv');
        }
        //动画显示
        $temp.animate({bottom: ((_this.num - instance.height) + 'px') } ,500 ,function(){
            if(typeof instance.opt.fnShow === 'function'){
                instance.opt.fnShow.call(instance, this);
            }
            //判断弹出 iframe遮罩,解决在weboffice下遮挡问题
            if(JC.browser.ie){
                _this.mask(_this.num);
            }
        });
        //判断是否有定时清空任务
        if(instance.opt.timeOut){
            setTimeout(function(){
                _this.hide(uuid);
            } ,instance.opt.timeOut);
        }
    },
    hide: function(id){
        var _this = this;
        if(_this.queues[id]){
            var instance = this.queues[id];
            var $dom = instance.$dom;
            //现在关闭是用 向下动画还是直接remove
            $dom.fadeOut('slow' ,function(){
                if(typeof instance.opt.fnHide === 'function'){
                    instance.opt.fnHide.call(instance, $dom);
                }
                //删除当前弹出信息
                $dom.remove();
                //从对象删除当前弹出信息的对象
                delete _this.queues[id];
                //处理只剩下最后一个弹出信息时,关闭遮挡页面问题
                if(_this.queues.length == 0){
                    _this.num = 0;
                    _this.removeMask();
                    return false;
                }
                //刷新
                _this.refresh();
            });
        }
    },
    guid: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
    },
    refresh: function(){
        var _this = this;
        _this.num = 0;
        for(var key in _this.queues){
            if(_this.queues.hasOwnProperty(key)){
                var instance = _this.queues[key];
                _this.num = _this.num + instance.height;
                var $dom = instance.$dom;
                $dom.css('bottom' , (_this.num - instance.height)+'px');
                _this.mask(_this.num);
            }
        }
    },
    getInstance: function(key){
        return this.queues[key];
    },
    getMessageTooltipInstance: function(){
        var _this = this;
        for(var key in _this.queues){
            if(_this.queues.hasOwnProperty(key)){
                var instance = _this.queues[key];
                if(Object.prototype.toString.call(instance.opt.messages) === '[object Array]'){
                    return instance;
                    break;
                }
            }
        }
    },
    addEvent: function(){
        var _this = this;
        _this.$container.on('click' , '.attence-close' ,function(e){
            var $this = $(e.target);
            if(!$this.is('a') && !$this.is('button')){
                $this = $this.parent();
            }
            _this.hide($this.attr('id'));
            e.preventDefault();
        });
    },
    mask: function(height){
        if(this.$mask && this.$mask.length){
            this.$mask.css('height' ,(height || 0) + 'px');
            return false;
        }
        var mask = document.createElement("iframe");
        mask.id = this.maskId;
        mask.style.backgroundColor= "transparent";
        mask.style.cssText = 'position: absolute; bottom: 0px; right: 0px; width: 380px; height: '+(height || 0)+'px;filter:alpha(opacity=0);z-index:700;';
        mask.setAttribute('frameborder', '0', 0);
        mask.src = "javascript:'';";
        document.body.appendChild(mask);
        this.$mask = $('#' +this.maskId);
    },
    removeMask: function(){
        if(this.$mask && this.$mask.length){
            this.$mask.remove();
        }
    }
});



$(document).ready(function(){
    JC.publish = new JC.Distribute('#loginAutoAttence');
    
});

//右下角提醒方式  modify by liuxl
$(document).ready(function(){
	msgTip.init();
})