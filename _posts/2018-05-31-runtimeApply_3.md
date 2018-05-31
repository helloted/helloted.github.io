---
layout:     post
category:   iOS
title:      "Runtime应用(三)：NSInvocation"
subtitle:   "应用NSInvocation写一个中间件来调用方法"
date:       2018-05-31 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

#### 1、解耦

一个大的APP里有多个模块，很多时候模块之间要相互调用、通信，通常情况下，我们都是讲要调用的模块引入进来，然后生成对象，调用其方法。这种情况下，一旦模块比较多，相互调用也比较多，就会出现下图的这种关系，复杂，错乱，耦合比较严重

![img](/img/Simple_8/10.png)

一个解决思路就是，建立一个中间件Meditor，所有的模块都只有Meditor相互通信，如果要调用其他类，也是通过Meditor来调用，从而达到解耦的目的

![img](/img/Simple_8/11.png)

#### 2、调用

在 iOS中不通过类可以直接调用某个对象的消息方式有两种:

- 一种是`performSelector:withObject;`
- 另外一种就是`NSInvocation。`

我们先来看`performSelector:withObject;`

如果我们有一个类HTOtherModule，并有一个方法如下

```
@implementation HTOtherModule

- (void)doSomethingWithParameter:(NSString *)para{
    NSLog(@"done some with:%@",para);
}

@end
```

我们在其他类中，不通过类而是通过runtime的方式来调用这个方法，我们可以这样做：

```
    Class cls = NSClassFromString(@"HTOtherModule");
    id obj = [[cls alloc]init];
    [obj performSelector:NSSelectorFromString(@"doSomethingWithParameter:") withObject:@"this is the value"];
```

