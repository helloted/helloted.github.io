---
layout:     post
title:      "源码分析之SDWebImage(一)"
subtitle:   "对iOS常用第三方SDwebImage的源码解析"
date:       2016-06-29 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

SDWebImage是iOS开发者最常用的第三方框架之一，用于异步下载网络图片，缓存图片，[Github源码地址](https://github.com/rs/SDWebImage)

### 一、架构

![](/img/SDWebImage/01.png)

1. sd_setImageWithURL：UIimageView/UIButton根据URL设置网络图片
2. sd_internalSetImageWithURL：统一为UIView根据URL设置网络图片
3. loadImageWithURL：加载图片
4. queryDiskCacheForKey：根据URL转成的key从缓存或者硬盘存储中搜寻图片
5. disk result：如果有结果，则返回搜寻结果
6. downloadImage：如果搜寻没有结果，则开始从网络下载图片
7. network result：返回网络下载结果
8. storeImage：存储下载图片
9. image：网络下载的图片
10. set Image：设置图片

### 二、解析

#### 1、sd_setImageWithURL：

![](/img/SDWebImage/02.png)

UIButton和UIImageView都有WebCache的Category用来设置网络图片，以UIimageView为例，从简单到复杂分别有以下几种设置图片的方式

![](/img/SDWebImage/03.png)

最终下载方式都归为一类

````objective-c
sd_setImageWithURL:(nullable NSURL *)url
          placeholderImage:(nullable UIImage *)placeholder
                   options:(SDWebImageOptions)options
                  progress:(nullable SDWebImageDownloaderProgressBlock)progressBlock
                 completed:(nullable SDExternalCompletionBlock)completedBlock
````

- url：网络图片的URL
- Placehoder：占位图片
- options：下载选项，是一个枚举类型
- progressBlock：下载进度block
- completedBlock：完成下载后的block

##### options

```objective-c
typedef NS_OPTIONS(NSUInteger, SDWebImageOptions) {
    SDWebImageRetryFailed = 1 << 0,
    SDWebImageLowPriority = 1 << 1,
    SDWebImageCacheMemoryOnly = 1 << 2,
    SDWebImageProgressiveDownload = 1 << 3,
    SDWebImageRefreshCached = 1 << 4,
    SDWebImageContinueInBackground = 1 << 5,
    SDWebImageHandleCookies = 1 << 6,
    SDWebImageAllowInvalidSSLCertificates = 1 << 7,
    SDWebImageHighPriority = 1 << 8,
    SDWebImageDelayPlaceholder = 1 << 9,
    SDWebImageTransformAnimatedImage = 1 << 10,
    SDWebImageAvoidAutoSetImage = 1 << 11
};
```

- SDWebImageRetryFailed = 1 << 0,:默认情况下,如果一个url在下载的时候失败了,那么这个url会被加入黑名单并且library不会尝试再次下载,这个flag会阻止library把失败的url加入黑名单(简单来说如果选择了这个flag,那么即使某个url下载失败了,sdwebimage还是会尝试再次下载他
- SDWebImageLowPriority = 1 << 1,:默认情况下,图片会在交互发生的时候下载(例如你滑动tableview的时候),这个flag会禁止这个特性,导致的结果就是在scrollview减速的时候,才会开始下载(也就是你滑动的时候scrollview不下载,你手从屏幕上移走,scrollview开始减速的时候才会开始下载图片

- SDWebImageCacheMemoryOnly = 1 << 2,:这个flag禁止磁盘缓存,只有内存缓存

- SDWebImageProgressiveDownload = 1 << 3,:这个flag会在图片下载的时候就显示(就像你用浏览器浏览网页的时候那种图片下载,一截一截的显示(待确认))

- SDWebImageRefreshCached = 1 << 4,:一个图片缓存了,还是会重新请求.并且缓存侧略依据NSURLCache而不是SDWebImage.URL不变,图片会更新时使用

- SDWebImageContinueInBackground = 1 << 5,:启动后台下载,加入你进入一个页面,有一张图片正在下载这时候你让app进入后台,图片还是会继续下载(这个估计要开backgroundfetch才有用)

- SDWebImageHandleCookies = 1 << 6,:可以控制存在NSHTTPCookieStore的cookies.

- SDWebImageAllowInvalidSSLCertificates = 1 << 7,:允许不安全的SSL证书,在正式环境中慎用

- SDWebImageHighPriority = 1 << 8,:默认情况下,image在装载的时候是按照他们在队列中的顺序装载的(就是先进先出).这个flag会把他们移动到队列的前端,并且立刻装载,而不是等到当前队列装载的时候再装载.

- SDWebImageDelayPlaceholder = 1 << 9,:默认情况下,占位图会在图片下载的时候显示.这个flag开启会延迟占位图显示的时间,等到图片下载完成之后才会显示占位图.

- SDWebImageTransformAnimatedImage = 1 << 10,:是否transform图片
- SDWebImageAvoidAutoSetImage = 1 << 11:默认是下载完后自动赋值图片，如果设置这个选项，则禁止此操作

#### 2、sd_internalSetImageWithURL：

在这里，将UIButton和UIImageView的下载统一为UIView的WebCache Category

![](/img/SDWebImage/04.png)

其中

##### dispatch_main_async_safe

```objective-c
#define dispatch_main_async_safe(block)\
    if (strcmp(dispatch_queue_get_label(DISPATCH_CURRENT_QUEUE_LABEL), dispatch_queue_get_label(dispatch_get_main_queue())) == 0) {\
        block();\
    } else {\
        dispatch_async(dispatch_get_main_queue(), block);\
    }
```

如果当前线程已经是主线程了，那么在调用dispatch_async(dispatch_get_main_queue(), block)有可能会出现crash

如果当前线程是主线程，直接调用，如果不是，调用dispatch_async(dispatch_get_main_queue(), block)

#### 3、loadImageWithURL：加载图片

![](/img/SDWebImage/05.png)

#### 4、queryDiskCacheForKey：从缓存中或硬盘中查找图片：

![](/img/SDWebImage/06.png)

#### 5、disk result：如果有结果，则返回搜寻结果，否则去下载

![](/img/SDWebImage/07.png)

#### 6、downloadImage：从网络下载图片

![](/img/SDWebImage/08.png)

#### 7、network result：网络结果处理

![](/img/SDWebImage/09.png)

#### 8、storeImage：存储下载图片

![](/img/SDWebImage/10.png)

