---
layout:     post
category:   Python
title:      "Python常用API"
subtitle:   "Python常用API"
date:       2016-10-22 12:00:00
author:     "Ted"
header-img: "img/bg_01.jpg"
---

### 1、String

#### 1.1字符串拼接

Python使用'+'进行拼接字符串

```python
first_name = 'oliver'
last_name = 'smith'
full_name = first_name + ' ' + last_name
print(full_name)
>>> oliver smith
```

#### 1.2字符串截取

Python 截取字符串使用 变量[头下标:尾下标]，就可以截取相应的字符串，其中下标是从0开始算起，可以是正数或负数(从右向左)，下标可以为空表示取到头或尾。

```python
myStr = 'abcdefg'
print myStr[0:1]  # 输出myStr位置0开始到位置1以前的字符
>> a   

print myStr[:5]  #输出myStr从头开始到位置5以前的字符
>> abcde

print myStr[3:]  #输出myStr位置3开始到结尾的字符
>> defg

print myStr[-5:]  # 输出字符串，开始位置从右开始数位置为5，到结尾
>> cdefg

print myStr[:-2] # 输出字符串从0开始，终止位置从右开始数位置2
>> abcde
```

#### 1.3字符串替换

Python 替换字符串使用 变量.replace("被替换的内容"，"替换后的内容"，次数)，替换次数可以为空，即表示替换所有。要注意的是使用replace替换字符串后仅为临时变量，需重新赋值才能保存。

```python
myStr = 'akakak'
myStr = myStr.replace('k','8',2)  #将字符串里的k替换为8,前两个
print myStr
>> a8a8ak
```

#### 1.4字符串查找

Python 查找字符串使用 变量.find("要查找的内容"，[开始位置，结束位置])，开始位置和结束位置，表示要查找的范围，为空则表示查找所有。查找到第一个匹配的字符串后会返回位置，位置从0开始算，如果没找到则返回-1。

```python
myStr = 'akakak'
print myStr.find('k')
>> 1
```

#### 1.5字符串分割成数组

Python 分割字符串使用 变量.split("分割标示符号"[分割次数])，分割次数表示分割最大次数，为空则分割所有。

```python
myStr = 'a,b,c,d'
myStrlist = myStr.split(',',2) # 用逗号分割myStr字符串，并保存到列表
for value in myStrlist: # 循环输出列表值
print value
>> a   # 输出结果
>> b
>> c,d
```

#### 1.6其他

```python
sStr1 = 'strlen'
print len(sStr1) #字符串长度
>> 6

a = 100
b = str(a) # 数字转字符串

sStr1 = 'JCstrlwr'
sStr1 = sStr1.upper() #转大写
sStr1 = sStr1.lower() #转小写

sStr1 = 'abcdefg'
sStr1 = sStr1[::-1] # 字符串翻转
print sStr1
>> gfedcba
```

### 2、List

#### 2.1数组拼接

append可以在列表后方添加一个元素:

```python
member = ['a','b','c','1','2',3]
member.append("python")
print(member)
>> ['a', 'b', 'c', '1', '2', 3, 'python']
```

extend可以在列表后方添加一个列表：

```python
member = ['a','b','c','1','2',3]
member1 = ['one','two','three']
member.extend(member1)
print(member)
>> ['a', 'b', 'c', '1', '2', 3, 'one', 'two', 'three']
```

#### 2.2数组插入

```python
member = ['a','b','c','1','2']
member.insert(1,3)
print member
member1 = ['one','two','three']
member.insert(1,member1)
print(member)
>> ['a', 3, 'b', 'c', '1', '2']
>> ['a', ['one', 'two', 'three'], 3, 'b', 'c', '1', '2']
```

#### 2.3数组移除

```python
member = ['a','b','c','1','2','a']
member.remove('a') # 根据元素值，移除第一个'a'，如果没有'a'会报错
print member
del member[0] # 根据索引，删除0位置的元素
print member
>> ['b', 'c', '1', '2', 'a']
>> ['c', '1', '2', 'a']
```

#### 2.4遍历删除

```python
#filter() 函数用于过滤序列，过滤掉不符合条件的元素，返回由符合条件元素组成的新列表。
lst = [1, 1, 0, 2, 0, 0, 8, 3, 0, 2, 5, 0, 2, 6]
lst = filter(lambda x: x != 0, lst) 
print lst
>> [1, 1, 2, 8, 3, 2, 5, 2, 6]

#倒叙删除，不能正序是因为
lst = [1, 1, 0, 2, 0, 0, 8, 3, 0, 2, 5, 0, 2, 6]
for i in range(len(lst))[::-1]:
  if lst[i] == 0:
    del lst[i]
print lst
>> [1, 1, 2, 8, 3, 2, 5, 2, 6]
```

#### 2.5遍历

```python
member = ['a','b','c','1','2','a']
for item in member:
	print item
  
for i in range(len(list)):
  print member[i]
```

### 3、字典Map

#### 3.1修改字典

```python
dict = {'Name': 'Zara', 'Age': 7, 'Class': 'First'};
dict['Age'] = 8; # update existing entry
dict['School'] = "DPS School"; # Add new entry
print dict
>> {'School': 'DPS School', 'Age': 8, 'Name': 'Zara', 'Class': 'First'}
```

#### 3.2删除

```
dict = {'Name': 'Zara', 'Age': 7, 'Class': 'First'};

del dict['Name']; # 删除键是'Name'的条目
dict.clear();     # 清空词典所有条目
```

