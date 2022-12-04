import { CSSProperties } from 'react'

export interface MUComponent {
  className?: string | string[] | { [key: string]: boolean }

  customStyle?: string | CSSProperties
}

export interface MUIconBaseProps2 extends MUComponent {
  value: string

  color?: string
}

export interface MUIconBaseProps extends MUComponent {
  value: string

  color?: string

  prefixClass?: string

  size?: number | string
}

export default MUComponent
