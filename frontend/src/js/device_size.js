var keyboard_out = false;
var deviceTooSmallPromptAlreadyShown = false;
$(document).on("focus", "input", function(){keyboard_out = true;});
$(document).on("focusout", "input", function(){keyboard_out = false;});
function isRunningStandalone()
{
    // Bullet proof way to check if iOS standalone
    var isRunningiOSStandalone = window.navigator.standalone;
    // Reliable way (in newer browsers) to check if Android standalone.
    // https://.com/questions/21125337/how-to-detect-if-web-app-running-standalone-on-chrome-mobile#answer-34516083
    var isRunningAndroidStandalone = window.matchMedia('(display-mode: standalone)').matches;
    return isRunningiOSStandalone || isRunningAndroidStandalone;
};
function promptIfTooSmall()
{
    if(!deviceTooSmallPromptAlreadyShown)
    {
        $("#tooSmallDeviceModal").modal('hide');
        if(!keyboard_out)
        {
            var minHeight=548;
            var minWidth=320;
            windowHeight = $(window).height();
            windowWidth = $(window).width();
            if((windowHeight<minHeight || windowWidth<minWidth))
            {
                deviceTooSmallPromptAlreadyShown=true;
                $("#device_size").html("Your device size is <b>"+windowWidth+"x"+windowHeight+"</b>.<br>The recommended size is at least <b>"+minWidth.toString()+"x"+minHeight.toString()+"</b>.<br><br>We highly advise you to use this app on another device."+(!isRunningStandalone()?" If this is not possible, please at least add this App to your homescreen to get rid of the URL bar for some extra space.":""));
                $("#tooSmallDeviceModal").modal('show');
            }
        }
    }
}
promptIfTooSmall();
$(window).resize(function(){promptIfTooSmall();});