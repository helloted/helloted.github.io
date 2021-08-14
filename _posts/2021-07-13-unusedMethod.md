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

##### 1、资源:

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

##### 2、编译选项处理

- Generate Debug Symbols 设置为NO，设置成NO就不会在断点处停下。减少符号生成，这个待确认。
- 舍弃架构armv7和armv7s，去除不必要的指令集
- DEAD_CODE_STRIPPING = YES（好像默认就是YES）。 确定 dead code（代码被定义但从未被调用）被剥离，去掉冗余的代码
- Optimization Level有几个编译优化选项，release版应该选择Fastest, Smalllest[-Os]，这个选项会开启那些不增加代码大小的全部优化，并让可执行文件尽可能小。
- Strip Debug Symbols During Copy 和 Symbols Hidden by Default 在release版本应该设为yes，可以去除不必要的调试符号。Symbols Hidden by Default会把所有符号都定义成”private extern”，设了后会减小体积。
- Strip Linked Product：DEBUG下设为NO，RELEASE下设为YES，用于RELEASE模式下缩减app的大小；

3、代码处理

#### 二、通过编译结果Mach-o文件分析



#### 三、编译过程中分析

