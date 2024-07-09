#### 问题

请实现一个函数，把字符串 s 中的每个空格替换成"%20"。 

示例 1： 
输入：s = "We are happy."
输出："We%20are%20happy." 



#### 解法

1、

```go
func replaceSpace(s string) string {
  // 利用空格字符串分割为数组
  str_arr := strings.Split(s, " ")
  // 以%20,拼接字符串
	s = strings.Join(str_arr, "%20")
    return s
}
```