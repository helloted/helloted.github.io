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

在Android中，Flutter提供了一个FluttreView来显示一部分

```java
View flutterView = Flutter.createView(MainActivity.this,getLifecycle(),"initRoute");
```

也提供了一个FlutterActivity：

```java
FlutterMain.startInitialization(MainActivity.this);
Intent intent = new Intent(MainActivity.this, FlutterActivity.class);
intent.putExtra("route", "initRoute");
MainActivity.this.startActivity(intent);
```

使用Activity之前首先在`AndroidManifest.xml`注册

```xml
<activity
    android:name="io.flutter.app.FlutterActivity"
 android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|layoutDirection|fontScale|screenLayout|density"
    android:hardwareAccelerated="true"
    android:windowSoftInputMode="adjustResize"
    android:exported="true">
    <meta-data
        android:name="io.flutter.app.android.SplashScreenUntilFirstFrame"
        android:value="true"
        />
</activity>
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

```objc
[messageChannel setMethodCallHandler:^(FlutterMethodCall * _Nonnull call, FlutterResult  _Nonnull result) {

}];
```
`FlutterMethodCall * _Nonnull call`用于接受Flutter端传递的数据，`FlutterResult  _Nonnull result`用于返回Flutter端数据

```objc
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
            
            // 给Flutter回传结果,这个block只能调用一次才有效
            if (result) {
                result(map);
            }
        }
    }];
```

如果要多次从Native回调给Flutter，就需要通过`EventChannel`来实现了

#### 2、Native传值到Flutter

在iOS端：

```objc
    FlutterViewController* flutterViewController = [FlutterViewController new];
    [flutterViewController setInitialRoute:@"iOSSendToFlutter"];
    flutterViewController.title = @"Native传值到Flutter";
    [self.navigationController pushViewController:flutterViewController animated:YES];
    
    NSString *channelName = @"com.pages.your/native_post";
    FlutterEventChannel *evenChannal = [FlutterEventChannel eventChannelWithName:channelName binaryMessenger:flutterViewController];
    [evenChannal setStreamHandler:self];
```

设置代理

```
#pragma mark - <FlutterStreamHandler>
// Flutter端开始监听这个channel时的回调，第二个参数 EventSink是用来传数据的载体。
- (FlutterError* _Nullable)onListenWithArguments:(id _Nullable)arguments eventSink:(FlutterEventSink)events {
	NSLog(@"Flutter开始接受数据并发来参数:%@",arguments);
    // 用一个实例来指向，这样就可以多次调用
    self.flutterEvents = events;
    return nil;
}

// flutter不再接收
- (FlutterError* _Nullable)onCancelWithArguments:(id _Nullable)arguments {
    NSLog(@"Flutter停止接受并发来参数:%@",arguments);
    return nil;
}

```

这样就可以给Flutter端传递数据了

```
self.flutterEvents(@"给flutter传递的数据")
```

下面是Dart的代码

```dart
  // 注册一个通知
  static const EventChannel eventChannel = const EventChannel('com.pages.your/native_post');
  
  // 向iOS端发送一个参数123456789并且开始接收native的广播来传递数据
	eventChannel.receiveBroadcastStream(123456789).listen(_onEvent,onError: _onError);

  // 回调事件
  void _onEvent(Object event) {
    setState(() {
     //从iOS端接受的数据
      String receive = event.toString();
    });
  }
  
  // 错误返回
  void _onError(Object error) {

  }
```

### 三、android

#### 1、Flutter传值Native

通过注册MethodChannel来达到传递的目的

```java
  // 自定义插件
  new MethodChannel(flutterView, ChannelName).setMethodCallHandler(new MethodCallHandler() 	{
            @Override
            public void onMethodCall(MethodCall call, MethodChannel.Result result) {
            	// 传递过来的方法名称和参数
                Log.d("LOGTAG_D",call.method);
                Log.d("LOGTAG_D",call.arguments.toString());
				
				// 返回值给Flutter
				result.success("messageReturnToFlutter");
            }
   });
```

要传入两个参数：

- `flutterView`：如果是FlutterActivity的话用来获取getFlutterView()；
- `ChannelName`：通道的名称，与Flutter端保持一致

#### 2、Native传值到Flutter

通过注册EventChannel来达到Native主动传值到Flutter的目的

```java
new EventChannel(flutterView, ChannelName).setStreamHandler(
        new EventChannel.StreamHandler() {
            @Override
            // 这个onListen是Flutter端开始监听这个channel时的回调，第二个参数 EventSink是用来传数据的载体。
            // arguments是Flutter发送过来的一个对象，可认为是标记
            // events是用来给Flutter传递数据的载体
            public void onListen(Object arguments, EventChannel.EventSink events) {
                Log.d("LOGTAG_D",arguments.toString());
				myEvents.success("给flutter发送的数据");
            }

            @Override
            public void onCancel(Object arguments) {
                // Flutter不再接收
            }
        }
);
```

Dart的代码参见上面iOS部分文章

### 四、总结

Android与iOS一样，是通过两种不同类型的channel来达到Native与Flutter交互的效果。channel是Native与Flutter进行交互的通道，所以必须要注意的是，保持Native端与Flutter两端的ChannelName一致。

- Flutter传值Native：Native端通过call的method/methodName来进行区分不同的调用，而传递的对象可以是基础数据，会有一个result一次性的返回参数。
- Native传值Fluuter：在建立通道之后，可以通过arguments对象来区分通道，并且通过events作为载体来多次传递数据。

