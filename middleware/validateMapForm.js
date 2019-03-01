var moment = require('moment');

async function validateMapForm(req, res, next) {
    // QUERY PARAMETER VALIDATION
	if(!req.body['Payload']) {
		res.status(400).json({"Error": "Payload is in incorrect format"}); 
		return;
	} 
	if(!req.body['Payload']['startDateTime']) {
		res.status(400).json({"Error": "missing startDateTime"})
		return;
	}
	if(!req.body['Payload']['endDateTime']) {
		res.status(400).json({"Error": "missing endDateTime"})
		return;
	}
	var startDateTime = moment.utc(moment(req.body['Payload']['startDateTime'], moment.ISO_8601, true))
	var endDateTime = moment.utc(moment(req.body['Payload']['endDateTime'], moment.ISO_8601, true))
	if(startDateTime.format() === 'Invalid date') {
		res.status(400).json({"Error": "malformed startDateTime"})
		return;
	}
	if(endDateTime.format() === 'Invalid date') {
		res.status(400).json({"Error": "malformed endDateTime"})
		return;
	}
	if(endDateTime < startDateTime){
		res.status(400).json({"Error": "End time must be after start time"})
		return;
	}
	if(!req.body['Payload']['postalCode']){
		res.status(400).json({"Error": "missing postalCode"})
		return;
	}
	if(!req.body['Payload']['radius']){
		res.status(400).json({"Error": "missing radius"})
		return;
	}
	if(isNaN(req.body['Payload']['radius']) || req.body['Payload']['radius'] < 0){
		res.status(400).json({"Error": "radius must be a positive integer"})
		return;
	}
	if(!req.body['Payload']['unit']){
		res.status(400).json({"Error": "missing unit"})
		return;
	}
	if(req.body['Payload']['unit'] !== 'miles' && req.body['Payload']['unit'] !== 'km'){
		res.status(400).json({"Error": "unit must either be 'miles' or 'km'"})
		return;
	}
    return next(); // <-- important!
}

module.exports.validateMapForm = validateMapForm;