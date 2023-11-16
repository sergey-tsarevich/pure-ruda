SELECT * FROM "urlset" "Urlset" WHERE ("Urlset"."enabled" = 1 AND ("Urlset"."lastcheck" IS NULL OR "Urlset"."lastcheck" = '' OR "Urlset"."lastcheck" < (1694080080005 - parseperiod))) ;

select * from urldata ud
         where ud.reviewed = 0 or  ud.note is not null or ud.id in(
    select max(u.id) from urldata u left join urlset us on u.urlsetid = us.id where us.enabled = 1 group by u.urlsetid
  )

select * from urldata ud
where ud.reviewed = 0 or  ud.note is not null or ud.id in(
  select max(u.id) from urldata u left join urlset us on u.urlsetid = us.id where us.enabled = 1 group by u.urlsetid
)


select *, us.name, us.type from urldata ud left join urlset us on ud.urlsetid = us.id
                           where us.enabled = 1 and us.type != 'img'
and (ud.reviewed = 0 or  ud.note is not null or ud.id in (
  select max(u.id) from urldata u group by u.urlsetid
))


update urldata set reviewed = 1 where reviewed is null


SELECT content, id , urlsetid FROM urldata WHERE urlsetid = 139 and id != 464 order by id DESC limit 1
