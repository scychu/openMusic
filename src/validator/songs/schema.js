const Joi = require('joi');

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
	year: Joi.number().required(),
	performer: Joi.string().required(),
	genre: Joi.string(),
	// eslint-disable-next-line radix
	duration: Joi.number().required(),
});

module.exports = { SongPayloadSchema };
