/* eslint-disable camelcase */
const mapDBToModel = ({
  id,
  title,
  year,
	genre,
	performer,
	duration,
  inserted_at,
  updated_at,
}) => ({
  id,
  title,
  year,
	genre,
	performer,
	duration,
  insertedAt: inserted_at,
  updatedAt: updated_at,
});
module.exports = { mapDBToModel };
