---
layout:     post
title:      "内存管理"
subtitle:   "iOS内存管理指南"
date:       2017-11-29 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

本文翻译自[Advanced Memory Management Programming Guide](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/MemoryMgmt/Articles/MemoryMgmt.html#//apple_ref/doc/uid/10000011i)

### 一、关于内存管理

> Although memory management is typically considered at the level of an individual object, your goal is actually to manage [object graphs](). You want to make sure that you have no more objects in memory than you actually need.

![img](/img/Simple_2/02.png)

内存管理通常被认为针对单个对象进行，目标实际去管理“对象图”，你需要确保除了你真的需要的对象，没有更多的对象再内存里。

#### 1、Objective-C有三种内存管理方式：

1.1、MRR(manual retain-release):通过跟踪你所拥有的对象来显式地管理内存，采用了"引用计数（ reference counting）"的模型。该模型由基础类NSObject和运行时Runtime共同提供

1.2、ARC(Automatic Reference Counting):系统采用MRR相同的引用计数系统，不同的时，在编译的时候插入了内存管理的方法。

1.3、GC(Garbage Collection)：Mac下才能使用，iOS不支持

#### 2、内存管理存在两种错误

2.1、释放(free)或者覆盖(over-write)正在使用中的数据。

​	这会造成内存异常，导致应用程序崩溃，导致数据损坏。

2.2、不再使用的内存没有被释放，导致内存泄漏。

​	内存泄露，就是有内存分配但是不释放它，哪怕这块内存已经不用了。泄露，导致你的应 用程序占用越来越多的内存，并导致整体性能的下降，或者在 iOS 平台上导致应用终止。

