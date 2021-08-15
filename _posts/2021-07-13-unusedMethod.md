---
layout:     post
category:   iOS
title:      "减包-删除无用的代码"
subtitle:   "减包-删除无用的代码"
date:       2021-07-13 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 一、减包的措施

#### 1、资源:

- 无用资源的删除
- 重复文件的删除
- 大文件压缩
- 图片管理方式规范
- on-Demand Resource动态下载

**1.1. 删除无用图片**

使用开源工具 [**LSUnusedResources**](https://github.com/tinymind/LSUnusedResources) 检查重复图片，但是可能会有误报，比如 [@"image%d", index] 这种引用方式无法检查到，需要人工在核对一边。

1.1.1重复文件删除

借助 [fdupes](https://link.segmentfault.com/?url=https%3A%2F%2Fgithub.com%2Fadrianlopezroche%2Ffdupes) 这个开源工具，校验各资源的 MD5。

**1.2. 图片文件压缩**

使用开源工具 [**imageOptim**](https://github.com/ImageOptim/ImageOptim) 对所有图片压缩一遍。此工具会使用 git 上主流的图片压缩方法尝试一遍，选择最优方案。

**1.3. 纯色图片使用代码生成**

如果项目中纯色的图片比较多，可以考虑使用代码替代，生成后缓存到本地以供后期使用。

**1.4. 不常用图片后台下发**

对于项目中不常用的图片可以考虑由后台下发，但是此项收益可能不高，而且会影响使用体验，酌情使用。

**1.5. 字体文件**

字体文件一般都很大，如果项目中使用了多种字体文件，可以删掉不常用的字体文件。

#### 2、编译选项处理

- Generate Debug Symbols 设置为NO，设置成NO就不会在断点处停下。减少符号生成，这个待确认。
- 舍弃架构armv7和armv7s，去除不必要的指令集
- DEAD_CODE_STRIPPING = YES（好像默认就是YES）。 确定 dead code（代码被定义但从未被调用）被剥离，去掉冗余的代码
- Optimization Level有几个编译优化选项，release版应该选择Fastest, Smalllest[-Os]，这个选项会开启那些不增加代码大小的全部优化，并让可执行文件尽可能小。
- Strip Debug Symbols During Copy 和 Symbols Hidden by Default 在release版本应该设为yes，可以去除不必要的调试符号。Symbols Hidden by Default会把所有符号都定义成”private extern”，设了后会减小体积。
- Strip Linked Product：DEBUG下设为NO，RELEASE下设为YES，用于RELEASE模式下缩减app的大小；

### 二、Mach-o简介

**Mach-O** 为 Mach Object 文件格式的缩写，它是一种用于可执行文件、目标代码、动态库、内核转储的文件格式。作为 a.out 格式的替代，Mach-O 提供了更强的扩展性，并提升了 符号表 中信息的访问速度。

MachO 是一种文件规范，是一类文件的统称，包括但不限于以下几种常见的文件类型：

- .o（目标文件）
- .a（静态库文件 ）
- .dylib（动态库文件 ）
- .framework（库文件）
- .dSYM（XCode 调试符号文件）
- 可执行文件（没有扩展名）
- dyld（动态链接器，一个特殊的可执行文件）

![img](/img/Simple_2/48.png)

#### MachO 查看工具：OTool 与 MachOView:

- OTool 是 macOS 自带的 MachO 文件查看工具，基于命令行，可以通过不同的命令参数快速地查看 MachO 文件各个方面的信息，OTool 位于（/Library/Developer/CommandLineTools/usr/bin/otool）
- MachOView 是一款开源的 MachO 文件查看工具，基于图形界面，它为查看和编辑（基于 Intel 和 ARM 架构的）MachO 文件提供了完整的解决方案

#### 1、Header

Header是文件的头部信息，包括CPU信息、文件类型、Command条数及Size信息。总体来说，作为开发者Header使用的较少，比较常用的是(uintptr_t)&_mh_execute_header获取header地址进行计算用。

![img](/img/Simple_2/49.jpg)

#### 2、Commands

Load Commands描述的是文件的加载信息，加载信息有很多，加载的段、符号表、动态库信息等都在Commands中取到。这个部分信息还是比较有用的，我们可以从这里获取到符号表和字符串表的偏移量

#### 3、Data

Header 区域主要用于存储 MachO 文件的一般信息，并且描述了 LoadCommands 区域
而 LoadCommands 区域则详细描述了 Data 区域
如果说 Header 区域和 LoadCommands 区域的主要作用是：

1. 让系统内核加载器知道如何读取 MachO 文件
2. 并指定动态链接器来完成 MachO 文件后续的动态库加载
3. 然后设置好程序入口等一些列程序启动前的信息

那么，Data 区域的作用，就是当程序运行起来后，为每一个映射到虚拟内存中的指令操作提供真实的物理存储支持

Data 区域通常是 MachO 文件中最大的部分，主要包含：代码段、数据段，链接信息等
注意：不要把 Data 区域与数据段搞混掉了，Data 区域指的是广义上的数据，而不是特指数据段的数据

| Section                   | 用途                                                         |
| ------------------------- | ------------------------------------------------------------ |
| `__TEXT.__text`           | 主程序代码,存放的是汇编后的代码                              |
| `__TEXT.__cstring`        | C 语言字符串                                                 |
| `__TEXT.__const`          | `const` 关键字修饰的常量                                     |
| `__TEXT.__stubs`          | 用于 Stub 的占位代码，很多地方称之为*桩代码*。               |
| `__TEXT.__stubs_helper`   | 当 Stub 无法找到真正的符号地址后的最终指向                   |
| `__TEXT.__objc_methname`  | Objective-C 方法名称                                         |
| `__TEXT.__objc_methtype`  | Objective-C 方法类型                                         |
| `__TEXT.__objc_classname` | Objective-C 类名称                                           |
| `__DATA.__data`           | 初始化过的可变数据                                           |
| `__DATA.__la_symbol_ptr`  | lazy binding 的指针表，表中的指针一开始都指向 `__stub_helper` |
| `__DATA.nl_symbol_ptr`    | 非 lazy binding 的指针表，每个表项中的指针都指向一个在装载过程中，被动态链机器搜索完成的符号 |
| `__DATA.__const`          | 没有初始化过的常量                                           |
| `__DATA.__cfstring`       | 程序中使用的 Core Foundation 字符串（`CFStringRefs`）        |
| `__DATA.__bss`            | BSS，存放为初始化的全局变量，即常说的静态内存分配            |
| `__DATA.__common`         | 没有初始化过的符号声明                                       |
| `__DATA.__objc_classlist` | Objective-C 类列表                                           |
| `__DATA.__objc_protolist` | Objective-C 原型                                             |
| `__DATA.__objc_imginfo`   | Objective-C 镜像信息                                         |
| `__DATA.__objc_selfrefs`  | Objective-C `self` 引用                                      |
| `__DATA.__objc_protorefs` | Objective-C 原型引用                                         |
| `__DATA.__objc_superrefs` | Objective-C 超类引用                                         |

### 三、利用Otool工具查找无用代码

OTool 是 macOS 自带的 MachO 文件查看工具，基于命令行，可以通过不同的命令参数快速地查看 MachO 文件各个方面的信息，OTool 位于（/Library/Developer/CommandLineTools/usr/bin/otool）

#### 1、所有方法

```
 “otool - ov $path”将输出Objective - C类结构及其定义的方法。
```

![img](/img/Simple_2/50.jpg)

通过匹配可以和筛选，可以将获取所有的方法，除了setter and getter方法...

代码

```
def imp_selectors(path):
    re_sel_imp = re.compile('\s*imp\s*0x\w+ ([+|-]\[.+\s(.+)\])')
    re_properties_start = re.compile('\s*baseProperties 0x\w{9}')
    re_properties_end = re.compile('\w{16} 0x\w{9} _OBJC_CLASS_\$_(.+)')
    re_property = re.compile('\s*name\s*0x\w+ (.+)')
    imp_sels = {}
    is_properties_area = False

    for line in os.popen('/usr/bin/otool -oV %s' % path).readlines():
        results = re_sel_imp.findall(line)
        if results:
            (class_sel, sel) = results[0]
            if sel in imp_sels:
                imp_sels[sel].add(class_sel)
            else:
                imp_sels[sel] = set([class_sel])
        else:
            # delete setter and getter methods as ivar assignment will not trigger them
            # 删除相关的set方法
            if re_properties_start.findall(line):
                is_properties_area = True
            if re_properties_end.findall(line):
                is_properties_area = False
            if is_properties_area:
                property_result = re_property.findall(line)
                if property_result:
                    property_name = property_result[0]
                    if property_name and property_name in imp_sels:
                        # properties layout in mach-o is after func imp
                        imp_sels.pop(property_name)
                        # 拼接set方法
                        setter = 'set' + property_name[0].upper() + property_name[1:] + ':'
                        # 干掉set方法
                        if setter in imp_sels:
                            imp_sels.pop(setter)
    return imp_sels
```

#### 2、引用的方法

```
otool -v -s __DATA __objc_selrefs $path
```

![img](/img/Simple_2/50.jpg)

#### 3、找出未引用代码

所有代码与引用的代码的差集即为未使用代码