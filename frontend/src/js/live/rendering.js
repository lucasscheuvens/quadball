function getGametime(game_info) { return getGameTimeAsString(false, getCurrentGameDuration(game_info.gametime.running, game_info.gametime.last_stop, game_info.gametime.last_start), null) }
function getCurrentGameDuration(running=false,last_stop=0,last_start=null){if(running){return last_stop+moment().valueOf()+diff_server_to_local-last_start;}else{return last_stop;}}
function getGameTimeStringFromDuration(game_duration=0){let duration = moment.duration(game_duration, 'ms');let minutes = duration.minutes();let seconds = duration.seconds();return (minutes<10?'0':'')+minutes+"'"+(seconds<10?'0':'')+seconds+'"';}
function getGameTimeAsString(running=false,last_stop=0,last_start=null) { return getGameTimeStringFromDuration(getCurrentGameDuration(running,last_stop,last_start)) }
function getScoreFromObject(game, team)
{
  let obj = game.score[team];
  let symbol = (game.score.A.snitch_caught || game.score.B.snitch_caught) ? (game.score[team].snitch_caught ? '*': '°') : '';
  return obj.total.toString()+'<span style="font-size:60%;margin-top:-12px;white-space:nowrap;">'+symbol+'</span>';
}

function getCorrectGametimeString(game_info) { if(game_info.data_available) { return getGameTimeAsString(game_info.gametime.running,game_info.gametime.last_stop,game_info.gametime.last_start) } return null; }

function detectRecentEnoughChanges(apply_changes_to_DOM = true)//this function needs to be called periodically, maybe every second
{
  if(load_complete)
  {
    let next_recent_enough_evaluation = {};
    let at_least_one_updated=false;
    for(let public_id in last_alive)
    {
      //console.log("LOOP: ", public_id);
      next_recent_enough_evaluation[public_id] = getRecentEnough(public_id);
      if(last_recent_enough_evaluation[public_id]!==next_recent_enough_evaluation[public_id] || next_recent_enough_evaluation[public_id])
      {
        if(apply_changes_to_DOM)
        {
          if(!game_infos[public_id].game_over)
          {
            if(next_recent_enough_evaluation[public_id])
            {
              $('.card-score-'+public_id+', .card-gametime-'+public_id).removeClass('connection_lost').addClass('live');
            }
            else
            {
              $('.card-score-'+public_id+', .card-gametime-'+public_id).removeClass('live').addClass('connection_lost');
            } 
          }
          else
          {
            $('.card-score-'+public_id+', .card-gametime-'+public_id).removeClass('live').removeClass('connection_lost');
          }        
          handleRunningClock(public_id);
        }
        at_least_one_updated=true;
      }
    }
    if(at_least_one_updated){last_recent_enough_evaluation=next_recent_enough_evaluation;}
  }
}
function getRecentEnough(public_id)
{
  if( last_alive[public_id] === undefined ) return false;
  try{ if( ( moment().valueOf() - last_alive[public_id] ) < 10000 ) { return true; } }
  catch(err) { return false; }
  return false;
}

