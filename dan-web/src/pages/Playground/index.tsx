import React from 'react'
import { Tabs } from 'antd'
import type { TabsProps } from 'antd'
import cx from 'classnames'
import { observer } from 'mobx-react-lite'

import styles from './index.module.css'

import Txt2img from 'components/Txt2img'
import Img2img from 'components/Img2img'
import Interrogate from 'components/Interrogate'
import Inpainting from 'components/Inpainting'

import uiStore from 'stores/uiStore'

const items: TabsProps['items'] = [
  {
    key: '1',
    label: `txt2img`,
    children: <Txt2img />,
  },
  {
    key: '2',
    label: `img2img`,
    children: <Img2img />,
  },
  {
    key: '3',
    label: `interrogate`,
    children: <Interrogate />,
  },
  {
    key: '4',
    label: `inpainting`,
    children: <Inpainting />,
  },
]

const Playground = () => {
  return (
    <div
      className={cx(uiStore.isMobile ? [styles.wrapForMobile] : [styles.wrap])}
    >
      <Tabs
        className={cx(
          uiStore.isMobile ? [styles.tabsForMobile] : [styles.tabs],
        )}
        defaultActiveKey='1'
        items={items}
      />
    </div>
  )
}

export default observer(Playground)
