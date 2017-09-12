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
    static dispatch_once_t once;<3>
    dispatch_once(&once,^{
        sharedSingleton = [[self alloc] init];
    });
    return sharedSingleton;<5>
}
```

