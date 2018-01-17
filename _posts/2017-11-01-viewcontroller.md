---
layout:     post
title:      "【译】View Controller编程指南"
subtitle:   "《View Controller Programming Guide for iOS》文档翻译"
date:       2017-11-01 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

苹果官方文档[View Controller Programming Guide for iOS](https://developer.apple.com/library/content/featuredarticles/ViewControllerPGforiPhoneOS/index.html#//apple_ref/doc/uid/TP40007457-CH2-SW1)

### 一、ViewController的角色

ViewController是你的应用程序内部结构的基础。 每个应用程序至少有一个ViewController，大多数应用程序有几个。 每个ViewController管理你的应用程序用户界面的一部分，以及该界面和底层数据之间的交互。 ViewController也用于您的用户界面的不同部分之间的转换。

因为他们在你的应用中扮演着如此重要的角色，ViewController几乎是你所做的一切的中心。 UIViewController类定义了管理你的View，处理事件，从一个ViewController转换到另一个ViewController，以及协调你的应用程序的其他部分的方法和属性。 您可以继承UIViewController（或其子类之一）并添加实现应用程序行为所需的自定义代码。

有两种类型的ViewController：

- 内容ViewController管理你的应用程序内容的一个离散片段，是创建的ViewController的主要类型。

- 容器ViewController收集来自其他ViewController（称为子ViewController）的信息并以便于导航的方式呈现或以不同方式呈现这些ViewController的内容。

### 二、View管理

ViewController最重要的作用是管理View的层次结构。 每个ViewController都有一个root view包含所有内容。 在该root view中，您添加了需要显示内容的view。 图显示了ViewController和View之间的内置关系。 ViewController总是具有对其root view的引用，并且每个view都具有对其subview的强引用。

![img](/img/Simple_3/20.jpg)

内容ViewController自己管理其所有View。

 容器ViewController管理其自己的View以及来自其一个或多个子ViewController的root view。 该容器不管理其子女的内容。 它只管理root view，根据容器的设计大小和放置它。 图说明了分割ViewController及其子项之间的关系。 拆分ViewController管理其subview的整体大小和位置，但子ViewController管理这些view的实际内容。

![img](/img/Simple_3/21.jpg)