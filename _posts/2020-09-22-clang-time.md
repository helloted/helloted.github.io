---
layout:     post
category:   iOS
title:      "Clang插件统计方法耗时"
subtitle:   "Clnag插件统计方法耗时"
date:       2020-09-22 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

#### 0、统计函数耗时原理

LLVM的优化和转换工作就需要通过PASS来进行，就像下面这种图，PASS就像流水线上的操作工一样对中间代码IR进行优化，每个PASS完成特定的优化工作。

![img](/img/Simple_3/36.png)

所有的pass都是llvm的Pass类的子类，通过重写继承的虚函数来实现特定的功能。根据pass不同的功能分类，继承的类也不同，比如：ModulePass , CallGraphSCCPass, FunctionPass , LoopPass, RegionPass, BasicBlockPass，llvm系统会根据实例的类别来判断pass的功能，然后将其整合到现有的优化体系中去。

FunctionPASS会遍历我们编译的每个函数，在遍历编译的函数过程中，在函数运行之前获取当前时间，在函数运行之后获取当前时间，二者相减，可以得到函数的运行时间。

#### 1、整体过程

待插入函数

```c
#include <stdio.h>
#include <sys/time.h>


long my_fun_b(){
    struct timeval star;
    gettimeofday(&star, NULL);
    long b = star.tv_sec * 1000000 + star.tv_usec;
    return b;
}

void my_fun_e(char *name, long b){
    struct timeval end;
    gettimeofday(&end, NULL);
    long e = end.tv_sec * 1000000 + end.tv_usec;
    long t = e - b;
    printf("%s %ld us\n",name, t);
}
```

my_fun_b是函数的最开始，插入并用于记录当前时间；

my_fun_e则是在函数的最末尾插入，用于记录当前时间并与之前函数开始记录的时间做差值，把函数名称和耗时打印出来。

```c++
    bool runOnFunction(Function &F) override
    {
      // 1. 已经插入的不需要再次插入
      if (F.getName().startswith("my_fun_"))
        return false;

      // 2. 记录开始时间
      Value* beginTime = nullptr;
      if (!insert_begin_inst(F, beginTime))
        return false;
      
      // 3. 方法结束时统计方法耗时，开始的时间记录作为参数
      insert_return_inst(F, beginTime);
      return false;
    }
```

#### 2、函数开始

```c++
    bool insert_begin_inst(Function &F, Value*& beginTime)
    {
      // 0.函数最开始的BasicBlock
      LLVMContext &context = F.getParent()->getContext();
      BasicBlock &bb = F.getEntryBlock();
      
      // 1. 获取要插入的函数
      FunctionCallee beginFun = F.getParent()->getOrInsertFunction("my_fun_b",FunctionType::get(Type::getInt64Ty(context), {}, false));

      // 2. 构造函数
      // Value *beginTime = nullptr;
      CallInst *inst = nullptr;
      IRBuilder<> builder(context);
      inst = builder.CreateCall(beginFun);

      if (!inst) {
        llvm::errs() << "Create First CallInst Failed\n";
        return false;
      }

      // 3. 获取函数开始的第一条指令
      Instruction *beginInst = dyn_cast<Instruction>(bb.begin());

      // 4. 将inst插入
      inst->insertBefore(beginInst);
      
      // 5.根据返回值记录开始时间
      beginTime = inst;

      return true;
    }
```

#### 3、函数结束

```c++
        void insert_return_inst(Function &F, Value* beginTime)
    {
      LLVMContext &context = F.getParent()->getContext();
      for (Function::iterator I = F.begin(), E = F.end(); I != E; ++I)
      {
          
        //  函数结尾的BasicBlock
        BasicBlock &BB = *I;
        for (BasicBlock::iterator I = BB.begin(), E = BB.end(); I != E; ++I)
        {
          ReturnInst *IST = dyn_cast<ReturnInst>(I);
          if (!IST)
            continue;
          
          // end_func 类型
          FunctionType *endFuncType = FunctionType::get(
            Type::getVoidTy(context),
            {Type::getInt8PtrTy(context),Type::getInt64Ty(context)},
            false
          );

          // end_func
          FunctionCallee endFunc = BB.getModule()->getOrInsertFunction("my_fun_e", endFuncType);

          // 构造end_func
          IRBuilder<> builder(&BB);
          IRBuilder<> callBuilder(context);
          CallInst* endCI = callBuilder.CreateCall(endFunc,
            {
              builder.CreateGlobalStringPtr(BB.getParent()->getName()),
              beginTime
            }
          );

          // 插入end_func(struction)
          endCI->insertBefore(IST);
        }
      }
    }
```

#### 4、运行效果

```
-[AppDelegate application:didFinishLaunchingWithOptions:] 5 us
-[AppDelegate application:configurationForConnectingSceneSession:options:] 63 us
-[SceneDelegate window] 0 us
-[SceneDelegate setWindow:] 0 us
-[SceneDelegate window] 0 us
-[SceneDelegate window] 0 us
-[SceneDelegate scene:willConnectToSession:options:] 0 us
-[SceneDelegate window] 0 us
-[SceneDelegate window] 0 us
-[SceneDelegate window] 0 us
-[ViewController viewDidLoad] 0 us
-[SceneDelegate sceneWillEnterForeground:] 0 us
-[SceneDelegate sceneDidBecomeActive:] 0 us
-[SceneDelegate window] 0 us
-[SceneDelegate window] 0 us
```

#### 5、统计方法耗时的其他方案
可以通过hook objc_msgSend：

1. 复制栈帧，debug时候（或crash时候），可以看到调用堆栈。

2. 保存寄存器。

3. 调用hook_objc_msgSend_before （保存lr和记录函数调用开始时间）

4. 恢复寄存器。

5. 调用objc_msgSend

6. 保存寄存器。

7. 调用hook_objc_msgSend_after （返回lr和函数结束时间减去开始时间，得到函数耗时）

8. 恢复寄存器。

9. ret。

   参考[TimeProfiler](https://github.com/maniackk/TimeProfiler)