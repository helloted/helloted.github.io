---
layout:     post
category:   iOS
title:      "View Controller编程指南"
subtitle:   "《View Controller Programming Guide for iOS》文档翻译"
date:       2017-11-01 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

苹果官方文档[View Controller Programming Guide for iOS](https://developer.apple.com/library/content/featuredarticles/ViewControllerPGforiPhoneOS/index.html#//apple_ref/doc/uid/TP40007457-CH2-SW1)

### 一、ViewController的角色

ViewController是你的应用程序内部结构的基础。 每个应用程序至少有一个ViewController，大多数应用程序有几个。 每个ViewController管理你的应用程序用户界面的一部分，以及该界面和底层数据之间的交互。 ViewController也用于您的用户界面的不同部分之间的转换。

因为他们在你的应用中扮演着如此重要的角色，ViewController几乎是你所做的一切的中心。 UIViewController类定义了管理你的View，处理事件，从一个ViewController转换到另一个ViewController，以及协调你的应用程序的其他部分的方法和属性。 您可以继承UIViewController（或其子类之一）并添加实现应用程序行为所需的自定义代码。

有两种类型的ViewController：

- 内容ViewController管理你的应用程序内容的一个离散片段，是创建的ViewController的主要类型。

- 容器ViewController收集来自其他ViewController（称为子ViewController）的信息并以便于导航的方式呈现或以不同方式呈现这些ViewController的内容。

#### 管理View

ViewController最重要的作用是管理View的层次结构。 每个ViewController都有一个root view包含所有内容。 在该root view中，您添加了需要显示内容的view。 图显示了ViewController和View之间的内置关系。 ViewController总是具有对其root view的引用，并且每个view都具有对其subview的强引用。

![img](/img/Simple_3/20.png)

内容ViewController自己管理其所有View。

容器ViewController管理其自己的View以及来自其一个或多个子ViewController的root view。 该容器不管理其子女的内容。 它只管理root view，根据容器的设计大小和放置它。 图说明了分割ViewController及其子项之间的关系。 拆分ViewController管理其subview的整体大小和位置，但子ViewController管理这些view的实际内容。

![img](/img/Simple_3/21.png)

#### 传送数据

ViewController充当它管理的View和你的应用的数据之间的媒介。 UIViewController类的方法和属性允许您管理应用程序的可视化表示。 当你继承UIViewController的时候，你可以添加任何你需要在你的子类中管理你的数据的变量。 添加自定义变量会创建一个类似于图所示的关系，其中ViewController具有对数据的引用以及用于呈现该数据的View。 你的工作是在两者之间来回移动数据。

![img](/img/Simple_3/24.png)

你应该始终在ViewController和数据对象中保持清晰的职责分离。 大多数确保数据结构完整性的逻辑属于数据对象本身。 ViewController可以验证来自视图的输入，然后以数据对象需要的格式打包输入，但是应该最小化ViewController在管理实际数据中的角色。

UIDocument对象是一种独立于ViewController管理数据的方法。 文档对象是知道如何读写数据到持久存储的控制器对象。 当你子类化时，你需要添加任何你需要的逻辑和方法来提取数据，并将其传递给ViewController或其他应用程序的部分。 ViewController可以存储它接收的任何数据的副本，以便更新View，但文档仍然拥有真实的数据。

#### 交互

ViewController是响应者对象，能够处理响应者链中的事件。 虽然他们能够这样做，但ViewController很少直接处理触摸事件。 相反，View通常会处理自己的触摸事件，并将结果报告给关联的delegate或目标对象（通常是ViewController）的方法。 因此，ViewController中的大多数事件都是使用delegate方法或action方法处理的。

#### 资源管理

ViewController对其View和它创建的任何对象承担全部责任。 UIViewController类自动处理View管理的大多数方面。 例如，UIKit自动释放不再需要的任何view相关的资源。 在你的UIViewController子类中，你负责管理你明确创建的任何对象。

当可用空闲内存不足时，UIKit会要求应用程序释放不再需要的资源。 一种方式是通过调用ViewController的didReceiveMemoryWarning方法。 使用该方法删除对不再需要的对象的引用，或者稍后可以轻松地重新创建。 例如，您可以使用该方法删除缓存的数据。 发生内存不足情况时，释放尽可能多的内存非常重要。 消耗太多内存的应用程序可能会被系统彻底终止以恢复内存。

#### 调节

ViewController负责呈现View，并使该呈现适应底层环境。每个iOS应用程序都应该能够在iPad上运行，并且可以在几种不同大小的iPhone上运行。不是为每个设备提供不同的ViewController和View层次结构，而是使用单个ViewController来更简单地调整其View以适应不断变化的空间需求。

在iOS中，当ViewController的特性改变时，会发生显示细腻的变化。特征是描述整体环境的属性，例如显示比例。其中最重要的两个特性是ViewController的水平和垂直尺寸类别，它们表示ViewController在给定维度中有多少空间。您可以使用大小类更改来改变布局视图的方式，如图所示。当水平尺寸类别是规则的，ViewController利用额外的水平空间来排列其内容。当水平尺寸级别紧凑时，ViewController垂直排列其内容。

![img](/img/Simple_3/25.png)

### 二、View Controller Hierarchy

您应用的ViewController之间的关系定义了每个ViewController所需的行为。 UIKit期望您以规定的方式使用ViewController。 维护正确的ViewController关系可确保自动行为在需要时传递给正确的ViewController。 如果您违反了规定的遏制和陈述关系，您的应用程序的部分将不能像预期那样。

#### Root View Controller

Root ViewController是ViewController层次结构的锚点。 每个window只有一个root ViewController，其内容填充该window。 root ViewController定义了用户看到的初始内容。 图显示了root ViewController和window之间的关系。 因为window本身没有可见的内容，所以ViewController的View提供了所有的内容。

![img](/img/Simple_3/26.png)

#### 容器型ViwController

容器型ViewController让您更易于管理和可重用的部分组装复杂的界面。容器型ViewController将一个或多个子ViewController的内容与可选的自定义View混合在一起，以创建其最终界面。例如，UINavigationController对象显示来自子ViewController的内容以及由导航控制器管理的导航栏和可选工具栏。 UIKit包含多个容器型ViewController，包括UINavigationController，UISplitViewController和UIPageViewController。

容器型ViewController的View总是填充给它的空间。容器型ViewController通常作为root ViewController安装在窗口中（如图所示），但它们也可以以模态方式呈现，或者作为其他容器的子项安装。容器负责适当地定位其子视图。在图中，容器并排放置两个子视图。虽然它取决于容器接口，但子ViewController可能对容器和任何同级ViewController有最少的了解。

![img](/img/Simple_3/27.png)

#### 呈现ViewControllers

呈现ViewController会将当前ViewController的内容替换为新ViewController的内容，通常会隐藏前一个ViewController的内容。 演示文稿最常用于模态地显示新内容。 例如，您可能会提供一个ViewController来收集用户的输入。 您也可以将它们用作应用程序界面的一般构建块。

在呈现ViewController时，UIKit会在呈现ViewController和呈现的ViewController之间创建一个关系，如图所示。 （从呈现的ViewController返回到它呈现的ViewController也有相反的关系。）这些关系形成ViewController层次结构的一部分，并且是在运行时定位其他ViewController的一种方式。

![img](/img/Simple_3/22.png)

当涉及容器ViewController时，UIKit可能会修改链来简化您必须编写的代码。不同的演示风格对于它们在屏幕上的显示方式有不同的规则 - 例如，全屏显示总是覆盖整个屏幕。在呈现ViewController时，UIKit会查找为显示提供合适上下文的ViewController。在许多情况下，UIKit选择最近的容器ViewController，但它也可能选择window的根ViewController。在某些情况下，您还可以告诉UIKit哪个ViewController定义了演示上下文，并且应该处理显示。

![img](/img/Simple_3/23.png)

### 三、定义建议

#### 尽量使用系统的ViewController

许多iOS框架定义了ViewController，您可以在您的应用程序中使用它。 使用这些系统提供的ViewController可为您节省时间并确保为用户提供一致的体验。

大多数系统ViewController是为特定任务而设计的 某些ViewController提供对用户数据（如联系人）的访问。 其他人可能提供访问硬件或提供专门调整的界面来管理媒体。 例如，UIKit中的UIImagePickerController类显示用于捕获图片和视频以及访问用户相机的标准界面。

- UIKit框架提供ViewController，用于显示警告，拍照和录像，以及在iCloud上管理文件。 UIKit还定义了许多可用于组织内容的标准容器ViewController。
- GameKit框架提供了用于匹配玩家的ViewController以及管理排行榜，成就和其他游戏功能。

- 地址簿UI框架提供了用于显示和选择联系人信息的ViewController。

- MediaPlayer框架提供用于播放和管理视频的ViewController，以及从用户库中选择媒体资产。

- EventKit UI框架提供了用于显示和编辑用户日历数据的ViewController。

- GLKit框架提供了用于管理OpenGL渲染表面的ViewController。

- Multipeer Connectivity框架提供了用于检测其他用户并邀请他们进行连接的ViewController。

- Message UI框架提供了用于撰写电子邮件和SMS消息的ViewController。

- PassKit框架提供ViewController来显示通行证并将其添加到存折。

- Social框架为Twitter，Facebook和其他社交媒体网站提供了编辑消息的ViewController。

- AVFoundation框架提供了用于显示媒体资产的ViewController。

#### 让每一个ViewController成为一个孤岛

ViewController应始终是自包含的对象。 没有ViewController应该有关于另一个ViewController的内部工作或View层次结构的知识。 在两个ViewController需要来回传递或传递数据的情况下，他们应该始终使用明确定义的公共接口来实现。

代理设计模式经常用于管理ViewController之间的通信。 通过delegate，一个对象定义了一个协议，用于与关联的委托对象进行通信，该对象是任何符合协议的对象。 委托对象的确切类型是不重要的。 重要的是它实现了协议的方法。

#### 仅将Root View用作其他View的容器

仅将ViewController的RootView用作其余内容的容器。 使用rootView作为容器可以为所有view提供一个共同的superview，这使得许多布局操作变得更简单。 许多自动布局约束需要共同的superview来正确布置view。

#### 清楚数据生命周期

在MVC设计模式中，ViewController的作用是促进model和view之间的数据移动。 ViewController可能会将一些数据存储在临时变量中并执行一些验证，但其主要职责是确保其view包含准确的信息。 您的model对象负责管理实际数据并确保数据的完整性。

UIDocument和UIViewController类之间的关系存在一个数据和接口分离的例子。 具体而言，两者之间不存在默认关系。 UIDocument对象负责协调数据的加载和保存，而UIViewController对象协调屏幕上的视图显示。 如果您在两个对象之间创建关系，请记住ViewController应该只缓存文档中的信息以提高效率。 实际的数据仍然属于文档对象。

#### 适配修改

应用程序可以在各种iOS设备上运行，并且ViewController被设计为适应这些设备上不同大小的屏幕。 而不是使用单独的ViewController来管理不同屏幕上的内容，而是使用内置的适配性支持来响应ViewController中的大小和大小等级更改。 UIKit发送的通知使您有机会对用户界面进行大规模和小规模的更改，而无需更改ViewController代码的其余部分。