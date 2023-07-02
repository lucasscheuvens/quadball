function createNewSocketIOConnection()
{
  if(socket){ socket.disconnect(); }
  socket = null;
  socket = io();
  socket.on('connect', function() {

    let init = { auth: auth, games: public_game_ids, tournament: tournament_id, all_games_at_once: true };
    console.log(getCurrentTime(), "Requesting game infos. Sending this: ", init);
    $("#error_message_container").append("Sending this: "+JSON.stringify(init)+"<br>");
    socket.emit('auth', init);
    console.log(getCurrentTime(), "Successfully sent user authentication over Socket IO.");
    $("#error_message_container").append("Successfully sent user authentication over Socket IO.<br>");
    
    $('#error_message_container').addClass('d-none');
    $('#connection_error').addClass('d-none');
    $('#active_day_container').html('');
    $('#content_games').css({'display':'none'});
    $('#loading_page').removeClass('d-none');
    $("#loading_page").prepend('<div class="row justify-content-center" id="receiving_information"><div style="display:inline;">Loading <span id="receiving_information_status"><i class="fas fa-circle-notch fa-spin"></i></span></div></div>');
    
    //socket.emit('auth', {auth: socket_auth, type: 'tournament', id: game, description: 'alive', data: {random: 5}, complete_new: {random: 6}, all_games_at_once: true});
    socket.on('all games at once', function(received) {
      console.log(getCurrentTime(), 'ALL GAMES', received);
      completeNewDataSet(received.data);
    });
    socket.on('alive', function (data) {
      //console.log(getCurrentTime(), 'ALIVE', data);
      updateAliveSignal(data.public_id, data.alive_timestamp);
    });
    socket.on('complete', function (data) {
      console.log(getCurrentTime(), 'COMPLETE', data);

      // integrate new data
      socket_connection_completely_established = true;
      $("#error_message_container").addClass('d-none');
      //console.log(getCurrentTime(), "It\'s a COMPLETE PUSH");
      //console.log(getCurrentTime(), "Received this:", obj);
      //console.log(getCurrentTime(), "Received this public id:", obj.public_id);
      $("#error_message_container").append("It's a COMPLETE PUSH<br>");
      if( !isJSObject(game_infos) ) game_infos = {};
      if( !isJSObject( game_infos[data.public_id] ) ) game_infos[data.public_id] = {};
      game_infos[data.public_id] = data;

      // render based on new data
      renderOnCompleteData(data);
    });
    socket.on('tournament', function (data)
    {
      console.log(getCurrentTime(), 'TOURNAMENT', data);
      tournamentData(data);
    });
  });
  socket.on('disconnect', function()
  {
    console.error(getCurrentTime(), "disconnected :(");
  });
}
async function completeNewDataSet(data)
{
  $("#receiving_information_status").html('<i class="fas fa-check" style="color:#004D40;"></i>');
  $("#receiving_information").after('<div class="row justify-content-center align-items-center" id="creating_layout" style="flex-flow: row nowrap;">Creating layout&nbsp;<span id="creating_layout_progress" style="font-weight:bold;color:#004D40;">0%</span></div>');
  // Herz: <div style="width:1.2rem;height:1.2rem;"><svg version="1.1" x="0px" y="0px" viewBox="0 0 100 100"><path style="fill-opacity:0;stroke:#BBBBBB;stroke-width:4.6836;" d="M81.9,14.9c-11.4-5.3-26.5-0.3-31.8,11.1C44.8,14.6,29.8,9.7,18.3,14.9C6.1,20.6,0.2,35,9.8,52.1c6.8,12.2,19,21.3,40.2,37.8c21.3-16.4,33.3-25.6,40.3-37.7C100,35,94.1,20.6,81.9,14.9z"/><path id="heart-path" style="fill-opacity:0;stroke:#004D40;stroke-width:9.3672;" d="M50.1,25.4l0.3,0.1c5.4-11.1,20.2-15.8,31.5-10.6C94.1,20.6,100,35,90.3,52.2c-6.9,12.1-19,21.3-40.3,37.7C28.9,73.4,16.7,64.3,9.8,52.1c-9.6-17-3.7-31.5,8.4-37.2c11.2-5.2,25.9-0.6,31.5,10.4l0.2,0.1L50.1,25.4z"/></svg></div>
  // var bar = new ProgressBar.Path('#heart-path', {easing: 'easeInOut',duration: 1400});bar.set(0);bar.animate(1.0);  // Number from 0.0 to 1.0
  socket_connection_completely_established = true;
  $("#error_message_container").addClass('d-none');
  console.log(getCurrentTime(), "It\'s an INITIAL PUSH");
  console.log(getCurrentTime(), "Received this:", data);
  $("#error_message_container").append("It's an INITIAL PUSH<br>");
  
  // integrate data into local variables
  if(!isJSObject(game_infos))game_infos={};
  for(var ii=0;ii<data.length;ii++)
  {
    game_infos[data[ii].public_id]=data[ii];
    integrateTeamShortnames(data[ii].public_id);
    updateAliveSignal(data[ii].public_id, data[ii].alive_timestamp);
  }
  load_complete = true;
  detectRecentEnoughChanges(false); // false means that it should not apply to the DOM
  initialLayout();
}
function integrateTeamShortnames(public_id)
{
  // save team data for officials affiliations
  let team_letters = ['A', 'B'];
  for(var ii=0;ii<team_letters.length;ii++)
  {
    //console.log(game_infos[public_id].teams[team_letters[ii]].id);
    if(game_infos[public_id].teams[team_letters[ii]].id)
    {
      team_id_to_name[game_infos[public_id].teams[team_letters[ii]].id] = game_infos[public_id].teams[team_letters[ii]].shortname;
    }
  }
}
async function tournamentData(obj)
{
  //console.log(getCurrentTime(), "It\'s a tournament PUSH");
  for(var jj=0;jj<public_game_ids.length;jj++)
  {
    if(game_infos.hasOwnProperty(public_game_ids[jj]))
    {
      game_infos[public_game_ids[jj]].delay = calcDelay(game_infos[public_game_ids[jj]].timestamp, obj.delay);
      if(load_complete){handleDelay(public_game_ids[jj]);}
    }
  }
}
function getCurrentTime(){let today = new Date();return today.getFullYear().pad(4)+'-'+(today.getMonth()+1).pad(2)+'-'+today.getDate().pad(2)+' @ '+today.getHours().pad(2)+':'+today.getMinutes().pad(2)+':'+today.getSeconds().pad(2);}  Number.prototype.pad=function(size){var s=String(this);while(s.length<(size||2)){s='0'+s;}return s;}
