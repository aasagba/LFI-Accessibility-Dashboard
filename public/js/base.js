var stIsIE = /*@cc_on!@*/false, table, asc1 = 1,asc2 = 1,asc3 = 1,asc4 = 1,asc5 = 1,asc6 = 1,sorthtml = "",sortable_class = "";

window.onload = function () {
    table = document.getElementById("tasks");
}

function sort_table(tbody, col, asc, e) {
    //console.log("tbody: " + tbody, "col: " + col, "asc: " + asc);

    sortable_class = e.srcElement.className;
    //console.log(sortable_class);

    // If table hasn't been sorted before change class to 'sorted'
    if (sortable_class === "unsorted") {
        sortable_class = sortable_class.replace('unsorted', 'sorted');
    }

    // add sorting Ascending class
    if (asc === 1) {
        //console.log("Sorting Ascending");
        sortable_class = sortable_class.replace('sorted', 'reverse-sorted');
        sorthtml = document.createElement('span');
        sorthtml.className = "sortasc";
        sorthtml.id = "sortasc";
        sorthtml.innerHTML = stIsIE ? '&nbsp<font face="webdings">6</font>' : '&nbsp;&#x25BE;';
        // remove previous 'sortdesc' class if exists
        $(".sortdesc").remove();

        // add sorting descending class
    } else {
        //console.log("Sorting Descending");
        sortable_class = sortable_class.replace('reverse-sorted', 'sorted');
        sorthtml = document.createElement('span');
        sorthtml.className = "sortdesc";
        sorthtml.id = "sortdesc";
        sorthtml.innerHTML = stIsIE ? '&nbsp<font face="webdings">5</font>' : '&nbsp;&#x25B4;';
        // remove previous 'sortasc' class if exists
        $(".sortasc").remove();
    }

    // add sorting classname to 'th' element
    e.srcElement.className = sortable_class;

    // append sort arrow to html
    if (sorthtml) {
        //console.log("sorthtml: " + sorthtml);
        $(e.srcElement).append(sorthtml);
    }

    var rows = tbody.rows,
        rlen = rows.length,
        arr = new Array(),
        i, j, cells, clen;
    // fill the array with values from the table
    for (i = 0; i < rlen; i++) {
        cells = rows[i].cells;

        clen = cells.length;
        arr[i] = new Array();
        for (j = 0; j < clen; j++) {
            arr[i][j] = cells[j].outerHTML;
            //console.log("arr["+i+"]: " + cells[j].outerHTML);
        }
    }
    // sort array by column number (col) and order (asc)
    parser=new DOMParser();

    arr.sort(function (a, b) {

        var valA = parser.parseFromString(a[col], "text/html");
        var valB = parser.parseFromString(b[col], "text/html");

        // Page & Grade linked text columns
        if (col === 0 || col === 1) {
            var innerHTML_A = valA.getElementsByTagName('a')[0].innerHTML;
            var innerHTML_B = valB.getElementsByTagName('a')[0].innerHTML;

            return (innerHTML_A == innerHTML_B) ? 0 : ((innerHTML_A > innerHTML_B) ? asc : -1 * asc);

            // Last Run text column
        } else if (col === 5) {
            var innerHTML_A = valA.getElementsByTagName('body')[0].innerHTML;
            var innerHTML_B = valB.getElementsByTagName('body')[0].innerHTML;

            return (innerHTML_A == innerHTML_B) ? 0 : ((innerHTML_A > innerHTML_B) ? asc : -1 * asc);

            // Number columns
        } else {
            var innerHTML_A = valA.getElementsByTagName('body')[0].innerHTML;
            var innerHTML_B = valB.getElementsByTagName('body')[0].innerHTML;

            if (asc === 1) {
                //console.log("ascending sort algorithm");
                return innerHTML_A - innerHTML_B;
            } else {
                //console.log("descending sort algorithm");
                return innerHTML_B - innerHTML_A;
            }
        }
    });

    tbody.innerHTML = makeTableHTML(arr);

    function makeTableHTML(myArray) {
        var result = "";

        for(var i=0; i<myArray.length; i++) {

            result += "<tr>";

            for(var j=0; j<myArray[i].length; j++){
                result += myArray[i][j];
            }
            result += "</tr>";
        }
        return result;
    }
}