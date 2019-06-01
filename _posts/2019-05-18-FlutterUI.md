---
layout:     post
category:   Flutter
title:      "Flutter UI原理"
subtitle:   "Flutter UI原理"
date:       2019-05-18 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 一、万物皆Widget

#### 1、Widget

Widgets是Flutter App用户交互的基础构成，每个widget代表的是用户交互的一部分(不可变的)，不像其他frameworks会分开views，viewControllers，layout或者其他属性，Flutter有一个统一的对象模型：widget。

Widget可以定义：

- 一个控件元素(比如button或者menu)
- 一个样式元素(比如字体或者颜色)
- 一个布局(比如padding)
- 等等...

Widgets基于组合形成层次结构。 每个wiget都嵌套在其内部，并从其父级继承属性。 没有单独的“application”对象。 取而代之的是，root widget担任此角色。

您可以通过将层次结构中的widget替换为另一个widget来响应事件，例如用户交互。 然后，框架比较新旧widget并有效地更新用户界面。

Widgets本身通常由许多小的，单一用途的Widget组成，这些Widgets组合起来产生强大的效果。 例如，Container是一个常用的Widget，由几个负责布局，绘制，定位和大小调整的小部件组成。 具体来说，Container由LimitedBox，ConstrainedBox，Align，Padding，DecoratedBox和Transform小部件组成。 您可以用新颖的方式组合这些以及其他简单的小部件，而不是将Container子类化以生成自定义效果。

类层次结构浅而宽，以最大化可能的组合数。

![img](/img/Simple_7/52.png)

您还可以通过将Widget与其他Widget组合来控制Widget的布局。 例如，要将Widget居中，请将其包含在 Center Widegt中。 有填充，对齐，行，列和网格的Widget。 这些布局Widget没有自己的可视化表示。 相反，他们唯一的目的是控制另一个Widget布局的某些方面。 要了解Widget以某种方式呈现的原因，检查相邻Widget通常很有帮助。

#### 2、Layer层级

![img](/img/Simple_7/53.png)

#### 3、Widget与Element

在Flutter中，Widget的功能是“描述一个UI元素的配置数据”，它就是说，Widget其实并不是表示最终绘制在设备屏幕上的显示元素，而只是显示元素的一个配置数据。实际上，Flutter中真正代表屏幕上显示元素的类是`Element`，也就是说Widget只是描述`Element`的一个配置，有关`Element`的详细介绍我们将在本书后面的高级部分深入介绍，读者现在只需要知道，Widget只是UI元素的一个配置数据，并且一个Widget可以对应多个`Element`，这是因为同一个Widget对象可以被添加到UI树的不同部分，而真正渲染时，UI树的每一个`Element`节点都会对应一个Widget对象。总结一下：

- Widget实际上就是Element的配置数据，Widget树实际上是一个配置树，而真正的UI渲染树是由Element构成；不过，由于Element是通过Widget生成，所以它们之间有对应关系，所以在大多数场景，我们可以宽泛地认为Widget树就是指UI控件树或UI渲染树。
- 一个Widget对象可以对应多个Element对象。这很好理解，根据同一份配置（Widget），可以创建多个实例（Element）。

### 二、层级

看下面这张图

![img](/img/Simple_7/56.png)

1. 在顶部是一些常用的Material和Cupertino风格的Widget；
2. 接下来是一些通用的Widget层，大部分时间我们都只会使用上面的两层就足够使用；
3. 在Widgets层下面是render渲染层，这层的主要作用是简化了布局和绘制过程，是底部的`dart:ui库`的另一个抽象；
4. `dart:ui`是最后一个Dart层，它基本上处理与Flutter引擎的通信。

简而言之，可以说较高级别更易于使用，而较低级别则可以为您提供更多的API，更复杂的细粒度控制。

#### 1、dart:ui库

dart:ui库显示了Flutter框架用于引导应用的最低层级服务，例如用于驱动输入，图形文本，布局和渲染等子系统。

所以基本上你可以通过利用dart:ui包中的类（例如Canvas，Paint和TextBox）来编写一个'Flutter'应用程序。但是，不仅要考虑绘画，还要考虑编排布局和对应用程序元素进行测试，这将是一个难以管理的事情。

这意味着您必须手动计算布局中使用的所有坐标。然后混合一些绘画和hit test来捕捉用户输入。为每一帧做到这一点并跟踪它。如果你只是你打算构建一个简单的应用程序，它只显示一个蓝色框内的文本，那倒有可能。但如果你试图建立更复杂的布局，如购物应用程序甚至小游戏，那么这种方法就不那么好了。甚至不敢想动画，滚动或其他我们都喜欢的花哨的UI东西。

#### 2、render渲染层

> Flutter Widgets库使用RenderObject层次结构来实现其布局和绘制。通常情况下，虽然可以在应用程序中使用自定义RenderBox类来实现特定效果，但大多数情况下，调试布局问题的时候才需要与RenderObject打交道。

Render渲染库是dart:ui库之上的第一个抽象层，可以为您完成所有繁重的数学运算（例如，跟踪计算的坐标等）。由RenderObjects组成的树稍后将由Flutter绘制并绘制。为了优化这个复杂的过程，Flutter使用智能算法换成繁杂的计算已优化性能。

大多数情况下，你会发现Flutter使用RenderBox而不是RenderObject。一个简单的box layout协议非常适合构建高性能的UI。每个widget都被放置在它自己的box当中，这个box被计算出来，然后与其他预先布置好的box一起排列。因此，如果布局中只有一个widget发生更改（例如按钮或开关），则系统只需要重新计算这个相对较小的box。

#### 3、Widgts库

