---
layout:     post
category:   Flutter
title:      "Dart异步与并发"
subtitle:   "自定义控件"
date:       2019-03-18 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 一、异步

#### 1、单线程执行

Dart是单线程执行，也就是说一旦Dart函数开始执行，就会一直持续直到结束，Dart函数不能被其他Dart代码中断。

> 注意：Dart命令行应用程序可以通过创建isolate来并行运行代码（Dart Web应用程序目前无法创建其他ioslate，但它们可以创建web worker）。
>
> isolate不共享内存,它们就像是通过传递消息相互通信的独立应用程序。 除了应用程序明确在其他isolate或工作程序中运行的代码之外，所有应用程序的代码都在应用程序的main isolate中运行。 

Html5 中的web worker

> 传统页面中（HTML5 之前）的 JavaScript 的运行都是以单线程的方式工作的，虽然有多种方式实现了对多线程的模拟（例如：JavaScript 中的 setinterval 方法，setTimeout 方法等），但是在本质上程序的运行仍然是由 JavaScript 引擎以单线程调度的方式进行的。在 HTML5 中引入的工作线程使得浏览器端的 JavaScript 引擎可以并发地执行 JavaScript 代码，从而实现了对浏览器端多线程编程的良好支持。
>
> 传统上的线程可以解释为轻量级进程，它和进程一样拥有独立的执行控制，一般情况下由操作系统负责调度。而在 HTML5 中的Web worker是这样一种机制，它允许在 Web 程序中并发执行多个 JavaScript 脚本，每个脚本执行流都称为一个线程，彼此间互相独立，并且有浏览器中的 JavaScript 引擎负责管理。

#### 2、Event loops and queues

Event loops and queues能够确保同时处理多个图形操作或者事件。event loops的工作就是从event queue内拿一个event然后处理它，一直重复这个操作直到queue里全部处理完毕。event queue内的event有可能是用户输入事件、文件I/O通知、timers等等

![](/img/Simple_7/45.png)

如下图，Dart应用程序在其main isolate执行应用程序的main()函数时开始执行。 main()退出后，main isolate的线程开始逐个处理应用程序events queues的项目。

![](/img/Simple_7/44.png)

#### 3、Event处理步骤

一个Dart应用程序只有一个event loop，但是有两个Queue：event queue和microtask queue:

- Event queue:包含所有的外部事件，I/O、用户交互事件、绘制事件、timers、两个isolates之间的消息等等
- Microtask queue:存在的必要是因为事件处理代码有时需要稍后完成任务，但在将控制权返回给event loop之前(处理下一个事件之前)。例如，当可观察对象发生更改时，它会将多个突变更改组合在一起并以异步方式报告它们。 Microtask queue允许可观察对象在DOM显示不一致状态之前报告这些突变变化。

Event queue包含来自Dart和系统中其他的事件。 目前，Microtask queue仅包含源自Dart代码的内容。

如下图所示，当main()退出时，Event loop开始工作。 首先，它按FIFO顺序执行所有microtasks。 然后它出列并处理event queue中的第一项。 然后它重复循环：执行所有microtasks，然后处理event queue中的下一项。 一旦两个队列都为空并且不再需要更多事件，应用程序的embedder（例如浏览器或测试框架）就可以dispose该应用程序。

![](/img/Simple_7/46.png)

**注意：当Event Looper正在处理Microtask Queue中的Event时候，Event Queue中的Event就停止了处理了，此时App不能绘制任何图形，不能处理任何鼠标点击，不能处理文件IO等等**

虽然可以预测task执行的顺序，但您无法准确预测event loop何时将任务从队列中删除。 Dart事件处理系统基于单线程循环; 它不是基于刻度或任何其他类型的时间测量。 例如，在创建延迟任务时，event会在您指定时排队。 但是，直到处理队列中的所有内容（以及Microtask Queue中的每个task）之后，才能处理该事件。

#### 4、调度任务

调度任务有两种方式

- 使用Future类，可以将任务加入到Event Queue的队尾
- 使用scheduleMicrotask函数，将任务加入到Microtask Queue队尾

选择合适的队列(一般选择event queue):

- 尽可能使用Future在event queue上安排任务。 使用event queue有助于缩短microtask queue的长度，从而降低微microtask queue使event queue匮乏的可能性。

- 如果在处理event queue中的任何项之前绝对必须完成任务，那么通常应该立即执行该函数。 如果不能，则使用scheduleMicrotask()将项添加到microtask queue。 例如，在Web应用程序中使用微任务来避免过早释放js-interop代理或结束IndexedDB事务或事件处理程序。

Future案例

```dart
void main(){
new Future(() => futureTask)  //  异步任务的函数
        .then((m) => "futueTask execute result:$m")  //   任务执行完后的子任务
        .then((m) => m.length)  //  其中m为上个任务执行完后的返回的结果
        .then((m) => printLength(m))
        .whenComplete(() => whenTaskCompelete);  //  当所有任务完成后的回调函数
}

int futureTask() {
    return 21; 
}

void printLength(int length) {
    print("Text Length:$length");
}

void whenTaskCompelete() {
    print("Task Complete");
}
```

