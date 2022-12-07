import * as React from 'react';
import { AiOutlinePlus } from 'react-icons/ai';

import clsxm from '@/lib/clsxm';

import Button from '@/components/buttons/Button';
import BasicDialog from '@/components/dialog/BasicDialog';
import Message from '@/components/message';

import { addFavorites, editFavorites } from '@/services/repository';

export type EditCollectionFormData = {
  fid?: string;
  name: string;
  description: string;
  status: number;
};
type EditCollectionProps = {
  type: 'add' | 'edit';
  title: string;
  visible: boolean;
  initValue?: EditCollectionFormData;
  onFinish?: () => void;
  onClose: () => void;
};
export const EditCollectionMoal = (props: EditCollectionProps) => {
  const { visible, title = '新建收藏夹' } = props;
  const initFormData = React.useMemo(
    () => ({
      name: '',
      description: '',
      status: 2,
    }),
    []
  );
  const [disabled, setDisabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({ ...initFormData });

  const onFormChange = (key: string, value: string | number) => {
    console.log({ key, value });
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  React.useEffect(() => {
    setDisabled(!formData.name);
  }, [formData]);

  React.useEffect(() => {
    console.log(props.initValue);
    if (props.initValue?.name) {
      const { name, description, status } = props.initValue;
      setFormData({ name, description, status });
    } else {
      setFormData({ ...initFormData });
    }
  }, [props.initValue, initFormData, visible]);

  const onSubmit = async () => {
    const { name, description, status } = formData;

    setLoading(true);
    if (props.type === 'edit') {
      const req = { name, description, status };
      const res = await editFavorites(props.initValue?.fid as string, req);
      setLoading(false);
      if (res.success) {
        Message.success('修改成功');
        props.onClose();
        props.onFinish?.();
      } else {
        Message.error(res.message || '修改失败');
      }
    }
    if (props.type === 'add') {
      const req = { name, description };
      const res = await addFavorites(req);
      setLoading(false);
      if (res.success) {
        Message.success('新建成功');
        props.onClose();
        props.onFinish?.();
      } else {
        Message.error(res.message || '新建失败');
      }
    }
  };

  return (
    <BasicDialog
      title={title}
      className='max-w-md rounded-lg p-6'
      visible={visible}
      maskClosable={false}
      onClose={() => props.onClose()}
    >
      {/* content */}
      <div className='mt-8'>
        <div className='mt-4 flex w-full items-center'>
          <label className='mr-3 block w-12 text-sm dark:text-white'>
            名称
          </label>
          <input
            type='text'
            value={formData.name}
            onChange={(e: any) => onFormChange('name', e.target.value)}
            id='inline-input-label-with-helper-text'
            className='block w-full rounded-md border-gray-200 py-2 px-4 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
            placeholder='请输入收藏夹名称'
            aria-describedby='hs-inline-input-helper-text'
          />
        </div>
        <div className='mt-4 flex w-full items-center'>
          <label className='mr-3 block w-12 text-sm dark:text-white'>
            描述
          </label>
          <textarea
            id='inline-input-label-with-helper-text'
            maxLength={100}
            value={formData.description}
            onChange={(e: any) => onFormChange('description', e.target.value)}
            className='block w-full rounded-md border-gray-200 py-2 px-4 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'
            placeholder='请输入收藏描述（限100字，选填）'
            aria-describedby='hs-inline-input-helper-text'
          />
        </div>
        {/* 新建时不展示状态选择 */}
        {props.type !== 'add' && (
          <div className='mt-4 ml-4'>
            <div
              className='flex items-center'
              onClick={() => onFormChange('status', 2)}
            >
              <input
                type='radio'
                name='hs-default-radio'
                className='pointer-events-none mt-0.5 shrink-0 rounded-full border-gray-200 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:checked:border-blue-500 dark:checked:bg-blue-500 dark:focus:ring-offset-gray-800'
                id='hs-default-radio'
                checked={formData.status === 2}
              />
              <label className='ml-2 text-sm text-gray-600 dark:text-gray-400'>
                公开
              </label>
              <span className='ml-1 text-xs text-gray-500'>所有人可见</span>
            </div>

            <div
              className='mt-1 flex items-center'
              onClick={() => onFormChange('status', 0)}
            >
              <input
                type='radio'
                name='hs-default-radio'
                className='pointer-events-none mt-0.5 shrink-0 rounded-full border-gray-200 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:checked:border-blue-500 dark:checked:bg-blue-500 dark:focus:ring-offset-gray-800'
                id='hs-checked-radio'
                checked={formData.status === 0}
              />
              <label className='ml-2 text-sm text-gray-600 dark:text-gray-400'>
                隐私
              </label>
              <span className='ml-1 text-xs text-gray-500'>仅自己可见</span>
            </div>
          </div>
        )}
      </div>
      {/* footer */}
      <div className='mt-4 text-right'>
        <Button variant='light' onClick={() => props.onClose()}>
          取消
        </Button>
        <Button
          variant='primary'
          className='ml-4'
          disabled={disabled}
          isLoading={loading}
          onClick={onSubmit}
        >
          确定
        </Button>
      </div>
    </BasicDialog>
  );
};

type AddCollectionProps = {
  onFinish?: () => void;
} & React.ComponentPropsWithoutRef<'div'>;

export default function AddCollection({
  className,
  onFinish,
}: AddCollectionProps) {
  const [openModal, setOpenModal] = React.useState(false);

  return (
    <div className={clsxm('', className)}>
      <button
        type='button'
        onClick={() => {
          setOpenModal(true);
        }}
        className='inline-flex items-center justify-center gap-2 rounded-md border border-transparent py-1 px-0 text-sm font-semibold text-blue-500 ring-offset-white transition-all hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      >
        <AiOutlinePlus /> 新建收藏夹
      </button>
      {/* 弹窗 */}
      <EditCollectionMoal
        type='add'
        title='新建收藏夹'
        visible={openModal}
        onFinish={onFinish}
        onClose={() => setOpenModal(false)}
      />
    </div>
  );
}
