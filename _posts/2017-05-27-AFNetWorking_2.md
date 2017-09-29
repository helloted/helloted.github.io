---
layout:     post
title:      "AFNetworking源码分析(二)"
subtitle:   "AFHTTPSessionManager与AFURLSessionManager"
date:       2017-05-26 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 三、AFHTTPSessionManager

>  `AFHTTPSessionManager` is a subclass of `AFURLSessionManager` with convenience methods for making HTTP requests. When a `baseURL` is provided, requests made with the `GET` / `POST` / et al. convenience methods can be made with relative paths.
>
>  ## Subclassing Notes
>
>  Developers targeting iOS 7 or Mac OS X 10.9 or later that deal extensively with a web service are encouraged to subclass `AFHTTPSessionManager`, providing a class method that returns a shared singleton object on which authentication and other configuration can be shared across the application.
>
>  For developers targeting iOS 6 or Mac OS X 10.8 or earlier, `AFHTTPRequestOperationManager` may be used to similar effect.

文档翻译：

AFHTTPSessionManager继承自AFURLSessionManager，提供了便捷的方法用于HTTP请求，当一个baseURL，根据相对路径，可以很方便地进行GET/POST或者其他请求

鼓励iOS 7之后的开发者在 AFHTTPSessionManager的基础上再进行一次封装，封装一些开发者自己的需要。而针对iOS 6以及更早的得建议使用AFHTTPRequestOperationManager

注：AFHTTPRequestOperationManager基于开发的NSURLConnection已经在iOS 9被废弃。

> 初始化

AFHTTPSessionManager对象的初始化有两种方式：

```
+ (instancetype)manager;
- (instancetype)initWithBaseURL:(nullable NSURL *)url;
```

两种方式的区别在于后一种初始化方式会让你传入一个BaseURL，而前一种类方法则默认BaseURL为nil，BaseURL在生成全URL时有作用，AFHTTPSessionManager文档里也提供了说明。

```
    NSURL *baseURL = [NSURL URLWithString:@"http://example.com/v1/"];
    [NSURL URLWithString:@"foo" relativeToURL:baseURL];                  // http://example.com/v1/foo
    [NSURL URLWithString:@"foo?bar=baz" relativeToURL:baseURL];          // http://example.com/v1/foo?bar=baz
    [NSURL URLWithString:@"/foo" relativeToURL:baseURL];                 // http://example.com/foo
    [NSURL URLWithString:@"foo/" relativeToURL:baseURL];                 // http://example.com/v1/foo
    [NSURL URLWithString:@"/foo/" relativeToURL:baseURL];                // http://example.com/foo/
    [NSURL URLWithString:@"http://example2.com/" relativeToURL:baseURL]; // http://example2.com/
```

下面这个方法是AFHTTPSessionManager对象开启一个新请求的一个API

```c
// AFHTTPSessionManager.h
- (nullable NSURLSessionDataTask *)GET:(NSString *)URLString
                   parameters:(nullable id)parameters
                      success:(nullable void (^)(NSURLSessionDataTask *task, id _Nullable responseObject))success
                      failure:(nullable void (^)(NSURLSessionDataTask * _Nullable task, NSError *error))failure
```

除了GET，还有PUT，PATCH，DELETE几个方法的封装，请求方式都一样,最终都汇总到一个方法，

![img](/img/AFNetworking/03.png)

AFHTTPSessionManager的封装步骤

1、根据不同的HTTP Method和不同的请求参数序列化方式，以及URL合成，从`AFURLRequestSerialization`类里封装出一个NSMutableURLRequest对象

```
# AFURLRequestSerialization.h
- (NSMutableURLRequest *)requestWithMethod:(NSString *)method
                                 URLString:(NSString *)URLString
                                parameters:(id)parameters
                                     error:(NSError *__autoreleasing *)error
```

2、NSMutableURLRequest对象，作为一个参数重写父类`AFURLSessionManager`的方法生成一个NSURLSessionDataTask对象

```
// AFURLSessionManager.h
- (NSURLSessionDataTask *)dataTaskWithRequest:(NSURLRequest *)request
                               uploadProgress:(nullable void (^)(NSProgress *uploadProgress)) uploadProgressBlock
                             downloadProgress:(nullable void (^)(NSProgress *downloadProgress)) downloadProgressBlock
                            completionHandler:(nullable void (^)(NSURLResponse *response, id _Nullable responseObject,  NSError * _Nullable error))completionHandler 
```

3、NSURLSessionDataTask对象开始网络请求

```
// AFHTTPSessionManager.h
[dataTask resume];
```



