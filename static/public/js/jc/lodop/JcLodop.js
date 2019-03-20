/**
 * 参数说明：option,json对象
 * option = {
 * 		name: '打印名',
 * 		paper:{
 * 			intOrient: '纸张方向 1:纵向 2:横向 3:纵向打印宽度固定，高度按打印内容的高度自适应 ，默认1',
 * 			strPageName： '纸张名字，如A4'
 * 		}, 		
 * 		top: '纸张上下的边距', 如：“100pt”，可选单位有："in(英寸),cm,mm,pt,px,%"等，不传递默认(20mm)
 * 		left: '纸张左右的边距', 如：“100pt”，可选单位有："in(英寸),cm,mm,pt,px,%"等，不传递默认(20mm)
 * 		width: '打印区域宽度', 如：“100pt”，可选单位有："in(英寸),cm,mm,pt,px,%"等，不传递默认(170mm)
 * 		height: '打印区域高度', 如：“100pt”，如：“100cm”，可选单位有："in(英寸),cm,mm,pt,px,%"等，不传递默认(257mm)
 * 		elementId: '要打印内容所属元素id',
 * 		styleId: '页面上<style>标签的id，这里要的标签要和打印的内容样式有关系',
 * 		cssPath: '样式文件的路径',	css的全路径，多个用逗号分隔
 * 		printName: '传递打印机名字'	设置使用的打印机，不传递默认为当前打印机
 * 		printType: '打印类型，目前支持html , text , image , table几种类型，可根据实际情况进行选择，'
 * 				   '例如，如果打印单纯的表格建议使用table，如打印charts表，建议html , 纯文本建议text , 默认html'
 * 		print：'预览或打印 0:直接打印，1：预览 默认0‘
 * }
 * @param option
 */
