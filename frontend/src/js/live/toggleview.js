$(document).on("click", ".komprimiert", function()
{
  let gameid = $(this).attr("gameid");
  ausfuehrlich[gameid]=true;
  $(this).css({"display":"none"});
  $("#"+gameid+"_ausfuehrlich").css({"display":"flex"});
  adjustScrollbarColors();
});
$(document).on("click", ".header_ausfuehrlich", function()
{
  let gameid = $(this).attr("gameid");
  ausfuehrlich[gameid]=false;
  $("#"+gameid+"_ausfuehrlich").css({"display":"none"});
  $("#"+gameid+"_komprimiert").css({"display":"flex"});
  adjustScrollbarColors();
});