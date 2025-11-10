# @2080code/watermark
## 介绍
给页面或HTML元素添加 SVG 文字水印。

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
    // carrierElem:document.getElementById('article'),
    content:'西游记',
    fontFamily:'Microsoft YaHei',
    fontSize:'60px',
    fontColor:'black',
    opacity:0.15,
    rotateDegree:-30,
    margin:0,
    padding:40, // 每个水印自身的内边距
    // needClip:false, // 是否裁切掉空白，默认true
    position:'center center', // 水印位置（css background-position）
    // repeat:'no-repeat', // 水印铺设方式（css background-repeat）
    // tuning:true // 调试模式
})
// 绘制水印
Watermarker.draw({
    tuning:false, // 调试模式
    demotion:true, // 降级模式
})
```

## 效果
![水印效果](./demo/preview.png)

## 参数说明
```javascript
new WaterMark(options)
```

### `options.name` String
水印的名称，会影响 cover 模式下水印层元素的 class 命名，默认 `'cw-watermark'`。

### `options.carrierElem` HTMLElement
水印层载体，默认 `document.body`。

### `options.zIndex` Number
水印层 z-index，默认 `1000000`。

### `options.mode` String 'mat' | 'cover'
水印放置模式，默认 `mat`，铺设在目标层底部；
`cover` 模式会创建一个层，并覆盖在载体上。
*cover模式下为确保水印覆盖到，请检查载体宽高，mat 模式下水印的打印是非强制的，可能丢失*

### `options.content` String
水印文字内容。

### `options.fontFamily` String
字体名，默认 `'hei'`。
### `options.fontWeight` String
字体粗细，默认 `'normal'`。
### `options.fontSize` String
字体大小，默认 `'16px'`。
### `options.fontColor` String
字体颜色，默认 `'black'`。

### `options.baseline` String
文本基线设置（svg text alignment-baseline），默认 `'before-edge'`。

### `options.rotateDegree` Number
旋转角度，默认`0`。
### `options.margin` Number
水印之间的外间距，默认 `0`。
### `options.padding` Number
水印之间的内间距，默认 `0`。
### `options.needClip` Boolean
是否裁切掉空白（margin、padding之外的空白），默认 `true`。

### `options.position` String
水印铺设位置（css background-position），默认 `'center center'`。
### `options.repeat` String
水印铺设方式（css background-repeat），默认 `'repeat'`。

### `options.opacity` Number
透明度，同时影响水印及调试层，默认 `0.1`。

### `options.tuning` Boolean
调试模式开关，设为 `true` 会在水印下添加 canvas 画布生成的参照底图，能够观察到 `margin`、`padding`、`rotateDegree`、`baseline` 等参数的设置效果，方便调试。效果如下：
![调试](./demo/1.png)
*目前只支持在 cover 模式下开启*

### `options.demotion` Boolean
降级处理，更好的兼容性，默认 `false`。
canvas 的 `measureText` 本身具有对文字更精确的捕获，但因为兼容性问题，低版本浏览器对它的特性支持不完全，只得以 HTML DOM 的 `getComputedStyle` 取代 canvas `measureText` 来完成基础绘制和尺寸的捕获。
