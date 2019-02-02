#### 1、NSDictionary初始化时传入了空值

[Bugly-NSDictionary初始化时传入了空值](https://bugly.qq.com/v2/crash-reporting/crashes/900019386/305776?pid=2&crashDataType=unSystemExit)

> NSInvalidArgumentException
>
> -[__NSPlaceholderDictionary initWithObjects:forKeys:count:]: attempt to insert nil object from objects[2]

解决方案：

加入防空处理

#### 2、KVO添加与移除次数不对应

[Bugly-KVO忘记移除或者多次移除](https://bugly.qq.com/v2/crash-reporting/crashes/900019386/360055?pid=2&crashDataType=unSystemExit)

少移除

> NSInternalInconsistencyException
>
> An instance 0x1078c2400 of class _UIWebViewScrollView was deallocated while key value observers were still registered with it. Current observation info: <NSKeyValueObservationInfo 0x170a206c0> ( <NSKeyValueObservance 0x170c42160: Observer: 0x1115cf540, Key path: contentSize, Options: <New: NO, Old: NO, Prior: NO> Context: 0x102de814c, Property: 0x170c42190> )

多移除

> NSRangeException
>
> Cannot remove an observer <WEGNewsCommentController 0x123bd3c00> for the key path "contentSize" from <_UIWebViewScrollView 0x1250d0c00> because it is not registered as an observer.

解决方案：

通过

```objc
    id info = object.observationInfo;
    NSArray *arr = [info valueForKeyPath:@"_observances._property._keyPath"];
    BOOL had = NO;
    for (id KVOPath in arr) {
        if ([keyPath isEqualToString:KVOPath]) {
            // 这个属性是已经添加观察的
            break;
        }
    }
```

3、大图片的硬解

[bugly-大图片硬解](https://bugly.qq.com/v2/crash-reporting/crashes/900019386/240919?pid=2&crashDataType=unSystemExit)

> CoreGraphics  _ERROR_CGDataProvider_BufferIsNotReadable + 12

这是iOS11的系统bug，解决方案

https://github.com/SDWebImage/SDWebImage/issues/2226