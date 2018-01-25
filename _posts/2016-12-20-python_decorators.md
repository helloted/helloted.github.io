---
layout:     post
category:   Python
title:      "装饰器"
subtitle:   "Python进阶之装饰器的理解和使用"
date:       2016-12-20 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

`装饰器Decorators`是Python的重要组成部分。 简而言之：它们是修改另一个函数功能的函数。 他们有助于使我们的代码更简洁，更Pythonic。

装饰器就是让你在函数之前或者之后可以执行一段代码。

#### 万物皆对象

首先理解一下Python中的函数

```python
def hi(name="yasoob"):
    return "hi " + name

print(hi())
# output: 'hi yasoob'

# 我们可以把一个函数赋值给一个变量
greet = hi
# 我们这里没有用圆括号，因为我们没有调用hi函数，我们只是把它放入了greet变量

print(greet())
# output: 'hi yasoob'

# 让我们看看如果删除hi这个函数会怎么样!
del hi
print(hi())
#outputs: NameError

print(greet())
#outputs: 'hi yasoob'
```

#### 用函数来定义函数

在Python中，我们可以在其他函数中定义函数：

```python
def hi(name="yasoob"):
    print("now you are inside the hi() function")

    def greet():
        return "now you are in the greet() function"

    def welcome():
        return "now you are in the welcome() function"

    print(greet())
    print(welcome())
    print("now you are back in the hi() function")

hi()
#output:now you are inside the hi() function
#       now you are in the greet() function
#       now you are in the welcome() function
#       now you are back in the hi() function

# This shows that whenever you call hi(), greet() and welcome()
# are also called. However the greet() and welcome() functions
# are not available outside the hi() function e.g:

greet()
#outputs: NameError: name 'greet' is not defined
```

所以现在我们知道我们可以在其他函数中定义函数了。 换句话说：我们可以做嵌套函数。 现在你需要再学习一点，函数也可以返回函数。

#### 从函数中返回函数

没有必要在另外一个函数中执行函数，我们可以把它作为输出：

```python
def hi(name="yasoob"):
    def greet():
        return "now you are in the greet() function"

    def welcome():
        return "now you are in the welcome() function"

    if name == "yasoob":
        return greet
    else:
        return welcome

a = hi()
print(a)
#outputs: <function greet at 0x7f2143c01500>

#This clearly shows that `a` now points to the greet() function in hi()
#Now try this

print(a())
#outputs: now you are in the greet() function
```

再看看代码。 在`if/else`子句中，我们将返回`greet`和`welcome`，而不是`greet()`和`welcome()`。 这是为什么？ 这是因为当你在它后面加一对括号时，函数会被执行; 而如果不在后面加括号，那么它可以被传递并且可以被分配给其他变量而不执行它。 你明白了吗？ 让我稍微详细地解释一下。 当我们写a = hi()时，hi()得到执行，并且由于默认名称是yasoob，所以返回函数`greet`。 如果我们把语句改成a = hi(name =“ali”)，那么welcome函数将被返回。 我们也可以打印hi()()，现在输出greet()函数。

#### 把函数作为参数

```python
def hi():
    return "hi yasoob!"

def doSomethingBeforeHi(func):
    print("I am doing some boring work before executing hi()")
    print(func())

doSomethingBeforeHi(hi)
#outputs:I am doing some boring work before executing hi()
#        hi yasoob!
```

现在你需要知道什么是装饰器了，装饰器就是在函数之前或者之后可以执行一段代码。

#### 写你的第一个装饰器

在上一个例子中，我们其实已经创建了一个装饰器，让我们来修改一下变得更有用

```Python
def a_new_decorator(a_func):

    def wrapTheFunction():
        print("I am doing some boring work before executing a_func()")

        a_func()

        print("I am doing some boring work after executing a_func()")

    return wrapTheFunction

def a_function_requiring_decoration():
    print("I am the function which needs some decoration to remove my foul smell")

a_function_requiring_decoration()
#outputs: "I am the function which needs some decoration to remove my foul smell"

a_function_requiring_decoration = a_new_decorator(a_function_requiring_decoration)
#now a_function_requiring_decoration is wrapped by wrapTheFunction()

a_function_requiring_decoration()
#outputs:I am doing some boring work before executing a_func()
#        I am the function which needs some decoration to remove my foul smell
#        I am doing some boring work after executing a_func()
```

你明白了吗？ 我们只是应用了以前学过的原理。 这正是装饰器在Python中所做的！ 它们包装一个函数并以某种方式修改它的行为。 现在你可能想知道我们没有在我们的代码中使用任何@ 这只是构成装饰功能的简短方法。 以下是我们如何使用@运行以前的代码示例。

