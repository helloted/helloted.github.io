---
layout:     post
category:   Flutter
title:      "现有iOS项目接入Flutter"
subtitle:   "现有iOS项目接入Flutter进行混合开发"
date:       2018-11-21 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

#### 1、现有目录

现有一个最简单的iOS项目MyApp，将iOS项目和Android项目分别放入放入HybridApp文件夹中，目录结构如下：

```
HybridApp
├── Android
└── iOS
    └── MyApp
```

![img](/img/Simple_8/43.png)

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
├── flutter_module       //flutter相关
└── iOS					 // iOS相关
    └── MyApp			 // iOS项目
```

![img](/img/Simple_8/44.png)

#### 3、将flutter的相关信息导入iOS项目

在flutter_module目录下有个.iOS的隐藏文件夹，里面有个文件Flutter/Generated.xcconfig，里面有一些flutter的信息

![img](/img/Simple_8/45.png)

将这个文件导入到iOS项目中

新建一个config文件，内容为导入Generated.xcconfig文件路径

![img](/img/Simple_8/46.png)

```
#include "../../flutter_module/.ios/Flutter/Generated.xcconfig"
```

![img](/img/Simple_8/47.png)

将FlutterDebug.xcconfig添加到iOS项目的Info-Configuration里：

![img](/img/Simple_8/48.png)

#### 4、添加脚本

```
"$FLUTTER_ROOT/packages/flutter_tools/bin/xcode_backend.sh" build
"$FLUTTER_ROOT/packages/flutter_tools/bin/xcode_backend.sh" embed
```

![img](/img/Simple_8/49.png)

运行项目，在iOS项目文件夹内会生成一个Flutter的文件夹，将这个文件夹添加到项目中

![img](/img/Simple_8/50.png)

![img](/img/Simple_8/51.png)

#### 5、改造AppDelegate

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

#### 6、新建一个Flutter页面

![img](/img/Simple_8/53.png)

下面是效果

![img](/img/Simple_8/52.gif)