function getPreparedGameHTML(game_info)
{
  let id = game_info.public_id;
  
  let score_A_string='';
  let score_B_string='';
  if(game_info.data_available)
  {
    score_A_string = getScoreFromObject(game_info,'A');
    score_B_string = getScoreFromObject(game_info,'B');
  }

  let ausfuehrlich_setting = ausfuehrlich[id]; // soll die ausfuehrliche oder die komprimierte Version angezeigt werden?

  let game_time = getCorrectGametimeString(game_info);

  let starttime = moment.unix(game_info.timestamp).format('hh:mm[&#8239;]a');

  let str = ''+
  '<div class="ausfuehrlich row justify-content-center" id="'+id+'_ausfuehrlich" gameid="'+id+'" '+(ausfuehrlich_setting?'':'style="display:none;"')+'>'+
    '<div style="width:100%;padding-left:15px;padding-right:15px;">'+
      '<div class="card">'+
        '<div id="'+id+'_card-container" class="card-container">'+
          '<div id="'+id+'_card-overlay" class="card-overlay header_ausfuehrlich cursor_pointer" gameid="'+id+'">'+
            '<div class="card-row" style="justify-content:flex-start;padding-bottom:20px;">'+
              '<div id="'+id+'_starttime" class="card-addinfo" '+(game_info.timestamp==null?'style="display:none"':'')+'>'+
                starttime+
              '</div>'+
              //if the following three lines are updated, the "handleDelay" function also needs to be updated!
              '<div id="'+id+'_delay" class="card-addinfo red" '+((game_info.delay==0||game_info.cancelled||game_info.suspended||(game_info.forfeit!=null)||(game_info.concede!=null))?'style="display:none"':'')+'>'+
                '<b>'+(game_info.delay<0?'-':'+')+game_info.delay+'min</b>'+
              '</div>'+
              '<div class="card-addinfo" '+((game_info.timestamp==null||(game_info.pitch==null&&game_info.specification==null&&game_info.group==null))?'style="display:none"':'')+'>'+
                '&nbsp;|&nbsp;'+
              '</div>'+
              '<div id="'+id+'_group" class="card-addinfo" '+(game_info.group==null?'style="display:none"':'')+'>'+
                game_info.group+
              '</div>'+
              '<div class="card-addinfo" '+((game_info.group==null||(game_info.pitch==null&&game_info.specification==null))?'style="display:none"':'')+'>'+
                '&nbsp;|&nbsp;'+
              '</div>'+
              '<div id="'+id+'_pitch" class="card-addinfo" '+(game_info.pitch==null?'style="display:none"':'')+'>'+
                game_info.pitch+
              '</div>'+
              '<div class="card-addinfo" '+((game_info.pitch==null||game_info.specification==null)?'style="display:none"':'')+'>'+
                '&nbsp;|&nbsp;'+
              '</div>'+
              '<div id="'+id+'_gamename" class="card-addinfo" '+(game_info.specification==null?'style="display:none"':'')+'>'+
                game_info.specification+
              '</div>'+
              '<div id="'+id+'_gametime" class="card-gametime card-gametime-'+id+' '+(game_info.data_available?(!game_info.game_over?(getRecentEnough(id)?'live':'connection_lost'):''):'')+'" '+((!game_info.data_available||game_info.cancelled||game_info.suspended)?'style="display:none"':'')+'>'+
                '<div style="display:inline-block;" id="'+id+'_gametimesymbol">'+(game_info.data_available?(game_info.game_over?'FT':(game_info.gametime.running?'<i class="fas fa-lg fa-play"></i>':'<i class="fas fa-lg fa-pause"></i>')):'')+'</div>&nbsp;&nbsp;<span id="'+id+'_gametimeraw">'+game_time+'</span>'+
              '</div>'+
            '</div>'+
            '<div class="card-row" style="margin-bottom:10px;">'+
                (game_info.teams.A.logo=='default.svg'?'<div class="card-jerseycontainer A"><img id="'+id+'_jerseyA" src="src/svg/jerseys/'+game_info.teams.A.jersey+'.svg" class="card-jersey A"></div>':'<div class="card-logocontainer A"><img id="'+id+'_logoA" src="src/img/logo/'+game_info.teams.A.logo+'" class="card-logo A"></div>')+
              '<div id="'+id+'_score" class="card-score card-score-'+id+' '+(game_info.data_available?(!game_info.game_over?(getRecentEnough(id)?'live':'connection_lost'):''):'')+'" '+((!game_info.data_available||game_info.cancelled||game_info.suspended||(game_info.forfeit!=null)||(game_info.concede!=null))?'style="display:none"':'')+'>'+
                '<div id="'+id+'_scoreA_ausfuehrlich" class="card-score A" gameid="'+id+'">'+
                  score_A_string+
                '</div>'+
                '<div id="'+id+'_scoredash" style="display:flex;margin:0px 5px;align-items:center;">'+
                  '-'+
                '</div>'+
                '<div id="'+id+'_scoreB_ausfuehrlich" class="card-score B" gameid="'+id+'">'+
                  score_B_string+
                '</div>'+
                '<div class="card-live-info" style="display:'+(game_info.data_available?(!game_info.game_over?(getRecentEnough(id)?'none':'inline'):'none'):'none')+'">'+
                  'connection lost ...'+
                '</div>'+
                '<div class="card-live-info" style="display:'+(game_info.data_available?(!game_info.game_over?(getRecentEnough(id)?'inline':'none'):'none'):'none')+'">'+
                  'live'+
                '</div>'+
                '<div class="card-target-score-info" gameid="'+id+'" style="display:'+(game_info.data_available?(game_info.in_overtime?'inline':'none'):'none')+'">'+
                  getTargetScore(game_info)+
                '</div>'+
              '</div>'+
              '<div id="'+id+'_vs" class="card-vs" '+((game_info.data_available||game_info.cancelled||game_info.suspended)?'style="display:none"':'')+'>'+
                'vs'+
              '</div>'+
              '<div id="'+id+'_cancelled" class="card-cancelled" '+(!game_info.cancelled?'style="display:none"':'')+'>'+
                '<div class="badge badge-danger" style="text-align:center;">cancelled'+(game_info.cancelled_reason?'<br><span style="font-size:70%;">'+game_info.cancelled_reason+'</span>':'')+'</div>'+
              '</div>'+
              '<div id="'+id+'_suspended" class="card-suspended" '+(!game_info.suspended?'style="display:none"':'')+'>'+
                '<div class="badge badge-info" style="text-align:center;">suspended'+(game_info.suspended_reason?'<br><span style="font-size:70%;">'+game_info.suspended_reason+'</span>':'')+'</div>'+
              '</div>'+
              '<div id="'+id+'_forfeited" class="card-forfeited" '+(game_info.forfeit==null?'style="display:none"':'')+'>'+
                '<div class="badge badge-light" style="text-align:center;">'+(game_info.forfeit==null?'':(game_info.teams[game_info.forfeit].shortname+' forfeited'))+'</div>'+
              '</div>'+
              '<div id="'+id+'_conceded" class="card-conceded" '+(game_info.concede==null?'style="display:none"':'')+'>'+
                '<div class="badge badge-light" style="text-align:center;">'+(game_info.concede==null?'':(game_info.teams[game_info.concede].shortname+' conceded'))+'</div>'+
              '</div>'+
              (game_info.teams.B.logo=='default.svg'?'<div class="card-jerseycontainer B"><img id="'+id+'_jerseyB" src="src/svg/jerseys/'+game_info.teams.B.jersey+'.svg" class="card-jersey B"></div>':'<div class="card-logocontainer B"><img id="'+id+'_logoB" src="src/img/logo/'+game_info.teams.B.logo+'" class="card-logo B"></div>')+
            '</div>'+
            '<div class="card-row">'+
              '<div id="'+id+'_team_A_name" class="card-teamname A">'+
                '<img src="src/svg/jerseys/'+game_info.teams.A.jersey+'.svg" style="height:1rem;">&nbsp;'+game_info.teams.A.name+
              '</div>'+
              '<div id="'+id+'_team_B_name" class="card-teamname B">'+
                game_info.teams.B.name+'&nbsp;<img src="src/svg/jerseys/'+game_info.teams.B.jersey+'.svg" style="height:1rem;">'+
              '</div>'+
            '</div>'+
          '</div>'+
          '<div class="w-100" '+((!game_info.data_available&&game_info.officials.length==0)?'style="display:none;"':'')+'>'+
            '<div id="'+id+'_divider" class="divider card-divider"></div>'+
            '<div class="card-collapse mt-2" style="justify-content:space-between;">'+
              (game_info.officials.length==0?'<div class="d-flex"></div>':(''+
              '<div style="display:flex;align-items:center;">'+
                '<div style="display:flex;align-items:center;margin-right:5px;">'+
                  '<input type="checkbox" gameid="'+id+'" class="material_checkbox sm show_officials_checkbox" id="'+id+'_show_officials" style="display:none;">'+
                  '<label for="'+id+'_show_officials" class="toggle"><span></span></label>'+
                '</div>'+
                '<div class="d-flex">Show officials</div>'+
              '</div>'))+
              '<div style="align-items:center;display:'+(!game_info.data_available?'none':'flex')+';">'+
                '<div class="d-flex">Show game events</div>'+
                '<div style="display:flex;align-items:center;margin-left:5px;">'+
                  '<input type="checkbox" gameid="'+id+'" class="material_checkbox sm show_events_checkbox" id="'+id+'_show_events" style="display:none" '+(show_events[id]?'checked':'')+'>'+
                  '<label for="'+id+'_show_events" class="toggle"><span></span></label>'+
                '</div>'+
              '</div>'+
            '</div>'+
          '</div>'+
          '<div id="'+id+'_events_container">'+
            fillEventsContainer(id)+
          '</div>'+
          '<div id="'+id+'_officials_container">'+
            fillOfficialsContainer(id)+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>'+
  '<div class="komprimiert row justify-content-center cursor_pointer"  id="'+id+'_komprimiert" gameid="'+id+'" '+(ausfuehrlich_setting?'style="display:none;"':'')+'>'+
    '<div class="col-12">'+
      '<div class="card compressed">'+
        '<div id="'+id+'_card-container" class="card-container">'+
          '<div id="'+id+'_card-overlay" class="card-overlay">'+
            '<div class="card-row compressed">'+
              '<div class="card-logocontainer compressed A">'+
                '<img id="'+id+'_compressed_logoA" src="src/img/logo/'+game_info.teams.A.logo+'" class="card-logo compressed A">'+
              '</div>'+
              '<div id="'+id+'_team_A_name" class="card-teamname A">'+
                game_info.teams.A.shortname+
              '</div>'+
              '<div id="'+id+'_score" class="card-score card-score-'+id+' '+(game_info.data_available?(!game_info.game_over?(getRecentEnough(id)?'live':'connection_lost'):''):'')+'" '+((!game_info.data_available||game_info.cancelled||game_info.suspended||(game_info.forfeit!=null)||(game_info.concede!=null))?'style="display:none"':'')+'>'+
                '<div id="'+id+'_scoreA_compressed" class="card-score compressed A" gameid="'+id+'">'+
                  score_A_string+
                '</div>'+
                '<div id="'+id+'_scoredash" style="display:flex;margin:0px 5px;align-items:center;">'+
                  '-'+
                '</div>'+
                '<div id="'+id+'_scoreB_compressed" class="card-score compressed B" gameid="'+id+'">'+
                  score_B_string+
                '</div>'+
              '</div>'+
              '<div id="'+id+'_vs" class="card-vs" '+((game_info.data_available||game_info.cancelled||game_info.suspended||(game_info.forfeit!=null)||(game_info.concede!=null))?'style="display:none"':'')+'>'+
                'vs'+
              '</div>'+
              '<div id="'+id+'_cancelled" class="card-cancelled" '+(!game_info.cancelled?'style="display:none"':'')+'>'+
                '<div class="badge badge-danger" style="text-align:center;">cancelled'+(game_info.cancelled_reason?'<br><span style="font-size:70%;">'+game_info.cancelled_reason+'</span>':'')+'</div>'+
              '</div>'+
              '<div id="'+id+'_suspended" class="card-suspended" '+(!game_info.suspended?'style="display:none"':'')+'>'+
                '<div class="badge badge-info" style="text-align:center;">suspended'+(game_info.suspended_reason?'<br><span style="font-size:70%;">'+game_info.suspended_reason+'</span>':'')+'</div>'+
              '</div>'+
              '<div id="'+id+'_forfeited" class="card-forfeited" '+(game_info.forfeit==null?'style="display:none"':'')+'>'+
                '<div class="badge badge-light" style="text-align:center;">'+(game_info.forfeit==null?'':(game_info.teams[game_info.forfeit].shortname+' forfeited'))+'</div>'+
              '</div>'+
              '<div id="'+id+'_conceded" class="card-conceded" '+(game_info.concede==null?'style="display:none"':'')+'>'+
                '<div class="badge badge-light" style="text-align:center;">'+(game_info.concede==null?'':(game_info.teams[game_info.concede].shortname+' conceded'))+'</div>'+
              '</div>'+
              '<div id="'+id+'_team_B_name" class="card-teamname B">'+
                game_info.teams.B.shortname+
              '</div>'+
              '<div class="card-logocontainer compressed B">'+
                '<img id="'+id+'_compressed_logoB" src="src/img/logo/'+game_info.teams.B.logo+'" class="card-logo compressed B">'+
              '</div>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>';
  return str;
}

