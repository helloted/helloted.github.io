---
layout:     post
title:      "【译】Objective-C Runtime编程指南(1)"
subtitle:   "Objective-C中Runtime的官方文档：消息"
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

![img](/img/Simple_3/07.png)

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

### 五、消息转发

发送消息给一个不处理该消息的对象是一个错误。 但是，在声明错误之前，运行时系统给接收对象第二次机会来处理消息。

#### 转发

如果您发送消息给一个不处理该消息的对象，那么在声明错误之前，运行时会给该对象发送一个带有NSInvocation对象作为唯一参数的`forwardInvocation：`消息 

你可以实现一个`forwardInvocation：`方法来给消息一个默认的响应，或者以某种方式避免错误。顾名思义，`forwardInvocation：`通常用于将消息转发给另一个对象。

为了看到转发的范围和意图，想象下面的情况：

首先，假设你正在设计一个可以响应一个名为`negotiate`的消息的对象，并且你希望它的响应包含另一种对象的响应。您可以通过将`negotiate`消息传递给您实现的`negotiate`方法的主体中的其他对象。

更进一步，假设您希望对象对`negotiate`消息的响应完全是在另一个类中实现的响应。一种方法是使你的类继承另一个类的方法。但是，这样安排事情可能是不可能的。可能有很好的理由，为什么你的类和实现`negotiate`的类是在继承层次结构的不同分支。

即使你的类不能继承`negotiate`方法，你仍然可以通过实现一个简单地将消息传递给另一个类的实例的方法来“借”它：

```objc
- (id)negotiate
{
    if ( [someOtherObject respondsTo:@selector(negotiate)] )
        return [someOtherObject negotiate];
    return self;
}
```

这种做事的方式可能会有点麻烦，特别是如果有一些信息，你希望你的对象传递给另一个对象。 你必须实施一种方法来涵盖你想从其他类借用的每种方法。 而且，在你编写代码的时候，你不可能处理你不知道的情况，你可能想要转发的全部消息。 该集合可能取决于运行时的事件，并且可能会随着新的方法和类的实现而改变。

`forwardInvocation：`消息提供的第二个机会为这个问题提供了一个不太临时的解决方案，而且是一个动态而不是静态的解决方案。 它的工作原理如下：当一个对象由于没有与消息中的选择符匹配的方法而无法响应消息时，运行时系统会通过发送`forwardInvocation：`消息来通知对象。 每个对象都继承NSObject类的`forwardInvocation：`方法。 但是，NSObject的版本只是调用`doesNotRecognizeSelector :`. 通过覆盖NSObject的版本并实现自己的版本，您可以利用`forwardInvocation：`消息提供的将消息转发给其他对象的机会。

要转发一个消息,  `forwardInvocation:` 方法里需要做的是:

- 检测这个消息需要发送到哪里，然后
- 用原来的参数发送到那里去

消息可以使用`invokeWithTarget：`方法发送：

```objc
- (void)forwardInvocation:(NSInvocation *)anInvocation
{
    if ([someOtherObject respondsToSelector:
            [anInvocation selector]])
        [anInvocation invokeWithTarget:someOtherObject];
    else
        [super forwardInvocation:anInvocation];
}
```

被转发的消息的返回值将返回给原始发送者。 可以将所有类型的返回值传递给发送者，包括id，结构和双精度浮点数。

`forwardInvocation：`方法可以充当无法识别的消息的分发中心，将其分发给不同的接收者。 或者它可以是一个中转站，将所有信息发送到同一个目的地。 它可以将一条消息翻译成另一条消息，或者简单地“吞下”一些消息，所以没有响应，也没有错误。 `forwardInvocation：`方法也可以将多个消息合并为一个响应。  `forwardInvocation：`做的是实现者。 但是，它提供的链接转发链中对象的机会为程序设计提供了可能性。

注意：forwardInvocation：方法只有在不调用名义接收方中的现有方法时才能处理消息。 例如，如果您希望您的对象将`negotiate`消息转发给另一个对象，则不能拥有自己的`negotiate`方法。 如果有这个方法，该消息永远不会达到`forwardInvocation:`

#### 转发与多重继承

转发消息模仿继承，可以用来为Objective-C程序提供多重继承的一些效果。 如图所示，通过转发消息来响应消息的对象似乎借用或“继承”了另一个类中定义的方法实现。

