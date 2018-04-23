---
layout:     post
category:   iOS
title:      "Objective-C对象引用"
subtitle:   "iOS中的强引用和弱引用"
date:       2018-04-14 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 一、引用

引用是iOS内存管理中的重要知识点，总所周知，iOS对象的内存管理是使用引用计数来表示的。一个对象只有在它的所有强引用都被释放后才能被回收。因此，一个对象的生命周期取决于其强引用的所有者。在某些情况下，这种行为可能并不理想。您可能想要引用一个对象而不妨碍对象本身的回收。对于这种情况，您可以获取一个“弱”引用。弱引用是通过存储一个指向对象的指针创建的，而不是保留对象。

强引用(持有对象Retain)：当前对象被其他对象引用时，会执行retain操作，引用计数器+1。所以只要有一个强引用，当前对象就不可能被释放，RootViewController、NavgationController、TabbarContrller都会对ViewCoontrller进行强引用，addSubView会导致对子View的强引用，属性成员变量如果修饰符是Strong也是强引用。

弱引用：不会修改引用计数，不论有多少弱引用，该释放就释放，而且weak指针在被释放的时候还会被置为nil，防止野指针的出现

#### weak 引用原理：

1、初始化时：runtime会调用objc_initWeak函数，初始化一个新的weak指针指向对象的地址。

2、添加引用时：objc_initWeak函数会调用 objc_storeWeak() 函数， objc_storeWeak() 的作用是更新指针指向，创建对应的弱引用表。

3、释放时，调用clearDeallocating函数。clearDeallocating函数首先根据对象地址获取所有weak指针地址的数组，然后遍历这个数组把其中的数据设为nil，最后把这个entry从weak表中删除，最后清理对象的记录。

### 二、循环引用

对象 A 和对象 B，相互引用了对方作为自己的成员变量，只有当自己销毁时，才会将成员变量的引用计数减 1。因为对象 A 的销毁依赖于对象 B 销毁，而对象 B 的销毁与依赖于对象 A 的销毁，这样就造成了我们称之为循环引用（Reference Cycle）。循环引用比较容易出现在Block、Timer引用中。

![img](/img/Simple_7/17.png)

打破循环引用很简单，将其中一个指针改为弱引用

#### 三、NSTimer引起的循环引用

```
@interface DetailViewController ()
@property (nonatomic, weak) NSTimer *timer;
@end

@implementation DetailViewController
- (IBAction)fireButtonPressed:(id)sender {
    _timer = [NSTimer scheduledTimerWithTimeInterval:3.0f
                                              target:self
                                            selector:@selector(timerFire:)
                                            userInfo:nil
                                             repeats:YES];
    [_timer fire];
}

-(void)timerFire:(id)userinfo {
    NSLog(@"Fire");
}
@end
```

当我们从这个界面跳转到其他界面的时候却发现：控制台还在源源不断的输出着 Fire 。看来 `Timer` 并没有停止。ViewController的dealloc也未被调用。

为什么ViewController对timer是弱引用，还是不行？

原因是`Timer` 添加到 `Runloop` 的时候，会被 `Runloop` 强引用，Timer对Self进行强引用，导致ViewController得不到释放。

那么换成weakSelf呢？就是我们在block中常用的那种。

```
__weak typeof(self) weakSelf = self;
_timer = [NSTimer scheduledTimerWithTimeInterval:3.0f
                                          target:weakSelf
                                        selector:@selector(timerFire:)
                                        userInfo:nil
                                         repeats:YES];
```

实际运行发现，还是不行，说明target就是强引用。

#### 解决方案

使用一个中间target给timer，不让timer直接强引用VC。

```objc
@implementation HTWeakTimer
- (void) fire:(NSTimer *)timer {
    if(self.target) {
        [self.target performSelector:self.selector withObject:timer.userInfo];
    } else {
        [self.timer invalidate];
    }
}


+ (NSTimer *) scheduledTimerWithTimeInterval:(NSTimeInterval)interval
                                      target:(id)aTarget
                                    selector:(SEL)aSelector
                                    userInfo:(id)userInfo
                                     repeats:(BOOL)repeats {
    HTWeakTimer* timerTarget = [[HTWeakTimer alloc] init];
    timerTarget.target = aTarget;
    timerTarget.selector = aSelector;
    timerTarget.timer = [NSTimer scheduledTimerWithTimeInterval:interval
                                                         target:timerTarget
                                                       selector:@selector(fire:)
                                                       userInfo:userInfo
                                                        repeats:repeats];
    return timerTarget.timer;
}
@end
```

### 四、如何objc_setAssociatedObject关联weak属性

`OBJC_ASSOCIATION_ASSIGN` 不会在属性清空后将引用指针清空，这会造成野指针，所以是由风险去访问一个已经被清除的对象的。但是我们可以用另外的一种方法来关联一个weak属性，那就是强关联一个对象，然后让这个对象来弱引用这个属性。

```objc
@interface WeakObjectContainer : NSObject
@property (nonatomic, readonly, weak) id object;
@end

@implementation WeakObjectContainer
- (instancetype) initWithObject:(id)object
{
    if (!(self = [super init]))
        return nil;

    _object = object;

    return self;
}
@end
```

把WeakObjectContainer对象用OBJC_ASSOCIATION_RETAIN_NONATOMIC强关联

```objc
objc_setAssociatedObject(self, &MyKey, [[WeakObjectContainer alloc] initWithObject:object], OBJC_ASSOCIATION_RETAIN_NONATOMIC);
```

取

```Objc
id object = [objc_getAssociatedObject(self, &MyKey) object];
```