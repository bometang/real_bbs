package com.KDT.mosi.domain.member.svc;

import com.KDT.mosi.domain.entity.Member;
import com.KDT.mosi.domain.member.dao.MemberDAO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberSVCImpl implements MemberSVC{
  private final MemberDAO memberDAO;

  @Override
  public Member join(Member member) {
    return memberDAO.insertMember(member);
  }

  @Override
  public boolean isMember(String email) {
    return memberDAO.isExist(email);
  }

  @Override
  public Optional<Member> findByMemberId(Long memberId) {
    return memberDAO.findByMemberId(memberId);
  }

  @Override
  public Optional<Member> findByEmail(String email) {
    return memberDAO.findByEmail(email);
  }

  @Override
  public int updatePic(Long memberId, byte[] pic) {
    return memberDAO.updatePic(memberId, pic);
  }
}