function createEventList(public_id)
{
  if(public_id in game_infos)
  {
    let game_info = game_infos[public_id];
    let event_list = [];
    //let event_names = ['score','timeout','snitch','penalty'];
    if('events' in game_info)
    {
      for(event_name in game_info.events)
      {
        let event_objects = game_info.events[event_name];
        for(var ii in event_objects)
        {
          let event_obj = event_objects[ii];
          if(event_name=='score')
          {
            event_list.push({name:'score',team:event_obj.team,period:event_obj.period,gametime:event_obj.gametime,player_number:event_obj.player_number,player_name:event_obj.player_name,increment:null,sort_on_tie:'B',score_string:null});
          }
          else if(event_name=='timeout')
          {
            event_list.push({name:'timeout',team:event_obj.team,period:event_obj.period,gametime:event_obj.gametime,player_number:null,player_name:null,increment:null,sort_on_tie:'C',score_string:null});
          }
          else if(event_name=='snitch')
          {
            event_list.push({name:'snitch',team:event_obj.team,period:event_obj.period,gametime:event_obj.gametime,player_number:event_obj.player_number,player_name:event_obj.player_name,increment:null,sort_on_tie:'Z',score_string:null});
          }
          else if(event_name=='snitch_under_review')
          {
            event_list.push({name:'snitch_under_review',team:event_obj.team,period:event_obj.period,gametime:event_obj.gametime,player_number:event_obj.player_number,player_name:event_obj.player_name,increment:null,sort_on_tie:'Z',score_string:null});
          }
          else if(event_name=='penalty')
          {
            event_list.push({name:'penalty_'+event_obj.color,team:event_obj.team,period:event_obj.period,gametime:event_obj.gametime,player_number:event_obj.player_number,player_name:event_obj.player_name,increment:event_obj.increment,sort_on_tie:'A',score_string:null});
          }
        }
        // structure of event_list
        // 0 --> event_name
        // 1 --> team
        // 2 --> period
        // 3 --> gametime
        // 4 --> player_number
        // 5 --> player_name
        // 6 --> increment
        // 7 --> 'A' (penalty), 'B' (score), 'C' (timeout), 'Z' (snitch) (for sorting purposes by event_name)
        // 8 --> score string at the time of the event (initialized with null)
      }
      event_list.sort(sortingEvents);
      // create score strings for every event
      let sA=0,sB=0;
      for(let ii=0;ii<event_list.length;ii++)
      {
        if(event_list[ii].name=='score')
        {
          if(event_list[ii].team=='A'){sA+=10;}
          else if(event_list[ii].team=='B'){sB+=10;}
        }
        else if(event_list[ii].name=='snitch'&&tournament_info)
        {
          if(event_list[ii].team=='A'){sA+=tournament_info.snitch_points;}
          else if(event_list[ii].team=='B'){sB+=tournament_info.snitch_points;}
        }
        event_list[ii].score_string = sA+' - '+sB;
      } 
      return event_list;
    }
  }
  return [];
}
function sortingEvents(a, b)
{
  if(a.gametime===b.gametime)
  {
    if(a.sort_on_tie===b.sort_on_tie)
    {
      if(a.increment===b.increment)
      {
        if(a.team===b.team)
        {
          return 0;
        }
        else
        {
          return(a.team<b.team)?-1:1;
        }
      }
      else
      {
        return(a.increment<b.increment)?-1:1;
      }
    }
    else
    {
      return(a.sort_on_tie<b.sort_on_tie)?-1:1;
    }
  }
  else
  {
    return(a.gametime<b.gametime)?-1:1;
  }
}

