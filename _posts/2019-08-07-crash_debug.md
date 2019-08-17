---
layout:     post
category:   iOS
title:      "无源调试"
subtitle:   "系统栈的crash调试"
date:       2019-08-07 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

一般App都会接入第三方的Crash报告SDK，比如友盟SDK，或者腾讯的bugly，当有crash的时候，SDK记录的crash记录的堆栈一般情况下可以很清晰地定位到源码的具体某一行，根据代码处理即可。但是有小部分情况下，crash记录的堆栈是系统堆栈，没有开发者的源码。

#### 1、objc_msgSend+16的crash

![img](/img/Simple_7/62.png)

![img](/img/Simple_7/63.png)

上面的crash堆栈中，唯一跟App源码相关的就是main函数，其他的都是系统堆栈，显然没有办法直接定位到源码。

objc_msgSend函数是runtime中核心的函数，为什么会崩溃在这，怎么处理这种crash？

#### 2、objc_msgSend原理

每一个OC对象有一个类，每一个OC类都有一个方法列表。每一个方法都有一个selector，一个指向方法实现的函数指针，以及一些元数据。objc_msgSend的工作就是传入对象和selector，查找相应方法的函数指针，然后跳到函数指针所指向的位置。

查找方法的过程可能是非常复杂的。如果在一个类里没有找到这个方法，那么它会继续到superclass里去查找。如果在所有的superclass中都没有找到，就会调用运行时的消息转发代码。当一个类第一次收到消息时，他会去调用类的 +initialize方法。

通常查找一个方法必须是迅速的，因为每次消息的调用都需要有这个过程。这就和复杂的查找过程有冲突了，复杂但是要快。

OC解决这个冲突的方案是做方法缓存。每一个类有一个cache，用于存储方法的selectors和函数指针，也就是所谓的IMP。他们被组成一个哈希表，所以查找的时候是非常快的。当查找一个方法时，运行时首先询问cache。如果cache里没有这个方法，后续就会有一个缓慢而又复杂的过程，最后会把找到的结果放到cache里，这样下次查找该方法的时候就会很快了。

objc_msgSend是用汇编写的。有两个原因：一是因为在C语言中不可能通过写一个函数来保留未知的参数并且跳转到一个任意的函数指针。C语言没有满足做这件事情的必要特性。另一个原因是objc_msgSend必须够快。

当然，谁都不会想要用汇编写下整个复杂的消息查找过程。这没必要。消息发送的代码可以被分为两部分：objc_msgSend中有一个快速路径，是用汇编写的，还有一个慢速的路径，是用C实现的。汇编部分主要实现的是在缓存中查找方法，并且如果找到的话就跳转过去的一个过程。如果在缓存中没有找到方法的实现，就会调用C的代码来处理后续的事情。

因此，objc_msgSend主要有以下几个步骤：

1. 获取传入的对象的类
2. 获取这个类的方法缓存
3. 通过传入的selector，在缓存中查找方法
4. 如果缓存中没有，调用C代码
5. 跳到这个方法的IMP

#### 3、objc_msgSend的汇编指令

> ARM64架构下有31个通用寄存器，每个都是64位宽的。他们被标记为x0~x30。同样也有可能使用`w0`到`w30`来访问寄存器的低32位。寄存器x0x7被用于函数入参的前8个参数。这就表示objc_msgSend收到的self参数是保存在x0中，selector _cmd参数在x1里。
>
> ![img](/img/Simple_7/65.png)
>
> x0到x7用来做参数传递，以及从子函数返回结果（通常通过x0返回，如果是一个比较大的结构体则结果会存在x8的执行地址上）
>
> LR：即x30寄存器，也叫链接寄存器，一般是保存返回上一层调用的地址
>
> FP：即r29，栈底寄存器
>
> 外加一个栈顶寄存器SP

```objc
objc_msgSend(Class receiver,SEL selector, arg1, arg2, ...)
```

回顾objc_msgSend函数我们可以知道：

- x0 寄存器中的保存receiver。
- x1 寄存器中保存的selector。

使用符号断点，我们可以查看objc_msgSend的符号指令

![img](/img/Simple_7/64.png)

