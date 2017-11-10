require(['./libs/domReady!', './require-config'], function (doc, config) {
  require(['jquery', 'app/models/casestudy', 'app/views/admin-data-entry',
           'app/views/admin-data-view', 'app/collections/flows', 
           'app/collections/activitygroups', 'app/collections/materials'], 
  function ($, CaseStudy, DataEntryView, DataView, Flows, ActivityGroups,
            Materials) {
  
    var caseStudySelect = document.getElementById('case-studies-select');
    var materialSelect = document.getElementById('flows-select');
    
    var dataView;
    var dataEntryView;
    var materials;
  
    var renderDataView = function(event){
      var caseStudyId = caseStudySelect.options[caseStudySelect.selectedIndex].value;
      var materialId = materialSelect.options[materialSelect.selectedIndex].value;
      var groupToGroup = new Flows([], {caseStudyId: caseStudyId, 
                                        materialId: materialId});
      if (dataView != null)
        dataView.close();
      
      var activityGroups = new ActivityGroups({caseStudyId: caseStudyId});
      dataView = new DataView({
        el: document.getElementById('data-view'),
        template: 'data-view-template',
        collection: groupToGroup,
        activityGroups: activityGroups
      });
    };
    
    // render data entry for currently selected casestudy
    var renderDataEntry = function(caseStudyId){
      if (dataEntryView != null)
        dataEntryView.close();
        
      // create casestudy-object and render view on it (data will be fetched in view)
      var caseStudy = new CaseStudy({id: caseStudyId});
      console.log(caseStudy)
      dataEntryView = new DataEntryView({
        el: document.getElementById('data-entry'),
        template: 'data-entry-template',
        model: caseStudy
      });
    };
    
    var onCaseStudyChange = function(){
      var caseStudyId = caseStudySelect.options[caseStudySelect.selectedIndex].value;
      materials = new Materials({caseStudyId: caseStudyId});
      materialSelect.disabled = true;
      materials.fetch({success: function(){
        for(var i = materialSelect.options.length - 1 ; i >= 0 ; i--){
          materialSelect.remove(i);
        }
        materials.each(function(material){
          var option = document.createElement("option");
          option.text = material.get('material').code;
          option.value = material.id;
          materialSelect.add(option);
        });
        materialSelect.disabled = false;
        renderDataEntry(caseStudyId);
        renderDataView();
      }});
    }
  
    var refreshButton = document.getElementById('refresh-view-btn');
    
    // selection of casestudy changed -> render new view
    caseStudySelect.addEventListener('change', onCaseStudyChange);
    materialSelect.addEventListener('change', renderDataView);
    refreshButton.addEventListener('click', renderDataView);
    
    // initially show first case study (selected index 0)
    onCaseStudyChange();
  });
});