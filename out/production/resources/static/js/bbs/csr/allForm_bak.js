import { ajax,  PaginationUI} from '/js/common.js';

let currentPage = 1; // 현재 페이지를 위한 전역 변수
let initialPage = 1; // 게시글 추가 후 이동할 페이지 (1페이지)

const recordsPerPage = 10;        // 페이지당 레코드수
const pagesPerPage = 10;          // 한페이지당 페이지수
console.log('first');
//게시글목록
const getBbs = async (reqPage, reqRec) => {

  try {
    const url = `/api/bbs/paging?pageNo=${reqPage}&numOfRows=${reqRec}`;
    const result = await ajax.get(url);
    console.log('suc');
    if (result.header.rtcd === 'S00') {
      currentPage = reqPage; // 현재 페이지 업데이트
      displayBbsList(result.body);
      console.log('suc');
    } else {
      alert(result.header.rtmsg);
    }
  } catch (err) {
    console.error(err);
  }
  console.log('fal');
};

//게시글목록 화면
function displayBbsList(bbs) {

  const makeTr = bbs => {
    const $tr = bbs
      .map(
        bbs =>
          `<tr data-pid=${bbs.bbsId}>
            <td>${bbs.bbsId}</td>
            <td>${bbs.title}</td>
            <td>${bbs.memberId}</td>
            <td>${bbs.createDate}</td>
            <td>${bbs.updateDate}</td></tr>`,
      )
      .join('');
    return $tr;
  };

  $list.innerHTML = `
    <table>
      <caption> 게 시 글 목 록 </caption>
      <thead>
        <tr>
          <th>게시글번호</th>
          <th>제목</th>
          <th>작성자</th>
          <th>작성일</th>
          <th>수정일</th>
        </tr>
      </thead>
      <tbody>
        ${makeTr(bbs)}
      </tbody>
    </table>`;

  const $bbs = $list.querySelectorAll('table tbody tr');

  // Array.from($bbs)
  [...$bbs].forEach(bbs =>
    bbs.addEventListener('click', e => {
      const pid = e.currentTarget.dataset.pid;
      location.href = `/csr/bbs/${pid}`;
    }),
  );
}

const $list = document.createElement('div');
$list.setAttribute('id','list')
document.body.appendChild($list);

const divEle = document.createElement('div');
divEle.setAttribute('id','reply_pagenation');
document.body.appendChild(divEle);

async function configPagination(){
  const url = '/api/bbs/totCnt';
  try {
    const result = await ajax.get(url);

    const totalRecords = result.body; // 전체 레코드수

    const handlePageChange = (reqPage)=>{
      return getBbs(reqPage,recordsPerPage);
    };

    // Pagination UI 초기화
    var pagination = new PaginationUI('reply_pagenation', handlePageChange);

    pagination.setTotalRecords(totalRecords);       //총건수
    pagination.setRecordsPerPage(recordsPerPage);   //한페이지당 레코드수
    pagination.setPagesPerPage(pagesPerPage);       //한페이지당 페이지수

    // 첫페이지 가져오기
    pagination.handleFirstClick();

  }catch(err){
    console.error(err);
  }
}
configPagination();