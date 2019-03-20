
if(!window.JC){
    var JC = {};
}

var Echarts = Clazz.extend({
    //类名称, 方便调试查看
	clazzName : 'Echarts',
	//构造器, new 执行
	construct: function(options){
		this.option = this._getOption(options);
    },
    _getOption: function(){
        this.uuid = this._guid();
        return $.extend({

        })
    },
    //生成动态id
	_guid:function(){
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
			v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		}).toUpperCase();
	},
});

var MyEcharts = Echarts.extend({
    clazzName : 'MyEcharts',
    construct : function(options) {
        arguments.callee.$.construct.apply(this, arguments);
        var _this = this;
        _this.options = $.extend(_this.options,{

        },options)
    },
    EchartsDataFormate : {
        /**
         * 
         */
        NoGroupFormate : function (data){
            //category 的数据存储
            var categorys = [];
            //data 的数据存储
            var datas = [];
            //遍历
            for(var i=0;i<data.length;i++){
                categorys.push(data[i].name || "");
                //定义一个中间变量
                var temp_data = {value:data[i].value || 0 , name : data[i].name || ""};
                datas.push(temp_data);
            }
            return {categorys:categorys,data:datas};
        },
    },
    //生成图形option
    EchartsOption : {
        /**
         * 饼图
         * @param title ： 标题<br>
         * @param subtext ：副标题<br>
         * @param data : json 数据
         * 
         */
        pie : function (title,subtext,data){

            //数据格式
            var datas = MyEcharts.EchartsDataFormate.NoGroupFormate(data);
            option = {
                //标题
                title :{
                    text : title || "",	//标题
                    subtext : subtext || "", //副标题
                    x : 'center',	//位置默认居中
                },
                //提示
                tooltip: {
                    show: true,
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                //组建
                legend : {
                    orient: 'horizontal', //垂直：vertical； 水平 horizontal
                   // top: 'center',	//位置默认左
                    bottom:'5%',
                    data:datas.categorys
                },
                series: [
                    {
                        name : title || "",
                        type : 'pie',	//类型
                        radius : '48%', //圆的大小
                        center : ['50%', '50%'],//位置居中
                        data : datas.data,
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        },
                        //引导线
                        labelLine :{
                            normal :{
                                show: true,
                                length:2,
                            }
                        }
                    }
                ]
            };
            return option;
        },
        
    },
    /**
         * 
         * @param option : option
         * @param echartId : 图表的id 需要加引号
         */
        initChart : function (option,echartId){
            var container = eval("document.getElementById('" + echartId + "')");
            var myChart = echarts.init(container);
            myChart.setOption(option,true);	// 为echarts对象加载数据 
            return myChart;
        }
});

JC.Echarts = {};
JC.Echarts.MyEcharts = MyEcharts;