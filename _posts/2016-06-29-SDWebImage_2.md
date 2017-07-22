---
layout:     post
title:      "iOS源码分析之SDWebImage(二)"
subtitle:   "对iOS常用第三方SDwebImage的源码解析"
date:       2016-06-29 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

SDWebImage是iOS开发者最常用的第三方框架之一，用于异步下载网络图片，缓存图片，[Github源码地址](https://github.com/rs/SDWebImage)

### 三、核心架构

![](/img/SDWebImage/00.png)

### 四、相关技术

1. 判断当前图片类型：只判断图片二进制数据的第一个字节
2. 默认的缓存周期：1周
3. 缓存策略：默认情况下既做内存缓存又做磁盘缓存，下载图片前先检查内存缓存，再检查磁盘缓存
4. 缓存的实现方式：采用了苹果推出的专门用来处理缓存的类NSCache
5. 框架内部允许的最大并发数：6
6. 对系统内存警告的处理方式：框架内部监听系统内存警告的通知，当发生后移除内存缓存中的所有对象
7. 下载队列中对多个图片任务的处理方式：提供了FIFO和LIFO两种方式，默认为FIFO
8. 如何下载图片：采用NSURLConnection发送网络请求，在其代理方法中接收数据并处理进度回调等工作
9. 请求超时的设定：15秒
10. 磁盘缓存图片的命名：以该图片的URL进行MD5散列加密
11. 缓存路径：~/Library/Caches/default/com.hackemist.SDWebImageCache.default
12. key—–>URL(如何优化):用黑名单(当一个URL请求失败后,会被添加到黑名单,可以有效的防止一个错误的URL被多次尝试下载)
13. 写文件到硬盘在单独 NSInvocationOperation 中完成，避免拖慢主线程。
14. 如果是在iOS上运行，SDImageCache 在初始化的时候会注册notification 到 UIApplicationDidReceiveMemoryWarningNotification 以及  UIApplicationWillTerminateNotification,在内存警告的时候清理内存图片缓存，应用结束的时候清理过期图片。