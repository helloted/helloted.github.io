---
layout:     post
category:   iOS
title:      "二进制重排"
subtitle:   "Page-fault、二进制重排"
date:       2020-07-28 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

#### 0、iOS应用的内存布局

应用的内存布局从低到高如下排布：

- **保留段**：用于给系统提供一些必要的空间；
- **代码段**和**数据段**在APP启动时就加载到了内存区
- **栈区(stack):**由编译器自动分配释放，存放函数的参数值，局部变量等值。是连续性的排列，效率高于堆内存。
- **堆区(heap):**一般由程序员分配释放，若程序员不释放，则可能会引起内存泄漏，堆区是随机开辟内存。
- **内核区**：由系统使用；

![img](/img/Simple_2/32.png)

#### 1、Page-fault

就程序而言，其虚拟内存中的逻辑地址空间中的地址始终可用。但是，如果应用程序访问当前不在物理RAM中的内存page上的地址，则产生了page fault。虚拟内存系统将调用特殊的page-fault handler来响应这种情况：

page-fault handler停止当前正在执行的代码，找到物理RAM内存的可用page，从磁盘加载包含所需数据的page，更新page table，然后将控制权返回给程序的代码，然后该代码可以正常的访问内存地址。这个过程称为分页paging。

##### 1.1 Page-fault查看

用到了**Instruments**中的**System Trace**工具。

点击录制⏺后，出现第一个页面，马上停止⏹。过滤只显示**Main Thread**相关，选择**Summary: Virtual Memory**。

- **File Backed Page In**次数就是触发**Page Fault**的次数了。
- **Page Cache Hit**就是页缓存命中的次数了。

![img](/img/Simple_2/36.png)

#### 2、二进制重排启动优化的原理

App 在启动时，需要执行各种函数，我们需要读取 _TEXT 段代码到物理内存中，这个过程会发生Page Fault缺⻚中断，由于启动时所需要执行的代码分布在 _TEXT 段的各个部分，会读取很多pages，导致启动时 Page Fault 数量非常多。虽然本身这个处理速度是很快的，但是在一个App的启动过程中可能出现上千(甚至更多)次Page Fault，这个时间积累起来会比较明显了。

重排的目的在于将hot code聚合在一起，即使得最经常执行的代码或最需要关键执行的代码（如启动阶段的顺序调用）聚合在一起，形成一个更紧凑的__TEXT段。

经过Layout后的二进制，其高频或关键代码排列会更紧凑，更利于优化startup启动阶段，以及mmap out/in(前后台切换或函数调用)阶段的速度和内存占用。

一个well-layout的二进制，如果使得所有启动阶段顺序执行的代码按照执行顺序排列在一起，那么整体page faults频率和次数会减少不少。在iphone 6s上，大概一次page faults平均需要0.2ms或更久。所以对于巨型app而言，更少的page faults会带来更大的启动提升。

less-well layout:

![img](/img/Simple_2/33.png)

如果存在funA->funB->funC->funD的顺序调用过程，则上述调用过程需要4次page faults，且均在非相邻页发生。那么4次page faults就需要4次页中断，以及4次物理页内存的占用；假设程序里存在很多这样的调用问题，那么就会频繁造成mmap的碎片化，并且导致占用的物理页内存更多。

well-layout:则可能只占用了1到2页物理内存，只触发了2次page faults，且是相邻页的page faults；

![img](/img/Simple_2/34.png)

#### 3、重排方案

对于lldb而言，可采取的方案是基于linker提供的-order_file选项。

-order_file在当前llvm上只支持代码段layout，即只支持指定函数符号来进行重排。

-order_file在iOS上只支持**text代码段的重排，而对于其余section，如**cstring,**ustring,**const,__objc等都是不支持重排的。

Bulid Setting-Linker-Order file

![img](/img/Simple_2/35.png)

#### 4、获取启动顺序

基于-order_file完成Machine Code Layout，我们需要获取到所有关键的symbol：即函数符号；
获取函数符号的方式即trace；

|  opt\cmp   |              原理              |              优点              |                       缺点                        |   举例    |
| :--------: | :----------------------------: | :----------------------------: | :-----------------------------------------------: | :-------: |
|  编译插桩  | 编译阶段结合源码插入桩代码记录 |  可实现对任何函数调用的trace   |       需要源码构建，对于链接的二进制.a无效        | XCode PGO |
| 运行时插桩 |      hook或动态插桩来记录      | 不需要源码，可解决二进制.a问题 | hook无法解决c/c++问题，dtrace无法解决真机运行问题 |  dtrace   |

采用https://github.com/yulingtianxia/AppOrderFiles的方法

```objective-c
//  AppOrderFiles.h
//! Project version number for AppOrderFiles.
FOUNDATION_EXPORT double AppOrderFilesVersionNumber;

//! Project version string for AppOrderFiles.
FOUNDATION_EXPORT const unsigned char AppOrderFilesVersionString[];

extern void AppOrderFiles(void(^completion)(NSString *orderFilePath));
```

