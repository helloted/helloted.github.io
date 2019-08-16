---
layout:     post
category:   iOS
title:      "安卓 VS iOS（一）"
subtitle:   "Flutter在游戏助手项目实战"
date:       2018-06-21 12:00:00
author:     "Ted"
header-img: "img/default.jpg"
---

| libobjc.A.dylib      | objc_msgSend + 16                                            |
| -------------------- | ------------------------------------------------------------ |
| 1 UIKit              | -[_UIWebViewScrollViewDelegateForwarder forwardInvocation:] + 168 |
| 2 CoreFoundation     | ____forwarding___ + 408                                      |
| 3 CoreFoundation     | _CF_forwarding_prep_0 + 92                                   |
| 4 UIKit              | -[UIScrollView _getDelegateZoomView] + 144                   |
| 5 UIKit              | -[UIScrollView _zoomScaleFromPresentationLayer:] + 40        |
| 6 UIKit              | -[UIWebDocumentView _zoomedDocumentScale] + 56               |
| 7 UIKit              | -[UIWebDocumentView _layoutRectForFixedPositionObjects] + 100 |
| 8 UIKit              | -[UIWebDocumentView _updateFixedPositionedObjectsLayoutRectUsingWebThread:synchronize:] + 60 |
| 9 UIKit              | -[UIWebDocumentView _updateFixedPositioningObjectsLayoutAfterScroll] + 36 |
| 10 UIKit             | -[UIWebBrowserView _updateFixedPositioningObjectsLayoutAfterScroll] + 60 |
| 11 CoreFoundation    | ___CFNOTIFICATIONCENTER_IS_CALLING_OUT_TO_AN_OBSERVER__ + 20 |
| 12 CoreFoundation    | __CFXRegistrationPost + 396                                  |
| 13 CoreFoundation    | ____CFXNotificationPost_block_invoke + 60                    |
| 14 CoreFoundation    | -[_CFXNotificationRegistrar find:object:observer:enumerator:] + 1532 |
| 15 CoreFoundation    | _CFXNotificationPost + 368                                   |
| 16 Foundation        | -[NSNotificationCenter postNotificationName:object:userInfo:] + 68 |
| 17 UIKit             | -[UIInputWindowController postEndNotifications:withInfo:] + 556 |
| 18 UIKit             | ___77-[UIInputWindowController moveFromPlacement:toPlacement:starting:completion:]_block_invoke_2896+ 100 |
| 19 UIKit             | -[UIInputWindowController performWithSafeTransitionFrames:] + 216 |
| 20 UIKit             | ___77-[UIInputWindowController moveFromPlacement:toPlacement:starting:completion:]_block_invoke887 +508 |
| 21 UIKit             | -[UIViewAnimationBlockDelegate _didEndBlockAnimation:finished:context:] + 628 |
| 22 UIKit             | -[UIViewAnimationState sendDelegateAnimationDidStop:finished:] + 312 |
| 23 UIKit             | -[UIViewAnimationState animationDidStop:finished:] + 108     |
| 24 QuartzCore        | CA::Layer::run_animation_callbacks(void*) + 284              |
| 25 libdispatch.dylib | __dispatch_client_callout + 16                               |
| libdispatch.dylib    | _dispatch_main_queue_callback_4CF + 1844                     |
| CoreFoundation       | ___CFRunLoopRun + 1628                                       |
| 29 CoreFoundation    | CFRunLoopRunSpecific + 384                                   |
| 30 GraphicsServices  | GSEventRunModal + 180                                        |
| 31 UIKit             | UIApplicationMain + 204                                      |
| 32 dnf               | main (main.m:16)                                             |
| 33 libdyld.dylib     | _start + 4                                                   |