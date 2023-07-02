function syncToServerTime()
{
  return new Promise(async (resolve, reject) =>
  {
    try
    {
      let timestamp_before_send = moment().valueOf();
      let timestamp_after_send;
      let response = await fetch('https://quadball.live/getServerTime.php', { method: 'POST' });
      timestamp_after_send = moment().valueOf();
      response = await response.json(); //deployment mode
      // response.text().then(result=>console.log(result)); //debug mode
      console.log('Time synced:', response);
      console.log("POST request for time sync took "+(timestamp_after_send-timestamp_before_send).toString()+"ms");
      if(response.timestamp)
      {
        let diff_server_to_local = parseInt(response.timestamp)-(timestamp_before_send+Math.round((timestamp_after_send-timestamp_before_send)/2));
        console.log("Diff to server is "+diff_server_to_local.toString()+"ms");
        $("#error_message_container").append("Diff to server is "+diff_server_to_local.toString()+"ms<br>");
        resolve(diff_server_to_local)
      }
      reject('No timestamp field found')
    }
    catch(err)
    {
      reject(err)
    }
  });
}