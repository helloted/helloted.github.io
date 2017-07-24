---
layout:     post
title:      "CoreData简介以及第三方框架MagicRecord源码解析"
subtitle:   "CoreData简介以及第三方框架MagicRecord源码解析"
date:       2016-12-01 12:00:00
author:     "Ted"
header-img: "img/bg_02.jpg"
---

### 一、CoreData结构

![](/img/coredata/01.png)

#### NSManagedObject

数据库对象，一个`NSManagedObject`对应一张表，`NSManagedObject`的一个属性对应数据表的一个字段。数据库的增删查改就是操作`NSManagedObject`，通过*xCode->Editor->Create NSManagedObject Subclass...*来创建对应表的对象model

#### NSManagedObjectContext

`NSManagedObject`操作的上下文，`NSManagedObject`的操作会先缓存在上下文中，还未存到磁盘中

```objective-c
- (NSManagedObjectContext *)managedObjectContext{
    if (__managedObjectContext != nil) {
        return __managedObjectContext;
    }
    NSPersistentStoreCoordinator *coordinator = [self persistentStoreCoordinator];
    if (coordinator != nil) {
        __managedObjectContext = [[NSManagedObjectContext alloc] init];
        [__managedObjectContext setPersistentStoreCoordinator:coordinator];
    }
    return __managedObjectContext;
}
```

生成`NSManagedObjectContext`时需要设置`NSPersistentStoreCoordinator`

有三种类型

- NSConfinementConcurrencyType (或者不加参数，默认就是这个)
- NSMainQueueConcurrencyType (表示只会在主线程中执行)
- NSPrivateQueueConcurrencyType (表示可以在子线程中执行)

通过 setParentContext 方法，可以设置另外一个 NSManagedObjectContext 为自己的父级，这个时候子级可以访问父级下所有的对象，而且子级 NSManagedObjectContext 的内容变化后，如果执行save方法，会自动的 merge 到父级 NSManagedObjectContext 中，也就是子级save后，变动会同步到父级 NSManagedObjectContext。当然这个时候父级也必须再save一次，如果父级没有父级了，那么就会直接向NSPersistentStoreCoordinator中写入，如果有就会接着向再上一层的父级冒泡......

#### NSPersistentStoreCoordinator

用来管理保存数据到磁盘这个操作

```objective-c
- (NSPersistentStoreCoordinator *)persistentStoreCoordinator{
    if (__persistentStoreCoordinator != nil) {
        return __persistentStoreCoordinator;
    }
    NSURL *storeURL = [[self applicationDocumentsDirectory] URLByAppendingPathComponent:@"HelloApp.sqlite"];
    NSError *error = nil;
    __persistentStoreCoordinator = [[NSPersistentStoreCoordinator alloc] initWithManagedObjectModel:[self managedObjectModel]];
    if (![__persistentStoreCoordinator addPersistentStoreWithType:NSSQLiteStoreType configuration:nil URL:storeURL options:nil error:&error]) {
        NSLog(@"Unresolved error %@, %@", error, [error userInfo]);
        abort();
    }    
    return __persistentStoreCoordinator;
}
```

生成`NSPersistentStoreCoordinator`需要参数：文件保存路径、`NSManagedObjectModel`

#### NSManagedObjectModel

生成这个类的来源就是在 xCode 里的.xcdatamodeld文件，我们可以可视化的对这个文件进行操作，实际上这个文件也就相当于数据库的 schema，这个文件编译后就是.momd或.mom文件。

```objective-c
- (NSManagedObjectModel *)managedObjectModel{
    if (__managedObjectModel != nil) {
        return __managedObjectModel;
    }
    NSURL *modelURL = [[NSBundle mainBundle] URLForResource:@"HelloApp" withExtension:@"momd"];
    __managedObjectModel = [[NSManagedObjectModel alloc] initWithContentsOfURL:modelURL];
    return __managedObjectModel;
}
```

### 二、多线程里的CoreData

在多线程中，每个线程都会有一个上下文`NSManagedObjectContext`，而`NSManagedObjectContext`可以共享一个`NSPersistentStoreCoordinator`或者，每个`NSManagedObjectContext`都对应一个`NSPersistentStoreCoordinator`，所以会有以下几种方式:

#### 1、

![](/img/coredata/02.png)

这种方式，最简单明了，在子线程的privatecontext里操作完数据库对象后，将操作缓存merger到主线程的maincontext，再由maincontext通过`NSPersistentStoreCoordinator`存到本地磁盘。但是存到本地磁盘中是一个耗时的IO操作，对于主线程来说，这是不能忍的，所以不能用这种方式

#### 2、

![](/img/coredata/03.png)

这个方式在跟第一个方式的区别在于，主线程上的maincontext与`NSPersistentStoreCoordinator`交互之家再插了一层子线程的privatecontext，context之间的传递是很快的，这样可以有效地避免IO阻塞主线程，而且childContext调用save方法，其parentContext不用任何merge操作，CoreData自动将数据merge到parentContext当中，这样可以保证每个context的数据同步

#### 3、

![](/img/coredata/04.png)

这种情况下，privatecontext与maincontext共同连接`NSPersistentStoreCoordinator`，子线程中创建privateContext，进行数据增删改查操作，直接save到本地数据库，这时在回调之前注册的NSManagedObjectContextDidSaveNotification的回调方法，在该方法中调用mainContext的mergeChangesFromContextDidSaveNotification:notification方法，将所有的数据变动merge到mainContext中，这样就保持了两个Context中的数据同步。由于大部分的操作都是privateContext在子线程中操作的，所以这种设计是UI线程耗时最少的一种设计，但是它的代价是需要多写mergeChanges的方法。