延迟执行

```dart
new Future.delayed(const Duration(seconds: 1), () => futureTask); //延迟执行1秒，但是除非queue内部是空的，否则不止1秒
```

scheduleMicrotask案例

```dart
async.scheduleMicrotask(() => microtask());

void microtask(){
  //  doing something
}
```

### 二、并发

#### 1、isolate

如果要运行计算密集型任务，该怎么办？为了使您的应用程序保持响应，您应该将任务放入其自己的isolates或worker。isolate可能在单独的进程或线程中运行，具体取决于Dart实现(目前来看是在线程中运行)。

isolate是Dart对actor并发模式的实现。运行中的Dart程序由一个或多个actor组成，这些actor也就是Dart概念里面的isolate。isolate是有自己的内存和单线程控制的运行实体。isolate本身的意思是“隔离”，因为isolate之间的内存在逻辑上是隔离的。isolate中的代码是按顺序执行的，任何Dart程序的并发都是运行多个isolate的结果。因为Dart没有共享内存的并发，没有竞争的可能性所以不需要锁，也就不用担心死锁的问题。

#### 2、isolate特性

- isolate是类似于线程(thread)但不共享内存的独立运行的worker，是一个独立的Dart程序执行环境。其实默认环境就是一个main isolate；
- 我们可以看到isolate神似Thread，但实际上两者有本质的区别。操作系统内内的线程之间是可以有共享内存的而isolate没有，这是最为关键的区别。
- isolate在它自己的event loop中执行代码，每个事件都可以在该isolate的微任务队列(microtask queue)中执行更小的任务。
- 由于isolate之间没有共享内存，所以他们之间的通信唯一方式只能是通过Port进行，而且Dart中的消息传递总是异步的。
- 在Dart语言中，所有的Dart代码都运行在某个isolate中，代码只能使用所属isolate的类和值。不同的isolate可以通过port发送message进行交流；
- 首字母大写的Isolate代表Isolate对象，小写的isolate代表一个独立的Dart代码执行环境。一个Isolate对象就是一个isolate(执行环境)的引用，通常不是当前代码所在的isolate，也就是说，当你使用Isolate对象时，你的目的应该是控制其他isolate，而不是当前的isolate。 当你要spawn(产生)一个新isolate时，如果操作成功，当前isolate会接收到一个代表新isolate的Isolate对象。
- Isolate对象允许其他isolate控制、监听它所代表的isolate的事件循环，例如当这个isolate发生未捕获错误时，可以暂停(pause)此isolate或获取(addErrorListener)错误信息。

#### 3、使用多少个isolates？

对于计算密集型任务，通常应该使用尽可能多的isolate来提供可用的CPUs。如果它们纯粹是计算的话，任何额外的isolate都会被浪费掉。但是，如果isolate执行异步调用 - 例如执行I / O  - 那么它们将不会在CPU上花费太多时间，因此拥有比CPU更多的isolate是有意义的。

如果这是一个适合您的应用程序的良好架构，您还可以使用比CPU更多的isolate。例如，您可以为每个功能使用单独的isolate，或者在需要确保不共享数据时使用。

#### 4、isolate代码示例

```dart
import 'dart:async';
import 'dart:isolate';

main() async {
  var receivePort = new ReceivePort();
  await Isolate.spawn(echo, receivePort.sendPort);

  // 'echo'发送的第一个message，是它的SendPort
  var sendPort = await receivePort.first;

  var msg = await sendReceive(sendPort, "foo");
  print('received $msg');
  msg = await sendReceive(sendPort, "bar");
  print('received $msg');
}

/// 新isolate的入口函数
echo(SendPort sendPort) async {
  // 实例化一个ReceivePort 以接收消息
  var port = new ReceivePort();

  // 把它的sendPort发送给宿主isolate，以便宿主可以给它发送消息
  sendPort.send(port.sendPort);

  // 监听消息
  await for (var msg in port) {
    var data = msg[0];
    SendPort replyTo = msg[1];
    replyTo.send(data);
    if (data == "bar") port.close();
  }
}

/// 对某个port发送消息，并接收结果
Future sendReceive(SendPort port, msg) {
  ReceivePort response = new ReceivePort();
  port.send([msg, response.sendPort]);
  return response.first;
}

```

总结

### 三、总结

关于event loop:

- Dart事件循环执行两个队列里的事件：event队列和microtask队列。
- event队列的事件来自dart（future，timer，isolate message等）和系统（用户输入，I/O等）。
- 目前为止，microtask队列的事件只来自dart。
- 事件循环会优先清空microtask队列，然后才会去处理event队列。
- 当两个队列都清空后，dart就会退出。
- main方法，来自event队列和microtask队列的所有事件都运行在Dart的main isolate中。

当你要安排一个task时，请遵守以下规则：

- 如果可以，尽量将任务放入event队列中。
- 使用Future的then方法或whenComplete方法来指定任务顺序。
- 为了保持你app的可响应性，尽量不要将大计算量的任务放入这两个队列。
- 大计算量的任务放入额外的isolate中。