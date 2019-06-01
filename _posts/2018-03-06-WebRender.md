---
layout:     post
category:   前端
title:      "Web渲染和虚拟Dom"
subtitle:   "Web渲染过程以及虚拟Dom的优势"
date:       2018-03-06 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

#### 1、Web渲染

前端渲染大致分为5步：

**创建DOM树——创建StyleRules——创建Render树——布局Layout——绘制Painting**

1. 用HTML分析器，分析HTML元素，**构建一颗DOM树**(标记化和树构建)。
2. 用CSS分析器，分析CSS文件和元素上的inline样式，生成页面的样式表。
3. 将DOM树和样式表，关联起来，构建一颗Render树(这一过程又称为Attachment)。每个DOM节点都有**attach方法，接受样式信息**，返回一个render对象(又名renderer)。这些render对象最终会被构建成一颗Render树。
4. 有了Render树，浏览器开始布局，为每个Render树上的节点确定一个在显示屏上出现的精确坐标。
5. Render树和节点显示坐标都有了，就调用每个节点**paint方法，把它们绘制**出来。 

![img](/img/Simple_7/54.png)

#### 2、更新Dom造成的问题

原生JS或JQ操作更新DOM时，浏览器会从构建DOM树开始从头到尾执行一遍流程。在一次操作中，我需要更新10个DOM节点，浏览器收到第一个DOM请求后并不知道还有9次更新操作，因此会马上执行流程，最终执行10次。例如，第一次计算完，紧接着下一个DOM更新请求，这个节点的坐标值就变了，前一次计算为无用功。计算DOM节点坐标值等都是白白浪费的性能。即使计算机硬件一直在迭代更新，操作DOM的代价仍旧是昂贵的，频繁操作还是会出现页面卡顿，影响用户体验。

web开发者开发者持续不断的工作来缩短渲染页面的时间。最关键的需要完成的事情是最小化DOM改变，然后批处理DOM变化，在必要的时候才重新渲染页面。

#### 3、虚拟树

虚拟DOM就是为了解决浏览器性能问题而被设计出来的。如前，若一次操作中有10次更新DOM的动作，虚拟DOM不会立即操作DOM，而是将这10次更新的diff内容保存到本地一个JS对象中，最终将这个JS对象一次性attch到DOM树上，再进行后续操作，避免大量无谓的计算量。所以，用JS对象模拟DOM节点的好处是，页面的更新可以先全部反映在JS对象(虚拟DOM)上，操作内存中的JS对象的速度显然要更快，等更新完成后，再将最终的JS对象映射成真实的DOM，交由浏览器去绘制。

#### 4、React的虚拟Dom

- React通过component来构建整个页面，每个大的component可以由很多小的component组合构成。每个component有着自己的生命周期。
- State是每个component内部的动态数据，也是由开发者维护管理的页面数据。凡是页面需要动态显示的地方都会有state来负责数据存储。

当state变化了，调用`setState`的时候，component才会带着新的state重新渲染页面

Virtual DOM其实就是在这时发挥作用的，它是用javascript写的一个拥有DOM层级关系的一个数据结构。可以想成一个简化的DOM。当state变化时，component会重新触发render，那么Virtual DOM也会变化。 Virtual DOM会根据Diff算法来计算出哪里有变化，然后把新的Virtual DOM转换为真实的DOM，触发浏览器的渲染。

那这时就有一个问题，如果我只是更改一个`<label>`标签的值，那我直接DOM操作是不是更快一点呢？

答案是肯定的，因为只修改一个值，React还要经过render，Diff算法，DOM操作。这显然要比直接DOM修改一个节点的值要慢。

那么Virtual DOM的性能优势在哪里呢？React设计的目的是用来更新网页。

试想，在一个Component中，开发者要一次修改state中的很多属性，属性可能是对象，数组，每一个属性都会对应到页面中的一个节点的值。

那么在这个时候，如果我们直接用DOM操作就显得不那么方便与高效了，比如根据state要更改一个样式，还有要根据state更改页面结构等等。

不同的直接DOM操作会触发浏览器不同的repaint和reflow，这时，Virtual DOM的优势就来了。

在用`setState`顺利触发了component的render后，react会对Virtual DOM进行操作，而这些操作并不会触发浏览器的reflow和repaint，因为Virtual DOM它只是存在内存中的一个有着DOM层级关系的数据而已。 当最终形成了新的Virtual DOM后，转换成真实的DOM这一步才会触发浏览器的reflow和repaint。这是不是就突显出Virtual DOM的优势了。

它优化了触发浏览器reflow和repaint的步骤，把众多页面节点改动集中到一次来进行触发。

简单来说，**它减少了同一时间内的页面多处内容修改所触发的浏览器reflow和repaint的次数，可能把多个不同的DOM操作集中减少到了几次甚至一次，优化了触发浏览器reflow和repaint的次数。**。

这才是React真正高效的地方，而且高效也是分情况的，绝不是网上说的在某个Diff时间片内，把DOM操作收集起来，集中到1次，变更到Virtual DOM上。 当一个component只有一个地方要更改时，显然直接DOM操作要比React的这一套要有效率的多。

