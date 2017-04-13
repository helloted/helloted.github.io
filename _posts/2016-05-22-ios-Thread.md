---
layout:     post
title:      "iOS之多线程"
subtitle:   "三种多线程NSThread、GCD、NSOperation"
date:       2016-05-22 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 一、前言

- Pthreads
- NSThread
- GCD
- NSOperation & NSOperationQueue

1. 开发者只需要定义想要执行的任务并追加到适当的Dispatch Queue中，GCD就能生成必要的线程并计划执行任务。由于线程管理是作为系统的一部分来实现的，因此可以统一管理，也可执行任务
2. 多线程问题：多个线程更新相同的资源会导致数据的不一致（数据竞争）、停止等待事件的线程会导致多个线程相互持续等待（死锁）、使用太多线程会消耗大量的内存

3. 应用程序在启动时，最先执行主线程，如果在主线程中进行长时间的处理，会妨碍主线程中被称为RunLoop的主循环的执行，从而导致不能更新用户界面、应用程序的画面长时间停滞等问题

#### 二、Pthreads

POSIX线程（POSIX threads），简称Pthreads，是线程的POSIX标准。该标准定义了创建和操纵线程的一整套API。在类Unix操作系统（Unix、Linux、Mac OS X等）中，都使用Pthreads作为操作系统的线程,这是一套在很多操作系统上都通用的多线程API，所以移植性很强（然并卵），当然在 iOS 中也是可以的。不过这是基于 c语言的框架；

```objective-c
- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event {
    pthread_t thread;
    //创建一个线程并自动执行
    pthread_create(&thread, NULL, start, NULL);
}
void *start(void *data) {
    NSLog(@"%@", [NSThread currentThread]);
    return NULL;
}
```

### 三、NSThread

```
//取消线程
- (void)cancel;

//启动线程
- (void)start;

//判断某个线程的状态的属性
@property (readonly, getter=isExecuting) BOOL executing;
@property (readonly, getter=isFinished) BOOL finished;
@property (readonly, getter=isCancelled) BOOL cancelled;

//设置和获取线程名字
-(void)setName:(NSString *)n;
-(NSString *)name;

//获取当前线程信息
+ (NSThread *)currentThread;

//获取主线程信息
+ (NSThread *)mainThread;

//使当前线程暂停一段时间，或者暂停到某个时刻
+ (void)sleepForTimeInterval:(NSTimeInterval)time;
+ (void)sleepUntilDate:(NSDate *)date;
```

### 四、添加任务到队列（同步、异步）：

#### dispatch_sync:

同步添加，将指定的任务block同步追加到queue中，在追加的block结束之前，dispatch_sync会一直等待；

如果在主线程上执行同步任务（任务也在主线程执行），会造成死锁：

```objective-c
//会造成死锁
dispatch_sync(dispatch_get_main_queue(), ^{
	//
});
```

但是在异步任务里可以用来切换到主线程

```objective-c
dispatch_async(dispatch_get_global_queue(0,0), ^{
	//耗时操作；
	dispatch_sync(dispatch_get_main_queue(), ^{
		//回到主线程；
	});
});
```

可以用来阻塞线程：

```objective-c
dispatch_sync(dispatch_get_global_queue(0,0), ^{
  sleep(2);
  NSLog(@"2秒后执行，但是会阻塞线程");
});
```

```objective-c
dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
   NSLog(@"2秒后执行，但是不阻塞线程");
});
```

#### dispatch_async：

异步添加，将指定的Block"非同步"地追加到指定的Queue中，该线程不做等待，继续往下执行；

#### dispatch_barrier_sync:

```objective-c
用于数据库和文件访问解决资源竞争问题
dispatch_async(queue, ^{NSLog(@"read");});
dispatch_async(queue, ^{NSLog(@"read");});
dispatch_async(queue, ^{NSLog(@"read");});
dispatch_barrier_sync(queue, ^{NSLog(@"writing");});
dispatch_async(queue, ^{NSLog(@"read");});
```

### 五、队列

Dispatch Queue：执行处理任务的队列，通过dispatch_async等函数API，在Block语法中记述想要执行的处理任务并将其追加到Dispatch Queue中，Dispatch Queue按照追加的顺序（先进先出FIFO）执行处理。

#### Serial Dispatch Queue（串行队列）：

等待现在执行中处理结束，一旦生成Serial Dispatch Queue并追加处理。系统对于一个Serial Dispatch Queue就只生成并使用一个线程，但是如果生成过多的线程，会导致消耗大量的内存，引起大量的上下文切换，大幅度降低系统的响应性能，因此只在为了避免多个线程更新相同的资源导致数据竞争时使用。

