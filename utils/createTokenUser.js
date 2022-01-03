const createTokenUser = (user) => {
  return {
    name: user.name,
    userId: user._id,
    email: user.email,
    role: user.role,
    team: user.team,
    image: user.image,
    verified: user.isVerified,
  }
}

module.exports = createTokenUser
