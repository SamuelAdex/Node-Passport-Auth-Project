const {Router} = require("express");

let router = Router();

//GET request Home route
router.get('/', (req, res)=>{
    res.render('index');
})


module.exports = router;