function fillEventsContainer(public_id)
{
  let game_info = game_infos[public_id];
  let event_list = createEventList(public_id);
  let show_events_setting = show_events[public_id];
  let str = '';
  if(game_info.data_available&&!game_info.cancelled)
  {
    str += ''+
    '<div class="pt-2" id="'+public_id+'_events_section" style="display:'+(!game_info.data_available?'none':(show_events_setting?'block':'none'))+';">'+
      (event_list.length==0?'<div style="display:flex;flex:1;justify-content:flex-end;font-size:80%;font-family:\'Open Sans Condensed\';color:#757575;"><i>No game events'+(game_info.game_over?'':' yet')+'.</i></div>':'');
      for(var jj=0;jj<event_list.length;jj++)
      {
        let cont = ''+
        '<div class="event_description">'+
          '<div class="event_text">'+
            (event_list[jj].name=='snitch_under_review'?'<i>under review...</i>':('<span style="font-weight:bold;">'+(event_list[jj].player_name?event_list[jj].player_name:'')+'</span>'+(event_list[jj].player_number?(' #'+event_list[jj].player_number):'')))+
          '</div>'+
        '</div>'+
        '<img src="src/svg/'+(event_list[jj].name=='snitch'?'ic_snitch_pressed_square':(event_list[jj].name=='snitch_under_review'?'ic_snitch_normal_square':(event_list[jj].name=='score'?'ic_goal':(event_list[jj].name=='timeout'?'ic_timeout_white':(event_list[jj].name=='penalty_blue'?'ic_card-blue':(event_list[jj].name=='penalty_yellow'?'ic_card-yellow':(event_list[jj].name=='penalty_yellowejection'?'ic_card-yellowejection':(event_list[jj].name=='penalty_red'?'ic_card-red':(event_list[jj].name=='penalty_ejection'?'ic_card-ejection':'')))))))))+'.svg" class="event_symbol '+(event_list[jj].name=='snitch'?'snitch':'')+'"/>';
        str+=''+
          '<div class="card-row">'+
              '<div class="event A">'+(event_list[jj].team=='A'?cont:'')+'</div>'+
              '<div class="event center event_time" style="font-size:60%;display:flex;flex-flow:column;align-items:center;">'+
                '<div style="display:flex;">@'+getGameTimeStringFromDuration(event_list[jj].gametime)+'</div>'+
                '<div style="display:flex;margin-top:-20%;">'+event_list[jj].score_string+'</div>'+
              '</div>'+
              '<div class="event B">'+(event_list[jj].team=='B'?cont:'')+'</div>'+
          '</div>';
      }
      str+=''+
    '</div>';
  }
  return str;
}
function fillOfficialsContainer(public_id) {
  let game_info = game_infos[public_id];
  let str = '';
  if(game_info.officials.length>0) {
    str += ''+
    '<div id="'+public_id+'_officials_section" class="d-none pt-2 justify-content-center" style="font-size:70%;">'+
      '<table>';
      let last_jobid = -1;
      for(var jj=0;jj<game_info.officials.length;jj++)
      {
        let affil = '';
        if(game_info.officials[jj].affiliations_direct.length>0)
        {
          let affil_array = [];
          for(var kk=0;kk<game_info.officials[jj].affiliations_direct.length;kk++)
          {
            if(game_info.officials[jj].affiliations_direct[kk] in team_id_to_name)
            {
              if(team_id_to_name.hasOwnProperty(game_info.officials[jj].affiliations_direct[kk]))
              {
                affil_array.push(team_id_to_name[game_info.officials[jj].affiliations_direct[kk]]);
              }
            }
          }
          affil = ' ('+affil_array.join(', ')+')';
        }
        str += ''+
        '<tr>'+
          '<td class="pr-2">'+
            (last_jobid!=game_info.officials[jj].jobid?'<strong>'+game_info.officials[jj].jobname+':</strong>':'')+
          '</td>'+
          '<td>'+
            game_info.officials[jj].publicname+affil
          '</td>'+
        '</tr>';
        last_jobid = game_info.officials[jj].jobid; 
      }
      str+=''+
      '</table>'+
    '</div>';
  }
  return str;
}

