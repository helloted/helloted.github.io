---
layout:     post
title:      "iOS设计模式"
subtitle:   "iOS开发中常用的一些设计模式"
date:       2017-09-08 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

部分代码位置[Github-设计模式](https://github.com/helloted/designpattern)

> 创建型

- 单件模式
- 工厂模式
- 抽象工厂模式
- 创建者模式
- 原型模式

> 结构型

- 组合模式

- 外观模式
- 适配器模式
- 桥模式
- 装饰模式
- 享元模式
- 代理模式

> 行为型

- 命令模式
- 观察者模式
- 策略模式
- 职责模式
- 模板模式
- 中介者模式
- 解释器模式

#### 1、单例模式(Singleton)

概念理解：整个应用或系统只能有该类的一个实例

iOS中几个常用的单例：

- UIApplication类提供了 ＋sharedAPplication方法创建和获取UIApplication单例
- NSBundle类提供了 +mainBunle方法获取NSBundle单例
- NSFileManager类提供了 ＋defaultManager方法创建和获得NSFileManager单例。（PS：有些时候我们得放弃使用单例模式，使用－init方法去实现一个新的实例，比如使用委托时）
- NSNotificationCenter提供了 ＋defaultCenter方法创建和获取NSNotificationCenter单例（PS：该类还遵循了另一个重要的设计模式：观察者模式）
- NSUserDefaults类提供了 ＋defaultUserDefaults方法去创建和获取NSUserDefaults单例

我们也可以自己去生成一个单例

```
+ (SingleObject *)sharedSingleton{
    static SingleObject *_singleObj = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _singleObj = [[self alloc] init];
    });
    return _singleObj;
}
```

#### 2、MVC模式

MVC是Cocoa框架采用推荐的一种设计模式，也是iOS开发中最常用的一种模式，是由各种类型的设计模式组成的复合结构

`M-Model:` “模型”封装应用程序的数据，模型对象维护应用程序的数据，并定义操作数据的特定逻辑。模型对象可以复用，因为它表示的知识适用于特定问题的领域。理想状况下，模型对象同用于进行显示和编辑的用户界面之间不应有任何直接的关联。

`V-View`: “视图”显示和编辑数据，视图对象可以响应用户操作。

`C-Controller`: “控制器”处理前两者之间的逻辑关系。控制器对象作为中间人或者协调人，使视图得以知晓模型的变更而给予响应。控制器对象还可以作为管理其他对象的生命周期，进行设置和协调任务。

#### 3、原型模式(Prototype)

概念：使用原型实例指定对象的种类，并通过复制这个原型创建新的对象，原型模型也称为复制模式，此模式是生成对象的真实副本，以用作同一环境下其他相关事物的基础(原型)

应用：NSObject的派生类提供了实现深复制的协议，其他类需要实现NSCopying协议及其方法`-(id)copyWithZone:(NSZone *)zone`来实现`-(id)copy`方法，否则会引发异常。思路是复制必需的成员变量与资源，传给此类的新实例。

#### 4、简单工厂模式(Simple Factory)

概念：提供一个创建实例的接口，根据传入值不一样来获取不一样的类

应用：

```
@interface AnimalFactory:NSObject
-(Animal *)createAnimalyWithType:(Type)type;
@end;
```

#### 5、工厂方法模式(Factory Method)

概念：封装类中不变的部分，提取其中个性化善变的部分为独立类，通过依赖注入以达到解耦、复用和方便后期维护拓展的目的.定义一个创建产品对象的工厂接口，将实际创建工作推迟到子类当中

应用：

```
@interface AnimalFactory:NSObject
-(Animal*)createAnimal;
@end;
```

```
@interface DogFactory:AnimalFactory;
@implementation DogFactory
-(Animal *)createAnimal{
#Dog继承自Animal
retrurn [[Dog alloc]init];
}
```

```
@interface CatFactory:AnimalFactory;
@implementation Cat Factory
-(Animal *)createAnimal
retrurn [[Cat alloc]init];
}
```

#### 6、抽象工厂模式(Abstract Factory)

概念：提供一个创建一系列相关或者相互依赖对象的接口，而无需指定它们具体的类

应用：

```
@interface AnimalFactory:NSObject
-(Dog *)createDog;
-(Cat *)createCat;
@end;
```

Cocoa中的NSNumber也是如此，numberWithBool:和numberWithInt:分别返回的是NSCFBoolean、NSCFNumber类型

#### 7、生成器模式(Builder)

概念：将一个复杂对象的构建与它的表现分离，通过分层来构建对象。领导者->生成者->产品。领导者提供原料，生产者去实现加工成产品，不同的生产者提供不同等级的产品

应用：[Github-设计模式](https://github.com/helloted/designpattern)

与抽象工厂模式的区别：

- 生成器构建复杂对象，抽象工厂构建简单或者复杂对象；
- 生成器以多个步骤构建对象，抽象工厂以单一步骤构建对象；
- 生成器以多种方式构建对象昂，抽象工厂以单一步骤构建对象；
- 生成器在构建过程的最后一步返回产品，抽象工厂立刻返回产品；
- 生成器专注一个特定产品的不同等级，抽象工厂强调一套产品。


#### 8、适配器模式(Adapter)

概念：有时也称为“包装器”(Wrapper)，用于连接两种不同种类的对象，使其毫无问题地协同工作，将一个类的接口转换成客户希望的另外一个接口

应用：`-(void)laodData:(AModel*)model ;`,我们的视图需要一个AModel，但此时有一个BModel，就需要一个适配器来适配BModel,`-(AModel *)adapterfrom(BModel *)model`

优点：

解耦合，让视图类不合数据类产生耦合，使视图类更加独立。  新增加数据类的时候不需要修改视图类。

缺点：

会新增加很多类，使系统更凌乱，代码可读性更弱了。

#### 9、桥接模式(Bridge)

概念：桥接模式的目的是把抽象层次结构从其实现中分离出来，使其能够独立变更。抽象层定义了供客户端使用的上层的抽象接口。实现层定义了供抽象层使用的底层接口。实现类的引用被封装于抽象层的实例中，桥接就形成。（与外观模式有一定的相似之处）。

应用：[桥接模式-Bridge](https://github.com/helloted/designpattern/tree/master/Designpattern/DesignPattern/Bridge)

优点：

桥接模式使用聚合关系，解耦了抽象和实现之间固有的绑定关系，使得抽象和实现可以沿着各自的维度来变化。
提高了系统的可扩展性，可以独立地对抽象部分和实现部分进行扩展。
可减少子类的个数，这个在前面讲手机示例的时候进行分析了。

缺点：桥接模式的引入会增加系统的理解与设计难度，由于聚合关系建立在抽象层，要求开发者针对抽象进行设计与编程。
桥接模式要求正确识别出系统中两个独立变化的维度，因此其使用范围具有一定的局限性。

#### 10、外观模式(Facade)

概念：为系统中的一组接口提供一个统一的接口

应用：

```
@interface Facade : NSObject
- (void)createApp
@end

@implementation NSObject

- (instancetype)init
{
    self = [super init];
    if (self) {
        ios_dev = [[IosDev alloc] init];
        andriod_dev = [[AndroidDev alloc] init];
        server_dev = [[ServerDev alloc] init];
    }
    return self;
}

- (void)createApp{
  [ios_dev ios]
  [andriod_dev android]
  [server_dev server]
}
```

#### 11、中介者模式(Mediator)

概念：用一个对象来封装一系列对象的交互方式，中介者使各对象不需要显式地相互引用，从而使其耦合松散。

应用：

![img](/img/Simple_1/07.png)

![img](/img/Simple_1/08.png)

[中介者模式-Mediator](https://github.com/helloted/designpattern/tree/master/Designpattern/DesignPattern/Mediator)

#### 12、观察者模式(Observer)

概念：定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都得到通知并被自动更新

应用：Notification、KVO。

#### 13、组合模式(Composite)

概念：把具有相同基类类型的对象组合到树形结构中，以表示“部分－整体”的层次结构，使得用户对单个对象和组合对象的使用具有一致性。组合模式使得树形结构中的每个节点都具有相同的抽象接口，整个结构可作为一个统一的抽象结构使用，而不暴露其内部表示。每个节点的任何操作，可以通过抽象基类中定义的相同接口来进行。

应用：UIView对象被组合成一个树形结构，UIView对象可以包含其他的UIView对象。这种组合方式便于统一用于事件处理，例如处理渲染事件时，事件会在父视图中被处理，然后在传递给子视图，因为他们都是相同的类型，事件可以传递到树形结构的每一视图。

优点：

- 可以使用简单的基本对象组合成较为复杂的组合对象，复杂组合对象又可以组合成更为复杂的对象，如此递归循环。但是使用简单对象和使用复杂组合对象是无差别的
- 简化客户单代码，同时使得创建同类型的复杂对象更简单。因为客户端不需要区分单个对象还是组合对象，所以不必写if-else之类的各种判断 

#### 14、迭代器模式(Composite)

概念：提供一种方法顺序访问一个聚合对象中各个元素，而又不需暴露该对象的内部表示

应用：NSEnumerator,`enumerateObjectsUsingBlock:(void(^)(id obj, NSUInteger idx, BOOL *stop))block`  等等

```
@interface Iterator:NSObject
-(id)First;
-(id)Next;
-(BOOL)IsDone;
-(id)CurrentItem;
@end
```

#### 15、访问者模式(Vistor)

概念：表示一个作用于表示一个作用于某对象结构中的各个元素的操作，它让我们可以在不改变各元素的类的前提下定义作用于这些元素的新操作 

应用：这用于某个对象结构中的元素数目比较固定（基本不会变动），而对于这些元素的操作可能要变化（增加新操作），vistor提供了在某个状态下，对对象结构中各元素的不同操作的访问接口，对象中使用accept接口接受一个具体的访问者。符合open-close原则。

访问者模式适用于数据结构相对稳定的系统，它把数据结构和作用于结构上的操作之间的耦合解开，使得操作集合可以相对自由地演化。

访问者模式的优点就是增加新的操作很容易，因为增加新的操作就意味着增加一个新的访问者。访问者模式将有关的行为集中到一个访问者对象中。缺点是是增加新的数据结构变得复杂

#### 16、装饰者模式(Decorator)

概念：是面向对象编程领域中，一种动态地往一个类中添加新的行为的设计模式。就功能而言，修饰模式相比生成子类更为灵活，这样可以给某个对象而不是整个类添加一些功能

应用：Category,Delegate

#### 17、责任链模式(Chain of Responsibility)

概念：使多个对象都有机会处理请求，从而避免请求的发送者和接收者之间发生耦合。此模式将这些对象连成一条链，并沿着这条链传递请求，直到有一个对象处理它为止。

应用：响应者链条

**优点：**

降低耦合度。
可简化对象的相互连接。
增强给对象指派职责的灵活性。
增加新的请求处理类很方便。

**缺点：**

不能保证请求一定被接收。
系统性能将受到一定影响，而且在进行代码调试时不太方便（可能会造成循环调用）。

#### 18、模板方法模式(Template Method)

概念：定义一个操作中的算法的骨架，而将一些步骤延迟到子类中。模板方法使得子类可以不改变一个算法的结构即可重定义该算法的某些特定步骤。核心思想就是通过把不变的行为搬移到超类，去除子类中的重复代码来体现它的优势。其实，模板方法模式就是提供了一个很好的代码复用平台。定义一个父类，有父类定义接口规范，然后不同的行为在子类中实现。这样一方面提高了代码的复用性，另一方面还可以利用面向对象的多态性，在运行时选择一种具体子类

应用：`-(void)drawRect:(CGRect)rect`

> 模板模式和策略模式的不同点：

（1）策略模式的应用场景:

- 多个类的区别只是在于行为不同。
- 你需要行为的算法做很多变动。
- 客户端不知道算法使用的数据。

（2）模板模式的使用场景：

- 相同的算法放在一个类中（父类）将算法变化的部分放在子类中。
- 子类公共的算法放在一个公共类中，避免代码重复。


#### 19、策略模式(Strategy)

概念：定义了一系列的算法，并将每一个算法封装起来，而且使它们还可以相互替换。策略模式让算法独立于使用它的客户而独立变化。策略模式是对算法的包装，是把使用算法的责任和算法本身分割开来，委派给不同的对象管理。看到策略模式的时候有的时候跟简单工厂相比较，其实有很大的迷惑性，都是继承多态感觉没有太大的差异性，简单工厂模式是对对象的管理，策略模式是对行为的封装。

应用：[策略模式demo](https://github.com/helloted/designpattern/tree/master/Designpattern/DesignPattern/Strategy)

优点：
1、 策略模式提供了管理相关的算法族的办法。策略类的等级结构定义了一个算法或行为族。恰当使用继承可以把公共的代码转移到父类里面，从而避免重复的代码。
2、 策略模式提供了可以替换继承关系的办法。继承可以处理多种算法或行为。如果不是用策略模式，那么使用算法或行为的环境类就可能会有一些子类，每一个子类提供一个不同的算法或行为。但是，这样一来算法或行为的使用者就和算法或行为本身混在一起。决定使用哪一种算法或采取哪一种行为的逻辑就和算法或行为的逻辑混合在一起，从而不可能再独立演化。继承使得动态改变算法或行为变得不可能。
3、 使用策略模式可以避免使用多重条件转移语句。多重转移语句不易维护，它把采取哪一种算法或采取哪一种行为的逻辑与算法或行为的逻辑混合在一起，统统列在一个多重转移语句里面，比使用继承的办法还要原始和落后。
缺点：
1、客户端必须知道所有的策略类，并自行决定使用哪一个策略类。这就意味着客户端必须理解这些算法的区别，以便适时选择恰当的算法类。换言之，策略模式只适用于客户端知道所有的算法或行为的情况。
2、 策略模式造成很多的策略类，每个具体策略类都会产生一个新类。有时候可以通过把依赖于环境的状态保存到客户端里面，而将策略类设计成可共享的，这样策略类实例可以被不同客户端使用。换言之，可以使用享元模式来减少对象的数量。

#### 20、命令模式(Command)

概念：将请求封装成对象，以便使用不同的请求、日志、队列等来参数化其他对象。命令模式也支持撤销操作。这个封装请求比原始的请求要灵活并且可以在对象之前被传递，存储，动态修改或者放进队列里面。一般在想让应用程序支持撤销与恢复的情况下使用这一模式。

应用：Target-Action机制和NSInvocation

#### 21、享元模式(Flyweight)

概念：复用我们内存中已存在的对象，降低系统创建对象实例的性能消耗。

应用：UITableViewCell复用

#### 22、代理模式(Proxy)

概念：为其他对象提供一种代理以控制对这个对象的访问。

应用：Delegate

#### 23、备忘录模式(Memento)

概念：在不破坏封装的前提下，捕获一个对象的内部状态，以后可以将该对象回复到原先保存的状态

应用：对象序列化保存



