async function requestTournamentList()
{
  if(getUrlParam('id')!=undefined)
  {
    claimed_tournament_id = getUrlParam('id');
    setCookie('tournament', getUrlParam('id'), 7);
  }

  console.log('Requesting tournament list ...');
  $("#error_message_container").append("Requesting tournament list ...<br>");
  let response = await fetch("https://quadball.live/administration/getAllTournamentsInfos.php", { method: 'POST' });
  response = await response.json();     // deployment mode
  all_tournament_infos = arrayToObject(response);
  // response = await response.text().then(result => console.log(result)); return;  // debug mode
  
  console.log("Successfully received all tournaments infos", response);
  $("#error_message_container").append("Successfully received all tournaments infos<br>");
  
  // SET INITIAL tournament_id
  for(let ii=0; ii<response.length; ii++)
  {
    if(claimed_tournament_id==response[ii].id)
    {
      tournament_id = claimed_tournament_id;
      rulebook = all_tournament_infos[tournament_id].rulebook;
      break;
    }
  }
  if(tournament_id==null)
  {
    let now = moment().unix();
    tournament_id=null;
    for(let ii=0; ii<response.length; ii++) // response is sorted by timestamp ASC
    {
      if(response[ii].timestamp>now)
      {
        tournament_id = parseInt(response[ii].id);
      }
      else { break }
    }
    // if there are no future tournaments
    if(tournament_id==null && response.length>0)
    {
      tournament_id = parseInt(response[0].id);
      rulebook = all_tournament_infos[tournament_id].rulebook;
    }
  }
  else
  {
    setCookie('tournament', tournament_id, 3);
  }
  await fillTournamentSelectpicker(response);
}

function fillTournamentSelectpicker(response)
{
  return new Promise(async (resolve, reject) =>
  {
    try
    {
      if(tournament_id!=null)
      {
        let now = moment().unix();
        let tournament_infos_current = [];
        let tournament_infos_future = [];
        let tournament_infos_archive = [];
        for(let ii=0; ii<response.length; ii++)
        {
          if(response[ii].timestamp>(now-3*24*60*60) && response[ii].timestamp<=(now+7*24*60*60)){tournament_infos_current.push(response[ii]);}
          else if(response[ii].timestamp>(now+7*24*60*60)){tournament_infos_future.push(response[ii]);}
          else if(response[ii].timestamp<=(now-3*24*60*60)){tournament_infos_archive.push(response[ii]);}
        }

        if(tournament_infos_current.length>0)
        {
          let str = '';
          str += '<optgroup label="Current">';
          for(let ii=0; ii<tournament_infos_current.length; ii++)
          {
            let selected = (tournament_id==tournament_infos_current[ii].id) ? 'selected' : '';
            console.log("Successfully added '"+tournament_infos_current[ii].name+"' to selectpicker.");
            $("#error_message_container").append("Successfully added '"+tournament_infos_current[ii].name+"' to selectpicker.<br>");
            str += '<option value="'+tournament_infos_current[ii].id+'" data-tokens="'+tournament_infos_current[ii].id+'" data-content="<span style=\'font-weight:bold;\'>'+tournament_infos_current[ii].name+'</span>" '+selected+'>'+tournament_infos_current[ii].name+'</option>';
          }
          str += '</optgroup>';
          $("#tournament_selectpicker").append(str);
        }
        if(tournament_infos_future.length>0)
        {
          let str = '';
          str += '<optgroup label="Upcoming">';
          for(var ii=0;ii<tournament_infos_future.length;ii++)
          {
            let selected = (tournament_id==tournament_infos_future[ii].id) ? 'selected' : '';
            console.log("Successfully added '"+tournament_infos_future[ii].name+"' to selectpicker.");
            $("#error_message_container").append("Successfully added '"+tournament_infos_future[ii].name+"' to selectpicker.<br>");
            str += '<option value="'+tournament_infos_future[ii].id+'" data-tokens="'+tournament_infos_future[ii].id+'" data-content="<span style=\'font-weight:bold;\'>'+tournament_infos_future[ii].name+'</span>" '+selected+'>'+tournament_infos_future[ii].name+'</option>';
          }
          str += '</optgroup>';
          $("#tournament_selectpicker").append(str);
        }
        if(tournament_infos_archive.length>0)
        {
          let str = '';
          str += '<optgroup label="Archive">';
          for(var ii=0;ii<tournament_infos_archive.length;ii++)
          {
            let selected = (tournament_id==tournament_infos_archive[ii].id) ? 'selected' : '';
            $("#error_message_container").append("Successfully added '"+tournament_infos_archive[ii].name+"' to selectpicker.<br>");
            str += '<option value="'+tournament_infos_archive[ii].id+'" data-tokens="'+tournament_infos_archive[ii].id+'" data-content="<span style=\'font-weight:bold;\'>'+tournament_infos_archive[ii].name+'</span>" '+selected+'>'+tournament_infos_archive[ii].name+'</option>';
          }
          str += '</optgroup>';
          $("#tournament_selectpicker").append(str);
        }
        $("#tournament_selectpicker").selectpicker('refresh');

        $("#tournament_defined").css({"display":"flex"});
        //main();
        resolve('selectpicker filled');
      }
    }
    catch(err)
    {
      reject(err)
    }
  });
}