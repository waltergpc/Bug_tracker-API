const createTokenUser = (user) => {
  return { name: user.name, userId: user._id, role: user.role, team: user.team }
}

module.exports = createTokenUser
