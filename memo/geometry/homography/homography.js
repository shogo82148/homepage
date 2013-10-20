// forked from shogo82148's "CSS3 Transform Test" http://jsdo.it/shogo82148/5Y1p
$(function() {
    function refresh() {
        var i, M = [], V = [];
        var x, y, X, Y;
        for(i=0;i<4;i++) {
                x = origin[i][0];
                y = origin[i][1];
                X = markers[i].x() - imgx;
                Y = markers[i].y() - imgy;
                M.push([x, y, 1, 0, 0, 0, -x*X, -y*X]);
                M.push([0, 0, 0, x, y, 1, -x*Y, -y*Y]);
                V.push(X);
                V.push(Y);
            }

        var ans = $M(M).inv().x($V(V));
        console.log($M(M).inspect());
        console.log($V(V).inspect());
        console.log(ans.inspect());
        var transform = "perspective(1px)scaleZ(-1)translateZ(-1px)matrix3d(" +
                    ans.e(1) + ',' + ans.e(4) + ',' + ans.e(7) + ',0,' +
                    ans.e(2) + ',' + ans.e(5) + ',' + ans.e(8) + ',0,' +
                    ans.e(3) + ',' + ans.e(6) + ',1,0,' +
                    '0,0,0,1)translateZ(1px)';
        img.css('-webkit-transform', transform);
    }

    function Marker(elem, func) {
        elem = $(elem);
        this.elem = elem;
        elem.draggable({
                drag: func || refresh
            });
    }
    Marker.prototype.x = function(x) {
        var e = this.elem;
        if(x) {
                e.css('left', (x - e.width()/2) + 'px');
                return this;
            } else {
                    return e.position().left + e.width()/2;
                }
    };
    Marker.prototype.y = function(y) {
        var e = this.elem;
        if(y) {
                e.css('top', (y - e.height()/2) + 'px');
                return this;
            } else {
                    return e.position().top + e.height()/2;
                }
    };
    var markers = [
        new Marker('#marker1'),
        new Marker('#marker2'),
        new Marker('#marker3'),
        new Marker('#marker4')
    ];
    var img = $('#content');
    var imgx = img.position().left;
    var imgy = img.position().top;
    var imgwidth = img.width();
    var imgheight = img.height();
    markers[0].x(imgx).y(imgy);
    markers[1].x(imgx + imgwidth).y(imgy);
    markers[2].x(imgx + imgwidth-50).y(imgy + imgheight-50);
    markers[3].x(imgx).y(imgy + imgheight);

    var origin = [
        [0, 0],
        [imgwidth, 0],
        [imgwidth, imgheight],
        [0, imgheight]
    ];
    refresh();
});

