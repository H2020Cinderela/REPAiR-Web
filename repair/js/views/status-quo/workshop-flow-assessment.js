define(['views/baseview', 'underscore',
        'collections/gdsecollection', 'models/indicator',
        'visualizations/map', 'openlayers', 'chroma-js', 'utils/utils'],

function(BaseView, _, GDSECollection, Indicator, Map, ol, chroma, utils){
/**
*
* @author Christoph Franke
* @name module:views/FlowAssessmentWorkshopView
* @augments module:views/BaseView
*/
var FlowAssessmentWorkshopView = BaseView.extend(
    /** @lends module:views/FlowsView.prototype */
    {

    /**
    * render workshop mode for flow assessment
    *
    * @param {Object} options
    * @param {HTMLElement} options.el                     element the view will be rendered in
    * @param {string} options.template                    id of the script element containing the underscore template to render this view
    * @param {module:models/CaseStudy} options.caseStudy  the casestudy to add layers to
    *
    * @constructs
    * @see http://backbonejs.org/#View
    */
    initialize: function(options){
        FlowAssessmentWorkshopView.__super__.initialize.apply(this, [options]);
        var _this = this;
        this.caseStudy = options.caseStudy;
        this.keyflowId = options.keyflowId;
        this.indicators = new GDSECollection([], { 
            apiTag: 'flowIndicators',
            apiIds: [this.caseStudy.id, this.keyflowId ],
            comparator: 'name',
            model: Indicator
        });
        this.areaLevels = new GDSECollection([], { 
            apiTag: 'arealevels',
            apiIds: [this.caseStudy.id],
            comparator: 'level'
        });
        this.areas = {};
        this.areaSelects = {};
        this.areaSelectIdCnt = 0;
        this.selectedAreas = [];

        this.loader.activate();
        var promises = [
            this.indicators.fetch(),
            this.areaLevels.fetch()
        ]
        Promise.all(promises).then(function(){
            _this.indicators.sort();
            _this.loader.deactivate();
            _this.render();
        })
    },

    /*
    * dom events (managed by jquery)
    */
    events: {
        'change select[name="indicator"]': 'computeIndicator',
        'change select[name="spatial-level-select"]': 'computeIndicator',
        'click #add-area-select-item-btn': 'addAreaSelectItem',
        'click button.remove-item': 'removeAreaSelectItem',
        'click button.select-area': 'showAreaModal',
        'click .area-select.modal .confirm': 'confirmAreaSelection',
        'change select[name="level-select"]': 'changeAreaLevel'
    },

    /*
    * render the view
    */
    render: function(){
        var _this = this,
            html = document.getElementById(this.template).innerHTML,
            template = _.template(html);
        this.el.innerHTML = template({indicators: this.indicators, 
                                      levels: this.areaLevels});
        this.indicatorSelect = this.el.querySelector('select[name="indicator"]');
        this.levelSelect = this.el.querySelector('select[name="spatial-level-select"]');
        this.elLegend = this.el.querySelector('.legend');
        this.areaSelectRow = this.el.querySelector('#indicator-area-row');
        this.addAreaSelectBtn = this.el.querySelector('#add-area-select-item-btn');
        
        this.renderIndicatorMap();
        this.renderAreaModal();
        this.addFocusAreaItem();
    },
    
    computeIndicator: function(){
        var indicatorId = this.indicatorSelect.value,
            levelId = this.levelSelect.value,
            _this = this;
        // one of the selects is not set to sth. -> nothing to render
        if (indicatorId == -1 || levelId == -1) return;
        
        var indicator = this.indicators.get(indicatorId);;
        
        function fetchCompute(areas){
            var areaIds = areas.pluck('id');
            
            indicator.compute({
                data: { areas: areaIds.join(',') },
                success: function(data){ 
                    _this.loader.deactivate();
                    _this.renderIndicator(data, areas, indicator) 
                },
                error: _this.onError
            })
        }
        this.loader.activate();
        this.getAreas(levelId, fetchCompute);
    },
    
    getAreas: function(level, onSuccess){
        var areas = this.areas[level],
            _this = this;
        if (areas != null) {
            onSuccess(areas);
            return;
        }
        areas = this.areas[level] = new GDSECollection([], { 
            apiTag: 'areas',
            apiIds: [ this.caseStudy.id, level ]
        });
        areas.fetch({
            success: function(areas){
                var promises = [];
                areas.forEach(function(area){
                    promises.push(
                        area.fetch({ error: _this.onError })
                    )
                });
                Promise.all(promises).then(function(){
                    onSuccess(areas);
                });
            },
            error: this.onError
        });
    },
    
    renderIndicator: function(data, areas, indicator){
        var _this = this,
            values = {},
            minValue = 0,
            maxValue = 0,
            unit = indicator.get('unit');
        data.forEach(function(d){
            var value = Math.round(d.value)
            values[d.area] = value;
            maxValue = Math.max(value, maxValue);
            minValue = Math.min(value, minValue);
        })
        
        var colorRange = chroma.scale(['#edf8b1', '#7fcdbb', '#2c7fb8']) //'Spectral')//['yellow', 'navy'])
                               .domain([minValue, maxValue]);
        var step = (maxValue - minValue) / 10,
            entries = utils.range(minValue, maxValue, step);
            
        this.elLegend.innerHTML = '';
        entries.forEach(function(entry){
            var color = colorRange(entry).hex(),
                square = document.createElement('div'),
                label = document.createElement('label');
            square.style.height = '25px';
            square.style.width = '50px';
            square.style.float = 'left';
            square.style.backgroundColor = color;
            label.innerHTML = Math.round(entry) + ' ' + unit;
            _this.elLegend.appendChild(square);
            _this.elLegend.appendChild(label);
            _this.elLegend.appendChild(document.createElement('br'));
        })
        this.map.addLayer(
            'areas', 
            { 
                stroke: 'rgb(100, 150, 250)',
                //strokeWidth: 3,
                fill: 'rgba(100, 150, 250, 0.5)',
                colorRange: colorRange,
                //alphaFill: 0.8
            }
        );
        areas.forEach(function(area){
            var coords = area.get('geometry').coordinates,
                name = area.get('name'),
                value = values[area.id]
            _this.map.addPolygon(coords, { 
                projection: 'EPSG:4326', layername: 'areas', 
                type: 'MultiPolygon', tooltip: name + ': ' + value + ' ' + unit,
                label: value + ' ' + unit, id: area.id,
                value: value
            });
        })
        this.map.centerOnLayer('areas');
    },
    
    renderAreaBox: function(el, id, title, fontSize){
        var html = document.getElementById('row-box-template').innerHTML,
            template = _.template(html),
            div = document.createElement('div');
        div.innerHTML = template({
            title: title, 
            fontSize: fontSize || '60px',
            id: id
        });
        el.insertBefore(div, this.addAreaSelectBtn);
        div.classList.add('item');
        div.dataset['id'] = id;
        return div;
    },
    
    addAreaSelectItem: function(){
        var id = this.areaSelectIdCnt;
        this.renderAreaBox(
            this.areaSelectRow, id, this.areaSelectIdCnt);
        this.areaSelects[id] = {
            areas: [],
            level: this.areaLevels.first().id
        }
        this.areaSelectIdCnt += 1;
        
    },
    
    addFocusAreaItem: function(){
        var div = this.renderAreaBox(
                this.areaSelectRow, this.areaSelectIdCnt, 
                'Focus <br> Area', '40px'
            ),
            buttons = div.querySelectorAll('button');
        this.areaSelectIdCnt += 1
        for(var i = 0; i < buttons.length; i++)
            buttons[i].style.display = 'none';
    },
    
    removeAreaSelectItem: function(evt){
        var id = evt.target.dataset['id'],
            div = this.areaSelectRow.querySelector('div.item[data-id="' + id + '"]');
        delete this.areaSelects[id];
        this.areaSelectRow.removeChild(div);
    },
    
    renderIndicatorMap: function(){
        var _this = this;
        this.map = new Map({
            el: document.getElementById('indicator-map')
        });
        var focusarea = this.caseStudy.get('properties').focusarea;

        // add polygon of focusarea to both maps and center on their centroid
        if (focusarea != null){
            var poly = new ol.geom.Polygon(focusarea.coordinates[0]);
            this.map.centerOnPolygon(poly, { projection: this.projection });
        };
    },
    
    renderAreaModal: function(){
        this.areaModal = this.el.querySelector('.area-select.modal');
        var html = document.getElementById('area-select-modal-template').innerHTML,
            template = _.template(html),
            _this = this;
        this.areaModal.innerHTML = template({ levels: this.areaLevels });
        this.areaLevelSelect = this.areaModal.querySelector('select[name="level-select"]');
        this.areaMap = new Map({
            el: this.areaModal.querySelector('.map'), 
        });
        this.areaMap.addLayer(
            'areas', 
            { 
                stroke: 'rgb(100, 150, 250)', 
                fill: 'rgba(100, 150, 250, 0.5)',
                select: {
                    selectable: true,
                    stroke: 'rgb(230, 230, 0)', 
                    fill: 'rgba(230, 230, 0, 0.5)',
                    onChange: function(areaFeats){
                        var modalSelDiv = _this.el.querySelector('.selections'),
                            levelId = _this.areaLevelSelect.value
                            labels = [],
                            areas = _this.areas[levelId];
                        areaFeats.forEach(function(areaFeat){
                            labels.push(areaFeat.label);
                            _this.selectedAreas.push(areas.get(areaFeat.id));
                        });
                        modalSelDiv.innerHTML = labels.join(', ');
                    }
                }
            }
        );
        // event triggered when modal dialog is ready -> trigger rerender to match size
        $(this.areaModal).on('shown.bs.modal', function () {
            _this.areaMap.map.updateSize();
        });
    },
    
    showAreaModal: function(evt){
        var id = evt.target.dataset['id'],
            level = this.areaSelects[id].level,
            _this = this;
        this.selectedAreas = [];
        this.activeAreaSelectId = id;
        this.areaLevelSelect.value = level;
        this.drawAreas(level);
        var labels = [];
        this.areaSelects[id].areas.forEach(function(area){
            labels.push(area.get('name'));
            _this.areaMap.selectFeature('areas', area.id);
        })
        this.el.querySelector('.selections').innerHTML = labels.join(', ');
        $(this.areaModal).modal('show');
    },
    
    changeAreaLevel: function(evt){
        var level = evt.target.value;
        this.selectedAreas = [];
        this.el.querySelector('.selections').innerHTML = '';
        this.drawAreas(level);
    },
    
    drawAreas: function(level){
        var _this = this;
        this.areaMap.clearLayer('areas');
        var loader = new utils.Loader(this.areaModal, {disable: true});
        function draw(areas){
            areas.forEach(function(area){
                var coords = area.get('geometry').coordinates,
                    name = area.get('name');
                _this.areaMap.addPolygon(coords, { 
                    projection: 'EPSG:4326', layername: 'areas', 
                    type: 'MultiPolygon', tooltip: name,
                    label: name, id: area.id
                });
            })
            loader.deactivate();
            _this.areaMap.centerOnLayer('areas');
        }
        loader.activate();
        this.getAreas(level, draw);
    },
    
    confirmAreaSelection: function(){
        var id = this.activeAreaSelectId;
        this.areaSelects[id].areas = this.selectedAreas;
        this.areaSelects[id].level = this.areaLevelSelect.value;
        var button = this.el.querySelector('button.select-area[data-id="' + id + '"]')
        if (this.selectedAreas.length > 0){
            button.classList.remove('btn-warning');
            button.classList.add('btn-primary');
        } else {
            button.classList.add('btn-warning');
            button.classList.remove('btn-primary');
        }
    }
    
});
return FlowAssessmentWorkshopView;
}
);