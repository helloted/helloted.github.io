---
layout:     post
title:      "Objective-C混淆代码"
subtitle:   "如何将源代码的方法名和属性名混淆"
date:       2016-08-12 12:00:00
author:     "Ted"
header-img: "img/bg_02.jpg"
---

### 一、利用class-dump来查看源文件

class-dump是一个逆向工具，可以用来查看未加固的APP的方法名和属性名

#### 安装class-dump

从[class-dump下载地址](http://stevenygard.com/projects/class-dump)将dmg文件下载下来，将class-dump复制到/usr/bin目录，并在终端执行下面命令赋予权限

```
sudo chmod 777 /usr/bin/class-dump
```

如果没有办法复制到根目录，则先要开启系统权限

>重启 Mac，按住 Command+R 键直到 Apple logo 出现，进入 Recovery Mode
>点击 Utilities > Terminal
>在 Terminal 中输入 csrutil disable，之后回车
>重启 Mac

在终端中输入class-dump看到如下就说明安装成功了

![img](/img/ConfuseCode/confuse_00.png)

#### 查看头文件

将ipa改名为zip并解压能看到一个.app结尾的文件,执行

```
class-dump -H /Users/imac/Desktop/Payload/test.app -o /Users/imac/Desktop/heads
```

其中<font color="gray">/Users/imac/Desktop/Payload/test.app</font>是源文件路径,<font color="gray"> /Users/imac/Desktop/heads</font>是要导出的头文件的路径

可以在head文件夹里看到包含第三方库的头文件，里面可以看到属性名和方法名

![img](/img/ConfuseCode/confuse_01.png)

### 二、混淆代码

在项目里添加两个文件confuse.sh、func.list

在funlist里写上你要混淆的字符串；

在confuse.sh添加以下代码

```
#!/usr/bin/env bash

TABLENAME=symbols
SYMBOL_DB_FILE="symbols"
STRING_SYMBOL_FILE="func.list"
HEAD_FILE="$PROJECT_DIR/$PROJECT_NAME/codeObfuscation.h"
export LC_CTYPE=C

#维护数据库方便日后作排重
createTable()
{
    echo "create table $TABLENAME(src text, des text);" | sqlite3 $SYMBOL_DB_FILE
}

insertValue()
{
    echo "insert into $TABLENAME values('$1' ,'$2');" | sqlite3 $SYMBOL_DB_FILE
}

query()
{
    echo "select * from $TABLENAME where src='$1';" | sqlite3 $SYMBOL_DB_FILE
}

ramdomString()
{
    openssl rand -base64 64 | tr -cd 'a-zA-Z' |head -c 16
}

rm -f $SYMBOL_DB_FILE
rm -f $HEAD_FILE
createTable

touch $HEAD_FILE
echo '#ifndef Demo_codeObfuscation_h
#define Demo_codeObfuscation_h' >> $HEAD_FILE
echo "//confuse string at `date`" >> $HEAD_FILE
cat "$STRING_SYMBOL_FILE" | while read -ra line; do
    if [[ ! -z "$line" ]]; then
        ramdom=`ramdomString`
        echo $line $ramdom
        insertValue $line $ramdom
        echo "#define $line $ramdom" >> $HEAD_FILE
    fi
done
echo "#endif" >> $HEAD_FILE

sqlite3 $SYMBOL_DB_FILE .dump
```

用终端给confuse.sh添加权限

```
chmod 755 confuse.sh
```

并且在Build Phase里添加运行脚本

![img](/img/ConfuseCode/confuse_03.png)

并且在pch文件中加入

```
#ifdef __OBJC__  
    #import <UIKit/UIKit.h>  
    #import <Foundation/Foundation.h>  
    //添加混淆作用的头文件（这个文件名是脚本confuse.sh中定义的）  
    #import "codeObfuscation.h"  
#endif  
```

再次打包用class-dump测试一下，会发现代码乱了

![img](/img/ConfuseCode/confuse_04.png)

![img](/img/ConfuseCode/confuse_02.png)