#安装
	1、安装VS2010

	2、安装Python2.7.3

	3、安装node v0.8.9(源码安装或通过msi安装包直接安装)
	node和npm安装方法可参考http://www.infoq.com/cn/articles/nodejs-npm-install-config

	4、安装npm
	
	5、安装mysql server 5.6
	
	6、运行./npm-install.bat以安装第三方依赖(需要连接到internet)
	
#配置
	1、修改./config/schema/CreateTable.bat中mysql的安装路径、数据库服务器IP、端口、用户名和密码，并运行之以创建serverManager所需要的数据库和表。
	2、配置./config/mysql.json中的数据库IP地址、端口、数据库、用户名和密码。
	
#运行
	./server.bat