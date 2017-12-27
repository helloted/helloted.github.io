---
layout:     post
title:      "React Native(一)：基础"
subtitle:   "React Natieve的常用命令和第三方使用"
date:       2017-08-20 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 一、React-Native简介以及开发环境搭建

React Native (简称RN)是Facebook于2015年4月开源的跨平台移动应用开发框架，是Facebook早先开源的UI框架 React 在原生移动应用平台的衍生产物，目前支持iOS和安卓两大平台。RN使用Javascript语言，类似于HTML的JSX，以及CSS来开发移动应用。(来自百度百科)

类似的框架还有Vue以及对应的移动框架Weex(已由阿里开源维护)。

1、利用HomeBrew来安装Node

```
brew install node
```

2、安装React Native

```
npm install react-native-cli
```

3、安装Yarn，Yarn是FaceBook用来替代npm的工具

```
npm install -g yarn
```

4、初始化React Native，第一个Demo，FirstDemo，先cd要某个文件夹

```
react-native init FirstDemo
```

5、运行，直接点Xcode的Run或者用命令行

```
cd FirstDemo
react-native run-ios
```

6、真机运行，手机与mac在同一个网络下面

```
jsCodeLocation =  [NSURL URLWithString:@"http://本机IP:8081/index.bundle?platform=ios"];
```

![](/img/Simple_1/14.png)

### 二、常用命令

本地IP地址

```
ifconfig | grep "inet " | grep -v 127.0.0.1
```

添加第三方库，比如react-navigation，cd到根目录，执行

```
yarn add react-navigation
```

### 三、基础代码讲解

iOS端

```objc
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"App" fallbackResource:nil];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"DemoProject"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
```

里面有两个关键词，`App`和`DemoProject`，其中`DemoProject`是项目文件夹目录名称，App则是这个RCTRootView对应的js文件的名称，即对应的文件为App.js。

App.js

```jsx
import React, {
  Component
} from 'react';
import {
  AppRegistry,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

//将RootPage注册
AppRegistry.registerComponent('DemoProject', () => RootPage);

// 自定义RootPage
export default class RootPage extends Component < {} > {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit App.js
        </Text>
        <Text style={styles.instructions}>
          {instructions}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
```

其中Text, View, Button三个标签类似于iOS当中的UITextView,UIView,UIButton。