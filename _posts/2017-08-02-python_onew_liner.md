---
layout:     post
category:   Python
title:      "小功能"
subtitle:   "Python进阶之小功能"
date:       2017-08-02 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

在这里，给你展示一些Python使用的小功能

#### 简单Web Server

曾经想要通过网络快速共享文件？ 好吧，你是幸运的。 Python为你提供了一个功能。 转到您要通过网络提供的目录，然后在终端中输入以下代码：

```python
# Python 2
python -m SimpleHTTPServer

# Python 3
python -m http.server
```

会建立一个服务器

```
Serving HTTP on 0.0.0.0 port 8000 ...
```

#### 美观打印

您可以在Python代码中以美观的格式打印list和Dict。 这是相关的代码：

```
from pprint import pprint

my_dict = {'name': 'Yasoob', 'age': 'undefined', 'personality': 'awesome'}
pprint(my_dict)
```

此外，如果你想很快从文件打印JSON，那么你可以简单地做：

```
cat file.json | python -m json.tool
```

#### 分析脚本

这对查明脚本中的瓶颈非常有帮助：

```
python -m cProfile my_script.py
```

注意： `cProfile` 会比 `profile` 更快因为是用 c写的

#### CSV转json

在终端中跑下面的代码:

```
python -c "import csv,json;print json.dumps(list(csv.reader(open('csv_file.csv'))))"
```

#### List展开

您可以使用itertools包中的`itertools.chain.from_iterable`来快速简单地展开列表。 这是一个简单的例子：

```
a_list = [[1, 2], [3, 4], [5, 6]]
print(list(itertools.chain.from_iterable(a_list)))
# Output: [1, 2, 3, 4, 5, 6]

# or
print(list(itertools.chain(*a_list)))
# Output: [1, 2, 3, 4, 5, 6]
```

#### 一行构造

初始化类时避免大量的样板设置

```python
class A(object):
    def __init__(self, a, b, c, d, e, f):
        self.__dict__.update({k: v for k, v in locals().items() if k != 'self'})
```

更多可以在这里 [Python website](https://wiki.python.org/moin/Powerful%20Python%20One-Liners).