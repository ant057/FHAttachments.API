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

router.use(function (req, res, next) {
    console.dir(`Processing http request.. /api${req.url}`)
    next()
})

router.route('/')
    .get(function (req, res) {
        res.json({ message: 'hooray! welcome to our api!' })
    })

router.route('/claims/:claimnumber')
    .get(function (req, res) {
        var claimnumber = req.params.claimnumber
        pool
            .then(conn => {
                try {
                    const result = new sql.Request(conn)
                        .query(`select top 10 
                                    fh_claim.claim_id
                                    ,fh_claim.fh_claim_num
                                    ,fh_claim.open_close_status
                                    ,fh_policy.policy_num
                                    from fh_claim
                                    left outer join fh_policy on fh_claim.policy_id = fh_policy.policy_id
                                    where fh_claim.fh_claim_num like '%${claimnumber}%'
                                    order by fh_claim.fh_claim_num desc`, (err, result) => {
                                if (err) {
                                    res.send(err)
                                }
                                else {
                                    res.send(result)
                                }
                            })
                } catch (err) {
                    res.send(err.message)
                }
            })
    })

router.route('/claim/:claimnumber')
    .get(function (req, res) {
        var claimnumber = req.params.claimnumber
        pool
            .then(conn => {
                try {
                    const result = new sql.Request(conn)
                        .query(`select 
                        fh_claim.claim_id
                        ,fh_claim.fh_claim_num
                        ,fh_claim.open_close_status
                        ,fh_policy.policy_num
                 		,fh_claim.lob_id
                 		,fh_user.last_name + ', ' + fh_user.first_name as handler
                 		,fh_claim.loss_date
                 		,fh_code_general.item_name as claim_type
                 		,fh_company.company_name as insured
                        from fh_claim
                        left outer join fh_policy on fh_claim.policy_id = fh_policy.policy_id
                 		left outer join fh_company on fh_company.company_id = fh_policy.tier_company_id
                 		left outer join fh_user on fh_user.user_id = fh_claim.handler_id
                 		left outer join fh_code_general on fh_code_general.item_id = fh_claim.claim_type_id
                        where fh_claim.fh_claim_num like '%${claimnumber}%'`, (err, result) => {
                                if (err) {
                                    res.send(err)
                                }
                                else {
                                    res.send(result)
                                }
                            })
                } catch (err) {
                    res.send(err.message)
                }
            })
    })

router.route('/claimattachments/:claimnumber')
    .get(function (req, res) {
        var claimnumber = req.params.claimnumber
        pool
            .then(conn => {
                try {
                    const result = new sql.Request(conn)
                        .query(`select 
                        image_id
                        ,add_date
                        ,image_name
                        ,image_desc
                        from fh_claim_image
                        where claim_id = (select claim_id from fh_claim where fh_claim_num = '${claimnumber}')`, (err, result) => {
                                if (err) {
                                    res.send(err)
                                }
                                else {
                                    res.send(result)
                                }
                            })
                } catch (err) {
                    res.send(err.message)
                }
            })
    })


router.route('/claimattachment/:imageid')
    .get(function (req, res) {
        var imageid = req.params.imageid
        pool
            .then(conn => {
                try {
                    const result = new sql.Request(conn)
                        .query(`select 
                        image_bin
                        from fh_claim_image
                        where image_id = '${imageid}'`, (err, result) => {
                                if (err) {
                                    res.send(err)
                                }
                                else {
                                    res.set('Content-Type', 'application/pdf');
                                    res.set('Content-Disposition', 'attachment; filename=test.pdf');
                                    res.send(result.recordset[0].image_bin)
                                }
                            })
                } catch (err) {
                    res.send(err.message)
                }
            })
    })

app.use('/api', router)

//Ready up server
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
})


// old: Prepared Statement method

// router.route('/claims/:claimnumber')
//     .get(function(req, res){
//         var claimnumber = req.params.claimnumber
//         pool
//             .then(conn => {
//                 const ps = new sql.PreparedStatement(conn)
//                 ps.prepare(`select top 10 
//                 fh_claim.claim_id
//                 ,fh_claim.fh_claim_num
//                 ,fh_claim.open_close_status
//                 ,fh_policy.policy_num
//                 from fh_claim
//                 left outer join fh_policy on fh_claim.policy_id = fh_policy.policy_id
//                 where fh_claim.fh_claim_num like '%${claimnumber}%'
//                 order by fh_claim.fh_claim_num desc`, err => {
//                     ps.execute(null, (err, result) => {
//                         if(err) {
//                             res.send('There was an error!')
//                             console.warn(err)
//                             ps.unprepare(err => {

//                             })                            
//                         }                        
//                         else {
//                             res.send(result);
//                         }
//                     })
//                 })
//             })
//     })