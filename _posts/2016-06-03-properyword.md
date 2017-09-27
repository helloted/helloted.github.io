---
layout:     post
title:      "iOS内存管理、属性关键字"
subtitle:   "iOS内存管理，OC属性修饰关键字的理解与使用"
date:       2016-06-03 12:00:00
author:     "Ted"
header-img: "img/bg_02.jpg"
---

### 一、引用计数、内存管理

> 生命周期

每当对象创建出来，它的生命就已经开始了，一直到操作系统释放了 该对象，对象的生命才结束

> 基于计数器的内存管理

每个对象都有 一个引用计数器，它记录了对象被使用的情况。

当使用 alloc、copy、new 三种方法之中的任一种方法创建对象时，对象计数器会被自动设 置为 1。

如果向对象发送 retain 消息，对象计数器会自动加 1。而向对象发送 release 消 息，对象计数器会自动减 1。

如果一个对象的引用计数器为0，则系统会自动调用这个对象的dealloc方法来销毁这个对象。

### 二、autorealsepool、自动延缓释放池

> 原理

当调用对象autorealse方法后，对象的引用计数没有减一，对象就进入了autorealsepool当中，当autoreleasepool被pop时，会对池中的所有对象进行release一次，从而进行对象释放。

> @autoreleasepool

自动释放池可以延长对象的声明周期，如果一个事件周期很长，比如有一个很长的循环逻辑，那么一个临时变量可能很长时间都不会被释放，一直在内存中保留，那么内存的峰值就会一直增加，但是其实这个临时变量是我们不再需要的。这个时候就通过@autoreleasepool创建新的自动释放池来缩短临时变量的生命周期来降低内存的峰值。

> 过程

- 创建：Runloop进入 kCFRunLoopEntry 时创建，Runloop回调_objc_autoreleasePoolPush() 创建自动释放池，其 order 是-2147483647，优先级最高，保证创建释放池发生在其他所有回调之前。
- 更新：Runloop状态kCFRunLoopBeforeWaiting(准备进入休眠) 时调用_objc_autoreleasePoolPop() 和 _objc_autoreleasePoolPush() 释放旧的池并创建新池；
- 销毁： Runloop状态kCFRunLoopExit(即将退出Loop) 时调用 _objc_autoreleasePoolPop() 来释放自动释放池。这个 Observer 的 order 是 2147483647，优先级最低，保证其释放池子发生在其他所有回调之后。

### 三、属性修饰符

属性修饰符用来指示数据可访问性与特性，共有一下几个关键字

1. atomic 			//default
2. nonatomic
3. strong=retain//default
4. weak= unsafe_unretained
   5. assign //default
5. copy
6. readonly
7. readwrite         //default

#### atomic

- 只有一个线程会同时访问这个变量，是线程安全的，会加锁以保证安全访问
- 效率比较差
- 是一个默认的属性关键字

```
@property (copy, nonatomic) NSString *var;
 
------------------等效分割线------------------
@synthesize var; 
- (NSString *)var {
	  @synchronized(self) {
        return _var;
	  }   
}
 
- (void)setVar:(NSString *)var {
	@synchronized(self){
      _var = var;
	}   
}
```

#### nonatomic

- 可以多个线程同时访问这个属性变量，可能会导致不可预料的结果
- 效率高，iOS推荐用这个属性

#### strong (iOS4 = retain )

- 强引用，引用计数加1
- 会一直保存在堆heap中直到没有指针指向这个属性
- 对象属性的默认修饰
- 在ARC阶段，不需要收到管理对象的引用计数 (retain count of an object），retain用strong取而代之

#### copy

- 与Strong一样是引用计数加1
- 如果属性是可变的，需要用这个修饰。
- copy会重新开辟一个内存空间，复制将内容复制过去。而Strong是将指针指过去而已。
- Copy是这块内存的拥有者，不会被其他干扰

#### weak (iOS4 = unsafe_unretained )

- 弱引用，不会引用计数加1
- 不会影响对象的释放，即只要对象没有任何强引用指向，即使有100个弱引用对象指向也没用，该对象依然会被释放。
- 对象在被释放的同时，指向它的弱引用会自动被置nil，这个技术叫zeroing weak pointer。这样有效得防止无效指针、野指针的产生。
- weak一般用在delegate关系中防止循环引用或者用来修饰指向由Interface Builder编辑与生成的UI控件。
- 与Strong区别在于，只要有一个Strong指针指向该对象，则不会被释放，但是如果只有weak指针指向，无论多少weak，依旧会被释放

```
 @property (nonatomic, strong) NSString *str;   
 
 NSString *first = @"Hello";
 self.str  = first;
 first = nil;
```

代码解释，first是强指针引用，之后str也指向"Hello"这个内存，

当str是Strong类型时，虽然first这个指针没有了，但是有str强引用，@"hello"依然不会被释放。

当str是weak类型时，first指针被清空，只有str弱引用，@"hello"会被释放

#### assign

- 非对象类型，数值类型的修饰
- 与weak的区别在于，weak修饰的引用被释放后会自动置为nil，而assign不会，这样会导致野指针

#### readonly

- 只读
- 只会生成getter方法

#### readwrite

- 可读写
- 默认属性


### 四、其他关键字

#### 1、Static

> 保证局部变量永远只初始化一次，在程序的运行过程中永远只有一份内存

先看一下区别

```
    for (int i = 0; i < 10; i ++) {
        int a = 0;    
        a ++;    //打印结果
        NSLog(@"a=%d",a);
    }
    
    //打印结果是：
    a = 1
    a = 1
    a = 1
    ...
```

加Static关键字

```
    for (int i = 0; i < 10; i ++) {
        int static a = 0;    
        a ++;    //打印结果
        NSLog(@"a=%d",a);
    }
    
    //打印结果是：
    a = 1
    a = 2
    a = 3
    ...
```

> 使全局变量的作用域仅限于当前文件内部，即当前文件内部才能访问该全局变量。

```
+ (SingleObject *)sharedSingleton{
    static SingleObject *_singleObj = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _singleObj = [[self alloc] init];
    });
    return _singleObj;
}
```

#### 2、Const

（1 const用来修饰右边的基本变量或指针变量
（2 被修饰的变量只读，不能被修改

```
int  const  *p   //  *p只读 ;p变量
int  * const  p  // *p变量 ; p只读
const  int   * const p //p和*p都只读
int  const  * const  p   //p和*p都只读
```

#### 3、extern

我们可以在.h文件中extern声明一些全局的常量

```
.h声明一些全局常量
extern NSString * const name;extern NSInteger const count;
```

然后在.m文件中去实现

```
.m实现
NSString *const name = @"helloted";
NSInteger const count = 6;
```

这样，只要导入头文件，就可以全局的使用定义的变量或常量。