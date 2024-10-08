import { useState } from 'react';
import { GoChevronDown } from 'react-icons/go';

import useCommentList from '@/hooks/useCommentList';

import CommentItem from '@/components/respository/CommentItem';
import CommentSubmit from '@/components/respository/CommentSubmit';

import { getMoreReply } from '@/services/repository';

import { CommentItemData } from '@/types/repository';
import { TranslationFunction } from '@/types/utils';

interface Props {
  belong: string;
  belongId: string;
  t: TranslationFunction;
  i18n_lang: string;
  className?: string;
}

const CommentContainer = (props: Props) => {
  const { belong, belongId, className, t, i18n_lang } = props;
  const {
    list,
    total,
    hasMore,
    loadMore,
    sortBy,
    sortType,
    setList,
    currentUserComment,
    setCurrentUserComment,
    refreshList,
  } = useCommentList({
    belong,
    belongId,
  });

  const [replyList, setReplyList] = useState<Record<string, CommentItemData[]>>(
    {}
  );

  const loadMoreReply = (cid: string) => {
    getMoreReply(cid).then((res) => {
      setReplyList({ [cid]: res.data });
    });
  };

  const handleChangeVote = (index: number, value: boolean) => {
    list[index].is_voted = value;
    value ? list[index].votes++ : list[index].votes--;
    setList([...list]);
  };
  const handleChangeCurrentUserVote = (value: boolean) => {
    if (!currentUserComment) return;
    setCurrentUserComment({
      ...currentUserComment,
      is_voted: value,
      votes: value
        ? currentUserComment.votes + 1
        : currentUserComment.votes - 1,
    });
  };
  const handleCommentSuccess = () => {
    refreshList();
  };
  const handleCommentFail = () => {
    refreshList();
  };
  const btnActive = '!bg-blue-500 dark:!bg-blue-800';

  // 当前回复的Id
  const [commentId, setCommentId] = useState<string>();

  /**
   * 评论项包裹组件
   */
  const CommentWrapper = ({
    item,
    index,
  }: {
    item: CommentItemData;
    index: number;
  }) => {
    // 如果是回复的评论
    if (item.reply_id) {
      return (
        <>
          <CommentItem
            className='mb-6'
            {...item}
            key={`reply-item-${item.cid}`}
            onReply={(_, reply_id) => setCommentId(reply_id)}
            onChangeVote={(value) => handleChangeVote(index, value)}
            t={t}
            i18n_lang={i18n_lang}
          />

          {item.reply_id === commentId && (
            <CommentSubmit
              t={t}
              replyUser={item}
              belongId={belongId}
              onCancelReply={() => setCommentId(undefined)}
              onSuccess={() => {
                setCommentId(undefined);
                refreshList();
              }}
            />
          )}
        </>
      );
    }

    return (
      <>
        <CommentItem
          t={t}
          i18n_lang={i18n_lang}
          className='mb-6'
          {...item}
          key={`commet-item-${item.cid}`}
          onReply={(cid) => setCommentId(cid)}
          onChangeVote={(value) => handleChangeVote(index, value)}
        />

        {item.cid === commentId && (
          <CommentSubmit
            t={t}
            replyUser={item}
            key={item.cid}
            belongId={belongId}
            onCancelReply={() => setCommentId(undefined)}
            onSuccess={() => {
              setCommentId(undefined);
              refreshList();
            }}
          />
        )}
      </>
    );
  };

  /**
   * 回复列表
   */
  const ReplyList = ({
    item,
    cIndex,
  }: {
    item: CommentItemData;
    cIndex: number;
  }) => {
    if (!item.replies) return null;
    const list = replyList[item.cid] || item.replies.data;
    return (
      <div className='pl-8 md:pl-16'>
        {list.map((reply) => (
          <CommentWrapper key={reply.reply_id} item={reply} index={cIndex} />
        ))}

        {item.replies.has_more && item.replies.total > list.length && (
          <div
            className='mb-6 flex cursor-pointer items-center justify-center rounded-md bg-gray-50 text-sm leading-10 hover:bg-gray-200 active:bg-gray-50 dark:bg-gray-700'
            onClick={() => loadMoreReply(item.cid)}
          >
            {t('comment.total', { total: item.replies.total })}
            <GoChevronDown />
          </div>
        )}
      </div>
    );
  };

  return (
    <div id='comment' className={`p-4 ${className}`}>
      <h3 className='mb-4'>{t('comment.title')}</h3>
      {currentUserComment ? (
        <CommentItem
          {...currentUserComment}
          alone
          onChangeVote={handleChangeCurrentUserVote}
          t={t}
          i18n_lang={i18n_lang}
        />
      ) : (
        <CommentSubmit
          t={t}
          belongId={belongId}
          onSuccess={handleCommentSuccess}
          onFail={handleCommentFail}
        />
      )}
      {total ? (
        <>
          <div className='my-8 flex items-center justify-between'>
            <strong>{t('comment.total', { total: total })}</strong>
            <div className='btn-group'>
              <button
                className={`${
                  sortType === 'last' ? btnActive : ''
                } ml-auto inline-flex h-8 min-h-[2rem] flex-shrink-0 cursor-pointer select-none flex-wrap items-center justify-center rounded-l-lg bg-gray-700 pl-3 pr-3 text-sm font-semibold text-white transition-transform focus:outline-none active:scale-90`}
                onClick={() => sortBy('last')}
              >
                {t('comment.sort_new')}
              </button>
              <button
                className={`${
                  sortType === 'hot' ? btnActive : ''
                } ml-auto inline-flex h-8 min-h-[2rem] flex-shrink-0 cursor-pointer select-none flex-wrap items-center justify-center rounded-r-lg bg-gray-700 pl-3 pr-3 text-sm font-semibold text-white transition-transform focus:outline-none active:scale-90`}
                onClick={() => sortBy('hot')}
              >
                {t('comment.sort_hot')}
              </button>
            </div>
          </div>
          {list.map((item, index) => (
            <div key={item.cid}>
              <CommentWrapper item={item} index={index} />
              {/* 回复 */}
              <ReplyList item={item} cIndex={index} />
            </div>
          ))}
          <div
            hidden={!hasMore}
            className='cursor-pointer rounded-md bg-gray-50 text-center text-sm leading-10 hover:bg-gray-200 active:bg-gray-50 dark:bg-gray-700'
            onClick={loadMore}
          >
            {t('comment.load_more')}
          </div>
        </>
      ) : (
        <div className='mt-4 border-t border-gray-300 text-center text-xl dark:border-gray-700'>
          <div className='py-14 text-gray-300 dark:text-gray-500'>
            {t('comment.no_comment')}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentContainer;
