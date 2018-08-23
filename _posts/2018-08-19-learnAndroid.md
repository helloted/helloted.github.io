---
layout:     post
category:   Android
title:      "安卓学习记录"
subtitle:   "安卓学习过程中的随记"
date:       2018-08-19 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 一、安卓四大组件

- Activity:是所有Android应用程序的门面，凡是在应用中你看到的东西，都是在里面。每一个Activity都独立于其他Activity而存在。因此，其他应用可以启动其中任何一个Activity(当然得应用允许)
- Service:是一种在后台运行的组件，用于执行长时间运行的操作或为远程进程执行作业，服务不提供用户界面。例如，当用户位于其他应用时，服务可能在后台播放音乐或者通过网络获取数据
- Broadcast Receiver：用于响应系统范围广播通知的组件。接收来自各处的广播消息，比如短信、电话，屏幕，当然应用也可以向外发出广播消息。尽管广播接收器不会显示用户界面，但他们可以创建状态栏同辉，在发生广播事件的时候提醒用户
- Content Provider：您可以将数据存储在文件系统、SQLite 数据库、网络上或您的应用可以访问的任何其他永久性存储位置。 其他应用可以通过内容提供程序查询数据，甚至修改数据（如果内容提供程序允许），比如你想要读取系统电话簿中的联系人，就需要通过内容提供器

​       任何应用都可以启动其他应用的组件，比如拍照，您的应用可以利用拍照应用而不是开发一个Activity来自行拍摄照片，只需启动照相应用的Activity，完成拍摄后，系统将照片返回您的应用。当系统启动某个组件时，会启动该应用的进程(如果尚未运行)，并且实例化该组件所需要的类。例如，如果您的应用启动相机应用中拍摄照片的Activity，则该 Activity 会在属于相机应用的进程，而不是您的应用的进程中运行。因此，与大多数其他系统上的应用不同，Android 应用并没有单一入口点（例如，没有 `main()` 函数）。

由于系统在单独的进程中运行每个应用，且其文件权限会限制对其他应用的访问，因此您的应用无法直接启动其他应用中的组件， 但 Android 系统却可以。因此，要想启动其他应用中的组件，您必须向系统传递一则消息，说明您想启动特定组件的 *Intent*。 系统随后便会为您启动该组件。

四种组件类型中的三种 — Activity、服务和广播接收器 — 通过名为 *Intent* 的异步消息进行启动。Intent 会在运行时将各个组件相互绑定（您可以将 Intent 视为从其他组件请求操作的信使），无论组件属于您的应用还是其他应用。

### 二、清单文件

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