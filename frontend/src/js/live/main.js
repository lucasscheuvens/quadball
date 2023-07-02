async function main()
{
  // this main function assumes that the rulebook version is already known
  try
  {    
    console.log("Populating page for tournament id:", tournament_id);
    $("#error_message_container").append("Populating page for tournament id="+tournament_id.toString()+"<br>");
    
    tournament_info = {
        "id": 170,
        "name": "EQC 2023 - Division 1",
        "rulebook": "2022",
        "description": "tournament",
        "timezone": "Europe/Berlin",
        "links": {},
        "delay": {
            "0": {
                "timestamp": 1684053960,
                "delay": 30
            }
        },
        "snitch_points": 30,
        "require_officials_confirmations": true
    };
    public_game_ids = await fetch('/public_game_ids.json').then(response => response.json());
    timestamps_sorted = await fetch('/timestamps_sorted.json').then(response => response.json());;
    diff_server_to_local = -40;

    rulebook = '2022';

    // START for fiverr:
    game_infos = await fetch('/game_infos.json').then(response => response.json());
    
    for( let id of Object.keys( game_infos ) ) {
      integrateTeamShortnames(game_infos[id].public_id);
      updateAliveSignal(game_infos[id].public_id, game_infos[id].alive_timestamp);
    }
    load_complete = true;
    detectRecentEnoughChanges(false); // false means that it should not apply to the DOM
    initialLayout();

    document.getElementById("new-data-button").addEventListener("click", async function() {
      let data = await fetch('/new_game_data.json').then(response => response.json());
      game_infos[data.public_id] = data;
      renderOnCompleteData( data );
    });
    
    // END for fiverr:
  }
  catch(err)
  {
    console.log(err);
  }
}


function resetViews()
{
  eraseCookie("liveview_active_filters");
}