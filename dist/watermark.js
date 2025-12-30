/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */

function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var _WaterMark_instances, _WaterMark_getFinalOptions;
function draft(options) {
    const { content, fontWeight, fontSize, fontFamily, rotateDegree, margin, padding, opacity, needClip, tuning, degraded, } = options;
    const fontStyle = [fontWeight, fontSize, fontFamily].join(' ');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    function setTxtProp(txt) {
        ctx.font = fontStyle;
        ctx.fillStyle = 'red';
        ctx.textAlign = 'start';
        ctx.textBaseline = 'top';
        return ctx.measureText(txt);
    }
    function txtDom(txt) {
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
    const contWidth = txtProp.actualBoundingBoxRight + txtProp.actualBoundingBoxLeft;
    const contHeight = txtProp.actualBoundingBoxDescent + txtProp.actualBoundingBoxAscent;
    const radius = Math.sqrt(Math.pow(contWidth / 2, 2) + Math.pow(contHeight / 2, 2));
    const maxRadius = radius + padding;
    const contOffsetX = maxRadius - contWidth / 2;
    const contOffsetY = maxRadius - contHeight / 2;
    const txtX = -maxRadius + contOffsetX + txtProp.actualBoundingBoxLeft;
    const txtY = -maxRadius + contOffsetY + txtProp.actualBoundingBoxAscent;
    const originAxis = [
        [-contWidth / 2, -contHeight / 2],
        [contWidth / 2, -contHeight / 2],
        [contWidth / 2, contHeight / 2],
        [-contWidth / 2, contHeight / 2]
    ];
    const radian = (rotateDegree !== null && rotateDegree !== void 0 ? rotateDegree : 0) * Math.PI / 180;
    const newAxis = originAxis.map(axis => {
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
    ]).map((value) => value * 2);
    if (tuning) {
        (function tuningLayer() {
            canvas.width = maxRadius * 2 + margin;
            canvas.height = maxRadius * 2 + margin;
            ctx.globalAlpha = opacity;
            ctx.translate(maxRadius, maxRadius);
            ctx.rotate(radian);
            setTxtProp(content);
            ctx.fillText(content, txtX, txtY);
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.strokeRect(-maxRadius + contOffsetX, -maxRadius + contOffsetY, contWidth, contHeight);
            ctx.closePath();
            ctx.setLineDash([5, 15]);
            ctx.beginPath();
            ctx.moveTo(-maxRadius, 0);
            ctx.lineTo(maxRadius, 0);
            ctx.closePath();
            ctx.stroke();
            ctx.rotate(-radian);
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(0, 0, maxRadius - padding, 0, Math.PI * 2);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, maxRadius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.stroke();
            newAxis.forEach(axis => {
                ctx.fillStyle = 'red';
                ctx.beginPath();
                ctx.arc(axis[0], axis[1], 0, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            });
            ctx.setLineDash([8, 4]);
            ctx.beginPath();
            ctx.strokeRect(...clipStartAxis, ...clipSize);
            ctx.closePath();
            ctx.setLineDash([]);
        })();
    }
    if (needClip) {
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
function svgDataURLGenerate(sketch, options) {
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
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', `${sketch.width}`);
    svg.setAttribute('height', `${sketch.height}`);
    svg.setAttribute('viewBox', `0 0 ${sketch.width} ${sketch.height}`);
    svg.setAttribute('version', '1.1');
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
    let base64 = null;
    if (typeof TextEncoder === 'undefined') {
        const svgEncodeString = encodeURIComponent(svg.outerHTML).replace(/%([0-9A-F]{2})/g, function (match, p1) {
            return String.fromCharCode(+('0x' + p1));
        });
        base64 = window.btoa(svgEncodeString);
    }
    else {
        const encoder = new TextEncoder();
        const svgutf8 = encoder.encode(svg.outerHTML);
        base64 = window.btoa(String.fromCharCode(...svgutf8));
    }
    dataURL = `data:image/svg+xml;base64,${base64}`;
    return dataURL;
}
function put(imgURL, options) {
    var _a;
    let elem = null;
    let carrierElem = options.carrierElem;
    if (options.mode === 'cover') {
        elem = document.createElement('div');
        elem.className = (_a = options.name) !== null && _a !== void 0 ? _a : '';
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
        elem = carrierElem || document.body;
    }
    elem.style = [
        elem.style.cssText,
        '-webkit-print-color-adjust:exact',
        'print-color-adjust:exact',
        'color-adjust:exact',
        `background-image:url(${imgURL})`,
        `background-position:${options.position}`,
        `background-repeat:${options.repeat}`,
        `background-size:${options.size}`
    ].join('!important;');
    if (options.mode === 'cover') {
        carrierElem.style.position = 'relative';
        carrierElem.append(elem);
    }
}
class WaterMark {
    constructor(options) {
        _WaterMark_instances.add(this);
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
    getDataURL(options) {
        const finalOptions = __classPrivateFieldGet(this, _WaterMark_instances, "m", _WaterMark_getFinalOptions).call(this, options);
        if (finalOptions.content) {
            const sketch = draft(finalOptions);
            return svgDataURLGenerate(sketch, finalOptions);
        }
        else {
            throw new Error('options.content is required');
        }
    }
    draw(options) {
        const finalOptions = __classPrivateFieldGet(this, _WaterMark_instances, "m", _WaterMark_getFinalOptions).call(this, options);
        if (finalOptions.content) {
            const sketch = draft(finalOptions);
            const svgDataURL = svgDataURLGenerate(sketch, finalOptions);
            put(svgDataURL, finalOptions);
        }
        else if (finalOptions.url) {
            put(finalOptions.url, finalOptions);
        }
        else {
            throw new Error('options.url or options.content is required');
        }
    }
}
_WaterMark_instances = new WeakSet(), _WaterMark_getFinalOptions = function _WaterMark_getFinalOptions(options) {
    return Object.assign(Object.assign({}, this.options), options);
};

export { WaterMark as default };
