import { NextPage } from 'next';
import { useRouter } from 'next/router';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import useSWRInfinite from 'swr/infinite';

import { useLoginContext } from '@/hooks/useLoginContext';

import ItemBottom from '@/components/home/ItemBottom';
import Items from '@/components/home/Items';
import Loading from '@/components/loading/Loading';
import { HomeSkeleton } from '@/components/loading/skeleton';
import IndexBar from '@/components/navbar/IndexBar';
import Seo from '@/components/Seo';
import ToTop from '@/components/toTop/ToTop';

import { fetcher } from '@/services/base';
import { makeUrl } from '@/utils/api';

import { HomeItem, HomeItems } from '@/types/home';

const Index: NextPage = () => {
  const router = useRouter();
  const { sort_by = 'last', tid = '' } = router.query;

  const { isLogin } = useLoginContext();
  const { data, error, setSize, isValidating, size } =
    useSWRInfinite<HomeItems>(
      (index) => makeUrl(`/`, { sort_by, tid, page: index + 1 }),
      fetcher,
      { revalidateFirstPage: false }
    );

  const repositories = data
    ? data.reduce((pre: HomeItem[], curr) => {
        if (curr.data.length > 0) {
          pre.push(...curr.data);
        }
        return pre;
      }, [])
    : [];
  const hasMore = data ? data[data.length - 1].has_more : false;
  const pageIndex = data ? size : 0;

  const [sentryRef] = useInfiniteScroll({
    loading: isValidating,
    hasNextPage: hasMore,
    disabled: !!error,
    onLoadMore: () => {
      setSize(pageIndex + 1);
    },
    rootMargin: '0px 0px 100px 0px',
  });

  const handleItemBottom = () => {
    if (!isValidating && !hasMore) {
      if (isLogin) {
        return <ItemBottom endText='你不经意间触碰到了底线'></ItemBottom>;
      } else {
        return <ItemBottom endText='到底啦！登录可查看更多内容'></ItemBottom>;
      }
    }
  };

  return (
    <>
      <Seo title='首页' description='分享 GitHub 上有趣、入门级的开源项目' />
      <IndexBar tid={tid as string} sort_by={sort_by as string} />
      <div className='h-screen'>
        <Items repositories={repositories}></Items>
        <div
          className='divide-y divide-gray-100 overflow-hidden dark:divide-gray-700'
          ref={sentryRef}
        >
          {isValidating && size <= 1 && <HomeSkeleton loop={6} />}
          {(isValidating || hasMore) && size > 1 && <Loading />}
        </div>
        {handleItemBottom()}
        <div className='hidden border-none md:block'>
          <ToTop />
        </div>
      </div>
    </>
  );
};

export default Index;
