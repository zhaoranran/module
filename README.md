## 前端基于gulp构建的express服务器
> 可以解析sass，静态文件(html,sass,css) 免F5 实时刷新浏览器<br>


####安装说明

1. 安装NodeJS
1. 按照教程更换npm淘宝镜像(更换后下载速度快) http://note.youdao.com/noteshare?id=33e91277f64ae0a0e4b201a2ee1d6006
1. 打开命令行  执行` npm install -g gulp` 然后下载项目
1. 下载项目后,进入gulp-server目录,把node_modules.zip解压到当前目录下
1. 执行 `npm run dev` 命令
1. 访问 `localhost:5000`  查看效果

####使用说明
> `npm run dev`			启动服务器,及编译sass,实时刷新浏览器 <br>
> `npm run devie`   	启动服务器,在ie下查看模式，没有实时刷新功能
> `npm run build`       编译发布版本,(输出所有静态文件到public目录下)<br>

####目录结构
> static		`静态文件目录(js,css,html...)`<br>
> views         `视图html文件`<br>
> sass          `sass文件`<br>
> routes        `路由控制文件与后台接口文件`<br>
> gulpfile.js 	`gulp配置文件`<br>
> server.js 	`服务器配置文件`<br>
> config.js 	`全局配置参数`<br>
> package.json 	`nodejs 程序描述`<br>
