---
layout:     post
title:      "React Native(二)：react-navigation使用"
subtitle:   "第三方导航栏react-navigation的使用"
date:       2017-08-21 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

### 四、react-navigation使用

react-navigation是FaceBook推荐使用的一个库，用于导航效果，[官方文档](https://reactnavigation.org/docs/intro/basic-app)

使用之前先在根目录文件内执行命令

```
yarn add react-navigatio
```

它有三种类型的

- `StackNavigator` - 与iOS中的UINavigationController类似，也是采用栈类型，将一个新的页面push进栈中进行展示。
- `TabNavigator` - 与UITabbarContrller类似的效果，主要用于一个屏幕内横向切换不同界面
- `DrawerNavigator` - 侧滑栏效果

### 五、StackNavigator的使用

首先，先在根目录下生成一个stack.js的js文件，

![](/img/Simple_1/14.png)

在iOS将文件名替换为stack

```
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"stack" fallbackResource:nil];
```

照例，先定义好页面

```jsx
AppRegistry.registerComponent('DemoProject', () => RootPage);
export default class RootPage extends React.Component {
  render() {
    return <CustomStack />;
  }
}
```

其中，`CustomStack`是我们自定义的导航组件

```jsx
export const CustomStack = StackNavigator({
  HomePage: {
    screen: HomeVC
  },
  SecondPage: {
    screen: SecondVC
  },
});
```

由StackNavigator生成导航主键。HomePage和SecondPage是我们的两个页面，页面里带有screen的参数,里面的组件才是定义页面内容的地方。要注意的是，顺序依次是进栈的顺序。

分别定义HomeVC组件和SecondVC组件

```jsx
class HomeVC extends React.Component {
  static navigationOptions = {
    title: 'HomeVC',
  };
  render() {
    const {
      navigate
    } = this.props.navigation;
    return (
      <View>
        <Text>Hello, This is HomeVC!</Text>
        <Button
          onPress={() => navigate('SecondPage')}
          title="Jump to SecondVC"
        />
      </View>
    );
  }
}


class SecondVC extends React.Component {
  static navigationOptions = {
    title: 'SecondVC',
  };
  render() {
    return (
      <View>
        <Text>Now, you are in SecondVC</Text>
      </View>
    );
  }
}

```

可以有以下的效果：

![](/img/Simple_1/17.gif)

