function populateTournamentLinks()
{
  if(Object.keys(tournament_info.links).length !== 0 && tournament_info.links.constructor === Object)
  {
    var str = '<ul id="content_links">';
    var counter = 0;
    $.each(tournament_info.links, function(id, data)
    {
      counter++;
      str+='<li><a target="_blank" rel="noopener noreferrer" href="'+data.url+'">'+data.text+'</a></li>';
      console.log("Tournament Links", data);
    });
    if(counter)
    {
      str+='</ul>';
      $("#link_button").attr("data-content", str);
      $("#link_container").css({"display":"flex"});
      $("#filter_container").css({"display":"flex"});
      $("#link_button").popover();
    }
  }
  else
  {
    $("#content_links").css({"display":"none"});
  }
}