(function(option){
	var CreatedOKLodop7766 = null, CLodopIsLocal = null;
	//下载必备应用的地址
	var downExe = getRootPath() + "/js/lodop/";
	//初始化参数
	JcLodop = function(config){
		option = config;				
	};	
	
	JcLodop.prototype = {
		print: function(){
			var me = this;
			var LODOP = this.getLodop();
			LODOP.PRINT_INIT(me.checkNull(option.name) ? "" : option.name);
			var printContent = "";
			if(!me.checkNull(option.cssPath)){
				//css文件引用
				if(option.cssPath.indexOf(',') > -1){
					var cssArray = option.cssPath.split(',');
					for(var i = 0 ; i < cssArray.length; i++){
						printContent += "<link rel='stylesheet' type='text/css' href='" + cssArray[i] + "'>";
					}
				}else{
					printContent += "<link rel='stylesheet' type='text/css' href='" + option.cssPath + "'>";
				}
			}
			if(!me.checkNull(option.styleId)){
				//style内样式引用
				printContent += "<style>" + document.getElementById(option.styleId).innerHTML + "</style>";
			}
			if(!me.checkNull(option.elementId)){
				//设置纸张大小
				me.setPageSize(LODOP, option.paper);
				//加载内容
				printContent += $('#' + option.elementId).html();
				var printType = me.checkNull(option.printType) ? "html" : option.printType;
				if(printType == 'html'){
					LODOP.ADD_PRINT_HTM(
							me.setDefault(option.top , '20mm') , me.setDefault(option.left , '20mm') , 
							me.setDefault(option.width , '170mm') , me.setDefault(option.height , '257mm') , 
							printContent);
				}else if(printType == 'table'){
					LODOP.ADD_PRINT_TABLE(
							me.setDefault(option.top , '20mm') , me.setDefault(option.left , '20mm') , 
							me.setDefault(option.width , '170mm') , me.setDefault(option.height , '257mm') , 
							printContent);
				}else if(printType == "text"){
					LODOP.ADD_PRINT_TEXT(
							me.setDefault(option.top , '20mm') , me.setDefault(option.left , '20mm') , 
							me.setDefault(option.width , '170mm') , me.setDefault(option.height , '257mm') , 
							printContent);
				}else if(printType == "image"){
					LODOP.ADD_PRINT_IMAGE(
							me.setDefault(option.top , '20mm') , me.setDefault(option.left , '20mm') , 
							me.setDefault(option.width , '170mm') , me.setDefault(option.height , '257mm') , 
							printContent);
				}				
				LODOP.SET_SHOW_MODE("BKIMG_PRINT",1);	
				if(!me.checkNull(option.printName)){
					LODOP.SET_PRINTER_INDEX(option.printName);
				}
				if(me.checkNull(option.print) || option.print == '0'){
					LODOP.PRINT();
				}else{
					LODOP.PREVIEW();
				}
			}
		},
		
		setPageSize: function(LODOP , paper){
			var me = this;
			if(me.checkNull(paper)){
				return;
			}
			var intOrient = me.checkNull(paper.intOrient) ? "1" : paper.intOrient;
 			var strPageName = me.checkNull(paper.strPageName) ? "" : paper.strPageName;
			if(intOrient != '1' || strPageName != "" || strPageName != "A4"){
				LODOP.SET_PRINT_PAGESIZE(intOrient , 0 , 0 , strPageName);  
			}
		},
		
		//获取打印机列表
		getPrintList: function(){
			var LODOP = this.getLodop();
			var printMachineCount = LODOP.GET_PRINTER_COUNT();
			var machineArray = new Array();
			for(var i = 0 ; i < printMachineCount ; i++){
				var printerName = LODOP.GET_PRINTER_NAME(i + ":PrinterName");	//打印机名称
				var driverName = LODOP.GET_PRINTER_NAME(i + ":DriverName");		//驱动名称
				var portName = LODOP.GET_PRINTER_NAME(i + ":PortName");			//端口号
				machineArray.push({
					"id": i,  "printerName": printerName , 
					"driverName": driverName , "portName": portName
				});
			}
			return machineArray;
		},
		
		//获取强制分页样式标识 haveStyle = "true" 返回值不需要带style
		getPageBreak: function(haveStyle){
			if(this.checkNull(haveStyle)){
				return "style='page-break-before:always'";
			}else if(haveStyle == "true"){
				return "page-break-before:always";
			}else{
				return "style='page-break-before:always'";
			}
		},
		
		//设置默认值
		setDefault: function(value , defaultValue){
			if(this.checkNull(value)){
				value = defaultValue;
			}
			return value;
		},
		
		//验证是否不存在
		checkNull: function(value){
			if(value == undefined || value == null){
				return true;
			}
			if(typeof(value) != 'object'){
				if(value.toLowerCase() == "null" || this.trim(value) == ""){
					return true;
				}				
			}
			return false;
		},
		
		//去掉左右空格
		trim: function(value){
			value = value.replace( /\s*$/, "");
			value = value.replace( /^\s*/, "");
			return value;
		},
		
		//获取打印对象
		getLodop: function(oOBJECT , oEMBED){
			var strHtmInstall = "<br><font color='#FF00FF'>打印控件未安装!点击这里<a href='" + downExe + "install_lodop32.exe' target='_self'>执行安装</a>,安装后请刷新页面或重新进入。</font>";
			var strHtm64_Install = "<br><font color='#FF00FF'>打印控件未安装!点击这里<a href='" + downExe + "install_lodop64.exe' target='_self'>执行安装</a>,安装后请刷新页面或重新进入。</font>";
			var strHtmFireFox = "<br><br><font color='#FF00FF'>（注意：如曾安装过Lodop旧版附件npActiveXPLugin,请在【工具】->【附加组件】->【扩展】中先卸它）</font>";
			var strHtmChrome = "<br><br><font color='#FF00FF'>(如果此前正常，仅因浏览器升级或重安装而出问题，需重新执行以上安装）</font>";
			var strCLodopInstall_1 = "<br><font color='#FF00FF'>Web打印服务CLodop未安装启动，点击这里<a href='" + downExe + "CLodop_Setup_for_Win32NT.exe' target='_self'>下载执行安装</a>";
			var strCLodopInstall_2 = "<br>（若此前已安装过，可<a href='CLodop.protocol:setup' target='_self'>点这里直接再次启动</a>）";
			var strCLodopInstall_3 = "，成功后请刷新本页面。</font>";
			var LODOP = null;
			try {
				var ua = navigator.userAgent;
				var isIE = !!(ua.match(/MSIE/i)) || !!(ua.match(/Trident/i));
				var is64IE = isIE && !!(ua.match(/x64/i));
				if (this.needCLodop()) {
					try {
		            	LODOP = getCLodop();
					} catch (err) {}
					if (!LODOP && document.readyState !== "complete") {
						alert("网页还没下载完毕，请稍等一下再操作.");
						return;
					}
					if (!LODOP) {
						document.body.innerHTML = strCLodopInstall_1 + (CLodopIsLocal ? strCLodopInstall_2 : "") + strCLodopInstall_3 + document.body.innerHTML;
						return;
					} else {
						if (oEMBED && oEMBED.parentNode)
							oEMBED.parentNode.removeChild(oEMBED);
						if (oOBJECT && oOBJECT.parentNode)
							oOBJECT.parentNode.removeChild(oOBJECT);
					}
				} else {
					if (oOBJECT || oEMBED) {
						if (isIE) LODOP = oOBJECT; else LODOP = oEMBED;
					} else if (!CreatedOKLodop7766) {
						LODOP = document.createElement("object");
						LODOP.setAttribute("width", 0);
						LODOP.setAttribute("height", 0);
						LODOP.setAttribute("style", "position:absolute;left:0px;top:-100px;width:0px;height:0px;");
						if (isIE)
							LODOP.setAttribute("classid", "clsid:2105C259-1E0C-4534-8141-A753534CB4CA");
						else
							LODOP.setAttribute("type", "application/x-print-lodop");
						document.documentElement.appendChild(LODOP);
						CreatedOKLodop7766 = LODOP;
					} else {
						LODOP = CreatedOKLodop7766;
					}
					
					if ((!LODOP) || (!LODOP.VERSION)) {
						if (ua.indexOf('Chrome') >= 0)
							document.body.innerHTML = strHtmChrome + document.body.innerHTML;
						if (ua.indexOf('Firefox') >= 0)
							document.body.innerHTML = strHtmFireFox + document.body.innerHTML;
						document.body.innerHTML = (is64IE ? strHtm64_Install : strHtmInstall) + document.body.innerHTML;
						return LODOP;
					}
				}
				return LODOP;
		    } catch (err) {
		        alert("getLodop出错:" + err);
		    }
		},
		
		//判断是否需要安装CLodop云打印服务器
		needCLodop: function(){
			try {
				var ua = navigator.userAgent;
		        if (ua.match(/Windows\sPhone/i))
		            return true;
		        if (ua.match(/iPhone|iPod/i))
		            return true;
		        if (ua.match(/Android/i))
		            return true;
		        if (ua.match(/Edge\D?\d+/i))
		            return true;

		        var verTrident = ua.match(/Trident\D?\d+/i);
		        var verIE = ua.match(/MSIE\D?\d+/i);
		        var verOPR = ua.match(/OPR\D?\d+/i);
		        var verFF = ua.match(/Firefox\D?\d+/i);
		        var x64 = ua.match(/x64/i);
		        if ((!verTrident) && (!verIE) && (x64))
		            return true;
		        else if (verFF) {
		            verFF = verFF[0].match(/\d+/);
		            if ((verFF[0] >= 41) || (x64))
		                return true;
		        } else if (verOPR) {
		            verOPR = verOPR[0].match(/\d+/);
		            if (verOPR[0] >= 32)
		                return true;
		        } else if ((!verTrident) && (!verIE)) {
		            var verChrome = ua.match(/Chrome\D?\d+/i);
		            if (verChrome) {
		                verChrome = verChrome[0].match(/\d+/);
		                if (verChrome[0] >= 41)
		                    return true;
		            }
		        }
		        return false;
		    } catch (err) {
		        return true;
		    }
		}
	};		
})();

if (new JcLodop().needCLodop()) {
    var src1 = "http://192.168.180.25:8000/CLodopfuncs.js?priority=1";
    var src2 = "http://192.168.180.25:18000/CLodopfuncs.js?priority=0";

    var head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
    var oscript = document.createElement("script");
    oscript.src = src1;
    head.insertBefore(oscript, head.firstChild);
    oscript = document.createElement("script");
    oscript.src = src2;
    head.insertBefore(oscript, head.firstChild);
    CLodopIsLocal = !!((src1 + src2).match(/\/\/localho|\/\/127.0.0./i));
}