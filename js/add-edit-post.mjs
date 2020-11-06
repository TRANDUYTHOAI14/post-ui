import postsAPI from './api/postApi.js';
import AppConstants from './appConstants.js';
import utils from './utils.js';

const setPostFormValues = (post) => {
	// Set post title
	utils.setValueByElementId('postTitle', post.title);

	// Set post author
	utils.setValueByElementId('postAuthor', post.author);

	// Set post description
	utils.setValueByElementId('postDescription', post.description);

	// Set post image
	utils.setBackgroundImageByElementId('postHeroImage', post.imageUrl);
};

// change post image
const handleChangeImageClick = () => {
	// random image id
	const randomId = 1 + Math.trunc(Math.random() * 1000);
	// get image
	const imageUrl = `https://picsum.photos/id/${randomId}/${AppConstants.DEFAULT_IMAGE_WIDTH}/${AppConstants.DEFAULT_IMAGE_HEIGHT}`;
	// set image
	utils.setBackgroundImageByElementId('postHeroImage', imageUrl);
};

// form get value
const getPostFormValues = () => {
	const formValues = {
		title: utils.getValueByElementId('postTitle'),
		author: utils.getValueByElementId('postAuthor'),
		description: utils.getValueByElementId('postDescription'),
		imageUrl: utils.getBackgroundImageByElementId('postHeroImage'),
	};

	return formValues;
};

// validation form value
const validatePostForm = () => {
	let isValid = true;

	// title is required
	const title = utils.getValueByElementId('postTitle');
	if (!title) {
		utils.addClassByElementId('postTitle', ['is-invalid']);
		isValid = false;
	}

	// author is required
	const author = utils.getValueByElementId('postAuthor');
	if (!author) {
		utils.addClassByElementId('postAuthor', ['is-invalid']);
		isValid = false;
	}

	return isValid;
};

const handlePostFormSubmit = async (postId) => {
	const formValues = getPostFormValues();

	// Form validation
	const isValid = validatePostForm();
	if (isValid) {
		try {
			// Add/update data
			const payload = {
				id: postId,
				...formValues,
			};

			if (postId) {
				await postsAPI.update(payload);
				alert('Save post successfully');
			} else {
				const newPost = await postsAPI.add(payload);

				// Go to edit page
				const editPageUrl = `add-edit-post.html?postId=${newPost.id}`;
				window.location = editPageUrl;

				alert('Add new post successfully');
			}
		} catch (error) {
			alert('Failed to save post: ', error);
		}
	}
};

(async function () {
	let search = window.location.search;

	search = search ? search.substring(1) : '';

	const {postId} = utils.parseUrlString(search);
	const isEditMode = !!postId;

	if (isEditMode) {
		// get post data
		const post = await postsAPI.get(postId);
		setPostFormValues(post);

		// show button detail page link
		const goToDetailPageLink = document.querySelector('#goToDetailPageLink');
		if (goToDetailPageLink) {
			goToDetailPageLink.href = `post-detail.html?id=${postId}`;
			goToDetailPageLink.innerHTML = '<i class="fas fa-eye mr-1"></i> View post detail';
		}
	} else {
		// use when add new post
		handleChangeImageClick();
	}

	const postChangeImageButton = document.querySelector('#postChangeImage');
	if (postChangeImageButton) {
		postChangeImageButton.addEventListener('click', handleChangeImageClick);
	}

	// Handle form submit button
	const postForm = document.querySelector('#postForm');
	if (postForm) {
		postForm.addEventListener('submit', (e) => {
			handlePostFormSubmit(postId);
			e.preventDefault();
		});
	}
})();
