---
layout:     post
category:   Flutter
title:      图文解析如何上架和访问一个新的后台服务
subtitle:   "外接纹理显示图片1：原理篇"
date:       2022-06-11 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

#### 

上架一个后台服务，包含两个部分，分别是构建服务和访问服务。

1. 构建服务：通过蓝盾将镜像推送到指定的容器平台
2. 负载均衡：通过域名或者北极星指向访问

### 一、新建服务

蓝盾的整体流程如下：

1. 配置参数
2. 从Git拉取代码，代码分析
3. 从七彩石拉取配置，根据项目中的模板文件生成对应配置
4. Go build构建go程序
5. 构建docker镜像
6. 将镜像更新到k8s

![1](1.png)

#### 1.1 配置参数

![2](2.png)

#### 1.2 拉取Git代码

从Git拉取代码，并对代码规范进行检测，不符合需求将中止流程

#### 1.3 七彩石拉取配置

##### 1.3.1蓝盾插件的配置

![3](3.png)

有APPID和配置分组名需要填充，在七彩石网站对应项目可以获取。

##### 1.3.2 七彩石配置

七彩石配置：http://rainbow.woa.com/console

![3](4.png)

新增配置(可以从其他组复制)后，进行发布，蓝盾插件即可拉取对应的配置并填充到模板文件生成项目该环境的配置

#### 1.4 go build构建程序

配置填充完毕后，通过脚本构建go程序

#### 1.5 构建docker镜像

根据Dockerfile文件构建对应的镜像

#### 1.6 镜像推送到stke平台

##### 1.6.1 蓝盾插件

![5](5.png)

工作负载：StatefulSetPlus/StatefulSet/Deployment

workload名称：

<img src="8.png" alt="8" style="zoom:50%;" />

所属集群：新建工作负载时得到的值

命名空间：新建工作负载时得到的值

![6](6.png)

项目ID![6](7.png)

容器名称：与工作负载里面的容器名称对应

容器镜像：字段是在构建Docker镜像的插件输出

##### 1.6.2 sket平台的配置

tkex平台：https://kubernetes.woa.com/v4/projects

可以通过新建或者复制现有配置

![复制资源](9.png)

应用容器配置

![应用](10.png)

智研日志转发容器配置

![11](11.png)

### 二、负载均衡

#### 2.1通过北极星访问

workload详情-负载均衡-编辑

![11](12.png)

北极星配置：https://polaris.woa.com/#/services/list?isAccurate=1

![13](13.png)

#### 2.2 通过域名

域名-TGW-APISIX

##### 2.2.1域名

申请域名：http://gslb.oa.com/request/add_domain/inner

![14](14.png)

TGW同步：先配置TGW和APISIX后再同步

![15](15.png)![16](16.png)

##### 2.2.2TGW

TGW配置：http://new.tgw.oa.com/#/tgwoperation/stgwrule

![17](17.png)

![18](18.png)

##### 2.2.3 APISIX

apisix配置：https://test-apisix.svip.woa.com/ 

先配置北极星上游服务

![19](19.png)

配置路由

![20](20.png)

![21](21.png)

![22](22.png)

![23](23.png)

或者直接编辑配置

![24](24.png)

##### 2.2.4 流程

整个流程应该是：

1. 申请域名
2. 配置TGW
3. 配置APISIX-上游
4. 配置APISIX-路由
5. 域名同步TGW配置
