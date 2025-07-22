import { ajax, PaginationUI } from '/js/community/bbs/common.js';
import { formatRelativeTime } from '/js/community/bbs/csr/dateUtils.js';

// community_detail.js (또는 적당한 JS 파일)
document.addEventListener('DOMContentLoaded', async () => {
    let currentPage = 1;
    let initialPage = 1;

    const recordsPerPage = 10;
    const pagesPerPage   = 5;
    let categoryMap = {};
    const span = document.querySelector('.contentCategory span');
    const board = document.querySelector(".board");
    const pid = board.id;
    const Quill = window.Quill;
    const frm      = document.getElementById('edit-form');

    // ---------------- Quill 에디터 초기화 ------------------------------------
    const quill = new Quill('#editor', {
      theme: 'snow',
      modules: {
        toolbar: '#toolbar',
        imageResize: {}
      }
    });

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

    const viewEls = document.querySelectorAll('.view-mode');
    const editEls  = document.querySelectorAll('.edit-mode');
    const cntLike  = document.querySelector('.cntLike');

    const btnEdit    = document.getElementById('btn-edit');
    const btnDel     = document.getElementById('btn-del');
    const btnSave    = document.getElementById('btn-save');
    const btnCancel  = document.getElementById('btn-cancel');
    const btnReply   = document.getElementById('btn-reply');
    const btnReport  = document.getElementById('btn-report');
    const btnLike    = document.getElementById('btn-like');

    // 1) “수정” 클릭 → 보기 버튼 숨기고 편집 버튼 보여주기
    btnEdit.addEventListener('click', () => {
        viewEls.forEach(el => el.classList.add('hidden'));
        editEls.forEach(el => el.classList.remove('hidden'));
        // 제목·본문 초기화 …
        document.getElementById('edit-title').value =
        document.querySelector('.contentHeader .meta-item:nth-child(2) span').textContent;
        quill.root.innerHTML =
        document.querySelector('.contentText').innerHTML;
    });

    // 2) “취소” 클릭 → 다시 보기 버튼으로 복구
    btnCancel.addEventListener('click', () => {
        editEls.forEach(el => el.classList.add('hidden'));
        viewEls.forEach(el => el.classList.remove('hidden'));
    });

    // 3) “저장” 클릭 → AJAX 저장 후 복구
    btnSave.addEventListener('click', async () => {
        document.getElementById('editorContent').value = quill.root.innerHTML;
        editEls.forEach(el => el.classList.add('hidden'));
        viewEls.forEach(el => el.classList.remove('hidden'));
        const formData = new FormData(frm);
        const data = {};
        [...formData.keys()].forEach(
                ele => (data[ele] = formData.get(ele))
        );
        const result = await modifyPostBoard(pid, data);
        if (result?.header.rtcd === 'S00') {
              // 4) 성공 시 화면 업데이트 (제목·본문·수정일 등)
              const updated = result.body;
              document.querySelector('.contentHeader .meta-item:nth-child(2) span').textContent = updated.title;
              document.querySelector('.contentText').innerHTML   = updated.bcontent;
              const dt = new Date(updated.updateDate);
                const pad = num => String(num).padStart(2, '0');
                const formatted =
                    `${dt.getFullYear()}.${pad(dt.getMonth()+1)}.${pad(dt.getDate())} ` +
                    `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
                     document.querySelector('.updateTime').textContent = '수정일: ' + formatted;
        };
    });
    // 4) “삭제” 클릭은 기존 로직 그대로
    btnDel.addEventListener('click', () => {
        if (!confirm('삭제하시겠습니까?')) return;
        delPostBoard(pid);
    });

    btnReport.addEventListener('click', async () => {
      const reason = prompt('신고 사유를 입력하세요.');
      if (!reason) return;

      try {
        const res = await ajax.post(`/api/bbs/${pid}/report`, { reason });
        if (res.header.rtcd === 'S00') {
          // 성공만 확인하고 바로 UI 업데이트
          const icon  = btnReport.querySelector('img');
          const label = btnReport.querySelector('span');
          icon.src     = '/img/bbs/bbs_detail/report_filled.png';
          alert('신고가 접수되었습니다.');
          btnReport.disabled = true;
        } else {
          alert('신고 처리에 실패했습니다: ' + res.header.rtmsg);
        }
      } catch (err) {
        console.error(err);
        alert('네트워크 오류로 신고에 실패했습니다.');
      }
    });

    btnLike.addEventListener('click', async () => {
        try {
            const { header, body: action } = await ajax.post(`/api/bbs/${pid}/likes`);
            if(header.rtcd !== 'S00') {
                return alert(header.rtmsg);
            }else if (header.rtcd === 'S00'){
                if(action === 'CREATED'){
                    const icon  = btnLike.querySelector('img');
                    icon.src    = '/img/bbs/bbs_detail/Icon_Heart_fill.png';
                }else if(action === 'DELETED'){
                    const icon  = btnLike.querySelector('img');
                    icon.src    = '/img/bbs/bbs_detail/Icon_Heart.png';
                }
            }
            const cntRes = await ajax.get(`/api/bbs/${pid}/likes/count`);
            if (cntRes.header.rtcd === 'S00') {
                cntLike.textContent = '좋아요 '+cntRes.body;
            }
        } catch (e) {
            console.error('좋아요 토글 오류', e);
        }
    });

    btnLike.addEventListener('click', async () => {
        window.location.href = `/bbs/community/add/${postBoard.bbsId}`;
    });

    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////게시글 관련////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////
    //게시글 삭제
    const delPostBoard = async pid => {
      try {
        const url = `/api/bbs/${pid}`;
        const result = await ajax.delete(url);
        console.log(result);
        if (result.header.rtcd === 'S00') {
          console.log(result.body);
          window.location.href = '/bbs/community';
        } else if(result.header.rtcd.substr(0,1) == 'E'){
            for(let key in result.header.details){
                console.log(`필드명:${key}, 오류:${result.header.details[key]}`);
            }
            return result.header.details;
        } else {
          alert(result.header.rtmsg);
        }
      } catch (err) {
        console.error(err);
      }
      return null;
    };

    //게시글 수정
    const modifyPostBoard = async (pid, postBoard) => {
      try {
        console.log('modifyPostBoard 호출, pid=', pid, 'body=', postBoard);
        const url = `/api/bbs/${pid}`;
        const result = await ajax.patch(url, postBoard);
        if (result.header.rtcd === 'S00') {
          console.log(result.body);
           return result;
        } else if(result.header.rtcd.substr(0,1) == 'E'){
            for(let key in result.header.details){
                console.log(`필드명:${key}, 오류:${result.header.details[key]}`);
            }
            return result;
        } else {
          alert(result.header.rtmsg);
        }
      } catch (err) {
        console.log("수정 오류")
        console.error(err.message);
      }
    };
    await loadCategories();
});