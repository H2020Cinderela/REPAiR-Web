module.exports = {
    clearSelect: function(select, stop){
        var stop = stop || 0;
        for(var i = select.options.length - 1 ; i >= stop ; i--) { select.remove(i); }
    },

    formatCoords: function(c){
        return c[0].toFixed(2) + ', ' + c[1].toFixed(2);
    },
    
    // make tree out of list with children referencing to their parents by attribute
    //
    // options.parentAttr  name of attribute referencing to parent
    // options.relAttr  name of attribute the parentAttr references to
    treeify: function(list, options) {
        var options = options || {},
            treeList = [],
            lookup = {};
            
        var relAttr = options.relAttr || 'id',
            parentAttr = options.parentAttr || 'parent';
        list.forEach(function(item) {
            lookup[item[relAttr]] = item;
        });
        list.forEach(function(item) {
            if (item[parentAttr] != null) {
                lookupParent = lookup[item[parentAttr]]
                if (!lookupParent['nodes']) lookupParent['nodes'] = [];
                lookupParent['nodes'].push(item);
            } else {
                treeList.push(item);
            }
        });
        return treeList;
    }
}