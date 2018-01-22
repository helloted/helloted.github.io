---
layout:     post
category:   Python
title:      "Generators生成器"
subtitle:   "Python进阶之Generators生成器的理解和使用"
date:       2016-11-18 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

首先让我们了解迭代器`iterators`。 根据维基百科，迭代器`iterators`是一个对象，使得程序员能够遍历一个容器，特别是list。 但是，迭代器执行遍历并访问容器中的数据元素，但不执行迭代。 你可能会感到困惑，所以让我们慢一点。 有三个部分即：

- 可迭代`Iterable`
- 迭代器`Iterator`
- 迭代`Iteration`

所有这些部分都是相互关联的。 我们将逐一讨论，稍后再讨论生成器。

#### 可迭代Iterable

可迭代指的是，Python中的任何对象，定义了`__iter__`(返回一个迭代器)或者`__getitem__`(获取索引)的方法，它或者可以（这两个dunder方法在前面的章节中都有详细介绍）。 简而言之，可迭代是任何可以为我们提供迭代器的对象。

#### 迭代器Iterator

迭代器指的是python中的任何定义了 `next` (Python2) or `__next__` 方法的对象

#### 迭代Iteration

简而言之，就是从某个东西里比如一个列表中取出一个项目的过程。 当我们使用一个循环来循环某些东西时，它被称为迭代。 这是过程本身的名字。

#### 生成器Generators

生成器是迭代器，但是只能迭代一次。 这是因为他们没有将所有的值存储在内存中，他们在运行中生成值。 你可以通过遍历它们来使用它们，或者用'for'循环，或者把它们传递给迭代的任何函数或者构造。 大多数时候生成器被声明为函数。 但是，他们`不会返回一个值`，他们会产生值。 下面是一个简单的生成器函数的例子：

```python
def generator_function():
    for i in range(10):
        yield i

for item in generator_function():
    print(item)

# Output: 0
# 1
# 2
# 3
# 4
# 5
# 6
# 7
# 8
# 9
```

在这种情况下它并不是很有用。 生成器最适合计算大量结果集（特别是涉及循环本身的计算），因为您不希望在同一时间为所有结果分配内存。 在Python 2中返回list的许多标准库函数已被修改为在Python 3中返回生成器，因为生成器需要更少的资源。

这是一个计算斐波纳契数字的例子：

```python
# generator version
def fibon(n):
    a = b = 1
    for i in range(n):
        yield a
        a, b = b, a + b
```

我们会这样使用

```python
for x in fibon(1000000):
    print(x)
```

这种情况下我们就不用担心使用大量的资源，但是如果我们像下面这种声明

```python
def fibon(n):
    a = b = 1
    result = []
    for i in range(n):
        result.append(a)
        a, b = b, a + b
    return result
```

在计算大量的输入时，它将用完我们所有的资源。 

我们已经讨论过我们只能迭代一次生成器，但是我们没有测试过。 在测试之前，您需要了解Python的另一个内置函数`next()`。 它允许我们访问序列的下一个元素。 那么让我们来测试一下我们的想法：

```python
def generator_function():
    for i in range(3):
        yield i

gen = generator_function()
print(next(gen))
# Output: 0
print(next(gen))
# Output: 1
print(next(gen))
# Output: 2
print(next(gen))
# Output: Traceback (most recent call last):
#            File "<stdin>", line 1, in <module>
#         StopIteration
```

正如我们所看到的， `next()`的所有值yielding之后，会导致StopIteration错误。 基本上这个错误告诉我们，所有的值已经yieded了。 你可能想知道为什么使用for循环时不会出现这个错误？ 那么答案很简单。 for循环自动捕获这个错误，然后停止调用`next()`。 你知道Python中的一些内置数据类型也支持迭代吗？ 让我们来看看：

```python
my_string = "Yasoob"
next(my_string)
# Output: Traceback (most recent call last):
#      File "<stdin>", line 1, in <module>
#    TypeError: str object is not an iterator
```

这不是我们所期望的。 错误说`str`不是一个迭代器。 那是对的！ 它可以迭代，但不是迭代器。 这意味着它支持迭代，但是我们不能直接迭代它。 那么我们将如何迭代呢？ 现在是了解更多内置函数的时候了。 它从一个迭代中返回一个迭代器对象。 虽然`int`不是可迭代的，但我们可以在字符串上使用它！

```python
int_var = 1779
iter(int_var)
# Output: Traceback (most recent call last):
#   File "<stdin>", line 1, in <module>
# TypeError: 'int' object is not iterable
# This is because int is not iterable

my_string = "Yasoob"
my_iter = iter(my_string)
print(next(my_iter))
# Output: 'Y'
```

这样就可以了