```python
@a_new_decorator
def a_function_requiring_decoration():
    """Hey you! Decorate me!"""
    print("I am the function which needs some decoration to "
          "remove my foul smell")

a_function_requiring_decoration()
#outputs: I am doing some boring work before executing a_func()
#         I am the function which needs some decoration to remove my foul smell
#         I am doing some boring work after executing a_func()

#the @a_new_decorator is just a short way of saying:
a_function_requiring_decoration = a_new_decorator(a_function_requiring_decoration)
```

现在代码里有个问题，如果我们：

```python
print(a_function_requiring_decoration.__name__)
# Output: wrapTheFunction
```

这不是我们所期望的！ 它的名字是“a_function_requiring_decoration”。 我们的函数被wrapTheFunction所取代。 它覆盖了我们函数的名称的文档字符串。 幸运的是，Python为我们提供了一个简单的函数来解决这个问题，那就是functools.wraps。 让我们修改我们以前的例子来使用functools.wraps：

```Python
from functools import wraps

def a_new_decorator(a_func):
    @wraps(a_func)
    def wrapTheFunction():
        print("I am doing some boring work before executing a_func()")
        a_func()
        print("I am doing some boring work after executing a_func()")
    return wrapTheFunction

@a_new_decorator
def a_function_requiring_decoration():
    """Hey yo! Decorate me!"""
    print("I am the function which needs some decoration to "
          "remove my foul smell")

print(a_function_requiring_decoration.__name__)
# Output: a_function_requiring_decoration

```

来学习一些装饰器例子

```python
from functools import wraps
def decorator_name(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not can_run:
            return "Function will not run"
        return f(*args, **kwargs)
    return decorated

@decorator_name
def func():
    return("Function is running")

can_run = True
print(func())
# Output: Function is running

can_run = False
print(func())
# Output: Function will not run
```

#### 授权

装饰者可以帮助检查是否有人有权在Web应用程序中使用端点。 它们广泛用于Flask web框架和Django。 这里是一个使用基于装饰器的认证的例子：

```python
from functools import wraps

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not check_auth(auth.username, auth.password):
            authenticate()
        return f(*args, **kwargs)
    return decorated
```

#### Logging

```python
from functools import wraps

def logit(func):
    @wraps(func)
    def with_logging(*args, **kwargs):
        print(func.__name__ + " was called")
        return func(*args, **kwargs)
    return with_logging

@logit
def addition_func(x):
   """Do some math."""
   return x + x


result = addition_func(4)
# Output: addition_func was called
```

#### 用参数装饰

想想吧，是不是@wraps也是装饰者？ 但是，它像一个正常的函数一样需要参数。 那么，为什么我们不能这样做呢？

这是因为当你使用@my_decorator语法时，你正在用一个函数作为参数来应用一个包装函数。记住，Python中的所有东西都是一个对象，这包括函数！ 考虑到这一点，我们可以编写一个返回包装函数的函数。

#### 用函数嵌套一个装饰器

```Python
from functools import wraps

def logit(logfile='out.log'):
    def logging_decorator(func):
        @wraps(func)
        def wrapped_function(*args, **kwargs):
            log_string = func.__name__ + " was called"
            print(log_string)
            # Open the logfile and append
            with open(logfile, 'a') as opened_file:
                # Now we log to the specified logfile
                opened_file.write(log_string + '\n')
        return wrapped_function
    return logging_decorator

@logit()
def myfunc1():
    pass

myfunc1()
# Output: myfunc1 was called
# A file called out.log now exists, with the above string

@logit(logfile='func2.log')
def myfunc2():
    pass

myfunc2()
# Output: myfunc2 was called
# A file called func2.log now exists, with the above string
```

#### 装饰类

类也可以用来构建装饰器。

```python
class logit(object):
    def __init__(self, logfile='out.log'):
        self.logfile = logfile

    def __call__(self, func):
        log_string = func.__name__ + " was called"
        print(log_string)
        # Open the logfile and append
        with open(self.logfile, 'a') as opened_file:
            # Now we log to the specified logfile
            opened_file.write(log_string + '\n')
        # Now, send a notification
        self.notify()

    def notify(self):
        # logit only logs, no more
        pass
```

这个实现有一个额外的好处，就是比嵌套函数方法更简洁，包装一个函数仍然会使用和以前一样的语法：

```
@logit()
def myfunc1():
    pass
```

现在，让我们继续分类logit添加电子邮件功能（虽然这个主题不会在这里介绍）。

```python
class email_logit(logit):
    '''
    A logit implementation for sending emails to admins
    when the function is called.
    '''
    def __init__(self, email='admin@myproject.com', *args, **kwargs):
        self.email = email
        super(email_logit, self).__init__(*args, **kwargs)

    def notify(self):
        # Send an email to self.email
        # Will not be implemented here
        pass
```

从这里, `@email_logit` 工作就像 `@logit` 但是发送了一个email给admin.