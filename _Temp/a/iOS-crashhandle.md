#### 1、

https://bugly.qq.com/v2/crash-reporting/crashes/900019386/305776?pid=2&crashDataType=unSystemExit

> -[__NSPlaceholderDictionary initWithObjects:forKeys:count:]: attempt to insert nil object from objects[2]

NSDictionary初始化时传入了空值

解决方案：

加入防空处理