function initialLayout() {
  console.log(getCurrentTime(), 'Initial layout called.');
  document.getElementById('content_games').innerHTML = '';

  for(public_game_id in game_infos) {
    if(game_infos.hasOwnProperty(public_game_id)) {
      var key3 = game_infos[public_game_id].pitch?game_infos[public_game_id].pitch:"ZZZ"+game_infos[public_game_id].public_id; // the "ZZZ" is for sorting purposes (to the very bottom)
      var m_start = moment.unix(game_infos[public_game_id].timestamp).tz(tournament_info.timezone);
      var start_day = m_start.format("YYYY-MM-DD");
      var start_daytime = m_start.format("YYYY-MM-DD-HH-mm-ss");
      var start_day_human_format = m_start.format("DD. MMM");
      var start_time = m_start.format("HH-mm-ss");
      var start_time_human_format = m_start.format("hh:mm[&#8239;]a");
      sorting_array.push([game_infos[public_game_id].public_id,start_day,start_time,key3,start_time_human_format]);
    }
  }
  sorting_array.sort(sortingGameInfos);

  // If the tournament has many games on a single day, the logic should rather be two levels down, i.e., also grouped by the time of the day
  let is_complex = isComplexTournament(sorting_array);

  let fragment = document.createDocumentFragment();
  for(var ii=0; ii<sorting_array.length; ii++)
  {
    $("#creating_layout_progress").html(parseInt(ii/sorting_array.length*100).toString()+'%');

    var public_game_id = sorting_array[ii][0];
    var start_time_human_format = sorting_array[ii][4];
    //current 
    var current_date = sorting_array[ii][1];
    var current_datetime = sorting_array[ii][2];
    //previous
    if(ii!=0){var previous_date = sorting_array[ii-1][1];var previous_datetime = sorting_array[ii-1][2];}
    else{var previous_date = null;var previous_datetime = null;}
    //next
    if(ii!=sorting_array.length-1){var next_date = sorting_array[ii+1][1];var next_datetime = sorting_array[ii+1][2];}
    else{var next_date = null;var next_datetime = null;}

    let same_date_as_previous = current_date===previous_date;
    let same_datetime_as_previous = same_date_as_previous&&(current_datetime===previous_datetime);
    let same_date_as_next = current_date===next_date;
    let same_datetime_as_next = same_date_as_next&&(current_datetime===next_datetime);

    if(!same_date_as_previous)
    {
      var startday_container = document.createElement('div');
      startday_container.className = 'startday_container';
      startday_container.id = current_date+'_container';
      var date_divider = document.createElement('div');
      date_divider.className = 'date_divider'+(is_complex?' two_levels':'');
      date_divider.style.cssText = 'display:none;';
      startday_container.appendChild(date_divider);
    }
    if(!same_datetime_as_previous)
    {
      var startdaytime_container = document.createElement('div');
      startdaytime_container.className = 'startdaytime_container';
      startdaytime_container.id = current_date+'-'+current_datetime+'_container';
      var datetime_divider = document.createElement('div');
      datetime_divider.className = 'datetime_divider'+(is_complex?' two_levels':'');
      datetime_divider.innerHTML = '<span style="font-size:80%;color:#666;">'+start_time_human_format+'</span><div class="divider"></div>';
      startdaytime_container.appendChild(datetime_divider);
    }
    var game_container = document.createElement('div');
    game_container.className = 'game_container';
    game_container.id = public_game_id+'_container';
    game_container.setAttribute('gameid', public_game_id);
    game_container.innerHTML = getPreparedGameHTML(game_infos[public_game_id]);
    startdaytime_container.appendChild(game_container);

    if(!same_datetime_as_next){startday_container.appendChild(startdaytime_container);}
    if(!same_date_as_next){fragment.appendChild(startday_container);}
  }
  $("#creating_layout_progress").html('<i class="fas fa-check"></i>');

  document.getElementById('content_games').appendChild(fragment);
  
  for(let ii=0; ii<sorting_array.length; ii++)
  {
    let public_game_id = sorting_array[ii][0];
    handleRunningClock(public_game_id);
  }
  updateFilterData();
  createActiveDayButtons();
  selectDefaultActiveDay();

  $('#content_games').css({'display':'flex'});

  $('#receiving_information').remove();
  $('#creating_layout').remove();
  $('#loading_page').addClass('d-none');
  adjustScrollbarColors();
}
function createNewContainer( public_game_id )
{
  game_info = game_infos[public_game_id];

  // delete current containers of game
  if( $("#"+game_info.public_id+"_container").length ) {
    let delete_parent_daytime_container=false;
    let delete_parent_day_container=false;
    //console.log($("#"+game_info.public_id+"_container").parent().children().length);
    if($("#"+game_info.public_id+"_container").parent().children().length==2){delete_parent_daytime_container=true;}; // 2 because of the datetime_divider at the beginning of each day row plus the element itself
    if($("#"+game_info.public_id+"_container").parent().parent().children().length==2){delete_parent_day_container=delete_parent_daytime_container&&true;}; // 2 because of the date_divider at the beginning of each day row plus the element itself
    console.log("DELETE DAYTIME PARENT?", delete_parent_daytime_container);
    const $parent_daytime_container = $("#"+game_info.public_id+"_container").parent();
    const $parent_day_container = $("#"+game_info.public_id+"_container").parent().parent();
    $("#"+game_info.public_id+"_container").remove();
    if( delete_parent_daytime_container ) { $parent_daytime_container.remove(); }
    if( delete_parent_day_container ) { $parent_day_container.remove(); }

    // delete the old info from sorting_array
    let n = null;
    for(let ii=0; ii<sorting_array.length; ii++) { if( game_info.public_id == sorting_array[ii][0] ) { n = ii; break; } }
    if( n != null ){ sorting_array.splice( n, 1 ); }
  }

  
  let key3 = game_info.pitch ? game_info.pitch : "ZZZ"+game_info.public_id; // the "ZZZ" is for sorting purposes (to the very bottom)
  let m_start = moment.unix(game_info.timestamp).tz(tournament_info.timezone);
  let start_day = m_start.format("YYYY-MM-DD");
  let start_daytime = m_start.format("YYYY-MM-DD-HH-mm-ss");
  let start_day_human_format = m_start.format("DD. MMM");
  let start_time = m_start.format("HH-mm-ss");
  let start_time_human_format = m_start.format("hh:mm[&#8239;]a");
  sorting_array.push( [ game_info.public_id, start_day, start_time, key3, start_time_human_format ] );
  sorting_array.sort( sortingGameInfos );

  // create the content container for the day
  if( !$("#"+start_day+"_container").length ) {
    let n;
    let previous_start_date = undefined;
    let following_start_date = undefined;
    let new_day_container_string = '<div id="'+start_day+'_container" class="startday_container" style="display:flex;flex-flow:column;align-items:center;"><div class="date_divider" style="display:none;"><span style="font-size:80%;color:#666;">'+start_day_human_format+'</span><div class="divider"></div></div></div>';
    for(let ii=0;ii<sorting_array.length;ii++){if(game_info.public_id==sorting_array[ii][0]){n=ii;break;}}
    while(true)
    {
      // insert container after the last one
      for(let ii=n-1;ii>=0;ii--){if(start_day!=sorting_array[ii][1]){previous_start_date=sorting_array[ii][1];break;}}
      if(previous_start_date){$("#"+previous_start_date+"_container").after(new_day_container_string);break;}
      // if insertion after last one didn't work (e.g., because there is no container before), insert before
      for(let ii=n+1;ii<sorting_array.length;ii++){if(start_day!=sorting_array[ii][1]){following_start_date=sorting_array[ii][1];break;}}
      if(following_start_date){$("#"+following_start_date+"_container").before(new_day_container_string);break;}
      // if insertion after and before didn't work (e.g., because there is none), insert at very end
      $("#content_games").append(new_day_container_string);
      break;
    }
  }

  // create the content container for the day
  if( !$("#"+start_daytime+"_container").length ) {
    let sorting_array_same_day = [];
    let n;
    let new_daytime_container_string = '<div id="'+start_daytime+'_container" class="startdaytime_container" style="display:flex;flex-flow:column;align-items:center;width:100%;"><div class="datetime_divider"><span style="font-size:80%;color:#666;">'+start_time_human_format+'</span><div class="divider"></div></div></div>';
    for(let ii=0;ii<sorting_array.length;ii++){if(start_day==sorting_array[ii][1]){sorting_array_same_day.push(sorting_array[ii]);}}
    for(let ii=0;ii<sorting_array_same_day.length;ii++){if(game_info.public_id==sorting_array_same_day[ii][0]){n=ii;break;}}
    if(n>0){$("#"+sorting_array_same_day[n-1][1]+"-"+sorting_array_same_day[n-1][2]+"_container").after(new_daytime_container_string);}
    else if(n==0){$("#"+start_day+"_container").append(new_daytime_container_string);}
  }

  // create the content container for the game
  if( !$("#"+game_info.public_id+"_container").length ) {
    let sorting_array_same_daytime = [];
    let n;
    let new_game_container_string = '<div id="'+game_info.public_id+'_container" class="game_container" style="width:100%;padding-left:15px;padding-right:15px;" gameid="'+game_info.public_id+'"></div>';
    for(let ii=0;ii<sorting_array.length;ii++){if(start_day==sorting_array[ii][1]&&start_time==sorting_array[ii][2]){sorting_array_same_daytime.push(sorting_array[ii]);}}
    for(let ii=0;ii<sorting_array_same_daytime.length;ii++){if(game_info.public_id==sorting_array_same_daytime[ii][0]){n=ii;break;}}
    if(n>0){$("#"+sorting_array_same_daytime[n-1][0]+"_container").after(new_game_container_string);}
    else if(n==0){$("#"+start_daytime+"_container").prepend(new_game_container_string);}
  }
  // populate with grey rectangles
  //debugger;
  let comp = isComplexTournament(sorting_array);
  // If the tournament has many games on a single day, the logic should rather be two levels down, i.e., also grouped by the time of the day
  if(comp)
  {
    $(".date_divider").addClass("two_levels");
    $(".datetime_divider").addClass("two_levels");
  }
  else
  {
    $(".date_divider").removeClass("two_levels");
    $(".datetime_divider").removeClass("two_levels");
  }
}
function sortingGameInfos(a, b){if(a[1]===b[1]){if(a[2]===b[2]){if(a[3]===b[3]){return 0;}else{return(a[3]<b[3])?-1:1;}}else{return(a[2]<b[2])?-1:1;}}else{return(a[1]<b[1])?-1:1;}}

