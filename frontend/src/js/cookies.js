function setCookie(name,value,days)
{
  if(cookies.accepted || name=='cookies_rejected')
  {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }
}
function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}
function eraseCookie(name) {   
  document.cookie = name+'=; Max-Age=-99999999;';  
}

var cookies = {
  accepted : (getCookie('cookies_accepted')=='true'),
  rejected : (getCookie('cookies_rejected')=='true')
};

$(document).ready(function()
{
  if(!cookies.accepted && !cookies.rejected)
  {
    $('body').append(''+
    '<div style="position:fixed;display:flex;justify-content:center;border-top-left-radius:1rem;border-top-right-radius:1rem;align-items:center;flex-flow:column;top:100%;left:0;width:100%;height:240px;background-color:#FFFFFF;box-shadow:0px -2px 4px -1px rgba(0, 0, 0, 0.2), 0px -4px 5px 0px rgba(0, 0, 0, 0.14), 0px -1px 10px 0px rgba(0, 0, 0, 0.12);" id="accept_cookies_container">'+
      '<div class="mb-4" style="background:gray;height:6px;width:20px;border-radius:3px;"></div>'+
      '<div class="d-flex my-4">'+
        '<img src="/src/svg/ic_cookie.svg" style="height:60px;width:60px;">'+
      '</div>'+
      '<div class="d-flex">'+
        '<button class="btn btn-success mr-2" id="accept_cookies">Accept Cookies</button>'+
        '<button class="btn btn-danger mr-2" id="reject_cookies">Reject Cookies</button>'+
      '</div>'+
      //'<div class="d-flex mt-2 px-2">'+
      //  '<span style="font-family:\'Open Sans Condensed\';font-size:70%;color:gray;text-align:center;"><i class="fal fa-info-circle"></i> If you decide to reject cookies, we cannot save your preference in a cookie.</span>'+
      //'</div>'+
    '</div>');
    (new CookieSwipe('#accept_cookies_container')).onDown(function() { $('#reject_cookies').trigger("click") }).run();
    $('#accept_cookies_container').animate({'top':($('body').height()-240)+'px'}, 500);
    $('#accept_cookies').on("click", function()
    {
      cookies.accepted = true;
      setCookie('cookies_accepted', 'true', 1000);
      cookies.rejected = false;
      setCookie('cookies_rejected', 'false', 1000);
      $('#accept_cookies_container').animate({'top':'100%'}, 500, function()
      {
        $("#accept_cookies_container").remove();
      });
    });
    $('#reject_cookies').on("click", function()
    {
      cookies.accepted = false;
      cookies.rejected = true;
      setCookie('cookies_rejected', 'true', 1000);
      $('#accept_cookies_container').animate({'top':'100%'}, 500, function()
      {
        $("#accept_cookies_container").remove();
      });
    });
  }
});

class CookieSwipe {
  constructor(element) {
      this.xDown = null;
      this.yDown = null;
      this.element = typeof(element) === 'string' ? document.querySelector(element) : element;

      this.element.addEventListener('touchstart', function(evt) {
          this.xDown = evt.touches[0].clientX;
          this.yDown = evt.touches[0].clientY;
      }.bind(this), false);

  }

  onLeft(callback) {
      this.onLeft = callback;

      return this;
  }

  onRight(callback) {
      this.onRight = callback;

      return this;
  }

  onUp(callback) {
      this.onUp = callback;

      return this;
  }

  onDown(callback) {
      this.onDown = callback;

      return this;
  }

  handleTouchMove(evt) {
      if ( ! this.xDown || ! this.yDown ) {
          return;
      }

      var xUp = evt.touches[0].clientX;
      var yUp = evt.touches[0].clientY;

      this.xDiff = this.xDown - xUp;
      this.yDiff = this.yDown - yUp;

      if ( Math.abs( this.xDiff ) > Math.abs( this.yDiff ) ) { // Most significant.
          if ( this.xDiff > 0 ) {
              this.onLeft();
          } else {
              this.onRight();
          }
      } else {
          if ( this.yDiff > 0 ) {
              this.onUp();
          } else {
              this.onDown();
          }
      }

      // Reset values.
      this.xDown = null;
      this.yDown = null;
  }

  run() {
      this.element.addEventListener('touchmove', function(evt) {
          this.handleTouchMove(evt);
      }.bind(this), false);
  }
}