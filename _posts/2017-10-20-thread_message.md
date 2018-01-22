---
layout:     post
title:      "【iOS】进程/线程间通信"
subtitle:   "iOS开发中多线程的通信"
date:       2017-10-20 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 一、线程间通信

因为线程是共享内存空间的，所以线程间通信相比于进程间通信会简单一些，线程间通信的体现

- 1个线程传递数据给另1个线程
- 在1个线程中执行完特定任务后，转到另1个线程继续执行任务

 在iOS多线程开发中，有NSObject、NSThread、GCD、NSOpeartion几种方式，对应的线程间通信也有几种

#### 1、NSObject

```objc
/*
 *  回到主线程执行，执行self的showImage方法，参数是image
 */
[self performSelectorOnMainThread:@selector(showImage:) withObject:image waitUntilDone:YES];

// waitUntilDone的含义:
//    如果传入的是YES: 那么会等到主线程中的方法执行完毕, 才会继续执行下面其他行的代码
//    如果传入的是NO: 那么不用等到主线程中的方法执行完毕, 就可以继续执行下面其他行的低吗
```

```objc
/*
 *  去xx线程执行aSelector方法，参数是arg
 */
- (void)performSelector:(SEL)aSelector onThread:(NSThread *)thr withObject:(id)arg waitUntilDone:(BOOL)wait;
```

#### 2、GCD

```objc
dispatch_async(queue, ^{
		# do something
		
		
        dispatch_sync(dispatch_get_main_queue(), ^{
			#回到主线程
        });
    });
```

#### 3、NSOperation

```objc
NSOperationQueue *queue = [[NSOperationQueue alloc] init];

    // 2.添加任务(操作)
    [queue addOperationWithBlock:^{
		
		# 回到主线程
        [[NSOperationQueue mainQueue] addOperationWithBlock:^{
            self.imageView.image = image;
        }];
    }];
```

### 二、进程间通信/APP间通信

进程是容纳运行一个程序所需要所有信息的容器。在iOS中每个APP里就一个进程，所以进程间的通信实际上是APP之间的通信。iOS是封闭的系统，每个APP都只能访问各自沙盒里的内容

#### 1、URL Scheme

App1通过openURL的方法跳转到App2，并且在URL中带上想要的参数，有点类似http的get请求那样进行参数传递。这种方式是使用最多的最常见的，使用方法也很简单只需要源App1在info.plist中配置LSApplicationQueriesSchemes，指定目标App2的scheme；然后在目标App2的info.plist中配置好URL types，表示该app接受何种URL scheme的唤起。

![img](/img/Simple_1/09.jpeg)

```objc
UIApplication *application = [UIApplication sharedApplication];
[application openURL:URL options:@{} completionHandler:nil];
```

#### 2、Keychain

Keychain是iOS中一个安全存储容器，本质是一个sqlite数据库，位置在/private/var/Keychains/keychain-2.db。它是独立于每个App的沙盒之外的，所以即使App被删除之后，Keychain里面的信息依然存在。基于安全和独立于app沙盒的两个特性，Keychain主要用于给app保存登录和身份凭证等敏感信息，这样只要用户登录过，即使用户删除了app重新安装也不需要重新登录。

Keychain用于App间通信的一个典型场景也和app的登录相关，就是统一账户登录平台。使用同一个账号平台的多个app，只要其中一个app用户进行了登录，其他app就可以实现自动登录不需要用户多次输入账号和密码。一般开放平台都会提供登录SDK，在这个SDK内部就可以把登录相关的信息都写到keychain中，这样如果多个app都集成了这个SDK，那么就可以实现统一账户登录了。

可以自封装一个keychain相关的存储

#### 3、UIPasteboard

UIPasteboard是剪切板功能，因为iOS的原生控件UITextView，UITextField 、UIWebView，我们在使用时如果长按，就会出现复制、剪切、选中、全选、粘贴等功能，这个就是利用了系统剪切板功能来实现的。而每一个App都可以去访问系统剪切板，所以就能够通过系统剪贴板进行App间的数据传输了。

UIPasteboard典型的使用场景就是淘宝跟微信/QQ的链接分享。淘口令。

#### 4、UIDocumentInteractionController

UIDocumentInteractionController主要是用来实现同设备上app之间的共享文档，以及文档预览、打印、发邮件和复制等功能。它的使用非常简单.

```objc
#import "ViewController.h"

@interface ViewController ()<UIDocumentInteractionControllerDelegate>
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.navigationItem.title=@"预览";

    NSString *urlStr = [[NSBundle mainBundle] pathForResource:@"iOS开发指南.pdf" ofType:nil];
    NSURL *url = [NSURL fileURLWithPath:urlStr];

    UIDocumentInteractionController *documentVc = [UIDocumentInteractionController interactionControllerWithURL:url];
    documentVc.delegate = self;

    [documentVc presentPreviewAnimated:YES];

}

#pragma mark - UIDocumentInteractionController 代理方法
- (UIViewController *)documentInteractionControllerViewControllerForPreview:(UIDocumentInteractionController *)controller{
    return self;
}

- (UIView *)documentInteractionControllerViewForPreview:(UIDocumentInteractionController *)controller{
    return self.view;
}

- (CGRect)documentInteractionControllerRectForPreview:(UIDocumentInteractionController *)controller{
    return self.view.bounds;
}
```

![img](/img/Simple_1/10.jpeg)

#### 5、local socket

App1在本地的端口port1234进行TCP的bind和listen，另外一个App2在同一个端口port1234发起TCP的connect连接，这样就可以建立正常的TCP连接，进行TCP通信了，那么就想传什么数据就可以传什么数据了。

这种方式最大的特点就是灵活，只要连接保持着，随时都可以传任何相传的数据，而且带宽足够大。它的缺点就是因为iOS系统在任意时刻只有一个app在前台运行，那么就要通信的另外一方具备在后台运行的权限，像导航或者音乐类app。

它是常用使用场景就是某个App1具有特殊的能力，比如能够跟硬件进行通信，在硬件上处理相关数据。而App2则没有这个能力，但是它能给App1提供相关的数据，这样APP2跟App1建立本地socket连接，传输数据到App1，然后App1在把数据传给硬件进行处理。

![img](/img/Simple_1/11.jpeg)