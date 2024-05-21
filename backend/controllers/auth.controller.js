export const signup = async (req, res) => { 
  res.json({
    data: "Signup route",
  })
};

export const login = async (req, res) => {
  res.json({
    data: "Login route",
  });
};

export const logout = async (req, res) => {
	res.json({
		data: "Logout route",
	});
};
