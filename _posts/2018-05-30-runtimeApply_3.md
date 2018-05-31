---
layout:     post
category:   iOS
title:      "Runtime应用(三)：NSInvocation"
subtitle:   "应用NSInvocation写一个中间件来调用方法"
date:       2018-05-30 12:00:00
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

performSelector虽然能达到调用方法的目的，但是传递的参数最多只能由两个，也许可以通过封装进字典来传递，但是这样就徒增了工作。我们可以用NSInvocation的特性来达到这个目的

#### 3、NSInvocation

我们知道，iOS的方法调用实际上就是消息转发

```
objc_msgSend(Class receiver,SEL selector, arg1, arg2, ...)
```

而NSInvocation就是用来制造消息发送的类。

NSInvocation与其他NSObject类不一样，不会通过alloc/init来生成，它需要通过一个方法签名NSMethodSignature来生成

```
NSInvocation *invocatin = [NSInvocation invocationWithMethodSignature:sig];
```

而NSMethodSignature由类的selector来形成的

```
NSMethodSignature *sig  = [cls instanceMethodSignatureForSelector:aSelecotor];
```

依次填补参数，

```
    [invocatin setTarget:obj];
    [invocatin setSelector:aSelecotor];
    NSString *para = @"this is the value";
    [invocatin setArgument:&para atIndex:2];
```

触发，就可以发送一条消息

```
[invocatin invoke];
```

下面是调用HTOtherModule类的方法的完整代码：

```
    SEL aSelecotor = NSSelectorFromString(@"doSomethingWithParameter:");
    Class cls = NSClassFromString(@"HTOtherModule");
    id obj = [[cls alloc]init];
    NSMethodSignature * sig  = [cls instanceMethodSignatureForSelector:aSelecotor];
    NSInvocation * invocatin = [NSInvocation invocationWithMethodSignature:sig];
    [invocatin setTarget:obj];
    [invocatin setSelector:aSelecotor];
    NSString *para = @"this is the value";
    [invocatin setArgument:&para atIndex:2];
    [invocatin invoke];
```

#### 4、中间件的考虑

如果把所有跨模块的调用都写到一个类里，那么这个类肯定会变得臃肿，所以，建议是在一个类里写下核心代码，而对于某个模块需要被调用的方法，则通过Category的形式，整合到一起。

Categroy

```objc
@interface HTMediator (HTOtherModule)

- (NSString *)otherModulePerform:(NSString *)targetName action:(NSString *)actionName name:(NSString *)name hour:(NSUInteger)hour place:(NSString *)palce doSomething:(NSString *)doSomething;

@end
```

这是核心代码

```objc
- (id)performTarget:(NSString *)targetName action:(NSString *)actionName parameters:(NSArray *)parameters{
    Class tagetClass = NSClassFromString(targetName);
    NSObject *tagert= [[tagetClass alloc]init];
    SEL aSelector = NSSelectorFromString(actionName);
    NSMethodSignature *methodSignature = [tagetClass instanceMethodSignatureForSelector:aSelector];
    if(methodSignature == nil) // 方法签名找不到，异常情况自己处理
    {
        NSLog(@"找不到这个方法");
        return nil;
    }
    else
    {
        NSInvocation *invocation = [NSInvocation invocationWithMethodSignature:methodSignature];
        [invocation setTarget:tagert];
        [invocation setSelector:aSelector];
        
        //消息发送的参数，签名两个是class和selector，所以方法参数从第3个开始
        [parameters enumerateObjectsUsingBlock:^(id  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
            [invocation setArgument:&obj atIndex:idx+2];
        }];
        [invocation invoke];
        
        //返回值处理
        __autoreleasing id callBackObject = nil;
        if(methodSignature.methodReturnLength)
        {
            [invocation getReturnValue:&callBackObject];
        }
        return callBackObject;
    }
    return nil;
}
```

所有代码可以在[Github](https://github.com/helloted/iOS_Demo/tree/master/HTMediator)