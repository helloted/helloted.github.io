#### 一、命名

1、变量和方法名：驼峰命名；

2、宏和常量命名

- `#define` 预处理定义的常量全部大写，单词间用 _ 分隔
- 宏定义的本质是在编译时进行替换，所以宏定义中如果包含表达式或变量，表达式或变量必须用小括号括起来，防止与其他变量出现混合的情况。

#### 二、ViewController代码结构

在函数分组和protocol/delegate实现中使用`#pragma mark -`来分类方法，遵循以下结构：

```objc

// 生命周期
#pragma mark - Lifecycle

- (instancetype)init {}

- (void)awakeFromNib {}

- (void)loadView {}

- (void)viewDidLoad {}

- (void)viewWillAppear:(BOOL)animated {}

- (void)viewWillLayoutSubviews {}

- (void)viewDidLayoutSubviews {}

- (void)viewDidAppear:(BOOL)animated {}

- (void)viewWillDisappear:(BOOL)animated {}

- (void)viewDidDisappear:(BOOL)animated {}

- (void)dealloc {}

- (void)didReceiveMemoryWarning {}


// 如果是Storyboard/Xib
#pragma mark - IBActions

- (IBAction)sendBtnClicked:(id)sender {}

// 公开方法
#pragma mark - Public
- (void)publicMethod {}

// 私有方法
#pragma mark - Private
- (void)privateMethod {}

// 各种代理和协议方法
#pragma mark - Protocol
#pragma mark - UITextFieldDelegate
#pragma mark - UITableViewDataSource
#pragma mark - UITableViewDelegate

// 懒加载的Getter
#pragma mark - Getter && Setter

// Copy协议和description较少
#pragma mark - NSCopying/NSObject
- (id)copyWithZone:(NSZone *)zone {}
- (NSString *)description {}
```

#### 三、字面编码

`NSString`, `NSDictionary`, `NSArray`, 和 `NSNumber`可以在创建不可变值时使用，注意不要传nil值，否则会崩溃。

```
NSArray *names = @[@"Brian", @"Matt", @"Chris", @"Alex", @"Steve", @"Paul"];
NSDictionary *productManagers = @{@"iPhone": @"Kate", @"iPad": @"Kamal", @"Mobile Web": @"Bill"};
NSNumber *shouldUseLiterals = @YES;
NSNumber *buildingStreetNumber = @10018;
```

#### 四、变量

建议使用属性而不是实例变量，因为属性会自动有Setter和Getter

**Preferred:**

```
@interface RWTTutorial : NSObject

@property (strong, nonatomic) NSString *tutorialName;

@end
```

**Not Preferred:**

```
@interface RWTTutorial : NSObject {
  NSString *tutorialName;
}
```

#### 五、常量

共享一块内存空间，就算项目中N处用到，也不会分配N块内存空间，可以根据const修饰的位置设定能否修改，在编译阶段会执行类型检查

推荐定义常量来声明常量而不是使用`#define`，const不能满足的情况再考虑使用宏定义，如下

```
NSString *const kWEGMomentTopicNumberUpdateNotification = @"kWEGMomentTopicNumberUpdateNotification";
```

而不是

```
#define kWEGMomentTopicNumberUpdateNotification @"kWEGMomentTopicNumberUpdateNotification"
```

如果是需要外部共享，使用extern关键字，参考苹果官方

```
extern NSString * const UIApplicationDidEnterBackgroundNotification  
extern NSString * const UIApplicationWillEnterForegroundNotification  
extern NSString * const UIApplicationDidFinishLaunchingNotification;
```

#### 六、整体架构

推荐MVC+VM(也叫MVCS，S是Store的意思，数据处理逻辑)。

MVC+VM：MVC是苹果官方推荐，V专注于视图构建，Model是瘦Model，专注于模型构建，仅持有数据；数据流动全部由Controller来传递，流向清晰，当Controller变复杂时，将数据处理逻辑剥离出来成为VM，模型数据流向仍由Controller负责，优点是数据流向清晰，业务耦合弱，缺点是不同Controller可能要生成各种不同VM适配。

MVVM：主要优点数据绑定，做到数据一致性，同时也能做到给Controller瘦身目的，缺点是数据绑定导致数据流向不清晰，难以调试Bug，如果没有详细清晰文档，很可能成为一个天坑(助手里的聊天模块)。

MVP：Presenter与Controller相互持有，通过接口，P层拥有了Controller的权利，所有的业务分配都在P层内完成，包括像tableView的数据源和代理。优点是MVC解耦，MVC成为平行；缺点是，有点特意为了解耦而解耦，初看会莫名其妙。