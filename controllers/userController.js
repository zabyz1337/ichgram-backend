const getProfile = async (req, res) => {
  res.json(req.user);
};

module.exports = {
  getProfile,
};