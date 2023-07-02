
if(getCookie("liveview_active_filters")!=null)
{
  filters_active=JSON.parse(getCookie("liveview_active_filters"));
}
$("#addCustomFilterButton").on("click", function()
{
  filters_active.push($("#customFilterInput").val());
  $("#customFilterInput").val("");
  updateFilterView();
});
$(document).on("click", ".filter.active", function()
{
  let filter = $(this).attr("data-filter");
  console.log(filter);
  let idx = filters_active.indexOf(filter);
  console.log(idx);
  if(idx>=0){filters_active.splice(idx,1);}
  updateFilterView();
});
$(document).on("click", ".filter.suggested", function()
{
  let filter = $(this).attr("data-filter");
  filters_active.push(filter);
  updateFilterView();
});
function updateFilterView()
{
  // active filters
  $("#active_filters_view").html("");
  for(var ii=0;ii<filters_active.length;ii++)
  {
    $("#active_filters_view").append('<span class="badge badge-success filter active cursor_pointer" data-filter="'+filters_active[ii]+'">'+filters_active[ii]+' <i class="fas fa-times-circle"></i></span> ');
  }
  if(filters_active.length==0){$("#active_filters_view").append('<span class="badge badge-info">No active filters</span>');}

  // suggested filters
  $("#suggested_filters_view").html("");
  let total_diff = 0;
  
  let diff = filters_suggested_pitches.filter(x => filters_active.indexOf(x) < 0 );
  total_diff+=diff.length;
  if(diff.length>0){$("#suggested_filters_view").append('<p>');}
  for(var ii=0;ii<diff.length;ii++){$("#suggested_filters_view").append('<span class="badge badge-dark filter suggested cursor_pointer" data-filter="'+diff[ii]+'">'+diff[ii]+'</span> ');}
  if(diff.length>0){$("#suggested_filters_view").append('</p>');}

  diff = filters_suggested_groups.filter(x => filters_active.indexOf(x) < 0 );
  total_diff+=diff.length;
  if(diff.length>0){$("#suggested_filters_view").append('<p>');}
  for(var ii=0;ii<diff.length;ii++){$("#suggested_filters_view").append('<span class="badge badge-dark filter suggested cursor_pointer" data-filter="'+diff[ii]+'">'+diff[ii]+'</span> ');}
  if(diff.length>0){$("#suggested_filters_view").append('</p>');}

  diff = filters_suggested_specifications.filter(x => filters_active.indexOf(x) < 0 );
  total_diff+=diff.length;
  if(diff.length>0){$("#suggested_filters_view").append('<p>');}
  for(var ii=0;ii<diff.length;ii++){$("#suggested_filters_view").append('<span class="badge badge-dark filter suggested cursor_pointer" data-filter="'+diff[ii]+'">'+diff[ii]+'</span> ');}
  if(diff.length>0){$("#suggested_filters_view").append('</p>');}

  diff = filters_suggested_teams.filter(x => filters_active.indexOf(x) < 0 );
  total_diff+=diff.length;
  if(diff.length>0){$("#suggested_filters_view").append('<p>');}
  for(var ii=0;ii<diff.length;ii++){$("#suggested_filters_view").append('<span class="badge badge-dark filter suggested cursor_pointer" data-filter="'+diff[ii]+'">'+diff[ii]+'</span> ');}
  if(diff.length>0){$("#suggested_filters_view").append('</p>');}

  if(total_diff==0){$("#suggested_filters_view").append('<span class="badge badge-info">There are no filter suggestions</span>');}
}

