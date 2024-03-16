import { FormEventHandler } from 'react';

import useCommentData from '@/hooks/useCommentData';
import { useLoginContext } from '@/hooks/useLoginContext';

import Message from '@/components/message';
import Modal from '@/components/modal';
import Rating from '@/components/respository/Rating';

import { submitComment } from '@/services/repository';
import {
  DEFAULT_AVATAR,
  DEFAULT_INITITAL_COMMENT_DATA,
} from '@/utils/constants';

import { CommentItemData, CommentSuccessData } from '@/types/repository';

function getErrMessage(commentData: {
  comment: string;
  isUsed: boolean;
  score: number;
}) {
  if (!commentData.comment) {
    return '评论内容不能为空';
  }
  if (commentData.comment.length < 5) {
    return '评论内容不能少于 5 个字';
  }
  if (commentData.comment.length > 500) {
    return '评论内容不能超过 500 个字';
  }
  if (!commentData.score) {
    return '请评分';
  }
  return '';
}

function CommentSubmit(props: {
  belongId: string;
  className?: string;
  replyUser?: CommentItemData;
  onSuccess?: (data: CommentSuccessData) => void;
  onFail?: (error: any) => void;
  onCancelReply?: () => void;
}) {
  const { commentData, setCommentData } = useCommentData();
  const { login, userInfo, isLogin } = useLoginContext();
  const { belongId, className, onSuccess, onFail } = props;

  const handleInput: FormEventHandler<HTMLTextAreaElement> = (e) => {
    const { value } = e.currentTarget;
    if (value.length == 0) {
      e.currentTarget.style.height = `58px`;
    } else {
      // 自动增加输入框的高度
      // 2 是 上下两个 border 的高度
      e.currentTarget.style.height = `${e.currentTarget.scrollHeight + 2}px`;
    }

    setCommentData({
      ...commentData,
      comment: value,
      height: e.currentTarget.scrollHeight + 2,
    });
  };

  const handleRadioChange = (isUsed: boolean) => {
    setCommentData({ ...commentData, isUsed });
  };

  const handleChangeRating = (rating: number) => {
    setCommentData({ ...commentData, score: rating });
  };

  const handleSubmit = () => {
    if (getErrMessage(commentData)) {
      return Message.error(getErrMessage(commentData));
    }
    if (!isLogin) {
      return login();
    }
    Modal.confirm({
      title: '提交评论',
      content:
        '评论提交后：无法修改、重新提交和删除，请发布有价值的内容共建社区。',
      okText: '确认发布',
      onOk() {
        submitComment(belongId, commentData)
          .then((data) => {
            setCommentData(DEFAULT_INITITAL_COMMENT_DATA);
            if (data.success) {
              onSuccess && onSuccess(data);
              Message.success('发布评论成功');
            } else {
              onFail && onFail(data);
            }
          })
          .catch((err) => {
            Message.error(err.message || '提交评论失败');
          });
      },
    });
  };

  const placeholder = props.replyUser
    ? `正在回复：${props.replyUser.user.nickname}`
    : '写评论：项目的使用体验、优点或吐槽、帮你解决了什么问题、惊艳到你的地方...';

  return (
    <div className={`${className}`}>
      <div className='flex items-start'>
        <div className='relative mr-4 hidden sm:inline-flex'>
          <div className='relative aspect-square w-14 overflow-hidden rounded-full'>
            {!props.replyUser && (
              <img
                src={userInfo?.avatar || DEFAULT_AVATAR}
                alt='comment_submit_avatar'
              />
            )}
          </div>
        </div>
        <div className='flex-1'>
          <textarea
            className='min-h-[3rem] w-full flex-shrink rounded-lg bg-white py-2 px-4 text-sm dark:bg-gray-800 dark:placeholder:text-gray-400 dark:focus:border-blue-800'
            style={{ height: commentData.height }}
            placeholder={placeholder}
            value={commentData.comment}
            onInput={handleInput}
          ></textarea>
          <div className='flex flex-wrap items-center gap-2 text-xs sm:gap-4 sm:text-sm'>
            {!props.replyUser && (
              <>
                <label className='flex cursor-pointer items-center py-2'>
                  <input
                    type='radio'
                    name='radio-1'
                    className='mr-1 h-3 w-3 flex-shrink-0 cursor-pointer appearance-none rounded-full border text-blue-500 focus:border-blue-500 focus:bg-blue-500 md:h-5 md:w-5'
                    style={{ boxShadow: 'none' }}
                    checked={!commentData.isUsed}
                    onChange={() => handleRadioChange(false)}
                  />
                  <span>没用过</span>
                </label>
                <label className='flex cursor-pointer items-center py-2'>
                  <input
                    type='radio'
                    name='radio-1'
                    className='mr-1 h-3 w-3 flex-shrink-0 cursor-pointer appearance-none rounded-full border text-blue-500 focus:border-blue-500 focus:bg-blue-500 md:h-5 md:w-5'
                    style={{ boxShadow: 'none' }}
                    checked={commentData.isUsed}
                    onChange={() => handleRadioChange(true)}
                  />
                  <span>用过</span>
                </label>
                <div className='h-4 w-[1px] bg-gray-300'></div>
                <div className='flex items-center'>
                  <span>评分：</span>
                  <Rating
                    value={commentData.score}
                    onRateChange={handleChangeRating}
                  />
                </div>
              </>
            )}
            <>
              {props.replyUser ? (
                <div className='flex flex-1 justify-end space-x-4'>
                  <button
                    onClick={props.onCancelReply}
                    className='inline-flex h-8 min-h-[2rem] flex-shrink-0 cursor-pointer select-none flex-wrap items-center justify-center rounded-lg border border-gray-300 pl-3 pr-3 text-sm font-semibold text-gray-500 transition-transform focus:outline-none active:scale-90'
                  >
                    取消回复
                  </button>
                  <button
                    className='inline-flex h-8 min-h-[2rem] flex-shrink-0 cursor-pointer select-none flex-wrap items-center justify-center rounded-lg bg-gray-700 pl-3 pr-3 text-sm font-semibold text-white transition-transform focus:outline-none active:scale-90'
                    onClick={handleSubmit}
                  >
                    回复
                  </button>
                </div>
              ) : (
                <button
                  className='ml-auto inline-flex h-8 min-h-[2rem] flex-shrink-0 cursor-pointer select-none flex-wrap items-center justify-center rounded-lg bg-gray-700 pl-3 pr-3 text-sm font-semibold text-white transition-transform focus:outline-none active:scale-90'
                  onClick={handleSubmit}
                >
                  发布
                </button>
              )}
            </>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommentSubmit;
