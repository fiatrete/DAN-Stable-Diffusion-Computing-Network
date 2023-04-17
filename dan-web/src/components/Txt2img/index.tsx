import React, { useCallback, useState } from 'react'
import cx from 'classnames'
import { Form, Select, Button, Input, Typography, message, Spin } from 'antd'
import {
  ModelFormGroup,
  LoraFormGroup,
  SamplingFormGroup,
  CFGFormGroup,
} from 'components/SettingsFormGroup'
import ImageWidget from 'components/ImageOutputWidget'
import { FormFinishInfo } from 'rc-field-form/es/FormContext'

import styles from './index.module.css'
import { observer } from 'mobx-react-lite'
import uiStore from 'stores/uiStore'
import to from 'await-to-js'
import { AxiosError } from 'axios'
import {
  TaskResponseData,
  Txt2imgParams,
  getTaskStatus,
  txt2imgAsync,
} from 'api/playground'
import { Task } from 'typings/Task'
import { LoadingOutlined } from '@ant-design/icons'

const { Title } = Typography
const { TextArea } = Input

const sizes = [
  { value: '512x512', label: '512x512' },
  { value: '512x768', label: '512x768' },
  { value: '768x512', label: '768x512' },
  { value: '768x1024', label: '768x1024' },
  { value: '1024x768', label: '1024x768' },
]

const Txt2img = () => {
  const [form] = Form.useForm()

  const [imgUri, setImgUri] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [loadingTitle, setLoadingTitle] = useState<string | undefined>(
    undefined,
  )

  const setLoading = (
    isShow: boolean,
    title: string | undefined = undefined,
  ) => {
    setIsLoading(isShow)
    setLoadingTitle(title)
  }

  const getTaskResult = useCallback((task: Task) => {
    const timerId = setInterval(async () => {
      const [_error, _resp] = await to<TaskResponseData, AxiosError>(
        getTaskStatus(task.taskId),
      )

      if (_error !== null) {
        message.error(_error.message)
        console.error('getTaskStatus Error', _error)
        setLoading(false)
        return
      }

      setLoading(
        true,
        `Status: ${_resp.status} QueuePosition: ${_resp.queuePosition}`,
      )

      if (_resp.status !== 0 && _resp.status !== 1) {
        clearInterval(timerId)
        setLoading(false)

        if (_resp.status === 2) {
          setImgUri(`data:image/png;base64,${_resp.images[0]}`)
        } else if (_resp.status === 3) {
          message.error(`Failed: [${_resp.status}]`)
        }
      }
    }, 1000)
  }, [])

  const onFormSubmit = useCallback(
    async (name: string, { values }: FormFinishInfo) => {
      try {
        setLoading(true)

        const [widthStr, heightStr] = values.size.split('x')
        delete values.size
        const apiParams: Txt2imgParams = Object.assign(values)
        apiParams.width = parseInt(widthStr)
        apiParams.height = parseInt(heightStr)
        apiParams.cfg_scale = parseFloat(values.cfg_scale)

        const [_error, _task] = await to<Task, AxiosError>(
          txt2imgAsync(apiParams),
        )

        if (_error !== null) {
          message.error(_error.message)
          console.error('txt2img Async Error', _error)
          return
        }

        getTaskResult(_task)
      } catch (err) {
        if (err instanceof String) message.error(err)
        if (err instanceof Error) message.error(err.message)

        setLoading(false)
      }
    },
    [getTaskResult],
  )

  return (
    /* when Form submitted, the parent Form.Provider received the submittion via onFormFinish */
    <Form.Provider onFormFinish={onFormSubmit}>
      <Form name='txt2imgForm' form={form} layout='vertical'>
        {/* <GeneratingMask open={isShowMask} title={maskTitle} /> */}
        <div
          className={cx(
            uiStore.isMobile
              ? [styles.wrap, 'w-full flex flex-col gap-12']
              : [styles.wrap, 'w-full flex flex-row gap-24 mt-8'],
          )}
        >
          <div
            className={cx(
              uiStore.isMobile
                ? ['w-full flex flex-col']
                : ['w-full flex flex-col flex-1 gap-8'],
            )}
          >
            <div className={cx('flex flex-col items-start gap-6')}>
              <Title level={5}>Input keyword and generate</Title>
              <div className={cx('flex flex-col w-full items-start gap-6')}>
                <Form.Item name='prompt' className={cx('self-stretch mb-0')}>
                  <TextArea
                    size='large'
                    rows={6}
                    placeholder='Enter prompts here'
                    className={cx('text-base leading-6 px-4 py-2')}
                  />
                </Form.Item>
              </div>
              <Button type='primary' htmlType='submit' size='large'>
                Generate
              </Button>
            </div>
            <div
              className={cx(
                uiStore.isMobile
                  ? ['w-full mt-4']
                  : ['h-[388px] w-full flex justify-center'],
              )}
            >
              <div
                className={cx(
                  uiStore.isMobile ? ['w-full h-full'] : ['w-[500px] flex'],
                )}
              >
                <ImageWidget src={imgUri} />
              </div>
            </div>
          </div>
          <div className={cx('flex flex-col w-80 gap-6')}>
            <Title level={5}>Settings</Title>
            <div className={cx('gap-0')}>
              <ModelFormGroup label='Model' name='model' />
              <Form.Item label='Size' name='size' initialValue={sizes[0].value}>
                <Select size='large' options={sizes} />
              </Form.Item>
              <LoraFormGroup
                label='LoRA1'
                loraName='lora1'
                weightName='weight1'
              />
              <LoraFormGroup
                label='LoRA2'
                loraName='lora2'
                weightName='weight2'
              />
              <Form.Item label='Negative Prompts' name='negative_prompt'>
                <TextArea
                  size='large'
                  rows={4}
                  placeholder='Negative Prompts'
                  className={cx('self-stretch text-base leading-6 px-4 py-2')}
                />
              </Form.Item>
              <SamplingFormGroup
                methodName='sampler_name'
                stepsName='steps'
                seedName='seed'
              />
              <CFGFormGroup scaleName='cfg_scale' />
            </div>
          </div>
        </div>
      </Form>

      {isLoading ? (
        <div className={cx('absolute top-0 left-0 w-full h-full bg-white/80')}>
          <div
            className={cx(
              'flex flex-col justify-center items-center gap-4 mt-48',
            )}
          >
            <Spin
              indicator={
                <LoadingOutlined style={{ fontSize: 36, color: '#666' }} spin />
              }
            />
            <div className={cx('text-[#333]')}>
              {loadingTitle ?? 'Generating...'}
            </div>
          </div>
        </div>
      ) : null}
    </Form.Provider>
  )
}

export default observer(Txt2img)
