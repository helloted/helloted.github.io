---
layout:     post
category:   Flutter
title:      "Flutter UI原理"
subtitle:   "Flutter UI原理"
date:       2019-05-18 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 一、Web前端渲染原理

#### 1、初次渲染

前端渲染大致分为5步：

**创建DOM树——创建StyleRules——创建Render树——布局Layout——绘制Painting**

1. 用HTML分析器，分析HTML元素，**构建一颗DOM树**(标记化和树构建)。
2. 用CSS分析器，分析CSS文件和元素上的inline样式，生成页面的样式表。
3. 将DOM树和样式表，关联起来，构建一颗Render树(这一过程又称为Attachment)。每个DOM节点都有**attach方法，接受样式信息**，返回一个render对象(又名renderer)。这些render对象最终会被构建成一颗Render树。
4. 有了Render树，浏览器开始布局，为每个Render树上的节点确定一个在显示屏上出现的精确坐标。
5. Render树和节点显示坐标都有了，就调用每个节点**paint方法，把它们绘制**出来。 

![img](/img/Simple_7/54.png)

#### 2、更新Dom

原生JS或JQ操作更新DOM时，浏览器会从构建DOM树开始从头到尾执行一遍流程。在一次操作中，我需要更新10个DOM节点，浏览器收到第一个DOM请求后并不知道还有9次更新操作，因此会马上执行流程，最终执行10次。例如，第一次计算完，紧接着下一个DOM更新请求，这个节点的坐标值就变了，前一次计算为无用功。计算DOM节点坐标值等都是白白浪费的性能。即使计算机硬件一直在迭代更新，操作DOM的代价仍旧是昂贵的，频繁操作还是会出现页面卡顿，影响用户体验。

#### 3、虚拟树

虚拟DOM就是为了解决浏览器性能问题而被设计出来的。如前，若一次操作中有10次更新DOM的动作，虚拟DOM不会立即操作DOM，而是将这10次更新的diff内容保存到本地一个JS对象中，最终将这个JS对象一次性attch到DOM树上，再进行后续操作，避免大量无谓的计算量。所以，用JS对象模拟DOM节点的好处是，页面的更新可以先全部反映在JS对象(虚拟DOM)上，操作内存中的JS对象的速度显然要更快，等更新完成后，再将最终的JS对象映射成真实的DOM，交由浏览器去绘制。

Vue的编译器在编译模板之后，会把这些模板编译成一个渲染函数。而函数被调用的时候就会渲染并且返回一个虚拟DOM的树。这个树非常轻量，它的职责就是描述当前界面所应处的状态。当我们有了这个虚拟的树之后，再交给一个patch函数，负责把这些虚拟DOM真正施加到真实的DOM上。在这个过程中，Vue有自身的响应式系统来侦测在渲染过程中所依赖到的数据来源。在渲染过程中，侦测到的数据来源之后，之后就可以精确感知数据源的变动。到时候就可以根据需要重新进行渲染。当重新进行渲染之后，会生成一个新的树，将新树与旧树进行对比，就可以最终得出应施加到真实DOM上的改动。最后再通过patch函数施加改动。

![img](/img/Simple_7/55.jpeg)

总而言之，在Vue中，每一个组件都精确地知道自己是否需要重绘，系统准确地知道哪些组件实际上需要重新渲染，在不需要手动优化的基础上更小粒度上更新DOM。

### 二、万物皆Widget

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

### 三、层级树

