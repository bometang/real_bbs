// src/main/resources/static/js/bbs/csr/add.js
import { ajax } from '/js/common.js';

(async function() {
  const parentIdAttr = document.body.dataset.parentId;
  const parentId     = parentIdAttr ? Number(parentIdAttr) : null;
  let parentCategory = null;

  // 부모 게시글 카테고리 로드
  if (parentId) {
    try {
      const res = await ajax.get(`/api/bbs/${parentId}`);
      if (res.header.rtcd === 'S00') {
        parentCategory = res.body.bcategory;
      }
    } catch (e) {
      console.error('원글 정보 로드 실패', e);
    }
  }

  // 게시 호출
  async function addBbs(data) {
    data.status = 'B0201';
    console.log('▶ addBbs 호출, data=', data);
    const { header } = await ajax.post('/api/bbs', data);
    if (header.rtcd === 'S00') {
      window.location.href = parentId
        ? `/csr/bbs/${parentId}`
        : '/csr/bbs';
    } else {
      alert(header.rtmsg);
    }
  }

  // 임시저장 호출
  async function saveDraft(data) {
    data.status = 'B0203';
    console.log('▶ saveDraft 호출, data=', data);
    const { header } = await ajax.post('/api/bbs', data);
    if (header.rtcd === 'S00') {
      window.location.href = '/csr/bbs';
    } else {
      alert(header.rtmsg);
    }
  }

  async function displayForm() {
    console.log('▶ displayForm 시작');

    // 1) 폼 생성
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <form id="frm">
        <label>제목      <input    name="title"></label><br>
        <label>작성자    <input    name="memberId" readonly></label><br>
        <label>카테고리  <select  name="bcategory" id="bcategory">
          <option value="">--선택--</option>
        </select></label><br>
        <label>내용      <textarea name="bcontent"></textarea></label><br>
        <button type="submit" id="btnSubmit">등록</button>
        <button type="button"  id="btnDraft" >임시 저장</button>
      </form>
    `;
    document.body.prepend(wrap);

    // 2) 폼 요소 참조
    const frm            = wrap.querySelector('#frm');
    const memberInput    = wrap.querySelector('[name="memberId"]');
    const categorySelect = wrap.querySelector('#bcategory');
    const btnDraft       = wrap.querySelector('#btnDraft');

    // 3) 로그인 사용자 정보 로드
    try {
      const resUser = await ajax.get('/login/auth/user');
      if (resUser.header.rtcd === 'S00' && resUser.body) {
        memberInput.value = resUser.body.memberId;
      } else {
        memberInput.value = '비회원';
      }
    } catch (e) {
      console.error('유저 정보 로드 실패', e);
    }

    // 4) 카테고리 로드
    try {
      const resCat = await ajax.get('/api/bbs/categories');
      if (resCat.header.rtcd === 'S00' && Array.isArray(resCat.body)) {
        resCat.body.forEach(code => {
          const opt = document.createElement('option');
          opt.value       = code.codeId;
          opt.textContent = code.decode;
          categorySelect.appendChild(opt);
        });
      }
      if (parentCategory) {
        categorySelect.value = parentCategory;
        categorySelect.setAttribute('disabled', '');
      }
    } catch (e) {
      console.error('카테고리 로드 실패', e);
    }

    // 5) 초기 임시저장 확인 및 로드/삭제 (새글 vs 답글 구분)
    try {
      const checkUrl = parentId
        ? `/api/bbs/temp/check?pbbsId=${parentId}`
        : '/api/bbs/temp/check';
      const checkRes = await ajax.get(checkUrl);
      if (checkRes.header.rtcd === 'S00' && checkRes.body) {
        const message = parentId
          ? '이전 답글 초안을 불러오시겠습니까?'
          : '이전 임시저장을 불러오시겠습니까?';
        if (confirm(message)) {
          const loadUrl = parentId
            ? `/api/bbs/temp/load?pbbsId=${parentId}`
            : '/api/bbs/temp/load';
          const loadRes = await ajax.get(loadUrl);
          if (loadRes.header.rtcd === 'S00') {
            frm.querySelector('[name="title"]').value      = loadRes.body.title;
            frm.querySelector('[name="bcontent"]').value    = loadRes.body.bcontent;
            // 드래프트 카테고리 선택
            categorySelect.value = loadRes.body.bcategory || '';
          }
        } else {
          const deleteUrl = parentId
            ? `/api/bbs/temp?pbbsId=${parentId}`
            : '/api/bbs/temp';
          await ajax.delete(deleteUrl);
        }
      }
    } catch (e) {
      console.error('임시저장 확인 실패', e);
    }

    // 6) 등록 핸들러
    frm.addEventListener('submit', e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(frm).entries());
      if (parentId) data.pbbsId = parentId;
      if (!data.title.trim())      return alert('제목은 필수입니다.');
      if (!parentId && (!data.bcategory || !data.bcategory.trim())) {
        return alert('카테고리를 선택하세요.');
      }
      if (!data.bcontent.trim())   return alert('내용은 필수입니다.');
      addBbs(data);
    });

    // 7) 임시 저장 핸들러
    btnDraft.addEventListener('click', () => {
      const data = Object.fromEntries(new FormData(frm).entries());
      if (!data.title.trim() && !data.bcontent.trim()) {
        return alert('제목 또는 내용을 입력해야 임시 저장할 수 있습니다.');
      }
      if (parentId) data.pbbsId = parentId;
      saveDraft(data);
    });
  }

  // 페이지 로드 시 폼 표시
  await displayForm();
})();
