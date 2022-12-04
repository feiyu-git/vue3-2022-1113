import { MouseEvent, ComponentClass } from 'react'
import { CommonEventFunction } from '@tarojs/components/types/common'

import MUComponent from './base'

export interface MUDemoProps extends MUComponent {
  /**
   * 是否开启
   * @default false
   */
  isOpened?: boolean
  /**
   * 点击按钮触发事件
   */
  onClick?: CommonEventFunction
}

export interface MUDemoState {
  isWEB?: boolean
  isWEAPP?: boolean
  isALIPAY?: boolean
  isShow?: boolean
}

declare const MUDemoComponent: ComponentClass<MUDemoProps>

export default MUDemoComponent
