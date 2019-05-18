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