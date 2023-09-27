const router = require('express').Router();

//test router
router.post('/test', (req,res)=> {
    res.json({requestBody:req.body})
})

module.exports = router;
