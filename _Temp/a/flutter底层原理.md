### Flutter底层原理

1、原生、RN、与Flutter

<https://blog.csdn.net/b0Q8cpra539haFS7/article/details/81117191>

- Flutter在Rlease模式下直接将Dart编译成本地机器码，避免了代码解释运行的性能消耗。
- Dart本身针对高频率循环刷新（如屏幕每秒60帧）在内存层面进行了优化，使得Dart运行时在屏幕绘制实现如鱼得水。
- Flutter实现了自己的图形绘制避免了Native桥接。

Flutter在应用层使用Dart进行开发，而支撑它的是用C++开发的引擎。





- Dart 是 AOT（Ahead Of Time）编译的，编译成快速、可预测的本地代码，使 Flutter 几乎都可以使用 Dart 编写。这不仅使 Flutter 变得更快，而且几乎所有的东西（包括所有的小部件）都可以定制。
- Dart 也可以 JIT（Just In Time）编译，开发周期异常快，工作流颠覆常规（包括 Flutter 流行的亚秒级有状态热重载）。
- Dart 可以更轻松地创建以 60fps 运行的流畅动画和转场。Dart 可以在没有锁的情况下进行对象分配和垃圾回收。就像 JavaScript 一样，Dart 避免了抢占式调度和共享内存（因而也不需要锁）。由于 Flutter 应用程序被编译为本地代码，因此它们不需要在领域之间建立缓慢的桥梁（例如，JavaScript 到本地代码）。它的启动速度也快得多。
- Dart 使 Flutter 不需要单独的声明式布局语言，如 JSX 或 XML，或单独的可视化界面构建器，因为 Dart 的声明式编程布局易于阅读和可视化。所有的布局使用一种语言，聚集在一处，Flutter 很容易提供高级工具，使布局更简单。
- 开发人员发现 Dart 特别容易学习，因为它具有静态和动态语言用户都熟悉的特性。

2、原理篇

<https://tech.meituan.com/2018/08/09/waimai-flutter-practice.html>