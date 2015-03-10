$.ajax.fake.registerWebservice('http://example.url.com/example3.json', function(data) {
    var mockData = [];
    for(var i = 0; i < 1000; i++) {
        mockData.push({
            unneeded_column: null,
            player: 'Player ' + i,
            gender: i % 3 == 0 ? 'Male' : 'Female',
            score: Math.round(Math.random() * (1 - 99) + 99)
        });
    }

    return mockData;
});

$.ajax.fake.registerWebservice('http://example.url.com/example4.json', function(data) {
    var mockData = [];
    var indent = 0;
    var parents = [];

    for(var i = 0; i < 1000; i++) {
        var parent;

        if (Math.random() > 0.8 && i > 0) {
            indent++;
            parents.push(i - 1);
        } else if (Math.random() < 0.3 && indent > 0) {
            indent--;
            parents.pop();
        }

        if (parents.length > 0) {
            parent = parents[parents.length - 1];
        } else {
            parent = null;
        }

        mockData.push({
            unneeded_column: null,
            player: 'Player ' + i,
            indent: indent,
            parent: parent,
            gender: i % 3 == 0 ? 'Male' : 'Female',
            score: Math.round(Math.random() * (1 - 99) + 99)
        });
    }

    return mockData;
});

$.ajax.fake.registerWebservice('http://example.url.com/example5.json', function(data) {
    var someDates = ["01/01/2015", "02/02/2015", "03/03/2015"];
    var mockData = [];

    // prepare the data
    for (var i = 0; i < 1000; i++) {
        var d = (mockData[i] = {});
        d["id"] = i;
        d["num"] = i;
        d["title"] = "Task " + i;
        d["duration"] = Math.round(Math.random() * 30) + 1;
        d["percentComplete"] = Math.round(Math.random() * 100);
        d["start"] = someDates[Math.floor((Math.random() * 2))];
        d["finish"] = someDates[Math.floor((Math.random() * 2))];
        d["cost"] = Math.round(Math.random() * 10000) / 100;
        d["effort"] = (i % 5 == 0);
    }

    return mockData;
});

$.ajax.fake.registerWebservice('http://example.url.com/example8.json', function(data) {
    var mockData = [];

    // prepare the data
    for (var i = 0; i < 100; i++) {
        var d = (mockData[i] = {});
        d["id"] = i;
        d["name"] = "User " + i;
        d["email"] = "test.user@nospam.org";
        d["title"] = "Regional sales manager";
        d["phone"] = "206-000-0000";
    }

    return mockData;
});