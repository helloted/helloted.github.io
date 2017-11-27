---
layout:     post
title:      "iOS之Runtime运用：Json转Model"
subtitle:   "简易版的JSon转模型"
date:       2017-05-09 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

完整版代码可以在[GitHub-JsonToModel](https://github.com/helloted/JsonToModel)下载

### 一、前言

与后台交互，后台返回的数据一般是Json类型的，然而我们的定义的模型一般是继承自NSObject，Json与Model之间的转换，第三方工具也有很多，比如YYModel,JSONModel,MJExtention.

这三个第三方框架的测试效率为YYModel>MJExtention>JsonModel

其中JSon转Model的核心知识点就在于利用Runtime的特点来获取属性以及KVC进行赋值，尝试了一下，封装了一个简易版的工具，一行代码即可完成转换

```
User *user = [User ht_modelFromJson:jsonStr];
```

### 二、流程

首先要引入runtime

```
#import <objc/runtime.h>
```

拿到Model里的所有属性

```
//获取当前类中的所有属性
 unsigned int propertyCount;
 objc_property_t *allPropertys = class_copyPropertyList([self class], &propertyCount);
```

获取属性的name

```
  //拿到属性名称
 NSString *property_name = [NSString stringWithUTF8String:property_getName(property)];
```

以name为key从Json字典里获取值

```
// 从Json字典里获取值
id value = [dict objectForKey:key];
if (value == nil) {
continue;
}
```

KVC赋值

```
[self setValue:value forKey:key];
```

### 三、补充

> 1、拿到的可能不是Json字典，而是Json字符串或者是二进制类型NSData，那么首先要对将Json字符串转成Json字典

```
- (NSDictionary *)dictionaryWithJSON:(id)json
{
    if (!json) {
        return nil;
    }
    // 若是NSDictionary类型，直接返回
    if ([json isKindOfClass:[NSDictionary class]]) {
        return json;
    }
    
    NSDictionary *dict = nil;
    NSData *jsonData = nil;
    
    // 如果是NSString，就先转化为NSData
    if ([json isKindOfClass:[NSString class]]) {
        jsonData = [(NSString *)json dataUsingEncoding:NSUTF8StringEncoding];
    } else if ([json isKindOfClass:[NSData class]]) {
        jsonData = json;
    }
    
    // 如果时NSData类型，使用NSJSONSerialization
    if (jsonData && [jsonData isKindOfClass:[NSData class]]) {
        NSError *error = nil;
        dict = [NSJSONSerialization JSONObjectWithData:jsonData options:0 error:&error];
        if (error) {
            NSLog(@"dictionaryWithJSON error:%@", error);
            return nil;
        }
        if (![dict isKindOfClass:[NSDictionary class]]) {
            return nil;
        }
    }
    
    return dict;
}
```

> 2、如果字典属性与模型属性不完全相同，则需要匹配一下

解决方案是定义一个Protocol

```
@protocol JSONModelSpecialAttributesProtocol <NSObject>

@optional
// 属性匹配
+ (NSDictionary *)attributesMapperDictionary;

// 嵌套模型
+ (NSDictionary *)attributesNestDictionary;

@end
```

如果某个Model与字典不一一匹配，则遵循这个协议，将需要配套的属性返回即可，在赋值的时候，将key现行转换一下

```
    // 某些属性需要重新映射===
    NSDictionary *mapperDict;
    if ([self conformsToProtocol:@protocol(JSONModelSpecialAttributesProtocol)] && [[self class] respondsToSelector:@selector(attributesMapperDictionary)]) {
        mapperDict = [[self class] attributesMapperDictionary];
    }
    
    // 如果有属性需要重新映射===
    NSString *key = property_name;
    if (mapperDict && [mapperDict objectForKey:property_name]) {
    key = [mapperDict objectForKey:property_name];
    }
```

> 3、如果模型里面嵌套了模型，也是需要先自定义下，在赋值时做个区分

```
      // 如果有属性嵌套其他Model
        if (nestDict && [nestDict objectForKey:property_name]) {
            NSString *className = [nestDict objectForKey:property_name];
            Class class = NSClassFromString(className);
            id obj = [[class alloc]init];
            [obj modelWithJsonDictionary:value];
            [self setValue:obj forKey:key];
        }else{
            [self setValue:value forKey:key];
        }
```

完整版代码可以在[GitHub-JsonToModel](https://github.com/helloted/JsonToModel)下载