```
libobjc.A.dylib`objc_msgSend:
    0x1931bb6a0 <+0>:   cmp    x0, #0x0                  ; // 将receiver与0进行比较
    0x1931bb6a4 <+4>:   b.le   0x1931bb714               ; // nil对象处理或者tagged pointer对象处理
    0x1931bb6a8 <+8>:   ldr    x13, [x0]    // 取出receiver的isa指针赋值给x13
    0x1931bb6ac <+12>:  and    x16, x13, #0xffffffff8 // 得到receiver的Class对象指针赋值给x16
->  0x1931bb6b0 <+16>:  ldp    x10, x11, [x16, #0x10] // 取出Class对象的cache成员分别保存到x10,x11寄存器中
```

+16的地方crash，名称是SIGV_ACCERR，内存访问错误，野指针，class对象的内存应该是在整个App生命周期都是可行的，为什么会出现访问错误呢？

#### 4、objc_msgSend crash原因

![img](/img/Simple_7/66.png)

如上图，对象在堆内存区，在还没有被销毁之前，isa指针会指向其Class对象的内存地址，此时objc_msgSend是没有问题的，而对象被销毁之后，堆内存被回收，很有可能这部分内存就被覆盖，一个已经释放了的OC对象继续调用实例方法时，在objc_msgSend函数内部读取到obj的isa指针得到的将是一个未知或者有可能无效的指针值，指向的内存错误，出现野指针的错误。

也就是在读取x16地址的时候，导致内存读取错误，导致崩溃。

实际上，在前两条指令

```
    0x1931bb6a0 <+0>:   cmp    x0, #0x0 
    0x1931bb6a4 <+4>:   b.le   0x1931bb714  
```

只是进行比较，不会crash。

而第三条指令，访问receiver的isa指针赋值给x13

```
0x1931bb6a8 <+8>:   ldr    x13, [x0]
```

```objc
@interface NSObject <NSObject> {
    Class isa;
}
```

虽然，receiver已经被销毁，但是OC对象都是从堆内存区域中分配内存的，所以当某个OC对象被销毁后，其所占用的内存仍然会放回堆内存区域中进行管理，而堆内存区域的地址是可以进行任意的读写访问的，所以即使对象被销毁释放，其isa指针仍然是可以正常访问，虽然值可能被覆盖，但不会crash。

#### 5、objc_msgSend crash解决方案

从上面可以知道，寄存器中的值：

- x0 寄存器中的保存的就是receiver。
- x1 寄存器中保存的就是receiver的selector。
- x13 寄存器中保存的就是receiver的isa指针。
- x16 寄存器中保存的就是isa指向的Class指针对象。

因为对象已经被销毁，所以x0,x13,x16的值都是不准确的，我们不能通过这个来获取对象的信息，但是x1中存储的selector是准确的，如果可以找到selector也许也可以找到崩溃的对象的类，从而定位源码。

根据地址找到对应Binary Image，如果是App的地址范围，用IDA或者命令行来解析：

```
符号包位置：
XXX.app.dSYM/Contents/Resources/DWARF/XXX

首先查询UUID，判断符号文件是正确的
xcrun dwarfdump --uuid <SymbolAddress>
eg:
xcrun dwarfdump --uuid /Users/haozhicao/Downloads/dnf
UUID: 82E51E16-AA1D-39AA-BDBD-AB0AD6A13BC0 (armv7) /Users/haozhicao/Downloads/dnf
UUID: C8865298-02A3-33E4-A3F4-C68A6DC50D3A (arm64) /Users/haozhicao/Downloads/dnf

用atos命令
atos -o XXX -l <SymbolAddress> <Address>
eg:
atos -o /Users/haozhicao/Downloads/dnf -l 0x0000000102a2c000 0x0000000102f3ea48
-[GHPDnfIPUserHeaderView avatarClicked] (in dnf) (GHPDnfIPUserHeaderView.m:362)
```

如果是系统SDK，用IDA或者命令otool解析

系统符号表存储位置

```
~/Library/Developer/Xcode/iOS\ DeviceSupport/
```

```
otool -v -arch arm64e -s __TEXT __objc_methname <KitAddress> <Address>

eg:
otool -v -arch arm64e -s __TEXT __objc_methname /Users/haozhicao/Library/Developer/Xcode/iOS\ DeviceSupport/12.4\ \(16G77\)\ arm64e/Symbols/System/Library/Frameworks/UIKit.framework/UIKit 0x00000001880c17ec
-[_UIWebViewScrollViewDelegateForwarder forwardInvocation:](in UIKit)
```

