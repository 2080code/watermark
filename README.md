# @2080code/watermark
![NPM Version](https://img.shields.io/npm/v/%402080code%2Fwatermark?label=NPM%20Version)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/%402080code%2Fwatermark?format=both&label=NPM%20Package%20Size)
![NPM Last Update](https://img.shields.io/npm/last-update/%402080code%2Fwatermark?label=NPM%20Last%20Update)
![NPM Downloads](https://img.shields.io/npm/dw/%402080code%2Fwatermark?label=NPM%20Downloads)


## 介绍
基于 CSS 的 `background` 给HTML元素添加 SVG 文字水印。

## 安装
```bash
npm install @2080code/watermark
```
```javascript
import WaterMark from '@2080code/watermark'
```
或
```html
<script src="watermark.js"></script>
```

## 使用
```javascript
// 创建实例
const Watermarker=new WaterMark({
    mode:'cover',
    content:'西游记',
    fontFamily:'Microsoft YaHei',
    fontSize:'60px',
    fontColor:'black',
    opacity:0.15,
    rotateDegree:-30,
    margin:0,
    padding:40,
    position:'center center',
})
// 绘制水印
Watermarker.draw({
    tuning:false,
    degraded:true,
})
```

## 参数说明
```javascript
new WaterMark(options)
```

参数|类型|默认值|说明
---|---|---|---
`name` | String | `'2080code-watermark'` | 水印的名称，会影响 cover 模式下水印层元素的 class 命名
`carrierElem` | HTMLElement | `document.body`| 水印层载体。<br/>*需是可添加子元素的元素*
`zIndex` | Number | `1000000` | 水印层（css z-index）
`mode` | String （`'mat'\|'cover'`）| `'mat'` | 水印放置模式，默认 `mat`，铺设在目标层底部；<br/>`cover` 模式会创建一个层，并覆盖在载体上。<br/>*cover 模式下为确保水印覆盖到，请检查载体宽高，mat 模式下水印的打印是非强制的，可能丢失*
`content` | String | `''` | 水印文字内容
`url` | String | `''` | 水印资源，与 content 互斥
`fontFamily` | String | `'Hei'` | 字体名
`fontWeight` | String | `'normal'` | 字体粗细
`fontSize` | String | `'16px'` | 字体大小
`fontColor` | String | `'black'` | 字体颜色
`baseline` | String | `'before-edge'` | 文本基线设置（svg text alignment-baseline）
`rotateDegree` | Number | `0` | 旋转角度
`size` | String | `'auto'` | 水印尺寸（css background-size）
`margin` | Number | `0` | 水印之间的外间距
`padding` | Number | `0` | 水印之间的内间距
`needClip` | Boolean | `true` | 是否裁切掉水印内容之外的空白（`margin`、`padding` 除外），在设置 `rotateDegree` 时有效
`position` | String | `'center center'` | 水印铺设位置（css background-position）
`repeat` | String | `'repeat'` | 水印铺设方式（css background-repeat）
`opacity` | Number | `0.1` | 透明度，同时影响水印及调试层
`tuning` | Boolean | `false` | 调试模式开关，设为 `true` 会在水印下添加 canvas 画布生成的参照底图，能够观察到 `margin`、`padding`、`rotateDegree`、`baseline` 等参数的辅线，方便调试。<br/>*目前只支持在 cover 模式下开启*
`degraded` | Boolean | `false` | 降级处理，更好的兼容性，默认 `false`。<br/>*canvas 的 `measureText` 本身具有对文字更精确的捕获，但因为兼容性问题，低版本浏览器对它的特性支持不完全，只得以 HTML DOM 的 `getComputedStyle` 取代 canvas `measureText` 来完成基础绘制和尺寸的捕获。*


## 效果
### 生产效果
![水印效果](./demo/preview.png)
### 调试效果
![调试](./demo/1.png)
