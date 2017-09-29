---
layout:     post
title:      "AFNetworking源码分析(二)"
subtitle:   "AFHTTPSessionManager与AFURLSessionManager"
date:       2017-05-26 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 三、AFHTTPSessionManager

AFHTTPSessionManager继承自AFURLSessionManager，实际上就是针对HTTP的几种请求进行封装。

下面这个方法是AFHTTPSessionManager开启一个新请求的一个API

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

1、根据不同的HTTP Method和不同的请求参数序列化方式，从`AFURLRequestSerialization`类里封装出一个NSMutableURLRequest对象

```
# AFURLRequestSerialization.h
- (NSMutableURLRequest *)requestWithMethod:(NSString *)method
                                 URLString:(NSString *)URLString
                                parameters:(id)parameters
                                     error:(NSError *__autoreleasing *)error
```

2、NSMutableURLRequest对象，作为一个参数重写父类AFURLSessionManager的方法生成一个NSURLSessionDataTask对象

```
- (NSURLSessionDataTask *)dataTaskWithRequest:(NSURLRequest *)request
                               uploadProgress:(nullable void (^)(NSProgress *uploadProgress)) uploadProgressBlock
                             downloadProgress:(nullable void (^)(NSProgress *downloadProgress)) downloadProgressBlock
                            completionHandler:(nullable void (^)(NSURLResponse *response, id _Nullable responseObject,  NSError * _Nullable error))completionHandler 
```

3、NSURLSessionDataTask对象开始网络请求

```
[dataTask resume];
```



