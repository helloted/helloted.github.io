---
layout:     post
category:   Flutter
title:      "Flutter与Native(二)"
subtitle:   "iOS/Android与Flutter交互"
date:       2018-12-25 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 一、Native切换到Flutter

#### 1、iOS

在iOS中，Flutter的Framework中，提供了一个FlutterViewController来切换到Flutter页面

```objc
@interface FlutterViewController
    : UIViewController <FlutterBinaryMessenger, FlutterTextureRegistry, FlutterPluginRegistry>
```

可以看到FlutterViewController是继承自UIViewController，然后遵循了一些Flutter的相关协议。所以我们可以像正常使用UIViewController一样来使用Flutter页面

```objc
#import <Flutter/Flutter.h>

FlutterViewController* flutterViewController = [FlutterViewController new];
[flutterViewController setInitialRoute:@"initRoute"];
```

#### 2、Andorid

在Android中，Flutter提供了一个View来显示Flutter页面

```java
View flutterView = Flutter.createView(MainActivity.this,getLifecycle(),"initRoute");
```

#### 3、Flutter

注意到在iOS和Android初始化时，都会传入一个值"initRoute"，这个就是Flutter初始化选择的页面，在Flutter中可以通过

`ui.window.defaultRouteName`来获取到，Dart中文档也写的很清楚：

![img](/img/Simple_8/60.png)

- 如果没有被设置，将会默认是"/"
- 必须在runApp之前就赋好值
- iOS调用的是[`FlutterViewController.setInitialRoute`]
- Android代码中调用的是`FlutterView.setInitialRoute`

所以，在Flutter的初始化页面：

```dart
// ui.window.defaultRouteName是Native端初始化时传来的route
void main() => runApp(_widgetForRoute(ui.window.defaultRouteName));

// 根据route跳转不同界面
Widget _widgetForRoute(String route) {
  switch (route) {
    case 'initRoute':
      return new initWidget();
    case 'home':
      return new DefaultWidget();
    default:
      return new DefaultWidget();
  }
}
```

### 二、iOS与Flutter交互

#### 1、Flutter传值Native

我们要借助FlutterMethodChannel来传递消息

在iOS Native端初始化：

```objc
    // 要与main.dart中一致
    NSString *channelName = @"com.pages.your/native_get";
    FlutterMethodChannel *messageChannel = [FlutterMethodChannel methodChannelWithName:channelName binaryMessenger:flutterViewController];
```

FlutterMethodChannel初始化时，要传入两个参数channelName和flutterViewController，channelName是消息通道的名称，这个是唯一的要与dart的channel保持一致，flutterViewController则是Flutter的VC；

messageChannel通过回调Block的方式来与Flutter端进行交互。

    [messageChannel setMethodCallHandler:^(FlutterMethodCall * _Nonnull call, FlutterResult  _Nonnull result) {
    
    }];
`FlutterMethodCall * _Nonnull call`用于接受Flutter端传递的数据，`FlutterResult  _Nonnull result`用于返回Flutter端数据

```
// methodChannel保持与Native端一致
static const methodChannel = const MethodChannel('com.pages.your/native_get');

_contactWithNative() async {
  Map<String, dynamic> map = {"code": "200", "data":[1,2,3]};
  dynamic result; //result是Native端传递过来的结果，异步得到。
  try {
    result = await methodChannel.invokeMethod('flutter_method', map);
  } on PlatformException {
    result = "error";
  }
}
```

 其中，`methodChannel.invokeMethod('flutter_method', map)`对应于Native端的`FlutterMethodCall * _Nonnull call`，第一个参数为方法名，对应`call.method`，必须为字符串类型；第二个参数为要传递给Native的参数，对应iOS端的`call.arguments`可以为基础类型，其中基础类型对应为

| Flutter  | iOS          | 说明       |
| -------- | ------------ | ---------- |
| String   | NSString     | 字符串类型 |
| 数值类型 | NSNumber     | 数值类型   |
| Map      | NSDictionary | key/Value  |

所以在iOS端，我们可以这样回调

```objc
    [messageChannel setMethodCallHandler:^(FlutterMethodCall * _Nonnull call, FlutterResult  _Nonnull result) {
        // call.method 获取 flutter 给回到的方法名，要匹配到 channelName 对应的多个 发送方法名，一般需要判断区分
        // call.arguments 获取到 flutter 给到的参数，（比如跳转到另一个页面所需要参数）
        // result 是给flutter的回调， 该回调只能使用一次
        NSLog(@"method=%@ \narguments = %@", call.method, call.arguments);
        if ([call.method isEqualToString:@"iOSFlutter1"]) {
            NSDictionary *dic = call.arguments;
            NSLog(@"arguments = %@", dic);
            NSDictionary *map = @{@"key":@"从map里获取到的数据"};
            
            // 给Flutter回传结果
            if (result) {
                result(map);
            }
        }
    }];
```

