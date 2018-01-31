---
layout:     post
category:   Python
title:      "Lambdas表达式"
subtitle:   "Python进阶之Lambdas表达式"
date:       2017-03-02 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

Lambdas是一行函数。 他们在其他语言也被称为匿名函数。 如果您不想在程序中用某个函数用两次，您可能需要使用lambda表达式。 他们就像普通函数一样表现功能。

样本

```Python
lambda argument: manipulate(argument)
```

例子

```python
add = lambda x, y: x + y

print(add(3, 5))
# Output: 8
```

下面是lambdas的一些有用的用例:

```python
a = [(1, 2), (4, 1), (9, 10), (13, -3)]
a.sort(key=lambda x: x[1])

print(a)
# Output: [(13, -3), (4, 1), (1, 2), (9, 10)]
```

这个按照元组第二个元素排序列表

```python
data = zip(list1, list2)
data.sort()
list1, list2 = map(lambda t: list(t), zip(*data))
```

列表的并行排序

```python
data = zip(list1, list2)
data.sort()
list1, list2 = map(lambda t: list(t), zip(*data))
```

