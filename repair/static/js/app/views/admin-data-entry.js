define(['jquery', 'backbone',
        'app/views/admin-edit-node', 'app/collections/activitygroups',
        'app/collections/activities', 'app/collections/actors',
        'treeview', 'app/loader'],
function($, Backbone, EditNodeView, ActivityGroups,
         Activities, Actors, treeview){

  /**
   *
   * @desc    view on edit flows of a single casestudy
   *
   * @param   options.el     html-element the view will be rendered in
   * @param   options.model  backbone-model of the casestudy
   *
   * @return  the EditFlowsView class (for chaining)
   * @see     tabs for data-entry (incl. a tree with available nodes to edit),
   *          sankey-diagram visualising the data and verification of nodes
   */
  var DataEntryView = Backbone.View.extend({
    // the id of the script containing the template for this view

    /*
     * view-constructor
     */
    initialize: function(){
      _.bindAll(this, 'render');
      _.bindAll(this, 'renderDataTree');

      var caseStudyId = this.model.id;

      // collections of nodes associated to the casestudy
      this.activityGroups = new ActivityGroups({caseStudyId: caseStudyId});
      this.activities = new Activities({caseStudyId: caseStudyId});
      this.actors = new Actors({caseStudyId: caseStudyId});

      // render the view after successfully retrieving the data of the casestudy
      this.model.fetch({success: this.render});
    },

    /*
     * dom events (managed by jquery)
     */
    events: {},

    /*
     * render the view
     */
    render: function(){
      var _this = this;

      // render the tree conatining all nodes
      // after fetching their data, show loader-symbol while fetching
      var loader = new Loader(this.el);
      this.activityGroups.fetch().then(function(){
        _this.activities.fetch().then(function(){
          _this.actors.fetch().then(function(){
            _this.renderDataTree();
            loader.remove();
          });
        });
      });

    },

    /*
     * render the tree with nodes associated to the casestudy
     */
    renderDataTree: function(){
      var _this = this;
      var dataDict = {};
      var activityDict = {};

      this.actors.each(function(actor){
        var node = {
          text: actor.get('name'),
          icon: 'glyphicon glyphicon-user',
          model: actor,
          state: {checked: false}
        };
        var activity_id = actor.get('activity_id');
        if (!(activity_id in activityDict))
          activityDict[activity_id] = [];
        activityDict[activity_id].push(node);
      });

      this.activityGroups.each(function(group){
        var node = {
          text: group.get('code') + ": " + group.get('name'),
          model: group,
          icon: 'glyphicon glyphicon-tasks',
          nodes: [],
          state: {checked: false}
        };
        dataDict[group.id] = node;
      });

      this.activities.each(function(activity){
        var id = activity.get('id');
        var nodes = (id in activityDict) ? activityDict[id]: [];
        var node = {
          text: activity.get('name'),
          model: activity,
          icon: 'glyphicon glyphicon-cog',
          nodes: nodes,
          state: {checked: false}
        };
        dataDict[activity.get('activitygroup')].nodes.push(node)
      });

      var dataTree = [];
      for (key in dataDict){
        dataTree.push(dataDict[key]);
      };

      // render view on node on click in data-tree
      var onClick = function(event, node){
        _this.renderDataEntry(node.model);
      };
      var divid = '#data-tree';
      $(divid).treeview({data: dataTree, showTags: true,
                         selectedBackColor: '#aad400',
                         onNodeSelected: onClick,
                         showCheckbox: true});
      $(divid).treeview('collapseAll', {silent: true});
    },

    /**
    * render the edit-view on a node
    *
    * @param model  backbone-model of the node
    */
    renderDataEntry: function(model){
      if (this.editNodeView != null){
        this.editNodeView.close();
      };
      // currently selected material
      var flowSelect = document.getElementById('flows-select');
      this.editNodeView = new EditNodeView({
        el: document.getElementById('data-entry'),
        template: 'edit-node-template',
        model: model,
        material: flowSelect.value
      });
    },

    /*
     * remove this view from the DOM
     */
    close: function(){
      this.undelegateEvents(); // remove click events
      this.unbind(); // Unbind all local event bindings
      this.el.innerHTML = ''; // Remove view from DOM
    },

  });
  return DataEntryView;
});