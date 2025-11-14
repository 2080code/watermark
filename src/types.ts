export type WaterMarkOptions = {
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

export type SketchOptions = {
    width: number
    height: number
    contWidth: number
    contHeight: number
    txtProp: TextMetrics
    fontStyle: string
}