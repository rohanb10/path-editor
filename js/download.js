/* 
 *  simplecopy
 *  https://github.com/kyle-rb/simplecopy
 */
var simplecopy = (function () {
    var d = document, b, cs, ss, f = false, n = d.createElement('div');
    function sc(t) {
        if (!b) b = d.body;
        n.innerText = t; b.appendChild(n); ss = x(n); cs = d.execCommand('copy', f, null); b.removeChild(n); return ss && cs;
    }
    function x(n) {
        var r, s, w = window.getSelection, c = b.createTextRange;
        if (c) {r = c();r.moveToElementText(n);r.select();return !f}
        else if (w) { s = w(); r = d.createRange(); r.selectNodeContents(n); s.removeAllRanges(); s.addRange(r); return !f}
        else { return f}
    }
    return sc;
})();

function downloadTypeChanged(type) {
    document.querySelectorAll('#download-format option').forEach(o => {
        o.disabled = false;
    });
    document.getElementById(`nl`).classList.remove('hidden');
    document.getElementById(`option_clipboard`).selected = true
    if (type.options[type.selectedIndex].value === 'polyline') {
        document.getElementById(`nl`).classList.add('hidden');
        document.getElementById(`option_csv`).disabled = true;
        document.getElementById(`option_arr`).disabled = true;
        document.getElementById(`option_obj`).disabled = true;
    } else {
        document.getElementById(`option_txt`).disabled = true;
    }
    downloadFormatChanged(document.getElementById('download-format'));
}

function downloadFormatChanged(medium) {
    var m = medium.options[medium.selectedIndex];
    if (m.value === 'clip' || m.value === 'csv') {
        document.getElementById('new_lines').checked = true;
        document.getElementById('new_lines').disabled = true;
    } else {
        document.getElementById('new_lines').disabled = false;
    }
}

function downloadPath() {
    var type = document.getElementById('download-type').value;
    var medium = document.getElementById('download-format');
    var hidden = document.querySelector('.clipboard-hidden');
    if (type === 'polyline') {
        if (medium.value === 'clip') writeToClipboard(getPolylineFromPath())
        if (medium.value === 'txt') writeToFile(getPolylineFromPath(), 'polyline.txt');
    }
    if (type === 'cords') {
        var nl = document.getElementById('new_lines').checked;
        var cords = getCordsFromPath(path);
        if (medium.value === 'clip') writeToClipboard(exportCords(cords,'arr', nl));
        if (medium.value === 'csv') writeToFile(exportCords(cords, 'csv'), 'polyline.csv');
        if (medium.value === 'arr') writeToFile(exportCords(cords,'arr', nl), 'polyline_array.txt');
        if (medium.value === 'obj') writeToFile(exportCords(cords,'obj', nl), 'polyline_object.txt');
        // downloadFormatChanged(medium);
    }
}



function writeToClipboard(text) {
    toast('Copied to clipboard!', 3000);
    simplecopy(text);
}

function writeToFile(text, fileName) {
    var d = Object.assign(document.createElement('a'), {
        className: 'export-hidden',
        href: `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`,
        download: fileName
    });
    toast('Downloading ' + fileName);
    document.body.appendChild(d);
    d.click();
    document.body.removeChild(d);
}