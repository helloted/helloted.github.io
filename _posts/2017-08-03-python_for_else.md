---
layout:     post
category:   Python
title:      "For-Else"
subtitle:   "Python进阶之For-Else"
date:       2017-08-02 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

循环是任何语言的组成部分。 同样，for循环是Python的重要组成部分。

这是我们常用的一种循环：

```python
fruits = ['apple', 'banana', 'mango']
for fruit in fruits:
    print(fruit.capitalize())

# Output: Apple
#         Banana
#         Mango
```

#### else语句

For循环也有一个我们大多数人都不熟悉的`else`子句。` else`子句在循环正常完成时执行。 这意味着循环没有遇到任何`break`。 

常见的构造是运行一个循环并搜索一个项目。 如果找到该项目，我们使用`break`来断开循环。 有两种情况下，循环可能会结束：第一个是找到该项目并遇到`break`，第二种情况是循环结束。 现在我们可能想知道哪一个是循环完成的原因： 一种方法是设置一个标志，然后在循环结束时检查它。 另一个是使用else子句。

 `for/else` 循环的基本结构:

```python
for item in container:
    if search_something(item):
        # Found it!
        process(item)
        break
else:
    # Didn't find anything..
    not_found_in_container()
```

考虑一下我从官方文档中得到的这个简单的例子：

```python
for n in range(2, 10):
    for x in range(2, n):
        if n % x == 0:
            print(n, 'equals', x, '*', n/x)
            break
```

它找到2到10之间的数字的合数。现在是比较有意思的部分。 我们可以添加一个额外的块来捕捉质数并告诉我们：

```python
for n in range(2, 10):
    for x in range(2, n):
        if n % x == 0:
            print( n, 'equals', x, '*', n/x)
            break
    else:
        # loop fell through without finding a factor
        print(n, 'is a prime number')
```