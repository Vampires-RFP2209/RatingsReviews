const transformData = require('./transformData');
const loadData = require('./loadData');

transformData.then(() => loadData());
