package com.KDT.mosi.web.controller.board;

import com.KDT.mosi.domain.board.bbs.svc.BbsSVC;
import com.KDT.mosi.domain.entity.Member;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/bbs")
@RequiredArgsConstructor
public class CsrBbsController {
  final private BbsSVC bbsSVC;

  @GetMapping
  public String bbs(Model model,HttpSession session) {
    Member loginMember = (Member) session.getAttribute("loginMember");
    model.addAttribute("user", loginMember);
    return "/postBoards/allForm_v2";
  }

  @GetMapping("/community")
  public String community(Model model,HttpSession session) {
    Member loginMember = (Member) session.getAttribute("loginMember");
    model.addAttribute("user", loginMember);
    return "postBoards/bbs_list";
  }

  //게시글조회
  @GetMapping("/community/{id}")
  public String findById(
      @PathVariable("id") Long id,
      Model model,
      HttpSession session
  ){
    model.addAttribute("bbsId", id);
    Member loginMember = (Member) session.getAttribute("loginMember");
    model.addAttribute("user", loginMember);
    return "postBoards/detailForm";
  }

  @GetMapping("/community/add")
  public String bbsAdd(
      HttpSession session
      ,Model model) {
    Member loginMember = (Member) session.getAttribute("loginMember");
    model.addAttribute("user", loginMember);
    return "postBoards/write_quill";
  }

  // 게시글 답글
  @GetMapping("/community/add/{id}")
  public String updateForm(@PathVariable("id") Long id, Model model,HttpSession session) {
    model.addAttribute("bbsId", id);
    Member loginMember = (Member) session.getAttribute("loginMember");
    model.addAttribute("user", loginMember);
    return "postBoards/write_quill";
  }

}
