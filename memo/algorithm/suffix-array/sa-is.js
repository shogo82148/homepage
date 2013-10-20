$(function() {

    var log = [];

    function sais(input) {
        var length = input.length;
        var i, j;
        var type = [];
        var bucket;
        var SA = [];

        log.push({
            action: "start_sais",
            input: input
        });

        function isLMS(i) {
            if(i >= length) return true;
            else if(i <= 0) return false;
            else if(type[i] == 'S' && type[i-1] == 'L') return true;
            else return false;
        }

        function getBucket(end) {
            var i, key, keys = [], sum = 0;
            var bucket = {};
            for(i = 0; i < length; ++i) {
                bucket[input[i]] = (bucket[input[i]] || 0) + 1;
            }
            for(key in bucket) {
                keys.push(key);
            }
            keys.sort();
            for(i = 0; i < keys.length; ++i) {
                key = keys[i];
                sum += bucket[key];
                if(end) {
                    bucket[key] = sum;
                } else {
                    bucket[key] = sum - bucket[key];
                }
            }
            return bucket;
        }

        function induceSAl() {
            var bucket = getBucket(false);
            var i, j;
            log.push({
                action: "put",
                index: bucket[input[length-1]],
                value: length-1
            });
            SA[bucket[input[length-1]]++] = length - 1;
            for(i = 0; i < length; ++i) {
                j = SA[i] ? SA[i] - 1 : -1;
                if(j >= 0 && type[j] == 'L') {
                    log.push({
                        action: "put",
                        index: bucket[input[j]],
                        value: j
                    });
                    SA[bucket[input[j]]++] = j;
                }
            }
        }

        function induceSAs() {
            var bucket = getBucket(true);
            var i, j;
            for(i = length - 1; i >= 0; --i) {
                j = SA[i] ? SA[i] - 1 : -1;
                if(j >= 0 && type[j] == 'S') {
                    SA[--bucket[input[j]]] = j;
                    log.push({
                        action: "put",
                        index: bucket[input[j]],
                        value: j
                    });
                }
            }
        }

        // L-type と S-type を判定
        type[length-1] = 'L';
        for(i = length - 2; i >= 0; --i) {
            if(input[i] < input[i+1]) {
                type[i] = 'S';
            } else if(input[i] > input[i+1]) {
                type[i] = 'L';
            } else {
                type[i] = type[i+1];
            }
        }

        log.push({
            action: "type",
            type: type
        });

        // LMS を先頭1文字のみでソート
        bucket = getBucket(true);
        for(i = 1; i < length; ++i) {
            if(isLMS(i)) {
                SA[--bucket[input[i]]] = i;
                log.push({
                    action: "put",
                    index: bucket[input[i]],
                    value: i
                });
            }
        }

        // induce sort
        induceSAl();
        induceSAs();

        // LMS-substring に番号を振る
        var name = 0, prev = -1;
        var s1 = [], s1pos = {};
        var n1 = 0;
        for(i = 0; i < length; ++i) {
            if(isLMS(i)) {
                s1pos[i] = n1++;
            }
        }

        for(i = 0; i < length; ++i) {
            var pos = SA[i];
            if(!isLMS(pos)) continue;
            var diff = false;
            if(prev >= 0) {
                var d;
                for(d = 0; d < length; ++d) {
                    if(input[pos+d] != input[prev+d] ||
                       type[pos+d] != type[prev+d]) {
                        diff = true;
                        break;
                    } else if(d > 0 && (isLMS(pos+d) || isLMS(prev+d))) {
                        break;
                    }
                }
            }
            if(diff) {
                ++name;
            }
            prev = pos;
            s1[s1pos[pos]] = name;
        }

        // LMS-substring 列に対して Suffix Array を求める
        var SA1;
        if(name < n1 - 1) {
            SA1 = sais(s1);
        } else {
            SA1 = [];
            for(i = 0; i < n1; ++i) {
                SA1[s1[i]] = i;
            }
        }

        bucket = getBucket(true);
        var s2 = [];
        for(i = 0, j = 0; i < length; ++i) {
            if(isLMS(i)) {
                s2[j++] = i;
            }
        }
        SA = [];

        log.push({
            action: "clear_sa"
        });

        for(i = n1 - 1; i >= 0; --i) {
            j = s2[SA1[i]];
            SA[--bucket[input[j]]] = j;
            log.push({
                action: "put",
                index: bucket[input[j]],
                value: j
            });
        }

        induceSAl();
        induceSAs();

        log.push({
            action: "end_sais"
        });

        return SA;
    }

    var text = $('#text');
    var result = $('#result');


    $('#create').click(function() {
        result.html('');
        log = [];
        var log_position = 0;
        var input = text.val().split('');
        var SA = sais(input);
        $('#create').attr('disabled', true);

        var stack = [];

        var timer_id = setInterval(function() {
            if(log_position >= log.length) {
                clearInterval(timer_id);
                $('#create').removeAttr('disabled');
                return ;
            }
            var i, j, sa;
            var l = log[log_position];
            switch(l.action) {
            case 'start_sais':
                sa = [];
                var table = $('<table>').attr('border', '1');
                for(i = 0; i < l.input.length; ++i) {
                    var index = $('<td>').text(i);
                    var pos = $('<td>');
                    var suffix = $('<td>');
                    var row = $('<tr>').append(index).append(pos).append(suffix);
                    table.append(row);
                    sa.push({
                        index: index,
                        pos: pos,
                        suffix: suffix
                    });
                }
                stack.push({
                    sa: sa,
                    table: table,
                    input: l.input
                });
                result.append(table);
                break;
            case 'put':
                var s = '';
                sa = stack[stack.length-1].sa;
                sa[l.index].pos.text(l.value);
                for(i = l.value; i < sa.length; ++i) {
                    s += stack[stack.length-1].input[i];
                }
                sa[l.index].suffix.text(s);
                break;
            case 'clear_sa':
                sa = stack[stack.length-1].sa;
                for(i = 0; i < sa.length; ++i) {
                    sa[i].pos.text('');
                    sa[i].suffix.text('');
                }
                break;
            case 'end_sais':
                stack.pop();
                break;
            }
            ++log_position;
        }, 500);
    });
});
