---
layout:     post
category:   Python
title:      "Enumerate遍历"
subtitle:   "Python进阶之Enumerate的理解使用"
date:       2017-03-01 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

Enumerate是Python的一个内置函数。 它的用处不能一概而论。 然而，大多数新人甚至是一些高级程序员都不知道。 它允许我们循环一些东西，并有一个自动计数器。 这里是一个例子：

```python
for counter, value in enumerate(some_list):
    print(counter, value)
```

`enumerate`枚举也接受一个可选的参数，这使得它更有用。

```python
my_list = ['apple', 'banana', 'grapes', 'pear']
for c, value in enumerate(my_list, 1):
    print(c, value)

# Output:
# 1 apple
# 2 banana
# 3 grapes
# 4 pear
```

可选参数使我们从哪里位置开始遍历。 您还可以使用列表创建包含index和list项目的元组。 这里是一个例子：

```python
my_list = ['apple', 'banana', 'grapes', 'pear']
counter_list = list(enumerate(my_list, 1))
print(counter_list)
# Output: [(1, 'apple'), (2, 'banana'), (3, 'grapes'), (4, 'pear')]
```