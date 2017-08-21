---
layout:     post
title:      "iOS内存管理、属性关键字"
subtitle:   "iOS内存管理，OC属性修饰关键字的理解与使用"
date:       2016-06-03 12:00:00
author:     "Ted"
header-img: "img/bg_02.jpg"
---

### 一、引用计数、内存管理

在ObjC中没有垃圾回收机制，那么ObjC中内存又是如何管理的呢？其实在ObjC中内存的管理是依赖对象引用计数器来进行的：在ObjC中每个对象内部都有一个与之对应的整数（retainCount），叫“引用计数器”，当一个对象在创建(alloc，new)之后它的引用计数器为1，

当调用这个对象的retain、copy方法之后引用计数器自动在原来的基础上加1（ObjC中调用一个对象的方法就是给这个对象发送一个消息），

当调用这个对象的release方法之后它的引用计数器减1，

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
3. weak= unsafe_unretained
 5. assign 	//default
4. copy
5. readonly
 8. readwrite         //default

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
