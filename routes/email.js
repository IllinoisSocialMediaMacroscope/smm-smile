require('dotenv').config();
var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD
    }
});

router.post('/email',function(req,res,next){

	var mailOptions = {
		//to: '***REMOVED***, jmtroy2@illinois.edu', 
		to: '***REMOVED***,' + req.body.identifier, 		
		subject: 'Report Errror of Social Media Macroscope by ' + req.body.identifier, // Subject line
		html: `<p><b>Error: </b>` + req.body.error + `<p><br><p><b>Comment: </b>` + req.body.comment + `<p>`
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}else{
			res.send('Message %s sent: %s', info.messageId, info.response);
		}
	});

});

module.exports = router;