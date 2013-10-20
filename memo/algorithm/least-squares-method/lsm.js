$(function() {
    var width = 400, height = 300;
    var margin = 20;
    var canvas = Raphael('Graph', width, height);
    var functionset = {
        "1": function() {
            var y0 = random(margin, height-margin*2);
            var y1 = random(margin, height-margin*2);
            var a = (y1 - y0) / width;
            return function(x) {
                return a * x + y0;
            };
        },
        "2": function() {
            var y0 = random(margin, height-margin*2);
            var y1 = random(margin, height-margin*2);
            var y2 = random(margin, height-margin*2);
            return function(x) {
                x = x / width * 2;
                return (x-1)*(x-2)/2*y0
                    - x*(x-2)*y1
                    + x*(x-1)/2*y2;
            };
        },
        "tri": function() {
            var a = random(0, height/2-margin);
            var offsety = random(a+margin, height-margin-a);
            var offsetx = random(0, width);
            return function(x) {
                return offsety + a * Math.sin((x-offsetx)/width*Math.PI*2);
            };
        }
    };
    var ori_function, guess_function;
    var points = canvas.set();

    function random(a, b) {
        return Math.random() * (b-a) + a;
    }

    function gaussrandom(ave, dist) {
        ave = ave || 0;
        dist = dist || 1;
        var x = Math.random();
        var y = Math.random();
        return Math.sqrt(-2*Math.log(x)) * Math.sin(2*Math.PI*y) * dist + ave;
    }

    function getFunctionType() {
        return $('input[name=function]:checked').val();
    }

    function getDegree() {
        return $('input[name=degree]:checked').val() - 0;
    }

    function getParameter() {
        var val = $('#parameter').val();
        if(!val) return 0;
        return Math.exp((val-1000)/50);
    }

    function refreshFunction() {
        canvas.clear();
        ori_function = functionset[getFunctionType()]();
        var f = ori_function;
        var s = "M 0 " + f(0) + "L";
        var x;
        for(x=0;x<width;x+=10) {
            s += x + " " + f(x) + " ";
        }
        canvas.path(s).attr({"stroke-width":2});
        points = canvas.set();
        refreshPoints();
    }

    function refreshPoints() {
        points.remove();
        points = canvas.set();
        var num = $('#number').val()-0;
        var d = $('#error').val()-0;
        var i, x, y, r, f;
        f = ori_function;
        for(i=0;i<num;++i) {
            r = 5;
            x = (i+1) / (num+1) * width;
            y = gaussrandom(f(x), d);
            points.push(canvas.circle(x, y, r));
        }
        points.attr({fill:'red', stroke:'none'});
        refreshGuess();
    }

    function getdata(degree) {
        var arrayy = [];
        var arrayG = [];
        points.forEach(function(e) {
            var x = e.attr('cx') - 0;
            var y = e.attr('cy') - 0;
            var i, v=[], val = 1;
            arrayy.push(y);
            for(i=0;i<degree;++i) {
                val *= x;
                v.push(val);
            }
            arrayG.push(v);
        });
        var averageG = [];
        var scaleG = [];
        var G = $M(arrayG);
        var i;
        for(i=0;i<=G.cols();++i) {
            averageG.push(0);
            scaleG.push(1);
        }
        return {
            'G': G,
            'averageG': averageG,
            'scaleG': scaleG,
            'y': $V(arrayy),
            'averageY': 0,
            'scaleY': 1
        };
    }

    function normalize(data) {
        var G = data.G;
        var y = data.y;
        var averageG = [];
        var scaleG = [];
        var i, j, x;
        for(i=0;i<=G.cols();++i) {
            averageG.push(0);
            scaleG.push(0);
        }
        for(i=1;i<=G.cols();++i) {
            for(j=1;j<=G.rows();++j) {
                x = G.e(j, i);
                averageG[i] += x;
                scaleG[i] += x * x;
            }
            averageG[i] /= G.rows();
            scaleG[i] = Math.sqrt(scaleG[i]/G.rows() - averageG[i]*averageG[i]);
        }
        data.averageG = averageG;
        data.scaleG = scaleG;
        data.G = G.map(function(x, i, j){
            return (x-averageG[j])/scaleG[j];
        });

        var averageY = 0;
        var scaleY = 0;
        y.each(function(x) {
            averageY += x;
            scaleY += x * x;
        });
        averageY /= y.dimensions();
        data.averageY = averageY;
        scaleY = Math.sqrt(scaleY/y.dimensions() - averageY * averageY);
        data.scaleY = scaleY;
        data.y = y.map(function(x) {
            return (x - averageY) / scaleY;
        });
        return data;
    }

    function refreshGuess() {
        var parameter = getParameter();
        var degree = getDegree();
        var data = getdata(degree);
        data = normalize(data);
        var G = data.G;
        var y = data.y;
        var Gt = G.transpose();
        var a = (Gt.x(G).add(Matrix.I(degree).x(parameter))).inv().x(Gt).x(y);
        console.log(a.inspect());

        var s = "M 0 " + f(0) + "L";
        var x;
        for(x=0;x<width;x+=10) {
            s += x + " " + f(x) + " ";
        }
        console.log(s);
        if(guess_function) {
            guess_function.remove();
        }
        guess_function = canvas.path(s).attr({"stroke-width":2, stroke:'blue'});

        function f(x) {
            var i, val=1, ret=0;
            for(i=0;i<degree;++i) {
                val *= x;
                ret += a.e(i+1) * (val-data.averageG[i+1])/data.scaleG[i+1];
            }
            return ret*data.scaleY+data.averageY;
        }
    }

    refreshFunction();
    $('#refresh').click(refreshFunction);
    $('input[name=function]').change(refreshFunction);
    $('#number,#error').change(refreshPoints);
    $('input[name=degree],#parameter').change(refreshGuess);
});
