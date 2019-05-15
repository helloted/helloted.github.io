---
layout:     post
category:   Flutter
title:      "Dart内存机制"
subtitle:   "Dart的内存管理"
date:       2019-05-13 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 一、移动端的内存回收机制

GC(Garbage Collection)，垃圾回收机制，简单地说就是程序中及时处理废弃不用的内存对象的机制，防止内存中废弃对象堆积过多造成内存泄漏

常见的垃圾回收算法有引用计数法（Reference Counting）、标注并清理（Mark and Sweep GC）、拷贝（Copying GC）和逐代回收（Generational GC）等算法。

#### 1、iOS端

Objective-C语言本身是支持垃圾回收机制的，但有平台局限性，仅限于Mac桌面系统开发中，而在iPhone和iPad等苹果移动终端设备中是不支持垃圾回收机制的。在移动设备开发中的内存管理是采用MRC(Manual Reference Counting)以及iOS5以后的ARC(Automatic Reference Counting)，本质都是RC引用计数，通过引用计数的方式来管理内存的分配与释放，从而防止内存泄漏。

iOS采用引用计数算法回收内存，当对象引用计数为0时，对象会执行反初始化方法并被回收。如果两个对象互相引用对方，就会造成循环强引用，导致内存泄漏。

#### 2、Android端

Android系统采用的是标注并删除和拷贝GC，并不是大多数JVM实现里采用的逐代回收算法，根搜索算法回收内存，该算法通过GC Roots作为起点搜索，搜索通过的路径称为引用链，当一个对象没有被GC Roots的引用链连接的时候，这个对象就会被回收。即使A和B两个对象互相引用对方，只要A和B都不在引用链上，这两个对象都会被回收。

下图中的每个圆节点代表对象，箭头代表可达路径，当圆节点与 GC Roots 存在可达路径时，表示无法回收(黄色圆节点)，反之则可以回收(蓝色圆节点)。

![](/img/Simple_7/47.png)

> ##### GC Root
>
> - 虚拟机栈（栈帧中的局部变量）中的引用的对象。
> - 方法区域中的类静态属性引用的对象。
> - 方法区域中常量引用的对象。
> - 本地方法栈中 JNI（Native 方法）的引用的对象。
> - 运行中线程引用的对象

#### 3、GC与引用计数RC的区别

另外引用计数RC和垃圾回收GC是有区别的。

- GC垃圾回收是宏观的，对整体进行内存管理，将所有对象看做一个集合，然后在GC循环中定时检测活动对象和非活动对象，及时将用不到的非活动对象释放掉来避免内存泄漏，也就是说用不到的垃圾对象是交给GC来管理释放的，而无需开发者关心，比如Java中的垃圾回收机制；
- 引用计数是局部性的，开发者要管理控制每个对象的引用计数，单个对象引用计数为0后会马上被释放掉。ARC自动引用计数则是一种改进，由编译器帮助开发者自动管理控制引用计数(自动在合适的时机发送release和retain消息)。另外自动释放池autorelease pool则像是一个局部的垃圾回收，将部分垃圾对象集中释放，相对于单个释放会有一定延迟。

### 二、Flutter的runtime

Flutter使用`dart`语言作为其开发语言和运行环境。`dart`的`runtime`是一直存在的，但是在`debug`和`release`模式下有一些区别。

- 在`debug`模式下，`dart`大部分组件都放在设备上，例如`runtime`、`JIT(Android)`、`interpreter(iOS)`、`debug`和`profile` `services`。

- 在`release`模式下，只剩下`runtime`，而这也是Flutter App能够运行起来的最基本组件。

  ![img](/img/Simple_7/48.png)

在`runtime`中，存在一个在初始化对象时为其分配内存，对象不再被使用的时候回收内存的组件，即GC。
在`Flutter`中存在很多对象。以`Stateless` `Widget`为例，其在`State`发生变化或者`Widget`不可见的时候不断地发生重建和销毁(**注意，此处是指Widget树中的Widget，对于Element树和RenderObject树来说，element和renderObject是可变的，而且其初始化生成需要消耗很多资源。因此在大多数情况下他们是会被回收利用的**)。这些`Widget`的生命周期都很短，对于一个UI比较复杂的APP来说，可能会有数千个`Widget`需要被经常回收创建。

所以有些开发者可能会采取一些措施来避免太过频繁的GC。比如为了保持一个引用的`Widget`对象不会被回收，将其放在`state`中(**这样并不是说真的不会被回收，只是创建回收的频率被降低了，因为state是属于element的，而element的生命周期是比较长的**)。

这么做是没有必要的，首先`Widget`是一个很轻量级的对象，它的创建和回收并不会占用很多资源，真正占用资源的是`Element`和`RenderObject`。其次`dart` 的GC机制能够快速有效的进行对象回收，不用担心`Widget`创建过多导致`OOM`出现。