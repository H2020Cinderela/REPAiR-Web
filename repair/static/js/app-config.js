define(['cookies'],
  function (Cookies) {
  
    var config = {
      URL: '/' // base application URL
    };
    
    config.getSession = function(callback){
    
      //var sessionid = Cookies.get('sessionid');
      //console.log(sessionid)
      fetch('/login/session', {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'include'
        }).then(response => response.json()).then(json => callback(json));
    }
    
    config.api = {
      base:                 '/api', // base Rest-API URL
      stakeholders:         '/api/stakeholders/',
      casestudies:          '/api/casestudies/',
      materials:            '/api/materials/',
      keyflows:             '/api/keyflows/',
      qualities:            '/api/qualities',
      keyflowsInCaseStudy:  '/api/casestudies/{0}/keyflows',
      activitygroups:       '/api/casestudies/{0}/keyflows/{1}/activitygroups',
      activities:           '/api/casestudies/{0}/keyflows/{1}/activities',
      actors:               '/api/casestudies/{0}/keyflows/{1}/actors',
      adminLocations:       '/api/casestudies/{0}/keyflows/{1}/administrativelocations',
      opLocations:          '/api/casestudies/{0}/keyflows/{1}/operationallocations',
      activitiesInGroup:    '/api/casestudies/{0}/keyflows/{1}/activitygroups/{2}/activities',
      actorsInActivity:     '/api/casestudies/{0}/keyflows/{1}/activitygroups/{2}/activities/{3}/actors',
      products:             '/api/casestudies/{0}/keyflows/{1}/products',
      activityToActivity:   '/api/casestudies/{0}/keyflows/{1}/activity2activity/',
      groupToGroup:         '/api/casestudies/{0}/keyflows/{1}/group2group/',
      actorToActor:         '/api/casestudies/{0}/keyflows/{1}/actor2actor/',
      groupStock:           '/api/casestudies/{0}/keyflows/{1}/groupstock/',
      activityStock:        '/api/casestudies/{0}/keyflows/{1}/activitystock/',
      actorStock:           '/api/casestudies/{0}/keyflows/{1}/actorstock/'
    };
  
    return config;
  }
);
