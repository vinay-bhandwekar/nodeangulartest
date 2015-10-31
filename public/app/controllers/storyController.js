angular.module("storyController", ['storyService'])

.controller("StoryController", function(Story, socketio){
    var vm = this;
    
    Story.getStories()
    .success(function(data){
       vm.stories = data; 
    });
    
    vm.createStory = function(){
        vm.message = '';
        Story.createStory(vm.storyData)
        .success(function(data){
            
            // clear data
            vm.storyData = '';
            
            vm.message = data.message;
            
            vm.stories.push(data);
        });
    }
    
    socketio.on('story', function(data){
        vm.stories.push(data);
    });
})

.controller('AllStoriesController', function(stories, socketio){
    var vm = this;
    
    vm.stories = stories.data;
    
    socketio.on('story', function(data){
       vm.stories.push(data); 
    });
});