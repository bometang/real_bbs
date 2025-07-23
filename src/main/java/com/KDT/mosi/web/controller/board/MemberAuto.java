package com.KDT.mosi.web.controller.board;

import com.KDT.mosi.domain.entity.Member;
import com.KDT.mosi.domain.member.dao.MemberDAO;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Controller
@RequestMapping("/dev")
@RequiredArgsConstructor
public class MemberAuto {

  private final MemberDAO memberDAO;

//  @GetMapping("/test-login")
//  public String testLogin(
//      HttpSession session,
//      Model model
//  ) {
//    // 예시로 Member 엔티티를 직접 new 하지 않고, LoginMember DTO에 id만 담음
//    Member loginMember = new Member(1L,"minjun","a","a",null,null,null);
//    // 세션에 저장
//    session.setAttribute("loginMember", loginMember);
//    session.setAttribute("loginMemberId", 1L);
//
//    return "redirect:/";
//  }


  /**
   * member_id = 1 인 사용자를 세션에 로그인 처리
   */
  @GetMapping("/test-login")
  public String testLogin(HttpSession session) {
    Member loginMember = memberDAO
        .findByMemberId(1L)
        .orElseThrow(() -> new IllegalStateException("Member #1 not found"));
    session.setAttribute("loginMember", loginMember);
    session.setAttribute("loginMemberId", loginMember.getMemberId());
    return "redirect:/";
  }

  @GetMapping("/update-pics")
  public String updateAllPics(HttpSession session) throws IOException {
    String baseDir = "C:/KDT/projects/realBbs/src/main/resources/static/img/member";
    String[] fileNames = {
        "1_인물.jpg",
        "2_인물.png",
        "3_인물.png",
        "4_인물.jpg",
        "5_인물.jpg",
        "6_인물.jpg",
        "7_인물.jpg",
        "8_인물.png"
    };

    for (int i = 0; i < fileNames.length; i++) {
      long memberId = i + 1L;
      Path imgPath = Path.of(baseDir, fileNames[i]);
      byte[] picBytes = Files.readAllBytes(imgPath);
      memberDAO.updatePic(memberId, picBytes);
    }

    // (원하시면 세션에 새로 갱신된 Member 객체를 담아주실 수도 있습니다)
    return "redirect:/";
  }
}
