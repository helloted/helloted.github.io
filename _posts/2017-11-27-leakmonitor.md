---
layout:     post
title:      "iOS之Runtime运用:埋点统计"
subtitle:   "通过Runtime的黑魔法埋点来检测渲染时间和内存泄漏"
date:       2017-11-27 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 一、前言

#### 1、黑魔法

Runtime有个黑魔法，可以通过method swizzling在运行时将系统API进行替换，可以再自定义的方法中进行埋点。

#### 2、渲染时间

在UIViewController的生命周期中，Viewdidload和Viewdidappear之间的时间可以认为是“UI渲染时间”,我们可以通过统计二者之间的时间差距来统计页面的渲染时间，从而进行优化

#### 3、内存泄漏

UIViewController进入下一个界面有两种方式，push或者present。对应的返回上一个界面的方式是pop和dismiss，一般在pop或者dismiss方法调用之后，随后就会调用dealloc方法，将UIViewController内存情况，内存得到释放，如果无法调用dealloc方法，则会造成内存泄漏。所以

> 通过监测dealloc方法就可以监测内存泄漏

#### 二、Runtime黑魔法

可以通过method swizzling在运行时将系统API进行替换

```
void monitor_exchangeInstanceMethod(Class class, SEL originalSelector, SEL newSelector) {
    Method originalMethod = class_getInstanceMethod(class, originalSelector);
    Method newMethod = class_getInstanceMethod(class, newSelector);
    if(class_addMethod(class, originalSelector, method_getImplementation(newMethod), method_getTypeEncoding(newMethod))) {
        class_replaceMethod(class, newSelector, method_getImplementation(originalMethod), method_getTypeEncoding(originalMethod));
    } else {
        method_exchangeImplementations(originalMethod, newMethod);
    }
}
```

其中originalSelector是系统API，newSelector则是我们自定义的方法

```
+ (void)load{
    monitor_exchangeInstanceMethod([self class], @selector(viewDidLoad), @selector(ht_ViewDidLoad));
    monitor_exchangeInstanceMethod([self class], @selector(viewWillAppear:), @selector(ht_viewWillAppear:));
    monitor_exchangeInstanceMethod([self class], @selector(viewDidAppear:), @selector(ht_viewDidAppear:));
    monitor_exchangeInstanceMethod([self class], @selector(viewWillDisappear:), @selector(ht_viewWillDisappear:));
    monitor_exchangeInstanceMethod([self class], @selector(viewDidDisappear:), @selector(ht_viewDidDisappear:));
    monitor_exchangeInstanceMethod([self class], NSSelectorFromString(@"dealloc"), @selector(ht_dealloc));
}
```

NSObject的load方法，在每个class导入的时候，只要实现了这方法，就会调用而且只调用一次这个方法。

在load方法中，将UIViewController的生命周期里的几个method都通过method swizzling替换成我们自定义的方法，在自定义的方法中进行埋点，从而达到统计和监测的目的。其中ARC中不能显式调用dealloc方法，所以用NSSelectorFromString来达到我们的目的

### 三、渲染时间统计

```
- (void)ht_ViewDidLoad{
    long current =  [[NSDate date] timeIntervalSince1970]*1000;
    self.didLoadTime = @(current);
    [self ht_ViewDidLoad];
}
```

```
- (void)ht_viewDidAppear:(BOOL)animated{
    long didload = self.didLoadTime.longValue;
    if (didload!=0) {
        long current =  [[NSDate date] timeIntervalSince1970]*1000;
        long pass = current - didload;
        // 用于埋点监测UI渲染时间
        NSLog(@"%@渲染UI用时:%@毫秒",NSStringFromClass([self class]),@(pass));
        self.didLoadTime = @(0);
    }
    [self ht_viewDidAppear:animated];
}
```

通过method swizzling方法，已经将viewdidload和viewdidappear方法替换成了自定义的ht_ViewDidLoad以及ht_viewDidAppear。在这两个方法中分别获取当前时间戳，算得时间差就可以获得UI渲染时间。注意从下一个界面返回这个界面时也会调用viewdidappear，需要避免这个统计。

![img](/img/Simple_1/12.png)

### 四、内存泄漏

因为UIViewController得不到释放而造成内存泄漏的情景有三种

> NSTimer

NSTimer:一方面，NSTimer经常会被作为某个类的成员变量，而NSTimer初始化时要指定self为target，容易造成循环引用。 另一方面，若timer一直处于validate的状态，则其引用计数将始终大于0。

> Block

Block:某个类将block作为自己的属性变量，然后该类在block的方法体里面又使用了该类本身，简单说就是self.someBlock = ^(Type var){[self dosomething],不一定要显式地出现"self"字眼才会引起循环引用。

注意，无论是UIView的addsubview或者UINavigationViewController或者UIViewContrllor的childernController都是引用，使用block一定要注意将其中一个弱引用

> Delegate

Delegate:声明Delegate要用weak;当delegate指向的对象销毁后，delegate = nil;如果用assign，可以解决循环引用的问题，但是可能会出现野指针

```
- (void)ht_viewWillDisappear:(BOOL)animated{
    [self ht_viewWillDisappear:animated];
    if(self.isMovingFromParentViewController || self.isBeingDismissed){//将要被pop或者dismiss出去
        [self ht_willDealloc];
    }
}

- (void)ht_willDealloc{
    NSString *VCName = NSStringFromClass([self class]);
    self.ht_dellocBlock = dispatch_block_create(0, ^{
        NSLog(@"%@ 可能存在内存泄漏，没有delloc",VCName);
    });
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2 * NSEC_PER_SEC)), dispatch_get_main_queue(), self.ht_dellocBlock);
}
```

在viewWillDisappear方法中，我们可以通过判断`self.isMovingFromParentViewController || self.isBeingDismissed`来得知是否是被Pop或者dismiss。此时，通过在GCD的延迟来埋点。

```
- (void)ht_dealloc{
    if (self.ht_dellocBlock){
        dispatch_block_cancel(self.ht_dellocBlock);
    }
    [self ht_dealloc];
}
```

如果dealloc方法顺利得到调用，则将统计取消，如果没有顺利调用，则说明造成了内存泄漏，从而可以进行统计

![img](/img/Simple_1/13.png)

### 五、demo

以上代码可以在[Github-Monitor](git@github.com:helloted/MonitorMethod.git)下载