---
layout:     post
category:   代码
title:      "常用代码/Code"
subtitle:   "iOS常用代码"
date:       2016-12-21 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

#### 1、Alert

```objc
- (void)showAlert{
   UIAlertController *alertController = [UIAlertController alertControllerWithTitle:@"提示" message:@"确定要这样做么" preferredStyle:UIAlertControllerStyleAlert];
    UIAlertAction *cancelAction = [UIAlertAction actionWithTitle:@"取消" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        
    }];
    UIAlertAction *okAction = [UIAlertAction actionWithTitle:@"确定" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
        
    }];
    [alertController addAction:cancelAction];
    [alertController addAction:okAction];
    [[self getCurrentViewController] presentViewController:alertController animated:NO completion:nil]; 
}    

- (UIViewController *)getCurrentViewController
{
    UIResponder *responder = self;
    while ((responder = [responder nextResponder])){
        if ([responder isKindOfClass: [UIViewController class]]){
            return (UIViewController *)responder;
        }
    }
    return nil;
}
```

#### 2、GCD

```objc
dispatch_async(dispatch_get_global_queue(0,0), ^{
	//耗时操作；
	dispatch_sync(dispatch_get_main_queue(), ^{
		//回到主线程；
	});
});
```

#### 3、Tableview Delegate & DataSource

```objc
- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
    return 10;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath{
    return 50;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
	UITableViewCell *cell =  [[UITableViewCell alloc]init];
	return cell;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath{

}
```

#### 4、UITableViewCell

```objc
+ (instancetype)cellWithTableView:(UITableView *)tableView{
    static NSString *cellID = @"HTTableViewCell";
    HTItemTableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:cellID];
    if (cell == nil) {
        cell = [[HTItemTableViewCell alloc]initWithStyle:UITableViewCellStyleDefault reuseIdentifier:cellID];
    }
    return cell;
}

- (id)initWithStyle:(UITableViewCellStyle)style reuseIdentifier:(NSString *)reuseIdentifier{
    self = [super initWithStyle:style reuseIdentifier:reuseIdentifier];
    if (self) {

    }
    return self;
}
```

#### 5、点击事件

```objc
    [ImageView setUserInteractionEnabled:YES];
    UIGestureRecognizer* ges = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(ImageViewTapped)];
    [ImageView addGestureRecognizer:ges];
```

