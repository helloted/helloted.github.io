---
layout:     post
category:   iOS
title:      "源码分析之SDWebImage(二)"
subtitle:   "对iOS常用第三方SDwebImage的源码解析"
date:       2016-06-29 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

SDWebImage是iOS开发者最常用的第三方框架之一，用于异步下载网络图片，缓存图片，[Github源码地址](https://github.com/rs/SDWebImage)

### 三、核心架构

![](/img/SDWebImage/00.png)

### 四、缓存策略

#### 1、SDImageCacheConfig

这是默认的缓存策略，清理缓存的规则分两步进行。 第一步先清除掉过期的缓存文件。 如果清除掉过期的缓存之后，空间还不够。 那么就继续按文件时间从早到晚排序，先清除最早的缓存文件，直到剩余空间达到要求。

```
static const NSInteger kDefaultCacheMaxCacheAge = 60 * 60 * 24 * 7; // 1 week

@implementation SDImageCacheConfig

- (instancetype)init {
    if (self = [super init]) {
        _shouldDecompressImages = YES; 
        _shouldDisableiCloud = YES; //不存储到iCloud
        _shouldCacheImagesInMemory = YES; //是否应该要缓存到Memroy
        _maxCacheAge = kDefaultCacheMaxCacheAge;  //清理硬盘缓存时默认时间
        _maxCacheSize = 0; //清理硬盘缓存
    }
    return self;
}

@end
```

```

/**
 * The maximum "total cost" of the in-memory image cache. The cost function is the number of pixels held in memory.
 */
@property (assign, nonatomic) NSUInteger maxMemoryCost;

/**
 * The maximum number of objects the cache should hold.
 */
@property (assign, nonatomic) NSUInteger maxMemoryCountLimit;
```

设置最大内存消耗和最多数量的限制

#### 2、清理Memory缓存

```
@interface AutoPurgeCache : NSCache
@end

@implementation AutoPurgeCache

- (nonnull instancetype)init {
    self = [super init];
    if (self) {
#if SD_UIKIT
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(removeAllObjects) name:UIApplicationDidReceiveMemoryWarningNotification object:nil];
#endif
    }
    return self;
}

- (void)dealloc {
#if SD_UIKIT
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationDidReceiveMemoryWarningNotification object:nil];
#endif
}

@end
```

可以看到，内存缓存类AutoPurgeCache里有一个接收系统通知，如有内存报警，会移除全部

#### 3、清理Disk缓存

当 App 进入关闭或进入后台时,清理磁盘缓存

```
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(clearMemory)                                                    name:UIApplicationDidReceiveMemoryWarningNotification
                                                   object:nil];

        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(deleteOldFiles)                                                     name:UIApplicationWillTerminateNotification
                                                   object:nil];

        [[NSNotificationCenter defaultCenter] addObserver:self                                                selector:@selector(backgroundDeleteOldFiles)                                                    name:UIApplicationDidEnterBackgroundNotification
                                                   object:nil];
```



### 四、相关技术

1. 判断当前图片类型：只判断图片二进制数据的第一个字节
2. 默认的缓存周期：1周
3. 缓存策略：默认情况下既做内存缓存又做磁盘缓存，下载图片前先检查内存缓存，再检查磁盘缓存
4. 缓存的实现方式：采用了苹果推出的专门用来处理缓存的类NSCache
5. 框架内部允许的最大并发数：6
6. 对系统内存警告的处理方式：框架内部监听系统内存警告的通知，当发生后移除内存缓存中的所有对象
7. 下载队列中对多个图片任务的处理方式：提供了FIFO和LIFO两种方式，默认为FIFO
8. 如何下载图片：采用NSURLConnection发送网络请求，在其代理方法中接收数据并处理进度回调等工作
9. 请求超时的设定：15秒
10. 磁盘缓存图片的命名：以该图片的URL进行MD5散列加密
11. 缓存路径：~/Library/Caches/default/com.hackemist.SDWebImageCache.default
12. key—–>URL(如何优化):用黑名单(当一个URL请求失败后,会被添加到黑名单,可以有效的防止一个错误的URL被多次尝试下载)
13. 写文件到硬盘在单独 NSInvocationOperation 中完成，避免拖慢主线程。
14. 如果是在iOS上运行，SDImageCache 在初始化的时候会注册notification 到 UIApplicationDidReceiveMemoryWarningNotification 以及  UIApplicationWillTerminateNotification,在内存警告的时候清理内存图片缓存，应用结束的时候清理过期图片。