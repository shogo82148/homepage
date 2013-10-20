(function() {
    function $(id) {
        return document.getElementById(id);
    }
    var text = '', search = '';
    var input_text = $('text');
    var input_search = $('search');
    var result = $('result');
    var substrings = [];
    var sa = [];

    function makeSuffixArray(text) {
        var i, sub;
        substrings = [];
        sa = [];
        for(i = 0; i < text.length; ++i) {
            sub = {
                pos: i,
                sub: text.slice(i)
            };
            substrings.push(sub);
            sa.push(sub);
        }
        sa.sort(function(a, b) {
            if(a.sub < b.sub) return -1;
            if(a.sub > b.sub) return 1;
            return 0;
        });
    }

    function searchText(search) {
        var s = '<table border="1">';
        var i, j, sub;
        var length = search.length;
        s += '<tbody>';
        for(i = 0; i < sa.length; ++i) {
            if(sa[i].sub.substring(0, length) == search) {
                sub = '<span style="color:red">' + escape(search) + '</span>' +
                    escape(sa[i].sub.slice(length));
            } else {
                sub = escape(sa[i].sub);
            }
            s += "<tr><td>" + sa[i].pos + "</td><td>"
                + sub + "</td></tr>";
        }
        s += "</tbody>";
        s += "</table>";
        result.innerHTML = s;
    }

    function escape(s) {
        return s.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot");
    }

    setInterval(function() {
        if(text != input_text.value) {
            text = input_text.value;
            search = input_search.value;
            makeSuffixArray(text);
            searchText(search);
        }

        if(search != input_search.value) {
            search = input_search.value;
            searchText(search);
        }
    }, 100);
})();