这一层抽象提供了现成的UI组件，我们可以直接放入我们的应用中。有三种类别：

- `layout布局`： 例如。 列和行小部件使我们可以轻松地将其他小部件垂直或水平对齐。
- `Paiting绘画`： 例如。 文本和图像小部件允许我们在屏幕上显示（“绘制”）一些内容。
- `Hit-Testing`：例如。 GestureDetector允许我们识别不同的手势，例如点击（用于检测按下按钮）和拖动（用于滑动列表）。

通常情况，我们使用许多基础基本的widget，并构建自己的widget。 例如，您可以在Container中构建一个按钮，将其包装到GestureDetector中以检测按钮被按下的动作。

但是，Flutter团队不是自己构建每个UI组件，而是创建了两个库，其中包含Material和Cupertino（类似iOS）样式中常用的Widget。

#### 4、Material & Cupertino

最上面一层包含了Material设计规范中的预构建元素(比如AlertDialog，Switch和FloatingActionButton)和一些重新创建的iOS样式的Widgets(例如CupertinoAlertDialog，CupertinoButton和CupertinoSwitch)；

### 三、渲染过程

先来看一个简单的Wiget树

```dart
class SimpleApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SimpleContainer(
      color: Colors.white,
      child: SimpleText('Flutter is awesome!', color: Colors.blue),
    );
  }
}
```

很简单的一个应用只包含三个widgets: `SimpleApp`, `SimpleContainer` and `SimpleText`.

当调用runApp()之后，会有下面的步骤：

1. Flutter将构建包含三个statless widget的widget树。
2. Flutter沿着小部件树向下走，并通过在小部件上调用createElement()来创建第二个包含相应Element对象的树。
3. 创建第三个树并使用相应的RenderObjects填充，这些RenderObject由Element调用相应小部件上的createRenderObject()方法创建。

如下图的三种树：

![img](/img/Simple_7/58.png)

可以看到，Flutter框架创建了三个不同的树，一个用于Widgets，一个用于Element，一个用于RenderObject。每个Element都包含对Widget和RenderObject的引用。

RenderObject用来包含用于呈现对应Widget的所有逻辑，RenderObject实例化非常昂贵，它负责布局，绘画和Hit-test。最好尽可能长时间地将这些对象保存在内存中或者可以回收它们（因为实例化成本非常高）。

Elements是**不可变Widget树**和**可变RenderObject树**之间的粘合剂。Element代表着Widget的配置和在树中的特定位置，并保留对相关Widget和RenderObject的引用。

为什么要有三棵树？因为高效，每次更改Widgets树时，Flutter都使用Elements树来比较Widgets树和现有的RenderObjects。当Widget的类型与以前相同时，Flutter不需要重新创建昂贵的RenderObject，只需更新其可变配置即可。由于Widgets非常轻量级且实例化成本低廉，因此它们非常适合描述应用程序的当前状态（也称为“配置”）。 “重量级”RenderObjects（创建起来很昂贵）不会每次都重新创建而是尽可能重用。

在框架中，Elements很好地“抽象出来”，因此您不必经常处理它们。在每个构建（BuildContext上下文）函数中传递的BuildContext实际上是包含在BuildContext接口中的相应Element，这就是为什么它对于每个Widget都不同。

#### 1、更新同类型Widget

```dart
class SimpleApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SimpleContainer(
      color: Colors.red,  // SimpleContainer颜色变更
      child: SimpleText('Flutter is awesome!', color: Colors.blue),
    );
  }
}
```

由于Widget是不可变的，因此每次配置更改时都需要重建Widget树。 当我们将Container的颜色更改为红色时，框架将触发重建，这将重新创建整个Widget树，因为它是不可变的。 接下来，借助Elements树中Elements的帮助，Flutter将新Widgets树与旧的Widegt树进行比较。

> 比较的基本规则：检查旧Widget和新Widget是否来自同一类型。 如果不是，从树中删除Widget，Element和RenderObject（包括子树）并创建新对象。 如果它们来自相同类型，则只需更新RenderObject的配置以表示Widget的新配置。

在我们的示例中，

1. SimpleApp与以前的类型相同，并且具有与相应的SimpleAppRender对象相同的配置，因此不会有任何更改。 
2. Widget树中的下一个是SimpleContainer窗口小部件，但具有不同的颜色配置。因此更新SimpleContainerRender对象上的颜色属性并要求重绘。 
3. 其他对象将保持不变。

![img](/img/Simple_7/59.png)

注意更新之后，Element和RenderObjects仍然是相同的实例对象。这个过程很快，因为Widegt的配置很轻量级。 而重量级对象将保持不变。

#### 2、不同类型的Widget

```dart
class SimpleApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SimpleContainer(
      color: Colors.red,  
      child: SimpleButton( // Widget由SimpleText变更为SimpleButton
        child: SimpleText('Click me'),
        color: Colors.blue),
      	onPressed:()=>print('Yay!'),
    );
  }
}
```

同样的，Flutter会重建Widget树并且对比之前的Element树和RenderObject树进行比较

![img](/img/Simple_7/60.png)

因为SimpleButton和SimpleText类型不同，Flutter将会把SimpleText对应的Element和SimpleTextRender从树中移除，而SimpleButton没有对应的Element，所以会根据Widget树，创建对应的Element和RenderObjects

![img](/img/Simple_7/61.png)

这样新的渲染树就被建立然后被布局会绘制到屏幕上。



参考：

 https://medium.com/flutter-community/the-layer-cake-widgets-elements-renderobjects-7644c3142401

https://www.youtube.com/watch?v=dkyY9WCGMi0