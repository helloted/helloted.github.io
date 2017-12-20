---
layout:     post
title:      "React Native简易使用"
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

