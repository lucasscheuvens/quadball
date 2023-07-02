$(document).on("change", ".show_events_checkbox", function()
{
  let gameid = $(this).attr("gameid");
  let show_events_setting = $(this).is(':checked');
  show_events[gameid]=show_events_setting;
  if(show_events_setting){$("#"+gameid+"_events_section").css({"display":"block"});}
  else{$("#"+gameid+"_events_section").css({"display":"none"});}
  if($("#"+gameid+"_show_officials").is(":checked")&&show_events_setting){$("#"+gameid+"_show_officials").prop("checked",false);$("#"+gameid+"_show_officials").trigger("change");}
  adjustScrollbarColors();
});

$(document).on("change", ".show_officials_checkbox", function()
{
  let gameid = $(this).attr("gameid");
  let show_officials_setting = $(this).is(':checked');
  if(show_officials_setting){$("#"+gameid+"_officials_section").removeClass("d-none").addClass("d-flex");}
  else{$("#"+gameid+"_officials_section").removeClass("d-flex").addClass("d-none");}
  if($("#"+gameid+"_show_events").is(":checked")&&show_officials_setting){$("#"+gameid+"_show_events").prop("checked",false);$("#"+gameid+"_show_events").trigger("change");}
  adjustScrollbarColors();
});