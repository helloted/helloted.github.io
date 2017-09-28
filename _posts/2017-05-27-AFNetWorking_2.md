---
layout:     post
title:      "AFNetworking源码分析(二)"
subtitle:   "AFHTTPSessionManager与AFURLSessionManager"
date:       2017-05-26 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 三、AFHTTPSessionManager

```
- (nullable NSURLSessionDataTask *)GET:(NSString *)URLString
                   parameters:(nullable id)parameters
                      success:(nullable void (^)(NSURLSessionDataTask *task, id _Nullable responseObject))success
                      failure:(nullable void (^)(NSURLSessionDataTask * _Nullable task, NSError *error))failure
```

除了GET，还有PUT，PATCH，DELETE几个方法的封装，最终都汇总到一个方法，

![img](/img/AFNetworking/03.png)

返回的dataTask,调用

```
[dataTask resume];
```

开始网络请求；

