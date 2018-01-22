---
layout:     post
category:   iOS
title:      "监测APP卡顿"
subtitle:   "利用Runloop来监测APP卡顿"
date:       2016-10-06 12:00:00
author:     "Ted"
header-img: "img/bg_02.jpg"
---

### 一、UI更新原理和卡顿原因

![img](/img/Smooth/smooth_03.png)

在 VSync 信号到来后，系统图形服务会通过 CADisplayLink 等机制通知 App，App 主线程开始在 CPU 中计算显示内容，比如视图的创建、布局计算、图片解码、文本绘制等。随后 CPU 会将计算好的内容提交到 GPU 去，由 GPU 进行变换、合成、渲染。随后 GPU 会把渲染结果提交到帧缓冲区去，等待下一次 VSync 信号到来时显示到屏幕上。由于垂直同步的机制，如果在一个 VSync 时间内，CPU 或者 GPU 没有完成内容提交，则那一帧就会被丢弃，等待下一次机会再显示，而这时显示屏会保留之前的内容不变。这就是界面卡顿的原因。

所以，卡顿造成的原因分为CPU卡顿和GPU卡顿，CPU卡顿可以用CADisplayLink来检测，UI更新卡顿可以用Runloop的mode来检测

- 监测卡顿：开一个子线程，利用displaylink或者Runloop来监测卡顿；

- 收集堆栈：将卡顿时的堆栈收集起来；

- 上传记录：将卡顿上传到后台或自定义；

  这里我引用一张微信开发团队的监测流程图：

  ![img](/img/Smooth/smooth_01.png)

### 二、Runloop检测卡顿

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

### 四、DisplayLink检测卡顿

一但 CADisplayLink 以特定的模式注册到runloop之后，每当屏幕需要刷新的时候，runloop就会调用CADisplayLink绑定的target上的selector，这时target可以读到 CADisplayLink 的每次调用的时间戳，用来准备下一帧显示需要的数据。所以通过比较dispalylink的更新时间就可以知道是否存在卡顿

```
- (void)updateTime{
    if (!_last_time) {
        _last_time = self.displayLink.timestamp;
        return;
    }
    _count ++;
    CFTimeInterval current = self.displayLink.timestamp;
    CFTimeInterval period = current - _last_time;
    if (period > 1 ) {
        NSLog(@"FPS:%@",@(_count));
        _count = 0;
        _last_time = self.displayLink.timestamp;
    }
    
}

- (CADisplayLink *)displayLink{
    if (!_displayLink) {
        _displayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(updateTime)];
        [_displayLink addToRunLoop:[NSRunLoop currentRunLoop] forMode:NSRunLoopCommonModes];
    }
    return _displayLink;
}
```

### 五、上传记录

1、频率以及流量：是否所有的用户都要做统计？上传的频率？文件压缩以减少流量？这些问题都要根据实际情况作好准备。

2、上传位置，一种是自己建立后台来统计这些卡顿，嫌麻烦的话是利用第三方平台、如友盟（统计崩溃比较多）、听云、OneApm、博睿，都大同小异。

### 六、代码

上面的代码可以在[smoothMonitor](https://github.com/helloted/smoothMonitor) 下载