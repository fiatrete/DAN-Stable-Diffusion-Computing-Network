import React, { useEffect } from 'react'
import cx from 'classnames'

const OAuthSuccess = () => {
  useEffect(() => {
    setTimeout(() => {
      window.close()
    }, 1000)
  }, [])

  return (
    <div className={cx('flex justify-center mt-48 text-xl text-gray-600')}>
      授权成功
    </div>
  )
}

export default OAuthSuccess
