#### 音视频基础概念

视频帧率(Frame Rate)：在视频中，一个帧(Frame)就是指一幅静止的画面。帧率，就是指视频每秒钟包括的画面数量(FPS，Frame per second)。

视频码率：视频在单位时间内的数据量的大小，编码器每秒编出的数据大小，单位是kbps，比如800kbps代表编码器每秒产生800kb（或100KB）的数据。文件大小（b）= 码率（b/s）x 时长（s）

视频帧：视频压缩中，每帧都代表着一副静止的画像，而 IPB 帧是一种常见的帧压缩方法。

关键帧：该类型帧可以直接转为可视且有效的图片，可以理解为这一帧画面的完整保留，解码时只需要本帧数据就可以完成（因为包含完整画面）

关键帧间隔(GOP)：关键帧与关键帧的间隔，就是一个GOP组。如果码率固定而 GOP 值越大（在为编解码器设置参数时，必须要设置 gop_size 的值，其代表的是两个 I 帧之间的帧数目。）画面质量就会越高，而需要解码的时间就会越长。

音频码率 ：比特率，每秒传送的比特数。单位为bps，比特率越高，传送数据速度越快。不同于视频码率，音频码率还需要计算声道数：采样率 x 采样位数 x 声道数

音频帧 ：一定数目的采样点数的集合。不同于视频帧，音频帧则需要看采样率的大小。

#### 流媒体基础概念

分片(Slice)：一帧图像可编码成一个或者多个片，每片包含整数个宏块，分片的目的是为了限制错误码的扩散和传输，使编码片相互间保持独立。

HLS：HTTP Live Streaming，由苹果公司提出的一种流媒体传输协议，可支持流媒体的直播和点播。相比于 RTMP 协议，HLS 无需在移动端安装 APP，同时兼容HTML5，因此在移动直播的传播和体验上都拥有巨大的优势。典型的HTL选择的封装格式是M3U8 + TS，M3U8 作为索引文件，TS 作为音视频数据封装文件。

m3u8：hls协议中的视频列表文件，直播时是定时更新这个文件，以获得最新的视频分片，点播时是文件中一次性记录所有的视频分片文件列表。

Ts：hls 协议中的视频分片文件，整个视频流由许多个ts分片组成，每一个分片中记录了视频的节目表信息，以及每个节目的媒体数据信息。

流畅度：本地流逝时间和视频流逝时间的对比，如果不匹配说明数据传输存在异常。

回源：当有用户访问某一个URL的时候，如果被解析到的那个CDN节点没有缓存响应的内容，或者是缓存已经到期，就会回源站去获取。如果没有人访问，那么CDN节点不会主动去源站拿的。

#### 关注指标

- 超R直播，在导播台获取流地址，格式类似为78941969-2559461593-10992803837303062528-2693342886-10057-A-0-1。在尾巴拼接_4000_264为流ID，填入流ID，选择时间，选择要查询的指标进行查询
- 超R直播，接入的是虎牙直播，关注回源第三方的指标即可。
- 关注视频和音频流畅度，指标为本地流逝时间与视频流逝时间两条线的差别，差别大说明这一切片数据异常。
- 关注音视频帧率，线条波动大说明异常。
