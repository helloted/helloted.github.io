---
layout:     post
category:   iOS
title:      "UIApplicationDelegate"
subtitle:   "UIApplicationDelegate与APP状态"
date:       2016-12-11 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

本文翻译自[UIApplicationDelegate](https://developer.apple.com/documentation/uikit/uiapplicationdelegate)

### 一、预览

app delegate一直伴随着整个APP用来确保您的APP与系统或者其他APP之间交互顺利，特别地，app delegate的一些方法提供了一个响应重要改变的机会。比如，你用这些方法来响应APP的状态，比如APP从前台转向后台，进来通知。在许多场合，app delegate的方法是唯一途径来接受这些重要的通知。

Xcode为每个新建project提供了app delegate，所以你不需要自己去定义。当你的APP启动，UIKit自动创建一个app delegate实例对象用来执行一些APP自定义代码。你需要做的就是在 APP delegate里添加上你自己的代码。

app delegate是你的APP的基础对象，就如同 `UIApplication` 对象，app delegate是一个单例对象而且一直存在于运行时，尽管 `UIApplication` 对象操作大部分工作来管理APP，你通过app delegate的方法来全面地决定整个APP的行为。经过大部分协议和方法是可选的，你应该声明部分方法。

app delegate 扮演了以下关键角色

- 它包含了APP的启动代码
- 它会响应APP的状态改变，特别地，它会响应暂时的中断以及应用程序执行状态的变化，例如当您的应用程序从前台转换到后台时。
- 它响应来自APP外部的通知，如低内存警告，下载完成通知等等。
- 它决定了是否应该进行状态保护和恢复，并根据需要协助保护和恢复进程。
- 它响应以应用程序本身为目标的事件，而不是特定于应用程序的Views或Viewcontrollers。
- 你可以使用它来存储应用程序的中央数据对象或任何没有拥有view controller的内容。

二、开启APP

启动APP是APP整个生命循环的重要节点，在启动时，app delegate接到响应去执行自定义的初始化的代码。比如，建立数据结构，注册任何需要的服务。

一些附加的任务app delegate会在启动时间执行

- **根据 launch options dictionary 来检测你的APP是否已经启动.** The [`application(_:willFinishLaunchingWithOptions:)`](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623032-application) and [`application(_:didFinishLaunchingWithOptions:)`](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1622921-application) 提供了一个字典来显示APP已经启动
- **检测状态恢复是否已经被执行.**  如果APP先前保存了view controllers的状态, 那么只有 app delegate’s [`application(_:shouldRestoreApplicationState:)`](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1622987-application) 返回 `true`.才能恢复状态。
- **打开一个发送给 app的URL.** 如果有一个URL需要打开，系统会调用app delegate的 [`application(_:open:options:)`](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623112-application) . 你同样可以判断URL是否需要打开，用launch options dictionary[`url`](https://developer.apple.com/documentation/uikit/uiapplicationlaunchoptionskey/1622996-url) key. 你必须通过添加 `CFBundleURLTypes` 进你`Info.plist` 文件来声明你的APP支持的urls. 更多信息 [App Programming Guide for iOS](https://developer.apple.com/library/content/documentation/iPhone/Conceptual/iPhoneOSProgrammingGuide/Introduction/Introduction.html#//apple_ref/doc/uid/TP40007072).
- **提供root window给你的APP.** 一般地, Xcode已经声明了 [`window`](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623056-window) ，所以除非你需要自定义window，你才需要去声明这个。

### 三、管理状态转变

app delegate的一个主要工作就是用来响应系统提供地状态转变。每次状态发生改变，系统会调用app delegate合适的方法。每个状态都有不同的规则来规定APP应该怎么样表现，app delegate的方法就应该调整这些行为。

| 状态               | 描述                                       |
| ---------------- | ---------------------------------------- |
| 未运行(Not running) | App还未被启动或者是被终止(不管是被用户还是系统终止)             |
| 待用(Inactive)     | APP已经在前台运行但是没有收到事件(尽管有可能在执行其他代码)。一个应用程序通常只会短暂处于这种状态，因为它会转换到不同的状态。一旦进入这个状态，APP应该把自己置于静止状态，期望很快就会转变到后台或活动状态。 |
| 活动(Active)       | APP在前台运行，并接收事件。 这是前台应用程序的正常模式。处于活动状态的APP没有特别的限制。 这是前台APP，应该对用户作出响应。 |
| 后台(Background）   | APP正在执行代码，但在屏幕上不可见。 当用户退出应用程序时，系统在暂停应用程序之前短暂地将其移至后台状态。 在其他时候，系统可能会启动应用程序到后台（或唤醒挂起的应用程序），并给它时间来处理特定的任务。 例如，系统可能会唤醒APP，以便处理后台下载，某些类型的位置事件，远程通知以及其他类型的事件。在后台状态的APP应该尽可能少的工作。需要时间来处理特定类型的事件的APP尽快应处理这些事件，并将控制权还给系统。 |
| 挂起(Suspended)    | App在内存中，但不执行代码。 系统挂起在后台的App，没有任何待完成的任务。 系统可能随时清除这些被挂起的app，而不会唤醒它们为其他app腾出空间。 |

![img](/img/Simple_2/06.png)

当状态发生改变时，下面的方法会被调用. 

- 启动时:
  - [`application(_:willFinishLaunchingWithOptions:)`](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623032-application)
  - [`application(_:didFinishLaunchingWithOptions:)`](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1622921-application)
- APP进到前台:
  - [`applicationDidBecomeActive(_:)`](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1622956-applicationdidbecomeactive)
- APP进入后台:
  - [`applicationDidEnterBackground(_:)`](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1622997-applicationdidenterbackground)
- APP处于等待状态:
  - [`applicationWillResignActive(_:)`](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1622950-applicationwillresignactive) (Called when leaving the foreground state.)
  - [`applicationWillEnterForeground(_:)`](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623076-applicationwillenterforeground) (Called when transitioning out of the background state.)
- APP终止:
  - [`applicationWillTerminate(_:)`](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623111-applicationwillterminate) (Called only when the app is running. This method is not called if the app is suspended.)

### 四、响应通知和事件

系统向app delegate发送许多不同的通知和事件，让app delegate决定如何最好地响应传入的信息并更新app。 大多数通知对应于应用程序级别的行为，可能需要您更新app的数据或用户界面或对系统更改的条件作出响应。 处理这些通知的方式取决于您的app的架构。 在许多情况下，app delegate可能只是通知其他对象（例如view controllers）需要自行更新，但在某些情况下，app delegate可能会自行完成工作。

- 如果APP需要初始化后台下载，当你开始下载时系统调用 [`application(_:performFetchWithCompletionHandler:)`](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623125-application) 
- app使用 [`URLSession`](https://developer.apple.com/documentation/foundation/urlsession) 来操作后台下载,当APP不在运行时，如果文件已经下载完成，系统会调用 [`application(_:handleEventsForBackgroundURLSession:completionHandler:)`](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1622941-application) ，你可以用这个方法来处理下载文件和更新相关的view controllers。
- 当低内存发生时, 系统会通过调用[`applicationDidReceiveMemoryWarning(_:)`](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623063-applicationdidreceivememorywarni) 来通知app delegate. app会分别通知view controllers 以便 app delegate 用这些通知来移除viewcontroller引用的对象或者不直接管理的数据对象
- 当时间发生重大变化时,系统会调用 [`applicationSignificantTimeChange(_:)`](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1622992-applicationsignificanttimechange) ，如果你的APP对于时间改变很敏感，你可以利用这个方法来更新。
- 当用户要锁住设备，系统会调用 [`applicationProtectedDataWillBecomeUnavailable(_:)`](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623019-applicationprotecteddatawillbeco) .  数据保护可防止在设备锁定时对文件进行未经授权的访问。如果app需要引用受保护的文件，则必须移除该文件引用，并在调用此方法时释放与该文件关联的所有对象，当用户随后解锁设备，你可以重新建立连接通过app delegate’s [`applicationProtectedDataDidBecomeAvailable(_:)`](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/1623044-applicationprotecteddatadidbecom) 