```objc
#import "AppOrderFiles.h"
#import <dlfcn.h>
#import <libkern/OSAtomicQueue.h>
#import <pthread.h>

static OSQueueHead queue = OS_ATOMIC_QUEUE_INIT;

static BOOL collectFinished = NO;

typedef struct {
    void *pc;
    void *next;
} PCNode;

// The guards are [start, stop).
// This function will be called at least once per DSO and may be called
// more than once with the same values of start/stop.
void __sanitizer_cov_trace_pc_guard_init(uint32_t *start,
                                         uint32_t *stop) {
    static uint32_t N;  // Counter for the guards.
    if (start == stop || *start) return;  // Initialize only once.
    printf("INIT: %p %p\n", start, stop);
    for (uint32_t *x = start; x < stop; x++)
        *x = ++N;  // Guards should start from 1.
}

// This callback is inserted by the compiler on every edge in the
// control flow (some optimizations apply).
// Typically, the compiler will emit the code like this:
//    if(*guard)
//      __sanitizer_cov_trace_pc_guard(guard);
// But for large functions it will emit a simple call:
//    __sanitizer_cov_trace_pc_guard(guard);
void __sanitizer_cov_trace_pc_guard(uint32_t *guard) {
    if (collectFinished || !*guard) {
        return;
    }
    // If you set *guard to 0 this code will not be called again for this edge.
    // Now you can get the PC and do whatever you want:
    //   store it somewhere or symbolize it and print right away.
    // The values of `*guard` are as you set them in
    // __sanitizer_cov_trace_pc_guard_init and so you can make them consecutive
    // and use them to dereference an array or a bit vector.
    *guard = 0;
    void *PC = __builtin_return_address(0);
    PCNode *node = malloc(sizeof(PCNode));
    *node = (PCNode){PC, NULL};
    OSAtomicEnqueue(&queue, node, offsetof(PCNode, next));
}

extern void AppOrderFiles(void(^completion)(NSString *orderFilePath)) {
    collectFinished = YES;
    __sync_synchronize();
    NSString *functionExclude = [NSString stringWithFormat:@"_%s", __FUNCTION__];
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.01 * NSEC_PER_SEC)), dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSMutableArray <NSString *> *functions = [NSMutableArray array];
        while (YES) {
            PCNode *node = OSAtomicDequeue(&queue, offsetof(PCNode, next));
            if (node == NULL) {
                break;
            }
            Dl_info info = {0};
            dladdr(node->pc, &info);
            if (info.dli_sname) {
                NSString *name = @(info.dli_sname);
                BOOL isObjc = [name hasPrefix:@"+["] || [name hasPrefix:@"-["];
                NSString *symbolName = isObjc ? name : [@"_" stringByAppendingString:name];
                [functions addObject:symbolName];
            }
        }
        if (functions.count == 0) {
            if (completion) {
                completion(nil);
            }
            return;
        }
        NSMutableArray<NSString *> *calls = [NSMutableArray arrayWithCapacity:functions.count];
        NSEnumerator *enumerator = [functions reverseObjectEnumerator];
        NSString *obj;
        while (obj = [enumerator nextObject]) {
            if (![calls containsObject:obj]) {
                [calls addObject:obj];
            }
        }
        [calls removeObject:functionExclude];
        NSString *result = [calls componentsJoinedByString:@"\n"];
        NSLog(@"Order:\n%@", result);
        NSString *filePath = [NSTemporaryDirectory() stringByAppendingPathComponent:@"app.order"];
        NSData *fileContents = [result dataUsingEncoding:NSUTF8StringEncoding];
        BOOL success = [[NSFileManager defaultManager] createFileAtPath:filePath
                                                               contents:fileContents
                                                             attributes:nil];
        if (completion) {
            completion(success ? filePath : nil);
        }
    });
}

```

```objc
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.
    AppOrderFiles(^(NSString *orderFilePath) {
        NSLog(@"OrderFilePath:%@", orderFilePath);
    });
    return YES;
}
```

还有关键一步，设置一下build-Setting

```
      config.build_settings['OTHER_CFLAGS'] = '-fsanitize-coverage=func,trace-pc-guard'
      config.build_settings['OTHER_SWIFT_FLAGS'] = '-sanitize-coverage=func -sanitize=undefined'
```

真机在**Window**→**Devices And Simulators**(快捷键**⇧+⌘+2**)中获取启动顺序文件。

然后在Bulid Setting-Linker-Order file里添加就能改变编译顺序了。

4.1查看编译顺序

**Build Settings**中修改**Write Link Map File**为`YES`编译后会生成一个**Link Map**符号表`txt`文件。

![img](/img/Simple_2/37.png)