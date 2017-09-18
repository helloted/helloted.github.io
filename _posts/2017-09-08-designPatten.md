---
layout:     post
title:      "iOS设计模式"
subtitle:   "iOS开发中常用的一些设计模式"
date:       2017-09-08 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

部分代码位置[Github-设计模式](https://github.com/helloted/designpattern)

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

MVC是Cocoa框架采用推荐的一种设计模式，也是iOS开发中最常用的一种模式

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

应用：[Bridge](https://github.com/helloted/designpattern/tree/master/Designpattern/DesignPattern/Bridge)

优点：

桥接模式使用聚合关系，解耦了抽象和实现之间固有的绑定关系，使得抽象和实现可以沿着各自的维度来变化。
提高了系统的可扩展性，可以独立地对抽象部分和实现部分进行扩展。
可减少子类的个数，这个在前面讲手机示例的时候进行分析了。

缺点：桥接模式的引入会增加系统的理解与设计难度，由于聚合关系建立在抽象层，要求开发者针对抽象进行设计与编程。
桥接模式要求正确识别出系统中两个独立变化的维度，因此其使用范围具有一定的局限性。






