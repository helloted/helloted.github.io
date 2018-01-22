---
layout:     post
category:   Python
title:      "Map,Filetr和Reduce"
subtitle:   "Python之Map,Filetr和Reduce的理解和使用"
date:       2016-11-18 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

#### Map

`Map`将函数应用于input_list中的所有项目。 这是模板

```
map(function_to_apply, list_of_inputs)
```

大多数时候我们想把列表里的所有元素一个一个地传递给一个函数，然后收集结果输出。 例如：

```python
items = [1, 2, 3, 4, 5]
squared = []
for i in items:
    squared.append(i**2)
```

`Map`允许我们有一个更简单更好的方式

```python
items = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x**2, items))
```

除了可以有一个list的输入，我们也可以有一个list的函数

```python
def multiply(x):
    return (x*x)
def add(x):
    return (x+x)

funcs = [multiply, add]
for i in range(5):
    value = list(map(lambda x: x(i), funcs))
    print(value)

# Output:
# [0, 0]
# [1, 2]
# [4, 4]
# [9, 6]
# [16, 8]
```

#### Filter

顾名思义，`Filter`可以用于过滤一个列表，加入过滤因素，简单。

```python
number_list = range(-5, 5)
less_than_zero = list(filter(lambda x: x < 0, number_list))
print(less_than_zero)

# Output: [-5, -4, -3, -2, -1]
```

`filter`类似于for循环，但它是一个内置函数，速度更快。

#### Reduce

`Reduce`是一个非常有用的函数，用于在list上执行一些计算并返回结果。 它将滚动计算应用于list中的顺序值对。 例如，如果你想计算一个整数列表的乘积。

```python
product = 1
list = [1, 2, 3, 4]
for num in list:
    product = product * num

# product = 24
```

用reduce来试试

```python
from functools import reduce
product = reduce((lambda x, y: x * y), [1, 2, 3, 4])

# Output: 24
```



参考资料：[map_filter](http://book.pythontips.com/en/latest/map_filter.html)