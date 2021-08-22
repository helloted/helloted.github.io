---
layout:     post
category:   iOS
title:      "LLVM编译过程"
subtitle:   "LLVM编译过程"
date:       2020-06-03 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

#### 1、编译以及LLVM简介

编译器的作用便是把我们的高级编程语言(Objective-C)通过一系列的操作转化成可被计算机执行的机器语言(MachineCode)。

经典的**三段式**设计（three phase design）：前端(Frontend)–优化器(Optimizer)–后端(Backend)

![img](/img/Simple_2/27.png)

- **前端**：负责分析源代码，可以检查语法级错误，并构建针对该语言的抽象语法树（AST），生成中间代码(Intermediate Representation )，在这个过程中，会进行类型检查，如果发现错误或者警告会标注出来在哪一行。
- **优化**：此时进行与机器类型无关的优化
- **后端**：根据不同的机器和架构，进行优化并且生成不同的机器码

这种三段式架构的优势在于：假如你需要增加一种语言，只需要增加一种前端；假如你需要增加一种处理器架构，也只需要增加一种后端；通过共享优化器的中转，其他的地方都不需要改动。

![img](/img/Simple_2/28.png)

#### 2、LLVM

> LLVM 是一个开源的，模块化和可重用的编译器和工具链技术的集合，或者说是一个编译器套件。
>
> 可以使用 LLVM 来编译 Kotlin，Ruby，Python，Haskell，Java，D，PHP，Pure，Lua 和许多其他语言
>
> LLVM 核心库还提供一个优化器，对流行的 CPU 做代码生成支持。
>
> LLVM 同时支持 AOT 预先编译和 JIT 即时编译
>
> 2012年，LLVM 获得美国计算机学会 ACM 的软件系统大奖，和 UNIX，WWW，TCP/IP，Tex，JAVA 等齐名。

LLVM的中间代码LLVM IR 的三种格式：

- 内存中的编译中间语言
- 硬盘上存储的可读中间格式（以 `.ll` 结尾）
- 硬盘上存储的二进制中间语言（以 `.bc` 结尾）

这三种中间格式是完全等价的。

iOS中的Bitcode 第三种，即存储在磁盘上的二进制文件（以 `.bc` 结尾）。

从 Xcode 7 开始，Apple 支持在提交 App 编译产物的同时提交 App 的 Bitcode (非强制)，并且之后对提交了 Bitcode 的 App 都单独进行了云端编译打包。也就是说，即便在提交时已经将本地编译好的 ipa 提交到 App Store，Apple 最终还是会使用 Bitcode 在云端再次打包，并且最终用户下载到手机上的版本也是由 Apple 在云端编译出来的版本，而非开发人员在本地编译的版本。

Apple 之所以这么做，一是因为 Apple 可以在云端编译过程中做一些额外的针对性优化工作，而这些额外的优化是本地环境所无法实现的。二是 Apple 可以为安装 App 的目标设备进行二进制优化，减少安装包的下载大小。

由于 Bitcode 是无关设备架构的，它可以被转化为任何被支持的 CPU 架构，包括现在还没被发明的 CPU 架构。以后如果苹果新出了一款新手机并且 CPU 也是全新设计的，在苹果后台服务器一样可以从这个 App 的 Bitcode 开始编译转化为新 CPU 上的可执行程序，可供新手机用户下载运行这个 App ，而无需开发人员重新在本地编译打包上传。

#### 3、Xcode编译器发展过程

> Clang 是 LLVM 的子项目，是 C、C++ 和 Objective-C 编译器，目标是替代传统编译器 GCC 。Clang 在整个 Objective-C 编译过程中扮演了编译器前端的角色，同时也参与到了 Swift 编译过程中的 Objective-C API 映射阶段。
>
> Clang 的主要功能是输出代码对应的抽象语法树（ AST ），针对用户发生的编译错误准确地给出建议，并将代码编译成 LLVM IR。
>
> Clang 的特点是编译速度快，模块化，代码简单易懂，诊断信息可读性强，占用内存小以及容易扩展和重用等。
>
> 我们以 Xcode 为例，Clang 编译 Objective-C 代码的速度是 Xcode 5 版本前使用的 GCC 的3倍，其生成的 AST 所耗用掉的内存仅仅是 GCC 的五分之一左右。

![img](/img/Simple_2/38.png)

- Xcode3 以前： GCC；
- Xcode3：增加LLVM，GCC(前端) + LLVM(后端)；
- Xcode4.2：出现Clang - LLVM 3.0成为默认编译器；
- Xcode4.6：LLVM 升级到4.2版本；
- Xcode5：GCC被废弃，新的编译器是LLVM 5.0，从GCC过渡到Clang-LLVM的时代正式完成，`Objective-C`与`swift`都采用`Clang`作为编译器前端

#### 4、Clang-LLVM架构

Clang-LLVM架构中，Clang作为前端生成中间代码IR，LLVM优化器进行优化，LLVM机器码生成器生成不同的机器码

![img](/img/Simple_2/29.png)

再具体一些的话：

![img](/img/Simple_2/31.png)

#### 5、Xcode中的编译过程

具体来说，在`Xcode`按下`CMD+B`之后，一个源文件的编译过程如下

![img](/img/Simple_2/30.png)

如上图所示，

1. **预处理(Pre-process)**：他的主要工作就是将宏替换，删除注释展开头文件，生成.i文件。
2. **词法解析(Lexical Analysis)**：将代码切成一个个 token，比如大小括号，等于号还有字符串等。是计算机科学中将字符序列转换为标记序列的过程。这一步把源文件中的代码转化为特殊的标记流，源码被分割成一个一个的字符和单词，在行尾Loc中都标记出了源码所在的对应源文件和具体行数，方便在报错时定位问题。
3. **语义分析(Semantic Analysis)**：验证语法是否正确，然后将所有节点组成抽象语法树 AST 。由 Clang 中 Parser 和 Sema 配合完成。
4. **静态分析(Static Analysis)**：静态分析会对代码进行错误检查，如出现方法被调用但是未定义、定义但是未使用的变量等，以此提高代码质量。
5. **中间代码生成(Code Generation)**：生成中间代码 IR，CodeGen 会负责将语法树自顶向下遍历逐步翻译成 LLVM IR，IR 是编译过程的前端的输出，后端的输入。
6. **优化(Optimize)**：LLVM 会去做些优化工作，在 Xcode 的编译设置里也可以设置优化级别-O1、-O3、-Os...还可以写些自己的 Pass，官方有比较完整的 Pass 教程： [Writing an LLVM Pass](http://llvm.org/docs/WritingAnLLVMPass.html) 。如果开启了Bitcode苹果会做进一步的优化，有新的后端架构还是可以用这份优化过的Bitcode去生成。可以在这一层自定义Pass对IR代码做代码混淆
7. **生成目标文件(Assemble)-后端**：在这一阶段，也是汇编阶段，汇编器将上一步生成的可读的汇编代码转化为机器代码。最终产物就是 以 .o 结尾的目标文件。使用Xcode构建的程序会在DerivedData目录中找到这个文件。。
8. **链接(Link)**：上个阶段生成的目标文件和引用的静态库链接起来，最终生成可执行文件(Mach-O 类型),链接器解决了目标文件和库之间的链接。

其中，12345属于前端，6属于优化，78属于后端。

