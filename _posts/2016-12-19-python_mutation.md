---
layout:     post
category:   Python
title:      "可变与不可变"
subtitle:   "Python进阶之可变与不可变"
date:       2016-12-19 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

Python中的可变和不可变数据类型对于新程序员来说是很头疼的事情。 简而言之，可变意味着“可以改变”，而不可变意味着“不变”。看看这个例子

```python
foo = ['hi']
print(foo)
# Output: ['hi']

bar = foo
bar += ['bye']
print(foo)
# Output: ['hi', 'bye']
```

发生了什么?这个结果不是我们期望的，我们希望的是下面这种👇

```python
foo = ['hi']
print(foo)
# Output: ['hi']

bar = foo
bar += ['bye']

print(foo)
# Output: ['hi']

print(bar)
# Output: ['hi', 'bye']
```

这不是一个bug。 这是可变的操作。 每当将变量赋值给另一个可变数据类型的变量时，数据的任何变化都会被这两个变量反映出来。 新变量只是旧变量的别名。 这只适用于可变数据类型。 这是一个涉及函数与可变数据类型之间的问题：

```python
def add_to(num, target=[]):
    target.append(num)
    return target

add_to(1)
# Output: [1]

add_to(2)
# Output: [1, 2]

add_to(3)
# Output: [1, 2, 3]
```

再次，是list的可变性引起的痛苦。 在Python中，默认参数是在定义函数时计算一次的，而不是每次函数被调用都会计算一次。 除非你知道你在做什么，否则你不应该定义可变类型的默认参数。 你应该这样做：

```python
def add_to(element, target=None):
    if target is None:
        target = []
    target.append(element)
    return target
```

现在，就OK了：

```python
add_to(42)
# Output: [42]

add_to(42)
# Output: [42]

add_to(42)
# Output: [42]
```