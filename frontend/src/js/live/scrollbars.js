function adjustScrollbarColors()
{
  var scroll_sections = [];
  $("#content_games").children().each(function()
  {
    // this level: day containers
    $(this).children().each(function()
    {
      // this level: daytime containers or date_dividers
      let h=$(this).is(":visible")?$(this).outerHeight():0;
      if($(this).hasClass("date_divider"))
      {
        scroll_sections.push({"category":"date","height":h});
      }
      else
      {
        $(this).children().each(function()
        {
          // this level: game containers or daytime_dividers
          let h=$(this).is(":visible")?$(this).outerHeight():0;
          if($(this).hasClass("datetime_divider"))
          {
            scroll_sections.push({"category":"date","height":h});
          }
          else
          {
            let public_game_id = $(this).attr("gameid");
            if(game_infos[public_game_id].data_available)
            {
              if(game_infos[public_game_id].game_over){scroll_sections.push({"category":"over","height":h});}
              else if(getRecentEnough(public_game_id))
              {
                scroll_sections.push({"category":"live","height":h});
              }
              else
              {
                scroll_sections.push({"category":"connection_lost","height":h});
              }
            }
            else{scroll_sections.push({"category":"upcoming","height":h});}
          }
        });
      }
    });
  });
  let str = '';
  let total_height = $("#content_games").outerHeight();
  let summe = 0;
  for(var ii=0;ii<scroll_sections.length;ii++)
  {
    scroll_sections[ii].percentage = scroll_sections[ii].height/total_height*100;
    summe+=scroll_sections[ii].percentage;
  }
  if(total_height>$("#tournament_defined").outerHeight() && total_height>0) // if there is a need to scroll
  {
    for(var ii=0;ii<scroll_sections.length;ii++)
    {
      str+='<div class="scrollbar_section '+scroll_sections[ii].category+'" style="height:'+(scroll_sections[ii].percentage)+'%;"></div>';
    }
  }
  document.getElementById('scrollbar').innerHTML = str;
  //$("#scrollbar").html(str);
}