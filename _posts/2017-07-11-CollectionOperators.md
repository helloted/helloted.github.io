---
layout:     post
title:      "KVC Collection Operators"
subtitle:   "通过集合操作运算符来处理数据"
date:       2017-12-14 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 一、使用集合运算

[苹果官方文档](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/KeyValueCoding/CollectionOperators.html#//apple_ref/doc/uid/20002176-BAJEAIEE)

```objc
NSNumber *transactionAverage = [self.transactions valueForKeyPath:@"@avg.amount"];
```

当你发送符合键值的对象`valueForKeyPath：`消息时，可以在key path中嵌入一个集合运算符。 一个集合运算符是一个小的关键字列表之一，前面有一个符号（@），它指定了getter在返回之前以某种方式对数据进行处理。NSObject提供的`valueForKeyPath`默认实现实现了这种行为。

当 key path包含了集合运算符时，运算符之前的 key path的部分（称为左键路径）指明了该消息的接收方的集合。 如果将消息直接发送到集合对象（例如`NSArray`实例），则可以省略左侧的key path（如上方的例子）。

运算符之后的部分（称为右键路径）指定运算符符应该在集合内操作的属性。 除了@count以外的所有集合运算符都需要一个正确的键路径。

![img](/img/Simple_2/17.jpg)

集合运算有三种类型的运算:

- [Aggregation Operators](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/KeyValueCoding/CollectionOperators.html#//apple_ref/doc/uid/20002176-SW5)(聚合运算) 以某种方式合并集合的对象，并返回一个通常与右键路径中指定的属性的数据类型相匹配的对象。 @count运算符是一个例外，它不需要右键路径，总是返回一个NSNumber实例。 
- [Array Operators](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/KeyValueCoding/CollectionOperators.html#//apple_ref/doc/uid/20002176-SW7) (数组运算)： 返回一个NSArray实例，该实例包含指定集合中的一些对象子集。
- [Nesting Operators](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/KeyValueCoding/CollectionOperators.html#//apple_ref/doc/uid/20002176-SW9) (嵌套运算)：处理包含其他集合的集合，并根据运算符返回一个NSArray或NSSet实例，这个实例以某种方式组合嵌套集合的对象。

### 二、聚合运算

有一个简单实例

```objc
@interface Transaction : NSObject
 
@property (nonatomic) NSString* payee;   // To whom
@property (nonatomic) NSNumber* amount;  // How much
@property (nonatomic) NSDate* date;      // When
 
@end

```

有一个数组self.transactions包含了一些对象的数据

| payee values    | amount values formatted as currency | date values formatted as month day, year |
| --------------- | ----------------------------------- | ---------------------------------------- |
| Green Power     | $120.00                             | Dec 1, 2015                              |
| Green Power     | $150.00                             | Jan 1, 2016                              |
| Green Power     | $170.00                             | Feb 1, 2016                              |
| Car Loan        | $250.00                             | Jan 15, 2016                             |
| Car Loan        | $250.00                             | Feb 15, 2016                             |
| Car Loan        | $250.00                             | Mar 15, 2016                             |
| General Cable   | $120.00                             | Dec 1, 2015                              |
| General Cable   | $155.00                             | Jan 1, 2016                              |
| General Cable   | $120.00                             | Feb 1, 2016                              |
| Mortgage        | $1,250.00                           | Jan 15, 2016                             |
| Mortgage        | $1,250.00                           | Feb 15, 2016                             |
| Mortgage        | $1,250.00                           | Mar 15, 2016                             |
| Animal Hospital | $600.00                             | Jul 15, 2016                             |

#### @avg求某个属性平均值

```
NSNumber *transactionAverage = [self.transactions valueForKeyPath:@"@avg.amount"];
```

这个可以求得`amount`属性的平均值

#### @count集合里对象的数量

```
NSNumber *numberOfTransactions = [self.transactions valueForKeyPath:@"@count"];
```

可以求得集合里对象的总数量

#### @max某个属性的最大值

```
NSDate *latestDate = [self.transactions valueForKeyPath:@"@max.date"];
```

可以得到`date`这个属性的最大值

#### @min某个属性的最小值

```
NSDate *earliestDate = [self.transactions valueForKeyPath:@"@min.date"];
```

可以得到`date`这个属性的最小值

#### @sum某个属性的总和

```
NSNumber *amountSum = [self.transactions valueForKeyPath:@"@sum.amount"];
```

可以得到`amount`这个属性的总和

### 三、数组运算

> The array operators cause `valueForKeyPath:` to return an array of objects corresponding to a particular set of the objects indicated by the right key path.

会根据键值路径返回一个对应的数组

#### @distinctUnionOfObjects 某个属性的值的数组（去重）

```
NSArray *distinctPayees = [self.transactions valueForKeyPath:@"@distinctUnionOfObjects.payee"];
```

会得到payee这个属性的的值，里面的值会去重

#### @unionOfObjects某个属性的所有值的数组（未去重）

```
NSArray *payees = [self.transactions valueForKeyPath:@"@unionOfObjects.payee"];
```

会得到payee这个属性的的值，与上面那个不一样，里面的值不会去重

### 四、嵌套运算

> The nesting operators operate on nested collections, where each entry of the collection itself contains a collection.

嵌套运算操作在嵌套集合(一个集合里包含了另外的集合)

> The `valueForKeyPath:` method raises an exception if any of the leaf objects is `nil` when using nesting operators.

有任何子对象为空，会出错。

我们增加一个数组进行嵌套

```
NSArray* moreTransactions = @[<# transaction data #>];
NSArray* arrayOfArrays = @[self.transactions, moreTransactions];
```

#### @distinctUnionOfArrays 返回某个属性不同值

```
NSArray *collectedDistinctPayees = [arrayOfArrays valueForKeyPath:@"@distinctUnionOfArrays.payee"];
```

会返回两个数组里payee属性不同的值，与 `@unionOfArrays`类似，但是不会去重。

#### @distinctUnionOfSets 返回的是NSSet类型

#### @unionOfArrays 返回某个属性所有的值

```
NSArray *collectedPayees = [arrayOfArrays valueForKeyPath:@"@unionOfArrays.payee"];
```

返回两个数组里payee属性所有的值，且不去重