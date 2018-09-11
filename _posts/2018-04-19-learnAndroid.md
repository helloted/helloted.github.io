---
layout:     post
category:   Android
title:      "安卓学习记录"
subtitle:   "安卓学习过程中的随记"
date:       2018-04-19 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 一、安卓四大组件

- Activity:是所有Android应用程序的门面，凡是在应用中你看到的东西，都是在里面。每一个Activity都独立于其他Activity而存在。因此，其他应用可以启动其中任何一个Activity(当然得应用允许)
- Service:是一种在后台运行的组件，用于执行长时间运行的操作或为远程进程执行作业，服务不提供用户界面。例如，当用户位于其他应用时，服务可能在后台播放音乐或者通过网络获取数据
- Broadcast Receiver：用于响应系统范围广播通知的组件。接收来自各处的广播消息，比如短信、电话，屏幕，当然应用也可以向外发出广播消息。尽管广播接收器不会显示用户界面，但他们可以创建状态栏同辉，在发生广播事件的时候提醒用户
- Content Provider：您可以将数据存储在文件系统、SQLite 数据库、网络上或您的应用可以访问的任何其他永久性存储位置。 其他应用可以通过内容提供程序查询数据，甚至修改数据（如果内容提供程序允许），比如你想要读取系统电话簿中的联系人，就需要通过内容提供器

       任何应用都可以启动其他应用的组件，比如拍照，您的应用可以利用拍照应用而不是开发一个Activity来自行拍摄照片，只需启动照相应用的Activity，完成拍摄后，系统将照片返回您的应用。当系统启动某个组件时，会启动该应用的进程(如果尚未运行)，并且实例化该组件所需要的类。例如，如果您的应用启动相机应用中拍摄照片的Activity，则该 Activity 会在属于相机应用的进程，而不是您的应用的进程中运行。因此，与大多数其他系统上的应用不同，Android 应用并没有单一入口点（例如，没有 `main()` 函数）。

由于系统在单独的进程中运行每个应用，且其文件权限会限制对其他应用的访问，因此您的应用无法直接启动其他应用中的组件， 但 Android 系统却可以。因此，要想启动其他应用中的组件，您必须向系统传递一则消息，说明您想启动特定组件的 *Intent*。 系统随后便会为您启动该组件。

四种组件类型中的三种 — Activity、服务和广播接收器 — 通过名为 *Intent* 的异步消息进行启动。Intent 会在运行时将各个组件相互绑定（您可以将 Intent 视为从其他组件请求操作的信使），无论组件属于您的应用还是其他应用。

### 二、AndroidManifest.xml

**在 Android 系统启动应用组件之前，系统必须通过读取应用的 `AndroidManifest.xml` 文件（“清单”文件）确认组件存在。 您的应用必须在此文件中声明其所有组件，该文件必须位于应用项目目录的根目录中。**

除了声明应用的组件外，清单文件还有许多其他作用，如：

