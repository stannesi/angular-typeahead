'use strict';

var TypeAheadApp = angular.module('TypeAheadApp', [
    'ui.bootstrap'
]);

// dataStore user info
TypeAheadApp.factory('dataFactory', function () {
    return {
        query: function () {
            return dataStore;
        }
    };
});

// main controller
TypeAheadApp.controller('MainCtrl', function MainCtrl($scope) {
    $scope.appDetails = {
        title: "Anuglar Typeahead "
    };

}).controller('SearchCtrl', function ($scope, dataFactory) {
    $scope.selected = undefined;
    $scope.users = dataFactory.query();
});

TypeAheadApp.controller('TypeaheadCtrl', function ($scope, dataFactory) {
    // this will hold the selected name

//    $scope.selected = "";
    $scope.data = dataFactory.query();
    $scope.name = "Stanley"
    
    $scope.search = function(query) {
      if (!query){
            return [];
        }

        var filtered = [];
        query = query.toLowerCase()
        angular.forEach($scope.data, function(chunck) {
            var nameStr = (chunck.firstname + " " + chunck.lastname).toLowerCase();

            if (nameStr.indexOf(query) >= 0)
                filtered.push(chunck);
        });
        return filtered;
    }
    
    $scope.select = function(item) {
       $scope.name = item.firstname + " " + item.lastname
       $scope.model = $scope.name;
    }

})
/*
.filter('typeaheadHighlight', function() {

    return function(items, query) {
        if (!query){
            return [];
        }
        
        var filtered = [];
        query = query.toLowerCase()
        
        angular.forEach(items, function(item) {
            var nameStr = (item.firstname + " " + item.lastname).toLowerCase();

            if (nameStr.indexOf(query) >= 0)
                filtered.push(item);
          
        });
        
        if (filtered == 0) {
            return ['$$none$$']
        }

        return filtered;
    };
  })
*/

// typeahead Directive
.directive('typeahead', function ($timeout) {
    return {   
        restrict: 'AEC',
        transclude: true,
       // replace: true,
        templateUrl: 'components/typeahead/typeahead.tpl.html',
        
        scope: {
            placeholder: '@',
            model: "=",
            search: '&',
            select: '&',
        },
        
        controller:  function($scope, $modal) {
             $scope.items = [];
             $scope.hide = false;
             $scope.isEmpty = true;
             $scope.currentItem = undefined;
                     
             $scope.activate = function(item) {
                $scope.active = item;
             }

             this.activateNextItem = function() {
                var index = $scope.items.indexOf($scope.active);
                this.activate($scope.items[(index + 1) % $scope.items.length]);
            };
 
            this.activatePreviousItem = function() {
                var index = $scope.items.indexOf($scope.active);
                this.activate($scope.items[index === 0 ? $scope.items.length - 1 : index - 1]);
            };          
       
             this.isActive = function(item) {
                return $scope.active === item;
            };
            
            this.selectActive = function() {
                this.select($scope.active);
            };
            
            this.select = function(item) {
                 $scope.hide = true;
                 $scope.focused = true;
                  //console.log("Select :" + item);
                 $scope.select({item: item})
             }
            
            
            $scope.setCurrent = function (idx) {
                $scope.currentItem = idx;
            };
            
            $scope.isCurrent = function (idx) {                
                return $scope.currentItem === idx;   
            };
            
            
            $scope.isVisible = function() {
                return !$scope.hide && ($scope.focused || $scope.mousedOver);
            };
 
            $scope.querySearch = function() {
                $scope.hide = false;
                $scope.items = $scope.search({model:$scope.model});
                
                if ($scope.items.length > 0)
                    $scope.isEmpty = true;
                else
                    $scope.isEmpty = false;
            }
             
            $scope.selectItem = function (item, idx) {
                $scope.hide = true;
                $scope.focused = true;
                $scope.select({item: item})
                this.activate(item)
            };
            
            
            $scope.addNew = function (size) {
                
                //$scope.items = [$scope.model, 'item2', 'item3'];

                 var modalInstance = $modal.open({
                    templateUrl: 'typeaheadModalContent.html',
                    controller: 'typeaheadModalInstanceCtrl',
                    size: size,
                      resolve: {
                        items: function () {
                          return $scope.items;
                        }
                    }

                });

                modalInstance.result.then(function (selectedItem) {
                    $scope.selected = selectedItem;
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                    /// Save Info
                });
            };
         },
       
        link: function (scope, elem, attrs, controller) {
            
            var $input = elem.find('input');
            var $list = elem.find('ul');
            
            $input.bind('focus', function() {
                scope.$apply(function() { scope.focused = true; });
            });
            
            $input.bind('blur', function() {
                scope.$apply(function() { scope.focused = false; });
            });
            
            $list.bind('mouseover', function() {
                scope.$apply(function() { scope.mousedOver = true; });
            });
            
            $list.bind('mouseleave', function() {
                scope.$apply(function() { scope.mousedOver = false; });
            });
 
            $input.bind('keyup', function(e) {
                
                // Tab button and Enter
                if (e.keyCode === 9 || e.keyCode === 13) {
                    scope.$apply(function() { 
                        controller.selectActive(); 
                    });
                }
                
                // ESC button
                if (e.keyCode === 27) {
                    scope.$apply(function() {
                        scope.hide = true;
                    });
                }
            });
 
            $input.bind('keydown', function(e) {
                if (e.keyCode === 9 || e.keyCode === 13 || e.keyCode === 27) {
                    e.preventDefault();
                };
 
                // Down arrow
                if (e.keyCode === 40) {
                    e.preventDefault();
                    scope.$apply(function() { controller.activateNextItem(); });
                }
 
                // Left arrow
                if (e.keyCode === 38) {
                    e.preventDefault();
                    scope.$apply(function() { controller.activatePreviousItem(); });
                }
                
               scope.$watch('focused', function(focused) {
                    if (focused) {
                        $timeout(function() { $input.focus(); }, 0, false);
                    }
                });
            });
        }
    };
}).controller('typeaheadModalInstanceCtrl', function ($scope, $modalInstance, items) {
    $scope.items = items;
    
    $scope.selected = {
        item: $scope.items[0]
    };

    $scope.save = function () {
        $modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});


/*
TypeAheadApp.controller('typeaheadModalCtrl', function ($scope, $modal, $log, typeaheadSharedService) {

  $scope.items = ['item1', 'item2', 'item3'];

  $scope.openModal = function(size) {
    typeaheadSharedService.prepModalBroadcast(size);
  };
  
  $scope.$on('modalBroadcast', function(size) {
    $scope.open(size)
  });
  
    
  $scope.open = function (size) {
     var modalInstance = $modal.open({
      templateUrl: 'typeaheadModalContent.html',
      controller: 'typeaheadModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
      
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
    

  };
});
*/

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.
/*
TypeAheadApp.factory('typeaheadSharedService', function ($rootScope) {
    var sharedService = {}
    
    sharedService.prepModalBroadcast = function(size){
        this.broadcastModal();
    }
    
    sharedService.broadcastModal = function() {
        $rootScope.$broadcast('modalBroadcast');
    }
    
    return sharedService;
    
});
*/
