$.ajax.fake.registerWebservice('http://example.url.com/example3.json', function(data) {
    var mockData = [];
    for(var i = 0; i < 200000; i++) {
        mockData.push({
            unneeded_column: null,
            player: 'Player ' + i,
            gender: i % 3 == 0 ? 'Male' : 'Female',
            score: Math.round(Math.random() * (10000000 - 8000000) + 8000000)
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