---
layout:     post
title:      "【译】Objective-C Runtime编程指南"
subtitle:   "Objective-C中Runtime的官方文档"
date:       2016-03-01 12:00:00
author:     "Ted"
header-img: "img/Runtime/bg.png"
---

苹果官方文档[Objective-C Runtime Programming Guide](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Introduction/Introduction.html#//apple_ref/doc/uid/TP40008048-CH1-SW1)

### 一、简介

Objective-C语言从编译时和链接时到运行时，推迟了尽可能多的决策。只要有可能，它就会动态地完成任务。这意味着该语言不仅需要编译器，还需要运行时系统来执行编译的代码。运行时系统作为Objective-C语言的一种操作系统来使得Objective-C工作的。

本文档查看NSObject类以及Objective-C程序如何与运行时系统交互。特别是，它检查了在运行时动态加载新类的范例，并将消息转发给其他对象。它还提供了有关如何在程序运行时查找有关对象的信息的信息。

### 二、使用Runtime

Objective-C程序与运行时系统在三个不同的层次上进行交互：通过Objective-C源代码; 通过在Foundation框架的NSObject类中定义的方法; 通过直接调用运行时功能。

#### 1、源代码

运行系统在大多数情况下自动运行在幕后。 您只需编写和编译Objective-C源代码即可使用它。

编译包含Objective-C类和方法的代码时，编译器将创建实现该语言动态特性的数据结构和函数调用。 数据结构捕获类和类别定义以及协议声明中的信息; 它们包括Objective-C编程语言中定义类和协议以及方法选择器，实例变量模板和从源代码中提取的其他信息中讨论的类和协议对象。 

主体运行时功能是发送消息的功能。

#### 2、NSObject 方法

Cocoa中的大多数对象都是NSObject类的子类，所以大多数对象继承了它所定义的方法（值得注意的例外是NSProxy类）。因此，它的方法建立了每个实例和每个类对象所固有的行为。但是，只有在少数情况下，NSObject类定义了一个模板用于如何完成某些工作。它本身不提供所有必要的代码。

例如，NSObject类定义了一个 `description` 实例方法，它返回一个描述类内容的字符串。这主要用于调试GDB `print-object`命令打印从此方法返回的字符串。 NSObject的这个方法的实现不知道这个类包含了什么，所以它返回一个字符串与对象的名字和地址。 NSObject的子类可以实现这个方法来返回更多的细节。例如，Foundation类NSArray返回它包含的对象的描述列表。

一些NSObject方法只是查询运行时系统的信息。这些方法允许对象进行内查。这种方法的例子是`class`方法，它要求一个对象来识别它的类;` isKindOfClass：`和`isMemberOfClass：`用于测试对象在继承层次结构中的位置; `respondsToSelector：`它表示一个对象是否可以接受一个特定的消息; `conformsToProtocol：`表示一个对象是否宣称要实现在特定协议中定义的方法;和`methodForSelector :,`它提供了一个方法实现的地址。像这些方法给了一个对象自省的能力。

#### 3、运行时功能

运行时系统是一个动态共享库，其公共接口由位于目录/ usr / include / objc中的头文件中的一组函数和数据结构组成。 这些函数中的许多函数允许您使用plain C来复制编译Objective-C代码时编译器的功能。 其他形成了通过NSObject类的方法导出功能的基础。 这些功能使开发运行时系统的其他接口成为可能，并生成增强开发环境的工具; 在Objective-C编程时不需要它们。 但是，在编写Objective-C程序时，有些运行时功能有时可能会很有用。

### 三、消息

#### objc_msgSend功能

在Objective-C中，消息在运行时才被绑定到方法实现。

编译器会将一个下面的一个消息表达式

```objc
[receiver message]
```

转变成一个消息函数 `objc_msgSend`，这个函数将接收者和消息中提到的方法的名称（即方法selector）作为其两个主要参数：

```
objc_msgSend(receiver, selector)
```

消息中传递的其他参数也在 `objc_msgSend`被处理

```
objc_msgSend(receiver, selector, arg1, arg2, ...)
```

消息功能可以完成动态绑定所需的一切：

- 它首先找到selector引用的procedure,也就是方法实现。 由于相同的方法可以通过不同的类别来实现，所以它寻找的准确过程取决于receiver的类别。
- 然后调用procedure，将receiver（指向其数据的指针）以及为该方法指定的所有参数传递给procedure。
- 最后，它传递procedure的返回值作为它自己的返回值。

消息传递的关键在于编译器为每个类和对象构建的结构。 每个类的结构都包括这两个基本要素：

- 指向superclass的指针
- 一个类调度表。 该表具有将方法selector与其识别的方法的类特定地址相关联的条目。` setOrigin :`方法的selector与`setOrigin :`（实现的过程）的地址相关联，`display`方法的选择器与`display`地址相关联，依此类推。

当一个新的对象被创建时，它的内存被分配，并且它的实例变量被初始化。 对象的变量中的第一个是指向其类结构的指针。 这个名为isa的指针为对象提供对其类的访问权限，并通过类访问所有从它继承的类。

类的元素和对象结构如图所示:

![img](/img/Simple/07.png)

当一个消息被发送到一个对象时，消息传递函数跟随该对象的isa指针，指向在调度表中查找方法selector的类结构。如果在那里找不到selector，objc_msgSend将跟随指向超类的指针，并尝试在其派发表中找到selector。连续失败使得objc_msgSend一直向上层结构查找，直到它到达NSObject类。一旦找到selector，objc_msgSend函数将调用在表中输入的方法，并将接收对象的数据结构传递给方法。

这是在运行时选择方法实现的方式 - 或者在面向对象编程的术语中，方法是动态绑定到消息的。

为了加速消息处理，运行时系统缓存方法的selector和地址。每个类都有一个单独的缓存，它可以包含继承方法的selector以及类中定义的方法。在搜索调度表之前，消息传递例程首先检查接收对象类的缓存（理论上曾经使用过的方法可能会再次使用）。如果方法selector在缓存中，则消息传递仅比函数调用慢一点。一旦一个程序运行了足够长的时间来“加热”它的缓存，它发送的几乎所有消息都会找到一个缓存的方法。程序运行时，缓存动态增长以适应新的消息。

#### 使用隐藏的参数

当objc_msgSend找到实现一个方法的procedure时，它会调用该procedure并将消息中的所有参数传递给该procedure。 它也传递了procedure两个隐藏的参数：

- 接收对象
- 该方法的selector

这些参数为每个方法提供了有关调用它的消息表达式的明确信息。 他们被认为是“隐藏的”，因为他们没有在定义方法的源代码中声明。 编译代码时将它们插入到实现中。

虽然这些参数没有明确的声明，但源代码仍然可以引用它们（就像它可以引用接收对象的实例变量一样）。 一个方法将接收对象称为self，并将其作为`_cmd`自己的选择器。 在下面的例子中，`_cmd`指向`strange`方法的选择器，而自己指向接收`strange`消息的对象。

```objc
- strange
{
    id  target = getTheReceiver();
    SEL method = getTheMethod();
 
    if ( target == self || method == _cmd )
        return nil;
    return [target performSelector:method];
}
```

#### 获取方法地址

规避动态绑定的唯一方法是获取方法的地址，并直接调用它，就像它是一个函数一样。 在特定的方法将被连续多次执行并且您希望避免每次执行该方法时消息的开销的情况下，这可能是适当的。

使用NSObject类`methodForSelector：`中定义的方法，可以请求一个指向实现方法的过程的指针，然后使用指针调用该过程。` methodForSelector：`返回的指针必须小心转换为正确的函数类型。 转换中应包含返回类型和参数类型。

下面的例子展示了如何调用实现setFilled：方法的过程：

```objc
void (*setter)(id, SEL, BOOL);
int i;
 
setter = (void (*)(id, SEL, BOOL))[target
    methodForSelector:@selector(setFilled:)];
for ( i = 0 ; i < 1000 ; i++ )
    setter(targetList[i], @selector(setFilled:), YES);
```

传递给procedure的前两个参数是接收对象（self）和方法选择器（_cmd）。 这些参数在方法语法中是隐藏的，但当方法被调用为函数时必须明确。

使用methodForSelector：绕过动态绑定节省了消息传递所需的大部分时间。 但是，只有在特定消息重复多次的情况下，节省量才会显着，如上面所示的for循环。

请注意，methodForSelector：由Cocoa运行时系统提供; 这不是Objective-C语言本身的特征。

### 四、动态方法解析

#### 动态解析

在某些情况下，您可能想要动态地提供方法的实现。 例如，Objective-C声明的属性功能包含@dynamic指令：

```
@dynamic propertyName;
```

它告诉编译器与属性相关的方法将被动态地提供。

您可以实现`resolveInstanceMethod：`和`resolveClassMethod`方法分别为实例和类方法的给定选择器动态提供实现。

Objective-C方法只是一个C函数，它至少需要两个参数`self`和`_cmd`。 您可以使用函数`class_addMethod`将函数添加到类中。 因此，给出以下功能：

```
void dynamicMethodIMP(id self, SEL _cmd) {
    // implementation ....
}
```

你可以动态地将它以一个方法的形式添加到一个类中 (调用 `resolveThisMethodDynamically`) 用`resolveInstanceMethod:` 

```objc
@implementation MyClass
+ (BOOL)resolveInstanceMethod:(SEL)aSEL
{
    if (aSEL == @selector(resolveThisMethodDynamically)) {
          class_addMethod([self class], aSEL, (IMP) dynamicMethodIMP, "v@:");
          return YES;
    }
    return [super resolveInstanceMethod:aSEL];
}
@end
```

转发方法（如消息转发中所述）和动态方法解决方案在很大程度上是正交的。 一个类有机会在转发机制启动之前动态地解析一个方法。如果调用了`respondsToSelector：`或`instancesRespondToSelector：`，那么动态方法解析器就有机会为选择器提供一个IMP。 如果您实现`resolveInstanceMethod：`但希望特定的选择器实际上通过转发机制转发，则您为这些选择器返回NO。

#### 动态加载

Objective-C程序可以在运行时加载和链接新的class和category。新的代码被合并到程序中，并在开始时加载class和category。

