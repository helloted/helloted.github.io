---
layout:     post
title:      "监测APP卡顿"
subtitle:   "利用Runloop来监测APP卡顿"
date:       2016-10-06 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

### 一、简介

我们说的卡顿，一般指操作某个功能时，UI界面无及时反应，这种卡顿日常测试一般难以追踪以及重现，所以除了工程师开发测试的时候发现卡顿，还有一个重要的渠道就是从用户实际体验来监测卡顿，但是我们又不能拿到用户的手机或者让用户来回馈问题，所以一个完整的监测体系就很有必要了。

- 监测卡顿：开一个子线程，利用Runloop来监测卡顿；

- 收集堆栈：将卡顿时的堆栈收集起来；

- 上传记录：将卡顿上传到后台或自定义；

  这里我引用一张微信开发团队的监测流程图：

  ![img](/img/Smooth/smooth_01.png)

### 二、监测卡顿

首先我们来看一个Runloop的运行方式，如下

```objective-c
int32_t __CFRunLoopRun()
{
    // 通知即将进入runloop
  	//创建AutoreleasePool: _objc_autoreleasePoolPush();
    __CFRunLoopDoObservers(KCFRunLoopEntry);
    
    do
    {
        // 通知将要处理timer和source
        __CFRunLoopDoObservers(kCFRunLoopBeforeTimers);
        __CFRunLoopDoObservers(kCFRunLoopBeforeSources);
        
        // 处理非延迟的主线程调用
        __CFRunLoopDoBlocks();
        // 处理UIEvent事件
        __CFRunLoopDoSource0();
        
        // GCD dispatch main queue
        CheckIfExistMessagesInMainDispatchQueue();
        
        // 即将进入休眠
      	//释放并新建AutoreleasePool: _objc_autoreleasePoolPop(); _objc_autoreleasePoolPush();
        __CFRunLoopDoObservers(kCFRunLoopBeforeWaiting);
        
        // 等待内核mach_msg事件
        mach_port_t wakeUpPort = SleepAndWaitForWakingUpPorts();
        
        // Zzz...
        
        // 从等待中醒来
        __CFRunLoopDoObservers(kCFRunLoopAfterWaiting);
                
        if (wakeUpPort == timerPort){// 处理因timer的唤醒
          __CFRunLoopDoTimers();
        }else if (wakeUpPort == mainDispatchQueuePort){// 处理异步方法唤醒,如dispatch_async
          __CFRUNLOOP_IS_SERVICING_THE_MAIN_DISPATCH_QUEUE__()
        } else{// UI刷新,动画显示
          __CFRunLoopDoSource1();
        }   
        // 再次确保是否有同步的方法需要调用
        __CFRunLoopDoBlocks();
        
    } while (!stop && !timeout);
    
    // 通知即将退出runloop
  	//释放AutoreleasePool: _objc_autoreleasePoolPop();
    __CFRunLoopDoObservers(CFRunLoopExit);
}
```

UI更新一般<font color="gray">kCFRunLoopBeforeSources</font>和<font color="gray">kCFRunLoopBeforeWaiting</font>之间，所以我们监测他们之间的时间段就能知道UI是否卡顿了

````
- (void)startMoniter{
	//添加监听
    CFRunLoopObserverContext context = {0,(__bridge void*)self,NULL,NULL};
    _observer = CFRunLoopObserverCreate(kCFAllocatorDefault,
                                        kCFRunLoopAllActivities,
                                        YES,
                                        0,
                                        &runLoopObserverCallBack,
                                        &context);
    CFRunLoopAddObserver(CFRunLoopGetMain(), _observer, kCFRunLoopCommonModes);
    
    // 创建信号
    _semaphore = dispatch_semaphore_create(0);
    
    // 在子线程监控时长
    dispatch_async(dispatch_get_global_queue(0, 0), ^{
        while (YES)
        {
            NSLog(@"smooth--monitering");
            //100ms则将堆栈记录下来
            long st = dispatch_semaphore_wait(_semaphore, dispatch_time(DISPATCH_TIME_NOW, 100*NSEC_PER_MSEC));
            if (st != 0)
            {
                if (_activity==kCFRunLoopBeforeSources || _activity==kCFRunLoopAfterWaiting)
                {
                    [self logStack];
                }
            }
        }
    });
}

static void runLoopObserverCallBack(CFRunLoopObserverRef observer, CFRunLoopActivity activity, void *info)
{
    SmoothMoniter *instrance = [SmoothMoniter sharedInstance];
    instrance.activity = activity;
    dispatch_semaphore_t semaphore = instrance.semaphore;
    dispatch_semaphore_signal(semaphore);
}
````

### 三、收集堆栈

收集堆栈信息以用来分析卡顿引起的代码

```
#import <libkern/OSAtomic.h>
#import <execinfo.h>
```

```
- (void)logStack{
    void* callstack[128];
    int frames = backtrace(callstack, 128);
    char **strs = backtrace_symbols(callstack, frames);
    int i;
    NSMutableArray *backtrace = [NSMutableArray arrayWithCapacity:frames];
    for ( i = 0 ; i < frames ; i++ ){
        [backtrace addObject:[NSString stringWithUTF8String:strs[i]]];
    }
    free(strs);
}
```

可以得到类似于下方的堆栈记录

![img](/img/Smooth/smooth_02.png)

### 四、上传记录

1、频率以及流量：是否所有的用户都要做统计？上传的频率？文件压缩以减少流量？这些问题都要根据实际情况作好准备。

2、上传位置，一种是自己建立后台来统计这些卡顿，嫌麻烦的话是利用第三方平台、如友盟（统计崩溃比较多）、听云、OneApm、博睿，都大同小异。

### 五、代码

上面的代码可以在[smoothMonitor](https://github.com/helloted/smoothMonitor) 下载