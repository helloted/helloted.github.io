---
layout:     post
category:   iOS
title:      "Runtime应用(二)：捕获异常"
subtitle:   "捕获'unrecognized selector sent to instance'异常"
date:       2017-05-11 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

#### 1、错误

先看一个常见的错误

![img](/img/Simple_2/25.png)

运行一个类没有的实例方法，就会报错‘unrecognized selector sent to instance’

我们知道，Objective-C的方法实际是是消息发送，我们来看一张经典的图

![](/img/Simple_4/01.png)

当对象经过查找，一直找不到可以运行的IMP，最后调用

```
- (void)doesNotRecognizeSelector:(SEL)aSelector
```

我尝试了去hook这个方法，结果导致

```
Thread 1: EXC_BAD_INSTRUCTION (code=EXC_I386_INVOP, subcode=0x0)
```

怀疑这个方法是消息调用的失败结果，不能被hook。

所以只好在调用这个方法之前将问题解决

#### 2、解决方案

1. 在`methodSignatureForSelector`阶段将找不到的Selector添加到NSObject里去，
2. 在`forwardInvocation`阶段将消息重新转发给NSObject

具体代码

```objc
- (NSMethodSignature *)ht_methodSignatureForSelector:(SEL)aSelector{
    if (![self respondsToSelector:aSelector]) {
        _errorSelectorName = NSStringFromSelector(aSelector);
        class_addMethod([self class], aSelector, (IMP)dynamicMethodIMP, "v@:");
        NSMethodSignature *methodSignature = [self ht_methodSignatureForSelector:aSelector];
        return methodSignature;
    }else{
        return [self ht_methodSignatureForSelector:aSelector];
    }
}

- (void)ht_forwardInvocation:(NSInvocation *)anInvocation{
    SEL selector = [anInvocation selector];
    if ([self respondsToSelector:selector]) {
        [anInvocation invokeWithTarget:self];
    }else{
        [self ht_forwardInvocation:anInvocation];
    }
}
```

其中，dynamicMethodIMP是对应找不到的selector的添加IMP，我们可以再里面实现我们自己的逻辑

```
#ifdef DEBUG
    NSString *error = [NSString stringWithFormat:@"errorClass->:%@\n errorSelector->%@\n errorReason->UnRecognized Selector",NSStringFromClass([self class]),_errorSelectorName];
    NSLog(@"%@",error);
#else
    //upload error
#endif
    
}
```

这样，我们调用不存在的方法就不会报错了

![img](/img/Simple_2/26.png)

如果，不想对现有的类添加过多的方法，可以用一个专门的类来收集这些方法NSProxy

```objc
- (NSMethodSignature *)methodSignatureForSelector:(SEL)aSelector{
    if (![self respondsToSelector:aSelector]) {
        _errorSelectorName = NSStringFromSelector(aSelector);
        class_addMethod([self class], aSelector, (IMP)proxyDynamicMethodIMP, "v@:");
    }
    NSMethodSignature *methodSignature = [[self class] instanceMethodSignatureForSelector:aSelector];
    return methodSignature;
}

- (void)forwardInvocation:(NSInvocation *)anInvocation{
    SEL selector = [anInvocation selector];
    if ([self respondsToSelector:selector]) {
        [anInvocation invokeWithTarget:self];
    }else{
        [self forwardInvocation:anInvocation];
    }
}
```



