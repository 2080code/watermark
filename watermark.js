/**
 * 水印
 * @param {Object} options 配置项
 * @param {String} options.name 水印的名称，会影响 cover 模式下水印层元素的 class 命名
 * @param {HTMLElement} options.carrierElem 水印层载体，默认在根元素（body）下
 * @param {Number} options.zIndex 水印层 z-index，默认 1000000
 * @param {String} options.mode mat|cover，放置模式，默认 mat（cover模式下为确保水印覆盖到，请检查载体宽高，mat 模式下水印的打印是非强制的，可能丢失）
 * @param {String} options.content 水印文字内容
 * @param {String} options.fontFamily 字体名
 * @param {String} options.fontWeight 字体粗细
 * @param {String} options.fontSize 字体大小
 * @param {String} options.fontColor 字体颜色
 * @param {String} options.baseline 文本基线设置（svg text alignment-baseline）
 * @param {Number} options.rotateDegree 旋转角度
 * @param {Number} options.margin 水印之间的外间距
 * @param {Number} options.padding 水印之间的内间距
 * @param {Boolean} options.needClip 是否裁切掉空白
 * @param {String} options.position 水印铺设位置（css background-position）
 * @param {String} options.repeat 水印铺设方式（css background-repeat）
 * @param {Number} options.opacity 透明度，同时影响水印及调试层
 * @param {Boolean} options.tuning 调试模式开关，设为 true 会在水印下添加 canvas 画布生成的参照底图，能够观察到 margin、padding、rotateDegree、baseline 等参数的设置效果，方便调试。只支持在 cover 模式下开启。
 * @param {Boolean} options.demotion 降级处理，更好的兼容性。canvas 的 measureText 本身具有对文字更精确的捕获，但因为兼容性问题，低版本浏览器对它的特性支持不完全，只得以 HTML DOM 的 getComputedStyle 取代 canvas measureText 来完成基础绘制和尺寸的捕获。
 * @example
 * // 基本使用
 * const waterMark=new WaterMark({
 *     text:'水印文字',
 * })
 * waterMark.draw()
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.WaterMark = factory());
})(this, (function () { 'use strict';

    return class WaterMark{
        constructor(options){
            this.options={...this.options,...options}
        }
    
        options={
            name:'2080code-watermark',
            carrierElem:document.body,
            mode:'mat',
            zIndex:100000,
            content:'watermark',
            fontWeight:'normal',
            fontSize:'16px',
            fontFamily:'hei',
            fontColor:'rgba(0,0,0,1)',
            baseline:'before-edge',
            rotateDegree:0,
            margin:0,
            padding:0,
            opacity:0.1,
            needClip:true,
            tuning:false,
            demotion:false,
            position:'center center',
            repeat:'repeat',
        }
    
        draw(options){
            const {
                content,
                fontWeight,
                fontSize,
                fontFamily,
                fontColor,
                baseline,
                rotateDegree,
                margin,
                padding,
                opacity,
                needClip,
                tuning,
                demotion,
            }={...this.options,...options}
            const fontStyle=[fontWeight,fontSize,fontFamily].join(' ')
            const self=this
            
            function draft(){
                const canvas = document.createElement('canvas'); // 创建canvas元素
                const ctx=canvas.getContext('2d');
                function setTxtProp(txt){
                    ctx.font=fontStyle;
                    ctx.fillStyle = 'red';
                    ctx.textAlign='start';
                    ctx.textBaseline = 'top';
                    return ctx.measureText(txt);
                }
                function txtDom(txt){
                    // 为兼容老浏览器（如 chrome <= 75）
                    const dom=document.createElement('span')
                    dom.style.display='inline-block';
                    dom.style.fontWeight=fontWeight
                    dom.style.fontSize=fontSize
                    dom.style.fontFamily=fontFamily
                    dom.innerText=txt
                    dom.style.visibility='hidden'
                    document.body.appendChild(dom)
                    const style=window.getComputedStyle(dom)
                    const size=JSON.parse(JSON.stringify({
                        actualBoundingBoxRight:parseFloat(style.width),
                        actualBoundingBoxDescent:parseFloat(style.height),
                        actualBoundingBoxLeft:0,
                        actualBoundingBoxAscent:0
                    }))
                    document.body.removeChild(dom)
                    return size
                }
                let txtProp=null
                if(demotion){
                    txtProp=txtDom(content)
                }else{
                    txtProp=setTxtProp(content)
                }
                // console.log(txtProp)
                // debugger
                const contWidth=txtProp.actualBoundingBoxRight +txtProp.actualBoundingBoxLeft;
                const contHeight=txtProp.actualBoundingBoxDescent +txtProp.actualBoundingBoxAscent;
                const radius=Math.sqrt(Math.pow(contWidth/2,2)+Math.pow(contHeight/2,2)); //圆弧半径（依据文字中心点到最远距离，用勾股定理算出半径）
                const maxRadius=radius+padding; // 带 padding 的半径
                const contOffsetX=maxRadius-contWidth/2;
                const contOffsetY=maxRadius-contHeight/2;
                const txtX=-maxRadius+contOffsetX+txtProp.actualBoundingBoxLeft;
                const txtY=-maxRadius+contOffsetY+txtProp.actualBoundingBoxAscent;
                const originAxis=[
                    [-contWidth/2,-contHeight/2], // 上左
                    [contWidth/2,-contHeight/2], // 上右
                    [contWidth/2,contHeight/2], // 下右
                    [-contWidth/2,contHeight/2] // 下左
                ];
                const radian=rotateDegree*Math.PI/180; // 旋转角度
                const newAxis=originAxis.map(axis=>{
                    // 获取旋转后的四点新坐标
                    return [
                        axis[0]*Math.cos(radian)-axis[1]*Math.sin(radian),
                        axis[0]*Math.sin(radian)+axis[1]*Math.cos(radian)
                    ]
                });
                const clipStartAxis=[
                    Math.min(...newAxis.map(axis=>axis[0]))-padding,
                    Math.min(...newAxis.map(axis=>axis[1]))-padding
                ];
                const clipSize=[
                    Math.max(...newAxis.map(axis=>axis[0]))+padding,
                    Math.max(...newAxis.map(axis=>axis[1]))+padding
                ].map(value=>value*2);
    
                if(tuning){
                    canvas.width = maxRadius*2+margin;
                    canvas.height = maxRadius*2+margin;
    
                    ctx.globalAlpha=opacity;
                    ctx.translate(maxRadius,maxRadius); // 为旋转设置轴心
                    // 旋转
                    ctx.rotate(radian);
    
                    // text
                    // console.log('text',txtX,txtY)
                    setTxtProp(content);
                    ctx.fillText(content,txtX,txtY);
    
                    // 辅助绘制：
                    ctx.fillStyle = 'rgba(0,0,0,0.2)';
                    // 文字背景
                    ctx.beginPath();
                    ctx.strokeRect(-maxRadius+contOffsetX,-maxRadius+contOffsetY,contWidth,contHeight);
                    ctx.closePath();
    
                    // 水平线
                    ctx.setLineDash([5,15])
                    ctx.beginPath();
                    ctx.moveTo(-maxRadius, 0);
                    ctx.lineTo(maxRadius, 0);
                    ctx.closePath();
                    ctx.stroke();
                    
                    ctx.rotate(-radian);
                    ctx.setLineDash([])
                    
                    // 旋转轨道
                    ctx.beginPath();
                    ctx.arc(0, 0, maxRadius-padding, 0, Math.PI*2);
                    ctx.closePath();
                    ctx.stroke();
                    
                    // padding
                    ctx.beginPath();
                    ctx.arc(0, 0, maxRadius, 0, Math.PI*2);
                    ctx.closePath();
                    ctx.stroke();
                    
                    // 矩形区域坐标点
                    newAxis.forEach(axis=>{
                        ctx.fillStyle = 'red';
                        ctx.beginPath();
                        ctx.arc(axis[0], axis[1], 1.5, 0, Math.PI*2);
                        ctx.closePath();
                        ctx.fill();
                    })
    
                    // 标出裁切区域
                    ctx.beginPath();
                    ctx.strokeRect(...clipStartAxis,...clipSize);
                    ctx.closePath();
                }
    
                if(needClip){
                    // clip
                    // console.log('newAxis',newAxis,clipStartAxis,clipSize)
                    let imgCopy=ctx.getImageData(...clipStartAxis,...clipSize.map(value=>value+maxRadius));
                    canvas.width = clipSize[0]+margin;
                    canvas.height = clipSize[1]+margin;
                    ctx.putImageData(imgCopy,...clipStartAxis.map(value=>value-(value+maxRadius)));
                }
    
                if(tuning){
                    self.put(canvas.toDataURL('image/png'),true)
                }
    
                return {
                    content,
                    rotateDegree,
                    margin,
                    width: canvas.width,
                    height: canvas.height,
                    contWidth,
                    contHeight,
                    txtProp,
                    fontStyle,
                    fontColor,
                    baseline,
                    opacity,
                    tuning
                }
            }
            
            this.svgGenerate(draft())
        }

        /**
         * 生成svg水印本体
         * @param {*} params 水印参数
         * @returns String 水印base64 dataURL
         */
        svgGenerate(params){
            let dataURL=''
            let {x,y}={
                x:(params.width-params.margin)/2-params.contWidth/2,
                y:(params.height-params.margin)/2-params.contHeight/2
            }
            const rotateParams=[
                params.rotateDegree,
                x+params.contWidth/2,
                y+params.contHeight/2
            ].join(',')
            const svg=document.createElement('svg')
            const text=document.createElement('text')
    
            // <svg>
            svg.setAttribute('xmlns','http://www.w3.org/2000/svg')
            svg.setAttribute('width',params.width)
            svg.setAttribute('height',params.height)
            svg.setAttribute('version','1.1')
    
            // <text>
            text.innerText=params.content
            text.style=[
                `font:${params.fontStyle}`,
                `fill:${params.fontColor}`,
                'text-anchor:start',
                `alignment-baseline:${params.baseline}`,
            ].join('; ')
            text.setAttribute('x',x+params.txtProp.actualBoundingBoxLeft) // svg 的 text 无法获取具体的文字渲染参数，利用 canvas 的 measureText 来修正对齐基准偏移
            text.setAttribute('y',y+params.txtProp.actualBoundingBoxAscent)
            text.setAttribute('transform',`rotate(${rotateParams})`)
            text.setAttribute('opacity',params.opacity)

            // if(params.tuning){
            //     // <rect>
            //     let rect=document.createElement('rect')
            //     rect.setAttribute('x',x)
            //     rect.setAttribute('y',y)
            //     rect.setAttribute('width',params.contWidth)
            //     rect.setAttribute('height',params.contHeight)
            //     rect.setAttribute('fill','yellow')
            //     rect.setAttribute('stroke','red')
            //     rect.setAttribute('transform',`rotate(${rotateParams})`)
            //     svg.append(rect)
            // }
    
            svg.append(text)
    
            dataURL='data:image/svg+xml;base64,'+window.btoa(window.unescape(encodeURIComponent(svg.outerHTML)))
            // console.log('svgGenerate',svg,params,dataURL)
            this.put(dataURL)
            return dataURL
        }
    
        /**
         * 水印放置
         * @param {String} imgURL 水印内容，base64
         * @param {Boolean} isTuning 是否为调试模式
         */
        put(imgURL,isTuning){
            let elemID=this.options.name+(isTuning?'-tuning':'')
            let existElem=document.getElementById(elemID)
            let elem=null
            let carrierElem=this.options.carrierElem;
            if(this.options.mode==='cover'){
                elem=existElem||document.createElement('div')
                elem.id=elemID
            }else{
                elem=carrierElem||document.body
            };
    
            elem.style=[
                elem.style.cssText,
                '-webkit-print-color-adjust:exact',
                'print-color-adjust:exact',
                'color-adjust:exact',
                `background-image:url(${imgURL})`, // 水印内容
                `background-position:${this.options.position||'center center'}`,
                `background-repeat:${this.options.repeat||'repeat'}`
            ].join('!important;');
            
            if(this.options.mode==='cover'){
                elem.style=[
                    elem.style.cssText,
                    'pointer-events:none',
                    'position:absolute',
                    `z-index:${this.options.zIndex}`,
                    'top:0',
                    'left:0',
                    'width:100%',
                    'height:100%'
                ].join('!important;');
    
                carrierElem.style.position='relative';
                if(!existElem){
                    carrierElem.append(elem);
                }
            }
        }
    }

}));
