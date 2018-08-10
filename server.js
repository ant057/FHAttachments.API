//Initiallising node modules
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const { sql, pool } = require("./db")

// Body Parser Middleware
app.use(bodyParser.urlencoded({ entended: true }))
app.use(bodyParser.json())

//CORS Middleware
app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization")
    next()
})

// Routes for API
var router = express.Router()

router.use(function(req, res, next){
    console.dir(`Processing http request.. /api${req.url}`)
    next()
})

router.route('/')
    .get(function(req, res) {
        res.json({ message: 'hooray! welcome to our api!' })
})

router.route('/claims/:claimnumber')
    .get(function(req, res){
        var claimnumber = req.params.claimnumber
        pool
            .then(conn => {
                const ps = new sql.PreparedStatement(conn)
                ps.prepare(`select top 10 
                fh_claim.claim_id
                ,fh_claim.fh_claim_num
                ,fh_claim.open_close_status
                ,fh_policy.policy_num
                from fh_claim
                inner join fh_policy on fh_claim.policy_id = fh_policy.policy_id
                where fh_claim.fh_claim_num like '%${claimnumber}%'
                order by fh_claim.fh_claim_num desc`, err => {
                    ps.execute(null, (err, result) => {
                        if(err) {
                            res.send('There was an error!')
                            console.warn(err)
                        }                        
                        else {
                            res.send(result);
                            ps.unprepare(err => {

                            })
                        }
                    })
                })
            })
    })

app.use('/api', router)


//Ready up server
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
 })