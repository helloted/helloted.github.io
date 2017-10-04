---
layout:     post
title:      "AFNetworking源码分析(一)"
subtitle:   "AFNetworking整体架构分析"
date:       2017-05-26 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 0、前言

AFNetworking这个框架是iOS必备的一个第三方框架，其高效简洁的API使其成为最好的iOS网络请求框架，也让iOS开发的网络请求轻松许多，[AFNetworking-Github](https://github.com/AFNetworking/AFNetworking)

本文分析基于版本是3.1.0

```
pod 'AFNetworking', '~> 3.1.0'
```

因为iOS9开始NSURLConnection这个类已经被废弃，所以框架的主要类也由`AFHTTPRequestOperationManager`变为`AFHTTPSessionManager`

### 一、架构分析

![img](/img/AFNetworking/01.png)

从图中就可以看出，整体分为以下几个部分

- NSURLSession：网络请求的主要类，`AFURLSessionManager`封装的是`NSURLSession`,而`AFHTTPSessionManager`是其子类，用于HTTP请求做了一些优化
- Reachability：网络状况，`AFNetworkReachabilityManager`是用来监测当前网络状况的一个类
- Security：网络安全，HTTPS请求就要用到`AFSecurityPolicy`
- Serialization：序列化，`AFURLRequestSerialization`是请求前的序列化，`AFURLResponseSerialization`是请求完成后对结果的序列化
- UIKit：里面则是一些UIkit的拓展Category

所以整个AFNetworking网络请求的过程就是：

![img](/img/AFNetworking/02.png)

