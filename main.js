(function () {
    "use strict";

    var events = [],
        groups = [],
        columns = [];

    window.showElements = function (input) {

        events = input;

        // Delete old events
        var element = document.getElementById('day');
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        };

        // Groups creation
        // A group contains events wich are colliding
        // (horizontal colliding)
        ComputeCollisionGroups(events);

        // Events width sizing
        // Calculating the width of all events (based on groups)
        setEventsWidth(groups);

        // Events columns setting
        // A column contain events wich are not colloding
        // (vertical colliding)
        setEventsColumns(groups);

        // Display events
        for (var i = 0, lenI = events.length ; i < lenI ; i++) {
            displayEvent(events[i]);
        }
    };


    // Groups creation. all events in the same group are colliding
    var ComputeCollisionGroups = function (events) {
        for (var i = 0, lenI = events.length ; i < lenI ; i++) {

            // Event initialisation
            events[i].width = 0;
            events[i].left = 0;
            events[i].column = -1;
            events[i].id = i;

            // If no group, then add an empty one
            if (groups.length == 0) {
                groups[0] = [];
            }

            var foundAGroup = false;

            // For all groups
            for (var j = 0, lenJ = groups.length ; j < lenJ ; j++) {
                var isCollidingWithAllEvents = true;

                // For all events
                for (var k = 0 ; k < groups[j].length; k++) {
                    if (!isColliding(groups[j][k], events[i])) {
                        isCollidingWithAllEvents = false;
                        break;
                    }
                }

                if (isCollidingWithAllEvents == true) {
                    groups[j].push(events[i]);
                    foundAGroup = true;
                }
            }

            if (foundAGroup == false) {
                groups[groups.length] = [events[i]];
                for (var z = 0 ; z <  i ; z++) {
                    if (isColliding(events[i], events[z])) {
                        groups[groups.length - 1].push(events[z]);
                    }
                }
            }
        }
    };

    // Set width to the event
    // Complexity <  O(n2)
    var setEventsWidth = function (groups) {
        var idGroupToSet = getBigestGroupNotSet(groups);

        // While there are unset groups
        while (idGroupToSet >= 0){

            // Get the smallest width of event already set
            var smallestWidth = 600;
            for (var z = 0, lenZ = groups[idGroupToSet].length; z < lenZ ; z++) {
                var tmpEvent = groups[idGroupToSet][z];
                if (tmpEvent.width != 0 && tmpEvent.width <= smallestWidth) {
                    smallestWidth = tmpEvent.width;
                }
            }

            // If no event width set in the group, then we calculate the size
            if (smallestWidth == 600) {
                smallestWidth = 600 / groups[idGroupToSet].length;
            }

            // Set the width for all events in the group
            for (var w = 0 ; w < groups[idGroupToSet].length ; w++) {
                groups[idGroupToSet][w].width = smallestWidth;
            }

            // We take the bigest group because it define the size of the smallest column
            // If an event is in many groups, then his size has to be propagate to others events in the group he belongs to
            idGroupToSet = getBigestGroupNotSet(groups);
        }
    };

    // Events columns setting
    // A column contain events wich are not colloding
    // (vertical colliding)
    var setEventsColumns = function(groups) {

        // For each group
        for (var z = 0, lenZ = groups.length ; z < lenZ ; z++){

            // For each event in the group
            for (var k = 0, lenK = groups[z].length; k < lenK ; k++){

                // If event's column not set
                if (groups[z][k].column == -1){
                    var column = chooseColumnForEvent(groups[z][k], columns);
                    groups[z][k].column = column;
                    if (columns.length == 0 || typeof(columns[column]) == 'undefined') {
                        columns[column] = [];
                    }
                    columns[column].push(groups[z][k]);

                    // Save informations in the event
                    groups[z][k].column = column;
                    groups[z][k].left = column * groups[z][k].width;
                }
            }
        }
    };

    // Return the column number where the event should be
    var chooseColumnForEvent = function (event, columns) {

        // If there is no event in the column
        if (columns.length == 0){
            return 0;
        }

        var result = 0;

        // For all column
        for (var i = 0, len1 = columns.length; i < len1 ; i++) {

            // There is no event so we found the column (first one)
            if (columns[i].length == 0) {
                return i;
            }

            // For all event in the column
            for (var k = 0, len = columns[i].length; k < len ; k++) {
                var collision = isColliding(event, columns[i][k]);

                if (collision) {
                    if ((k + 1) == columns[i].length) {
                        result = 1 + i;
                    }
                    break;
                }
                else{
                    if (k == (columns[i].length - 1)) {
                        return i;
                    }
                }
            }
        }
        return result;
    };

    // Return the group who have the most of event
    var getBigestGroupNotSet = function (groups) {
        var bigestGroup = [];
        var idGroup = -1;
        for (var i = 0, len = groups.length ; i < len ; i++) {
            if (groups[i].length >= bigestGroup.length) {
                var allEventsAreSet = 1;
                for (var j = 0, len2 = groups[i].length; j < len2 ; j++) {
                    if (groups[i][j].width == 0) {
                        allEventsAreSet = 0;
                        break;
                    }
                }
                if (allEventsAreSet == 0) {
                    bigestGroup = groups[i];
                    idGroup = i;
                }
            }
        }
        return idGroup;
    };

    //check if 2 events collide
    var isColliding = function (event1 , event2) {
        if (event1.end <= event2.start  || event2.end <= event1.start) {
            return false;
        }
        else {
            return true;
        }
    };

    //display events on the page
    var displayEvent = function (event) {
        var day = document.getElementById('day');

        var item = document.createElement('div');
        item.className = 'event';
        item.style.borderLeft = "5px solid "+event.color;

        var item_title = document.createElement('div');
        item_title.textContent = event.title;
        item_title.className = "itemTitle";
        item.appendChild(item_title);

        var item_location = document.createElement('div');
        item_location.textContent =  event.location;
        item_location.className = "itemLocation";
        item.appendChild(item_location);

        item.style.top = event.start + 'px';
        item.style.left = event.left + 'px';
        item.style.width = event.width - 6 + 'px';
        item.style.height = (event.end - event.start) + 'px';
        day.appendChild(item);
    };


    document.addEventListener('DOMContentLoaded',function () {
        showElements([ {
            "start": 400,
            "end": 470,
            "location": "Paris",
            "title": "Open source Meetup",
            "color":"red"
        },
        {
            start: 640,
            end: 800,
            location: "London",
            title: "Squash",
            "color":"blue"
        },
        {
            start: 860,
            end: 920,
            location: "Madrid",
            title: "Beer Party",
            "color":"yellow"
        },
        {
            start: 610,
            end: 670,
            location: "Geneva",
            title: "Technical Meeting",
            "color":"green"
        } ]);

        document.getElementsByClassName("calendar")[0].scrollTop = 400;
        //showElements([ {start: 30, end: 150}, {start: 540, end: 700}, {start: 100, end: 550}, {start: 610, end: 670}]);
        //showElements ([ {start: 90, end: 150},{start: 120, end: 180},{start: 30, end: 60},
            //{start: 34, end: 60}, {start: 80, end: 400}, {start: 40, end: 600}, {start: 280, end: 620}, {start: 610, end: 670} ]);
        //showElements ([ {start: 30, end: 640}, {start: 34, end: 60}, {start: 80, end: 400}, {start: 40, end: 600}, {start: 280, end: 620}, {start: 610, end: 670} ]);
    });
})();