function updateFilterData()
{
  filter_indexterms = {};
  var local_filters_suggested_teams = [], local_filters_suggested_pitches = [], local_filters_suggested_specifications = [], local_filters_suggested_groups = []; local_filters_suggested_officials = [];
  $.each(game_infos, function(public_id, data)
  {
    let officials_names = [];
    if(data.officials)
    {
      for(var jj=0;jj<data.officials.length;jj++)
      {
        officials_names.push(data.officials[jj].firstname+' '+data.officials[jj].lastname);
      }
    }
    filter_indexterms[public_id] = data.teams.A.name+' '+data.teams.B.name+' '+(data.specification?data.specification:'')+' '+(data.pitch?data.pitch:'')+' '+(data.group?data.group:'')+' '+officials_names.join(' ');
    
    local_filters_suggested_teams.push(data.teams.A.name);
    local_filters_suggested_teams.push(data.teams.B.name);
    //if(data.specification)local_filters_suggested_specifications.push(data.specification);
    if(data.pitch)local_filters_suggested_pitches.push(data.pitch);
    if(data.group)local_filters_suggested_groups.push(data.group);
  });
  // make unique
  local_filters_suggested_teams = local_filters_suggested_teams.filter(function(item, i, ar){ return local_filters_suggested_teams.indexOf(item) === i; });
  local_filters_suggested_specifications = local_filters_suggested_specifications.filter(function(item, i, ar){ return local_filters_suggested_specifications.indexOf(item) === i; });
  local_filters_suggested_pitches = local_filters_suggested_pitches.filter(function(item, i, ar){ return local_filters_suggested_pitches.indexOf(item) === i; });
  local_filters_suggested_groups = local_filters_suggested_groups.filter(function(item, i, ar){ return local_filters_suggested_groups.indexOf(item) === i; });
  // sort
  local_filters_suggested_teams.sort();
  local_filters_suggested_specifications.sort();
  local_filters_suggested_pitches.sort();
  local_filters_suggested_groups.sort();
  // assign
  filters_suggested_pitches = local_filters_suggested_pitches;
  filters_suggested_specifications = local_filters_suggested_specifications;
  filters_suggested_groups = local_filters_suggested_groups;
  filters_suggested_teams = local_filters_suggested_teams;
  // 
  updateFilterView();
  applyFilters();
}
function updateNumberOfFiltersBadge()
{
  let number_of_filters = filters_active.length;
  $("#numberOfFilters").html(number_of_filters);
  if(number_of_filters==0){$("#numberOfFiltersBadge").hide();}
  else{$("#numberOfFiltersBadge").show();}
}
function applyFilters()
{
  // set cookie
  setCookie("liveview_active_filters",JSON.stringify(filters_active),30);
  // 
  var public_ids = Object.keys(filter_indexterms);
  var public_ids_display = [];
  if(filters_active.length>0)
  {
    $.each(filter_indexterms, function(public_id, indexterms)
    {
      for(var ii=0;ii<filters_active.length;ii++)
      {
        if(indexterms.includes(filters_active[ii]))
        {
          public_ids_display.push(public_id);
          break;
        } 
      }
    });
  }
  else
  {
    public_ids_display = public_ids;
  }
  //let public_ids_nodisplay = public_ids.filter(x => public_ids_display.indexOf(x)<0);
  //debugger;
  $(".game_container").removeClass("active");
  $(".game_container").addClass("inactive");
  //for(var ii=0;ii<public_ids_nodisplay.length;ii++){$("#"+public_ids_nodisplay[ii]+'_container').hide();}
  for(var ii=0;ii<public_ids_display.length;ii++){$("#"+public_ids_display[ii]+'_container').removeClass("inactive");$("#"+public_ids_display[ii]+'_container').addClass("active");}
  $(".game_container.active").css({"display":"block"});
  $(".game_container.inactive").css({"display":"none"});
  //debugger;
  // if there are no displayed games in a container for a day, hide the container as well
  $(".startday_container").each(function()
  {
    $(this).children().each(function()
    {
      if($(this).hasClass("startdaytime_container"))
      {
        let has_visible_games = false;
        $(this).children().each(function()
        {     
          if($(this).hasClass("game_container"))
          {
            if($(this).hasClass("active"))
            {
              //$(this).css({"background-color":"yellow"});
              has_visible_games = true;
              return false; // "break" statement for jquery "each"
            }
            else if($(this).hasClass("inactive"))
            {
              //$(this).css({"border-color":"blue"});
            }
          }
        });
        let id = $(this).attr("id");
        //debugger;
        if(!has_visible_games)
        {
          $(this).css({"display":"none"});
          //$(this).css({"background":"blue"});
          //debugger;
        }
        else
        {
          $(this).css({"display":"flex"});
        }
      }
      /*if($(this).hasClass("date_divider"))
      {
        if($(this).outerHeight()==$day_container.outerHeight()) // then, no games are displayed in this container
        {
          $day_container.hide();
        }
        return false; // "break" statement for jquery "each"
      }*/
    });
  });
  updateNumberOfFiltersBadge();
  adjustScrollbarColors();
}
$("#applyFiltersButton").on("click", function()
{
  $("#modalFilter").modal('hide');
  applyFilters();
});