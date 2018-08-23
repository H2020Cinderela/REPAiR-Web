define(['underscore', 'views/baseview', 'collections/gdsecollection',
        'collections/geolocations',
        'visualizations/flowmap', 'leaflet', 'leaflet-fullscreen',
        'leaflet.markercluster', 'leaflet.markercluster/dist/MarkerCluster.css',
        'leaflet.markercluster/dist/MarkerCluster.Default.css',
        'leaflet/dist/leaflet.css', 'static/css/flowmap.css',
        'leaflet-fullscreen/dist/leaflet.fullscreen.css'],

function(_, BaseView, GDSECollection, GeoLocations, FlowMap, L){

    /**
    *
    * @author Christoph Franke, Vilma Jochim
    * @name module:views/FlowSankeyMapView
    * @augments module:views/BaseView
    */
    var FlowSankeyMapView = BaseView.extend(
        /** @lends module:views/FlowSankeyView.prototype */
        {

        /**
        * view on a leaflet map with flows and nodes overlayed
        *
        * @param {Object} options
        * @param {HTMLElement} options.el      element the view will be rendered in
        *
        * @constructs
        * @see http://backbonejs.org/#View
        */
        initialize: function(options){
            FlowSankeyMapView.__super__.initialize.apply(this, [options]);
            _.bindAll(this, 'zoomed');
            this.render();
            this.caseStudyId = options.caseStudyId;
            this.keyflowId = options.keyflowId;
            this.materials = options.materials;

            this.locations = {};
            this.flows = {};
            this.actors = {};
        },

        /*
        * dom events (managed by jquery)
        */
        events: {
        },

        /*
        * render the view
        */
        render: function(){
            //this.backgroundLayer = new L.TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
            this.backgroundLayer = new L.TileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',{
                attribution: '© OpenStreetMap contributors, © CartoDB'
            });
            this.leafletMap = new L.Map(this.el, {
                    center: [52.41, 4.95],
                    zoomSnap: 0.25,
                    zoom: 10.5,
                    minZoom: 5,
                    maxZoom: 25
                })
                .addLayer(this.backgroundLayer);
            this.flowMap = new FlowMap(this.leafletMap);
            this.leafletMap.addControl(new L.Control.Fullscreen({position:'topright'}));
            this.leafletMap.on("zoomend", this.zoomed);

            var displayMaterial = L.control({position: 'bottomleft'});
            this.materialCheck = document.createElement('input');
            this.animationCheck = document.createElement('input');
            this.clusterCheck = document.createElement('input');

            var div = document.createElement('div'),
                matLabel = document.createElement('label'),
                aniLabel = document.createElement('label'),
                clusterLabel = document.createElement('label'),
                _this = this;

            matLabel.innerHTML = gettext('Display materials');
            aniLabel.innerHTML = gettext('Animate flows');
            clusterLabel.innerHTML = gettext('Cluster locations');

            this.materialCheck.type = "checkbox";
            this.materialCheck.classList.add('form-control');
            this.animationCheck.type = "checkbox";
            this.animationCheck.classList.add('form-control');
            this.clusterCheck.type = "checkbox";
            this.clusterCheck.classList.add('form-control');
            div.style.background = "rgba(255, 255, 255, 0.5)";
            div.style.padding = "10px";
            div.style.cursor = "pointer";

            div.appendChild(this.materialCheck);
            div.appendChild(matLabel);
            div.appendChild(this.animationCheck);
            div.appendChild(aniLabel);
            div.appendChild(this.clusterCheck);
            div.appendChild(clusterLabel);

            displayMaterial.onAdd = function (map) {
                return div;
            };
            displayMaterial.addTo(this.leafletMap);

            this.materialCheck.addEventListener ("click", function(){
                _this.data = _this.transformData(
                    _this.actors, _this.flows, _this.locations,
                    { splitByComposition: this.checked }
                );
                _this.toggleMaterialLegend(this.checked);
                _this.setMapData(_this.data, false);
            });
            this.clusterCheck.addEventListener ("click", function(){
                _this.toggleCluster(this.checked);
            });

            this.animationCheck.addEventListener ("click", function(){
                _this.flowMap.setAnimation(this.checked);
            });

            var legendControl = L.control({position: 'bottomright'});
            this.legend = document.createElement('div');
            this.legend.style.background = "rgba(255, 255, 255, 0.5)";
            legendControl.onAdd = function () { return _this.legend; };
            legendControl.addTo(this.leafletMap);
        },

        toggleMaterialLegend(show){
            this.legend.innerHTML = '';
            if(show){
                var matColors = this.data.materialColors;
                for (var matId in matColors){
                    var material = this.materials.get(matId),
                        color = matColors[matId],
                        div = document.createElement('div'),
                        circle = document.createElement('div');
                    div.innerHTML = material.get('name');
                    circle.style.width = '10px';
                    circle.style.height = '10px';
                    circle.style.background = color;
                    circle.style.float = 'left';
                    div.appendChild(circle);
                    this.legend.appendChild(div);
                }
            }
        },

        zoomed: function(){
            // zoomend always is triggered before clustering is done -> reset clusters
            this.clusterGroupsDone = 0;
        },

        toggleCluster(show){
            var _this = this;
            if (!this.data) return;
            // remove cluster layers from map
            this.leafletMap.eachLayer(function (layer) {
                if (layer !== _this.backgroundLayer)
                    _this.leafletMap.removeLayer(layer);
            });
            if (!show) {
                this.flowMap.draw();
                return;
            }
            this.flowMap.clear();
            var nodes = Object.values(_this.data.nodes),
                rmax = 30;
            _this.clusterGroups = {};
            var nClusterGroups = 0;
            // add cluster layers
            nodes.forEach(function(node){
                var clusterValue = node.color,
                    // ToDo: cluster by activitygroup/activity (instead of color)
                    group = _this.clusterGroups[clusterValue];
                if (!group){
                    var clusterGroup = new L.MarkerClusterGroup({
                        maxClusterRadius: 2 * rmax,
                        animate: false
                    });
                    group = {
                        color: node.color,
                        instance: clusterGroup
                    };
                    _this.clusterGroups[clusterValue] = group;
                    _this.leafletMap.addLayer(clusterGroup);
                    clusterGroup.on('animationend', function(){
                        _this.clusterGroupsDone++;
                        // all cluster animations are done -> transform data
                        // according to current clustering
                        if (_this.clusterGroupsDone === nClusterGroups){
                            var clusterData = _this.transformMarkerClusterData();
                            clusterData.flows = [];
                            _this.setMapData(clusterData, false);
                        }
                    })
                    nClusterGroups++;
                }
                var marker = L.marker([node['lat'], node['lon']], {
                    icon: L.divIcon(),
                    opacity: 0
                });
                marker.id = node.id;
                group.instance.addLayer(marker);
            });
        },

        setMapData: function(data, zoomToFit) {
            this.flowMap.clear();
            this.flowMap.addNodes(data.nodes);
            this.flowMap.addFlows(data.flows);
            if (zoomToFit) this.flowMap.zoomToFit();
            this.flowMap.draw();
        },

        rerender: function(zoomToFit){
            var _this = this;
            this.loader.activate();
            this.prefetchLocations(function(){
                var splitByComposition = _this.materialCheck.checked;
                _this.data = _this.transformData(
                    _this.actors, _this.flows, _this.locations,
                    { splitByComposition: splitByComposition }
                );
                _this.loader.deactivate();
                _this.setMapData(_this.data, true);
            })
        },

        addFlows: function(flows){
            var _this = this;
                flows = (flows instanceof Array) ? flows: [flows];
            flows.forEach(function(flow){
                _this.flows[flow.id] = flow;
            })
        },

        addNodes: function(nodes){
            var _this = this,
                nodes = (nodes instanceof Array) ? nodes: [nodes];
            nodes.forEach(function(node){
                _this.actors[node.id] = node;
            })
        },

        getNodes: function(){
            return Object.values(this.actors);
        },

        getFlows: function(){
            return Object.values(this.flows);
        },

        removeFlows: function(flows){
            var _this = this;
                flows = (flows instanceof Array) ? flows: [flows];
            flows.forEach(function(flow){
                delete _this.flows[flow.id];
            })
        },

        removeNodes: function(nodes, unusedOnly){
            var _this = this,
                nodes = (nodes instanceof Array) ? nodes: [nodes],
                usedNodes = new Set();
            if (unusedOnly) {
                Object.values(this.flows).forEach(function(flow){
                    usedNodes.add(flow.get('origin'));
                    usedNodes.add(flow.get('destination'));
                })
            }
            nodes.forEach(function(node){
                if (!usedNodes.has(node.id))
                    delete _this.actors[node.id];
            })
        },

        clear: function(){
            this.actors = {};
            this.flows = {};
            this.rerender();
        },

        prefetchLocations: function(callback){
            var nodeIds = [],
                _this = this;
            var adminLocations = new GeoLocations([], {
                apiTag: 'adminLocations',
                apiIds: [this.caseStudyId, this.keyflowId]
            });
            for (var nodeId in this.actors) {
                if (nodeId in _this.locations) continue;
                nodeIds.push(nodeId);
            }
            var data = {};
            data['actor__in'] = nodeIds.join(',');
            adminLocations.fetch({
                data: data,
                success: function(){
                    adminLocations.forEach(function(adminLoc){
                        id = adminLoc.get('properties').actor;
                        _this.locations[id] = adminLoc;
                    })
                    callback();
                }
            });
        },

        transformMarkerClusterData: function(){
            var clusters = [];
            Object.values(this.clusterGroups).forEach(function(clusterGroup){
                clusterGroup.instance._featureGroup.eachLayer(function(layer) {
                    if (layer instanceof L.MarkerCluster) {
                        var point = layer.getLatLng(),
                            cluster = {
                            ids: [],
                            color: clusterGroup.color,
                            lat: point.lat,
                            lon: point.lng
                        }
                        layer.getAllChildMarkers().forEach(function(marker){
                            cluster.ids.push(marker.id);
                        })
                        clusters.push(cluster);
                    }
                });
            })
            data = this.transformData(
                this.actors, this.flows, this.locations,
                {
                    splitByComposition: this.materialCheck.checked,
                    clusters: clusters
                }
            );
            return data;
        },

        /*
        * transform actors and flows to a json-representation
        * readable by the sankey-diagram
        *
        * options.splitByComposition - split flows by their compositions (aka materials) into seperate flows
        * options.clusters - array of objects with keys "lat", "lon" (location) and "ids" (array of actor ids that belong to that cluster)
        */
        transformData: function(actors, flows, locations, options) {

            var _this = this,
                options = options || {},
                nodes = [],
                links = [],
                clusters = options.clusters || [],
                splitByComposition = options.splitByComposition,
                clusterMap = {};
            var i = 0;
            clusters.forEach(function(cluster){
                var clusterNode = {
                    id: 'cluster' + i,
                    name: 'name',
                    label: cluster.ids.length,
                    color: 'red',
                    lon: cluster.lon,
                    lat: cluster.lat,
                    radius: 10 + cluster.ids.length
                }
                nodes.push(clusterNode);
                i++;
                cluster.ids.forEach(function(id){
                    clusterMap[id] = 'cluster' + i;
                })
            })

            for (var nodeId in actors) {
                // actor is clustered
                if (clusterMap[nodeId]) continue;

                var location = _this.locations[nodeId];
                if (!location) continue;
                var node = actors[nodeId],
                    location = _this.locations[nodeId],
                    geom = location.get('geometry');
                if (!geom) continue;

                var coords = geom.get('coordinates'),
                    lon = coords[0],
                    lat = coords[1];
                var transNode = {
                    id: nodeId,
                    name: node.get('name'),
                    label: node.get('name'),
                    color: node.color,
                    lon: lon,
                    lat: lat,
                    radius: 10
                }
                nodes.push(transNode)
            };

            var uniqueMaterials = new Set();
            var i = 0;
            for (var flowId in flows) {
                var flow = flows[flowId],
                    composition = flow.get('composition'),
                    sourceId = flow.get('origin'),
                    targetId = flow.get('destination'),
                    origin = actors[sourceId],
                    destination = actors[targetId];
                if(!origin || !destination) continue;

                var wasteLabel = (flow.get('waste')) ? '<b>Waste</b>b>' : '<b>Product</b>',
                    flowlabel = origin.get('name') + '&#10132; '  + destination.get('name') + '<br>' + wasteLabel,
                    totalAmount = flow.get('amount'),
                    labelTotal = flowlabel + ': ' + composition.name + '<b><br>Amount: </b>' + totalAmount + ' t/year';

                if(splitByComposition){
                    composition.fractions.forEach(function(fraction){
                        var material = _this.materials.get(fraction.material),
                            amount = totalAmount * fraction.fraction,
                            label = flowlabel + ': ' + composition.name + '<b><br>Material: </b>' + material.get('name') + '<b><br>Amount: </b>' + amount + ' t/year';
                        links.push({
                            id: flow.id,
                            label: label,
                            source: sourceId,
                            target: targetId,
                            value: amount,
                            material: material.id
                        })
                        uniqueMaterials.add(material.id);
                        i++;
                    })
                    //define colors for individual materials and store in styles
                    var materialColor = d3.scale.linear()
                        .range (["#4477AA", "#66CCEE","#228833","#CCBB44","#EE6677","#AA3377"])
                        .domain([0, 1/5*(uniqueMaterials.size-1), 2/5*(uniqueMaterials.size-1), 3/5*(uniqueMaterials.size-1), 4/5*(uniqueMaterials.size-1), (uniqueMaterials.size-1)])
                        .interpolate(d3.interpolateHsl);

                    var matColors = {};
                    i = 0;
                    uniqueMaterials.forEach(function (materialId) {
                        var color = materialColor(i);
                        matColors[materialId] = color;
                        i++;
                    });

                    links.forEach(function(link){
                        link.color = matColors[link.material];
                    })
                }
                else {
                    links.push({
                        id: flow.id,
                        label: labelTotal,
                        source: flow.get('origin'),
                        target: flow.get('destination'),
                        color: origin.color,
                        value: totalAmount
                    })
                    i++;
                }
            }

            return {
                flows: links,
                nodes: nodes,
                materialColors: matColors
            }
        }

    });
    return FlowSankeyMapView;
}
);
