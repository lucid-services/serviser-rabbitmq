const appManager = require('../app.js');

const router = appManager.get('rabbit').buildRouter({
    version: 1.0,
    url: '.'
});

module.exports = router;
