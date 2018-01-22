---
layout:     post
category:   Python
title:      "三元运算符"
subtitle:   "Python进阶之三元运算符"
date:       2016-11-10 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

三元运算符在Python中通常被称为条件表达式。 这些运算符根据条件是否正确来评估某些事情。

样板:

```
condition_is_true if condition else condition_is_false
```

例子

```python
is_fat = True
state = "fat" if is_fat else "not fat"
```

它允许快速测试条件而不是使用多行if语句。 通常这会非常有帮助，可以使代码紧凑但仍然可维护。

另一个比较模糊和没有被广泛使用的例子涉及tuples。 这是一些示例代码：

样板

```
(if_test_is_false, if_test_is_true)[test]
```

例子

```python
fat = True
fitness = ("skinny", "fat")[fat]
print("Ali is ", fitness)
# Output: Ali is fat
```

这只是因为True == 1和False == 0，所以可以用元组和列表来完成。

上面的例子并没有被广泛使用，因为这个不Pythonic。 另外一个原因不使用是因为tuples里的每个元素都会被检测，但是if-else的三元运算不会

```python
condition = True
print(2 if condition else 1/0)
#Output is 2

print((1/0, 2)[condition])
#ZeroDivisionError is raised
```

使用tupled三元技术，首先构建元组，然后找到索引。 对于if-else三元运算符，它遵循正常的if-else逻辑树。 因此，如果有一种情况可以根据条件引发异常，或者两种情况都是计算量大的方法，那么最好避免使用元组。