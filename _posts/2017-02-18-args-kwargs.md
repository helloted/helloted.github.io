---
layout:     post
title:      "Python之*args、**kwargs的理解和使用"
subtitle:   "Python之*args、**kwargs的理解和使用"
date:       2017-02-18 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

#### 1、*args的用法

`*args` 和`**kwargs`常用于方法定义，`*args` 和`**kwargs`允许你传递可变数量的参数到函数里，可变数量在这里的意思是，你事先不知道有多少个参数可以传递给你的函数，所以在这种情况下，你使用这两个关键字。`*args` 用于传递一个non-keyword的参数list给函数，看示例

```python
def test_var_args(f_arg, *argv):
    print("first normal arg:", f_arg)
    for arg in argv:
        print("another arg through *argv:", arg)

test_var_args('yasoob', 'python', 'eggs', 'test')
```

程序会这样执行

```
first normal arg: yasoob
another arg through *argv: python
another arg through *argv: eggs
another arg through *argv: test
```

#### 2、**kwargs的用法

`**kwargs`允许你传递一个keyword的可变参数list给函数，如果你需要在函数里处理带名称的参数，你应该使用`**kwargs`，下面有个例子

```python
def greet_me(**kwargs):
    for key, value in kwargs.items():
        print("{0} = {1}".format(key, value))

>>> greet_me(name="yasoob")
name = yasoob
```

你可以看到我们在函数里处理了keyword的参数list，这个只是`**kwargs`最基本的用法。

#### 3、使用`*args` 和`**kwargs`去调用一个函数

思考一下你有这样一个函数

```
def test_args_kwargs(arg1, arg2, arg3):
    print("arg1:", arg1)
    print("arg2:", arg2)
    print("arg3:", arg3)
```

现在你可以使用`*args` 和`**kwargs`来传递参数到这个函数

```python
# first with *args
>>> args = ("two", 3, 5)
>>> test_args_kwargs(*args)
arg1: two
arg2: 3
arg3: 5
```

```python
# now with **kwargs:
>>> kwargs = {"arg3": 3, "arg2": "two", "arg1": 5}
>>> test_args_kwargs(**kwargs)
arg1: 5
arg2: two
arg3: 3
```

`*args` 和`**kwargs`和普通参数的顺序应该是

```python
some_func(fargs, *args, **kwargs)
```

#### 4、使用情景

最常用的使用情况是，创建函数修饰器的时候，在使用monkey patching的时候也会用到，Monkey patching 意味着在运行时的时候修改代码。思考这种情况，你有一个类有一个函数 `get_info` ，用于一个API返回response数据，如果我们想要测试它，我们可以通过直接替换返回数据来替换API

```python
import someclass

def get_info(self, *args):
    return "Test data"

someclass.get_info = get_info
```