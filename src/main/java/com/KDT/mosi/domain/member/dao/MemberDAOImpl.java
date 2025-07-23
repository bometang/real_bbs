package com.KDT.mosi.domain.member.dao;

import com.KDT.mosi.domain.entity.Member;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.BeanPropertySqlParameterSource;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class MemberDAOImpl implements MemberDAO{
  final private NamedParameterJdbcTemplate template;

  @Override
  public Member insertMember(Member member) {
    // 1) sql 준비
    StringBuffer sql = new StringBuffer();
    sql.append("INSERT INTO member (member_id, nickname, email, passwd, pic) ");
    sql.append("\"VALUES (member_member_id_seq.nextval, :nickname, :email, :passwd, :pic) ");

    // 2) sql 실행
    SqlParameterSource param = new BeanPropertySqlParameterSource(member);
    //KeyHolder 의 역할 : insert쿼리를 실행한 후 데이터베이스에서 자동 생성된 키(pk,시퀀스)만을 반환 하는데 사용
    KeyHolder keyHolder = new GeneratedKeyHolder();
    int rows = template.update(sql.toString(), param, keyHolder, new String[]{"member_id"});

    long memberId = ((Number) keyHolder.getKeys().get("member_id")).longValue();

    return findByMemberId(memberId).get();
  }

  @Override
  public boolean isExist(String email) {
    StringBuffer sql = new StringBuffer();
    sql.append("select count(*) ");
    sql.append("  from member ");
    sql.append(" where email = :email ");

    Map<String,String> param = Map.of("email",email);
    Integer cntOfRec = template.queryForObject(sql.toString(), param, Integer.class);

    return (cntOfRec == 1) ? true : false;
  }

  @Override
  public Optional<Member> findByMemberId(Long memberId) {
    StringBuffer sql = new StringBuffer();
    sql.append("select  member_id, ");
    sql.append("        email, ");
    sql.append("        passwd, ");
    sql.append("        nickname, ");
    sql.append("        create_date, ");
    sql.append("        update_date ");
    sql.append(" from member ");
    sql.append("where member_id = :memberId ");

    Map<String,Long> param = Map.of("memberId",memberId);
    try {
      Member member = template.queryForObject(
          sql.toString(), param, BeanPropertyRowMapper.newInstance(Member.class));

      return Optional.of(member);

    } catch (EmptyResultDataAccessException e) {
      return Optional.empty();

    }
  }

  @Override
  public Optional<Member> findByEmail(String email) {
    StringBuffer sql = new StringBuffer();
    sql.append("select  member_id, ");
    sql.append("        email, ");
    sql.append("        passwd, ");
    sql.append("        nickname, ");
    sql.append("        create_date, ");
    sql.append("        update_date ");
    sql.append(" from member ");
    sql.append("where email = :email ");

    Map<String,String> param = Map.of("email",email);
    try {
      Member member = template.queryForObject(
          sql.toString(), param,BeanPropertyRowMapper.newInstance(Member.class));

      return Optional.of(member);

    } catch (EmptyResultDataAccessException e) {
      return Optional.empty();

    }
  }

  @Override
  public int updatePic(Long memberId, byte[] pic) {
    String sql = ""
        + "UPDATE member "
        + "   SET pic = :pic "
        + " WHERE member_id = :memberId";

    MapSqlParameterSource params = new MapSqlParameterSource()
        .addValue("pic", pic)
        .addValue("memberId", memberId);

    return template.update(sql, params);
  }
}
