declare namespace WaterMarkTypes{
    interface WaterMarkOptions {
        name?: string
        carrierElem: HTMLElement
        zIndex?: number
        mode: 'cover' | 'mat'
        content?: string
        url?: string
        fontFamily: string
        fontWeight: string
        fontSize: string
        fontColor: string
        baseline: string
        rotateDegree?: number
        size?: string
        margin: number
        padding: number
        needClip?: boolean
        position?: string
        repeat?: string
        opacity: number
        tuning: boolean
        degraded?: boolean
    }

    interface SketchOptions {
        readonly width: number
        readonly height: number
        readonly contWidth: number
        readonly contHeight: number
        readonly txtProp: TextMetrics
        readonly fontStyle: string
    }
}

declare interface WaterMarkClass {
    options: WaterMarkTypes.WaterMarkOptions
    getDataURL(options:WaterMarkTypes.WaterMarkOptions):string
    draw(options:WaterMarkTypes.WaterMarkOptions):void
}

declare interface WaterMarkConstructor {
    new(options: WaterMarkTypes.WaterMarkOptions): WaterMarkClass
}