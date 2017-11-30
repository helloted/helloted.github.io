---
layout:     post
title:      "iOS内存管理指南"
subtitle:   "iOS内存管理指南官方文档翻译"
date:       2017-11-29 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

本文翻译自[Advanced Memory Management Programming Guide](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/MemoryMgmt/Articles/MemoryMgmt.html#//apple_ref/doc/uid/10000011i)

### 一、关于内存管理

> Although memory management is typically considered at the level of an individual object, your goal is actually to manage [object graphs](). You want to make sure that you have no more objects in memory than you actually need.

![img](/img/Simple_2/02.png)

内存管理通常被认为针对单个对象进行，目标实际去管理“对象图”，你需要确保除了你真的需要的对象，没有更多的对象再内存里。

#### 1、Objective-C有三种内存管理方式：

1.1、MRR(manual retain-release):通过跟踪你所拥有的对象来显式地管理内存，采用了"引用计数（ reference counting）"的模型。该模型由基础类NSObject和运行时Runtime共同提供

1.2、ARC(Automatic Reference Counting):系统采用MRR相同的引用计数系统，不同的时，在编译的时候插入了内存管理的方法。

1.3、GC(Garbage Collection)：Mac下才能使用，iOS不支持

#### 2、内存管理存在两种错误

2.1、释放(free)或者覆盖(over-write)正在使用中的数据。

​	这会造成内存异常，导致应用程序崩溃，导致数据损坏。

2.2、不再使用的内存没有被释放，导致内存泄漏。

​	内存泄露，就是有内存分配但是不释放它，哪怕这块内存已经不用了。泄露，导致你的应 用程序占用越来越多的内存，并导致整体性能的下降，或者在 iOS 平台上导致应用终止。

### 二、内存管理策略

NSObject定义了一个dealloc方法，当一个对象被清除时，这个方法会被自动调用

#### 1、内存管理基本原则

> The memory management model is based on object ownership. Any object may have one or more owners. As long as an object has at least one owner, it continues to exist. If an object has no owners, the runtime system destroys it automatically.

内存管理模型是建立在一个对象的"所有权"上，当一个对象有至少一个"所有者"时，它就会继续存在。否则，运行时系统就会将其自动清除

> - **You own any object you create**
>
>   You create an object using a method whose name begins with “alloc”, “new”, “copy”, or “mutableCopy” (for example, `alloc`, `newObject`, or `mutableCopy`).
>
> - **You can take ownership of an object using retain**
>
>   A received object is normally guaranteed to remain valid within the method it was received in, and that method may also safely return the object to its invoker. You use `retain` in two situations: (1) In the implementation of an accessor method or an `init` method, to take ownership of an object you want to store as a property value; and (2) To prevent an object from being invalidated as a side-effect of some other operation (as explained in [Avoid Causing Deallocation of Objects You’re Using](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/MemoryMgmt/Articles/mmPractical.html#//apple_ref/doc/uid/20000043-1000922)).
>
> - **When you no longer need it, you must relinquish ownership of an object you own**
>
>   You relinquish ownership of an object by sending it a `release` message or an `autorelease` message. In Cocoa terminology, relinquishing ownership of an object is therefore typically referred to as “releasing” an object.
>
> - **You must not relinquish ownership of an object you do not own**
>
>   This is just corollary of the previous policy rules, stated explicitly.

- 你拥有你所创建的对象

  你如果用下面字母作为开头的方法来创建对象，那么你将拥有这个对象:alloc、new、copy、mutableCopy。比如，alloc、newObject、或者 mutableCopy 等方法。

- 你可以用 retain 来实现对一个对象的所有

  如果你在一个方法体中，得到了一个对象，那么这个对象在本方法内部是一直都有效的。而且你还可以在本方法中将这个对象作为返回值返回给方法的调用者。在下面两种状况下，你需要用retain:(1)在访问方法(getter、setter)或者 init 方法中，你希望将得到的返回对象作为成员变量(property)来存储。 (2)在执行某些操作时，你担心在过程中对象变得无效。(在 避免你正在使用的对象被 dealloc 中详细解释。)

- 你不再需要一个对象时，你必须放弃对对象的持有

  通过向对象发送 release 消息或者 autorelease 消息来放弃所有权。用 Cocoa 的术语说，所谓放弃所有权，就是 release 一个对象。

- 对于你正在使用的对象，不要 release 它

#### 2、引用计数

每个对象都有一个引用计数

-    当新建一个对象时，它的 retain count 为 1;
-    发送 retain 消息给一个对象时，它的 retain count 加 1;
-    发送 release 消息给一个对象时，它的 retain count 减 1;
-    发送 autorelease 消息，它的 retain count 将在未来某个时候减 1;
-    如果 retain count 是 0，就会被 dealloc。

#### 3、弱引用

Retain 一个对象，实际是对一个对象的强引用(strong reference)。一个对象在所有的强引用 都解除之前，是不能被 dealloc 的，这导致一个被称为“循环引用”的问题:两个对象相互强引用 (可能是直接引用，也可能是通过其他对象间接地引用。)

解决的方法就是弱引用：父对象建立对子对象的强引用，而子对象只对父对象建立弱引用。

在 Cocoa 中，弱引用的例子包括(但不限于)Table 表格的数据源、Outline 视图项目(Outline view item)、通知观察者(Notification Observer)和其他的 target 以及 delegate。

对你弱引用的对象发送消息时，需要注意:当你发送消息给一个被 dealloc 的弱引用对象时，你的程序会崩溃。因此，你必须细致地判断对象是否有效。多数情况下，被弱引用的对象是知道其 他对象对它的弱引用的(比如环形持有的情形)，所以需要通知其他对象它自己的 dealloc。举例， 当你向 Notification Center 注册一个对象时，Notification Center 对这个对象是弱引用的，并且在有 消息需要通知到这个对象时，就发送消息给这个对象。当这个对象 dealloc 的时候，你必须向 Notification Center 取消这个对象的注册。这样，这个 Notification Center 就不会再发送消息给这个 不存在的对象了。同样，当一个 delegate 对象被 dealloc 的时候，必须向其他对象发送一个 setDelegate:消息，并传递 nil 参数，从而将代理的关系撤销。这些消息通常在对象的 dealloc 方法 中发出。

### 三、autorelease

[Autorelease Pool](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/MemoryMgmt/Articles/mmAutoreleasePools.html#//apple_ref/doc/uid/20000047-CJBFBEDI)

#### 1、autorelease

当你需要延时 release 方式时，就需要 autorelease 了，特别是当你从方法中返回一个对象的时候。比如，你可以这样来实现 fullName: 方法:

```
   -(NSString *)fullName{
      NSString *string = [[[NSString alloc] initWithFormat:@”%@ %@”,self.firstName, self.lastName] autorelease];
       return string;
    }
```

上例中，你使用 alloc 方法创建了 string，所以你有该对象的所有权，因此你有义务在失去对它的引用前放弃该所有权。但如果你用 release，那么这种所有权的放弃是“即刻的”，立即生效。可是我们却要将这个对象 return，这将造成 return 时对象已经实际失效，方法实际上返回了一个无效的对象。我们采用 autorelease 来声明(译者:注意这里仅仅是一种意愿的表达，而非实际放弃的动作。)我们对所有权的放弃，但是同时允许 fullName: 方法的调用者来使用该对象。

你还可以按下面做法来实现这个方法:

```
   -(NSString *) fullName{
       NSString *string = [NSString stringWithFormat:@”%@ %@”, self.firstName,   self.lastName] ;
       return string;
  }
```

根据我们说的基本规则，你对 stringWithFormat: 所返回的 string 没有所有权(译者:请注意到这里并没有使用 alloc，方法名也不是以 init 开始)。 因此你可以直接返回 string 给方法的调用者。

#### 2、Autorelease Pool

2.1解析

> Autorelease pool blocks provide a mechanism whereby you can relinquish ownership of an object, but avoid the possibility of it being deallocated immediately (such as when you return an object from a method). Typically, you don’t need to create your own autorelease pool blocks, but there are some situations in which either you must or it is beneficial to do so.

Autorelease pool blocks 提供了一种机制：可以在放弃对象所有权的时间延后(当你想要从一个方法中返回对象的时候)，一般来说，你不需要自己去创建自己的Autorelease pool。

Autorelease pool是得到了 autorelease 消息的对象的容器。 在 autorelease pool被 dealloc 的时候，它自己会给容纳的所有对象发送 release 消息。一个对象可以被多次放到同一个 autorelease pool，每一次放入(发送 autorelease消息)都会造成将来收到一次release。

```
   NSAutoreleasePool *pool = [[NSAutoreleasePool alloc] init];
	// Code benefitting from a local autorelease pool.
	[pool release];
   
   @autoreleasepool{
     // Code benefitting from a local autorelease pool.
   }
   
   实际上等同于如下
   {
        void * atautoreleasepoolobj = objc_autoreleasePoolPush();
        // Code benefitting from a local autorelease pool.
        objc_autoreleasePoolPop(atautoreleasepoolobj);
    }
```



2.2、嵌套

Autorelease pool blocks可以嵌套

```
@autoreleasepool {
    // . . .
    @autoreleasepool {
        // . . .
    }
    . . .
}
```

实 际 上 它 们 是 按 照 栈( s t a c k ) 的方式工作的(译者:即类似于后进先出的队列)。当一个新的 autorelease 池创建后，它就位于这 个栈的最顶端。池被dealloc 的时候，就从栈中删除。当对象收到 autorelease 消息时，实际上它会被放到“这个线程”“当时”位于栈的最顶端的那个池中

2.3、自己创建的情况

> Three occasions when you might use your own autorelease pool blocks:
>
> - If you are writing a program that is not based on a UI framework, such as a command-line tool.
>
> - If you write a loop that creates many temporary objects.
>
>   You may use an autorelease pool block inside the loop to dispose of those objects before the next iteration. Using an autorelease pool block in the loop helps to reduce the maximum memory footprint of the application.
>
> - If you spawn a secondary thread.
>
>   You must create your own autorelease pool block as soon as the thread begins executing; otherwise, your application will leak objects. (See [Autorelease Pool Blocks and Threads](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/MemoryMgmt/Articles/mmAutoreleasePools.html#//apple_ref/doc/uid/20000047-1041876) for details.)

下面三种情形下，你却应该使用你自己的 autorelease 池:

1. 如果你写的程序，不是基于 UI Framwork。例如你写的是一个基于命令行的程序。

2. 如果你程序中的一个循环，在循环体中创建了大量的临时对象。

   你可以在循环体内部新建一个 autorelease 池，并在一次循环结束时销毁这些临时对象。这样可以减少你的程序对内存的占用峰值。

3. 如果你发起了一个 secondary 线程(译者:main 线程之外的线程)。这时你“必须”在线程的最初执行代码中创建 autorelease 池，否则你的程序就内存泄露了。(参看“Autorelease 池和线程”)

2.4、autoreleasepool 域

在 autorelease pool已经 dealloc 之后，那些曾经收到 autorelease 消息对象，只能被视为失效，而不要再给他们发消息，或者把他们作为返回值进行返回。如果你必须在 autorelease 之后还要使用某个临时对象，你可以先发一个 retain 消息，然后等到这时的池已经调用了 drain 之后，再发送 autorelease 消息。

```
– (id)findMatchingObject:(id)anObject {
    id match;
    while (match == nil) {
        @autoreleasepool {
 
            /* Do a search that creates a lot of temporary objects. */
            match = [self expensiveSearchForObject:anObject];
 
            if (match != nil) {
                [match retain]; /* Keep match around. */
            }
        }
    }
    return [match autorelease];   /* Let match go and return it. */
}
```

这种情况下，就可以再autoreleasepool外面也调用这个match对象

2.5、autorelease pool和线程、Runloop的关系

> Each thread in a Cocoa application maintains its own stack of autorelease pool blocks. If you are writing a Foundation-only program or if you detach a thread, you need to create your own autorelease pool block.
>
> If your application or thread is long-lived and potentially generates a lot of autoreleased objects, you should use autorelease pool blocks (like AppKit and UIKit do on the main thread); otherwise, autoreleased objects accumulate and your memory footprint grows. If your detached thread does not make Cocoa calls, you do not need to use an autorelease pool block.

每个线程都维护了一个autorelease pool的栈，如果你如果你写的程序仅仅是一个基于 Foundation 的程序，又或者你 detach一个线程你需要新建一个你自己的 autorelease pool。

如果你的程序是一个要长期运行的程序，可能会产生大量的临时对象，这是你必须周期性地销 毁、新建 autorelease pool(UIKit 在主线程中就是这么做的)，否则 autorelease 对象就会累积并吃掉 大量内存。如果你 detached 线程不调用 Cocoa，你就不必新建 autorelease 池。

> The Application Kit creates an autorelease pool on the main thread at the beginning of every cycle of the event loop, and drains it at the end, thereby releasing any autoreleased objects generated while processing an event.
>
> Each thread (including the main thread) maintains its own stack of `NSAutoreleasePool`objects (see [Threads](https://developer.apple.com/documentation/foundation/nsautoreleasepool#1651513?language=objc)). As new pools are created, they get added to the top of the stack. When pools are deallocated, they are removed from the stack. Autoreleased objects are placed into the top autorelease pool for the current thread. When a thread terminates, it automatically drains all of the autorelease pools associated with itself.

主线程的Runloop在每个Event loop开始时就新建一个autorelease pool，并且在结束时drains。这样可以清空每次Event loop产生的对象

每个线程，包括主线程维护了一个自己的堆栈，一但新的pool创建，就被放到栈顶，当pool被销毁，就从栈中移除，Autoreleased对象会被放到当前线程的栈顶的pool里，当一个线程被终止，会自动drain所有与它相关联的pool.
​	