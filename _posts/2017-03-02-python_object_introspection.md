---
layout:     post
category:   Python
title:      "对象内省"
subtitle:   "Python进阶之对象内省"
date:       2017-03-02 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

在电脑编程中，内省是对象再运行时检测自我的能力，在Python中，万物皆对象，所以我们可以去检测这些对象。Python有些自带函数和模块来帮助我们。

#### 1、dir

`dir`是最重要的内省函数之一，它会返回对象的属性和方法的列表，下面是例子：

```python
my_list = [1, 2, 3]
dir(my_list)
# Output: ['__add__', '__class__', '__contains__', '__delattr__', '__delitem__',
# '__delslice__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__',
# '__getitem__', '__getslice__', '__gt__', '__hash__', '__iadd__', '__imul__',
# '__init__', '__iter__', '__le__', '__len__', '__lt__', '__mul__', '__ne__',
# '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__reversed__', '__rmul__',
# '__setattr__', '__setitem__', '__setslice__', '__sizeof__', '__str__',
# '__subclasshook__', 'append', 'count', 'extend', 'index', 'insert', 'pop',
# 'remove', 'reverse', 'sort']
```

我们的内省给了我们所有列表方法的名字。 当你不能记得一个方法的名字时，这可能会很方便。 如果我们运行没有任何参数的`dir()`，它将返回当前作用域中的所有名称。

#### 2、type和id

`type`函数返回对象的类型，例子如下:

```python
print(type(''))
# Output: <type 'str'>

print(type([]))
# Output: <type 'list'>

print(type({}))
# Output: <type 'dict'>

print(type(dict))
# Output: <type 'type'>

print(type(3))
# Output: <type 'int'>
```

`id`返回对象的唯一标识符，比如:

```python
name = "Yasoob"
print(id(name))
# Output: 139972439030304
```

#### 3、inspect模块

`inspect`模块还提供了几个有用的功能来获取有关活着的对象的信息。 例如，您可以运行以下命令来检查对象的成员：

```python
import inspect
print(inspect.getmembers(str))
# Output: [('__add__', <slot wrapper '__add__' of ... ...
```

