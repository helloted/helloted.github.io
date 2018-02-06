---
layout:     post
category:   Java
title:      "Tomcat+Servlet"
subtitle:   "用Tomcat+Servlet搭建一个网页服务器"
date:       2018-02-06 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

### 一、安装Tomcat

1、先去Tomcat官网下载[官网](https://tomcat.apache.org/)

![img](/img/Simple_4/12.png)

2、将Zip文件解压并且重命名文件夹到一个目录，比如`/Library/Tomcat/`

3、使用命令行修改文件夹的权限

```sh
sudo chmod 755 /Library/Tomcat/bin/*.sh
```

4、cd到`/Library/Tomcat/bin`文件夹下，启动Tomcat

```sh
sudo sh startup.sh
```

![img](/img/Simple_4/14.png)

5、打开浏览器,输入<http://localhost:8080/>，出现下面的页面说明启动成功

![img](/img/Simple_4/13.png)

6、关闭命令是

```sh
sudo sh shutdown.sh
```

