---
layout:     post
title:      "iOS设计模式"
subtitle:   "iOS开发中常用的一些设计模式"
date:       2017-09-08 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

#### 1、单例模式(Singleton)

概念理解：整个应用或系统只能有该类的一个实例

iOS中几个常用的单例：

- UIApplication类提供了 ＋sharedAPplication方法创建和获取UIApplication单例
- NSBundle类提供了 +mainBunle方法获取NSBundle单例
- NSFileManager类提供了 ＋defaultManager方法创建和获得NSFileManager单例。（PS：有些时候我们得放弃使用单例模式，使用－init方法去实现一个新的实例，比如使用委托时）
- NSNotificationCenter提供了 ＋defaultCenter方法创建和获取NSNotificationCenter单例（PS：该类还遵循了另一个重要的设计模式：观察者模式）
- NSUserDefaults类提供了 ＋defaultUserDefaults方法去创建和获取NSUserDefaults单例

我们也可以自己去生成一个单例

```
+ (Singleton *)sharedSingleton{
    static dispatch_once_t once_token;<3>
    dispatch_once(&once_token,^{
        sharedSingleton = [[self alloc] init];
    });
    return sharedSingleton;<5>
}
```

#### 2、MVC模式

MVC是Cocoa框架采用推荐的一种设计模式，也是iOS开发中最常用的一种模式

`M-Model:` “模型”封装应用程序的数据，模型对象维护应用程序的数据，并定义操作数据的特定逻辑。模型对象可以复用，因为它表示的知识适用于特定问题的领域。理想状况下，模型对象同用于进行显示和编辑的用户界面之间不应有任何直接的关联。

`V-View`: “视图”显示和编辑数据，视图对象可以响应用户操作。

`C-Controller`: “控制器”处理前两者之间的逻辑关系。控制器对象作为中间人或者协调人，使视图得以知晓模型的变更而给予响应。控制器对象还可以作为管理其他对象的生命周期，进行设置和协调任务。

#### 3、原型模式(Prototype)

概念：使用原型实例指定对象的种类，并通过复制这个原型创建新的对象，原型模型也称为复制模式，此模式是生成对象的真实副本，以用作同一环境下其他相关事物的基础(原型)

应用：NSObject的派生类提供了实现深复制的协议，子类需要实现NSCopying协议及其方法`-(id)copyWithZone:(NSZone *)zone`来实现`-(id)copy`方法，否则会引发异常。思路是复制必需的成员变量与资源，传给此类的新实例。

