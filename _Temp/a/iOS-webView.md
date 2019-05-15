#### WebView中iOS与Js交互文档



#### 1、JS对象注入

Gamehelper

```
WEGJsBridgeObject *jsObj = [[WEGJsBridgeObject alloc]init];
jsObj.bridgeObject = gameHelper;
jsObj.bridgeName = name;
jsObj.protocolScheme = @"gamehelper";
jsObj.readyEventName = @"GameHelperReady";
[webView insertJavascriptWithBridgeObject:jsObj];
```

手游宝

```
WEGJsBridgeObject *newObj = [[WEGJsBridgeObject alloc]init];
newObj.bridgeObject = manager;
newObj.bridgeName = @"GameJoyRoom";
newObj.protocolScheme = @"gamejoyroom";
newObj.readyEventName = @"GameJoyRoomReady";
[webView insertJavascriptWithBridgeObject:newObj];
```

#### 2、Gamehlper函数调用

```objc

// 通过聊天页面打开的网页，如果支持分享的话，需要通过外部来设置分享数据源
- (void)setLinksItem:(ShareMessageLinksItem *)item shareTypes:(NSArray *)shareTypes;

#pragma mark - WebView Js Interfaces

/** 重新登录主账号
 */
- (void)relogin;

/** 刷新票据
 */
- (void)refreshTicket:(NSArray *)args;


/** 显示功能按钮
 * Array参数
 *      0:按钮名称
 *      1：url
 */
- (void)showFunctionButton:(NSArray *)args;

/** 隐藏功能按钮
 */
- (void)hideFunctionButton;

/** 放大图片
 * Array参数
 *      0:图片url
 */
- (void)showZoomImage:(NSArray *)args;

// 6.显示键盘
- (void)showKeyboard:(NSArray *)args;


/** 设置网页标题
 * Array参数
 *      0:网页标题
 */
- (void)setPageTitle:(NSArray *)args;


/** 打开新网页
 * Array参数
 *      0:网页url
 */
- (void)openNewPage:(NSArray *)args;


/** 分享网页
 * Array参数
 *      0:网页url
 */
- (void)shareWebPage:(NSArray *)args;


/** 带角色切换分享网页
 * Array参数
 *      0:网页title
 *      1:网页描述
 *      2:网页icon
 *      3:网页url
 *      4:类型
 *      5:function
 */
- (void)shareWebPageWithFuntion:(NSArray *)args;

/** 分享网页
 * Array参数
 *      0:网页title
 *      1:网页描述
 *      2:网页icon
 *      3:网页url
 *      4:类型
 *      5:DIYType
 */
- (void)shareWebPageDIY:(NSArray *)args;

/** 分享网页
 * Array参数
 *      0:网页title
 *      1:网页描述
 *      2:网页icon
 *      3:网页url
 *      4:类型
 *      5:DIYType
 */
- (void)shareWebPageWithFuntionDIY:(NSArray *)args;

/** 获取App版本号
 */
- (void)getAppVersionName;

/** 获取App版本字符串
 */
- (void)getAppVersionCode;

/** 打开新的线上网页
 * Array参数
 *      0:网页url
 *      1:返回类型
 *      2:是否支持角色切换
 */
- (void)openNewPageWithSwitch:(NSArray *)args;


/** 打开新的本地网页
 * Array参数
 *      0:网页url
 *      1:返回类型
 *      2:是否支持角色切换
 */
- (void)openLocalNewPageWithSwitch:(NSArray *)args;

/** 发起角色聊天
 * Array参数
 *      0:roleId
 *      1:objectId
 *      2:是否是群聊
 */
- (void)openChatPage:(NSArray *)args;


/** 打开角色卡页面
 * Array参数
 *      0:friendUserId
 */
- (void)openRoleCardPage:(NSArray *)args;


/** 打开角色卡属性页面
 * Array参数
 *      0:friendRoleId
 *      1:是否发送消息
 */
- (void)openRoleAttrPage:(NSArray *)args;


/** 资讯详情页面
 * Array参数
 *      0:articleId
 *      1:source
 *      2:domin
 */
- (void)openArticleDetailPage:(NSArray *)args;

/** 查看多个照片
 * Array参数
 *      0:index
 *      1:Json数组字符串
 */
- (void)showZoomImages:(NSArray *)args;

- (void)previewImages:(NSArray *)args;


/** app 是否安装，参数是包名，如com.tencent.smoba
 * Array参数
 *      0:bundleID
 */
- (void)isAppInstall:(NSArray *)args;

/** 启动 app，参数是包名，如com.tencent.smoba
 * Array参数
 *      0:bundleID
 */
- (void)startUpApp:(NSArray *)args;


/**
 * 打开新的线上网页
 * Array参数
 *      0:url
 *      1:返回类型
 *      2:是否支持角色切换
 *      3:是否添加参数
 */
- (void)openNewPageWithSwitchAndParam:(NSArray *)args;

// 打开王者荣耀战绩页面
- (void)openSmobaBattleDetail:(NSArray *)args ;


/** 选择图片上传
 */
- (void)uploadLocalPicture;

/**
 *  上报位置
 */
- (void)reportLocation;

#pragma mark - 1.2.0(16101301)


/**
 *  关闭当前页面
 */
- (void)closeActivity;

/**
 *  关闭当前界面，并且向上界面返回结果
 */
-(void)closeActivityWithResult:(NSString*)result;


/**
 * 客户端发送请求
 * Array参数
 *      0:url
 *      1:params
 *      2:callback
 *      3:timeout
 */
- (void)postEncrypt:(NSArray *)args;


/**
 * 打开本地按钮功能
 * Array参数
 *      0:jsonString
 */
- (void)openButton:(NSArray *)args;

/**
 * 屏幕截图
 */
- (void)screenCapture;


/**
 * 获取网络类型
 */
- (void)getNetworkType;

/**
 * 打开本地按钮功能
 * Array参数
 *      0:底部切换角色
 */
- (void)showBottomRoleSwitch:(NSArray *)args;


/**
 * 创建支付订单
 * Array参数
 *      0:goodsId
 *      1:goodsCount
 *      2:goodsType
 *      3:callback
 */
- (void)createOrderAndLaunchPay:(NSArray *)args;


/**
 * 设置闹钟
 */
- (void)setAlarmClock:(NSArray *)args;


/**
 * 删除闹钟
 */
- (void)cancelAlarmClock:(NSArray *)args;

/**
 * 打开tag资讯列表页
 * Array参数
 *      0:TagId
 *      1:InfoId
 *      2:TagName
 */
- (void)openInformationTags:(NSArray *)args;

/**
 * 进入专栏详情页
 * Array参数
 *      0:jsonString
 */
- (void)enterColumn:(NSArray *)args;


/**
 * 专栏订阅
 * Array参数
 *      0:jsonString
 */
- (void)rssColumn:(NSArray *)args;


/**
 * 拉评论
 * Array参数
 *      0:jsonString
 */
- (void)invokeComment:(NSArray *)args;

/**
 * 隐藏评论
 */
- (void)hideComment:(NSArray *)args;


/**
 * steam绑定成功
 */
- (void)steamBandSuccess:(NSArray *)args;


/** 调起评论，且自定义功能开关及评论模板
 *  data json数据
 *      url:评论地址
 *      loadComment: 是否加载评论， 0不加载，1加载
 *      enableThumb: 是否允许点赞，同上
 *      enableComment: 是否允许评论，同上
 *      commentLimitTips: 输入评论时的限制提示，不传则使用APP默认提示
 *      thumbLimitTips: 点赞时的限制提示，不传则使用APP默认提示
 *      isNew: 是否使用新版评论 0:否 1:是，不传默认使用旧版
 */
- (void)invokeCustomizeComment:(NSArray *)args;


- (void)setAuxiliarySwitch:(NSArray *)args;

- (void)getAuxiliarySwitch:(NSArray *)args;

/**
 * 关注用户
 * Array参数
 *      0:jsonString
 */
- (void)followUser:(NSArray *)args;

/**
 给当前的web页添加切换前后台的通知
 @param args 回调的函数名字【切换前台、切换后台】
 */
- (void)needAddApplicationCycleObserver:(NSArray *)args;
- (void)postEvent:(NSArray*)args;
```

