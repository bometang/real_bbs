import { ajax, PaginationUI } from '/js/community/bbs/common.js';
import { formatRelativeTime } from '/js/community/bbs/csr/dateUtils.js';
let currentPage = 1;
const recordsPerPage = 10;
const pagesPerPage   = 10;
let categoryMap = {};
const span = document.querySelector('.contentCategory span');

// 카테고리 매핑 로드 (페이지 최초 1회만 호출)
const loadCategories = async () => {
  try {
    const res = await ajax.get('/api/bbs/categories');
    if (res.header.rtcd === 'S00') {
      categoryMap = Object.fromEntries(
        res.body.map(({ codeId, decode }) => [codeId, decode])
      );
        const bbsData = span.textContent.trim();
        const decode = categoryMap[bbsData] ?? '기타';
        span.textContent = decode;
    }
  } catch (err) {
    console.error(err);
  }
};




document.addEventListener('DOMContentLoaded', async () => {
  await loadCategories();   // ① 카테고리 매핑 먼저
//  await configPagination(); // ② 페이지네이션·목록 로드
});