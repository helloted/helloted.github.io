---
layout:     post
category:   Linux
title:      "Nginx添加第三方模块"
subtitle:   "已经安装的Nginx添加第三方模块"
date:       2018-05-14 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

以下是在CentOS上适用

#### 1、查看版本和已经安装模块

```
nginx -V
```

可以查看当前版本信息和已经安装的模块

![img](/img/Simple_7/34.png)

#### 2、下载对应版本的的nginx源码

```
cd /opt
```

```
wget http://nginx.org/download/nginx-1.12.1.tar.gz
```

#### 3、下载应的第三方模块

以ngx-fancyindex为例

```
git clone https://github.com/aperezdc/ngx-fancyindex.git ngx-fancyindex
```

#### 4、查看对应的configure

解压nginx源码

```
tar xf nginx-1.12.2.tar.gz
```

```
cd nginx-1.12.2
```

#### 5、添加对应的模块

```
./configure --prefix=/etc/nginx \
            --sbin-path=/usr/sbin/nginx \
            --conf-path=/etc/nginx/nginx.conf \
            ...
```

注意，这里可以copy之前对应的配置

添加命令

```
--add-module=../ngx-fancyindex
```

`../ngx-fancyindex`是模块下载的位置

所以整体的命令应该是

```
./configure --prefix=/etc/nginx \
            --sbin-path=/usr/sbin/nginx \
            --conf-path=/etc/nginx/nginx.conf \
            ...
            --add-module=../ngx-fancyindex
```

#### 6、编译

```shell
make && make install
```

#### 7、备份替换

```shell
cp /usr/sbin/nginx /usr/sbin/nginx.bak #备份
cp /opt/nginx-1.12.1/objs/nginx /usr/sbin/nginx #替换
systemctl restart nginx #重启 nginx 服务
```



