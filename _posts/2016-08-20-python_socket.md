---
layout:     post
title:      "python基础：socket"
subtitle:   "socket中TCP与UDP连接服务"
date:       2016-08-20 12:00:00
author:     "Ted"
header-img: "img/bg_02.jpg"
---

Socket是对TCP/UDP协议的封装，Socket本身并不是协议，而是一个调用接口（API），通过Socket，我们才能使用TCP/UDP协议。

### 一、UDP

UDP是传输层的协议，**面向无连接，不具有可靠性的数据报协议。**只确保发送消息，其他处理都由上层应用来完成。

Receive:

```
#coding=utf-8
import socket

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
# 绑定端口:
s.bind(('localhost', 3289))

print 'Bind UDP on 9999...'
while True:
  # 接收数据:
  data, addr = s.recvfrom(1024)
  print 'Received from {addr} data:{data}'.format(data=data,addr=addr)
  # s.sendto('Hello, %s!' % data, addr)
```

Send:

```
#coding=utf-8
import socket

s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
for data in ['Michael', 'Tracy', 'Sarah']:
  # 发送数据:
  s.sendto(data, ('localhost', 3289))
  # 接收数据:
  print s.recv(1024)
s.close()
```

### 二、TCP

TCP也是传输层协议，但是是面向连接的协议，TCP提供可靠的服务。也就是说，通过TCP连接传送的数据，无差错，不丢失，不重复，且按序到达。在发送数据之前，要先建立连接

Server:

```
from socket import *
from time import ctime

HOST=''
PORT=12345
BUFSIZ=1024
ADDR=(HOST, PORT)
sock=socket(AF_INET, SOCK_STREAM)

sock.bind(ADDR)

sock.listen(5)
while True:
    print('waiting for connection')
    tcpClientSock, addr=sock.accept()
    print('connect from ', addr)
    while True:
        try:
            data=tcpClientSock.recv(BUFSIZ)
        except:
            print(e)
            tcpClientSock.close()
            break
        if not data:
            break
        s='Hi,you send me :[%s] %s' %(ctime(), data.decode('utf8'))
        tcpClientSock.send(s.encode('utf8'))
        print([ctime()], ':', data.decode('utf8'))
tcpClientSock.close()
sock.close()
```

Client:

```
from socket import *

class TcpClient:
    HOST='127.0.0.1'
    PORT=12345
    BUFSIZ=1024
    ADDR=(HOST, PORT)
    def __init__(self):
        self.client=socket(AF_INET, SOCK_STREAM)
        self.client.connect(self.ADDR)

        while True:
            data=input('>')
            if not data:
                break
            self.client.send(data.encode('utf8'))
            data=self.client.recv(self.BUFSIZ)
            if not data:
                break
            print(data.decode('utf8'))
            
if __name__ == '__main__':
    client=TcpClient()
```



