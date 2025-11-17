/**
 * 水印
 * 支持草图调试的水印生成工具
 * @param {Object} options 配置项
 * @param {String} options.name 水印的名称，会影响 cover 模式下水印层元素的 class 命名
 * @param {HTMLElement} options.carrierElem 水印层载体，默认在根元素（body）下
 * @param {Number} options.zIndex 水印层 z-index，默认 1000000
 * @param {String} options.mode mat|cover，放置模式，默认 mat（cover模式下为确保水印覆盖到，请检查载体宽高，mat 模式下水印的打印是非强制的，可能丢失）
 * @param {String} options.content 水印文字内容
 * @param {String} options.url 水印资源，与 content 互斥
 * @param {String} options.fontFamily 字体名
 * @param {String} options.fontWeight 字体粗细
 * @param {String} options.fontSize 字体大小
 * @param {String} options.fontColor 字体颜色
 * @param {String} options.baseline 文本基线设置（svg text alignment-baseline）
 * @param {Number} options.rotateDegree 旋转角度
 * @param {String} options.size 水印尺寸（css background-size）
 * @param {Number} options.margin 水印之间的外间距
 * @param {Number} options.padding 水印之间的内间距
 * @param {Boolean} options.needClip 是否裁切掉空白
 * @param {String} options.position 水印铺设位置（css background-position）
 * @param {String} options.repeat 水印铺设方式（css background-repeat）
 * @param {Number} options.opacity 透明度，同时影响水印及调试层
 * @param {Boolean} options.tuning 调试模式开关，设为 true 会在水印下添加 canvas 画布生成的参照底图，能够观察到 margin、padding、rotateDegree、baseline 等参数的设置效果，方便调试。只支持在 cover 模式下开启。
 * @param {Boolean} options.degraded 降级处理，更好的兼容性。canvas 的 measureText 本身具有对文字更精确的捕获，但因为兼容性问题，低版本浏览器对它的特性支持不完全，只得以 HTML DOM 的 getComputedStyle 取代 canvas measureText 来完成基础绘制和尺寸的捕获。
 * @example
 * // 基本使用
 * const waterMark=new WaterMark({
 *     text:'水印文字',
 * })
 * waterMark.draw()
 */
/**
 * 生成水印草图，svg会据此生成水印
 * @param {WaterMarkOptions} options 配置项
 * @returns {SketchOptions} sketch 信息
 */
