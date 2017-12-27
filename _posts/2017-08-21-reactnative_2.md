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
yarn add react-navigation
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

全部代码：

stack.js

```jsx
import React from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Button
} from 'react-native';
import {
  StackNavigator
} from 'react-navigation';

AppRegistry.registerComponent('DemoProject', () => RootPage);
export default class RootPage extends React.Component {
  render() {
    return <CustomStack />;
  }
}



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

export const CustomStack = StackNavigator({
  HomePage: {
    screen: HomeVC
  },
  SecondPage: {
    screen: SecondVC
  },
});
```

### 六、TabNavigator的使用

声明很简单

```jsx
const MainTabController = TabNavigator({
  TabItem_1: {
    screen: HomeVc
  },
  TabItem_2: {
    screen: SecondVC
  },
  TabItem_3: {
    screen: ThirdVC
  },
}, {
  tabBarPosition: 'bottom',
  tabBarOptions: {
    activeTintColor: '#e91e63',
  },
});

```

每个VC都对应一个界面，

tabBarPosition：位置，Tab有顶部top和底部bottom的位置

activeTintColor：是选中时TabItem的颜色

页面代码：

```jsx
class HomeVc extends React.Component {
  static navigationOptions = {
    tabBarLabel: 'Home',
    tabBarIcon: ({
      tintColor
    }) => (
      <Image
        source={require('./imgs/01.png')}
        style={[styles.icon, {tintColor: tintColor}]}
      />
    ),
  };
  render() {
    return (
      <View style={styles.homecontainer}>
        <Text>
          This is HomeVC page
        </Text>
      </View>
    );
  }
}
```

navigationOptions是Tab的一些选项，里面有Tab的名称和图片，依次设置三个页面后可以达到这个效果

![](/img/Simple_1/18.gif)

将StackNavigator作为一个Page插入TabItem

```jsx
const HomeNav = StackNavigator({
  HomePage: {
    screen: HomeVC,
    navigationOptions: {
      title: 'HomePage',
    }
  },
  SecondPage: {
    screen: SecondVC
  },
});

const MainTabController = TabNavigator({
  TabItem_1: {
    screen: HomeNav  //Nav作为一个Page插入来
  },
  TabItem_2: {
    screen: MessageVC
  },
  TabItem_3: {
    screen: SettingVC
  },
}, {
  tabBarPosition: 'bottom',
  tabBarOptions: {
    activeTintColor: '#e91e63',
  },
});
```

下面就是Tab+Nav的效果

![](/img/Simple_1/19.gif)

### 七、DrawerNavigator

```
class MyHomeScreen extends React.Component {
  static navigationOptions = {
    drawerLabel: 'Home',
    drawerIcon: ({
      tintColor
    }) => (
      <Image
        source={require('./imgs/01.png')}
        style={[styles.icon, {tintColor: tintColor}]}
      />
    ),
  };

  render() {
    return (
      <View style={styles.container}>
      <Text>This HomePage</Text>
      <Button
        onPress={() => this.props.navigation.navigate('DrawerOpen')}
        title="Show Drawer"
      />
      </View>
    );
  }
}

class MyNotificationsScreen extends React.Component {
  static navigationOptions = {
    drawerLabel: 'Notifications',
    drawerIcon: ({
      tintColor
    }) => (
      <Image
        source={require('./imgs/02.png')}
        style={[styles.icon, {tintColor: tintColor}]}
      />
    ),
  };

  render() {
    return (
      <View style={styles.container}>
      <Text>This MyNotificationsScreen</Text>
      <Button
        onPress={() => this.props.navigation.navigate('DrawerOpen')}
        title="Go back home"
      />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});

const MyApp = DrawerNavigator({
  Home: {
    screen: MyHomeScreen,
  },
  Notifications: {
    screen: MyNotificationsScreen,
  },
});
```

其中

```
this.props.navigation.navigate('DrawerOpen')
```

这是打开抽屉

```
this.props.navigation.navigate('DrawerClose')
```

点击空白或者上面这句代码是关闭抽屉，

navigationOptions里设置的是抽屉的标题或者图片

![](/img/Simple_1/20.gif)

