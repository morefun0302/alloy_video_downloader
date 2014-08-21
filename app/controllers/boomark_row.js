var args = arguments[0] || {};

switch (args.video_provider)
{
    case 'YouTube':
        $.sourceBar.backgroundColor = "#ed0f20";
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