function draft(options) {
    const { content, fontWeight, fontSize, fontFamily, rotateDegree, margin, padding, opacity, needClip, tuning, degraded, } = options;
    const fontStyle = [fontWeight, fontSize, fontFamily].join(' ');
    const canvas = document.createElement('canvas'); // 创建canvas元素
    const ctx = canvas.getContext('2d');
    function setTxtProp(txt) {
        ctx.font = fontStyle;
        ctx.fillStyle = 'red';
        ctx.textAlign = 'start';
        ctx.textBaseline = 'top';
        return ctx.measureText(txt);
    }
    function txtDom(txt) {
        // 为兼容老浏览器（如 chrome <= 75）
        const dom = document.createElement('span');
        dom.style.display = 'block';
        dom.style.position = 'absolute';
        dom.style.lineHeight = '1';
        dom.style.fontWeight = fontWeight;
        dom.style.fontSize = fontSize;
        dom.style.fontFamily = fontFamily;
        dom.innerText = txt;
        dom.style.visibility = 'hidden';
        document.body.appendChild(dom);
        const style = window.getComputedStyle(dom);
        const size = JSON.parse(JSON.stringify({
            actualBoundingBoxAscent: 0,
            actualBoundingBoxLeft: 0,
            actualBoundingBoxDescent: parseFloat(style.height),
            actualBoundingBoxRight: parseFloat(style.width),
        }));
        document.body.removeChild(dom);
        return size;
    }
    let txtProp = null;
    if (degraded) {
        txtProp = txtDom(content);
    }
    else {
        txtProp = setTxtProp(content);
    }
    // console.log(txtProp)
    // debugger
    const contWidth = txtProp.actualBoundingBoxRight + txtProp.actualBoundingBoxLeft;
    const contHeight = txtProp.actualBoundingBoxDescent + txtProp.actualBoundingBoxAscent;
    const radius = Math.sqrt(Math.pow(contWidth / 2, 2) + Math.pow(contHeight / 2, 2)); //圆弧半径（依据文字中心点到最远距离，用勾股定理算出半径）
    const maxRadius = radius + padding; // 带 padding 的半径
    const contOffsetX = maxRadius - contWidth / 2;
    const contOffsetY = maxRadius - contHeight / 2;
    const txtX = -maxRadius + contOffsetX + txtProp.actualBoundingBoxLeft;
    const txtY = -maxRadius + contOffsetY + txtProp.actualBoundingBoxAscent;
    const originAxis = [
        [-contWidth / 2, -contHeight / 2], // 上左
        [contWidth / 2, -contHeight / 2], // 上右
        [contWidth / 2, contHeight / 2], // 下右
        [-contWidth / 2, contHeight / 2] // 下左
    ];
    const radian = (rotateDegree !== null && rotateDegree !== void 0 ? rotateDegree : 0) * Math.PI / 180; // 旋转角度
    const newAxis = originAxis.map(axis => {
        // 获取旋转后的四点新坐标
        return [
            axis[0] * Math.cos(radian) - axis[1] * Math.sin(radian),
            axis[0] * Math.sin(radian) + axis[1] * Math.cos(radian)
        ];
    });
    const clipStartAxis = [
        Math.min(...newAxis.map(axis => axis[0])) - padding,
        Math.min(...newAxis.map(axis => axis[1])) - padding
    ];
    const clipSize = ([
        Math.max(...newAxis.map(axis => axis[0])) + padding,
        Math.max(...newAxis.map(axis => axis[1])) + padding
    ]).map(value => value * 2);
    if (tuning) {
        // 绘制调试层
        (function tuningLayer() {
            canvas.width = maxRadius * 2 + margin;
            canvas.height = maxRadius * 2 + margin;
            ctx.globalAlpha = opacity;
            ctx.translate(maxRadius, maxRadius); // 为旋转设置轴心
            // 旋转
            ctx.rotate(radian);
            // text
            // console.log('text',txtX,txtY)
            setTxtProp(content);
            ctx.fillText(content, txtX, txtY);
            // 辅助绘制：
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            // 文字背景
            ctx.beginPath();
            ctx.strokeRect(-maxRadius + contOffsetX, -maxRadius + contOffsetY, contWidth, contHeight);
            ctx.closePath();
            // 水平线
            ctx.setLineDash([5, 15]);
            ctx.beginPath();
            ctx.moveTo(-maxRadius, 0);
            ctx.lineTo(maxRadius, 0);
            ctx.closePath();
            ctx.stroke();
            ctx.rotate(-radian);
            ctx.setLineDash([]);
            // 旋转轨道
            ctx.beginPath();
            ctx.arc(0, 0, maxRadius - padding, 0, Math.PI * 2);
            ctx.closePath();
            ctx.stroke();
            // padding
            ctx.beginPath();
            ctx.arc(0, 0, maxRadius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.stroke();
            // 矩形区域坐标点
            newAxis.forEach(axis => {
                ctx.fillStyle = 'red';
                ctx.beginPath();
                ctx.arc(axis[0], axis[1], 0, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            });
            // 标出裁切区域
            ctx.beginPath();
            ctx.strokeRect(...clipStartAxis, ...clipSize);
            ctx.closePath();
        })();
    }
    if (needClip) {
        // clip
        // console.log('newAxis',newAxis,clipStartAxis,clipSize)
        const imgCopy = ctx.getImageData(...clipStartAxis, ...clipSize.map(value => value + maxRadius));
        canvas.width = clipSize[0] + margin;
        canvas.height = clipSize[1] + margin;
        ctx.putImageData(imgCopy, ...clipStartAxis.map(value => value - (value + maxRadius)));
    }
    if (tuning) {
        put(canvas.toDataURL('image/png'), Object.assign(Object.assign({}, options), { name: [options.name, 'tuning'].join('-') }));
    }
    return {
        width: canvas.width,
        height: canvas.height,
        contWidth,
        contHeight,
        txtProp,
        fontStyle
    };
}
/**
 * 生成svg水印本体
 * @param {SketchOptions} sketch 水印草图参数
 * @returns String 水印base64 dataURL
 */
function svgGenerate(sketch, options) {
    let dataURL = '';
    let { x, y } = {
        x: (sketch.width - options.margin) / 2 - sketch.contWidth / 2,
        y: (sketch.height - options.margin) / 2 - sketch.contHeight / 2
    };
    const rotateParams = [
        options.rotateDegree,
        x + sketch.contWidth / 2,
        y + sketch.contHeight / 2
    ].join(',');
    const svg = document.createElement('svg');
    const text = document.createElement('text');
    // <svg>
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', `${sketch.width}`);
    svg.setAttribute('height', `${sketch.height}`);
    svg.setAttribute('viewBox', `0 0 ${sketch.width} ${sketch.height}`);
    svg.setAttribute('version', '1.1');
    // <text>
    text.innerText = options.content;
    text.style = [
        `display: block`,
        `pointer-events: none`,
        `font:${sketch.fontStyle}`,
        `fill:${options.fontColor}`,
        'block-size: min-content',
        'text-anchor: start',
        'text-align: center',
        'transform-origin: top left',
        `dominant-baseline:${options.baseline}`,
        `alignment-baseline:${options.baseline}`,
    ].join('; ');
    text.setAttribute('x', `${x + sketch.txtProp.actualBoundingBoxLeft}`);
    text.setAttribute('y', `${y + sketch.txtProp.actualBoundingBoxAscent}`);
    text.setAttribute('transform', `rotate(${rotateParams})`);
    text.setAttribute('opacity', `${options.opacity}`);
    if (options.tuning) {
        const boxRect = document.createElement('rect');
        boxRect.setAttribute('x', '0');
        boxRect.setAttribute('y', '0');
        boxRect.setAttribute('fill', 'rgba(0,255,0, 0.08)');
        boxRect.setAttribute('width', `${sketch.width - options.margin}`);
        boxRect.setAttribute('height', `${sketch.height - options.margin}`);
        svg.append(boxRect);
        text.style.outline = '1px dotted rgba(0, 0, 255, 0.25)';
        const contRect = document.createElement('rect');
        contRect.setAttribute('x', `${x}`);
        contRect.setAttribute('y', `${y}`);
        contRect.setAttribute('width', `${sketch.contWidth}`);
        contRect.setAttribute('height', `${sketch.contHeight}`);
        contRect.setAttribute('fill', 'rgba(255,255,0, 0.2)');
        contRect.setAttribute('stroke', 'rgba(255,0,0, 0.25)');
        contRect.setAttribute('transform', `rotate(${rotateParams})`);
        svg.append(contRect);
        const centralCircle = document.createElement('circle');
        centralCircle.setAttribute('cx', `${x + sketch.contWidth / 2}`);
        centralCircle.setAttribute('cy', `${y + sketch.contHeight / 2}`);
        centralCircle.setAttribute('r', '2.5');
        centralCircle.setAttribute('fill', 'rgba(0,0,0, .5)');
        svg.append(centralCircle);
    }
    svg.append(text);
    const svgEncodeString = encodeURIComponent(svg.outerHTML).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode(+('0x' + p1));
    });
    const base64 = window.btoa(svgEncodeString);
    dataURL = `data:image/svg+xml;base64,${base64}`;
    // console.log('svgGenerate',sketch,svg,svgEncodeString,dataURL)
    return dataURL;
}
/**
 * 水印放置
 * @param {String} imgURL 水印内容，base64
 * @param {WaterMarkOptions} options 是否为调试模式
 */
