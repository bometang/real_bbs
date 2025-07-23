package com.KDT.mosi.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class Member {
  private Long memberId;
  private String nickname;
  private String email;
  private String passwd;
  private byte[] pic;
  private LocalDateTime createDate;
  private LocalDateTime updateDate;
}
