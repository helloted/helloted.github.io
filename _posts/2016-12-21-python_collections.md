---
layout:     post
category:   Python
title:      "集合Collections"
subtitle:   "Python进阶之Collections的理解和使用"
date:       2016-12-21 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

Python附带一个模块包含了许多称为集合的容器数据类型。 

- `defaultdict`
- `OrderedDict`
- `counter`
- `deque`
- `namedtuple`
- `enum.Enum` (outside of the module; Python 3.4+)

#### defaultdict

我个人使用`defaultdict`相当多。 与`dict`不同，`defaultdict`不需要检查一个键是否存在。 所以我们可以这样做：

```python
from collections import defaultdict

colours = (
    ('Yasoob', 'Yellow'),
    ('Ali', 'Blue'),
    ('Arham', 'Green'),
    ('Ali', 'Black'),
    ('Yasoob', 'Red'),
    ('Ahmed', 'Silver'),
)

favourite_colours = defaultdict(list)

for name, colour in colours:
    favourite_colours[name].append(colour)

print(favourite_colours)

# output
# defaultdict(<type 'list'>,
#    {'Arham': ['Green'],
#     'Yasoob': ['Yellow', 'Red'],
#     'Ahmed': ['Silver'],
#     'Ali': ['Blue', 'Black']
# })
```

另外一个非常重要的用法是在字典中追加嵌套list。 如果一个键不在字典中，那么会产生一个KeyError。 `defaultdict`允许我们以一种聪明的方式绕开这个问题。 首先让我分享一个使用dict的例子，它引发了KeyError，然后我将使用`defaultdict`来分享一个解决方案。

问题：

```python
some_dict = {}
some_dict['colours']['favourite'] = "yellow"
# Raises KeyError: 'colours'
```

解决方案：

```python
import collections
tree = lambda: collections.defaultdict(tree)
some_dict = tree()
some_dict['colours']['favourite'] = "yellow"
# Works fine
```

你可以打印 `some_dict` 用 `json.dumps`:

```python
import json
print(json.dumps(some_dict))
# Output: {"colours": {"favourite": "yellow"}}
```

#### OrderedDict

`OrderedDict`保持其键值按照最初插入的顺序排序。 覆盖现有key的值不会改变该键值的位置。 但是，删除并重新插入键值会将该键值移到字典的末尾。

无顺序：

```python
colours =  {"Red" : 198, "Green" : 170, "Blue" : 160}
for key, value in colours.items():
    print(key, value)
# Output:
#   Green 170
#   Blue 160
#   Red 198
# Entries are retrieved in an unpredictable order
```

有顺序

```python
from collections import OrderedDict

colours = OrderedDict([("Red", 198), ("Green", 170), ("Blue", 160)])
for key, value in colours.items():
    print(key, value)
# Output:
#   Red 198
#   Green 170
#   Blue 160
# Insertion order is preserved
```

#### counter

counter计数器允许我们计算特定项目的出现次数。 例如，它可以用来计算个人最喜欢的颜色的数量：

```python
from collections import Counter

colours = (
    ('Yasoob', 'Yellow'),
    ('Ali', 'Blue'),
    ('Arham', 'Green'),
    ('Ali', 'Black'),
    ('Yasoob', 'Red'),
    ('Ahmed', 'Silver'),
)

favs = Counter(name for name, colour in colours)
print(favs)
# Output: Counter({
#    'Yasoob': 2,
#    'Ali': 2,
#    'Arham': 1,
#    'Ahmed': 1
# })
```

同样可以用这个来计算一个文件中的最大相同行数

```python
with open('filename', 'rb') as f:
    line_count = Counter(f)
print(line_count)
```

`deque`为您提供了一个双端队列，这意味着您可以从队列的任意一侧追加和删除元素。 

```python
from collections import deque

d = deque()
d.append('1')
d.append('2')
d.append('3')

print(len(d))
# Output: 3

print(d[0])
# Output: '1'

print(d[-1])
# Output: '3'
```

你可以在两端pop值：

