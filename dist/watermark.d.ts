import { WaterMarkOptions, SketchOptions } from './types';
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
declare class WaterMark {
    constructor(options: WaterMarkOptions);
    options: {
        name: string;
        mode: string;
        carrierElem: HTMLElement;
        zIndex: number;
        content: string;
        url: string;
        fontWeight: string;
        fontSize: string;
        fontFamily: string;
        fontColor: string;
        baseline: string;
        rotateDegree: number;
        size: string;
        margin: number;
        padding: number;
        position: string;
        repeat: string;
        opacity: number;
        needClip: boolean;
        degraded: boolean;
        tuning: boolean;
    };
    /**
     * 绘制水印
     * @param {WaterMarkOptions} options 配置项，覆盖实例
     */
    draw(options: WaterMarkOptions): void;
    /**
     * 生成水印草图，svg会据此生成水印
     * @param {WaterMarkOptions} options 配置项
     * @returns {SketchOptions} sketch 信息
     */
    draft(options: WaterMarkOptions): SketchOptions;
    /**
     * 生成svg水印本体
     * @param {SketchOptions} sketch 水印草图参数
     * @returns String 水印base64 dataURL
     */
    svgGenerate(sketch: SketchOptions): string;
    /**
     * 水印放置
     * @param {String} imgURL 水印内容，base64
     * @param {WaterMarkOptions} options 是否为调试模式
     */
    put(imgURL: string, options: WaterMarkOptions): void;
}
export default WaterMark;
