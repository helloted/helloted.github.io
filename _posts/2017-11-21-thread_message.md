---
layout:     post
title:      "iOS开发中的进程/线程间通信"
subtitle:   "iOS开发中的进程/线程间通信以及代码示例"
date:       2017-11-21 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 一、线程间通信

因为线程是共享内存空间的，所以线程间通信相比于进程间通信会简单一些，线程间通信的体现

- 1个线程传递数据给另1个线程
- 在1个线程中执行完特定任务后，转到另1个线程继续执行任务

 在iOS多线程开发中，有NSObject、NSThread、GCD、NSOpeartion几种方式，对应的线程间通信也有几种

#### 1、NSObject

```
/*
 *  回到主线程执行，执行self的showImage方法，参数是image
 */
[self performSelectorOnMainThread:@selector(showImage:) withObject:image waitUntilDone:YES];

// waitUntilDone的含义:
//    如果传入的是YES: 那么会等到主线程中的方法执行完毕, 才会继续执行下面其他行的代码
//    如果传入的是NO: 那么不用等到主线程中的方法执行完毕, 就可以继续执行下面其他行的低吗
```

```
/*
 *  去xx线程执行aSelector方法，参数是arg
 */
- (void)performSelector:(SEL)aSelector onThread:(NSThread *)thr withObject:(id)arg waitUntilDone:(BOOL)wait;
```

#### 2、GCD

```
dispatch_async(queue, ^{
		# do something
		
		
        dispatch_sync(dispatch_get_main_queue(), ^{
			#回到主线程
        });
    });
```

#### 3、NSOperation

```
NSOperationQueue *queue = [[NSOperationQueue alloc] init];

    // 2.添加任务(操作)
    [queue addOperationWithBlock:^{
		
		# 回到主线程
        [[NSOperationQueue mainQueue] addOperationWithBlock:^{
            self.imageView.image = image;
        }];
    }];
```

### 二、进程间通信/APP间通信

进程是容纳运行一个程序所需要所有信息的容器。在iOS中每个APP里就一个进程，所以进程间的通信实际上是APP之间的通信。iOS是封闭的系统，每个APP都只能访问各自沙盒里的内容

1、URL Scheme