- 确定应用需要的任何用户权限，如互联网访问权限或对用户联系人的读取权限
- 根据应用使用的 API，声明应用所需的最低 [API 级别](https://developer.android.com/guide/topics/manifest/uses-sdk-element.html#ApiLevels)
- 声明应用使用或需要的硬件和软件功能，如相机、蓝牙服务或多点触摸屏幕
- 应用需要链接的 API 库（Android 框架 API 除外），如 [Google 地图库](http://code.google.com/android/add-ons/google-apis/maps-overview.html)
- 其他功能

1、设定一个首页

所有的Activity都要在的 AndroidManifest.xml文件里注册，否则不能使用，不过Android Studio会自动帮我们做这个操作，但是如果要设定一个activity为主页，则需要添加intent-filter表情，比如，要设置一个名称为FirstActivity为首页

```xml
        <activity android:name=".FirstActivity"
            android:label="this is FirstActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
```

- android.intent.action.MAIN决定应用程序最先启动的Activity
- android.intent.category.LAUNCHER决定应用程序是否显示在程序列表里

上面两个标签必须同时有，缺一不可。

### 三、Intent

Intent是一个消息传递对象，您可以使用它从其他应用组件请求操作，基本用例主要包括以下三个

- 启动Activity
- 启动服务
- 传递广播

Intent 分为两种类型：

- **显式 Intent**：按名称（完全限定类名）指定要启动的组件。 通常，您会在自己的应用中使用显式 Intent 来启动组件，这是因为您知道要启动的 Activity 或服务的类名。例如，启动新 Activity 以响应用户操作，或者启动服务以在后台下载文件。
- **隐式 Intent** ：不会指定特定的组件，而是声明要执行的常规操作，从而允许其他应用中的组件来处理它。 例如，如需在地图上向用户显示位置，则可以使用隐式 Intent，请求另一具有此功能的应用在地图上显示指定的位置。隐式Intent需要配合Intent-filter。

> **注意：**为了确保应用的安全性，启动 `Service` 时，请始终使用显式 Intent，且不要为服务声明 Intent 过滤器。使用隐式 Intent 启动服务存在安全隐患，因为您无法确定哪些服务将响应 Intent，且用户无法看到哪些服务已启动。从 Android 5.0（API 级别 21）开始，如果使用隐式 Intent 调用 `bindService()`，系统会引发异常。

#### intent-filter

Intent 过滤器是应用清单文件中的一个表达式，它指定该组件要接收的 Intent 类型。

请在[清单文件](https://developer.android.com/guide/topics/manifest/manifest-intro.html)中使用intent-filter元素为每个应用组件声明一个或多个 Intent 过滤器。每个 Intent 过滤器均根据 Intent 的操作、数据和类别指定自身接受的 Intent 类型。 仅当隐式 Intent 可以通过 Intent 过滤器之一传递时，系统才会将该 Intent 传递给应用组件。

创建隐式 Intent 时，Android 系统通过将 Intent 的内容与在设备上其他应用的[清单文件](https://developer.android.com/guide/topics/manifest/manifest-intro.html)中声明的 Intent 过滤器进行比较，从而找到要启动的相应组件。 如果 Intent 与 Intent 过滤器匹配，则系统将启动该组件，并向其传递 `Intent`对象。 如果多个 Intent 过滤器兼容，则系统会显示一个对话框，支持用户选取要使用的应用。

您可以使用以下三个元素中的一个或多个指定要接受的 Intent 类型：

- <action>

  在 `name` 属性中，声明接受的 Intent 操作。该值必须是操作的文本字符串值，而不是类常量。

- <data>

  使用一个或多个指定数据 URI 各个方面（`scheme`、`host`、`port`、`path` 等）和 MIME 类型的属性，声明接受的数据类型。

- <category>

  在 `name` 属性中，声明接受的 Intent 类别。该值必须是操作的文本字符串值，而不是类常量。

#### 构建

`Intent` 对象携带了 Android 系统用来确定要启动哪个组件的信息，以及目标组件为了正确执行操作而使用的信息，主要包含：

组件名称：可选项，如果隐式则根据其他信息来判断

- 操作
- 数据
- Extra:附加信息的key-value
- 标志：

### 四、Activity

#### 1、四个状态：

- 运行：在返回栈的栈顶，最不可能被回收
- 暂停：不再栈顶，但是仍然可见，比如对话框的时候，背后的Activity就是暂停状态，只有在内存极低的情况下，系统才会考虑回收
- 停止：当一个Activity不再处于栈顶位置，并且完全不可见的时候，就进入了停止状态，当其他地方需要内存时，极有可能会被系统回收
- 销毁：当一个Activity从返回栈移除后就变成了销毁状态。系统最倾向于回收这种状态，保证手机的内存充足。

#### 2、回调方法

- onCreate():在Activity第一次被创建的时候调用，在这个方法里完成初始化操作，比如加载布局，绑定事件
- onStart():在Activity由不可见变为可见的时候调用
- onResume():在Activity准备好和用户进行交互的时候调用，此时Activity一定位于返回栈的栈顶，并且处于运行状态
- onPause():在系统准备去启动或者恢复另一个Activity的时候调用，通常在这个方法中将一些消耗CPU资源释放掉，以及保存一些关键数据，但是这个方法一定要快，否则会影响到新的栈顶Activity的使用
- onStop():在Activity完全不可见的时候调用，与onpause的区别是，如果新Activity是对话框式的，会调用onPause而不会调用onStop
- onDestory():在被销毁之前调用，之后的Activity状态变为销毁状态
- onRestart():在Activity由停止状态变为运行状态之前调用，也就是Activity被重新启动了

![img](/img/Simple_1/40.png)

#### 3、生存期

- 完整生存期:在onCreate()和onDestory之间的方法所经历的，就是完整生存期，一般情况下，一个Activity会在onCreate()方法中完成各种初始化操作，而在onDestory方法中完成内存释放的操作
- 可见生存期:Activity在onStart()和onStop()之间所经历的，就是可见生存期。在可见生存期，Activity对于用户总是可见的，即时可能无法和用户进行交互
- 前台生存期：Activity在onResume()方法和onPause()方法之间所经历的就是前台生存期。在前台生存期内，Activity总是处于运行状态，此时的Activity是可以与用户进行交互。

#### 4、活动的启动模式

需要在AndroidManifest.xml中通过<activity>标签指定android:lanuchMode属性来选择启动模式

- standard：活动的默认启动模式，系统不会在乎这个活动在返回栈中的情况，每次启动都会创建活动的一个新的实例
- singleTop：在启动活动如果发现返回栈中的栈顶已经是该活动，则直接使用，不会再创建新的
- singleTask：在启动该活动时系统会在返回栈中检查是否存在该活动实例，如果有，则把活动之上的所有活动全部出栈，然后直接使用这个活动
- singleInstance：系统会有一个单独的返回栈来管理这个活动，不管是哪个应用来访问这个活动，都共用一个单例

### 五、安卓UI布局

- android:layout_width: 控件的宽度
- android:layout_height: 控件的高度

可选值有三种：match_parent，fill_parent，和wrap_content，match_parent和fill_parent一样都是跟父布局大小一致。wrap_parent则是由内容来觉得，也就是刚好包住内容。

#### 1、约束布局

根据控件间的相互约束来决定布局，2017年推出，成为主流布局方式

#### 2、线性布局LinearLayout

将所有包含的控件在线性方向上依次排列，通过android:orientation属性可以指定排列方向，vertical是竖直方向，horizontal是水平方向。默认是水平方向。还有个属性layout_weiht，用来按比例分布排列

#### 3、相对布局RelativeLayout

通过相对定位的方式让控件出现在布局的任何位置，主要是利用控件间对齐来布局，属性比较多

#### 4、帧布局FrameLayout

所有的控件默认拜访在布局的左上角，应用较少

#### 5、百分比布局

根据百分比来布局



