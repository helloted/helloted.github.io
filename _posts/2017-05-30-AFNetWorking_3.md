---
layout:     post
title:      "AFNetworking源码分析(三)"
subtitle:   "AFNetworkReachabilityManager网络监听"
date:       2017-05-26 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 五、AFNetworkReachabilityManager

#### （一）文档翻译

> /**
>
>  `AFNetworkReachabilityManager` monitors the reachability of domains, and addresses for both WWAN and WiFi network interfaces.
>
>  Reachability can be used to determine background information about why a network operation failed, or to trigger a network operation retrying when a connection is established. It should not be used to prevent a user from initiating a network request, as it's possible that an initial request may be required to establish reachability.
>
>  See Apple's Reachability Sample Code ( https://developer.apple.com/library/ios/samplecode/reachability/ )
>
>  @warning Instances of `AFNetworkReachabilityManager` must be started with `-startMonitoring` before reachability status can be determined.
>
>  */

 `AFNetworkReachabilityManager`用于监测domains和addresses的可达性，包括WWAN和WiFi

Reachability模块可以用来监测一个网络活动失败的背景原因，或者当一个连接建立之后，去触发重复请求，它不应该被用来阻止用户初始化一个网络请求，但是初始化一个网络请求需要建立可达性。

 `AFNetworkReachabilityManager`的实例必须启用`-startMonitoring`才能开始监听状态

#### （二）状态

```
typedef NS_ENUM(NSInteger, AFNetworkReachabilityStatus) {
    AFNetworkReachabilityStatusUnknown          = -1,  //未知状态
    AFNetworkReachabilityStatusNotReachable     = 0,   //不可到达状态
    AFNetworkReachabilityStatusReachableViaWWAN = 1,   //蜂窝网络状态
    AFNetworkReachabilityStatusReachableViaWiFi = 2,  //Wifi网络状态
};
```

可以检测出总共四种状态：未知状态、不可到达状态、蜂窝网络(2G,3G,4G)状态、Wifi网络状态

#### （三）使用方式

```
    AFNetworkReachabilityManager *manager = [AFNetworkReachabilityManager sharedManager];
    [manager setReachabilityStatusChangeBlock:^(AFNetworkReachabilityStatus status) {
		NSLog(@"current--%@",[manager localizedNetworkReachabilityStatusString]);
	}];
    [manager startMonitoring];
```

#### （四）初始化

有四种类型的初始化方式

```
Creates and returns a network reachability manager with the default socket address.
 // 监控一个默认的地址
+ (instancetype)manager;


 Creates and returns a network reachability manager for the specified domain.
  // 监控一个默认的地址
+ (instancetype)managerForDomain:(NSString *)domain;

/**
 Creates and returns a network reachability manager for the socket address.
 // 监测指定的地址
+ (instancetype)managerForAddress:(const void *)address;

/**
 Initializes an instance of a network reachability manager from the specified reachability object.
- (instancetype)initWithReachability:(SCNetworkReachabilityRef)reachability；
```

下面是其中一种方法的实现

```
+ (instancetype)managerForDomain:(NSString *)domain {
    SCNetworkReachabilityRef reachability = SCNetworkReachabilityCreateWithName(kCFAllocatorDefault, [domain UTF8String]);
    AFNetworkReachabilityManager *manager = [[self alloc] initWithReachability:reachability];  
    CFRelease(reachability);
    return manager;
}

```

可以发现，最终都是要得到`SCNetworkReachabilityRef`这个东西，这是何许东西？

> ​	@discussion The SCNetworkReachability API allows an application to
>
> ​		determine the status of a system's current network
>
> ​		configuration and the reachability of a target host.
>
> ​		In addition, reachability can be monitored with notifications
>
> ​		that are sent when the status has changed.
>
> ​		"Reachability" reflects whether a data packet, sent by
>
> ​		an application into the network stack, can leave the local
>
> ​		computer.

SCNetworkReachability可以监测APP的当前网络状态，对于目标host的可达性，当状态发送改变时，reachability可以监测到这个通知。

"Reachability"反应的是，一个数据包是否会离开本机，并不能确保可以被主机收到

#### （五）开启监控

![img](/img/AFNetworking/09.png)

里面有两个技术细节：

1、在Block外面调用`__weak __typeof(self)weakSelf = self;`，目的是防止循环引用，在Block内部调用`__strong __typeof(weakSelf)strongSelf = weakSelf;`，目的是为了防止weakself被提前释放

2、将整个监测放到异步线程，将优先级设为最低，并且开启了Runloop模式，目的是为了一直监测