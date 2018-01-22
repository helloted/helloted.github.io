---
layout:     post
category:   Python
title:      "集合Sets"
subtitle:   "Python之集合Sets的理解和使用"
date:       2016-11-18 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

#### Set简介

`set`是一种很有用的数据结构，`sets`看起来和lists很像，不同的是`sets`里不能有重值，在许多情况下有用，

例如，你可能想要检查`list`中是否有重复的值。 你有两个选择。 第一个使用`for`循环，如下：

```python
some_list = ['a', 'b', 'c', 'b', 'd', 'm', 'n', 'n']

duplicates = []
for value in some_list:
    if some_list.count(value) > 1:
        if value not in duplicates:
            duplicates.append(value)

print(duplicates)
# Output: ['b', 'n']
```

但是如果用`sets`的话，会有一个更简单高效的操作，像这样

```python
some_list = ['a', 'b', 'c', 'b', 'd', 'm', 'n', 'n']
duplicates = set([x for x in some_list if some_list.count(x) > 1])
print(duplicates)
# Output: set(['b', 'n'])
```

#### 集合创建

```python
a_set = {'red', 'blue', 'green'}
print(type(a_set))
# Output: <type 'set'>
```

#### 集合交集

你可以让两个集合`sets`求交集

```python
valid = set(['yellow', 'red', 'blue', 'green', 'black'])
input_set = set(['red', 'brown'])
print(input_set.intersection(valid))
# Output: set(['red'])
```

会得到两个集合的交集部分

#### 集合差异

同样可以用`difference`方法来求差异

```python
valid = set(['yellow', 'red', 'blue', 'green', 'black'])
input_set = set(['red', 'brown'])
print(input_set.difference(valid))
# Output: set(['brown'])
```



参考资料：[set_-_data_structure](http://book.pythontips.com/en/latest/set_-_data_structure.html)