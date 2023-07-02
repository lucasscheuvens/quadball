function isJSObject(yourVariable){return (yourVariable !== null && typeof yourVariable === 'object');}
function updateAliveSignal(public_id, timestamp)
{
  if(timestamp)
  {
    last_alive[public_id]=timestamp*1000-diff_server_to_local;
  }
}
function integrateNewData(public_id, new_data)
{
  // depth: one
  console.log("NEW DATA: ", new_data);
  for(var key0 in new_data)
  {
    if(new_data.hasOwnProperty(key0))
    {
      if(isJSObject(new_data[key0]))
      {
        // depth: two
        for(var key1 in new_data[key0])
        {
          if(new_data[key0].hasOwnProperty(key1))
          {
            if(isJSObject(new_data[key0][key1]))
            {
              // depth: three
              for(var key2 in new_data[key0][key1])
              {
                if(new_data[key0][key1].hasOwnProperty(key2))
                {
                  if(isJSObject(new_data[key0][key1][key2]))
                  {
                    // depth: four
                    for(var key3 in new_data[key0][key1][key2])
                    {
                      if(new_data[key0][key1][key2].hasOwnProperty(key3))
                      {
                        if(isJSObject(new_data[key0][key1][key2][key3]))
                        {
                          // depth: five
                          for(var key4 in new_data[key0][key1][key2][key3])
                          {
                            if(new_data[key0][key1][key2][key3].hasOwnProperty(key4))
                            {
                              if(isJSObject(new_data[key0][key1][key2][key3][key4]))
                              {
                                // stop: nothing is deeper than five
                              }
                              else
                              {
                                // if entry doesn't yet exist in target object, create it
                                if(!isJSObject(game_infos[public_id])){game_infos[public_id]={};}
                                if(!isJSObject(game_infos[public_id][key0])){game_infos[public_id][key0]={};}
                                if(!isJSObject(game_infos[public_id][key0][key1])){game_infos[public_id][key0][key1]={};}
                                if(!isJSObject(game_infos[public_id][key0][key1][key2])){game_infos[public_id][key0][key1][key2]={};}
                                if(!isJSObject(game_infos[public_id][key0][key1][key2][key3])){game_infos[public_id][key0][key1][key2][key3]={};}

                                // enter new value
                                game_infos[public_id][key0][key1][key2][key3][key4] = new_data[key0][key1][key2][key3][key4];
                              }
                            }
                          }
                        }
                        else
                        {
                          // if entry doesn't yet exist in target object, create it
                          if(!isJSObject(game_infos[public_id])){game_infos[public_id]={};}
                          if(!isJSObject(game_infos[public_id][key0])){game_infos[public_id][key0]={};}
                          if(!isJSObject(game_infos[public_id][key0][key1])){game_infos[public_id][key0][key1]={};}
                          if(!isJSObject(game_infos[public_id][key0][key1][key2])){game_infos[public_id][key0][key1][key2]={};}
                          // enter new value
                          game_infos[public_id][key0][key1][key2][key3] = new_data[key0][key1][key2][key3];
                        }
                      }
                    }
                  }
                  else
                  {
                    if(!isJSObject(game_infos[public_id])){game_infos[public_id]={};}
                    if(!isJSObject(game_infos[public_id][key0])){game_infos[public_id][key0]={};}
                    if(!isJSObject(game_infos[public_id][key0][key1])){game_infos[public_id][key0][key1]={};}
                    // enter new value
                    game_infos[public_id][key0][key1][key2] = new_data[key0][key1][key2];
                  }
                }
              }
            }
            else
            {
              // if entry doesn't yet exist in target object, create it
              if(!isJSObject(game_infos[public_id])){game_infos[public_id]={};}
              if(!isJSObject(game_infos[public_id][key0])){game_infos[public_id][key0]={};}
              // enter new value
              game_infos[public_id][key0][key1] = new_data[key0][key1];
            }
          }
        }
      }
      else
      {
        //console.log(key0 + " -> " + key1 + " -> " + new_data[key0]);
        // if entry doesn't yet exist in target object, create it
        if(!isJSObject(game_infos[public_id])){game_infos[public_id]={};}
        // enter new value
        game_infos[public_id][key0] = new_data[key0];
      }
    }
  }
  updateFilterData();
}
function removeData(public_id, removed_data)
{
  /* ONLY EVENT DATA CAN BE REMOVED, HENCE, THIS CAN BE SHORTENED */
  console.log("REMOVED DATA: ", removed_data);
  for(var key0 in removed_data)
  {
    if(removed_data.hasOwnProperty(key0))
    {
      for(var key1 in removed_data[key0])
      {
        if(removed_data[key0].hasOwnProperty(key1))
        {
          for(var key2 in removed_data[key0][key1])
          {
            if(removed_data[key0][key1].hasOwnProperty(key2))
            {
              if(isJSObject(game_infos[public_id][key0][key1][key2]))
              {
                delete game_infos[public_id][key0][key1][key2];
                console.log("DELETED: ", public_id + " -> " + key0 + " -> " + key1 + " -> " + key2 + " -> " + removed_data[key0][key1][key2]);
              }
            }
          }
        }
      }
    }
  }
}

const arrayToObject = (array) =>array.reduce((obj, item) => {obj[item.id] = item;return obj;}, {});

