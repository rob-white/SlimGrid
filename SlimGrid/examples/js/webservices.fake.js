$.ajax.fake.registerWebservice('http://example.url.com/data.json', function(data) {
    var mockData = [];
    for(var i = 0; i < 200000; i++) {
        mockData.push({
            unneeded_column: null,
            player: i,
            gender: i % 3 == 0 ? 'Male' : 'Female',
            score: Math.round(Math.random() * (10000000 - 8000000) + 8000000)
        });
    }

    return mockData;
});