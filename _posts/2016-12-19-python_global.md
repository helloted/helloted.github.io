---
layout:     post
category:   Python
title:      "Global&Return"
subtitle:   "Python进阶之Global&Return的理解和使用"
date:       2016-12-19 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

 让我们来看看这个小函数：

```python
def add(value1, value2):
    return value1 + value2

result = add(3, 5)
print(result)
# Output: 8
```

这个函数式两个值相加返回和，我们同样可以这样做

```python
def add(value1,value2):
    global result
    result = value1 + value2

add(3,5)
print(result)
# Output: 8
```

让我们首先谈谈涉及`return`关键字的第一段代码。 这个函数做的是把值赋给正在调用该函数的变量，在我们的例子中就是`result`。 在大多数情况下，您不需要使用`global`关键字。 然而，让我们看看来包含`global`关键字的代码做了什么，它是创建了一个全局变量的`result`。 全局在这里意味着什么？ 全局变量意味着我们可以在该函数的范围之外访问该变量。 让我用一个例子来演示它：

```python
# first without the global variable
def add(value1, value2):
    result = value1 + value2

add(2, 4)
print(result)

# Oh crap, we encountered an exception. Why is it so?
# the python interpreter is telling us that we do not
# have any variable with the name of result. It is so
# because the result variable is only accessible inside
# the function in which it is created if it is not global.
Traceback (most recent call last):
  File "", line 1, in
    result
NameError: name 'result' is not defined

# Now lets run the same code but after making the result
# variable global
def add(value1, value2):
    global result
    result = value1 + value2

add(2, 4)
result
6
```

在实际的编程中，你应该尽量远离`global`关键字，因为它只会通过向全局范围引入不需要的变量而变得困难。

#### 多重返回值

那么如果你想从一个函数返回两个变量呢？ 使用全局关键字。 我们来看一个没什么用的例子：

```python
def profile():
    global name
    global age
    name = "Danny"
    age = 30

profile()
print(name)
# Output: Danny

print(age)
# Output: 30
```

注意，不要试图用上面这种方法。

也有人试图用 `tuple`, `list` 或者 `dict` 

```python
def profile():
    name = "Danny"
    age = 30
    return (name, age)

profile_data = profile()
print(profile_data[0])
# Output: Danny

print(profile_data[1])
# Output: 30
```

或者用一种更常用的方法

```python
def profile():
    name = "Danny"
    age = 30
    return name, age

profile_name, profile_age = profile()
print(profile_name)
# Output: Danny
print(profile_age)
# Output: 30
```

