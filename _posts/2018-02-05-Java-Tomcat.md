---
layout:     post
category:   Java
title:      "Tomcat+Servlet"
subtitle:   "用Tomcat+Servlet搭建一个网页服务器"
date:       2018-02-05 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

### 一、安装Tomcat

*Tomcat*是应用(java)服务器,它只是一个servlet容器.

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

### 二、新建网页服务器

使用intellij idea这个IDE来搭建

1、新建项目，选择`Java Enterprise`和`Web Application`然后next

![img](/img/Simple_4/15.png)

2、输入项目名称已经存放目录

![img](/img/Simple_4/16.png)

3、完成进入项目

![img](/img/Simple_4/17.png)

其中index.jsp是默认的首页网页，此时点击右上角的Tomcat开启服务器，会自动打开一个网页

![img](/img/Simple_4/18.png)

看看网页源代码

```html
<html>
  <head>
    <title>$Title$</title>
  </head>
  <body>
  $END$
  </body>
</html>
```

其实就是index.jsp的代码，说明此时访问的是index.jsp的页面。下面我们来新建新的页面

4、添加web.xml.

File->Project Structure

![img](/img/Simple_4/19.png)

在项目中会有一个新的文件夹，里面就有web.xml文件

![img](/img/Simple_4/20.png)

5、新建一个Servlet

![img](/img/Simple_4/21.png)

命名为first

![img](/img/Simple_4/22.png)

此时web.xml会自动配置

![img](/img/Simple_4/23.png)

6、编写Servlet

在fisrt.java的doGet里添加代码如下

```java
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("This is First Page");
    }
```

7、配置访问路径

在web.xml里添加以下代码

```
    <servlet-mapping>
        <servlet-name>first</servlet-name>
        <url-pattern>/first</url-pattern>
    </servlet-mapping>
```

![img](/img/Simple_4/24.png)

8、点击右上角的tomcat运行，访问`http://localhost:8080/first`可以看到第一个网页

![img](/img/Simple_4/25.png)



