//require('dotenv').config();
var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'placeholder',
        pass: 'placeholder'
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
			res.send({'ERROR':error});
		}else{
			res.send('Message %s sent: %s', info.messageId, info.response);
		}
	});

});

router.post('/comment',function(req,res,next){

	var mailOptions = {
		//to: '***REMOVED***, jmtroy2@illinois.edu', 
		to: '***REMOVED***,' + req.body.identifier, 		
		subject: 'Social Media Macroscope User Comment by' + req.body.identifier, // Subject line
		html: `<p><b>Comment: </b>` + req.body.comment + `<p>`
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			res.send({'ERROR':error});
		}else{
			res.send('Message %s sent: %s', info.messageId, info.response);
		}
	});

});

module.exports = router;