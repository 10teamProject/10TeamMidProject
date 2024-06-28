import { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import Pagination from 'react-js-pagination';

import FilterDropdown from '@/components/listPage/FilterDropdown';
import FitNotice from '@/components/listPage/FitNotice';
import NoticeCard from '@/components/listPage/NoticeCard';
import { Notice } from '@/utils/NoticeCard/NoticesType';
import paginationStyles from '@/utils/Pagination.module.scss';

import { getNotices } from '../api/GetNotice';
import styles from './ListPage.module.scss';

type Props = {
  initialNotices: Notice[];
  totalCount: number;
  currentPage: number;
  sort: 'time' | 'pay' | 'hour' | 'shop';
  selectedLocations: string[];
  startDate: string;
  hourlyPay: number;
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context,
) => {
  // 쿼리 파라미터에서 현재 페이지 및 정렬 기준 등을 가져옴
  const currentPage = context.query.page
    ? parseInt(context.query.page as string, 10)
    : 1;
  const sort =
    (context.query.sort as 'time' | 'pay' | 'hour' | 'shop') || 'time';
  const selectedLocations = (context.query.locations as string[]) || [];
  const startDate = (context.query.startDate as string) || '';
  const hourlyPay = context.query.hourlyPay
    ? parseInt(context.query.hourlyPay as string, 10)
    : 0;

  // 페이지네이션 없이 모든 데이터를 불러오기 위해 limit과 offset을 제거
  const params = {
    sort,
    address: selectedLocations,
    startsAtGte: startDate,
    hourlyPayGte: hourlyPay,
  };

  try {
    const data = await getNotices(params);
    const initialNotices: Notice[] = data.items.map((item) => item.item);
    const totalCount = data.count;

    return {
      props: {
        initialNotices,
        totalCount,
        currentPage,
        sort,
        selectedLocations,
        startDate,
        hourlyPay,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        initialNotices: [],
        totalCount: 0,
        currentPage,
        sort: 'time',
        selectedLocations: [],
        startDate: '',
        hourlyPay: 0,
      },
    };
  }
};

const ListPage: React.FC<Props> = ({
  initialNotices,
  totalCount,
  currentPage,
  sort: initialSort,
  selectedLocations: initialSelectedLocations,
  startDate: initialStartDate,
  hourlyPay: initialHourlyPay,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [label, setLabel] = useState('마감임박순');
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [page, setPage] = useState(currentPage);
  const itemsPerPage = 6;
  const [totalNoticesCount, setTotalNoticesCount] = useState(totalCount);

  const [sort, setSort] = useState<'time' | 'pay' | 'hour' | 'shop'>('time');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [hourlyPay, setHourlyPay] = useState(0);

  useEffect(() => {
    const fetchNotices = async (
      page: number,
      sort: 'time' | 'pay' | 'hour' | 'shop',
      locations: string[],
      startDate: string,
      hourlyPay: number,
    ) => {
      const offset = (page - 1) * itemsPerPage;

      const params = {
        offset,
        limit: itemsPerPage,
        sort,
        address: locations,
        startsAtGte: startDate,
        hourlyPayGte: hourlyPay,
      };

      try {
        const data = await getNotices(params);
        setNotices(data.items.map((item) => item.item));
        setTotalNoticesCount(data.count); // 총 개수 업데이트
      } catch (error) {
        console.error(error);
      }
    };

    fetchNotices(page, sort, selectedLocations, startDate, hourlyPay);
  }, [page, sort, selectedLocations, startDate, hourlyPay]);

  const sortOptions: {
    key: 'time' | 'pay' | 'hour' | 'shop';
    label: string;
  }[] = [
    { key: 'time', label: '마감임박순' },
    { key: 'pay', label: '시급많은순' },
    { key: 'hour', label: '시간적은순' },
    { key: 'shop', label: '가나다순' },
  ];

  const handleSortChange = (
    newSortBy: 'time' | 'pay' | 'hour' | 'shop',
    newLabel: string,
  ) => {
    setSort(newSortBy);
    setLabel(newLabel);
    setIsDropdownOpen(false);
  };

  const handlePageChange = (pageNumber: number) => {
    setPage(pageNumber);
  };
  const handleFilterApply = (
    locations: string[],
    startDate: string,
    hourlyPay: number,
  ) => {
    setSelectedLocations(locations);
    setStartDate(startDate);
    setHourlyPay(hourlyPay);
    setIsFilterOpen(false);
  };

  return (
    <>
      <div className={styles.customContainer}>
        <div className={styles.customSection}>
          <h2 className={styles.title}>맞춤 공고</h2>
          <div className={styles.fitNotice}>
            <FitNotice initialNotices={initialNotices} />
          </div>
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>전체 공고</h2>
          <div
            className={styles.sortDropdown}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {label} ▼
            {isDropdownOpen && (
              <ul className={styles.sortDropdownMenu}>
                {sortOptions.map((option) => (
                  <li
                    key={option.key}
                    className={`${styles.sortDropdownText} ${styles.dropdownLine}`}
                    onClick={() => handleSortChange(option.key, option.label)}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div
            className={styles.detailFilter}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            상세 필터
            {isFilterOpen && (
              <FilterDropdown
                setIsFilterOpen={setIsFilterOpen}
                onApply={handleFilterApply}
                initialSelectedLocations={selectedLocations}
                initialStartDate={startDate}
                initialHourlyPay={hourlyPay}
              />
            )}
          </div>
        </div>
        <div className={styles.notices}>
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
        <Pagination
          activePage={page}
          itemsCountPerPage={itemsPerPage}
          totalItemsCount={totalNoticesCount}
          pageRangeDisplayed={7}
          onChange={handlePageChange}
          innerClass={paginationStyles.pagination}
          itemClass={paginationStyles['page-item']}
          linkClass={paginationStyles['page-link']}
          activeClass={paginationStyles.active}
        />
      </div>
    </>
  );
};

export default ListPage;
