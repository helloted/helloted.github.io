---
layout:     post
title:      "GCD之dispatch_semaphore"
subtitle:   "dispatch_semaphore信号控制可以达到线程锁的目的"
date:       2016-09-20 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 几个函数的意义

信号创建，其中value是初始信号值

````
dispatch_semaphore_create(long value) 
````

 信号等待函数，dsema是信号，timeout是等待时间点，在等待时间点内，只有信号dsema的信号值大于等于1才放行，继续往下执行；放行之后信号值减1；

````
dispatch_semaphore_wait(dispatch_semaphore_t dsema, dispatch_time_t timeout); 
````

增加信号值，每使用一次对应的dsema的信号值就加1

````objective-c
dispatch_semaphore_signal(dispatch_semaphore_t dsema);
````

### 实际例子

1、普通，可以看出异步执行

````
- (void)normalTest{
    dispatch_queue_t queue = dispatch_get_global_queue(0, 0); 
    NSMutableArray *array = [NSMutableArray array];  
    for (int index = 0; index < 5; index++) {      
        dispatch_async(queue, ^(){     
            [array addObject:[NSNumber numberWithInt:index]];          
            int value = arc4random() % 100;           
            float sleep = value / 100.00;           
            [NSThread sleepForTimeInterval:sleep];            
            NSLog(@"add index :%d",index);
        });        
    }
}
````

![](/img/semaphore/semaphore_01.png)

2、加了semaphore之后，变成同步执行

````
- (void)semaphoreTest{
    dispatch_queue_t queue = dispatch_get_global_queue(0, 0);   
    dispatch_semaphore_t semaphore = dispatch_semaphore_create(1);
    NSMutableArray *array = [NSMutableArray array];
    for (int index = 0; index < 5; index++) {       
        dispatch_async(queue, ^(){
            dispatch_time_t waitTime = dispatch_time(DISPATCH_TIME_NOW,5 * NSEC_PER_SEC);//有效时间
            dispatch_semaphore_wait(semaphore, waitTime);//这个函数本身就是一个判断函数，只有这个函数通过(有信号)，才会继续往下执行       
            [array addObject:[NSNumber numberWithInt:index]];
            int value = arc4random() % 100;
            float sleep = value / 100.00;
            [NSThread sleepForTimeInterval:sleep];
            NSLog(@"add index :%d",index);           
            dispatch_semaphore_signal(semaphore);
        });        
    }
}
````

![](/img/semaphore/semaphore_01.png)

### demo位置

以上代码都放在[dispatch_semaphore demo](https://github.com/helloted/dispatch_semaphore) 