function createActiveDayButtons()
{
  let $adc = $("#active_day_container");
  $adc.html("");
  let unique_machine_dates = [];
  let unique_dates = [];
  for(var public_id in game_infos)
  {
    if(game_infos.hasOwnProperty(public_id))
    {
      if(game_infos[public_id].timestamp)
      {
        let day_machine = moment.unix(game_infos[public_id].timestamp).format('YYYY-MM-DD');
        let day_human = moment.unix(game_infos[public_id].timestamp).format('DD. MMM');
        if(unique_machine_dates.indexOf(day_machine)===-1)
        {
          unique_machine_dates.push(day_machine);
          unique_dates.push([day_machine, day_human]);
        }
      }
    }
  }
  let sorted_dates = unique_dates.sort(sortingActiveDays);
  for(var ii=0;ii<sorted_dates.length;ii++){$adc.append('<button class="btn btn-sm btn-outline-dark active_day_button" id="active_day_button_'+sorted_dates[ii][0]+'" day="'+sorted_dates[ii][0]+'" style="margin-right:3px;margin-bottom:3px;">'+sorted_dates[ii][1]+'</button>');}
}
$(document).on("click",".active_day_button",function()
{
  let day=$(this).attr("day");
  applyFilters();
  selectActiveDay(day);
});

