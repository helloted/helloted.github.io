---
layout:     post
category:   iOS
title:      "Objective-C Runtime编程指南(2)"
subtitle:   "Objective-C中Runtime的官方文档：属性"
date:       2016-03-02 12:00:00
author:     "Ted"
header-img: "img/bg/01.png"
---

苹果官方文档[Objective-C Runtime Programming Guide](https://developer.apple.com/library/content/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Introduction/Introduction.html#//apple_ref/doc/uid/TP40008048-CH1-SW1)

### 六、类型编码

为了帮助运行时系统，编译器将字符串中每个方法的返回值和参数类型进行编码，并将字符串与方法选择器相关联。 它使用的编码方案在其他上下文中也是有用的，所以通过`@encode（）`编译器指令公开可用。 当给定类型规范时，`@encode（）`返回一个编码该类型的字符串。 这个类型可以是一个基本的类型，比如int，指针，带标签的结构体或联合体，或者是一个类名，实际上，它可以用作C `sizeof（）`运算符的参数。

```objc
char *buf1 = @encode(int **);
char *buf2 = @encode(struct key);
char *buf3 = @encode(Rectangle);
```

下表列出了类型代码。 请注意，它们中的许多与用于存档或分发的对象编码时使用的代码重叠。 但是，这里列出的代码在编写代码时不能使用，并且在编写不是由`@encode（）`生成的代码时，可能需要使用代码。 

![img](/img/Simple_3/09.png)

**重要:** Objective-C 不支持 `long double` 类型. `@encode(long double)` 返回 `d`, 与 `double`一样。

数组的类型代码用方括号括起来; 在数组类型之前，数组中元素的数目紧跟在开括号之后。 例如，一个由浮点数组成的12个指针的数组将被编码为：

```
[12^f]
```

结构在大括号内指定，而在括号内结合。 首先列出结构标签，然后是等号和结构字段的代码。 例如，结构：

```
typedef struct example {
    id   anObject;
    char *aString;
    int  anInt;
} Example;
```

会被编码成这样：

```
{example=@*i}
```

不管定义的类型名称（example）还是结构标记（example）传递给@encode（），相同的编码都会生成。 结构指针的编码携带与结构字段相同的信息量：

```
^{example=@*i}
```

但是，另一个间接级别删除了内部类型规范：

```
^^{example}
```

对象被视为结构。例如，将NSObject类名称传递给@encode（）会产生以下编码：

```
{NSObject=#}
```

 NSObject类只声明一个Class类型的实例变量isa。

请注意，尽管@encode（）指令不返回它们，但运行时系统使用下表中列出的其他编码作为类型限定符，当它们用于在协议中声明方法时。

| Code | Meaning  |
| ---- | -------- |
| `r`  | `const`  |
| `n`  | `in`     |
| `N`  | `inout`  |
| `o`  | `out`    |
| `O`  | `bycopy` |
| `R`  | `byref`  |
| `V`  | `oneway` |

### 七、声明的属性

当编译器遇到属性声明时，它会生成与包含的类，类别或协议相关联的描述性元数据。 您可以使用支持在类或协议上按名称查找属性，以@encode字符串的形式获取属性的类型以及将属性的属性列表复制为C字符串数组的函数来访问此元数据。 已声明的属性列表可用于每个类和协议。

#### 属性类型和函数

Property结构定义了一个属性描述符的不透明处理。

```
typedef struct objc_property *Property;
```

您可以使用函数`class_copyPropertyList`和`protocol_copyPropertyList`分别检索与类（包括加载的类）和协议相关的属性数组：

```Objc
objc_property_t *class_copyPropertyList(Class cls, unsigned int *outCount)
objc_property_t *protocol_copyPropertyList(Protocol *proto, unsigned int *outCount)
```

例如：

```objc
@interface Lender : NSObject {
    float alone;
}
@property float alone;
@end
```

你可以得到属性列表：

```objc
id LenderClass = objc_getClass("Lender");
unsigned int outCount;
objc_property_t *properties = class_copyPropertyList(LenderClass, &outCount);
```

你可以使用`property_getName`函数去获取属性的名称

```
const char *property_getName(objc_property_t property)
```

你可以使用函数`class_getProperty`和`protocol_getProperty`分别获取对类中给定名称的属性的引用：

```objc
objc_property_t class_getProperty(Class cls, const char *name)
objc_property_t protocol_getProperty(Protocol *proto, const char *name, BOOL isRequiredProperty, BOOL isInstanceProperty)
```

您可以使用property_getAttributes函数来发现属性的名称和@encode类型的字符串

```objc
const char *property_getAttributes(objc_property_t property)
```

把它们放在一起，你可以使用下面的代码打印一个与类关联的所有属性的list：

```objc
id LenderClass = objc_getClass("Lender");
unsigned int outCount, i;
objc_property_t *properties = class_copyPropertyList(LenderClass, &outCount);
for (i = 0; i < outCount; i++) {
    objc_property_t property = properties[i];
    fprintf(stdout, "%s %s\n", property_getName(property), property_getAttributes(property));
}
```

#### 属性类型字符串

您可以使用property_getAttributes函数来发现名称，属性的@encode类型字符串以及属性的其他属性。

该字符串以T开头，后跟@encode类型和逗号，并以V结尾，后面跟着实例变量的名称。 在这些之间，属性由以下描述符指定，用逗号分隔

| Code          | Meaning                                  |
| ------------- | ---------------------------------------- |
| `R`           | The property is read-only (`readonly`).  |
| `C`           | The property is a copy of the value last assigned (`copy`). |
| `&`           | The property is a reference to the value last assigned (`retain`). |
| `N`           | The property is non-atomic (`nonatomic`). |
| `G<name>`     | The property defines a custom getter selector name. The name follows the `G` (for example, `GcustomGetter,`). |
| `S<name>`     | The property defines a custom setter selector name. The name follows the `S` (for example, `ScustomSetter:,`). |
| `D`           | The property is dynamic (`@dynamic`).    |
| `W`           | The property is a weak reference (`__weak`). |
| `P`           | The property is eligible for garbage collection. |
| `t<encoding>` | Specifies the type using old-style encoding. |

#### Property属性描述示例

给如下定义

```objc
enum FooManChu { FOO, MAN, CHU };
struct YorkshireTeaStruct { int pot; char lady; };
typedef struct YorkshireTeaStruct YorkshireTeaStructType;
union MoneyUnion { float alone; double down; };
```

下表显示了示例属性声明和property_getAttributes返回的相应字符串：

| Property declaration                     | Property description                     |
| ---------------------------------------- | ---------------------------------------- |
| `@property char charDefault;`            | `Tc,VcharDefault`                        |
| `@property double doubleDefault;`        | `Td,VdoubleDefault`                      |
| `@property enum FooManChu enumDefault;`  | `Ti,VenumDefault`                        |
| `@property float floatDefault;`          | `Tf,VfloatDefault`                       |
| `@property int intDefault;`              | `Ti,VintDefault`                         |
| `@property long longDefault;`            | `Tl,VlongDefault`                        |
| `@property short shortDefault;`          | `Ts,VshortDefault`                       |
| `@property signed signedDefault;`        | `Ti,VsignedDefault`                      |
| `@property struct YorkshireTeaStruct structDefault;` | `T{YorkshireTeaStruct="pot"i"lady"c},VstructDefault` |
| `@property YorkshireTeaStructType typedefDefault;` | `T{YorkshireTeaStruct="pot"i"lady"c},VtypedefDefault` |
| `@property union MoneyUnion unionDefault;` | `T(MoneyUnion="alone"f"down"d),VunionDefault` |
| `@property unsigned unsignedDefault;`    | `TI,VunsignedDefault`                    |
| `@property int (*functionPointerDefault)(char *);` | `T^?,VfunctionPointerDefault`            |
| `@property id idDefault;`Note: the compiler warns: `"no 'assign', 'retain', or 'copy' attribute is specified - 'assign' is assumed"` | `T@,VidDefault`                          |
| `@property int *intPointer;`             | `T^i,VintPointer`                        |
| `@property void *voidPointerDefault;`    | `T^v,VvoidPointerDefault`                |
| `@property int intSynthEquals;`In the implementation block:`@synthesize intSynthEquals=_intSynthEquals;` | `Ti,V_intSynthEquals`                    |
| `@property(getter=intGetFoo, setter=intSetFoo:) int intSetterGetter;` | `Ti,GintGetFoo,SintSetFoo:,VintSetterGetter` |
| `@property(readonly) int intReadonly;`   | `Ti,R,VintReadonly`                      |
| `@property(getter=isIntReadOnlyGetter, readonly) int intReadonlyGetter;` | `Ti,R,GisIntReadOnlyGetter`              |
| `@property(readwrite) int intReadwrite;` | `Ti,VintReadwrite`                       |
| `@property(assign) int intAssign;`       | `Ti,VintAssign`                          |
| `@property(retain) id idRetain;`         | `T@,&,VidRetain`                         |
| `@property(copy) id idCopy;`             | `T@,C,VidCopy`                           |
| `@property(nonatomic) int intNonatomic;` | `Ti,VintNonatomic`                       |
| `@property(nonatomic, readonly, copy) id idReadonlyCopyNonatomic;` | `T@,R,C,VidReadonlyCopyNonatomic`        |
| `@property(nonatomic, readonly, retain) id idReadonlyRetainNonatomic;` | `T@,R,&,VidReadonlyRetainNonatomic`      |