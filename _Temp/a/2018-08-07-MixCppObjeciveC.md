---
layout:     post
category:   工具
title:      "C++与Objective-C混编"
subtitle:   "iOS开发中的C++与Objective-C混编"
date:       2018-06-21 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

在一些iOS开发中，经常有一些第三方的框架是用C++写的，有时候我们需要在C++文件中调用OC方法，或者在OC文件中调用C++函数，也就是C++与Objective-C混编。但是我们知道在纯OC文件中是不能编译C++代码的，在纯C++文件中又是不能编译Objective-C代码的。直接引入编译不过会报错



如果要同时混编，就要利用下面的几种方式。

#### 一、通过Objective-C++

Objective-C++是C++的超集，就如同Objective-C是C的超集，在OS X上同时被GCC和Clang支持编译，能够不用C++来初始化OC对象和调用方法。只要在C ++模块的实现中隐藏Objective-C header导入和类型，它就不会感染任何“纯”C ++代码。

.mm是Objective-C++的默认后缀名，Xcode会自动识别。在.mm文件中，Objective-C代码和C++代码都可以正常编译运行。

```objc
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

二、通过中介

三、





