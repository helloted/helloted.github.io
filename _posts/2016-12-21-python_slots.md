---
layout:     post
category:   Python
title:      "__slots__魔法"
subtitle:   "Python进阶之__slots__魔法"
date:       2016-12-21 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

在Python中，每个类都可以有实例属性。 默认情况下，Python使用一个字典来存储一个对象的实例属性。 这是非常有用的，因为它允许在运行时设置任意的新属性。

但是，对于具有已知属性的小类，它可能是一个瓶颈。 Dict浪费了大量的RAM。 Python不能只在对象创建时分配静态内存来存储所有的属性。 因此，如果你创建了大量的对象（成千上万），它会占用大量的内存。 仍然有办法绕过这个问题。 它涉及到`__slots__`的用法，使Python不使用字典，只给一组固定的属性分配空间。 下面是一个有和没有`__slots__`的例子：

没有`__slots__`

```python
class MyClass(object):
    def __init__(self, name, identifier):
        self.name = name
        self.identifier = identifier
        self.set_up()
    # ...
```

有`__slots__`

```Python
class MyClass(object):
    __slots__ = ['name', 'identifier']
    def __init__(self, name, identifier):
        self.name = name
        self.identifier = identifier
        self.set_up()
    # ...
```

#### 减少内存

第二种代码将减轻你的RAM的占用。 通过使用这种技术可以减少几乎40％到50％的RAM使用量。

下面你可以看到一个例子，显示在`__slots__`中完成的确切的内存使用情况，其中的[iPython](https://github.com/ianozsvald/ipython_memory_usage)

```
Python 3.4.3 (default, Jun  6 2015, 13:32:34)
Type "copyright", "credits" or "license" for more information.

IPython 4.0.0 -- An enhanced Interactive Python.
?         -> Introduction and overview of IPython's features.
%quickref -> Quick reference.
help      -> Python's own help system.
object?   -> Details about 'object', use 'object??' for extra details.

In [1]: import ipython_memory_usage.ipython_memory_usage as imu

In [2]: imu.start_watching_memory()
In [2] used 0.0000 MiB RAM in 5.31s, peaked 0.00 MiB above current, total RAM usage 15.57 MiB

In [3]: %cat slots.py
class MyClass(object):
        __slots__ = ['name', 'identifier']
        def __init__(self, name, identifier):
                self.name = name
                self.identifier = identifier

num = 1024*256
x = [MyClass(1,1) for i in range(num)]
In [3] used 0.2305 MiB RAM in 0.12s, peaked 0.00 MiB above current, total RAM usage 15.80 MiB

In [4]: from slots import *
In [4] used 9.3008 MiB RAM in 0.72s, peaked 0.00 MiB above current, total RAM usage 25.10 MiB

In [5]: %cat noslots.py
class MyClass(object):
        def __init__(self, name, identifier):
                self.name = name
                self.identifier = identifier

num = 1024*256
x = [MyClass(1,1) for i in range(num)]
In [5] used 0.1758 MiB RAM in 0.12s, peaked 0.00 MiB above current, total RAM usage 25.28 MiB

In [6]: from noslots import *
In [6] used 22.6680 MiB RAM in 0.80s, peaked 0.00 MiB above current, total RAM usage 47.95 MiB
```

#### 限制属性

如果在定义class时，定义了`__slots__`变量，可以用来现在属性

```python
>>> class Student(object):
...     __slots__ = ('name', 'age') # 用tuple定义允许绑定的属性名称
...
```

试试

```python
>>> s = Student() # 创建新的实例
>>> s.name = 'Michael' # 绑定属性'name'
>>> s.age = 25 # 绑定属性'age'
>>> s.score = 99 # 绑定属性'score'
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
AttributeError: 'Student' object has no attribute 'score'
```

由于`'score'`没有被放到`__slots__`中，所以不能绑定`score`属性，试图绑定`score`将得到AttributeError的错误。

使用`__slots__`要注意，`__slots__`定义的属性仅对当前类起作用，对继承的子类是不起作用的。