---
layout:     post
category:   Python
title:      "推导Comprehensions"
subtitle:   "Python进阶之推导Comprehensions"
date:       2017-08-02 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

推导Comprehensions是Python的一个特性。 `Comprehensions`是允许从其他序列构建序列的构建体。 Python 2和Python 3都支持三种类型的推导：

- list comprehensions
- dictionary comprehensions
- set comprehensions

#### list comprehensions

`list comprehensions`提供了一个简短的方式来创建list。 它由方括号组成，其中包含一个表达式，后跟一个for子句，然后是零个或多个or if子句。 表达式可以是任何东西，这意味着你可以往列表中放入各种对象。 结果将是在if和for子句的语境评估之后创建的新列表。

样板：

```python
variable = [out_exp for out_exp in input_list if out_exp == 2]
```

下面是一个简短的例子：

```python
multiples = [i for i in range(30) if i % 3 == 0]
print(multiples)
# Output: [0, 3, 6, 9, 12, 15, 18, 21, 24, 27]
```

这对于快速创建list非常有用。 它甚至是一些替代`filter`功能的首选。 列表推导真正的亮点，当你想提供一个方法或函数的列表，通过在for循环的每个迭代中附加一项来创建一个新的列表。 例如，你通常会做这样的事情：

```python
squared = []
for x in range(10):
    squared.append(x**2)
```

用推导就很简单了：

```python
squared = [x**2 for x in range(10)]
```

#### dictionary comprehensions

```python
mcase = {'a': 10, 'b': 34, 'A': 7, 'Z': 3}

mcase_frequency = {
    k.lower(): mcase.get(k.lower(), 0) + mcase.get(k.upper(), 0)
    for k in mcase.keys()
}

# mcase_frequency == {'a': 17, 'z': 3, 'b': 34}
```

在上面的例子中，我们把key相同但是类型不同的联合到一起，可以有更快的方式

```
{v: k for k, v in some_dict.items()}
```

#### set comprehensions

```python
squared = {x**2 for x in [1, 1, 2]}
print(squared)
# Output: {1, 4}
```