function put(imgURL, options) {
    var _a;
    let elemID = (_a = options.name) !== null && _a !== void 0 ? _a : '';
    let existElem = document.getElementById(elemID);
    let elem = null;
    let carrierElem = options.carrierElem;
    // console.warn('put',existElem)
    // 明确水印载体元素
    if (options.mode === 'cover') {
        // 如果是cover模式，会新建一个层，用来装载水印
        elem = existElem !== null && existElem !== void 0 ? existElem : document.createElement('div');
        elem.id = elemID;
        // 并以相对位置设置水印层覆盖在目标上的基础样式
        elem.style = [
            elem.style.cssText,
            'pointer-events:none',
            'position:absolute',
            'top:0',
            'left:0',
            `z-index:${options.zIndex}`,
            'width:100%',
            'height:100%'
        ].join('!important;');
    }
    else {
        // 如果是mat，水印是直接装载到目标的background上的
        elem = carrierElem || document.body;
    }
    // 水印载体内容
    elem.style = [
        elem.style.cssText,
        '-webkit-print-color-adjust:exact',
        'print-color-adjust:exact',
        'color-adjust:exact',
        `background-image:url(${imgURL})`, // 水印内容
        `background-position:${options.position}`,
        `background-repeat:${options.repeat}`,
        `background-size:${options.size}`
    ].join('!important;');
    // cover模式下将水印层置入目标元素中
    if (options.mode === 'cover') {
        carrierElem.style.position = 'relative';
        if (!existElem) {
            carrierElem.append(elem);
        }
    }
}
class WaterMark {
    constructor(options) {
        this.options = {
            name: '2080code-watermark',
            mode: 'mat',
            carrierElem: document.body,
            zIndex: 100000,
            content: 'watermark',
            url: '',
            fontWeight: 'normal',
            fontSize: '16px',
            fontFamily: 'Hei',
            fontColor: 'rgba(0,0,0,1)',
            baseline: 'hanging',
            rotateDegree: 0,
            size: 'auto',
            margin: 0,
            padding: 0,
            position: 'center center',
            repeat: 'repeat',
            opacity: 0.1,
            needClip: true,
            degraded: false,
            tuning: false,
        };
        this.options = Object.assign(Object.assign({}, this.options), options);
    }
    /**
     * 绘制水印
     * @param {WaterMarkOptions} options 配置项，覆盖实例
     */
    draw(options) {
        const finalOptions = Object.assign(Object.assign({}, this.options), options);
        if (finalOptions.url) {
            put(finalOptions.url, finalOptions);
        }
        else if (finalOptions.content) {
            const sketch = draft(finalOptions);
            const svg = svgGenerate(sketch, finalOptions);
            put(svg, finalOptions);
        }
        else {
            throw new Error('options.url or options.content is required');
        }
    }
}

export { WaterMark as default };
