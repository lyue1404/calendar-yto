export default  function forbidScrolling () {
    document.documentElement.addEventListener('touchstart', function (event) {
        if (event.touches.length > 1) {
        event.preventDefault();
        }
    }, false);
    var lastTouchEnd = 0;
    document.documentElement.addEventListener('touchend', function (event) {
        var now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
};