function sortingActiveDays(a, b)
  {
    if(a[0]===b[0])
    {
      return 0;
    }
    else
    {
      return(a[0]<b[0])?-1:1;
    }
  }
function selectDefaultActiveDay()
{
  let dates = [];
  $(".active_day_button").each(function(){dates.push($(this).attr("day"));});
  dates = dates.sort();
  let today = moment(moment().format("YYYY-MM-DD"),"YYYY-MM-DD");
  let idx=0;
  if(dates.length==1){idx=0;}
  else
  {
    for(var ii=0;ii<dates.length-1;ii++)
    {
      let diff_to_ii = moment(dates[ii],"YYYY-MM-DD").diff(today,"days");
      let diff_to_ii_plus_1 = moment(dates[ii+1],"YYYY-MM-DD").diff(today,"days");
      if(diff_to_ii==0){idx=ii;break;}
      else if(diff_to_ii_plus_1==0){idx=ii+1;break;}
      else if(diff_to_ii<0 && diff_to_ii_plus_1<0 && diff_to_ii<diff_to_ii_plus_1){idx=ii+1;}
      else if(diff_to_ii<0 && diff_to_ii_plus_1>0 && Math.abs(diff_to_ii)>Math.abs(diff_to_ii_plus_1)){idx=ii+1;break;}
      else if(diff_to_ii<0 && diff_to_ii_plus_1>0 && Math.abs(diff_to_ii)<=Math.abs(diff_to_ii_plus_1)){idx=ii;break;}
      else if(diff_to_ii>0 && diff_to_ii_plus_1>0){idx=ii;break;}
    }
  }
  selectActiveDay(dates[idx]);
}

function selectActiveDay(date)
{
  $(".startday_container").removeClass("active");
  $(".startday_container").addClass("inactive");
  $(".active_day_button").each(function()
  {
    if($(this).attr("day")==date)
    {
      $(this).addClass("btn-dark");
      $(this).removeClass("btn-outline-dark");
      $("#"+date+"_container").removeClass("inactive");
      $("#"+date+"_container").addClass("active");
      active_date = date;
    }
    else
    {
      $(this).addClass("btn-outline-dark");
      $(this).removeClass("btn-dark");
    }
  });
  $(".startday_container.inactive").css({"display":"none"});
  $(".startday_container.active").css({"display":"flex"});
  adjustScrollbarColors();
}
function isHidden(el){return(el.offsetParent===null)}
function countOccurences(dataset)
{
  var counts = {}, i, value;
  for (i = 0; i < dataset.length; i++) {
      value = dataset[i];
      if (typeof counts[value] === "undefined") {
          counts[value] = 1;
      } else {
          counts[value]++;
      }
  }
  return counts;
}
function isComplexTournament(sorting_array)
{
  var all_days = [];
  for(var ii=0;ii<sorting_array.length;ii++){all_days.push(sorting_array[ii][1]);}
  let counts=countOccurences(all_days);
  for(var day in counts){if(counts.hasOwnProperty(day)){if(counts[day]>10){return true;}}}
  return false;
}

function populateSingleGame(public_id)
{
  console.log("POPULATING SINGLE: ", game_infos[public_id]);
  $("#error_message_container").append("POPULATING SINGLE: "+public_id+"<br>");
  $("#loading_progress_container").hide();
  if(!(public_id in show_events))show_events[public_id] = false;
  if(!(public_id in ausfuehrlich))ausfuehrlich[public_id] = false;
  $("#"+public_id+"_container").html(getPreparedGameHTML(game_infos[public_id]));
  adjustScrollbarColors();
}
function setLoadingPercentage(percentage_loaded)
{
  //if(percentage_loaded>0&&percentage_loaded<=100){debugger;console.log(percentage_loaded);document.getElementById('creating_layout_progress').className = 'c100 p'+parseInt(percentage_loaded).toString()+' quadballlive';}
  /*let percentage_string = percentage_loaded.toString()+"%";
  let $loading_progress = $("#loading_progress");

  $loading_progress.attr("aria-valuenow",percentage_loaded.toString());
  $loading_progress.css({"width":percentage_string});
  $loading_progress.html(percentage_string);*/
}
function handleRunningClock(public_id)
{
  try
  {
    // delete interval
    if(running_clocks[public_id]!==undefined){ clearInterval(running_clocks[public_id]) }
    if(!getRecentEnough(public_id)){ clearInterval(running_clocks[public_id]) }
    running_clocks[public_id] = null;
    // create new interval if game is running
    if(game_infos[public_id].data_available)
    {
      if(game_infos[public_id].gametime.running && getRecentEnough(public_id))
      {
        running_clocks[public_id] = setInterval(function(){$('#'+public_id+'_gametimeraw').html(getCorrectGametimeString(game_infos[public_id]));}, 200);
      }
    }
  }
  catch(err)
  {
    console.log("THERE HAS BEEN AN ERROR IN handleRunningClock(). public_id: ", public_id);
    $("#error_message_container").append("THERE HAS BEEN AN ERROR IN handleRunningClock(). public_id: "+public_id);
  }
}

