---
layout:     post
category:   iOS
title:      "Runtime应用(四)：NSProxy"
subtitle:   "利用NSProxy以及运行时来实现“多继承”"
date:       2018-06-04 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

#### 1、继承

继承是面向对象的三个基本特征(封装，继承，多态)之一，Objective-C语法中，是单继承。而多继承可以看作是单继承的扩展。所谓多继承是指派生类具有多个基类，派生类与每个基类之间的关系仍可看作是一个单继承。我们可以利用NSProxy的特性来模拟多继承

> NSProxy is an abstract superclass defining an API for objects that act as stand-ins for other objects or for objects that don’t exist yet. Typically, a message to a proxy is forwarded to the real object or causes the proxy to load (or transform itself into) the real object. Subclasses of NSProxy can be used to implement transparent distributed messaging (for example, [NSDistantObject](https://link.jianshu.com?t=https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Classes/NSDistantObject_Class/index.html#//apple_ref/occ/cl/NSDistantObject)) or for lazy instantiation of objects that are expensive to create.

NSProxy是与NSObject并列的一个类，它有两个运行时方法

```objc
- (void)forwardInvocation:(NSInvocation *)anInvocation;
- (NSMethodSignature *)methodSignatureForSelector:(SEL)sel;
```

我们可以通过消息转发的特性，将消息转发到另外的实例来实现多继承。

#### 2、多继承

先新建两个普通类Teacher和Worker;

```objc
#import "Teacher.h"

@implementation Teacher

- (void)teachStudent{
    NSLog(@"我可以教导学生");
}

@end
```

```objc
#import "Worker.h"

@implementation Worker

- (void)workHard{
    NSLog(@"我可以做工");
}

@end
```

再新建一个类SuperPerson继承自NSProxy

```
@interface SuperPerson : NSProxy

+ (instancetype)person;

@end
```

NSProxy与NSObject不同的是，初始化一个NSProxy只需要alloc方法，不需要init方法，为了模仿普通类，我们自定义一个init方法，并在其中做一些初始化

```objc
- (instancetype)init{
    _methodsMap = [NSMutableDictionary dictionary];
    Teacher *teacher = [[Teacher alloc] init];
    Worker *worker = [[Worker alloc] init];
    
    // 将"父类"方法继承
    [self inheriteMethodsFromSuperTarget:teacher];
    [self inheriteMethodsFromSuperTarget:worker];
    return self;
}
```

初始化的主要工作就是将需要继承的类的方法存储好

```objc
- (void)inheriteMethodsFromSuperTarget:(id)target{
    unsigned int numberOfMethods = 0;
    Method *method_list = class_copyMethodList([target class], &numberOfMethods);
    for (int i = 0; i < numberOfMethods; i ++) {
        Method temp_method = method_list[i];
        SEL temp_sel = method_getName(temp_method);
        const char *temp_method_name = sel_getName(temp_sel);
        [_methodsMap setObject:target forKey:[NSString stringWithUTF8String:temp_method_name]];
    }
    free(method_list);
}
```

然后重写两个消息转发的方法

```objc
- (void)forwardInvocation:(NSInvocation *)invocation{
    SEL sel = invocation.selector;
    NSString *methodName = NSStringFromSelector(sel);
    
    //查找对应的target
    id target = _methodsMap[methodName];
    
    if (target && [target respondsToSelector:sel]) {
        [invocation invokeWithTarget:target];
    } else {
        [super forwardInvocation:invocation];
    }
}

- (NSMethodSignature *)methodSignatureForSelector:(SEL)sel{
    NSString *methodName = NSStringFromSelector(sel);
    id target = _methodsMap[methodName];
    if (target && [target respondsToSelector:sel]) {
        return [target methodSignatureForSelector:sel];
    } else {
        return [super methodSignatureForSelector:sel];
    }
}
```

![img](/img/Simple_8/12.png)

可以看到虽然，没有实现workHard和teachStudent两个方法，我们依旧可以调用者两个其他类的方法，模拟成了多继承。

完整代码，可以在[github](https://github.com/helloted/iOS_Demo/tree/master/NSProxy)下载

