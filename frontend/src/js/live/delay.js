function calcDelay(time_of_game, delays)
{
  var game_delay = 0;
  $.each(delays, function(index, data)
  {
      if(data.timestamp<=time_of_game){game_delay+=data.delay;}
  });
  console.log(getCurrentTime(), "GAME DELAY", game_delay);
  return game_delay;
}