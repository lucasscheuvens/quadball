var clipboard=null;
function resetClipboards()
{
if(clipboard!=null){clipboard.destroy();}
clipboard = new ClipboardJS('.clipboardbtn');
clipboard.on('success', function(e) {
    console.info('Action:', e.action);
    console.info('Text:', e.text);
    console.info('Trigger:', );
    $(e.trigger).tooltip({title:"Copied!",placement:"top",trigger:'manual'});
    $(e.trigger).tooltip('show');
    setTimeout(function(){$(e.trigger).tooltip('dispose');},1000);
    //alert("Copied!");
    e.clearSelection();
});
}