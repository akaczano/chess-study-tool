export const STATUS_NOT_STARTED = 0;
export const STATUS_IN_PROGRESS = 1;
export const STATUS_FINISHED = 2;
export const STATUS_CANCELED = 3;

export const download = text => {
    let element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8, ${encodeURIComponent(text)}`);
    element.setAttribute('download', 'games.pgn');
    document.body.appendChild(element);
    element.click();    
}