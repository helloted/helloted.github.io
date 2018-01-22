---
layout:     post
title:      "【Python】debugging"
subtitle:   "Python进阶之debugging的理解和使用"
date:       2016-11-19 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

Debugging是一项掌握之后就能极大提高你的bug捕获能力的技能，大部分新手忽略了Python的debugger(`pdb`).

#### 用命令行

你可以用命令行的形式来使用debugger来跑一个脚本，例如

```
$ python -m pdb my_script.py
```

这将导致调试器找到的第一个语句就停止执行。 如果您的脚本很短，这会很有帮助。 然后，您可以检查这些变量并继续逐行执行。

#### 在脚本内部执行

您可以在脚本中设置断点，以便您可以检查特定点处的变量和内容。 这可以使用`pdb.set_trace()`方法。 这里是一个例子：

```python
import pdb

def make_bread():
    pdb.set_trace()
    return "I don't have time"

print(make_bread())
```

#### 命令

- `c`: 继续执行
- `w`: 显示当前执行行的上下文
- `a`: 打印当前行数的参数list
- `s`: 执行当前行并在第一个可能的情况下停止.
- `n`: 继续执行，直到到达当前函数的下一行或返回。

`n`ext和`s`tep之间的区别在于，`s`在一个被调用的函数内部停止，而`n`（几乎）全速下执行被调用函数，只停留在当前函数的下一行。