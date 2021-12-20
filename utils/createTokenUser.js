const createTokenUser = (user) => {
  return {
    name: user.name,
    userId: user._id,
    role: user.role,
    team: user.team,
    image: user.image,
  }
}

module.exports = createTokenUser
