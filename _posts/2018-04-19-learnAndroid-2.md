---
layout:     post
category:   Android
title:      "安卓学习记录(二)"
subtitle:   "常用操作"
date:       2018-04-19 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

#### 1、打印日志-LogCat

```
Log.d("LOGTAG_D","hello");
```

第一个参数是tag，第二个参数才是内容

快捷键：

- 输入**logt**(方法外面)，按Tab键，会自动生成Tag;
- 输入**logd**，按Tab键，自动生成Log.d(TAG, "onCreate: ")，其他级别一次类推。

为LogCat设置显示样式以及选择过滤器，否则会不断打印日志，选择Show only selected application或者自定义过滤器，为不同级别日志设置颜色Setting-->Editor->Colors & Fonts->Android Logcat

![img](/img/Simple_8/54.png)

#### 2、获取View

```java
Button btn = (Button) findViewById(R.id.button);
```

fv+Tab快捷键

#### 3、Button

两种写法

```java

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);
        
        // 一种写法
        Button firstBtn = (Button) findViewById(R.id.firstBtn);
		firstBtn.setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
			Toast.makeText(MainActivity.this, "Clicked", Toast.LENGTH_SHORT).show();
			}
		});
        
        // 另一种写法
       	Button secBtn = (Button) findViewById(R.id.secBtn);
        secBtn.setOnClickListener(listener);
	}
	
	private OnClickListener listener = new OnClickListener(){
		@Override
		public void onClick(View view) {
			Toast.makeText(MainActivity.this, "Clicked", Toast.LENGTH_SHORT).show();
		}
```

#### 4、跳转到下一个页面

显示启动

```java
Intent intent = new Intent(MainActivity.this, NextActivity.class);
intent.putExtra("name", "ted");
startActivityForResult(intent, 1);
```

NextActivity

```java
Intent intent = getIntent();
String name = intent.getStringExtra("name");


Log.d(TAG, "onCreate: " + name);

Intent backdata = new Intent();
backdata.putExtra("back","backValue");
setResult(0,backdata);
```

返回时候

```java
/**
 * 为了得到传回的数据，必须在前面的Activity中（指MainActivity类）重写onActivityResult方法
 *
 * requestCode 请求码，即调用startActivityForResult()传递过去的值
 * resultCode 结果码，结果码用于标识返回数据来自哪个新Activity
 */
@Override
protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    String result = data.getStringExtra("back");
    Log.i(TAG, result);
}
```