![img](/img/Simple_3/08.gif)

在这个例子中，Warrior类的一个实例将协商消息转发给Diplomat类的一个实例。Warrior似乎会像Diplomat一样进行negotiate。它似乎对negotiate信息作出了回应，并且为了所有的实际目的，它确实做出了回应（尽管这是一个真正的Diplomat做的工作）。

转发消息的对象因此从继承层次的两个分支（它自己的分支）和响应该消息的对象的分支“继承”方法。在上面的例子中，看起来好像Warrior类继承了Diplomat以及它自己的超类。

转发提供了您通常希望从多重继承中获得的大部分功能。但是，两者之间有一个重要的区别：多重继承在一个对象中组合了不同的功能。它倾向于大而多面的物体。另一方面，转发将不同的责任分配给不同的对象。它将问题分解成更小的对象，但是以对消息发送者透明的方式关联这些对象。

#### 代理对象

转发不仅可以模仿多重继承，而且还可以开发用以代表或“覆盖”更多实体对象的轻量级对象。代理人代表另一个对象，并向其发送消息。

在“Objective-C”中的“远程消息传递”中讨论的代理就是这样的代理。代理负责将消息转发到远程接收方的管理细节，确保参数值在连接中被复制和检索，等等。但是它并没有试图去做其他的事情。它不会复制远程对象的功能，只是给远程对象一个本地地址，一个可以在另一个应用程序中接收消息的地方。

其他类型的代理对象也是可能的。例如，假设你有一个操纵大量数据的对象 - 可能会创建一个复杂的图像或读取磁盘上文件的内容。设置这个对象可能会非常耗时，所以您宁愿懒惰地去做 - 当真正需要时或系统资源暂时闲置时。同时，为了使应用程序中的其他对象正常工作，至少需要该对象的占位符。

在这种情况下，你最初可以创建，而不是完整的对象，而是一个轻量级的替代品。这个对象可以自己做一些事情，比如回答关于数据的问题，但是大多数情况下它只是为更大的对象提供一个地方，并且当时间到了时，将消息转发给它。当代理的`forwardInvocation：`方法首先收到发往其他对象的消息时，它将确保该对象存在，如果没有，则会创建该消息。所有更大的对象的消息都通过代理，所以就程序其余部分而言，代理和更大的对象将是相同的。

#### 转发和继承

虽然转发模仿继承，NSObject类永远不会混淆两者。 像respondsToSelector：和isKindOfClass这样的方法：只能查看继承层次结构，而不能查看转发链。 例如，如果询问Warrior对象是否响应`negotiate`消息:

```
if ( [aWarrior respondsToSelector:@selector(negotiate)] )
    ...
```

答案是NO，尽管它可以接受这个消息并且无误地回复。

在很多情况下，NO是正确的答案。 但它也可能不是。 如果使用转发来设置代理对象或扩展类的功能，则转发机制应该与继承一样透明。 如果你希望你的对象的行为好像他们真的继承了它们转发消息的对象的行为，你需要重新实现`respondsToSelector：`和`isKindOfClass：`方法来包含你的转发算法：

```objc
- (BOOL)respondsToSelector:(SEL)aSelector
{
    if ( [super respondsToSelector:aSelector] )
        return YES;
    else {
        /* Here, test whether the aSelector message can     *
         * be forwarded to another object and whether that  *
         * object can respond to it. Return YES if it can.  */
    }
    return NO;
}
```

除了`respondsToSelector：`和`isKindOfClass：`之外，`instancesRespondToSelector：`方法也应该镜像转发算法。 如果使用协议，`conformsToProtocol：`方法同样应该被添加到列表中。 类似地，如果一个对象转发它接收到的任何远程消息，它应该有一个版本的`methodSignatureForSelector：`它可以返回最终响应转发消息的方法的准确描述; 例如，如果某个对象能够将消息转发给其代理，则可以实现`methodSignatureForSelector：`如下所示：

```objc
- (NSMethodSignature*)methodSignatureForSelector:(SEL)selector
{
    NSMethodSignature* signature = [super methodSignatureForSelector:selector];
    if (!signature) {
       signature = [surrogate methodSignatureForSelector:selector];
    }
    return signature;
}
```

您可能会考虑将转发算法放在私有代码中，并使用`forwardInvocation：`included方法调用它。

