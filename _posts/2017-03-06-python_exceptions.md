---
layout:     post
category:   Python
title:      "Exception"
subtitle:   "Python进阶之Exception"
date:       2017-03-02 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

在基本术语中，我们知道`try / excep`t语句。 将可能导致异常发生的代码放在`try`块中，异常处理在except块中执行。 这是一个简单的例子：

```python
try:
    file = open('test.txt', 'rb')
except IOError as e:
    print('An IOError occurred. {}'.format(e.args[-1]))
```

在上面的例子中，我们只处理IOError异常。 大多数初学者不知道的是，我们可以处理多个异常。

#### 1、处理多个异常

我们可以使用三种方法来处理多个异常。 第一个涉及把可能发生在元组中的所有异常。 像这样：

```python
try:
    file = open('test.txt', 'rb')
except (IOError, EOFError) as e:
    print("An error occurred. {}".format(e.args[-1]))
```

另一种方法是处理单独的`except`块中的个别异常。 我们可以有尽可能多的`except`块。 这里是一个例子：

```python
try:
    file = open('test.txt', 'rb')
except EOFError as e:
    print("An EOF error occurred.")
    raise e
except IOError as e:
    print("An error occurred.")
    raise e
```

这样，如果异常不是由第一个`except`块处理，那么它可能由后面的块处理，或者根本不处理。 

现在最后一个方法涉及所有的异常：

```python
try:
    file = open('test.txt', 'rb')
except Exception:
    # Some logging if you want
    raise
```

当您不知道程序可能抛出的异常时，可以这样做。

#### 2、finally

我们将我们的主要代码包装在`try`子句中。 之后，我们将一些代码包装在一个`except`子句中，如果在`try`子句中包装的代码中发生异常，`except`语句它将被执行。 在这个例子中，我们将使用第三个子句也就是finally子句。 无论是否发生异常，包装在finally子句中的代码将运行。 它可能被用来在脚本之后执行清理。 这是一个简单的例子：

```python
try:
    file = open('test.txt', 'rb')
except IOError as e:
    print('An IOError occurred. {}'.format(e.args[-1]))
finally:
    print("This would be printed whether or not an exception occurred!")

# Output: An IOError occurred. No such file or directory
# This would be printed whether or not an exception occurred!
```

#### 3、try/else

通常情况下，如果没有发生异常，我们也可能需要运行一些代码。 这很容易通过使用`else`子句来实现。 有人可能会问：为什么，如果你只想要一些代码运行，如果没有发生异常，你不会简单地把这个代码放在try中吗？ 答案是，那么代码中的任何异常都会被尝试捕获，而你可能不希望这样做。 大多数人不使用它，老实说，我自己没有广泛使用它。 这里是一个例子：

```python
try:
    print('I am sure no exception is going to occur!')
except Exception:
    print('exception')
else:
    # any code that should only run if no exception occurs in the try,
    # but for which exceptions should NOT be caught
    print('This would only run if no exception occurs. And an error here '
          'would NOT be caught.')
finally:
    print('This would be printed in every case.')

# Output: I am sure no exception is going to occur!
# This would only run if no exception occurs.
# This would be printed in every case.
```

 `else` 块将会在没有异常发生时执行，并且在`finally`块之前执行。