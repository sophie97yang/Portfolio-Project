const express = require('express');
const router = Express.router();

//test router
router.get('/hello/world', (req,res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    res.send('Hello World!');
})
module.exports = router;