```python
d = deque(range(5))
print(len(d))
# Output: 5

d.popleft()
# Output: 0

d.pop()
# Output: 4

print(d)
# Output: deque([1, 2, 3])
```

你可以限制队列的最大长度。如果这样做当我们接收超出最大长度时，队里会在另外一端pop出。

```python
d = deque(maxlen=30)

d = deque([1,2,3,4,5])
d.extendleft([0])
d.extend([6,7,8])
print(d)
# Output: deque([0, 1, 2, 3, 4, 5, 6, 7, 8])
```

#### namedtuple

你可能已经熟悉元组了。 一个元组基本上是一个不可变的list，它允许你存储由逗号分隔的一系列值。 他们就像list，但有几个关键的区别。 主要的一点是，不像list，你不能重新分配元组中的项目。 为了访问元组中的值，可以使用如下的整数索引：

```python
man = ('Ali', 30)
print(man[0])
# Output: Ali
```

那么现在是什么`namedtuple`？ 他们把元组变成方便的容器来完成简单的任务。 使用`namedtuples`，您不必使用整数索引来访问元组的成员。 你可以把`namedtuple`看作字典，但不同于字典，它们是不可变的。

```python
from collections import namedtuple

Animal = namedtuple('Animal', 'name age type')
perry = Animal(name="perry", age=31, type="cat")

print(perry)
# Output: Animal(name='perry', age=31, type='cat')

print(perry.name)
# Output: 'perry'
```

现在你可以看到，我们可以通过使用一个名称来访问元组的成员。让我们再解析一下。 一个命名的元组有两个必需的参数。 它们是元组的名称和元组的field_names。 在上面的例子中，我们的元组名是'Animal'，而元组的field_names是'name'，'age'和'type'。 `Namedtuple`使你的元组自己生成文档。 快速浏览一下你的代码就可以很容易的理解到底发生了什么。 而且由于您不必使用整数索引来访问元组的成员，因此可以更容易地维护您的代码。 此外，由于`namedtuple`实例没有每个实例字典，所以它们是轻量级的，并且不需要比常规元组更多的内存。 这使得它们比字典更快。 但是，请记住，与元组一样，`namedtuples`中的属性是不可变的。

这意味着这是下面这是行不通的：

```python
from collections import namedtuple

Animal = namedtuple('Animal', 'name age type')
perry = Animal(name="perry", age=31, type="cat")
perry.age = 42

# Output: Traceback (most recent call last):
#            File "", line 1, in
#         AttributeError: can't set attribute
```

你同样可以用index来访问：

```python
from collections import namedtuple

Animal = namedtuple('Animal', 'name age type')
perry = Animal(name="perry", age=31, type="cat")
print(perry[0])
# Output: perry
```

你可以把`namedtuple`转化成字典

```python
from collections import namedtuple

Animal = namedtuple('Animal', 'name age type')
perry = Animal(name="Perry", age=31, type="cat")
print(perry._asdict())
# Output: OrderedDict([('name', 'Perry'), ('age', 31), ...
```

#### enum.Enum(Python 3.4+)

```python
from collections import namedtuple
from enum import Enum

class Species(Enum):
    cat = 1
    dog = 2
    horse = 3
    aardvark = 4
    butterfly = 5
    owl = 6
    platypus = 7
    dragon = 8
    unicorn = 9
    # The list goes on and on...

    # But we don't really care about age, so we can use an alias.
    kitten = 1
    puppy = 2

Animal = namedtuple('Animal', 'name age type')
perry = Animal(name="Perry", age=31, type=Species.cat)
drogon = Animal(name="Drogon", age=4, type=Species.dragon)
tom = Animal(name="Tom", age=75, type=Species.cat)
charlie = Animal(name="Charlie", age=2, type=Species.kitten)

# And now, some tests.
>>> charlie.type == tom.type
True
>>> charlie.type
<Species.cat: 1>
```

有三个方法去访问enumeration成员

```python
Species(1)
Species['cat']
Species.cat
```

