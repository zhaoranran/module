$(document).ready(function(){
	worklogCalendar = {};
	/**日志日历形式查询*/
	worklogCalendar.searchFullCalendar = function(){
		var searchtime=$('#searchtime').val();
		if(searchtime==null||searchtime=='')return false;
		var searchdate = new Date( Date.parse(searchtime.replace(/-/g,"/")));
		$('#calendar').fullCalendar( 'gotoDate', searchdate );
		$('#calendar').fullCalendar( 'select', searchdate, searchdate, true);
	};
	worklogCalendar.initFullcalendar = function(){
		$('#calendar').fullCalendar({
			/********普通属性******/
	    	header: {
	            left: 'prev',
	            center: 'title',
	            right: 'next'
	        },
			selectable: true,
			selectHelper: true,
			firstDay:0,//开始的第一天
			weekends:true,//是否显示周末
			defaultView:'month',//默认显示的视图
			weekMode:'fixed',
			titleFormat:{
			    week:"yyyy 年 MMM d日' &#8212;'{ d日}", // Sep 13 2009
			},
			unselectAuto:false,//是否自动取消选中框
			weekends:true,//布尔类型, 默认为true, 标识是否显示周六和周日的列.
	        allDayDefault:false, 
	        allDayText:'全日',  
	        //axisFormat:'HH(:mm)tt',
	        
			/********日程编辑属性******/
			editable:false, //Boolean类型, 默认值false, 用来设置日历中的日程是否可以编辑.  可编辑是指可以移动, 改变大小等.	
			disableDragging : false, // Boolean类型, 默认false,为false时所有的event可以拖动, 必须editable =	true
			diableResizing : true, // Boolean, 默认false, 所有的event可以改变大小,必须editable = true
			/*timeFormat:{//设置标题头时间格式
	    		month:'H:mm{-H:mm} ',
	           	agendaWeek:'H:mm{ - H:mm}',
	           	agendaDay:'H:mm{ - H:mm}'
	    	},*/
			eventClick:function( calEvent, jsEvent, view ) { //事件被点击
				$("#currentDate").val(calEvent.start);
				worklogCalendar.showDetail(calEvent.id);
			},
			isDefaultStyle:"1",
	     	buttonText: {
	    		buttonContent:'<label class="btn m-r-xs" id="monthview"><input type="radio" name="options" id="option1">月</label> <label class="btn m-r-xs" id="weekview"><input type="radio" name="options" id="option2">周</label> <label class="btn m-r-xs" id="dayview"><input type="radio" name="options" id="option3">日</label> <label class="btn m-r-xs active" id="today"><input type="radio" name="options" id="option4">今日</label>',
	    	}
		});
	}; 

	//初始化日历组件
	worklogCalendar.initFullcalendar();
	//绑定日视图
	$('#dayview').on('click', function() {
		$('#calendar').fullCalendar('changeView', 'agendaDay');
	});
	//绑定周视图
    $('#weekview').on('click', function() {
    	$('#calendar').fullCalendar('changeView', 'basicWeek');
    	worklogCalendar.searchFullCalendar();
    });
    //绑定月视图
    $('#monthview').on('click', function() {
    	$('#calendar').fullCalendar('changeView', 'month');
    	worklogCalendar.searchFullCalendar();
    });
    //绑定今日
    $('#today').on('click', function() {
    	$('#calendar').fullCalendar('today');
    });
})