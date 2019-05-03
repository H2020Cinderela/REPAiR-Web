require(['models/casestudy', 'models/gdsemodel', 'collections/gdsecollection',
         'views/strategy/workshop-solutions', 'views/strategy/modified-flows',
         'views/strategy/setup-solutions', 'views/strategy/setup-solutions-logic',
         'views/strategy/strategy', 'app-config', 'utils/utils', 'utils/overrides', 'base'
], function (CaseStudy, GDSEModel, GDSECollection, SolutionsWorkshopView,
             ModifiedFlowsView, SolutionsSetupView, SolutionsLogicView,
             StrategyView, appConfig, utils) {
    /**
     * entry point for views on subpages of "Changes" menu item
     *
     * @author Christoph Franke
     * @module Changes
     */

    var solutionsView, strategyView, solutionsLogicView;

    renderWorkshop = function(caseStudy, keyflow, strategy){
        if (solutionsView) solutionsView.close();
        var keyflowName = keyflow.get('name');
        solutionsView = new SolutionsWorkshopView({
            caseStudy: caseStudy,
            el: document.getElementById('solutions'),
            template: 'solutions-workshop-template',
            keyflowId: keyflow.id,
            keyflowName: keyflowName
        });
        if (strategyView) strategyView.close();
        var strategyView = new StrategyView({
            caseStudy: caseStudy,
            el: document.getElementById('strategy'),
            template: 'strategy-template',
            keyflowId: keyflow.id,
            keyflowName: keyflowName,
            strategy: strategy
        })

        if (modifiedFlowsView) modifiedFlowsView.close();
        var modifiedFlowsView = new ModifiedFlowsView({
            caseStudy: caseStudy,
            el: document.getElementById('modified-flows'),
            keyflowId: keyflow.id,
            template: 'workshop-flows-template',
            strategy: strategy
        })

        loader = new utils.Loader(document.getElementById('content'), {disable: true})
        // lazy way to reset the button to build graph
        var btn = document.getElementById('calculate-strategy'),
            note = document.getElementById('graph-note'),
            clone = btn.cloneNode(true);
        note.innerHTML = keyflow.get('graph_build') || '-';
        btn.parentNode.replaceChild(clone, btn);
        clone.addEventListener('click', function(){
            loader.activate();
            var url = '/api/casestudies/{0}/keyflows/{1}/strategies/{2}/build_graph/'.format(caseStudy.id, keyflow.id, strategy.id);
            fetch(url).then(
                function(response) {
                    if (!response.ok) {
                        response.text().then(alert);
                        throw Error(response.statusText);
                    }
                    loader.deactivate();
                    return response.json();
                }).then(function(json) {
                    note.innerHTML = json['graph_build'];
                    alert(gettext('Graph was successfully build.'));
                }).catch(function(error) {
                    loader.deactivate();
            });

        })
    }

    renderSetup = function(caseStudy, keyflow, solutions, categories){
        if(solutionsView) solutionsView.close();
        var keyflowName = keyflow.get('name');
        solutionsView = new SolutionsSetupView({
            caseStudy: caseStudy,
            el: document.getElementById('solutions'),
            template: 'solutions-setup-template',
            keyflowId: keyflow.id,
            keyflowName: keyflowName,
            solutions: solutions,
            categories: categories
        })
        if(solutionsLogicView) solutionsLogicView.close();
        solutionsLogicView = new SolutionsLogicView({
            caseStudy: caseStudy,
            el: document.getElementById('solutions-logic'),
            template: 'solutions-logic-template',
            keyflowId: keyflow.id,
            solutions: solutions,
            categories: categories
        })
        loader = new utils.Loader(document.getElementById('graph'), {disable: true})
        // lazy way to reset the button to build graph
        var btn = document.getElementById('build-graph'),
            note = document.getElementById('graph-note'),
            clone = btn.cloneNode(true);
        note.innerHTML = keyflow.get('graph_build') || '-';
        btn.parentNode.replaceChild(clone, btn);
        clone.addEventListener('click', function(){
            loader.activate();
            var url = '/api/casestudies/{0}/keyflows/{1}/build_graph/'.format(caseStudy.id, keyflow.id);
            fetch(url).then(
                function(response) {
                    if (!response.ok) {
                        throw Error(response.statusText);
                    }
                    loader.deactivate();
                    return response.json();
                }).then(function(json) {
                    note.innerHTML = json['graph_build'];
                    alert(gettext('Graph was successfully build.'));
                }).catch(function(error) {
                    alert(error);
                    loader.deactivate();
            });

        })
    };

    function render(caseStudy, mode){
        var keyflowSelect = document.getElementById('keyflow-select'),
            session = appConfig.session;
        document.getElementById('keyflow-warning').style.display = 'block';
        keyflowSelect.disabled = false;

        function renderKeyflow(keyflowId){
            var keyflow = new GDSEModel(
                {id: keyflowId},
                {
                    apiTag: 'keyflowsInCaseStudy',
                    apiIds: [caseStudy.id]
                }
            )
            keyflow.fetch({
                success: function(){

                    var strategies = new GDSECollection([], {
                        apiTag: 'strategies',
                        apiIds: [caseStudy.id, keyflowId]
                    });
                    strategies.fetch({
                        success: function(){
                            // there is only one strategy allowed per user
                            var strategy = strategies.first();
                            document.getElementById('keyflow-warning').style.display = 'none';
                            if (Number(mode) == 1){
                                var loader = new utils.Loader(document.getElementById('content'),
                                                             { disable: true });
                                var solutions = new GDSECollection([], {
                                    apiTag: 'solutions',
                                    apiIds: [caseStudy.id, keyflowId],
                                    comparator: 'name'
                                });
                                var categories = new GDSECollection([], {
                                    apiTag: 'solutionCategories',
                                    apiIds: [caseStudy.id, keyflowId]
                                });
                                loader.activate();
                                Promise.all([solutions.fetch(), categories.fetch()]).then(function(){
                                    solutions.sort();
                                    renderSetup(caseStudy, keyflow, solutions, categories);
                                    loader.deactivate();
                                })
                            }
                            else
                                renderWorkshop(caseStudy, keyflow, strategy);
                        },
                        error: alert
                    })
                },
                error: alert
            })
        }

        var keyflowSession = session.get('keyflow');
        if (keyflowSession != null){
            keyflowSelect.value = keyflowSession;
            // stored keyflow is not in select (most likely casestudy was accessed)
            if (keyflowSelect.selectedIndex === -1){
                keyflowSelect.selectedIndex = 0;
            }
            else {
                renderKeyflow(parseInt(keyflowSession));
            }
        }

        keyflowSelect.addEventListener('change', function(){
            var keyflowId = this.value;
            session.set('keyflow', keyflowId);
            session.save();
            renderKeyflow(keyflowId);
        });
    }

    appConfig.session.fetch({
        success: function(session){
            var mode = session.get('mode'),
                caseStudyId = session.get('casestudy'),
                caseStudy = new CaseStudy({id: caseStudyId});

            caseStudy.fetch({success: function(){
                render(caseStudy, mode);
            }});
        }
    });
});
