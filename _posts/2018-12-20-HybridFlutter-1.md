---
layout:     post
category:   Flutter
title:      "Flutter与Native(一)"
subtitle:   "iOS/Android项目接入Flutter进行混合开发"
date:       2018-12-20 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 一、初始项目

#### 1、现有目录

现有一个最简单的iOS项目MyApp，将iOS项目和Android项目分别放入放入HybridApp文件夹中，目录结构如下：

```
HybridApp
├── Android
	└── AndroidProject
└── iOS
    └── MyApp
```

#### 2、建立Flutter模块

```shell
flutter create -t module xxx
```

在HybridApp文件夹的根目录执行以下命令

```shell
$ cd HybridApp
$ flutter create -t module flutter_module
```

现在目录变成

```
HybridApp
├── Android              //android相关
	└── AndroidProject   //android项目
├── flutter_module       //flutter相关
└── iOS					 // iOS相关
    └── MyApp			 // iOS项目
```

![img](/img/Simple_8/44.png)

### 二、iOS接入



#### 1、将flutter的相关信息导入iOS项目

更新，新版本接入，通过cocoapod比较简单

在PodFile内加入：

```
platform :ios, '10.0'

target "NewHybrid" do

flutter_application_path = '../flutter_module'
eval(File.read(File.join(flutter_application_path, '.ios', 'Flutter', 'podhelper.rb')), binding)


end

```



==================================👇为旧版本接入=======================

在flutter_module目录下有个.iOS的隐藏文件夹，里面有个文件Flutter/Generated.xcconfig，查看可以看到里面有一些flutter的信息

![img](/img/Simple_8/45.png)

我们需要将将这个文件里的一些信息导入到iOS项目中，做法如下：

==>新建一个FlutterDebug.config的文件，

![img](/img/Simple_8/46.png)

内容为导入Generated.xcconfig文件路径：

```
#include "../../flutter_module/.ios/Flutter/Generated.xcconfig"
```

![img](/img/Simple_8/47.png)

==>将FlutterDebug.xcconfig添加到iOS项目的Info-Configuration里：

![img](/img/Simple_8/48.png)

#### 2、添加脚本

```
"$FLUTTER_ROOT/packages/flutter_tools/bin/xcode_backend.sh" build
"$FLUTTER_ROOT/packages/flutter_tools/bin/xcode_backend.sh" embed
```

![img](/img/Simple_8/49.png)

注意将Run Scrpt移到列表的前方

运行项目，在iOS项目文件夹内会生成一个Flutter的文件夹，将这个文件夹添加到项目中

![img](/img/Simple_8/50.png)

![img](/img/Simple_8/51.png)

#### 3、改造AppDelegate

```
AppDelegate.h

#import <UIKit/UIKit.h>
#import <Flutter/Flutter.h>

@interface AppDelegate : FlutterAppDelegate
@end
```

```
AppDelegate.m

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    return [super application:application didFinishLaunchingWithOptions:launchOptions];
}
```

#### 4、新建一个Flutter页面

![img](/img/Simple_8/53.png)

下面是效果

![img](/img/Simple_8/52.gif)



### 三、安卓接入

#### 1、配置

在setting.gradle中添加：

```
//加入下面配置
setBinding(new Binding([gradle: this]))
evaluate(new File(
        settingsDir.parentFile.parentFile,
        'flutter_module/.android/include_flutter.groovy'  //flutter_module路径
))
```

![img](/img/Simple_8/55.png)

在bulid.gradle中dependencies添加

```
implementation project(':flutter')
```

Gradle sync之后就成功导入了Flutter

#### 2、使用

在iOS中，Flutter是以一整个页面ViewController的方式接入到Native中，而在android中，Flutter既可以在现有Activity内插入一个FlutterView作为一部分，也可以直接继承自一个FlutterActivity.

作为一部分接入View

```java
View flutterView = Flutter.createView(MainActivity.this,getLifecycle(),"route1");
FrameLayout.LayoutParams layout = new FrameLayout.LayoutParams(600, 800);
layout.leftMargin = 100;
layout.topMargin = 200;
addContentView(flutterView, layout);
```

![img](/img/Simple_8/56.png)

或者Activity形式

```java
FlutterMain.startInitialization(MainActivity.this);
Intent intent = new Intent(MainActivity.this, FlutterActivity.class);
intent.putExtra("route", "initRoute");
MainActivity.this.startActivity(intent);
```

![img](/img/Simple_8/57.png)