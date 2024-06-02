export const POSTS = [
	{
		_id: "1",
		text: "I love elephants!! 😍",
		img: "/posts/post1.jpg",
		user: {
			username: "johndoe",
			profileImg: null,
			fullName: "John Doe",
		},
		comments: [
			{
				_id: "1",
				text: "They are giant!!",
				user: {
					username: "janedoe",
					profileImg: null,
					fullName: "Jane Doe",
				},
			},
		],
		likes: ["6658s891", "6658s892", "6658s893", "6658s894"],
	},
	{
		_id: "2",
		text: "How you guys doing? 😊",
		user: {
			username: "johndoe",
			profileImg: null,
			fullName: "John Doe",
		},
		comments: [
			{
				_id: "1",
				text: "I'm doing great!!",
				user: {
					username: "janedoe",
					profileImg: null,
					fullName: "Jane Doe",
				},
			},
		],
		likes: ["6658s891", "6658s892", "6658s893", "6658s894"],
	},
	{
		_id: "3",
		text: "The portal to the future is here!!",
		img: "/posts/post2.jpg",
		user: {
			username: "johndoe",
			profileImg: null,
			fullName: "John Doe",
		},
		comments: [],
		likes: ["6658s891", "6658s892", "6658s893", "6658s894", "6658s895", "6658s896"],
	},
	{
		_id: "4",
		text: "I'm on vacation in the most beautiful place! 😍",
		img: "/posts/post3.jpg",
		user: {
			username: "johndoe",
			profileImg: null,
			fullName: "John Doe",
		},
		comments: [
			{
				_id: "1",
				text: "I'm jealous!!",
				user: {
					username: "janedoe",
					profileImg: null,
					fullName: "Jane Doe",
				},
			},
		],
		likes: [
			"6658s891",
			"6658s892",
			"6658s893",
			"6658s894",
			"6658s895",
			"6658s896",
			"6658s897",
			"6658s898",
			"6658s899",
		],
	},
];

export const USERS_FOR_RIGHT_PANEL = [
	{
		_id: "1",
		fullName: "John Doe",
		username: "johndoe",
		profileImg: null,
	},
	{
		_id: "2",
		fullName: "Jane Doe",
		username: "janedoe",
		profileImg: null,
	},
	{
		_id: "3",
		fullName: "Bob Doe",
		username: "bobdoe",
		profileImg: null,
	},
	{
		_id: "4",
		fullName: "Daisy Doe",
		username: "daisydoe",
		profileImg: null,
	},
];