#### 3、写入Cookie

```
- (void)_setWebViewCookie:(NSString *)value key:(NSString *)key domain:(NSString *)domain
```

在WebViewController.m内有方法写入Cookie，需要注意的是，H5页面读取Cookie是读取当前域名下的Cookie，所以在domin需要填入对应的域名。

```
[self _setWebViewCookie:accountId key:@"unionid" domain:@".qq.com"];
[self _setWebViewCookie:accountId key:@"unionid" domain:@"qq.com"];
```

#### 4、H5游戏一个Crash的解决方案

> libGPUSupportMercury.dylib  _gpus_ReturnNotPermittedKillClient

Open GL在渲染时，如果按Home键让App进入后台，会导致crash。原因是禁止在后台渲染GL。

解决方案就是在App进入后台的时通知停止渲染，具体如下

由H5端调用gamehelper.needAddApplicationCycleObserver()来开启监听，然后监听gamehelper_onresume()表示需要暂停，gamehelper_onresume()表示回复

案例:

```javascript
    function gamehelper_onpause(){
        if (cc && cc.director) {
            cc.director.stopAnimation();
        }
    }
    function gamehelper_onresume() {
        if (cc && cc.director) {
            cc.director.startAnimation();
        }
    }
    var total = 0;
    var timer = setInterval(function(){
        if (typeof(GameHelper) != 'undefined' && typeof(GameHelper.needAddApplicationCycleObserver) != 'undefined') {
            GameHelper.needAddApplicationCycleObserver('gamehelper_onresume', 'gamehelper_onpause');
            clearInterval(timer);
        } else if (total > 10000) {
            clearInterval(timer);
        }
        total += 200;
    }, 200);
```