function handleScore(public_id)
{
  try
  {
    let score_A_string='';
    let score_B_string='';
    if(game_infos[public_id].data_available)
    {
      score_A_string = getScoreFromObject(game_infos[public_id],'A');
      score_B_string = getScoreFromObject(game_infos[public_id],'B');
      if(game_infos[public_id].in_overtime)
      {
        $('.card-target-score-info[gameid="'+public_id+'"]').css({"display":"inline"}).html(getTargetScore(game_infos[public_id]));
      }
      else
      {
        $('.card-target-score-info[gameid="'+public_id+'"]').css({"display":"none"});
      }
    }
    $('.card-score.A[gameid="'+public_id+'"]').html(score_A_string);
    $('.card-score.B[gameid="'+public_id+'"]').html(score_B_string);
  }
  catch(err)
  {
    console.log("THERE HAS BEEN AN ERROR IN handleScore(). public_id: ", public_id);
    $("#error_message_container").append("THERE HAS BEEN AN ERROR IN handleScore(). public_id: "+public_id);
  }
}
function getTargetScore(game_info)
{
  return ''+
  '<div style="display:flex;align-items:center;">'+
    '<div style="display:inline;font-family:\'Open Sans Condensed\';font-weight:normal;">overtime</div>'+
    '<i class="far fa-long-arrow-alt-right mx-1" style="color:#333;"></i>'+
    '<img src="/src/svg/target.svg" style="height:0.8rem;margin-right:2px">'+
    '<span>'+(game_info.overtime_setscore?game_info.overtime_setscore:'')+'</span>'+
  '</div>';
}
function handleDelay(public_id)
{
  try
  {
    if(game_infos[public_id].delay==0||game_infos[public_id].cancelled||game_infos[public_id].suspended){$('#'+public_id+'_delay').css({"display":"none"});}
    $('#'+public_id+'_delay').html('<b>'+(game_infos[public_id].delay<0?'-':'+')+game_infos[public_id].delay+'min</b>');
  }
  catch(err)
  {
    console.log("THERE HAS BEEN AN ERROR IN handleDelay(). public_id: ", public_id);
    $("#error_message_container").append("THERE HAS BEEN AN ERROR IN handleDelay(). public_id: "+public_id);
  }
}





// OVERLAYS THAT INDICATE AN EVENT IN THE LIVE VIEW
// e.g., when a team scores a goal, a large goal icon appears
function createCompleteOverlay(id, str)
{
  if(id in ausfuehrlich)
  {
    if(ausfuehrlich[id])
    {
      let offs = $('#'+id+'_card-overlay').offset();
      let width = $('#'+id+'_card-overlay').width();
      let height = $('#'+id+'_card-overlay').height();
      $('<div style="display:flex;justify-content:center;align-items:center;width:'+width+'px;height:'+height+'px;position:absolute;top:'+offs.top+'px;left:'+offs.left+'px;/*background-color:rgba(255,0,0,0.3);*/">'+str+'</div>').appendTo('body').delay(1000).queue(function() { $(this).remove(); });
    }
  }  
}
function createTeamOverlay(id, str, team)
{
  if(id in ausfuehrlich)
  {
    if(ausfuehrlich[id])
    {
      let offs = $('#'+id+'_score'+team+'_ausfuehrlich').offset();
      let width = $('#'+id+'_score'+team+'_ausfuehrlich').width();
      let height = $('#'+id+'_score'+team+'_ausfuehrlich').height();
      $('<div style="display:flex;justify-content:center;align-items:center;width:'+width+'px;height:'+height+'px;position:absolute;top:'+offs.top+'px;left:'+offs.left+'px;/*background-color:rgba(255,0,0,0.3);*/">'+str+'</div>').appendTo('body').delay(1000).queue(function() { $(this).remove(); });
    }
  }
}




function notifyMe() {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support system notifications");
    // This is not how you would really do things if they aren't supported. :)
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    let notification = new Notification("Hi there!");
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        let notification = new Notification("Hi there!");
      }
    });
  }

  // Finally, if the user has denied notifications and you 
  // want to be respectful there is no need to bother them any more.
}

async function renderOnCompleteData(obj)
{
  createNewContainer(obj.public_id);
  updateAliveSignal(obj.public_id, obj.alive_timestamp);
  let games_done_loading = Object.keys(game_infos).length;
  let total_games = public_game_ids.length;
  if(games_done_loading==total_games)
  {
    if(!load_complete)
    {
      setLoadingPercentage(parseInt(100));
      load_complete=true;
      for(var public_id in game_infos)
      {
        if(game_infos.hasOwnProperty(public_id))
        {
          integrateTeamShortnames(public_id);
          populateSingleGame(public_id);
          handleRunningClock(public_id);
        }
      }
      createActiveDayButtons();
      selectDefaultActiveDay();
      updateFilterData();
      $("#content_games").css({"display":"flex"});
      adjustScrollbarColors();
    }
    else
    {
      populateSingleGame(obj.public_id);
      handleRunningClock(obj.public_id);
      updateFilterData();
    }
  }
  else
  {
    setLoadingPercentage(parseInt(games_done_loading/total_games*100));
  }
}




function getCompleteRepaintingNeeded(obj)
{
  let keys = Object.keys(obj);
  if(keys.includes('cancelled') || keys.includes('cancelled_reason') || keys.includes('data_available') || keys.includes('delay') || keys.includes('game_over') || keys.includes('group') || keys.includes('pitch') || keys.includes('specification') || keys.includes('suspended') || keys.includes('suspended_reason') || keys.includes('teams') || keys.includes('time')){return true;}
  return false;
}
function getEventsRepaintingNeeded(obj)
{
  if(Object.keys(obj).includes('events')){return true;}
  return false;
}

