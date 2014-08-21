var args = arguments[0] || {};

$.title.text = args.video_title;
$.provider.text = 'Source: ' + args.video_provider;
$.excerpt.text = args.video_excerpt;
$.loadingImgView.image = args.video_image_path;

$.row.video_id = args.video_id;
$.row.video_title = args.video_title;
$.row.video_excerpt = args.video_excerpt;
$.row.video_url = args.video_url;
$.row.video_provider = args.video_provider;
$.row.video_image_path = args.video_image_path;
$.row.backgroundColor = "#000";

switch (args.video_provider)
{
    case 'YouTube':
        $.sourceBar.backgroundColor = "#ed0f20";
    break;
    case 'Facebook':
        $.sourceBar.backgroundColor = "#3b5998";
    break;
    case 'Instagram':
        var bluePart = Ti.UI.createView({ height:18, width:3, top:0, backgroundColor:'#356bef', touchEnabled:false });
        var greenPart = Ti.UI.createView({ height:17, width:3, top:18, backgroundColor:'#6faa73', touchEnabled:false });
        var yellowPart = Ti.UI.createView({ height:17, width:3, top:35, backgroundColor:'#ecaa34', touchEnabled:false });
        var redPart = Ti.UI.createView({ height:18, width:3, top:52, backgroundColor:'#ff2001', touchEnabled:false });
        $.sourceBar.add(bluePart);
        $.sourceBar.add(greenPart);
        $.sourceBar.add(yellowPart);
        $.sourceBar.add(redPart);
    break;
    case 'Vimeo':
        $.sourceBar.backgroundColor = "#1bb6ec";
    break;
    case 'Vine':
        $.sourceBar.backgroundColor = "#00b489";
    break;
    case 'DailyMotion':
        $.sourceBar.backgroundColor = "#c48600";
    break;
}