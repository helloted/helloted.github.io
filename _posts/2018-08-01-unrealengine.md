---
layout:     post
category:   工具
title:      "虚幻引擎搭建配置环境"
subtitle:   "不通过苹果appstore来分发测试app"
date:       2018-06-21 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

#### 一、下载安装运行Epic Game Launcher

1、虚幻引擎的中文文档：[文档地址](http://api.unrealengine.com/CHN/index.html)

2、注册并且下载[**Epic Game Launcher**](https://www.unrealengine.com/zh-CN/download)

3、安装后登陆到主界面

![img](/img/Simple_8/16.png)

其中

**ENGINE VERSIONS**是引擎版本，点击+进行安装，会默认安装最新版本，

注意，

- 最新版本当前系统不一定能够跑起来，比如最新版本是4.20.0，我在masOS 10.13.4上就不能跑起来，我安装的是4.19.2。
- 引擎版本号要与后面下载的源码版本一一对应

**MY PROJECTS**就是你的项目了

#### 二、下载源码

1、前往[关联账户网站](https://www.unrealengine.com/account/connected)将github账户关联到UE4的账户中，这样才能下载源码

![img](/img/Simple_8/16.png)

2、前往[UnrealEngine Github库](https://github.com/EpicGames/UnrealEngine/releases)下载源码，注意要选择与引擎版本号一致的源码

![img](/img/Simple_8/18.png)

3、解压后按照步骤运行命令来初始化代码

![img](/img/Simple_8/19.png)

4、打开**UE4.xcworkspace**，target先选择**ShaderCompileWorker**进行**build**，成功之后再将target切换成UE4，再次**build**，这次会花费大概半个小时。

#### 三、UnReal Editor

项目要通过UnReal Editor来新建，打开UnReal Editor有两种方式

- UE4-->Run
- 通过Epic Game Launcher启动，这种方式会比较快

![img](/img/Simple_8/20.png)