#### Concurrent Dispatch Queue（并行队列）：

 不等待现在执行中处理结束，可以并行执行多个处理，并行处理的处理数量取决于当前系统状态，生成所需的线程执行处理，当处理结束，应当执行的处理数减少时，XNU内核会结束不再需要的线程，因此当想并行执行不发生数据竞争等问题处理时使用并行队列，有效管理线程，不会出现太多线程。

系统默认有一个串行队列：主队列（main_queue）和并行队列：全局队列（global_queue），不需要自己手动释放，或者自己创建用户队列（需要手动释放）。

#### 主队列（main）:

dispatch_queue_t mainQ = dispatch_get_main_queue()
注意：不能sync向主队列提交任务，因为会造成死锁，只能async提交任务

#### 全局队列（global_queue）：

有执行优先级

``` objective-c
dispatch_queue_t globalQ = dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0)

DISPATCH_QUEUE_PRIORITY_HIGH:             //优先级最高，在default,和low之前执行
DISPATCH_QUEUE_PRIORITY_DEFAULT           //默认优先级，在low之前，在high之后
DISPATCH_QUEUE_PRIORITY_LOW               //在high和default后执行
DISPATCH_QUEUE_PRIORITY_BACKGROUND        //提交到这个队列的任务会在high优先级的任务和已经提交到background队列的执行完后执行。
```
#### 创建队列：（create_queue）:

尽管是ARC，使用结束后也要dispatch_release释放

```objective-c
dispatch_queue_t  concurrentQ = dispatch_queue_create("createName",DISPATCH_QUEUE_CONCURRENT)
dispatch_queue_t  serialQ = dispatch_queue_create("createName", DISPATCH_QUEUE_SERIAL)
改变队列优先级
dispatch_set_target_queue(restQueue, targetQueue);
```
### 六、延迟添加执行dispatch_after

并不是在多少秒后执行，而是在3秒后将任务添加到Dispatch Queue中

```objective-c
dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(3*NSEC_PER_SEC)),dispatch_get_main_queue(), ^{
	//秒
});

dispatch_after(dispatch_time(DISPATCH_TIME_NOW,150ull *NSEC_PER_MSEC),dispatch_get_main_queue(), ^{
    //毫秒
});
```

### 七、NSOperation

1、NSoperation是基于GCD封装的

```
dispatch_async(_Queue, ^{    //请求数据  NSData *data = [NSData dataWithContentURL:[NSURL URLWithString:@"http://domain.com/a.png"]];    dispatch_async(dispatch_get_main_queue(), ^{         [self refreshViews:data];    });});
```

有个致命的问题：这个任务是无法取消的 dataWithContentURL:是同步的拉取数据，它会一直阻塞线程直到完成请求，如果是遇到了超时的情况，它在这个时间内会一直占有这个线程；在这个期间并发队列就需要为其他任务新建线程，这样可能导致性能下降等问题。

2、NSOperationQueue相对于GCD来说有以下优点：

- 提供了在 GCD 中不那么容易复制的有用特性。
- 可以很方便的取消一个NSOperation的执行
- 可以更容易的添加任务的依赖关系
- 提供了任务的状态：isExecuteing, isFinished.

NSOperationQueue 有两种不同类型的队列：主队列和自定义队列。主队列运行在主线程之上，而自定义队列在后台执行。在两种类型中，这些队列所处理的任务都使用 NSOperation 的子类来表述。

我们可以通过设置 maxConcurrentOperationCount 属性来控制并发任务的数量，当设置为 1 时， 那么它就是一个串行队列。主对列默认是串行队列，这一点和 dispatch_queue_t 是相似的。

3、NSOperation

你可以使用系统提供的一些现成的 NSOperation 的子类， 如 NSBlockOperation、 NSInvocationOperation 等（如上例子）。你也可以实现自己的子类， 通过重写 main 或者 start 方法 来定义自己的 operations 。

A:使用 main 方法非常简单，开发者不需要管理一些状态属性（例如 isExecuting 和 isFinished），当 main 方法返回的时候，这个 operation 就结束了。这种方式使用起来非常简单，但是灵活性相对重写 start 来说要少一些， 因为main方法执行完就认为operation结束了，所以一般可以用来执行同步任务。

B:如果你希望拥有更多的控制权，或者想在一个操作中可以执行异步任务，那么就重写 start 方法, 但是注意：这种情况下，你必须手动管理操作的状态， 只有当发送 isFinished 的 KVO 消息时，才认为是 operation 结束

当实现了start方法时，默认会执行start方法，而不执行main方法

为了让操作队列能够捕获到操作的改变，需要将状态的属性以配合 KVO 的方式进行实现。如果你不使用它们默认的 setter 来进行设置的话，你就需要在合适的时候发送合适的 KVO 消息。

需要手动管理的状态有：

- isExecuting 代表任务正在执行中
- isFinished 代表任务已经执行完成
- isCancelled 代表任务已经取消执行