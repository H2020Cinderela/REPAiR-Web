define(['backbone', 'underscore', 'collections/layercategories', 
    'collections/layers', 'models/layer', 'visualizations/map', 
    'utils/loader', 'app-config', 'bootstrap-colorpicker'],

function(Backbone, _, LayerCategories, Layers, Layer, Map, Loader, config){
    /**
    *
    * @author Christoph Franke
    * @name module:views/BaseMapsView
    * @augments Backbone.View
    */
    var BaseMapsView = Backbone.View.extend(
        /** @lends module:views/BaseMapsView.prototype */
        {
        
        includedOnly: true,
        categoryBackColor: '#aad400',
        categoryColor: 'white',
        categoryExpanded: false,
        selectedBackColor: null,
        selectedColor: null,

        /**
        * render view to add layers to casestudy
        *
        * @param {Object} options
        * @param {HTMLElement} options.el                          element the view will be rendered in
        * @param {string} options.template                         id of the script element containing the underscore template to render this view
        * @param {module:models/CaseStudy} options.caseStudy       the casestudy to add layers to
        *
        * @constructs
        * @see http://backbonejs.org/#View
        */
        initialize: function(options){
            var _this = this;
            // make sure 'this' references to this view when functions are called
            // from different context
            _.bindAll(this, 'render');
            _.bindAll(this, 'nodeSelected');
            _.bindAll(this, 'nodeUnselected');
            _.bindAll(this, 'nodeChecked');
            _.bindAll(this, 'nodeUnchecked');
            _.bindAll(this, 'nodeCollapsed');
            _.bindAll(this, 'nodeExpanded');

            this.template = options.template;
            this.caseStudy = options.caseStudy;

            this.projection = 'EPSG:4326'; 

            var WMSResources = Backbone.Collection.extend({ 
                url: config.api.wmsresources.format(this.caseStudy.id) 
            })

            this.wmsResources = new WMSResources();
            this.layerCategories = new LayerCategories([], { caseStudyId: this.caseStudy.id });

            this.categoryTree = {};
            this.layerPrefix = 'service-layer-';
            this.legendPrefix = 'layer-legend-';

            var loader = new Loader(this.el, {disable: true});
            this.layerCategories.fetch({ success: function(){
                loader.remove();
                _this.initTree();
            }})
        },

        /*
        * dom events (managed by jquery)
        */
        events: {
        },

        initTree: function(){
            var _this = this;
            var deferred = [],
                layerList = [];
            console.log(this.includedOnly)
            queryParams = (this.includedOnly) ? {included: 'True'} : {};
            // put nodes for each category into the tree and prepare fetching the layers
            // per category
            this.layerCategories.each(function(category){
                var layers = new Layers([], { caseStudyId: _this.caseStudy.id, 
                    layerCategoryId: category.id });
                var node = { 
                    text: category.get('name'), 
                    category: category,
                    state: { checked: true, expanded: _this.categoryExpanded },
                    backColor: _this.categoryBackColor,
                    color: _this.categoryColor
                };
                _this.categoryTree[category.id] = node;
                layerList.push(layers);
                deferred.push(layers.fetch({ data: queryParams }));
            });
            // fetch prepared layers and put informations into the tree nodes
            $.when.apply($, deferred).then(function(){
                layerList.forEach(function(layers){
                    var catNode = _this.categoryTree[layers.layerCategoryId];
                    var children = [];
                    layers.each(function(layer){
                        var node = { 
                            layer: layer, 
                            text: layer.get('name'), 
                            icon: 'fa fa-bookmark',
                            state: { checked: layer.get('included') } 
                        };
                        children.push(node);
                    });
                    catNode.nodes = children;
                });
                _this.render();
            })
        },
        
        /*
        * render the view
        */
        render: function(){
            this.renderTemplate();
            this.renderMap();
            this.renderDataTree();
        },
        
        renderTemplate: function(){
            var html = document.getElementById(this.template).innerHTML,
                template = _.template(html);
            this.el.innerHTML = template();
            this.layerTree = document.getElementById('layer-tree');
            this.legend = document.getElementById('legend');
        },
        
        /*
        * render the hierarchic tree of layers, preselect category with given id (or first one)
        */
        renderDataTree: function(categoryId){
            if (Object.keys(this.categoryTree).length == 0) return;

            var _this = this;
            var dataDict = {};
            var tree = [];

            _.each(this.categoryTree, function(category){
                tree.push(category)
            })

            require('libs/bootstrap-treeview.min');
      
            $(this.layerTree).treeview({
                data: tree, showTags: true,
                selectedBackColor: this.selectedBackColor,
                selectedColor: this.selectedColor,
                expandIcon: 'glyphicon glyphicon-triangle-right',
                collapseIcon: 'glyphicon glyphicon-triangle-bottom',
                onNodeSelected: this.nodeSelected,
                onNodeUnselected: this.nodeUnselected,// function(event, node){ select(event, node, true) },
                onNodeChecked: this.nodeChecked,
                onNodeUnchecked: this.nodeUnchecked,
                onNodeCollapsed: this.nodeCollapsed, //function(event, node){ select(event, node, false) },
                onNodeExpanded: this.nodeExpanded,//function(event, node){ select(event, node, false) },
                showCheckbox: true
            });

            // look for and expand and select node with given category id
            if (categoryId != null){
                // there is no other method to get all nodes or to search for an attribute
                var nodes = $(this.layerTree).treeview('getEnabled');
                _.forEach(nodes, function(node){
                    if (node.category && (node.category.id == categoryId)){
                        selectNodeId = node.nodeId; 
                        $(_this.layerTree).treeview('selectNode', selectNodeId);
                        return false;
                    }
                })
            }
        },
        
        nodeSelected: function(event, node){
            // unselect node, so that this function is triggered on continued clicking
            $(this.layerTree).treeview('unselectNode',  [node.nodeId, { silent: true }]);
            // expand/collapse category on click
            if (node.category){
                var f = (node.state.expanded) ? 'collapseNode' : 'expandNode';
                $(this.layerTree).treeview(f,  node.nodeId);
            }
            
            // check/uncheck layer on click
            else {
                var f = (node.state.checked) ? 'uncheckNode' : 'checkNode';
                $(this.layerTree).treeview(f,  node.nodeId);
            }
        },
        
        nodeUnselected: function(event, node){
        },
        
        nodeChecked: function(event, node){
            var _this = this;
            if (node.layer){
                this.map.setVisible(this.layerPrefix + node.layer.id, true);
                var legendDiv = document.getElementById(this.legendPrefix + node.layer.id);
                console.log(legendDiv)
                if (legendDiv) legendDiv.style.display = 'block';
            }
            // check all layers in category
            else {
                node.nodes.forEach(function(child){
                    $(_this.layerTree).treeview('checkNode',  child.nodeId);
                })
            }
        },
        
        nodeUnchecked: function(event, node){
            var _this = this;
            if (node.layer){
                this.map.setVisible(this.layerPrefix + node.layer.id, false);
                var legendDiv = document.getElementById(this.legendPrefix + node.layer.id);
                if (legendDiv) legendDiv.style.display = 'none';
            }
            // uncheck all layers in category
            else {
                node.nodes.forEach(function(child){
                    $(_this.layerTree).treeview('uncheckNode',  child.nodeId);
                })
            }
        },
        
        nodeCollapsed: function(event, node){
        
        },
        
        nodeExpanded: function(event, node){
        
        },

        renderMap: function(){
            var _this = this;
            this.map = new Map({
                divid: 'base-map', 
                renderOSM: false
            });
            var focusarea = this.caseStudy.get('properties').focusarea;

            this.map.addLayer('focus', {
                stroke: '#aad400',
                fill: 'rgba(170, 212, 0, 0.1)',
                strokeWidth: 1,
                zIndex: 1000
            });
            // add polygon of focusarea to both maps and center on their centroid
            if (focusarea != null){
                var poly = this.map.addPolygon(focusarea.coordinates[0], { projection: this.projection, layername: 'focus', tooltip: gettext('Focus area') });
                this.map.addPolygon(focusarea.coordinates[0], { projection: this.projection, layername: 'focus', tooltip: gettext('Focus area') });
                this.centroid = this.map.centerOnPolygon(poly, { projection: this.projection });
                this.map.centerOnPolygon(poly, { projection: this.projection });
            };
            // get all layers and render them
            Object.keys(this.categoryTree).forEach(function(catId){
                var children = _this.categoryTree[catId].nodes;
                children.forEach(function(node){ _this.addServiceLayer(node.layer) } );
            })
        },

        addServiceLayer: function(layer){
            this.map.addServiceLayer(this.layerPrefix + layer.id, { 
                opacity: 1,
                zIndex: layer.get('z_index'),
                visible: layer.get('included'),
                url: config.views.layerproxy.format(layer.id),
                //params: {'layers': layer.get('service_layers')}//, 'TILED': true, 'VERSION': '1.1.0'},
            });
            var uri = layer.get('legend_uri');
            if (uri) {
                var legendDiv = document.createElement('li'),
                    head = document.createElement('b'),
                    img = document.createElement('img');
                legendDiv.id = this.legendPrefix + layer.id;
                head.innerHTML = layer.get('name');
                img.src = uri;
                var itemsDiv = this.legend.querySelector('.items');
                itemsDiv.appendChild(legendDiv);
                legendDiv.appendChild(head);
                legendDiv.appendChild(img);
                if (!layer.get('included'))
                    legendDiv.style.display = 'none';
            }
        },

        /*
        * remove this view from the DOM
        */
        close: function(){
            this.undelegateEvents(); // remove click events
            this.unbind(); // Unbind all local event bindings
            this.el.innerHTML = ''; //empty the DOM element
        },

    });
    return BaseMapsView;
}
);