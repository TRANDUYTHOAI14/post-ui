import postsAPI from './api/postApi.js';
import AppConstants from './appConstants.js';
import utils from './utils.js';

// render post
const renderPostList = (postList) => {
	const ulPostListElement = document.querySelector('#postsList');

	postList.forEach((post) => {
		const templateElement = document.querySelector('#postItemTemplate');
		if (!templateElement) return;

		// Clone li element
		const liElementFromTemplate = templateElement.content.querySelector('li');
		const newLiElement = liElementFromTemplate.cloneNode(true);

		// set image
		const postImgElement = newLiElement.querySelector('#postItemImage');
		if (postImgElement) {
			postImgElement.src = post.imageUrl;
			postImgElement.setAttribute(
				'onerror',
				`this.onerror=null;this.src="${AppConstants.DEFAULT_IMAGE_URL}"`,
			);
		}

		//set title
		const cardTitleElement = newLiElement.querySelector('#postItemTitle');
		if (cardTitleElement) cardTitleElement.textContent = post.title;

		//set description
		const descriptionElement = newLiElement.querySelector('#postItemDescription');
		if (descriptionElement)
			descriptionElement.textContent = utils.truncateTextlength(post.description, 100);

		// set author
		const authorElement = newLiElement.querySelector('#postItemAuthor');
		if (authorElement) authorElement.textContent = post.author;

		// set time
		const timeElement = newLiElement.querySelector('#postItemTimeSpan');
		if (timeElement) timeElement.textContent = ` - ${utils.formatDate(post.createdAt)}`;

		// add click event for div post
		const postElement = newLiElement.querySelector('#postItem');
		if (postElement) {
			postElement.addEventListener('click', () => {
				window.location = `/post-detail.html?id=${post.id}`;
			});
		}
		// add click event for button edit
		const editButtonElement = newLiElement.querySelector('#postItemEdit');
		if (editButtonElement) {
			editButtonElement.addEventListener('click', (e) => {
				e.stopPropagation();
				window.location = `/add-edit-post.html?postId=${post.id}`;
			});
		}

		// add click event for button remove
		const removeButtonElement = newLiElement.querySelector('#postItemRemove');
		if (removeButtonElement) {
			removeButtonElement.addEventListener('click', async (e) => {
				e.stopPropagation();
				const message = `Are you sure to remove post ${post.name}?`;
				if (window.confirm(message)) {
					try {
						await postsAPI.remove(post.id);
						newLiElement.remove();
						// Reload current page
						window.location.reload();
					} catch (error) {
						console.log('Failed to remove post:', error);
					}
				}
			});
		}

		// append li to ul
		ulPostListElement.appendChild(newLiElement);
	});
};

const getPageList = (pagination) => {
	const {_limit, _totalRows, _page} = pagination;
	const totalPages = Math.ceil(_totalRows / _limit);
	let prevPage = -1;

	// Return -1 if invalid page detected
	if (_page < 1 || _page > totalPages) return [0, -1, -1, -1, 0];

	// Calculate prev page
	if (_page === 1) prevPage = 1;
	else if (_page === totalPages) prevPage = _page - 2 > 0 ? _page - 2 : 1;
	else prevPage = _page - 1;

	const currPage = prevPage + 1 > totalPages ? -1 : prevPage + 1;
	const nextPage = prevPage + 2 > totalPages ? -1 : prevPage + 2;

	return [
		_page === 1 || _page === 1 ? 0 : _page - 1,
		prevPage,
		currPage,
		nextPage,
		_page === totalPages || totalPages === _page ? 0 : _page + 1,
	];
};

const renderPostsPagination = (pagination) => {
	const postPagination = document.querySelector('#postsPagination');
	if (postPagination) {
		const pageList = getPageList(pagination);
		const {_page, _limit} = pagination;
		// Search list of 5 page items
		const pageItems = postPagination.querySelectorAll('.page-item');

		// Just to make sure pageItems has exactly 5 items
		if (pageItems.length === 5) {
			pageItems.forEach((item, idx) => {
				switch (pageList[idx]) {
					case -1:
						item.setAttribute('hidden', '');
						break;
					case 0:
						item.classList.add('disabled');
						break;
					default: {
						// Find page link
						const pageLink = item.querySelector('.page-link');
						if (pageLink) {
							// Update href of page link
							pageLink.href = `?_page=${pageList[idx]}&_limit=${_limit}`;

							// Update text content of page link for item: 1, 2, 3 (zero base)
							if (idx > 0 && idx < 4) {
								pageLink.textContent = pageList[idx];
							}
						}

						// Set current active page item, only for 1, 2, 3 (zero base)
						if (idx > 0 && idx < 4 && pageList[idx] === _page) {
							item.classList.add('active');
						}
					}
				}
			});

			// Show pagination
			postPagination.removeAttribute('hidden');
		}
	}
};

(async function () {
	try {
		let search = window.location.search;

		search = search ? search.substring(1) : '';
		const {_page, _limit} = utils.parseUrlString(search);

		const params = {
			_page: _page || AppConstants.DEFAULT_PAGE,
			_limit: _limit || AppConstants.DEFAULT_LIMIT,
			_sort: 'updatedAt',
			_order: 'desc',
		};
		// get value
		const response = await postsAPI.getAll(params);
		const {data: posts, pagination} = response;
		// render dom
		renderPostList(posts);
		// render pagination
		renderPostsPagination(pagination);
		// animation
		anime({
			targets: '#postsList li',
			opacity: [
				{value: 0, duration: 0},
				{value: 1, duration: 250},
			],
			translateY: [
				{value: 50, duration: 0},
				{value: 0, duration: 500},
			],
			delay: anime.stagger(550), // increase delay by 100ms for each elements.
			easing: 'easeInOutSine',
		});

		anime({
			targets: '.nav-item',
			opacity: [
				{value: 0, duration: 0},
				{value: 1, duration: 250},
			],
			translateX: [
				{value: 150, duration: 0},
				{value: 0, duration: 500},
			],
			delay: anime.stagger(600), // increase delay by 100ms for each elements.
			easing: 'linear',
		});

		anime({
			targets: '.carousel-section',
			opacity: [
				{value: 0, duration: 0},
				{value: 1, duration: 1500},
			],

			rotateX: [
				{value: '90deg', duration: 0},
				{value: 0, duration: 1500},
			],

			delay: anime.stagger(1500), // increase delay by 100ms for each elements.
			easing: 'linear',
		});
	} catch (error) {
		console.log(error);
	}

	// loading
	setTimeout(() => {
		document.querySelector('.loading').style.display = 'none';
	}, 600);
})();
