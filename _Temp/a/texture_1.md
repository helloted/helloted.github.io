---
layout:     post
category:   Flutter
title:      "外接纹理显示图片1：原理篇"
subtitle:   "外接纹理显示图片1：原理篇"
date:       2022-06-11 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

#### 1、Flutter列表中多图加载的问题

在社交或者资讯类App中，经常会使用到Feeds流页面，Feeds流页面的列表一般结构繁杂，单行资讯内就可能有多张图片；

![img](/img/Simple_6/28.png)

Flutter 通过 Image.asset，Image.file，Image.network 等方法创建一个 Image Widget 来加载显示本地或者网络图片。

而使用Image控件加载多图，会出现一些问题

- **内存过载**：列表中图片过多时，内存占用很轻松的飙升到了七八百MB，如果手机的配置不够，很可能就会导致页面空白甚至是Crash；
- **内存峰值高**：图片加载的过程中，加载前期阶段会内存峰值很高；
- **没有磁盘缓存**：Flutter原生的图片缓存机制，缓存到的是内存中，没有磁盘缓存，每次重新打开APP或者缓存被清理都会再次进行网络请求。

![img](/img/Simple_6/29.png)

#### 2、Flutter图片加载过程

Flutter中图片主要有4个类：

- **Image** **：**显示图⽚的Widget，通过ImageState管理ImageProvider的⽣命周期；
- **ImageProvider**：图⽚的抽象概念（如NetworkImage、FileImage等），约定图⽚唯⼀性(key)、获取图⽚字节数据(load)，创建ImageStream⽤于监听结果；
- **ImageStream**：图⽚的加载对象，通过 ImageStreamCompleter 最后会返回⼀个 ImageInfo,⽽ImageInfo 中的ui.Image是RenderObject的⽬标绘制对象；
- **ImageCache**：缓存单例PaintingBinding.instance.imageCache，只用于内存缓存；

加载流程：

1. Image 通过 ImageProvider 得到 ImageStream 对象
2. _ImageState 利用 ImageStream 添加监听，等待图片数据
3. .ImageProvider 通过 load 方法去加载并返回 ImageStreamCompleter 对象
4.  ImageStream 会关联 ImageStreamCompleter
5.  ImageStreamCompleter 会通过 http 下载图片，再经过 PaintingBinding 编码转化后，得到 ui.Codec 可绘制对象，并封装成 ImageInfo 返回
6. ImageInfo 回调到 ImageStream 的监听，设置给 _ImageState build 的 RawImage 对象。
7.  RawImage 的 RenderImage 通过 paint 绘制 ImageInfo 中的 ui.Codec

![img](/img/Simple_6/30.png)

#### 3、内存大的原因
