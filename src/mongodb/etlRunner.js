const transformData = require('./transformData');
const loadData = require('./loadData');

transformData().then(() => console.log('now we load data!'));
