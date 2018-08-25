---
layout:     post
category:   工具
title:      "C++与Objective-C混编"
subtitle:   "iOS开发中的C++与Objective-C混编"
date:       2018-08-07 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

在一些iOS开发中，经常有一些第三方的框架是用C++写的，有时候我们需要在C++文件中调用OC方法，或者在OC文件中调用C++函数，也就是C++与Objective-C混编。但是我们知道在纯OC文件中是不能编译C++代码的，在纯C++文件中又是不能编译Objective-C代码的。直接引入编译不过会报错

![img](/img/Simple_1/39.png)

如果要同时混编，就要利用下面的几种方式。

#### 一、通过Objective-C++

Objective-C++是C++的超集，就如同Objective-C是C的超集，在OS X上同时被GCC和Clang支持编译，能够不用C++来初始化OC对象和调用方法。只要在C ++模块的实现中隐藏Objective-C header导入和类型，它就不会感染任何“纯”C ++代码。

.mm是Objective-C++的默认后缀名，Xcode会自动识别。在.mm文件中，Objective-C代码和C++代码都可以正常编译运行。

```c++
//MyClass.h
class MyClass
{
  public:
    double secondsSince1970();
};


//MyClass.mm
#include "MyClass.h"
#import <Foundation/Foundation.h>

double MyClass::secondsSince1970()
{
  return [[NSDate date] timeIntervalSince1970];
}


//Client.cpp
...
MyClass c;
double seconds = c.secondsSince1970();
```

### 二、通过C函数来桥接

我们知道Objective-C和C++都是在C语言的基础上发展而来的语言，都能同时支持C函数，所以我们可以通过C函数来桥接，从而能够编译。

先定义一个.h文件:

```
//CppOCBridge.h
typedef void (*interface) (void* caller,void* parameter);
```

自定义一个OC类

```objc
//  TargetOC.h

#import <Foundation/Foundation.h>
#import "CppOCBridge.h"

@interface TargetOC : NSObject

- (void)doFirstMethodWith:(void*)parameter;
- (void)doSecondMethodWith:(void *)parameter;

@property interface doFirstMethod;
@property interface doSecondMethod;

@end
```

```objc
//  TargetOC.m

#import "TargetOC.h"

void OcObjectDoFirstMethodWithWith(void *ocInstance, void *parameter){
    [(__bridge id)ocInstance doFirstMethodWith:parameter];
}

void OcObjectDoSecondMethodWithWith(void *ocInstance, void *parameter){
    [(__bridge id)ocInstance doSecondMethodWith:parameter];
}

@implementation TargetOC

-(instancetype)init{
    if ([super init]) {
        _doFirstMethod = OcObjectDoFirstMethodWithWith;
    }
    return self;
}

-(void)doFirstMethodWith:(void *)parameter{
    NSLog(@"oc doFirstMethodWith parameter==== %@",parameter);
}

- (void)doSecondMethodWith:(void *)parameter{
    NSLog(@"oc doSecondMethodWith parameter==== %@",parameter);
}

@end
```

那么，在一个C++类里，如果我们要调用一个方法的话，我们定义一个类ObjectCpp

```c++
void ObjectCpp::call_oc_function(void *ocObj, interface function, void *parameter){
    function(ocObj,parameter);
}
```

调用OC方法的步骤为

```objc
    TargetOC *ocObj = [[TargetOC alloc]init];
    ObjectCpp *cpp = new ObjectCpp; 
    cpp->call_oc_function((__bridge void*)ocObj,ocObj.doFirstMethod,(__bridge void*)@"this is paras");
```

OC对象和方法都被包装成一个参数来进行调用，从而达到混编的目的

### 三、运行时objc_msgSend

一提到将OC方法变成C函数，肯定会想到运行时，在Objective-C中，消息在运行时才被绑定到方法实现。

编译器会将一个下面的一个消息表达式

```objc
[receiver message]
```

转变成一个消息函数 `objc_msgSend`，这个函数将接收者和消息中提到的方法的名称（即方法selector）作为其两个主要参数：

```c
objc_msgSend(receiver, selector)
```

消息中传递的其他参数也在 `objc_msgSend`被处理

```c++
objc_msgSend(receiver, selector, arg1, arg2, ...)
```

所以，利用objc_msgSend也可以达到混编的目的

假设我们有一个OC对象NewObject继承自NSObject:

```objc
@interface NewObject : NSObject

- (void)doSomethingWith:(char *)paras;

@end
```

正常在OC环境中，如果我们需要调用方法的话，步骤是这样的

```objc
NewObject *myobj = [[NewObject alloc]init];
[myobj doSomethingWith:@"abc"];
```

在运行时编译时，将被转换成：

```c
    void *myobj = objc_msgSend((id)objc_getClass("NewObject"), sel_registerName("alloc"), sel_registerName("init"));
    objc_msgSend((id)myobj, sel_registerName("doSomethingWith:"), (char *)"abc");
```

如果是类方法则更简单了：

```c++
objc_msgSend((id)objc_getClass("NewObject"), sel_registerName("doThirdMethod:"), 1);
```

可以很清楚地看到，通过`objc_getClas`获取到了类，通过`sel_registerName`获得方法，而上面两个方法都是C函数方法，可以在C++文件中顺利调用，不过要注意先引入头文件

```
#import <objc/runtime.h>
#import <objc/message.h>
```



